import type { Category, Listing } from "@/lib/types";
import { listingIsOpen } from "@/lib/hours";

export type FilterParam =
  | "type"
  | "feat"
  | "cuisine"
  | "pub"
  | "rtype"
  | "restobar"
  | "water"
  | "activity"
  | "land"
  | "sport"
  | "theme"
  | "ptype"
  | "pcat"
  | "amen"
  | "atmo"
  | "ctype"
  | "cfeat"
  | "ent"
  | "drinks"
  | "dining"
  | "bact"
  | "btime"
  | "shop"
  | "bike"
  | "atype"
  | "prange"
  | "open";

export type SmartFilters = Partial<Record<FilterParam, string[]>>;

export type FilterGroup = {
  param: FilterParam;
  tax?: string;
  metaKeys?: string[];
  label: string;
  cats: Array<Category | "all">;
};

export const FILTER_GROUPS: FilterGroup[] = [
  { param: "type", tax: "listing_category", label: "Type", cats: ["all"] },
  { param: "ctype", metaKeys: ["cafe_type"], label: "Cafe type", cats: ["food"] },
  { param: "amen", metaKeys: ["cafe_amenities", "restaurant_amenities", "hotel_amenities", "beach_amenities", "_activity_amenities", "transport_amenities", "amenities"], label: "Amenities", cats: ["all"] },
  { param: "atmo", metaKeys: ["cafe_atmosphere", "beach_atmosphere"], label: "Atmosphere", cats: ["all"] },
  { param: "cfeat", metaKeys: ["cafe_features", "transport_features", "hotel_facilities"], label: "Features", cats: ["all"] },
  { param: "ent", metaKeys: ["pub_entertainment"], label: "Entertainment", cats: ["food"] },
  { param: "drinks", metaKeys: ["pub_drinks_amp_food"], label: "Drinks & food", cats: ["food"] },
  { param: "dining", metaKeys: ["dining_options", "restaurant_service_options"], label: "Dining", cats: ["food"] },
  { param: "bact", metaKeys: ["beach_activities"], label: "Beach activities", cats: ["places"] },
  { param: "btime", metaKeys: ["beach_timing_infos"], label: "Timings", cats: ["places"] },
  { param: "shop", metaKeys: ["beach_shopping"], label: "Shopping", cats: ["places"] },
  { param: "bike", metaKeys: ["bike_models"], label: "Bike models", cats: ["activities"] },
  { param: "atype", metaKeys: ["_activity_type"], label: "Activity style", cats: ["activities"] },
  { param: "prange", metaKeys: ["price_range_filter"], label: "Price range", cats: ["all"] },
  { param: "feat", tax: "listing_feature", label: "Listing features", cats: ["all"] },
  { param: "cuisine", tax: "cuisine-type", label: "Cuisine", cats: ["food"] },
  { param: "rtype", tax: "restaurant-types", label: "Restaurant type", cats: ["food"] },
  { param: "pub", tax: "pub-type", label: "Pub type", cats: ["food"] },
  { param: "restobar", tax: "resto-bar-type", label: "Resto bar", cats: ["food"] },
  { param: "activity", tax: "activity-type", label: "Activity type", cats: ["activities"] },
  { param: "water", tax: "water-sport", label: "Water sports", cats: ["activities"] },
  { param: "land", tax: "land-adventures", label: "Land adventures", cats: ["activities"] },
  { param: "sport", tax: "sport-type", label: "Sport", cats: ["activities"] },
  { param: "theme", tax: "by-theme", label: "Theme", cats: ["all"] },
  { param: "ptype", tax: "property-type", label: "Property type", cats: ["stay"] },
  { param: "pcat", tax: "property-category", label: "Property", cats: ["stay"] },
];

export const FILTER_TAX_KEYS = [...new Set(FILTER_GROUPS.map((g) => g.tax).filter((t): t is string => !!t))];

const TYPE_SKIP = new Set([
  "tourist-attractions",
  "food-beverage",
  "accommodation",
  "activities",
  "rentals",
  "services",
  "events",
]);

export function parseCsv(value?: string): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((s) => s.trim()).filter(Boolean))];
}

export function joinCsv(values: string[]): string | undefined {
  return values.length ? values.join(",") : undefined;
}

export function toggleValue(list: string[], slug: string): string[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}

export function emptyFilterSearch(): Record<FilterParam, undefined> {
  return {
    type: undefined,
    feat: undefined,
    cuisine: undefined,
    pub: undefined,
    rtype: undefined,
    restobar: undefined,
    water: undefined,
    activity: undefined,
    land: undefined,
    sport: undefined,
    theme: undefined,
    ptype: undefined,
    pcat: undefined,
    amen: undefined,
    atmo: undefined,
    ctype: undefined,
    cfeat: undefined,
    ent: undefined,
    drinks: undefined,
    dining: undefined,
    bact: undefined,
    btime: undefined,
    shop: undefined,
    bike: undefined,
    atype: undefined,
    prange: undefined,
    open: undefined,
  };
}

export function filtersFromSearch(search: Partial<Record<FilterParam, string | undefined>>): SmartFilters {
  const out: SmartFilters = {};
  for (const group of FILTER_GROUPS) {
    const values = parseCsv(search[group.param]);
    if (values.length) out[group.param] = values;
  }
  if (search.open === "1" || search.open === "now") out.open = ["1"];
  return out;
}

export function activeFilterCount(filters: SmartFilters): number {
  return Object.values(filters).reduce((n, v) => n + (v?.length ?? 0), 0);
}

export function listingHasTerm(listing: Listing, tax: string, slugs: string[]): boolean {
  if (!slugs.length) return true;
  const group = listing.taxonomies?.find((g) => g.key === tax);
  if (!group) return false;
  const have = new Set(group.terms.map((t) => t.slug));
  return slugs.some((slug) => have.has(slug));
}

export function listingHasMeta(listing: Listing, keys: string[], slugs: string[]): boolean {
  if (!slugs.length) return true;
  const groups = listing.metaFacets?.filter((g) => keys.includes(g.key)) ?? [];
  if (!groups.length) return false;
  const have = new Set(groups.flatMap((g) => g.terms.map((t) => t.slug)));
  return slugs.some((slug) => have.has(slug));
}

function listingMatchesGroup(listing: Listing, group: FilterGroup, slugs: string[], pool: Listing[]): boolean {
  if (!slugs.length) return true;
  if (group.tax) {
    const present = pool.some((row) => row.taxonomies?.some((g) => g.key === group.tax && g.terms.length));
    if (!present) return true;
    return listingHasTerm(listing, group.tax, slugs);
  }
  if (group.metaKeys?.length) {
    const present = pool.some((row) => row.metaFacets?.some((g) => group.metaKeys!.includes(g.key) && g.terms.length));
    if (!present) return true;
    return listingHasMeta(listing, group.metaKeys, slugs);
  }
  return true;
}

export function applySmartFilters(items: Listing[], filters: SmartFilters): Listing[] {
  const next = items.filter((listing) =>
    FILTER_GROUPS.every((group) => listingMatchesGroup(listing, group, filters[group.param] ?? [], items)),
  );
  if (filters.open?.includes("1")) return next.filter((listing) => listingIsOpen(listing) === true);
  return next;
}

export type FilterOption = { slug: string; name: string; count: number };

function countTerms(
  items: Listing[],
  groupsOf: (listing: Listing) => { slug: string; name: string }[],
  hide?: Set<string>,
): FilterOption[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const listing of items) {
    const seen = new Set<string>();
    for (const term of groupsOf(listing)) {
      if (!term.slug || seen.has(term.slug) || hide?.has(term.slug)) continue;
      seen.add(term.slug);
      const row = counts.get(term.slug) ?? { name: term.name, count: 0 };
      row.count += 1;
      counts.set(term.slug, row);
    }
  }
  return [...counts.entries()]
    .map(([slug, row]) => ({ slug, name: row.name, count: row.count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function optionsForGroup(items: Listing[], tax: string, hide?: Set<string>): FilterOption[] {
  return countTerms(
    items,
    (listing) => listing.taxonomies?.find((g) => g.key === tax)?.terms ?? [],
    hide,
  );
}

export function optionsForMeta(items: Listing[], keys: string[]): FilterOption[] {
  return countTerms(items, (listing) =>
    (listing.metaFacets ?? []).filter((g) => keys.includes(g.key)).flatMap((g) => g.terms),
  );
}

export function optionsForFilter(items: Listing[], group: FilterGroup): FilterOption[] {
  if (group.tax) return optionsForGroup(items, group.tax, group.param === "type" ? TYPE_SKIP : undefined);
  if (group.metaKeys?.length) return optionsForMeta(items, group.metaKeys);
  return [];
}

export function groupsForCategory(category: Category | "all"): FilterGroup[] {
  return FILTER_GROUPS.filter(
    (group) => group.param !== "type" && (group.cats.includes("all") || group.cats.includes(category as Category)),
  );
}

export function typeSkipSlugs(): Set<string> {
  return TYPE_SKIP;
}

export function exploreSearchForTerm(
  tax: string,
  slug: string,
): { cat: Category | "all" } & Partial<Record<FilterParam, string>> {
  const group =
    FILTER_GROUPS.find((g) => g.tax === tax) ||
    FILTER_GROUPS.find((g) => g.metaKeys?.includes(tax));
  const cat: Category | "all" = group?.cats.includes("all") ? "all" : (group?.cats[0] ?? "all");
  if (!group) return { cat: "all" };
  return { cat, [group.param]: slug };
}
