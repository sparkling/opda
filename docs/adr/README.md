# Architecture Decision Records

Decisions about OPDA's framework, governance, and tooling that materially
shape how the project evolves. Each ADR captures the context, the options
considered, the decision, and its consequences — so future contributors
don't have to re-litigate.

## Conventions

ADRs follow canonical [MADR 4.x](https://adr.github.io/madr/) with two
project extensions (per the `ruflo-adr` `adr-create` skill):

- A `tags:` frontmatter field for cross-cutting categorisation.
- Three typed-relation frontmatter slots: `supersedes:`, `depends-on:`,
  `implements:`.

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
- **Frontmatter (YAML)**: `status`, `date`, `tags`, `supersedes`,
  `depends-on`, `implements`. DACI fields (`decision-makers`,
  `consulted`, `informed`) are intentionally omitted —
  `git log --follow <file>` is the canonical authorship surface.
- **Status enum**: `proposed | accepted | rejected | deprecated |
  superseded by ADR-NNNN`. Lowercase exactly as listed. Implementation
  status (shipped, in progress, paused) belongs in `### Confirmation`,
  not the status line.
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
| [ADR-0001](./ADR-0001-adopt-dcam-dmbok-elements.md) | Selective adoption of DCAM v3 and DAMA-DMBOK2 elements | proposed |
| [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) | Folder hierarchy and slug taxonomy | accepted · shipped 2026-05-18 |
| [ADR-0003](./ADR-0003-idiomatic-astro-refactor.md) | Refactor to idiomatic Astro architecture | accepted · shipped 2026-05-18 |
| [ADR-0004](./ADR-0004-accreditation-directory.md) | Accreditation Directory spec | proposed |
| [ADR-0005](./ADR-0005-deferred-work-register.md) | Deferred work register | accepted · living document |

## Authoring a new ADR

1. Run `/ruflo-adr:adr-create "<short title>"` — the skill picks the
   next number and scaffolds the file with the canonical MADR template.
2. Cross-link related ADRs through `supersedes:`, `depends-on:`,
   `implements:` (frontmatter) and `## More Information` (human prose).
3. Update this index.

ADRs are immutable history. After ratification, edit them only to:

- update the `status` frontmatter (e.g. when superseded);
- record review outcomes in `## Amendments` or `## Vote and Dissent`;
- fix typos or broken cross-references.

Never rewrite the original analysis.
