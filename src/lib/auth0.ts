/**
 * Auth0 SPA SDK wrapper.
 *
 * Both `domain` and `clientId` are public values — the SPA flow uses PKCE
 * and bakes them into the built JS bundle. They're not secrets and are
 * safe to commit. The Auth0 dashboard's "Allowed Callback URLs" /
 * "Allowed Web Origins" / "Allowed Logout URLs" lists are what actually
 * gate authentication, not these values.
 *
 * The tenant + app are managed by the `auth0` CLI; see `auth0 apps show
 * aBGW186IylZT861S0PE85krbvw3i-4U6`.
 */
import { createAuth0Client, type Auth0Client } from '@auth0/auth0-spa-js';

export const AUTH0_DOMAIN = 'sparklesparkle.auth0.com';
export const AUTH0_CLIENT_ID = 'aBGW186IylZT861S0PE85krbvw3i-4U6';

let clientPromise: Promise<Auth0Client> | null = null;

export function getAuth0Client(): Promise<Auth0Client> {
  if (clientPromise) return clientPromise;
  clientPromise = createAuth0Client({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri:
        typeof window !== 'undefined'
          ? window.location.origin + '/callback'
          : 'http://localhost:4321/callback',
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
  });
  return clientPromise;
}
