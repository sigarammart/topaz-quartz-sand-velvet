/** JetEngine data store used by xplorepondy.com listing cards (`local-storage` type). */
export const JET_TEMP_TRIP_SLUG = "trip-itinerary-temp";
export const JET_TEMP_STORAGE_KEY = `jet_engine_store_${JET_TEMP_TRIP_SLUG}`;

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(JET_TEMP_STORAGE_KEY);
    if (!raw) return [];
    return raw.split(",").map((id) => id.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  const unique = [...new Set(ids.map(String))];
  try {
    if (unique.length) window.localStorage.setItem(JET_TEMP_STORAGE_KEY, unique.join(","));
    else window.localStorage.removeItem(JET_TEMP_STORAGE_KEY);
  } catch {
    /* ignore quota */
  }
}

export function jetTempIds(): string[] {
  return readIds();
}

export function jetTempHas(postId: number | string): boolean {
  return readIds().includes(String(postId));
}

export function jetTempAdd(postId: number | string): string[] {
  const ids = readIds();
  const id = String(postId);
  if (!ids.includes(id)) ids.push(id);
  writeIds(ids);
  return ids;
}

export function jetTempRemove(postId: number | string): string[] {
  const ids = readIds().filter((x) => x !== String(postId));
  writeIds(ids);
  return ids;
}

export function jetTempWriteAll(postIds: Array<number | string>) {
  writeIds(postIds.map(String));
}
