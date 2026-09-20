import { create } from "zustand";
import { guides as localGuides, getGuide } from "@/data/guides";
import {
  listings as localListings,
  nearbyListings as localNearby,
  getListing,
} from "@/data/listings";
import { applySmartFilters, type SmartFilters } from "@/lib/filters";
import { listingDistanceKm, type LatLng } from "@/lib/geo";
import { fetchWpCatalog, fetchWpGuides } from "@/lib/wp-api";
import type { Category, Guide, Listing } from "@/lib/types";

type CatalogState = {
  items: Listing[];
  guides: Guide[];
  source: "local" | "live";
  status: "idle" | "loading" | "ready" | "offline";
  total: number;
  error: string | null;
  ensure: () => Promise<void>;
};

let loadStarted = 0;

export const useCatalog = create<CatalogState>((set, get) => ({
  items: localListings,
  guides: localGuides,
  source: "local",
  status: "idle",
  total: localListings.length,
  error: null,
  ensure: async () => {
    const current = get();
    if (current.status === "loading" && Date.now() - loadStarted < 36000) return;
    if (
      current.source === "live" &&
      current.items.filter((item) => item.lat != null).length > 40 &&
      current.items.some((item) => item.wpId) &&
      current.items.filter((item) => item.weeklyHours?.length).length > 8 &&
      current.items.filter((item) => item.featured).length < 80
    ) return;
    loadStarted = Date.now();
    set({ status: "loading" });
    try {
      const result = await Promise.race([
        fetchWpCatalog(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("catalog-timeout")), 32000);
        }),
      ]);
      set({
        items: result.listings,
        source: "live",
        status: "ready",
        total: result.total,
        error: null,
      });
      void fetchWpGuides()
        .then((guideResult) => {
          if (guideResult.guides.length) set({ guides: guideResult.guides });
        })
        .catch(() => undefined);
    } catch {
      set({
        items: localListings,
        guides: localGuides,
        source: "local",
        status: "offline",
        error: "Could not reach xplorepondy.com. Showing the curated set.",
      });
    }
  },
}));

export function resolveListing(slug: string, items: Listing[]) {
  return (
    items.find((l) => l.slug === slug) ||
    items.find((l) => l.siteUrl.includes(`/${slug}/`)) ||
    getListing(slug)
  );
}

export function catalogListing(slug: string, items: Listing[]) {
  return resolveListing(slug, items);
}

export function catalogSearch(
  items: Listing[],
  query: string,
  category: Category | "all",
  filters: SmartFilters = {},
) {
  const q = query.trim().toLowerCase();
  const scoped = items.filter((l) => {
    if (category !== "all" && l.category !== category) return false;
    if (!q) return true;
    const hay = [
      l.name,
      l.kind,
      l.location,
      l.area,
      l.description,
      l.address ?? "",
      l.phone ?? "",
      ...(l.tags ?? []),
      ...(l.bestFor ?? []),
      ...(l.cafeTypes ?? []),
      ...(l.taxonomies ?? []).flatMap((g) => [g.label, ...g.terms.map((t) => t.name)]),
      ...(l.metaFacets ?? []).flatMap((g) => [g.label, ...g.terms.map((t) => t.name)]),
      ...(l.metaGroups ?? []).flatMap((g) => [g.title, ...g.items.map((i) => i.label)]),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
  return applySmartFilters(scoped, filters);
}

function archiveRank(listing: Listing): number {
  if (listing.featured) return 0;
  return 1;
}

function packageRank(listing: Listing): number {
  return listing.listingPackage ?? Number.POSITIVE_INFINITY;
}

/** Default archive order: `_featured` first, then `listing-package` lowest to highest. */
export function sortListings(
  rows: Listing[],
  opts?: { origin?: LatLng | null; nearMe?: boolean },
): Listing[] {
  if (opts?.nearMe && opts.origin) {
    return [...rows].sort((a, b) => {
      const da = listingDistanceKm(opts.origin!, a);
      const db = listingDistanceKm(opts.origin!, b);
      if (da == null && db == null) return compareArchive(a, b);
      if (da == null) return 1;
      if (db == null) return -1;
      return da - db || compareArchive(a, b);
    });
  }
  return [...rows].sort(compareArchive);
}

function compareArchive(a: Listing, b: Listing) {
  const featured = archiveRank(a) - archiveRank(b);
  if (featured) return featured;
  const pack = packageRank(a) - packageRank(b);
  if (pack) return pack;
  if (b.rating !== a.rating) return b.rating - a.rating;
  return a.name.localeCompare(b.name);
}

export function catalogFeatured(items: Listing[]) {
  const marked = items.filter((l) => l.featured);
  if (marked.length >= 6) return marked.slice(0, 6);
  return [...marked, ...items.filter((l) => !l.featured)].slice(0, 6);
}

export function catalogNearby(slug: string, items: Listing[]) {
  const current = catalogListing(slug, items);
  if (!current) return localNearby(slug);
  return items
    .filter((l) => l.slug !== slug && (l.area === current.area || l.category === current.category))
    .slice(0, 4);
}

export function catalogGuide(slug: string, guides: Guide[]) {
  return (
    guides.find((g) => g.slug === slug) ||
    (slug.startsWith("surfing-in-pondicherry")
      ? guides.find((g) => g.slug.startsWith("surfing-in-pondicherry"))
      : undefined) ||
    getGuide(slug)
  );
}
