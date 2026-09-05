---
status: accepted
date: 2026-09-05
tags: [modelling-method, context-maps, mappings, shacl]
supersedes: []
amends: []
depends-on: [ODR-0038, ODR-0045, ODR-0051, ODR-0056, ODR-0058, ODR-0059, ODR-0060]
implements: []
---

# Queryable strategic context maps linked to exact term mappings

## Context and Problem Statement

Term correspondence does not describe how communities collaborate. A SKOS mapping
cannot say that one context influences another, a downstream context uses an
anti-corruption layer, or a relationship exists only in a particular target-state
plan. Conversely, a strategic relationship cannot establish that two terms mean
the same thing. We need both views, joined precisely without conflating them.

## Decision Drivers

- Query collaboration patterns and exact semantic applicability with SPARQL.
- Keep context ownership distinct from graph placement and identifier spelling.
- Represent current and target projections without silently combining their facts.
- Preserve explicit non-integration decisions under open-world semantics.
- Generate diagrams and serialisations from one authoritative assertion set.

## Considered Options

- A qualified strategic relationship linked to individual SSSOM mapping records.
- Represent context maps and strategic relationships as SSSOM mapping sets/mappings.
- Link a relationship only to a whole mapping set.
- Treat SKOS mappings or named graphs as the complete context map.

## Decision Outcome

Adopt the qualified strategic layer. It adds context roles, map scope, relationship
kind and side patterns while retaining SKOS/SSSOM for term correspondence.
Neither layer entails the other. A relationship is not a domain entity, aggregate,
transport contract, named graph, SSSOM mapping, RDF reifier or imported UFO relator.

The model below specifies local term names; adopting this record is not a claim
that these terms are already minted in the OPDA candidate namespace.

### Consequences

- Good, because strategic and semantic questions can be answered without false joins.
- Good, because explicit scope and identifier-system authority make review reproducible.
- Bad, because applicability and explicit negative claims need deliberate curation.
- Neutral, because a relationship with no term mapping, or a mapping with no strategic
  relationship, can be a legitimate review result.

### Confirmation

OPDA implementation is pending. Delivery requires the model and mutation-tested
validation below, deterministic scoped queries and pinned expected rows from a
reviewed property-domain scenario. Source-project fixtures, counts, council reviews
and green builds are not OPDA evidence. No actual context topology is adopted here.

## Rules

### R1: Two profiles and one exact link

The strategic profile relates authoritative context registry resources. Term
alignment uses the five selected SKOS mapping predicates with
[ODR-0056](ODR-0056-sssom-cat8-mapping-provenance.md) metadata and the
[ODR-0058](ODR-0058-cat8-reification-rdf12-triple-terms.md) carrier.

`applicableMapping` links one named `ContextRelationship` directly to one individual
`sssom:Mapping`, never to a mapping set. Set co-membership does not establish
applicability. `governsIdentifierSystem` instead connects context authority to the
identifier sources needed to validate that link. Neither SSSOM endpoint order nor
SKOS taxonomic direction encodes upstream/downstream influence.

### R2: Explicit projection and participant scope

| Model term | Contract |
| --- | --- |
| `ContextMap` | Named active projection, a `prov:Collection` |
| `ContextRelationship` | Named strategic relationship, a `prov:Entity` |
| `prov:hadMember` | Exactly one incoming map membership per relationship |
| `mapState` | Exactly one controlled value: AS-IS or TO-BE |
| `internalContext`, `externalContext` | Every used endpoint appears in exactly one on its map |
| `excludedRelationshipKind` | Optional explicit, source-backed map-wide exclusion |
| `relationshipKind` | Exactly one admitted kind |
| `applicableMapping` | Zero or more exact individual mapping links |

Contexts are named `skos:Concept` resources in the authoritative bounded-context
scheme. Absence of external classification means unknown, not internal. Every
topology query binds a map IRI and follows its memberships. A named graph may
serve data but defines neither a context boundary nor a map membership.

An excluded-kind assertion requires a named RDF 1.2 reifier identifying that exact
map/kind statement and at least one source-evidence IRI via `prov:wasDerivedFrom`.
Generic map-level evidence is insufficient. Reject any member contradicting an
excluded kind. Zero rows never imply “none”, and a map-wide exclusion is not the
same decision as Separate Ways between a pair.

### R3: Kind determines endpoint form

| Kind | Form | Required endpoints |
| --- | --- | --- |
| Partnership | Symmetric | Two distinct participants |
| Shared Kernel | Symmetric | Two distinct participants |
| Separate Ways | Symmetric non-integration | Two distinct participants |
| Customer/Supplier | Directed | One upstream and one distinct downstream |
| Upstream/Downstream | Directed | One upstream and one distinct downstream |

Symmetric forms prohibit upstream/downstream fields; directed forms prohibit
participant fields. Customer/Supplier additionally expresses downstream priorities
influencing upstream planning. Multiple named relationships between the same pair
are allowed when they express distinct strategic facts. Never identify or collapse
relationships by endpoint equality alone.

### R4: Side-pattern compatibility

Upstream may use zero to two patterns: Open Host Service and Published Language,
including both together. Downstream may use zero or one: Anti-Corruption Layer or
Conformist. The downstream alternatives are mutually exclusive, not mandatory.

Symmetric relationships prohibit all side patterns. In this selected local profile,
Customer/Supplier with Conformist or Open Host Service is a violation;
Customer/Supplier with Anti-Corruption Layer is permitted with a review warning.
These are explicit profile rules, not universal claims about every DDD practice.

### R5: Separate Ways is a positive decision

Separate Ways has neither direction, side pattern, applicable mapping nor missing-
mapping coverage obligation. It must be explicitly asserted in its map. Missing
relationships or mappings do not entail it.

### R6: Exact, governed applicability

Each linked mapping must reify a retained permitted SKOS statement between IRIs,
satisfy the mapping profile, and belong to a named `sssom:MappingSet` through
`sssom:mappings`. Its source identifiers retain SSSOM meaning: vocabulary or
identifier systems, not context labels or inferred lexical prefixes.

| Identifier-system contract | Requirement |
| --- | --- |
| `IdentifierSystem` | Named and explicitly typed; one English label and definition; at most one governing context |
| `NamespaceBasedIdentifierSystem` | Explicit subtype as well as base type in the unreasoned validation graph |
| `vann:preferredNamespaceUri` | Exactly one explicit `xsd:anyURI` value on a namespace-based system |
| `governsIdentifierSystem` | Context to one or more systems whenever governance is asserted |

Use safe RDFS domain `skos:Concept` and range `IdentifierSystem` for the governance
property; SHACL narrows governors to exact bounded-context scheme members. Do not
redeclare VANN, use OWL restrictions, parse authority from IRI spelling, or duplicate
namespace text in scope notes. This is semantic authority for the bilateral bridge,
not organisational governance, access control or source-production provenance.

For each applicability link, one endpoint must govern the subject source and the
other the object source, in either assignment. The link means semantic applicability,
not transport, execution, conversion, ownership transfer or deployment dependency.

An optional annotation on that exact applicability assertion may retain
`prov:wasDerivedFrom` with an IRI value. It must identify an asserted applicability
link and creates no blanket evidence-coverage obligation. It is not relationship-
level provenance. Optional confidence is a finite `xsd:double` in 0–1; reject NaN
and infinities.

### R7: Reachability is a scoped review view

Construct an ephemeral graph containing only directed endpoint arcs from the chosen
map, then evaluate reachability over that graph alone. A property path over a union
dataset cannot enforce map membership at every hop and is forbidden for this query.
Use distinct results and exclude the seed even when cycles exist. The result means
candidate downstream influence, not demonstrated runtime impact.

Reciprocal directed pairs require review, not automatic rejection. Symmetric
Partnership and Shared Kernel records must not appear as reciprocal directed pairs.

### R8: Freeze a representative competency scenario

Before claiming delivery, commit a source-pinned property-domain fixture and exact
expected results for these questions:

1. Which inbound, outbound and symmetric relationships touch a selected context?
2. Which contexts are reachable within one map, excluding the seed?
3. Which exact mappings apply, even when their SSSOM order opposes DDD direction?
4. Which external-upstream relationships use an Anti-Corruption Layer?
5. Which mappings are unused and which relationships have no mapping?
6. Which directed pairs are reciprocal, excluding symmetric kinds?
7. Which Separate Ways and source-evidenced map-wide exclusions are explicitly asserted?
8. What scoped violations and warnings occur?

The source's business-specific fixture and row counts are deliberately not
transplanted. The local fixture must include valid and invalid endpoint forms,
multiple projections, exact applicability, governed source objects, contradictory
exclusions, prohibited history and query-contamination examples.

### R9: Executable query and validation contract

Bind map IRIs explicitly, return deterministic ordered projections and pin rows,
term types, severities, message identifiers and unexpected-result counts. Reachability
uses the two-stage construct/select contract. Applicability queries never join by
mapping-set membership alone. Scope validation results to the selected map.

Mutation fixtures must expose cross-projection leakage, source-order assumptions,
mapping-set leakage, incorrect external ACL filtering and mistaken Separate Ways
coverage obligations. Assertion-bearing diagrams and exports are generated from
the same data/query pipeline; explanatory illustrations are not an alternative truth.

### R10: Active RDF only; files and Git retain history

Active AS-IS and TO-BE projections may coexist, but they are not a revision chain.
Do not assert `prov:wasDerivedFrom` or `prov:wasRevisionOf` directly on a
`ContextRelationship`. Do not replace them with predecessor, successor, supersession,
currentness, carried/changed/adopted or cross-projection identity machinery.

Loading active files selects the graph assertions. Removing a relationship removes
it from active RDF; Git preserves the past. Historical comparison belongs to files
or Git revisions, not this SPARQL contract. Similar endpoints, labels, IRIs or shared
mappings must not be used to infer identity across projections.

### R11: Closed admission and one semantic owner

Allowlist the strategic classes, controlled individuals and object properties.
Reject undeclared additions in assertions and ontology declarations alike, including
declarations omitting `rdfs:isDefinedBy`. No new local datatype properties are
introduced: reuse standard metadata terms. Reject whole-set support links and
prohibited relationship history explicitly.

Map type, downstream influence mode and a direct exposed-aggregate property remain
deferred pending evidence, ownership, precise values, a discriminating question and
validation. A direct implementation-technology property is rejected. These records
do not import excluded process, architecture, governance-ontology, capability,
source-mapping or data-product categories. Referenced domain identities, vocabularies,
classification, validation, provenance, temporal and sensitivity facts retain their
respective owners; a strategic map must not restate them with competing meanings.

## More Information

- [Context boundaries](ODR-0045-bounded-context-boundary-criteria.md)
- [Domain, subject area and context](ODR-0060-data-domain-vs-subject-area-vs-bounded-context.md)
- Source-method record: ODR-0127, revision `67174057e6384b79d0b28b7736fe70a66e112895`.

## Amendments

- **2026-09-05 — OPDA adaptation.** Preserves R1–R11 with the 30 August active-only
  and governed-identifier-system amendments. Exact applicability replaces set-level
  support. Relationship-level provenance/history stays removed without replacement;
  claim-specific evidence on exclusions and optional applicability annotations stays
  distinct. Replaces source topology, fixtures and implementation claims with local
  delivery obligations without inventing OPDA context agreements.
