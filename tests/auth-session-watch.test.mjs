import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createSessionWatch, readSessionIdentity } from '../src/scripts/auth-session-watch.mjs';

const identity = { email: 'synthetic@example.test', name: 'Synthetic Member' };
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(read = async () => identity) {
  let clock = 0, nextId = 0, visible = true;
  const timers = new Map(), calls = [], identities = [], unavailable = [];
  const watch = createSessionWatch({
    readIdentity: signal => { calls.push(signal); return read(signal); },
    onIdentity: value => identities.push(value), onUnavailable: value => unavailable.push(value),
    isVisible: () => visible,
    setTimer: (fn, delay) => { const id = ++nextId; timers.set(id, { fn, at: clock + delay }); return id; },
    clearTimer: id => timers.delete(id),
  });
  return { watch, calls, identities, unavailable, timers,
    visible: value => { visible = value; },
    async advance(ms) {
      const target = clock + ms;
      for (;;) {
        const due = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        clock = due[1].at; timers.delete(due[0]); due[1].fn(); await flush();
      }
      clock = target; await flush();
    },
  };
}

test('visible signed-in pages recheck every 15 seconds with one timer', async () => {
  const f = setup(); await f.watch.start();
  assert.deepEqual(f.identities, [identity]); assert.equal(f.timers.size, 1);
  await f.advance(14999); assert.equal(f.calls.length, 1);
  await f.advance(1); assert.equal(f.calls.length, 2); assert.equal(f.timers.size, 1);
  f.watch.stop(); assert.equal(f.timers.size, 0);
});

test('denial clears signed-in state and stops continuous polling of anonymous users', async () => {
  let current = identity;
  const f = setup(async () => current); await f.watch.start(); current = null;
  await f.advance(15000);
  assert.deepEqual(f.identities, [identity, null]); assert.equal(f.timers.size, 0);
  await f.advance(60000); assert.equal(f.calls.length, 2);
  await f.watch.refresh(); assert.equal(f.calls.length, 3); assert.equal(f.timers.size, 0);
});

test('anonymous first loads make one request and explicit stop prevents later checks', async () => {
  const f = setup(async () => null); await f.watch.start();
  await f.advance(60000); assert.equal(f.calls.length, 1); assert.equal(f.timers.size, 0);
  f.watch.stop(); await f.watch.refresh(); assert.equal(f.calls.length, 1);
});

test('hidden tabs pause and recheck once on returning visible', async () => {
  const f = setup(); await f.watch.start(); f.visible(false); f.watch.pause();
  assert.equal(f.timers.size, 0);
  await f.watch.refresh(); await f.advance(60000); assert.equal(f.calls.length, 1);
  f.visible(true); await f.watch.start(); assert.equal(f.calls.length, 2);
  f.watch.stop();
});

test('focus, pageshow and repeated start requests coalesce while a check is in flight', async () => {
  let resolve;
  const f = setup(() => new Promise(done => { resolve = done; }));
  const first = f.watch.start();
  assert.equal(f.watch.refresh(), first); assert.equal(f.watch.start(), first);
  assert.equal(f.calls.length, 1);
  resolve(identity); await first; assert.equal(f.timers.size, 1); f.watch.stop();
});

test('an aborted response from an old Astro page cannot restore identity after a newer denial', async () => {
  let resolve, reads = 0;
  const f = setup(() => ++reads === 1 ? new Promise(done => { resolve = done; }) : Promise.resolve(null));
  const stale = f.watch.start(); f.watch.pause(); assert.equal(f.calls[0].aborted, true);
  await f.watch.start(); resolve(identity); await stale;
  assert.deepEqual(f.identities, [null]); assert.equal(f.timers.size, 0);
});

test('network failures retain the last confirmed view and retry only when signed in', async () => {
  let fail = false;
  const f = setup(async () => { if (fail) throw new Error('offline'); return identity; });
  await f.watch.start(); fail = true; await f.advance(15000);
  assert.deepEqual(f.identities, [identity]); assert.deepEqual(f.unavailable, [identity]);
  assert.equal(f.timers.size, 1); f.watch.stop();
  const unknown = setup(async () => { throw new Error('offline'); }); await unknown.watch.start();
  assert.deepEqual(unknown.identities, []); assert.deepEqual(unknown.unavailable, [undefined]);
  assert.equal(unknown.timers.size, 0);
});

test('one bounded timeout aborts stalled reads and late success cannot overwrite denial', async () => {
  let resolve, reads = 0;
  const f = setup(() => ++reads === 1 ? Promise.resolve(identity)
    : reads === 2 ? new Promise(done => { resolve = done; }) : Promise.resolve(null));
  await f.watch.start(); await f.advance(15000); assert.equal(f.timers.size, 1);
  await f.advance(8000); assert.equal(f.calls[1].aborted, true);
  assert.deepEqual(f.unavailable, [identity]); assert.equal(f.timers.size, 1);
  await f.watch.refresh(); resolve(identity); await flush();
  assert.deepEqual(f.identities, [identity, null]); assert.equal(f.timers.size, 0);
});

test('me fetch is same-origin, uncached, abortable and distinguishes denial from outages', async () => {
  const controller = new AbortController(); let request;
  const found = await readSessionIdentity({ signal: controller.signal, fetch: async (url, options) => {
    request = { url, options }; return { ok: true, status: 200, json: async () => identity };
  } });
  assert.deepEqual(found, identity); assert.equal(request.url, '/_auth/me');
  assert.equal(request.options.credentials, 'same-origin'); assert.equal(request.options.cache, 'no-store');
  assert.equal(request.options.redirect, 'error'); assert.equal(request.options.signal, controller.signal);
  const serverIdentity = { ...identity, authenticated: true, name: null, picture: null };
  assert.deepEqual(await readSessionIdentity({ fetch: async () => ({
    ok: true, status: 200, json: async () => serverIdentity,
  }) }), serverIdentity);
  for (const status of [401, 403]) assert.equal(await readSessionIdentity({ fetch: async () => ({ status }) }), null);
  for (const response of [{ status: 503, ok: false, json: async () => ({ authenticated: false }) },
    { status: 404, ok: false }, { status: 200, ok: true, json: async () => ({}) },
    { status: 200, ok: true, json: async () => ({ ...identity, name: {} }) },
    { status: 200, ok: true, json: async () => ({ ...identity, picture: [] }) }]) {
    await assert.rejects(readSessionIdentity({ fetch: async () => response }), /unavailable/);
  }
});

test('AuthButton clears dropdown, identifying text and legacy cache on denial without navigation', () => {
  const source = readFileSync(new URL('../src/components/AuthButton.astro', import.meta.url), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/u)[1]
    .replace(/import\s*\{[^}]+\}\s*from\s*'[^']+';/u, '').replaceAll('import.meta.env.DEV', 'false');
  class Element extends EventTarget {
    dataset = {}; hidden = true; disabled = false; textContent = ''; style = { backgroundImage: '' }; attributes = {};
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    contains(target) { return target === this; }
  }
  const names = ['auth-login-btn', 'auth-user-menu', 'auth-user-email', 'auth-user-full', 'auth-user-avatar',
    'auth-user-trigger', 'auth-user-dropdown', 'auth-logout-btn'];
  const elements = new Map(names.map(name => [name, new Element()]));
  const root = new Element(), doc = new EventTarget(), win = new EventTarget();
  const removed = []; let options, starts = 0, pauses = 0, refreshes = 0;
  Object.assign(doc, { readyState: 'complete', visibilityState: 'visible',
    getElementById: id => elements.get(id), querySelector: () => root });
  Object.assign(win, { localStorage: { removeItem: key => removed.push(key) },
    location: { pathname: '/programme', search: '', href: 'unchanged' } });
  vm.runInNewContext(script, { document: doc, window: win, readSessionIdentity,
    createSessionWatch: config => { options = config; return { start: () => starts++, refresh: () => refreshes++,
      pause: () => pauses++, stop() {} }; } });
  options.onIdentity({ ...identity, picture: 'https://example.test/avatar.png' });
  elements.get('auth-user-dropdown').hidden = false;
  elements.get('auth-user-trigger').setAttribute('aria-expanded', 'true');
  options.onIdentity(null);
  assert.equal(elements.get('auth-login-btn').hidden, false);
  assert.equal(elements.get('auth-user-menu').hidden, true);
  assert.equal(elements.get('auth-user-dropdown').hidden, true);
  assert.equal(elements.get('auth-user-trigger').attributes['aria-expanded'], 'false');
  for (const id of ['auth-user-email', 'auth-user-full', 'auth-user-avatar']) assert.equal(elements.get(id).textContent, '');
  assert.equal(elements.get('auth-user-avatar').style.backgroundImage, '');
  assert.deepEqual(removed, ['ArtalkUser']); assert.equal(win.location.href, 'unchanged');
  doc.dispatchEvent(new Event('astro:page-load')); assert.equal(starts, 1);
  win.dispatchEvent(new Event('pageshow'));
  assert.equal(starts, 1, 'initial pageshow must not duplicate a settled first-load eligibility check');
  win.dispatchEvent(new Event('focus')); assert.equal(refreshes, 1);
  doc.visibilityState = 'hidden'; doc.dispatchEvent(new Event('visibilitychange')); assert.equal(pauses, 1);
  doc.visibilityState = 'visible'; doc.dispatchEvent(new Event('visibilitychange')); assert.equal(starts, 2);
  win.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true })); assert.equal(starts, 3);
  doc.dispatchEvent(new Event('astro:before-swap')); assert.equal(pauses, 2);
  doc.dispatchEvent(new Event('astro:page-load')); assert.equal(starts, 4);
  options.onUnavailable(identity); assert.equal(elements.get('auth-user-menu').hidden, false);
  assert.equal(root.dataset.authState, 'unavailable');
});
