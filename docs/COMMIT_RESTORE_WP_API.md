# Commit: restore `src/lib/wp-api.ts` on main

`src/lib/wp-api.ts` is truncated on `main` (~2 KB). Restore and push from your machine:

```bash
cd topaz-quartz-sand-velvet
git fetch origin
git checkout main
git pull

# Restore full file from last known-good commit
git checkout bd1d7867ae1335063bd4b28a0074be1bcbd6918f -- src/lib/wp-api.ts

# Remove the false version hard-fail (4 lines)
# Search for: lastBridgeVersion !== "2026-09-27-order-lookup-v10"
# Delete the whole if-block that throws "older WPCode snippet"

# Optional cleaner: use the module already on main
# 1) Add near other imports:
#    import { resolveListeoPaymentUrlFromOrder } from "@/lib/listeo-order-lookup";
# 2) Delete the local async function resolveListeoPaymentUrlFromOrder(...) { ... }

git add src/lib/wp-api.ts
git commit -m "Restore wp-api.ts; remove false older-WPCode version hard-fail"
git push origin main
```

Then redeploy on Vercel.

Verify size after restore:

```bash
wc -c src/lib/wp-api.ts   # should be ~120000+
```

WordPress (plugin active, WPCode off) needs no change for this commit.
