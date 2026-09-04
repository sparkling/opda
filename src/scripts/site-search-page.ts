/**
 * /search controller. It owns no ranking and no vocabulary: it wires the
 * native GET form, the facet rail and the result register to the shared
 * search module, and mirrors state into a shareable URL.
 */
import { FACETS, PAGE_TYPES, labelFor, parseSearchParams, searchParamsFor, tabFor } from '@/lib/site-search-model.mjs';
import { describeRecord, facetCounts, loadSearchIndex, searchEntries } from '@/lib/site-search.mjs';

type SearchRecord = { title: string; url: string; summary: string; type: string };
type Fact = { label: string; value: string; code?: boolean };
type Description = { variant: string; eyebrow: string; badge: { label: string; tone: string } | null; facts: Fact[] };
type Filters = Record<string, string[]>;

const PAGE_SIZE = 40;
const PILL_TONES: Record<string, string> = { success: 'pill--success', warn: 'pill--warn', info: 'pill--info', neutral: '' };
const count = (value: number) => value.toLocaleString('en-GB');
const plural = (value: number) => `${count(value)} ${value === 1 ? 'result' : 'results'}`;
let activeSearch: { form: HTMLFormElement; controller: AbortController } | null = null;

function stopSiteSearch() {
  activeSearch?.controller.abort();
  activeSearch = null;
}

function query<T extends Element>(root: ParentNode, selector: string, type: new () => T): T | null {
  const node = root.querySelector(selector);
  return node instanceof type ? node : null;
}

function tokens(value: string) {
  return [...new Set(value.toLocaleLowerCase().split(/\s+/u).filter((token) => token.length >= 2))];
}

function markedText(value: string, words: string[]) {
  const fragment = document.createDocumentFragment();
  if (!words.length || !value) { fragment.append(value); return fragment; }
  const escaped = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
  for (const part of value.split(new RegExp(`(${escaped.join('|')})`, 'giu'))) {
    if (words.includes(part.toLocaleLowerCase())) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      fragment.append(mark);
    } else fragment.append(part);
  }
  return fragment;
}

async function initialiseSiteSearch() {
  const form = query(document, '[data-site-search-form]', HTMLFormElement);
  if (!form) return;
  if (activeSearch?.form === form && !activeSearch.controller.signal.aborted) return;
  const input = query(form, '#site-search', HTMLInputElement);
  const list = query(document, '[data-search-results]', HTMLOListElement);
  const template = query(document, '[data-search-card]', HTMLTemplateElement);
  const summary = query(document, '[data-search-summary]', HTMLElement);
  const status = query(document, '[data-search-status]', HTMLElement);
  const announcement = query(document, '[data-search-announcement]', HTMLElement);
  const applied = query(document, '[data-search-applied]', HTMLUListElement);
  const empty = query(document, '[data-no-results]', HTMLElement);
  const emptyMessage = query(document, '[data-no-results-message]', HTMLElement);
  const widen = query(document, '[data-search-widen]', HTMLButtonElement);
  const more = query(document, '[data-search-more]', HTMLButtonElement);
  const panel = query(document, '[data-search-filters]', HTMLElement);
  const tabInput = query(document, '[data-search-tab-input]', HTMLInputElement);
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-search-tab]'));
  if (!input || !list || !template || !summary || !status || !announcement || !applied || !empty || !emptyMessage
    || !widen || !more || !panel || !tabInput || !tabs.length) return;
  stopSiteSearch();
  const controller = new AbortController();
  const { signal } = controller;
  activeSearch = { form, controller };

  const facetGroups = Array.from(panel.querySelectorAll<HTMLElement>('[data-search-facet]'));
  const checkboxes = Array.from(panel.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
  let entries: SearchRecord[] = [];
  let legacyPageTypes: string[] = [];
  let visibleCount = PAGE_SIZE;
  let announcementTimer: number | undefined;
  let urlTimer: number | undefined;

  function readState() {
    const data = new FormData(form);
    const raw: Record<string, string[]> = {};
    for (const facet of FACETS) raw[facet.key] = data.getAll(facet.param).map(String);
    raw.pageType = legacyPageTypes;
    const { filters } = parseSearchParams(searchParamsFor(input.value, raw));
    const selectedTab = tabFor(tabInput.value);
    return {
      query: input.value.trim(),
      tab: selectedTab,
      filters: { ...filters, ...selectedTab.filters } as Filters,
    };
  }

  function writeState(queryValue: string, filters: Filters, tabKey = 'all') {
    input.value = queryValue;
    legacyPageTypes = [...(filters.pageType ?? [])];
    const selectedTab = tabFor(tabKey);
    tabInput.value = selectedTab.key;
    for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.searchTab === selectedTab.key));
    for (const facet of FACETS) {
      const selected = selectedTab.filters[facet.key] ? [] : ([] as string[]).concat(filters[facet.key] ?? []);
      for (const box of checkboxes) if (box.name === facet.param) box.checked = selected.includes(box.value);
    }
  }

  function syncScope(tabKey: string) {
    const selectedTab = tabFor(tabKey);
    for (const group of facetGroups) {
      const visible = selectedTab.facets.includes(group.dataset.searchFacet ?? '');
      group.hidden = !visible;
      if (!visible) group.querySelectorAll<HTMLInputElement>('input').forEach((box) => { box.checked = false; });
    }
  }

  function renderCounts(queryValue: string, filters: Filters) {
    const byFacet = facetCounts(queryValue, filters, entries) as Record<string, Record<string, number>>;
    for (const group of facetGroups) {
      const tally = byFacet[group.dataset.searchFacet ?? ''] ?? {};
      for (const box of group.querySelectorAll<HTMLInputElement>('input')) {
        const total = tally[box.value] ?? 0;
        const target = box.parentElement?.querySelector<HTMLElement>('[data-count]');
        if (target) { target.textContent = count(total); target.hidden = false; }
        box.disabled = total === 0 && !box.checked;
      }
    }
  }

  function renderFilterControls() {
    const activeFilters = checkboxes.filter((box) => box.checked && !box.closest<HTMLElement>('[data-search-facet]')?.hidden);
    const chip = (label: string, remove: () => void) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'site-search__chip';
      button.setAttribute('aria-label', `Remove filter: ${label}`);
      button.append(label, ' ');
      const glyph = document.createElement('span');
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = '×';
      button.append(glyph);
      button.addEventListener('click', () => {
        remove();
        visibleCount = PAGE_SIZE;
        apply();
      }, { signal });
      item.append(button);
      return item;
    };
    const currentChips = activeFilters.map((control) => chip(
      control.parentElement?.querySelector('.site-search__option-label')?.textContent?.trim() ?? control.value,
      () => { control.checked = false; },
    ));
    const legacyChips = legacyPageTypes.map((pageType) => chip(
      `Legacy page type: ${labelFor(PAGE_TYPES, pageType) || pageType}`,
      () => { legacyPageTypes = legacyPageTypes.filter((value) => value !== pageType); },
    ));
    applied.replaceChildren(...currentChips, ...legacyChips);
    const activeCount = currentChips.length + legacyChips.length;
    applied.hidden = activeCount === 0;
    status.hidden = activeCount === 0;
    const anythingActive = Boolean(input.value.trim()) || activeCount > 0;
    document.querySelectorAll<HTMLButtonElement>('[data-search-reset]').forEach((button) => { button.hidden = !anythingActive; });
    widen.hidden = activeCount === 0;
  }

  function fact({ label, value, code }: Fact) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    if (code) {
      const identifier = document.createElement('code');
      identifier.className = 'standalone-identifier';
      identifier.textContent = value;
      detail.append(identifier);
    } else detail.textContent = value;
    row.append(term, detail);
    return row;
  }

  function card(record: SearchRecord, words: string[]) {
    const node = template.content.firstElementChild?.cloneNode(true);
    if (!(node instanceof HTMLLIElement)) return null;
    const description = describeRecord(record) as Description;
    node.classList.add(`site-search-result--${description.variant}`);
    const eyebrow = node.querySelector('[data-slot="eyebrow"]');
    const badge = node.querySelector('[data-slot="badge"]');
    const link = node.querySelector('[data-slot="link"]');
    const summaryNode = node.querySelector('[data-slot="summary"]');
    const facts = node.querySelector('[data-slot="facts"]');
    if (eyebrow) eyebrow.textContent = description.eyebrow;
    if (badge instanceof HTMLElement) {
      if (description.badge) {
        badge.textContent = description.badge.label;
        const tone = PILL_TONES[description.badge.tone];
        if (tone) badge.classList.add(tone);
      } else badge.remove();
    }
    if (link instanceof HTMLAnchorElement) { link.href = record.url; link.append(markedText(record.title, words)); }
    if (summaryNode) {
      if (record.summary) summaryNode.append(markedText(record.summary, words));
      else summaryNode.remove();
    }
    if (facts) {
      if (description.facts.length) facts.append(...description.facts.map(fact));
      else facts.remove();
    }
    return node;
  }

  function updateUrl(queryValue: string, filters: Filters, tabKey = 'all') {
    window.clearTimeout(urlTimer);
    urlTimer = window.setTimeout(() => {
      const url = new URL(location.href);
      url.search = searchParamsFor(queryValue, filters, tabKey).toString();
      history.replaceState(null, '', url);
    }, 250);
  }

  function apply({ announce = true, writeUrl = true } = {}) {
    const initial = readState();
    syncScope(initial.tab.key);
    const { query: queryValue, filters, tab } = readState();
    const ranked = searchEntries(queryValue, filters, entries) as SearchRecord[];
    const words = tokens(queryValue);
    list.replaceChildren(...ranked.slice(0, visibleCount).map((record) => card(record, words)).filter((node): node is HTMLLIElement => node !== null));
    const description = `${plural(ranked.length)}${queryValue ? ` for “${queryValue}”` : ''}`;
    summary.textContent = count(ranked.length);
    summary.setAttribute('aria-label', description);
    if (announce) {
      window.clearTimeout(announcementTimer);
      announcementTimer = window.setTimeout(() => { announcement.textContent = description; }, 350);
    }
    list.hidden = ranked.length === 0;
    empty.hidden = ranked.length !== 0;
    emptyMessage.textContent = ranked.length ? '' : `No results${queryValue ? ` for “${queryValue}”` : ''} match the selected filters.`;
    more.hidden = ranked.length <= visibleCount;
    more.textContent = `Show more results (${count(Math.max(ranked.length - visibleCount, 0))} remaining)`;
    renderCounts(queryValue, filters);
    renderFilterControls();
    if (writeUrl) updateUrl(queryValue, filters, tab.key);
  }

  const initial = parseSearchParams(new URL(location.href).searchParams);
  writeState(initial.query, initial.filters as Filters, initial.tab);

  form.addEventListener('submit', (event) => { event.preventDefault(); visibleCount = PAGE_SIZE; apply(); }, { signal });
  input.addEventListener('input', () => { visibleCount = PAGE_SIZE; apply(); }, { signal });
  form.addEventListener('change', () => { visibleCount = PAGE_SIZE; apply(); }, { signal });
  panel.addEventListener('change', () => { visibleCount = PAGE_SIZE; apply(); }, { signal });
  form.addEventListener('reset', () => window.queueMicrotask(() => {
    legacyPageTypes = [];
    visibleCount = PAGE_SIZE;
    apply();
    input.focus();
  }), { signal });
  more.addEventListener('click', () => { visibleCount += PAGE_SIZE; apply({ announce: false, writeUrl: false }); }, { signal });
  widen.addEventListener('click', () => {
    const { query: queryValue } = readState();
    writeState(queryValue, {}, 'all');
    visibleCount = PAGE_SIZE;
    apply();
    input.focus();
  }, { signal });
  for (const tab of tabs) tab.addEventListener('click', () => {
    tabInput.value = tab.dataset.searchTab ?? 'all';
    for (const candidate of tabs) candidate.setAttribute('aria-pressed', String(candidate === tab));
    visibleCount = PAGE_SIZE;
    apply();
  }, { signal });
  signal.addEventListener('abort', () => {
    window.clearTimeout(announcementTimer);
    window.clearTimeout(urlTimer);
  }, { once: true });

  entries = await loadSearchIndex() as SearchRecord[];
  if (signal.aborted || !form.isConnected) return;
  apply({ announce: false, writeUrl: false });
}

function scheduleSiteSearchInitialisation() {
  window.queueMicrotask(() => { void initialiseSiteSearch(); });
}

document.addEventListener('astro:before-swap', stopSiteSearch);
document.addEventListener('astro:page-load', scheduleSiteSearchInitialisation);
// Native history traversal can restore a cached document without Astro
// emitting its page-load event. Re-bind against the restored DOM on pageshow.
window.addEventListener('pageshow', scheduleSiteSearchInitialisation);
void initialiseSiteSearch();
