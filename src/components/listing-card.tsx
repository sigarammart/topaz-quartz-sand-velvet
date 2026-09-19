import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatDistance, listingDistanceKm } from "@/lib/geo";
import { listingIsOpen } from "@/lib/hours";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGeo } from "@/store/geo";

function OpenStatus({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  const open = listingIsOpen(listing);
  if (open === undefined && !listing.hours) return null;
  const label =
    open === true ? "Open now" : open === false ? listing.hours || "Closed" : listing.hours;
  return (
    <span
      className={cn(
        "truncate rounded-full px-2 py-0.5 text-[11px] font-semibold",
        open === true && "bg-accent text-accent-foreground",
        open === false && "bg-destructive/10 text-destructive",
        open === undefined && "bg-card/90 text-muted-foreground",
        compact && "max-w-[11rem]",
      )}
    >
      {label}
    </span>
  );
}

function PlaceLine({ listing }: { listing: Listing }) {
  const origin = useGeo((s) => s.origin);
  const fromGps = useGeo((s) => s.source === "gps");
  const km = listingDistanceKm(origin, listing);
  const place = listing.area || listing.location;
  return (
    <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
      <MapPin className="size-3.5 shrink-0" />
      <span className="truncate">
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
        "absolute z-10 flex size-6 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums shadow-soft ring-2 ring-background",
        active ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
        className,
      )}
    >
      {n}
    </span>
  );
}

export function ListingCard({
  listing,
  layout = "grid",
  active = false,
  pin,
  cardId,
}: {
  listing: Listing;
  layout?: "grid" | "row";
  active?: boolean;
  pin?: number;
  cardId?: string;
}) {
  if (layout === "row") {
    return (
      <Link
        id={cardId}
        to="/place/$slug"
        params={{ slug: listing.slug }}
        className={cn(
          "flex gap-3 rounded-xl bg-card p-2 pr-3 shadow-soft ring-1 transition-transform duration-150 hover:-translate-y-0.5",
          active ? "ring-primary" : "ring-border/70",
        )}
      >
        <div className="relative size-24 shrink-0">
          <img src={listing.image} alt="" className="size-24 rounded-lg object-cover" />
          {pin != null && <PinMark n={pin} active={active} className="left-1.5 top-1.5" />}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {listing.kind}
            </p>
            <OpenStatus listing={listing} compact />
          </div>
          <h3 className="truncate font-display text-base font-semibold">{listing.name}</h3>
          {listing.rating > 0 && (
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Stars value={listing.rating} />
              <span className="text-xs">({listing.reviews.toLocaleString()})</span>
            </div>
          )}
          <div className="mt-1 text-xs">
            <PlaceLine listing={listing} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      id={`listing-card-${listing.slug}`}
      to="/place/$slug"
      params={{ slug: listing.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {pin != null && <PinMark n={pin} active={active} className="left-3 top-3" />}
        <Badge
          className={cn(
            "absolute top-3 bg-card/90 text-foreground backdrop-blur-sm",
            pin != null ? "left-11" : "left-3",
          )}
        >
          {listing.kind}
        </Badge>
        <span className="absolute right-3 top-3">
          <OpenStatus listing={listing} compact />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg font-semibold leading-snug">{listing.name}</h3>
        {listing.rating > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Stars value={listing.rating} />
            <span className="text-xs">({listing.reviews.toLocaleString()})</span>
          </div>
        )}
        <PlaceLine listing={listing} />
      </div>
    </Link>
  );
}
