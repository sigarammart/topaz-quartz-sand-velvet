import type { Listing } from "@/lib/types";
import { ANNA_SALAI, type LatLng } from "@/lib/geo";
import { interestLabel, orderByNearest, travelLeg } from "@/lib/trip-form";

export type ItineraryStop = {
  slug: string;
  time: string;
  durationMin: number;
  blurb: string;
  travel?: { minutes: number; km: number };
};

export type ItineraryDay = {
  day: number;
  title: string;
  intro: string;
  stops: ItineraryStop[];
};

function durationFor(listing: Listing) {
  const raw = listing.duration?.match(/(\d+)\s*(h|hr|hour|min)/i);
  if (raw) {
    const n = Number(raw[1]);
    if (/min/i.test(raw[2])) return Math.min(240, Math.max(30, n));
    return Math.min(240, Math.max(45, n * 60));
  }
  if (listing.category === "food") return 75;
  if (listing.category === "activities") return 120;
  if (listing.category === "stay") return 40;
  return 70;
}

function formatClock(minutes: number) {
  const clamped = Math.max(7 * 60, Math.min(22 * 60, minutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function firstSentence(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const m = clean.match(/^[^.!?]{20,180}[.!?]/);
  return (m ? m[0] : clean.slice(0, 140)).trim();
}

function dayIntro(
  day: number,
  listings: Listing[],
  polish: boolean,
  ctx: { tripType: string; interests: string[]; location: string },
) {
  const names = listings.map((l) => l.name).slice(0, 3);
  if (!polish) {
    return `Day ${day} — ${names.join(", ")}${listings.length > 3 ? " and more" : ""}.`;
  }
  const vibe = ctx.interests.slice(0, 2).map(interestLabel).join(" and ") || ctx.tripType || "Pondy";
  if (day === 1) {
    return `Ease into ${ctx.location || "Pondicherry"} with ${vibe.toLowerCase()}. Start unhurried, keep the scooter close, and leave room for a long lunch.`;
  }
  return `Day ${day} stretches a little further — ${names[0] ? `begin at ${names[0]}` : "keep moving"} and let the gaps between stops stay slow.`;
}

function stopBlurb(listing: Listing, polish: boolean) {
  if (!polish) return listing.kind || listing.area || listing.location;
  return firstSentence(listing.description) || `${listing.kind} in ${listing.area || listing.location}.`;
}

export function buildTripItinerary({
  items,
  listings,
  days,
  polish,
  origin = ANNA_SALAI,
  tripType,
  interests,
  locationLabel,
}: {
  items: Array<{ slug: string; day: number }>;
  listings: Listing[];
  days: number;
  polish: boolean;
  origin?: LatLng;
  tripType: string;
  interests: string[];
  locationLabel: string;
}): { days: ItineraryDay[]; items: Array<{ slug: string; day: number }> } {
  const bySlug = new Map(listings.map((l) => [l.slug, l]));
  const resolved = items.map((i) => ({ ...i, listing: bySlug.get(i.slug) })).filter((i) => i.listing) as Array<{
    slug: string;
    day: number;
    listing: Listing;
  }>;

  const nextItems: Array<{ slug: string; day: number }> = [];
  const out: ItineraryDay[] = [];

  for (let d = 1; d <= days; d++) {
    const group = resolved.filter((i) => i.day === d).map((i) => i.listing);
    const leftover = resolved.filter((i) => i.day !== d && !nextItems.some((n) => n.slug === i.slug));
    const pool = group.length ? group : d === 1 ? leftover.map((i) => i.listing).slice(0, 3) : [];
    const ordered = orderByNearest(pool, origin);
    ordered.forEach((l) => nextItems.push({ slug: l.slug, day: d }));

    let cursor = 9 * 60;
    let prev: Listing | undefined;
    const stops: ItineraryStop[] = [];
    for (const listing of ordered) {
      const travel = prev ? travelLeg(prev, listing) : travelLeg(origin, listing);
      if (travel && travel.minutes > 3) cursor += travel.minutes;
      const durationMin = durationFor(listing);
      stops.push({
        slug: listing.slug,
        time: formatClock(cursor),
        durationMin,
        blurb: stopBlurb(listing, polish),
        travel: travel && travel.minutes > 3 ? travel : undefined,
      });
      cursor += durationMin + 15;
      prev = listing;
    }

    out.push({
      day: d,
      title: ordered[0] ? `Day ${d} · ${ordered[0].area || locationLabel}` : `Day ${d}`,
      intro: dayIntro(d, ordered, polish, { tripType, interests, location: locationLabel }),
      stops,
    });
  }

  const used = new Set(nextItems.map((i) => i.slug));
  for (const row of resolved) {
    if (!used.has(row.slug)) nextItems.push({ slug: row.slug, day: row.day });
  }

  return { days: out, items: nextItems };
}

export function travelLabel(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
