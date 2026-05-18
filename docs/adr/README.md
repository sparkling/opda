# Architecture Decision Records

Decisions about OPDA's framework, governance, and tooling that materially
shape how the project evolves. Each ADR captures the context, the options
considered, the decision, and its consequences — so future contributors
don't have to re-litigate.

## Conventions

- **Sequential, global numbering.** `0001-…`, `0002-…`, `0003-…`. New ADRs
  pick the next free number; do not skip or re-use.
- **Flat directory.** All ADRs live directly under `docs/adr/`. Topic
  sub-folders (the old `dcam-framework/`, `information-architecture/`)
  created number clashes — avoid.
- **File name = `NNNN-kebab-case-slug.md`.** The slug describes the
  decision in 3-6 words.
- **Status.** One of: `Proposed`, `Accepted`, `Implemented`,
  `Superseded by NNNN`, `Deprecated`.
- **Status as a section, not a tag.** The status line in the frontmatter
  is the source of truth; the README index is best-effort.

## Index

| # | Title | Status |
|---|---|---|
| [0001](./0001-adopt-dcam-dmbok-elements.md) | Selective adoption of DCAM v3 and DAMA-DMBOK2 elements | Proposed (11 review points decided across two passes) |
| [0002](./0002-folder-hierarchy-and-slug-taxonomy.md) | Folder hierarchy and slug taxonomy | Implemented 2026-05-18 |
| [0003](./0003-idiomatic-astro-refactor.md) | Refactor to idiomatic Astro architecture | Implemented 2026-05-18 |
| [0004](./0004-accreditation-directory.md) | Accreditation Directory spec | Proposed (ready for C&R WG kick-off) |

## Authoring a new ADR

1. Copy an existing ADR as a template.
2. Use the next sequential number (check this index).
3. Lead with `# ADR NNNN — <decision title>`.
4. Required sections: Status, Date, Context, Decision drivers, Considered
   options, Decision, Consequences. Most ADRs also need Open questions
   and References.
5. Cross-link sibling ADRs (the "Related" field at the top).
6. Update this index.

ADRs are immutable history. After ratification, edit them only to:
- update the Status line (e.g. when superseded)
- record "Resolved during review" outcomes from the discussion
- fix typos or broken cross-references
Never rewrite the original analysis.
