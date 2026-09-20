import { create } from "zustand";
import { guides as localGuides, getGuide } from "@/data/guides";
import {
  listings as localListings,
  nearbyListings as localNearby,
  getListing,
} from "@/data/listings";
import { applySmartFilters, type SmartFilters } from "@/lib/filters";
import { listingDistanceKm, type LatLng } from "@/lib/geo";
import { fetchWpCatalog, fetchWpGuides, fetchWpOpenNowForSlugs, fetchWpOpenNowSnapshot } from "@/lib/wp-api";
import type { Category, DayHours, Guide, Listing } from "@/lib/types";

type HoursPatch = {
  slug: string;
  hours?: string;
  openNow?: boolean;
  weeklyHours?: DayHours[];
};

type CatalogState = {
  items: Listing[];
  guides: Guide[];
  source: "local" | "live";
  status: "idle" | "loading" | "ready" | "offline";
  total: number;
  error: string | null;
  openNowTotal: number;
  openNowByCategory: Record<Category, number>;
  openNowStatus: "idle" | "loading" | "ready";
  ensure: () => Promise<void>;
  patchListing: (row: Listing) => void;
  applyHours: (rows: HoursPatch[]) => void;
  hydrateSlugs: (slugs: string[]) => Promise<void>;
};

let loadStarted = 0;
let hoursStarted = 0;
const hoursDone = new Set<string>();
const hoursQueued = new Set<string>();
const pendingSlugs = new Set<string>();
let slugTimer: ReturnType<typeof setTimeout> | undefined;

function urlTail(url: string) {
  return url.split("/").filter(Boolean).pop() ?? "";
}

function withHours(item: Listing, hit: HoursPatch | Listing): Listing {
  return {
    ...item,
    hours: hit.hours || item.hours,
    openNow: hit.openNow ?? item.openNow,
    weeklyHours: hit.weeklyHours?.length ? hit.weeklyHours : item.weeklyHours,
  };
}

async function hydrateHours(apply: (rows: HoursPatch[]) => void, _items: Listing[]) {
  const state = useCatalog.getState();
  if (state.openNowStatus === "ready" && state.openNowTotal > 0) return;
  if (Date.now() - hoursStarted < 15000 && state.openNowStatus === "loading") return;
  hoursStarted = Date.now();
  try {
    useCatalog.setState({ openNowStatus: "loading" });
    const snapshot = await fetchWpOpenNowSnapshot();
    useCatalog.setState({
      openNowTotal: snapshot.total,
      openNowByCategory: snapshot.byCategory,
      openNowStatus: snapshot.total > 0 ? "ready" : "idle",
    });
    if (snapshot.rows.length) apply(snapshot.rows);
    for (const row of snapshot.rows) hoursDone.add(row.slug);
  } catch {
    hoursStarted = 0;
    useCatalog.setState({ openNowStatus: "idle" });
  }
}

export const useCatalog = create<CatalogState>((set, get) => ({
  items: localListings,
  guides: localGuides,
  source: "local",
  status: "idle",
  total: localListings.length,
  error: null,
  openNowTotal: 0,
  openNowByCategory: { places: 0, activities: 0, food: 0, stay: 0 },
  openNowStatus: "idle",
  ensure: async () => {
    const current = get();
    if (current.status === "loading" && Date.now() - loadStarted < 25000) return;
    if (current.openNowStatus !== "ready") void hydrateHours(get().applyHours, current.items);
    if (current.source === "live" && current.items.length >= 350 && current.items.some((item) => item.wpId)) {
      return;
    }
    loadStarted = Date.now();
    const previous = current.items;
    const previousSource = current.source;
    const keepUi = previous.length > 80 && previousSource === "live";
    if (!keepUi) set({ status: "loading" });
    try {
      const result = await Promise.race([
        fetchWpCatalog(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("catalog-timeout")), 25000);
        }),
      ]);
      const incoming = result.listings;
      const keepPrevious = previous.length > incoming.length && previous.length >= 300;
      const listings = keepPrevious ? previous : incoming;
      const total = Math.max(result.total, listings.length, previous.length >= 300 ? previous.length : 0);
      if (incoming.length < 80 && previous.length >= 80) {
        set({ items: previous, source: previousSource, status: "ready", total: previous.length, error: null });
        void hydrateHours(get().applyHours, previous);
        return;
      }
      set({
        items: listings,
        source: listings.length >= 80 ? "live" : "local",
        status: "ready",
        total,
        error: null,
      });
      void hydrateHours(get().applyHours, listings);
      void fetchWpGuides()
        .then((guideResult) => {
          if (guideResult.guides.length) set({ guides: guideResult.guides });
        })
        .catch(() => undefined);
    } catch {
      if (previous.length >= 80) {
        set({
          items: previous,
          source: previousSource,
          status: "ready",
          total: previous.length,
          error: "Could not refresh listings. Showing the last loaded set.",
        });
        return;
      }
      set({
        items: localListings,
        guides: localGuides,
        source: "local",
        status: "offline",
        error: "Could not reach xplorepondy.com. Showing the curated set.",
      });
    }
  },
  patchListing: (row) => {
    hoursDone.add(row.slug);
    set((state) => ({
      items: state.items.map((item) =>
        item.slug === row.slug || urlTail(item.siteUrl) === row.slug ? withHours(item, row) : item,
      ),
    }));
  },
  applyHours: (rows) => {
    const map = new Map(rows.map((row) => [row.slug, row]));
    set((state) => ({
      items: state.items.map((item) => {
        const hit = map.get(item.slug) ?? map.get(urlTail(item.siteUrl));
        return hit ? withHours(item, hit) : item;
      }),
    }));
  },
  hydrateSlugs: async (slugs) => {
    const need = slugs.filter((slug) => slug && !hoursDone.has(slug) && !hoursQueued.has(slug));
    if (!need.length) return;
    for (const slug of need) hoursQueued.add(slug);
    try {
      const rows = await fetchWpOpenNowForSlugs({ data: { slugs: need.join(",") } });
      for (const slug of need) {
        hoursQueued.delete(slug);
        hoursDone.add(slug);
      }
      if (rows.length) get().applyHours(rows);
    } catch {
      for (const slug of need) hoursQueued.delete(slug);
    }
  },
}));

export function queueOpenNow(slug: string) {
  if (!slug || hoursDone.has(slug) || hoursQueued.has(slug)) return;
  pendingSlugs.add(slug);
  if (slugTimer) return;
  slugTimer = setTimeout(() => {
    slugTimer = undefined;
    const slugs = [...pendingSlugs];
    pendingSlugs.clear();
    void useCatalog.getState().hydrateSlugs(slugs);
  }, 50);
}

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
