---
status: accepted
date: 2026-09-05
tags: [modelling-method, mappings, rdf-1.2]
supersedes: []
amends: []
depends-on: [ODR-0051, ODR-0056]
implements: []
---

# Named RDF 1.2 reifiers for mapping provenance

## Context and Problem Statement

Mapping metadata needs an unambiguous, browsable statement identity. Maintaining
an asserted SKOS statement and a separately edited three-part description creates
two representations that can diverge. Blank-node metadata records also lack stable
public identifiers. A canonical triple-term carrier reduces duplication, but only
works if storage, validation, queries and exports support the same representation.

## Considered Options

- Canonical RDF 1.2 triple terms with named reifiers and derived exchange formats.
- Canonical OWL annotation-axiom triples.
- Defer the change until the selected standards and implementations mature further.

## Decision Outcome

Use named RDF 1.2 reifiers in canonical storage; retain the asserted SKOS statement.
Generate OWL annotation-axiom and SSSOM TSV exports from that storage. This decision
governs the carrier; [ODR-0056](ODR-0056-sssom-cat8-mapping-provenance.md) governs
SSSOM fields and cardinalities, including its exclusion of mapping authorship.

### Consequences

- Good, because one statement-identity arc replaces independently maintained endpoints.
- Good, because a named reifier supports stable links and evidence inspection.
- Bad, because RDF 1.2 storage and SPARQL accessors need explicit runtime evidence.
- Bad, because a migration must coordinate data, queries, shapes and exports.
- Neutral, because this improves internal consistency without claiming a new external
  consumer capability or widening the older candidate's RDF Basic conformance claim.

### Confirmation

Implementation is pending in OPDA. All B1–B7 conditions below must be demonstrated
on the actual target runtime. Historical measurements on another system do not
prove local parser, validator or query support. A successful empty query is a failure
when populated provenance is expected.

## Rules

### Canonical pattern

An asserted SKOS mapping and its named `sssom:Mapping` reifier coexist. The reifier
has exactly one `rdf:reifies` triple term identifying that same subject, predicate
and object. Quoting/reifying a statement does not assert it. Validate equality
between the identified statement and the retained assertion; the representation
does not eliminate the need for that check.

### B1: Stable named reifiers

Use stable full IRIs, not blank nodes. The named IRI is authoritative. Within a
mapping set, the collision key is the exact subject-IRI, SKOS-predicate, object-IRI
tuple. A different predicate represents a different assertion. Curator identity is
not part of this identity key. Any identifier minting must avoid local-name
collisions and respect Turtle syntax.

### B2: Preserve the asserted layer

The corresponding SKOS assertion MUST remain present in every committed migration
state. Provenance consumers must not be served by removing predicate consumers'
data. Retain the assertion even when a triple term identifies it elsewhere.

### B3: Enforced predicate authority

Use a `sh:targetClass sssom:Mapping` node shape for metadata and an executable
SPARQL constraint over `rdf:reifies` for triple-term and predicate checks. The
selected approach uses `IS_TRIPLE()` and `PREDICATE()` accessors. A non-triple value
or a non-SKOS-mapping predicate fails. An `owl:annotatedProperty` restriction checks
an export, not the canonical store. Do not substitute it for the canonical gate.

`sh:reifierShape` is not selected for this profile: the source decision found it
silently inert on its tested engine. That historical finding is a warning, not a
claim about every current engine. Reopening requires a negative probe that actually
fails on the target runtime and an explicit profile amendment.

### B4: Self-falsifying validation evidence

Retain executable fixtures proving all three outcomes:

- A missing required SSSOM property produces nonconformance and a violation entry.
- A reified non-SKOS predicate produces nonconformance and a violation entry.
- A complete valid reifier conforms.

A parsed shape or a green run without demonstrated rejection is insufficient.
Separate severity contracts when the runtime does not honour per-constraint
severity as expected; do not silently downgrade required metadata failures.

### B5: Populated query results

Every governed mapping must be returned with its required provenance by the
consumer query. Test populated source, versions, release, justification and date,
not just row count. Do not require the excluded `sssom:author_id`. Preserve named
graph scope and do not suppress legitimate asserted mappings by a lexical-order
filter intended to deduplicate symmetric relations.

### B6: Atomic migration

Change canonical records, shapes and consumer joins together in one coherent
commit. No intermediate store/query mismatch is acceptable. A compatible temporary
reader, if needed for deployment, is explicitly bounded and retired after migration;
it must not become a second source of truth.

### B7: Regenerable exports

Generate the OWL `owl:annotatedSource` / `owl:annotatedProperty` /
`owl:annotatedTarget` representation and `.sssom.tsv` from canonical Turtle.
These are derived artefacts, never independently edited inputs. Delivery requires
a CI round trip from canonical mappings through TSV back to the same mapping set,
plus equivalence checks for the OWL view and permitted SSSOM fields.

### Analytical and implementation boundaries

The source method analyses the objectified mapping relationship as a dependent
relator and realises its record as an RDF reifier. This analytical description
does not import a foundational ontology or turn the metadata record into either
endpoint. Its technical identity is the named IRI and scoped tuple contract above.

The upstream deployment-risk objection remains relevant: compatible exchange
formats do not erase the cost of changing canonical storage. Review actual
standards maturity, parser/accessor support, validator rejection evidence and the
functional benefit before changing this carrier. A future standards milestone alone
does not prove that the chosen engine executes the required validation.

## More Information

- [SSSOM profile](ODR-0056-sssom-cat8-mapping-provenance.md)
- Source-method record: ODR-0096, revision `67174057e6384b79d0b28b7736fe70a66e112895`.

## Amendments

- **2026-09-05 — OPDA adaptation.** Preserves B1–B7, the canonical/export split,
  validator-executability guard and live deployment-risk concern. Replaces source
  migration counts and execution receipts with local obligations; applies the later
  SSSOM authorship exclusion without changing the carrier.
