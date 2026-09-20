/** Browser Maps JS key — restrict by HTTP referrer in Google Cloud. */
export const GOOGLE_MAPS_KEY = "AIzaSyDmg7R_HkimYT2rDsGUozY4MzSfOUTMNGk";

type GoogleMapsNs = {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMap;
  Marker: new (opts: Record<string, unknown>) => GoogleMarker;
  LatLngBounds: new () => GoogleLatLngBounds;
  SymbolPath: { CIRCLE: unknown };
  event: { clearInstanceListeners: (x: unknown) => void };
  ColorScheme?: { DARK: string; LIGHT: string };
  RenderingType?: { RASTER: string; VECTOR: string };
};

export type GoogleMap = {
  setOptions: (opts: Record<string, unknown>) => void;
  setCenter: (c: { lat: number; lng: number }) => void;
  setZoom: (z: number) => void;
  getZoom: () => number | undefined;
  panTo: (c: { lat: number; lng: number }) => void;
  fitBounds: (b: GoogleLatLngBounds, pad?: number) => void;
  addListener: (ev: string, fn: () => void) => void;
};

export type GoogleMarker = {
  setMap: (m: GoogleMap | null) => void;
  setIcon: (icon: unknown) => void;
  setLabel: (label: unknown) => void;
  setZIndex: (z: number) => void;
  setPosition: (c: { lat: number; lng: number }) => void;
  addListener: (ev: string, fn: () => void) => void;
};

export type GoogleLatLngBounds = {
  extend: (c: { lat: number; lng: number }) => void;
};

declare global {
  interface Window {
    google?: { maps: GoogleMapsNs };
    gm_authFailure?: () => void;
  }
}

let loading: Promise<boolean> | null = null;
let authFailed = false;

export function googleMapsApi(): GoogleMapsNs | null {
  if (typeof window === "undefined" || authFailed) return null;
  return window.google?.maps ?? null;
}

export function loadGoogleMaps(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (authFailed) return Promise.resolve(false);
  if (window.google?.maps) return Promise.resolve(true);
  if (loading) return loading;
  loading = new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok && !authFailed);
    };
    const prev = window.gm_authFailure;
    window.gm_authFailure = () => {
      authFailed = true;
      try {
        prev?.();
      } catch {
        /* ignore */
      }
      finish(false);
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-xp-gmaps]");
    if (existing) {
      existing.addEventListener("load", () => finish(!!window.google?.maps));
      existing.addEventListener("error", () => finish(false));
      window.setTimeout(() => finish(!!window.google?.maps), 12000);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.xpGmaps = "1";
    script.onload = () => finish(!!window.google?.maps);
    script.onerror = () => finish(false);
    document.head.appendChild(script);
    window.setTimeout(() => finish(!!window.google?.maps), 12000);
  });
  return loading;
}

export const GOOGLE_MAP_DARK = [
  { elementType: "geometry", stylers: [{ color: "#1b2527" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1b2527" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9aa5a2" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a383a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a9693" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1213" }] },
];

export const GOOGLE_MAP_LIGHT = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c5dce0" }] },
];
