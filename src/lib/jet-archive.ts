import { parseOpenHoursHtml } from "@/lib/hours";
import { archiveCategory, DEEP_ARCHIVE_SLUGS, WP_PARENT_ARCHIVES } from "@/lib/listing-categories";
import type { Category, DayHours, ListingMetaGroup, ListingTaxGroup, ListingTaxTerm } from "@/lib/types";
import { cachedOriginText } from "@/lib/origin-cache";
import { decodeEntities } from "@/lib/utils";

export type JetArchiveHit = {
  slug: string;
  mustTry: string[];
  cafeTypes: string[];
  facets: ListingTaxGroup[];
  groups: ListingMetaGroup[];
  lat?: number;
  lng?: number;
  hours?: string;
  openNow?: boolean;
  weeklyHours?: DayHours[];
  featured?: boolean;
  listingPackage?: number;
  category?: Category;
  kind?: string;
};

const SKIP_QVAR = new Set([
  "query",
  "is_open_now",
  "_featured",
  "_combined_rating",
  "pub-type",
  "cuisine-type",
  "restaurant-types",
  "property-type",
  "property-category",
  "water-sport",
  "listing_category",
  "listing_feature",
  "region",
  "activity-type",
]);

const KEY_LABEL: Record<string, string> = {
  cafe_type: "Cafe type",
  cafe_amenities: "Cafe amenities",
  cafe_features: "Cafe features",
  cafe_atmosphere: "Cafe atmosphere",
  restaurant_amenities: "Restaurant amenities",
  restaurant_service_options: "Service options",
  pub_entertainment: "Entertainment",
  pub_drinks_amp_food: "Drinks & food",
  dining_options: "Dining options",
  beach_amenities: "Beach amenities",
  beach_atmosphere: "Beach atmosphere",
  beach_activities: "Beach activities",
  beach_timing_infos: "Timings",
  beach_shopping: "Shopping",
  hotel_amenities: "Hotel amenities",
  hotel_facilities: "Facilities",
  bike_models: "Bike models",
  transport_amenities: "Transport amenities",
  transport_features: "Transport features",
  _activity_type: "Activity type",
  _activity_amenities: "Activity amenities",
  price_range_filter: "Price range",
  amenities: "Amenities",
};

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

export function facetSlug(value: string): string {
  return stripTags(value)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitValues(raw: string): string[] {
  return stripTags(raw)
    .split(/,|\/|;/)
    .map((s) => s.replace(/^[:\-\s]+/, "").trim())
    .filter((s) => s.length > 1 && s.length < 72 && !/^https?:/i.test(s));
}

function termsFrom(values: string[]): ListingTaxTerm[] {
  const seen = new Set<string>();
  const terms: ListingTaxTerm[] = [];
  for (const name of values) {
    const slug = facetSlug(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    terms.push({ name, slug });
  }
  return terms;
}

export function archiveMetaVars(html: string): string[] {
  const out: string[] = [];
  for (const match of html.matchAll(/data-query-var="([^"]+)"/g)) {
    const value = match[1];
    if (!value || SKIP_QVAR.has(value) || value.includes(",")) continue;
    if (!out.includes(value)) out.push(value);
  }
  return out;
}

function labelToKey(title: string, qvars: string[]): string | null {
  const slug = facetSlug(title);
  if (!slug || /must-try|known-for/.test(slug)) return null;
  const direct = qvars.find((v) => facetSlug(v.replace(/^_/, "")) === slug || v === slug);
  if (direct) return direct;
  if (/cafe-type/.test(slug)) return qvars.find((v) => v === "cafe_type") ?? "cafe_type";
  if (/amenit/.test(slug)) return qvars.find((v) => v.includes("amenit")) ?? "amenities";
  if (/atmosphere/.test(slug)) return qvars.find((v) => v.includes("atmosphere")) ?? slug;
  if (/feature/.test(slug)) return qvars.find((v) => v.includes("feature") || v.includes("facilit")) ?? slug;
  return qvars.find((v) => facetSlug(v).includes(slug) || slug.includes(facetSlug(v))) ?? slug.replace(/-/g, "_");
}

function widgetToKey(cls: string, qvars: string[], used: Set<string>): string | null {
  const pick = (pred: (v: string) => boolean) => qvars.find((v) => !used.has(v) && pred(v)) ?? null;
  if (cls.includes("amenities")) return pick((v) => v.includes("amenit")) ?? "amenities";
  if (cls.includes("list-archive-type")) {
    return pick((v) => /type/.test(v) || v === "bike_models" || v === "_activity_type");
  }
  if (/\blist-archive\b/.test(cls) && !cls.includes("type") && !cls.includes("amenities")) {
    return (
      pick((v) =>
        /atmosphere|feature|entertainment|activit|timing|shopping|drink|dining|facilit/.test(v),
      ) ?? pick((v) => v !== "price_range_filter")
    );
  }
  return null;
}

function addFacet(map: Map<string, ListingTaxGroup>, key: string, label: string, values: string[]) {
  const terms = termsFrom(values);
  if (!terms.length) return;
  const existing = map.get(key);
  if (!existing) {
    map.set(key, { key, label: KEY_LABEL[key] ?? label, terms });
    return;
  }
  const have = new Set(existing.terms.map((t) => t.slug));
  for (const term of terms) {
    if (have.has(term.slug)) continue;
    have.add(term.slug);
    existing.terms.push(term);
  }
}

function parseMapMarkers(html: string): Map<number, { lat: number; lng: number }> {
  const out = new Map<number, { lat: number; lng: number }>();
  for (const match of html.matchAll(/data-markers="([^"]+)"/g)) {
    const raw = decodeEntities(match[1]);
    try {
      const rows = JSON.parse(raw) as Array<{ id?: number; latLang?: { lat?: number; lng?: number } }>;
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        const lat = Number(row.latLang?.lat);
        const lng = Number(row.latLang?.lng);
        if (!row.id || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        out.set(row.id, { lat, lng });
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}

export function parseArchiveHtml(html: string, archiveSlug?: string): JetArchiveHit[] {
  const qvars = archiveMetaVars(html);
  const markers = parseMapMarkers(html);
  const archiveCat = archiveSlug ? archiveCategory(archiveSlug) : undefined;
  const hits: JetArchiveHit[] = [];
  const chunks = html.split(/data-post-id="/).slice(1);
  let rank = 0;
  for (const chunk of chunks) {
    const id = Number(chunk.slice(0, chunk.indexOf('"')));
    const href = chunk.match(/https:\/\/xplorepondy\.com\/listing\/[^"\s>]+/);
    if (!href) continue;
    const slug = href[0].replace(/\/$/, "").split("/").pop();
    if (!slug) continue;
    rank += 1;
    const window = chunk.slice(0, 36000);
    const facets = new Map<string, ListingTaxGroup>();
    const mustTry: string[] = [];
    const cafeTypes: string[] = [];
    const used = new Set<string>();
    let hoursInfo = parseOpenHoursHtml(window);
    if (!hoursInfo.hours && !hoursInfo.weeklyHours.length && hoursInfo.openNow == null) {
      const extra = parseOpenHoursHtml(chunk.slice(0, 80000));
      if (extra.hours || extra.weeklyHours.length || extra.openNow != null) hoursInfo = extra;
    }
    const geo = Number.isFinite(id) ? markers.get(id) : undefined;
    const featured = /<(?:div|span)[^>]*class="[^"]*\bfeatured-nl\b/.test(window) || /\bbadge-nl featured-nl\b/.test(window);
    const kind = decodeEntities(
      window.match(/listing-category-tag[^"]*"[^>]*>\s*([^<]+)/)?.[1] ??
        window.match(/listing-category-tag-nl">([^<]+)/)?.[1] ??
        "",
    )
      .split(",")[0]
      ?.trim();

    const labeled = [...window.matchAll(/<strong>([^<]+)<\/strong>\s*([^<]*)/g)];
    for (const [, titleRaw, valuesRaw] of labeled) {
      const title = stripTags(titleRaw).replace(/:$/, "").trim();
      const values = splitValues(valuesRaw);
      if (!title || !values.length) continue;
      if (/must try/i.test(title)) {
        for (const v of values) if (!mustTry.includes(v)) mustTry.push(v);
        continue;
      }
      if (/known for/i.test(title)) continue;
      const key = labelToKey(title, qvars);
      if (!key) continue;
      addFacet(facets, key, title, values);
      used.add(key);
      if (key === "cafe_type") cafeTypes.push(...values);
    }

    const widgets = [...window.matchAll(/class="([^"]*\blist-archive[a-z-]*[^"]*)"/g)];
    for (let i = 0; i < widgets.length; i++) {
      const cls = widgets[i][1] ?? "";
      const start = widgets[i].index ?? 0;
      const end = i + 1 < widgets.length ? (widgets[i + 1].index ?? start + 4500) : start + 4500;
      const body = window.slice(start, Math.min(end, start + 5000));
      const checks = [...body.matchAll(/jet-check-list__item-content">([\s\S]*?)<\/div>/g)]
        .map((row) => stripTags(row[1] ?? ""))
        .filter((item) => item.length > 1 && item.length < 72);
      if (!checks.length) continue;
      const key = widgetToKey(cls, qvars, used);
      if (!key) continue;
      used.add(key);
      addFacet(facets, key, KEY_LABEL[key] ?? key.replace(/[_-]+/g, " "), checks);
    }

    const list = [...facets.values()].filter((g) => g.terms.length);
    const hasHours = Boolean(hoursInfo.hours || hoursInfo.weeklyHours.length || hoursInfo.openNow != null);
    if (!list.length && !mustTry.length && !geo && !hasHours && !featured) continue;
    hits.push({
      slug,
      mustTry,
      cafeTypes: [...new Set(cafeTypes)],
      facets: list,
      groups: list.map((g) => ({
        title: g.label,
        items: g.terms.map((t) => ({ label: t.name, included: true })),
      })),
      lat: geo?.lat,
      lng: geo?.lng,
      hours: hoursInfo.hours || undefined,
      openNow: hoursInfo.openNow,
      weeklyHours: hoursInfo.weeklyHours.length ? hoursInfo.weeklyHours : undefined,
      featured: featured || undefined,
      listingPackage: rank,
      category: archiveCat ?? (kind ? archiveCategory(facetSlug(kind)) : undefined),
      kind: kind || undefined,
    });
  }
  return hits;
}

function mergeHit(prev: JetArchiveHit, hit: JetArchiveHit): JetArchiveHit {
  const keys = new Set(prev.facets.map((g) => g.key));
  const facets = [...prev.facets];
  const groups = [...prev.groups];
  for (const group of hit.facets) {
    if (keys.has(group.key)) continue;
    facets.push(group);
    groups.push({
      title: group.label,
      items: group.terms.map((t) => ({ label: t.name, included: true })),
    });
  }
  return {
    ...prev,
    facets,
    groups,
    mustTry: prev.mustTry.length ? prev.mustTry : hit.mustTry,
    cafeTypes: prev.cafeTypes.length ? prev.cafeTypes : hit.cafeTypes,
    lat: prev.lat ?? hit.lat,
    lng: prev.lng ?? hit.lng,
    hours: prev.hours || hit.hours,
    openNow: prev.openNow ?? hit.openNow,
    weeklyHours: prev.weeklyHours?.length ? prev.weeklyHours : hit.weeklyHours,
    featured: prev.featured || hit.featured,
    category: prev.category ?? hit.category,
    kind: prev.kind || hit.kind,
    listingPackage:
      prev.listingPackage != null && hit.listingPackage != null
        ? Math.min(prev.listingPackage, hit.listingPackage)
        : (prev.listingPackage ?? hit.listingPackage),
  };
}

async function resolveListingSlugs(ids: number[]): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const unique = [...new Set(ids.filter((id) => id > 0))];
  for (let i = 0; i < unique.length; i += 80) {
    const chunk = unique.slice(i, i + 80);
    try {
      const res = await cachedOriginText(
        `https://xplorepondy.com/wp-json/wp/v2/listing?include=${chunk.join(",")}&per_page=100&_fields=id,slug`,
        20 * 60 * 1000,
        15000,
        { Accept: "application/json", "User-Agent": "XplorePondyApp/1.0" },
      );
      if (!res.ok) continue;
      const rows = JSON.parse(res.body) as Array<{ id?: number; slug?: string }>;
      for (const row of rows) if (row.id && row.slug) map.set(row.id, row.slug);
    } catch {
      /* ignore */
    }
  }
  return map;
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await cachedOriginText(url, 20 * 60 * 1000, 15000, {
      Accept: "text/html",
      "User-Agent": "XplorePondyApp/1.0",
    });
    return res.ok ? res.body : "";
  } catch {
    return "";
  }
}

export function parseIsOpenNowCount(html: string): number {
  let max = 0;
  for (const match of html.matchAll(/is_open_now"\s*:\s*\{\s*"1"\s*:\s*"?(\d+)/g)) {
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
}

export type OpenNowSnapshot = {
  total: number;
  byCategory: Record<Category, number>;
  rows: Array<{
    slug: string;
    hours?: string;
    openNow?: boolean;
    weeklyHours?: DayHours[];
  }>;
};

function hoursRows(bySlug: Map<string, JetArchiveHit>) {
  return [...bySlug.values()]
    .filter((hit) => hit.hours || hit.weeklyHours?.length || hit.openNow != null)
    .map((hit) => ({
      slug: hit.slug,
      hours: hit.hours,
      openNow: hit.openNow,
      weeklyHours: hit.weeklyHours,
    }));
}

export async function loadOpenNowSnapshot(): Promise<OpenNowSnapshot> {
  const bySlug = new Map<string, JetArchiveHit>();
  const byCategory: Record<Category, number> = { places: 0, activities: 0, food: 0, stay: 0 };
  await Promise.all(
    WP_PARENT_ARCHIVES.map(async (archive) => {
      const html = await fetchHtml(`https://xplorepondy.com/listing-category/${encodeURIComponent(archive.slug)}/`);
      if (!html) return;
      byCategory[archive.category] = parseIsOpenNowCount(html);
      mergeHoursFromHtml(html, bySlug);
    }),
  );
  const rows = hoursRows(bySlug);
  const total = byCategory.places + byCategory.activities + byCategory.food + byCategory.stay;
  return { total, byCategory, rows };
}

function listingSlugFromUrl(url: string) {
  return url.replace(/\/$/, "").split("/").pop() ?? "";
}

function mergeHoursFromHtml(html: string, into: Map<string, JetArchiveHit>) {
  for (const match of html.matchAll(/https:\/\/xplorepondy\.com\/listing\/[^"'\s<]+/g)) {
    const slug = listingSlugFromUrl(match[0]);
    if (!slug) continue;
    const start = match.index ?? 0;
    const slice = html.slice(Math.max(0, start - 4000), start + 28000);
    const hoursInfo = parseOpenHoursHtml(slice);
    if (!hoursInfo.hours && !hoursInfo.weeklyHours.length && hoursInfo.openNow == null) continue;
    const prev = into.get(slug);
    if (!prev) {
      into.set(slug, {
        slug,
        mustTry: [],
        cafeTypes: [],
        facets: [],
        groups: [],
        hours: hoursInfo.hours || undefined,
        openNow: hoursInfo.openNow,
        weeklyHours: hoursInfo.weeklyHours.length ? hoursInfo.weeklyHours : undefined,
      });
      continue;
    }
    if (!prev.hours) prev.hours = hoursInfo.hours || undefined;
    if (prev.openNow == null) prev.openNow = hoursInfo.openNow;
    if (!prev.weeklyHours?.length && hoursInfo.weeklyHours.length) prev.weeklyHours = hoursInfo.weeklyHours;
  }
}

async function pool<T>(items: T[], size: number, worker: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      while (queue.length) {
        const next = queue.shift();
        if (next !== undefined) await worker(next);
      }
    }),
  );
}

export async function loadJetArchiveMeta(
  categorySlugs: string[],
  into?: Map<string, JetArchiveHit>,
): Promise<Map<string, JetArchiveHit>> {
  const bySlug = into ?? new Map<string, JetArchiveHit>();
  const markers = new Map<number, { lat: number; lng: number }>();
  const slugs = [...new Set(categorySlugs.filter(Boolean))].slice(0, 16);
  await pool(slugs, 4, async (cat) => {
    const maxPages = DEEP_ARCHIVE_SLUGS.has(cat) ? 10 : 3;
    for (let page = 1; page <= maxPages; page++) {
      const url =
        page === 1
          ? `https://xplorepondy.com/listing-category/${encodeURIComponent(cat)}/`
          : `https://xplorepondy.com/listing-category/${encodeURIComponent(cat)}/?jsf=jet-engine&pagenum=${page}`;
      let html = "";
      try {
        html = await fetchHtml(url);
      } catch {
        break;
      }
      if (!html || !html.includes("data-post-id=")) break;
      for (const [id, geo] of parseMapMarkers(html)) markers.set(id, geo);
      const hits = parseArchiveHtml(html, cat);
      mergeHoursFromHtml(html, bySlug);
      if (!hits.length && page > 1) break;
      let fresh = 0;
      for (const hit of hits) {
        const prev = bySlug.get(hit.slug);
        if (!prev) {
          bySlug.set(hit.slug, hit);
          fresh += 1;
          continue;
        }
        bySlug.set(hit.slug, mergeHit(prev, hit));
      }
      if (page > 1 && fresh === 0) break;
      if (hits.length < 8 && page > 1) break;
    }
  });

  const known = new Set([...bySlug.values()].map((h) => h.slug));
  const missingIds = [...markers.keys()];
  if (missingIds.length) {
    const idSlugs = await resolveListingSlugs(missingIds);
    for (const [id, slug] of idSlugs) {
      const geo = markers.get(id);
      if (!geo) continue;
      const prev = bySlug.get(slug);
      if (prev) {
        if (prev.lat == null) prev.lat = geo.lat;
        if (prev.lng == null) prev.lng = geo.lng;
        continue;
      }
      if (known.has(slug)) continue;
      bySlug.set(slug, {
        slug,
        mustTry: [],
        cafeTypes: [],
        facets: [],
        groups: [],
        lat: geo.lat,
        lng: geo.lng,
      });
    }
  }
  return bySlug;
}
