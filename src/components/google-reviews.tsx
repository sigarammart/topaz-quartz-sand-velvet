import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Star } from "lucide-react";
import { loadGooglePlaces } from "@/lib/google-maps";

type Review = {
  author_name?: string;
  author_url?: string;
  profile_photo_url?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
};

type PlaceDetails = {
  name?: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  reviews?: Review[];
};

type PlacesStatus = string | undefined;

function googleMapsPlaceUrl(placeId: string) {
  return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`;
}

export function GoogleReviews({
  placeId,
  name,
  address,
}: {
  placeId?: string;
  name: string;
  address?: string;
}) {
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PlacesStatus>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStatus(undefined);
    setPlace(null);

    void loadGooglePlaces().then((places) => {
      if (cancelled) return;

      if (!places?.PlacesService) {
        setStatus("PLACES_LIBRARY_UNAVAILABLE");
        setLoading(false);
        return;
      }

      const host = document.createElement("div");
      const service = new places.PlacesService(host);

      const getDetails = (resolvedPlaceId: string) => {
        service.getDetails(
          {
            placeId: resolvedPlaceId,
            fields: ["name", "rating", "user_ratings_total", "reviews", "url"],
          },
          (details, resultStatus) => {
            if (cancelled) return;
            setPlace((details as PlaceDetails | null) ?? null);
            setStatus(resultStatus);
            setLoading(false);
          },
        );
      };

      if (placeId) {
        getDetails(placeId);
        return;
      }

      if (typeof service.findPlaceFromQuery !== "function") {
        setStatus("MISSING_PLACE_ID");
        setLoading(false);
        return;
      }

      const query = [name, address, "Puducherry"].filter(Boolean).join(", ");
      service.findPlaceFromQuery(
        {
          query,
          fields: ["place_id", "name", "rating", "user_ratings_total", "url"],
        },
        (matches, resultStatus) => {
          if (cancelled) return;
          const resolvedPlaceId = matches?.[0]?.place_id;
          if (!resolvedPlaceId) {
            setStatus(resultStatus || "ZERO_RESULTS");
            setLoading(false);
            return;
          }
          getDetails(resolvedPlaceId);
        },
      );
    }).catch(() => {
      if (cancelled) return;
      setStatus("LOAD_ERROR");
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [placeId, name, address]);
  const reviews = (place?.reviews ?? []).slice(0, 3);
  const viewAllUrl = place?.url || googleMapsPlaceUrl(placeId);
  const failed = !loading && status && status !== "OK";

  return (
    <section className="mt-6 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/70" aria-label="Google reviews">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Google reviews</h2>
          {place?.rating ? (
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold tabular-nums">{place.rating.toFixed(1)}</span>
              {place.user_ratings_total ? (
                <span className="text-muted-foreground">
                  · {place.user_ratings_total.toLocaleString()} reviews
                </span>
              ) : null}
              <span className="font-medium text-muted-foreground">· Google</span>
            </div>
          ) : (
            <div className="mt-1 text-xs text-muted-foreground">Ratings and reviews from Google</div>
          )}
        </div>

        <a
          href={viewAllUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
          <Loader2 className="size-4 animate-spin" />
          Loading Google reviews…
        </div>
      ) : reviews.length ? (
        <div className="mt-4 space-y-3">
          {reviews.map((review, index) => (
            <article
              key={`${review.author_url ?? review.author_name ?? "review"}-${index}`}
              className="rounded-xl bg-background/60 p-3 ring-1 ring-border/70"
            >
              <div className="flex items-center gap-2">
                {review.profile_photo_url ? (
                  <img
                    src={review.profile_photo_url}
                    alt=""
                    className="size-8 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {(review.author_name ?? "G").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  {review.author_url ? (
                    <a
                      href={review.author_url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-semibold hover:underline"
                    >
                      {review.author_name ?? "Google reviewer"}
                    </a>
                  ) : (
                    <p className="truncate text-sm font-semibold">{review.author_name ?? "Google reviewer"}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star
                          key={star}
                          className={`size-3 ${star < Math.round(review.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
                        />
                      ))}
                    </span>
                    {review.relative_time_description ? <span>· {review.relative_time_description}</span> : null}
                  </div>
                </div>
              </div>
              {review.text ? (
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.text}</p>
              ) : null}
            </article>
          ))}
          <p className="pt-1 text-[11px] text-muted-foreground">
            Reviews and ratings are provided by Google. Individual reviews are shown with their Google author attribution.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-background/60 p-3 text-xs text-muted-foreground ring-1 ring-border/70">
          {failed ? "Google did not return reviews for this place." : "No Google reviews were returned."}
        </div>
      )}
    </section>
  );
}
