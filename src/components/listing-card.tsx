import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatDistance, listingDistanceKm } from "@/lib/geo";
import { listingCover } from "@/lib/media";
import { AddToTrip } from "@/components/add-to-trip";
import { OpenNowBadge } from "@/components/open-now-badge";
import { SaveButton } from "@/components/save-button";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { cn, decodeEntities } from "@/lib/utils";
import { useGeo } from "@/store/geo";
import { fetchWpListing } from "@/lib/wp-api";

function kindLabel(listing: Listing) {
  return decodeEntities(listing.kind || "Listing");
}

function PlaceLine({ listing }: { listing: Listing }) {
  const origin = useGeo((s) => s.origin);
  const fromGps = useGeo((s) => s.source === "gps");
  const km = listingDistanceKm(origin, listing);
  const place = listing.area || listing.location;
  return (
    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
      <MapPin className="size-3 shrink-0" />
      <span className="block min-w-0 truncate">
        {km != null ? formatDistance(km, fromGps) : place}
        {km != null && place ? ` · ${place}` : ""}
      </span>
    </p>
  );
}

function PinMark({ n, active = false, className }: { n: number; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "absolute z-10 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums shadow-soft ring-2 ring-background",
        active ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
        className,
      )}
    >
      {n}
    </span>
  );
}

function Cover({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  return (
    <img
      src={listingCover(listing)}
      alt={listing.name}
      className={cn("object-cover", className)}
      loading="lazy"
      decoding="async"
    />
  );
}

function prefetchListing(listing: Listing) {
  void fetchWpListing({ data: { slug: listing.slug, url: listing.siteUrl } });
}

export function ListingCard({
  listing,
  layout = "grid",
  active = false,
  pin,
  cardId,
}: {
  listing: Listing;
  layout?: "grid" | "row" | "compact";
  active?: boolean;
  pin?: number;
  cardId?: string;
}) {
  if (layout === "row") {
    return (
      <article
        id={cardId}
        className={cn(
          "relative flex gap-2.5 rounded-xl bg-card p-1.5 pr-2.5 shadow-soft ring-1 transition-transform duration-150 hover:-translate-y-0.5",
          active ? "ring-primary" : "ring-border/70",
        )}
      >
        <Link
          to="/place/$slug"
          params={{ slug: listing.slug }}
          className="flex min-w-0 flex-1 gap-2.5"
          onPointerEnter={() => prefetchListing(listing)}
          onPointerDown={() => prefetchListing(listing)}
        >
          <div className="relative h-[4.75rem] w-[6.25rem] shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-28">
            <Cover listing={listing} className="size-full" />
            {pin != null && <PinMark n={pin} active={active} className="left-1 top-1" />}
          </div>
          <div className="min-w-0 flex-1 py-0.5 pr-12">
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-primary">
              {listing.featured ? "Featured · " : ""}
              {kindLabel(listing)}
            </p>
            <h3 className="truncate text-sm font-semibold leading-snug">{listing.name}</h3>
            {listing.rating > 0 && (
              <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                <Stars value={listing.rating} />
                <span className="text-[11px]">({listing.reviews.toLocaleString()})</span>
              </div>
            )}
            <div className="mt-0.5 flex min-w-0 flex-col items-start gap-0.5">
              <OpenNowBadge listing={listing} />
              <PlaceLine listing={listing} />
            </div>
          </div>
        </Link>
        <div className="absolute right-1.5 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1">
          <SaveButton
            slug={listing.slug}
            name={listing.name}
            wpId={listing.wpId}
            className="size-8 shadow-none"
          />
          <AddToTrip
            slug={listing.slug}
            name={listing.name}
            wpId={listing.wpId}
            variant="icon"
            className="size-8 shadow-none"
          />
        </div>
      </article>
    );
  }

  const compact = layout === "compact";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-soft ring-1 ring-border/70 transition-transform duration-150 hover:-translate-y-0.5">
      <Link
        id={`listing-card-${listing.slug}`}
        to="/place/$slug"
        params={{ slug: listing.slug }}
        className="flex flex-1 flex-col"
        onPointerEnter={() => prefetchListing(listing)}
        onPointerDown={() => prefetchListing(listing)}
      >
        <div className={cn("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[4/3]")}>
          <Cover
            listing={listing}
            className="size-full transition-transform duration-500 group-hover:scale-105"
          />
          {pin != null && <PinMark n={pin} active={active} className="left-2 top-2" />}
          <Badge
            className={cn(
              "absolute top-2 bg-card/90 text-[11px] text-foreground backdrop-blur-sm",
              pin != null ? "left-9" : "left-2",
            )}
          >
            {listing.featured ? `Featured · ${kindLabel(listing)}` : kindLabel(listing)}
          </Badge>
        </div>
        <div className={cn("flex flex-1 flex-col gap-0.5", compact ? "p-2.5 pr-10" : "p-3 pr-12")}>
          <h3 className={cn("font-semibold leading-snug", compact ? "text-sm" : "text-base")}>{listing.name}</h3>
          {listing.rating > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Stars value={listing.rating} />
              <span className="text-[11px]">({listing.reviews.toLocaleString()})</span>
            </div>
          )}
          <PlaceLine listing={listing} />
          <div className="mt-0.5">
            <OpenNowBadge listing={listing} />
          </div>
        </div>
      </Link>
      <SaveButton
        slug={listing.slug}
        name={listing.name}
        wpId={listing.wpId}
        className={cn("absolute z-10", compact ? "bottom-2 right-11 size-8" : "bottom-2.5 right-12 size-9")}
      />
      <AddToTrip
        slug={listing.slug}
        name={listing.name}
        wpId={listing.wpId}
        variant="icon"
        className={cn("absolute z-10", compact ? "bottom-2 right-2 size-8" : "bottom-2.5 right-2.5 size-9")}
      />
    </article>
  );
}
