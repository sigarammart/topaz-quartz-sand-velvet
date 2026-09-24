import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  JETFORM_PAGES,
  TRIP_BUDGETS,
  TRIP_INTERESTS,
  TRIP_LOCATIONS,
  TRIP_MONTHS,
  TRIP_TYPES,
  buildTripTitle,
  daysBetween,
  jetformPageComplete,
  seedFromWpTitle,
  todayISO,
} from "@/lib/trip-form";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { fetchWpUserTrips, saveWpUserTrip, type WpTrip } from "@/lib/wp-api";
import { useTrip } from "@/store/trip";
import { useAppLoggedIn } from "@/lib/app-session";

function Choice({
  type,
  name,
  value,
  checked,
  onChange,
  children,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
        checked ? "border-primary bg-accent text-foreground" : "border-border bg-card hover:bg-muted/60",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-primary"
      />
      {children}
    </label>
  );
}

export function TripFormWizard({ afterSave }: { afterSave?: () => void }) {
  const applyPlan = useTrip((s) => s.applyPlan);
  const current = useTrip((s) => s);
  const { wpUser, grokUser } = useAppLoggedIn();
  const accountEmail = wpUser?.email || grokUser?.primaryEmail || "";
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [fromPlace, setFromPlace] = useState(current.started ? current.fromPlace : "");
  const [fromLat, setFromLat] = useState<number | undefined>(current.started ? current.fromLat : undefined);
  const [fromLng, setFromLng] = useState<number | undefined>(current.started ? current.fromLng : undefined);
  const [locations, setLocations] = useState<string[]>(current.started ? current.locations : []);
  const [budget, setBudget] = useState(current.started ? current.budget : "");
  const [datesKnown, setDatesKnown] = useState(current.datesKnown);
  const [start, setStart] = useState(current.start);
  const [end, setEnd] = useState(current.end);
  const [months, setMonths] = useState<string[]>(current.months);
  const [days, setDays] = useState(current.days || 2);
  const [tripType, setTripType] = useState(current.started ? current.tripType : "");
  const [interests, setInterests] = useState<string[]>(current.started ? current.interests : []);
  const [notes, setNotes] = useState(current.notes);
  const [wpTrips, setWpTrips] = useState<WpTrip[]>([]);

  useEffect(() => {
    if (!accountEmail) return;
    void fetchWpUserTrips({ data: { email: accountEmail } })
      .then((r) => setWpTrips(r.trips))
      .catch(() => undefined);
  }, [accountEmail]);

  const draft = { fromPlace, locations, datesKnown, start, end, months, days, tripType, interests };
  const canNext = jetformPageComplete(step, draft);
  const computedDays = datesKnown ? daysBetween(start, end) || days : days;
  const liveTitle = useMemo(
    () => buildTripTitle({ locations, budget, tripType, days: computedDays, interests }),
    [locations, budget, tripType, computedDays, interests],
  );

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  async function save() {
    if (!accountEmail) {
      toast.error("Your signed-in email could not be determined.");
      return;
    }
    setSaving(true);
    try {
      const tripCode = current.code || `XP-${Date.now().toString(36).toUpperCase()}`;
      const result = await saveWpUserTrip({
        data: {
          email: accountEmail,
          wpId: current.wpId,
          fromPlace,
          fromLat,
          fromLng,
          locations,
          budget,
          tripType,
          datesKnown,
          start,
          end,
          months,
          days: computedDays,
          interests,
          notes,
          title: liveTitle,
          code: tripCode,
          items: current.items,
          itinerary: current.itinerary ?? [],
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      applyPlan({
        fromPlace,
        fromLat,
        fromLng,
        locations,
        budget,
        tripType,
        datesKnown,
        start,
        end,
        months,
        days: computedDays,
        interests,
        notes,
        title: liveTitle,
        wpId: result.trip.id,
        wpUrl: result.trip.url,
        code: tripCode,
      });
      toast.success("Trip saved to your xplorepondy.com account");
      afterSave?.();
    } catch {
      toast.error("Could not save the trip to xplorepondy.com.");
    } finally {
      setSaving(false);
    }
  }

  function openWp(trip: WpTrip) {
    if (trip.data) {
      applyPlan({
        ...trip.data,
        title: trip.title,
        wpId: trip.id,
        wpUrl: trip.url,
        code: trip.data.code || (trip.id ? String(trip.id) : undefined),
      });
    } else {
      const seed = seedFromWpTitle(trip.title);
      applyPlan({
        ...seed,
        fromPlace: fromPlace || "Anna Salai, Puducherry",
        datesKnown: true,
        start,
        end,
        months: [],
        notes: "",
        wpId: trip.id,
        wpUrl: trip.url,
        code: trip.id ? String(trip.id) : undefined,
        title: trip.title,
      });
    }
    afterSave?.();
  }

  return (
    <div className="-mx-4 rounded-[1.75rem] bg-[#dff6ea] px-3 py-6 sm:mx-0 sm:px-6">
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Custom days, listings you pick, then an itinerary — start here.
      </p>
      <div className="mx-auto max-w-3xl rounded-2xl bg-card p-5 shadow-soft sm:p-8">
        <ol className="mb-6 flex items-start">
          {JETFORM_PAGES.map((page, i) => (
            <li key={page.key} className={cn("flex items-start", i < JETFORM_PAGES.length - 1 && "flex-1")}>
              <button
                type="button"
                onClick={() => {
                  if (i <= step) setStep(i);
                }}
                className="flex w-14 flex-col items-center sm:w-16"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    i === step && "border-primary bg-card text-primary",
                    i < step && "border-primary bg-primary text-primary-foreground",
                    i > step && "border-border text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "mt-1 text-center text-[11px] font-medium",
                    i === step ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {page.label}
                </span>
              </button>
              {i < JETFORM_PAGES.length - 1 && (
                <span className={cn("mt-4 h-0.5 flex-1", i < step ? "bg-primary" : "bg-border")} />
              )}
            </li>
          ))}
        </ol>

        <div className="rounded-md bg-[#7ed9b8] px-4 py-3 text-center text-sm font-semibold text-[#08372c] sm:text-base">
          {JETFORM_PAGES[step].title}
        </div>

        <div className="mt-6 space-y-6">
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="user_location">
                  Going from <span className="text-destructive">*</span>
                </Label>
                <LocationAutocomplete
                  value={fromPlace}
                  lat={fromLat}
                  lng={fromLng}
                  onChange={(next) => {
                    setFromPlace(next.label);
                    setFromLat(next.lat);
                    setFromLng(next.lng);
                  }}
                />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Going to <span className="text-destructive">*</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {TRIP_LOCATIONS.map((l) => (
                    <Choice
                      key={l.slug}
                      type="checkbox"
                      name="trip_location[]"
                      value={l.slug}
                      checked={locations.includes(l.slug)}
                      onChange={() => setLocations(toggle(locations, l.slug))}
                    >
                      {l.label}
                    </Choice>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Trip budget</legend>
                <div className="flex flex-wrap gap-2">
                  {TRIP_BUDGETS.map((b) => (
                    <Choice
                      key={b.slug}
                      type="radio"
                      name="trip_budget"
                      value={b.slug}
                      checked={budget === b.slug}
                      onChange={() => setBudget(b.slug)}
                    >
                      {b.label}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {step === 1 && (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Choose date <span className="text-destructive">*</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  <Choice type="radio" name="trips_dates" value="dates_known" checked={datesKnown} onChange={() => setDatesKnown(true)}>
                    I know the dates
                  </Choice>
                  <Choice
                    type="radio"
                    name="trips_dates"
                    value="dates_unknown"
                    checked={!datesKnown}
                    onChange={() => {
                      setDatesKnown(false);
                      setStart("");
                      setEnd("");
                    }}
                  >
                    I don't know the dates
                  </Choice>
                </div>
              </fieldset>
              {datesKnown ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="trip_start">
                      Trip start date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="trip_start"
                      type="date"
                      min={todayISO()}
                      value={start}
                      onChange={(e) => {
                        setStart(e.target.value);
                        if (end && end < e.target.value) setEnd(e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="trip_end">
                      Trip end date <span className="text-destructive">*</span>
                    </Label>
                    <Input id="trip_end" type="date" min={start || todayISO()} value={end} onChange={(e) => setEnd(e.target.value)} />
                  </div>
                </div>
              ) : (
                <>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">
                      When are you going? <span className="text-destructive">*</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {TRIP_MONTHS.map((m) => (
                        <Choice
                          key={m}
                          type="radio"
                          name="when_are_you_going"
                          value={m}
                          checked={months[0] === m}
                          onChange={() => setMonths([m])}
                        >
                          {m}
                        </Choice>
                      ))}
                    </div>
                  </fieldset>
                  <div className="space-y-1.5">
                    <Label htmlFor="trip_days">
                      No. of days <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="trip_days"
                      type="number"
                      min={1}
                      max={7}
                      value={days}
                      onChange={(e) => setDays(Math.min(7, Math.max(1, Number(e.target.value) || 1)))}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Trip type <span className="text-destructive">*</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {TRIP_TYPES.map((t) => (
                  <Choice
                    key={t.slug}
                    type="radio"
                    name="trip_type"
                    value={t.slug}
                    checked={tripType === t.slug}
                    onChange={() => setTripType(t.slug)}
                  >
                    {t.label}
                  </Choice>
                ))}
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Share what you love to explore <span className="text-destructive">*</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {TRIP_INTERESTS.map((i) => (
                    <Choice
                      key={i.slug}
                      type="checkbox"
                      name="trip_interest[]"
                      value={i.slug}
                      checked={interests.includes(i.slug)}
                      onChange={() => setInterests(toggle(interests, i.slug))}
                    >
                      {i.label}
                    </Choice>
                  ))}
                </div>
              </fieldset>
              <div className="space-y-1.5">
                <Label htmlFor="add_infos">Anything else</Label>
                <Textarea id="add_infos" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our AI trip planner builds a route from the listings you pick next. Forget the usual traveller
                scramble — start from this sketch.
              </p>
              <p className="rounded-xl bg-muted/70 px-4 py-3 text-sm font-medium">{liveTitle}</p>
              {wpTrips.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Latest trips on xplorepondy.com</p>
                  <ul className="mt-2 space-y-2">
                    {wpTrips.slice(0, 5).map((t) => (
                      <li key={t.slug}>
                        <button
                          type="button"
                          onClick={() => openWp(t)}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm ring-1 ring-border hover:ring-primary"
                        >
                          {t.title}
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {t.id ? `#${t.id}` : ""} · {t.date}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-end justify-between gap-3">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <div className="text-right">
            {!canNext && <p className="mb-2 text-xs text-muted-foreground">Please fill all required fields</p>}
            {step < 4 ? (
              <Button className="bg-foreground text-background hover:bg-foreground/90" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button className="bg-foreground text-background hover:bg-foreground/90" disabled={saving} onClick={save}>
                {saving ? "Saving trip…" : "Choose listings"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
