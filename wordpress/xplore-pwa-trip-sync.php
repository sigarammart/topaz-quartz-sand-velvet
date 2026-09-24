<?php
/**
 * Xplore Pondy — PWA → WordPress user_trip itinerary sync
 *
 * Add this snippet to WordPress/WPCode on xplorepondy.com.
 * The PWA authenticates with the existing WP_TRIP_SYNC_USERNAME /
 * WP_TRIP_SYNC_APP_PASSWORD integration account.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'rest_api_init', function () {
    register_rest_route(
        'xplore/v1',
        '/pwa/trip/(?P<id>\\d+)/sync',
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'xplore_pwa_sync_user_trip',
            'permission_callback' => function () {
                return current_user_can( 'manage_options' );
            },
            'args'                => [
                'id' => [
                    'required'          => true,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function ( $value ) {
                        return absint( $value ) > 0;
                    },
                ],
            ],
        ]
    );
} );

if ( ! function_exists( 'xplore_pwa_sync_user_trip' ) ) {
    function xplore_pwa_sync_user_trip( WP_REST_Request $request ) {
        $trip_id = absint( $request['id'] );
        $trip    = get_post( $trip_id );

        if ( ! $trip || 'user_trip' !== $trip->post_type ) {
            return new WP_Error(
                'xplore_trip_not_found',
                'The requested user_trip was not found.',
                [ 'status' => 404 ]
            );
        }

        $params = $request->get_json_params();
        $email  = isset( $params['email'] ) ? sanitize_email( $params['email'] ) : '';

        if ( ! $email ) {
            return new WP_Error(
                'xplore_trip_email_required',
                'A signed-in email is required.',
                [ 'status' => 400 ]
            );
        }

        // Resolve the actual WordPress account represented by the PWA login.
        $users = get_users(
            [
                'search'         => $email,
                'search_columns' => [ 'user_email' ],
                'number'         => 20,
                'fields'         => [ 'ID', 'user_email' ],
            ]
        );

        $wp_user_id = 0;
        foreach ( $users as $user ) {
            if ( strtolower( trim( $user->user_email ) ) === strtolower( trim( $email ) ) ) {
                $wp_user_id = (int) $user->ID;
                break;
            }
        }

        if ( ! $wp_user_id ) {
            return new WP_Error(
                'xplore_trip_user_not_found',
                'No matching xplorepondy.com WordPress user was found.',
                [ 'status' => 404 ]
            );
        }

        // Never allow the integration account to write another user's trip.
        if ( (int) $trip->post_author !== $wp_user_id ) {
            return new WP_Error(
                'xplore_trip_forbidden',
                'This trip does not belong to the signed-in WordPress user.',
                [ 'status' => 403 ]
            );
        }

        $interests = isset( $params['interests'] ) && is_array( $params['interests'] )
            ? array_values(
                array_filter(
                    array_map( 'sanitize_title', $params['interests'] ),
                    static function ( $value ) {
                        return '' !== $value;
                    }
                )
            )
            : [];

        $raw_items = isset( $params['items'] ) && is_array( $params['items'] )
            ? $params['items']
            : [];

        $items = [];
        foreach ( $raw_items as $item ) {
            $listing_id = absint( $item['listingId'] ?? 0 );
            $day        = max( 1, min( 7, absint( $item['day'] ?? 1 ) ) );

            if (
                $listing_id &&
                'listing' === get_post_type( $listing_id ) &&
                'publish' === get_post_status( $listing_id )
            ) {
                $items[] = [
                    'listing_id' => $listing_id,
                    'day'        => $day,
                ];
            }
        }

        // Remove duplicates while preserving the PWA order.
        $seen = [];
        $items = array_values(
            array_filter(
                $items,
                static function ( $item ) use ( &$seen ) {
                    if ( isset( $seen[ $item['listing_id'] ] ) ) {
                        return false;
                    }
                    $seen[ $item['listing_id'] ] = true;
                    return true;
                }
            )
        );

        $flat_ids = array_values(
            array_unique(
                array_map(
                    'absint',
                    array_column( $items, 'listing_id' )
                )
            )
        );

        $days = [];
        foreach ( $items as $item ) {
            $key = (string) $item['day'];
            if ( ! isset( $days[ $key ] ) ) {
                $days[ $key ] = [];
            }
            $days[ $key ][] = $item['listing_id'];
        }
        ksort( $days, SORT_NUMERIC );

        // Keep all trip days present so the existing WP UI can render empty days.
        $trip_days = absint( get_post_meta( $trip_id, 'trip_days', true ) );
        if ( $trip_days < 1 ) {
            $trip_days = 1;
        }
        for ( $day = 1; $day <= min( 7, $trip_days ); $day++ ) {
            $key = (string) $day;
            if ( ! isset( $days[ $key ] ) ) {
                $days[ $key ] = [];
            }
        }
        ksort( $days, SORT_NUMERIC );

        // The PWA itinerary is structured JSON. Save a readable HTML version
        // because the existing WordPress shortcode reads trip_ai_output.
        $itinerary = isset( $params['itinerary'] ) && is_array( $params['itinerary'] )
            ? $params['itinerary']
            : [];

        $items_by_slug = [];
        foreach ( $items as $item ) {
            $slug = get_post_field( 'post_name', $item['listing_id'] );
            if ( $slug ) {
                $items_by_slug[ $slug ] = $item['listing_id'];
            }
        }

        $html = '';
        foreach ( $itinerary as $day_block ) {
            if ( ! is_array( $day_block ) ) {
                continue;
            }

            $day_number = absint( $day_block['day'] ?? 0 );
            if ( ! $day_number ) {
                continue;
            }

            $title = sanitize_text_field( $day_block['title'] ?? 'Day ' . $day_number );
            $intro = sanitize_text_field( $day_block['intro'] ?? '' );

            $html .= '<section class="trip-day" data-day="' . esc_attr( $day_number ) . '">';
            $html .= '<h3 class="trip-day-title">' . esc_html( $title ) . '</h3>';

            if ( $intro ) {
                $html .= '<p class="trip-day-intro">' . esc_html( $intro ) . '</p>';
            }

            $stops = isset( $day_block['stops'] ) && is_array( $day_block['stops'] )
                ? $day_block['stops']
                : [];

            if ( $stops ) {
                $html .= '<div class="trip-time-block sortable" data-block="Day ' . esc_attr( $day_number ) . '">';

                foreach ( $stops as $stop ) {
                    if ( ! is_array( $stop ) ) {
                        continue;
                    }

                    $slug = sanitize_title( $stop['slug'] ?? '' );
                    $listing_id = $items_by_slug[ $slug ] ?? 0;

                    if ( ! $listing_id ) {
                        continue;
                    }

                    $listing_title = get_the_title( $listing_id );
                    $permalink     = get_permalink( $listing_id );
                    $time          = sanitize_text_field( $stop['time'] ?? '' );
                    $duration      = absint( $stop['durationMin'] ?? 0 );
                    $blurb         = sanitize_text_field( $stop['blurb'] ?? '' );

                    $html .= '<article class="trip-item xp-listing-item" data-listing-id="' . esc_attr( $listing_id ) . '">';

                    if ( $time ) {
                        $html .= '<div class="trip-stop-time">' . esc_html( $time ) . '</div>';
                    }

                    $html .= '<div class="trip-details">';
                    $html .= '<h4><a href="' . esc_url( $permalink ) . '">' . esc_html( $listing_title ) . '</a></h4>';

                    if ( $duration ) {
                        $html .= '<div class="trip-stop-duration">' . esc_html( $duration ) . ' min</div>';
                    }

                    if ( $blurb ) {
                        $html .= '<p>' . esc_html( $blurb ) . '</p>';
                    }

                    $html .= '</div></article>';
                }

                $html .= '</div>';
            }

            $html .= '</section>';
        }

        update_post_meta( $trip_id, 'trip_interest', $interests );
        update_post_meta( $trip_id, 'trip_selected_listings', $flat_ids );
        update_post_meta( $trip_id, 'trip_selected_by_day', $days );
        update_post_meta( $trip_id, '_itinerary_listings', $flat_ids );
        update_post_meta( $trip_id, '_trip_itinerary', wp_json_encode( $itinerary ) );
        update_post_meta( $trip_id, '_xplore_pwa_selected_listings', wp_json_encode( $items ) );
        update_post_meta( $trip_id, '_xplore_pwa_trip_data', wp_json_encode( $params ) );

        if ( $html ) {
            update_post_meta( $trip_id, 'trip_ai_output', wp_kses_post( $html ) );
        } else {
            delete_post_meta( $trip_id, 'trip_ai_output' );
        }

        return new WP_REST_Response(
            [
                'ok'            => true,
                'trip_id'       => $trip_id,
                'listing_count' => count( $flat_ids ),
                'days'          => $days,
                'interests'     => $interests,
            ],
            200
        );
    }
}
