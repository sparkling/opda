import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/ui/client.js', import.meta.url), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const event = (type, values = {}) => Object.assign(new Event(type, { cancelable: true }), values);
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

class ElementStub extends EventTarget {
  constructor(tagName = 'div') {
    super();
    Object.assign(this, { tagName: tagName.toUpperCase(), nodeType: 1, dataset: {}, attributes: new Map(),
      childNodes: [], queries: new Map(), listeners: new Map(), textContent: '', className: '', value: '', open: false });
    const classes = () => new Set(this.className.split(/\s+/u).filter(Boolean));
    this.classList = {
      contains: name => classes().has(name),
      add: (...names) => { this.className = [...new Set([...classes(), ...names])].join(' '); },
      remove: (...names) => { this.className = [...classes()].filter(name => !names.includes(name)).join(' '); },
      toggle: (name, enabled = !classes().has(name)) => { this.classList[enabled ? 'add' : 'remove'](name); return enabled; },
    };
    this.style = { values: new Map(), setProperty: (key, value) => this.style.values.set(key, value) };
  }
  get children() { return this.childNodes.filter(node => node.nodeType === 1); }
  get firstChild() { return this.childNodes[0] ?? null; }
  get isConnected() { return this.connected ?? this.parentElement?.isConnected ?? false; }
  addEventListener(type, callback, options) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
    super.addEventListener(type, callback, options);
  }
  removeEventListener(type, callback, options) {
    this.listeners.get(type)?.delete(callback);
    super.removeEventListener(type, callback, options);
  }
  count(type) { return this.listeners.get(type)?.size ?? 0; }
  fire(type, values) { this.dispatchEvent(event(type, values)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  appendChild(child) { child.remove?.(); this.childNodes.push(child); child.parentElement = this; return child; }
  insertBefore(child, before) {
    child.remove?.();
    const index = this.childNodes.indexOf(before);
    this.childNodes.splice(index < 0 ? this.childNodes.length : index, 0, child); child.parentElement = this;
  }
  remove() {
    if (this.parentElement) this.parentElement.childNodes = this.parentElement.childNodes.filter(node => node !== this);
    this.parentElement = null;
  }
  replaceWith(other) { this.parentElement.insertBefore(other, this); this.remove(); }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  matches(selector) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    const match = selector.match(/^([a-z]+)?(?:\[([^\]]+)\])?$/u);
    if (!match) return false;
    const [, tag, attr] = match;
    const datasetKey = attr?.replace(/^data-/u, '').replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase());
    return (!tag || this.tagName === tag.toUpperCase())
      && (!attr || this.attributes.has(attr) || (attr.startsWith('data-') && datasetKey in this.dataset));
  }
  querySelectorAll(selector) {
    if (this.queries.has(selector)) return this.queries.get(selector);
    if (selector.startsWith(':scope > ')) return this.children.filter(child => child.matches(selector.slice(9)));
    return this.children.flatMap(child => [child, ...child.querySelectorAll('*')])
      .filter(child => selector === '*' || selector.split(', ').some(part => child.matches(part)));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null; }
  focus() { this.focusCount = (this.focusCount ?? 0) + 1; }
  getBoundingClientRect() { return { height: this.height ?? 90 }; }
}

function pageFixture({ config = false, loader = false } = {}) {
  const root = new ElementStub(), body = new ElementStub(), header = new ElementStub();
  root.connected = true; body.className = 'app-body'; header.className = 'app-header';
  const identity = new ElementStub(), theme = new ElementStub('button'), menu = new ElementStub('button');
  const nav = new ElementStub(), navToggle = new ElementStub('button'), sidebar = new ElementStub('aside');
  const collapse = new ElementStub('button'), section = new ElementStub(), skip = new ElementStub('a');
  const article = new ElementStub('article'), heading = new ElementStub('h2');
  identity.id = 'app-header-identity'; theme.className = 'theme-toggle'; article.className = 'prose';
  heading.id = 'example'; heading.childNodes.push({ nodeType: 3, textContent: 'Example' });
  header.appendChild(identity); header.appendChild(theme); header.appendChild(nav); header.appendChild(navToggle);
  header.appendChild(menu); sidebar.appendChild(collapse); sidebar.appendChild(section);
  article.appendChild(heading); body.appendChild(sidebar); body.appendChild(article);
  root.appendChild(header); root.appendChild(body); root.appendChild(skip);
  article.queries.set('h2[id], h3[id], h4[id]', [heading]);
  const ids = new Map([
    ['app-header-identity', identity], ['global-nav-panel', nav], ['global-nav-toggle', navToggle],
    ['app-sidebar', sidebar], ['menu-toggle', menu], ['sidebar-collapse', collapse], ['section-navigation', section],
  ]);
  const queries = new Map([
    ['.theme-toggle', [theme]], ['.app-header', [header]], ['.app-body', [body]], ['.skip-link', [skip]],
    ['.prose', [article]], ['.prose h2[id], .prose h3[id]', [heading]],
  ]);
  const controls = new ElementStub(), selector = new ElementStub('details'), summary = new ElementStub('summary');
  const input = new ElementStub('input'), option = new ElementStub('label'), placeholder = new ElementStub();
  controls.dataset.headerPreviewControls = ''; selector.className = 'header-preview-selector';
  input.value = 'petrol'; input.defaultChecked = true; input.dataset.paletteName = 'Petrol';
  input.dataset.headerPaletteInput = ''; option.dataset.headerPaletteOption = '';
  selector.appendChild(summary); option.appendChild(input); selector.appendChild(option); controls.appendChild(selector);
  if (config && !loader) {
    root.appendChild(controls);
    queries.set('[data-header-preview-controls]', [controls]);
    queries.set('[data-header-palette-selector]', [selector]);
    queries.set('[data-header-palette-input]', [input]);
  }
  if (loader) {
    placeholder.setAttribute('data-controls-src', '/design/header-preview-controls'); root.appendChild(placeholder);
    queries.set('[data-header-preview-controls-loader]', [placeholder]);
  }
  return { root, body, header, identity, theme, menu, nav, navToggle, sidebar, collapse, section, article, heading,
    controls, selector, option, placeholder, ids, queries };
}

function setup({ readyState = 'complete', config = false, loader = false } = {}) {
  const document = new ElementStub(), window = new ElementStub();
  const frames = new Map(), media = [], observers = [], requests = [], storage = new Map(), warnings = [];
  const state = { page: pageFixture({ config, loader }), heldFetch: deferred(), parsed: 0 };
  document.documentElement = new ElementStub('html'); document.documentElement.setAttribute('data-theme', 'light');
  document.readyState = readyState;
  document.querySelectorAll = selector => state.page.queries.get(selector) ?? [];
  document.querySelector = selector => document.querySelectorAll(selector)[0] ?? null;
  document.getElementById = id => state.page.ids.get(id) ?? null;
  document.contains = node => state.page.root.contains(node);
  document.createElement = tag => new ElementStub(tag);
  document.createRange = () => ({ createContextualFragment() {
    state.parsed++;
    return { querySelector: () => state.page.controls };
  } });
  let nextId = 0;
  window.location = { href: `https://opda.test/example${config ? '?config' : ''}` };
  window.OPDA = { adoptBareMermaid: () => {} };
  const originalBridge = window.OPDA.adoptBareMermaid;
  window.requestAnimationFrame = callback => { frames.set(++nextId, callback); return nextId; };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.matchMedia = query => {
    const target = new ElementStub(); target.media = query;
    target.matches = query !== '(max-width: 960px)'; media.push(target); return target;
  };
  class Observer {
    constructor(callback) { this.callback = callback; this.connected = false; observers.push(this); }
    observe(target) { this.connected = true; this.target = target; }
    disconnect() { this.connected = false; }
  }
  window.ResizeObserver = Observer; window.IntersectionObserver = Observer;
  vm.runInNewContext(source, {
    document, window, URL, AbortController, ResizeObserver: Observer, IntersectionObserver: Observer,
    Element: ElementStub, Node: ElementStub, HTMLInputElement: ElementStub,
    requestAnimationFrame: window.requestAnimationFrame, cancelAnimationFrame: window.cancelAnimationFrame,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    console: { warn: (...args) => warnings.push(args) },
    fetch: (url, options) => { requests.push({ url, options }); return state.heldFetch.promise; },
  });
  function beforeSwap() {
    const nextHtml = new ElementStub();
    document.fire('astro:before-swap', { newDocument: { documentElement: nextHtml } });
    return nextHtml;
  }
  function navigate(options = {}) {
    beforeSwap(); state.page.root.connected = false;
    state.page = pageFixture(options); document.fire('astro:after-swap'); document.fire('astro:page-load');
    return state.page;
  }
  return { document, window, state, frames, media, observers, requests, storage, warnings, originalBridge, beforeSwap, navigate };
}

test('first-load lifecycle events initialise once and current theme, navigation and TOC controls work', async () => {
  const h = setup({ readyState: 'loading' });
  assert.equal(h.media.length, 0);
  h.document.fire('DOMContentLoaded'); h.document.fire('astro:page-load'); h.window.fire('pageshow');
  await tick();
  const p = h.state.page;
  assert.equal(p.body.querySelectorAll('.toc').length, 1);
  assert.equal(p.theme.count('click'), 1);
  p.theme.fire('click'); assert.equal(h.document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(h.storage.get('opda-theme'), 'dark');
  p.navToggle.fire('click'); assert.equal(p.header.classList.contains('primary-nav-open'), true);
  p.collapse.fire('click'); assert.equal(p.body.classList.contains('sidebar-collapsed'), true);
  const toc = p.body.querySelector('.toc'); toc.children[0].fire('click');
  assert.equal(p.body.classList.contains('toc-collapsed'), true);
  const observer = h.observers.find(item => item.target === p.heading);
  observer.callback([{ isIntersecting: true, target: p.heading, boundingClientRect: { top: 10 } }]);
  assert.equal(toc.querySelector('a[data-toc-target]').getAttribute('aria-current'), 'location');
});

test('every swap retires old listeners and observers, including queued callbacks that target the live document', async () => {
  const h = setup({ config: true }); await tick();
  const first = h.state.page, oldObservers = [...h.observers], oldMedia = [...h.media];
  const staleTheme = [...first.theme.listeners.get('click')][0];
  const staleResize = [...oldMedia.find(item => item.media === '(max-width: 960px)').listeners.get('change')][0];
  assert.equal(h.document.count('pointerdown'), 1);
  const nextHtml = h.beforeSwap();
  assert.equal(nextHtml.getAttribute('data-theme'), 'light');
  assert.ok(oldMedia.every(item => item.count('change') === 0));
  assert.ok(oldObservers.every(item => !item.connected));
  assert.equal(h.document.count('pointerdown'), 0);
  assert.equal(first.theme.count('click'), 0);
  h.state.page.root.connected = false; h.state.page = pageFixture();
  h.document.fire('astro:after-swap'); h.document.fire('astro:page-load'); await tick();
  h.state.page.header.inert = true;
  staleTheme(); staleResize();
  assert.equal(h.document.documentElement.getAttribute('data-theme'), 'light');
  assert.equal(h.state.page.header.inert, true, 'an outgoing drawer callback cannot unlock the new header');
  const height = first.header.style.values.get('--header-height'); first.identity.height = 200;
  oldObservers.find(item => item.target === first.identity).callback();
  assert.equal(first.header.style.values.get('--header-height'), height);
  for (let i = 0; i < 4; i++) { h.navigate(); await tick(); }
  assert.equal(h.media.filter(item => item.count('change')).length, 4);
  assert.equal(h.observers.filter(item => item.connected).length, 2);
  assert.equal(h.state.page.body.querySelectorAll('.toc').length, 1);
});

test('pagehide cancels preview frames and BFCache re-entry rebinds the same DOM exactly once', async () => {
  const h = setup({ config: true }); await tick();
  const p = h.state.page;
  // Call the real listener with a clicked option so no DOM event bubbling shim is required.
  const click = [...p.selector.listeners.get('click')][0]; click({ target: p.option });
  assert.equal(h.frames.size, 1);
  const staleFrame = [...h.frames.values()][0];
  h.window.fire('pagehide', { persisted: true });
  assert.equal(h.frames.size, 0);
  assert.equal(h.media.filter(item => item.count('change')).length, 0);
  assert.ok(h.observers.every(item => !item.connected));
  p.selector.open = true; staleFrame(); assert.equal(p.selector.open, true);
  h.window.fire('pageshow', { persisted: true }); await tick();
  assert.equal(p.body.querySelectorAll('.toc').length, 1);
  assert.equal(p.theme.count('click'), 1); assert.equal(h.document.count('pointerdown'), 1);
  h.document.fire('astro:page-load'); await tick();
  assert.equal(p.body.querySelectorAll('.toc').length, 1); assert.equal(p.theme.count('click'), 1);
  p.theme.fire('click'); assert.equal(h.document.documentElement.getAttribute('data-theme'), 'dark');
  p.collapse.fire('click'); assert.equal(p.body.classList.contains('sidebar-collapsed'), true);
});

test('navigation aborts pending preview requests and late completion cannot initialise the replacement DOM', async () => {
  const h = setup({ config: true, loader: true }); await tick();
  assert.equal(h.requests.length, 1);
  const first = h.state.page;
  h.navigate(); await tick();
  assert.equal(h.requests[0].options.signal?.aborted, true);
  h.state.heldFetch.resolve({ ok: true, text: async () => '<div data-header-preview-controls></div>' }); await tick();
  assert.equal(h.state.parsed, 0);
  assert.equal(h.state.page.body.querySelectorAll('.toc').length, 1);
  assert.equal(h.state.page.navToggle.count('click'), 1);
  assert.equal(first.theme.count('click'), 0);
  assert.equal(h.warnings.length, 0);
});

test('navigation during preview response-body decoding invalidates the old continuation', async () => {
  const h = setup({ config: true, loader: true }), body = deferred(); await tick();
  h.state.heldFetch.resolve({ ok: true, text: () => body.promise }); await tick();
  h.navigate(); await tick();
  body.resolve('<div data-header-preview-controls></div>'); await tick();
  assert.equal(h.state.parsed, 0);
  assert.equal(h.state.page.body.querySelectorAll('.toc').length, 1);
  assert.equal(h.state.page.navToggle.count('click'), 1);
});

test('public init is idempotent and preserves the optional diagram bridge regardless of script order', async () => {
  const h = setup(); await tick();
  assert.equal(h.window.OPDA.adoptBareMermaid, h.originalBridge);
  await h.window.OPDA.init(); await h.window.OPDA.init();
  assert.equal(h.state.page.body.querySelectorAll('.toc').length, 1);
  assert.equal(h.state.page.navToggle.count('click'), 1);
});
