import { create } from "zustand";
import { guides as localGuides, getGuide } from "@/data/guides";
import {
  listings as localListings,
  nearbyListings as localNearby,
  getListing,
} from "@/data/listings";
import { applySmartFilters, type SmartFilters } from "@/lib/filters";
import { listingDistanceKm, type LatLng } from "@/lib/geo";
import { elasticSearch } from "@/lib/es-search";
import { fetchWpCatalog, fetchWpGuides, fetchWpListingHours, fetchWpOpenNowForSlugs, fetchWpOpenNowSnapshot } from "@/lib/wp-api";
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
let catalogRetryTimer: ReturnType<typeof setTimeout> | undefined;
let catalogRetryDelay = 5000;
let guidesStarted = 0;
const hoursDone = new Set<string>();
const hoursQueued = new Set<string>();
const pendingSlugs = new Set<string>();
let slugTimer: ReturnType<typeof setTimeout> | undefined;
const SESSION_KEY = "xp-catalog-v41";
// Keep the last known live catalog through transient server/WordPress outages.
// A successful live refresh replaces it automatically.
const SESSION_TTL = 24 * 60 * 60 * 1000;

type SessionSnap = {
  at: number;
  listings: Listing[];
  total: number;
  openNowTotal: number;
  openNowByCategory: Record<Category, number>;
};

function readSession(): SessionSnap | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as SessionSnap;
    if (!snap || Date.now() - snap.at > SESSION_TTL) return null;
    if (!Array.isArray(snap.listings) || snap.listings.length < 300) return null;
    return snap;
  } catch {
    return null;
  }
}

function persistSession() {
  if (typeof sessionStorage === "undefined") return;
  const state = useCatalog.getState();
  if (state.source !== "live" || state.items.length < 300) return;
  try {
    const snap: SessionSnap = {
      at: Date.now(),
      listings: state.items,
      total: state.total,
      openNowTotal: state.openNowTotal,
      openNowByCategory: state.openNowByCategory,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snap));
  } catch {
    /* quota */
  }
}

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

async function hydrateGuides(apply: (guides: Guide[]) => void) {
  if (Date.now() - guidesStarted < 15000) return;
  guidesStarted = Date.now();
  try {
    const result = await fetchWpGuides();
    if (result.guides.length) apply(result.guides);
  } catch {
    guidesStarted = 0;
  }
}

async function hydrateHours(apply: (rows: HoursPatch[]) => void, _items: Listing[]) {
  const state = useCatalog.getState();
  if (state.openNowStatus === "ready" && state.openNowTotal > 0) return;
  if (Date.now() - hoursStarted < 15000 && state.openNowStatus === "loading") return;
  hoursStarted = Date.now();
  try {
    useCatalog.setState({ openNowStatus: "loading" });

    // Load the complete archive hours dataset, not only the currently
    // visible cards. This prevents Open/Closed badges from appearing
    // only after a card is scrolled into view.
    const [snapshotResult, hoursResult] = await Promise.allSettled([
      fetchWpOpenNowSnapshot(),
      fetchWpListingHours(),
    ]);

    if (snapshotResult.status === "fulfilled") {
      const snapshot = snapshotResult.value;
      useCatalog.setState({
        openNowTotal: snapshot.total,
        openNowByCategory: snapshot.byCategory,
      });
      if (snapshot.rows.length) apply(snapshot.rows);
      for (const row of snapshot.rows) hoursDone.add(row.slug);
    }

    if (hoursResult.status === "fulfilled" && hoursResult.value.length) {
      apply(hoursResult.value);
      for (const row of hoursResult.value) hoursDone.add(row.slug);
    }

    const snapshotReady = snapshotResult.status === "fulfilled";
    const hoursReady = hoursResult.status === "fulfilled";
    useCatalog.setState({
      openNowStatus: snapshotReady || hoursReady ? "ready" : "idle",
    });
    persistSession();
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
  openNowByCategory: { places: 0, activities: 0, food: 0, stay: 0, services: 0 },
  openNowStatus: "idle",
  ensure: async () => {
    const current = get();
    if (current.source !== "live") {
      const snap = readSession();
      if (snap) {
        set({
          items: snap.listings,
          source: "live",
          status: "ready",
          total: snap.total,
          error: null,
          openNowTotal: snap.openNowTotal ?? 0,
          openNowByCategory: snap.openNowByCategory ?? { places: 0, activities: 0, food: 0, stay: 0 },
          openNowStatus: (snap.openNowTotal ?? 0) > 0 ? "ready" : "idle",
        });
        if ((snap.openNowTotal ?? 0) === 0) void hydrateHours(get().applyHours, snap.listings);
        void hydrateGuides((guides) => set({ guides }));
        return;
      }
    }
    if (current.status === "loading" && Date.now() - loadStarted < 25000) return;
    if (current.openNowStatus !== "ready") void hydrateHours(get().applyHours, current.items);
    if (current.source === "live" && current.items.length >= 350 && current.items.some((item) => item.wpId)) {
      void hydrateGuides((guides) => set({ guides }));
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
      if (catalogRetryTimer) {
        clearTimeout(catalogRetryTimer);
        catalogRetryTimer = undefined;
      }
      catalogRetryDelay = 5000;
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
      persistSession();
      void hydrateHours(get().applyHours, listings);
      void hydrateGuides((guides) => set({ guides }));
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

      // Keep the curated set usable immediately, but automatically retry the
      // live catalog in the background. This lets a temporary WordPress/API
      // outage recover without requiring the user to refresh the page.
      if (!catalogRetryTimer) {
        const delay = catalogRetryDelay;
        catalogRetryDelay = Math.min(catalogRetryDelay * 2, 30000);
        catalogRetryTimer = setTimeout(() => {
          catalogRetryTimer = undefined;
          void get().ensure();
        }, delay);
      }
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
    items.find((l) => l.slug.startsWith(`${slug}-`) || slug.startsWith(`${l.slug}-`)) ||
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
  const q = query.trim();
  const scoped = items.filter((l) => category === "all" || l.category === category);
  const matched = q ? elasticSearch(scoped, q) : scoped;
  return applySmartFilters(matched, filters);
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
  // Match the WordPress/Listeo archive ordering exactly:
  // 1. _featured: on first, then 0/off
  // 2. listing-package: numeric ascending
  // Do not let rating or name reorder listings that have the same archive
  // priority/package; the source order remains the tie-breaker.
  const featured = archiveRank(a) - archiveRank(b);
  if (featured) return featured;

  const pack = packageRank(a) - packageRank(b);
  if (pack) return pack;

  return 0;
}

export function catalogFeatured(items: Listing[]) {
  const marked = items.filter((l) => l.featured);
  if (marked.length >= 6) return marked.slice(0, 6);
  return [...marked, ...items.filter((l) => !l.featured)].slice(0, 6);
}

function relatedKeys(listing: Listing) {
  const keys = new Set<string>();
  const add = (value?: string) => {
    const key = value?.trim().toLowerCase();
    if (key && key.length > 1) keys.add(key);
  };
  for (const tag of listing.tags ?? []) add(tag);
  for (const tag of listing.bestFor ?? []) add(tag);
  for (const slug of listing.categorySlugs ?? []) add(slug);
  for (const group of [...(listing.taxonomies ?? []), ...(listing.metaFacets ?? [])]) {
    for (const term of group.terms) {
      add(term.name);
      add(term.slug);
    }
  }
  return keys;
}

export function catalogNearby(slug: string, items: Listing[]) {
  const current = catalogListing(slug, items);
  if (!current) return localNearby(slug);
  const mine = relatedKeys(current);
  const ranked = items
    .filter((item) => item.slug !== current.slug && item.slug !== slug)
    .map((item) => {
      const sameCategory = item.category === current.category;
      let overlap = 0;
      for (const key of relatedKeys(item)) if (mine.has(key)) overlap += 1;
      if (!sameCategory && overlap === 0) return null;
      const score =
        (sameCategory ? 3 : 0) +
        overlap * 2 +
        (current.area && item.area === current.area ? 1 : 0) +
        (current.kind && item.kind.toLowerCase() === current.kind.toLowerCase() ? 2 : 0);
      return { item, score };
    })
    .filter((row): row is { item: Listing; score: number } => !!row)
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating || a.item.name.localeCompare(b.item.name));
  const picked = ranked.slice(0, 24).map((row) => row.item);
  if (picked.length) return picked;
  return items.filter((item) => item.slug !== slug && item.category === current.category).slice(0, 24);
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
