<?php
/**
 * Xplore Pondy — PWA social-login → WordPress booking session bridge.
 *
 * Install as a WPCode PHP snippet on xplorepondy.com.
 *
 * Set the same random value in the PWA environment variable:
 * WP_SOCIAL_SESSION_BRIDGE_SECRET
 */
add_action('rest_api_init', function () {
    register_rest_route('xplore/v1', '/pwa/session', [
        'methods'  => 'POST',
        'permission_callback' => function (WP_REST_Request $request) {
            $expected = defined('XPLORE_PWA_SESSION_SECRET')
                ? (string) XPLORE_PWA_SESSION_SECRET
                : (string) get_option('xplore_pwa_session_secret', '');

            $header = (string) $request->get_header('authorization');
            return $expected !== '' && hash_equals('Bearer ' . $expected, $header);
        },
        'callback' => function (WP_REST_Request $request) {
            $email = sanitize_email((string) $request->get_param('email'));
            if (!$email || !is_email($email)) {
                return new WP_Error('invalid_email', 'A valid email address is required.', ['status' => 400]);
            }

            $user = get_user_by('email', $email);
            if (!$user) {
                return new WP_Error('user_not_found', 'No WordPress account matches this email address.', ['status' => 404]);
            }

            // Create a normal WordPress frontend session for the existing user.
            // This uses WordPress' own session-token/cookie machinery; no password
            // is generated, changed, or exposed.
            wp_set_current_user($user->ID, $user->user_login);
            wp_set_auth_cookie($user->ID, true, is_ssl());

            $expiration = time() + (14 * DAY_IN_SECONDS);
            $token = WP_Session_Tokens::get_instance($user->ID)->create($expiration);
            $logged_in = wp_generate_auth_cookie($user->ID, $expiration, 'logged_in', $token);

            if (!$logged_in) {
                return new WP_Error('session_failed', 'Could not create the WordPress session.', ['status' => 500]);
            }

            return [
                'ok' => true,
                'user_id' => (int) $user->ID,
                'username' => (string) $user->user_login,
                'logged_in_cookie' => LOGGED_IN_COOKIE . '=' . $logged_in,
            ];
        },
    ]);
});

/**
 * Return the most recent unpaid WooCommerce order created for an email after
 * a PWA booking submission. This is intentionally authenticated with the same
 * server-to-server secret as the session bridge; it is not a public endpoint.
 *
 * The PWA uses this only when Listeo's booking confirmation response does not
 * expose the native order-pay URL. WooCommerce's order API is the source of
 * truth for the payment URL.
 */
add_action('rest_api_init', function () {
    register_rest_route('xplore/v1', '/pwa/latest-order', [
        'methods'  => 'POST',
        'permission_callback' => function (WP_REST_Request $request) {
            $expected = defined('XPLORE_PWA_SESSION_SECRET')
                ? (string) XPLORE_PWA_SESSION_SECRET
                : (string) get_option('xplore_pwa_session_secret', '');

            $header = (string) $request->get_header('authorization');
            return $expected !== '' && hash_equals('Bearer ' . $expected, $header);
        },
        'callback' => function (WP_REST_Request $request) {
            if (!function_exists('wc_get_orders')) {
                return new WP_Error('woocommerce_missing', 'WooCommerce is not loaded.', ['status' => 503]);
            }

            $email = sanitize_email((string) $request->get_param('email'));
            if (!$email || !is_email($email)) {
                return new WP_Error('invalid_email', 'A valid email address is required.', ['status' => 400]);
            }

            $created_after = absint($request->get_param('created_after'));
            if (!$created_after) {
                return new WP_Error('invalid_created_after', 'created_after is required.', ['status' => 400]);
            }

            // Keep this endpoint tightly scoped to the immediately-created order.
            // The PWA sends its timestamp immediately before submitting the booking.
            $created_after = max($created_after - 15, time() - (15 * MINUTE_IN_SECONDS));

            $orders = wc_get_orders([
                'limit'        => 10,
                'orderby'      => 'date',
                'order'        => 'DESC',
                'return'       => 'objects',
                'billing_email' => $email,
                'date_created' => '>' . gmdate('Y-m-d H:i:s', $created_after),
                'status'       => ['pending', 'on-hold', 'failed'],
            ]);

            foreach ($orders as $order) {
                if (!$order instanceof WC_Order) {
                    continue;
                }

                // Do not send the user to a payment page for an order that
                // is already paid or otherwise no longer needs payment.
                if (!$order->needs_payment()) {
                    continue;
                }

                $order_email = strtolower(trim((string) $order->get_billing_email()));
                if ($order_email !== strtolower(trim($email))) {
                    continue;
                }

                $payment_url = $order->get_checkout_payment_url(false);
                if (!$payment_url) {
                    continue;
                }

                return [
                    'ok' => true,
                    'order_id' => (int) $order->get_id(),
                    'status' => (string) $order->get_status(),
                    'payment_url' => esc_url_raw($payment_url),
                ];
            }

            return [
                'ok' => false,
                'order_id' => 0,
                'payment_url' => '',
            ];
        },
    ]);
});
