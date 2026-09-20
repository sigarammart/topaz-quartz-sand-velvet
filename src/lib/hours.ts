import type { DayHours, Listing } from "@/lib/types";
import { decodeEntities } from "@/lib/utils";

function decode(raw: string): string {
  return decodeEntities(raw.replace(/&nbsp;/g, " "));
}

export function parseOpenHoursHtml(html: string): {
  hours: string;
  openNow?: boolean;
  weeklyHours: DayHours[];
} {
  const label = decode(
    html.match(/xp-badge-label"[^>]*>\s*([\s\S]*?)<\/span>/)?.[1] ??
      html.match(/xp-badge-label">([\s\S]*?)<\/span>/)?.[1] ??
      "",
  );
  const weeklyHours: DayHours[] = [];
  const rows = [
    ...html.matchAll(
      /xp-badge-tip-day">([^<]+)<\/span>([\s\S]{0,800}?)(?=xp-badge-tip-day"|xp-badge-tip-panel|<\/span><\/span><\/span>)/g,
    ),
  ];
  for (const [, dayRaw, rest] of rows) {
    const day = decode(dayRaw);
    const slots = [...rest.matchAll(/xp-badge-tip-slot">([^<]+)/g)].map((m) => decode(m[1] ?? "")).filter(Boolean);
    if (day && slots.length) weeklyHours.push({ day, slots });
  }
  let openNow: boolean | undefined;
  if (/xplore-open-now|status-badge open\b/i.test(html) || /open 24/i.test(label)) openNow = true;
  else if (/xplore-closed-now|status-badge closed\b/i.test(html) || /^closed now$/i.test(label)) openNow = false;
  else if (weeklyHours.length) openNow = isOpenAt(weeklyHours);
  else if (label) openNow = hoursStatusFromLabel(label);
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
  const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(A\.?M\.?|P\.?M\.?)?$/);
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

function rangeContains(start: number, end: number, minutes: number): boolean {
  if (end <= start) return minutes >= start || minutes < end;
  return minutes >= start && minutes < end;
}

function slotContains(slot: string, minutes: number): boolean {
  if (/24\s*[x×]?7|24\s*hours|open all day|always open/i.test(slot)) return true;
  if (/^closed$/i.test(slot.trim())) return false;
  const parts = slot.split(/\s*(?:-|–|—|to)\s*/i);
  if (parts.length < 2) return false;
  const start = toMinutes(parts[0] ?? "");
  const end = toMinutes(parts[1] ?? "");
  if (start == null || end == null) return false;
  return rangeContains(start, end, minutes);
}

export function isOpenAt(weekly: DayHours[], at = new Date()): boolean {
  const { weekday, minutes } = kolkataClock(at);
  const row = weekly.find((d) => d.day.slice(0, 3).toLowerCase() === weekday);
  if (!row?.slots.length) return false;
  return row.slots.some((slot) => slotContains(slot, minutes));
}

const TIME_TOKEN = "\\d{1,2}(?::\\d{2})?\\s*(?:A\\.?M\\.?|P\\.?M\\.?)";

export function hoursStatusFromLabel(hours: string, at = new Date()): boolean | undefined {
  const text = hours.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  if (/always open|open all day|open 24|24\s*[x×]?7|reception 24/i.test(text)) return true;
  if (/^closed(?:\s+now)?$/i.test(text)) return false;
  const { minutes } = kolkataClock(at);
  const ranges = [...text.matchAll(new RegExp(`(${TIME_TOKEN})\\s*(?:-|–|—|to)\\s*(${TIME_TOKEN})`, "gi"))];
  if (ranges.length) {
    return ranges.some((match) => {
      const start = toMinutes(match[1] ?? "");
      const end = toMinutes(match[2] ?? "");
      if (start == null || end == null) return false;
      return rangeContains(start, end, minutes);
    });
  }
  const until = text.match(new RegExp(`open until\\s+(${TIME_TOKEN})`, "i"));
  if (until) {
    const end = toMinutes(until[1] ?? "");
    if (end == null) return undefined;
    const start = end <= 6 * 60 ? 10 * 60 : 6 * 60;
    return rangeContains(start, end, minutes);
  }
  const opens = text.match(new RegExp(`opens\\s+(${TIME_TOKEN})`, "i"));
  if (opens) {
    const start = toMinutes(opens[1] ?? "");
    if (start == null) return undefined;
    return minutes >= start;
  }
  return undefined;
}

export function listingIsOpen(listing: Listing, at = new Date()): boolean | undefined {
  return openNowBadge(listing, at)?.open;
}

function prettyClock(raw: string): string {
  const t = raw.trim().replace(/\./g, "");
  const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return raw.trim();
  const hour = Number(match[1]);
  const minute = match[2] ?? "00";
  const ap = (match[3] || "").toUpperCase();
  if (!ap) return `${hour}:${minute}`;
  return `${hour}:${minute} ${ap}`;
}

function slotBounds(slot: string): { start: number | null; end: number | null; startLabel: string; endLabel: string } {
  const parts = slot.split(/\s*(?:-|–|—|to)\s*/i);
  return {
    start: toMinutes(parts[0] ?? ""),
    end: toMinutes(parts[1] ?? ""),
    startLabel: prettyClock(parts[0] ?? ""),
    endLabel: prettyClock(parts[1] ?? ""),
  };
}

function isAlwaysOpen(text: string) {
  return /always open|open all day|open 24|24\s*[x×]?7|reception 24/i.test(text);
}

/** Same output as WP `[open_now_badge]` / `is_open_now` meta. */
export function openNowBadge(listing: Listing, at = new Date()): { open: boolean; label: string } | null {
  const weekly = listing.weeklyHours ?? [];
  const hay = [listing.hours, ...weekly.flatMap((row) => row.slots)].filter(Boolean).join(" ");
  if (isAlwaysOpen(hay)) return { open: true, label: /24/.test(hay) ? "Open 24x7" : "Open now" };

  if (weekly.length) {
    const { weekday, minutes } = kolkataClock(at);
    const today = weekly.find((row) => row.day.slice(0, 3).toLowerCase() === weekday);
    const slots = today?.slots ?? [];
    if (slots.some((slot) => /^closed$/i.test(slot.trim()))) return { open: false, label: "Closed Now" };
    const active = slots.find((slot) => slotContains(slot, minutes));
    if (active) {
      const { endLabel } = slotBounds(active);
      return { open: true, label: endLabel ? `Open until ${endLabel}` : listing.hours || "Open now" };
    }
    const later = slots
      .map((slot) => slotBounds(slot))
      .filter((row) => row.start != null && row.start > minutes)
      .sort((a, b) => (a.start ?? 0) - (b.start ?? 0))[0];
    if (later?.startLabel) return { open: false, label: `Opens at ${later.startLabel}` };
    return { open: false, label: "Closed Now" };
  }

  if (listing.hours) {
    const fromLabel = hoursStatusFromLabel(listing.hours, at);
    if (fromLabel === true) return { open: true, label: listing.hours };
    if (fromLabel === false) {
      return { open: false, label: /^closed/i.test(listing.hours) ? listing.hours : "Closed Now" };
    }
  }

  if (listing.openNow === true) return { open: true, label: listing.hours || "Open now" };
  if (listing.openNow === false) return { open: false, label: listing.hours || "Closed Now" };
  return null;
}
