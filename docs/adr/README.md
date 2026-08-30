# Architecture Decision Records

Decisions about OPDA's framework, governance, and tooling that materially
shape how the project evolves. Each ADR captures the context, the options
considered, the decision, and its consequences — so future contributors
don't have to re-litigate.

## Conventions

ADRs follow canonical [MADR 4.x](https://adr.github.io/madr/) with two
project extensions (per the `ruflo-adr` `adr-create` skill):

- A `tags:` frontmatter field for cross-cutting categorisation.
- Four typed-relation frontmatter slots: `supersedes:`, `amends:`,
  `depends-on:`, `implements:`.

Specifics:

- **Sequential, global numbering.** `ADR-0001`, `ADR-0002`, … New ADRs
  pick the next free number; do not skip or re-use.
- **Flat directory.** All ADRs live directly under `docs/adr/`. Topic
  sub-folders (the old `dcam-framework/`, `information-architecture/`)
  created number clashes — avoid.
- **Filename**: `ADR-NNNN-<slug>.md` — 4-digit zero-padded number,
  lowercase kebab-case slug. The `ADR-` prefix disambiguates against the
  ODR corpus in `docs/ontology/odr/ODR-NNNN-<slug>.md`.
- **H1**: title only, no `ADR-NNNN —` prefix (the number lives in the
  filename).
- **Frontmatter (YAML)**: `status`, `date`, `tags`, `supersedes`, `amends`,
  `depends-on`, `implements`. DACI fields (`decision-makers`,
  `consulted`, `informed`) are intentionally omitted —
  `git log --follow <file>` is the canonical authorship surface.
- **Status enum**: `proposed | accepted | implemented | rejected | deprecated |
  superseded by ADR-NNNN`. Lowercase exactly as listed. Use `implemented`
  only when the decision's complete implementation and validation gates have passed;
  partial delivery detail belongs in `### Confirmation`.
- **Required body sections**: `## Context and Problem Statement`,
  `## Considered Options` (bullet list), `## Decision Outcome`
  containing `### Consequences` (flat `Good, because…` / `Bad,
  because…` / `Neutral, because…` bullets) and `### Confirmation`.
- **Optional**: `## Decision Drivers`, `## Pros and Cons of the
  Options` (with `### {Option}` per option), `## More Information`.
- **Trailing project-specific extensions** (use sparingly): `## Rules`,
  `## Vote and Dissent`, `## Amendments`, `## Mapping`.

Use the `/ruflo-adr:adr-create <title>` skill to scaffold a new ADR
with the next sequential number and canonical sections.

## Index

| # | Title | Status |
|---|---|---|
| [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) | Selective adoption of DCAM v3 and DAMA-DMBOK2 elements | accepted |
| [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) | Folder hierarchy and slug taxonomy | accepted · shipped 2026-05-18 |
| [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) | Refactor to idiomatic Astro architecture | accepted · shipped 2026-05-18 |
| [ADR-0004](./ADR-0004-accreditation-directory.md) | Accreditation Directory spec | proposed |
| [ADR-0005](./ADR-0005-deferred-work-register.md) | Deferred work register | accepted · living document |

## July 2026 modelling-strategy sequence

These linked decision records capture the current strategy work while the public
modelling website remains unchanged:

| # | Title | Status |
|---|---|---|
| [ADR-0063](./ADR-0063-domain-led-bounded-context-working-groups.md) | Domain-led bounded-context working groups for SPDTF development | accepted |
| [ADR-0064](./ADR-0064-modelling-website-revamp-before-strategy-publication.md) | Revamp the modelling website before publishing the new working-group approach | accepted |
| [ADR-0065](./ADR-0065-ai-assisted-evidence-to-model-workflow.md) | AI-assisted evidence-to-model workflow with human-governed review | proposed |

## August 2026 greenfield Property Pack ontology sequence

| # | Title | Status |
|---|---|---|
| [ADR-0066](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md) | The 451 required Property Pack data points are the closed seed scope for a greenfield ontology | accepted |
| [ADR-0067](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md) | Model the Property Pack from first principles with bounded-context ownership | accepted |
| [ADR-0068](./ADR-0068-govern-opda-standards-lifecycle.md) | Govern the OPDA standards lifecycle through human consensus and staged ratification | proposed |
| [ADR-0075](./ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md) | Treat the Property Pack ontology as an accelerated SPDTF component | accepted · implementation pending |

## August 2026 working-group operations and recruitment

| # | Title | Status |
|---|---|---|
| [ADR-0069](./ADR-0069-public-working-group-recruitment-and-signup.md) | Recruit later bounded-context working groups through a public campaign and simple sign-up | accepted |
| [ADR-0070](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md) | Operate OPDA working groups through a uniform Microsoft 365 workspace pattern | accepted |
| [ADR-0071](./ADR-0071-bounded-context-recruitment-campaign.md) | Recruit later bounded-context groups through a coordinated public campaign | accepted |
| [ADR-0072](./ADR-0072-scheduled-working-group-inbox-agent.md) | Operate a scheduled, harnessed working-group inbox agent | accepted |
| [ADR-0078](./ADR-0078-create-a-standalone-working-group-recruitment-campaign-at-join.md) | Create a standalone working-group recruitment campaign at `/join` | accepted |

## August 2026 website architecture and design

| # | Title | Status |
|---|---|---|
| [ADR-0073](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md) | Adopt the OPDA brand and replace the website design system | implemented |
| [ADR-0074](./ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md) | Organise the site around SPDTF and the PDTF schema | implemented · amended |
| [ADR-0076](./ADR-0076-consolidate-pdtf-schema-documentation-under-hierarchy-reflecting-routes.md) | Consolidate PDTF schema documentation under hierarchy-reflecting routes | superseded by ADR-0077 |
| [ADR-0077](./ADR-0077-place-pdtf-schema-beneath-spdtf-as-third-party-input.md) | Place the PDTF schema beneath SPDTF as a third-party input | accepted · implementation pending |
| [ADR-0079](./ADR-0079-make-the-site-public-and-retire-the-edge-authentication-gate.md) | Make the site public and retire the edge authentication gate | accepted |
| [ADR-0080](./ADR-0080-add-purposeful-graphics-to-the-opda-homepage.md) | Add purposeful graphics to the OPDA homepage | accepted · validation pending |

## Authoring a new ADR

1. Run `/ruflo-adr:adr-create "<short title>"` — the skill picks the
   next number and scaffolds the file with the canonical MADR template.
2. Cross-link related ADRs through `supersedes:`, `amends:`, `depends-on:`,
   `implements:` (frontmatter) and `## More Information` (human prose).
3. Update this index.

ADRs are living decisions with auditable history. After ratification:

- update `status`, `updated`, authority-bearing decision text and consequences when a
  later authorised correction would otherwise leave the active decision contradictory;
- record the reason, authority and preservation boundary in a dated `## Amendments`
  entry;
- preserve factual source provenance, stable identifiers, transcripts and original
  technical evidence unless a separate decision explicitly changes them; and
- fix typos and broken cross-references when discovered.

Do not silently rewrite history. Keep the original decision's material context and
considered options where they remain factual, use Git history for verbatim prior text,
and make every substantive correction explicit in the record itself.
