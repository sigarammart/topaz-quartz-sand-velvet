# PWA booking status (2026-09-27)

## Working path
Native Listeo on xplorepondy.com: Book Now → confirm → order-pay works.

## PWA path
PWA posts booking server-side, then calls `/wp-json/xplore/v1/pwa/latest-order`.

False error fixed in `src/lib/wp-api.ts`:
- Old code threw "older WPCode snippet" whenever `bridge_version !== v10`
- That fired when order match failed OR version was v11/missing
- Version is now diagnostic only; concrete order-match reasons are shown instead

## WordPress checklist
1. Plugin `xplore-pwa-booking-bridge` active (latest from repo)
2. WPCode snippet for same routes **deactivated**
3. Secret matches PWA `WP_SOCIAL_SESSION_BRIDGE_SECRET`

## After this PWA deploy
Redeploy PWA so `src/lib/wp-api.ts` no longer hard-fails on version.
Then Confirm Booking either redirects to order-pay or shows a real match error.
