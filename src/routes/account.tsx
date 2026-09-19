import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { useSession } from "@/store/session";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const myListings = useSession((s) => s.myListings);
  const method = useSession((s) => s.method);
  const clearSession = useSession((s) => s.clearSession);

  useEffect(() => {
    if (hydrated && !user) void navigate({ to: "/login" });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">Loading account…</div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl font-semibold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              @{user.slug}
              {user.email ? ` · ${user.email}` : ""}
            </p>
            {user.roles.length > 0 && (
              <p className="mt-1 text-xs uppercase tracking-wide text-primary">
                {user.roles.join(" · ")}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            clearSession();
            void navigate({ to: "/" });
          }}
        >
          <LogOut />
          Sign out
        </Button>
      </div>

      <div className="mt-8 rounded-xl bg-card p-5 ring-1 ring-border/70">
        <h2 className="font-display text-lg font-semibold">Connected to xplorepondy.com</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in with{" "}
          {method === "application-password" ? "an application password" : "your WordPress login"}.
          Credentials are not kept in this app after the check.
        </p>
      </div>

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

      <p className="mt-10 text-sm">
        <Link to="/explore" className="font-medium text-primary hover:underline">
          Browse the live directory
        </Link>
      </p>
    </div>
  );
}
