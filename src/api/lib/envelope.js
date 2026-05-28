/**
 * JSON response envelope utilities for opda API.
 * Adapted from hm/semantic-modelling (ADR-0021).
 */

export function buildPagination(page, pageSize) {
  const p = Math.max(1, Math.floor(page) || 1);
  const ps = Math.max(1, Math.min(1000, Math.floor(pageSize) || 100));
  return { offset: (p - 1) * ps, limit: ps };
}

export function buildListResponse({ items, totalCount, page, pageSize, basePath, query, listType }) {
  const p = Math.max(1, page);
  const ps = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / ps));

  const buildLink = (linkPage) => {
    const params = new URLSearchParams({ ...(query || {}), page: String(linkPage), pageSize: String(ps) });
    return { href: `${basePath}?${params}` };
  };

  const _links = { self: buildLink(p), first: buildLink(1), last: buildLink(totalPages) };
  if (p > 1) _links.prev = buildLink(p - 1);
  if (p < totalPages) _links.next = buildLink(p + 1);

  return {
    '@type': listType || 'Collection',
    totalCount, page: p, pageSize: ps, totalPages,
    items,
    _links,
  };
}
