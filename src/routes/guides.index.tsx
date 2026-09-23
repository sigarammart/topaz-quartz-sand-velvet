import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/store/catalog";

export const Route = createFileRoute("/guides/")({ component: GuidesIndex });

const PAGE_SIZE = 6;

function GuidesIndex() {
  const guides = useCatalog((s) => s.guides);
  const source = useCatalog((s) => s.source);
  const status = useCatalog((s) => s.status);
  const [shown, setShown] = useState(PAGE_SIZE);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Travel guide
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Stories, tips, and itineraries</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Written to help you move through Pondicherry with a little more sense and a little less
        queue.
        {source === "live"
          ? ` Live from xplorepondy.com · ${guides.length} guides.`
          : status === "loading"
            ? " Refreshing from the website…"
            : ""}
      </p>
      <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-4">
        {guides.slice(0, shown).map((g) => (
          <Link
            key={g.slug}
            to="/guides/$slug"
            params={{ slug: g.slug }}
            className="overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70"
          >
            <img src={g.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-3.5 md:p-5">
              <p className="text-xs text-muted-foreground">
                {g.topic} · {g.date} · {g.readTime} read
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold leading-snug md:text-xl">{g.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground md:line-clamp-3">{g.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      {shown < guides.length && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setShown((count) => count + PAGE_SIZE)}>
            Load more · {guides.length - shown} left
          </Button>
        </div>
      )}
    </div>
  );
}