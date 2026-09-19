import { create } from "zustand";
import {
  listings as localListings,
  nearbyListings as localNearby,
} from "@/data/listings";
import { fetchWpCatalog } from "@/lib/wp-api";
import type { Category, Listing } from "@/lib/types";

type CatalogState = {
  items: Listing[];
  source: "local" | "live";
  status: "idle" | "loading" | "ready" | "offline";
  total: number;
  error: string | null;
  ensure: () => Promise<void>;
};

export const useCatalog = create<CatalogState>((set, get) => ({
  items: localListings,
  source: "local",
  status: "idle",
  total: localListings.length,
  error: null,
  ensure: async () => {
    const current = get();
    if (current.status === "loading" || current.source === "live") return;
    set({ status: "loading" });
    try {
      const result = await fetchWpCatalog();
      set({
        items: result.listings,
        source: "live",
        status: "ready",
        total: result.total,
        error: null,
      });
    } catch {
      set({
        items: localListings,
        source: "local",
        status: "offline",
        error: "Could not reach xplorepondy.com. Showing the curated set.",
      });
    }
  },
}));

export function catalogListing(slug: string, items: Listing[]) {
  return items.find((l) => l.slug === slug);
}

export function catalogSearch(items: Listing[], query: string, category: Category | "all") {
  const q = query.trim().toLowerCase();
  return items.filter((l) => {
    if (category !== "all" && l.category !== category) return false;
    if (!q) return true;
    const hay = [l.name, l.kind, l.location, l.area, l.description, ...l.tags, ...l.bestFor]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
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
    .slice(0, 3);
}
