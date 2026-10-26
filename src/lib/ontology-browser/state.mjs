import { searchEntries } from '../site-search.mjs';
import { applyFilters, computeFacetCounts, sortItems, paginate } from './filter.mjs';

const positiveInteger = (value, fallback) => /^\d+$/u.test(value ?? '') && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : fallback;

/** URL parameters are untrusted; admit only values present in this corpus. */
export function readBrowserState(url, entries, facets) {
  const params = url.searchParams;
  const filters = Object.fromEntries(facets.map(({key}) => {
    const valid = new Set(entries.flatMap(item => [].concat(item[key] ?? [])));
    const values = params.getAll(key).flatMap(value => value.split(','));
    return [key, [...new Set(values)].filter(value => valid.has(value))];
  }));
  const selected = params.get('selected') || '';
  const size = positiveInteger(params.get('pageSize'),25);
  return {
    filters, q:(params.get('q') || '').slice(0,500),
    sort:['name','kind','context'].includes(params.get('sort')) ? params.get('sort') : 'name',
    direction:params.get('direction') === 'desc' ? 'desc' : 'asc',
    page:positiveInteger(params.get('page'),1), pageSize:[25,50,100].includes(size) ? size : 25,
    view:params.get('view') === 'compact' ? 'compact' : 'cards',
    rootOnly:params.get('rootOnly') === 'true',
    selected:entries.some(item => item.id === selected) ? selected : '',
  };
}

/** Adapted from semantic-app listing-nav.ts; every meaningful state is shareable. */
export function browserSearch(state) {
  const params = new URLSearchParams();
  if (state.q) params.set('q',state.q);
  for (const [key,values] of Object.entries(state.filters)) if (values.length) params.set(key,values.join(','));
  if (state.sort !== 'name') params.set('sort',state.sort);
  if (state.direction !== 'asc') params.set('direction',state.direction);
  if (state.page > 1) params.set('page',String(state.page));
  if (state.pageSize !== 25) params.set('pageSize',String(state.pageSize));
  if (state.view !== 'cards') params.set('view',state.view);
  if (state.rootOnly) params.set('rootOnly','true');
  if (state.selected) params.set('selected',state.selected);
  return params.size ? `?${params}` : '';
}

export function browserResults(entries, state, facets) {
  const matches = searchEntries(state.q, {}, entries).filter(item => !state.rootOnly || item.isRootClass);
  const filtered = applyFilters(matches,state.filters);
  const items = state.q && state.sort === 'name' && state.direction === 'asc'
    ? filtered : sortItems(filtered, state.sort === 'name' ? 'title' : state.sort, state.direction);
  return { ...paginate(items,state.page,state.pageSize), items,
    counts:computeFacetCounts(matches,facets.map(({key}) => key),state.filters) };
}
