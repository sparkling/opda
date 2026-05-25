---
status: proposed
date: 2026-05-20
tags: [foundation, uri, namespace, spike]
supersedes: []
depends-on: [ONT-0002]
implements: [ONT-0003]
---

# PDTF Ontology Foundation

## Context and Problem Statement

The PDTF v3 base schema (`pdtf-transaction.json`, 37,224 lines; 1,556 unique base leaves, 935 with semantic annotation) plus its overlay family (BASPI5, TA6/7/10, NTS/NTS2, CON29R/DW, LLC1, LPE1, FME1, RDS, PIQ, OC1) is a *requirements artefact*, not a translation target. JSON Schema has slot-names scoped to their enclosing object; it has no global identifiers, no identity criteria, and no fixed model theory for the open-world class semantics an RDF consumer needs. Before any module ODR (Agents & Roles, Property & Land, Transactions, descriptive attributes, claims) can be drafted in anger, the conversion needs the shared substrate every other record depends on: where do URIs live, how is the ontology header expressed, how are the open-world class graph and the closed-world shapes graph kept from leaking into one another, and — the requirement this ODR is the home for — *where does the human-readable meaning of each minted term come from*.

Council Session 001 framed this as the **first deliverable**. Hendler's Q1 point — "the deliberation is fundamentally about *which things get URIs*, because JSON Schema has slot-names, not global identifiers" — became a design rule: URI policy is the first deliverable. Q7 confirmed the sequence: URI/namespace policy is the spike's Round 0, the identity crux (ONT-0005) gates everything downstream, and the programme is *spike-then-scale*, not a fifteen-ODR commitment up front. This ODR is the **Foundation spike** under that sequence. It is a gate record: it does not mint domain classes (that is the modules' work) — it fixes the policies under which every domain class will be minted, so that the modules are mechanically constrained rather than free to re-litigate naming, graph separation, and term-sourcing per file.

The question this ODR settles: **what are the URI, header, graph-separation, generator, exemplar, and term-sourcing policies that bind the whole PDTF ontology, and how are they grounded in the two additional human-readable inputs (the business glossary and the data dictionary) beyond the JSON Schema itself?**

## Decision Drivers

* **URIs first, and don't ship what you don't serve** (Hendler, Gandon) — a name in JSON Schema is a local slot; a URI is the substrate of the whole linked-data architecture. Minting URIs that don't dereference publishes broken linked data. The persistence/dereferenceability commitment must be recorded honestly this round, not assumed.
* **Open-world and closed-world must not leak** (Gandon, Knublauch) — an `owl:minCardinality` is not a `sh:minCount`; the commonest abuse is writing closed-world cardinality into the open-world class model. The cut that matters operationally is class-graph ≠ shapes-graph.
* **Layer-segregated naming** (Guizzardi) — a reader must see from the URI alone whether a class is a rigid identity-supplying Kind or an anti-rigid role/phase that borrows identity. This is a naming contract, not a namespace split.
* **Generator-first** (Allemang) — the mechanical half (named slot → `DatatypeProperty` with `xsd:` range) should be *generated*; Council and module-ODR cycles are reserved for the genuinely ambiguous moves (aggregate boundaries, cross-overlay synonymy, `oneOf`-as-subclass-vs-state).
* **Identity criteria are tested, not asserted** (Guarino) — a TBox whose ICs never meet an individual is a set of unfalsifiable assertions. The round must admit diagnostic exemplars to pressure-test ICs, with TBox/ABox remaining a *deliverable* boundary, not a *thinking* boundary.
* **Speak the trust framework's ubiquitous language** — terms must align to the established business vocabulary (`Participant`, `Role`, `Scheme Operator`, `Data Provider`/`Data Recipient`, `Trust Framework`, `LEI`) so the ontology does not invent a parallel naming dialect, and every term traces back to an authoritative human-readable source.

## Considered Options

* **Per-form / per-overlay namespaces** (`baspi:`, `ta6:`, `nts:`) mirroring the source files — rejected. Overlays are *views* over a shared model, not vocabularies; a per-form namespace would re-import the documentation accident the conversion exists to remove and scatter one concept across many prefixes.
* **One flat `opda:` namespace with no naming discipline** — rejected. A flat undifferentiated bag of classes actively conceals the Kind/Role distinction the ontology exists to make (Guizzardi's withdrawal condition), and invites the role-as-Kind conflation.
* **Single `opda:` HASH namespace with layer-segregated naming, OWL/SHACL/annotation graph separation, a `vann:`-headed ontology, a generator-first mechanical policy, a diagnostic-exemplar policy, and a normative term-sourcing-and-provenance convention drawing on the glossary + data dictionary** (chosen) — the substrate that fixes every cross-cutting policy once so the modules inherit them.
* **Slash URIs with content negotiation now** — deferred (not adopted this round). A TBox is the textbook whole-document-dereference hash case (Cagle); slash URIs "for future content negotiation" are speculative this round and not paid for until a concrete consumer needs them.

## Decision Outcome

Chosen option: **single `opda:` HASH namespace with layer-segregated naming, three-graph separation, a `vann:`-headed ontology, generator-first + diagnostic-exemplar policies, and a normative term-sourcing-and-provenance convention**, because it is the only option that fixes the cross-cutting policies once — so the module ODRs are constrained, not free to re-decide — while keeping the open-world model, the closed-world shapes, and advisory annotations cleanly separated and grounding every minted term in an authoritative human-readable source.

**URI / namespace policy.** A **single canonical `opda:` HASH namespace** for the foundational TBox (Cagle/Gandon/Knublauch, 9-0 per Q7). Overlays are SHACL profiles (ONT-0010), not namespaces. The exact base URI (`https://opda.uk/ns/` vs `https://trust.propdata.org.uk/ontology/`) and the versioning scheme (calendar vs semantic, mirroring schema 3.4.0) are **WG decisions** carried as open questions — the policy (single hash namespace, no per-form prefixes) is fixed; the literal string is not. An instance-URI *pattern* is declared (e.g. `…/property/uprn/{n}`) though no instances are minted this round. Gandon's rule binds: **don't ship URIs you don't serve** — if URIs are minted they must resolve, at minimum to the TBox; the persistence/dereferenceability commitment is recorded honestly or the ontology is scoped to local-copy consumption.

**Layer-segregated naming** (Guizzardi). A disciplined naming convention separates the **sortal/Kind layer** (`opda:Property`, `opda:Person`, `opda:RegisteredTitle` — carries identity) from the **role/phase layer** (`opda:Seller`, `opda:Proprietor`, `opda:Buyer` — borrows it). This is a naming contract within the one namespace, not separate namespaces.

**Ontology-header pattern** (Baker; per ONT-0002 adoption pattern). Every ontology file's `owl:Ontology` carries `dct:title`/`dct:creator`/`dct:issued`/`dct:modified`, **`vann:preferredNamespacePrefix`** and **`vann:preferredNamespaceUri`**, `owl:versionIRI`, and a **`sh:prefixes` declaration node** so SHACL-SPARQL constraints resolve prefixes (Knublauch — the UPRN uniqueness check in ONT-0005 likely needs `sh:sparql`, which silently fails to resolve prefixes without it).

**OWL-graph ⊥ SHACL-graph separation** (Gandon/Knublauch, Q3). The OWL/RDFS **class graph** and the SHACL **shapes graph** are separate artefacts. Shapes reference classes via `sh:targetClass`, never via `owl:imports`. Open-world (OWL, monotonic) and closed-world (SHACL, validation) must not leak: an `owl:minCardinality` is *not* a `sh:minCount`, and writing both on one property invites conflation. A **separate annotation graph** (Q5) keyed to class/shape IRIs holds advisory annotations (e.g. the exiled `opda:aiHint`) so that a strict SHACL processor encounters only interpretable constraint components and known annotation properties.

**Generator-first policy** (Allemang, Q1). The mechanical half of the conversion is *generated*: a named slot with a scalar datatype becomes an `opda:` `DatatypeProperty` with the corresponding `xsd:` range, `rdfs:domain` the enclosing object's class, drawing its annotations from the term-sourcing convention below. Council cycles and module-ODR deliberation are reserved for the genuinely ambiguous moves — aggregate boundaries, cross-overlay synonymy, and whether a `oneOf` is a subclass, an enumerated state, or a discriminated union.

**Diagnostic-exemplar policy** (Guarino, Q1; admitted 11-0-1). The round permits three or four **non-deliverable** worked individuals used *solely* to pressure-test identity criteria and rigidity — the canonical set being a registered freehold house, an unregistered house pre-first-registration, and a flat whose UPRN was split. TBox/ABox remains the *deliverable* boundary, not the *thinking* boundary. This ODR fixes what an exemplar is and where the exemplar harness lives; ONT-0005 is the first record to discharge its identity-criterion gate against this set.

**Term-sourcing & provenance convention** (the normative core of this ODR — see also `## Rules`). Ontology terms draw their human-readable semantics from **two additional inputs beyond the JSON Schema**:

1. **The business glossary** (`source/00-deliverables/semantic-models/business-glossary.{md,ttl}`, `glossary-merged.json`) is the **ubiquitous-language authority**. It supplies `rdfs:label`, `skos:prefLabel`, and `skos:definition`, and it resolves naming (e.g. `Participant`, `Role`, `Trust Framework`, `Scheme Operator`, `Data Provider`/`Data Recipient`, `LEI`). Where the glossary names a concept, the ontology uses the glossary's term and definition rather than inventing a parallel one.
2. **The data dictionary** (`source/00-deliverables/semantic-models/data-dictionary.{md,json}`, `data-dictionary-canonical.json`) supplies `rdfs:comment`, datatype ranges, and cardinality, drawn from the **1,557-leaf inventory** (935 annotated base-schema leaves). It is the authority for the mechanical generator's range and comment assignment.

**Every minted term carries `dct:source`** to its glossary row or to its canonical schema-leaf path. **Precedence is W3C spec > business glossary > schema text** — mirroring the glossary's own stated rule (it merges three sources with "the most authoritative wins: W3C > OPDA Glossary > PDTF schema text"). Where a term is governed by a W3C/external standard (e.g. `Verifiable Credential`, `Issuer`, `Verifier` from the VC Data Model; `LEI` from ISO 17442) the external definition is normative and is referenced rather than restated. This convention is applied downstream by ONT-0008 (descriptive leaves → `rdfs:comment`/ranges), ONT-0011 (JSON enums → SKOS concepts with `skos:prefLabel`/`skos:definition` from the glossary), and ONT-0013 (datatype and cardinality → SHACL constraints).

### Consequences

* Good, because fixing URI policy, graph separation, generator scope, exemplar policy, and term-sourcing once means the module ODRs inherit a constrained substrate and cannot quietly produce three different URI shapes, leak closed-world cardinality into the class model, or invent unsourced labels.
* Good, because the single hash namespace with layer-segregated naming satisfies dereferenceability trivially for a small TBox (Gandon) while keeping the Kind/Role rigidity contract legible from the URI alone (Guizzardi).
* Good, because the term-sourcing convention gives every minted term a traceable, authoritative human-readable origin (`dct:source` to a glossary row or a canonical leaf path) and aligns the ontology to the trust framework's ubiquitous language instead of a parallel dialect.
* Good, because generator-first reserves scarce deliberation for the genuinely ambiguous moves rather than burning it on naming the 935 annotated leaves mechanically.
* Bad, because the literal base-namespace URI and the versioning scheme remain WG-owned open questions, so the TTL's namespace string and `owl:versionIRI` cannot be frozen until the WG rules — the policy is fixed but one string is not.
* Bad, because the dereferenceability commitment is a real deployment obligation: if the OPDA web team cannot guarantee the namespace resolves long-term, the honest fallback is to scope the ontology to local-copy consumers, which is a weaker outcome (Hendler).
* Neutral, because SHACL and DASH are *declared* here but their shapes are authored in ONT-0010/0013; the Foundation graph holds the class skeleton and header, not the constraints.
* Neutral, because the diagnostic-exemplar policy admits worked individuals for IC-testing only — it does not relax the TBox-only deliverable boundary the convening brief set.

### Confirmation

- **Header lint**: every published ontology file's `owl:Ontology` carries `vann:preferredNamespacePrefix`/`vann:preferredNamespaceUri`, the Dublin Core header terms, `owl:versionIRI`, and an `sh:prefixes` node (reviewable mechanically once the base URI is fixed).
- **Graph-separation check** (Gandon's drift check): no `owl:imports` from shapes to classes; no property carrying both an `owl:` cardinality restriction and a `sh:` count constraint as if they were the same statement; advisory annotations present only in the annotation graph, never inline in the shapes graph.
- **Term-sourcing check**: every minted class and property carries a `dct:source` resolving to a glossary row or a canonical schema-leaf path; labels/definitions on glossary-named concepts match the glossary; W3C-governed terms reference the external spec rather than restating it.
- **Generator conformance**: the mechanical slot→`DatatypeProperty` translation is produced by the generator (not hand-authored), with ranges and comments drawn from the data dictionary; hand-authoring is reserved for the ambiguous moves the generator defers.
- **Exemplar harness**: the diagnostic-exemplar location exists and ONT-0005 validates its identity criteria against the three canonical exemplars there (this ODR defines the harness; ONT-0005 is its first consumer).

## Pros and Cons of the Options

### Single `opda:` HASH namespace + layer-segregated naming + graph separation + generator + exemplar + term-sourcing (chosen)

* Good, because it is the textbook hash-namespace case for a small TBox and dereferences trivially.
* Good, because layer-segregated naming makes the rigidity/identity contract legible without paying for extra namespaces.
* Good, because the three-graph separation keeps OWA, CWA, and advisory annotation each in its proper home.
* Good, because the term-sourcing convention binds every module to an authoritative human-readable origin and the trust framework's ubiquitous language.
* Bad, because the literal base URI and versioning scheme are deferred to the WG, so one string in the header cannot yet be frozen.

### Per-form / per-overlay namespaces

* Good, because it would mirror the source files one-to-one and need no decision about which view "owns" a term.
* Bad, because overlays are views, not vocabularies; per-form prefixes re-import the documentation accident and scatter one concept across many namespaces — the opposite of the conversion's intent.

### One flat `opda:` namespace with no naming discipline

* Good, because it is the simplest possible policy.
* Bad, because it conceals the Kind/Role distinction the ontology exists to make and invites the role-as-Kind conflation (Guizzardi withdraws support).

### Slash URIs with content negotiation now

* Good, because it would set up future content negotiation and per-term distinct documents.
* Bad, because it is speculative this round (no consumer needs it) and adds deployment cost a small TBox does not justify (Cagle).

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Vocabularies**: Core only this round — RDF/RDFS/OWL/XSD, Dublin Core (commons substrate per ONT-0002), VANN (header), SKOS (for the glossary-sourced labels/definitions the modules will mint). SHACL + DASH are *declared* but their shapes are authored in [ONT-0010](./ONT-0010-overlay-profile-mechanism.md) / [ONT-0013](./ONT-0013-shacl-validation-and-severity.md).
- **Glossary & data dictionary as inputs**: business glossary at `source/00-deliverables/semantic-models/business-glossary.{md,ttl}` + `glossary-merged.json` (54 trust-framework terms plus schema-annotation and external-standard terms; "most authoritative wins: W3C > OPDA Glossary > PDTF schema text"); data dictionary at `source/00-deliverables/semantic-models/data-dictionary.{md,json}` + `data-dictionary-canonical.json` (1,557 unique leaves; 935 annotated base-schema leaves; 16 canonical schemas). These are the two additional human-readable inputs the term-sourcing convention draws on beyond the JSON Schema.
- **Open questions** (WG-owned): exact base namespace URI (`https://opda.uk/ns/` vs `https://trust.propdata.org.uk/ontology/`); versioning scheme (calendar vs semantic mirroring schema 3.4.0); repository location for the TTL (candidate: `source/03-standards/ontology/`, peer to `schemas/`).
- **Deliverables (when fleshed out)**: `foundation.ttl` skeleton + ontology-header template; the namespace/URI policy note; the diagnostic-exemplar harness location; a generator spec for the mechanical slot→property half with its glossary/data-dictionary sourcing rules.
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); adopts the catalogue and the `vann:` header pattern from [ONT-0002](./ONT-0002-ontology-language-adoption.md); the gating crux that first discharges the exemplar policy is [ONT-0005](./ONT-0005-property-land-identity-crux.md); downstream consumers of the term-sourcing convention are [ONT-0008](./ONT-0008-property-descriptive-attributes.md), [ONT-0011](./ONT-0011-enumeration-vocabularies.md), [ONT-0013](./ONT-0013-shacl-validation-and-severity.md); cross-cutting graph-separation feeds [ONT-0010](./ONT-0010-overlay-profile-mechanism.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q1 (genuine modelling; generator-first; exemplars), Q3 (partition; graph separation), Q5 (annotation-graph split), Q7 (URI-first; hash namespace 9-0; spike-then-scale).

## Rules

These rules are scoped to this ODR's lifetime; they constrain every module and cross-cutting ODR in the PDTF ontology programme until superseded.

1. **Single hash namespace.** All foundational TBox terms are minted under one `opda:` HASH namespace. No per-form / per-overlay namespaces. Overlays are SHACL profiles (ONT-0010), not vocabularies.
2. **Layer-segregated naming.** The naming convention must distinguish sortal/Kind classes (carry identity) from role/phase classes (borrow it), legibly from the URI alone.
3. **Three-graph separation.** Keep the OWL/RDFS class graph, the SHACL shapes graph, and the advisory annotation graph as separate artefacts. Shapes target classes via `sh:targetClass`, never `owl:imports`. No property carries an OWL cardinality restriction and a SHACL count constraint as if equivalent.
4. **Ontology header.** Every ontology file's `owl:Ontology` carries the Dublin Core header terms, `vann:preferredNamespacePrefix`/`vann:preferredNamespaceUri`, `owl:versionIRI`, and an `sh:prefixes` node.
5. **Don't ship URIs you don't serve.** Minted URIs must dereference (at minimum to the TBox), or the ontology is explicitly scoped to local-copy consumption. The persistence commitment is recorded, not assumed.
6. **Generator-first.** The mechanical slot→`DatatypeProperty` translation is generated, not hand-authored. Deliberation is reserved for ambiguous moves.
7. **Term-sourcing & provenance convention.** Every minted term draws `rdfs:label`/`skos:prefLabel`/`skos:definition` from the business glossary (the ubiquitous-language authority) and `rdfs:comment`/range/cardinality from the data dictionary, and carries a `dct:source` to its glossary row or canonical schema-leaf path. Precedence: **W3C spec > business glossary > schema text.** W3C/external-governed terms are referenced, not restated.
8. **Diagnostic exemplars are permitted, non-deliverable, and IC-only.** Worked individuals exist solely to pressure-test identity criteria; they do not relax the TBox-only deliverable boundary.

## Vote and Dissent

This Foundation ODR records no vote of its own — it is a spike record fixing the policies Council Session 001 mandated, to be ratified in its own follow-up session. The Session 001 positions it inherits:

- **Q1** — genuine modelling, not mechanical rewriting (11-0-1). Generator-first for the mechanical half (Allemang); URI policy is the first deliverable (Hendler); **diagnostic exemplars admitted** on Guarino's amendment (Guarino withdrew his Q1 dissent).
- **Q3** — consensus against the by-aggregate-page partition; partition by ontological concern; **OWL class graph separated from SHACL shapes graph** (Gandon/Knublauch); flat published namespace, modules editorial only (Davis).
- **Q5** — advisory annotations (`opda:aiHint`) exiled to a **separate annotation graph** keyed to shape IRIs (Knublauch/Gandon prevail; Cagle dissent recorded ~7-2).
- **Q7** — single `opda:` **hash** namespace (Cagle/Gandon/Knublauch, **9-0**); `sh:prefixes` node for SHACL-SPARQL (Knublauch); **spike-then-scale** (Guarino's strongest Q7 point, echoed by Davis and Allemang) — URI policy first, identity crux gates everything, prove a vertical slice before scaling.
- No recorded dissent specific to the Foundation policies beyond the WG-owned open questions (base URI string, versioning scheme, TTL repo location).
