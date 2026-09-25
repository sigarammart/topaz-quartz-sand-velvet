import { create } from "zustand";
import { ANNA_SALAI, type LatLng } from "@/lib/geo";

type GeoState = {
  origin: LatLng;
  source: "landmark" | "gps";
  status: "idle" | "asking" | "ready" | "denied";
  nearMe: boolean;
  locate: (activateNearMe?: boolean) => void;
  clear: () => void;
  hydrate: () => void;
};

export const useGeo = create<GeoState>((set, get) => ({
  origin: ANNA_SALAI,
  source: "landmark",
  status: "idle",
  nearMe: false,
  clear: () => set({ nearMe: false }),
  locate: (activateNearMe = false) => {
    set({ nearMe: activateNearMe, status: "asking" });
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set({ status: "denied", origin: ANNA_SALAI, source: "landmark", nearMe: activateNearMe });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          source: "gps",
          status: "ready",
          nearMe: activateNearMe,
        });
      },
      () => set({ status: "denied", origin: ANNA_SALAI, source: "landmark", nearMe: activateNearMe }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 },
    );
  },
  hydrate: () => {
    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      set({
        status: "denied",
        origin: ANNA_SALAI,
        source: "landmark",
        nearMe: false,
      });
      return;
    }

    const requestGps = () => {
      set({ status: "asking" });

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          set({
            origin: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
            source: "gps",
            status: "ready",
            nearMe: false,
          });
        },
        () => {
          set({
            status: "denied",
            origin: ANNA_SALAI,
            source: "landmark",
            nearMe: false,
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 120000,
        },
      );
    };

    const permissions = navigator.permissions;

    if (!permissions?.query) {
      requestGps();
      return;
    }

    void permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (permission.state === "granted" || permission.state === "prompt") {
          requestGps();
          return;
        }

        if (permission.state === "denied") {
          set({
            status: "denied",
            origin: ANNA_SALAI,
            source: "landmark",
            nearMe: false,
          });
        }

        permission.onchange = () => {
          if (permission.state === "granted") {
            requestGps();
          } else if (permission.state === "denied") {
            set({
              status: "denied",
              origin: ANNA_SALAI,
              source: "landmark",
              nearMe: false,
            });
          }
        };
      })
      .catch(() => {
        requestGps();
      });
  },
}));
