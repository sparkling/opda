import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { applyFilters, computeFacetCounts, paginate } from '../src/lib/ontology-browser/filter.mjs';
import { browserResults, readBrowserState, browserSearch } from '../src/lib/ontology-browser/state.mjs';
import { projectSchemaResources, projectCandidateResources } from '../src/lib/ontology-browser/projection.mjs';
import { resources, contexts, resourceRoute } from '../src/lib/property-pack-model.mjs';
import { pdtfResourcePath } from '../src/lib/pdtf-resource-routes.mjs';

const model = JSON.parse(readFileSync(new URL('../src/data/ontology-model.json', import.meta.url)));
const candidate = projectCandidateResources(resources, contexts, resourceRoute);
const schema = projectSchemaResources(model, pdtfResourcePath);
const facets = [{ key: 'kind' }, { key: 'context' }];

test('reference filtering is OR within a facet and AND across facets with disjunctive counts', () => {
  const entries = [{kind:'class',context:'a'}, {kind:'class',context:'b'}, {kind:'shape',context:'a'}];
  assert.equal(applyFilters(entries, {kind:['class','shape'],context:['a']}).length, 2);
  assert.deepEqual(computeFacetCounts(entries, ['kind','context'], {kind:['class'],context:['a']}), {
    kind: [{value:'class',count:1},{value:'shape',count:1}],
    context: [{value:'a',count:1},{value:'b',count:1}],
  });
  assert.deepEqual(paginate(entries, 99, 2), {pageItems:[entries[2]],page:2,totalCount:3,totalPages:2});
});

test('browser URL state validates facets, sort, page size and selected identity', () => {
  const state = readBrowserState(new URL('https://example.test/?kind=class,script&context=common&page=NaN&pageSize=0&sort=evil&selected=unknown'), candidate, facets);
  assert.deepEqual(state.filters, {kind:['class'],context:['common']});
  assert.equal(state.page, 1);
  assert.equal(state.pageSize, 25);
  assert.equal(state.sort, 'name');
  assert.equal(state.selected, '');
  state.q = 'title search'; state.selected = candidate[0].id; state.view = 'compact';
  assert.deepEqual(readBrowserState(new URL(`https://example.test/${browserSearch(state)}`), candidate, facets), state);
});

test('candidate projection preserves every OWL resource, canonical route and provenance distinction', () => {
  assert.equal(candidate.length, resources.length);
  assert.equal(new Set(candidate.map(x => x.id)).size, resources.length);
  for (const item of candidate) {
    const original = resources.find(x => x.key === item.id);
    assert.equal(item.summary, original.definition);
    assert.equal(item.url, resourceRoute(original));
    assert.equal(item.collection, 'property-pack');
    assert.equal(item.status, 'machine-proposed');
    assert.match(item.evidence, /direct · \d+ structural/);
  }
  const property = candidate.find(x => x.id === 'common:Property');
  assert.ok(property.groups.find(x => x.label === 'Properties with this domain').refs.length);
  assert.ok(candidate.find(x => x.kind === 'object-property').groups.some(x => x.label === 'Range'));
});

test('schema projection retains kinds, preferred definitions, canonical case-safe paths and reference relationships', () => {
  const expected = ['classes','objectProperties','datatypeProperties','shapes','concepts','schemes'].reduce((n,key) => n+Object.keys(model[key]).length,0);
  assert.equal(schema.length, expected);
  assert.equal(schema.find(x => x.id === 'LeaseTerm').url, '/pdtf/classes/lease-term');
  assert.equal(schema.find(x => x.id === 'leaseTerm').url, '/pdtf/object-properties/lease-term');
  for (const item of schema) {
    assert.equal(item.collection, 'pdtf-derived');
    assert.ok(item.url.startsWith('/pdtf/'));
    for (const group of item.groups) for (const ref of group.refs) {
      if (ref.id) assert.ok(schema.some(x => x.id === ref.id), ref.id);
      if (ref.url) assert.ok(ref.url.startsWith('/pdtf/') || /^https?:\/\//u.test(ref.url));
    }
  }
});

test('browser uses the shared OPDA search and retains result order for selection navigation', () => {
  const state = readBrowserState(new URL('https://example.test/?q=property&kind=class'), candidate, facets);
  const result = browserResults(candidate, state, facets);
  assert.ok(result.totalCount > 0);
  assert.equal(result.items[0].id, 'common:Property');
  assert.ok(result.items.every(x => x.kind === 'class'));
  state.q = 'there is no such ontology resource qzx';
  assert.equal(browserResults(candidate, state, facets).totalCount, 0);
});

test('restoring an enhanced document retains resources from every result page', () => {
  class ElementStub extends EventTarget {
    constructor() {
      super();
      this.dataset = {};
      this.children = [];
      this.hidden = false;
      this.isConnected = true;
    }
    setAttribute() {}
    replaceChildren(...items) { this.children = items; }
    append(...items) {
      this.children = [...this.children.filter(item => !items.includes(item)), ...items];
    }
    querySelector() { return null; }
    querySelectorAll() { return []; }
  }
  const entries = Array.from({length:26}, (_, index) => ({
    id:String(index), title:`Term ${String(index).padStart(2,'0')}`, url:`/pdtf/${index}`,
    iri:`https://example.test/${index}`, identifier:String(index), aliases:[],
    kind:'class', context:'test', summary:'', type:'ontology',
  }));
  const root = new ElementStub();
  const parts = new Map(['query','list','detail','detail-content','sort','direction','view',
    'page-size','roots','chips','empty','summary','page-status'].map(key => [key,new ElementStub()]));
  const list = parts.get('list');
  list.children = entries.map(item => {
    const card = new ElementStub(); card.dataset.browserRecord = item.id; return card;
  });
  const data = {textContent:JSON.stringify({entries,facets:[]})};
  root.querySelector = selector => selector === '[data-browser-data]'
    ? data : parts.get(selector.slice('[data-browser-'.length,-1));
  root.querySelectorAll = selector => selector === '[data-browser-record]' ? list.children : [];
  const document = new ElementStub();
  document.querySelector = () => root;
  document.createElement = () => new ElementStub();
  const window = new ElementStub();
  window.location = new URL('https://example.test/browser');
  window.history = {state:null, replaceState() {}, pushState() {}};
  const source = readFileSync(new URL('../src/scripts/ontology-browser.mjs',import.meta.url),'utf8')
    .replace(/^import .*\n/u,'').replace('export function mountOntologyBrowser','function mountOntologyBrowser');
  const runtime = vm.createContext({document,window,URL,URLSearchParams,AbortController,
    browserResults,readBrowserState,browserSearch});
  vm.runInContext(source,runtime);
  assert.equal(list.children.filter(card => !card.hidden).length,25);
  document.dispatchEvent(new Event('astro:before-swap'));
  window.location = new URL('https://example.test/browser?page=2');
  assert.doesNotThrow(() => runtime.mountOntologyBrowser());
  assert.deepEqual(list.children.filter(card => !card.hidden).map(card => card.dataset.browserRecord),['25']);
  document.dispatchEvent(new Event('astro:before-swap'));
  window.location = new URL('https://example.test/browser');
  assert.doesNotThrow(() => runtime.mountOntologyBrowser());
  assert.equal(list.children.filter(card => !card.hidden).length,25);
  document.dispatchEvent(new Event('astro:before-swap'));
});
