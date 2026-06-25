/**
 * Realises ADR-0016 (manual content-collection wiring) per ADR-0015.
 * Declares the `manual` content collection sourced from docs/manual/.
 *
 * Schema is intentionally lenient: most of the 218 markdown files lack
 * frontmatter (they begin with "# Heading" directly). Required fields
 * are derived from the entry path at route-render time (see src/lib/manual.ts).
 * ADR-0020 (Phase 5) will extend the generator to emit collection-valid frontmatter.
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const manual = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './docs/manual',
  }),
  schema: z.object({
    title: z.string().optional(),
    status: z.string().optional(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    // Fields below are emitted by generator post-ADR-0020; optional until then.
    tier: z.string().optional(),
    module: z.string().optional(),
    kind: z.string().optional(),
    entityUri: z.string().optional(),
    sourceTtl: z.string().optional(),
    sourceOdr: z.string().optional(),
  }),
});

// ADR-0024: ODR records render through the SAME content-collection + markdown
// pipeline as the manual, so they inherit identical .prose styling and
// theme-aware diagram handling (client.js). Lenient schema — ODR frontmatter
// varies; .passthrough() keeps scope/council/supersedes/depends-on/implements.
const odr = defineCollection({
  loader: glob({
    pattern: 'ODR-[0-9]*.md',
    base: './docs/ontology/odr',
  }),
  schema: z.object({
    status: z.string().optional(),
    date: z.coerce.date().optional(),
    kind: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
});

// ADRs (MADR-format) render through the SAME content-collection + markdown
// pipeline as ODRs and the manual, inheriting identical .prose styling and
// theme-aware diagram handling. No `kind` facet (MADR has none); lenient
// .passthrough() keeps supersedes/depends-on/implements.
const adr = defineCollection({
  loader: glob({
    pattern: 'ADR-[0-9]*.md',
    base: './docs/adr',
  }),
  schema: z.object({
    status: z.string().optional(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
});

export const collections = { manual, odr, adr };
