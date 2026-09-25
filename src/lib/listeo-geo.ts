import type { Category } from "@/lib/types";
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
    const kind = decode(window.match(/listing-category-tag-nl">([^<]+)/)?.[1] ?? "").split(",")[0]?.trim() ?? "";
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
  const pageNos = [1, 2, 3, 4];
  const results = await Promise.all(pageNos.map(async (page) => ({ page, ...(await fetchListeoPage(page, 100)) })));
  let total = 0;
  for (const row of results) {
    ingest(row.html, map);
    if (row.total > total) total = row.total;
  }
  const weak = results.filter((row) => !row.html);
  if (weak.length || (total > 0 && map.size < total * 0.9)) {
    const retryPages = weak.length ? weak.map((row) => row.page) : pageNos;
    const again = await Promise.all(retryPages.map((page) => fetchListeoPage(page, 100)));
    for (const row of again) {
      ingest(row.html, map);
      if (row.total > total) total = row.total;
    }
  }
  return { map, total: Math.max(total, map.size) };
}
