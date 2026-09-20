/** JetEngine data store used by xplorepondy.com listing cards (`local-storage` type). */
export const JET_TEMP_TRIP_SLUG = "trip-itinerary-temp";
export const JET_TEMP_STORAGE_KEY = `jet_engine_store_${JET_TEMP_TRIP_SLUG}`;
/** JetEngine bookmark store (`user-meta` on WP; mirrored locally in the app). */
export const JET_BOOKMARK_SLUG = "save-bookmark";
export const JET_BOOKMARK_STORAGE_KEY = `jet_engine_store_${JET_BOOKMARK_SLUG}`;

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return raw.split(",").map((id) => id.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  const unique = [...new Set(ids.map(String))];
  try {
    if (unique.length) window.localStorage.setItem(key, unique.join(","));
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore quota */
  }
}

export function jetTempIds(): string[] {
  return readIds(JET_TEMP_STORAGE_KEY);
}

export function jetTempHas(postId: number | string): boolean {
  return readIds(JET_TEMP_STORAGE_KEY).includes(String(postId));
}

export function jetTempAdd(postId: number | string): string[] {
  const ids = readIds(JET_TEMP_STORAGE_KEY);
  const id = String(postId);
  if (!ids.includes(id)) ids.push(id);
  writeIds(JET_TEMP_STORAGE_KEY, ids);
  return ids;
}

export function jetTempRemove(postId: number | string): string[] {
  const ids = readIds(JET_TEMP_STORAGE_KEY).filter((x) => x !== String(postId));
  writeIds(JET_TEMP_STORAGE_KEY, ids);
  return ids;
}

export function jetTempWriteAll(postIds: Array<number | string>) {
  writeIds(JET_TEMP_STORAGE_KEY, postIds.map(String));
}

export function jetBookmarkIds(): string[] {
  return readIds(JET_BOOKMARK_STORAGE_KEY);
}

export function jetBookmarkWriteAll(postIds: Array<number | string>) {
  writeIds(JET_BOOKMARK_STORAGE_KEY, postIds.map(String));
}

export function parseJetStoreIds(raw: unknown): number[] {
  if (raw == null) return [];
  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : typeof raw === "object"
        ? Object.values(raw as Record<string, unknown>)
        : [raw];
  return [...new Set(values.map((v) => Number(String(v).trim())).filter((n) => Number.isFinite(n) && n > 0))];
}

export function bookmarkIdsFromUserMeta(meta?: Record<string, unknown> | null): number[] {
  if (!meta) return [];
  const keys = [
    "save-bookmark",
    "jet_engine_store_save-bookmark",
    "jet_engine_save-bookmark",
    "jet_engine_data_store_save-bookmark",
    "jet-engine-store-save-bookmark",
  ];
  for (const key of keys) {
    if (meta[key] != null) return parseJetStoreIds(meta[key]);
  }
  for (const [key, value] of Object.entries(meta)) {
    if (/save[-_]?bookmark/i.test(key)) return parseJetStoreIds(value);
  }
  return [];
}
