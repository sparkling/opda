# ODR Decision-Application Profile (DCAP)

The normative profile for Ontology Decision Records under `docs/ontology/odr/`. It is the prose specification that `odr-review` checks each record against.

This profile is text-based by design. SHACL shape graphs and pySHACL CI are out of scope; this prose profile is the equivalent contract.

## Purpose

An ODR records a decision about ontology design — how source-data elements (typically PDTF v3 clauses) map into the OPDA ontology, what reusable modelling conventions apply, what architectural framework holds. The ODR contains the **decision** and the **rules** that decision produces. It does NOT contain the deliberation.

When a council session deliberated the decision, the session transcript lives in `council/session-NNN-*.md` and is cited from the ODR's `council:` frontmatter field. When the decision is author-only (no council convened), `council:` is omitted — git is the authorship record.

ODRs cover ontology-modelling decisions. Schema-encoding decisions (how to express the ontology in JSON Schema, YAML, RDF, SHACL) are ADRs under `docs/adr/`.

## Scope

- **Applies to**: every `docs/ontology/odr/ODR-NNNN-*.md` record file.
- **Excluded**: `DCAP.md`, `DCAP-audit-log.md`, `_template.md`, and council session siblings under `council/`. (`README.md`, `INDEX.md` are forbidden — see Lint 7.)

## Filename and heading

- **Filename**: `ODR-NNNN-<slug>.md` — 4-digit zero-padded number, lowercase kebab-case slug. Sub-letter suffixes (`ODR-0071a`) are permitted for child records.
- **H1**: `# <Title>` — title only, no `ODR-NNNN:` prefix.
- **Order**: YAML frontmatter, then H1, then the six required H2 sections in declared order.

## Frontmatter

YAML between leading `---` fences before the H1. Keys MUST be a subset of the declared set; no other keys are permitted.

| Key | Required | Type | Rule |
|---|---|---|---|
| `status` | yes | enum | `proposed` \| `accepted` \| `rejected` \| `deprecated` \| `superseded` (lowercase exactly) |
| `date` | yes | string | ISO `YYYY-MM-DD` |
| `kind` | yes | enum | `methodology` \| `architecture` \| `pattern` \| `mapping` \| `programme` |
| `tags` | yes | list | Cross-cutting categorisation. May be empty (`[]`) |
| `scope` | yes | list | Typed source-data references this ODR governs (e.g. `pdtf-v3:propertyPack.titleNumber`). May be empty |
| `council` | no | string | Session identifier when the decision came from a council session (e.g. `session-001`). Omit for author decisions |
| `supersedes` | yes | list | ODR IDs this record replaces. May be empty. Intra-corpus only |
| `depends-on` | yes | list | ODR or ADR IDs this record cites. May be empty. Cross-corpus allowed |
| `implements` | yes | list | ODR IDs or external schema URIs this record realises. May be empty. ODR refs intra-corpus; external URIs pass through |

### Kind enum

| Value | Use for |
|---|---|
| `methodology` | Decisions about how decisions are made (council methodology, ODR format itself) |
| `architecture` | Framework decisions (namespace topology, governance layers, validation severity scheme) |
| `pattern` | Reusable modelling conventions (SKOS for enumerations, identity criteria, role/view pattern) |
| `mapping` | Specific source→ontology mappings (PDTF clause to ontology fragment) |
| `programme` | Workplans, dependency graphs, roadmaps |

### Typed-relation semantics

| Slot | Meaning | Corpus rule |
|---|---|---|
| `supersedes` | Replaces — kills the prior record | Intra-corpus only (ODR↔ODR). Setting this marks the target's status as `superseded` |
| `depends-on` | Cites — correctness/coherence requires the cited record to hold | Cross-corpus allowed (ODR↔ADR) |
| `implements` | Realises — this ODR is the technical artefact realising a parent decision | ODR refs intra-corpus; external schema URIs pass-through |

- **Inverse properties are forbidden in frontmatter** — `superseded-by`, `depended-on-by`, `implemented-by` are derived at index time.
- **Referential integrity**: every `ODR-NNNN` and `ADR-NNNN` reference MUST resolve to a real file. External schema URIs in `implements:` pass-through without resolution check.

## Sections

Section headings MUST be exactly the six declared below, MUST appear in declared order, and each appears exactly once. No other H2 headings are permitted. H3s within sections are free-form (the indexer does not parse them).

| # | Heading | Purpose |
|---|---|---|
| 1 | `## Context` | Why the decision was needed. 1–3 paragraphs. Not a tutorial — link out for source-schema documentation |
| 2 | `## Decision` | One paragraph: what was chosen and the one-sentence justification |
| 3 | `## Rules` | The load-bearing slot. Normative content: tables, Turtle, SHACL stubs, SKOS scheme links, naming conventions, anti-patterns. As long as needed. Inline enforcement notes where applicable |
| 4 | `## Alternatives` | Options considered and rejected. One bullet per option, naming the fatal flaw in one sentence. Not a deliberation log — if you need more, expand `## Context` |
| 5 | `## Consequences` | Operational impact. What downstream changes. What breaks. What teams must do. Imperative voice |
| 6 | `## References` | Links: source-schema clauses, related ODRs/ADRs, external citations. If `council:` is set, the session transcript belongs here too |

## Supersession

A record with `supersedes: [ODR-NNNN]` marks ODR-NNNN's status as `superseded`. Partial supersession is captured **inside the rules table** of the superseding record — ODR-N's `## Rules` states which of ODR-M's entries it replaces, leaving the rest of ODR-M operative. There is no separate frontmatter field for partial-supersession scope; the rules are themselves the granular unit.

## Authoring discipline

Every new ODR MUST be created via the `odr-create` skill (or follow its steps manually — see [`/Users/henrik/.claude/skills/odr-create/SKILL.md`](../../../.claude/skills/odr-create/SKILL.md)). The skill produces all three artefacts atomically:

1. The conforming markdown file at `docs/ontology/odr/ODR-NNNN-<slug>.md`.
2. The AgentDB hierarchical-store registration at `odr/ODR-NNNN` (via `mcp__ruflo__agentdb_hierarchical-store`, tier `semantic`).
3. The pattern entry in the `odr-patterns` memory namespace (via `mcp__ruflo__memory_store`) with semantic embedding for cross-corpus search.

**The AgentDB graph is the authoritative index.** No parallel markdown index (`README.md`, `INDEX.md`) is maintained — duplicate state drifts. The index is derived; the records are the source of truth. `odr-index` (strict mode) rebuilds the graph from the file system; the corpus and the graph stay in sync by construction, not by hand.

**Hand-authored ODRs that skip the AgentDB registration are non-conforming** and will be flagged by `odr-index` when it next runs. The remedy is to run `odr-index` (which back-fills the registration) or to delete and recreate via `odr-create`.

**No `README.md` or `INDEX.md` under `docs/ontology/odr/`.** The directory's entry point is the alphabetised `ODR-NNNN-*.md` filenames themselves; programmatic discovery goes through `mcp__ruflo__agentdb_hierarchical-store` queries against the `odr/*` namespace.

## Lints enforced by `odr-review`

1. **Cross-corpus modifying-relations** — `supersedes` must be intra-ODR; `implements` may reference ODRs intra-corpus and external schema URIs; `depends-on` may cross corpora.
2. **Referential integrity** — every `ODR-NNNN` and `ADR-NNNN` reference resolves. External URIs in `implements:` pass-through.
3. **Council reference** — if `council:` is set, the session file `council/<value>-*.md` must exist.
4. **DCAP profile conformance** — frontmatter keys, section headings, ordering, cardinality conform to this profile.
5. **Inverse-authoring prohibition** — no `superseded-by`/`depended-on-by`/`implemented-by` in frontmatter.
6. **AgentDB registration** — every ODR-NNNN file has a corresponding `odr/ODR-NNNN` entry in the hierarchical store. Missing entries are auto-back-filled by `odr-index`; hand-authored ODRs that skip `odr-create` are flagged here.
7. **No parallel markdown index** — `docs/ontology/odr/README.md` and `docs/ontology/odr/INDEX.md` MUST NOT exist. Discovery goes through the AgentDB graph.

## Amendment policy

New sections, new frontmatter keys, new `kind` enum values, or section reorderings require an edit to this DCAP in the same commit (undeclared-extension policy). The companion `DCAP-audit-log.md` records reviews.
