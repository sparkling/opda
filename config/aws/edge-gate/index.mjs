// ADR-0038 boundary restored: public holding page, authenticated knowledge base.
// OAuth stays in the regional service; this gate shares its exact session reader.
import { createStore } from './store.mjs';
import { readApprovedSession, SESSION_COOKIE, validSessionToken } from './session.mjs';

export const CONFIG = Object.freeze({ region: 'eu-west-2', siteOrigin: 'https://opda.org.uk',
  participantsTableName: 'opda-participants', sessionsTableName: 'opda-participant-sessions' });
const AUTH_PATHS = new Set(['/_auth/login', '/_auth/callback', '/_auth/me', '/_auth/logout']);
const WORKSPACE_GET_PATHS = new Set(['/_auth/workspace/continue']);
const HOLDING_PATHS = new Set(['/under-development', '/under-development/', '/under-development/index.html']);
const expire = `${SESSION_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
const headers = {
  'cache-control': [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
  'x-robots-tag': [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
  'referrer-policy': [{ key: 'Referrer-Policy', value: 'no-referrer' }],
  'x-content-type-options': [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
};
const respond = (status, body = '', extra = {}) => ({ status: String(status), headers: { ...headers, ...extra }, body });

function sessionToken(request) {
  const matches = (request.headers.cookie ?? []).flatMap(header => String(header.value).split(';'))
    .map(pair => pair.trim()).filter(pair => pair.startsWith(SESSION_COOKIE + '='));
  return matches.length === 1 ? matches[0].slice(SESSION_COOKIE.length + 1) : null;
}

export function rewriteIndex(uri) {
  if (uri === '/resources' || uri === '/resources/') return '/resources/index.html';
  if (uri.startsWith('/resources/')) return uri.slice('/resources'.length);
  if (uri.startsWith('/api/')) return uri;
  if (uri.endsWith('/')) return uri + 'index.html';
  return uri.split('/').at(-1).includes('.') ? uri : uri + '/index.html';
}

export function createHandler(overrides = {}) {
  const store = overrides.store ?? createStore(CONFIG), now = overrides.now ?? (() => Date.now());
  return async event => {
    const request = event?.Records?.[0]?.cf?.request;
    if (!request || request.headers?.host?.[0]?.value !== 'opda.org.uk') return respond(403, 'Access restricted.');
    const uri = request.uri, method = request.method;
    // Exact exceptions only. Encoded separators and dot paths never become public.
    if (typeof uri !== 'string' || !uri.startsWith('/') || uri.length > 4096
      || /[\\\u0000-\u001f\u007f]|\/\/|(?:^|\/)\.{1,2}(?:\/|$)|%(?:2f|5c|2e|00)/iu.test(uri)) return respond(400, 'Invalid path.');
    const read = method === 'GET' || method === 'HEAD';
    if (AUTH_PATHS.has(uri) || WORKSPACE_GET_PATHS.has(uri)) {
      return method === 'GET' ? request : respond(405, 'Use GET.');
    }
    if (uri === '/_auth/workspace') return method === 'GET' || method === 'POST' ? request : respond(405, 'Use GET or POST.');
    if (read && uri === '/coming-soon.jpg') return request;
    if (read && HOLDING_PATHS.has(uri)) { request.uri = '/under-development/index.html'; return request; }
    const token = sessionToken(request);
    let approved;
    try { approved = validSessionToken(token) ? await readApprovedSession(token, store, now) : null; }
    catch { return respond(503, 'Under development. Sign-in is temporarily unavailable.'); }
    if (!approved) {
      if (uri.startsWith('/api/v2/')) return respond(401, '{"error":"Sign-in required."}', {
        'content-type': [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
        'set-cookie': [{ key: 'Set-Cookie', value: expire }],
      });
      if (read && (uri === '/' || uri === '/index.html')) {
        request.uri = '/under-development/index.html'; return request;
      }
      if (!read) return respond(401, 'Sign-in required.', { 'set-cookie': [{ key: 'Set-Cookie', value: expire }] });
      const returnPath = uri + (request.querystring ? '?' + request.querystring : '');
      return respond(302, '', { location: [{ key: 'Location', value: '/_auth/login?' + new URLSearchParams({ return: returnPath }) }],
        'set-cookie': [{ key: 'Set-Cookie', value: expire }] });
    }
    request.uri = rewriteIndex(uri);
    return request;
  };
}

export const handler = createHandler();
