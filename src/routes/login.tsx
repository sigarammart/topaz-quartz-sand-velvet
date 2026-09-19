import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WP_APP_PASSWORD_URL, wpLogin } from "@/lib/wp-api";
import { useHydrated } from "@/lib/use-hydrated";
import { useSession } from "@/store/session";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const user = useSession((s) => s.user);
  const setSession = useSession((s) => s.setSession);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) void navigate({ to: "/account" });
  }, [hydrated, user, navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "");
    const password = String(form.get("password") ?? "");
    setPending(true);
    setError(null);
    try {
      const result = await wpLogin({ data: { username, password } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSession(result.user, result.myListings, result.method);
      toast.success(`Signed in as ${result.user.name}`);
      void navigate({ to: "/account" });
    } catch {
      setError("Could not reach WordPress. Check the connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        WordPress account
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Sign in to Xplore Pondy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use the same username as xplorepondy.com. A WordPress Application Password is the reliable
        way in — your dashboard password only works if the host allows REST logins.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">WordPress username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            placeholder="your-wp-username"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password or application password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          <LockKeyhole />
          {pending ? "Checking WordPress…" : "Sign in"}
        </Button>
      </form>

      <a
        href={WP_APP_PASSWORD_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 block text-center text-sm font-medium text-primary hover:underline"
      >
        Create an application password on xplorepondy.com
      </a>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        We send credentials only to your WordPress site to verify the account. They are not stored
        in this app.
      </p>
      <p className="mt-6 text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          Continue without signing in
        </Link>
      </p>
    </div>
  );
}
