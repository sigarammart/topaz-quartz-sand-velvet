import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Listing } from "@/lib/types";
import type { WpUser } from "@/lib/wp-api";

type SessionState = {
  user: WpUser | null;
  myListings: Listing[];
  method: string | null;
  setSession: (user: WpUser, myListings: Listing[], method: string) => void;
  clearSession: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      myListings: [],
      method: null,
      setSession: (user, myListings, method) => set({ user, myListings, method }),
      clearSession: () => set({ user: null, myListings: [], method: null }),
    }),
    { name: "xplore-pondy-wp" },
  ),
);
