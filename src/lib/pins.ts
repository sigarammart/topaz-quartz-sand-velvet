import type { Listing } from "@/lib/types";

export function listingPinNumbers(listings: Listing[]) {
  const map = new Map<string, number>();
  let n = 1;
  for (const listing of listings) {
    if (Number.isFinite(listing.lat) && Number.isFinite(listing.lng)) {
      map.set(listing.slug, n++);
    }
  }
  return map;
}
