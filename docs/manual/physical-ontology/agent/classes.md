---
status: proposed
date: 2026-05-28
tags: [physical-ontology, agent, classes, owl]
---

# Agent classes

Seven OWL classes emitted by `opda-gen` into `opda-agent.ttl`.

## opda:Buyer

```turtle
opda:Buyer
    rdf:type owl:Class ;
    rdfs:label "Buyer"@en ;
    rdfs:comment "UFO RoleMixin (anti-rigid; cross-sortal — borne by Person OR Organisation). Founded by an opda:Transaction Relator. The Buyer role of one transaction may correspond to the Seller role of the next in a TransactionChain (cf. exemplar chain-of-transactions.ttl)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q2> ;
    rdfs:subClassOf opda:RoleMixin ;
    skos:scopeNote "UFO: RoleMixin (Guizzardi 2005 Ch. 4 §4.4). Mirror of opda:Seller founded by the same Transaction."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q2>` | [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: RoleMixin. Mirror of opda:Seller founded by the same Transaction." | Guizzardi 2005 Ch. 4 §4.4 |
| `rdfs:comment @en` | "Anti-rigid; cross-sortal — borne by Person OR Organisation. Founded by an opda:Transaction Relator." | ODR-0006 §Q2 |

#### Targeting shapes

None directly; identity-key shapes apply to the bearer Kind (Person / Organisation).

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:RoleMixin`

#### Cross-tier links

- [Concept tier →](../../concept/agent/buyer.md)
- [Logical tier →](../../logical/agent/buyer.md)
- [Physical-DB tier →](../../physical-database/agent/buyer.md)

#### Source ODR + ADR

- [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:NameChangeEvent

```turtle
opda:NameChangeEvent
    rdf:type owl:Class ;
    rdfs:label "Name Change Event"@en ;
    rdfs:comment "Reified PROV-O activity recording a Person's name change (deed-poll, marriage, gender recognition, etc.). The Person's identity PERSISTS through the name change per S006 Q1 — one Person individual with a name-attribute provenance chain via prov:wasRevisionOf, NOT two distinct Persons. Anti-pattern: owl:sameAs across the former/current names (cross-context inference propagation)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q1> ;
    rdfs:subClassOf prov:Activity ;
    skos:scopeNote "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7). DOLCE: Achievement (Masolo et al. 2003 D18 §4.4 — instantaneous administrative event)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q1>` | [ODR-0006 §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: Event particular. DOLCE: Achievement." | Guizzardi 2005 Ch. 4 §4.7 / Masolo D18 §4.4 |
| `rdfs:comment @en` | "Reified PROV-O activity recording a Person's name change…" | ODR-0006 §Q1 |

#### Targeting shapes

- [`opda:IdentifierSuccessionRule`](./shapes.md#opdaidentifiersuccessionrule) — SHACL-AF (Info; surfaces NameChangeEvent presence via `prov:wasAssociatedWith`)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Activity`

#### Cross-tier links

- [Concept tier →](../../concept/agent/name-change-event.md)
- [Logical tier →](../../logical/agent/name-change-event.md)
- [Physical-DB tier →](../../physical-database/agent/name-change-event.md)

#### Source ODR + ADR

- [ODR-0006 §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Organisation

```turtle
opda:Organisation
    rdf:type owl:Class ;
    rdfs:label "Organisation"@en ;
    rdfs:comment "Corporate or unincorporated organisation. UFO Substance Kind; DOLCE NonPhysicalEndurant (Searle 1995 legal-institutional object). IC over merger / demerger / dissolution hard cases: FIBO LegalEntity pattern — multiple jurisdiction-issued identifiers (CRN, LEI) for one Kind; entity-merger produces a new individual via prov:wasDerivedFrom (S006 Q1 + Kendall S005 Q4 framing). Subclass of org:Organization per S006 Q6 9-1 verdict."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q6> ;
    rdfs:subClassOf org:Organization ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2). UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2). W3C Org Ontology alignment per S006 Q6 9-1 verdict (Allemang held-as-live)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q6>` | [ODR-0006 §Q6](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "DOLCE: NonPhysicalEndurant. UFO: Substance Kind. W3C Org Ontology alignment." | Masolo D18 §4.2 / Guizzardi 2005 Ch. 4 §4.2 |
| `rdfs:comment @en` | "Corporate or unincorporated organisation. IC over merger / demerger / dissolution hard cases." | ODR-0006 §Q6 |

#### Targeting shapes

- [`opda:OrganisationIdentityKeyShape`](./shapes.md#opdaorganisationidentitykeyshape) — Cat 1 (Violation)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf org:Organization` (W3C Org Ontology alignment)

#### Cross-tier links

- [Concept tier →](../../concept/agent/organisation.md)
- [Logical tier →](../../logical/agent/organisation.md)
- [Physical-DB tier →](../../physical-database/agent/organisation.md)

#### Source ODR + ADR

- [ODR-0006 §Q6](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Person

```turtle
opda:Person
    rdf:type owl:Class ;
    rdfs:label "Person"@en ;
    rdfs:comment "Natural person. UFO Substance Kind; DOLCE Endurant. IC: FIBO-style multi-identifier persistence (date-of-birth + state-issued ID + name) over name-change, gender-recognition, and death hard cases. Anchors PII regimes (DPV co-annotation lands per ODR-0018 in opda-annotations.ttl; ADR-0012 emits)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q1> ;
    skos:scopeNote "DOLCE: Endurant / Agent (Masolo et al. 2003 D18 §4.1). UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — Sortal, Rigid)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q1>` | [ODR-0006 §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "DOLCE: Endurant / Agent. UFO: Substance Kind (Sortal, Rigid)." | Masolo D18 §4.1 / Guizzardi 2005 Ch. 4 §4.2 |
| `rdfs:comment @en` | "Natural person. IC: FIBO-style multi-identifier persistence (DOB + state-issued ID + name)." | ODR-0006 §Q1 |

#### Targeting shapes

- [`opda:PersonIdentityKeyShape`](./shapes.md#opdapersonidentitykeyshape) — Cat 1 (Violation)
- [`opda:IdentifierSuccessionRule`](./shapes.md#opdaidentifiersuccessionrule) — SHACL-AF (Info)
- [`opda:CapacityAuthorityMatchRule`](./shapes.md#opdacapacityauthoritymatchrule) — SHACL-AF (Info)
- [`opda:SpecialCategoryPIIWithoutLawfulBasisShape`](./shapes.md#opdaspecialcategorypiiwithoutlawfulbasisshape) — Cat 4 (Violation)

#### Cross-tier links

- [Concept tier →](../../concept/agent/person.md)
- [Logical tier →](../../logical/agent/person.md)
- [Physical-DB tier →](../../physical-database/agent/person.md)

#### Source ODR + ADR

- [ODR-0006 §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Proprietor

```turtle
opda:Proprietor
    rdf:type owl:Class ;
    rdfs:label "Proprietor"@en ;
    rdfs:comment "UFO Role (anti-rigid; sortal — borne by Person; sub-Role for Organisation-proprietorship under a named specialisation). Founded by an opda:Proprietorship Relator (ODR-0006 §Q3 Role layer). NEVER keyed (per ODR-0005 Anti-pattern §3 — a Proprietor has no identity qua Proprietor; identity borrows from bearer)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q2> ;
    rdfs:subClassOf opda:Role ;
    skos:scopeNote "UFO: Role (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally founded, sortal). Distinguished from RoleMixin by sortal commitment to a single bearer Kind."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q2>` | [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: Role (anti-rigid, externally founded, sortal)." | Guizzardi 2005 Ch. 4 §4.4 |
| `rdfs:comment @en` | "Founded by opda:Proprietorship Relator. NEVER keyed (Anti-pattern §3)." | ODR-0006 §Q2 + ODR-0005 Anti-pattern §3 |

#### Targeting shapes

None directly (Anti-pattern §3 — NEVER key a Role).

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:Role`

#### Cross-tier links

- [Concept tier →](../../concept/agent/proprietor.md)
- [Logical tier →](../../logical/agent/proprietor.md)
- [Physical-DB tier →](../../physical-database/agent/proprietor.md)

#### Source ODR + ADR

- [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ODR-0005 Anti-pattern §3](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Proprietorship

```turtle
opda:Proprietorship
    rdf:type owl:Class ;
    rdfs:label "Proprietorship"@en ;
    rdfs:comment "UFO Relator (relational endurant) mediating Property + Proprietor instances against a RegisteredTitle. IC: the (Title, Persons-set) tuple per S006 Q3. Joint-tenancy vs tenants-in-common is a property of the Relator, NOT of the Roles. Founding event recorded via prov:wasGeneratedBy on the registration activity."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q3> ;
    rdfs:subClassOf opda:Relator ;
    skos:scopeNote "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4 — relational endurant; founded by an event; mediates two or more bearers). HMLR Practice Guide 24 (joint tenancy / tenants in common)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q3>` | [ODR-0006 §Q3](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: Relator. HMLR Practice Guide 24." | Guizzardi 2005 Ch. 4 §4.4 |
| `rdfs:comment @en` | "Mediates Property + Proprietor instances against a RegisteredTitle. IC: the (Title, Persons-set) tuple." | ODR-0006 §Q3 |

#### Targeting shapes

None directly (Relator's IC enforced by foundation `opda:Relator` discipline).

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:Relator`

#### Cross-tier links

- [Concept tier →](../../concept/agent/proprietorship.md)
- [Logical tier →](../../logical/agent/proprietorship.md)
- [Physical-DB tier →](../../physical-database/agent/proprietorship.md)

#### Source ODR + ADR

- [ODR-0006 §Q3](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Seller

```turtle
opda:Seller
    rdf:type owl:Class ;
    rdfs:label "Seller"@en ;
    rdfs:comment "UFO RoleMixin (anti-rigid; cross-sortal — borne by Person OR Organisation). Founded by an opda:Transaction Relator (ODR-0006 §Q2 + ODR-0007 §Q1). An instance of opda:Seller is borne by a specific Person or Organisation in the context of a specific Transaction; the role identity is parasitic on the (Transaction, bearer) tuple."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q2> ;
    rdfs:subClassOf opda:RoleMixin ;
    skos:scopeNote "UFO: RoleMixin (Guizzardi 2005 Ch. 4 §4.4 — anti-rigid, externally founded, cross-sortal). Sub-Roles PersonSeller / OrganisationSeller may sortalise the RoleMixin where downstream use requires (per ODR-0006 §Role layer)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0006#section-Q2>` | [ODR-0006 §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md) |
| `skos:scopeNote @en` | "UFO: RoleMixin (anti-rigid, externally founded, cross-sortal)." | Guizzardi 2005 Ch. 4 §4.4 |
| `rdfs:comment @en` | "Founded by opda:Transaction Relator. Role identity parasitic on (Transaction, bearer) tuple." | ODR-0006 §Q2 + ODR-0007 §Q1 |

#### Targeting shapes

None directly at TBox; the BASPI5 overlay [`opda:Baspi5_SellerShape`](../profiles/baspi5.md) adds Cat 1 + role-binding constraints.

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:RoleMixin`

#### Cross-tier links

- [Concept tier →](../../concept/agent/seller.md)
- [Logical tier →](../../logical/agent/seller.md)
- [Physical-DB tier →](../../physical-database/agent/seller.md)

#### Source ODR + ADR

- [ODR-0006 §Q2 + ODR-0007 §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)
