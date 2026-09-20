import type { Category } from "@/lib/types";
import { pickListingImage, uniqueImages } from "@/lib/media";

export type ListeoGeo = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
  reviews?: number;
  address?: string;
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
  return raw
    .replace(/&/gi, "&")
    .replace(/&#038;/g, "&")
    .replace(/"/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFromCard(kind: string, listingType: string): Category {
  const hay = `${kind} ${listingType}`.toLowerCase();
  if (/hotel|guest|stay|resort|homestay|villa|property/.test(hay)) return "stay";
  if (/beach|heritage|temple|church|ashram|museum|park|attraction|spiritual/.test(hay)) return "places";
  if (/bike|rental|scuba|sport|adventure|activity|tour|kayak|workshop|class/.test(hay)) return "activities";
  if (/cafe|restaurant|pub|bar|food|pizza|bakery|night/.test(hay)) return "food";
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
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (lat < 11.5 || lat > 12.4 || lng < 79.4 || lng > 80.2) continue;
    const href = window.match(/https:\/\/xplorepondy\.com\/listing\/[^"\s>]+/);
    const slug = href ? urlTail(href[0].replace(/\/$/, "")) : "";
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const name = decode(window.match(/data-title="([^"]*)"/)?.[1] ?? "");
    const rating = Number(window.match(/data-rating="([\d.]+)"/)?.[1]);
    const reviews = Number(window.match(/data-reviews="(\d+)"/)?.[1]);
    const address = decode(
      window.match(/data-friendly-address="([^"]*)"/)?.[1] ?? window.match(/data-address="([^"]*)"/)?.[1] ?? "",
    );
    const poster = window.match(/data-image="([^"]+)"/)?.[1];
    const slides = [...window.matchAll(/src="(https:\/\/xplorepondy\.com\/wp-content\/uploads\/[^"]+)"/g)].map(
      (m) => m[1],
    );
    const gallery = uniqueImages(slides);
    const image = pickListingImage(poster, gallery[0]);
    const listingType = window.match(/data-listing-type="([^"]+)"/)?.[1] ?? "";
    const kind = decode(window.match(/listing-category-tag-nl">([^<]+)/)?.[1] ?? "").split(",")[0]?.trim() ?? "";
    const id = Number(window.match(/data-post-id="(\d+)"/)?.[1] || window.match(/data-id="(\d+)"/)?.[1]);
    const featured = /badge-nl featured-nl/.test(window);
    out.push({
      slug,
      name: name || slug,
      lat,
      lng,
      rating: Number.isFinite(rating) && rating > 0 ? rating : undefined,
      reviews: Number.isFinite(reviews) && reviews > 0 ? reviews : undefined,
      address: address || undefined,
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

async function fetchListeoPage(page: number, perPage: number): Promise<string> {
  const url = `https://xplorepondy.com/wp-admin/admin-ajax.php?action=listeo_get_listings&page=${page}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "XplorePondyApp/1.0" },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) return "";
  const data = (await res.json()) as { html?: string };
  return data.html ?? "";
}

export async function loadListeoGeo(): Promise<Map<string, ListeoGeo>> {
  const map = new Map<string, ListeoGeo>();
  const pages = await Promise.all(
    [1, 2, 3, 4].map(async (page) => {
      try {
        return await fetchListeoPage(page, 100);
      } catch {
        return "";
      }
    }),
  );
  for (const html of pages) {
    for (const hit of parseListeoGeoHtml(html)) {
      if (!map.has(hit.slug)) map.set(hit.slug, hit);
    }
  }
  return map;
}
