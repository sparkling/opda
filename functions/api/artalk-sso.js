/**
 * Artalk SSO bridge — exchange an Auth0 access token for an Artalk JWT.
 *
 * Cloudflare Pages Function. Lives at /api/artalk-sso when deployed to
 * opda-kb.pages.dev (and to localhost via `wrangler pages dev dist`).
 *
 * Why this exists: Artalk's session cookie is SameSite=Lax, so it can't
 * cross from the comments widget on OPDA pages to the Artalk backend at
 * artalk-…railway.app. The widget instead reads
 * `localStorage["ArtalkUser"].token` and sends it as Authorization. This
 * function mints that token without exposing Artalk's app_key in the
 * browser bundle.
 *
 * Flow:
 *   1. POST { auth0_token } from the OPDA frontend (Auth0 access token)
 *   2. Verify via Auth0's /userinfo endpoint (trusted source of email)
 *   3. Map email → Artalk user_id (currently hardcoded for the allowlist;
 *      auto-provision could be added later)
 *   4. Sign an Artalk-compatible JWT (HS256, claims { user_id, iat, exp })
 *      using the same ATK_APP_KEY the Artalk container uses
 *   5. Return { token, user } — frontend writes to localStorage["ArtalkUser"]
 *
 * Required Pages env vars:
 *   - ARTALK_APP_KEY  (must match ATK_APP_KEY on the Railway container)
 *   - AUTH0_DOMAIN    (defaults to sparklesparkle.auth0.com)
 */

const DEFAULT_AUTH0_DOMAIN = 'sparklesparkle.auth0.com';
const ARTALK_BACKEND = 'https://artalk-production-4ade.up.railway.app';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

// Allowlist mirrors the Auth0 Post-Login Action; keys are lowercased.
// Each entry maps to the Artalk user_id and is_admin flag for that account.
// Adding a new user: sign them in via OIDC once (creates their Artalk row),
// look up the id via `auth0 ssh ... artalk users list` or the dashboard,
// then add an entry here.
const ALLOWLIST = {
  'henrik@sparklingideas.co.uk': { user_id: 1, is_admin: true },
};

function base64url(input) {
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function signArtalkJwt({ userId, appKey, ttl }) {
  const now = Math.floor(Date.now() / 1000);
  const headerB64 = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = base64url(
    JSON.stringify({ user_id: userId, iat: now, exp: now + ttl }),
  );
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(appKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(sig)}`;
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  const appKey = env.ARTALK_APP_KEY;
  if (!appKey) {
    return jsonError(500, 'SSO bridge not configured (ARTALK_APP_KEY missing)');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Invalid JSON');
  }
  const auth0Token = body?.auth0_token;
  if (!auth0Token) return jsonError(400, 'Missing auth0_token');

  const auth0Domain = env.AUTH0_DOMAIN || DEFAULT_AUTH0_DOMAIN;
  let userinfo;
  try {
    const r = await fetch(`https://${auth0Domain}/userinfo`, {
      headers: { Authorization: `Bearer ${auth0Token}` },
    });
    if (!r.ok) return jsonError(401, 'Auth0 token invalid');
    userinfo = await r.json();
  } catch (e) {
    return jsonError(502, `Auth0 fetch failed: ${e.message}`);
  }

  const email = (userinfo.email || '').toLowerCase();
  if (!email) return jsonError(400, 'No email claim on Auth0 token');

  const mapping = ALLOWLIST[email];
  if (!mapping) {
    return jsonError(403, `${email} is not in the comments SSO allowlist`);
  }

  const token = await signArtalkJwt({
    userId: mapping.user_id,
    appKey,
    ttl: TOKEN_TTL_SECONDS,
  });

  return new Response(
    JSON.stringify({
      token,
      user: {
        name: userinfo.nickname || userinfo.given_name || userinfo.name || email,
        email,
        link: '',
        is_admin: mapping.is_admin,
      },
      // Artalk backend URL — convenient for clients that want to verify
      // the token by calling /user (optional)
      server: ARTALK_BACKEND,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
  );
}

export function onRequestGet() {
  return jsonError(405, 'Use POST');
}
