import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Bookmark,
  CalendarDays,
  Compass,
  House,
  LogIn,
  Menu,
  Search,
  Smartphone,
  UserRound,
} from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { LoginDialog } from "@/components/login-dialog";
import { HeaderAuth } from "@/components/header-auth";
import { InstallBanner, InstallHeaderButton } from "@/components/install-app";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { useCatalog } from "@/store/catalog";
import { useGeo } from "@/store/geo";
import { useAuthModal } from "@/store/auth-modal";
import { useSession } from "@/store/session";
import { useTheme } from "@/store/theme";
import { isStandaloneDisplay } from "@/lib/android";
import { useTrip } from "@/store/trip";
import { JET_BOOKMARK_STORAGE_KEY, JET_TEMP_STORAGE_KEY } from "@/lib/jet-store";

const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/guides", label: "Guides", icon: BookOpen },
  { to: "/trip", label: "Trip", icon: CalendarDays },
  { to: "/saved", label: "Bookmark", icon: Bookmark },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrated = useHydrated();
  const savedCount = useTrip((s) => s.saved.length);
  const tripCount = useTrip((s) => s.items.length);
  const tempCount = useTrip((s) => s.tempTrip.length);
  const tripStarted = useTrip((s) => s.started);
  const [open, setOpen] = useState(false);
  const savedBadge = hydrated ? savedCount : 0;
  const tripBadge = hydrated ? tempCount || tripCount : 0;
  const hideAppNav = pathname === "/trip" && (tripStarted || tripCount > 0 || tempCount > 0);
  const user = useSession((s) => s.user);
  const bookmarkIds = useSession((s) => s.bookmarkIds);
  const showLogin = useAuthModal((s) => s.show);
  const loggedIn = Boolean(user);
  const ensureCatalog = useCatalog((s) => s.ensure);
  const catalog = useCatalog((s) => s.items);
  const catalogStatus = useCatalog((s) => s.status);
  const hydrateGeo = useGeo((s) => s.hydrate);
  const hydrateTheme = useTheme((s) => s.hydrate);
  const syncJetTemp = useTrip((s) => s.syncJetTemp);
  const syncBookmarks = useTrip((s) => s.syncBookmarks);
  const wide = pathname === "/trip" || pathname.startsWith("/explore");

  function onTripNav(e: MouseEvent) {
    if (loggedIn) return;
    e.preventDefault();
    showLogin({ reason: "trip", next: "/trip" });
  }

  function onBookmarkNav(e: MouseEvent) {
    if (loggedIn) return;
    e.preventDefault();
    showLogin({ reason: "bookmark", next: "/saved" });
  }

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    void ensureCatalog();
  }, [ensureCatalog]);

  useEffect(() => {
    hydrateGeo();
  }, [hydrateGeo]);

  useEffect(() => {
    if (catalogStatus === "ready" || catalog.length > 8) {
      syncJetTemp(catalog);
      syncBookmarks(catalog, bookmarkIds);
    }
  }, [catalog, catalogStatus, syncJetTemp, syncBookmarks, bookmarkIds]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === JET_TEMP_STORAGE_KEY) useTrip.getState().syncJetTemp(useCatalog.getState().items);
      if (e.key === JET_BOOKMARK_STORAGE_KEY) {
        useTrip.getState().syncBookmarks(useCatalog.getState().items, useSession.getState().bookmarkIds);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (isStandaloneDisplay()) document.documentElement.classList.add("standalone");
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="site-header sticky top-0 z-40 border-b border-border/80 bg-logo-bg text-foreground pt-[env(safe-area-inset-top)]">
        <div className={cn("mx-auto flex h-14 items-center gap-3 px-4", wide ? "max-w-7xl" : "max-w-6xl")}>
          <Link to="/" className="shrink-0">
            <Logo className="rounded-none bg-transparent p-0" />
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
                  onClick={
                    item.to === "/trip" ? onTripNav : item.to === "/saved" ? onBookmarkNav : undefined
                  }
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
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" asChild className="md:hidden">
              <Link to="/explore" aria-label="Search">
                <Search />
              </Link>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/plan">Plan a trip</Link>
            </Button>
            <InstallHeaderButton />
            <HeaderAuth />
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
                    { to: "/get-app", label: "Android app", icon: Smartphone },
                    {
                      to: user ? "/account" : "/login",
                      label: user ? "Account" : "Sign in",
                      icon: user ? UserRound : LogIn,
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={(e) => {
                        if (item.to === "/trip" && !loggedIn) {
                          e.preventDefault();
                          showLogin({ reason: "trip", next: "/trip" });
                          return;
                        }
                        if (item.to === "/saved" && !loggedIn) {
                          e.preventDefault();
                          showLogin({ reason: "bookmark", next: "/saved" });
                          return;
                        }
                        setOpen(false);
                      }}
                      className="flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted"
                    >
                      <item.icon className="size-4 text-primary" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-3 px-1">
                    <ThemeToggle className="w-full justify-stretch [&>button]:flex-1 [&>button]:justify-center" />
                  </div>
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

      <main className={cn("mx-auto w-full flex-1 px-4 pb-24 pt-6 md:pb-12", wide ? "max-w-7xl" : "max-w-6xl")}>
        {children}
      </main>
      <LoginDialog />
      <InstallBanner />

      <footer className="hidden border-t border-border bg-card md:block">
        <div className={cn("mx-auto flex items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground", wide ? "max-w-7xl" : "max-w-6xl")}>
          <Logo />
          <p>Companion to xplorepondy.com · Pondicherry travel planner</p>
          <a href="https://xplorepondy.com" className="text-primary hover:underline">
            Visit the website
          </a>
        </div>
      </footer>

      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
          hideAppNav && "hidden",
        )}
      >
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
                  onClick={
                    item.to === "/trip" ? onTripNav : item.to === "/saved" ? onBookmarkNav : undefined
                  }
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
