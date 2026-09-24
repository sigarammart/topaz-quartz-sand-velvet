import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppLoggedIn } from "@/lib/app-session";
import { useAuthModal } from "@/store/auth-modal";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/saved")({ component: SavedPage });

function SavedPage() {
  const hydrated = useHydrated();
  const tempTrip = useTrip((s) => s.tempTrip);
  const wpIds = useTrip((s) => s.wpIdsBySlug);
  const items = useCatalog((s) => s.items);
  const showLogin = useAuthModal((s) => s.show);
  const { loggedIn, isPending } = useAppLoggedIn();

  const listings = hydrated
    ? tempTrip
        .map((slug) => {
          const hit = resolveListing(slug, items);
          if (hit) return hit;
          const id = wpIds?.[slug];
          return id ? items.find((row) => row.wpId === id) : undefined;
        })
        .filter((l): l is NonNullable<typeof l> => l != null)
    : [];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Saved</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Your Trip Saved Places</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Places you added to your trip are collected here. Add them to a day from your Trip.
      </p>

      {isPending ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">Loading saved places…</p>
      ) : !loggedIn ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <CalendarPlus className="size-8 text-primary" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Sign in to see the places you have added to your trip.
          </p>
          <Button className="mt-5" onClick={() => showLogin({ reason: "trip", next: "/saved" })}>
            Sign in
          </Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <CalendarPlus className="size-8 text-primary" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            No places have been added to your trip yet.
          </p>
          <Button asChild className="mt-5">
            <Link to="/explore">Explore places</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/trip">
              <CalendarCheck />
              Open Trip
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
