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
                : (string) get_option('xplore_pwa_session_secret', '5b11dae5aa5f811a845eb6ca60d76b82');

            $header = (string) $request->get_header('authorization');
            return $expected !== '' && hash_equals('Bearer ' . $expected, $header);
        },
        'callback' => function (WP_REST_Request $request) {
            $email = sanitize_email((string) $request->get_param('email'));
            $listing_id = absint($request->get_param('listing_id'));
            $submitted_product_ids = [];
            $submitted_product_param = $request->get_param('product_id');
            $submitted_product_values = is_array($submitted_product_param) ? $submitted_product_param : [$submitted_product_param];
            foreach ($submitted_product_values as $submitted_product_value) {
                $submitted_product_id = absint($submitted_product_value);
                if ($submitted_product_id > 0) {
                    $submitted_product_ids[] = $submitted_product_id;
                }
            }
            $submitted_product_ids = array_values(array_unique($submitted_product_ids));
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
                : (string) get_option('xplore_pwa_session_secret', '5b11dae5aa5f811a845eb6ca60d76b82');

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

            /*
             * The PWA timestamp is generated immediately before submitting
             * the Listeo form, but the PWA server and WordPress server can
             * have small clock differences. Give the order query a generous
             * lower bound instead of accidentally excluding a just-created
             * order because the two clocks differ.
             */
            // The PWA timestamp is created immediately before the Listeo submission.
            // Do not use a multi-hour window here: that can incorrectly return an
            // older unpaid order when a new booking attempt failed to create an order.
            // A small clock-skew tolerance is sufficient for the two servers.
            $created_after = max(0, $created_after - (90));

            // Listeo stores the WooCommerce product associated with a listing
            // in the listing's product_id meta field. It may be stored as a
            // serialized array, so normalize both scalar and array values.
            $listing_id = absint($request->get_param('listing_id'));
            $expected_product_ids = [];
            if ($listing_id > 0) {
                $product_meta = get_post_meta($listing_id, 'product_id', true);
                $product_values = is_array($product_meta) ? $product_meta : [$product_meta];
                foreach ($product_values as $product_value) {
                    $product_id = absint($product_value);
                    if ($product_id > 0) {
                        $expected_product_ids[] = $product_id;
                    }
                }
                $expected_product_ids = array_values(array_unique($expected_product_ids));
            }

            $user = get_user_by('email', $email);
            $queries = [];

            // Query by billing/customer email first. This also finds guest
            // orders if Listeo created the order without a customer ID.
            $queries[] = [
                'limit'        => 50,
                'orderby'      => 'date',
                'order'        => 'DESC',
                'return'       => 'objects',
                'customer'     => $email,
                'date_created' => '>' . (int) $created_after,
            ];

            // Also fetch the newest orders without relying on WooCommerce's
            // customer lookup argument. This is important with HPOS/custom
            // Listeo order creation where the customer index can lag or the
            // order may have been created as a guest before being associated
            // with the WordPress account.
            /*
             * Final broad query: ask WooCommerce for the newest orders without
             * customer/date filters and do the matching in PHP below. This is
             * deliberately the fallback for HPOS/custom Listeo order flows
             * where a customer or date query can miss an order even though the
             * order is already visible in WooCommerce.
             */
            $queries[] = [
                'limit'   => 100,
                'orderby' => 'date',
                'order'   => 'DESC',
                'return'  => 'objects',
            ];

            // If the booking was attached to an existing WordPress account,
            // query by customer ID as a second path. Do not combine customer
            // email and customer_id in one query because either field can be
            // absent/mismatched on older Listeo orders.
            if ($user instanceof WP_User) {
                $queries[] = [
                    'limit'        => 20,
                    'orderby'      => 'date',
                    'order'        => 'DESC',
                    'return'       => 'objects',
                    'customer_id'  => (int) $user->ID,
                    'date_created' => '>' . (int) $created_after,
                ];
            }

            $seen = [];
            $orders_scanned = 0;
            $identity_matches = 0;
            $unpaid_matches = 0;
            $product_matches = 0;
            $unlinked_product_candidates = [];
            $diagnostic_product_mismatches = [];

            foreach ($queries as $query) {
                $orders = wc_get_orders($query);

                foreach ($orders as $order) {
                    if (!$order instanceof WC_Order) {
                        continue;
                    }

                    $orders_scanned++;
                    $order_id = (int) $order->get_id();
                    if (isset($seen[$order_id])) {
                        continue;
                    }
                    $seen[$order_id] = true;

                    // Keep the endpoint restricted to orders created around
                    // this booking attempt, even if a custom query adapter
                    // ignores the date filter.
                    $order_created = $order->get_date_created();
                    if (!$order_created || $order_created->getTimestamp() < $created_after) {
                        continue;
                    }

                    $normalized_email = strtolower(trim($email));
                    $order_email = strtolower(trim((string) $order->get_billing_email()));
                    $email_matches = $order_email !== '' && $order_email === $normalized_email;
                    $customer_id_matches = $user instanceof WP_User
                        && (int) $order->get_customer_id() === (int) $user->ID;

                    // Listeo can create the WooCommerce order before the
                    // billing email is populated, while still attaching the
                    // order to the logged-in WordPress customer. Accept either
                    // identity signal, but never accept an unrelated order.
                    if (!$email_matches && !$customer_id_matches) {
                        // Listeo can create a valid WooCommerce order before
                        // populating billing_email/customer_id. Keep an exact
                        // product + fresh timestamp candidate for the fallback
                        // pass below instead of discarding it immediately.
                        $unlinked_product_candidates[] = [
                            'order' => $order,
                            'order_id' => $order_id,
                        ];
                        continue;
                    }
                    $identity_matches++;

                    // Correlate the order to the exact Listeo listing product.
                    // An identity match alone is not sufficient because the same
                    // customer can have multiple unpaid booking orders.
                    $order_product_ids = [];
                    foreach ($order->get_items() as $item) {
                        if (!is_object($item) || !method_exists($item, 'get_product_id')) {
                            continue;
                        }
                        $product_id = (int) $item->get_product_id();
                        if ($product_id > 0) {
                            $order_product_ids[] = $product_id;
                        }
                    }
                    $order_product_ids = array_values(array_unique($order_product_ids));

                    $product_matches_listing = empty($expected_product_ids)
                        ? true
                        : !empty(array_intersect($expected_product_ids, $order_product_ids));

                    $product_matches_submitted = empty($submitted_product_ids)
                        ? true
                        : !empty(array_intersect($submitted_product_ids, $order_product_ids));

                    if (!$product_matches_listing || !$product_matches_submitted) {
                        if (count($diagnostic_product_mismatches) < 10) {
                            $diagnostic_product_mismatches[] = [
                                'id' => $order_id,
                                'status' => $status,
                                'order_product_ids' => $order_product_ids,
                                'expected_product_ids' => $expected_product_ids,
                                'submitted_product_ids' => $submitted_product_ids,
                            ];
                        }
                        continue;
                    }
                    $product_matches++;

                    // Do not require one hard-coded WooCommerce status.
                    // Custom gateways/plugins can use another unpaid status.
                    // Reject orders that are already paid or clearly terminal.
                    $status = (string) $order->get_status();
                    if ($order->is_paid() || in_array($status, ['cancelled', 'refunded', 'completed'], true)) {
                        continue;
                    }
                    $unpaid_matches++;

                    // WooCommerce's native method builds the real
                    // /checkout/order-pay/{id}/?pay_for_order=true&key=...
                    // URL using this order's actual key.
                    $payment_url = $order->get_checkout_payment_url(false);

                    // Defensive fallback if a theme/plugin filter empties the
                    // native URL. This reproduces WooCommerce's documented
                    // order-pay URL construction.
                    if (!$payment_url) {
                        $checkout_url = function_exists('wc_get_checkout_url')
                            ? wc_get_checkout_url()
                            : home_url('/checkout/');
                        $payment_url = add_query_arg(
                            [
                                'pay_for_order' => 'true',
                                'key' => $order->get_order_key(),
                            ],
                            wc_get_endpoint_url('order-pay', $order_id, $checkout_url)
                        );
                    }

                    if (!$payment_url) {
                        continue;
                    }

                    return [
                        'ok' => true,
                        'order_id' => $order_id,
                        'status' => $status,
                        'payment_url' => esc_url_raw($payment_url),
                        'bridge_version' => '2026-09-27-order-lookup-v10',
                    ];
                }
            }

            // Fallback for Listeo orders created as guests/unlinked customers.
            // Only accept an exact product match within this booking's fresh
            // timestamp window, and only when there is exactly one candidate.
            // This prevents an older/unrelated order from being selected.
            if ($unpaid_matches === 0 && count($unlinked_product_candidates) === 1) {
                $candidate = $unlinked_product_candidates[0];
                $candidate_order = $candidate['order'];
                if ($candidate_order instanceof WC_Order) {
                    $candidate_product_ids = [];
                    foreach ($candidate_order->get_items() as $item) {
                        if (!is_object($item) || !method_exists($item, 'get_product_id')) {
                            continue;
                        }
                        $candidate_product_id = (int) $item->get_product_id();
                        if ($candidate_product_id > 0) {
                            $candidate_product_ids[] = $candidate_product_id;
                        }
                    }
                    $candidate_product_ids = array_values(array_unique($candidate_product_ids));
                    $candidate_matches_product = empty($expected_product_ids)
                        ? false
                        : !empty(array_intersect($expected_product_ids, $candidate_product_ids));
                    $candidate_matches_submitted = empty($submitted_product_ids)
                        ? true
                        : !empty(array_intersect($submitted_product_ids, $candidate_product_ids));
                    $candidate_status = (string) $candidate_order->get_status();
                    if ($candidate_matches_product
                        && $candidate_matches_submitted
                        && !$candidate_order->is_paid()
                        && !in_array($candidate_status, ['cancelled', 'refunded', 'completed'], true)
                    ) {
                        $candidate_user = get_user_by('email', $email);
                        if ($candidate_user instanceof WP_User) {
                            $candidate_order->set_customer_id((int) $candidate_user->ID);
                            if (!$candidate_order->get_billing_email()) {
                                $candidate_order->set_billing_email($email);
                            }
                            $candidate_order->save();
                        }

                        $payment_url = $candidate_order->get_checkout_payment_url(false);
                        if ($payment_url) {
                            return [
                                'ok' => true,
                                'order_id' => (int) $candidate_order->get_id(),
                                'status' => $candidate_status,
                                'payment_url' => esc_url_raw($payment_url),
                                'bridge_version' => '2026-09-27-order-lookup-v10',
                                'correlation' => 'fresh_product_fallback',
                            ];
                        }
                    }
                }
            }

            /*
             * Diagnostic snapshot: return the newest identity-related orders
             * so the PWA can distinguish "Listeo created nothing" from
             * "Listeo created an order but our identity/order matching is
             * wrong". This endpoint is protected by the private bridge secret.
             */
            $recent_orders = [];
            $diagnostic_orders = wc_get_orders([
                'limit'   => 10,
                'orderby' => 'date',
                'order'   => 'DESC',
                'return'  => 'objects',
            ]);
            foreach ($diagnostic_orders as $diagnostic_order) {
                if (!$diagnostic_order instanceof WC_Order) {
                    continue;
                }
                $created = $diagnostic_order->get_date_created();
                if (!$created || $created->getTimestamp() < $created_after) {
                    continue;
                }
                $product_ids = [];
                $product_names = [];
                foreach ($diagnostic_order->get_items() as $item) {
                    $product_id = (int) $item->get_product_id();
                    if ($product_id > 0) {
                        $product_ids[] = $product_id;
                    }
                    $product_names[] = (string) $item->get_name();
                }
                $recent_orders[] = [
                    'id' => (int) $diagnostic_order->get_id(),
                    'status' => (string) $diagnostic_order->get_status(),
                    'created' => $created->date('c'),
                    'customer_id' => (int) $diagnostic_order->get_customer_id(),
                    'billing_email' => (string) $diagnostic_order->get_billing_email(),
                    'product_ids' => array_values(array_unique($product_ids)),
                    'product_names' => array_values(array_unique(array_filter($product_names))),
                ];
            }

            $reason = 'no_recent_matching_order';
            if ($listing_id > 0 && empty($expected_product_ids)) {
                $reason = 'listing_product_id_missing';
            } elseif (!empty($submitted_product_ids) && empty(array_intersect($submitted_product_ids, $expected_product_ids))) {
                $reason = 'submitted_product_id_does_not_match_listing_product';
            } elseif ($orders_scanned > 0 && $identity_matches === 0 && count($unlinked_product_candidates) > 1) {
                $reason = 'multiple_fresh_product_orders_without_customer_match';
            } elseif ($orders_scanned > 0 && $identity_matches === 0) {
                $reason = 'recent_orders_found_but_customer_did_not_match';
            } elseif ($identity_matches > 0 && $product_matches === 0) {
                $reason = 'customer_matched_but_order_product_did_not_match_listing';
            } elseif ($product_matches > 0 && $unpaid_matches === 0) {
                $reason = 'matching_order_was_paid_or_terminal';
            } elseif ($unpaid_matches > 0) {
                $reason = 'matching_unpaid_order_has_no_payment_url';
            }

            return [
                'ok' => false,
                'order_id' => 0,
                'payment_url' => '',
                'reason' => $reason,
                'bridge_version' => '2026-09-27-order-lookup-v9',
                'diagnostics' => [
                    'listing_id_requested' => $listing_id,
                    'expected_product_ids' => $expected_product_ids,
                    'submitted_product_ids' => $submitted_product_ids,
                    'orders_scanned' => $orders_scanned,
                    'identity_matches' => $identity_matches,
                    'product_matches' => $product_matches,
                    'unpaid_matches' => $unpaid_matches,
                    'product_mismatches' => $diagnostic_product_mismatches,
                    'unlinked_product_candidates' => count($unlinked_product_candidates),
                    'recent_orders' => $recent_orders,
                ],
            ];
        },
    ]);
});
