import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { uniqueImages } from "@/lib/media";

export function PhotoGallery({
  images,
  name,
  className,
  layout = "grid",
}: {
  images: string[];
  name: string;
  className?: string;
  layout?: "grid" | "hero";
}) {
  const photos = useMemo(() => uniqueImages(images), [images]);
  const [index, setIndex] = useState<number | null>(null);
  const current = index != null ? photos[index] : undefined;

  useEffect(() => {
    if (index == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i == null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setIndex((i) => (i == null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, photos.length]);

  if (!photos.length) return null;
  const extra = Math.max(0, photos.length - (layout === "hero" ? 5 : 5));
  const thumbs = photos.slice(1, 5);

  return (
    <section className={className}>
      {layout === "grid" && (
        <div className="mb-2 flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold">Gallery</h2>
          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => setIndex(0)}>
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </button>
        </div>
      )}

      {layout === "hero" ? (
        <div
          className={cn(
            "grid h-[14.5rem] gap-1 overflow-hidden rounded-2xl sm:h-[20rem]",
            thumbs.length ? "grid-cols-1 sm:grid-cols-4 sm:grid-rows-2" : "grid-cols-1",
          )}
        >
          <button
            type="button"
            onClick={() => setIndex(0)}
            className={cn(
              "relative min-h-0 overflow-hidden bg-muted",
              thumbs.length ? "sm:col-span-2 sm:row-span-2" : "",
            )}
            aria-label={`View ${name} photos`}
          >
            <img src={photos[0]} alt={name} className="size-full object-cover" />
            <span className="absolute bottom-2 right-2 rounded-full bg-overlay/70 px-2.5 py-1 text-[11px] font-medium text-hero">
              {photos.length} photo{photos.length === 1 ? "" : "s"}
            </span>
          </button>
          {thumbs.map((src, i) => {
            const n = i + 1;
            const last = n === thumbs.length;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(n)}
                className="relative hidden min-h-0 overflow-hidden bg-muted sm:block"
              >
                <img src={src} alt={`${name} photo ${n + 1}`} className="size-full object-cover" />
                {last && extra > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-overlay/55 text-sm font-semibold text-hero">
                    +{extra}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-4 grid-rows-2 gap-1.5 sm:h-56">
          <button
            type="button"
            onClick={() => setIndex(0)}
            className="relative col-span-2 row-span-2 overflow-hidden rounded-xl bg-muted"
          >
            <img src={photos[0]} alt={`${name} photo 1`} className="size-full object-cover" />
          </button>
          {thumbs.map((src, i) => {
            const n = i + 1;
            const last = n === thumbs.length;
            return (
              <button key={src} type="button" onClick={() => setIndex(n)} className="relative overflow-hidden rounded-lg bg-muted">
                <img src={src} alt={`${name} photo ${n + 1}`} className="size-full object-cover" />
                {last && extra > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-overlay/55 text-sm font-semibold text-hero">
                    +{extra}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {current && index != null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-overlay/92"
          role="dialog"
          aria-modal="true"
          aria-label="Photo slideshow"
          onClick={() => setIndex(null)}
        >
          <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <p className="text-sm text-hero">
              {index + 1} / {photos.length}
            </p>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full text-hero hover:bg-hero/10"
              onClick={() => setIndex(null)}
              aria-label="Close gallery"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-4" onClick={(e) => e.stopPropagation()}>
            <img src={current} alt="" className="max-h-full max-w-full rounded-lg object-contain shadow-soft" />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 flex size-10 items-center justify-center rounded-full bg-card/80 text-foreground"
                  onClick={() => setIndex((index - 1 + photos.length) % photos.length)}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 flex size-10 items-center justify-center rounded-full bg-card/80 text-foreground"
                  onClick={() => setIndex((index + 1) % photos.length)}
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "size-12 shrink-0 overflow-hidden rounded-md ring-2",
                    i === index ? "ring-primary" : "ring-transparent opacity-70",
                  )}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
