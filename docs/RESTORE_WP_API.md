# URGENT: Restore `src/lib/wp-api.ts`

`src/lib/wp-api.ts` on `main` was accidentally truncated during an automated push.
**Restore it before deploying.**

## Restore from a known-good commit

```bash
cd topaz-quartz-sand-velvet
git fetch origin
git checkout bd1d7867ae1335063bd4b28a0074be1bcbd6918f -- src/lib/wp-api.ts
```

## Then remove the false version hard-fail

In `src/lib/wp-api.ts`, **delete** this block:

```ts
  if (lastBridgeVersion !== "2026-09-27-order-lookup-v10") {
    throw new Error("The live xplorepondy.com payment bridge is still running an older WPCode snippet. Replace the WPCode snippet with the latest repository version before testing again.");
  }
```

Optional (cleaner): import the fixed lookup module already on main:

```ts
import { resolveListeoPaymentUrlFromOrder } from "@/lib/listeo-order-lookup";
```

…and remove the local `async function resolveListeoPaymentUrlFromOrder(...) { ... }` body.

## Commit and push

```bash
git add src/lib/wp-api.ts
git commit -m "Restore wp-api.ts; remove false older-WPCode version hard-fail"
git push origin main
```

Redeploy the PWA (Vercel). Hard-refresh `pwa.xplorepondy.com` and retry Confirm Booking.

WordPress side (plugin active, WPCode off) is already correct for this error.
