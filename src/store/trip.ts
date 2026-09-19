import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TripItem = {
  slug: string;
  day: number;
};

type TripState = {
  days: number;
  title: string;
  items: TripItem[];
  saved: string[];
  inquiries: Inquiry[];
  setDays: (n: number) => void;
  setTitle: (t: string) => void;
  addToDay: (slug: string, day: number) => void;
  removeItem: (slug: string, day: number) => void;
  moveItem: (slug: string, from: number, to: number) => void;
  clearTrip: () => void;
  loadTemplate: (title: string, days: number, items: TripItem[]) => void;
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  addInquiry: (inquiry: Inquiry) => void;
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

export const useTrip = create<TripState>()(
  persist(
    (set, get) => ({
      days: 3,
      title: "My Pondy trip",
      items: [],
      saved: [],
      inquiries: [],
      setDays: (n) =>
        set((s) => ({
          days: Math.min(7, Math.max(1, n)),
          items: s.items.filter((i) => i.day <= Math.min(7, Math.max(1, n))),
        })),
      setTitle: (title) => set({ title }),
      addToDay: (slug, day) =>
        set((s) => {
          if (s.items.some((i) => i.slug === slug && i.day === day)) return s;
          return { items: [...s.items, { slug, day }] };
        }),
      removeItem: (slug, day) =>
        set((s) => ({ items: s.items.filter((i) => !(i.slug === slug && i.day === day)) })),
      moveItem: (slug, from, to) =>
        set((s) => ({
          items: s.items.map((i) => (i.slug === slug && i.day === from ? { ...i, day: to } : i)),
        })),
      clearTrip: () => set({ items: [], title: "My Pondy trip" }),
      loadTemplate: (title, days, items) => set({ title, days, items }),
      toggleSaved: (slug) =>
        set((s) => ({
          saved: s.saved.includes(slug) ? s.saved.filter((x) => x !== slug) : [...s.saved, slug],
        })),
      isSaved: (slug) => get().saved.includes(slug),
      addInquiry: (inquiry) => set((s) => ({ inquiries: [inquiry, ...s.inquiries] })),
    }),
    { name: "xplore-pondy-trip" },
  ),
);
