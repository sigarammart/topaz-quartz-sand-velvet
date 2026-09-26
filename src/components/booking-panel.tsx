import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type BookingDateOption = {
  value: string;
  weekday: string;
  day: string;
  month?: string;
  available?: boolean;
  slots?: BookingSlot[];
};

export type BookingSlot = {
  id: string;
  start: string;
  end: string;
  available?: boolean;
};

export type BookingGuestCounts = {
  adults: number;
  children: number;
  infants: number;
};

export type BookingSelection = {
  date: string;
  slot: BookingSlot;
  guests: BookingGuestCounts;
  coupon?: string;
};

type BookingStep = "datetime" | "confirm" | "success";

type BookingPanelProps = {
  open: boolean;
  onClose: () => void;
  listingName: string;
  dates: BookingDateOption[];
  slots: BookingSlot[];
  selectedDate?: string;
  selectedSlot?: string;
  guests?: BookingGuestCounts;
  reservationFee?: number;
  currency?: string;
  loading?: boolean;
  error?: string;
  onDateChange?: (date: string) => void;
  onSlotChange?: (slotId: string) => void;
  onGuestsChange?: (guests: BookingGuestCounts) => void;
  onContinue?: (selection: BookingSelection) => void;
  onConfirm?: (details: BookingDetails, selection: BookingSelection) => void;
  successMessage?: string;
  externalBookingUrl?: string;
};

export type BookingDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

const EMPTY_GUESTS: BookingGuestCounts = {
  adults: 1,
  children: 0,
  infants: 0,
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function dateLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function BookingPanel({
  open,
  onClose,
  listingName,
  dates,
  slots,
  selectedDate,
  selectedSlot,
  guests = EMPTY_GUESTS,
  reservationFee = 0,
  currency = "INR",
  loading = false,
  error,
  onDateChange,
  onSlotChange,
  onGuestsChange,
  onContinue,
  onConfirm,
  successMessage = "Your booking has been confirmed.",
  externalBookingUrl,
}: BookingPanelProps) {
  const [step, setStep] = useState<BookingStep>("datetime");
  const [guestOpen, setGuestOpen] = useState(false);
  const [internalDate, setInternalDate] = useState(selectedDate ?? dates[0]?.value);
  const [internalSlot, setInternalSlot] = useState(selectedSlot);
  const [internalGuests, setInternalGuests] = useState<BookingGuestCounts>(guests);
  const [details, setDetails] = useState<BookingDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const activeDate = onDateChange ? selectedDate : internalDate;
  const activeSlotId = onSlotChange ? selectedSlot : internalSlot;
  const activeGuests = onGuestsChange ? guests : internalGuests;
  const activeSlots = dates.find((date) => date.value === activeDate)?.slots ?? slots;
  const selected = activeSlots.find((slot) => slot.id === activeSlotId) ?? null;
  const totalGuests = activeGuests.adults + activeGuests.children + activeGuests.infants;

  const selection = useMemo<BookingSelection | null>(() => {
    if (!activeDate || !selected) return null;
    return {
      date: activeDate,
      slot: selected,
      guests: activeGuests,
    };
  }, [activeDate, activeGuests, selected]);

  useEffect(() => {
    if (!open) {
      setStep("datetime");
      setGuestOpen(false);
      setInternalDate(selectedDate ?? dates[0]?.value);
      setInternalSlot(selectedSlot);
      setInternalGuests(guests);
      setDetails({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  function updateGuests(next: Partial<BookingGuestCounts>) {
    const updated = { ...activeGuests, ...next };
    setInternalGuests(updated);
    onGuestsChange?.(updated);
  }

  function changeDate(date: string) {
    setInternalDate(date);
    setInternalSlot(undefined);
    onDateChange?.(date);
    onSlotChange?.("");
  }

  function changeSlot(slotId: string) {
    setInternalSlot(slotId);
    onSlotChange?.(slotId);
  }

  function nextStep() {
    if (!selection) return;
    onContinue?.(selection);
    setStep("confirm");
  }

  function moveDate(direction: -1 | 1) {
    if (!activeDate) return;
    const index = dates.findIndex((date) => date.value === activeDate);
    const next = dates[index + direction];
    if (next && next.available !== false) changeDate(next.value);
  }

  function confirm() {
    if (!selection || !onConfirm) return;
    onConfirm(details, selection);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={`Book ${listingName}`}>
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background sm:mx-auto sm:my-5 sm:h-[calc(100dvh-2.5rem)] sm:max-w-3xl sm:rounded-2xl sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {step === "success" ? "Booking confirmed" : `Step ${step === "datetime" ? 1 : 2} of 2`}
            </p>
            <h2 className="mt-0.5 truncate font-display text-lg font-semibold">{listingName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
            aria-label="Close booking"
          >
            <X className="size-4" />
          </button>
        </header>

        {step !== "success" && (
          <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-border bg-muted/35 p-2 sm:hidden">
            {[
              ["datetime", "Date & time"],
              ["confirm", "Confirm"],
            ].map(([key, label], index) => {
              const active = step === key;
              const complete = step === "confirm" && index === 0;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold",
                    active && "bg-card shadow-sm",
                    complete && "text-primary",
                    !active && !complete && "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full text-[10px]",
                      active ? "bg-primary text-primary-foreground" : complete ? "bg-primary/15 text-primary" : "bg-muted",
                    )}
                  >
                    {index + 1}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === "datetime" && (
            <DateTimeStep
              dates={dates}
              slots={activeSlots}
              selectedDate={activeDate}
              selectedSlot={activeSlotId}
              guests={activeGuests}
              guestOpen={guestOpen}
              totalGuests={totalGuests}
              reservationFee={reservationFee}
              currency={currency}
              loading={loading}
              error={error}
              onDateChange={changeDate}
              onSlotChange={changeSlot}
              onGuestsToggle={() => setGuestOpen((value) => !value)}
              onGuestsChange={updateGuests}
              onNext={nextStep}
              onPreviousDate={() => moveDate(-1)}
              onNextDate={() => moveDate(1)}
            />
          )}

          {step === "confirm" && selection && (
            <ConfirmStep
              selection={selection}
              details={details}
              onChange={setDetails}
              onBack={() => setStep("datetime")}
              onConfirm={confirm}
              loading={loading}
              currency={currency}
              reservationFee={reservationFee}
              externalBookingUrl={externalBookingUrl}
            />
          )}

          {step === "success" && (
            <div className="flex min-h-full flex-col items-center justify-center px-5 py-14 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-primary/12 text-primary">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">Thank you for your booking!</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{successMessage}</p>
              <Button className="mt-7 h-11 rounded-full px-6" onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DateTimeStep({
  dates,
  slots,
  selectedDate,
  selectedSlot,
  guests,
  guestOpen,
  totalGuests,
  reservationFee,
  currency,
  loading,
  error,
  onDateChange,
  onSlotChange,
  onGuestsToggle,
  onGuestsChange,
  onNext,
  onPreviousDate,
  onNextDate,
  externalBookingUrl,
}: {
  dates: BookingDateOption[];
  slots: BookingSlot[];
  selectedDate?: string;
  selectedSlot?: string;
  guests: BookingGuestCounts;
  guestOpen: boolean;
  totalGuests: number;
  reservationFee: number;
  currency: string;
  loading: boolean;
  error?: string;
  onDateChange?: (date: string) => void;
  onSlotChange?: (slotId: string) => void;
  onGuestsToggle: () => void;
  onGuestsChange: (next: Partial<BookingGuestCounts>) => void;
  onNext: () => void;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
  externalBookingUrl?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Date & time</p>
        <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">Choose your preferred time</h3>
        <p className="mt-1 text-sm text-muted-foreground">Pick a date, an available slot and your group size.</p>
      </div>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Date</h4>
          <div className="hidden items-center gap-1 sm:flex">
            <button type="button" onClick={onPreviousDate} disabled={!onPreviousDate} className="grid size-8 place-items-center rounded-full border border-border disabled:opacity-40" aria-label="Previous dates">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={onNextDate} disabled={!onNextDate} className="grid size-8 place-items-center rounded-full border border-border disabled:opacity-40" aria-label="Next dates">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dates.map((date) => {
            const active = date.value === selectedDate;
            const available = date.available !== false;
            return (
              <button
                key={date.value}
                type="button"
                disabled={!available}
                onClick={() => onDateChange?.(date.value)}
                className={cn(
                  "relative min-w-[72px] shrink-0 rounded-xl border px-2.5 py-2.5 text-center transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : available
                      ? "border-border bg-card hover:border-primary/50"
                      : "border-border/60 bg-muted/40 text-muted-foreground/50",
                )}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-75">{date.weekday}</span>
                <span className="mt-0.5 block text-lg font-bold leading-none">{date.day}</span>
                {date.month && <span className="mt-0.5 block text-[10px] opacity-75">{date.month}</span>}
                {available && !active && <span className="mx-auto mt-1.5 block size-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold">Available times</h4>
          {slots.length > 0 && <span className="text-[11px] text-muted-foreground">{slots.length} openings</span>}
        </div>

        {loading ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : slots.length > 0 ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const active = slot.id === selectedSlot;
              const available = slot.available !== false;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!available}
                  onClick={() => onSlotChange?.(slot.id)}
                  className={cn(
                    "flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition",
                    active
                      ? "border-primary bg-primary/8 ring-1 ring-primary"
                      : available
                        ? "border-border bg-card hover:border-primary/50"
                        : "border-border/60 bg-muted/40 text-muted-foreground/50",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Clock3 className="size-3.5 shrink-0 text-primary" />
                    <span>{slot.start}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{slot.end}</span>
                  </span>
                  <span className={cn("size-3.5 shrink-0 rounded-full border", active && "border-[4px] border-primary")} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-2 rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Select a date to see available times.
          </div>
        )}
      </section>

      <section className="relative mt-4">
        <button
          type="button"
          onClick={onGuestsToggle}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left"
          aria-expanded={guestOpen}
        >
          <span className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span className="text-sm font-semibold">Guests</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold">{totalGuests}</span>
          </span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition", guestOpen && "rotate-180")} />
        </button>

        {guestOpen && (
          <div className="mt-2 space-y-1 rounded-xl border border-border bg-card p-2 shadow-lg">
            {[
              ["adults", "Adults", "18+"],
              ["children", "Children", "2–12"],
              ["infants", "Infants", "Under 2"],
            ].map(([key, label, hint]) => {
              const count = guests[key as keyof BookingGuestCounts];
              const min = key === "adults" ? 1 : 0;
              return (
                <div key={key} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{hint}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={count <= min}
                      onClick={() => onGuestsChange({ [key]: count - 1 })}
                      className="grid size-8 place-items-center rounded-full border border-border text-sm disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold tabular-nums">{count}</span>
                    <button
                      type="button"
                      onClick={() => onGuestsChange({ [key]: count + 1 })}
                      className="grid size-8 place-items-center rounded-full border border-border text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-xl bg-muted/45 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reservation fee</span>
          <span className="font-semibold">{money(reservationFee, currency)}</span>
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold">Estimated total</span>
          <span className="text-xl font-bold">{money(reservationFee, currency)}</span>
        </div>
      </section>

      {error && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 mt-5 -mx-4 space-y-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0">
        <Button
          type="button"
          className="h-12 w-full rounded-full text-sm font-bold shadow-sm"
          disabled={!selectedDate || !selectedSlot || loading}
          onClick={onNext}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Next
          {!loading && <ChevronRight className="size-4" />}
        </Button>
        {externalBookingUrl && slots.length === 0 && (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full text-sm font-semibold"
            onClick={() => window.open(externalBookingUrl, "_blank", "noopener,noreferrer")}
          >
            Continue with live booking
          </Button>
        )}
      </div>
    </div>
  );
}

function ConfirmStep({
  selection,
  details,
  onChange,
  onBack,
  onConfirm,
  loading,
  currency,
  reservationFee,
  externalBookingUrl,
}: {
  selection: BookingSelection;
  details: BookingDetails;
  onChange: (next: BookingDetails) => void;
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
  currency: string;
  reservationFee: number;
  externalBookingUrl?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Confirm</p>
        <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">Your information</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add your contact details to complete the booking.</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted/45 p-3 text-xs">
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Date</span>
          <span className="mt-0.5 block font-semibold">{dateLabel(selection.date)}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Time</span>
          <span className="mt-0.5 block font-semibold">{selection.slot.start} – {selection.slot.end}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Guests</span>
          <span className="mt-0.5 block font-semibold">{selection.guests.adults} adults · {selection.guests.children} children · {selection.guests.infants} infants</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Total</span>
          <span className="mt-0.5 block text-base font-bold">{money(reservationFee, currency)}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="First name *">
          <Input value={details.firstName} onChange={(event) => onChange({ ...details, firstName: event.target.value })} autoComplete="given-name" />
        </Field>
        <Field label="Last name">
          <Input value={details.lastName} onChange={(event) => onChange({ ...details, lastName: event.target.value })} autoComplete="family-name" />
        </Field>
        <Field label="Email *">
          <Input type="email" value={details.email} onChange={(event) => onChange({ ...details, email: event.target.value })} autoComplete="email" />
        </Field>
        <Field label="Phone *">
          <Input type="tel" value={details.phone} onChange={(event) => onChange({ ...details, phone: event.target.value })} autoComplete="tel" />
        </Field>
        <Field label="Message (optional)" className="sm:col-span-2">
          <textarea
            value={details.message}
            onChange={(event) => onChange({ ...details, message: event.target.value })}
            rows={4}
            className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      </div>

      <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-border bg-background/95 py-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent">
        <Button type="button" variant="outline" className="h-12 flex-1 rounded-full" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button type="button" className="h-12 flex-[1.6] rounded-full font-bold" disabled={loading} onClick={onConfirm}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {externalBookingUrl ? "Continue to live booking" : "Confirm booking"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      {children}
    </label>
  );
}
