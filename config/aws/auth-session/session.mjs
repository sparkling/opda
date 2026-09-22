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
    || participant.accessVersion !== saved.accessVersion) return null;
  if (saved.auth0BindingKey !== undefined && saved.auth0BindingKey !== participant.auth0BindingKey) {
    if (!/^IDENTITY#[a-f0-9]{64}$/u.test(saved.auth0BindingKey) || !store.getIdentityBinding) return null;
    const binding = await store.getIdentityBinding(saved.auth0BindingKey);
    if (!binding || binding.pk !== saved.auth0BindingKey || binding.sub !== saved.sub
      || binding.participantId !== saved.participantId || binding.email !== saved.email) return null;
  }
  return { participant, session: saved };
}
