import type { Category } from "@/lib/types";
import { facetSlug } from "@/lib/filters";
import { decodeEntities } from "@/lib/utils";

export const WP_PARENT_ARCHIVES: Array<{
  slug: string;
  category: Category;
  label: string;
}> = [
  { slug: "tourist-attractions", category: "places", label: "Places to visit" },
  { slug: "activities", category: "activities", label: "Things to do" },
  { slug: "food-beverage", category: "food", label: "Eat & drink" },
  { slug: "accommodation", category: "stay", label: "Stay" },
  { slug: "services", category: "services", label: "Services" },
];

/** Extra parents that still hold listings outside the four primary archives. */
export const WP_EXTRA_ARCHIVES: Array<{ slug: string; category: Category }> = [
  { slug: "rentals", category: "activities" },
];

const PARENT_TO_APP: Record<string, Category> = {
  "tourist-attractions": "places",
  activities: "activities",
  rentals: "activities",
  services: "services",
  events: "activities",
  "food-beverage": "food",
  accommodation: "stay",
};

const CHILD_TO_PARENT: Record<string, string> = {
  beaches: "tourist-attractions",
  "spiritual-places": "tourist-attractions",
  "point-of-interest": "tourist-attractions",
  museum: "tourist-attractions",
  "historical-site": "tourist-attractions",
  "monuments-and-statues": "tourist-attractions",
  "parks-gardens": "tourist-attractions",
  "art-galleries": "tourist-attractions",
  "archaeological-sites": "tourist-attractions",
  "backwaters-mangroves": "tourist-attractions",
  "caves-rock-formations": "tourist-attractions",
  "cemeteries-memorials": "tourist-attractions",
  "cultural-centres": "tourist-attractions",
  "heritage-sites": "tourist-attractions",
  "heritage-streets": "tourist-attractions",
  "lakes-water-bodies": "tourist-attractions",
  "libraries-literary-places": "tourist-attractions",
  lighthouses: "tourist-attractions",
  "markets-bazaars": "tourist-attractions",
  "nature-eco-spots": "tourist-attractions",
  "offbeat-experiences": "tourist-attractions",
  "scenic-spots": "tourist-attractions",
  temples: "tourist-attractions",
  churches: "tourist-attractions",
  ashrams: "tourist-attractions",
  "shopping-bazaars": "activities",
  "adventure-sports": "activities",
  photography: "activities",
  "classes-workshops": "activities",
  "nightlife-experiences": "activities",
  "art-craft-workshops": "activities",
  "bird-watching": "activities",
  "boat-rides": "activities",
  "cooking-classes": "activities",
  "cultural-experiences": "activities",
  cycling: "activities",
  "dance-music": "activities",
  "family-activities": "activities",
  fishing: "activities",
  "guided-tours": "activities",
  "horse-riding": "activities",
  kayaking: "activities",
  "kids-activities": "activities",
  "land-activities": "activities",
  "scuba-diving": "activities",
  "shopping-experiences": "activities",
  snorkelling: "activities",
  surfing: "activities",
  "tours-sightseeing": "activities",
  "trekking-hiking": "activities",
  "bike-rental": "rentals",
  "car-rental": "rentals",
  "resto-pubs": "food-beverage",
  cafes: "food-beverage",
  restaurants: "food-beverage",
  "resto-bars": "food-beverage",
  "mess-home-foods": "food-beverage",
  "food-cart": "food-beverage",
  pizzeria: "food-beverage",
  bakeries: "food-beverage",
  "cloud-kitchens": "food-beverage",
  "dessert-ice-cream": "food-beverage",
  lounges: "food-beverage",
  "street-food": "food-beverage",
  hotels: "accommodation",
  resort: "accommodation",
  "guest-house": "accommodation",
  hostels: "accommodation",
  homestay: "accommodation",
  "bed-breakfasts": "accommodation",
  "boutique-hotels": "accommodation",
  campsites: "accommodation",
  cottages: "accommodation",
  "farm-stays": "accommodation",
  "serviced-apartments": "accommodation",
  "saloon-spa": "services",
  "support-services": "services",
  "medical-services": "services",
  "emergency-services": "services",
  "legal-services": "services",
  "banks-atms": "services",
  clinics: "services",
  "currency-exchange": "services",
  "event-services": "services",
  hospitals: "services",
  "laundry-dry-cleaning": "services",
  "pet-services": "services",
  pharmacies: "services",
  "photography-services": "services",
  "repair-maintenance": "services",
  "taxi-cab-services": "services",
  "tour-operator": "services",
  "tourist-information-centres": "services",
  "tourist-support-services": "services",
  "transportation-services": "services",
  "travel-agencies": "services",
};

export const ARCHIVE_SLUGS = [
  ...WP_PARENT_ARCHIVES.map((row) => row.slug),
  ...WP_EXTRA_ARCHIVES.map((row) => row.slug),
  "hotels",
  "guest-house",
  "resort",
  "hostels",
  "homestay",
  "cafes",
  "restaurants",
  "resto-pubs",
  "resto-bars",
  "beaches",
  "spiritual-places",
  "saloon-spa",
  "bike-rental",
];

export const DEEP_ARCHIVE_SLUGS = new Set([
  ...WP_PARENT_ARCHIVES.map((row) => row.slug),
  ...WP_EXTRA_ARCHIVES.map((row) => row.slug),
]);

export function archiveCategory(slug: string): Category | undefined {
  const parent = CHILD_TO_PARENT[slug] ?? slug;
  return PARENT_TO_APP[parent] ?? PARENT_TO_APP[slug];
}

export function categoryFromKindName(kind: string): Category | undefined {
  const slug = facetSlug(decodeEntities(kind));
  if (!slug) return undefined;
  return archiveCategory(slug);
}
