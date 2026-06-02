---
date: 2026-05-28
entityUri: opda:Classes
kind: entity
module: property
sourceTtl: source/03-standards/ontology/opda-property.ttl
status: proposed
tags:
- physical-ontology
- property
- classes
- owl
tier: physical-ontology
title: Property classes
---

# Property classes

Seven OWL classes emitted by `opda-gen` into `opda-property.ttl`.

## Classes

### opda:Address

```turtle
opda:Address
    rdf:type owl:Class ;
    rdfs:label "Address"@en ;
    rdfs:comment "Socially-recognised locator constructed by an authority (Royal Mail / OS AddressBase / HMLR / INSPIRE) and persisting as a record-entity in that authority's stewardship. UFO Substance Kind; DOLCE NonPhysicalEndurant. IC over five hard cases per ODR-0015 §3a: cosmetic re-format; authority-internal succession; cross-variant identity-claim never collapses; Property-side change; INSPIRE-only locatedness. NOT a Mode (S015 Q1 commitment)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-2a> ;
    rdfs:subClassOf vcard:Address ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2; Searle 1995 institutional fact grounding). UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2). Subclass of vcard:Address for structural compatibility with vCard consumers."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-2a>` | [ODR-0015 §2a](../../../ontology/odr/ODR-0015-address-and-geography.md) |
| `skos:scopeNote @en` | "DOLCE: NonPhysicalEndurant. UFO: Substance Kind." | Masolo D18 §4.2 / Guizzardi 2005 Ch. 4 §4.2 |
| `rdfs:comment @en` | "Socially-recognised locator constructed by an authority… IC over five hard cases per ODR-0015 §3a" | ODR-0015 §3a |

#### Targeting shapes

- [`opda:AddressIdentityKeyShape`](./shapes.md#opdaaddressidentitykeyshape) — Cat 1 (Violation)
- [`opda:INSPIRESuccessionRule`](./shapes.md#opdainspiresuccessionrule) — SHACL-AF (Info)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf vcard:Address` — structural compatibility with vCard consumers

#### Cross-tier links

- [Concept tier →](../../concept/property/address.md)
- [Logical tier →](../../logical/property/address.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0015 §2a — Address and geography](../../../ontology/odr/ODR-0015-address-and-geography.md)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:LeaseExtensionEvent

```turtle
opda:LeaseExtensionEvent
    rdf:type owl:Class ;
    rdfs:label "Lease Extension Event"@en ;
    rdfs:comment "Reified PROV-O activity recording a statutory lease extension (LRHUDA 1993 in England & Wales). Mutates the LeaseTerm of an existing leasehold LegalEstate (ODR-0005 §3b Rule 1 — LegalEstate identity PERSISTS through extension; rights-bundle is modified, not dissolved) and updates the RegisteredTitle's registry record. The same node may co-type as opda:Transaction (S007 Q1 Transaction-as-Relator); the dual typing reflects the property-lifecycle vs relator perspectives on the same event."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b> ;
    rdfs:subClassOf prov:Activity ;
    skos:scopeNote "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7). DOLCE: Accomplishment (Masolo et al. 2003 D18 §4.4 — temporally extended with culmination at the registry-event timestamp). Hendler S005 Q5 'lease extension' consumer-fails case — the property of being-extended attaches to the registry-event lifecycle, not to the LegalEstate (which retains identity) and not to the Property."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b>` | [ODR-0005 §3b](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md) |
| `skos:scopeNote @en` | "UFO: Event particular. DOLCE: Accomplishment." | Guizzardi 2005 Ch. 4 §4.7 / Masolo D18 §4.4 |
| `rdfs:comment @en` | "Reified PROV-O activity recording a statutory lease extension (LRHUDA 1993)…" | ODR-0005 §3b Rule 1 |

#### Targeting shapes

None directly (lifecycle attaches to `opda:LegalEstate` via successor LeaseTerm chain).

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Activity`

#### Cross-tier links

- [Concept tier →](../../concept/property/lease-extension-event.md)
- [Logical tier →](../../logical/property/lease-extension-event.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0005 §3b](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:LeaseTerm

```turtle
opda:LeaseTerm
    rdf:type owl:Class ;
    rdfs:label "Lease Term"@en ;
    rdfs:comment "OWL-Time ProperInterval representing a leasehold term. Carries time:hasBeginning + time:hasDurationDescription (or time:hasEnd) per S007 Q5. Belongs to opda:LegalEstate of leasehold tenure (opda:leaseTerm join predicate). Modified by opda:LeaseExtensionEvent on statutory extension — extension produces a successor LeaseTerm with prov:wasDerivedFrom chain."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q5-lease-term> ;
    rdfs:subClassOf time:ProperInterval ;
    skos:scopeNote "OWL-Time: ProperInterval (W3C Time Ontology REC §4.2). UFO: Information particular bounding a leasehold tenure perdurant."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q5-lease-term>` | [ODR-0007 §Q5](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) |
| `skos:scopeNote @en` | "OWL-Time: ProperInterval (W3C Time Ontology REC §4.2)." | W3C Time Ontology REC §4.2 |
| `rdfs:comment @en` | "OWL-Time ProperInterval representing a leasehold term." | ODR-0007 §Q5 |

#### Targeting shapes

- [`opda:LeaseTermSuccessionRule`](../transaction/shapes.md#opdaleasetermsuccessionrule) — SHACL-AF (Info; lives in transaction shapes file)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf time:ProperInterval`

#### Cross-tier links

- [Concept tier →](../../concept/property/lease-term.md)
- [Logical tier →](../../logical/property/lease-term.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0007 §Q5](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:LegalEstate

```turtle
opda:LegalEstate
    rdf:type owl:Class ;
    rdfs:label "Legal Estate"@en ;
    rdfs:comment "Legal rights-bundle vested in a Property. UFO Substance Kind; DOLCE NonPhysicalEndurant (Searle 1995 legal-institutional object). IC: rights-bundle persistence — same individual through grant, transfer, registration, and discharge events; distinguishable from coexisting RegisteredTitle and physical Property by extent of property rights. Hard cases: tenure change; lease grant; lease termination; commonhold conversion; first registration of pre-existing common-law estate."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b> ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2; Searle 1995 institutional fact grounding). UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b>` | [ODR-0005 §3b](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md) |
| `skos:scopeNote @en` | "DOLCE: NonPhysicalEndurant. UFO: Substance Kind." | Masolo D18 §4.2 / Guizzardi 2005 Ch. 4 §4.2 |
| `rdfs:comment @en` | "Legal rights-bundle vested in a Property… IC: rights-bundle persistence." | ODR-0005 §3b |

#### Targeting shapes

- [`opda:LegalEstateIdentityKeyShape`](./shapes.md#opdalegalestateidentitykeyshape) — Cat 1 (Violation)

#### Cross-tier links

- [Concept tier →](../../concept/property/legal-estate.md)
- [Logical tier →](../../logical/property/legal-estate.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0005 §3b](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:Property

```turtle
opda:Property
    rdf:type owl:Class ;
    rdfs:label "Property"@en ;
    rdfs:comment "Physical property. UFO Substance Kind; DOLCE Endurant / PhysicalObject. IC: spatial-material continuity with Kendall+Davis legal-record-discontinuity-override hybrid (ODR-0005 §3a). Hard cases: demolition; subdivision; merger; replacement; first-registration; flat with split UPRN."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-2a> ;
    skos:scopeNote "DOLCE: Endurant / PhysicalObject (Masolo et al. 2003 D18 §4.1). UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — Sortal, Rigid, supplies own IC)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-2a>` | [ODR-0005 §2a](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md) |
| `skos:scopeNote @en` | "DOLCE: Endurant / PhysicalObject. UFO: Substance Kind (Sortal, Rigid, supplies own IC)." | Masolo D18 §4.1 / Guizzardi 2005 Ch. 4 §4.2 |
| `rdfs:comment @en` | "Physical property. IC: spatial-material continuity with Kendall+Davis legal-record-discontinuity-override hybrid." | ODR-0005 §3a |

#### Targeting shapes

- [`opda:PropertyIdentityKeyShape`](./shapes.md#opdapropertyidentitykeyshape) — Cat 1 (Violation)
- [`opda:PropertyICBreachShape`](./shapes.md#opdapropertyicbreachshape) — Cat 2 (Violation)
- [`opda:UPRNSuccessionRule`](./shapes.md#opdauprnsuccessionrule) — SHACL-AF (Info)
- [`opda:Baspi5_PropertyShape`](../profiles/baspi5.md) — Overlay (Violation; BASPI5 form)

#### Cross-tier links

- [Concept tier →](../../concept/property/property.md)
- [Logical tier →](../../logical/property/property.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0005 §2a + §3a](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:RegisteredTitle

```turtle
opda:RegisteredTitle
    rdf:type owl:Class ;
    rdfs:label "Registered Title"@en ;
    rdfs:comment "HMLR title-register record. UFO Substance Kind (informational); DOLCE NonPhysicalEndurant. IC: title-number lineage + registry-event history (every lifecycle event captured as a reified prov:Activity with explicit prov:wasDerivedFrom / prov:wasInvalidatedBy triples). Hard cases: first registration (title opening); title closure; title merger; transfer between registers; title reissue on corrupt-plan replacement."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3c> ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant (HMLR record-entity per Masolo et al. 2003 D18 §4.2). UFO: Substance Kind, informational (Guizzardi 2005 Ch. 4 §4.2)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3c>` | [ODR-0005 §3c](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md) |
| `skos:scopeNote @en` | "DOLCE: NonPhysicalEndurant. UFO: Substance Kind, informational." | Masolo D18 §4.2 / Guizzardi 2005 Ch. 4 §4.2 |
| `rdfs:comment @en` | "HMLR title-register record. IC: title-number lineage + registry-event history…" | ODR-0005 §3c |

#### Targeting shapes

None directly at TBox level (identity-key shape lives at `opda:LegalEstate` per ODR-0005 §3b — registered title binds to estate via `opda:recordsEstate`).

#### Cross-tier links

- [Concept tier →](../../concept/property/registered-title.md)
- [Logical tier →](../../logical/property/registered-title.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0005 §3c](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:UPRNSuccessionEvent

```turtle
opda:UPRNSuccessionEvent
    rdf:type owl:Class ;
    rdfs:label "UPRN Succession Event"@en ;
    rdfs:comment "Reified PROV-O activity recording an administrative re-numbering of UPRN for a single physical Property (the Property's identity PERSISTS through UPRN succession per ODR-0005 Rule 6). Canonical succession form per Gandon W3C-side recommendation (S005 Q4) — own URI, dereferenceable identity, audit trail. Coexists with the denormalised opda:previousUPRN literal-pair convenience (authoritative form: this reified event)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-6a> ;
    rdfs:subClassOf prov:Activity ;
    skos:scopeNote "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7 — perdurant). DOLCE: Achievement / Accomplishment (Masolo et al. 2003 D18 §4.4 — here an Achievement: instantaneous administrative re-issuance)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-6a>` | [ODR-0005 §6a](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md) |
| `skos:scopeNote @en` | "UFO: Event particular. DOLCE: Achievement / Accomplishment." | Guizzardi 2005 Ch. 4 §4.7 / Masolo D18 §4.4 |
| `rdfs:comment @en` | "Reified PROV-O activity recording an administrative re-numbering of UPRN…" | ODR-0005 §6a Rule 6 |

#### Targeting shapes

- [`opda:UPRNSuccessionRule`](./shapes.md#opdauprnsuccessionrule) — SHACL-AF (Info; materialises succession-tracked / primary-uprn)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Activity`

#### Cross-tier links

- [Concept tier →](../../concept/property/uprn-succession-event.md)
- [Logical tier →](../../logical/property/uprn-succession-event.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0005 §6a + Rule 6](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)
