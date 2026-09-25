import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import type { Listing } from "@/lib/types";
import { listingPinNumbers } from "@/lib/pins";
import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/listing-card";
import {
  googleMapsApi,
  loadGoogleMaps,
  GOOGLE_MAP_DARK,
  GOOGLE_MAP_LIGHT,
  type GoogleMap,
  type GoogleMarker,
} from "@/lib/google-maps";
import { useGeo } from "@/store/geo";
import { useTheme } from "@/store/theme";

const PONDICHERRY = { lat: 11.934, lng: 79.832 };

function pinIcon(g: NonNullable<ReturnType<typeof googleMapsApi>>, fill: string, stroke: string, scale = 13) {
  return {
    path: g.SymbolPath?.CIRCLE ?? 0,
    scale,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: stroke,
    strokeWeight: 3,
  };
}

function clusterGroups(
  pins: Array<{ slug: string; lat: number; lng: number }>,
  zoom: number,
  cellSize = 70,
) {
  const world = 256 * 2 ** zoom;
  const groups = new Map<string, Array<(typeof pins)[number]>>();
  for (const pin of pins) {
    const x = ((pin.lng + 180) / 360) * world;
    const sin = Math.sin((pin.lat * Math.PI) / 180);
    const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * world;
    const key = `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;
    const group = groups.get(key) ?? [];
    group.push(pin);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({
    key: group.length === 1 ? group[0].slug : `cluster:${group.map((p) => p.slug).sort().join("|")}`,
    items: group,
    lat: group.reduce((sum, p) => sum + p.lat, 0) / group.length,
    lng: group.reduce((sum, p) => sum + p.lng, 0) / group.length,
  }));
}

export function GoogleListingMap({
  listings,
  selected,
  onSelect,
  className,
}: {
  listings: Listing[];
  selected?: string;
  onSelect: (slug: string | undefined) => void;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markers = useRef(new Map<string, GoogleMarker>());
  const clusterMarkers = useRef(new Map<string, GoogleMarker>());
  const youMarker = useRef<GoogleMarker | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [ready, setReady] = useState(false);
  const dark = useTheme((s) => s.mode) !== "light";
  const you = useGeo((s) => (s.source === "gps" ? s.origin : null));
  const locate = useGeo((s) => s.locate);
  const geoStatus = useGeo((s) => s.status);
  const locateRequested = useRef(false);
  const pinNumbers = useMemo(() => listingPinNumbers(listings), [listings]);
  const pins = useMemo(
    () => listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)) as Array<Listing & { lat: number; lng: number }>,
    [listings],
  );
  const active = pins.find((l) => l.slug === selected);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let map: GoogleMap | null = null;
    let click: (() => void) | undefined;
    void loadGoogleMaps().then(() => {
      if (cancelled) return;
      const g = googleMapsApi();
      if (!el || !g || typeof g.Map !== "function") return;
      try {
        map = new g.Map(el, {
          center: PONDICHERRY,
          zoom: 13,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          keyboardShortcuts: false,
          clickableIcons: false,
          styles: dark ? GOOGLE_MAP_DARK : GOOGLE_MAP_LIGHT,
          backgroundColor: dark ? "#1b2527" : "#ebe4d6",
          ...(g.ColorScheme ? { colorScheme: dark ? g.ColorScheme.DARK : g.ColorScheme.LIGHT } : {}),
          ...(g.RenderingType ? { renderingType: g.RenderingType.RASTER } : {}),
        });
      } catch {
        return;
      }
      mapRef.current = map;
      setReady(true);
      click = () => onSelectRef.current(undefined);
      map.addListener("click", click);
      map.addListener("zoom_changed", () => setMapZoom(map?.getZoom() ?? 13));
    });
    return () => {
      cancelled = true;
      const g = googleMapsApi();
      if (map && g?.event) g.event.clearInstanceListeners(map);
      markers.current.forEach((m) => m.setMap(null));
      markers.current.clear();
      clusterMarkers.current.forEach((m) => m.setMap(null));
      clusterMarkers.current.clear();
      youMarker.current?.setMap(null);
      youMarker.current = null;
      mapRef.current = null;
      setReady(false);
    };
    // Theme is applied in a later effect so the map instance can persist.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const g = googleMapsApi();
    mapRef.current?.setOptions({
      styles: dark ? GOOGLE_MAP_DARK : GOOGLE_MAP_LIGHT,
      ...(g?.ColorScheme ? { colorScheme: dark ? g.ColorScheme.DARK : g.ColorScheme.LIGHT } : {}),
    });
  }, [dark]);

  useEffect(() => {
    const g = googleMapsApi();
    const map = mapRef.current;
    if (!g || !map || typeof g.Marker !== "function") return;
    try {
      const fill = "#5ee1e8";
      const fillActive = "#f5c15d";
      const stroke = "#0b1213";
      const labelColor = "#0b1213";
      const groups = clusterGroups(pins, mapZoom);
      const clusteredSlugs = new Set(groups.filter((g) => g.items.length > 1).flatMap((g) => g.items.map((p) => p.slug)));
      const keep = new Set(pins.map((p) => p.slug));

      for (const [slug, marker] of markers.current) {
        if (!keep.has(slug) || clusteredSlugs.has(slug)) marker.setMap(null);
      }

      for (const group of groups) {
        if (group.items.length > 1) continue;
        const listing = group.items[0];
        const n = String(pinNumbers.get(listing.slug) ?? "");
        const isActive = listing.slug === selected;
        let marker = markers.current.get(listing.slug);
        if (!marker) {
          marker = new g.Marker({ position: { lat: listing.lat, lng: listing.lng }, map, title: listing.name });
          marker.addListener("click", () => onSelectRef.current(listing.slug));
          markers.current.set(listing.slug, marker);
        } else {
          marker.setPosition({ lat: listing.lat, lng: listing.lng });
          marker.setMap(map);
        }
        marker.setIcon(pinIcon(g, isActive ? fillActive : fill, stroke, isActive ? 15 : 13));
        marker.setLabel({ text: n, color: labelColor, fontSize: "11px", fontWeight: "700" });
        marker.setZIndex(isActive ? 20 : 10);
      }

      const clusterKeys = new Set<string>();
      for (const group of groups) {
        if (group.items.length < 2) continue;
        clusterKeys.add(group.key);
        let marker = clusterMarkers.current.get(group.key);
        if (!marker) {
          marker = new g.Marker({
            position: { lat: group.lat, lng: group.lng },
            map,
            title: `${group.items.length} listings`,
          });
          marker.addListener("click", () => {
            map.panTo({ lat: group.lat, lng: group.lng });
            map.setZoom(Math.min(18, (map.getZoom() ?? mapZoom) + 2));
          });
          clusterMarkers.current.set(group.key, marker);
        } else {
          marker.setPosition({ lat: group.lat, lng: group.lng });
          marker.setMap(map);
        }
        marker.setIcon(pinIcon(g, "#18b8d1", "#ffffff", Math.min(24, 13 + Math.sqrt(group.items.length) * 2)));
        marker.setLabel({ text: String(group.items.length), color: "#ffffff", fontSize: "12px", fontWeight: "800" });
        marker.setZIndex(40);
      }

      for (const [key, marker] of clusterMarkers.current) {
        if (!clusterKeys.has(key)) {
          marker.setMap(null);
          clusterMarkers.current.delete(key);
        }
      }

      if (you) {
        if (!youMarker.current) {
          youMarker.current = new g.Marker({
            position: you,
            map,
            title: "You",
            zIndex: 30,
          });
        } else {
          youMarker.current.setPosition(you);
        }
        youMarker.current.setIcon({
          path: g.SymbolPath?.CIRCLE ?? 0,
          scale: 8,
          fillColor: "#f5c15d",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        });
        youMarker.current.setMap(map);
      } else {
        youMarker.current?.setMap(null);
      }
    } catch {
      /* Maps constructors unavailable — parent falls back. */
    }
  }, [pins, pinNumbers, selected, dark, you?.lat, you?.lng, ready, mapZoom]);

  useEffect(() => {
    const g = googleMapsApi();
    const map = mapRef.current;
    if (!g || !map) return;

    if (you && locateRequested.current) {
      locateRequested.current = false;
      map.panTo(you);
      map.setZoom(17);
      return;
    }

    if (selected && active) {
      map.panTo({ lat: active.lat, lng: active.lng });
      return;
    }
    if (!pins.length) {
      map.setCenter(PONDICHERRY);
      map.setZoom(13);
      return;
    }
    if (pins.length === 1) {
      map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
      map.setZoom(15);
      return;
    }
    const bounds = new g.LatLngBounds();
    for (const p of pins) bounds.extend({ lat: p.lat, lng: p.lng });
    if (you) bounds.extend(you);
    map.fitBounds(bounds, 48);
  }, [pins, selected, active?.slug, you?.lat, you?.lng, ready]);

  function bumpZoom(delta: number) {
    const map = mapRef.current;
    if (!map) return;
    const z = map.getZoom() ?? 13;
    map.setZoom(Math.min(18, Math.max(10, z + delta)));
  }

  return (
    <div className={cn("relative h-[22rem] overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:h-[28rem]", className)}>
      <div ref={host} className="absolute inset-0" />
      {active && (
        <div className="absolute inset-x-3 bottom-8 z-30">
          <ListingCard listing={active} layout="row" active pin={pinNumbers.get(active.slug)} />
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          locateRequested.current = true;
          locate();
        }}
        disabled={geoStatus === "asking"}
        className="absolute left-3 top-3 z-40 flex size-10 items-center justify-center rounded-xl bg-card/95 text-foreground shadow-soft ring-1 ring-border backdrop-blur-sm hover:bg-muted disabled:opacity-60"
        aria-label="Find my location"
        title="Find my location"
      >
        <LocateFixed className={cn("size-5", geoStatus === "asking" && "animate-pulse")} />
      </button>
      <div className="absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-xl bg-card/95 shadow-soft ring-1 ring-border">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-lg leading-none hover:bg-muted"
          onClick={() => bumpZoom(1)}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="flex size-10 items-center justify-center text-lg leading-none hover:bg-muted"
          onClick={() => bumpZoom(-1)}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
      <p className="absolute bottom-2 left-3 z-20 rounded-md bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground">
        © Google
      </p>
      {pins.length === 0 && (
        <p className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
          No mapped listings in this set yet.
        </p>
      )}
    </div>
  );
}
