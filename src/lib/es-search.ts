import type { Listing } from "@/lib/types";

type Field = { weight: number; tokens: string[] };
type Doc = { listing: Listing; fields: Field[] };

const indexCache = new WeakMap<Listing[], Doc[]>();

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokens(value: string) {
  return fold(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

function terms(listing: Listing) {
  return [
    listing.name,
    listing.kind,
    ...(listing.tags ?? []),
    ...(listing.bestFor ?? []),
    ...(listing.cafeTypes ?? []),
    ...(listing.categorySlugs ?? []),
    ...(listing.taxonomies ?? []).flatMap((group) => [group.label, ...group.terms.map((term) => term.name)]),
    ...(listing.metaFacets ?? []).flatMap((group) => group.terms.map((term) => term.name)),
  ]
    .filter(Boolean)
    .join(" ");
}

function docsFor(items: Listing[]) {
  const cached = indexCache.get(items);
  if (cached) return cached;
  const docs = items.map((listing) => ({
    listing,
    fields: [
      { weight: 6, tokens: tokens(listing.name) },
      { weight: 3, tokens: tokens(`${listing.kind} ${terms(listing)}`) },
      { weight: 2, tokens: tokens(`${listing.area} ${listing.location} ${listing.address ?? ""}`) },
      { weight: 1, tokens: tokens(listing.description).slice(0, 80) },
    ],
  }));
  indexCache.set(items, docs);
  return docs;
}

function edits(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev, row[j - 1], row[j]) + 1;
      prev = next;
    }
  }
  return row[b.length];
}

function tokenScore(query: string, token: string) {
  if (token === query) return 1;
  if (query.length >= 2 && token.startsWith(query)) return 0.82;
  if (query.length >= 4 && token.length >= 4 && token[0] === query[0] && edits(query, token) <= 1) return 0.68;
  return 0;
}

/** Elasticsearch-style multi_match: boosted fields, prefix, and one-edit typos. */
export function elasticSearch(items: Listing[], query: string) {
  const parts = tokens(query);
  if (!parts.length) return items;
  const ranked: Array<{ listing: Listing; score: number }> = [];
  for (const doc of docsFor(items)) {
    let score = 0;
    let hit = true;
    for (const part of parts) {
      let best = 0;
      for (const field of doc.fields) {
        for (const token of field.tokens) {
          const next = tokenScore(part, token) * field.weight;
          if (next > best) best = next;
        }
      }
      if (best === 0) {
        hit = false;
        break;
      }
      score += best;
    }
    if (hit) ranked.push({ listing: doc.listing, score });
  }
  ranked.sort((a, b) => b.score - a.score || b.listing.rating - a.listing.rating || a.listing.name.localeCompare(b.listing.name));
  return ranked.map((row) => row.listing);
}
