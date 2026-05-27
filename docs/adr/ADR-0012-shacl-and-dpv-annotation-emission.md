---
status: proposed
date: 2026-05-27
tags: [ontology, shacl, dpv, annotations, validation, emission]
supersedes: []
depends-on: [ADR-0011, ODR-0010, ODR-0012, ODR-0013, ODR-0017, ODR-0018]
implements: [ADR-0008]
---

# SHACL shapes + DPV annotation emission

## Context and Problem Statement

[ADR-0011](./ADR-0011-module-tbox-emission.md) emits the class-graph side of each module's three-graph triple. This ADR ratifies the **shapes-graph + annotations-graph emission** — the constraint and governance layer that consumes the TBox emitted by ADR-0011.

Inputs from the ratified ODR corpus:

- **[ODR-0013 §Q1](../ontology/odr/ODR-0013-shacl-validation-and-severity.md)** — four-tier severity framework with **five `sh:Violation` categories**: identity-key missing; IC breach; no-identity-override (per S010 Q6); special-category PII without lawful-basis (per S012 Q3); meta-shape-over-shape-graph drift (per ODR-0017 §2a amendment landed at S013).
- **[ODR-0010 three-rule interface contract](../ontology/odr/ODR-0010-overlay-profile-mechanism.md)** — `sh:in` semantics; `sh:Violation` floor; no-identity-override gate.
- **[ODR-0017 SHACL-AF non-blocking quality rules pattern](../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)** — at least 11 citing sites named (UPRN succession; deprecation chain; INSPIRE succession; PROV-O Claims; identifier succession; capacity-authority match; lease term succession; milestone variance; verification activity succession; PII without DPV co-annotation; no-identity-override meta-shape).
- **[ODR-0018 DPV class-level co-annotation pattern](../ontology/odr/ODR-0018-dpv-class-level-coannotation-pattern.md)** — annotation-graph placement; mapping tables consumed at generation time; reference-not-import for DPV.
- **[ODR-0012](../ontology/odr/ODR-0012-data-governance-layer.md)** — DPV Phase-1 discipline; Article 10 special-category depth; ODRL deferral; PII discovery hook.
- **[ODR-0005 §6a](../ontology/odr/ODR-0005-property-land-identity-crux.md)** — UPRN succession SHACL-AF pattern (the seminal citing site).
- **[ODR-0008 §Operational specifications Q7a](../ontology/odr/ODR-0008-property-descriptive-attributes.md)** — three boundary clauses + three SHACL CI tests for overlay handoff.

The shapes + annotations emission is **substantial**: SHACL constraint shapes per class + property; SHACL-AF rules for non-blocking quality; DPV co-annotation triples per PII-bearing Kind; severity tier classification per shape; PIIWithoutDPVCoAnnotation enforcement rule.

## Decision Drivers

* **Five `sh:Violation` categories MUST emit with explicit severity classification** (ODR-0013 §Q1). Severity is property of each shape, not implicit.
* **Three-rule interface contract MUST be enforced at emission time** (ODR-0010 / ODR-0013 cross-cite). `sh:in` semantics; `sh:Violation` floor; no-identity-override gate.
* **DPV co-annotations MUST land in annotation graph** (ODR-0004 §3a + ODR-0018 §3a). CI test verifies absence from shapes + class graphs.
* **Reference-not-import for DPV** (Kendall S012 DA condition + Pandit S012 Q2 vindication). `opda-annotations.ttl` cites DPV terms via `dct:source` to `https://w3id.org/dpv/pd` etc.; no `owl:imports` to DPV TBox.
* **SHACL-AF rules emit as `sh:rule` with `sh:Info` default severity** per ODR-0017 §1a. Non-blocking quality monitoring; never raises `sh:Violation` at data-graph layer (ODR-0017 §2a §2a amendment narrowed `sh:Violation` to meta-shape-over-shape-graph).
* **Per-module shapes + annotations preserved** (per ADR-0011 module separation). Each module emits its own shapes + annotations TTL.

## Considered Options

* **A — One unified `opda-shapes.ttl` + `opda-annotations.ttl`.** Pro: simpler imports. Con: violates per-module separation; per-module amendment cycles can't target one module's shapes.
* **B — Per-module shapes + annotations (chosen).** Pro: per-module surgical amendments; CI checks isolated per module. Con: more files. Mitigation: composer (ADR-0007 §"Module pluralism") merges into derived consumer profiles.
* **C — Per-shape files.** Pro: maximum granularity. Con: hundreds of files; cognitive overhead exceeds benefit.

## Decision Outcome

Chosen option: **B — Per-module shapes + annotations files**, mirroring ADR-0011's per-module class emission. Generator emits:

- `opda-property-shapes.ttl` + `opda-property-annotations.ttl`
- `opda-agent-shapes.ttl` + `opda-agent-annotations.ttl`
- `opda-transaction-shapes.ttl` + `opda-transaction-annotations.ttl`
- `opda-claim-shapes.ttl` + `opda-claim-annotations.ttl`
- `opda-governance-shapes.ttl` + `opda-governance-annotations.ttl`
- `opda-descriptive-shapes.ttl` + `opda-descriptive-annotations.ttl`

Plus the foundation-level files (`opda-shapes.ttl` + `opda-annotations.ttl` from ADR-0009) carry global SHACL-AF meta-shapes (no-identity-override gate; PIIWithoutDPVCoAnnotation; etc.) that span modules.

### Severity tier framework emission (ODR-0013 §Q1)

Every shape carries explicit `sh:severity`. Five `sh:Violation` categories materialise as:

```turtle
opda:PropertyIdentityKeyShape
    a sh:NodeShape ;
    sh:targetClass opda:Property ;
    sh:property [
        sh:path opda:hasUPRN ;
        sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:severity sh:Violation ;       # Category 1: identity-key missing/wrong-type
        sh:message "Property hasUPRN must be present and of type xsd:string when set."@en ;
    ] ;
    .

opda:PropertyICBreachShape
    a sh:NodeShape ;
    sh:targetClass opda:Property ;
    sh:property [
        sh:path opda:identifiesSameProperty ;  # NOT owl:sameAs per ODR-0005 anti-pattern
        sh:nodeKind sh:IRI ;
        sh:severity sh:Violation ;       # Category 2: IC breach (anti-pattern detection)
        sh:message "Property co-reference uses opda:identifiesSameProperty; owl:sameAs would propagate identity collapse."@en ;
    ] ;
    .

# Category 3: no-identity-override (per S010 Q6; emit in foundation `opda-shapes.ttl` as meta-shape)
opda:NoIdentityOverrideMetaShape
    a sh:NodeShape ;
    sh:targetClass sh:NodeShape ;
    sh:sparql [
        sh:select """
        PREFIX opda: <https://w3id.org/opda/#>
        SELECT ?profileShape WHERE {
          ?profileShape sh:targetClass ?kind .
          ?kind opda:identityKey ?key .
          ?profileShape sh:property [ sh:path ?key ; sh:maxCount 0 ] .
        }""" ;
    ] ;
    sh:severity sh:Violation ;       # Category 3: profile cannot override identity-key
    sh:message "Profile shape attempts to override identity-key of Substance Kind; identity properties cannot be removed by overlays."@en ;
    .

# Category 4: special-category PII without lawful basis (per S012 Q3)
opda:SpecialCategoryPIIWithoutLawfulBasisShape
    a sh:NodeShape ;
    sh:targetClass opda:Person ;
    sh:property [
        sh:path opda:hasSpecialCategoryData ;
        sh:hasValue true ;
        sh:not [ sh:path dpv:hasLegalBasis ; sh:minCount 1 ] ;
        sh:severity sh:Violation ;       # Category 4
        sh:message "Special-category PII without dpv:hasLegalBasis is GDPR Article 10 violation."@en ;
    ] ;
    .

# Category 5: meta-shape-over-shape-graph drift (per ODR-0017 §2a amendment landed at S013)
opda:MetaShapeOverShapeGraphMetaShape
    a sh:NodeShape ;
    sh:targetClass sh:NodeShape ;
    sh:sparql [
        sh:select """
        PREFIX sh: <http://www.w3.org/ns/shacl#>
        SELECT ?shape WHERE {
          ?shape sh:targetClass sh:NodeShape .
          ?shape sh:severity sh:Violation .
          FILTER NOT EXISTS {
            ?shape opda:meta-shape-justification ?j .
          }
        }""" ;
    ] ;
    sh:severity sh:Violation ;       # Category 5
    sh:message "Meta-shape over shape-graph using sh:Violation severity requires explicit opda:meta-shape-justification."@en ;
    .
```

### SHACL-AF rule emission (ODR-0017 pattern; 11 citing sites)

Per ODR-0017 §1a, SHACL-AF rules emit with `sh:Info` default severity (non-blocking). Each rule materialises into the annotation graph or shapes graph depending on scope.

```turtle
# UPRNSuccessionRule (ODR-0005 §6a; first citing site)
opda:UPRNSuccessionRule
    a sh:NodeShape ;
    sh:targetClass opda:Property ;
    sh:rule [
        a sh:SPARQLRule ;
        sh:construct """
        PREFIX opda: <https://w3id.org/opda/#>
        PREFIX prov: <http://www.w3.org/ns/prov#>
        CONSTRUCT {
          ?property opda:hasUPRNSuccessionStatus ?status .
        }
        WHERE {
          ?property a opda:Property ;
                    opda:hasUPRN ?currentUPRN .
          OPTIONAL { ?property prov:wasDerivedFrom ?predecessor .
                     ?predecessor opda:hasUPRN ?priorUPRN .
                     FILTER (?currentUPRN != ?priorUPRN) }
          BIND (IF(BOUND(?priorUPRN), "succession-tracked", "primary-uprn") AS ?status)
        }""" ;
    ] ;
    sh:severity sh:Info ;
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-6a> ;
    .

# DeprecationChainRule (ODR-0011 §5a; second citing site)
opda:DeprecationChainRule
    a sh:NodeShape ;
    # ...
    sh:severity sh:Info ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-5a> ;
    .

# INSPIRESuccessionRule (ODR-0015 §4a)
opda:INSPIRESuccessionRule
    a sh:NodeShape ;
    # ...
    sh:severity sh:Info ;
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-4a> ;
    .

# IdentifierSuccessionRule (ODR-0006 Q1; fifth citing site)
opda:IdentifierSuccessionRule
    a sh:NodeShape ;
    sh:targetClass opda:Person ;
    sh:rule [
        a sh:SPARQLRule ;
        sh:construct """
        # Detect Person identifier-changes (passport renewal; name change; DOB correction)
        # Materialise as opda:hasIdentifierSuccessionEvent for downstream audit.
        """ ;
    ] ;
    sh:severity sh:Info ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q1> ;
    .

# CapacityAuthorityMatchRule (ODR-0006 Q4; sixth citing site)
opda:CapacityAuthorityMatchRule
    # ...

# LeaseTermSuccessionRule (ODR-0007 Q5; seventh citing site)
opda:LeaseTermSuccessionRule
    # ...

# MilestoneVarianceRule (ODR-0007 Q6; eighth citing site candidate)
opda:MilestoneVarianceRule
    a sh:NodeShape ;
    sh:targetClass opda:Milestone ;
    sh:rule [
        a sh:SPARQLRule ;
        sh:construct """
        PREFIX opda: <https://w3id.org/opda/#>
        PREFIX prov: <http://www.w3.org/ns/prov#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        CONSTRUCT {
          ?milestone opda:hasVarianceStatus ?varianceCategory .
          ?milestone opda:hasVarianceDays ?days .
        }
        WHERE {
          ?milestone a opda:Milestone ;
                     prov:atTime ?actual ;
                     prov:qualifiedAssociation [ prov:hadPlan [ opda:plannedAtTime ?planned ] ] .
          BIND ((day(?actual - ?planned)) AS ?days)
          BIND (IF(?days < 14, "sh:Info-flagged", "sh:Warning-flagged") AS ?varianceCategory)
        }""" ;
    ] ;
    sh:severity sh:Info ;     # Note: dynamic severity per ODR-0007 Q6 (< 14d → Info; > 14d or overdue → Warning)
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q6> ;
    .

# VerificationActivitySuccessionRule (ODR-0009 Q7; ninth citing site)
opda:VerificationActivitySuccessionRule
    # ...

# PIIWithoutDPVCoAnnotationRule (ODR-0012 Q5; tenth citing site)
opda:PIIWithoutDPVCoAnnotationRule
    a sh:NodeShape ;
    sh:targetClass owl:Class ;  # Meta-rule
    sh:rule [
        a sh:SPARQLRule ;
        sh:construct """
        PREFIX opda: <https://w3id.org/opda/#>
        PREFIX dpv-pd: <https://w3id.org/dpv/pd#>
        CONSTRUCT {
          ?class opda:hasPIIWithoutCoAnnotationFlag true .
        }
        WHERE {
          ?class a owl:Class ;
                 opda:isPIIBearing true .
          FILTER NOT EXISTS {
            ?class dpv-pd:hasPersonalDataCategory ?category .
          }
        }""" ;
    ] ;
    sh:severity sh:Warning ;     # Warning because failure mode is silent PII leakage (high-impact)
    dct:source <https://w3id.org/opda/odr/ODR-0012#section-Q5> ;
    .

# (Eleventh citing site: ODR-0010 §Q6 no-identity-override meta-shape — already emitted above
#  in the severity-tier framework section as opda:NoIdentityOverrideMetaShape)
```

### DPV co-annotation emission (ODR-0018 + reference-not-import)

Per ODR-0018 §3a, co-annotations live in annotation graph; generated from mapping tables in `opda-governance.ttl`.

```turtle
# opda-property-annotations.ttl (subset; full per ODR-0018 mapping table consumption)

opda:Property
    dpv-pd:hasPersonalDataCategory <https://w3id.org/dpv/pd#PostalAddress> .
    # Baseline; variant-conditional refinements via mapping table.

opda:RegisteredTitle
    dpv-pd:hasPersonalDataCategory <https://w3id.org/dpv/pd#PublicData> .
    # Per S005 §3c — published-PII regime.
```

### Three-rule interface contract enforcement (ODR-0010 ↔ ODR-0013)

Foundation-level shapes graph (`opda-shapes.ttl` from ADR-0009 extended here) emits three meta-shapes enforcing the three-rule contract:

1. **`sh:in` semantics meta-shape** — verifies that overlay profile `sh:in` constraints union into the base SKOS scheme.
2. **`sh:Violation` floor meta-shape** — verifies that no overlay profile can downgrade a base `sh:Violation` severity.
3. **No-identity-override meta-shape** — already emitted above; verifies that overlay profile cannot remove identity-key constraints.

Each cross-cited in ODR-0010 §References and ODR-0013 §References per S013 Q7 ratification.

### Consequences

* Good, because severity classification is explicit per shape — no implicit defaults to misinterpret.
* Good, because five `sh:Violation` categories are mechanically enforced — the constraint is not honour-system.
* Good, because SHACL-AF rules emit with `sh:Info` default — non-blocking quality monitoring doesn't break validation.
* Good, because DPV co-annotations live in annotation graph — `pyshacl` validation on shapes graph alone produces no DPV false-positives.
* Good, because reference-not-import for DPV keeps dependency surface narrow (no DPV TBox in OPDA's import chain).
* Good, because three-rule interface contract enforcement is mechanical — Cagle's S010 Scope-Check 1 Q6 concern operationalised.
* Bad, because shape emission is substantial (~600-800 lines per module). Mitigation: deterministic emission ordering keeps reviewer cognition tractable.
* Bad, because SHACL-AF rule SPARQL bodies are inline in TTL — verbose but inspectable.
* Bad, because pyshacl version-pinning required (SHACL-AF support has historically had implementation variation). Mitigation: lock `pyshacl==0.25.0` per ADR-0008.
* Neutral, because every SHACL-AF rule cites its source ODR via `dct:source` — provenance trivially traceable.

### Confirmation

The ADR is honoured when all eight hold:

1. **All six modules emit shapes + annotations.** `opda-gen emit-shapes` produces six `*-shapes.ttl` + six `*-annotations.ttl` files.
2. **Byte-identity CI green** per file.
3. **Three-graph isolation verified.** No `sh:*` triples in any annotations file; no `owl:Class` triples in any shapes file; no DPV co-annotations in any classes file.
4. **Every shape carries explicit `sh:severity`.** SPARQL: `SELECT ?s WHERE { ?s a sh:NodeShape ; sh:property [ FILTER NOT EXISTS { ?s sh:severity ?sev } ] }` returns empty.
5. **Five `sh:Violation` categories emit.** Identity-key + IC breach + no-identity-override + special-category PII + meta-shape-over-shape-graph all present.
6. **Three-rule interface contract emitted** as meta-shapes in foundation `opda-shapes.ttl`.
7. **DPV co-annotations validate against ODR-0018 §Rule 3a CI test.** `ASK { GRAPH opda:classes { ?s dpv-pd:hasPersonalDataCategory ?o } }` returns FALSE (co-annotations NOT in classes graph).
8. **Diagnostic exemplars validate.** `pyshacl -s opda-shapes.ttl -d source/03-standards/ontology/exemplars/registered-freehold-house.ttl` returns no unexpected violations.

Manual test: `opda-gen emit-shapes && pyshacl --advanced -s opda-shapes.ttl -d derived/opda-validation.ttl`.

## More Information

* **Ratified ODRs realised:** [ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) (three-rule interface contract); [ODR-0012](../ontology/odr/ODR-0012-data-governance-layer.md) (DPV Phase-1 + Article 10); [ODR-0013](../ontology/odr/ODR-0013-shacl-validation-and-severity.md) (five-tier severity framework); [ODR-0017](../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md) (SHACL-AF pattern); [ODR-0018](../ontology/odr/ODR-0018-dpv-class-level-coannotation-pattern.md) (DPV class-level co-annotation).
* **Predecessor ADR:** [ADR-0011 — Module TBox emission](./ADR-0011-module-tbox-emission.md). Class graphs must land before shapes can target them.
* **Successor ADR:** [ADR-0013 — Overlay profile emission](./ADR-0013-overlay-profile-emission.md). Per-overlay profile shapes consume the base shapes emitted here.
* **Eleven SHACL-AF citing sites enumerated:** UPRN succession (ODR-0005 §6a); deprecation chain (ODR-0011 §5a); INSPIRE succession (ODR-0015 §4a); PROV-O Claims (ODR-0009 Q7); identifier succession (ODR-0006 Q1); capacity-authority match (ODR-0006 Q4); lease term succession (ODR-0007 Q5); milestone variance (ODR-0007 Q6); verification activity succession (ODR-0009 Q7); PII without DPV co-annotation (ODR-0012 Q5); no-identity-override meta-shape (ODR-0010 §Q6).
* **Out of scope for this ADR:**
  - Overlay profile shape emission (ADR-0013).
  - BASPI5 round-trip integration (ADR-0014).
  - Exemplar `expected-report.ttl` generation (ADR-0014).
  - DPV TBox itself (referenced; not imported — Kendall's S012 condition).
