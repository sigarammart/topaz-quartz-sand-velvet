import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/saved")({ component: SavedPage });

function SavedPage() {
  const hydrated = useHydrated();
  const saved = useTrip((s) => s.saved);
  const items = useCatalog((s) => s.items);
  const listings = hydrated
    ? saved.map((slug) => resolveListing(slug, items)).filter((l) => l != null)
    : [];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Saved</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Your Pondy shortlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">Kept on this device. Add them to a trip whenever you’re ready.</p>

      {listings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Heart className="size-8 text-primary" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Nothing saved yet. Tap the heart on a place, café, or stay while you browse.
          </p>
          <Button asChild className="mt-5">
            <Link to="/explore">Start exploring</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.slug} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
