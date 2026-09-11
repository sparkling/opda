/** Read current server eligibility; an outage is not a confirmed sign-out. */
export async function readSessionIdentity({ fetch: fetcher = globalThis.fetch, signal } = {}) {
  const response = await fetcher('/_auth/me', {
    credentials: 'same-origin', cache: 'no-store', redirect: 'error',
    headers: { accept: 'application/json' }, signal,
  });
  if (!response.ok) {
    // Error bodies are not identity data. Close the stream explicitly instead
    // of leaving an unread response attached to the page's request lifecycle.
    try { await response.body?.cancel(); } catch { /* Preserve the HTTP outcome. */ }
    if (response.status === 401 || response.status === 403) return null;
    throw new Error('Session status unavailable');
  }
  const identity = await response.json();
  if (!identity || typeof identity.email !== 'string' || !identity.email.trim()
    || identity.email.length > 254 || identity.authenticated === false
    || (identity.name != null && typeof identity.name !== 'string')
    || (identity.picture != null && typeof identity.picture !== 'string')) throw new Error('Session status unavailable');
  return identity;
}

/** One abortable request or one poll timer; stale page/timeout responses are inert. */
export function createSessionWatch({ readIdentity, onIdentity, onUnavailable = () => {},
  isVisible = () => globalThis.document.visibilityState === 'visible',
  setTimer = globalThis.setTimeout, clearTimer = globalThis.clearTimeout,
  intervalMs = 15000, timeoutMs = 8000,
}) {
  let active = false, signedIn = false, lastIdentity;
  let timer, flight;
  function clearPoll() { if (timer !== undefined) clearTimer(timer); timer = undefined; }
  function pause() {
    active = false; clearPoll();
    const old = flight; flight = undefined;
    if (old) { clearTimer(old.timeout); old.controller.abort(); }
  }
  function refresh() {
    if (!active || !isVisible()) return Promise.resolve();
    if (flight) return flight.promise;
    clearPoll();
    const request = { controller: new AbortController(), timeout: undefined, promise: undefined };
    flight = request;
    const current = () => active && flight === request && isVisible();
    const deadline = new Promise((_, reject) => {
      request.timeout = setTimer(() => {
        request.controller.abort(); reject(new Error('Session check timed out'));
      }, timeoutMs);
    });
    request.promise = (async () => {
      try {
        const identity = await Promise.race([readIdentity(request.controller.signal), deadline]);
        if (!current()) return;
        signedIn = Boolean(identity); lastIdentity = identity;
        onIdentity(identity);
      } catch {
        if (current()) onUnavailable(lastIdentity);
      } finally {
        clearTimer(request.timeout);
        if (flight === request) {
          flight = undefined;
          if (active && isVisible() && signedIn) timer = setTimer(() => { void refresh(); }, intervalMs);
        }
      }
    })();
    return request.promise;
  }
  return {
    refresh, pause,
    start() { active = true; return refresh(); },
    stop() { pause(); signedIn = false; lastIdentity = undefined; },
  };
}
