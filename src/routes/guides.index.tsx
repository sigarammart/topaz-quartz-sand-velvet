import { createFileRoute, Link } from "@tanstack/react-router";
import { guides } from "@/data/guides";

export const Route = createFileRoute("/guides/")({ component: GuidesIndex });

function GuidesIndex() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Travel guide
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Stories, tips, and itineraries</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Written to help you move through Pondicherry with a little more sense and a little less
        queue.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.slug}
            to="/guides/$slug"
            params={{ slug: g.slug }}
            className="overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70"
          >
            <img src={g.image} alt="" className="h-44 w-full object-cover" />
            <div className="p-5">
              <p className="text-xs text-muted-foreground">
                {g.topic} · {g.date} · {g.readTime} read
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">{g.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
