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
- **Order**: YAML frontmatter, then H1, then an optional single status/supersession admonition blockquote (e.g. `> **SUPERSEDED …**`), then the H2 sections in the declared order (see §Sections). The admonition blockquote is the only content permitted between the H1 and the first H2.

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

The body follows the **canonical MADR 4.x spine plus named extensions** — unified with semantic-modelling and with both projects' ADR corpora (see "Cross-project unification"). Required sections MUST be present; optional sections MAY be omitted; H2 headings MUST be a subset of the declared set below, in declared order, each at most once. No undeclared H2 headings. (Pre-unification ODRs used a six-section `## Context / ## Decision / ## Rules / ## Alternatives / ## Consequences / ## References` spine — migrate those to the spine below.)

| # | Heading | Required | Purpose |
|---|---|---|---|
| 1 | `## Context and Problem Statement` | yes | Why the decision was needed; the problem, not the chosen option. 1–3 paragraphs. Link out for source-schema docs |
| 2 | `## Decision Drivers` | no | Bulleted forces (constraints, qualities, stakeholder concerns) |
| 3 | `## Considered Options` | yes | All options evaluated, **including the chosen one alongside rejected alternatives** — never only the losers |
| 4 | `## Decision Outcome` | yes | `Chosen option: "X", because Y.` then prose. Holds the H3s below |
| 4.1 | `### Consequences` | yes (under §4) | Flat bullet list (`* Good, because… / * Bad, because… / * Neutral, because…`); NO Good/Bad/Neutral subheadings |
| 4.2 | `### Confirmation` | no | How compliance with the decision is verified |
| 4.3 | `### Supersession scope:` | no | When partial supersession applies — what of the prior survives |
| 5 | `## Pros and Cons of the Options` | no | Per-option detail; one `### <Option>` each |
| 6 | `## More Information` | no | Links: source-schema clauses, related ODRs/ADRs; council transcript when `council:` set |
| 7 | `## Rules` (named extension) | no | The load-bearing normative slot: tables, Turtle, SHACL stubs, SKOS scheme links, naming conventions, anti-patterns. As long as needed |
| 8 | `## Vote and Dissent` (named extension) | no | Compact council-verdict summary (full transcript in the `council/` sibling) |
| 9 | `## Amendments` (named extension) | no | Running list of post-acceptance amendments |
| 10 | `## Mapping` (named extension) | no | Absorbed companion matrices / mapping-target tables |

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

## Cross-project unification (opda ↔ semantic-modelling)

This profile is the opda copy of the **shared ODR format** used by both opda and semantic-modelling. Both projects' ODR and ADR corpora use the canonical MADR 4.x body spine declared in §Sections. The projects differ only in the optional frontmatter keys: opda **requires** `kind` and `scope` (PDTF source-data traceability) and uses `council` as a frontmatter key; semantic-modelling **omits** all three (classifies via `tags`, records council provenance in `## Vote and Dissent`). The shared `~/.claude/skills/odr-{create,index,review}` treat `kind`/`scope`/`council` as optional so both corpora validate; opda's `odr-review` additionally requires `kind`/`scope` per the §Frontmatter table above (local policy). Index policy also differs: opda forbids `README.md` (Lint 7); semantic-modelling keeps one — a per-repo choice, not part of the record format.

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
