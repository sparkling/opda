---
status: proposed
date: 2026-06-14
tags: [information-architecture, routing, rename, manual, model, astro]
supersedes: []
depends-on: [ADR-0002, ADR-0016, ADR-0041]
implements: []
---

# Rename the `/manual` Section to `/model`

## Context and Problem Statement

The webapp section whose nav title is already **"Model"** (the DAMA four-tier presentation of the ontology — concept → logical → physical-ontology → physical-database/relational) is served at the URL `/manual`. The URL is wrong: the section *is* the model, and operator direction (2026-06-14) is that it should live at `/model`. This was surfaced as work-item **M5** of the adversarial review of [ADR-0041](./ADR-0041-ontology-reference-document-generation.md): the rename is a pure information-architecture cleanup with **nothing to do** with the ontology-documentation generation decision, and bundling the two coupled a risky ~38-file refactor to the doc work. This ADR splits it out so each stands alone.

The IA target (ADR-0041 §Hosting): three sibling sections — `/modelling` (working/process pages, unchanged), **`/model`** (this rename — the DAMA tiered manual), and `/ontology` (the new generated reference). Redundancy between them is accepted (ADR-0041 rev-3, M1 dismissed); this ADR concerns only the URL move.

## Decision Drivers

* The section's URL should match its identity — the nav title is already "Model".
* Minimise blast radius: the rename touches ~38 files, a remark link-rewrite plugin, dynamic routes, and the section key.
* Preserve external links (a `/manual/*` → `/model/*` redirect).
* `make build` green is the non-negotiable acceptance gate (the route, collection, and link graph must stay coherent).

## Considered Options

* **Option A (chosen) — URL-only rename; keep the internal `manual` content collection name + `docs/manual/` source.** Rename the page routes and all user-facing URLs to `/model`; leave the internal collection identifier and source directory as `manual` (they are not URLs). Smallest coherent change that fixes the URL.
* **Option B — Full rename, including the `manual` content collection and `docs/manual/` source directory → `model`.** Rejected: larger blast radius (collection schema, `src/content.config.ts`, `src/lib/manual.ts`, every collection consumer) for **zero** user-facing benefit — the collection name is internal.
* **Option C — Leave it at `/manual`.** Rejected: operator ruled the URL wrong; "Model" at `/manual` is an IA inconsistency.

## Decision Outcome

Chosen option: "Option A — URL-only rename", because it fixes the user-facing URL while keeping the blast radius to routes + links + nav, leaving the internal collection plumbing untouched.

**Migration footprint** (one build-verified pass):
- Rename `src/pages/manual/` → `src/pages/model/` (incl. the dynamic `[...slug]` tier routes and `index.astro`).
- `src/lib/site.ts`: section key `manual` → `model` (the header builds URLs as `/${key}`); all `/manual/...` nav `url`s → `/model/...`; section `title` stays "Model".
- Update the ~38 `/manual`-referencing files: components under `src/components/manual/`, `src/lib/{manual,cross-tier,diagram-links,entity-api}.ts`, the `remarkRewriteManualLinks` plugin + its `astro.config.mjs` wiring, the GRLC handler, the `src/pages/modelling/*` cross-links, and the regenerated `src/generated/ia-*.html`.
- Keep the internal `manual` content collection (`src/content.config.ts`, `base: './docs/manual'`) and `docs/manual/` source unchanged.
- Add `/manual/* → /model/*` redirects (`astro.config.mjs` `redirects`) for external links. **As-built:** Astro rejects a single `/manual/[...slug]` → `/model/[...slug]` catch-all (the destination must match a real route pattern, and the section is split into per-tier `[...slug]` routes), so the redirect is emitted **per tier** (`/manual/concept/[...slug]` → `/model/concept/[...slug]`, `/manual/logical/...`, `/manual/physical-ontology/...`, `/manual/physical-database/...`, `/manual/physical-relational/...`) plus `/manual` → `/model`. Deep slugs verified to carry through.

### Consequences

* Good, because the URL finally matches the section's identity, and the change is contained to routing/links/nav.
* Good, because keeping the internal collection name avoids touching the collection schema and its consumers — minimal blast radius.
* Bad, because it still touches ~38 files + a remark plugin; a missed reference is a broken link, caught only by the build.
* Neutral, because the redirect keeps old `/manual/*` URLs alive; no external link breaks.

### Confirmation

* `make build` is green (the acceptance gate).
* `grep -r "/manual" src/` returns only the redirect rule and intentional internal-collection references — no live `/manual/...` route links remain.
* The `/manual/* → /model/*` redirect resolves.
* In-site navigation to every former `/manual/...` page works under `/model/...` (view-transition nav included — [[opda-view-transition-render-patterns]]).

## More Information

* Parent IA decision: [ADR-0041 §Hosting](./ADR-0041-ontology-reference-document-generation.md) (the three-section IA; this rename is its M5 split).
* Slug taxonomy: [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md).
* Manual content-collection wiring: [ADR-0016](./ADR-0016-manual-content-collection-wiring.md) (the collection this rename deliberately leaves internal).
