import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../src/components/Comments.astro', import.meta.url), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/u)[1];
const tick = () => new Promise(resolve => setImmediate(resolve));
const comment = { id: 1, nick: 'Another member', content: 'A useful question', date: '2026-09-09', rid: 0 };

function setup({ postStatus = 200, readStatus = 200 } = {}) {
  class Element {
    children = []; dataset = {}; hidden = false; disabled = false; textContent = ''; value = ''; events = {};
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    addEventListener(event, listener, options) { this.events[event] = { listener, options }; }
    setAttribute() {}
    focus() { this.focused = true; }
    async fire(event) {
      const handler = this.events[event];
      if (!handler?.options?.signal?.aborted) await handler?.listener({ preventDefault() {} });
    }
  }
  const ids = new Map(['', '-list', '-status', '-more', '-form', '-content', '-submit', '-author', '-reply', '-cancel', '-sign-in']
    .map(suffix => ['opda-comments' + suffix, new Element()]));
  const section = new Element(); section.dataset.commentPageKey = '/retained-thread';
  const events = {}, requests = [], state = { postStatus, readStatus, heldPost: undefined };
  const context = {
    URL, URLSearchParams, AbortController,
    window: { location: { pathname: '/new-route', origin: 'https://opda.org.uk' }, localStorage: { removeItem() {} } },
    document: { readyState: 'complete', getElementById: id => ids.get(id), querySelector: () => section,
      createElement: () => new Element(), addEventListener: (name, callback) => { events[name] = callback; } },
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (options.method === 'POST' && state.heldPost) await state.heldPost;
      const status = options.method === 'POST' ? state.postStatus : state.readStatus;
      return { ok: status === 200, status, json: async () => options.method === 'POST'
        ? { data: { ...comment, id: 2 } }
        : { data: { viewer: { name: 'Signed-in Member' }, count: 1, comments: [comment] } } };
    },
  };
  vm.runInNewContext(script, context);
  return { state, requests, events, element: suffix => ids.get('opda-comments' + suffix) };
}

test('posting is deliberate, cookie-bound and sends no client-supplied author or bearer token', async () => {
  const s = setup(); await tick();
  assert.equal(s.requests.length, 1, 'initialisation performs only a read');
  assert.equal(s.element('-form').hidden, false);
  assert.equal(s.element('-author').textContent, 'Commenting as Signed-in Member');
  s.element('-content').value = '  A suggestion  ';
  await s.element('-form').fire('submit');
  const post = s.requests.find(r => r.options.method === 'POST');
  assert.equal(post.options.credentials, 'same-origin');
  assert.equal(post.options.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(post.options.body), { page_key: '/retained-thread', content: 'A suggestion', rid: 0 });
  assert.equal(post.options.headers.Authorization, undefined);
  assert.equal(s.element('-content').value, '');
  assert.equal(s.element('-status').textContent, 'Your comment has been posted.');
});

test('reply controls preserve the exact legacy thread and parent ID', async () => {
  const s = setup(); await tick();
  const article = s.element('-list').children[0];
  await article.children.at(-1).fire('click');
  assert.equal(s.element('-content').focused, true);
  assert.match(s.element('-reply').textContent, /#1 by Another member/u);
  s.element('-content').value = 'My reply';
  await s.element('-form').fire('submit');
  assert.equal(JSON.parse(s.requests[1].options.body).rid, 1);
  assert.equal(s.element('-cancel').hidden, true);
});

test('expired or revoked reads and writes hide the editor and stale private comments', async () => {
  for (const status of [401, 403]) {
    const s = setup({ readStatus: status }); await tick();
    assert.equal(s.element('-form').hidden, true);
    assert.equal(s.element('-sign-in').hidden, false);
    const p = setup({ postStatus: status }); await tick();
    p.element('-content').value = 'Keep my unsent draft';
    await p.element('-form').fire('submit');
    assert.equal(p.element('-form').hidden, true);
    assert.equal(p.element('-list').children.length, 0);
    assert.equal(p.element('-content').value, 'Keep my unsent draft');
  }
});

test('an uncertain write keeps the draft and does not retry automatically', async () => {
  const s = setup({ postStatus: 503 }); await tick();
  s.element('-content').value = 'My draft';
  await s.element('-form').fire('submit');
  assert.equal(s.requests.filter(r => r.options.method === 'POST').length, 1);
  assert.equal(s.element('-content').value, 'My draft');
  assert.match(s.element('-status').textContent, /could not be confirmed/u);
});

test('a confirmed post followed by a failed refresh is not presented as an uncertain write', async () => {
  const s = setup(); await tick();
  s.state.readStatus = 503;
  s.element('-content').value = 'Confirmed comment';
  await s.element('-form').fire('submit');
  assert.equal(s.element('-content').value, '');
  assert.match(s.element('-status').textContent, /has been posted.*list could not be refreshed/u);
  assert.doesNotMatch(s.element('-status').textContent, /text has been kept/u);
  assert.equal(s.requests.filter(r => r.options.method === 'POST').length, 1);
  assert.equal(s.element('-more').hidden, false);
});

test('duplicate submits and abandoned page work never cause another write', async () => {
  const s = setup(); await tick();
  let release; s.state.heldPost = new Promise(resolve => { release = resolve; });
  s.element('-content').value = 'One comment';
  const first = s.element('-form').fire('submit');
  await s.element('-form').fire('submit');
  assert.equal(s.requests.filter(r => r.options.method === 'POST').length, 1);
  s.events['astro:before-swap']();
  assert.equal(s.requests[1].options.signal.aborted, true);
  release(); await first;
  assert.equal(s.element('-content').value, 'One comment');
  await s.element('-form').fire('submit');
  assert.equal(s.requests.length, 2);
});
