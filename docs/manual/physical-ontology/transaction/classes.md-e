---
status: proposed
date: 2026-05-28
tags: [physical-ontology, transaction, classes, owl]
---

# Transaction classes

Three OWL classes emitted by `opda-gen` into `opda-transaction.ttl`.

## Classes

### opda:Milestone

```turtle
opda:Milestone
    rdf:type owl:Class ;
    rdfs:label "Milestone"@en ;
    rdfs:comment "Transaction lifecycle milestone. UFO Event particular; PROV-O Activity. Hybrid PROV-O typing per S007 Q2: instant milestones (instruction, offerAccepted, exchange) carry prov:atTime; interval milestones (completion-process, registration-process) carry prov:startedAtTime + prov:endedAtTime per Moreau W3C-grade discipline. Each Milestone Activity may pair with a prov:Plan carrying opda:plannedAtTime for expected-vs-actual variance (S007 Q6 Plan-vs-Activity reification)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q2> ;
    rdfs:subClassOf prov:Activity ;
    skos:scopeNote "UFO: Event particular (Guizzardi 2005 Ch. 4 §4.7). DOLCE: Achievement (instant) or Accomplishment (interval) per Masolo et al. 2003 D18 §4.4. PROV-O: Activity (W3C PROV-O REC §3.2)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0007#section-Q2>` | [ODR-0007 §Q2](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) |
| `skos:scopeNote @en` | "UFO: Event particular. DOLCE: Achievement (instant) or Accomplishment (interval). PROV-O: Activity." | Guizzardi 2005 / Masolo D18 §4.4 / W3C PROV-O |
| `rdfs:comment @en` | "Hybrid PROV-O typing per S007 Q2 (instant vs interval milestones)." | ODR-0007 §Q2 + §Q6 |

#### Targeting shapes

- [`opda:MilestoneIdentityKeyShape`](./shapes.md#opdamilestoneidentitykeyshape) — Cat 1 (Violation)
- [`opda:MilestoneVarianceRule`](./shapes.md#opdamilestonevariancerule) — SHACL-AF (Info; planned vs actual)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Activity`

#### Cross-tier links

- [Concept tier →](../../concept/transaction/milestone.md)
- [Logical tier →](../../logical/transaction/milestone.md)
- [Physical-Database tier (deployment) →](../../physical-database/index.md)

#### Source ODR + ADR

- [ODR-0007 §Q2 + §Q6](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:Transaction

```turtle
opda:Transaction
    rdf:type owl:Class ;
    rdfs:label "Transaction"@en ;
    rdfs:comment "Property-transaction Relator. UFO Relator (relational endurant). FIBO Arrangement precedent. Founds opda:Seller and opda:Buyer RoleMixins (ODR-0006 §Q2). IC: 5-tuple (LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage, founding-event). Hard cases per S007 Q1: party-substitution; estate-change; transaction-id reissuance; chain-link-break; aborted-transaction. Carries transactionId via dct:identifier and external-system refs via opda:externalIds."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q1> ;
    rdfs:subClassOf opda:Relator ;
    skos:scopeNote "UFO: Relator (Guizzardi 2005 Ch. 4 §4.4). FIBO: Arrangement precedent (FIBO-FND Arrangements module)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0007#section-Q1>` | [ODR-0007 §Q1](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) |
| `skos:scopeNote @en` | "UFO: Relator. FIBO: Arrangement precedent." | Guizzardi 2005 Ch. 4 §4.4 / FIBO-FND |
| `rdfs:comment @en` | "Property-transaction Relator. IC: 5-tuple (estate, sellers, buyers, id-lineage, founding-event)." | ODR-0007 §Q1 |

#### Targeting shapes

- [`opda:TransactionIdentityKeyShape`](./shapes.md#opdatransactionidentitykeyshape) — Cat 1 (Violation)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf opda:Relator`

#### Cross-tier links

- [Concept tier →](../../concept/transaction/transaction.md)
- [Logical tier →](../../logical/transaction/transaction.md)
- [Physical-Database tier (deployment) →](../../physical-database/index.md)

#### Source ODR + ADR

- [ODR-0007 §Q1](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

### opda:TransactionChain

```turtle
opda:TransactionChain
    rdf:type owl:Class ;
    rdfs:label "Transaction Chain"@en ;
    rdfs:comment "Aggregate of dependent Transactions linked by buyer-also-seller participant overlap. S007 Q4 dual-mechanism: (a) recursive opda:dependsOnTransaction predicate between Transactions; (b) opda:chainMembers list-of-Transactions on a TransactionChain parent. Chain-length cap: sh:maxInclusive 7 per CLC data (ADR-0012 emits the SHACL constraint). Chain status is derived (any-blocked → chain-blocked)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q4> ;
    skos:scopeNote "UFO: Aggregate (Guizzardi 2005 Ch. 4 §4.6 — collective of Relator instances). Dual modelling per S007 Q4 (recursive predicate + Aggregate) chosen because both shapes appear in real-world chain queries."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0007#section-Q4>` | [ODR-0007 §Q4](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) |
| `skos:scopeNote @en` | "UFO: Aggregate (collective of Relator instances). Dual modelling per S007 Q4." | Guizzardi 2005 Ch. 4 §4.6 |
| `rdfs:comment @en` | "Aggregate of dependent Transactions linked by buyer-also-seller participant overlap. Chain cap 7." | ODR-0007 §Q4 |

#### Targeting shapes

None directly at the TBox; chain-length cap (`sh:maxInclusive 7`) emitted as part of overlay constraints when materialised.

#### Cross-tier links

- [Concept tier →](../../concept/transaction/transaction-chain.md)
- [Logical tier →](../../logical/transaction/transaction-chain.md)
- [Physical-Database tier (deployment) →](../../physical-database/index.md)

#### Source ODR + ADR

- [ODR-0007 §Q4](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)
