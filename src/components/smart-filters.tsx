import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  activeFilterCount,
  applySmartFilters,
  FILTER_GROUPS,
  groupsForCategory,
  joinCsv,
  optionsForFilter,
  toggleValue,
  type FilterGroup,
  type FilterOption,
  type FilterParam,
  type SmartFilters,
} from "@/lib/filters";
import { listingIsOpen } from "@/lib/hours";
import type { Category, Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

type SearchPatch = { q?: string; cat?: string } & Partial<Record<FilterParam, string | undefined>>;

export function SmartFiltersBar({
  items,
  category,
  filters,
  onChange,
}: {
  items: Listing[];
  category: Category | "all";
  filters: SmartFilters;
  onChange: (next: SearchPatch) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const typeOptions = useMemo(() => {
    const withoutType = applySmartFilters(items, { ...filters, type: undefined });
    const group = FILTER_GROUPS.find((g) => g.param === "type");
    return group ? optionsForFilter(withoutType, group) : [];
  }, [items, filters]);
  const extraGroups = useMemo(() => {
    return groupsForCategory(category)
      .map((group) => {
        const without = applySmartFilters(items, { ...filters, [group.param]: undefined });
        return { group, options: optionsForFilter(without, group) };
      })
      .filter((row) => row.options.length >= 2 || (row.options.length === 1 && row.options[0].count < items.length));
  }, [items, category, filters]);
  const selectedType = filters.type ?? [];
  const extraCount = activeFilterCount({ ...filters, type: undefined, open: undefined });
  const totalCount = activeFilterCount(filters);
  const openCount = useMemo(() => {
    const without = applySmartFilters(items, { ...filters, open: undefined });
    return without.filter((row) => listingIsOpen(row) === true).length;
  }, [items, filters]);
  const openActive = (filters.open ?? []).includes("1");

  function setGroup(param: FilterParam, values: string[]) {
    onChange({ [param]: joinCsv(values) });
  }

  function clearAll() {
    const cleared: SearchPatch = {};
    for (const key of Object.keys(filters) as FilterParam[]) cleared[key] = undefined;
    onChange(cleared);
    setOpen(false);
  }

  return (
    <div className="mt-3 space-y-2.5">
      {typeOptions.length > 0 && (
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1">
          {typeOptions.map((option) => {
            const active = selectedType.includes(option.slug);
            return (
              <button
                key={option.slug}
                type="button"
                onClick={() => setGroup("type", toggleValue(selectedType, option.slug))}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-xs ring-1 transition-colors",
                  active
                    ? "bg-accent text-accent-foreground ring-primary/30"
                    : "bg-card text-foreground ring-border hover:bg-muted",
                )}
              >
                {option.name}
                <span className="ml-1 tabular-nums text-muted-foreground">{option.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange({ open: openActive ? undefined : "1" })}
          className={cn(
            "h-8 rounded-full px-3 text-xs ring-1 transition-colors",
            openActive
              ? "bg-primary text-primary-foreground ring-primary"
              : "bg-card text-foreground ring-border hover:bg-muted",
          )}
        >
          Open now
          <span className={cn("ml-1 tabular-nums", openActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {openCount}
          </span>
        </button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-8 gap-1.5 rounded-full px-3 text-xs">
              <SlidersHorizontal className="size-3.5" />
              Filters
              {extraCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold tabular-nums text-primary-foreground">
                  {extraCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" title="Smart filters" className="gap-0">
            <p className="text-xs text-muted-foreground">
              Type, area, amenities, and listing features from the Pondicherry directory.
            </p>
            <div className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {extraGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No extra facets for this set yet. Try another category.
                </p>
              ) : (
                extraGroups.map(({ group, options }) => (
                  <FilterGroupBlock
                    key={group.param}
                    group={group}
                    options={options}
                    selected={filters[group.param] ?? []}
                    expanded={expanded[group.param] ?? false}
                    onExpand={() =>
                      setExpanded((prev) => ({ ...prev, [group.param]: !prev[group.param] }))
                    }
                    onToggle={(slug) => setGroup(group.param, toggleValue(filters[group.param] ?? [], slug))}
                  />
                ))
              )}
            </div>
            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              <Button variant="outline" className="flex-1" onClick={clearAll} disabled={totalCount === 0}>
                Clear
              </Button>
              <Button className="flex-1" onClick={() => setOpen(false)}>
                Show results
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {totalCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="h-10 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      <ActiveFilterChips
        filters={filters}
        typeOptions={typeOptions}
        extraGroups={extraGroups}
        onRemove={(param, slug) => setGroup(param, toggleValue(filters[param] ?? [], slug))}
      />
    </div>
  );
}

function FilterGroupBlock({
  group,
  options,
  selected,
  expanded,
  onExpand,
  onToggle,
}: {
  group: FilterGroup;
  options: FilterOption[];
  selected: string[];
  expanded: boolean;
  onExpand: () => void;
  onToggle: (slug: string) => void;
}) {
  const visible = expanded ? options : options.slice(0, 12);
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {group.label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {visible.map((option) => {
          const active = selected.includes(option.slug);
          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => onToggle(option.slug)}
              className={cn(
                "min-h-8 rounded-full px-2.5 text-xs ring-1 transition-colors",
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-background text-foreground ring-border hover:bg-muted",
              )}
            >
              {option.name}
              <span className={cn("ml-1.5 tabular-nums", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
      {options.length > 12 && (
        <button
          type="button"
          onClick={onExpand}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? "Show fewer" : `Show all ${options.length}`}
        </button>
      )}
    </section>
  );
}

function ActiveFilterChips({
  filters,
  typeOptions,
  extraGroups,
  onRemove,
}: {
  filters: SmartFilters;
  typeOptions: FilterOption[];
  extraGroups: { group: FilterGroup; options: FilterOption[] }[];
  onRemove: (param: FilterParam, slug: string) => void;
}) {
  const lookup = new Map<string, string>();
  for (const option of typeOptions) lookup.set(`type:${option.slug}`, option.name);
  for (const { group, options } of extraGroups) {
    for (const option of options) lookup.set(`${group.param}:${option.slug}`, option.name);
  }
  const chips: { param: FilterParam; slug: string; name: string }[] = [];
  for (const [param, slugs] of Object.entries(filters) as [FilterParam, string[] | undefined][]) {
    for (const slug of slugs ?? []) {
      chips.push({
        param,
        slug,
        name: param === "open" ? "Open now" : (lookup.get(`${param}:${slug}`) ?? slug.replace(/-/g, " ")),
      });
    }
  }
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Badge key={`${chip.param}:${chip.slug}`} tone="outline" className="gap-1 pr-1">
          {chip.name}
          <button
            type="button"
            onClick={() => onRemove(chip.param, chip.slug)}
            className="flex size-6 items-center justify-center rounded-full hover:bg-muted"
            aria-label={`Remove ${chip.name}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
