import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { guides as localGuides } from "@/data/guides";
import { listings as localListings } from "@/data/listings";
import type { Category, Guide, GuideBlock, GuideSection, Listing, ListingFaq, ListingMetaGroup, ListingMetaItem, ListingStop, ListingTaxGroup, ListingTaxTerm } from "@/lib/types";
import { parseOpenHoursHtml } from "@/lib/hours";
import { bookmarkIdsFromUserMeta } from "@/lib/jet-store";
import { ARCHIVE_SLUGS, categoryFromKindName } from "@/lib/listing-categories";
import { loadJetArchiveMeta, loadOpenNowSnapshot, type JetArchiveHit } from "@/lib/jet-archive";
import { contactFromListeoMeta, preferListeoAddress } from "@/lib/listeo";
import { cachedOriginText } from "@/lib/origin-cache";
import { loadListeoGeo, type ListeoGeo } from "@/lib/listeo-geo";
import { filterListingGroups, headingMatchesProfile, profileFromSlugs, profileKeys, type ListingFieldProfile } from "@/lib/listing-layouts";
import { extractOgImage, pickListingImage, uncropImage, uniqueImages } from "@/lib/media";

export const WP_ORIGIN = "https://xplorepondy.com";
export const WP_APP_PASSWORD_URL = `${WP_ORIGIN}/wp-admin/authorize-application.php?app_name=Xplore%20Pondy%20App`;
const WP_HTML_HEADERS = {
  Accept: "text/html",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

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
  data?: Omit<WpTripSaveInput, "email">;
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
  _phone?: string;
  _email?: string;
  _website?: string;
  _address?: string;
  _friendly_address?: string;
  _featured?: string | number | boolean;
  "listing-package"?: string | number;
  _geolocation_lat?: string;
  _geolocation_long?: string;
  google_place_id?: string;
  googlePlaceId?: string;
  _google_place_id?: string;
  _googlePlaceId?: string;
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
  meta?: Record<string, unknown>;
};
type WpUserTrip = {
  id?: number;
  slug: string;
  link?: string;
  date?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
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
    name?: string;
    phone?: string;
    website?: string;
    address?: string;
    rating?: number;
    reviews?: number;
    priceRange?: string;
    description?: string;
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
        const nodeName = decodeHtml(String(node.name ?? "")).trim();
        if (nodeName) out.name = nodeName;
        const nodeUrl = String(node.url ?? "").trim();
        if (/^https?:\/\//i.test(nodeUrl) && !/xplorepondy\.com/i.test(nodeUrl)) out.website = nodeUrl;
        const nodeDesc = decodeHtml(String(node.description ?? "")).replace(/\[&hellip;\]|&hellip;|…/g, "").trim();
        if (nodeDesc.length > (out.description?.length ?? 0)) out.description = nodeDesc;
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
  const text = decodeHtml(raw)
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  if (/^[✅✔✓]/.test(text)) return { label: text.replace(/^[✅✔✓]\s*/, "").trim(), included: true };
  if (/^[❌✖✗]/.test(text)) return { label: text.replace(/^[❌✖✗]\s*/, "").trim(), included: false };
  if (text.length < 2 || text.length > 180) return null;
  if (/^https?:\/\//i.test(text)) return null;
  return { label: text };
}

function extractCheckItems(html: string): ListingMetaItem[] {
  const cleaned = html.replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  const seen = new Set<string>();
  const items: ListingMetaItem[] = [];
  for (const row of cleaned.matchAll(/jet-check-list__item-content[^>]*>([\s\S]*?)<\/div>/gi)) {
    const item = parseCheckItem(row[1] ?? "");
    if (!item) continue;
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }
  return items;
}

function clipContactSection(html: string) {
  const cut = html.search(/Claim this listing|Popular Cafes|Popular Restopubs|jet-listing-grid|Nothing found/i);
  return cut >= 0 ? html.slice(0, cut) : html;
}

function clipListingSection(html: string) {
  const cut = html.search(
    /CONTACT\s*\/\s*ADDRESS|Claim this listing|Popular Cafes|Popular Restopubs|jet-listing-grid|Invalid post IDs|Nothing found|Login \/ Register/i,
  );
  return cut >= 0 ? html.slice(0, cut) : html;
}

function isJunkListingText(text: string) {
  return /Invalid post IDs|Search Results|See all results|Claim this listing|Login \/ Register|Continue with Google|<div clas/i.test(
    text,
  );
}

function extractJetMetaGroups(html: string, profile: ListingFieldProfile | null = null): { groups: ListingMetaGroup[]; price?: string } {
  const groups: ListingMetaGroup[] = [];
  let price: string | undefined;
  const headingRe = /<h[2-4][^>]*class="[^"]*listing-field-heading[^"]*"[^>]*>([\s\S]*?)<\/h[2-4]>/gi;
  const matches = [...html.matchAll(headingRe)];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const title = decodeHtml(match[1] ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (!title || /nearby|related|popular |contact\s*\/\s*address|sponsored|share this|review/i.test(title)) continue;
    if (profile && !/price for two/i.test(title) && !headingMatchesProfile(profile, title)) continue;
    const priceMatch = title.match(/^price for two\s*:?\s*(.+)$/i);
    if (priceMatch) {
      price = priceMatch[1].trim();
      continue;
    }
    const start = (match.index ?? 0) + match[0].length;
    const nextAt = i + 1 < matches.length ? (matches[i + 1].index ?? start) : start + 12000;
    const after = clipListingSection(html.slice(start, Math.min(nextAt, start + 12000)));
    const items = extractCheckItems(after);
    if (items.length) {
      groups.push({ title, items });
      continue;
    }
    const checks = [...after.matchAll(/[✅✔]\s*([^✅✔<\n]{2,80})/g)]
      .map((row) => parseCheckItem(`✅ ${row[1] ?? ""}`))
      .filter((item): item is ListingMetaItem => !!item);
    if (checks.length) {
      groups.push({ title, items: checks });
      continue;
    }
    const text = htmlToRichText(after.replace(/<svg[\s\S]*?<\/svg>/gi, " "))
      .replace(/\*\*/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, 1200);
    if (text.length > 8 && !isJunkListingText(text)) groups.push({ title, items: [], text });
  }
  const merged: ListingMetaGroup[] = [];
  for (const group of groups) {
    const existing = merged.find((g) => g.title.toLowerCase() === group.title.toLowerCase());
    if (!existing) {
      merged.push({ title: group.title, items: [...group.items], text: group.text });
      continue;
    }
    const seen = new Set(existing.items.map((i) => i.label.toLowerCase()));
    for (const item of group.items) {
      if (!seen.has(item.label.toLowerCase())) existing.items.push(item);
    }
    if (!existing.text && group.text) existing.text = group.text;
  }
  return { groups: merged, price };
}

function extractLabeledFacts(html: string): { fields: { label: string; value: string }[]; duration?: string } {
  const fields: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  for (const row of html.matchAll(
    /<div class="heading-(?:break|sameline)">([\s\S]*?)<\/div>([\s\S]*?)<\/div>/gi,
  )) {
    const label = decodeHtml(row[1] ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/[:\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const value = htmlToRichText(row[2] ?? "")
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!label || value.length < 1 || value.length > 400) continue;
    if (/nearby|popular|share this|contact|get directions/i.test(label)) continue;
    if (isJunkListingText(value)) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    fields.push({ label, value });
  }
  for (const row of html.matchAll(
    /<span class="field-values">([\s\S]*?)<\/span>\s*([\s\S]*?)<\/span>/gi,
  )) {
    const label = decodeHtml(row[1] ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/[:\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const value = decodeHtml(row[2] ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!label || value.length < 1 || value.length > 1600) continue;
    if (/nearby|popular|share this|contact|get directions/i.test(label)) continue;
    if (isJunkListingText(value)) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    fields.push({ label, value });
  }
  const duration = fields.find((f) => /^duration$/i.test(f.label))?.value;
  return { fields, duration };
}

function extractListingOverview(html: string, _name?: string): string {
  const inner =
    html.match(
      /id="overview"[^>]*>[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>\s*<\/div>/i,
    )?.[1] ||
    html.match(
      /elementor-widget-theme-post-content[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>/i,
    )?.[1] ||
    "";
  if (!inner) return "";
  const text = htmlToRichText(inner.replace(/<svg[\s\S]*?<\/svg>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " "))
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 8000);
  return isJunkListingText(text) ? "" : text;
}

function extractListingGeo(html: string): { lat?: number; lng?: number } {
  const mapBlock = html.match(/listeo-listing-map[\s\S]{0,2500}/i)?.[0] ?? html;
  const pair =
    mapBlock.match(/data-latitude="([\d.-]+)"[\s\S]{0,200}?data-longitude="([\d.-]+)"/i) ||
    html.match(/data-latitude="([\d.-]+)"[\s\S]{0,200}?data-longitude="([\d.-]+)"/i) ||
    html.match(/destination=([\d.-]+),([\d.-]+)/i);
  if (!pair) return {};
  const lat = Number(pair[1]);
  const lng = Number(pair[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return {};
  return { lat, lng };
}

function extractListeoContact(html: string): { website?: string; phone?: string; address?: string; lat?: number; lng?: number } {
  const start = html.search(/CONTACT\s*\/\s*ADDRESS/i);
  const block = start >= 0 ? clipContactSection(html.slice(start, start + 12000)) : html;
  const website = [...block.matchAll(/href="(https?:\/\/[^"]+)"/gi)]
    .map((m) => decodeHtml(m[1] ?? "").replace(/&#038;/g, "&").trim())
    .find(
      (url) =>
        /^https?:\/\//i.test(url) &&
        !/xplorepondy\.com|google\.(com|co)|maps\.app\.goo|facebook\.com|instagram\.com|wa\.me/i.test(url),
    );
  const tel = block.match(/href="tel:([^"]+)"/i);
  const phone = tel ? decodeURIComponent(tel[1]).replace(/%20/g, " ").trim() : undefined;
  const descriptions = [...block.matchAll(/elementor-icon-box-description[^>]*>([\s\S]*?)<\/p>/gi)].map((row) =>
    decodeHtml(row[1] ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  const listingAddr = decodeHtml(block.match(/<p[^>]*listing-address[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const address = preferListeoAddress(...descriptions, listingAddr);
  const geo = extractListingGeo(block);
  return {
    website,
    phone: phone || undefined,
    address,
    lat: geo.lat,
    lng: geo.lng,
  };
}

function extractGallery(html: string, featured?: string): string[] {
  const blocks = [
    html.match(/listeo-listing-grid-gallery[\s\S]{0,16000}/i)?.[0] ?? "",
    html.match(/listing-slider[\s\S]{0,16000}/i)?.[0] ?? "",
    html.match(/mfp-gallery[\s\S]{0,16000}/i)?.[0] ?? "",
    html.match(/wp-block-gallery[\s\S]{0,12000}/i)?.[0] ?? "",
    html.match(/elementor-widget-image-gallery[\s\S]{0,16000}/i)?.[0] ?? "",
  ];
  const urls = blocks.flatMap((block) =>
    [...block.matchAll(/(?:src|data-src|href)="(https:\/\/xplorepondy\.com\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi)].map(
      (m) => m[1],
    ),
  );
  const featuredClean = featured ? uncropImage(featured) : "";
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    const clean = uncropImage(url);
    if (featuredClean && clean === featuredClean) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= 16) break;
  }
  return out;
}

function enrichListingFromHtml(listing: Listing, html: string): Listing {
  const extra = extractJsonLd(html);
  const htmlGooglePlaceId = extractGooglePlaceIdFromHtml(html);
  const contact = extractListeoContact(html);
  const facts = extractLabeledFacts(html);
  const geo = extractListingGeo(html);
  const og = extractOgImage(html);
  const gallery = uniqueImages(extractGallery(html, og || listing.image), listing.gallery);
  const hoursInfo = parseOpenHoursHtml(html);
  const overview = extractListingOverview(html, listing.name);
  const categorySlugs = [
    ...new Set([
      ...(listing.categorySlugs ?? []),
      ...[...html.matchAll(/listing_category-([a-z0-9-]+)/gi)].map((m) => m[1].toLowerCase()),
    ]),
  ];
  const profile = profileFromSlugs(categorySlugs);
  const jet = extractJetMetaGroups(html, profile);
  const groups = [...(listing.metaGroups ?? [])];
  for (const group of jet.groups) {
    const existing = groups.find((item) => item.title.toLowerCase() === group.title.toLowerCase());
    if (!existing) {
      groups.push(group);
      continue;
    }
    const seen = new Set(existing.items.map((item) => item.label.toLowerCase().replace(/[^a-z0-9]+/g, "")));
    for (const item of group.items) {
      const normalized = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "");
      if (normalized && !seen.has(normalized)) {
        existing.items.push(item);
        seen.add(normalized);
      }
    }
    if (!existing.text && group.text) existing.text = group.text;
  }
  if (!profile && facts.fields.length && !groups.some((g) => /^features$/i.test(g.title))) {
    groups.unshift({
      title: "Features",
      items: facts.fields.map((f) => ({ label: `${f.label}: ${f.value}` })),
    });
  }
  if (profile) {
    for (const fact of facts.fields) {
      if (!headingMatchesProfile(profile, fact.label)) continue;
      if (groups.some((g) => g.title.toLowerCase() === fact.label.toLowerCase())) continue;
      groups.push({ title: fact.label, items: [], text: fact.value });
    }
  }
  const price = listing.price || jet.price || extra.priceRange;
  if (profile && profileKeys(profile).includes("price_for_two") && price && !groups.some((g) => /price for two/i.test(g.title))) {
    groups.push({ title: "Price for two", items: [], text: price });
  }
  const ordered = filterListingGroups(profile, groups);
  const cafeFromGroups = ordered.find((g) => /cafe type/i.test(g.title));
  const liveDesc =
    (overview && !isJunkListingText(overview) ? overview : "") ||
    (extra.description && !isJunkListingText(extra.description) ? extra.description : "");
  return {
    ...listing,
    name: extra.name || listing.name,
    phone: contact.phone || extra.phone || listing.phone,
    website: contact.website || extra.website || listing.website,
    address: preferListeoAddress(contact.address, listing.address, extra.address),
    googlePlaceId: listing.googlePlaceId || htmlGooglePlaceId,
    rating: extra.rating || listing.rating || 0,
    reviews: extra.reviews || listing.reviews || 0,
    // Keep the card address tied to Listeo's explicit _friendly_address field.
    // Do not substitute the raw _address/contact address here.
    friendlyAddress: listing.friendlyAddress || undefined,
    price,
    hours: hoursInfo.hours || listing.hours,
    openNow: hoursInfo.openNow ?? listing.openNow,
    weeklyHours: hoursInfo.weeklyHours.length ? hoursInfo.weeklyHours : listing.weeklyHours,
    location: listing.location === "Pondicherry" && extra.address ? extra.address : listing.location,
    lat: listing.lat ?? contact.lat ?? geo.lat,
    lng: listing.lng ?? contact.lng ?? geo.lng,
    duration: facts.duration || listing.duration,
    description: liveDesc.length > (listing.description?.length ?? 0) ? liveDesc : liveDesc || listing.description,
    cafeTypes: listing.cafeTypes?.length ? listing.cafeTypes : cafeFromGroups?.items.map((i) => i.label),
    categorySlugs,
    metaGroups: ordered.length ? ordered : profile ? [] : listing.metaGroups,
    gallery: gallery.length ? gallery : listing.gallery,
    image: pickListingImage(og, listing.image, gallery[0]) || listing.image,
  };
}

function extractGooglePlaceId(meta: Record<string, unknown>): string | undefined {
  for (const [key, value] of Object.entries(meta)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalized.includes("google") && !normalized.includes("placeid")) continue;
    const candidate = String(value ?? "").trim();
    if (/^ChIJ[A-Za-z0-9_-]+$/.test(candidate)) return candidate;
  }
  return undefined;
}

function extractGooglePlaceIdFromHtml(html: string): string | undefined {
  const patterns = [
    /(?:place[_-]?id|placeId|query[_-]?place[_-]?id)["'=:\s]+["']?(ChIJ[A-Za-z0-9_-]{10,})/i,
    /(?:google\\.com\/maps[^"'\s]*?(?:place_id|query_place_id)=)(ChIJ[A-Za-z0-9_-]{10,})/i,
    /\b(ChIJ[A-Za-z0-9_-]{10,})\b/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

function metaValueItems(value: unknown): ListingMetaItem[] {
  const items: ListingMetaItem[] = [];
  const add = (value: unknown, included = true) => {
    if (value == null || value === false || value === "") return;
    const label = decodeHtml(String(value)).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    if (!label || /^(false|true|0|1|no|yes|none|null|undefined)$/i.test(label)) return;
    const normalized = label.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!normalized || items.some((item) => item.label.toLowerCase().replace(/[^a-z0-9]+/g, "") === normalized)) return;
    items.push({ label, included });
  };

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "object" && entry !== null) {
        for (const [key, entryValue] of Object.entries(entry as Record<string, unknown>)) {
          if (entryValue === true || entryValue === 1 || entryValue === "1" || entryValue === "yes" || entryValue === "true") {
            add(keyLabelFromMeta(key));
          } else if (typeof entryValue === "string" && entryValue.trim()) {
            add(entryValue);
          }
        }
      } else {
        add(entry);
      }
    }
    return items;
  }

  if (typeof value === "object") {
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (entryValue === true || entryValue === 1 || entryValue === "1" || entryValue === "yes" || entryValue === "true") {
        add(keyLabelFromMeta(key));
      } else if (typeof entryValue === "string" && entryValue.trim()) {
        add(entryValue);
      }
    }
    return items;
  }

  if (typeof value === "string") {
    for (const entry of value.split(/[,|\\n]+/)) add(entry);
  } else {
    add(value);
  }
  return items;
}

function keyLabelFromMeta(key: string) {
  return key
    .replace(/^_/, "")
    .replace(/_amp_/g, " & ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractProfileMetaGroups(
  meta: WpListingMeta,
  profile: ListingFieldProfile | null,
): ListingMetaGroup[] {
  if (!profile) return [];
  const groups: ListingMetaGroup[] = [];
  for (const key of profileKeys(profile)) {
    if (key === "_editor_note") continue;
    const value = (meta as Record<string, unknown>)[key];
    const items = metaValueItems(value);
    if (!items.length) continue;
    groups.push({ title: keyLabelFromMeta(key), items });
  }
  return groups;
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
  if (!terms.length) {
    const classSlugs = (raw.class_list ?? [])
      .filter((value) => value.startsWith("listing_category-"))
      .map((value) => value.slice("listing_category-".length))
      .filter(Boolean);
    terms = classSlugs.map((slug) => ({ slug, name: slug.replace(/-/g, " ") }));
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
  const googlePlaceId = extractGooglePlaceId(meta as Record<string, unknown>);
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
  const classCategorySlugs = (raw.class_list ?? [])
    .filter((value) => value.startsWith("listing_category-"))
    .map((value) => value.slice("listing_category-".length))
    .filter(Boolean);
  if (classCategorySlugs.length) {
    const existing = taxonomies.find((group) => group.key === "listing_category");
    const seen = new Set(existing?.terms.map((term) => term.slug) ?? []);
    const classTerms = classCategorySlugs
      .filter((slug) => !seen.has(slug))
      .map((slug) => ({
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        slug,
      }));
    if (classTerms.length) {
      if (existing) existing.terms.push(...classTerms);
      else taxonomies.unshift({ key: "listing_category", label: TAX_LABELS.listing_category, terms: classTerms });
    }
  }
  const profile = profileFromSlugs([
    ...classCategorySlugs,
    ...taxonomies.flatMap((group) => group.terms.map((term) => term.slug)),
    kind,
  ]);
  const rawMetaGroups = extractProfileMetaGroups(meta, profile);

  const menuImages = extractMenuImages(meta.dining_menu_images);
  const listeo = contactFromListeoMeta(meta as Record<string, unknown>);
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
    wpId: raw.id,
    lat: listeo.lat ?? local?.lat,
    lng: listeo.lng ?? local?.lng,
    price: local?.price,
    mustTry: local?.mustTry,
    duration: local?.duration || tripDays,
    entry: local?.entry,
    featured: undefined,
    phone: listeo.phone,
    website: listeo.website,
    address: listeo.address,
    googlePlaceId,
    friendlyAddress: decodeHtml(String(meta._friendly_address ?? "")).trim() || undefined,
    cafeTypes,
    accessibility,
    tripDays,
    groupSize,
    taxonomies,
    metaGroups: rawMetaGroups.length ? rawMetaGroups : undefined,
    categorySlugs: (raw.class_list ?? [])
      .filter((c) => c.startsWith("listing_category-"))
      .map((c) => c.slice("listing_category-".length)),
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

function imageSrcFromTag(tag: string) {
  const srcset = tag.match(/\ssrcset="([^"]+)"/i)?.[1] ?? "";
  let best = "";
  let bestW = 0;
  for (const part of srcset.split(",")) {
    const piece = part.trim().match(/(\S+)\s+(\d+)w/);
    if (piece && Number(piece[2]) >= bestW) {
      bestW = Number(piece[2]);
      best = piece[1];
    }
  }
  const src =
    best ||
    tag.match(/\s(?:src|data-src|data-lazy-src|data-full-url)="([^"]+)"/i)?.[1] ||
    "";
  return uncropImage(src);
}

function imageBlocks(html: string): GuideBlock[] {
  const seen = new Set<string>();
  const blocks: GuideBlock[] = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = imageSrcFromTag(match[0]);
    if (!src || seen.has(src) || /svg|gravatar|emoji|spinner|logo|icon|avatar/i.test(src)) continue;
    if (!/^https?:\/\//i.test(src)) continue;
    seen.add(src);
    const alt = match[0].match(/\salt="([^"]*)"/i)?.[1] ?? "";
    blocks.push({ type: "img", src, alt: decodeHtml(alt) });
  }
  return blocks;
}

function mergeGuideBlocks(blocks: GuideBlock[]) {
  const seenImg = new Set<string>();
  const out: GuideBlock[] = [];
  for (const block of blocks) {
    if (block.type === "img") {
      if (seenImg.has(block.src)) continue;
      seenImg.add(block.src);
    }
    out.push(block);
  }
  return out;
}

function htmlToRichText(html: string) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
      .replace(/<(strong|b)[^>]*>/gi, "**")
      .replace(/<\/(strong|b)>/gi, "**")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\*\*\s+\*\*/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function cellText(html: string) {
  return htmlToRichText(html).replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function listItems(html: string) {
  return [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => htmlToRichText(m[1] ?? ""))
    .filter((item) => item.length > 1);
}

function parseTable(html: string): GuideBlock | null {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => cellText(c[1] ?? "")),
  );
  const filled = rows.filter((r) => r.some(Boolean));
  if (filled.length < 2) return null;
  const headers = filled[0];
  const body = filled.slice(1).filter((r) => r.some((c) => c && !headers.includes(c)));
  if (!body.length) return null;
  return { type: "table", headers, rows: body };
}

const SKIP_GUIDE_HEADING =
  /^(login|register|sign in|travel guide|recent guide|table of contents|view all guides|xplore pondy|discover puducherry|get the latest|need help|related|share|comments?)$/i;

const TIP_LABEL =
  /^(shopping tip|travel tip|surf tip|tip|best for|what to look for|suggested walking route|best things to shop for|popular purchases|who can learn\??|best time|what to bring|good to know)$/i;

const CALLOUT_LABEL = /^(xplore pondy verdict|verdict|editor.?s note|note)$/i;

function extractGuideArticleHtml(html: string) {
  let article = html;
  const start = html.search(/data-widget_type="theme-post-content\.default"/i);
  if (start >= 0) {
    const slice = html.slice(start);
    const inner = slice.match(/<div class="elementor-widget-container">([\s\S]*)/i);
    if (inner?.[1] && inner[1].length > 400) article = inner[1];
  } else {
    const entry = html.match(
      /<div[^>]+class="[^"]*(?:elementor-widget-theme-post-content|entry-content|post-content)[^"]*"[\s\S]{0,200}?>([\s\S]*)$/i,
    )?.[1];
    if (entry && entry.length > 400) article = entry;
  }
  const cut = article.search(/<h[1-4][^>]*>[\s\S]{0,80}Recent Guide Articles/i);
  return cut > 200 ? article.slice(0, cut) : article;
}

function parseGuideBlocks(html: string): GuideBlock[] {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const pulledTables: GuideBlock[] = [];
  const withTables = cleaned.replace(/<table\b[\s\S]*?<\/table>/gi, (tableHtml) => {
    const parsed = parseTable(tableHtml);
    if (!parsed) return " ";
    const token = `%%TABLE${pulledTables.length}%%`;
    pulledTables.push(parsed);
    return `<p>${token}</p>`;
  });
  const tokens = withTables.split(/(?=<h[3-4]\b|<p\b|<ul\b|<ol\b|<img\b)/i);
  const blocks: GuideBlock[] = [];
  let pendingLabel: { kind: "tip" | "callout"; label: string } | null = null;

  const pushPending = (text: string) => {
    if (!pendingLabel || !text) return false;
    blocks.push({ type: pendingLabel.kind, label: pendingLabel.label, text });
    pendingLabel = null;
    return true;
  };

  for (const raw of tokens) {
    if (!raw.trim()) continue;
    const img = raw.match(/^<img\b[^>]*>/i);
    if (img) {
      const src = imageSrcFromTag(img[0]);
      const alt = img[0].match(/\salt="([^"]*)"/i)?.[1] ?? "";
      if (/^https?:\/\//i.test(src) && !/svg|gravatar|emoji|spinner|logo|icon|avatar/i.test(src)) {
        blocks.push({ type: "img", src, alt: decodeHtml(alt) });
      }
      continue;
    }
    const heading = raw.match(/^<h([3-4])\b[^>]*>([\s\S]*?)<\/h\1>/i);
    if (heading) {
      const text = htmlToRichText(heading[2] ?? "").replace(/\*\*/g, "");
      if (text && !SKIP_GUIDE_HEADING.test(text)) blocks.push({ type: "h3", text });
      pendingLabel = null;
      continue;
    }
    const table = raw.match(/^<table\b[\s\S]*?<\/table>/i);
    if (table) {
      const parsed = parseTable(table[0]);
      if (parsed) blocks.push(parsed);
      pendingLabel = null;
      continue;
    }
    const list = raw.match(/^<(ul|ol)\b[\s\S]*?<\/\1>/i);
    if (list) {
      const items = listItems(list[0]);
      if (items.length) {
        if (pendingLabel) {
          blocks.push({ type: pendingLabel.kind, label: pendingLabel.label, text: items.join(" · ") });
          pendingLabel = null;
        } else {
          blocks.push({ type: list[1].toLowerCase() === "ol" ? "ol" : "ul", items });
        }
      }
      continue;
    }
    const para = raw.match(/^<p\b[^>]*>([\s\S]*?)<\/p>/i);
    if (para) {
      const inner = para[1] ?? "";
      const tableToken = inner.match(/%%TABLE(\d+)%%/);
      if (tableToken) {
        const pulled = pulledTables[Number(tableToken[1])];
        if (pulled) blocks.push(pulled);
        pendingLabel = null;
        continue;
      }
      const text = htmlToRichText(inner);
      if (!text) continue;
      const plain = text.replace(/\*\*/g, "").trim();
      if (TIP_LABEL.test(plain)) {
        pendingLabel = { kind: "tip", label: plain.replace(/\s+/g, " ") };
        continue;
      }
      if (CALLOUT_LABEL.test(plain)) {
        pendingLabel = { kind: "callout", label: plain.replace(/\s+/g, " ") };
        continue;
      }
      const labeled = text.match(/^\*\*([^*]{2,40})\*\*\s*[:–—-]?\s*([\s\S]+)$/);
      if (labeled && TIP_LABEL.test(labeled[1].trim())) {
        blocks.push({ type: "tip", label: labeled[1].trim(), text: labeled[2].trim() });
        pendingLabel = null;
        continue;
      }
      if (labeled && CALLOUT_LABEL.test(labeled[1].trim())) {
        blocks.push({ type: "callout", label: labeled[1].trim(), text: labeled[2].trim() });
        pendingLabel = null;
        continue;
      }
      if (pushPending(text)) continue;
      blocks.push({ type: "p", text });
    }
  }
  return mergeGuideBlocks([...imageBlocks(cleaned), ...blocks]).slice(0, 250);
}

function parseGuideSections(html: string): GuideSection[] {
  const article = extractGuideArticleHtml(html);
  const hits: { index: number; end: number; heading: string; headingHtml: string }[] = [];
  const headingRe = /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(article))) {
    const heading = htmlToRichText(match[2] ?? "").replace(/\*\*/g, "");
    if (!heading || SKIP_GUIDE_HEADING.test(heading)) continue;
    hits.push({ index: match.index, end: match.index + match[0].length, heading, headingHtml: match[0] });
  }
  const aliasRe =
    /<ol[^>]*start="\d+"[^>]*>\s*<li[^>]*>\s*(?:<strong[^>]*>)?\s*([^<]{4,90})\s*(?:<\/strong>)?\s*<\/li>\s*<\/ol>/gi;
  while ((match = aliasRe.exec(article))) {
    const heading = htmlToRichText(match[1] ?? "").replace(/\*\*/g, "");
    if (!heading || SKIP_GUIDE_HEADING.test(heading)) continue;
    const nearby = hits.some((h) => Math.abs(h.index - match!.index) < 40);
    if (nearby) continue;
    hits.push({ index: match.index, end: match.index + match[0].length, heading, headingHtml: match[0] });
  }
  hits.sort((a, b) => a.index - b.index);

  const sections: GuideSection[] = [];
  const introHtml = hits.length ? article.slice(0, hits[0].index) : article;
  const introBlocks = parseGuideBlocks(introHtml);
  if (introBlocks.length) {
    sections.push({
      body: introBlocks
        .filter((b): b is Extract<GuideBlock, { type: "p" }> => b.type === "p")
        .map((b) => b.text)
        .join("\n\n"),
      blocks: introBlocks,
    });
  }
  for (let i = 0; i < hits.length; i++) {
    const chunk = article.slice(hits[i].end, hits[i + 1]?.index ?? article.length);
    const blocks = mergeGuideBlocks([...imageBlocks(hits[i].headingHtml), ...parseGuideBlocks(chunk)]);
    const body = blocks
      .map((b) => {
        if (b.type === "p" || b.type === "h3" || b.type === "tip" || b.type === "callout") return "text" in b ? b.text : "";
        if (b.type === "ul" || b.type === "ol") return b.items.join(" ");
        if (b.type === "table") return [...b.headers, ...b.rows.flat()].join(" ");
        return "";
      })
      .filter(Boolean)
      .join("\n");
    if (!hits[i].heading && !blocks.length) continue;
    sections.push({ heading: hits[i].heading, body: body.slice(0, 8000), blocks: blocks.length ? blocks : undefined });
  }
  if (sections.length === 0) {
    const body = decodeHtml(article).slice(0, 4000);
    if (body) sections.push({ body, blocks: parseGuideBlocks(article) });
  }
  return sections.slice(0, 40);
}

function guideSlugCandidates(slug: string, url?: string) {
  const fromUrl = url?.match(/\/guide\/([^/?#]+)/i)?.[1];
  const aliases = localGuides.flatMap((g) => {
    const siteSlug = g.siteUrl?.match(/\/guide\/([^/?#]+)/i)?.[1];
    if (g.slug === slug || siteSlug === slug || (siteSlug && slug.startsWith(g.slug)) || g.slug.startsWith(slug)) {
      return [g.slug, siteSlug];
    }
    return [];
  });
  return [...new Set([slug, fromUrl, ...aliases].filter((s): s is string => Boolean(s)))];
}

function mapGuide(raw: WpGuide): Guide {
  const local = localGuides.find((g) => g.slug === raw.slug);
  const terms = (raw._embedded?.["wp:term"] ?? []).flat();
  const categories = terms.filter((t) => t.taxonomy === "guide-category");
  const topicTerm = categories[0] || terms.find((t) => t.taxonomy === "guide-type");
  const tags = terms
    .filter((t) => t.taxonomy && t.taxonomy !== "guide-category")
    .flatMap((t) => [t.name, t.slug])
    .filter((value): value is string => Boolean(value));
  const html = raw.content?.rendered ?? "";
  const sections = parseGuideSections(html);
  const words = sections
    .flatMap((s) => [s.heading ?? "", s.body])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const date = raw.date
    ? new Date(raw.date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : local?.date ?? "";
  return {
    slug: raw.slug,
    title: decodeHtml(raw.title?.rendered ?? raw.slug),
    excerpt: decodeHtml(raw.excerpt?.rendered || raw.yoast_head_json?.og_description || "").slice(0, 280),
    date,
    readTime: `${Math.max(1, Math.round(words / 200) || 6)} min`,
    image: mediaUrl(raw._embedded?.["wp:featuredmedia"]?.[0]) || local?.image || "/images/french-quarter.jpg",
    topic: topicTerm?.name ? decodeHtml(topicTerm.name) : local?.topic ?? "Guide",
    categories: categories.map((t) => decodeHtml(t.name ?? "")).filter(Boolean),
    tags: [...new Set(tags.map((tag) => decodeHtml(tag)))],
    siteUrl: raw.link ?? `${WP_ORIGIN}/guide/${raw.slug}/`,
    sections: sections.length ? sections : (local?.sections ?? [{ body: "" }]),
  };
}

function guideFromHtml(slug: string, url: string, html: string, seed?: Guide | null): Guide {
  const local = localGuides.find((g) => g.slug === slug) ?? seed ?? null;
  const sections = parseGuideSections(html);
  const og = extractOgImage(html);
  const h1 = htmlToRichText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "").replace(/\*\*/g, "");
  const words = sections
    .flatMap((s) => [s.heading ?? "", s.body])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const firstP = sections[0]?.blocks?.find((b) => b.type === "p");
  return {
    slug,
    title: h1 || seed?.title || local?.title || slug,
    excerpt: (firstP && firstP.type === "p" ? firstP.text.replace(/\*\*/g, "") : local?.excerpt || "").slice(0, 280),
    date: seed?.date || local?.date || "",
    readTime: `${Math.max(1, Math.round(words / 200) || Number(String(local?.readTime ?? "6").replace(/\D/g, "")) || 6)} min`,
    image: pickListingImage(og, seed?.image, local?.image) || local?.image || "/images/french-quarter.jpg",
    topic: seed?.topic || local?.topic || "Guide",
    siteUrl: url,
    sections: sections.length ? sections : (seed?.sections ?? local?.sections ?? [{ body: "" }]),
  };
}

function cookieHeader(setCookies: string[]) {
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlMember(xml: string, name: string) {
  const re = new RegExp(`<name>${name}</name>\s*<value>(?:<(?:string|int|i4)>)?([^<]*)`, "i");
  return re.exec(xml)?.[1]?.trim() ?? "";
}

function extractRestNonce(html: string) {
  const patterns = [
    /wpApiSettings\s*=\s*\{[^}]*?"nonce"\s*:\s*"([a-zA-Z0-9]+)"/,
    /"restNonce"\s*:\s*"([a-zA-Z0-9]+)"/,
    /createNonceMiddleware\(\s*"([a-zA-Z0-9]+)"/,
    /"nonce"\s*:\s*"([a-zA-Z0-9]{8,})"/,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function fetchMeXmlRpc(username: string, password: string): Promise<WpMe | null> {
  const body = `<?xml version="1.0"?><methodCall><methodName>wp.getProfile</methodName><params><param><value><int>1</int></value></param><param><value><string>${escapeXml(username)}</string></value></param><param><value><string>${escapeXml(password)}</string></value></param></params></methodCall>`;
  const res = await fetch(`${WP_ORIGIN}/xmlrpc.php`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const xml = await res.text();
  if (!res.ok || /faultCode|faultString/i.test(xml)) return null;
  const id = Number(xmlMember(xml, "user_id") || xmlMember(xml, "userid"));
  if (!Number.isFinite(id) || id <= 0) return null;
  return {
    id,
    name: xmlMember(xml, "display_name") || xmlMember(xml, "nickname") || username,
    slug: xmlMember(xml, "nicename") || xmlMember(xml, "username") || username,
    email: xmlMember(xml, "email"),
    roles: [],
    avatar_urls: {},
    meta: {},
  };
}

async function wpCookieLogin(username: string, password: string) {
  const form = new URLSearchParams({
    log: username,
    pwd: password,
    rememberme: "forever",
    "wp-submit": "Log In",
    redirect_to: `${WP_ORIGIN}/`,
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
  if (!cookie.includes("wordpress_logged_in")) return "";
  return cookie;
}

async function fetchMeWithCookie(cookie: string): Promise<WpMe | null> {
  if (!cookie) return null;
  const pages = ["/", "/wp-admin/", "/wp-admin/profile.php"];
  let nonce: string | null = null;
  for (const path of pages) {
    try {
      const res = await fetch(`${WP_ORIGIN}${path}`, {
        headers: { Cookie: cookie, Accept: "text/html" },
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });
      nonce = extractRestNonce(await res.text());
      if (nonce) break;
    } catch {
      /* try next page */
    }
  }
  const headers: HeadersInit = nonce
    ? { Cookie: cookie, "X-WP-Nonce": nonce }
    : { Cookie: cookie };
  return fetchMe(headers);
}

async function wpGet<T>(path: string, headers: HeadersInit = {}, timeout = 20000): Promise<{ headers: Headers; data: T; ok: boolean; status: number }> {
  const headerMap = new Headers(headers);
  const authed = headerMap.has("cookie") || headerMap.has("authorization") || headerMap.has("x-wp-nonce");
  if (!authed) {
    const hit = await cachedOriginText(`${WP_ORIGIN}${path}`, CATALOG_TTL, timeout, {
      Accept: "application/json",
      ...headers,
    }).catch(() => null);
    if (!hit) return { headers: new Headers(), data: [] as T, ok: false, status: 0 };
    let data = [] as T;
    try {
      data = JSON.parse(hit.body) as T;
    } catch {
      data = [] as T;
    }
    const wpHeaders = new Headers();
    if (hit.total) wpHeaders.set("X-WP-Total", hit.total);
    if (hit.pages) wpHeaders.set("X-WP-TotalPages", hit.pages);
    return { headers: wpHeaders, data, ok: hit.ok, status: hit.status };
  }
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
  const { data, ok } = await wpGet<WpMe>(
    "/wp-json/wp/v2/users/me?context=edit&_fields=id,name,slug,email,roles,avatar_urls,meta",
    headers,
    15000,
  );
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
    `/wp-json/wp/v2/listing?per_page=100&page=1&_embed=1&_fields=${fields},meta,_embedded`,
    {},
    12000,
  );
  if (!first.ok || !Array.isArray(first.data)) {
    // The catalog can still be built from the Listeo geo feed when the
    // WordPress REST listing endpoint is temporarily unavailable.
    return { rows: [], total: 0 };
  }
  const total = Number(first.headers.get("X-WP-Total") ?? first.data.length);
  const pages = Math.min(Number(first.headers.get("X-WP-TotalPages") ?? "1"), 8);
  const rest =
    pages > 1
      ? await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            wpGet<WpListing[]>(
              `/wp-json/wp/v2/listing?per_page=100&page=${i + 2}&_embed=1&_fields=${fields},meta,_embedded`,
              {},
              12000,
            ).then((r) => (r.ok && Array.isArray(r.data) ? r.data : [])),
          ),
        )
      : [];
  return { rows: [first.data, ...rest].flat(), total };
}

function isFeaturedMeta(value: unknown): boolean | undefined {
  if (value == null || value === "") return undefined;
  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "yes" ||
    value === "on"
  ) return true;
  if (value === false || value === 0 || value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

function toListingPackage(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
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
let openNowCache: { at: number; snapshot: Awaited<ReturnType<typeof loadOpenNowSnapshot>> } | null = null;
const listingPageCache = new Map<string, { at: number; listing: Listing }>();
const CATALOG_TTL = 20 * 60 * 1000;
const CATALOG_STALE = 2 * 60 * 60 * 1000;
const LISTING_PAGE_TTL = 30 * 60 * 1000;
const HTML_TTL = 30 * 60 * 1000;
const CATALOG_VERSION = 40;

async function loadCatalogFromWp(): Promise<{ listings: Listing[]; total: number }> {
  const [listeoResult, wpCatalog, categoryMap] = await Promise.all([
    loadListeoGeo(),
    loadListingPages(),
    loadTerms("listing_category"),
  ]);
  const { map: listeoGeo, total: listeoTotal } = listeoResult;
  // Either live source is sufficient. Listeo is preferred for geo/enrichment, but
  // a healthy WordPress REST catalog must still be usable when the Listeo
  // AJAX feed is temporarily unavailable. Only fall back to the curated set
  // when both live sources fail.
  if (listeoGeo.size < 8 && wpCatalog.rows.length < 80) {
    throw new Error("live-sources-empty");
  }

  // Resolve WordPress featured-media IDs once so each listing can use its
  // actual featured image instead of falling back to a shared/local image.
  const featuredMediaIds = [...new Set(
    wpCatalog.rows
      .map((row) => Number(row.featured_media ?? 0))
      .filter((id) => Number.isFinite(id) && id > 0),
  )];
  const mediaMap = await loadMedia(featuredMediaIds);

  // WordPress REST is the authoritative source for taxonomy membership.
  // Listeo geo data is still used below to enrich listings with coordinates,
  // ratings, images, hours, etc.
  const wpBySlug = new Map<string, WpListing>();
  for (const row of wpCatalog.rows) {
    if (row.slug) wpBySlug.set(row.slug, row);
  }

  const jetMeta = new Map<string, JetArchiveHit>();

  // Some newly published WordPress listings are present in REST but have not
  // appeared in the Listeo geo feed yet. Pull their archive marker data so
  // cards still receive coordinates (and therefore distance-from-user).
  const archiveSlugsForMissingGeo = [
    ...new Set(
      wpCatalog.rows
        .filter((row) => row.slug && !listeoGeo.has(row.slug))
        .flatMap((row) =>
          (row.class_list ?? [])
            .filter((value) => value.startsWith("listing_category-"))
            .map((value) => value.slice("listing_category-".length)),
        )
        .filter(Boolean),
    ),
  ];
  if (archiveSlugsForMissingGeo.length) {
    await loadJetArchiveMeta(archiveSlugsForMissingGeo, jetMeta);
  }

  const seen = new Set<string>();
  const listings: Listing[] = [];

  // New WordPress listings can be missing from the Listeo geo feed and may
  // also have _friendly_address / rating fields that are not exposed by REST.
  // Enrich only those listings from their own listing page so address and
  // rating are listing-specific rather than inferred from an archive card.
  const htmlEnriched = new Map<string, Listing>();
  const missingHtmlRows = wpCatalog.rows.filter(
    (row) =>
      row.slug &&
      !listeoGeo.has(row.slug) &&
      (!row.meta?._friendly_address || !row.meta?.google_place_id),
  );
  await Promise.all(
    Array.from({ length: Math.min(4, missingHtmlRows.length) }, async (_, workerIndex) => {
      for (let i = workerIndex; i < missingHtmlRows.length; i += 4) {
        const row = missingHtmlRows[i];
        if (!row?.slug) continue;
        const urls = [
          row.link,
          WP_ORIGIN + "/listing/service/" + row.slug + "/",
          WP_ORIGIN + "/listing/" + row.slug + "/",
        ].filter((url): url is string => Boolean(url));
        const page = await loadListingPageHtml(urls, 9000);
        if (!page) continue;
        try {
          htmlEnriched.set(
            row.slug,
            enrichListingFromHtml(mapListing(row, { mediaMap, catMap: categoryMap }), page.html),
          );
        } catch {
          /* keep the REST/Jet archive data */
        }
      }
    }),
  );

  function applyLive(item: Listing, slug: string): Listing {
    const hit = jetMeta.get(slug) ?? jetMeta.get(urlTail(item.siteUrl));
    const geo = listeoGeo.get(slug) ?? listeoGeo.get(urlTail(item.siteUrl));
    const local = findLocal(slug, item.siteUrl);
    const kind = decodeHtml(hit?.kind || item.kind);
    const category = hit?.category ?? categoryFromKindName(kind) ?? item.category;
    return {
      ...item,
      category,
      kind,
      wpId: item.wpId ?? geo?.id ?? local?.wpId,
      mustTry: item.mustTry?.length ? item.mustTry : hit?.mustTry,
      cafeTypes: item.cafeTypes?.length ? item.cafeTypes : hit?.cafeTypes,
      metaFacets: hit?.facets.length ? hit.facets : item.metaFacets,
      metaGroups: item.metaGroups?.length ? item.metaGroups : hit?.groups,
      lat: geo?.lat ?? hit?.lat ?? item.lat,
      lng: geo?.lng ?? hit?.lng ?? item.lng,
      hours: hit?.hours || item.hours || local?.hours || "",
      openNow: hit?.openNow ?? item.openNow ?? local?.openNow,
      weeklyHours: hit?.weeklyHours?.length ? hit.weeklyHours : (item.weeklyHours ?? local?.weeklyHours),
      rating: item.rating || hit?.rating || geo?.rating || local?.rating || 0,
      reviews: item.reviews || hit?.reviews || geo?.reviews || local?.reviews || 0,
      address: item.address || geo?.address,
      // _friendly_address is the only address value exposed to listing cards.
      // Never fall back to the raw _address/Listeo geo address.
      // When WP REST is unavailable, preserve the same _friendly_address
      // value exposed by Listeo's data-friendly-address field.
      friendlyAddress: item.friendlyAddress || geo?.friendlyAddress || undefined,
      location: item.location === "Pondicherry" && geo?.address ? geo.address : item.location,
      area: item.area === "Pondicherry" && geo?.address ? geo.address : item.area,
      featured:
        isFeaturedMeta(wpBySlug.get(slug)?.meta?._featured) ??
        item.featured ??
        hit?.featured ??
        geo?.featured,
      listingPackage:
        toListingPackage(wpBySlug.get(slug)?.meta?.["listing-package"]) ??
        item.listingPackage,
      // Prefer the WordPress featured image for the card cover. Listeo's
      // geo image is only a fallback when WordPress has no featured image.
      image: pickListingImage(item.image, geo?.image, local?.image) || item.image || FALLBACK_IMAGE[item.category],
      gallery: uniqueImages(geo?.gallery, item.gallery, local?.gallery),
    };
  }

  for (const geo of listeoGeo.values()) {
    if (seen.has(geo.slug)) continue;
    seen.add(geo.slug);

    const wpRaw = wpBySlug.get(geo.slug);
    const wpListing = wpRaw ? mapListing(wpRaw, { mediaMap, catMap: categoryMap }) : null;
    const category = wpListing?.category ?? geo.category ?? "places";
    const local = findLocal(geo.slug);

    listings.push(
      applyLive(
        wpListing
          ? {
              ...wpListing,
              image: wpListing.image || geo.image || FALLBACK_IMAGE[category],
              gallery: geo.gallery ?? wpListing.gallery,
            }
          : {
              slug: geo.slug,
              name: geo.name,
              category,
              kind: decodeHtml(geo.kind ?? local?.kind ?? "Listing"),
              rating: geo.rating ?? 0,
              reviews: geo.reviews ?? 0,
              location: geo.address ?? "Pondicherry",
              area: geo.address ?? "Pondicherry",
              distance: "",
              hours: local?.hours ?? "",
              description: local?.description ?? "",
              tags: geo.kind ? [decodeHtml(geo.kind)] : (local?.tags ?? []),
              bestFor: local?.bestFor ?? [],
              image: geo.image ?? FALLBACK_IMAGE[category],
              gallery: geo.gallery,
              siteUrl: `${WP_ORIGIN}/listing/${geo.slug}/`,
              wpId: geo.id ?? local?.wpId,
              lat: geo.lat,
              lng: geo.lng,
              address: geo.address,
              friendlyAddress: geo.friendlyAddress,
              featured: geo.featured,
              taxonomies: geo.categoryTerms?.length
                ? [{ key: "listing_category", label: "Categories", terms: geo.categoryTerms }]
                : undefined,
            },
        geo.slug,
      ),
    );
  }

  // Add published WordPress listings that are missing from the Listeo geo feed.
  // This prevents taxonomy archives from being silently truncated by the geo endpoint.
  for (const raw of wpCatalog.rows) {
    if (seen.has(raw.slug)) continue;
    seen.add(raw.slug);
    listings.push(
      applyLive(
        htmlEnriched.get(raw.slug) ?? mapListing(raw, { mediaMap, catMap: categoryMap }),
        raw.slug,
      ),
    );
  }

  for (const [slug, hit] of jetMeta) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    const local = findLocal(slug);
    const category = local?.category ?? "places";
    listings.push(
      applyLive(
        {
          slug,
          name: local?.name ?? slug,
          category,
          kind: local?.kind ?? "Listing",
          rating: local?.rating ?? 0,
          reviews: local?.reviews ?? 0,
          location: local?.location ?? "Pondicherry",
          area: local?.area ?? "Pondicherry",
          distance: "",
          hours: hit.hours || local?.hours || "",
          description: local?.description ?? "",
          tags: local?.tags ?? [],
          bestFor: local?.bestFor ?? [],
          image: local?.image ?? FALLBACK_IMAGE[category],
          siteUrl: `${WP_ORIGIN}/listing/${slug}/`,
          wpId: local?.wpId,
          lat: hit.lat ?? local?.lat,
          lng: hit.lng ?? local?.lng,
          featured: hit.featured,
          listingPackage: hit.listingPackage,
        },
        slug,
      ),
    );
  }

  const merged = mergeLocal(listings);
  return { listings: merged, total: Math.max(merged.length, wpCatalog.total, listeoGeo.size, listeoTotal) };
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

let catalogRefresh: Promise<void> | null = null;

function refreshCatalog() {
  if (catalogRefresh) return catalogRefresh;
  catalogRefresh = loadCatalogFromWp()
    .then((fresh) => {
      if (fresh.listings.length >= 300) {
        catalogCache = { at: Date.now(), v: CATALOG_VERSION, ...fresh };
      }
    })
    .catch(() => undefined)
    .finally(() => {
      catalogRefresh = null;
    });
  return catalogRefresh;
}

export const fetchWpCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (catalogCache && catalogCache.v === CATALOG_VERSION && now - catalogCache.at < CATALOG_TTL) {
    return { listings: catalogCache.listings, total: catalogCache.total };
  }
  if (catalogCache && catalogCache.v === CATALOG_VERSION && now - catalogCache.at < CATALOG_STALE) {
    void refreshCatalog();
    return { listings: catalogCache.listings, total: catalogCache.total };
  }
  try {
    let fresh: { listings: Listing[]; total: number } | null = null;
    let lastError: unknown = null;

    // A transient timeout from either WordPress REST or the Listeo AJAX feed
    // should not immediately downgrade a cold PWA load to the curated set.
    // Retry the complete live-source build once before using local data.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        fresh = await loadCatalogFromWp();
        if (fresh.listings.length >= 300 || attempt === 1) break;
      } catch (error) {
        lastError = error;
        if (attempt === 1) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    if (!fresh) throw lastError ?? new Error("catalog-unavailable");
    if (fresh.listings.length >= 300) {
      catalogCache = { at: now, v: CATALOG_VERSION, ...fresh };
    }
    return fresh;
  } catch {
    if (catalogCache && catalogCache.listings.length >= 80) {
      return { listings: catalogCache.listings, total: catalogCache.total };
    }
    return { listings: localListings, total: localListings.length };
  }
});

export const fetchWpOpenNowSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (openNowCache && now - openNowCache.at < CATALOG_TTL) return openNowCache.snapshot;
  const snapshot = await loadOpenNowSnapshot();
  openNowCache = { at: now, snapshot };
  return snapshot;
});

export const fetchWpListingHours = createServerFn({ method: "GET" }).handler(async () => {
  const bySlug = new Map<string, JetArchiveHit>();
  await loadJetArchiveMeta(ARCHIVE_SLUGS, bySlug);
  return [...bySlug.values()]
    .filter((hit) => hit.hours || hit.weeklyHours?.length || hit.openNow != null)
    .map((hit) => ({
      slug: hit.slug,
      hours: hit.hours,
      openNow: hit.openNow,
      weeklyHours: hit.weeklyHours,
    }));
});

export const fetchWpOpenNowForSlugs = createServerFn({ method: "GET" })
  .validator(z.object({ slugs: z.string().min(1) }))
  .handler(async ({ data }) => {
    const slugs = [...new Set(data.slugs.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 24);
    const rows: Array<{
      slug: string;
      hours?: string;
      openNow?: boolean;
      weeklyHours?: Listing["weeklyHours"];
    }> = [];
    const queue = [...slugs];
    await Promise.all(
      Array.from({ length: Math.min(6, queue.length) }, async () => {
        while (queue.length) {
          const slug = queue.shift();
          if (!slug) break;
          const cached = listingPageCache.get(slug);
          if (cached && Date.now() - cached.at < LISTING_PAGE_TTL) {
            const listing = cached.listing;
            if (listing.hours || listing.weeklyHours?.length || listing.openNow != null) {
              rows.push({
                slug,
                hours: listing.hours,
                openNow: listing.openNow,
                weeklyHours: listing.weeklyHours,
              });
            }
            continue;
          }
          const page = await loadListingPageHtml(
            [`${WP_ORIGIN}/listing/service/${slug}/`, `${WP_ORIGIN}/listing/${slug}/`],
            8000,
          );
          if (!page) continue;
          const hoursInfo = parseOpenHoursHtml(page.html);
          if (!hoursInfo.hours && !hoursInfo.weeklyHours.length && hoursInfo.openNow == null) continue;
          rows.push({
            slug,
            hours: hoursInfo.hours || undefined,
            openNow: hoursInfo.openNow,
            weeklyHours: hoursInfo.weeklyHours.length ? hoursInfo.weeklyHours : undefined,
          });
        }
      }),
    );
    return rows;
  });

export const fetchWpGuides = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (guidesCache && now - guidesCache.at < CATALOG_TTL) return { guides: guidesCache.guides };
  const guides = await loadGuidesFromWp();
  guidesCache = { at: now, guides };
  return { guides };
});

async function loadListingPageHtml(urls: string[], timeout = 10000) {
  const unique = [...new Set(urls.filter(Boolean))];
  let fallback: { url: string; html: string; score: number } | null = null;
  for (const url of unique) {
    try {
      const page = await cachedOriginText(url, HTML_TTL, timeout, WP_HTML_HEADERS);
      if (!page.ok) continue;
      const html = page.body;
      if (/<title>[^<]*Page not found/i.test(html)) continue;
      const score =
        (html.match(/field-values/gi)?.length ?? 0) * 8 +
        (html.match(/listing-field-heading/gi)?.length ?? 0) * 10 +
        (html.match(/jet-check-list__item-content/gi)?.length ?? 0) +
        (html.match(/heading-(?:break|sameline)/gi)?.length ?? 0) * 4;
      const hit = { url, html, score };
      if (score > 0) return hit;
      fallback ??= hit;
    } catch {
      /* try the next url */
    }
  }
  return fallback;
}

function listingAliases(slug: string, url?: string) {
  const tail = url ? url.split("/").filter(Boolean).pop() ?? "" : "";
  return [...new Set([tail, slug].filter((s) => s.length > 2))];
}

export const fetchWpListing = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1), url: z.string().optional() }))
  .handler(async ({ data }) => {
    const cached = listingPageCache.get(data.slug);
    if (cached && Date.now() - cached.at < LISTING_PAGE_TTL && (cached.listing.metaGroups?.length || cached.listing.reviews > 0)) {
      if (cached.listing.metaGroups?.length) return cached.listing;
    }

    const aliases = listingAliases(data.slug, data.url);
    const urls = [
      data.url?.includes("/listing/") ? data.url : undefined,
      ...aliases.flatMap((s) => [`${WP_ORIGIN}/listing/service/${s}/`, `${WP_ORIGIN}/listing/${s}/`]),
    ].filter((url, i, all): url is string => !!url && all.indexOf(url) === i);

    const [page, restHits] = await Promise.all([
      loadListingPageHtml(urls, 10000),
      Promise.all(
        aliases.map((s) =>
          wpGet<WpListing[]>(
            `/wp-json/wp/v2/listing?slug=${encodeURIComponent(s)}&_fields=id,slug,title,link,featured_media,listing_category,region,listing_feature,class_list,yoast_head_json,meta,_embedded`,
            {},
            8000,
          ).catch(() => null),
        ),
      ),
    ]);

    const rest =
      restHits.find(
        (res) => res?.ok && Array.isArray(res.data) && res.data[0],
      ) ?? null;

    let listing: Listing | null = null;
    if (rest?.ok && Array.isArray(rest.data) && rest.data[0]) listing = mapListing(rest.data[0]);
    const local = findLocal(data.slug, data.url ?? page?.url);
    const seed = listing ?? local ?? null;
    let result = seed;
    if (page) {
      const base =
        seed ??
        ({
          slug: data.slug,
          name: data.slug,
          category: "places",
          kind: "Listing",
          rating: 0,
          reviews: 0,
          location: "Pondicherry",
          area: "Pondicherry",
          distance: "",
          hours: "",
          description: "",
          tags: [],
          bestFor: [],
          image: "",
          siteUrl: page.url,
        } satisfies Listing);
      result = enrichListingFromHtml({ ...base, siteUrl: base.siteUrl || page.url }, page.html);
    }
    if (result && (page || rest?.ok)) listingPageCache.set(data.slug, { at: Date.now(), listing: result });
    return result;
  });

export type WpTripSaveInput = {
  email: string;
  wpId?: number;
  title: string;
  code: string;
  fromPlace: string;
  fromLat?: number;
  fromLng?: number;
  locations: string[];
  budget: string;
  tripType: string;
  datesKnown: boolean;
  start: string;
  end: string;
  months: string[];
  days: number;
  interests: string[];
  notes: string;
  items: { slug: string; day: number }[];
  itinerary?: unknown;
};

async function wpTripSyncCredentials() {
  const username = process.env.WP_TRIP_SYNC_USERNAME?.trim() ?? "";
  const appPassword = process.env.WP_TRIP_SYNC_APP_PASSWORD?.trim() ?? "";
  if (!username || !appPassword) return null;
  return {
    Authorization: `Basic ${Buffer.from(`${username}:${appPassword.replace(/\s+/g, " ")}`, "utf8").toString("base64")}`,
  };
}

export type WpTripStoreResult = {
  ok: boolean;
  configured: boolean;
  userId?: number;
  listingIds?: number[];
  error?: string;
};

async function wpTripStoreRequest(
  email: string,
  payload?: { operation: "add" | "remove" | "replace"; listingId?: number; listingIds?: number[] },
) {
  const headers = await wpTripSyncCredentials();
  if (!headers) {
    return {
      ok: false as const,
      configured: false as const,
      error: "WordPress trip sync is not configured on the PWA server.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false as const, configured: true as const, error: "A signed-in email is required." };
  }

  const res = await fetch(`${WP_ORIGIN}/wp-json/xplore/v1/pwa/trip-store`, {
    method: payload ? "POST" : "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    ...(payload
      ? {
          body: JSON.stringify({
            email: normalizedEmail,
            ...payload,
          }),
        }
      : undefined),
    signal: AbortSignal.timeout(15000),
  });

  const body = (await res.json().catch(() => null)) as
    | { ok?: boolean; user_id?: number; listing_ids?: unknown; message?: string; code?: string }
    | null;

  const listingIds = Array.isArray(body?.listing_ids)
    ? body!.listing_ids.map(Number).filter((id) => Number.isFinite(id) && id > 0)
    : [];

  if (!res.ok || body?.ok === false) {
    return {
      ok: false as const,
      configured: true as const,
      error: body?.message || body?.code || `WordPress returned HTTP ${res.status}.`,
    };
  }

  return {
    ok: true as const,
    configured: true as const,
    userId: typeof body?.user_id === "number" ? body.user_id : undefined,
    listingIds,
  };
}

export const fetchWpTripStore = createServerFn({ method: "GET" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => wpTripStoreRequest(data.email));

export const updateWpTripStore = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      operation: z.enum(["add", "remove", "replace"]),
      listingId: z.number().int().positive().optional(),
      listingIds: z.array(z.number().int().positive()).optional(),
    }),
  )
  .handler(async ({ data }) => wpTripStoreRequest(data.email, data));

async function resolveWpUserByEmail(email: string, headers: HeadersInit) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const res = await wpGet<Array<{ id?: number; email?: string; name?: string }>>(
    `/wp-json/wp/v2/users?search=${encodeURIComponent(normalized)}&per_page=100&_fields=id,email,name&context=edit`,
    headers,
    12000,
  );
  if (!res.ok || !Array.isArray(res.data)) return null;
  return res.data.find((u) => String(u.email ?? "").trim().toLowerCase() === normalized) ?? null;
}

function tripMeta(data: WpTripSaveInput) {
  const selected = data.items.map((item) => ({ slug: item.slug, day: item.day }));
  return {
    trip_location: data.locations,
    trips_dates: data.datesKnown ? "dates_known" : "dates_unknown",
    trip_start: data.start,
    trip_end: data.end,
    when_are_you_going: data.months,
    trip_days: String(data.days),
    trip_type: data.tripType,
    trip_budget: data.budget,
    trip_interest: data.interests,
    trip_from_place: data.fromPlace,
    trip_from_lat: data.fromLat ?? "",
    trip_from_lng: data.fromLng ?? "",
    trip_notes: data.notes,
    _trip_code: data.code,
    _trip_duration: String(data.days),
    _trip_dates: data.datesKnown ? `${data.start} to ${data.end}` : data.months.join(", "),
    _trip_itinerary: JSON.stringify(data.itinerary ?? []),
    _xplore_pwa_selected_listings: JSON.stringify(selected),
    _xplore_pwa_trip_data: JSON.stringify(data),
  };
}

export const saveWpUserTrip = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      wpId: z.number().int().positive().optional(),
      title: z.string().min(1).max(200),
      code: z.string().min(1).max(100),
      fromPlace: z.string().max(300),
      fromLat: z.number().finite().optional(),
      fromLng: z.number().finite().optional(),
      locations: z.array(z.string()),
      budget: z.string(),
      tripType: z.string(),
      datesKnown: z.boolean(),
      start: z.string(),
      end: z.string(),
      months: z.array(z.string()),
      days: z.number().int().min(1).max(7),
      interests: z.array(z.string()),
      notes: z.string().max(5000),
      items: z.array(z.object({ slug: z.string(), day: z.number().int().min(1).max(7) })),
      itinerary: z.unknown().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = await wpTripSyncCredentials();
    if (!headers) {
      return {
        ok: false as const,
        error: "WordPress trip sync is not configured on the PWA server.",
      };
    }

    const wpUser = await resolveWpUserByEmail(data.email, headers);
    if (!wpUser?.id) {
      return {
        ok: false as const,
        error: "No matching xplorepondy.com WordPress user was found for this signed-in email.",
      };
    }

    const meta = tripMeta(data);
    const content = [
      "<!-- xplore-pwa-trip -->",
      `<p><strong>Trip code:</strong> ${data.code}</p>`,
      `<p><strong>From:</strong> ${data.fromPlace || "Not specified"}</p>`,
      `<p><strong>Dates:</strong> ${data.datesKnown ? `${data.start} to ${data.end}` : data.months.join(", ") || "Flexible"}</p>`,
      `<p><strong>Days:</strong> ${data.days}</p>`,
      `<p><strong>Budget:</strong> ${data.budget || "Any"}</p>`,
      `<p><strong>Trip type:</strong> ${data.tripType || "Any"}</p>`,
      `<p><strong>Interests:</strong> ${data.interests.join(", ") || "Any"}</p>`,
      `<p><strong>Locations:</strong> ${data.locations.join(", ") || "Pondicherry"}</p>`,
      data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : "",
      `<!-- xplore-pwa-trip-data:${Buffer.from(JSON.stringify({ ...data, wpUserId: wpUser.id }), "utf8").toString("base64")} -->`,
    ].filter(Boolean).join("\n");

    const endpoint = data.wpId
      ? `${WP_ORIGIN}/wp-json/wp/v2/user_trip/${data.wpId}`
      : `${WP_ORIGIN}/wp-json/wp/v2/user_trip`;
    const res = await fetch(endpoint, {
      method: data.wpId ? "PUT" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        title: data.title,
        content,
        status: "publish",
        author: wpUser.id,
        meta,
      }),
      signal: AbortSignal.timeout(20000),
    });

    const body = (await res.json().catch(() => null)) as
      | { id?: number; slug?: string; link?: string; title?: { rendered?: string }; message?: string; code?: string }
      | null;

    if (!res.ok || !body?.id) {
      return {
        ok: false as const,
        error: body?.message || body?.code || `WordPress returned HTTP ${res.status}.`,
      };
    }

    return {
      ok: true as const,
      trip: {
        id: body.id,
        slug: body.slug ?? "",
        title: decodeHtml(body.title?.rendered ?? data.title),
        date: "",
        url: body.link ?? `${WP_ORIGIN}/user_trip/${body.slug ?? ""}/`,
      } satisfies WpTrip,
    };
  });

export type WpTripSyncInput = {
  email: string;
  wpId: number;
  code: string;
  locations: string[];
  fromPlace: string;
  fromLat?: number;
  fromLng?: number;
  budget: string;
  tripType: string;
  datesKnown: boolean;
  start: string;
  end: string;
  months: string[];
  days: number;
  interests: string[];
  savedListingIds: number[];
  items: { listingId: number; day: number }[];
  itinerary: unknown[];
};

export type WpTripRemoteState = {
  ok: boolean;
  tripId: number;
  code: string;
  interests: string[];
  savedListingIds: number[];
  items: { listingId: number; day: number }[];
  itinerary: unknown[];
  error?: string;
};

export const syncWpUserTrip = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      wpId: z.number().int().positive(),
      code: z.string().min(1).max(100),
      locations: z.array(z.string()),
      fromPlace: z.string().max(300),
      fromLat: z.number().finite().optional(),
      fromLng: z.number().finite().optional(),
      budget: z.string(),
      tripType: z.string(),
      datesKnown: z.boolean(),
      start: z.string(),
      end: z.string(),
      months: z.array(z.string()),
      days: z.number().int().min(1).max(7),
      interests: z.array(z.string()),
      savedListingIds: z.array(z.number().int().positive()),
      items: z.array(
        z.object({
          listingId: z.number().int().positive(),
          day: z.number().int().min(1).max(7),
        }),
      ),
      itinerary: z.array(z.unknown()),
    }),
  )
  .handler(async ({ data }) => {
    const headers = await wpTripSyncCredentials();
    if (!headers) {
      return {
        ok: false as const,
        configured: false as const,
        error: "WordPress trip sync is not configured on the PWA server.",
      };
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const res = await fetch(
      `${WP_ORIGIN}/wp-json/xplore/v1/pwa/trip/${data.wpId}/sync`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          code: data.code,
          locations: data.locations,
          fromPlace: data.fromPlace,
          fromLat: data.fromLat,
          fromLng: data.fromLng,
          budget: data.budget,
          tripType: data.tripType,
          datesKnown: data.datesKnown,
          start: data.start,
          end: data.end,
          months: data.months,
          days: data.days,
          interests: data.interests,
          savedListingIds: data.savedListingIds,
          items: data.items,
          itinerary: data.itinerary,
        }),
        signal: AbortSignal.timeout(15000),
      },
    );

    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; message?: string; code?: string }
      | null;

    if (!res.ok || body?.ok === false) {
      return {
        ok: false as const,
        configured: true as const,
        error: body?.message || body?.code || `WordPress returned HTTP ${res.status}.`,
      };
    }

    return {
      ok: true as const,
      configured: true as const,
    };
  });

export const fetchWpUserTripState = createServerFn({ method: "GET" })
  .validator(
    z.object({
      email: z.string().email(),
      wpId: z.number().int().positive(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = await wpTripSyncCredentials();
    if (!headers) {
      return {
        ok: false as const,
        error: "WordPress trip sync is not configured on the PWA server.",
      };
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const res = await fetch(
      `${WP_ORIGIN}/wp-json/xplore/v1/pwa/trip/${data.wpId}/state?email=${encodeURIComponent(normalizedEmail)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...headers,
        },
        signal: AbortSignal.timeout(15000),
      },
    );

    const body = (await res.json().catch(() => null)) as
      | {
          ok?: boolean;
          trip_id?: number;
          trip_code?: string;
          interests?: unknown;
          saved_listing_ids?: unknown;
          items?: unknown;
          itinerary?: unknown;
          message?: string;
          code?: string;
        }
      | null;

    if (!res.ok || body?.ok === false) {
      return {
        ok: false as const,
        error: body?.message || body?.code || `WordPress returned HTTP ${res.status}.`,
      };
    }

    const interests = Array.isArray(body?.interests)
      ? body.interests.map(String).map((value) => value.trim()).filter(Boolean)
      : [];
    const savedListingIds = Array.isArray(body?.saved_listing_ids)
      ? body.saved_listing_ids.map(Number).filter((id) => Number.isFinite(id) && id > 0)
      : [];
    const items = Array.isArray(body?.items)
      ? body.items
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const listingId = Number(row.listingId ?? row.listing_id ?? 0);
            const day = Math.max(1, Math.min(7, Number(row.day ?? 1)));
            return Number.isFinite(listingId) && listingId > 0
              ? { listingId, day }
              : null;
          })
          .filter((item): item is { listingId: number; day: number } => !!item)
      : [];

    return {
      ok: true as const,
      tripId: Number(body?.trip_id ?? data.wpId),
      code: String(body?.trip_code ?? ""),
      interests,
      savedListingIds: [...new Set(savedListingIds)],
      items,
      itinerary: Array.isArray(body?.itinerary) ? body.itinerary : [],
    };
  });

export const fetchWpUserTrips = createServerFn({ method: "GET" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const headers = await wpTripSyncCredentials();
    if (!headers) return { trips: [] as WpTrip[], configured: false as const };

    const wpUser = await resolveWpUserByEmail(data.email, headers);
    if (!wpUser?.id) return { trips: [] as WpTrip[], configured: true as const };

    const res = await wpGet<WpUserTrip[]>(
      `/wp-json/wp/v2/user_trip?author=${wpUser.id}&per_page=20&orderby=date&order=desc&_fields=id,slug,title,date,link,content`,
      headers,
      15000,
    );
    if (!res.ok || !Array.isArray(res.data)) return { trips: [] as WpTrip[], configured: true as const };

    return {
      configured: true as const,
      trips: res.data.map((t) => {
        const encoded = t.content?.rendered?.match(/<!-- xplore-pwa-trip-data:([A-Za-z0-9+/=]+) -->/)?.[1];
        let savedData: Omit<WpTripSaveInput, "email"> | undefined;
        if (encoded) {
          try {
            savedData = JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as Omit<WpTripSaveInput, "email">;
          } catch {
            savedData = undefined;
          }
        }
        return {
          id: t.id,
          slug: t.slug,
          title: decodeHtml(t.title?.rendered ?? t.slug),
          date: t.date
            ? new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "",
          url: t.link ?? `${WP_ORIGIN}/user_trip/${t.slug}/`,
          data: savedData,
        };
      }),
    };
  });


export const fetchWpBookmarks = createServerFn({ method: "GET" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const headers = await wpTripSyncCredentials();
    if (!headers) return { ok: false as const, bookmarkIds: [] as number[], configured: false as const };

    const res = await fetch(
      `${WP_ORIGIN}/wp-json/xplore/v1/pwa/bookmarks/state?email=${encodeURIComponent(data.email.trim().toLowerCase())}`,
      {
        method: "GET",
        headers: { Accept: "application/json", ...headers },
        signal: AbortSignal.timeout(15000),
      },
    );
    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; bookmark_ids?: unknown; message?: string; code?: string }
      | null;
    if (!res.ok || body?.ok === false) {
      return {
        ok: false as const,
        bookmarkIds: [] as number[],
        configured: true as const,
        error: body?.message || body?.code || `WordPress returned HTTP ${res.status}.`,
      };
    }
    const bookmarkIds = Array.isArray(body?.bookmark_ids)
      ? [...new Set(body.bookmark_ids.map(Number).filter((id) => Number.isFinite(id) && id > 0))]
      : [];
    return { ok: true as const, bookmarkIds, configured: true as const };
  });

export const syncWpBookmarks = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      bookmarkIds: z.array(z.number().int().positive()),
    }),
  )
  .handler(async ({ data }) => {
    const headers = await wpTripSyncCredentials();
    if (!headers) return { ok: false as const, error: "WordPress bookmark sync is not configured on the PWA server." };

    const res = await fetch(`${WP_ORIGIN}/wp-json/xplore/v1/pwa/bookmarks/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify({
        email: data.email.trim().toLowerCase(),
        bookmark_ids: [...new Set(data.bookmarkIds)],
      }),
      signal: AbortSignal.timeout(15000),
    });
    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; bookmark_ids?: unknown; message?: string; code?: string }
      | null;
    if (!res.ok || body?.ok === false) {
      return {
        ok: false as const,
        error: body?.message || body?.code || `WordPress returned HTTP ${res.status}.`,
      };
    }
    return {
      ok: true as const,
      bookmarkIds: Array.isArray(body?.bookmark_ids)
        ? [...new Set(body.bookmark_ids.map(Number).filter((id) => Number.isFinite(id) && id > 0))]
        : data.bookmarkIds,
    };
  });

export const fetchWpGuide = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1), url: z.string().optional() }))
  .handler(async ({ data }) => {
    const slugs = guideSlugCandidates(data.slug, data.url);
    const urls = [
      data.url,
      ...slugs.map((s) => `${WP_ORIGIN}/guide/${s}/`),
    ].filter((url, i, all): url is string => !!url && all.indexOf(url) === i);

    const [restHits, page] = await Promise.all([
      Promise.all(
        slugs.map((s) =>
          wpGet<WpGuide[]>(
            `/wp-json/wp/v2/travel_guide?slug=${encodeURIComponent(s)}&_embed=1`,
            {},
            15000,
          ).catch(() => null),
        ),
      ),
      loadListingPageHtml(urls, 20000),
    ]);

    const restRow = restHits
      .map((res) => (res?.ok && Array.isArray(res.data) ? res.data[0] : undefined))
      .find(Boolean);

    let mapped: Guide | null = restRow ? mapGuide(restRow) : null;
    const local =
      localGuides.find((g) => slugs.includes(g.slug) || (g.siteUrl && slugs.some((s) => g.siteUrl?.includes(s)))) ??
      mapped ??
      null;
    if (page) {
      const fromHtml = guideFromHtml(mapped?.slug || data.slug, page.url, page.html, mapped ?? local);
      const htmlRich = fromHtml.sections.some((s) => (s.blocks?.length ?? 0) > 1);
      if (htmlRich && fromHtml.sections.length >= (mapped?.sections.length ?? 0)) {
        return {
          ...fromHtml,
          slug: mapped?.slug || fromHtml.slug,
          title: mapped?.title || fromHtml.title,
          date: mapped?.date || fromHtml.date,
          topic: mapped?.topic || fromHtml.topic,
          categories: mapped?.categories,
          tags: mapped?.tags,
          image: pickListingImage(mapped?.image, fromHtml.image, local?.image),
        };
      }
    }
    return mapped ?? local ?? null;
  });

async function loadAuthorContent(authorId: number, headers: HeadersInit) {
  const [mine, trips] = await Promise.all([
    wpGet<WpListing[]>(
      `/wp-json/wp/v2/listing?author=${authorId}&per_page=30&_embed=1`,
      headers,
      15000,
    ),
    wpGet<WpUserTrip[]>(
      `/wp-json/wp/v2/user_trip?author=${authorId}&per_page=20&orderby=date&order=desc`,
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
      const xmlMe = await fetchMeXmlRpc(username, password);
      const cookie = await wpCookieLogin(username, password);
      const cookieMe = cookie ? await fetchMeWithCookie(cookie) : null;
      me = cookieMe ?? xmlMe;
      if (!me) {
        return {
          ok: false as const,
          error: "That username or password was not accepted. Use the same login as xplorepondy.com.",
        };
      }
      method = "wordpress";
      authHeaders = cookie
        ? { Cookie: cookie }
        : { Authorization: basic };
    }

    const user = mapUser(me);
    const { myListings, myTrips } = await loadAuthorContent(user.id, authHeaders);
    const bookmarkIds = bookmarkIdsFromUserMeta(me.meta);
    return { ok: true as const, user, myListings, myTrips, bookmarkIds, method };
  });
