---
status: proposed
date: 2026-05-28
tags: [physical-ontology, shacl-af, sparql, non-blocking-rules]
---

# SHACL-AF rules

Per [ODR-0017](../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) §1a, OPDA emits 11 non-blocking quality rules as SHACL Advanced Features (SHACL-AF) `sh:SPARQLRule` constructions. Each rule materialises a derived predicate at `sh:Info` severity (one exception: PII rule at `sh:Warning`); consumers can route on the materialised predicate without the rule itself blocking conformance.

## Pattern

Each rule sits inside a `sh:NodeShape` that:

1. `sh:targetClass`es the focus Kind (or `owl:Class` for cross-cutting rules)
2. carries `sh:severity sh:Info` (or `sh:Warning` for PII rule)
3. names an `sh:rule` blank-node `sh:SPARQLRule` that bears `sh:construct` with the SPARQL CONSTRUCT body

The CONSTRUCT body emits a derived predicate (`opda:has<Something>Status` or `opda:has<Something>Event`) into the inference graph. Consumer tooling reads the materialised predicate as the routing signal.

## 11 citing sites

Per ODR-0017 §1a, 11 ODRs cite the SHACL-AF pattern as their non-blocking-quality emission mechanism:

| # | Rule | Citing ODR | Module |
|---|---|---|---|
| 1 | `opda:UPRNSuccessionRule` | [ODR-0005 §6a](../../ontology/odr/ODR-0005-property-and-land-identity-crux.md) | property |
| 2 | `opda:DeprecationChainRule` | [ODR-0011 §5a](../../ontology/odr/ODR-0011-enumeration-vocabularies.md) | foundation |
| 3 | `opda:INSPIRESuccessionRule` | [ODR-0015 §4a](../../ontology/odr/ODR-0015-address-and-geography.md) | property |
| 4 | `opda:PROVOClaimsRule` | [ODR-0009 §Q7](../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md) | claim |
| 5 | `opda:IdentifierSuccessionRule` | [ODR-0006 §Q1](../../ontology/odr/ODR-0006-agents-and-roles.md) | agent |
| 6 | `opda:CapacityAuthorityMatchRule` | [ODR-0006 §Q4](../../ontology/odr/ODR-0006-agents-and-roles.md) | agent |
| 7 | `opda:LeaseTermSuccessionRule` | [ODR-0007 §Q5](../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) | transaction |
| 8 | `opda:MilestoneVarianceRule` | [ODR-0007 §Q6](../../ontology/odr/ODR-0007-transactions-and-lifecycle.md) | transaction |
| 9 | `opda:VerificationActivitySuccessionRule` | [ODR-0009 §Q7](../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md) | claim |
| 10 | `opda:PIIWithoutDPVCoAnnotationRule` | [ODR-0012 §Q5](../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md) | foundation (cross-cutting) |
| 11 | (placeholder for future emission) | — | — |

## opda:UPRNSuccessionRule

```turtle
opda:UPRNSuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "UPRN succession rule (ODR-0005 §6a; SHACL-AF citing site #1). Materialises opda:hasUPRNSuccessionStatus on every Property with a UPRN: 'succession-tracked' when prov:wasDerivedFrom names a predecessor with a different UPRN; 'primary-uprn' otherwise. Per ODR-0017 §1a non-blocking-quality-rule pattern."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-6a> ;
    sh:rule _:b16e82da2b31c ;
    sh:severity sh:Info ;
    sh:targetClass opda:Property .

_:b16e82da2b31c
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?property opda:hasUPRNSuccessionStatus ?status .\n}\nWHERE {\n  ?property a opda:Property ;\n            opda:hasUPRN ?currentUPRN .\n  OPTIONAL { ?property prov:wasDerivedFrom ?predecessor .\n             ?predecessor opda:hasUPRN ?priorUPRN .\n             FILTER (?currentUPRN != ?priorUPRN) }\n  BIND (IF(BOUND(?priorUPRN), \"succession-tracked\", \"primary-uprn\") AS ?status)\n}" .
```

#### Derives

`opda:hasUPRNSuccessionStatus` ("succession-tracked" | "primary-uprn")

#### Citing site

[ODR-0005 §6a — UPRN as contingent identifier](../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0005 §6a](../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
- [ODR-0017 §1a — SHACL-AF quality rules pattern](../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)

## opda:DeprecationChainRule

```turtle
opda:DeprecationChainRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Meta-rule per ODR-0011 §5a: materialises the deprecation chain for any SKOS Concept marked owl:deprecated true. Severity sh:Info when dct:isReplacedBy is present; the Three-tier severity decision table in ODR-0017 §2a notes that deprecation-without-successor escalates to sh:Warning (handled by the materialised opda:hasDeprecationStatus value rather than a separate shape)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-5a> ;
    sh:rule _:be6b6213de607 ;
    sh:severity sh:Info ;
    sh:targetClass skos:Concept .

_:be6b6213de607
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX dct: <http://purl.org/dc/terms/>\nPREFIX owl: <http://www.w3.org/2002/07/owl#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nCONSTRUCT {\n  ?concept opda:hasDeprecationStatus ?status .\n  ?concept opda:hasSuccessor ?successor .\n}\nWHERE {\n  ?concept a skos:Concept ;\n           owl:deprecated true .\n  OPTIONAL { ?concept dct:isReplacedBy ?successor }\n  BIND (IF(BOUND(?successor), \"with-succession\", \"without-succession\") AS ?status)\n}" .
```

#### Derives

`opda:hasDeprecationStatus` ("with-succession" | "without-succession"), `opda:hasSuccessor`

#### Citing site

[ODR-0011 §5a — SKOS deprecation lifecycle](../../ontology/odr/ODR-0011-enumeration-vocabularies.md)

#### Severity

`sh:Info` (decision table in ODR-0017 §2a notes the materialised "without-succession" status is the escalation hook; the rule itself stays Info)

#### Source ODR + ADR

- [ODR-0011 §5a](../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:INSPIRESuccessionRule

```turtle
opda:INSPIRESuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "INSPIRE Identifier / OS AddressBase succession rule (ODR-0015 §4a; SHACL-AF citing site #3). Materialises opda:hasINSPIRESuccessionStatus on inspire-variant Address instances. Per ODR-0017 §1a."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-4a> ;
    sh:rule _:becbeff0baa17 ;
    sh:severity sh:Info ;
    sh:targetClass opda:Address .

_:becbeff0baa17
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?address opda:hasINSPIRESuccessionStatus ?status .\n}\nWHERE {\n  ?address a opda:Address ;\n           opda:addressVariant \"inspire\" .\n  OPTIONAL { ?address prov:wasDerivedFrom ?prior .\n             ?prior opda:addressVariant \"inspire\" }\n  BIND (IF(BOUND(?prior), \"inspire-re-issued\", \"inspire-primary\") AS ?status)\n}" .
```

#### Derives

`opda:hasINSPIRESuccessionStatus` ("inspire-re-issued" | "inspire-primary")

#### Citing site

[ODR-0015 §4a — INSPIRE Identifier succession](../../ontology/odr/ODR-0015-address-and-geography.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0015 §4a](../../ontology/odr/ODR-0015-address-and-geography.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:PROVOClaimsRule

```turtle
opda:PROVOClaimsRule
    rdf:type sh:NodeShape ;
    rdfs:comment "PROV-O Claims/Evidence rule (ODR-0009 §Q7; SHACL-AF citing site #4). Materialises opda:hasProvenanceChainStatus to surface Claims with absent or partial PROV-O chains. Per ODR-0017 §1a; complements the UnprovenancedClaimShape (which is a Violation-tier shape; this is informative)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0009#section-Q7> ;
    sh:rule _:bb11b45f9d7c0 ;
    sh:severity sh:Info ;
    sh:targetClass opda:Claim .

_:bb11b45f9d7c0
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?claim opda:hasProvenanceChainStatus ?status .\n}\nWHERE {\n  ?claim a opda:Claim .\n  OPTIONAL { ?claim prov:wasDerivedFrom ?source }\n  OPTIONAL { ?claim prov:wasGeneratedBy ?activity }\n  BIND (IF(BOUND(?source) || BOUND(?activity), \"chain-present\", \"chain-absent\") AS ?status)\n}" .
```

#### Derives

`opda:hasProvenanceChainStatus` ("chain-present" | "chain-absent")

#### Citing site

[ODR-0009 §Q7 — claims provenance chain](../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0009 §Q7](../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:IdentifierSuccessionRule

```turtle
opda:IdentifierSuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Person identifier-succession rule (ODR-0006 §Q1; SHACL-AF citing site #5). Materialises opda:hasIdentifierSuccessionEvent for downstream audit when a NameChangeEvent (or subclass: passport-renewal, NI-renumbering) names the Person via prov:wasAssociatedWith. Per ODR-0017 §1a."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q1> ;
    sh:rule _:b04ddc2ae8a10 ;
    sh:severity sh:Info ;
    sh:targetClass opda:Person .

_:b04ddc2ae8a10
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?person opda:hasIdentifierSuccessionEvent ?event .\n}\nWHERE {\n  ?person a opda:Person .\n  ?event a opda:NameChangeEvent ;\n         prov:wasAssociatedWith ?person .\n}" .
```

#### Derives

`opda:hasIdentifierSuccessionEvent` (IRI of the succession event)

#### Citing site

[ODR-0006 §Q1 — Person IC over name-change](../../ontology/odr/ODR-0006-agents-and-roles.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0006 §Q1](../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:CapacityAuthorityMatchRule

```turtle
opda:CapacityAuthorityMatchRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Capacity-authority match rule (ODR-0006 §Q4; SHACL-AF citing site #6). Materialises opda:hasCapacityAuthorityMatchStatus to surface Persons declaring a capacity (e.g. 'Director', 'Trustee') without an evidenced authority triple. Status value 'unevidenced-capacity' is a hook for downstream-tooling escalation per ODR-0017 §2a without-substantive-succession discipline."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q4> ;
    sh:rule _:bcd856a2c693b ;
    sh:severity sh:Info ;
    sh:targetClass opda:Person .

_:bcd856a2c693b
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nCONSTRUCT {\n  ?agent opda:hasCapacityAuthorityMatchStatus ?status .\n}\nWHERE {\n  ?agent opda:hasAssertedCapacity ?cap .\n  OPTIONAL { ?agent opda:hasEvidencedAuthority ?auth }\n  BIND (IF(BOUND(?auth), \"matched\", \"unevidenced-capacity\") AS ?status)\n}" .
```

#### Derives

`opda:hasCapacityAuthorityMatchStatus` ("matched" | "unevidenced-capacity")

#### Citing site

[ODR-0006 §Q4 — Capacity / authority split](../../ontology/odr/ODR-0006-agents-and-roles.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0006 §Q4](../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:LeaseTermSuccessionRule

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

[ODR-0007 §Q5 — Lease term as interval](../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0007 §Q5](../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:MilestoneVarianceRule

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

[ODR-0007 §Q6 — Expected-vs-actual variance](../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)

#### Severity

`sh:Info` (the materialised status carries the variance category)

#### Source ODR + ADR

- [ODR-0007 §Q6](../../ontology/odr/ODR-0007-transactions-and-lifecycle.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:VerificationActivitySuccessionRule

```turtle
opda:VerificationActivitySuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "VerificationActivity succession rule (ODR-0009 §Q7; SHACL-AF citing site #9). Materialises opda:hasVerificationSuccessionStatus to track re-verification chains via prov:wasInformedBy. Per ODR-0017 §1a."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0009#section-Q7> ;
    sh:rule _:b28ba9d05939d ;
    sh:severity sh:Info ;
    sh:targetClass opda:VerificationActivity .

_:b28ba9d05939d
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?activity opda:hasVerificationSuccessionStatus ?status .\n}\nWHERE {\n  ?activity a opda:VerificationActivity .\n  OPTIONAL { ?activity prov:wasInformedBy ?prior .\n             ?prior a opda:VerificationActivity }\n  BIND (IF(BOUND(?prior), \"re-verified\", \"initial-verification\") AS ?status)\n}" .
```

#### Derives

`opda:hasVerificationSuccessionStatus` ("re-verified" | "initial-verification")

#### Citing site

[ODR-0009 §Q7 — Re-verification chains](../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0009 §Q7](../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:PIIWithoutDPVCoAnnotationRule

```turtle
opda:PIIWithoutDPVCoAnnotationRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Meta-rule: any class marked opda:isPIIBearing true that lacks a dpv-pd:hasPersonalDataCategory annotation in the annotation graph is flagged as a PII-without-co-annotation breach. Severity sh:Warning per ADR-0012 §SHACL-AF rule emission (silent PII leakage is high-impact even though the rule is SHACL-AF-pattern-shaped)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0012#section-Q5> ;
    sh:rule _:b3f168211e733 ;
    sh:severity sh:Warning ;
    sh:targetClass owl:Class .

_:b3f168211e733
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX dpv-pd: <https://w3id.org/dpv/pd#>\nPREFIX owl: <http://www.w3.org/2002/07/owl#>\nCONSTRUCT {\n  ?class opda:hasPIIWithoutCoAnnotationFlag true .\n}\nWHERE {\n  ?class a owl:Class ;\n         opda:isPIIBearing true .\n  FILTER NOT EXISTS {\n    ?class dpv-pd:hasPersonalDataCategory ?category .\n  }\n}" .
```

#### Derives

`opda:hasPIIWithoutCoAnnotationFlag` (boolean true)

#### Citing site

[ODR-0012 §Q5 — DPV co-annotation discipline](../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)

#### Severity

`sh:Warning` (explicit override above the `sh:Info` default — silent PII leakage is high-impact)

#### Source ODR + ADR

- [ODR-0012 §Q5](../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
