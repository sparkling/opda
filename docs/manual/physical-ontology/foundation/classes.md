---
status: proposed
date: 2026-05-28
tags: [physical-ontology, foundation, classes, owl]
---

# Foundation classes

Six classes + one datatype property emitted by `opda-gen` into `opda-classes.ttl`.

## opda:DiagnosticExemplar

```turtle
opda:DiagnosticExemplar
    rdf:type owl:Class ;
    rdfs:label "Diagnostic Exemplar"@en ;
    rdfs:comment "Informational endurant. IC: the named hard case — minimal Turtle exposing one IC-bearing surface as input to a Council session's identity-criterion validation. Hard cases: registered freehold house; unregistered house pre-first-registration; flat with split UPRN."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0004#section-8a-diagnostic-exemplars> ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant. UFO: Substance Kind (informational)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0004#section-8a-diagnostic-exemplars>` | [ODR-0004 §8a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) |
| `skos:scopeNote @en` | "DOLCE: NonPhysicalEndurant. UFO: Substance Kind (informational)." | Masolo D18 / Guizzardi 2005 |
| `rdfs:comment @en` | "IC: the named hard case — minimal Turtle exposing one IC-bearing surface…" | ODR-0004 §8a |

#### Targeting shapes

None (the class itself has no SHACL constraints; instances live under `exemplars/`).

#### Subclass / equivalent-class relationships

None.

#### Cross-tier links

- [Concept tier →](../../concept/foundation/diagnostic-exemplar.md)
- [Logical tier →](../../logical/foundation/diagnostic-exemplar.md)

#### Source ODR + ADR

- [ODR-0004 §8a — PDTF ontology foundation](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ADR-0009 — Foundation TBox emission](../../../adr/ADR-0009-foundation-tbox-emission.md)

## opda:GeneratorRun

```turtle
opda:GeneratorRun
    rdf:type owl:Class ;
    rdfs:label "Generator Run"@en ;
    rdfs:comment "Information particular. IC: a single execution of the opda-gen pipeline that produced a specific set of emitted TTL artefacts. Carries the generator version (opda-gen-<semver>), the source commit SHA, and the emission timestamp. Per ODR-0004 §6a, every emission is reproducible from the recorded (version, commit) pair."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0004#section-6a-generator-first> ;
    skos:scopeNote "UFO: Information Particular. Provenance unit for byte-identity CI; instances are minted by the build pipeline, not by hand."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0004#section-6a-generator-first>` | [ODR-0004 §6a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) |
| `skos:scopeNote @en` | "UFO: Information Particular. Provenance unit for byte-identity CI…" | Guizzardi 2005 Ch. 4 |
| `rdfs:comment @en` | "IC: a single execution of the opda-gen pipeline that produced a specific set of emitted TTL artefacts." | ODR-0004 §6a |

#### Targeting shapes

None (instances minted by build pipeline; no SHACL gate at TBox).

#### Cross-tier links

- [Concept tier →](../../concept/foundation/generator-run.md)
- [Logical tier →](../../logical/foundation/generator-run.md)

#### Source ODR + ADR

- [ODR-0004 §6a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ADR-0009 — Foundation TBox emission](../../../adr/ADR-0009-foundation-tbox-emission.md)

## opda:Relator

```turtle
opda:Relator
    rdf:type owl:Class ;
    rdfs:label "Relator"@en ;
    rdfs:comment "UFO Relator — a relational endurant that mediates two or more bearers and is founded by an external event. The Relator carries its own identity (the (mediated-bearers, founding-event) tuple) and bears properties that don't belong to any single mediated Kind. OPDA Relators in scope: opda:Transaction (founds Seller / Buyer RoleMixins per ODR-0007 §Q1); opda:Proprietorship (binds Proprietor Roles to a RegisteredTitle per ODR-0006 §Q3)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q3> ;
    skos:scopeNote "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4 — relational endurant; founded by an event; mediates two or more bearers). DOLCE: Relation as Universal (Masolo et al. 2003 D18 §4.6)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q3>` | [ODR-0006 §Q3](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4). DOLCE: Relation as Universal (Masolo et al. 2003 D18 §4.6)." | Guizzardi 2005 / Masolo D18 |
| `rdfs:comment @en` | "UFO Relator — a relational endurant that mediates two or more bearers…" | ODR-0006 §Q3 |

#### Targeting shapes

None directly (subclasses `opda:Transaction`, `opda:Proprietorship` carry the targeting shapes).

#### Subclass / equivalent-class relationships

Superclass of `opda:Transaction` (transaction module) + `opda:Proprietorship` (agent module).

#### Cross-tier links

- [Concept tier →](../../concept/foundation/relator.md)
- [Logical tier →](../../logical/foundation/relator.md)

#### Source ODR + ADR

- [ODR-0006 §Q3](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011 — Module TBox emission (UFO meta-class)](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Role

```turtle
opda:Role
    rdf:type owl:Class ;
    rdfs:label "Role"@en ;
    rdfs:comment "UFO Role — anti-rigid, sortal role. An instance of a Role is borne by a bearer drawn from a single substantial Kind (e.g. Proprietor is borne by a Person — or by an Organisation under a named specialisation, but never simultaneously). A Role NEVER supplies its own identity; it borrows identity from its bearer (ODR-0005 Anti-pattern §3 — never key a Role). Per ODR-0006 §Q2."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q2> ;
    skos:scopeNote "UFO: Role (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally founded, sortal). Distinguished from RoleMixin by sortal commitment to a single Kind."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q2>` | [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: Role (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally founded, sortal)." | Guizzardi 2005 Ch. 4 §4.4 |
| `rdfs:comment @en` | "UFO Role — anti-rigid, sortal role. An instance of a Role is borne by a bearer drawn from a single substantial Kind…" | ODR-0006 §Q2 / ODR-0005 Anti-pattern §3 |

#### Targeting shapes

None directly (subclasses like `opda:Proprietor` carry targeting shapes).

#### Subclass / equivalent-class relationships

Superclass of `opda:Proprietor` (agent module).

#### Cross-tier links

- [Concept tier →](../../concept/foundation/role.md)
- [Logical tier →](../../logical/foundation/role.md)

#### Source ODR + ADR

- [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011 — Module TBox emission (UFO meta-class)](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:RoleMixin

```turtle
opda:RoleMixin
    rdf:type owl:Class ;
    rdfs:label "Role Mixin"@en ;
    rdfs:comment "UFO RoleMixin — anti-rigid, cross-sortal role pattern. An instance of a RoleMixin is borne by a bearer drawn from more than one substantial Kind (e.g. Seller may be borne by Person OR Organisation). Distinguished from `opda:Role` (which is sortal — borne by a single Kind). Per ODR-0006 §Q2 Role layer."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q2> ;
    skos:scopeNote "UFO: RoleMixin (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally founded, cross-sortal). DOLCE: Role qua Universal without sortal commitment (Masolo et al. 2003 D18 §4.5)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q2>` | [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: RoleMixin (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally founded, cross-sortal)." | Guizzardi 2005 / Masolo D18 §4.5 |
| `rdfs:comment @en` | "UFO RoleMixin — anti-rigid, cross-sortal role pattern…" | ODR-0006 §Q2 |

#### Targeting shapes

None directly (subclasses `opda:Seller`, `opda:Buyer` carry targeting shapes).

#### Subclass / equivalent-class relationships

Superclass of `opda:Seller` + `opda:Buyer` (agent module).

#### Cross-tier links

- [Concept tier →](../../concept/foundation/role-mixin.md)
- [Logical tier →](../../logical/foundation/role-mixin.md)

#### Source ODR + ADR

- [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011 — Module TBox emission (UFO meta-class)](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:ValidationContext

```turtle
opda:ValidationContext
    rdf:type owl:Class ;
    rdfs:label "Validation Context"@en ;
    rdfs:comment "Reification of an overlay-profile validation context per ODR-0010 §Q1 (Guarino withdrawal condition). Each instance carries five properties: opda:profileURI, opda:requires, opda:overlaysContext, opda:sourcedFrom, opda:formVersion. Anchors per-profile cardinality/enum constraints in a named context — converting conditionality from 'required (depending)' to 'required relative to a named, dereferenceable context'. ADR-0013 emits per-profile instances under <https://w3id.org/opda/#Baspi5ValidationContext> etc."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0010#section-Q1> ;
    skos:scopeNote "UFO: Substance Kind (informational). Reifies a SHACL profile as a first-class subject so its constraints have determinate model theory (Guarino's withdrawal condition discharged at S010)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0010#section-Q1>` | [ODR-0010 §Q1](../../../ontology/odr/ODR-0010-overlay-profile-mechanism.md) |
| `skos:scopeNote @en` | "UFO: Substance Kind (informational). Reifies a SHACL profile as a first-class subject…" | Guizzardi 2005 Ch. 4 |
| `rdfs:comment @en` | "Reification of an overlay-profile validation context per ODR-0010 §Q1 (Guarino withdrawal condition)…" | ODR-0010 §Q1 |

#### Targeting shapes

None directly — instances (e.g. `opda:Baspi5ValidationContext`) are reified per-profile in `profiles/baspi5.ttl`.

#### Cross-tier links

- [Concept tier →](../../concept/foundation/validation-context.md)
- [Logical tier →](../../logical/foundation/validation-context.md)

#### Source ODR + ADR

- [ODR-0010 §Q1 — Overlay profile mechanism](../../../ontology/odr/ODR-0010-overlay-profile-mechanism.md)
- [ADR-0013 — Overlay profile emission](../../../adr/ADR-0013-overlay-profile-emission.md)

## opda:hasSpecialCategoryData

```turtle
opda:hasSpecialCategoryData
    rdf:type owl:DatatypeProperty ;
    rdfs:label "has special-category data"@en ;
    rdfs:comment "Flag indicating that a record carries GDPR Article 9 / 10 special-category personal data (race, religion, health, sex life, sexual orientation, political opinion, trade-union membership, biometric/genetic data, criminal convictions). Domain unconstrained at foundation scope so the predicate may be borne by Person records (the typical case targeted by the Cat 4 SHACL shape in opda-agent-shapes.ttl) or by any other Kind that carries article-9/10 data downstream. Engineering placeholder pending S012 Q3 Council ratification of the canonical predicate name."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0012#section-Q5> ;
    rdfs:range xsd:boolean ;
    skos:scopeNote "Placeholder predicate — Cat 4 SHACL shape (SpecialCategoryPIIWithoutLawfulBasisShape) targets this predicate per ADR-0012. Council Author-only session via S012 Q3 may rename or refine the canonical name; ADR-0012 shape updates in lockstep. Until then, this declaration gives the Cat 4 shape a real TBox-level target."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0012#section-Q5>` | [ODR-0012 §Q5](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md) |
| `skos:scopeNote @en` | "Placeholder predicate — Cat 4 SHACL shape (SpecialCategoryPIIWithoutLawfulBasisShape) targets this predicate per ADR-0012." | ADR-0012 |
| `rdfs:comment @en` | "Flag indicating that a record carries GDPR Article 9 / 10 special-category personal data…" | ODR-0012 §Q5 |

#### Targeting shapes

- [`opda:SpecialCategoryPIIWithoutLawfulBasisShape`](../agent/shapes.md#opdaspecialcategorypiiwithoutlawfulbasisshape) (Cat 4 — Violation; targets the predicate via SPARQL constraint)

#### Cross-tier links

- [Concept tier →](../../concept/foundation/has-special-category-data.md)
- [Logical tier →](../../logical/foundation/has-special-category-data.md)

#### Source ODR + ADR

- [ODR-0012 §Q5 — Special-category PII](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ADR-0014 — BASPI5 round-trip MVP harness (G14)](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md)
