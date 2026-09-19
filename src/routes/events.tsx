import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { events } from "@/data/events";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/events")({ component: EventsPage });

function EventsPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Events</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">What’s happening in Pondy</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Recurring rituals and the festivals that still shape the calendar — from promenade evenings
        to Pongal.
      </p>
      <div className="mt-8 space-y-4">
        {events.map((ev) => (
          <article
            key={ev.slug}
            className="overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70 sm:flex"
          >
            <img src={ev.image} alt="" className="h-44 w-full object-cover sm:h-auto sm:w-56" />
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {ev.dateLabel}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">{ev.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {ev.place} · {ev.when}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{ev.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ev.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
