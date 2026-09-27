# Install Xplore PWA Booking Bridge on xplorepondy.com

## 1. Install plugin

1. Download folder `wordpress/xplore-pwa-booking-bridge/` from this repo.
2. Upload to `wp-content/plugins/xplore-pwa-booking-bridge/` (FTP/SFTP or zip upload).
3. In wp-admin → **Plugins**, activate **Xplore PWA Booking Bridge**.

## 2. Remove WPCode duplicate

Deactivate or delete the WPCode snippet that registered:

- `/wp-json/xplore/v1/pwa/session`
- `/wp-json/xplore/v1/pwa/latest-order`

Leaving both active can register routes twice and cause conflicts.

## 3. Shared secret

Same value as PWA env `WP_SOCIAL_SESSION_BRIDGE_SECRET`:

```php
// wp-config.php
define('XPLORE_PWA_SESSION_SECRET', 'your-long-random-secret');
```

## 4. Deploy PWA

Deploy latest `src/lib/wp-api.ts` from this repo (accepts bridge v10 and v11).

## 5. Test

Confirm Booking on Hook lounge should redirect to WooCommerce **Pay for order**.

Bridge version returned: `2026-09-27-order-lookup-v11`.
