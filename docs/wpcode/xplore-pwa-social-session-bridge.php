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
