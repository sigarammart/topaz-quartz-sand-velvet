# Fix: false "older WPCode snippet" error on PWA Confirm Booking

## Status

- WPCode snippet **deactivated** ✅
- Plugin **xplore-pwa-booking-bridge** active ✅
- Native xplorepondy.com booking → Pay for order works ✅
- PWA still throws version error ❌ until `src/lib/wp-api.ts` is redeployed

## Cause

Deployed PWA code contains:

```ts
if (lastBridgeVersion !== "2026-09-27-order-lookup-v10") {
  throw new Error("The live xplorepondy.com payment bridge is still running an older WPCode snippet...");
}
```

This runs when order lookup does not return a payment URL.  
`undefined !== "v10"` is true, so you get this error even with the plugin correct and WPCode off.

## Fix (required PWA redeploy)

### Option A — delete 4 lines in `src/lib/wp-api.ts`

Find and **delete** this block entirely:

```ts
  if (lastBridgeVersion !== "2026-09-27-order-lookup-v10") {
    throw new Error("The live xplorepondy.com payment bridge is still running an older WPCode snippet. Replace the WPCode snippet with the latest repository version before testing again.");
  }
```

### Option B — use the extracted module (already on main)

1. Keep `src/lib/listeo-order-lookup.ts` (already in repo).
2. In `src/lib/wp-api.ts`:
   - Add: `import { resolveListeoPaymentUrlFromOrder } from "@/lib/listeo-order-lookup";`
   - **Remove** the local `async function resolveListeoPaymentUrlFromOrder(...) { ... }` body.

### Deploy

```bash
git add src/lib/wp-api.ts
git commit -m "Remove false older-WPCode version hard-fail on booking"
git push
# Vercel redeploys automatically
```

Hard-refresh `pwa.xplorepondy.com` and try Confirm Booking again.

WordPress side needs no further change for this specific error.
