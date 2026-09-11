// Same-origin member comments. The private Artalk client never exposes a bearer
// token, provider identity or administrative API to the browser.
import { createStore } from '../auth-session/store.mjs';
import { readApprovedSession, SESSION_COOKIE } from '../auth-session/session.mjs';

const SITE_ORIGIN = 'https://opda.org.uk';
const PATH = '/api/v2/comments';
const headers = { 'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' };
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
const invalid = () => reply(400, { error: 'Invalid comment request.' });
const validPage = value => typeof value === 'string' && value.length <= 2048
  && value.startsWith('/') && !/[\\?#\u0000-\u001f\u007f]|\/\/|(?:^|\/)\.{1,2}(?:\/|$)/u.test(value);

function cookie(event) {
  const values = Array.isArray(event.cookies) ? event.cookies : [event.headers?.cookie ?? ''];
  const matches = values.flatMap(value => String(value).split(';')).map(value => value.trim())
    .filter(value => value.startsWith(SESSION_COOKIE + '='));
  return matches.length === 1 ? matches[0].slice(SESSION_COOKIE.length + 1) : null;
}

function readQuery(raw) {
  if (typeof raw !== 'string' || raw.length > 12000) return null;
  const query = new URLSearchParams(raw);
  const keys = ['page_key', 'site_name', 'limit', 'offset', 'flat_mode', 'sort_by'];
  if ([...query.keys()].some(key => !keys.includes(key)) || keys.some(key => query.getAll(key).length !== 1)) return null;
  const value = Object.fromEntries(query);
  if (!validPage(value.page_key) || value.site_name !== 'OPDA' || value.flat_mode !== 'true'
    || value.sort_by !== 'date_asc' || !/^(?:[1-9]|[1-4][0-9]|50)$/u.test(value.limit)
    || !/^(?:0|[1-9][0-9]{0,5})$/u.test(value.offset)) return null;
  return value;
}

function readBody(event) {
  if (event.rawQueryString) return null;
  if (typeof event.body !== 'string' || event.body.length > 40000) return null;
  const text = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  if (Buffer.byteLength(text) > 24000) return null;
  let value;
  try { value = JSON.parse(text); } catch { return null; }
  if (!value || Array.isArray(value) || typeof value !== 'object'
    || Object.keys(value).some(key => !['page_key', 'content', 'rid'].includes(key))
    || !validPage(value.page_key) || typeof value.content !== 'string'
    || !value.content.trim() || value.content.length > 5000
    || (value.rid !== undefined && (!Number.isSafeInteger(value.rid) || value.rid < 0))) return null;
  return { page_key: value.page_key, content: value.content.trim(), rid: value.rid ?? 0 };
}

export function safeComment(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1
    || !Number.isSafeInteger(value.rid) || value.rid < 0 || typeof value.content !== 'string'
    || value.content.length > 100000 || typeof value.nick !== 'string' || typeof value.date !== 'string') {
    throw new Error('Invalid comment response');
  }
  return { id: value.id, rid: value.rid, content: value.content, nick: value.nick.slice(0, 256),
    date: value.date.slice(0, 64), is_pending: value.is_pending === true };
}

export function createHandler(overrides = {}) {
  const now = overrides.now ?? (() => Date.now());
  const store = overrides.store ?? createStore({ region: 'eu-west-2',
    participantsTableName: process.env.PARTICIPANTS_TABLE_NAME,
    sessionsTableName: process.env.SESSIONS_TABLE_NAME });
  let comments = overrides.comments;
  return async event => {
    if (event?.rawPath !== PATH) return reply(404, { error: 'Not found.' });
    const method = event.requestContext?.http?.method;
    if (!['GET', 'POST'].includes(method)) return reply(405, { error: 'Use GET or POST.' });
    if (method === 'POST') {
      if (event.headers?.origin !== SITE_ORIGIN
        || (event.headers?.['sec-fetch-site'] && event.headers['sec-fetch-site'] !== 'same-origin')) {
        return reply(403, { error: 'A same-origin request is required.' });
      }
      if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(event.headers?.['content-type'] ?? '')) {
        return reply(415, { error: 'Use application/json.' });
      }
    }
    const input = method === 'GET' ? readQuery(event.rawQueryString) : readBody(event);
    if (!input) return invalid();
    try {
      // Public reading must work even when session storage is unavailable.
      const approved = method === 'POST'
        ? await readApprovedSession(cookie(event), store, now)
        : await readApprovedSession(cookie(event), store, now).catch(() => null);
      if (method === 'POST' && !approved) return reply(401, { error: 'An approved website session is required.' });
      const identity = approved ? { participantId: approved.participant.participantId,
        name: (approved.participant.name?.trim() || 'Participant').slice(0, 256), email: approved.session.email } : null;
      comments ??= (await import('./artalk.mjs')).createArtalkClient();
      if (method === 'POST') return reply(200, { data: safeComment(await comments.create(input, identity)) });
      const data = await comments.list(input);
      if (!Array.isArray(data.comments) || data.comments.length > Number(input.limit)
        || !Number.isSafeInteger(data.count) || data.count < 0) throw new Error('Invalid comment list');
      return reply(200, { data: { comments: data.comments.map(safeComment), count: data.count, viewer: identity ? { name: identity.name } : null } });
    } catch (error) {
      if (error?.statusCode === 429) return reply(429, { error: 'Please wait before posting again.' });
      if (method === 'POST' && [400, 404].includes(error?.statusCode)) return invalid();
      return reply(503, { error: 'Comments are temporarily unavailable.' });
    }
  };
}

export const handler = createHandler();
