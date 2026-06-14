/**
 * Registry of generator-produced report fragments (ADR-0021 §"Separate task").
 *
 * Single source of truth shared by the report-generator integration
 * (src/integrations/generate-report-html.mjs, which emits the HTML) and the
 * pages that serve the fragments. Each editorial meta-markdown document is
 * converted to a static HTML fragment at build time and served via set:html —
 * the report generator generates the static HTML, the page serves it.
 */

/** Standalone report rendered by src/pages/model/validation-report.astro. */
export const VALIDATION_REPORT = {
  slug: 'validation-report',
  src: 'docs/manual/VALIDATION-REPORT.md',
};

/** IA-spec documents rendered by src/pages/model/information-architecture/[spec].astro. */
export const IA_SPECS = [
  { slug: 'overview',          src: 'docs/information-architecture/README.md',               title: 'Information architecture — overview' },
  { slug: 'concept-model',     src: 'docs/information-architecture/concept-model-ia.md',     title: 'Concept-tier IA specification' },
  { slug: 'logical-model',     src: 'docs/information-architecture/logical-model-ia.md',     title: 'Logical-tier IA specification' },
  { slug: 'physical-database', src: 'docs/information-architecture/physical-database-ia.md', title: 'Physical (deployment) IA specification' },
  { slug: 'physical-ontology', src: 'docs/information-architecture/physical-ontology-ia.md', title: 'Physical (ontology) IA specification' },
];

/** IA-spec .md filenames → Astro route, for rewriting intra-IA cross-links. */
export const IA_LINK_MAP = {
  'README.md':               '/model/information-architecture/overview',
  'concept-model-ia.md':     '/model/information-architecture/concept-model',
  'logical-model-ia.md':     '/model/information-architecture/logical-model',
  'physical-database-ia.md': '/model/information-architecture/physical-database',
  'physical-ontology-ia.md': '/model/information-architecture/physical-ontology',
};

/** All generator jobs: {src, out, group}. IA fragments are prefixed `ia-`. */
export const REPORT_JOBS = [
  { src: VALIDATION_REPORT.src, out: `src/generated/${VALIDATION_REPORT.slug}.html`, group: 'report' },
  ...IA_SPECS.map((s) => ({ src: s.src, out: `src/generated/ia-${s.slug}.html`, group: 'ia' })),
];
