import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTrip } from "@/store/trip";
import { getListing } from "@/data/listings";

export const Route = createFileRoute("/plan")({ component: PlanPage });

const INTERESTS = [
  "French Quarter",
  "Beaches",
  "Auroville",
  "Food",
  "Nightlife",
  "Family",
  "Surf & dive",
  "Spiritual",
];

function PlanPage() {
  const addInquiry = useTrip((s) => s.addInquiry);
  const items = useTrip((s) => s.items);
  const tripTitle = useTrip((s) => s.title);
  const [sent, setSent] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  function toggle(tag: string) {
    setPicked((p) => (p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addInquiry({
      id: crypto.randomUUID(),
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      dates: String(data.get("dates") ?? ""),
      travellers: String(data.get("travellers") ?? ""),
      interests: picked.join(", "),
      message: String(data.get("message") ?? ""),
      createdAt: new Date().toISOString(),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary">
          <Check className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold">We’ve got your sketch</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your request is saved on this device. For a booked, agent-led trip, send the same notes
          through xplorepondy.com — that’s where the team picks up.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <a href="https://xplorepondy.com/trips/" target="_blank" rel="noreferrer">
              Continue on xplorepondy.com
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/trip">Back to itinerary</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fromTrip = items
    .map((i) => getListing(i.slug)?.name)
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Custom trip</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Tell us how you want Pondy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verified travel agents, 100% custom days, assistance around the clock. Sketch it here, then
        finish with the team on the website.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dates">Travel dates</Label>
            <Input id="dates" name="dates" placeholder="e.g. 12–15 Oct" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="travellers">Travellers</Label>
            <Input id="travellers" name="travellers" placeholder="2 adults" required />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Interests</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((tag) => {
              const on = picked.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={
                    on
                      ? "h-9 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground"
                      : "h-9 rounded-full bg-card px-3 text-sm font-medium ring-1 ring-border"
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Anything else</Label>
          <Textarea
            id="message"
            name="message"
            placeholder={
              fromTrip.length
                ? `I’m already looking at: ${fromTrip.join(", ")}`
                : "Pace, budget, must-sees…"
            }
          />
        </div>
        {items.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Your current sketch “{tripTitle}” has {items.length} stops — mention it in the note if
            you want it used.
          </p>
        )}
        <Button type="submit" className="w-full" size="lg">
          Send request
        </Button>
      </form>
    </div>
  );
}
