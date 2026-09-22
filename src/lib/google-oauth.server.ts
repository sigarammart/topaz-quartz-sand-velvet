/**
 * Server-only OAuth for the published custom domain
 * (https://app.xplorepondy.com). Never import from client code.
 *
 * Google Cloud Console must list:
 *   Authorized JavaScript origins:  https://app.xplorepondy.com
 *   Authorized redirect URIs:       https://app.xplorepondy.com/api/auth/callback/google
 *
 * X Developer Portal → User authentication settings (OAuth 2.0):
 *   Type: Web App, Confidential
 *   Callback URI / Redirect URL: https://app.xplorepondy.com/api/auth/callback/twitter
 *   Website URL:                 https://app.xplorepondy.com
 *   Scopes: tweet.read, users.read, offline.access, users.email
 */
export const GOOGLE_OAUTH_CLIENT_ID =
  "407625034684-rkt7jh4rf0me2qegl45po85adjg4nml6.apps.googleusercontent.com";
export const GOOGLE_OAUTH_CLIENT_SECRET = "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";

export const TWITTER_OAUTH_CLIENT_ID = "NFlLU24xUFc3YVRFODJwTWEzMXI6MTpjaQ";
export const TWITTER_OAUTH_CLIENT_SECRET = "ljcUVZRiInFNgJqhJM9LCUT3A3I6WOMkobaNo1HVWfAKeDsv21";

export const CUSTOM_APP_HOSTS = ["app.xplorepondy.com"] as const;
export const CUSTOM_APP_ORIGINS = CUSTOM_APP_HOSTS.map((host) => `https://${host}`);
