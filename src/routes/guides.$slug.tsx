import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Lightbulb, List, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getGuide } from "@/data/guides";
import type { Guide, GuideBlock, GuideSection } from "@/lib/types";
import { fetchWpGuide } from "@/lib/wp-api";
import { catalogGuide, useCatalog } from "@/store/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guides/$slug")({
  component: GuidePage,
});

const DETAIL_TTL = 10 * 60 * 1000;
const DETAIL_VERSION = 3;
const detailCache = new Map<string, { at: number; guide: Guide }>();

function cachedDetail(slug: string) {
  const hit = detailCache.get(`${DETAIL_VERSION}:${slug}`);
  if (!hit) return undefined;
  if (Date.now() - hit.at > DETAIL_TTL) {
    detailCache.delete(`${DETAIL_VERSION}:${slug}`);
    return undefined;
  }
  return hit.guide;
}

function mergeGuide(base?: Guide | null, extra?: Guide | null): Guide | null {
  if (!extra) return base ?? null;
  if (!base) return extra;
  const extraScore =
    extra.sections.length + extra.sections.reduce((n, s) => n + (s.blocks?.length ?? 0), 0);
  const baseScore = base.sections.length + base.sections.reduce((n, s) => n + (s.blocks?.length ?? 0), 0);
  return {
    ...base,
    ...extra,
    title: extra.title || base.title,
    excerpt: extra.excerpt || base.excerpt,
    image: extra.image || base.image,
    topic: extra.topic || base.topic,
    date: extra.date || base.date,
    readTime: extra.readTime || base.readTime,
    siteUrl: extra.siteUrl || base.siteUrl,
    sections: extraScore >= baseScore ? extra.sections : base.sections,
  };
}

function headingId(heading: string, index: number) {
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || `section-${index}`;
}

function splitNumbered(heading: string) {
  const match = heading.match(/^(\d+)[.)]\s*(.+)$/);
  if (!match) return { n: null as string | null, title: heading };
  return { n: match[1], title: match[2] };
}

function GuidePage() {
  const { slug } = Route.useParams();
  const guides = useCatalog((s) => s.guides);
  const status = useCatalog((s) => s.status);
  const catalogHit = catalogGuide(slug, guides) ?? getGuide(slug);
  const [fetched, setFetched] = useState<{ slug: string; guide: Guide | null | undefined }>(() => ({
    slug,
    guide: cachedDetail(slug),
  }));

  useEffect(() => {
    let cancelled = false;
    const cached = cachedDetail(slug);
    setFetched({ slug, guide: cached });
    if (cached) return;
    void fetchWpGuide({
      data: {
        slug: catalogHit?.slug && catalogHit.slug.length > slug.length ? catalogHit.slug : slug,
        url: catalogHit?.siteUrl ?? getGuide(slug)?.siteUrl,
      },
    })
      .then((row) => {
        if (cancelled) return;
        if (row) {
          const rich = row.sections.some((s) =>
            s.blocks?.some((b) => b.type === "table" || b.type === "img" || b.type === "ul" || b.type === "tip"),
          );
          if (rich) detailCache.set(`${DETAIL_VERSION}:${slug}`, { at: Date.now(), guide: row });
        }
        setFetched({ slug, guide: row ?? null });
      })
      .catch(() => {
        if (!cancelled) setFetched({ slug, guide: null });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, catalogHit?.siteUrl]);

  const extra = fetched.slug === slug ? fetched.guide : cachedDetail(slug);
  const guide = mergeGuide(catalogHit, extra ?? null);
  const detailsLoading = extra === undefined;

  if (!guide) {
    if (extra === undefined || status === "loading" || status === "idle") {
      return (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16" role="status">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading guide…</p>
        </div>
      );
    }
    throw notFound();
  }

  const toc = useMemo(
    () =>
      guide.sections
        .map((s, i) => ({ heading: s.heading, id: s.heading ? headingId(s.heading, i) : "" }))
        .filter((s): s is { heading: string; id: string } => Boolean(s.heading && s.id)),
    [guide.sections],
  );
  const others = guides.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl" aria-busy={detailsLoading}>
      <Link to="/guides" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        <ArrowLeft className="size-3.5" />
        Travel guides
      </Link>

      <img src={guide.image} alt="" className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-border/70" />

      <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        <BookOpen className="size-3.5" />
        {guide.topic}
        <span className="text-muted-foreground">· {guide.readTime} read</span>
        {guide.date ? <span className="text-muted-foreground">· {guide.date}</span> : null}
        {detailsLoading && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-foreground">
            <Loader2 className="size-3 animate-spin" />
            Loading article
          </span>
        )}
      </p>
      <h1 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight sm:text-3xl">{guide.title}</h1>

      {toc.length >= 3 && (
        <nav className="mt-5 rounded-2xl bg-card p-4 ring-1 ring-border/70" aria-label="Table of contents">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <List className="size-3.5" />
            In this guide
          </p>
          <ol className="mt-2.5 list-none space-y-1">
            {toc.map((item) => {
              const { n, title } = splitNumbered(item.heading);
              return (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="flex gap-2 text-sm text-foreground/90 hover:text-primary">
                    <span className="w-5 shrink-0 tabular-nums text-xs font-semibold text-primary">{n ?? ""}</span>
                    <span className="leading-snug">{title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="mt-8 space-y-10">
        {guide.sections.map((section, i) => (
          <GuideSectionView key={`${section.heading ?? "intro"}-${i}`} section={section} index={i} />
        ))}
      </div>

      {detailsLoading && (
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          Pulling lists, tables and extra sections…
        </p>
      )}

      {others.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl font-semibold">Keep reading</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {others.map((g) => (
              <Link
                key={g.slug}
                to="/guides/$slug"
                params={{ slug: g.slug }}
                className="overflow-hidden rounded-xl bg-card ring-1 ring-border/70 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <img src={g.image} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="p-3">
                  <p className="text-[11px] text-muted-foreground">{g.topic} · {g.readTime}</p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug">{g.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function GuideSectionView({ section, index }: { section: GuideSection; index: number }) {
  const blocks = section.blocks?.length
    ? section.blocks
    : section.body
      ? [{ type: "p", text: section.body } satisfies GuideBlock]
      : [];
  if (!section.heading && !blocks.length) return null;
  const numbered = section.heading ? splitNumbered(section.heading) : null;
  const id = section.heading ? headingId(section.heading, index) : undefined;

  return (
    <section id={id} className="scroll-mt-24">
      {section.heading && (
        <h2 className="flex items-start gap-3 font-display text-xl font-semibold leading-snug">
          {numbered?.n && (
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold tabular-nums text-primary-foreground">
              {numbered.n}
            </span>
          )}
          <span>{numbered?.title ?? section.heading}</span>
        </h2>
      )}
      <div className={cn(section.heading && "mt-3", "space-y-3")}>
        {blocks.map((block, i) => (
          <GuideBlockView key={i} block={block} />
        ))}
      </div>
    </section>
  );
}

function GuideBlockView({ block }: { block: GuideBlock }) {
  if (block.type === "img") {
    return (
      <img
        src={block.src}
        alt={block.alt || ""}
        className="mt-1 max-h-[22rem] w-full rounded-xl object-cover ring-1 ring-border/70"
      />
    );
  }
  if (block.type === "h3") {
    return <h3 className="pt-1 text-sm font-semibold">{block.text}</h3>;
  }
  if (block.type === "p") {
    return (
      <p className="text-pretty text-[0.95rem] leading-relaxed text-foreground/90">
        <RichText text={block.text} />
      </p>
    );
  }
  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type === "ol" ? "ol" : "ul";
    return (
      <Tag className={cn("space-y-1 pl-5 text-sm leading-relaxed text-foreground/90", block.type === "ol" ? "list-decimal" : "list-disc")}>
        {block.items.map((item) => (
          <li key={item}>
            <RichText text={item} />
          </li>
        ))}
      </Tag>
    );
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto rounded-xl ring-1 ring-border/70">
        <table className="w-full min-w-[20rem] text-left text-sm">
          <thead className="bg-muted text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {block.headers.map((h) => (
                <th key={h} className="px-3 py-2">
                  {h.replace(/\*\*/g, "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-t border-border/80">
                {row.map((cell, j) => (
                  <td key={j} className={cn("px-3 py-2 align-top", j === 0 && "font-medium")}>
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "tip" || block.type === "callout") {
    return (
      <aside
        className={cn(
          "rounded-xl px-3.5 py-3 ring-1",
          block.type === "callout" ? "bg-primary/10 ring-primary/25" : "bg-accent ring-border/70",
        )}
      >
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          <Lightbulb className="size-3.5" />
          {block.label}
        </p>
        <p className="mt-1 text-sm leading-relaxed">
          <RichText text={block.text} />
        </p>
      </aside>
    );
  }
  return null;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
