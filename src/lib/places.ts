import { GOOGLE_MAPS_KEY, loadGooglePlaces } from "@/lib/google-maps";

export type PlaceSuggestion = {
  id: string;
  label: string;
  lat?: number;
  lng?: number;
};

const PONDY_BIAS = { lat: 11.934, lng: 79.832 };

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const googleHits = await searchGooglePlaces(q);
  if (googleHits.length) return googleHits;
  return searchNominatim(q);
}

async function searchGooglePlaces(query: string): Promise<PlaceSuggestion[]> {
  const places = await loadGooglePlaces();
  if (!places) return [];
  try {
    if (places.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
      const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        includedRegionCodes: ["in"],
        locationBias: {
          center: PONDY_BIAS,
          radius: 180000,
        },
      });
      return (suggestions ?? [])
        .map((s) => ({
          id: s.placePrediction?.placeId ?? s.placePrediction?.text?.text ?? "",
          label: s.placePrediction?.text?.text ?? "",
        }))
        .filter((s) => s.id && s.label)
        .slice(0, 6);
    }
    if (places.AutocompleteService) {
      const service = new places.AutocompleteService();
      const preds = await new Promise<Array<{ description: string; place_id: string }>>((resolve) => {
        service.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "in" },
            location: PONDY_BIAS,
            radius: 180000,
          },
          (results) => resolve(results ?? []),
        );
      });
      return preds.slice(0, 6).map((p) => ({ id: p.place_id, label: p.description }));
    }
  } catch {
    return [];
  }
  return [];
}

export async function resolvePlace(hit: PlaceSuggestion): Promise<PlaceSuggestion> {
  if (hit.lat != null && hit.lng != null) return hit;
  const details = await googlePlaceDetails(hit.id);
  if (details) return { ...hit, ...details, label: details.label || hit.label };
  const geo = await geocodeLabel(hit.label);
  return geo ?? hit;
}

async function googlePlaceDetails(placeId: string): Promise<PlaceSuggestion | null> {
  if (!placeId || placeId.startsWith("osm:")) return null;
  const places = await loadGooglePlaces();
  if (!places?.PlacesService) return null;
  try {
    const service = new places.PlacesService(document.createElement("div"));
    const place = await new Promise<{ formatted_address?: string; name?: string; geometry?: { location?: { lat: () => number; lng: () => number } } } | null>(
      (resolve) => {
        service.getDetails({ placeId, fields: ["geometry", "formatted_address", "name"] }, (row) => resolve(row));
      },
    );
    const loc = place?.geometry?.location;
    if (!loc) return null;
    return {
      id: placeId,
      label: place.formatted_address || place.name || "",
      lat: loc.lat(),
      lng: loc.lng(),
    };
  } catch {
    return null;
  }
}

async function searchNominatim(query: string): Promise<PlaceSuggestion[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=0&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ place_id: number; display_name: string; lat: string; lon: string }>;
    return rows.map((row) => ({
      id: `osm:${row.place_id}`,
      label: row.display_name,
      lat: Number(row.lat),
      lng: Number(row.lon),
    }));
  } catch {
    return [];
  }
}

async function geocodeLabel(label: string): Promise<PlaceSuggestion | null> {
  const hits = await searchNominatim(label);
  return hits[0] ?? null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const row = (await res.json()) as { display_name?: string };
    return row.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function googleMapsKey() {
  return GOOGLE_MAPS_KEY;
}
