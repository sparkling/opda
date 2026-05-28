/**
 * Realises ADR-0018 per ADR-0015. Build-time extraction of OPDA entity URIs
 * from markdown body for `entity`, `scheme`, and `exemplar` content kinds.
 *
 * Runs as a rehype plugin (after remark-to-hast conversion). Reads the
 * rendered hast tree + VFile to derive `entityUri` and writes it into
 * `file.data.astro.frontmatter.entityUri` so the render result carries it.
 *
 * Idempotent: if `entityUri` is already set, no-op.
 */

import type { Root, Element, Text } from 'hast';
import type { VFile } from 'vfile';
import { deriveKind } from '../manual.js';

/** Regex matching the docs/manual path segment used for entry id derivation. */
const MANUAL_PATH_RE = /docs[\\/]manual[\\/](.+?)(?:\.md)?$/;

/** Extracts the entry id (relative to docs/manual/) from a file path. */
function entryIdFromPath(filePath: string): string | null {
  const m = filePath.replace(/\\/g, '/').match(MANUAL_PATH_RE);
  if (!m) return null;
  // Normalise: lowercase, no .md extension — matches Astro's githubSlug() output
  return m[1].toLowerCase().replace(/\.md$/, '');
}

/** Derive the local name from the last path segment (file stem). */
function localNameFromId(id: string): string {
  const stem = id.split('/').pop() ?? id;
  // readme → use parent segment
  if (stem === 'readme') {
    const parent = id.split('/').slice(-2, -1)[0] ?? stem;
    return toUpperCamel(parent);
  }
  return toUpperCamel(stem);
}

/** Convert kebab-case to UpperCamelCase: "built-form" → "BuiltForm". */
function toUpperCamel(s: string): string {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Search the hast tree for the first heading containing `opda:<LocalName>`.
 * Targets nodes like `<h3>opda:Address</h3>`.
 */
function findOpdaUriInHast(tree: Root): string | null {
  const OPDA_URI_RE = /\bopda:([A-Za-z][A-Za-z0-9_-]*)\b/;

  function search(node: Root | Element): string | null {
    if (node.type === 'element') {
      const el = node as Element;
      // Only scan heading elements for the URI pattern
      if (/^h[1-6]$/.test(el.tagName)) {
        const text = extractText(el);
        const m = text.match(OPDA_URI_RE);
        if (m) return `opda:${m[1]}`;
      }
    }
    const children = (node as Root).children ?? [];
    for (const child of children) {
      if (child.type === 'element' || child.type === 'root') {
        const found = search(child as Element | Root);
        if (found) return found;
      }
    }
    return null;
  }

  return search(tree);
}

/** Extract all text content from a hast node. */
function extractText(node: Element | Root): string {
  const parts: string[] = [];
  for (const child of (node.children ?? [])) {
    if (child.type === 'text') parts.push((child as Text).value);
    else if (child.type === 'element') parts.push(extractText(child as Element));
  }
  return parts.join('');
}

/** Derive the OPDA URI for a given id and kind. */
function deriveUri(id: string, kind: string): string | undefined {
  // exemplar: no stable URI
  if (kind === 'exemplar') return undefined;

  // Try to find `opda:<Name>` in headings — done in the caller with hast access.
  // Fallback: derive from the last path segment (filename).
  const localName = localNameFromId(id);

  if (kind === 'scheme') {
    // Vocabulary files: "built-form" → "opda:BuiltFormScheme" (if stem doesn't already end in scheme)
    const suffix = localName.toLowerCase().endsWith('scheme') ? '' : 'Scheme';
    return `opda:${localName}${suffix}`;
  }

  // entity: "opda:Property", "opda:Address" etc.
  return `opda:${localName}`;
}

/** Rehype plugin: extract OPDA entity URI from hast and write to vfile.data. */
export function rehypeFrontmatterUriExtraction() {
  return function transformer(tree: Root, file: VFile): void {
    const filePath = file.path ?? (file as unknown as {history?: string[]}).history?.[0];
    if (!filePath) return;

    const id = entryIdFromPath(filePath);
    if (!id) return;

    const kind = deriveKind(id);
    if (kind !== 'entity' && kind !== 'scheme' && kind !== 'exemplar') return;

    // Ensure vfile data structure is initialised
    const data = file.data as { astro?: { frontmatter?: Record<string, unknown> } };
    data.astro ??= {};
    data.astro.frontmatter ??= {};

    // Idempotent: skip if already set
    if (data.astro.frontmatter.entityUri) return;

    // For entity + scheme: try heading-based extraction first
    let uri: string | undefined;
    if (kind !== 'exemplar') {
      uri = findOpdaUriInHast(tree) ?? deriveUri(id, kind);
    }

    if (uri) {
      data.astro.frontmatter.entityUri = uri;
    }
  };
}
