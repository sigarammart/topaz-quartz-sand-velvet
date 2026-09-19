import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { guides as localGuides } from "@/data/guides";
import { listings as localListings } from "@/data/listings";
import type { Category, Guide, GuideSection, Listing, ListingFaq, ListingMetaGroup, ListingMetaItem, ListingStop, ListingTaxGroup, ListingTaxTerm } from "@/lib/types";
import { FILTER_TAX_KEYS } from "@/lib/filters";
import { parseOpenHoursHtml } from "@/lib/hours";
import { loadJetArchiveMeta, type JetArchiveHit } from "@/lib/jet-archive";
import { loadListeoGeo, type ListeoGeo } from "@/lib/listeo-geo";

export const WP_ORIGIN = "https://xplorepondy.com";
export const WP_APP_PASSWORD_URL = `${WP_ORIGIN}/wp-admin/authorize-application.php?app_name=Xplore%20Pondy%20App`;

export type WpUser = {
  id: number;
  name: string;
  slug: string;
  email: string;
  avatar: string;
  roles: string[];
};

export type WpTrip = {
  id?: number;
  slug: string;
  title: string;
  date: string;
  url: string;
};

type WpTerm = { id?: number; name: string; slug: string; parent?: number; taxonomy?: string; count?: number };
type WpMedia = {
  id?: number;
  source_url?: string;
  media_details?: { sizes?: Record<string, { source_url?: string }> };
};
type WpListingMeta = {
  cafe_type?: string[];
  dining_menu_images?: { id?: number; url?: string }[];
  accessibility?: Record<string, string>;
  _trip_single_multi_days?: string;
  _trip_group_size?: string;
  _trip_itinerary?: unknown;
  _trip_faqs?: unknown;
  _trip_pricing_table?: unknown;
};
type WpListing = {
  id: number;
  slug: string;
  link?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  listing_category?: number[];
  region?: number[];
  listing_feature?: number[];
  "pub-type"?: number[];
  "cuisine-type"?: number[];
  "restaurant-types"?: number[];
  "resto-bar-type"?: number[];
  "water-sport"?: number[];
  "land-adventures"?: number[];
  "sport-type"?: number[];
  "activity-type"?: number[];
  "property-type"?: number[];
  "property-category"?: number[];
  "by-theme"?: number[];
  "explore-type"?: number[];
  featured_media?: number;
  class_list?: string[];
  meta?: WpListingMeta;
  yoast_head_json?: { og_description?: string };
  _embedded?: {
    "wp:featuredmedia"?: WpMedia[];
    "wp:term"?: WpTerm[][];
  };
};
type WpGuide = {
  slug: string;
  date?: string;
  link?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  yoast_head_json?: { og_description?: string };
  _embedded?: {
    "wp:featuredmedia"?: WpMedia[];
    "wp:term"?: { name?: string; slug?: string; taxonomy?: string }[][];
  };
};
type WpMe = {
  id: number;
  name?: string;
  slug?: string;
  email?: string;
  roles?: string[];
  avatar_urls?: Record<string, string>;
};
type WpUserTrip = {
  id?: number;
  slug: string;
  link?: string;
  date?: string;
  title?: { rendered?: string };
};

const FALLBACK_IMAGE: Record<Category, string> = {
  places: "/images/french-quarter.jpg",
  activities: "/images/scuba.jpg",
  food: "/images/cafe.jpg",
  stay: "/images/hotel.jpg",
};

const PARENT_TO_CATEGORY: Record<string, Category> = {
  "tourist-attractions": "places",
  beaches: "places",
  "heritage-sites": "places",
  "heritage-streets": "places",
  "historical-site": "places",
  "spiritual-places": "places",
  temples: "places",
  churches: "places",
  ashrams: "places",
  events: "activities",
  activities: "activities",
  "adventure-sports": "activities",
  "water-activities": "activities",
  "boat-rides": "activities",
  cycling: "activities",
  "classes-workshops": "activities",
  "bike-rental": "activities",
  "car-rental": "activities",
  rentals: "activities",
  services: "activities",
  "food-beverage": "food",
  cafes: "food",
  restaurants: "food",
  pubs: "food",
  "resto-bars": "food",
  "resto-pubs": "food",
  "resto-bar-type": "food",
  bakeries: "food",
  accommodation: "stay",
  hotels: "stay",
  homestay: "stay",
  "guest-house": "stay",
  hostels: "stay",
  "boutique-hotels": "stay",
  resorts: "stay",
  resort: "stay",
};

const SKIP_KIND = new Set([
  "tourist-attractions",
  "food-beverage",
  "accommodation",
  "activities",
  "rentals",
  "services",
  "events",
]);

const TAX_LABELS: Record<string, string> = {
  listing_category: "Categories",
  listing_feature: "Features",
  region: "Region",
  "by-theme": "Theme",
  "activity-type": "Activity type",
  "cuisine-type": "Cuisine",
  "restaurant-types": "Restaurant type",
  "resto-bar-type": "Resto bar",
  "pub-type": "Pub type",
  "water-sport": "Water sports",
  "land-adventures": "Land adventures",
  "sport-type": "Sport",
  "explore-type": "Explore",
  "property-type": "Property type",
  "property-category": "Property",
  event_category: "Events",
  service_category: "Services",
  rental_category: "Rentals",
  trip_category: "Trip type",
  trip_theme: "Trip theme",
  trip_destination: "Destination",
  "trip-duration": "Trip duration",
  trip_highlight: "Highlights",
  trip_py_location: "Trip location",
  classifieds_category: "Classifieds",
  stories_category: "Stories",
};

const TAX_ORDER = Object.keys(TAX_LABELS);

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
  };
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
      if (body[0] === "#") {
        const n =
          body[1] === "x" || body[1] === "X"
            ? parseInt(body.slice(2), 16)
            : Number(body.slice(1));
        return Number.isFinite(n) ? String.fromCharCode(n) : match;
      }
      return named[body.toLowerCase()] ?? match;
    })
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function mediaUrl(media?: WpMedia) {
  const sizes = media?.media_details?.sizes ?? {};
  return (
    sizes["listeo-listing-grid"]?.source_url ||
    sizes.medium_large?.source_url ||
    sizes.large?.source_url ||
    sizes.medium?.source_url ||
    media?.source_url ||
    ""
  );
}

function categoryFromTerms(
  terms: { slug?: string; name?: string; parent?: number }[],
): { category: Category; kind: string; tags: string[] } {
  const slugs = terms.map((t) => t.slug ?? "");
  let category: Category = "places";
  const rank: Category[] = ["stay", "food", "activities", "places"];
  for (const c of rank) {
    if (slugs.some((s) => PARENT_TO_CATEGORY[s] === c)) {
      category = c;
      break;
    }
  }
  const kindTerm =
    terms.find((t) => t.slug && !SKIP_KIND.has(t.slug)) ?? terms[0];
  return {
    category,
    kind: kindTerm?.name ? decodeHtml(kindTerm.name) : "Listing",
    tags: terms.map((t) => decodeHtml(t.name ?? "")).filter(Boolean),
  };
}

function urlTail(url: string) {
  return url.split("/").filter(Boolean).pop() ?? "";
}

function findLocal(slug: string, link?: string): Listing | undefined {
  const linkTail = link ? urlTail(link) : "";
  return (
    localListings.find((l) => l.slug === slug) ||
    localListings.find((l) => urlTail(l.siteUrl) === slug) ||
    (linkTail ? localListings.find((l) => l.slug === linkTail || urlTail(l.siteUrl) === linkTail) : undefined)
  );
}

function truthyMeta(value: unknown) {
  if (value === true || value === 1) return true;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1" || value.toLowerCase() === "yes";
  return false;
}

function taxIds(raw: WpListing, key: string): number[] {
  const value = (raw as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.filter((id): id is number => typeof id === "number" && id > 0) : [];
}

function extractTaxonomies(
  raw: WpListing,
  maps?: Record<string, Map<number, WpTerm>>,
): ListingTaxGroup[] {
  const groups: ListingTaxGroup[] = [];
  const seen = new Set<string>();

  if (maps) {
    for (const key of Object.keys(TAX_LABELS)) {
      const map = maps[key];
      if (!map) continue;
      const terms: ListingTaxTerm[] = [];
      const used = new Set<string>();
      for (const id of taxIds(raw, key)) {
        const term = map.get(id);
        if (!term?.name && !term?.slug) continue;
        const slug = term.slug || String(id);
        if (used.has(slug)) continue;
        used.add(slug);
        terms.push({ name: decodeHtml(term.name || slug), slug });
      }
      if (!terms.length) continue;
      seen.add(key);
      groups.push({ key, label: TAX_LABELS[key] ?? key.replace(/[-_]/g, " "), terms });
    }
  }

  for (const group of raw._embedded?.["wp:term"] ?? []) {
    if (!group?.length) continue;
    const key = group[0]?.taxonomy ?? "";
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const terms: ListingTaxTerm[] = [];
    const used = new Set<string>();
    for (const term of group) {
      const slug = term.slug || "";
      const name = decodeHtml(term.name ?? "");
      if (!name || used.has(slug || name)) continue;
      used.add(slug || name);
      terms.push({ name, slug: slug || name.toLowerCase().replace(/\s+/g, "-") });
    }
    if (!terms.length) continue;
    groups.push({
      key,
      label: TAX_LABELS[key] ?? key.replace(/[-_]/g, " "),
      terms,
    });
  }

  groups.sort((a, b) => {
    const ia = TAX_ORDER.indexOf(a.key);
    const ib = TAX_ORDER.indexOf(b.key);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return groups;
}

function parseItinerary(raw: unknown): ListingStop[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const stops: ListingStop[] = [];
  const seen = new Set<string>();
  for (const item of Object.values(raw as Record<string, unknown>)) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = decodeHtml(String(row.title ?? row.name ?? "")).trim();
    if (!title) continue;
    const time = decodeHtml(String(row.time ?? "")).trim();
    const day = decodeHtml(String(row.day ?? "")).trim();
    const key = `${time}|${day}|${title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const description = decodeHtml(String(row.description ?? row.content ?? "")).trim();
    stops.push({
      time: time || undefined,
      day: day || undefined,
      title,
      description: description || undefined,
    });
  }
  return stops;
}

function parseFaqs(raw: unknown): ListingFaq[] {
  if (!raw || typeof raw !== "object") return [];
  const rows = Array.isArray(raw) ? raw : Object.values(raw as Record<string, unknown>);
  const faqs: ListingFaq[] = [];
  for (const item of rows) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const question = decodeHtml(String(row.question ?? row.q ?? row.title ?? "")).trim();
    const answer = decodeHtml(String(row.answer ?? row.a ?? row.description ?? "")).trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

function extractMenuImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "url" in item) return String((item as { url?: string }).url ?? "");
      return "";
    })
    .filter((url) => /^https?:\/\//.test(url));
}

function extractJsonLd(html: string) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const out: {
    phone?: string;
    address?: string;
    rating?: number;
    reviews?: number;
    priceRange?: string;
  } = {};
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1] ?? "") as Record<string, unknown>;
      const nodes = Array.isArray(data) ? data : data["@graph"] && Array.isArray(data["@graph"]) ? data["@graph"] : [data];
      for (const node of nodes as Record<string, unknown>[]) {
        const type = node["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (!types.some((t) => t === "LocalBusiness" || t === "Restaurant" || t === "Hotel" || t === "TouristAttraction" || t === "Place" || t === "Product")) {
          continue;
        }
        const phone = String(node.telephone ?? "").trim();
        if (phone) out.phone = phone;
        const addr = node.address;
        if (addr && typeof addr === "object") {
          const a = addr as Record<string, unknown>;
          const street = decodeHtml(String(a.streetAddress ?? "")).trim();
          const locality = decodeHtml(String(a.addressLocality ?? "")).trim();
          const region = decodeHtml(String(a.addressRegion ?? "")).trim();
          const postal = decodeHtml(String(a.postalCode ?? "")).trim();
          const parts = [street];
          for (const part of [locality, region, postal]) {
            if (part && !parts.some((p) => p.toLowerCase().includes(part.toLowerCase()))) parts.push(part);
          }
          if (parts.length) out.address = parts.join(", ");
        } else if (typeof addr === "string" && addr.trim()) {
          out.address = decodeHtml(addr.trim());
        }
        const rating = node.aggregateRating;
        if (rating && typeof rating === "object") {
          const r = rating as Record<string, unknown>;
          const value = Number(r.ratingValue);
          const count = Number(r.reviewCount);
          if (value > 0) out.rating = value;
          if (count > 0) out.reviews = count;
        }
        const priceRange = String(node.priceRange ?? "").trim();
        if (priceRange && !/^not available$/i.test(priceRange)) out.priceRange = priceRange;
      }
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  return out;
}

function parseCheckItem(raw: string): ListingMetaItem | null {
  const text = decodeHtml(raw).replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (/^[✅✔✓]/.test(text)) return { label: text.replace(/^[✅✔✓]\s*/, "").trim(), included: true };
  if (/^[❌✖✗]/.test(text)) return { label: text.replace(/^[❌✖✗]\s*/, "").trim(), included: false };
  return { label: text };
}

function extractJetMetaGroups(html: string): { groups: ListingMetaGroup[]; price?: string } {
  const groups: ListingMetaGroup[] = [];
  let price: string | undefined;
  const headingRe = /<h3 class="listing-field-heading">([\s\S]*?)<\/h3>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html))) {
    const title = decodeHtml(match[1]).replace(/\s+/g, " ").trim();
    if (!title || /nearby|related|popular locations/i.test(title)) continue;
    const priceMatch = title.match(/^price for two\s*:?\s*(.+)$/i);
    if (priceMatch) {
      price = priceMatch[1].trim();
      continue;
    }
    let after = html.slice(match.index + match[0].length, match.index + match[0].length + 7000);
    const nextHeading = after.search(/<h3 class="listing-field-heading">/i);
    if (nextHeading >= 0) after = after.slice(0, nextHeading);
    const items = [...after.matchAll(/jet-check-list__item-content">([\s\S]*?)<\/div>/g)]
      .map((row) => parseCheckItem(row[1] ?? ""))
      .filter((item): item is ListingMetaItem => !!item && item.label.length > 1 && item.label.length < 80);
    if (!items.length) continue;
    groups.push({ title, items });
  }
  const merged: ListingMetaGroup[] = [];
  for (const group of groups) {
    const existing = merged.find((g) => g.title.toLowerCase() === group.title.toLowerCase());
    if (!existing) {
      merged.push({ title: group.title, items: [...group.items] });
      continue;
    }
    const seen = new Set(existing.items.map((i) => i.label.toLowerCase()));
    for (const item of group.items) {
      if (!seen.has(item.label.toLowerCase())) existing.items.push(item);
    }
  }
  return { groups: merged, price };
}

function extractListingGeo(html: string): { lat?: number; lng?: number } {
  const mapBlock = html.match(/listeo-listing-map[\s\S]{0,2500}/i)?.[0] ?? html;
  const pair =
    mapBlock.match(/data-latitude="([\d.-]+)"[\s\S]{0,200}?data-longitude="([\d.-]+)"/i) ||
    html.match(/data-latitude="([\d.-]+)"[\s\S]{0,200}?data-longitude="([\d.-]+)"/i);
  if (!pair) return {};
  const lat = Number(pair[1]);
  const lng = Number(pair[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return {};
  return { lat, lng };
}

function extractGallery(html: string, featured?: string): string[] {
  const block = html.match(/listeo-listing-grid-gallery[\s\S]{0,12000}/i)?.[0] ?? "";
  const urls = [...block.matchAll(/src="(https:\/\/xplorepondy\.com\/wp-content\/uploads\/[^"]+)"/g)].map((m) => m[1]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    const clean = url.replace(/-\d+x\d+(?=\.[a-z]+$)/i, "");
    if (featured && (url === featured || clean === featured.replace(/-\d+x\d+(?=\.[a-z]+$)/i, ""))) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);
    out.push(url);
    if (out.length >= 12) break;
  }
  return out;
}

function enrichListingFromHtml(listing: Listing, html: string): Listing {
  const extra = extractJsonLd(html);
  const jet = extractJetMetaGroups(html);
  const geo = extractListingGeo(html);
  const gallery = extractGallery(html, listing.image);
  const hoursInfo = parseOpenHoursHtml(html);
  const telFromPage = html.match(/href="tel:([^"]+)"/i);
  const phoneFromPage = telFromPage ? decodeURIComponent(telFromPage[1]).replace(/%20/g, " ").trim() : "";
  return {
    ...listing,
    phone: extra.phone || phoneFromPage || listing.phone,
    address: extra.address || listing.address,
    rating: listing.rating || extra.rating || 0,
    reviews: listing.reviews || extra.reviews || 0,
    price: listing.price || jet.price || extra.priceRange,
    hours: hoursInfo.hours || listing.hours,
    openNow: hoursInfo.openNow ?? listing.openNow,
    weeklyHours: hoursInfo.weeklyHours.length ? hoursInfo.weeklyHours : listing.weeklyHours,
    location: listing.location === "Pondicherry" && extra.address ? extra.address : listing.location,
    lat: listing.lat ?? geo.lat,
    lng: listing.lng ?? geo.lng,
    metaGroups: jet.groups,
    gallery: gallery.length ? gallery : listing.gallery,
  };
}

function mapListing(
  raw: WpListing,
  extras?: {
    catMap?: Map<number, WpTerm>;
    regionMap?: Map<number, WpTerm>;
    mediaMap?: Map<number, string>;
    taxMaps?: Record<string, Map<number, WpTerm>>;
  },
): Listing {
  let terms: { slug?: string; name?: string; parent?: number }[] = [];
  if (extras?.catMap && raw.listing_category) {
    terms = raw.listing_category.map((id) => extras.catMap!.get(id)).filter((t): t is WpTerm => !!t);
  } else {
    terms = (raw._embedded?.["wp:term"] ?? [])
      .flat()
      .filter((t) => (t as { taxonomy?: string }).taxonomy === "listing_category" || !("taxonomy" in t));
  }
  const { category, kind, tags } = categoryFromTerms(terms);
  let region = "Pondicherry";
  if (extras?.regionMap && raw.region?.[0]) {
    region = extras.regionMap.get(raw.region[0])?.name ?? region;
  } else {
    const embeddedRegion = (raw._embedded?.["wp:term"] ?? [])
      .flat()
      .find((t) => (t as { taxonomy?: string }).taxonomy === "region");
    if (embeddedRegion?.name) region = decodeHtml(embeddedRegion.name);
  }
  const image =
    (raw.featured_media && extras?.mediaMap?.get(raw.featured_media)) ||
    mediaUrl(raw._embedded?.["wp:featuredmedia"]?.[0]) ||
    FALLBACK_IMAGE[category];
  const name = decodeHtml(raw.title?.rendered ?? raw.slug);
  const description = decodeHtml(
    raw.content?.rendered ||
      raw.yoast_head_json?.og_description ||
      raw.excerpt?.rendered ||
      "",
  ).slice(0, 900);
  const local = findLocal(raw.slug, raw.link);
  const meta = raw.meta ?? {};
  const cafeTypes = (meta.cafe_type ?? []).map((t) => decodeHtml(t)).filter(Boolean);
  const accessibility = Object.entries(meta.accessibility ?? {})
    .filter(([, v]) => truthyMeta(v))
    .map(([k]) => decodeHtml(k));
  const itinerary = parseItinerary(meta._trip_itinerary);
  const faqs = parseFaqs(meta._trip_faqs);
  const groupSize = decodeHtml(String(meta._trip_group_size ?? "")).trim();
  const tripDaysRaw = decodeHtml(String(meta._trip_single_multi_days ?? "")).trim();
  const tripDays = itinerary.length || groupSize ? tripDaysRaw : "";
  const taxonomies = extractTaxonomies(raw, extras?.taxMaps);
  const menuImages = extractMenuImages(meta.dining_menu_images);
  return {
    slug: raw.slug,
    name,
    category,
    kind,
    rating: local?.rating ?? 0,
    reviews: local?.reviews ?? 0,
    location: local?.location ?? region,
    area: local?.area ?? region,
    distance: local?.distance ?? "",
    hours: local?.hours ?? "",
    description: description || local?.description || "",
    tags: tags.length ? tags : (local?.tags ?? []),
    bestFor: local?.bestFor ?? [],
    image,
    siteUrl: raw.link ?? `${WP_ORIGIN}/listing/${raw.slug}/`,
    lat: local?.lat,
    lng: local?.lng,
    price: local?.price,
    mustTry: local?.mustTry,
    duration: local?.duration || tripDays,
    entry: local?.entry,
    featured: local?.featured,
    cafeTypes,
    accessibility,
    tripDays,
    groupSize,
    taxonomies,
    itinerary,
    faqs,
    menuImages,
  };
}

function mapUser(raw: WpMe): WpUser {
  const avatars = raw.avatar_urls ?? {};
  const avatar = avatars["96"] || avatars["48"] || Object.values(avatars)[0] || "";
  return {
    id: raw.id,
    name: raw.name || raw.slug || "WordPress user",
    slug: raw.slug || "",
    email: raw.email || "",
    avatar,
    roles: raw.roles ?? [],
  };
}

function parseGuideSections(html: string): GuideSection[] {
  const cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const chunks = cleaned.split(/<h[2-3][^>]*>/i);
  const sections: GuideSection[] = [];
  const intro = decodeHtml(chunks[0] ?? "");
  if (intro) sections.push({ body: intro.slice(0, 1600) });
  for (const chunk of chunks.slice(1)) {
    const close = chunk.search(/<\/h[2-3]>/i);
    const heading = decodeHtml(close >= 0 ? chunk.slice(0, close) : "");
    const body = decodeHtml(close >= 0 ? chunk.slice(close) : chunk).slice(0, 2200);
    if (heading || body) sections.push({ heading: heading || undefined, body });
  }
  if (sections.length === 0) {
    const body = decodeHtml(cleaned);
    if (body) sections.push({ body: body.slice(0, 2200) });
  }
  return sections.slice(0, 14);
}

function mapGuide(raw: WpGuide): Guide {
  const local = localGuides.find((g) => g.slug === raw.slug);
  const terms = (raw._embedded?.["wp:term"] ?? []).flat();
  const topicTerm =
    terms.find((t) => t.taxonomy === "guide-category") ||
    terms.find((t) => t.taxonomy === "guide-type");
  const html = raw.content?.rendered ?? "";
  const words = decodeHtml(html).split(/\s+/).filter(Boolean).length;
  const date = raw.date
    ? new Date(raw.date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : local?.date ?? "";
  const sections = parseGuideSections(html);
  return {
    slug: raw.slug,
    title: decodeHtml(raw.title?.rendered ?? raw.slug),
    excerpt: decodeHtml(raw.excerpt?.rendered || raw.yoast_head_json?.og_description || "").slice(0, 280),
    date,
    readTime: `${Math.max(1, Math.round(words / 200) || 6)} min`,
    image: mediaUrl(raw._embedded?.["wp:featuredmedia"]?.[0]) || local?.image || "/images/french-quarter.jpg",
    topic: topicTerm?.name ? decodeHtml(topicTerm.name) : local?.topic ?? "Guide",
    sections: sections.length ? sections : (local?.sections ?? [{ body: "" }]),
  };
}

function cookieHeader(setCookies: string[]) {
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

async function wpGet<T>(path: string, headers: HeadersInit = {}, timeout = 20000): Promise<{ headers: Headers; data: T; ok: boolean; status: number }> {
  const res = await fetch(`${WP_ORIGIN}${path}`, {
    headers: { Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(timeout),
  });
  let data = null as T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = [] as T;
  }
  return { headers: res.headers, data, ok: res.ok, status: res.status };
}

async function fetchMe(headers: HeadersInit) {
  const { data, ok } = await wpGet<WpMe>("/wp-json/wp/v2/users/me?context=edit", headers, 15000);
  if (!ok || !data?.id) return null;
  return data;
}

async function loadTerms(taxonomy: string) {
  const map = new Map<number, WpTerm>();
  for (let page = 1; page <= 3; page++) {
    const { data, ok, headers } = await wpGet<WpTerm[]>(
      `/wp-json/wp/v2/${taxonomy}?per_page=100&page=${page}&_fields=id,name,slug,parent,count`,
    );
    if (!ok || !Array.isArray(data) || data.length === 0) break;
    for (const t of data) if (t.id) map.set(t.id, t);
    const pages = Number(headers.get("X-WP-TotalPages") ?? "1");
    if (page >= pages) break;
  }
  return map;
}

async function loadMedia(ids: number[]) {
  const unique = [...new Set(ids.filter((id) => id > 0))];
  const map = new Map<number, string>();
  const chunks: number[][] = [];
  for (let i = 0; i < unique.length; i += 80) chunks.push(unique.slice(i, i + 80));
  const pages = await Promise.all(
    chunks.map((chunk) =>
      wpGet<WpMedia[]>(
        `/wp-json/wp/v2/media?include=${chunk.join(",")}&per_page=80&_fields=id,source_url,media_details`,
      ),
    ),
  );
  for (const { data, ok } of pages) {
    if (!ok || !Array.isArray(data)) continue;
    for (const m of data) {
      if (m.id) map.set(m.id, mediaUrl(m));
    }
  }
  return map;
}

async function loadListingPages() {
  const fields = [
    "id,slug,title,link,featured_media,listing_category,region,listing_feature,class_list,yoast_head_json",
    "pub-type,cuisine-type,restaurant-types,resto-bar-type,water-sport,land-adventures,sport-type",
    "activity-type,property-type,property-category,by-theme,explore-type",
  ].join(",");
  const first = await wpGet<WpListing[]>(
    `/wp-json/wp/v2/listing?per_page=100&page=1&_fields=${fields}`,
    {},
    12000,
  );
  if (!first.ok || !Array.isArray(first.data)) {
    throw new Error(`WordPress listings failed (${first.status})`);
  }
  const total = Number(first.headers.get("X-WP-Total") ?? first.data.length);
  const pages = Math.min(Number(first.headers.get("X-WP-TotalPages") ?? "1"), 8);
  const rest =
    pages > 1
      ? await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            wpGet<WpListing[]>(
              `/wp-json/wp/v2/listing?per_page=100&page=${i + 2}&_fields=${fields}`,
              {},
              12000,
            ).then((r) => (r.ok && Array.isArray(r.data) ? r.data : [])),
          ),
        )
      : [];
  return { rows: [first.data, ...rest].flat(), total };
}

function mergeLocal(listings: Listing[]) {
  const seen = new Set(listings.map((l) => l.slug));
  for (const l of listings) seen.add(urlTail(l.siteUrl));
  const extras: Listing[] = [];
  for (const extra of localListings) {
    if (seen.has(extra.slug) || seen.has(urlTail(extra.siteUrl))) continue;
    extras.push(extra);
  }
  return [...listings, ...extras];
}

let catalogCache: { at: number; listings: Listing[]; total: number; v: number } | null = null;
let guidesCache: { at: number; guides: Guide[] } | null = null;
const CATALOG_TTL = 5 * 60 * 1000;
const CATALOG_VERSION = 12;

const ARCHIVE_SLUGS = [
  "cafes",
  "restaurants",
  "resto-pubs",
  "resto-bars",
  "beaches",
  "hotels",
  "bike-rental",
  "adventure-sports",
  "guest-house",
  "saloon-spa",
];

async function loadCatalogFromWp(): Promise<{ listings: Listing[]; total: number }> {
  const listeoGeo = await loadListeoGeo().catch(() => new Map<string, ListeoGeo>());
  const rows: WpListing[] = [];
  const total = 0;
  const catMap = new Map<number, WpTerm>();
  const regionMap = new Map<number, WpTerm>();
  const extraMaps: Array<readonly [string, Map<number, WpTerm>]> = [];
  const jetMeta = new Map<string, JetArchiveHit>();
  const taxMaps: Record<string, Map<number, WpTerm>> = {
    listing_category: catMap,
    region: regionMap,
  };
  for (const [key, map] of extraMaps) taxMaps[key] = map;
  const mediaMap = new Map<number, string>();
  const mapped = rows.map((raw) => mapListing(raw, { catMap, regionMap, mediaMap, taxMaps }));
  const seen = new Set<string>();
  const listings: Listing[] = [];
  for (const item of mapped) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    const hit = jetMeta.get(item.slug) ?? jetMeta.get(urlTail(item.siteUrl));
    const geo = listeoGeo.get(item.slug) ?? listeoGeo.get(urlTail(item.siteUrl));
    listings.push({
      ...item,
      mustTry: item.mustTry?.length ? item.mustTry : hit?.mustTry,
      cafeTypes: item.cafeTypes?.length ? item.cafeTypes : hit?.cafeTypes,
      metaFacets: hit?.facets.length ? hit.facets : item.metaFacets,
      metaGroups: item.metaGroups?.length ? item.metaGroups : hit?.groups,
      lat: geo?.lat ?? hit?.lat ?? item.lat,
      lng: geo?.lng ?? hit?.lng ?? item.lng,
      hours: hit?.hours || item.hours,
      openNow: hit?.openNow ?? item.openNow,
      weeklyHours: hit?.weeklyHours?.length ? hit.weeklyHours : item.weeklyHours,
      rating: item.rating || geo?.rating || 0,
      reviews: item.reviews || geo?.reviews || 0,
      address: item.address || geo?.address,
      location: item.location === "Pondicherry" && geo?.address ? geo.address : item.location,
      area: item.area === "Pondicherry" && geo?.address ? geo.address : item.area,
    });
  }
  for (const geo of listeoGeo.values()) {
    if (seen.has(geo.slug)) continue;
    seen.add(geo.slug);
    const category = geo.category ?? "places";
    listings.push({
      slug: geo.slug,
      name: geo.name,
      category,
      kind: geo.kind ?? "Listing",
      rating: geo.rating ?? 0,
      reviews: geo.reviews ?? 0,
      location: geo.address ?? "Pondicherry",
      area: geo.address ?? "Pondicherry",
      distance: "",
      hours: "",
      description: "",
      tags: geo.kind ? [geo.kind] : [],
      bestFor: [],
      image: geo.image ?? FALLBACK_IMAGE[category],
      siteUrl: `${WP_ORIGIN}/listing/${geo.slug}/`,
      lat: geo.lat,
      lng: geo.lng,
      address: geo.address,
    });
  }
  const merged = mergeLocal(listings);
  return { listings: merged, total: Math.max(total, merged.length) };
}

async function loadGuidesFromWp(): Promise<Guide[]> {
  const { data, ok } = await wpGet<WpGuide[]>(
    "/wp-json/wp/v2/travel_guide?per_page=50&_embed=1",
    {},
    25000,
  );
  if (!ok || !Array.isArray(data) || data.length === 0) return localGuides;
  const mapped = data.map(mapGuide);
  const seen = new Set(mapped.map((g) => g.slug));
  const extras = localGuides.filter((g) => !seen.has(g.slug));
  return [...mapped, ...extras];
}

export const fetchWpCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (catalogCache && catalogCache.v === CATALOG_VERSION && now - catalogCache.at < CATALOG_TTL) {
    return { listings: catalogCache.listings, total: catalogCache.total };
  }
  try {
    const fresh = await loadCatalogFromWp();
    catalogCache = { at: now, v: CATALOG_VERSION, ...fresh };
    return fresh;
  } catch {
    return { listings: localListings, total: localListings.length };
  }
});

export const fetchWpGuides = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (guidesCache && now - guidesCache.at < CATALOG_TTL) return { guides: guidesCache.guides };
  const guides = await loadGuidesFromWp();
  guidesCache = { at: now, guides };
  return { guides };
});

export const fetchWpListing = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const res = await wpGet<WpListing[]>(
      `/wp-json/wp/v2/listing?slug=${encodeURIComponent(data.slug)}&_embed=1`,
      {},
      15000,
    );
    if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;
    const listing = mapListing(res.data[0]);
    try {
      const page = await fetch(listing.siteUrl, {
        headers: { Accept: "text/html", "User-Agent": "XplorePondyApp/1.0" },
        signal: AbortSignal.timeout(12000),
      });
      if (!page.ok) return listing;
      return enrichListingFromHtml(listing, await page.text());
    } catch {
      return listing;
    }
  });

export const fetchWpUserTrips = createServerFn({ method: "GET" }).handler(async () => {
  const res = await wpGet<WpUserTrip[]>(
    "/wp-json/wp/v2/user_trip?per_page=12&orderby=date&order=desc&_fields=id,slug,title,date,link",
    {},
    12000,
  );
  if (!res.ok || !Array.isArray(res.data)) return { trips: [] as WpTrip[] };
  return {
    trips: res.data.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: decodeHtml(t.title?.rendered ?? t.slug),
      date: t.date
        ? new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "",
      url: t.link ?? `${WP_ORIGIN}/user_trip/${t.slug}/`,
    })),
  };
});

export const fetchWpGuide = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const res = await wpGet<WpGuide[]>(
      `/wp-json/wp/v2/travel_guide?slug=${encodeURIComponent(data.slug)}&_embed=1`,
      {},
      15000,
    );
    if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;
    return mapGuide(res.data[0]);
  });

async function loadAuthorContent(authorId: number, headers: HeadersInit) {
  const [mine, trips] = await Promise.all([
    wpGet<WpListing[]>(
      `/wp-json/wp/v2/listing?author=${authorId}&per_page=30&_embed=1`,
      headers,
      15000,
    ),
    wpGet<WpUserTrip[]>(
      `/wp-json/wp/v2/user_trip?author=${authorId}&per_page=20`,
      headers,
      15000,
    ),
  ]);
  const myListings = mine.ok && Array.isArray(mine.data) ? mine.data.map((row) => mapListing(row)) : [];
  const myTrips: WpTrip[] =
    trips.ok && Array.isArray(trips.data)
      ? trips.data.map((t) => ({
          id: t.id,
          slug: t.slug,
          title: decodeHtml(t.title?.rendered ?? t.slug),
          date: t.date
            ? new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "",
          url: t.link ?? `${WP_ORIGIN}/user_trip/${t.slug}/`,
        }))
      : [];
  return { myListings, myTrips };
}

export const fetchWpAuthorContent = createServerFn({ method: "GET" })
  .validator(z.object({ authorId: z.number().int().positive() }))
  .handler(async ({ data }) => loadAuthorContent(data.authorId, {}));

export const wpLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const username = data.username.trim();
    const password = data.password.trim();
    const basic = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;

    let me = await fetchMe({ Authorization: basic });
    let method: "application-password" | "wordpress" = "application-password";
    let authHeaders: HeadersInit = { Authorization: basic };

    if (!me) {
      const form = new URLSearchParams({
        log: username,
        pwd: data.password,
        rememberme: "forever",
        "wp-submit": "Log In",
        redirect_to: `${WP_ORIGIN}/wp-admin/`,
        testcookie: "1",
      });
      const loginRes = await fetch(`${WP_ORIGIN}/wp-login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: "wordpress_test_cookie=WP%20Cookie%20check",
          Referer: `${WP_ORIGIN}/wp-login.php`,
        },
        body: form,
        redirect: "manual",
        signal: AbortSignal.timeout(20000),
      });
      const rawCookies =
        typeof loginRes.headers.getSetCookie === "function" ? loginRes.headers.getSetCookie() : [];
      const cookie = cookieHeader(rawCookies);
      const location = loginRes.headers.get("location") ?? "";
      const hasSession = cookie.includes("wordpress_logged_in");
      const toAdmin = /\/wp-admin\/?/i.test(location) && !/[?&]login=/i.test(location);
      if (!hasSession && !toAdmin) {
        return {
          ok: false as const,
          error:
            "WordPress rejected that username or password. Use your site username and an Application Password from Users → Profile.",
        };
      }
      authHeaders = { Cookie: cookie };
      me = await fetchMe(authHeaders);
      method = "wordpress";
    }

    if (!me) {
      return {
        ok: false as const,
        error: "Signed in, but WordPress did not return a profile. Try an Application Password.",
      };
    }

    const user = mapUser(me);
    const { myListings, myTrips } = await loadAuthorContent(user.id, authHeaders);
    return { ok: true as const, user, myListings, myTrips, method };
  });
