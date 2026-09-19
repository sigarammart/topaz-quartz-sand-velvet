import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Listing } from "@/lib/types";
import type { WpTrip, WpUser } from "@/lib/wp-api";

type SessionState = {
  user: WpUser | null;
  myListings: Listing[];
  myTrips: WpTrip[];
  method: string | null;
  lastUsername: string;
  setSession: (payload: {
    user: WpUser;
    myListings: Listing[];
    myTrips: WpTrip[];
    method: string;
  }) => void;
  setLastUsername: (username: string) => void;
  clearSession: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      myListings: [],
      myTrips: [],
      method: null,
      lastUsername: "",
      setSession: ({ user, myListings, myTrips, method }) =>
        set({
          user,
          myListings,
          myTrips,
          method,
          lastUsername: user.slug || user.name,
        }),
      setLastUsername: (lastUsername) => set({ lastUsername }),
      clearSession: () => set({ user: null, myListings: [], myTrips: [], method: null }),
    }),
    {
      name: "xplore-pondy-wp",
      partialize: (s) => ({
        user: s.user,
        myListings: s.myListings,
        myTrips: s.myTrips,
        method: s.method,
        lastUsername: s.lastUsername,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SessionState>;
        return {
          ...current,
          ...p,
          myListings: p.myListings ?? [],
          myTrips: p.myTrips ?? [],
          lastUsername: p.lastUsername ?? "",
        };
      },
    },
  ),
);
