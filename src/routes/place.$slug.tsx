import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock3, ExternalLink, MapPin, Navigation, Ticket, Timer } from "lucide-react";
import { AddToTrip } from "@/components/add-to-trip";
import { ListingCard } from "@/components/listing-card";
import { SaveButton } from "@/components/save-button";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListing } from "@/data/listings";
import { CATEGORY_META } from "@/lib/types";
import type { Listing } from "@/lib/types";
import { fetchWpListing } from "@/lib/wp-api";
import { catalogListing, catalogNearby, useCatalog } from "@/store/catalog";

export const Route = createFileRoute("/place/$slug")({
  component: PlacePage,
});

function PlacePage() {
  const { slug } = Route.useParams();
  const items = useCatalog((s) => s.items);
  const status = useCatalog((s) => s.status);
  const catalogHit = catalogListing(slug, items) ?? getListing(slug);
  const [fetched, setFetched] = useState<Listing | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (catalogHit) {
      setFetched(null);
      return;
    }
    void fetchWpListing({ data: { slug } }).then((row) => {
      if (!cancelled) setFetched(row);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, catalogHit]);

  const listing = catalogHit ?? fetched;
  if (!listing) {
    if (status === "loading" || status === "idle") {
      return <p className="py-16 text-center text-sm text-muted-foreground">Loading place…</p>;
    }
    throw notFound();
  }
  const nearby = catalogNearby(listing.slug, items);
  const maps =
    listing.lat && listing.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.name + " Pondicherry")}`;

  return (
    <article>
      <div className="relative overflow-hidden rounded-2xl">
        <img src={listing.image} alt="" className="h-64 w-full object-cover sm:h-80" />
        <SaveButton slug={listing.slug} name={listing.name} className="absolute right-4 top-4" />
      </div>

      <div className="mt-5">
        <Link
          to="/explore"
          search={{ cat: listing.category, q: "" }}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          {CATEGORY_META[listing.category].label}
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold">{listing.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {listing.rating > 0 && (
            <>
              <Stars value={listing.rating} />
              <span className="tabular-nums">{listing.reviews.toLocaleString()} reviews</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {listing.location}
          </span>
        </div>
        {listing.price && (
          <p className="mt-2 text-sm font-medium text-foreground">{listing.price}</p>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <AddToTrip slug={listing.slug} name={listing.name} />
        <Button variant="outline" asChild className="flex-1">
          <a href={maps} target="_blank" rel="noreferrer">
            <Navigation />
            Directions
          </a>
        </Button>
      </div>

      <p className="mt-6 text-base leading-relaxed text-foreground/90">{listing.description}</p>

      {(listing.hours || listing.distance || listing.duration || listing.entry) && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listing.hours && <Info label="Hours" value={listing.hours} icon={Clock3} />}
          {listing.distance && <Info label="Distance" value={listing.distance} icon={MapPin} />}
          {listing.duration && <Info label="Time needed" value={listing.duration} icon={Timer} />}
          {listing.entry && <Info label="Entry" value={listing.entry} icon={Ticket} />}
        </dl>
      )}

      {listing.bestFor.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold">Best for</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.bestFor.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {listing.tags.length > 0 && (
        <div className="mt-4">
          <h2 className="font-display text-lg font-semibold">Known for</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.tags.map((t) => (
              <Badge key={t} tone="outline">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {listing.mustTry && listing.mustTry.length > 0 && (
        <div className="mt-6 rounded-xl bg-card p-5 ring-1 ring-border/70">
          <h2 className="font-display text-lg font-semibold">Must try</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {listing.mustTry.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={listing.siteUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-md text-sm font-medium text-primary hover:underline"
      >
        View on xplorepondy.com
        <ExternalLink className="size-4" />
      </a>

      {nearby.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Nearby & related</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {nearby.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-border/70">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
