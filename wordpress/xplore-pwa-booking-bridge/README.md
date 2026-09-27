# Xplore PWA Booking Bridge

WordPress plugin that powers the Listeo booking → WooCommerce payment handoff for the Xplore Pondy PWA.

## Install on xplorepondy.com

1. Upload folder `xplore-pwa-booking-bridge` to `wp-content/plugins/`  
   (or zip the folder and use **Plugins → Add New → Upload**).
2. Activate **Xplore PWA Booking Bridge**.
3. **Disable / delete** the old WPCode snippet `xplore-pwa-social-session-bridge.php` so routes are not registered twice.
4. Set the shared secret (same value as PWA env `WP_SOCIAL_SESSION_BRIDGE_SECRET`):

```php
// wp-config.php
define('XPLORE_PWA_SESSION_SECRET', 'your-long-random-secret');
```

Or: `wp option update xplore_pwa_session_secret 'your-long-random-secret'`

5. Confirm routes respond (authenticated with Bearer secret):
   - `POST /wp-json/xplore/v1/pwa/session`
   - `POST /wp-json/xplore/v1/pwa/latest-order`

## What it does

| Endpoint | Purpose |
|----------|---------|
| `/pwa/session` | Create a WordPress logged-in cookie for the PWA user email (Listeo booking as that user). |
| `/pwa/latest-order` | Find the fresh unpaid WooCommerce order for this booking and return the native order-pay URL (v11: newest product-matched guest order fallback). |

## Version

Bridge version string: `2026-09-27-order-lookup-v11`

The PWA (`src/lib/wp-api.ts`) accepts v10 and v11.
