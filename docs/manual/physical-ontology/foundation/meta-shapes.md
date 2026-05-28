---
status: proposed
date: 2026-05-28
tags: [physical-ontology, foundation, shacl, meta-shapes]
---

# Foundation meta-shapes

Five meta-shapes + two cross-cutting SHACL-AF rules, emitted into `opda-shapes.ttl`. Three meta-shapes enforce the [three-rule interface contract](../three-graph-separation.md) per ODR-0010; two SHACL-AF rules cover cross-module concerns (deprecation, PII).

## Header

```turtle
<https://w3id.org/opda/shapes>
    rdf:type owl:Ontology ;
    dct:title "OPDA SHACL Shapes Graph"@en ;
    opda:targetsClassGraph <https://w3id.org/opda/1.0.0/> .
```

## opda:NoIdentityOverride_MetaShape

```turtle
opda:NoIdentityOverride_MetaShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0010#section-Q6> ;
    sh:message "Profile shape attempts to override identity-key of Substance Kind; identity properties cannot be removed by overlays (ODR-0010 §Q6 three-rule interface contract)."@en ;
    sh:severity sh:Violation ;
    sh:sparql _:beede7fbafeaf ;
    sh:targetClass sh:NodeShape ;
    opda:metaShapeJustification "ODR-0013 §Q1 Category 3: profile cannot override identity-key; this meta-shape enforces the three-rule interface contract per ODR-0010 §Q6."@en .

_:beede7fbafeaf
    sh:select "PREFIX opda: <https://w3id.org/opda/#>\nPREFIX sh: <http://www.w3.org/ns/shacl#>\nSELECT ?profileShape WHERE {\n  ?profileShape sh:targetClass ?kind .\n  ?kind opda:identityKey ?key .\n  ?profileShape sh:property [ sh:path ?key ; sh:maxCount 0 ] .\n}" .
```

#### Severity tier

`sh:Violation` (Cat 3 — no-identity-override)

#### Target

`sh:targetClass sh:NodeShape` + SPARQL constraint detecting overlay shapes attempting `sh:maxCount 0` on a Kind's identity-key path.

#### Validation behaviour

For any candidate overlay shape, pyshacl runs the SPARQL select. If the overlay declares `sh:maxCount 0` on the Kind's identity-key path (i.e. tries to forbid the identity property), the shape fires with the error message. No conforming overlay can suppress identity-keys.

#### Source ODR + ADR

- [ODR-0010 §Q6 — Overlay profile mechanism (three-rule interface contract)](../../../ontology/odr/ODR-0010-overlay-profile-mechanism.md)
- [ODR-0013 §Q1 — SHACL validation and severity (Cat 3)](../../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:ShInSemantics_MetaShape

```turtle
opda:ShInSemantics_MetaShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0010#section-Rule-sh-in> ;
    sh:message "Overlay profile sh:in constraint must union into the base SKOS scheme members (ODR-0010 three-rule interface contract, Rule 1)."@en ;
    sh:severity sh:Violation ;
    sh:sparql _:ba5e7fdcce4fc ;
    sh:targetClass sh:NodeShape ;
    opda:metaShapeJustification "ODR-0010 three-rule interface contract Rule 1: overlay sh:in MUST be a subset of base sh:in (which itself unions into the SKOS scheme members per ODR-0011)."@en .

_:ba5e7fdcce4fc
    sh:select "PREFIX sh: <http://www.w3.org/ns/shacl#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nSELECT ?overlayShape ?value WHERE {\n  ?overlayShape sh:property [\n    sh:path ?path ;\n    sh:in/rdf:rest*/rdf:first ?value\n  ] .\n  ?baseShape sh:property [\n    sh:path ?path ;\n    sh:in/rdf:rest*/rdf:first ?baseValue\n  ] .\n  FILTER NOT EXISTS {\n    ?baseScheme skos:hasTopConcept|skos:member ?value .\n  }\n}" .
```

#### Severity tier

`sh:Violation` (Cat 5 — meta-shape-over-shape-graph; justified)

#### Target

`sh:targetClass sh:NodeShape` + SPARQL constraint walking overlay `sh:in` lists and verifying every value is a member of the underlying SKOS scheme.

#### Validation behaviour

For every overlay shape with `sh:in` constraints, pyshacl checks each enumerated value against the base SKOS scheme. Values not bound to a `skos:hasTopConcept` or `skos:member` of the scheme fire the shape. Three-rule interface contract Rule 1 enforced.

#### Source ODR + ADR

- [ODR-0010 §Rule-sh-in — Three-rule interface contract Rule 1](../../../ontology/odr/ODR-0010-overlay-profile-mechanism.md)
- [ODR-0011 — Enumeration vocabularies](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:ShViolationFloor_MetaShape

```turtle
opda:ShViolationFloor_MetaShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0010#section-Rule-violation-floor> ;
    sh:message "Overlay profile attempts to downgrade a base sh:Violation severity; ODR-0010 three-rule interface contract Rule 2 establishes a Violation floor that overlays cannot weaken."@en ;
    sh:severity sh:Violation ;
    sh:sparql _:b4c20cfb30e26 ;
    sh:targetClass sh:NodeShape ;
    opda:metaShapeJustification "ODR-0010 three-rule interface contract Rule 2: no overlay shape may set sh:severity to sh:Warning or sh:Info on a property where the base shape declared sh:Violation."@en .

_:b4c20cfb30e26
    sh:select "PREFIX sh: <http://www.w3.org/ns/shacl#>\nSELECT ?overlayShape ?path WHERE {\n  ?overlayShape sh:property [\n    sh:path ?path ;\n    sh:severity ?overlaySev\n  ] .\n  ?baseShape sh:property [\n    sh:path ?path ;\n    sh:severity sh:Violation\n  ] .\n  FILTER (?overlaySev != sh:Violation)\n}" .
```

#### Severity tier

`sh:Violation` (Cat 5 — meta-shape-over-shape-graph; justified)

#### Target

`sh:targetClass sh:NodeShape` + SPARQL constraint detecting overlay severity downgrades on paths where base shape declared `sh:Violation`.

#### Validation behaviour

For every overlay shape, pyshacl looks for `sh:property` blocks with severity less than `sh:Violation` on a path where the base shape declared `sh:Violation`. If found, the meta-shape fires. Three-rule interface contract Rule 2 enforced.

#### Source ODR + ADR

- [ODR-0010 §Rule-violation-floor — Three-rule interface contract Rule 2](../../../ontology/odr/ODR-0010-overlay-profile-mechanism.md)
- [ODR-0013 §Q1 — SHACL validation and severity](../../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:MetaShapeOverShapeGraphMetaShape

```turtle
opda:MetaShapeOverShapeGraphMetaShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0017#section-2a> ;
    sh:message "Meta-shape over shape-graph using sh:Violation severity requires explicit opda:metaShapeJustification (ODR-0017 §2a amendment)."@en ;
    sh:severity sh:Violation ;
    sh:sparql _:be563e0a22322 ;
    sh:targetClass sh:NodeShape ;
    opda:metaShapeJustification "ODR-0013 §Q1 Category 5 + ODR-0017 §2a: meta-shapes targeting sh:NodeShape using sh:Violation severity must justify their elevation above the ODR-0017 sh:Info default."@en .

_:be563e0a22322
    sh:select "PREFIX sh: <http://www.w3.org/ns/shacl#>\nPREFIX opda: <https://w3id.org/opda/#>\nSELECT ?shape WHERE {\n  ?shape sh:targetClass sh:NodeShape .\n  ?shape sh:severity sh:Violation .\n  FILTER NOT EXISTS {\n    ?shape opda:metaShapeJustification ?j .\n  }\n}" .
```

#### Severity tier

`sh:Violation` (Cat 5 — meta-shape-over-shape-graph; self-justified)

#### Target

`sh:targetClass sh:NodeShape` + SPARQL constraint detecting meta-shapes lacking `opda:metaShapeJustification`.

#### Validation behaviour

For every meta-shape (i.e. shape targeting `sh:NodeShape`) declaring `sh:severity sh:Violation`, pyshacl verifies an `opda:metaShapeJustification` literal is present. If missing, the meta-shape fires. Prevents silent severity escalations above the default `sh:Info` for SHACL-AF rules.

#### Source ODR + ADR

- [ODR-0017 §2a — SHACL-AF quality rules pattern (meta-shape justification amendment)](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ODR-0013 §Q1 Category 5](../../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## SHACL-AF rule: opda:DeprecationChainRule

See [shacl-af-rules.md#opdadeprecationchainrule](../shacl-af-rules.md#opdadeprecationchainrule) for the full Turtle block + SPARQL body.

```turtle
opda:DeprecationChainRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Meta-rule per ODR-0011 §5a: materialises the deprecation chain for any SKOS Concept marked owl:deprecated true. Severity sh:Info when dct:isReplacedBy is present; the Three-tier severity decision table in ODR-0017 §2a notes that deprecation-without-successor escalates to sh:Warning (handled by the materialised opda:hasDeprecationStatus value rather than a separate shape)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-5a> ;
    sh:rule _:be6b6213de607 ;
    sh:severity sh:Info ;
    sh:targetClass skos:Concept .
```

#### Derives

`opda:hasDeprecationStatus` ("with-succession" | "without-succession"), `opda:hasSuccessor`

#### Citing site

[ODR-0011 §5a — SKOS deprecation lifecycle](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0011 §5a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ODR-0017 §2a — escalation note](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## SHACL-AF rule: opda:PIIWithoutDPVCoAnnotationRule

See [shacl-af-rules.md#opdapiiwithoutdpvcoannotationrule](../shacl-af-rules.md#opdapiiwithoutdpvcoannotationrule) for the full Turtle block + SPARQL body.

```turtle
opda:PIIWithoutDPVCoAnnotationRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Meta-rule: any class marked opda:isPIIBearing true that lacks a dpv-pd:hasPersonalDataCategory annotation in the annotation graph is flagged as a PII-without-co-annotation breach. Severity sh:Warning per ADR-0012 §SHACL-AF rule emission (silent PII leakage is high-impact even though the rule is SHACL-AF-pattern-shaped)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0012#section-Q5> ;
    sh:rule _:b3f168211e733 ;
    sh:severity sh:Warning ;
    sh:targetClass owl:Class .
```

#### Derives

`opda:hasPIIWithoutCoAnnotationFlag` (boolean `true`)

#### Citing site

[ODR-0012 §Q5 — DPV co-annotation discipline](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)

#### Severity

`sh:Warning` (explicit override above `sh:Info` default; silent PII leakage is high-impact)

#### Source ODR + ADR

- [ODR-0012 §Q5](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ODR-0018 — DPV co-annotation pattern](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
