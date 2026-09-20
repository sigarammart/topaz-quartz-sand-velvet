import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resolvePlace, reverseGeocode, searchPlaces, type PlaceSuggestion } from "@/lib/places";

export function LocationAutocomplete({
  value,
  lat,
  lng,
  onChange,
}: {
  value: string;
  lat?: number;
  lng?: number;
  onChange: (next: { label: string; lat?: number; lng?: number }) => void;
}) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<PlaceSuggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [active, setActive] = useState(0);
  const skipSearch = useRef(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    const handle = window.setTimeout(() => {
      setBusy(true);
      void searchPlaces(q)
        .then((rows) => {
          setHits(rows);
          setOpen(rows.length > 0);
          setActive(0);
        })
        .finally(() => setBusy(false));
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function pick(hit: PlaceSuggestion) {
    skipSearch.current = true;
    setBusy(true);
    const resolved = await resolvePlace(hit);
    skipSearch.current = true;
    setQuery(resolved.label);
    setHits([]);
    setOpen(false);
    setBusy(false);
    onChange({ label: resolved.label, lat: resolved.lat, lng: resolved.lng });
  }

  function onType(next: string) {
    setQuery(next);
    onChange({ label: next });
  }

  function useHere() {
    if (!navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextLat = pos.coords.latitude;
        const nextLng = pos.coords.longitude;
        void reverseGeocode(nextLat, nextLng)
          .then((label) => {
            skipSearch.current = true;
            setQuery(label);
            onChange({ label, lat: nextLat, lng: nextLng });
          })
          .finally(() => setGeoBusy(false));
      },
      () => setGeoBusy(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div ref={root} className="relative">
      <Input
        id="user_location"
        name="user_location"
        value={query}
        autoComplete="off"
        placeholder="Enter a location"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="pr-10"
        onChange={(e) => onType(e.target.value)}
        onFocus={() => {
          if (hits.length) setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            if (lat != null && lng != null) return;
            const q = query.trim();
            if (q.length < 3) return;
            void searchPlaces(q).then(async (rows) => {
              const first = rows[0];
              if (!first) return;
              const resolved = await resolvePlace(first);
              if (resolved.lat == null || resolved.lng == null) return;
              skipSearch.current = true;
              onChange({ label: query, lat: resolved.lat, lng: resolved.lng });
            });
          }, 180);
        }}
        onKeyDown={(e) => {
          if (!open || !hits.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % hits.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + hits.length) % hits.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            void pick(hits[active] ?? hits[0]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      <input type="hidden" name="location_lat" value={lat ?? ""} readOnly />
      <input type="hidden" name="location_lng" value={lng ?? ""} readOnly />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
      </span>
      {open && hits.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-card py-1 text-sm shadow-soft ring-1 ring-border"
        >
          {hits.map((hit, i) => (
            <li key={hit.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted",
                  i === active && "bg-muted",
                )}
                onMouseEnter={() => setActive(i)}
                onClick={() => void pick(hit)}
              >
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{hit.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={useHere}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        {geoBusy ? <Loader2 className="size-3.5 animate-spin" /> : <LocateFixed className="size-3.5" />}
        Use my current location
      </button>
      {lat != null && lng != null && (
        <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
