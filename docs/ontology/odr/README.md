# Ontology Decision Records (ODRs)

Formal decision records for OPDA's linked-data work — ontology design, namespace strategy, vocabulary selection, identity criteria, mapping conventions, validation patterns, and anything else that materially shapes the property-data knowledge graph and its trust-framework expression.

ODRs are distinct from [ADRs](../../adr/README.md): ADRs cover framework/governance/tooling decisions at project level; ODRs cover the semantic-modelling decisions inside the ontology. Both registers run their own sequential numbering. Schema-design decisions (how to *encode* the model in JSON Schema, YAML, RDF, SHACL) are ADRs; ontology-modelling decisions are ODRs.

## Format

ODRs follow canonical [MADR 4.x](https://adr.github.io/madr/) with named project extensions. The normative profile is [`DCAP.md`](./DCAP.md) (the Decision-Application Profile); `odr-review` lints every record against it.

- **Filename**: `ONT-NNNN-<slug>.md` — 4-digit zero-padded number, lowercase kebab-case slug.
- **Frontmatter**: YAML with `status`, `date`, `tags`, and the three typed-relation slots `supersedes` / `depends-on` / `implements`.
- **H1**: title only — the number lives in the filename.
- **Sections**: `## Context and Problem Statement`, `## Considered Options`, `## Decision Outcome` (with `### Consequences`) are required; `## Decision Drivers`, `## Pros and Cons of the Options`, `## More Information` and the trailing extensions `## Rules` / `## Vote and Dissent` / `## Amendments` are optional. See `DCAP.md` for the full set, order, and cardinality rules.

Council-reviewed ODRs carry a compact `## Vote and Dissent` summary; the full deliberation transcript lives under [`council/`](./council/).

## Index

| # | Title | Status | Role |
|---|---|---|---|
| [0001](./ONT-0001-linked-data-council-methodology.md) | Linked Data Council: Review Methodology | accepted | Methodology |
| [0002](./ONT-0002-ontology-language-adoption.md) | Ontology Languages and Vocabularies Adopted | proposed | Vocabulary catalogue *(amended by 0014)* |
| [0003](./ONT-0003-pdtf-ontology-programme.md) | **PDTF → Ontology: Programme & Work Breakdown** | proposed | **Anchor — start here** |
| [0004](./ONT-0004-pdtf-ontology-foundation.md) | PDTF Ontology Foundation | proposed | Spike (gate) |
| [0005](./ONT-0005-property-land-identity-crux.md) | Property & Land: The Identity Crux | proposed | Spike *(the gate)* |
| [0006](./ONT-0006-agents-and-roles.md) | Agents & Roles | proposed | Module |
| [0007](./ONT-0007-transactions-and-lifecycle.md) | Transactions & Lifecycle | proposed | Module |
| [0008](./ONT-0008-property-descriptive-attributes.md) | Property Descriptive Attributes | proposed | Module |
| [0009](./ONT-0009-claims-evidence-provenance.md) | Claims, Evidence & Provenance | proposed | Cross-cutting |
| [0010](./ONT-0010-overlay-profile-mechanism.md) | Overlay Profile Mechanism | proposed | Cross-cutting |
| [0011](./ONT-0011-enumeration-vocabularies.md) | Enumeration Vocabularies | proposed | Cross-cutting |
| [0012](./ONT-0012-data-governance-layer.md) | Data-Governance Layer (DPV) | proposed | Cross-cutting |
| [0013](./ONT-0013-shacl-validation-and-severity.md) | SHACL Validation & Severity | proposed | Cross-cutting |
| [0014](./ONT-0014-vocabulary-catalogue-amendments.md) | Vocabulary Catalogue Amendments | proposed | Amendment (supersedes 0002 in part) |

**ONT-0003 is the anchor** for converting the Property Data Trust Framework v3 JSON Schema into a linked-data ontology — start there for programme context and the dependency graph. ODR-0003–0014 were planned in [Council Session 001](./council/session-001-pdtf-schema-to-ontology.md) (per-expert positions in [`council/working/`](./council/working/)). **ONT-0005 is the gating crux**: its identity-criterion question must clear, validated against diagnostic exemplars, before the module ODRs (0006–0008) are drafted in anger.

The **business glossary** and **data dictionary** (`source/00-deliverables/semantic-models/`) are additional ontology inputs alongside the JSON Schema: ONT-0004 authors the term-sourcing and `dct:source` provenance convention (glossary → labels/SKOS definitions; data dictionary → `rdfs:comment`, datatype and cardinality), applied in ONT-0003/0006/0008/0011/0013.

## Authoring a new ODR

1. Use the `odr-create` skill, or copy an existing record (e.g. [ONT-0006](./ONT-0006-agents-and-roles.md)) as a template.
2. Use the next sequential `ONT-NNNN` (check this index).
3. Conform to [`DCAP.md`](./DCAP.md); run `odr-review` before committing.
4. Declare typed relations (`supersedes` / `depends-on` / `implements`) in frontmatter — never author inverse relations (they are derived at index time).
5. If a Council session was convened, file the transcript under `council/session-NNN-<slug>.md` and summarise it in `## Vote and Dissent`.
6. Update this index.

ODRs are immutable history once accepted. After ratification, edit only to update the `status`, record amendments in `## Amendments`, or fix typos/broken cross-references. Reversals are documented as new sessions referencing the prior verdict.
