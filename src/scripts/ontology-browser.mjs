import { browserResults, readBrowserState, browserSearch } from '../lib/ontology-browser/state.mjs';

let active = null;
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  return element;
};
function stop() { active?.controller.abort(); active = null; }

/** Scoped event ownership follows the site's search controller, including Astro swaps. */
export function mountOntologyBrowser() {
  const root = document.querySelector('[data-ontology-browser]');
  if (!root || active?.root === root) return;
  stop();
  const data = root.querySelector('[data-browser-data]');
  const { entries, facets } = JSON.parse(data.textContent);
  const byId = new Map(entries.map(item => [item.id,item]));
  const cards = new Map([...root.querySelectorAll('[data-browser-record]')].map(card => [card.dataset.browserRecord,card]));
  const controller = new AbortController();
  const {signal} = controller;
  active = {root,controller};
  const get = selector => root.querySelector(`[data-browser-${selector}]`);
  const query = get('query'), list = get('list'), panel = get('detail'), content = get('detail-content');
  const boxes = [...root.querySelectorAll('[data-browser-facet]')];
  const controls = Object.fromEntries(['sort','direction','view','page-size','roots'].map(name => [name,get(name)]));
  let state = readBrowserState(new URL(window.location.href), entries, facets);
  let result;
  let renderedSelection = null;

  function syncUrl(mode = 'replaceState') {
    const url = new URL(window.location.href);
    const keys = [...facets.map(facet => facet.key),'q','sort','direction','page','pageSize','view','rootOnly','selected'];
    for (const key of keys) url.searchParams.delete(key);
    for (const [key,value] of new URLSearchParams(browserSearch(state))) url.searchParams.set(key,value);
    if (url.href !== window.location.href) window.history[mode](window.history.state,'',url);
  }
  function writeControls() {
    query.value = state.q;
    for (const key of ['sort','direction','view']) controls[key].value = state[key];
    controls['page-size'].value = String(state.pageSize);
    controls.roots.checked = state.rootOnly;
    for (const box of boxes) box.checked = state.filters[box.dataset.browserFacet].includes(box.value);
  }
  function chip(label, data) {
    const item = node('li');
    const button = node('button',`${label} ×`,'btn');
    button.type = 'button';
    button.setAttribute('aria-label',`Remove filter: ${label}`);
    Object.assign(button.dataset,data);
    item.append(button);
    return item;
  }
  function updateFacets() {
    const chips = [];
    for (const box of boxes) {
      const key = box.dataset.browserFacet;
      const total = result.counts[key].find(entry => entry.value === box.value)?.count || 0;
      box.parentElement.querySelector('[data-facet-count]').textContent = String(total);
      box.disabled = total === 0 && !box.checked;
      if (box.checked) chips.push(chip(box.parentElement.querySelector('[data-option-label]').textContent,{browserRemoveFacet:key,browserRemoveValue:box.value}));
    }
    if (state.rootOnly) chips.push(chip('Root classes only',{browserRemoveRoots:''}));
    get('chips').replaceChildren(...chips);
  }
  function renderSelection() {
    const item = byId.get(state.selected);
    panel.hidden = !item;
    root.querySelectorAll('[data-browser-select]').forEach(button => {
      button.setAttribute('aria-expanded',String(button.dataset.browserSelect === state.selected));
    });
    const position = result.items.findIndex(entry => entry.id === state.selected);
    root.querySelectorAll('[data-browser-record-nav]').forEach(button => {
      button.disabled = position < 0 || (button.dataset.browserRecordNav === 'previous' ? position === 0 : position === result.items.length-1);
    });
    if (!item) { renderedSelection = null; content.replaceChildren(); return; }
    if (renderedSelection === item.id) return;
    renderedSelection = item.id;
    const heading = node('h3',item.title);
    heading.tabIndex = -1; heading.dataset.browserDetailHeading = '';
    const identity = node('code',item.iri,'standalone-identifier');
    const complete = node('a','Open complete reference','btn ontology-browser__detail-link');
    complete.href = item.url;
    const copy = node('button','Copy IRI','btn');
    copy.type = 'button'; copy.dataset.browserCopy = '';
    const copyStatus = node('span'); copyStatus.dataset.browserCopyStatus = ''; copyStatus.setAttribute('role','status');
    const children = [node('p',`${item.kindLabel} · ${item.contextLabel}`,'ontology-browser__eyebrow'),heading,
      node('p',item.statusLabel,'ontology-browser__selected-status'),identity,copy,copyStatus,
      node('p',item.summary || 'No definition recorded.'),complete];
    if (item.contextUrl) {
      const contextLink = node('a',`Explore ${item.contextLabel}`); contextLink.href = item.contextUrl; children.push(contextLink);
    }
    if (item.evidence) children.push(node('p',item.evidence,'ontology-browser__evidence'));
    for (const fact of item.facts) {
      const section = node('section',null,'ontology-browser__group'); section.append(node('h4',fact.label),node('p',fact.value)); children.push(section);
    }
    for (const group of item.groups) {
      const section = node(group.refs.length > 8 ? 'details' : 'section',null,'ontology-browser__group');
      section.append(node(group.refs.length > 8 ? 'summary' : 'h4',`${group.label} · ${group.refs.length}`));
      const refs = node('ul');
      for (const ref of group.refs) {
        const row = node('li');
        if (ref.url && (/^https?:\/\//u.test(ref.url) || ref.url.startsWith('/'))) {
          const link = node('a',ref.label); link.href = ref.url;
          if (ref.id && byId.has(ref.id)) link.dataset.browserSelect = ref.id;
          row.append(link);
        } else row.append(node('code',ref.label,'standalone-identifier'));
        refs.append(row);
      }
      section.append(refs); children.push(section);
    }
    content.replaceChildren(...children);
  }
  function render({sync = true} = {}) {
    result = browserResults(entries,state,facets);
    state.page = result.page;
    const visible = result.pageItems.map(item => {
      const card = cards.get(item.id);
      card.dataset.selected = String(item.id === state.selected);
      return card;
    });
    // Keep the complete server-rendered register in the DOM. Astro/history may
    // restore an already-enhanced page; it must still contain every page's cards.
    const visibleIds = new Set(result.pageItems.map(item => item.id));
    for (const [id,card] of cards) card.hidden = !visibleIds.has(id);
    list.append(...visible);
    list.dataset.view = state.view;
    get('empty').hidden = result.totalCount !== 0;
    const start = result.totalCount ? (result.page-1)*state.pageSize+1 : 0;
    get('summary').textContent = `${result.totalCount} of ${entries.length} resources · showing ${start}–${Math.min(result.page*state.pageSize,result.totalCount)}`;
    get('page-status').textContent = `Page ${result.page} of ${result.totalPages}`;
    root.querySelectorAll('[data-browser-page]').forEach(button => {
      button.disabled = button.dataset.browserPage === 'previous' ? result.page === 1 : result.page === result.totalPages;
    });
    updateFacets(); renderSelection();
    if (sync) syncUrl();
  }
  function select(id, focus = true) {
    state.selected = byId.has(id) ? id : '';
    syncUrl('pushState'); render({sync:false});
    if (focus) content.querySelector('[data-browser-detail-heading]')?.focus({preventScroll:false});
  }
  function close() {
    const previous = state.selected;
    state.selected = ''; syncUrl('pushState'); render({sync:false});
    const button = [...root.querySelectorAll('[data-browser-select]')].find(element => element.dataset.browserSelect === previous && !element.closest('[hidden]'));
    (button || query).focus();
  }
  root.querySelectorAll('[data-browser-enhancement]').forEach(element => {element.hidden = false;});
  writeControls(); render({sync:false});
  root.addEventListener('input',event => {
    if (event.target !== query) return;
    state.q = query.value; state.page = 1; render();
  },{signal});
  root.addEventListener('change',event => {
    const target = event.target;
    const facet = target.dataset.browserFacet;
    if (facet) state.filters[facet] = boxes.filter(box => box.dataset.browserFacet === facet && box.checked).map(box => box.value);
    else if (target === controls.roots) state.rootOnly = target.checked;
    else if (target === controls['page-size']) state.pageSize = Number(target.value);
    else for (const key of ['sort','direction','view']) if (target === controls[key]) state[key] = target.value;
    state.page = 1; render();
  },{signal});
  root.addEventListener('click',async event => {
    const target = event.target.closest('button,a');
    if (!target) return;
    if ('browserSelect' in target.dataset) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); select(target.dataset.browserSelect); return;
    }
    if ('browserClose' in target.dataset) { close(); return; }
    if ('browserCopy' in target.dataset) {
      const item = byId.get(state.selected);
      if (!item) return;
      try {
        await navigator.clipboard.writeText(item.iri);
        if (!signal.aborted && state.selected === item.id) get('copy-status').textContent = 'IRI copied.';
      } catch {
        if (!signal.aborted && state.selected === item.id) get('copy-status').textContent = 'Select and copy the IRI above.';
      }
      return;
    }
    if ('browserRecordNav' in target.dataset) {
      const index = result.items.findIndex(item => item.id === state.selected);
      const next = result.items[index+(target.dataset.browserRecordNav === 'next' ? 1 : -1)];
      if (next) select(next.id); return;
    }
    if ('browserPage' in target.dataset) state.page += target.dataset.browserPage === 'next' ? 1 : -1;
    else if ('browserRemoveFacet' in target.dataset) {
      const key = target.dataset.browserRemoveFacet;
      state.filters[key] = state.filters[key].filter(value => value !== target.dataset.browserRemoveValue); state.page = 1;
    } else if ('browserRemoveRoots' in target.dataset) {state.rootOnly = false; state.page = 1;}
    else if ('browserReset' in target.dataset) state = readBrowserState(new URL(window.location.pathname,window.location.origin),entries,facets);
    else return;
    const removedChip = 'browserRemoveFacet' in target.dataset || 'browserRemoveRoots' in target.dataset;
    writeControls(); render();
    if (removedChip) query.focus();
  },{signal});
  root.addEventListener('keydown',event => {
    if (event.key === 'Escape' && state.selected) {event.preventDefault(); close();}
  },{signal});
  window.addEventListener('popstate',() => {
    state = readBrowserState(new URL(window.location.href),entries,facets); writeControls(); render({sync:false});
  },{signal});
}

document.addEventListener('astro:before-swap',stop);
document.addEventListener('astro:page-load',mountOntologyBrowser);
window.addEventListener('pageshow',mountOntologyBrowser);
mountOntologyBrowser();
