import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { fetchWpAuthorContent } from "@/lib/wp-api";
import { useHydrated } from "@/lib/use-hydrated";
import { useSession } from "@/store/session";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { user: googleUser, isPending } = useCurrentUserState();
  const user = useSession((s) => s.user);
  const myListings = useSession((s) => s.myListings);
  const myTrips = useSession((s) => s.myTrips);
  const method = useSession((s) => s.method);
  const setSession = useSession((s) => s.setSession);
  const clearSession = useSession((s) => s.clearSession);
  const tripTitle = useTrip((s) => s.title);
  const tripStarted = useTrip((s) => s.started);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const gateSession = typeof document !== "undefined" && hasGateSessionMarker();

  if (isPending || !hydrated) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading account…</div>;
  }

  if (!googleUser && !user) return <RedirectToSignIn />;

  const name = googleUser?.displayName ?? user?.name ?? "Traveller";
  const email = googleUser?.primaryEmail ?? user?.email;
  const avatar = googleUser?.profileImageUrl ?? user?.avatar;

  async function refresh() {
    if (!user) return;
    setRefreshing(true);
    try {
      const result = await fetchWpAuthorContent({ data: { authorId: user.id } });
      setSession({
        user,
        myListings: result.myListings,
        myTrips: result.myTrips,
        method: method ?? "application-password",
      });
      toast.success("Account updated from WordPress");
    } catch {
      toast.error("Could not refresh from WordPress");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl font-semibold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {googleUser ? "Signed in with Google" : `@${user?.slug}`}
              {email ? ` · ${email}` : ""}
            </p>
            {user?.roles && user.roles.length > 0 && (
              <p className="mt-1 text-xs uppercase tracking-wide text-primary">{user.roles.join(" · ")}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user && (
            <Button variant="outline" onClick={() => void refresh()} disabled={refreshing}>
              <RefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
          )}
          {!gateSession && (
            <Button
              variant="outline"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                clearSession();
                if (googleUser) {
                  void signOut()
                    .then(() => navigate({ to: "/" }))
                    .catch(() => setSigningOut(false));
                } else {
                  void navigate({ to: "/" });
                }
              }}
            >
              <LogOut />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-card p-5 ring-1 ring-border/70">
        <h2 className="font-display text-lg font-semibold">
          {googleUser ? "Google account" : "Connected to xplorepondy.com"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {googleUser
            ? "Your trips and saved places stay on this device and follow this Google sign-in."
            : `Signed in with ${method === "application-password" ? "an application password" : "your WordPress login"}.`}
        </p>
        {tripStarted && (
          <Button asChild className="mt-4" variant="outline">
            <Link to="/trip">{tripTitle || "Open current trip"}</Link>
          </Button>
        )}
      </div>

      {user && (
        <>
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">Your listings</h2>
            {myListings.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No listings are attached to this WordPress user. Published directory listings still
                appear under Explore for everyone.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((l) => (
                  <ListingCard key={l.slug} listing={l} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">Your WordPress trips</h2>
            {myTrips.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No trips on the website yet. Build one here, or on xplorepondy.com.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {myTrips.map((t) => (
                  <li key={t.slug}>
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-border/70 hover:bg-muted"
                    >
                      <span>
                        <span className="block font-medium">{t.title}</span>
                        {t.date && <span className="text-xs text-muted-foreground">{t.date}</span>}
                      </span>
                      <ExternalLink className="size-4 shrink-0 text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <p className="mt-10 text-sm">
        <Link to="/explore" className="font-medium text-primary hover:underline">
          Browse the live directory
        </Link>
      </p>
    </div>
  );
}
