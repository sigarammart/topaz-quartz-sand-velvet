import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { i as string, n as number, r as object } from "../_libs/zod.mjs";
import { _ as parseOpenHoursHtml, d as guides, m as listings, n as FILTER_TAX_KEYS } from "./filters-CkhHKy69.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wp-api-BHblQDum.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var SKIP_QVAR = /* @__PURE__ */ new Set([
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
	"activity-type"
]);
var KEY_LABEL = {
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
	amenities: "Amenities"
};
function stripTags(html) {
	return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&/g, "&").replace(/"/g, "\"").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
function facetSlug(value) {
	return stripTags(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function splitValues(raw) {
	return stripTags(raw).split(/,|\/|;/).map((s) => s.replace(/^[:\-\s]+/, "").trim()).filter((s) => s.length > 1 && s.length < 72 && !/^https?:/i.test(s));
}
function termsFrom(values) {
	const seen = /* @__PURE__ */ new Set();
	const terms = [];
	for (const name of values) {
		const slug = facetSlug(name);
		if (!slug || seen.has(slug)) continue;
		seen.add(slug);
		terms.push({
			name,
			slug
		});
	}
	return terms;
}
function archiveMetaVars(html) {
	const out = [];
	for (const match of html.matchAll(/data-query-var="([^"]+)"/g)) {
		const value = match[1];
		if (!value || SKIP_QVAR.has(value) || value.includes(",")) continue;
		if (!out.includes(value)) out.push(value);
	}
	return out;
}
function labelToKey(title, qvars) {
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
function widgetToKey(cls, qvars, used) {
	const pick = (pred) => qvars.find((v) => !used.has(v) && pred(v)) ?? null;
	if (cls.includes("amenities")) return pick((v) => v.includes("amenit")) ?? "amenities";
	if (cls.includes("list-archive-type")) return pick((v) => /type/.test(v) || v === "bike_models" || v === "_activity_type");
	if (/\blist-archive\b/.test(cls) && !cls.includes("type") && !cls.includes("amenities")) return pick((v) => /atmosphere|feature|entertainment|activit|timing|shopping|drink|dining|facilit/.test(v)) ?? pick((v) => v !== "price_range_filter");
	return null;
}
function addFacet(map, key, label, values) {
	const terms = termsFrom(values);
	if (!terms.length) return;
	const existing = map.get(key);
	if (!existing) {
		map.set(key, {
			key,
			label: KEY_LABEL[key] ?? label,
			terms
		});
		return;
	}
	const have = new Set(existing.terms.map((t) => t.slug));
	for (const term of terms) {
		if (have.has(term.slug)) continue;
		have.add(term.slug);
		existing.terms.push(term);
	}
}
function parseMapMarkers(html) {
	const out = /* @__PURE__ */ new Map();
	for (const match of html.matchAll(/data-markers="([^"]+)"/g)) {
		const raw = match[1].replace(/"/g, "\"").replace(/&/g, "&").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
		try {
			const rows = JSON.parse(raw);
			if (!Array.isArray(rows)) continue;
			for (const row of rows) {
				const lat = Number(row.latLang?.lat);
				const lng = Number(row.latLang?.lng);
				if (!row.id || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
				out.set(row.id, {
					lat,
					lng
				});
			}
		} catch {}
	}
	return out;
}
function parseArchiveHtml(html) {
	const qvars = archiveMetaVars(html);
	const markers = parseMapMarkers(html);
	const hits = [];
	const chunks = html.split(/data-post-id="/).slice(1);
	for (const chunk of chunks) {
		const id = Number(chunk.slice(0, chunk.indexOf("\"")));
		const href = chunk.match(/https:\/\/xplorepondy\.com\/listing\/[^"\s>]+/);
		if (!href) continue;
		const slug = href[0].replace(/\/$/, "").split("/").pop();
		if (!slug) continue;
		const window = chunk.slice(0, 36e3);
		const facets = /* @__PURE__ */ new Map();
		const mustTry = [];
		const cafeTypes = [];
		const used = /* @__PURE__ */ new Set();
		const hoursInfo = parseOpenHoursHtml(window);
		const geo = Number.isFinite(id) ? markers.get(id) : void 0;
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
			const end = i + 1 < widgets.length ? widgets[i + 1].index ?? start + 4500 : start + 4500;
			const checks = [...window.slice(start, Math.min(end, start + 5e3)).matchAll(/jet-check-list__item-content">([\s\S]*?)<\/div>/g)].map((row) => stripTags(row[1] ?? "")).filter((item) => item.length > 1 && item.length < 72);
			if (!checks.length) continue;
			const key = widgetToKey(cls, qvars, used);
			if (!key) continue;
			used.add(key);
			addFacet(facets, key, KEY_LABEL[key] ?? key.replace(/[_-]+/g, " "), checks);
		}
		const list = [...facets.values()].filter((g) => g.terms.length);
		if (!list.length && !mustTry.length && !geo && !hoursInfo.hours) continue;
		hits.push({
			slug,
			mustTry,
			cafeTypes: [...new Set(cafeTypes)],
			facets: list,
			groups: list.map((g) => ({
				title: g.label,
				items: g.terms.map((t) => ({
					label: t.name,
					included: true
				}))
			})),
			lat: geo?.lat,
			lng: geo?.lng,
			hours: hoursInfo.hours || void 0,
			openNow: hoursInfo.openNow,
			weeklyHours: hoursInfo.weeklyHours.length ? hoursInfo.weeklyHours : void 0
		});
	}
	return hits;
}
function mergeHit(prev, hit) {
	const keys = new Set(prev.facets.map((g) => g.key));
	const facets = [...prev.facets];
	const groups = [...prev.groups];
	for (const group of hit.facets) {
		if (keys.has(group.key)) continue;
		facets.push(group);
		groups.push({
			title: group.label,
			items: group.terms.map((t) => ({
				label: t.name,
				included: true
			}))
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
		weeklyHours: prev.weeklyHours?.length ? prev.weeklyHours : hit.weeklyHours
	};
}
async function resolveListingSlugs(ids) {
	const map = /* @__PURE__ */ new Map();
	const unique = [...new Set(ids.filter((id) => id > 0))];
	for (let i = 0; i < unique.length; i += 80) {
		const chunk = unique.slice(i, i + 80);
		try {
			const res = await fetch(`https://xplorepondy.com/wp-json/wp/v2/listing?include=${chunk.join(",")}&per_page=100&_fields=id,slug`, {
				headers: {
					Accept: "application/json",
					"User-Agent": "XplorePondyApp/1.0"
				},
				signal: AbortSignal.timeout(15e3)
			});
			if (!res.ok) continue;
			const rows = await res.json();
			for (const row of rows) if (row.id && row.slug) map.set(row.id, row.slug);
		} catch {}
	}
	return map;
}
async function fetchHtml(url) {
	const res = await fetch(url, {
		headers: {
			Accept: "text/html",
			"User-Agent": "XplorePondyApp/1.0"
		},
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) return "";
	return res.text();
}
async function pool(items, size, worker) {
	const queue = [...items];
	await Promise.all(Array.from({ length: Math.min(size, queue.length) }, async () => {
		while (queue.length) {
			const next = queue.shift();
			if (next !== void 0) await worker(next);
		}
	}));
}
async function loadJetArchiveMeta(categorySlugs) {
	const bySlug = /* @__PURE__ */ new Map();
	const markers = /* @__PURE__ */ new Map();
	await pool([...new Set(categorySlugs.filter(Boolean))].slice(0, 10), 8, async (cat) => {
		for (let page = 1; page <= 2; page++) {
			const url = page === 1 ? `https://xplorepondy.com/listing-category/${encodeURIComponent(cat)}/` : `https://xplorepondy.com/listing-category/${encodeURIComponent(cat)}/?jsf=jet-engine&pagenum=${page}`;
			let html = "";
			try {
				html = await fetchHtml(url);
			} catch {
				break;
			}
			if (!html || !html.includes("data-post-id=")) break;
			for (const [id, geo] of parseMapMarkers(html)) markers.set(id, geo);
			const hits = parseArchiveHtml(html);
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
				lng: geo.lng
			});
		}
	}
	return bySlug;
}
var WP_ORIGIN = "https://xplorepondy.com";
var FALLBACK_IMAGE = {
	places: "/images/french-quarter.jpg",
	activities: "/images/scuba.jpg",
	food: "/images/cafe.jpg",
	stay: "/images/hotel.jpg"
};
var PARENT_TO_CATEGORY = {
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
	resort: "stay"
};
var SKIP_KIND = /* @__PURE__ */ new Set([
	"tourist-attractions",
	"food-beverage",
	"accommodation",
	"activities",
	"rentals",
	"services",
	"events"
]);
var TAX_LABELS = {
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
	stories_category: "Stories"
};
var TAX_ORDER = Object.keys(TAX_LABELS);
function decodeHtml(value) {
	const named = {
		amp: "&",
		quot: "\"",
		apos: "'",
		lt: "<",
		gt: ">",
		nbsp: " "
	};
	return value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body) => {
		if (body[0] === "#") {
			const n = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : Number(body.slice(1));
			return Number.isFinite(n) ? String.fromCharCode(n) : match;
		}
		return named[body.toLowerCase()] ?? match;
	}).replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n").replace(/[ \t]+/g, " ").trim();
}
function mediaUrl(media) {
	const sizes = media?.media_details?.sizes ?? {};
	return sizes["listeo-listing-grid"]?.source_url || sizes.medium_large?.source_url || sizes.large?.source_url || sizes.medium?.source_url || media?.source_url || "";
}
function categoryFromTerms(terms) {
	const slugs = terms.map((t) => t.slug ?? "");
	let category = "places";
	for (const c of [
		"stay",
		"food",
		"activities",
		"places"
	]) if (slugs.some((s) => PARENT_TO_CATEGORY[s] === c)) {
		category = c;
		break;
	}
	const kindTerm = terms.find((t) => t.slug && !SKIP_KIND.has(t.slug)) ?? terms[0];
	return {
		category,
		kind: kindTerm?.name ? decodeHtml(kindTerm.name) : "Listing",
		tags: terms.map((t) => decodeHtml(t.name ?? "")).filter(Boolean)
	};
}
function urlTail(url) {
	return url.split("/").filter(Boolean).pop() ?? "";
}
function findLocal(slug, link) {
	const linkTail = link ? urlTail(link) : "";
	return listings.find((l) => l.slug === slug) || listings.find((l) => urlTail(l.siteUrl) === slug) || (linkTail ? listings.find((l) => l.slug === linkTail || urlTail(l.siteUrl) === linkTail) : void 0);
}
function truthyMeta(value) {
	if (value === true || value === 1) return true;
	if (typeof value === "string") return value.toLowerCase() === "true" || value === "1" || value.toLowerCase() === "yes";
	return false;
}
function taxIds(raw, key) {
	const value = raw[key];
	return Array.isArray(value) ? value.filter((id) => typeof id === "number" && id > 0) : [];
}
function extractTaxonomies(raw, maps) {
	const groups = [];
	const seen = /* @__PURE__ */ new Set();
	if (maps) for (const key of Object.keys(TAX_LABELS)) {
		const map = maps[key];
		if (!map) continue;
		const terms = [];
		const used = /* @__PURE__ */ new Set();
		for (const id of taxIds(raw, key)) {
			const term = map.get(id);
			if (!term?.name && !term?.slug) continue;
			const slug = term.slug || String(id);
			if (used.has(slug)) continue;
			used.add(slug);
			terms.push({
				name: decodeHtml(term.name || slug),
				slug
			});
		}
		if (!terms.length) continue;
		seen.add(key);
		groups.push({
			key,
			label: TAX_LABELS[key] ?? key.replace(/[-_]/g, " "),
			terms
		});
	}
	for (const group of raw._embedded?.["wp:term"] ?? []) {
		if (!group?.length) continue;
		const key = group[0]?.taxonomy ?? "";
		if (!key || seen.has(key)) continue;
		seen.add(key);
		const terms = [];
		const used = /* @__PURE__ */ new Set();
		for (const term of group) {
			const slug = term.slug || "";
			const name = decodeHtml(term.name ?? "");
			if (!name || used.has(slug || name)) continue;
			used.add(slug || name);
			terms.push({
				name,
				slug: slug || name.toLowerCase().replace(/\s+/g, "-")
			});
		}
		if (!terms.length) continue;
		groups.push({
			key,
			label: TAX_LABELS[key] ?? key.replace(/[-_]/g, " "),
			terms
		});
	}
	groups.sort((a, b) => {
		const ia = TAX_ORDER.indexOf(a.key);
		const ib = TAX_ORDER.indexOf(b.key);
		return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
	});
	return groups;
}
function parseItinerary(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
	const stops = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of Object.values(raw)) {
		if (!item || typeof item !== "object") continue;
		const row = item;
		const title = decodeHtml(String(row.title ?? row.name ?? "")).trim();
		if (!title) continue;
		const time = decodeHtml(String(row.time ?? "")).trim();
		const day = decodeHtml(String(row.day ?? "")).trim();
		const key = `${time}|${day}|${title}`;
		if (seen.has(key)) continue;
		seen.add(key);
		const description = decodeHtml(String(row.description ?? row.content ?? "")).trim();
		stops.push({
			time: time || void 0,
			day: day || void 0,
			title,
			description: description || void 0
		});
	}
	return stops;
}
function parseFaqs(raw) {
	if (!raw || typeof raw !== "object") return [];
	const rows = Array.isArray(raw) ? raw : Object.values(raw);
	const faqs = [];
	for (const item of rows) {
		if (!item || typeof item !== "object") continue;
		const row = item;
		const question = decodeHtml(String(row.question ?? row.q ?? row.title ?? "")).trim();
		const answer = decodeHtml(String(row.answer ?? row.a ?? row.description ?? "")).trim();
		if (question && answer) faqs.push({
			question,
			answer
		});
	}
	return faqs;
}
function extractMenuImages(raw) {
	if (!Array.isArray(raw)) return [];
	return raw.map((item) => {
		if (typeof item === "string") return item;
		if (item && typeof item === "object" && "url" in item) return String(item.url ?? "");
		return "";
	}).filter((url) => /^https?:\/\//.test(url));
}
function extractJsonLd(html) {
	const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
	const out = {};
	for (const block of blocks) try {
		const data = JSON.parse(block[1] ?? "");
		const nodes = Array.isArray(data) ? data : data["@graph"] && Array.isArray(data["@graph"]) ? data["@graph"] : [data];
		for (const node of nodes) {
			const type = node["@type"];
			if (!(Array.isArray(type) ? type : [type]).some((t) => t === "LocalBusiness" || t === "Restaurant" || t === "Hotel" || t === "TouristAttraction" || t === "Place" || t === "Product")) continue;
			const phone = String(node.telephone ?? "").trim();
			if (phone) out.phone = phone;
			const addr = node.address;
			if (addr && typeof addr === "object") {
				const a = addr;
				const street = decodeHtml(String(a.streetAddress ?? "")).trim();
				const locality = decodeHtml(String(a.addressLocality ?? "")).trim();
				const region = decodeHtml(String(a.addressRegion ?? "")).trim();
				const postal = decodeHtml(String(a.postalCode ?? "")).trim();
				const parts = [street];
				for (const part of [
					locality,
					region,
					postal
				]) if (part && !parts.some((p) => p.toLowerCase().includes(part.toLowerCase()))) parts.push(part);
				if (parts.length) out.address = parts.join(", ");
			} else if (typeof addr === "string" && addr.trim()) out.address = decodeHtml(addr.trim());
			const rating = node.aggregateRating;
			if (rating && typeof rating === "object") {
				const r = rating;
				const value = Number(r.ratingValue);
				const count = Number(r.reviewCount);
				if (value > 0) out.rating = value;
				if (count > 0) out.reviews = count;
			}
			const priceRange = String(node.priceRange ?? "").trim();
			if (priceRange && !/^not available$/i.test(priceRange)) out.priceRange = priceRange;
		}
	} catch {}
	return out;
}
function parseCheckItem(raw) {
	const text = decodeHtml(raw).replace(/\s+/g, " ").trim();
	if (!text) return null;
	if (/^[✅✔✓]/.test(text)) return {
		label: text.replace(/^[✅✔✓]\s*/, "").trim(),
		included: true
	};
	if (/^[❌✖✗]/.test(text)) return {
		label: text.replace(/^[❌✖✗]\s*/, "").trim(),
		included: false
	};
	return { label: text };
}
function extractJetMetaGroups(html) {
	const groups = [];
	let price;
	const headingRe = /<h3 class="listing-field-heading">([\s\S]*?)<\/h3>/gi;
	let match;
	while (match = headingRe.exec(html)) {
		const title = decodeHtml(match[1]).replace(/\s+/g, " ").trim();
		if (!title || /nearby|related|popular locations/i.test(title)) continue;
		const priceMatch = title.match(/^price for two\s*:?\s*(.+)$/i);
		if (priceMatch) {
			price = priceMatch[1].trim();
			continue;
		}
		let after = html.slice(match.index + match[0].length, match.index + match[0].length + 7e3);
		const nextHeading = after.search(/<h3 class="listing-field-heading">/i);
		if (nextHeading >= 0) after = after.slice(0, nextHeading);
		const items = [...after.matchAll(/jet-check-list__item-content">([\s\S]*?)<\/div>/g)].map((row) => parseCheckItem(row[1] ?? "")).filter((item) => !!item && item.label.length > 1 && item.label.length < 80);
		if (!items.length) continue;
		groups.push({
			title,
			items
		});
	}
	const merged = [];
	for (const group of groups) {
		const existing = merged.find((g) => g.title.toLowerCase() === group.title.toLowerCase());
		if (!existing) {
			merged.push({
				title: group.title,
				items: [...group.items]
			});
			continue;
		}
		const seen = new Set(existing.items.map((i) => i.label.toLowerCase()));
		for (const item of group.items) if (!seen.has(item.label.toLowerCase())) existing.items.push(item);
	}
	return {
		groups: merged,
		price
	};
}
function extractListingGeo(html) {
	const pair = (html.match(/listeo-listing-map[\s\S]{0,2500}/i)?.[0] ?? html).match(/data-latitude="([\d.-]+)"[\s\S]{0,200}?data-longitude="([\d.-]+)"/i) || html.match(/data-latitude="([\d.-]+)"[\s\S]{0,200}?data-longitude="([\d.-]+)"/i);
	if (!pair) return {};
	const lat = Number(pair[1]);
	const lng = Number(pair[2]);
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return {};
	return {
		lat,
		lng
	};
}
function extractGallery(html, featured) {
	const urls = [...(html.match(/listeo-listing-grid-gallery[\s\S]{0,12000}/i)?.[0] ?? "").matchAll(/src="(https:\/\/xplorepondy\.com\/wp-content\/uploads\/[^"]+)"/g)].map((m) => m[1]);
	const seen = /* @__PURE__ */ new Set();
	const out = [];
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
function enrichListingFromHtml(listing, html) {
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
		gallery: gallery.length ? gallery : listing.gallery
	};
}
function mapListing(raw, extras) {
	let terms = [];
	if (extras?.catMap && raw.listing_category) terms = raw.listing_category.map((id) => extras.catMap.get(id)).filter((t) => !!t);
	else terms = (raw._embedded?.["wp:term"] ?? []).flat().filter((t) => t.taxonomy === "listing_category" || !("taxonomy" in t));
	const { category, kind, tags } = categoryFromTerms(terms);
	let region = "Pondicherry";
	if (extras?.regionMap && raw.region?.[0]) region = extras.regionMap.get(raw.region[0])?.name ?? region;
	else {
		const embeddedRegion = (raw._embedded?.["wp:term"] ?? []).flat().find((t) => t.taxonomy === "region");
		if (embeddedRegion?.name) region = decodeHtml(embeddedRegion.name);
	}
	const image = raw.featured_media && extras?.mediaMap?.get(raw.featured_media) || mediaUrl(raw._embedded?.["wp:featuredmedia"]?.[0]) || FALLBACK_IMAGE[category];
	const name = decodeHtml(raw.title?.rendered ?? raw.slug);
	const description = decodeHtml(raw.content?.rendered || raw.yoast_head_json?.og_description || raw.excerpt?.rendered || "").slice(0, 900);
	const local = findLocal(raw.slug, raw.link);
	const meta = raw.meta ?? {};
	const cafeTypes = (meta.cafe_type ?? []).map((t) => decodeHtml(t)).filter(Boolean);
	const accessibility = Object.entries(meta.accessibility ?? {}).filter(([, v]) => truthyMeta(v)).map(([k]) => decodeHtml(k));
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
		tags: tags.length ? tags : local?.tags ?? [],
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
		menuImages
	};
}
function mapUser(raw) {
	const avatars = raw.avatar_urls ?? {};
	const avatar = avatars["96"] || avatars["48"] || Object.values(avatars)[0] || "";
	return {
		id: raw.id,
		name: raw.name || raw.slug || "WordPress user",
		slug: raw.slug || "",
		email: raw.email || "",
		avatar,
		roles: raw.roles ?? []
	};
}
function parseGuideSections(html) {
	const cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
	const chunks = cleaned.split(/<h[2-3][^>]*>/i);
	const sections = [];
	const intro = decodeHtml(chunks[0] ?? "");
	if (intro) sections.push({ body: intro.slice(0, 1600) });
	for (const chunk of chunks.slice(1)) {
		const close = chunk.search(/<\/h[2-3]>/i);
		const heading = decodeHtml(close >= 0 ? chunk.slice(0, close) : "");
		const body = decodeHtml(close >= 0 ? chunk.slice(close) : chunk).slice(0, 2200);
		if (heading || body) sections.push({
			heading: heading || void 0,
			body
		});
	}
	if (sections.length === 0) {
		const body = decodeHtml(cleaned);
		if (body) sections.push({ body: body.slice(0, 2200) });
	}
	return sections.slice(0, 14);
}
function mapGuide(raw) {
	const local = guides.find((g) => g.slug === raw.slug);
	const terms = (raw._embedded?.["wp:term"] ?? []).flat();
	const topicTerm = terms.find((t) => t.taxonomy === "guide-category") || terms.find((t) => t.taxonomy === "guide-type");
	const html = raw.content?.rendered ?? "";
	const words = decodeHtml(html).split(/\s+/).filter(Boolean).length;
	const date = raw.date ? new Date(raw.date).toLocaleDateString("en-IN", {
		month: "long",
		year: "numeric"
	}) : local?.date ?? "";
	const sections = parseGuideSections(html);
	return {
		slug: raw.slug,
		title: decodeHtml(raw.title?.rendered ?? raw.slug),
		excerpt: decodeHtml(raw.excerpt?.rendered || raw.yoast_head_json?.og_description || "").slice(0, 280),
		date,
		readTime: `${Math.max(1, Math.round(words / 200) || 6)} min`,
		image: mediaUrl(raw._embedded?.["wp:featuredmedia"]?.[0]) || local?.image || "/images/french-quarter.jpg",
		topic: topicTerm?.name ? decodeHtml(topicTerm.name) : local?.topic ?? "Guide",
		sections: sections.length ? sections : local?.sections ?? [{ body: "" }]
	};
}
function cookieHeader(setCookies) {
	return setCookies.map((c) => c.split(";")[0]).join("; ");
}
async function wpGet(path, headers = {}, timeout = 2e4) {
	const res = await fetch(`${WP_ORIGIN}${path}`, {
		headers: {
			Accept: "application/json",
			...headers
		},
		signal: AbortSignal.timeout(timeout)
	});
	let data = null;
	try {
		data = await res.json();
	} catch {
		data = [];
	}
	return {
		headers: res.headers,
		data,
		ok: res.ok,
		status: res.status
	};
}
async function fetchMe(headers) {
	const { data, ok } = await wpGet("/wp-json/wp/v2/users/me?context=edit", headers, 15e3);
	if (!ok || !data?.id) return null;
	return data;
}
async function loadTerms(taxonomy) {
	const map = /* @__PURE__ */ new Map();
	for (let page = 1; page <= 3; page++) {
		const { data, ok, headers } = await wpGet(`/wp-json/wp/v2/${taxonomy}?per_page=100&page=${page}&_fields=id,name,slug,parent,count`);
		if (!ok || !Array.isArray(data) || data.length === 0) break;
		for (const t of data) if (t.id) map.set(t.id, t);
		const pages = Number(headers.get("X-WP-TotalPages") ?? "1");
		if (page >= pages) break;
	}
	return map;
}
async function loadMedia(ids) {
	const unique = [...new Set(ids.filter((id) => id > 0))];
	const map = /* @__PURE__ */ new Map();
	const chunks = [];
	for (let i = 0; i < unique.length; i += 80) chunks.push(unique.slice(i, i + 80));
	const pages = await Promise.all(chunks.map((chunk) => wpGet(`/wp-json/wp/v2/media?include=${chunk.join(",")}&per_page=80&_fields=id,source_url,media_details`)));
	for (const { data, ok } of pages) {
		if (!ok || !Array.isArray(data)) continue;
		for (const m of data) if (m.id) map.set(m.id, mediaUrl(m));
	}
	return map;
}
async function loadListingPages() {
	const fields = [
		"id,slug,title,link,featured_media,listing_category,region,listing_feature,class_list,yoast_head_json",
		"pub-type,cuisine-type,restaurant-types,resto-bar-type,water-sport,land-adventures,sport-type",
		"activity-type,property-type,property-category,by-theme,explore-type"
	].join(",");
	const first = await wpGet(`/wp-json/wp/v2/listing?per_page=100&page=1&_fields=${fields}`, {}, 2e4);
	if (!first.ok || !Array.isArray(first.data)) throw new Error(`WordPress listings failed (${first.status})`);
	const total = Number(first.headers.get("X-WP-Total") ?? first.data.length);
	const pages = Math.min(Number(first.headers.get("X-WP-TotalPages") ?? "1"), 8);
	const rest = pages > 1 ? await Promise.all(Array.from({ length: pages - 1 }, (_, i) => wpGet(`/wp-json/wp/v2/listing?per_page=100&page=${i + 2}&_fields=${fields}`, {}, 2e4).then((r) => r.ok && Array.isArray(r.data) ? r.data : []))) : [];
	return {
		rows: [first.data, ...rest].flat(),
		total
	};
}
function mergeLocal(listings$1) {
	const seen = new Set(listings$1.map((l) => l.slug));
	for (const l of listings$1) seen.add(urlTail(l.siteUrl));
	const extras = [];
	for (const extra of listings) {
		if (seen.has(extra.slug) || seen.has(urlTail(extra.siteUrl))) continue;
		extras.push(extra);
	}
	return [...listings$1, ...extras];
}
var catalogCache = null;
var guidesCache = null;
var CATALOG_TTL = 3e5;
var CATALOG_VERSION = 8;
var ARCHIVE_SLUGS = [
	"cafes",
	"restaurants",
	"resto-pubs",
	"resto-bars",
	"beaches",
	"hotels",
	"bike-rental",
	"adventure-sports",
	"guest-house",
	"saloon-spa"
];
async function loadCatalogFromWp() {
	const extraTax = FILTER_TAX_KEYS.filter((key) => key !== "listing_category" && key !== "region");
	const jetPromise = Promise.race([loadJetArchiveMeta(ARCHIVE_SLUGS).catch(() => /* @__PURE__ */ new Map()), new Promise((resolve) => setTimeout(() => resolve(/* @__PURE__ */ new Map()), 9e3))]);
	const [{ rows, total }, catMap, regionMap, extraMaps] = await Promise.all([
		loadListingPages(),
		loadTerms("listing_category"),
		loadTerms("region"),
		Promise.all(extraTax.map(async (key) => [key, await loadTerms(key)]))
	]);
	const taxMaps = {
		listing_category: catMap,
		region: regionMap
	};
	for (const [key, map] of extraMaps) taxMaps[key] = map;
	const [mediaMap, jetMeta] = await Promise.all([loadMedia(rows.map((r) => r.featured_media ?? 0)), jetPromise]);
	const mapped = rows.map((raw) => mapListing(raw, {
		catMap,
		regionMap,
		mediaMap,
		taxMaps
	}));
	const seen = /* @__PURE__ */ new Set();
	const listings = [];
	for (const item of mapped) {
		if (seen.has(item.slug)) continue;
		seen.add(item.slug);
		const hit = jetMeta.get(item.slug) ?? jetMeta.get(urlTail(item.siteUrl));
		if (!hit) {
			listings.push(item);
			continue;
		}
		listings.push({
			...item,
			mustTry: item.mustTry?.length ? item.mustTry : hit.mustTry,
			cafeTypes: item.cafeTypes?.length ? item.cafeTypes : hit.cafeTypes,
			metaFacets: hit.facets.length ? hit.facets : item.metaFacets,
			metaGroups: item.metaGroups?.length ? item.metaGroups : hit.groups,
			lat: hit.lat ?? item.lat,
			lng: hit.lng ?? item.lng,
			hours: hit.hours || item.hours,
			openNow: hit.openNow ?? item.openNow,
			weeklyHours: hit.weeklyHours?.length ? hit.weeklyHours : item.weeklyHours
		});
	}
	return {
		listings: mergeLocal(listings),
		total: total || listings.length
	};
}
async function loadGuidesFromWp() {
	const { data, ok } = await wpGet("/wp-json/wp/v2/travel_guide?per_page=50&_embed=1", {}, 25e3);
	if (!ok || !Array.isArray(data) || data.length === 0) return guides;
	const mapped = data.map(mapGuide);
	const seen = new Set(mapped.map((g) => g.slug));
	const extras = guides.filter((g) => !seen.has(g.slug));
	return [...mapped, ...extras];
}
var fetchWpCatalog_createServerFn_handler = createServerRpc({
	id: "477756e7cefca1867396576de0effcae7a736a380efcfb8eb58fa93d1e761c01",
	name: "fetchWpCatalog",
	filename: "src/lib/wp-api.ts"
}, (opts) => fetchWpCatalog.__executeServer(opts));
var fetchWpCatalog = createServerFn({ method: "GET" }).handler(fetchWpCatalog_createServerFn_handler, async () => {
	const now = Date.now();
	if (catalogCache && catalogCache.v === CATALOG_VERSION && now - catalogCache.at < CATALOG_TTL) return {
		listings: catalogCache.listings,
		total: catalogCache.total
	};
	const fresh = await loadCatalogFromWp();
	catalogCache = {
		at: now,
		v: CATALOG_VERSION,
		...fresh
	};
	return fresh;
});
var fetchWpGuides_createServerFn_handler = createServerRpc({
	id: "7cd7c0a381ad3e29843d22382f8ec260bef0c2e20f6459b0b2ea76d2e21f311e",
	name: "fetchWpGuides",
	filename: "src/lib/wp-api.ts"
}, (opts) => fetchWpGuides.__executeServer(opts));
var fetchWpGuides = createServerFn({ method: "GET" }).handler(fetchWpGuides_createServerFn_handler, async () => {
	const now = Date.now();
	if (guidesCache && now - guidesCache.at < CATALOG_TTL) return { guides: guidesCache.guides };
	const guides = await loadGuidesFromWp();
	guidesCache = {
		at: now,
		guides
	};
	return { guides };
});
var fetchWpListing_createServerFn_handler = createServerRpc({
	id: "0fced60923df03ce539d92ba12d50c784c29828aac2c08dfa377ae1591471838",
	name: "fetchWpListing",
	filename: "src/lib/wp-api.ts"
}, (opts) => fetchWpListing.__executeServer(opts));
var fetchWpListing = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(fetchWpListing_createServerFn_handler, async ({ data }) => {
	const res = await wpGet(`/wp-json/wp/v2/listing?slug=${encodeURIComponent(data.slug)}&_embed=1`, {}, 15e3);
	if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;
	const listing = mapListing(res.data[0]);
	try {
		const page = await fetch(listing.siteUrl, {
			headers: {
				Accept: "text/html",
				"User-Agent": "XplorePondyApp/1.0"
			},
			signal: AbortSignal.timeout(12e3)
		});
		if (!page.ok) return listing;
		return enrichListingFromHtml(listing, await page.text());
	} catch {
		return listing;
	}
});
var fetchWpGuide_createServerFn_handler = createServerRpc({
	id: "14e3126b610d9cd06fefe159d2efea7c4a8a8152dbc68fe01b7e9d7ef5a0fc71",
	name: "fetchWpGuide",
	filename: "src/lib/wp-api.ts"
}, (opts) => fetchWpGuide.__executeServer(opts));
var fetchWpGuide = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(fetchWpGuide_createServerFn_handler, async ({ data }) => {
	const res = await wpGet(`/wp-json/wp/v2/travel_guide?slug=${encodeURIComponent(data.slug)}&_embed=1`, {}, 15e3);
	if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;
	return mapGuide(res.data[0]);
});
async function loadAuthorContent(authorId, headers) {
	const [mine, trips] = await Promise.all([wpGet(`/wp-json/wp/v2/listing?author=${authorId}&per_page=30&_embed=1`, headers, 15e3), wpGet(`/wp-json/wp/v2/user_trip?author=${authorId}&per_page=20`, headers, 15e3)]);
	return {
		myListings: mine.ok && Array.isArray(mine.data) ? mine.data.map((row) => mapListing(row)) : [],
		myTrips: trips.ok && Array.isArray(trips.data) ? trips.data.map((t) => ({
			slug: t.slug,
			title: decodeHtml(t.title?.rendered ?? t.slug),
			date: t.date ? new Date(t.date).toLocaleDateString("en-IN", {
				day: "numeric",
				month: "short",
				year: "numeric"
			}) : "",
			url: t.link ?? `${WP_ORIGIN}/user_trip/${t.slug}/`
		})) : []
	};
}
var fetchWpAuthorContent_createServerFn_handler = createServerRpc({
	id: "7880f9b0675c46cd49fd6551949874d67562bc93ea6c8710abce27093b381ccc",
	name: "fetchWpAuthorContent",
	filename: "src/lib/wp-api.ts"
}, (opts) => fetchWpAuthorContent.__executeServer(opts));
var fetchWpAuthorContent = createServerFn({ method: "GET" }).validator(object({ authorId: number().int().positive() })).handler(fetchWpAuthorContent_createServerFn_handler, async ({ data }) => loadAuthorContent(data.authorId, {}));
var wpLogin_createServerFn_handler = createServerRpc({
	id: "0acc350b17cb5a34bd70f601d25cdcc328d7c46c2765720cfab6bb6d97f9239e",
	name: "wpLogin",
	filename: "src/lib/wp-api.ts"
}, (opts) => wpLogin.__executeServer(opts));
var wpLogin = createServerFn({ method: "POST" }).validator(object({
	username: string().min(1),
	password: string().min(1)
})).handler(wpLogin_createServerFn_handler, async ({ data }) => {
	const username = data.username.trim();
	const password = data.password.trim();
	const basic = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
	let me = await fetchMe({ Authorization: basic });
	let method = "application-password";
	let authHeaders = { Authorization: basic };
	if (!me) {
		const form = new URLSearchParams({
			log: username,
			pwd: data.password,
			rememberme: "forever",
			"wp-submit": "Log In",
			redirect_to: `${WP_ORIGIN}/wp-admin/`,
			testcookie: "1"
		});
		const loginRes = await fetch(`${WP_ORIGIN}/wp-login.php`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Cookie: "wordpress_test_cookie=WP%20Cookie%20check",
				Referer: `${WP_ORIGIN}/wp-login.php`
			},
			body: form,
			redirect: "manual",
			signal: AbortSignal.timeout(2e4)
		});
		const cookie = cookieHeader(typeof loginRes.headers.getSetCookie === "function" ? loginRes.headers.getSetCookie() : []);
		const location = loginRes.headers.get("location") ?? "";
		const hasSession = cookie.includes("wordpress_logged_in");
		const toAdmin = /\/wp-admin\/?/i.test(location) && !/[?&]login=/i.test(location);
		if (!hasSession && !toAdmin) return {
			ok: false,
			error: "WordPress rejected that username or password. Use your site username and an Application Password from Users → Profile."
		};
		authHeaders = { Cookie: cookie };
		me = await fetchMe(authHeaders);
		method = "wordpress";
	}
	if (!me) return {
		ok: false,
		error: "Signed in, but WordPress did not return a profile. Try an Application Password."
	};
	const user = mapUser(me);
	const { myListings, myTrips } = await loadAuthorContent(user.id, authHeaders);
	return {
		ok: true,
		user,
		myListings,
		myTrips,
		method
	};
});
//#endregion
export { fetchWpAuthorContent_createServerFn_handler, fetchWpCatalog_createServerFn_handler, fetchWpGuide_createServerFn_handler, fetchWpGuides_createServerFn_handler, fetchWpListing_createServerFn_handler, wpLogin_createServerFn_handler };
