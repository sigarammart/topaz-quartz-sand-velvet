import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accessibility,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Ticket,
  Timer,
  Users,
  X,
} from "lucide-react";
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
import { exploreSearchForTerm } from "@/lib/filters";
import { catalogListing, catalogNearby, useCatalog } from "@/store/catalog";
import { useGeo } from "@/store/geo";
import { formatDistance, listingDistanceKm } from "@/lib/geo";
import { listingIsOpen } from "@/lib/hours";

export const Route = createFileRoute("/place/$slug")({
  component: PlacePage,
});

function mergeListing(base?: Listing | null, extra?: Listing | null): Listing | null {
  if (!extra) return base ?? null;
  if (!base) return extra;
  return {
    ...base,
    ...extra,
    description: extra.description || base.description,
    rating: extra.rating || base.rating,
    reviews: extra.reviews || base.reviews,
    hours: extra.hours || base.hours,
    openNow: extra.openNow ?? base.openNow,
    weeklyHours: extra.weeklyHours?.length ? extra.weeklyHours : base.weeklyHours,
    distance: extra.distance || base.distance,
    duration: extra.duration || base.duration,
    entry: extra.entry || base.entry,
    price: extra.price || base.price,
    phone: extra.phone || base.phone,
    address: extra.address || base.address,
    lat: extra.lat ?? base.lat,
    lng: extra.lng ?? base.lng,
    tags: extra.tags.length ? extra.tags : base.tags,
    bestFor: extra.bestFor.length ? extra.bestFor : base.bestFor,
    cafeTypes: extra.cafeTypes?.length ? extra.cafeTypes : base.cafeTypes,
    accessibility: extra.accessibility?.length ? extra.accessibility : base.accessibility,
    taxonomies: extra.taxonomies?.length ? extra.taxonomies : base.taxonomies,
    itinerary: extra.itinerary?.length ? extra.itinerary : base.itinerary,
    faqs: extra.faqs?.length ? extra.faqs : base.faqs,
    menuImages: extra.menuImages?.length ? extra.menuImages : base.menuImages,
    metaGroups: extra.metaGroups?.length ? extra.metaGroups : base.metaGroups,
    metaFacets: extra.metaFacets?.length ? extra.metaFacets : base.metaFacets,
    gallery: extra.gallery?.length ? extra.gallery : base.gallery,
    mustTry: extra.mustTry?.length ? extra.mustTry : base.mustTry,
    featured: extra.featured ?? base.featured,
  };
}

function PlacePage() {
  const { slug } = Route.useParams();
  const items = useCatalog((s) => s.items);
  const status = useCatalog((s) => s.status);
  const catalogHit = catalogListing(slug, items) ?? getListing(slug);
  const [fetched, setFetched] = useState<Listing | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setFetched(undefined);
    void fetchWpListing({ data: { slug } }).then((row) => {
      if (!cancelled) setFetched(row);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const listing = mergeListing(catalogHit, fetched ?? null);
  const origin = useGeo((s) => s.origin);
  const fromGps = useGeo((s) => s.source === "gps");
  if (!listing) {
    if (fetched === undefined || status === "loading" || status === "idle") {
      return <p className="py-16 text-center text-sm text-muted-foreground">Loading place…</p>;
    }
    throw notFound();
  }
  const km = listingDistanceKm(origin, listing);
  const nearby = catalogNearby(listing.slug, items);
  const maps =
    listing.lat && listing.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((listing.address || listing.name) + " Pondicherry")}`;
  const taxonomies = listing.taxonomies ?? [];
  const cafeTypes = listing.cafeTypes ?? [];
  const accessibility = listing.accessibility ?? [];
  const itinerary = listing.itinerary ?? [];
  const faqs = listing.faqs ?? [];
  const menuImages = listing.menuImages ?? [];
  const metaGroups = listing.metaGroups ?? [];
  const gallery = listing.gallery ?? [];
  const tel = listing.phone?.replace(/[^\d+]/g, "") ?? "";
  const metaTitles = new Set(metaGroups.map((g) => g.title.toLowerCase()));
  const showCafeTypes = cafeTypes.length > 0 && !metaTitles.has("cafe type");

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
          {listingIsOpen(listing) === true && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
              Open now
            </span>
          )}
          {listingIsOpen(listing) === false && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
              Closed
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {km != null ? formatDistance(km, fromGps) : listing.address || listing.location}
            {km != null && (listing.address || listing.location) ? ` · ${listing.address || listing.location}` : ""}
          </span>
        </div>
        {listing.price && (
          <p className="mt-2 text-sm font-medium text-foreground">{listing.price}</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <AddToTrip slug={listing.slug} name={listing.name} />
        <Button variant="outline" asChild className="flex-1">
          <a href={maps} target="_blank" rel="noreferrer">
            <Navigation />
            Directions
          </a>
        </Button>
        {tel && (
          <Button variant="outline" asChild className="flex-1">
            <a href={`tel:${tel}`}>
              <Phone />
              Call
            </a>
          </Button>
        )}
      </div>

      <p className="mt-6 text-base leading-relaxed text-foreground/90">{listing.description}</p>

      {(listing.hours ||
        listing.distance ||
        listing.duration ||
        listing.entry ||
        listing.groupSize ||
        listing.phone ||
        listing.address) && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listing.hours && <Info label="Hours" value={listing.hours} icon={Clock3} />}
          {listing.distance && <Info label="Distance" value={listing.distance} icon={MapPin} />}
          {listing.duration && <Info label="Time needed" value={listing.duration} icon={Timer} />}
          {listing.entry && <Info label="Entry" value={listing.entry} icon={Ticket} />}
          {listing.groupSize && <Info label="Group size" value={listing.groupSize} icon={Users} />}
          {listing.phone && <Info label="Phone" value={listing.phone} icon={Phone} />}
          {listing.address && <Info label="Address" value={listing.address} icon={MapPin} />}
        </dl>
      )}

      {(listing.weeklyHours?.length ?? 0) > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold">Hours</h2>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-border/70">
            {listing.weeklyHours!.map((row) => (
              <li key={row.day} className="flex items-baseline justify-between gap-3 px-3 py-2 text-sm">
                <span className="font-medium">{row.day}</span>
                <span className="text-right text-muted-foreground">{row.slots.join(", ")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {metaGroups.length > 0 && (
        <div className="mt-8 space-y-8">
          {metaGroups.map((group) => {
            const scored = group.items.some((i) => i.included !== undefined);
            return (
              <section key={group.title}>
                <h2 className="font-display text-lg font-semibold">{group.title}</h2>
                {scored ? (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-start gap-2 rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/70"
                      >
                        {item.included === false ? (
                          <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                        ) : (
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        )}
                        <span className={item.included === false ? "text-muted-foreground" : ""}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Badge key={item.label}>{item.label}</Badge>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {showCafeTypes && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Cafe type</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {cafeTypes.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </section>
      )}

      {accessibility.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Accessibility className="size-4 text-primary" />
            Accessibility
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {accessibility.map((item) => (
              <li
                key={item}
                className="rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/70"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {taxonomies.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Listing details</h2>
          <div className="mt-4 space-y-4">
            {taxonomies.map((group) => (
              <div key={group.key}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {group.label}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.terms.map((term) => (
                    <Link
                      key={term.slug}
                      to="/explore"
                      search={exploreSearchForTerm(group.key, term.slug)}
                    >
                      <Badge tone="outline">{term.name}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {listing.bestFor.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold">Best for</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.bestFor.map((t) => (
              <Badge key={t}>{t}</Badge>
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

      {menuImages.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Menu</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {menuImages.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-36 w-28 shrink-0 rounded-xl object-cover ring-1 ring-border/70"
              />
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Photos</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {gallery.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-square w-full rounded-xl object-cover ring-1 ring-border/70"
              />
            ))}
          </div>
        </section>
      )}

      {itinerary.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Itinerary</h2>
          <ol className="mt-3 space-y-3">
            {itinerary.map((stop, i) => (
              <li key={`${stop.title}-${i}`} className="rounded-xl bg-card p-4 ring-1 ring-border/70">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {[stop.day, stop.time].filter(Boolean).join(" · ") || `Stop ${i + 1}`}
                </p>
                <p className="mt-1 font-display font-semibold">{stop.title}</p>
                {stop.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{stop.description}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">FAQs</h2>
          <div className="mt-3 space-y-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl bg-card p-4 ring-1 ring-border/70">
                <p className="font-medium">{faq.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
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
