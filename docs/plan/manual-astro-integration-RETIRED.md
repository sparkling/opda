# Manual-Astro-Integration Programme — RETIRED

**Retired:** 2026-05-28
**Anchor:** ADR-0015 — Integrate 4-tier ontology manual into the Astro site
**Sub-ADRs:** ADR-0016, ADR-0017, ADR-0018, ADR-0019, ADR-0020 — all `status: accepted`
**ADR-0015 §Confirmation:** 10/10 green (8 confirmed by artefact inspection; 2 by static-inspection basis accepted per programme plan §8)
**Deployment:** deferred to next push-to-main (CI deploys via GitHub Actions → Cloudflare Pages)

## What was built

A working `/manual/` section on the OPDA Astro site, covering the 4-tier ontology manual (228 markdown files derived from 24 TTLs):

- `src/lib/site.ts` — `manual` section in `HEADER_ORDER` between `modelling` and `schema`; per-tier sidebar groups
- `src/content.config.ts` — Astro content collection sourced from `docs/manual/`
- `src/pages/manual/{concept,logical,physical-database,physical-ontology}/[...slug].astro` — four dynamic routes
- `src/components/manual/*.astro` — 12 reusable components (EntityPage, SchemePage, ExemplarPage, TierLanding, ModuleLanding, CrossCuttingPage, EntityHeader, AttributeTable, TurtleBlock, SchemeMembersTable, ShapeBlock, CrossTierLinks)
- `src/lib/remark/` — two build-time plugins (unwrap mermaid details; frontmatter URI extraction)
- Phase 4 bidirectional cross-links: 8 modelling pages cross-link to manual tiers; 4 tier READMEs link back
- `tools/opda-gen/src/opda_gen/emitters/manual.py` — `emit_manual()` generator extension; 184 manual markdowns carry collection-valid frontmatter; idempotent; 31 new tests

## Build result

`npm run build` → exit 0, 386 pages (219 under `dist/manual/`), zero Zod errors.

## Open follow-ups (non-blocking)

- **G20a** — `cli.py` `emit-profile` tail calls `emit_manual` (wrong placement; should be in `emit` umbrella). Fix before next `emit-profile` use.
- **G20b** — `pyyaml` not declared in `pyproject.toml` `[project.dependencies]`. Add before next CI run invoking `emit-manual`.

## Successor

Subsequent manual content updates: regenerate via `opda-gen emit-manual --output docs/manual`, commit, push — next site build picks up automatically.

Subsequent component / template changes: fresh ADRs, no need to revisit this programme's sequencing.
