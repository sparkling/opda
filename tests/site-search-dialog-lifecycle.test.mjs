import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/components/SiteSearchDialog.astro', import.meta.url), 'utf8');
const script = stripTypeScriptTypes(source.match(/<script>([\s\S]*?)<\/script>/u)[1]
  .replace("import('@/lib/site-search.mjs')", 'loadSearchModule()'));
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const record = (title = 'Example') => ({ title, url: '/example/' + title.toLowerCase(), type: 'page' });

class ElementStub extends EventTarget {
  constructor(tag = 'div') {
    super();
    Object.assign(this, { tagName: tag.toUpperCase(), dataset: {}, children: [], queries: new Map(),
      listeners: new Map(), attributes: new Map(), isConnected: true, value: '', textContent: '', open: false, focusCount: 0 });
  }
  addEventListener(type, callback, options) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Map());
    this.listeners.get(type).set(callback, options);
    super.addEventListener(type, callback, options);
  }
  removeEventListener(type, callback, options) {
    this.listeners.get(type)?.delete(callback); super.removeEventListener(type, callback, options);
  }
  count(type) { return [...(this.listeners.get(type)?.values() ?? [])].filter(options => !options?.signal?.aborted).length; }
  fire(type, values = {}) { return this.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), values)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  toggleAttribute(name, enabled) { if (enabled) this.setAttribute(name, ''); else this.removeAttribute(name); }
  append(...nodes) { for (const node of nodes) this.children.push(...(node.fragment ? node.children : [node])); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  querySelectorAll(selector) {
    if (this.queries.has(selector)) return this.queries.get(selector);
    return this.children.flatMap(child => [child, ...child.querySelectorAll('*')])
      .filter(child => selector === '*' || (selector === '[role="option"]' && child.getAttribute('role') === 'option'));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  closest(selector) { return selector === 'a' && this.tagName === 'A' ? this : null; }
  focus() { this.focusCount++; }
  scrollIntoView() {}
  showModal() {
    assert.equal(this.isConnected, true, 'detached dialogs must never be opened');
    this.open = true; this.showCount = (this.showCount ?? 0) + 1;
  }
  close() { if (this.open) { this.open = false; this.fire('close'); } }
}

function pageFixture() {
  const dialog = new ElementStub('dialog'), trigger = new ElementStub('a');
  dialog.id = 'site-search-dialog';
  const form = new ElementStub('form'), input = new ElementStub('input'), results = new ElementStub('ol');
  const status = new ElementStub(), empty = new ElementStub(), full = new ElementStub('a');
  const pageSearch = new ElementStub('input');
  for (const [selector, element] of [['[data-site-search-dialog-form]', form], ['[data-site-search-input]', input],
    ['[data-site-search-results]', results], ['[data-site-search-status]', status], ['[data-site-search-empty]', empty],
    ['[data-site-search-full]', full]]) dialog.queries.set(selector, [element]);
  return { dialog, trigger, form, input, results, status, empty, full, pageSearch };
}

function setup({ loadModule, searchSite = async () => [record()] } = {}) {
  const document = new ElementStub(), window = new ElementStub(), imports = [], searches = [], destinations = [];
  const state = { page: pageFixture() };
  const module = { describeRecord: () => ({ eyebrow: 'Page' }), searchSite: query => { searches.push(query); return searchSite(query); } };
  document.querySelector = selector => ({ '[data-site-search-dialog]': state.page.dialog, '#site-search': state.page.pageSearch })[selector] ?? null;
  document.querySelectorAll = selector => selector === '[data-site-search-trigger]' ? [state.page.trigger] : [];
  document.createElement = tag => new ElementStub(tag);
  document.createDocumentFragment = () => Object.assign(new ElementStub(), { fragment: true });
  window.location = { origin: 'https://opda.test', pathname: '/example', assign: url => destinations.push(url) };
  window.open = url => destinations.push(url);
  vm.runInNewContext(script, {
    document, window, URL, AbortController, HTMLElement: ElementStub, Element: ElementStub,
    HTMLDialogElement: ElementStub, HTMLFormElement: ElementStub, HTMLInputElement: ElementStub,
    HTMLOListElement: ElementStub, HTMLAnchorElement: ElementStub,
    loadSearchModule: () => { imports.push('import'); return loadModule ? loadModule(module, imports.length) : Promise.resolve(module); },
  });
  function navigate() {
    document.fire('astro:before-swap');
    for (const node of Object.values(state.page)) node.isConnected = false;
    state.page = pageFixture(); document.fire('astro:page-load'); return state.page;
  }
  function enter(query) { state.page.input.value = query; state.page.input.fire('input'); }
  return { document, window, state, imports, searches, destinations, navigate, enter };
}

test('initialisation is lazy and idempotent, while live dialog ranking, result limits and keyboard navigation work', async () => {
  const h = setup({ searchSite: async () => Array.from({ length: 15 }, (_, i) => record('Result' + i)) });
  h.document.fire('astro:page-load'); assert.equal(h.imports.length, 0); assert.equal(h.document.count('keydown'), 1);
  h.state.page.trigger.fire('pointerenter'); h.state.page.trigger.fire('focus'); await tick();
  assert.equal(h.imports.length, 1); assert.equal(h.searches.length, 0);
  h.document.fire('keydown', { key: '/' }); assert.equal(h.state.page.dialog.open, true);
  h.enter('example'); await tick();
  const p = h.state.page;
  assert.equal(p.results.children.length, 12); assert.equal(p.full.textContent, 'See all 15 results');
  assert.equal(p.input.getAttribute('aria-expanded'), 'true');
  p.input.fire('keydown', { key: 'ArrowDown' });
  assert.equal(p.input.getAttribute('aria-activedescendant'), 'site-search-dialog-result-0');
  p.form.fire('submit'); assert.deepEqual(h.destinations, ['/example/result0']); assert.equal(p.dialog.open, false);
});

test('navigation disposes the old global hotkey and element listeners without stealing focus', async () => {
  const h = setup(), first = h.state.page;
  const staleHotkey = [...h.document.listeners.get('keydown').keys()][0];
  first.trigger.fire('click'); await tick();
  const next = h.navigate(); await tick();
  assert.equal(h.document.count('keydown'), 1); assert.equal(first.trigger.count('click'), 0);
  assert.equal(first.dialog.open, false); assert.equal(first.trigger.focusCount, 0);
  h.window.location.pathname = '/search';
  staleHotkey({ key: '/', target: h.document, preventDefault() {} });
  assert.equal(next.pageSearch.focusCount, 0, 'a retired hotkey must not target the new page');
  h.document.fire('keydown', { key: '/' }); assert.equal(next.pageSearch.focusCount, 1);
  for (let i = 0; i < 5; i++) h.navigate();
  assert.equal(h.document.count('keydown'), 1);
});

test('pagehide retires listeners and BFCache pageshow restores exactly one working dialog', async () => {
  const h = setup(), p = h.state.page;
  h.window.fire('pagehide', { persisted: true }); assert.equal(h.document.count('keydown'), 0);
  h.window.fire('pageshow', { persisted: true });
  assert.equal(h.document.count('keydown'), 1); assert.equal(p.trigger.count('click'), 1);
  h.document.fire('keydown', { key: 'k', ctrlKey: true }); assert.equal(p.dialog.open, true);
  h.document.fire('astro:page-load'); assert.equal(h.document.count('keydown'), 1);
});

test('a delayed import from an outgoing page cannot start a search after navigation', async () => {
  const importResult = deferred(); let loaded;
  const h = setup({ loadModule: module => { loaded = module; return importResult.promise; } });
  h.state.page.trigger.fire('click'); h.enter('old page'); await tick();
  h.navigate(); importResult.resolve(loaded); await tick();
  assert.deepEqual(h.searches, []);
});

test('late query results or errors cannot overwrite newer results or a cleared query', async () => {
  const pending = new Map();
  const h = setup({ searchSite: query => { const task = deferred(); pending.set(query, task); return task.promise; } });
  h.state.page.trigger.fire('click'); h.enter('old'); await tick();
  h.enter('new'); await tick(); pending.get('new').resolve([record('New')]); await tick();
  const p = h.state.page, newest = p.results.children[0];
  pending.get('old').resolve([record('Old')]); await tick(); assert.equal(p.results.children[0], newest);
  h.enter('failure'); await tick(); h.enter('current'); await tick();
  pending.get('current').resolve([record('Current')]); await tick();
  pending.get('failure').reject(new Error('stale failure')); await tick(); assert.equal(p.results.children.length, 1);
  assert.doesNotMatch(p.status.textContent, /couldn't load/u);
  h.enter('clear me'); await tick(); h.enter(''); pending.get('clear me').resolve([record('Late')]); await tick();
  assert.equal(p.results.children.length, 0); assert.equal(p.status.textContent, 'Start typing to search.');
});

test('closing, reopening with the same query and navigation all invalidate pending results', async () => {
  const pending = [];
  const h = setup({ searchSite: () => { const task = deferred(); pending.push(task); return task.promise; } });
  h.state.page.trigger.fire('click'); h.enter('same'); await tick();
  const p = h.state.page; p.dialog.close(); pending[0].resolve([record('Closed')]); await tick();
  assert.equal(p.results.children.length, 0);
  p.trigger.fire('click'); await tick(); p.dialog.close(); p.trigger.fire('click'); await tick();
  pending[2].resolve([record('Newest')]); await tick(); const newest = p.results.children[0];
  pending[1].resolve([record('Older')]); await tick(); assert.equal(p.results.children[0], newest);
  h.enter('outgoing'); await tick(); h.navigate(); pending[3].resolve([record('Gone')]); await tick();
  assert.equal(p.results.children[0], newest);
});

test('failed speculative imports are handled and a deliberate search can retry loading', async () => {
  const h = setup({ loadModule: (module, attempt) => attempt === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(module) });
  h.state.page.trigger.fire('pointerenter'); await tick();
  h.state.page.trigger.fire('click'); h.enter('retry'); await tick();
  assert.equal(h.imports.length, 2); assert.equal(h.state.page.results.children.length, 1);
});

test('a queued close event cannot invalidate a newly reopened dialog search or steal its focus', async () => {
  const pending = deferred(), h = setup({ searchSite: () => pending.promise });
  const p = h.state.page, delayedClose = [...p.dialog.listeners.get('close').keys()][0];
  p.trigger.fire('click'); h.enter('newly opened'); await tick();
  const focusCount = p.trigger.focusCount;
  delayedClose();
  pending.resolve([record('Current')]); await tick();
  assert.equal(p.trigger.focusCount, focusCount);
  assert.equal(p.results.children.length, 1);
});
