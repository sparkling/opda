---
status: proposed
date: 2026-05-20
kind: architecture
tags: [foundation, uri, namespace, spike]
scope: [pdtf-v3]
council: session-001
supersedes: []
depends-on: [ODR-0002]
implements: [ODR-0003]
---

# PDTF Ontology Foundation

## Context

The PDTF v3 base schema (`pdtf-transaction.json`, 37,224 lines; 1,556 unique base leaves, 935 annotated) plus its overlay family (BASPI5, TA6/7/10, NTS/NTS2, CON29R/DW, LLC1, LPE1, FME1, RDS, PIQ, OC1) is a requirements artefact, not a translation target. JSON Schema has slot-names scoped to their enclosing object — no global identifiers, no identity criteria, no fixed model theory for the open-world class semantics an RDF consumer needs. Before any module ODR (Agents & Roles, Property & Land, Transactions, descriptive attributes, claims) can be drafted, the conversion needs the shared substrate every record depends on: where URIs live, how the ontology header is expressed, how the open-world class graph and closed-world shapes graph are kept separate, and where the human-readable meaning of each minted term comes from.

Council Session 001 framed this as the **first deliverable**. Hendler's Q1 point — "the deliberation is about *which things get URIs*" — became a design rule: URI policy is the first deliverable. Q7 confirmed the sequence: URI/namespace policy is Round 0, the identity crux (ODR-0005) gates everything downstream, and the programme is *spike-then-scale*. This ODR is the **Foundation spike** under that sequence — a gate record fixing policies under which every domain class will be minted, so the modules are mechanically constrained rather than free to re-litigate naming, graph separation, and term-sourcing per file.

## Decision

Adopt a **single `opda:` HASH namespace with layer-segregated naming, three-graph separation (OWL classes ⊥ SHACL shapes ⊥ annotations), a `vann:`-headed ontology, generator-first plus diagnostic-exemplar policies, and a normative term-sourcing-and-provenance convention** drawing on the business glossary and data dictionary, because it is the only option that fixes the cross-cutting policies once — so module ODRs inherit a constrained substrate rather than re-deciding naming, graph separation, and term-sourcing per file.

## Rules

These rules constrain every module and cross-cutting ODR in the PDTF ontology programme until superseded.

1. **Single hash namespace.** All foundational TBox terms are minted under one `opda:` HASH namespace. No per-form / per-overlay namespaces. Overlays are SHACL profiles (ODR-0010), not vocabularies. The literal base URI (`https://opda.uk/ns/` vs `https://trust.propdata.org.uk/ontology/`) and versioning scheme (calendar vs semantic) are **WG-owned open questions** — the policy is fixed; the string is not.
2. **Layer-segregated naming.** The naming convention must distinguish sortal/Kind classes (carry identity) from role/phase classes (borrow it), legibly from the URI alone. Examples:

   | Layer | Examples | Identity |
   |---|---|---|
   | Sortal/Kind | `opda:Property`, `opda:Person`, `opda:RegisteredTitle` | Carries identity |
   | Role/Phase | `opda:Seller`, `opda:Proprietor`, `opda:Buyer` | Borrows identity |

3. **Three-graph separation.** Keep the OWL/RDFS class graph, the SHACL shapes graph, and the advisory annotation graph as separate artefacts. Shapes target classes via `sh:targetClass`, never `owl:imports`. No property carries an OWL cardinality restriction and a SHACL count constraint as if equivalent. Advisory annotations (e.g. the exiled `opda:aiHint`) live only in the annotation graph. *Enforcement*: no `owl:imports` from shapes to classes; no property with both `owl:` cardinality and `sh:` count as if equivalent; advisory annotations absent from the shapes graph.
4. **Ontology header.** Every ontology file's `owl:Ontology` carries `dct:title`/`dct:creator`/`dct:issued`/`dct:modified`, `vann:preferredNamespacePrefix` and `vann:preferredNamespaceUri`, `owl:versionIRI`, and an `sh:prefixes` declaration node (so SHACL-SPARQL constraints — e.g. the UPRN uniqueness check in ODR-0005 — resolve prefixes). *Enforcement*: header lint reviewable mechanically once the base URI is fixed.
5. **Don't ship URIs you don't serve.** Minted URIs must dereference (at minimum to the TBox), or the ontology is explicitly scoped to local-copy consumption. The persistence/dereferenceability commitment is recorded honestly, not assumed. An instance-URI *pattern* may be declared (e.g. `…/property/uprn/{n}`) without minting instances this round.
6. **Generator-first.** The mechanical half — a named slot with a scalar datatype becomes an `opda:` `DatatypeProperty` with the corresponding `xsd:` range, `rdfs:domain` the enclosing object's class — is *generated*, not hand-authored. Council and module-ODR cycles are reserved for genuinely ambiguous moves: aggregate boundaries, cross-overlay synonymy, `oneOf`-as-subclass-vs-state. *Enforcement*: mechanical slot→`DatatypeProperty` output produced by the generator with ranges/comments drawn from the data dictionary.
7. **Term-sourcing & provenance convention.** Every minted term draws its human-readable semantics from two inputs beyond the JSON Schema:

   | Source | Path | Supplies |
   |---|---|---|
   | Business glossary (ubiquitous-language authority) | `source/00-deliverables/semantic-models/business-glossary.{md,ttl}`, `glossary-merged.json` | `rdfs:label`, `skos:prefLabel`, `skos:definition`; resolves naming (`Participant`, `Role`, `Trust Framework`, `Scheme Operator`, `Data Provider`/`Data Recipient`, `LEI`) |
   | Data dictionary | `source/00-deliverables/semantic-models/data-dictionary.{md,json}`, `data-dictionary-canonical.json` | `rdfs:comment`, datatype ranges, cardinality (1,557-leaf inventory; 935 annotated) |

   Every minted term carries `dct:source` to its glossary row or canonical schema-leaf path. **Precedence: W3C spec > business glossary > schema text.** Where a term is governed by a W3C/external standard (e.g. `Verifiable Credential`, `Issuer`, `Verifier`; `LEI` from ISO 17442) the external definition is normative and referenced, not restated. Applied downstream by ODR-0008, ODR-0011, ODR-0013. *Enforcement*: every minted class/property carries a `dct:source` resolving to a glossary row or canonical leaf path; labels/definitions on glossary-named concepts match the glossary.
8. **Diagnostic exemplars are permitted, non-deliverable, and IC-only.** The round admits three or four worked individuals used *solely* to pressure-test identity criteria and rigidity — the canonical set: a registered freehold house, an unregistered house pre-first-registration, and a flat whose UPRN was split. TBox/ABox remains the *deliverable* boundary, not the *thinking* boundary. This ODR fixes what an exemplar is and where the harness lives; ODR-0005 is the first record to discharge its IC gate against this set.

## Alternatives

- **Per-form / per-overlay namespaces** (`baspi:`, `ta6:`, `nts:`) — rejected: overlays are *views*, not vocabularies; per-form prefixes re-import the documentation accident and scatter one concept across many namespaces.
- **One flat `opda:` namespace with no naming discipline** — rejected: conceals the Kind/Role distinction the ontology exists to make (Guizzardi's withdrawal condition) and invites role-as-Kind conflation.
- **Slash URIs with content negotiation now** — deferred: speculative this round (no consumer needs it); a small TBox is the textbook whole-document hash case (Cagle).

## Consequences

- Module ODRs inherit a constrained substrate: they cannot quietly produce three URI shapes, leak closed-world cardinality into the class model, or invent unsourced labels.
- The single hash namespace with layer-segregated naming satisfies dereferenceability trivially for a small TBox and keeps the Kind/Role rigidity contract legible from the URI alone.
- Every minted term gets a traceable, authoritative human-readable origin (`dct:source` to glossary row or canonical leaf path), aligned to the trust framework's ubiquitous language.
- The OPDA web team must commit to long-term namespace resolution, or the ontology is scoped to local-copy consumers — the honest fallback must be declared.
- The literal base-namespace URI and versioning scheme remain WG-owned: the TTL's namespace string and `owl:versionIRI` cannot be frozen until the WG rules.
- SHACL and DASH are *declared* here; their shapes are authored in ODR-0010 / ODR-0013. The Foundation graph holds the class skeleton and header, not the constraints.
- ODR-0005 must discharge its identity-criterion gate against the canonical exemplar set.

## References

- **Target versions**: RDF 1.2 and SHACL 1.2, per the Core-tier pin in [ODR-0002](./ODR-0002-ontology-language-adoption.md).
- **Vocabularies**: Core only this round — RDF/RDFS/OWL/XSD, Dublin Core (per ODR-0002), VANN (header), SKOS (for glossary-sourced labels). SHACL + DASH declared; shapes authored in [ODR-0010](./ODR-0010-overlay-profile-mechanism.md) / [ODR-0013](./ODR-0013-shacl-validation-and-severity.md).
- **Glossary & data dictionary**: `source/00-deliverables/semantic-models/business-glossary.{md,ttl}` + `glossary-merged.json` (54 trust-framework terms plus schema-annotation and external-standard terms; "most authoritative wins: W3C > OPDA Glossary > PDTF schema text"); `source/00-deliverables/semantic-models/data-dictionary.{md,json}` + `data-dictionary-canonical.json` (1,557 unique leaves; 935 annotated; 16 canonical schemas).
- **Open questions (WG-owned)**: exact base namespace URI (`https://opda.uk/ns/` vs `https://trust.propdata.org.uk/ontology/`); versioning scheme (calendar vs semantic mirroring schema 3.4.0); TTL repository location (candidate: `source/03-standards/ontology/`, peer to `schemas/`).
- **Deliverables (when fleshed out)**: `foundation.ttl` skeleton + ontology-header template; namespace/URI policy note; diagnostic-exemplar harness location; generator spec for the mechanical slot→property half with its glossary/data-dictionary sourcing rules.
- **Related**: anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md); adopts catalogue and `vann:` header pattern from [ODR-0002](./ODR-0002-ontology-language-adoption.md); identity-criterion gate first discharged by [ODR-0005](./ODR-0005-property-land-identity-crux.md); downstream consumers of the term-sourcing convention: [ODR-0008](./ODR-0008-property-descriptive-attributes.md), [ODR-0011](./ODR-0011-enumeration-vocabularies.md), [ODR-0013](./ODR-0013-shacl-validation-and-severity.md); cross-cutting graph-separation feeds [ODR-0010](./ODR-0010-overlay-profile-mechanism.md).
- **Council deliberation**: [session-001](./council/session-001-pdtf-schema-to-ontology.md) — Q1 (genuine modelling; generator-first; exemplars admitted 11-0-1, Guarino amendment), Q3 (partition by ontological concern; OWL class graph separated from SHACL shapes graph; flat published namespace), Q5 (advisory annotations exiled to a separate annotation graph keyed to shape IRIs; Knublauch/Gandon prevail, Cagle dissent ~7-2), Q7 (single `opda:` hash namespace 9-0; `sh:prefixes` for SHACL-SPARQL; spike-then-scale).
