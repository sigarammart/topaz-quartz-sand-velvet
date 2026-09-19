import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getGuide, guides } from "@/data/guides";

export const Route = createFileRoute("/guides/$slug")({
  component: GuidePage,
});

function GuidePage() {
  const { slug } = Route.useParams();
  const guide = getGuide(slug);
  if (!guide) throw notFound();
  const others = guides.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        to="/guides"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <ArrowLeft className="size-4" />
        All guides
      </Link>
      <img
        src={guide.image}
        alt=""
        className="mt-4 h-56 w-full rounded-2xl object-cover sm:h-72"
      />
      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-primary">
        {guide.topic} · {guide.readTime} read
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold">{guide.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{guide.date}</p>
      <p className="mt-4 text-base text-muted-foreground">{guide.excerpt}</p>
      <div className="mt-8 space-y-6">
        {guide.sections.map((s, i) => (
          <section key={i}>
            {s.heading && (
              <h2 className="font-display text-xl font-semibold">{s.heading}</h2>
            )}
            <p className="mt-2 text-base leading-relaxed text-foreground/90">{s.body}</p>
          </section>
        ))}
      </div>
      {others.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl font-semibold">Keep reading</h2>
          <ul className="mt-4 space-y-3">
            {others.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/guides/$slug"
                  params={{ slug: g.slug }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {g.title}
                </Link>
                <p className="text-xs text-muted-foreground">{g.readTime} · {g.topic}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
