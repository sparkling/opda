import { closeSync, fstatSync, openSync, readSync } from 'node:fs';
import { parse } from 'parse5';
import { isSearchUtility } from './page-seo.mjs';

/** Read bounded head metadata, not multi-megabyte ontology payloads. */
function readHead(file) {
  const descriptor = openSync(file, 'r');
  try {
    const buffer = Buffer.allocUnsafe(Math.min(fstatSync(descriptor).size, 256 * 1024));
    const size = readSync(descriptor, buffer, 0, buffer.length, 0);
    const html = buffer.toString('utf8', 0, size);
    const end = html.toLowerCase().indexOf('</head>');
    return end < 0 ? html : html.slice(0, end + 7);
  } finally {
    closeSync(descriptor);
  }
}

export function hasIndexableHead(html) {
  const document = parse(html);
  const root = document.childNodes.find((node) => node.tagName === 'html');
  const head = root?.childNodes.find((node) => node.tagName === 'head');
  return !(head?.childNodes ?? []).some((node) => {
    if (node.tagName !== 'meta') return false;
    const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
    const content = (attrs.content ?? '').toLowerCase();
    if ((attrs['http-equiv'] ?? '').toLowerCase() === 'refresh' && /\burl\s*=/u.test(content)) return true;
    return ['robots', 'googlebot'].includes((attrs.name ?? '').toLowerCase())
      && content.split(/[\s,]+/u).some((token) => ['noindex', 'none'].includes(token));
  });
}

/** Runs after static generation, so redirects/noindex need no duplicate route list. */
export function sitemapPageIsIndexable(page, directory) {
  if (isSearchUtility(page)) return false;
  const pathname = new URL(page).pathname;
  const relative = pathname.replace(/^\//u, '').replace(/\/+$/u, '');
  const file = new URL(relative ? `${relative}/index.html` : 'index.html', directory);
  try {
    return hasIndexableHead(readHead(file));
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false;
    throw error;
  }
}
