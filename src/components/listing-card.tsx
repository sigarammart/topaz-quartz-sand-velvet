import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { Listing } from "@/lib/types";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";

export function ListingCard({
  listing,
  layout = "grid",
}: {
  listing: Listing;
  layout?: "grid" | "row";
}) {
  if (layout === "row") {
    return (
      <Link
        to="/place/$slug"
        params={{ slug: listing.slug }}
        className="flex gap-3 rounded-xl bg-card p-2 pr-3 shadow-soft ring-1 ring-border/70 transition-transform duration-150 hover:-translate-y-0.5"
      >
        <img
          src={listing.image}
          alt=""
          className="size-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 py-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {listing.kind}
          </p>
          <h3 className="truncate font-display text-base font-semibold">{listing.name}</h3>
          {listing.rating > 0 && (
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Stars value={listing.rating} />
              <span className="text-xs">({listing.reviews.toLocaleString()})</span>
            </div>
          )}
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            {listing.area}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
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
        <Badge className="absolute left-3 top-3 bg-card/90 text-foreground backdrop-blur-sm">
          {listing.kind}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg font-semibold leading-snug">{listing.name}</h3>
        {listing.rating > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Stars value={listing.rating} />
            <span className="text-xs">({listing.reviews.toLocaleString()})</span>
          </div>
        )}
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{listing.location}</span>
        </p>
      </div>
    </Link>
  );
}
