import type { Category, ListingMetaGroup } from "@/lib/types";

/** Elementor Theme Builder singles used on xplorepondy.com */
export const ELEMENTOR_LISTING_TEMPLATES = {
  places: { postId: 15493, wpCategories: [210], label: "Tourist Attractions" },
  activities: { postId: 15325, wpCategories: [87], label: "Activities" },
  food: { postId: 22311, wpCategories: [26, 480], label: "Restaurants, cafes, pubs" },
} as const;

const FOOD_SECTIONS = [
  "cafe type",
  "restaurant type",
  "pub type",
  "resto bar",
  "cuisine",
  "cafe amenities",
  "restaurant amenities",
  "pub amenities",
  "amenities",
  "cafe features",
  "restaurant features",
  "features",
  "cafe atmosphere",
  "cafe atmoshphere",
  "atmosphere",
  "accessibility",
  "service options",
  "dining options",
  "crowd",
  "entertainment",
  "drinks & food",
  "best time to visit",
];

const PLACE_SECTIONS = [
  "attraction type",
  "type",
  "amenities",
  "beach amenities",
  "facilities",
  "atmosphere",
  "beach atmosphere",
  "activities",
  "beach activities",
  "accessibility",
  "timings",
  "beach timing",
  "best time to visit",
  "crowd",
  "shopping",
];

const ACTIVITY_SECTIONS = [
  "features",
  "activity type",
  "activity style",
  "type of activities",
  "types of activities",
  "age groups",
  "group size",
  "difficulty level",
  "skill levels",
  "includes",
  "what's included",
  "highlights",
  "services",
  "amenities",
  "activity amenities",
  "available on days",
  "languages",
  "videos",
  "best time to visit",
  "crowd",
  "water sports",
  "land adventures",
  "accessibility",
];

const STAY_SECTIONS = [
  "property type",
  "property category",
  "hotel amenities",
  "amenities",
  "facilities",
  "accessibility",
  "crowd",
  "best time to visit",
];

const SECTION_ORDER: Record<Category, string[]> = {
  food: FOOD_SECTIONS,
  places: PLACE_SECTIONS,
  activities: ACTIVITY_SECTIONS,
  stay: STAY_SECTIONS,
};

export function normalizeGroupTitle(title: string) {
  return title.replace(/\s+/g, " ").replace(/atmoshphere/i, "Atmosphere").trim();
}

export function orderListingGroups(category: Category, groups: ListingMetaGroup[]): ListingMetaGroup[] {
  const order = SECTION_ORDER[category] ?? [];
  const rank = (title: string) => {
    const key = title.toLowerCase().replace(/atmoshphere/g, "atmosphere");
    const exact = order.indexOf(key);
    if (exact >= 0) return exact;
    return order.findIndex((s) => key.includes(s) || s.includes(key));
  };
  return [...groups]
    .map((g) => ({ ...g, title: normalizeGroupTitle(g.title) }))
    .sort((a, b) => {
      const ar = rank(a.title);
      const br = rank(b.title);
      const av = ar < 0 ? 1000 : ar;
      const bv = br < 0 ? 1000 : br;
      return av - bv;
    });
}

/** Single-listing field sets. Only these CMB2/Jet keys are parsed and shown. */
export type ListingFieldProfile = "dining" | "restopub" | "attraction" | "beach";

const DINING_KEYS = [
  "price_range_filter",
  "listing_tagline",
  "features_must_try",
  "cafe_type",
  "cafe_amenities",
  "cafe_features",
  "cafe_atmosphere",
  "restaurant_service_options",
  "restaurant_amenities",
  "dine_in_experience",
  "accessibility",
  "service_options",
  "dining_options",
  "crowd",
  "peak_hours",
  "price_for_two",
  "_editor_note",
] as const;

const RESTOPUB_KEYS = [
  "price_range_filter",
  "listing_tagline",
  "features_must_try",
  "pub_drinks_amp_food",
  "pub_entertainment",
  "pub_sports_and_media",
  "pub_outdoor_spaces",
  "pub_seating_and_vibe",
  "pub_other_amenities",
  "food_amp_dining",
  "bar_amp_drinks",
  "entertainment_amp_atmosphere",
  "outdoor_amp_space",
  "other_amenities",
  "accessibility",
  "service_options",
  "dining_options",
  "crowd",
  "peak_hours",
  "price_for_two",
  "_editor_note",
] as const;

const ATTRACTION_KEYS = [
  "listing_tagline",
  "features_must_try",
  "spot_best_time_to_visit",
  "visit_duration",
  "entry_type",
  "online_booking",
  "parking_availability",
  "wheelchair_accessible",
  "best_spot_for",
  "spot_known_for",
  "_editor_note",
] as const;

const BEACH_KEYS = [
  "listing_tagline",
  "features_must_try",
  "spot_best_time_to_visit",
  "visit_duration",
  "entry_type",
  "online_booking",
  "parking_availability",
  "wheelchair_accessible",
  "best_spot_for",
  "spot_known_for",
  "beach_amenities",
  "beach_amenities_details",
  "beach_atmosphere",
  "beach_activities",
  "beach_activity_details",
  "beach_shopping",
  "beach_timing_infos",
  "best_time_to_visit",
  "_editor_note",
] as const;

const PROFILE_KEYS: Record<ListingFieldProfile, readonly string[]> = {
  dining: DINING_KEYS,
  restopub: RESTOPUB_KEYS,
  attraction: ATTRACTION_KEYS,
  beach: BEACH_KEYS,
};

const KEY_ALIASES: Record<string, string[]> = {
  price_range_filter: ["price range", "price range filter"],
  listing_tagline: ["tagline", "listing tagline"],
  features_must_try: ["must try", "features must try", "features known for", "well known for"],
  cafe_type: ["cafe type"],
  cafe_amenities: ["cafe amenities"],
  cafe_features: ["cafe features"],
  cafe_atmosphere: ["cafe atmosphere", "cafe atmoshphere"],
  restaurant_service_options: ["restaurant service options"],
  restaurant_amenities: ["restaurant amenities"],
  dine_in_experience: ["dine in experience", "dine-in experience"],
  accessibility: ["accessibility"],
  service_options: ["service options"],
  dining_options: ["dining options"],
  crowd: ["crowd"],
  peak_hours: ["peak hours"],
  price_for_two: ["price for two"],
  _editor_note: ["editor note", "editor's note", "editors note"],
  pub_drinks_amp_food: ["drinks & food", "drinks and food", "pub drinks & food"],
  pub_entertainment: ["pub entertainment"],
  pub_sports_and_media: ["sports and media", "sports & media", "pub sports"],
  pub_outdoor_spaces: ["outdoor spaces", "pub outdoor"],
  pub_seating_and_vibe: ["seating and vibe", "seating & vibe"],
  pub_other_amenities: ["pub other amenities"],
  food_amp_dining: ["food & dining", "food and dining"],
  bar_amp_drinks: ["bar & drinks", "bar and drinks"],
  entertainment_amp_atmosphere: ["entertainment & atmosphere", "entertainment and atmosphere"],
  outdoor_amp_space: ["outdoor & space", "outdoor and space"],
  other_amenities: ["other amenities"],
  spot_best_time_to_visit: ["spot best time to visit", "best time to visit"],
  visit_duration: ["visit duration", "duration", "time needed"],
  entry_type: ["entry type", "entry"],
  online_booking: ["online booking"],
  parking_availability: ["parking availability", "parking"],
  wheelchair_accessible: ["wheelchair accessible", "wheelchair", "accessibility"],
  best_spot_for: ["best spot for", "best for"],
  spot_known_for: ["spot known for", "known for"],
  beach_amenities: ["beach amenities"],
  beach_amenities_details: ["beach amenities details", "amenity details"],
  beach_atmosphere: ["beach atmosphere"],
  beach_activities: ["beach activities"],
  beach_activity_details: ["beach activity details", "activity details"],
  beach_shopping: ["beach shopping", "shopping"],
  beach_timing_infos: ["beach timing", "timings", "timing"],
  best_time_to_visit: ["best time to visit"],
};

function keyLabel(key: string) {
  return key
    .replace(/^_/, "")
    .replace(/_amp_/g, " & ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function aliasesFor(key: string) {
  return KEY_ALIASES[key] ?? [key.replace(/^_/, "").replace(/_amp_/g, " & ").replace(/_/g, " ")];
}

function titleKey(title: string) {
  return title
    .toLowerCase()
    .replace(/atmoshphere/g, "atmosphere")
    .replace(/&/g, "&")
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[:\s]+$/g, "");
}

export function profileKeys(profile: ListingFieldProfile) {
  return PROFILE_KEYS[profile];
}

/** Children of listing_category 210 (tourist-attractions), including the parent. */
const ATTRACTION_SLUGS = new Set([
  "tourist-attractions",
  "archaeological-sites",
  "art-galleries",
  "backwaters-mangroves",
  "beaches",
  "caves-rock-formations",
  "cemeteries-memorials",
  "cultural-centres",
  "heritage-sites",
  "heritage-streets",
  "historical-site",
  "lakes-water-bodies",
  "libraries-literary-places",
  "lighthouses",
  "markets-bazaars",
  "monuments-and-statues",
  "museum",
  "nature-eco-spots",
  "offbeat-experiences",
  "parks-gardens",
  "point-of-interest",
  "scenic-spots",
  "spiritual-places",
]);

export function profileFromSlugs(slugs: string[]): ListingFieldProfile | null {
  const parts = slugs.map((s) => s.toLowerCase().trim()).filter(Boolean);
  const blob = parts.join(" ");
  if (/\bresto-?pubs?\b|\bresto-?bars?\b|\brestopubs?\b/.test(blob)) return "restopub";
  if (/\bbeaches?\b/.test(blob)) return "beach";
  if (/\bcafes?\b|\brestaurants?\b/.test(blob)) return "dining";
  if (parts.some((s) => ATTRACTION_SLUGS.has(s) || s === "attractions")) return "attraction";
  return null;
}

export function headingMatchesProfile(profile: ListingFieldProfile | null, title: string) {
  if (!profile) return true;
  const key = titleKey(title);
  return profileKeys(profile).some((meta) => aliasesFor(meta).some((alias) => titleKey(alias) === key));
}

export function filterListingGroups(profile: ListingFieldProfile | null, groups: ListingMetaGroup[]) {
  if (!profile) return groups;
  const keys = profileKeys(profile);
  const rank = (title: string) => {
    const key = titleKey(title);
    const byAlias = keys.findIndex((meta) => aliasesFor(meta).some((alias) => titleKey(alias) === key));
    if (byAlias >= 0) return byAlias;
    return keys.findIndex((meta) => keyLabel(meta).toLowerCase() === key);
  };
  return groups
    .filter((g) => headingMatchesProfile(profile, g.title))
    .map((g) => {
      const meta = keys.find((key) => aliasesFor(key).some((alias) => titleKey(alias) === titleKey(g.title)));
      return meta ? { ...g, title: keyLabel(meta) } : g;
    })
    .sort((a, b) => (rank(a.title) < 0 ? 99 : rank(a.title)) - (rank(b.title) < 0 ? 99 : rank(b.title)));
}
