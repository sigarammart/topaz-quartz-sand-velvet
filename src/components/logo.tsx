import { cn } from "@/lib/utils";

export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 font-display tracking-tight", className)}>
      {mark && (
        <span
          aria-hidden
          className="relative top-0.5 inline-flex size-6 items-center justify-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground"
        >
          XP
        </span>
      )}
      <span className="text-lg font-semibold text-foreground">
        Xplore <span className="text-primary">Pondy</span>
      </span>
    </span>
  );
}
