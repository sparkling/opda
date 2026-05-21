# ODR Decision-Application Profile (DCAP)

The normative profile for Ontology Decision Records under `docs/ontology/odr/`. It is the prose specification that `odr-review` Lint 3 (DCAP profile conformance) checks each record against. ODRs follow canonical [MADR 4.x](https://adr.github.io/madr/) with the named project extensions declared below.

This profile is text-based by design. SHACL shape graphs and pySHACL CI are out of scope; this prose profile is the equivalent contract.

## Scope

- **Applies to**: every `docs/ontology/odr/ONT-NNNN-*.md` record file.
- **Excluded**: `README.md`, `INDEX.md`, `DCAP.md`, `DCAP-audit-log.md`, `_template.md`, and council session siblings under `council/`.

## Filename and heading

- **Filename**: `ONT-NNNN-<slug>.md` — 4-digit zero-padded number, lowercase kebab-case slug. Sub-letter suffixes (`ONT-0071a`) are permitted for child records.
- **H1**: `# <Title>` — title only, **no `ONT-NNNN:` prefix**. The number lives in the filename.
- **Order**: YAML frontmatter leads the file (between `---` fences), then the H1, then the sections below.

## Frontmatter

YAML frontmatter between leading `---` fences, before the H1. Keys MUST be a **subset** of the declared set. No other keys are permitted (legacy DACI keys `deciders`/`consulted`/`informed` are tolerated only during the migration window and removed mechanically).

| Key | Required | Type | Rule |
|---|---|---|---|
| `status` | yes | enum | One of `proposed`, `accepted`, `rejected`, `deprecated`, `superseded` (lowercase exactly). |
| `date` | yes | string | `YYYY-MM-DD`. |
| `tags` | yes | list | Cross-cutting categorisation. May be empty (`[]`). |
| `supersedes` | yes | list | Record IDs this record replaces. May be empty. **Intra-corpus only** (ONT↔ONT). |
| `depends-on` | yes | list | Record IDs this record cites / requires for coherence. May be empty. **Cross-corpus allowed** (ONT↔ADR). |
| `implements` | yes | list | Record IDs whose parent decision this record realises. May be empty. **Intra-corpus only** (ONT→ONT). |

### Typed-relation semantics

| Slot | Meaning | Corpus rule |
|---|---|---|
| `supersedes:` | Replaces — kills the prior record. | Intra-corpus only. |
| `depends-on:` | Cites — correctness/coherence requires the cited record to hold. | Cross-corpus allowed. |
| `implements:` | Realises — this record is the artefact realising a parent decision. | Intra-corpus only. |

- **Inverse properties are forbidden in frontmatter.** `superseded-by:`, `depended-on-by:`, `implemented-by:` are derived at index time by `odr-index` from forward edges. Authoring them fails Lint 4.
- **Referential integrity**: every `ONT-NNNN` reference MUST resolve to a file under `docs/ontology/odr/`; every `ADR-NNNN` reference MUST resolve to `docs/adr/NNNN-*.md`. References to external corpora (e.g. the H&M `ONT-0021` source programme) MUST NOT appear in frontmatter — cite them in `## More Information` prose instead.

## Sections

Section headings MUST be a subset of those declared here, MUST appear in the declared order, and the cardinality rules MUST hold. Any heading not declared here fails Lint 3 until this DCAP is amended in the same commit.

| # | Heading | Level | Required | Cardinality |
|---|---|---|---|---|
| 1 | `## Context and Problem Statement` | H2 | yes | exactly 1 |
| 2 | `## Decision Drivers` | H2 | optional | 0–1 |
| 3 | `## Considered Options` | H2 | yes | exactly 1 |
| 4 | `## Decision Outcome` | H2 | yes | exactly 1 |
| 4a | `### Consequences` | H3 (under 4) | yes | exactly 1 |
| 4b | `### Confirmation` | H3 (under 4) | optional | 0–1 |
| 4c | `### Supersession scope` | H3 (under 4) | conditional | 0–1 — present iff this record partially supersedes another |
| 5 | `## Pros and Cons of the Options` | H2 | optional | 0–1 |
| 5a | `### <Option>` | H3 (under 5) | optional | 0–n, one per option |
| 6 | `## More Information` | H2 | optional | 0–1 |

### Named extensions (trailing position, after `## More Information`)

Project-specific extensions to canonical MADR. Optional; when present they appear after `## More Information` in this order:

| Heading | Purpose | OntoClean rigidity test |
|---|---|---|
| `## Rules` | Durable normative content scoped to this ODR's lifetime. | If rules survive supersession → they belong in `docs/policy/`. If they evaporate with supersession → they belong in `### Consequences`. The extension is the only-when-needed middle. |
| `## Vote and Dissent` | Compact summary of Linked Data Council verdicts (tallies, dissents, withdrawals). The full transcript lives in `council/session-NNN-*.md`; this is a summary, not the transcript. | — |
| `## Amendments` | Running list of post-acceptance amendments to this record. | — |

## Consequences phrasing

`### Consequences` uses flat bullets with canonical phrasing:

- `* Good, because <positive consequence>`
- `* Bad, because <negative consequence>`
- `* Neutral, because <neutral consequence>`

## Confirmation

`### Confirmation` states how compliance with the decision is verified — review, SHACL shape, lint rule, exemplar validation, etc. For records that gate downstream work (e.g. the identity crux), the gate condition is stated here.

## Supersession

For full supersession, the superseding record carries the prior record's ID in `supersedes:` and the superseded record's `status` becomes `superseded`. For **partial** supersession (amendment), the superseding record additionally carries a `### Supersession scope` subsection inside `## Decision Outcome` describing precisely what of the prior record survives and what is replaced.

## Lints enforced by `odr-review`

1. **Cross-corpus modifying-relations** — `supersedes`/`implements` must be intra-corpus; `depends-on` may cross.
2. **Referential integrity** — every typed reference resolves to a real file.
3. **DCAP profile conformance** — frontmatter keys, section headings, ordering, cardinality conform to this profile.
4. **Inverse-authoring prohibition** — no `superseded-by`/`depended-on-by`/`implemented-by` in frontmatter.

## Amendment policy

New sections, new frontmatter keys, or section reorderings require an edit to this DCAP **in the same commit** (undeclared-extension policy). The companion `DCAP-audit-log.md` records quarterly reviews even when no change was made.
