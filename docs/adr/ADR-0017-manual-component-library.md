---
status: proposed
date: 2026-05-28
tags: [website, components, design-system, dark-mode, astro]
supersedes: []
depends-on: [ADR-0003, ADR-0015, ADR-0016]
implements: [ADR-0015]
---

# Manual component library (12 reusable components + accent tokens)

## Context and Problem Statement

[ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md) names 12 reusable Astro components under `src/components/manual/` that the per-tier dynamic routes ([ADR-0016](./ADR-0016-manual-content-collection-wiring.md)) compose to render the 228 manual entries. This ADR specifies + implements those 12 components.

Per the [implementation programme plan §4](../plan/manual-astro-integration.md), this is **Phase 2** — runs in parallel with Phase 3 (ADR-0018 plumbing) once Phase 1 (ADR-0016) is green.

Realises ADR-0015 `§Confirmation` criteria 4 (12 components live), 6 (dark/light toggle works), 9 (no new design tokens beyond accent).

The 12 components per ADR-0015's "Reusable components" table:

| Component | Role |
|---|---|
| `TierLanding.astro` | Hero + tier-summary + audience callout |
| `ModuleLanding.astro` | Module overview header |
| `EntityPage.astro` | Concept / Logical / Physical-Ontology entity wrapper |
| `SchemePage.astro` | SKOS scheme wrapper |
| `ExemplarPage.astro` | Exemplar + paired expected-report wrapper |
| `CrossCuttingPage.astro` | three-graph-separation / severity-tiers / shacl-af-rules wrapper |
| `EntityHeader.astro` | UFO meta-category badge + module breadcrumb + cross-tier strip |
| `AttributeTable.astro` | Logical-tier typed-attribute table |
| `TurtleBlock.astro` | Physical-Ontology Turtle block with copy-to-clipboard |
| `SchemeMembersTable.astro` | SKOS scheme members table |
| `ShapeBlock.astro` | SHACL shape block with severity-tier badge |
| `CrossTierLinks.astro` | Footer strip linking the 4 tiers' versions |

## Decision Drivers

* No new design system primitives — every component composes existing CSS custom properties from `src/styles/global.css`. Per ADR-0015 §"Design-system reuse".
* Dark/light toggle inherited — components use the existing `[data-theme="dark"]` selector + the existing token system. Per ADR-0015 §Confirmation #9.
* Mermaid blocks pass through unchanged — components don't init Mermaid; the existing `public/ui/client.js` handles it. Per ADR-0015 §Confirmation #5.
* Component-level dark-mode test: each component's visual smoke-test confirms colour swap on theme toggle.
* Accent tokens (UFO meta-category badge colours, severity-tier badge colours) declared as CSS custom properties under `:root` + `[data-theme="dark"]` — extending the existing token system, not bypassing.

## Considered Options

* **A — 12 thin components composing existing primitives** — chosen per ADR-0015 option B.
* **B — One mega-component with mode switching** — fewer files but less navigable; harder to dark-mode-test per component.
* **C — Web components / lit-element** — over-engineered for static-site rendering; introduces a runtime dependency Astro avoids.

## Decision Outcome

*TBD by implementing session per programme plan §7.* The 12 components ship with:

1. Doc-comment header per file citing ADR-0017 + ADR-0015
2. Props + slots typed via TypeScript per the Astro `Props` convention
3. CSS scoped via Astro's `<style>` block; tokens referenced via `var(--token-name)`
4. Dark-mode tested by toggling `[data-theme="dark"]` on a sample render

### Consequences

*TBD by implementing session.*

### Confirmation

*TBD by implementing session.* Programme-wide gates apply.

Specific to this ADR:

1. All 12 components exist under `src/components/manual/`
2. Each component has a doc-comment header citing this ADR + ADR-0015
3. Dark-mode toggle on a sample manual page (one per tier) re-renders without colour artefacts; Mermaid blocks re-render with the dark theme variables
4. No CSS rules outside the existing token system (no hex literals; everything via `var()`)
5. Accent tokens for UFO category + severity tier defined under `:root` + `[data-theme="dark"]`
6. Validation report at `docs/adr/validation/ADR-0017-validation-report.md`

## More Information

* **Programme plan:** [`docs/plan/manual-astro-integration.md`](../plan/manual-astro-integration.md)
* **Architectural decision:** [ADR-0015 §"Reusable components"](./ADR-0015-integrate-manual-into-astro-site.md)
* **Bootstrap predecessor:** [ADR-0016](./ADR-0016-manual-content-collection-wiring.md)
* **Existing token system:** `src/styles/global.css` + `public/ui/design-system.css`
* **Existing mermaid loader (reused):** `public/ui/client.js:228-269`
* **Parallel ADR:** [ADR-0018](./ADR-0018-manual-remark-rehype-plugins.md) — build-time plumbing; safe to run in parallel
