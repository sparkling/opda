/**
 * Ported from semantic-app src/website/src/lib/client-filter.ts at
 * b74468734729b7760748a1106eea3e4161b41937. This is the shared OPDA owner
 * for the reference browser's OR/AND facets, disjunctive counts and paging.
 * Facet names come from each corpus; H&M-specific facets are not imported.
 */
export function applyFilters(items, filters) {
  return items.filter(item => Object.entries(filters).every(([key, values]) => {
    if (values.length === 0) return true;
    const value = item[key];
    return Array.isArray(value) ? value.some(x => values.includes(x)) : values.includes(value);
  }));
}

export function computeFacetCounts(items, keys, filters = {}) {
  return Object.fromEntries(keys.map(key => {
    const otherFilters = Object.fromEntries(Object.entries(filters).filter(([k]) => k !== key));
    const counts = new Map();
    for (const item of applyFilters(items, otherFilters)) {
      for (const value of [].concat(item[key] ?? [])) {
        if (value) counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
    return [key, [...counts].map(([value, count]) => ({ value, count })).sort((a,b) => b.count-a.count)];
  }));
}

export function sortItems(items, field, direction) {
  return [...items].sort((a,b) => {
    const comparison = String(a[field] || '').toLowerCase().localeCompare(String(b[field] || '').toLowerCase());
    return direction === 'desc' ? -comparison : comparison;
  });
}

export function paginate(items, page, pageSize) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return { pageItems: items.slice((safePage-1)*pageSize, safePage*pageSize), page:safePage, totalCount, totalPages };
}
