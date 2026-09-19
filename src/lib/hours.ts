import type { DayHours, Listing } from "@/lib/types";

function decode(raw: string): string {
  return raw
    .replace(/&/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

export function parseOpenHoursHtml(html: string): {
  hours: string;
  openNow?: boolean;
  weeklyHours: DayHours[];
} {
  const label = decode(html.match(/xp-badge-label">([\s\S]*?)<\/span>/)?.[1] ?? "");
  const weeklyHours: DayHours[] = [];
  const rows = [...html.matchAll(/xp-badge-tip-day">([^<]+)<\/span>([\s\S]{0,500}?)(?=xp-badge-tip-day"|xp-badge-tip-panel|<\/span><\/span><\/span>)/g)];
  for (const [, dayRaw, rest] of rows) {
    const day = decode(dayRaw);
    const slots = [...rest.matchAll(/xp-badge-tip-slot">([^<]+)/g)].map((m) => decode(m[1] ?? "")).filter(Boolean);
    if (day && slots.length) weeklyHours.push({ day, slots });
  }
  let openNow: boolean | undefined;
  if (/xplore-open-now/.test(html) || /open 24/i.test(label)) openNow = true;
  else if (/xplore-closed-now/.test(html)) openNow = false;
  return { hours: label, openNow, weeklyHours };
}

function kolkataClock(at = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return {
    weekday: (parts.weekday ?? "Sun").slice(0, 3).toLowerCase(),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function toMinutes(text: string): number | null {
  const t = text.trim().toUpperCase().replace(/\./g, "");
  if (t === "MIDNIGHT" || t === "00:00") return 0;
  if (t === "NOON") return 12 * 60;
  const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const ap = match[3];
  if (ap === "AM") {
    if (hour === 12) hour = 0;
  } else if (ap === "PM") {
    if (hour !== 12) hour += 12;
  }
  return hour * 60 + minute;
}

function slotContains(slot: string, minutes: number): boolean {
  if (/24\s*[x×]?7|24\s*hours|open all day|always open/i.test(slot)) return true;
  if (/^closed$/i.test(slot.trim())) return false;
  const parts = slot.split(/\s*(?:-|–|—|to)\s*/i);
  if (parts.length < 2) return false;
  const start = toMinutes(parts[0] ?? "");
  const end = toMinutes(parts[1] ?? "");
  if (start == null || end == null) return false;
  if (end <= start) return minutes >= start || minutes < end;
  return minutes >= start && minutes < end;
}

export function isOpenAt(weekly: DayHours[], at = new Date()): boolean {
  const { weekday, minutes } = kolkataClock(at);
  const row = weekly.find((d) => d.day.slice(0, 3).toLowerCase() === weekday);
  if (!row?.slots.length) return false;
  return row.slots.some((slot) => slotContains(slot, minutes));
}

export function listingIsOpen(listing: Listing, at = new Date()): boolean | undefined {
  if (typeof listing.openNow === "boolean") return listing.openNow;
  if (listing.weeklyHours?.length) return isOpenAt(listing.weeklyHours, at);
  if (/open 24/i.test(listing.hours ?? "")) return true;
  return undefined;
}
