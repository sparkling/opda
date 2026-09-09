import { createHash, createHmac, randomUUID } from 'node:crypto';

const ORIGIN = 'http://comments-origin.opda.org.uk:23366';
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');

export function createArtalkClient(overrides = {}) {
  const origin = overrides.origin ?? process.env.ARTALK_ORIGIN;
  const secret = overrides.key ?? process.env.OPDA_COMMENTS_GATEWAY_KEY;
  if (origin !== ORIGIN || !/^[a-f0-9]{64}$/u.test(secret ?? '')) throw new Error('Comments gateway is not configured');
  const key = Buffer.from(secret, 'hex');
  const fetcher = overrides.fetch ?? globalThis.fetch;
  const now = overrides.now ?? (() => Date.now());

  async function request(path, { method = 'GET', body, token } = {}) {
    const response = await fetcher(origin + path, { method, redirect: 'error',
      signal: AbortSignal.timeout(3000),
      headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: 'Bearer ' + token } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) { await response.body?.cancel(); const error = new Error('Comments upstream failed'); error.statusCode = response.status; throw error; }
    const reader = response.body.getReader();
    const chunks = []; let bytes = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > 2 * 1024 * 1024) throw new Error('Comment response too large');
        chunks.push(Buffer.from(part.value));
      }
    } finally { await reader.cancel(); }
    const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return result.data ?? result;
  }

  return {
    list: query => request('/api/v2/comments?' + new URLSearchParams(query)),
    async create(input, identity) {
      const issued = Math.floor(now() / 1000);
      const content = encode({ alg: 'HS256', typ: 'JWT' }) + '.' + encode({
        iss: 'opda-comments-gateway', aud: 'artalk-comments', sub: identity.participantId,
        name: identity.name, iat: issued, exp: issued + 15, jti: randomUUID(),
      });
      const assertion = content + '.' + createHmac('sha256', key).update(content).digest('base64url');
      const session = await request('/api/v2/opda/session', { method: 'POST', body: { assertion } });
      const expectedEmail = createHash('sha256').update(identity.participantId).digest('hex') + '@members.comments.opda.org.uk';
      if (typeof session.token !== 'string' || session.token.length > 4096 || !session.token
        || !Number.isSafeInteger(session.user?.id) || session.user.id < 1 || session.user.is_admin !== false
        || session.user.name !== identity.name.trim() || session.user.email !== expectedEmail) throw new Error('Invalid comment identity');
      // Only this server-created token crosses to Artalk. The browser's Cookie,
      // Authorization, query-token and author fields are never forwarded.
      return request('/api/v2/comments', { method: 'POST', token: session.token,
        body: { ...input, name: session.user.name, email: session.user.email, site_name: 'OPDA' } });
    },
  };
}
