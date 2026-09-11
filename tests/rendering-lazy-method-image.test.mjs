import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { initialiseLazyMethodImage } from '../src/scripts/lazy-method-image.mjs';

function fixture({ wide = true, forcedColours = false, intersection = true } = {}) {
  const listeners = new Map();
  const sources = [];
  const image = {
    dataset: { lightSrc: '/light.avif', darkSrc: '/dark.avif' },
    getAttribute: () => sources.at(-1),
    set src(value) { sources.push(value); },
  };
  const root = { dataset: { theme: 'light' } };
  const document = {
    documentElement: root,
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  const media = new Map();
  let intersect;
  let mutation;
  let stoppedIntersection = false;
  let stoppedMutation = false;
  const environment = {
    document,
    matchMedia(query) {
      const target = {
        matches: query.includes('min-width') ? wide : forcedColours,
        addEventListener: (_name, handler) => { target.handler = handler; },
        removeEventListener: () => { delete target.handler; },
      };
      media.set(query, target);
      return target;
    },
    MutationObserver: class {
      constructor(callback) { mutation = callback; }
      observe() {}
      disconnect() { stoppedMutation = true; }
    },
    ...(intersection ? { IntersectionObserver: class {
      constructor(callback, options) {
        assert.equal(options.rootMargin, '300px 0px');
        intersect = callback;
      }
      observe() {}
      disconnect() { stoppedIntersection = true; }
    } } : {}),
  };
  const wrapper = { querySelector: () => image };
  const cleanup = initialiseLazyMethodImage(wrapper, environment);
  return {
    image, sources, root, media, cleanup, listeners,
    intersect: (visible) => intersect([{ isIntersecting: visible }]),
    mutate: () => mutation(),
    stopped: () => stoppedIntersection && stoppedMutation,
  };
}

test('method artwork does not acquire a real source until it approaches the viewport', () => {
  const state = fixture();
  assert.deepEqual(state.sources, []);
  state.mutate();
  assert.deepEqual(state.sources, [], 'an offscreen theme notification must not start a download');
  state.root.dataset.theme = 'dark';
  state.intersect(true);
  assert.deepEqual(state.sources, ['/dark.avif'], 'choose the current theme, not both themes');
  state.intersect(true);
  assert.deepEqual(state.sources, ['/dark.avif'], 'repeated observations must not repeat the assignment');
});

test('offscreen theme changes wait until the next approach and retain displayed geometry', () => {
  const state = fixture();
  state.intersect(true);
  state.intersect(false);
  state.root.dataset.theme = 'dark';
  state.mutate();
  assert.deepEqual(state.sources, ['/light.avif']);
  state.intersect(true);
  assert.deepEqual(state.sources, ['/light.avif', '/dark.avif']);
});

test('narrow and forced-colour layouts use the text version without downloading artwork', () => {
  for (const settings of [{ wide: false }, { forcedColours: true }]) {
    const state = fixture(settings);
    state.intersect(true);
    state.mutate();
    assert.deepEqual(state.sources, []);
  }
});

test('native lazy loading remains the fallback when IntersectionObserver is unavailable', () => {
  const state = fixture({ intersection: false });
  assert.deepEqual(state.sources, ['/light.avif']);
});

test('page teardown disconnects observers and media listeners', () => {
  const state = fixture();
  state.listeners.get('astro:before-swap')();
  assert.equal(state.stopped(), true);
  assert.equal(state.listeners.size, 0);
  assert.ok([...state.media.values()].every((target) => !target.handler));
  state.intersect(true);
  assert.deepEqual(state.sources, [], 'a queued observer must not revive a disposed page');
  state.cleanup();
});

test('the component preserves native lazy loading, dimensions, crawlable fallback and the text lesson', async () => {
  const source = await readFile(new URL('../src/components/home/MethodFlowFigure.astro', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /new Image\(/u);
  assert.match(source, /loading="lazy"/u);
  assert.match(source, /width="2752"\s+height="1216"/u);
  assert.match(source, /<noscript>[\s\S]*src="\/images\/home\/method-loop-light\.avif"/u);
  assert.match(source, /class="method-flow__text-version"/u);
  assert.match(source, /Consensus exits the cycle/u);
});
