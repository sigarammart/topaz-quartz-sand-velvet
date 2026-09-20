import type { Category, Listing, ListingTaxTerm } from "@/lib/types";
import { listingIsOpen } from "@/lib/hours";
import { decodeEntities } from "@/lib/utils";

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
  | "area"
  | "open";

export type SmartFilters = Partial<Record<FilterParam, string[]>>;

export type FilterGroup = {
  param: FilterParam;
  tax?: string;
  metaKeys?: string[];
  label: string;
  cats: Array<Category | "all">;
  hints?: string[];
};

export const FILTER_GROUPS: FilterGroup[] = [
  { param: "type", tax: "listing_category", label: "Type", cats: ["all"] },
  { param: "area", tax: "region", label: "Area", cats: ["all"] },
  { param: "ctype", metaKeys: ["cafe_type"], label: "Cafe type", cats: ["food"], hints: ["cafe type"] },
  {
    param: "amen",
    metaKeys: [
      "cafe_amenities",
      "restaurant_amenities",
      "hotel_amenities",
      "beach_amenities",
      "_activity_amenities",
      "transport_amenities",
      "amenities",
    ],
    label: "Amenities",
    cats: ["all"],
    hints: ["amenit"],
  },
  { param: "atmo", metaKeys: ["cafe_atmosphere", "beach_atmosphere"], label: "Atmosphere", cats: ["all"], hints: ["atmosphere"] },
  {
    param: "cfeat",
    metaKeys: ["cafe_features", "transport_features", "hotel_facilities"],
    label: "Features",
    cats: ["all"],
    hints: ["feature", "facilit"],
  },
  { param: "ent", metaKeys: ["pub_entertainment"], label: "Entertainment", cats: ["food"], hints: ["entertainment"] },
  { param: "drinks", metaKeys: ["pub_drinks_amp_food"], label: "Drinks & food", cats: ["food"], hints: ["drink"] },
  {
    param: "dining",
    metaKeys: ["dining_options", "restaurant_service_options"],
    label: "Dining",
    cats: ["food"],
    hints: ["dining", "service option"],
  },
  { param: "bact", metaKeys: ["beach_activities"], label: "Beach activities", cats: ["places"], hints: ["beach activ"] },
  { param: "btime", metaKeys: ["beach_timing_infos"], label: "Timings", cats: ["places"], hints: ["timing"] },
  { param: "shop", metaKeys: ["beach_shopping"], label: "Shopping", cats: ["places"], hints: ["shopping"] },
  { param: "bike", metaKeys: ["bike_models"], label: "Bike models", cats: ["activities"], hints: ["bike"] },
  { param: "atype", metaKeys: ["_activity_type"], label: "Activity style", cats: ["activities"], hints: ["activity type", "activity style"] },
  { param: "prange", metaKeys: ["price_range_filter"], label: "Price range", cats: ["all"], hints: ["price"] },
  { param: "feat", tax: "listing_feature", label: "Listing features", cats: ["all"], hints: ["feature"] },
  { param: "cuisine", tax: "cuisine-type", label: "Cuisine", cats: ["food"], hints: ["cuisine"] },
  { param: "rtype", tax: "restaurant-types", label: "Restaurant type", cats: ["food"], hints: ["restaurant"] },
  { param: "pub", tax: "pub-type", label: "Pub type", cats: ["food"], hints: ["pub"] },
  { param: "restobar", tax: "resto-bar-type", label: "Resto bar", cats: ["food"], hints: ["resto"] },
  { param: "activity", tax: "activity-type", label: "Activity type", cats: ["activities"] },
  { param: "water", tax: "water-sport", label: "Water sports", cats: ["activities"], hints: ["water"] },
  { param: "land", tax: "land-adventures", label: "Land adventures", cats: ["activities"], hints: ["land"] },
  { param: "sport", tax: "sport-type", label: "Sport", cats: ["activities"] },
  { param: "theme", tax: "by-theme", label: "Theme", cats: ["all"] },
  { param: "ptype", tax: "property-type", label: "Property type", cats: ["stay"], hints: ["property type"] },
  { param: "pcat", tax: "property-category", label: "Property", cats: ["stay"], hints: ["property"] },
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
  "listing",
  "pondicherry",
]);

export function facetSlug(value: string): string {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asTerm(name: string | undefined | null): ListingTaxTerm | null {
  const clean = decodeEntities(name ?? "");
  if (clean.length < 2 || clean.length > 48) return null;
  const slug = facetSlug(clean);
  if (!slug || slug.length < 2) return null;
  return { name: clean, slug };
}

function pushTerm(out: ListingTaxTerm[], seen: Set<string>, name?: string | null) {
  const term = asTerm(name);
  if (!term || seen.has(term.slug)) return;
  seen.add(term.slug);
  out.push(term);
}

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
    area: undefined,
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

function taxTerms(listing: Listing, key: string): ListingTaxTerm[] {
  return listing.taxonomies?.find((g) => g.key === key)?.terms ?? [];
}

function metaTerms(listing: Listing, keys: string[]): ListingTaxTerm[] {
  return (listing.metaFacets ?? []).filter((g) => keys.includes(g.key)).flatMap((g) => g.terms);
}

function hintedMetaGroups(listing: Listing, hints: string[]): ListingTaxTerm[] {
  if (!hints.length) return [];
  const out: ListingTaxTerm[] = [];
  const seen = new Set<string>();
  for (const group of listing.metaGroups ?? []) {
    const title = group.title.toLowerCase();
    if (!hints.some((hint) => title.includes(hint))) continue;
    for (const item of group.items) pushTerm(out, seen, item.label);
  }
  return out;
}

function listingTermsForGroup(listing: Listing, group: FilterGroup): ListingTaxTerm[] {
  const seen = new Set<string>();
  const out: ListingTaxTerm[] = [];
  const add = (terms: ListingTaxTerm[]) => {
    for (const term of terms) {
      if (!term.slug || seen.has(term.slug)) continue;
      if (group.param === "type" && TYPE_SKIP.has(term.slug)) continue;
      seen.add(term.slug);
      out.push(term);
    }
  };

  if (group.tax) add(taxTerms(listing, group.tax));
  if (group.metaKeys?.length) add(metaTerms(listing, group.metaKeys));
  if (group.hints?.length) add(hintedMetaGroups(listing, group.hints));

  if (group.param === "type") add([asTerm(listing.kind)].filter((t): t is ListingTaxTerm => !!t));
  if (group.param === "area") {
    const name = listing.area && listing.area !== "Pondicherry" ? listing.area : listing.location;
    if (name && name !== "Pondicherry" && !/,/.test(name) && name.split(" ").length <= 4) {
      add([asTerm(name)].filter((t): t is ListingTaxTerm => !!t));
    }
  }
  if (group.param === "feat") {
    for (const tag of listing.tags ?? []) add([asTerm(tag)].filter((t): t is ListingTaxTerm => !!t));
  }
  if (group.param === "theme") {
    for (const tag of listing.bestFor ?? []) add([asTerm(tag)].filter((t): t is ListingTaxTerm => !!t));
  }
  if (group.param === "prange" && listing.price) {
    const digits = listing.price.replace(/[^\d]/g, "");
    const n = Number(digits);
    if (n > 0) {
      const bucket = n <= 500 ? "Budget" : n <= 1500 ? "Mid-range" : "Premium";
      add([asTerm(bucket)].filter((t): t is ListingTaxTerm => !!t));
    }
  }

  return out;
}

export function listingHasTerm(listing: Listing, tax: string, slugs: string[]): boolean {
  if (!slugs.length) return true;
  const group = FILTER_GROUPS.find((g) => g.tax === tax);
  if (group) {
    const have = new Set(listingTermsForGroup(listing, group).map((t) => t.slug));
    return slugs.some((slug) => have.has(slug));
  }
  const have = new Set(taxTerms(listing, tax).map((t) => t.slug));
  return slugs.some((slug) => have.has(slug));
}

export function listingHasMeta(listing: Listing, keys: string[], slugs: string[]): boolean {
  if (!slugs.length) return true;
  const group = FILTER_GROUPS.find((g) => g.metaKeys?.some((k) => keys.includes(k)));
  if (group) {
    const have = new Set(listingTermsForGroup(listing, group).map((t) => t.slug));
    return slugs.some((slug) => have.has(slug));
  }
  const have = new Set(metaTerms(listing, keys).map((t) => t.slug));
  return slugs.some((slug) => have.has(slug));
}

function listingMatchesGroup(listing: Listing, group: FilterGroup, slugs: string[]): boolean {
  if (!slugs.length) return true;
  const have = new Set(listingTermsForGroup(listing, group).map((t) => t.slug));
  return slugs.some((slug) => have.has(slug));
}

export function applySmartFilters(items: Listing[], filters: SmartFilters): Listing[] {
  const next = items.filter((listing) =>
    FILTER_GROUPS.every((group) => listingMatchesGroup(listing, group, filters[group.param] ?? [])),
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
      const row = counts.get(term.slug) ?? { name: decodeEntities(term.name), count: 0 };
      row.name = decodeEntities(term.name || row.name);
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
  const group = FILTER_GROUPS.find((g) => g.tax === tax);
  return countTerms(
    items,
    (listing) => (group ? listingTermsForGroup(listing, group) : taxTerms(listing, tax)),
    hide,
  );
}

export function optionsForMeta(items: Listing[], keys: string[]): FilterOption[] {
  const group = FILTER_GROUPS.find((g) => g.metaKeys?.some((k) => keys.includes(k)));
  return countTerms(items, (listing) =>
    group ? listingTermsForGroup(listing, group) : metaTerms(listing, keys),
  );
}

export function optionsForFilter(items: Listing[], group: FilterGroup): FilterOption[] {
  return countTerms(
    items,
    (listing) => listingTermsForGroup(listing, group),
    group.param === "type" ? TYPE_SKIP : undefined,
  );
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
