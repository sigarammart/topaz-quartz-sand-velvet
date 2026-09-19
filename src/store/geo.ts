import { create } from "zustand";
import { ANNA_SALAI, type LatLng } from "@/lib/geo";

type GeoState = {
  origin: LatLng;
  source: "landmark" | "gps";
  status: "idle" | "asking" | "ready" | "denied";
  locate: () => void;
  clear: () => void;
  hydrate: () => void;
};

export const useGeo = create<GeoState>((set, get) => ({
  origin: ANNA_SALAI,
  source: "landmark",
  status: "idle",
  clear: () => set({ origin: ANNA_SALAI, source: "landmark", status: "idle" }),
  locate: () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set({ status: "denied", origin: ANNA_SALAI, source: "landmark" });
      return;
    }
    set({ status: "asking" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          source: "gps",
          status: "ready",
        });
      },
      () => set({ status: "denied", origin: ANNA_SALAI, source: "landmark" }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 },
    );
  },
  hydrate: () => {
    if (typeof navigator === "undefined") return;
    const permissions = navigator.permissions;
    if (!permissions?.query) return;
    void permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted" && get().source !== "gps") get().locate();
        if (status.state === "denied") {
          set({ status: "denied", origin: ANNA_SALAI, source: "landmark" });
        }
        status.onchange = () => {
          if (status.state === "granted") get().locate();
          if (status.state === "denied" || status.state === "prompt") get().clear();
        };
      })
      .catch(() => undefined);
  },
}));
