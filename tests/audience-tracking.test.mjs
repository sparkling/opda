import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as policy from '../src/lib/audience-tracking.mjs';
import { CONSENT_AGE, readConsent, denied, validAccounts, trackingAllowed,
  createTrackingScheduler } from '../src/lib/audience-tracking.mjs';

test('tracking requires exact production accounts and public routes with safe campaign labels', () => {
  assert.equal(validAccounts({ google: 'G-1234567890', linkedin: '12345', hubspot: '144765514' }), true);
  assert.equal(validAccounts({ google: 'G-1234567890', linkedin: '12/script', hubspot: '1' }), false);
  assert.equal(trackingAllowed('https://opda.org.uk/marketing'), true);
  assert.equal(trackingAllowed('https://opda.org.uk/marketing?utm_source=linkedin#downloads'), true);
  for (const path of ['http://opda.org.uk/', 'https://opda.org.uk.evil.test/', 'https://localhost/',
    'https://opda.org.uk/join', 'https://opda.org.uk/auth/login', 'https://opda.org.uk/?email=a',
    'https://opda.org.uk/resource?path=private', 'https://opda.org.uk/#token=abc',
    'https://opda.org.uk/?utm_campaign=henrik%40example.com']) {
    assert.equal(trackingAllowed(path), false, path);
  }
});

test('missing, malformed, future and expired consent cannot enable tracking', () => {
  const now = CONSENT_AGE + 100;
  const record = { version: 1, savedAt: now, ...denied(), google: true };
  assert.equal(readConsent(JSON.stringify(record), now).google, true);
  for (const raw of [null, 'bad', '{}', JSON.stringify({ ...record, google: 'true' }),
    JSON.stringify({ ...record, savedAt: now + 1 }), JSON.stringify({ ...record, savedAt: 100 })]) {
    assert.equal(readConsent(raw, now), null);
  }
});

function fixture() {
  let visible = true, id = 0;
  const tasks = new Map(), loaded = [];
  const controller = createTrackingScheduler({
    schedule: (fn, delay) => { tasks.set(++id, { fn, delay }); return id; },
    cancel: token => tasks.delete(token), load: key => loaded.push(key), allowed: () => visible,
  });
  return { controller, loaded, tasks, hide: () => { visible = false; },
    flush: () => { for (const [key, task] of [...tasks]) { tasks.delete(key); task.fn(); } } };
}

test('no consent schedules no requests; selected vendors are staggered and installed once', () => {
  const f = fixture();
  f.controller.update(denied()); assert.equal(f.tasks.size, 0);
  f.controller.update({ google: true, linkedin: true, hubspot: false });
  assert.deepEqual([...f.tasks.values()].map(t => t.delay), [0, 750]);
  f.flush(); assert.deepEqual(f.loaded, ['google', 'linkedin']);
  f.controller.update({ google: true, linkedin: true, hubspot: false });
  assert.equal(f.tasks.size, 0);
});

test('revocation, visibility changes and teardown cancel pending work', () => {
  const f = fixture();
  f.controller.update({ google: true, linkedin: true, hubspot: true });
  f.controller.update(denied()); f.flush(); assert.deepEqual(f.loaded, []);
  f.controller.update({ google: true }); f.hide(); f.flush(); assert.deepEqual(f.loaded, []);
  f.controller.pause(); assert.equal(f.controller.pending.size, 0);
});

test('even an already-dispatched callback checks current consent again', () => {
  const f = fixture(); f.controller.update({ google: true });
  const callback = [...f.tasks.values()][0].fn;
  f.controller.update(denied()); callback(); assert.deepEqual(f.loaded, []);
});

function browserFixture(choice = denied()) {
  const listeners = new Map(), timers = new Map(), scripts = [], storage = new Map();
  let sequence = 0, writes = 0, reloads = 0;
  const listen = (name, fn) => listeners.set(name, [...(listeners.get(name) ?? []), fn]);
  const location = { href: 'https://opda.org.uk/marketing', pathname: '/marketing',
    origin: 'https://opda.org.uk', hostname: 'opda.org.uk', reload: () => reloads++, assign: () => reloads++ };
  const document = { readyState: 'loading', hidden: false, title: 'Marketing', referrer: '', cookie: '',
    addEventListener: listen, querySelector: () => null,
    createElement: () => ({ setAttribute() {} }), getElementById: id => scripts.find(s => s.id === id),
    head: { append: script => scripts.push(script) } };
  const window = { addEventListener: listen };
  storage.set(policy.CONSENT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), ...choice }));
  const context = vm.createContext({ ...policy, config: { google: 'G-1234567890', linkedin: '12345',
    hubspot: '144765514', providerSettingsVerified: true }, window, document, location, URL, AbortController,
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => { storage.set(k, v); writes++; } },
    setTimeout: fn => { timers.set(++sequence, fn); return sequence; }, clearTimeout: id => timers.delete(id),
  });
  const source = readFileSync(new URL('../src/scripts/audience-tracking.mjs', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?;\n/, '').replace('export function', 'function');
  vm.runInContext(source + '\ninitialiseAudienceTracking();', context);
  return { context, window, document, scripts, storage, timers, counts: () => ({ writes, reloads }),
    fire: (name, event = {}) => { for (const listener of listeners.get(name) ?? []) listener(event); },
    flush: () => { let n = 0; while (timers.size && n++ < 20) { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); } assert.ok(n < 20); } };
}

test('browser integration does not load vendors before consent or window load', () => {
  const no = browserFixture(); no.fire('load'); no.flush(); assert.equal(no.scripts.length, 0);
  const yes = browserFixture({ google: true, linkedin: true, hubspot: true });
  yes.flush(); assert.equal(yes.scripts.length, 0);
  yes.fire('load'); yes.flush(); assert.equal(yes.scripts.length, 3);
  assert.ok(yes.scripts.every(s => s.async && s.fetchPriority === 'low'));
  yes.fire('astro:page-load'); yes.flush(); assert.equal(yes.scripts.length, 3);
  const events = yes.window.dataLayer.map(args => [...args]).filter(args => args[0] === 'event');
  assert.equal(events.length, 1);
  assert.equal(events[0][2].page_location, 'https://opda.org.uk/marketing');
});

test('cross-tab withdrawal reloads without writing back and causing a storage loop', () => {
  const f = browserFixture({ google: true, linkedin: false, hubspot: false });
  f.fire('load'); f.flush();
  f.storage.set(policy.CONSENT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), ...denied() }));
  f.fire('storage', { key: policy.CONSENT_KEY });
  assert.deepEqual(f.counts(), { writes: 0, reloads: 1 });
  assert.equal(f.window['ga-disable-G-1234567890'], true);
});

test('hidden tabs cancel deferred vendor loads; account navigation leaves the tracked document', () => {
  const f = browserFixture({ google: true, linkedin: true, hubspot: true });
  f.fire('load'); f.document.hidden = true; f.fire('visibilitychange'); f.flush();
  assert.equal(f.scripts.length, 0);
  f.document.hidden = false; f.fire('visibilitychange'); f.flush();
  let prevented = false;
  f.fire('astro:before-preparation', { to: new URL('https://opda.org.uk/join'), preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true); assert.equal(f.counts().reloads, 1);
});
