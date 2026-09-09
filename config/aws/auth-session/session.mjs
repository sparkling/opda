import { approvedParticipant } from './identity.mjs';
import { sessionKey } from './store.mjs';

export const SESSION_COOKIE = '__Host-opda_session';
export const validSessionToken = token => typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/u.test(token);

export async function readApprovedSession(token, store, now = () => Date.now()) {
  if (!validSessionToken(token)) return null;
  const key = sessionKey(token), saved = await store.getSession(key);
  const current = Math.floor(now() / 1000);
  if (!saved || saved.pk !== key || !Number.isSafeInteger(saved.expiresAt) || saved.expiresAt <= current
    || !Number.isSafeInteger(saved.createdAt) || saved.createdAt > current + 60
    || saved.expiresAt > saved.createdAt + 3600 || typeof saved.sub !== 'string'
    || typeof saved.email !== 'string' || typeof saved.participantId !== 'string') return null;
  const participant = await store.getParticipant(saved.sub);
  const checkedAt = Math.floor(now() / 1000);
  if (saved.expiresAt <= checkedAt || !approvedParticipant(participant, saved, checkedAt)
    || participant.enrolmentStatus !== 'complete' || participant.participantId !== saved.participantId
    || participant.accessVersion !== saved.accessVersion
    || (saved.auth0BindingKey !== undefined && saved.auth0BindingKey !== participant.auth0BindingKey)) return null;
  return { participant, session: saved };
}
