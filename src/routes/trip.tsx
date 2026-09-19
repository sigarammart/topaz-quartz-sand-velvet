import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Copy, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getListing } from "@/data/listings";
import { templates } from "@/data/templates";
import { useHydrated } from "@/lib/use-hydrated";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/trip")({ component: TripPage });

function TripPage() {
  const hydrated = useHydrated();
  const days = useTrip((s) => s.days);
  const title = useTrip((s) => s.title);
  const items = useTrip((s) => s.items);
  const setDays = useTrip((s) => s.setDays);
  const setTitle = useTrip((s) => s.setTitle);
  const removeItem = useTrip((s) => s.removeItem);
  const clearTrip = useTrip((s) => s.clearTrip);
  const loadTemplate = useTrip((s) => s.loadTemplate);
  const shownDays = hydrated ? days : 3;
  const shownItems = hydrated ? items : [];

  function copyPlan() {
    const lines = [`${title} · ${days} day${days > 1 ? "s" : ""}`, ""];
    for (let d = 1; d <= days; d++) {
      lines.push(`Day ${d}`);
      const dayItems = items.filter((i) => i.day === d);
      if (dayItems.length === 0) lines.push("  (open)");
      for (const it of dayItems) {
        const l = getListing(it.slug);
        lines.push(`  · ${l?.name ?? it.slug} (${l?.area ?? ""})`);
      }
      lines.push("");
    }
    void navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Itinerary copied");
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trip planner</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Build your Pondy days</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Saved on this device. Add places from Explore, or start from a template.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={hydrated ? title : "My Pondy trip"}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Trip title"
          className="sm:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setDays(shownDays - 1)} aria-label="Fewer days">
            <Minus />
          </Button>
          <span className="min-w-16 text-center text-sm font-medium tabular-nums">{shownDays} days</span>
          <Button variant="outline" size="icon" onClick={() => setDays(shownDays + 1)} aria-label="More days">
            <Plus />
          </Button>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={copyPlan} disabled={shownItems.length === 0}>
            <Copy />
            Copy
          </Button>
          <Button variant="ghost" onClick={clearTrip} disabled={shownItems.length === 0}>
            <Trash2 />
            Clear
          </Button>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Start from a template</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => {
                loadTemplate(t.title, t.days, t.items);
                toast.success(`Loaded ${t.title}`);
              }}
              className="overflow-hidden rounded-xl bg-card text-left ring-1 ring-border/70 transition-transform hover:-translate-y-0.5"
            >
              <img src={t.image} alt="" className="h-28 w-full object-cover" />
              <div className="p-3">
                <p className="text-xs text-primary">{t.days} days</p>
                <p className="font-display font-semibold">{t.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.blurb}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-10 space-y-8">
        {Array.from({ length: shownDays }, (_, i) => i + 1).map((day) => {
          const dayItems = shownItems.filter((it) => it.day === day);
          return (
            <section key={day}>
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                <h2 className="font-display text-xl font-semibold">Day {day}</h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {dayItems.length} stops
                </span>
              </div>
              {dayItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">This day is open.</p>
                  <Button asChild variant="secondary" className="mt-3">
                    <Link to="/explore">Add a place</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {dayItems.map((it) => {
                    const listing = getListing(it.slug);
                    if (!listing) return null;
                    return (
                      <li key={`${it.slug}-${day}`} className="relative">
                        <ListingCard listing={listing} layout="row" />
                        <button
                          type="button"
                          onClick={() => removeItem(it.slug, day)}
                          className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border hover:text-destructive"
                          aria-label={`Remove ${listing.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl bg-primary p-6 text-primary-foreground">
        <h2 className="font-display text-2xl font-semibold">Want this booked for you?</h2>
        <p className="mt-2 max-w-lg text-sm text-primary-foreground/80">
          Send the sketch to Xplore Pondy’s team — verified agents, custom days, 24×7 help.
        </p>
        <Button asChild variant="secondary" className="mt-4 bg-card text-foreground">
          <Link to="/plan">Request a custom trip</Link>
        </Button>
      </div>
    </div>
  );
}
