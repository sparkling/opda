// Auth0 post-login action for the OPDA site gate. Only a fresh, verified
// primary GitHub email matching Auth0's email is asserted in the ID token.
const CLIENT_ID = 'xjPgyXLJllYtefV6LZkZ6oYnce89RlZT';
const AUTH0_ORIGIN = 'https://sparklesparkle.auth0.com';
const CLAIM = 'https://opda.org.uk/github_verified_email';

function normaliseEmail(value) {
  if (typeof value !== 'string' || value.length > 254) return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) ? email : null;
}

async function jsonResponse(fetchImpl, url, options) {
  const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(2500) });
  return response.ok ? response.json() : null;
}

exports.onExecutePostLogin = async (event, api, fetchImpl = fetch) => {
  if (event?.client?.client_id !== CLIENT_ID || event?.connection?.name !== 'github') return;
  const userId = event.user?.user_id;
  const email = normaliseEmail(event.user?.email);
  if (!/^github\|[0-9]+$/u.test(userId ?? '') || !email) return;
  const clientId = event.secrets?.OPDA_AUTH0_M2M_CLIENT_ID;
  const clientSecret = event.secrets?.OPDA_AUTH0_M2M_CLIENT_SECRET;
  if (!clientId || !clientSecret) return;

  try {
    const management = await jsonResponse(fetchImpl, `${AUTH0_ORIGIN}/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret,
        audience: `${AUTH0_ORIGIN}/api/v2/`, grant_type: 'client_credentials',
        scope: 'read:users read:user_idp_tokens' }),
    });
    if (typeof management?.access_token !== 'string') return;
    const profile = await jsonResponse(fetchImpl, `${AUTH0_ORIGIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: { authorization: `Bearer ${management.access_token}` },
    });
    if (profile?.user_id !== userId) return;
    const github = profile.identities?.find(identity => identity.provider === 'github'
      && String(identity.user_id) === userId.slice('github|'.length));
    if (typeof github?.access_token !== 'string') return;
    const addresses = await jsonResponse(fetchImpl, 'https://api.github.com/user/emails?per_page=100', {
      headers: { authorization: `Bearer ${github.access_token}`, accept: 'application/vnd.github+json',
        'user-agent': 'OPDA-GitHub-email-verifier' },
    });
    if (Array.isArray(addresses) && addresses.length <= 100
      && addresses.some(address => address.primary === true && address.verified === true
        && normaliseEmail(address.email) === email)) api.idToken.setCustomClaim(CLAIM, email);
  } catch {
    // External failures leave the claim absent; OPDA refuses the sign-in.
  }
};
