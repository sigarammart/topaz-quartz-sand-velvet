import type { Listing } from "@/lib/types";
import { ANNA_SALAI, haversineKm } from "@/lib/geo";

export const TRIP_LOCATIONS = [
  { slug: "pondicherry", label: "Pondicherry" },
  { slug: "auroville", label: "Auroville" },
] as const;

export const TRIP_BUDGETS = [
  { slug: "budget", label: "Budget" },
  { slug: "moderate", label: "Moderate" },
  { slug: "premium", label: "Premium" },
  { slug: "luxury", label: "Luxury" },
] as const;

export const TRIP_TYPES = [
  { slug: "Solo trip", label: "Solo trip" },
  { slug: "Couple trip", label: "Couple trip" },
  { slug: "Friends trip", label: "Friends trip" },
  { slug: "Family trip", label: "Family trip" },
] as const;

export const TRIP_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const TRIP_INTERESTS = [
  { slug: "activities", label: "Activities", keys: ["activit"] },
  { slug: "adventure-sports", label: "Adventure Sports", keys: ["adventure", "scuba", "sport", "dive", "kayak"] },
  { slug: "classes-workshops", label: "Classes & Workshops", keys: ["class", "workshop", "art"] },
  { slug: "shopping-bazaars", label: "Shopping & Bazaars", keys: ["shop", "bazaar", "market", "gift"] },
  { slug: "bars-nightlife", label: "Bars & Nightlife", keys: ["bar", "pub", "night", "club"] },
  { slug: "cafes", label: "Cafes", keys: ["cafe", "café", "coffee", "bakery"] },
  { slug: "restaurants", label: "Restaurants", keys: ["restaurant", "dining", "mess"] },
  { slug: "food-cart", label: "Food Cart", keys: ["food cart", "street food"] },
  { slug: "hotels-resorts", label: "Hotels & Resorts", keys: ["hotel", "resort", "stay", "guest"] },
  { slug: "events", label: "Events", keys: ["event", "festival"] },
  { slug: "tourist-attractions", label: "Tourist Attractions", keys: ["attraction", "tourist"] },
  { slug: "beaches", label: "Beaches", keys: ["beach"] },
  { slug: "historical-site", label: "Historical Site", keys: ["heritage", "historic", "fort"] },
  { slug: "monuments-and-statues", label: "Monuments & Statues", keys: ["monument", "statue", "memorial"] },
  { slug: "museum", label: "Museum", keys: ["museum"] },
  { slug: "offbeat-experiences", label: "Offbeat Experiences", keys: ["offbeat", "secret"] },
  { slug: "point-of-interest", label: "Point of Interest", keys: ["viewpoint", "point of interest"] },
  { slug: "spiritual-places", label: "Spiritual Places", keys: ["temple", "church", "ashram", "spiritual"] },
  { slug: "water-bodies", label: "Water Bodies", keys: ["lake", "backwater", "river"] },
] as const;

/** JetFormBuilder form 17098 on /trips/. */
export const JETFORM_CONDITIONALS = [
  { operator: "equal", field: "trips_dates", value: "dates_known", show: ["trip_start", "trip_end"] as const },
  { operator: "equal", field: "trips_dates", value: "dates_unknown", show: ["when_are_you_going", "trip_days"] as const },
] as const;

export const JETFORM_PAGES = [
  { key: "place", label: "Place", title: "Where do you want to go?" },
  { key: "date", label: "Date", title: "When are you planning for the trip?" },
  { key: "travelers", label: "Travelers", title: "What kind of trip are you planning?" },
  { key: "interests", label: "Interests", title: "Pick what you like in your trip" },
  { key: "last", label: "Last Page", title: "AI-powered itineraries, customized by you" },
] as const;

export function interestLabel(slug: string) {
  return TRIP_INTERESTS.find((i) => i.slug === slug)?.label ?? slug;
}

export function listingMatchesInterest(listing: Listing, slug: string) {
  const spec = TRIP_INTERESTS.find((i) => i.slug === slug);
  if (!spec) return false;
  const tax = (listing.taxonomies ?? []).flatMap((g) => g.terms.map((t) => `${t.slug} ${t.name}`)).join(" ");
  const hay = `${listing.kind} ${listing.category} ${listing.name} ${listing.tags.join(" ")} ${tax}`.toLowerCase();
  return spec.keys.some((key) => hay.includes(key));
}

export function buildTripTitle(input: {
  locations: string[];
  budget: string;
  tripType: string;
  days: number;
  interests: string[];
}) {
  const location = input.locations.map((s) => TRIP_LOCATIONS.find((l) => l.slug === s)?.label ?? s).join(", ");
  const budget = TRIP_BUDGETS.find((b) => b.slug === input.budget)?.label ?? input.budget;
  const interests = input.interests.slice(0, 3).map(interestLabel).join(", ");
  const parts = [location, budget, input.tripType];
  if (input.days) parts.push(`for ${input.days} days`);
  if (interests) parts.push(`with ${interests}`);
  return parts.filter(Boolean).join(" ") || "My Pondy trip";
}

export function newTripCode() {
  return String(10000 + Math.floor(Math.random() * 90000));
}

export function travelLeg(
  a?: { lat?: number; lng?: number },
  b?: { lat?: number; lng?: number },
) {
  if (a?.lat == null || a.lng == null || b?.lat == null || b.lng == null) return null;
  const km = haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
  const minutes = Math.max(4, Math.round(km / 0.32));
  return { km, minutes };
}

export function orderByNearest(listings: Listing[], start = ANNA_SALAI) {
  const leftover = listings.filter((l) => l.lat != null && l.lng != null);
  const rest = listings.filter((l) => l.lat == null || l.lng == null);
  const ordered: Listing[] = [];
  let cursor = start;
  while (leftover.length) {
    leftover.sort(
      (a, b) =>
        haversineKm(cursor, { lat: a.lat!, lng: a.lng! }) - haversineKm(cursor, { lat: b.lat!, lng: b.lng! }),
    );
    const next = leftover.shift()!;
    ordered.push(next);
    cursor = { lat: next.lat!, lng: next.lng! };
  }
  return [...ordered, ...rest];
}

export function formatTripDates(start: string, end: string) {
  if (!start) return "";
  const a = new Date(`${start}T00:00:00`);
  const b = end ? new Date(`${end}T00:00:00`) : a;
  if (Number.isNaN(a.getTime())) return start;
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const day = new Intl.DateTimeFormat("en-IN", { day: "numeric" });
  const month = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
  if (!end || start === end) return `${day.format(a)} ${month.format(a)}`;
  if (sameMonth) return `${day.format(a)} – ${day.format(b)} ${month.format(a)}`;
  return `${day.format(a)} ${a.toLocaleString("en-IN", { month: "short" })} – ${day.format(b)} ${month.format(b)}`;
}

export function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function seedFromWpTitle(title: string) {
  const lower = title.toLowerCase();
  const locations = TRIP_LOCATIONS.filter((l) => lower.includes(l.label.toLowerCase())).map((l) => l.slug);
  const budget = TRIP_BUDGETS.find((b) => lower.includes(b.label.toLowerCase()))?.slug ?? "budget";
  const tripType = TRIP_TYPES.find((t) => lower.includes(t.slug.toLowerCase()))?.slug ?? "Solo trip";
  const days = Number(title.match(/for (\d+) days?/i)?.[1] ?? 2);
  const interests = TRIP_INTERESTS.filter((i) => lower.includes(i.label.toLowerCase())).map((i) => i.slug);
  return {
    locations: locations.length ? locations : ["pondicherry"],
    budget,
    tripType,
    days: Math.min(7, Math.max(1, days || 2)),
    interests,
  };
}

export function jetformPageComplete(
  page: number,
  draft: {
    fromPlace: string;
    locations: string[];
    datesKnown: boolean;
    start: string;
    end: string;
    months: string[];
    days: number;
    tripType: string;
    interests: string[];
  },
) {
  if (page === 0) return draft.fromPlace.trim().length > 0 && draft.locations.length > 0;
  if (page === 1) {
    if (draft.datesKnown) return Boolean(draft.start && draft.end && draft.end >= draft.start);
    return draft.months.length > 0 && draft.days >= 1 && draft.days <= 7;
  }
  if (page === 2) return Boolean(draft.tripType);
  if (page === 3) return draft.interests.length > 0;
  if (page === 4) return true;
  return true;
}

export function todayISO() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
