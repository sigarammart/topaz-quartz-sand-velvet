import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildTripTitle, daysBetween, newTripCode } from "@/lib/trip-form";
import type { ItineraryDay } from "@/lib/itinerary";

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
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  addInquiry: (inquiry: Inquiry) => void;
  applyPlan: (plan: {
    locations: string[];
    fromPlace: string;
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

export const useTrip = create<TripState>()(
  persist(
    (set, get) => ({
      ...empty,
      saved: [],
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
      toggleSaved: (slug) =>
        set((s) => ({
          saved: s.saved.includes(slug) ? s.saved.filter((x) => x !== slug) : [...s.saved, slug],
        })),
      isSaved: (slug) => get().saved.includes(slug),
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
