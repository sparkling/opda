/**
 * OPDA Knowledge Base — canonical site data.
 *
 * Single source of truth for sections, sidebar groups, and pages.
 * Imported by Astro components at build time; no runtime parsing.
 *
 * URL convention (per docs/adr/0002 folder hierarchy):
 *   • Bare slug, no .html, no trailing slash.
 *   • Section root:   /{section}              (e.g. /governance)
 *   • Section page:   /{section}/{slug}       (e.g. /governance/data-stewardship)
 *   • Nested page:    /{section}/.../{slug}   (deep hierarchy in schema)
 */

import { getPdtf1ReplacementRoute } from './pdtf1-routes.mjs';
import { CONTEXT_SOURCE_SECTIONS } from './site-sections-context.ts';
import { PDTF_SOURCE_SECTIONS } from './site-sections-pdtf.ts';

export type Item = {
  /** Canonical URL — matches Astro.url.pathname (no trailing slash). */
  url: string;
  /** Display label in sidebar and breadcrumbs. */
  title: string;
  /** Nested items (used by the schema section's deep tree only). */
  children?: Item[];
};

export type Group = {
  heading: string;
  items: Item[];
};

export type Section = {
  /** URL-path segment, e.g. 'governance'. Section root URL is `/${key}`. */
  key: string;
  /** Display title, e.g. 'Governance'. */
  title: string;
  /** One-paragraph section summary, shown on the landing and the header. */
  summary: string;
  /** Sidebar groups. The "Overview" pseudo-group links back to /{key}. */
  groups: Group[];
};

/** Global header ordering — left to right. */
export const HEADER_ORDER = [
  'strategy',
  'governance',
  'dbt-smart-data',
  'engagement',
  'modelling',
  'model',
  'property-pack',
  'ontology',
  'mapping',
  'schema',
  'implementation',
  'adoption',
  'library',
] as const;

const SOURCE_SECTIONS_BY_KEY: Record<string, Section> = {
  ...CONTEXT_SOURCE_SECTIONS,
  ...PDTF_SOURCE_SECTIONS,
};

const SOURCE_SECTIONS: Record<string, Section> = Object.fromEntries(
  HEADER_ORDER.map((key) => [key, SOURCE_SECTIONS_BY_KEY[key]]),
);

const canonicalPdtfItem = (item: Item): Item => ({
  ...item,
  url: getPdtf1ReplacementRoute(item.url) ?? item.url,
  children: item.children?.map(canonicalPdtfItem),
});

/**
 * The section keys remain useful content-source groupings, while every PDTF 1.0
 * reader URL is projected into the canonical two-branch hierarchy. Governance
 * records under /modelling/adr and /modelling/odr are deliberately unchanged.
 */
export const SECTIONS: Record<string, Section> = Object.fromEntries(
  Object.entries(SOURCE_SECTIONS).map(([key, section]) => [key, {
    ...section,
    groups: section.groups.map((group) => ({
      ...group,
      items: group.items.map(canonicalPdtfItem),
    })),
  }]),
);

/** Top-level reference items (cross-section utilities). */
export const REFERENCE_ITEMS = [
  { url: '/glossary',      title: 'Glossary (acronyms)' },
  { url: '/design-system', title: 'Design system' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Walk an item tree depth-first, yielding every leaf and folder.
 * Used by find/flatten/getPrevNext.
 */
function* walkItems(items: Item[]): Generator<Item> {
  for (const item of items) {
    yield item;
    if (item.children) yield* walkItems(item.children);
  }
}

/**
 * Find the section + group + item that owns a given URL.
 * Returns null for URLs not in any section (top-level reference items,
 * 404s, externally-linked pages).
 */
export function findPage(path: string):
  { section: Section; group?: Group; item?: Item } | null {
  const norm = normalizeUrl(path);
  for (const key of Object.keys(SECTIONS)) {
    const section = SECTIONS[key];
    for (const group of section.groups) {
      for (const item of walkItems(group.items)) {
        if (normalizeUrl(item.url) === norm) return { section, group, item };
      }
    }
  }
  // Generated detail routes (for example Property Pack resources/{context}/{term}) are
  // intentionally absent from the sidebar taxonomy. They still belong to the
  // section and need its header/sidebar shell; their page layout supplies the
  // deeper, record-specific breadcrumb.
  const sectionKey = norm.split('/').filter(Boolean)[0];
  if (norm.startsWith('/spdtf-2/property-pack/')) return { section: SECTIONS['property-pack'] };
  return null;
}

/** Which section does this URL belong to? */
export function getActiveSection(path: string): string | null {
  const found = findPage(path);
  return found?.section.key ?? null;
}

/**
 * Flatten a section's sidebar into a sequential reading order.
 * Used to compute prev/next links.
 */
export function flatten(section: Section): Item[] {
  const out: Item[] = [];
  for (const group of section.groups) {
    for (const item of walkItems(group.items)) {
      out.push(item);
    }
  }
  return out;
}

/**
 * Prev/next links for the given page within its section's sidebar order.
 * Returns undefined for either when at the start/end of the section.
 */
export function getPrevNext(path: string): { prev?: Item; next?: Item } {
  const found = findPage(path);
  if (!found) return {};
  const flat = flatten(found.section);
  const norm = normalizeUrl(path);
  const idx = flat.findIndex(i => normalizeUrl(i.url) === norm);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}

/** Normalize for comparison: strip trailing slash (except root). */
export function normalizeUrl(url: string): string {
  if (url === '/') return url;
  return url.replace(/\/$/, '');
}
