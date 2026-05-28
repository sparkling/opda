/**
 * Realises ADR-0018 per ADR-0015. Build-time rewriting of relative `.md` links
 * in manual content to Astro route URLs.
 *
 * The manual markdown is authored with relative `.md` links (e.g. `./address.md`,
 * `../../logical/property/property.md`) so it stays browsable as plain files
 * (the local HTML export, GitHub). Those links do NOT resolve as Astro routes,
 * so at build time every relative link that resolves inside `docs/manual/` is
 * rewritten to its `/manual/<…>` route: extension stripped, `README` collapsed
 * to its directory (tier / module landing), `#anchors` preserved. Links that
 * resolve outside `docs/manual/` (e.g. into the ODR corpus) are left unchanged.
 *
 * Source markdown is never mutated — the rewrite happens in the mdast at build
 * time only, keeping the canonical content portable per ADR-0015.
 */

import path from 'node:path';
import type { Root, Node, Link } from 'mdast';
import type { VFile } from 'vfile';

/** Matches the docs/manual-relative tail of an absolute path (cwd-independent). */
const MANUAL_SEG_RE = /(?:^|\/)docs\/manual\/(.+)$/;

/** External (scheme:), root-absolute, or pure-anchor URLs are left untouched. */
function isExternalOrAbsolute(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('/') || url.startsWith('#');
}

/** Split a URL into its path part and optional `#fragment`. */
function splitHash(url: string): [string, string | null] {
  const i = url.indexOf('#');
  return i === -1 ? [url, null] : [url.slice(0, i), url.slice(i + 1)];
}

/** Map an absolute source path under docs/manual/ to its `/manual/<…>` route, else null. */
export function toManualRoute(absPath: string): string | null {
  const m = absPath.replace(/\\/g, '/').match(MANUAL_SEG_RE);
  if (!m) return null;
  const slug = m[1]
    .toLowerCase()
    .replace(/\.md$/, '')
    .replace(/(^|\/)readme$/, '') // README → its containing directory
    .replace(/\/$/, '');
  return slug ? `/manual/${slug}` : '/manual';
}

/** Remark plugin: rewrite relative `.md` links into Astro `/manual/…` routes. */
export function remarkRewriteManualLinks() {
  return function transformer(tree: Root, file: VFile): void {
    const filePath = file.path ?? (file as unknown as { history?: string[] }).history?.[0];
    if (!filePath) return;
    const fileDir = path.dirname(filePath);

    function walk(node: Node): void {
      if (node.type === 'link') {
        const link = node as Link;
        const url = link.url ?? '';
        if (!isExternalOrAbsolute(url)) {
          const [relPart, hash] = splitHash(url);
          if (relPart.endsWith('.md')) {
            const route = toManualRoute(path.resolve(fileDir, relPart));
            if (route) link.url = hash ? `${route}#${hash}` : route;
          }
        }
      }
      const children = (node as { children?: Node[] }).children;
      if (children) for (const child of children) walk(child);
    }

    walk(tree);
  };
}
