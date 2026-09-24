/**
 * Server-only OAuth for the published custom domain
 * (https://app.xplorepondy.com). Never import from client code.
 *
 * Google Cloud Console must list:
 *   Authorized JavaScript origins:
 *     https://app.xplorepondy.com
 *     https://pwa.xplorepondy.com
 *   Authorized redirect URIs:
 *     https://app.xplorepondy.com/api/auth/callback/google
 *     https://pwa.xplorepondy.com/api/auth/callback/google
 *
 * X Developer Portal → User authentication settings (OAuth 2.0):
 *   Type: Web App, Confidential
 *   Callback URI / Redirect URL:
 *     https://app.xplorepondy.com/api/auth/callback/twitter
 *     https://pwa.xplorepondy.com/api/auth/callback/twitter
 *   Website URL:                 https://app.xplorepondy.com
 *   Scopes: tweet.read, users.read, offline.access, users.email
 */

export const CUSTOM_APP_HOSTS = ["app.xplorepondy.com", "pwa.xplorepondy.com"] as const;
export const CUSTOM_APP_ORIGINS = CUSTOM_APP_HOSTS.map((host) => `https://${host}`);

const env = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const GOOGLE_OAUTH_CLIENT_ID =
  env("GOOGLE_OAUTH_CLIENT_ID");

export const GOOGLE_OAUTH_CLIENT_SECRET =
  env("GOOGLE_OAUTH_CLIENT_SECRET");

export const TWITTER_OAUTH_CLIENT_ID =
  env("TWITTER_OAUTH_CLIENT_ID");

export const TWITTER_OAUTH_CLIENT_SECRET =
  env("TWITTER_OAUTH_CLIENT_SECRET");
