import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { listings as localListings } from "@/data/listings";
import type { Category, Listing } from "@/lib/types";

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

type WpTerm = { name?: string; slug?: string; taxonomy?: string };
type WpMedia = {
  source_url?: string;
  media_details?: { sizes?: Record<string, { source_url?: string }> };
};
type WpListing = {
  id: number;
  slug: string;
  link?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  listing_category?: number[];
  featured_media?: number;
  class_list?: string[];
  _embedded?: {
    "wp:featuredmedia"?: WpMedia[];
    "wp:term"?: WpTerm[][];
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
  temples: "places",
  churches: "places",
  ashrams: "places",
  activities: "activities",
  "adventure-sports": "activities",
  "boat-rides": "activities",
  cycling: "activities",
  "classes-workshops": "activities",
  "bike-rental": "activities",
  "car-rental": "activities",
  rentals: "activities",
  "food-beverage": "food",
  cafes: "food",
  restaurants: "food",
  pubs: "food",
  "resto-bar-type": "food",
  bakeries: "food",
  accommodation: "stay",
  hotels: "stay",
  homestay: "stay",
  "guest-house": "stay",
  hostels: "stay",
  "boutique-hotels": "stay",
  resorts: "stay",
};

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFromTerms(terms: WpTerm[]): { category: Category; kind: string; tags: string[] } {
  const cats = terms.filter((t) => t.taxonomy === "listing_category");
  const slugs = cats.map((t) => t.slug ?? "");
  let category: Category = "places";
  const rank: Category[] = ["stay", "food", "activities", "places"];
  for (const c of rank) {
    if (slugs.some((s) => PARENT_TO_CATEGORY[s] === c)) {
      category = c;
      break;
    }
  }
  const kind =
    cats.find((t) => t.slug && t.slug !== "tourist-attractions" && t.slug !== "food-beverage")
      ?.name ??
    cats[0]?.name ??
    "Listing";
  return { category, kind, tags: cats.map((t) => t.name).filter((n): n is string => !!n) };
}

function mediaUrl(media?: WpMedia) {
  const sizes = media?.media_details?.sizes ?? {};
  return (
    sizes.medium_large?.source_url ||
    sizes.large?.source_url ||
    sizes.medium?.source_url ||
    media?.source_url ||
    ""
  );
}

function mapListing(raw: WpListing): Listing {
  const terms = (raw._embedded?.["wp:term"] ?? []).flat();
  const { category, kind, tags } = categoryFromTerms(terms);
  const region = terms.find((t) => t.taxonomy === "region")?.name ?? "Pondicherry";
  const image = mediaUrl(raw._embedded?.["wp:featuredmedia"]?.[0]) || FALLBACK_IMAGE[category];
  const name = decodeHtml(raw.title?.rendered ?? raw.slug);
  const description = decodeHtml(raw.content?.rendered ?? "").slice(0, 700);
  const local = localListings.find((l) => l.slug === raw.slug);
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
    duration: local?.duration,
    entry: local?.entry,
    featured: local?.featured,
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

function cookieHeader(setCookies: string[]) {
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

async function fetchMe(headers: HeadersInit) {
  const res = await fetch(`${WP_ORIGIN}/wp-json/wp/v2/users/me?context=edit`, {
    headers: { Accept: "application/json", ...headers },
  });
  if (!res.ok) return null;
  return (await res.json()) as WpMe;
}

let catalogCache: { at: number; listings: Listing[]; total: number } | null = null;
const CATALOG_TTL = 5 * 60 * 1000;

async function loadCatalogFromWp(): Promise<{ listings: Listing[]; total: number }> {
  const first = await fetch(
    `${WP_ORIGIN}/wp-json/wp/v2/listing?per_page=100&page=1&_embed=1`,
    { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(25000) },
  );
  if (!first.ok) throw new Error(`WordPress listings failed (${first.status})`);
  const total = Number(first.headers.get("X-WP-Total") ?? "0");
  const pages = Math.min(Number(first.headers.get("X-WP-TotalPages") ?? "1"), 6);
  const page1 = (await first.json()) as WpListing[];
  const rest: WpListing[][] = [];
  if (pages > 1) {
    const next = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) =>
        fetch(`${WP_ORIGIN}/wp-json/wp/v2/listing?per_page=100&page=${i + 2}&_embed=1`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(25000),
        }).then((r) => (r.ok ? (r.json() as Promise<WpListing[]>) : [])),
      ),
    );
    rest.push(...next);
  }
  const mapped = [page1, ...rest].flat().map(mapListing);
  const seen = new Set<string>();
  const listings: Listing[] = [];
  for (const item of mapped) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    listings.push(item);
  }
  for (const extra of localListings) {
    if (!seen.has(extra.slug)) listings.push(extra);
  }
  return { listings, total: total || listings.length };
}

export const fetchWpCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (catalogCache && now - catalogCache.at < CATALOG_TTL) return catalogCache;
  const fresh = await loadCatalogFromWp();
  catalogCache = { at: now, ...fresh };
  return fresh;
});

export const fetchWpListing = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const res = await fetch(
      `${WP_ORIGIN}/wp-json/wp/v2/listing?slug=${encodeURIComponent(data.slug)}&_embed=1`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as WpListing[];
    if (!rows[0]) return null;
    return mapListing(rows[0]);
  });

export const wpLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const username = data.username.trim();
    const password = data.password;
    const basic = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;

    let me = await fetchMe({ Authorization: basic });
    let method: "application-password" | "wordpress" = "application-password";

    if (!me) {
      const form = new URLSearchParams({
        log: username,
        pwd: password,
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
        typeof loginRes.headers.getSetCookie === "function"
          ? loginRes.headers.getSetCookie()
          : [];
      const cookie = cookieHeader(rawCookies);
      if (!cookie.includes("wordpress_logged_in")) {
        return {
          ok: false as const,
          error:
            "WordPress rejected that username or password. Use your site username and an Application Password from Users → Profile.",
        };
      }
      me = await fetchMe({ Cookie: cookie });
      method = "wordpress";
    }

    if (!me) {
      return {
        ok: false as const,
        error: "Signed in, but WordPress did not return a profile. Try an Application Password.",
      };
    }

    const user = mapUser(me);
    const mineRes = await fetch(
      `${WP_ORIGIN}/wp-json/wp/v2/listing?author=${user.id}&per_page=20&_embed=1`,
      {
        headers: { Accept: "application/json", Authorization: basic },
        signal: AbortSignal.timeout(15000),
      },
    );
    const mineRaw = mineRes.ok ? ((await mineRes.json()) as WpListing[]) : [];
    const myListings = Array.isArray(mineRaw) ? mineRaw.map(mapListing) : [];

    return { ok: true as const, user, myListings, method };
  });
