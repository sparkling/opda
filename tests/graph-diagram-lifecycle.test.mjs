import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createJiti } from 'jiti';
import { createDiagramLifecycle } from '../src/scripts/graph-diagram-lifecycle.mjs';

class ElementStub extends EventTarget {
  constructor() {
    super();
    this.isConnected = true;
    this.dataset = {};
    this.style = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.children = new Map();
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle: (name, enabled = !classes.has(name)) => enabled ? classes.add(name) : classes.delete(name),
    };
  }
  addEventListener(type, handler, options) {
    (this.listeners.get(type) ?? this.listeners.set(type, new Set()).get(type)).add(handler);
    super.addEventListener(type, handler, options);
  }
  removeEventListener(type, handler, options) {
    this.listeners.get(type)?.delete(handler);
    super.removeEventListener(type, handler, options);
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  hasAttribute(name) { return this.attributes.has(name); }
  querySelector(selector) { return this.children.get(selector) ?? null; }
  querySelectorAll(selector) { return this.children.get(selector) ?? []; }
  getBoundingClientRect() { return { top: 0, bottom: 200, width: 400, height: 200, left: 0 }; }
  focus() { this.focusCount = (this.focusCount ?? 0) + 1; }
  closest() { return null; }
  remove() { this.isConnected = false; }
}

function clockHarness() {
  const browser = new ElementStub();
  const timers = new Map(), frames = new Map();
  let nextId = 0;
  browser.setTimeout = callback => { timers.set(++nextId, callback); return nextId; };
  browser.clearTimeout = id => timers.delete(id);
  browser.requestAnimationFrame = callback => { frames.set(++nextId, callback); return nextId; };
  browser.cancelAnimationFrame = id => frames.delete(id);
  browser.innerHeight = 900;
  return { browser, timers, frames };
}

function environment(t) {
  const clock = clockHarness();
  const page = new ElementStub();
  page.documentElement = new ElementStub();
  page.body = new ElementStub();
  const observations = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.connected = false; observations.push(this); }
    observe() { this.connected = true; }
    disconnect() { this.connected = false; }
  }
  const globals = { window: clock.browser, document: page, HTMLElement: ElementStub,
    SVGSVGElement: class extends ElementStub {}, MutationObserver: Observer, IntersectionObserver: Observer };
  const originals = new Map(Object.keys(globals).map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const [name, value] of Object.entries(globals)) Object.defineProperty(globalThis, name, { value, configurable: true });
  t.after(() => { for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
  } });
  return { ...clock, page, observations };
}

const event = (type, properties = {}) => Object.assign(new Event(type, { cancelable: true }), properties);
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const jiti = createJiti(import.meta.url, { moduleCache: false });

test('diagram ownership releases listeners, observers, timers and animation frames once', () => {
  const { browser, timers, frames } = clockHarness();
  const wrapper = new ElementStub();
  const life = createDiagramLifecycle(wrapper, browser);
  let calls = 0, disconnected = 0;
  const staleCallback = life.guard(() => { calls++; });
  life.listen(browser, 'mousemove', () => { calls++; });
  life.observe({ disconnect() { disconnected++; } });
  life.timeout(() => { calls++; }, 900);
  life.frame(() => { calls++; });
  browser.dispatchEvent(new Event('mousemove'));
  assert.equal(calls, 1);
  life.dispose(); life.dispose();
  assert.equal(disconnected, 1);
  assert.equal(timers.size, 0);
  assert.equal(frames.size, 0);
  assert.equal(browser.listeners.get('mousemove').size, 0);
  browser.dispatchEvent(new Event('mousemove'));
  staleCallback();
  assert.equal(calls, 1);
});

test('detachment and completed scheduling cannot leave active callbacks behind', () => {
  const { browser, timers, frames } = clockHarness();
  const wrapper = new ElementStub();
  const life = createDiagramLifecycle(wrapper, browser);
  let calls = 0;
  life.timeout(() => { calls++; }, 1);
  life.frame(() => { calls++; });
  wrapper.isConnected = false;
  for (const callback of timers.values()) callback();
  for (const callback of frames.values()) callback();
  assert.equal(calls, 0);
  life.dispose();
  life.timeout(() => { calls++; }, 1);
  life.frame(() => { calls++; });
  assert.equal(calls, 0);
});

function viewHarness(t) {
  const env = environment(t);
  const wrapper = new ElementStub(), viewport = new ElementStub(), canvas = new ElementStub(), pre = new ElementStub();
  const zoomButton = new ElementStub();
  wrapper.children.set('.gd-ctrl', zoomButton);
  return { ...env, wrapper, viewport, canvas, pre, zoomButton };
}

test('actual view controls work while mounted and release global handlers on disposal', async t => {
  const { createMermaidView } = await jiti.import('../src/scripts/graph-diagram-mermaid.ts');
  const h = viewHarness(t);
  const view = createMermaidView({ ...h, getLightSource: () => 'graph LR\nA --> B' });
  view.initControls(); view.initControls();
  assert.equal(h.browser.listeners.get('mousemove').size, 1);
  h.viewport.dispatchEvent(event('mousedown', { button: 0, clientX: 0, clientY: 0 }));
  h.browser.dispatchEvent(event('mousemove', { clientX: 30, clientY: 40 }));
  assert.match(h.canvas.style.transform, /translate\(30px,40px\)/u);
  h.viewport.dispatchEvent(event('wheel', { ctrlKey: false, metaKey: false }));
  assert.equal(h.timers.size, 1);
  h.browser.dispatchEvent(event('keydown', { ctrlKey: true, metaKey: false }));
  assert.equal(h.wrapper.classList.contains('zoom-active'), true);
  view.dispose();
  assert.equal(h.timers.size, 0);
  assert.ok(h.observations.every(observer => !observer.connected));
  for (const name of ['mousemove', 'mouseup', 'keydown', 'keyup', 'blur']) assert.equal(h.browser.listeners.get(name).size, 0, name);
  const transform = h.canvas.style.transform;
  h.browser.dispatchEvent(event('mousemove', { clientX: 300, clientY: 400 }));
  assert.equal(h.canvas.style.transform, transform);
  assert.equal(h.wrapper.classList.contains('zoom-active'), false);
});

test('disposing before the renderer module resolves never starts Mermaid rendering', async t => {
  const { createMermaidView } = await jiti.import('../src/scripts/graph-diagram-mermaid.ts');
  const h = viewHarness(t), loader = deferred();
  let renders = 0;
  const view = createMermaidView({ ...h, getLightSource: () => 'graph LR\nA --> B', loadMermaid: () => loader.promise });
  view.render(); view.dispose();
  loader.resolve({ initialize() {}, render() { renders++; return Promise.resolve({ svg: '<svg />' }); } });
  await flush();
  assert.equal(renders, 0);
  assert.equal(h.pre.innerHTML, undefined);
});

for (const teardown of ['dispose', 'disconnect']) test(`late Mermaid completion cannot replace content after ${teardown}`, async t => {
  const { createMermaidView } = await jiti.import('../src/scripts/graph-diagram-mermaid.ts');
  const h = viewHarness(t), output = deferred();
  const view = createMermaidView({ ...h, getLightSource: () => 'graph LR\nA --> B',
    loadMermaid: async () => ({ initialize() {}, render: () => output.promise }) });
  view.render(); await flush();
  if (teardown === 'dispose') view.dispose(); else h.wrapper.isConnected = false;
  output.resolve({ svg: '<svg>stale</svg>' });
  await flush();
  assert.equal(h.pre.innerHTML, undefined);
  assert.equal(view.rendered, false);
  view.dispose();
});

test('queued theme notifications do not restart a disposed renderer', async t => {
  const { createMermaidView } = await jiti.import('../src/scripts/graph-diagram-mermaid.ts');
  const h = viewHarness(t);
  let renders = 0;
  const view = createMermaidView({ ...h, getLightSource: () => 'graph LR\nA --> B',
    loadMermaid: async () => ({ initialize() {}, render() { renders++; return Promise.resolve({ svg: '<svg />' }); } }) });
  view.initControls(); view.render(); await flush();
  assert.equal(view.rendered, true);
  assert.equal(renders, 1);
  view.dispose();
  h.page.documentElement.setAttribute('data-theme', 'dark');
  for (const observer of h.observations) observer.callback();
  view.render(); await flush();
  assert.equal(renders, 1);
});

test('actual graph teardown restores fullscreen overflow and cancels focus and delayed fonts', async t => {
  const h = environment(t), fonts = deferred();
  const wrapper = new ElementStub(), viewport = new ElementStub(), canvas = new ElementStub(), pre = new ElementStub();
  const caption = new ElementStub(), button = new ElementStub(), returnFocus = new ElementStub();
  caption.id = 'caption';
  caption.children.set('.gd-figure-number', new ElementStub());
  caption.children.set('.gd-keyboard-hint', new ElementStub());
  wrapper.children.set('.gd-config', { textContent: JSON.stringify({ source: 'graph LR\nA --> B' }) });
  wrapper.children.set('.diagram-viewport', viewport);
  wrapper.children.set('.diagram-canvas', canvas);
  wrapper.children.set('.gd-mermaid', pre);
  wrapper.children.set('.gd-caption', caption);
  wrapper.children.set('[data-diagram-action="fullscreen"]', [button]);
  h.page.children.set('.graph-diagram-wrapper', [wrapper]);
  h.page.fonts = { ready: fonts.promise };
  h.page.activeElement = returnFocus;
  h.page.body.style.overflow = 'auto';
  const graph = await jiti.import('../src/scripts/graph-diagram.ts');
  t.after(() => graph.disposeGraphDiagrams());
  graph.mountGraphDiagrams();
  assert.equal(wrapper._gdMounted, true);
  button.dispatchEvent(new Event('click'));
  assert.equal(h.page.body.style.overflow, 'hidden');
  assert.equal(h.frames.size, 1);
  h.page.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(h.page.body.style.overflow, 'auto');
  assert.equal(wrapper.classList.contains('diagram-fullscreen'), false);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(h.frames.size, 0);
  assert.equal(returnFocus.focusCount, undefined);
  assert.equal(h.browser.listeners.get('mousemove').size, 0);
  assert.equal(h.page.listeners.get('keydown').size, 0);
  fonts.resolve(); await flush();
  assert.equal(pre.innerHTML, undefined);
  h.page.fonts = { ready: new Promise(() => {}) };
  h.browser.dispatchEvent(event('pageshow', { persisted: true }));
  assert.equal(wrapper._gdMounted, true);
  assert.equal(h.browser.listeners.get('mousemove').size, 1);
  wrapper.isConnected = false;
  h.page.children.set('.graph-diagram-wrapper', []);
  graph.mountGraphDiagrams();
  assert.equal(wrapper._gdMounted, false);
  assert.equal(h.browser.listeners.get('mousemove').size, 0);
  wrapper.isConnected = true;
  h.page.children.set('.graph-diagram-wrapper', [wrapper]);
  graph.mountGraphDiagrams();
  h.browser.dispatchEvent(new Event('pagehide'));
  assert.equal(wrapper._gdMounted, false);
  assert.equal(h.browser.listeners.get('mousemove').size, 0);
});

test('graph mounting disposes outgoing wrappers and guards font and fullscreen work', () => {
  const source = readFileSync(new URL('../src/scripts/graph-diagram.ts', import.meta.url), 'utf8');
  assert.match(source, /astro:before-swap/u);
  assert.match(source, /pagehide/u);
  assert.match(source, /pageshow/u);
  assert.match(source, /mermaidView\?\.dispose\(\)/u);
  assert.match(source, /fontsReady\.then\(render, render\)/u);
  assert.match(source, /const render = life\.guard/u);
  assert.match(source, /life\.frame/u);
  assert.doesNotMatch(source, /requestAnimationFrame\(/u);
});
