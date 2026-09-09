import { createPublicKey, timingSafeEqual, verify } from 'node:crypto';

export function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function normaliseEmail(value) {
  if (typeof value !== 'string' || value.length > 254) return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) ? email : null;
}

export function normaliseConfig(source) {
  const provider = source.provider ?? 'cognito';
  const issuer = String(source.issuer ?? '').trim();
  const cognitoDomain = String(source.cognitoDomain ?? '').trim();
  const clientId = String(source.clientId ?? '').trim();
  const siteOrigin = String(source.siteOrigin ?? '').trim().replace(/\/$/u, '');
  const participantsTableName = String(source.participantsTableName ?? '').trim();
  const sessionsTableName = String(source.sessionsTableName ?? '').trim();
  const pool = issuer.match(/^https:\/\/cognito-idp\.([a-z0-9-]+)\.amazonaws\.com\/\1_[A-Za-z0-9]+$/u);
  const domain = cognitoDomain.match(/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.auth\.([a-z0-9-]+)\.amazoncognito\.com$/u);
  const auth0 = provider === 'auth0' && /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)?\.auth0\.com\/$/u.test(issuer);
  if (provider !== 'cognito' && !auth0) throw new Error('Invalid identity provider.');
  if (provider === 'cognito' && (!pool || !domain || pool[1] !== domain[1])) throw new Error('Invalid Cognito issuer or domain.');
  if (!/^[A-Za-z0-9]{1,128}$/u.test(clientId)) throw new Error('Invalid identity-provider client ID.');
  const origin = new URL(siteOrigin);
  if (origin.protocol !== 'https:' || origin.origin !== siteOrigin || origin.pathname !== '/') {
    throw new Error('The site origin must be an HTTPS origin without a path.');
  }
  if (![participantsTableName, sessionsTableName].every((name) => /^[A-Za-z0-9_.-]{3,255}$/u.test(name))
    || participantsTableName === sessionsTableName) throw new Error('Invalid authentication tables.');
  const providerOrigin = auth0 ? issuer.slice(0, -1) : cognitoDomain;
  return { provider, issuer, cognitoDomain, providerOrigin, clientId, siteOrigin, participantsTableName, sessionsTableName };
}

export function environmentConfig() {
  return {
    provider: process.env.OIDC_PROVIDER ?? 'cognito',
    issuer: process.env.OIDC_PROVIDER === 'auth0' ? `https://${process.env.AUTH0_DOMAIN}/` : process.env.COGNITO_ISSUER,
    cognitoDomain: process.env.COGNITO_DOMAIN,
    clientId: process.env.OIDC_PROVIDER === 'auth0' ? process.env.AUTH0_CLIENT_ID : process.env.COGNITO_CLIENT_ID,
    participantsTableName: process.env.PARTICIPANTS_TABLE_NAME,
    sessionsTableName: process.env.SESSIONS_TABLE_NAME,
    siteOrigin: process.env.SITE_ORIGIN,
  };
}

export function createIdentityVerifier(config, { fetch: fetchImpl, now }) {
  let keys, keysExpireAt = 0;
  async function loadKeys(force = false) {
    if (!keys || force || now() >= keysExpireAt) {
      const response = await fetchImpl(`${config.issuer.replace(/\/$/u, '')}/.well-known/jwks.json`, {
        headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error('Identity-provider keys unavailable.');
      const body = await response.json();
      if (!Array.isArray(body?.keys) || body.keys.length === 0 || body.keys.length > 20) {
        throw new Error('Invalid identity-provider key set.');
      }
      keys = new Map(body.keys.filter((key) => key && typeof key.kid === 'string').map((key) => [key.kid, key]));
      keysExpireAt = now() + 300_000;
    }
    return keys;
  }

  return async function verifyIdToken(token, expectedNonce) {
    if (typeof token !== 'string' || token.length > 16_384 || !/^[\w-]+\.[\w-]+\.[\w-]+$/u.test(token)) return null;
    const parts = token.split('.');
    let header, payload;
    try {
      header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    } catch { return null; }
    if (!header || !payload || header.alg !== 'RS256' || typeof header.kid !== 'string') return null;
    if (payload.iss !== config.issuer || payload.aud !== config.clientId) return null;
    if (config.provider === 'cognito' && payload.token_use !== 'id') return null;
    if (config.provider === 'auth0' && payload.token_use !== undefined && payload.token_use !== 'id') return null;
    if (!constantTimeEqual(payload.nonce, expectedNonce)) return null;
    const current = Math.floor(now() / 1000);
    if (!Number.isSafeInteger(payload.exp) || payload.exp <= current) return null;
    if (!Number.isSafeInteger(payload.iat) || payload.iat < 0 || payload.iat > current + 60 || payload.exp <= payload.iat) return null;
    if (payload.nbf !== undefined && (!Number.isSafeInteger(payload.nbf) || payload.nbf > current + 60)) return null;
    if (typeof payload.sub !== 'string' || !/^[\x21-\x7e]{1,255}$/u.test(payload.sub)) return null;
    if (config.provider === 'cognito' && !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/iu.test(payload.sub)) return null;
    const email = normaliseEmail(payload.email);
    if (!email || payload.email_verified !== true) return null;
    let key = (await loadKeys()).get(header.kid);
    if (!key) key = (await loadKeys(true)).get(header.kid);
    if (!key || key.kty !== 'RSA' || (key.use && key.use !== 'sig') || (key.alg && key.alg !== 'RS256')) return null;
    try {
      const valid = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`),
        createPublicKey({ key, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
      return valid ? { issuer: config.issuer, sub: payload.sub, email, exp: payload.exp } : null;
    } catch { return null; }
  };
}

export function approvedParticipant(participant, identity, now) {
  return Boolean(participant && participant.pk === `USER#${identity.sub}`
    && participant.cognitoSub === identity.sub && normaliseEmail(participant.email) === identity.email
    && typeof participant.participantId === 'string' && participant.participantId.length > 0
    && participant.reviewStatus === 'approved' && participant.suspended === false
    && participant.erasedAt === undefined && participant.deletedAt === undefined
    && participant.active === true
    && Array.isArray(participant.approvedDomains) && participant.approvedDomains.some(domainId =>
      typeof domainId === 'string' && Object.hasOwn(participant.domainApprovals ?? {}, domainId)
        && participant.domainApprovals[domainId]?.status === 'approved')
    && Number.isSafeInteger(participant.accessVersion) && participant.accessVersion >= 0
    && (participant.expiresAt === undefined || (Number.isSafeInteger(participant.expiresAt) && participant.expiresAt > now))
    && ['not_invited', 'complete'].includes(participant.enrolmentStatus));
}
