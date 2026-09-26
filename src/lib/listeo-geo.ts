import type { Category, ListingTaxTerm } from "@/lib/types";
import { categoryFromKindName } from "@/lib/listing-categories";
import { pickListingImage, uniqueImages } from "@/lib/media";
import { cachedOriginText } from "@/lib/origin-cache";
import { decodeEntities } from "@/lib/utils";

export type ListeoGeo = {
  slug: string;
  name: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviews?: number;
  address?: string;
  friendlyAddress?: string;
  image?: string;
  gallery?: string[];
  kind?: string;
  category?: Category;
  categoryTerms?: ListingTaxTerm[];
  id?: number;
  featured?: boolean;
};

function urlTail(url: string) {
  return url.split("/").filter(Boolean).pop() ?? "";
}

function decode(raw: string): string {
  return decodeEntities(raw.replace(/&#038;/g, "&"));
}

function categoryFromCard(kind: string, listingType: string): Category {
  const mapped = categoryFromKindName(kind);
  if (mapped) return mapped;
  const hay = `${kind} ${listingType}`.toLowerCase();
  if (/hotel|guest|stay|resort|homestay|villa|property/.test(hay)) return "stay";
  if (/cafe|restaurant|pub|bar|food|pizza|bakery|night/.test(hay)) return "food";
  if (/bike|rental|scuba|sport|adventure|activity|tour|kayak|workshop|class|photo|salon|spa/.test(hay)) {
    return "activities";
  }
  if (/beach|heritage|temple|church|ashram|museum|park|attraction|spiritual/.test(hay)) return "places";
  if (listingType === "rental") return "activities";
  return "places";
}

export function parseListeoGeoHtml(html: string): ListeoGeo[] {
  const out: ListeoGeo[] = [];
  const seen = new Set<string>();
  const chunks = html.split(/listing-geo-data/);
  for (const chunk of chunks.slice(1)) {
    const window = chunk.slice(0, 9000);
    const lat = Number(window.match(/data-latitude="([\d.-]+)"/)?.[1]);
    const lng = Number(window.match(/data-longitude="([\d.-]+)"/)?.[1]);
    const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);
    const href = window.match(/https:\/\/xplorepondy\.com\/listing\/[^"\s>]+/);
    const slug = href ? urlTail(href[0].replace(/\/$/, "")) : "";
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const name = decode(window.match(/data-title="([^"]*)"/)?.[1] ?? "");
    const rating = Number(window.match(/data-rating="([\d.]+)"/)?.[1]);
    const reviews = Number(window.match(/data-reviews="(\d+)"/)?.[1]);
    // Listeo exposes _friendly_address separately as data-friendly-address.
    // Keep it distinct from the raw _address/data-address value.
    const friendlyAddress = decode(window.match(/data-friendly-address="([^"]*)"/)?.[1] ?? "");
    const address = decode(window.match(/data-address="([^"]*)"/)?.[1] ?? "");
    const poster = window.match(/data-image="([^"]+)"/)?.[1];
    const slides = [...window.matchAll(/src="(https:\/\/xplorepondy\.com\/wp-content\/uploads\/[^"]+)"/g)].map(
      (m) => m[1],
    );
    const gallery = uniqueImages(slides);
    const image = pickListingImage(poster, gallery[0]);
    const listingType = window.match(/data-listing-type="([^"]+)"/)?.[1] ?? "";
    const categoryNames = [
      ...window.matchAll(/listing-category-tag-nl[^>]*>([^<]+)/gi),
    ]
      .flatMap((match) => decode(match[1] ?? "").split(","))
      .map((name) => name.trim())
      .filter(Boolean);

    // Some Listeo templates expose the complete category membership in
    // listing_category-* classes even when the visible category label only
    // contains the primary category.
    const categorySlugsFromClasses = [
      ...window.matchAll(/(?:^|[\s"'])listing_category-([a-z0-9-]+)/gi),
    ].map((match) => match[1] ?? "").filter(Boolean);
    for (const slug of categorySlugsFromClasses) {
      if (categoryNames.some((name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug)) continue;
      categoryNames.push(
        slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      );
    }
    const categoryTerms: ListingTaxTerm[] = [];
    const categorySeen = new Set<string>();
    for (const name of categoryNames) {
      const slug = name
        .toLowerCase()
        .replace(/&/g, " ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!slug || categorySeen.has(slug)) continue;
      categorySeen.add(slug);
      categoryTerms.push({ name, slug });
    }
    const kind = categoryNames[0] ?? "";
    const id = Number(window.match(/data-post-id="(\d+)"/)?.[1] || window.match(/data-id="(\d+)"/)?.[1]);
    const featured =
      /<(?:div|span)[^>]*class="[^"]*\bfeatured-nl\b/.test(window) || /\bbadge-nl featured-nl\b/.test(window);
    out.push({
      slug,
      name: name || slug,
      lat: hasGeo ? lat : undefined,
      lng: hasGeo ? lng : undefined,
      rating: Number.isFinite(rating) && rating > 0 ? rating : undefined,
      reviews: Number.isFinite(reviews) && reviews > 0 ? reviews : undefined,
      address: address || undefined,
      friendlyAddress: friendlyAddress || undefined,
      image: image || undefined,
      gallery: gallery.length ? gallery : undefined,
      kind: kind || undefined,
      category: categoryFromCard(kind, listingType),
      categoryTerms: categoryTerms.length ? categoryTerms : undefined,
      id: Number.isFinite(id) && id > 0 ? id : undefined,
      featured: featured || undefined,
    });
  }
  return out;
}

async function fetchListeoPage(
  page: number,
  perPage: number,
): Promise<{ html: string; pages: number; total: number }> {
  const url = `https://xplorepondy.com/wp-admin/admin-ajax.php?action=listeo_get_listings&page=${page}&per_page=${perPage}`;
  const empty = { html: "", pages: 1, total: 0 };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await cachedOriginText(url, 20 * 60 * 1000, 12000, {
        Accept: "application/json",
        "User-Agent": "XplorePondyApp/1.0",
      });
      if (!res.ok) continue;
      const data = JSON.parse(res.body) as {
        html?: string;
        max_num_pages?: number | string;
        total_found?: number | string;
      };
      return {
        html: data.html ?? "",
        pages: Math.max(1, Number(data.max_num_pages) || 1),
        total: Number(data.total_found) || 0,
      };
    } catch {
      /* retry */
    }
  }
  return empty;
}

function ingest(html: string, map: Map<string, ListeoGeo>) {
  for (const hit of parseListeoGeoHtml(html)) {
    if (!map.has(hit.slug)) map.set(hit.slug, hit);
  }
}

export async function loadListeoGeo(): Promise<{ map: Map<string, ListeoGeo>; total: number }> {
  const map = new Map<string, ListeoGeo>();
  // REST supplies the complete catalog, while Listeo's geo feed supplies
  // the card-level data that is not reliably exposed through WP REST meta:
  // rating, review count, address, coordinates and the real listing image.
  // Load every geo page in parallel so the 564+ REST listings can be enriched
  // without making individual HTML requests for every listing.
  const first = await fetchListeoPage(1, 100);
  const total = first.total;
  const pages = Math.max(1, first.pages);
  ingest(first.html, map);
  const restPages = pages > 1
    ? await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) => fetchListeoPage(i + 2, 100)),
      )
    : [];
  for (const row of restPages) ingest(row.html, map);
  return { map, total: Math.max(total, map.size) };
}
