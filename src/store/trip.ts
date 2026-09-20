import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildTripTitle, daysBetween, newTripCode } from "@/lib/trip-form";
import type { ItineraryDay } from "@/lib/itinerary";
import { jetBookmarkIds, jetBookmarkWriteAll, jetTempIds, jetTempWriteAll } from "@/lib/jet-store";
import type { Listing } from "@/lib/types";

export type TripItem = {
  slug: string;
  day: number;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  dates: string;
  travellers: string;
  interests: string;
  message: string;
  createdAt: string;
};

type TripState = {
  started: boolean;
  days: number;
  title: string;
  code: string;
  wpId?: number;
  wpUrl?: string;
  locations: string[];
  fromPlace: string;
  fromLat?: number;
  fromLng?: number;
  budget: string;
  tripType: string;
  datesKnown: boolean;
  start: string;
  end: string;
  months: string[];
  interests: string[];
  notes: string;
  items: TripItem[];
  itinerary: ItineraryDay[] | null;
  itineraryPolished: boolean;
  saved: string[];
  tempTrip: string[];
  wpIdsBySlug: Record<string, number>;
  inquiries: Inquiry[];
  setDays: (n: number) => void;
  setTitle: (t: string) => void;
  addToDay: (slug: string, day: number) => void;
  removeItem: (slug: string, day?: number) => void;
  moveItem: (slug: string, from: number, to: number) => void;
  reorderDay: (day: number, slugs: string[]) => void;
  setItinerary: (days: ItineraryDay[], items: TripItem[], polished: boolean) => void;
  clearTrip: () => void;
  loadTemplate: (title: string, days: number, items: TripItem[]) => void;
  toggleSaved: (slug: string, wpId?: number) => boolean;
  isSaved: (slug: string) => boolean;
  toggleTempTrip: (slug: string, wpId?: number) => boolean;
  removeTempTrip: (slug: string) => void;
  isInTempTrip: (slug: string) => boolean;
  syncJetTemp: (listings: Listing[]) => void;
  syncBookmarks: (listings: Listing[], extraIds?: number[]) => void;
  addInquiry: (inquiry: Inquiry) => void;
  applyPlan: (plan: {
    locations: string[];
    fromPlace: string;
    fromLat?: number;
    fromLng?: number;
    budget: string;
    tripType: string;
    datesKnown: boolean;
    start: string;
    end: string;
    months: string[];
    days: number;
    interests: string[];
    notes: string;
    wpId?: number;
    wpUrl?: string;
    code?: string;
    title?: string;
  }) => void;
};

const empty = {
  started: false,
  days: 2,
  title: "My Pondy trip",
  code: "",
  wpId: undefined as number | undefined,
  wpUrl: undefined as string | undefined,
  locations: [] as string[],
  fromPlace: "",
  fromLat: undefined as number | undefined,
  fromLng: undefined as number | undefined,
  budget: "",
  tripType: "",
  datesKnown: true,
  start: "",
  end: "",
  months: [] as string[],
  interests: [] as string[],
  notes: "",
  items: [] as TripItem[],
  itinerary: null as ItineraryDay[] | null,
  itineraryPolished: false,
};

function writeJetFrom(slugs: string[], map: Record<string, number>) {
  const ids = slugs.map((slug) => map[slug]).filter((id): id is number => typeof id === "number");
  jetTempWriteAll(ids);
}

function writeBookmarksFrom(slugs: string[], map: Record<string, number>) {
  const ids = slugs.map((slug) => map[slug]).filter((id): id is number => typeof id === "number");
  jetBookmarkWriteAll(ids);
}

export const useTrip = create<TripState>()(
  persist(
    (set, get) => ({
      ...empty,
      saved: [],
      tempTrip: [],
      wpIdsBySlug: {},
      inquiries: [],
      setDays: (n) =>
        set((s) => {
          const days = Math.min(7, Math.max(1, n));
          return { days, items: s.items.filter((i) => i.day <= days) };
        }),
      setTitle: (title) => set({ title }),
      addToDay: (slug, day) =>
        set((s) => {
          if (s.items.some((i) => i.slug === slug)) {
            return { items: s.items.map((i) => (i.slug === slug ? { ...i, day } : i)) };
          }
          return { items: [...s.items, { slug, day }], started: true };
        }),
      removeItem: (slug, day) =>
        set((s) => ({
          items: s.items.filter((i) => (day == null ? i.slug !== slug : !(i.slug === slug && i.day === day))),
        })),
      moveItem: (slug, from, to) =>
        set((s) => ({
          items: s.items.map((i) => (i.slug === slug && i.day === from ? { ...i, day: to } : i)),
        })),
      reorderDay: (day, slugs) =>
        set((s) => {
          const others = s.items.filter((i) => i.day !== day);
          return { items: [...others, ...slugs.map((slug) => ({ slug, day }))] };
        }),
      setItinerary: (itinerary, items, itineraryPolished) => set({ itinerary, items, itineraryPolished }),
      clearTrip: () => set({ ...empty, code: "", items: [] }),
      loadTemplate: (title, days, items) => set({ title, days, items, started: true }),
      toggleSaved: (slug, wpId) => {
        const map = { ...(get().wpIdsBySlug ?? {}) };
        if (typeof wpId === "number") map[slug] = wpId;
        const on = get().saved.includes(slug);
        const next = on ? get().saved.filter((x) => x !== slug) : [...get().saved, slug];
        set({ saved: next, wpIdsBySlug: map });
        writeBookmarksFrom(next, map);
        return !on;
      },
      isSaved: (slug) => get().saved.includes(slug),
      isInTempTrip: (slug) => get().tempTrip.includes(slug),
      toggleTempTrip: (slug, wpId) => {
        const on = get().tempTrip.includes(slug);
        const map = { ...(get().wpIdsBySlug ?? {}) };
        if (typeof wpId === "number") map[slug] = wpId;
        const next = on ? get().tempTrip.filter((x) => x !== slug) : [...get().tempTrip, slug];
        set({ tempTrip: next, wpIdsBySlug: map });
        writeJetFrom(next, map);
        return !on;
      },
      removeTempTrip: (slug) => {
        if (!get().tempTrip.includes(slug)) return;
        get().toggleTempTrip(slug, get().wpIdsBySlug?.[slug]);
      },
      syncJetTemp: (listings) => {
        const map = { ...(get().wpIdsBySlug ?? {}) };
        for (const listing of listings) {
          if (typeof listing.wpId === "number") map[listing.slug] = listing.wpId;
        }
        const byId = new Map(Object.entries(map).map(([slug, id]) => [String(id), slug]));
        const fromJet = jetTempIds()
          .map((id) => byId.get(id))
          .filter((s): s is string => !!s);
        const current = get().tempTrip;
        const merged = [...new Set([...current, ...fromJet])];
        const slim: Record<string, number> = {};
        for (const slug of merged) {
          if (typeof map[slug] === "number") slim[slug] = map[slug];
        }
        const sameTrip = merged.join() === current.join();
        const sameMap = JSON.stringify(slim) === JSON.stringify(get().wpIdsBySlug ?? {});
        if (!sameTrip || !sameMap) set({ tempTrip: merged, wpIdsBySlug: slim });
        writeJetFrom(merged, map);
      },
      syncBookmarks: (listings, extraIds = []) => {
        const map = { ...(get().wpIdsBySlug ?? {}) };
        for (const listing of listings) {
          if (typeof listing.wpId === "number") map[listing.slug] = listing.wpId;
        }
        const byId = new Map(Object.entries(map).map(([slug, id]) => [String(id), slug]));
        const fromStore = [...new Set([...jetBookmarkIds(), ...extraIds.map(String)])]
          .map((id) => byId.get(id))
          .filter((s): s is string => !!s);
        const merged = [...new Set([...get().saved, ...fromStore])];
        const slim: Record<string, number> = { ...(get().wpIdsBySlug ?? {}) };
        for (const slug of merged) {
          if (typeof map[slug] === "number") slim[slug] = map[slug];
        }
        set({ saved: merged, wpIdsBySlug: slim });
        writeBookmarksFrom(merged, slim);
      },
      addInquiry: (inquiry) => set((s) => ({ inquiries: [inquiry, ...s.inquiries] })),
      applyPlan: (plan) => {
        const days =
          plan.datesKnown && plan.start && plan.end ? daysBetween(plan.start, plan.end) || plan.days : plan.days;
        const title =
          plan.title ||
          buildTripTitle({
            locations: plan.locations,
            budget: plan.budget,
            tripType: plan.tripType,
            days,
            interests: plan.interests,
          });
        set({
          started: true,
          ...plan,
          days: Math.min(7, Math.max(1, days || 2)),
          title,
          code: plan.code || get().code || newTripCode(),
          items: get().items,
          itinerary: null,
          itineraryPolished: false,
        });
      },
    }),
    { name: "xplore-pondy-trip" },
  ),
);
