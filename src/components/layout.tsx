import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  Compass,
  Heart,
  House,
  LogIn,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { useCatalog } from "@/store/catalog";
import { useGeo } from "@/store/geo";
import { useSession } from "@/store/session";
import { useTrip } from "@/store/trip";

const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/guides", label: "Guides", icon: BookOpen },
  { to: "/trip", label: "Trip", icon: CalendarDays },
  { to: "/saved", label: "Saved", icon: Heart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrated = useHydrated();
  const savedCount = useTrip((s) => s.saved.length);
  const tripCount = useTrip((s) => s.items.length);
  const [open, setOpen] = useState(false);
  const savedBadge = hydrated ? savedCount : 0;
  const tripBadge = hydrated ? tripCount : 0;
  const user = useSession((s) => s.user);
  const ensureCatalog = useCatalog((s) => s.ensure);
  const hydrateGeo = useGeo((s) => s.hydrate);

  useEffect(() => {
    void ensureCatalog();
  }, [ensureCatalog]);

  useEffect(() => {
    hydrateGeo();
  }, [hydrateGeo]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "bg-muted text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/events"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
                pathname.startsWith("/events") && "bg-muted text-foreground",
              )}
            >
              Events
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="md:hidden">
              <Link to="/explore" aria-label="Search">
                <Search />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/plan">Plan a trip</Link>
            </Button>
            {hydrated && user ? (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/account">
                  <UserRound />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <LogIn />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              </Button>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" title="Menu">
                <nav className="flex flex-col gap-1">
                  {[
                    ...NAV,
                    { to: "/events", label: "Events", icon: CalendarDays },
                    { to: "/plan", label: "Custom trip", icon: Compass },
                    {
                      to: user ? "/account" : "/login",
                      label: user ? "Account" : "Sign in",
                      icon: user ? UserRound : LogIn,
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted"
                    >
                      <item.icon className="size-4 text-primary" />
                      {item.label}
                    </Link>
                  ))}
                  <a
                    href="https://xplorepondy.com"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex h-12 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
                  >
                    Open xplorepondy.com
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-12">{children}</main>

      <footer className="hidden border-t border-border bg-card md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground">
          <Logo />
          <p>Companion to xplorepondy.com · Pondicherry travel planner</p>
          <a href="https://xplorepondy.com" className="text-primary hover:underline">
            Visit the website
          </a>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const count = item.to === "/saved" ? savedBadge : item.to === "/trip" ? tripBadge : 0;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground",
                    active && "text-primary",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                  {count > 0 && (
                    <span className="absolute right-[18%] top-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground tabular-nums">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
