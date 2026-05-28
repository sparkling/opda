---
status: proposed
date: 2026-05-28
tags: [physical-ontology, transaction, shacl, shapes]
---

# Transaction shapes

4 SHACL shapes (2 identity-key + 2 SHACL-AF rules), emitted into `opda-transaction-shapes.ttl`.

## Header

```turtle
<https://w3id.org/opda/transaction-shapes/>
    rdf:type owl:Ontology ;
    dct:title "OPDA Transaction Shapes"@en ;
    opda:targetsClassGraph <https://w3id.org/opda/1.0.0/> .
```

### opda:MilestoneIdentityKeyShape

```turtle
opda:MilestoneIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q6> ;
    sh:property _:b9133da93f27b ;
    sh:targetClass opda:Milestone .

_:b9133da93f27b
    sh:datatype xsd:dateTime ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Milestone plannedAtTime MUST be a single xsd:dateTime value when present. The variance against occurredAtTime is tracked by the MilestoneVarianceRule SHACL-AF rule below."@en ;
    sh:path opda:plannedAtTime ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:Milestone`; property `opda:plannedAtTime`

#### Validation behaviour

For every `opda:Milestone` instance, `opda:plannedAtTime` MUST be at most one xsd:dateTime when present. Variance vs `opda:occurredAtTime` tracked by `opda:MilestoneVarianceRule` (Info). Exemplar [`simple-transaction-with-milestones`](../exemplars/simple-transaction-with-milestones.md) demonstrates conforming usage.

#### Source ODR + ADR

- [ODR-0007 §Q6](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:TransactionIdentityKeyShape

```turtle
opda:TransactionIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q1> ;
    sh:property _:b47548231a7b4 ;
    sh:targetClass opda:Transaction .

_:b47548231a7b4
    sh:datatype xsd:dateTime ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Transaction identity-key surface: occurredAtTime MUST be a single xsd:dateTime value when present. The full Transaction-as-Relator IC per ODR-0007 §Q1 is the (mediated-bearers, founding-event) tuple; this shape covers the founding-event timestamp."@en ;
    sh:path opda:occurredAtTime ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:Transaction`; property `opda:occurredAtTime`

#### Validation behaviour

For every `opda:Transaction` instance, `opda:occurredAtTime` MUST be at most one xsd:dateTime when present. The full Transaction-as-Relator IC is the (mediated-bearers, founding-event) tuple per ODR-0007 §Q1; this shape covers the founding-event timestamp surface. Exemplar [`chain-of-transactions`](../exemplars/chain-of-transactions.md) demonstrates conforming usage in a multi-link chain.

#### Source ODR + ADR

- [ODR-0007 §Q1](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:LeaseTermSuccessionRule

```turtle
opda:LeaseTermSuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "LeaseTerm succession rule (ODR-0007 §Q5; SHACL-AF citing site #7). Materialises opda:hasLeaseTermSuccessionStatus: extended-from-predecessor when the term carries prov:wasDerivedFrom to another LeaseTerm; primary-term otherwise. Per ODR-0017 §1a + LeaseExtensionEvent (ODR-0005 §3b)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q5> ;
    sh:rule _:b6dbc2616d1c0 ;
    sh:severity sh:Info ;
    sh:targetClass opda:LeaseTerm .

_:b6dbc2616d1c0
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nPREFIX time: <http://www.w3.org/2006/time#>\nCONSTRUCT {\n  ?term opda:hasLeaseTermSuccessionStatus ?status .\n}\nWHERE {\n  ?term a opda:LeaseTerm .\n  OPTIONAL { ?term prov:wasDerivedFrom ?prior .\n             ?prior a opda:LeaseTerm }\n  BIND (IF(BOUND(?prior), \"extended-from-predecessor\", \"primary-term\") AS ?status)\n}" .
```

#### Derives

`opda:hasLeaseTermSuccessionStatus` ("extended-from-predecessor" | "primary-term")

#### Citing site

[ODR-0007 §Q5 — Lease term as interval](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) (citing site #7)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0007 §Q5](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ODR-0005 §3b — LeaseExtensionEvent](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ODR-0017 §1a](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:MilestoneVarianceRule

```turtle
opda:MilestoneVarianceRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Milestone variance rule (ODR-0007 §Q6; SHACL-AF citing site #8). Dynamic severity per ODR-0007 §Q6: less-than-14-day slip surfaces as 'info-flagged'; otherwise 'warning-flagged'. The materialised opda:hasVarianceStatus value is the consumer's escalation hook; the shape itself stays sh:Info per ODR-0017 §1a (the rule is informative; consumer tooling interprets the variance category)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q6> ;
    sh:rule _:b55cf070b367d ;
    sh:severity sh:Info ;
    sh:targetClass opda:Milestone .

_:b55cf070b367d
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\nCONSTRUCT {\n  ?milestone opda:hasVarianceStatus ?varianceCategory .\n  ?milestone opda:hasVarianceDays ?days .\n}\nWHERE {\n  ?milestone a opda:Milestone ;\n             opda:occurredAtTime ?actual ;\n             opda:plannedAtTime ?planned .\n  BIND (xsd:integer((?actual - ?planned) / xsd:dayTimeDuration(\"P1D\")) AS ?days)\n  BIND (IF(?days < 14, \"info-flagged\", \"warning-flagged\") AS ?varianceCategory)\n}" .
```

#### Derives

`opda:hasVarianceStatus` ("info-flagged" | "warning-flagged"), `opda:hasVarianceDays` (integer)

#### Citing site

[ODR-0007 §Q6 — Expected-vs-actual variance](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) (citing site #8)

#### Severity

`sh:Info` (the materialised `opda:hasVarianceStatus` value carries the dynamic category)

#### Source ODR + ADR

- [ODR-0007 §Q6](../../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ODR-0017 §1a](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
