---
status: proposed
date: 2026-05-27
tags: [ontology, shacl, profiles, overlays, baspi5, dash, emission]
supersedes: []
depends-on: [ADR-0012, ODR-0010]
implements: [ADR-0008]
---

# Overlay profile emission

## Context and Problem Statement

[ODR-0010](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) ratifies the **overlay profile mechanism**: per-form SHACL profile graphs that compose over the foundation + module TBox + base shapes. Each overlay (BASPI5, TA6, NTS, LPE1, CON29R, etc.) defines per-form cardinality, enum subsets, and DASH UI rendering.

This ADR ratifies the **engineering emission** of overlay profile shapes as files under `source/03-standards/ontology/profiles/`. The 10+ overlay schemas in `source/03-standards/schemas/<overlay>/` each translate to one SHACL profile TTL.

Critical context: **BASPI5 is the MVP gate** ([ODR-0010 §Q7](../ontology/odr/ODR-0010-overlay-profile-mechanism.md)). BASPI5 round-trip success closes the programme's MVP gate (per ADR-0014). Other overlays follow incrementally.

Inputs:

- **Overlay JSON schemas** under `source/03-standards/schemas/<overlay>/` — 10+ schemas: baspi5, ta6, ta7, ta10, nts, nts2, con29r, con29dw, llc1, lpe1, fme1, oc1, piq, rds.
- **Three-rule interface contract** (ODR-0010 + ODR-0013 + Cagle Scope-Check 1 Q6): `sh:in` semantics; `sh:Violation` floor; no-identity-override gate. CI-enforced.
- **`opda:ValidationContext` reification** ([ODR-0010 §Q1](../ontology/odr/ODR-0010-overlay-profile-mechanism.md)) — 5-property reification + UFO Substance Kind commitment.
- **DASH UI predicates** ([ODR-0010 §Q4](../ontology/odr/ODR-0010-overlay-profile-mechanism.md)) — `dash:viewer`, `dash:editor`, `dash:propertyRole`, `sh:order`, `sh:group`.
- **`oneOf` → `sh:xone`** ([ODR-0010 §Q5](../ontology/odr/ODR-0010-overlay-profile-mechanism.md)) — `sh:qualifiedValueShape` pattern for nested JSON `oneOf`.
- **`dct:source` form-question IRIs** ([ODR-0010 §Q3](../ontology/odr/ODR-0010-overlay-profile-mechanism.md)) — pattern `…/forms/<overlay>#<question-anchor>`.

## Decision Drivers

* **BASPI5 first** — MVP gate hinges on BASPI5 round-trip. Other overlays follow once BASPI5 demonstrates the pattern works.
* **Three-rule interface contract is operationally enforced** (Cagle's S010 Scope-Check 1 Q6 amendment). Build-step composition must produce no surprises.
* **`opda:ValidationContext` reification carries 5 properties** per S010 Q1 — `opda:profileURI`, `opda:requires`, `opda:overlaysContext`, etc. Each profile emits one ValidationContext instance.
* **DASH UI predicates emit alongside SHACL constraints** — `dash:viewer`/`dash:editor`/`sh:order`/`sh:group` per form question.
* **Per-overlay deliberate-ratification optional but recommended** — minor overlays (LPE1, CON29DW, OC1) can emit mechanically; substantive overlays (BASPI5, TA6) may warrant per-overlay Author-only mini-sessions to record any non-mechanical choices.
* **Profile composition is build-step graph-union** per ODR-0010 §Q1, NOT entailment. Generator composer runs after profile emission.

## Considered Options

* **A — Emit all overlays as one file `opda-profiles.ttl`.** Pro: simpler composition. Con: per-overlay versioning impossible; per-overlay amendment cycles can't target one overlay.
* **B — Per-overlay file under `profiles/<overlay>.ttl` (chosen).** Pro: per-overlay surgical amendments; per-overlay versioning via `owl:versionIRI`; consumers can load only the profile they need.
* **C — Per-form-question file.** Pro: maximum granularity. Con: hundreds of files; no operational benefit.

## Decision Outcome

Chosen option: **B — Per-overlay SHACL profile files** under `source/03-standards/ontology/profiles/`. Each profile is a self-contained shapes graph + DASH UI annotations + `opda:ValidationContext` reification.

### Profile emission template

```turtle
# profiles/baspi5.ttl — BASPI5 overlay profile
# Generator: opda-gen <version>; DO NOT HAND-EDIT.
# Source overlay schema: source/03-standards/schemas/baspi5/*.json
# Three-rule interface contract enforced (per ODR-0010 + ODR-0013).

@prefix opda:    <https://w3id.org/opda/#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix dash:    <http://datashapes.org/dash#> .
@prefix dct:     <http://purl.org/dc/terms/> .

<https://w3id.org/opda/profiles/baspi5>
    a owl:Ontology ;
    dct:title "BASPI5 overlay profile"@en ;
    dct:description "SHACL profile graph for the BASPI5 (British Association of Surveyors Property Information) version 5 form. Per-form cardinality, enum subsets, DASH UI rendering."@en ;
    owl:imports <https://w3id.org/opda/0.1.0/> ;
    owl:imports <https://w3id.org/opda/vocabularies/> ;
    owl:versionIRI <https://w3id.org/opda/profiles/baspi5/0.1.0/> ;
    .

# opda:ValidationContext reification per ODR-0010 §Q1
opda:Baspi5ValidationContext
    a opda:ValidationContext ;
    opda:profileURI <https://w3id.org/opda/profiles/baspi5> ;
    opda:requires opda:Property , opda:Address , opda:LegalEstate ;
    opda:overlaysContext <https://w3id.org/opda/profiles/foundation> ;
    opda:sourcedFrom <https://www.basp.uk/forms/baspi5> ;
    opda:formVersion "5.0.3" ;
    .

# Profile shapes: per-form cardinality + enum subsets + DASH UI
opda:Baspi5_PropertyShape
    a sh:NodeShape ;
    sh:targetClass opda:Property ;
    sh:property [
        sh:path opda:builtForm ;
        sh:minCount 1 ;                       # BASPI5 requires built-form
        sh:in ( "Detached" "Semi-detached" "Mid-terrace" "End-terrace" ) ;  # subset
        sh:severity sh:Violation ;
        dash:viewer dash:LabelViewer ;
        dash:editor dash:EnumSelectEditor ;
        sh:order 1 ;
        sh:group opda:Baspi5_BuiltForm_Group ;
        dct:source <https://www.basp.uk/forms/baspi5#B1.3.2> ;
        sh:message "BASPI5 question B1.3.2: select the property built-form."@en ;
    ] ;
    sh:property [
        sh:path opda:currentEnergyRating ;
        sh:minCount 1 ;                       # BASPI5 requires EPC band
        sh:in ( "A" "B" "C" "D" "E" "F" "G" ) ;  # full scheme; no per-form subsetting
        dash:viewer dash:LabelViewer ;
        dash:editor dash:EnumSelectEditor ;
        sh:order 2 ;
        sh:group opda:Baspi5_Energy_Group ;
        dct:source <https://www.basp.uk/forms/baspi5#B2.1.1> ;
    ] ;
    # … (full per-question cardinality + UI per BASPI5 schema)
    .

# DASH groups per ODR-0010 §Q4
opda:Baspi5_BuiltForm_Group
    a sh:PropertyGroup ;
    rdfs:label "Built form"@en ;
    sh:order 1 ;
    .

opda:Baspi5_Energy_Group
    a sh:PropertyGroup ;
    rdfs:label "Energy & EPC"@en ;
    sh:order 2 ;
    .

# `oneOf` → sh:xone per ODR-0010 §Q5 (sellersCapacity nested oneOf example)
opda:Baspi5_SellersCapacityShape
    a sh:NodeShape ;
    sh:targetClass opda:Seller ;
    sh:xone (
        [ sh:property [ sh:path opda:hasAssertedCapacity ; sh:hasValue "Personal Representative" ;
                        sh:property [ sh:path opda:hasEvidencedAuthority ; sh:minCount 1 ] ] ]
        [ sh:property [ sh:path opda:hasAssertedCapacity ; sh:hasValue "Power of Attorney" ;
                        sh:property [ sh:path opda:hasEvidencedAuthority ; sh:minCount 1 ] ] ]
        [ sh:property [ sh:path opda:hasAssertedCapacity ; sh:hasValue "Trustee" ] ]
        # …
    ) ;
    sh:severity sh:Violation ;
    dct:source <https://www.basp.uk/forms/baspi5#B7.2> ;
    .
```

### Overlay catalogue (initial)

| Overlay | Source schema | Coverage | First emission |
|---|---|---|---|
| BASPI5 (v5) | `schemas/baspi5/*.json` | 318 leaves | **Phase 1 — MVP gate** |
| TA6 | `schemas/ta6/*.json` | 178 leaves | Phase 2 — post-MVP |
| TA7 | `schemas/ta7/*.json` | (count) | Phase 2 |
| TA10 | `schemas/ta10/*.json` | (count) | Phase 2 |
| NTS / NTS2 | `schemas/nts2/*.json` | 160 leaves | Phase 2 |
| LPE1 | `schemas/lpe1/*.json` | 136 leaves | Phase 2 |
| RDS | `schemas/rds/*.json` | 196 leaves | Phase 2 |
| PIQ | `schemas/piq/*.json` | 184 leaves | Phase 2 |
| CON29R | `schemas/con29r/*.json` | (count) | Phase 3 — search overlays |
| CON29DW | `schemas/con29dw/*.json` | (count) | Phase 3 |
| LLC1 | `schemas/llc1/*.json` | (count) | Phase 3 |
| FME1 | `schemas/fme1/*.json` | (count) | Phase 3 |
| OC1 | `schemas/oc1/*.json` | (count) | Phase 3 |

BASPI5 lands first to satisfy ADR-0014 MVP gate. Phases 2 and 3 follow incrementally; each overlay may warrant a small Author-only Council session if the overlay's structure surfaces non-mechanical decisions (per S001 / ODR-0010 deliberation precedent).

### Three-rule interface contract — CI enforcement

Generator's composer (per ADR-0007 §"Module pluralism") runs three CI tests on every overlay profile:

1. **`sh:in` semantics test.** Profile-graph `sh:in` constraints must union into base SKOS scheme's `skos:Concept` set:
   ```sparql
   SELECT ?profile ?p WHERE {
     ?profile sh:property [ sh:path ?p ; sh:in/rdf:rest*/rdf:first ?member ] .
     ?p skos:inScheme ?scheme .
     FILTER NOT EXISTS { ?scheme skos:hasTopConcept|skos:member ?member }
   }
   ```
   Should return empty. Profile members must exist in base scheme.
2. **`sh:Violation` floor test.** Profile cannot downgrade base `sh:Violation` severity:
   ```sparql
   SELECT ?profile ?baseShape WHERE {
     ?profile sh:property ?profileProperty .
     ?profileProperty sh:severity ?profileSeverity ; sh:path ?path .
     ?baseShape sh:property [ sh:path ?path ; sh:severity sh:Violation ] .
     FILTER (?profileSeverity != sh:Violation)
   }
   ```
   Should return empty. No profile downgrades.
3. **No-identity-override test.** Profile cannot reduce identity-key cardinality below base:
   ```sparql
   SELECT ?profile ?key WHERE {
     ?profile sh:property [ sh:path ?key ; sh:maxCount 0 ] .
     ?baseShape sh:property [ sh:path ?key ] .
     ?baseShape opda:identifiesIdentityOf ?kind .
   }
   ```
   Should return empty. No profile removes identity properties.

CI tests run on every `opda-gen emit-profile` invocation; failures block commit.

### `dct:source` form-question IRI minting

Per ODR-0010 §Q3, each profile shape's property carries `dct:source` to the form-question anchor:

```
Pattern: https://<authority>/<overlay-form-path>#<question-anchor>
Example: https://www.basp.uk/forms/baspi5#B1.3.2
```

The page-anchors stay stable across form versions per ODR-0010 §Q3 ratification (anchor pattern owned by form publisher; OPDA archives reference but does not mint anchors).

### Consequences

* Good, because BASPI5-first sequencing aligns with the MVP gate; subsequent overlays follow a proven pattern.
* Good, because per-overlay files enable per-overlay versioning and surgical amendment.
* Good, because three-rule interface contract is mechanically enforced at every profile emission — Cagle's S010 vigilance operationalised.
* Good, because `opda:ValidationContext` reification carries provenance — every profile knows what it overlays + what foundation/module imports it requires.
* Good, because DASH UI predicates emit inline with SHACL constraints — form generation is a load-from-profile operation, not a hand-author one.
* Good, because `oneOf` → `sh:xone` pattern is mechanical — JSON Schema nested oneOf translates predictably.
* Bad, because profile emission requires the overlay JSON schemas to be well-structured; some overlay schemas may have ad-hoc quirks. Mitigation: per-overlay Author-only Council session can amend the emission discipline if a quirk surfaces.
* Bad, because BASPI5 alone is 318 leaves → ~600 lines of TTL. Other overlays similar. ~6,000 lines total across 10+ overlays.
* Neutral, because non-MVP overlays are deferred; the engineering programme retires when BASPI5 round-trips, even if Phase-2/3 overlays haven't all emitted.

### Confirmation

The ADR is honoured when all six hold:

1. **BASPI5 profile emits.** `opda-gen emit-profile baspi5` produces `profiles/baspi5.ttl`.
2. **Byte-identity CI green.**
3. **Three-rule interface contract CI tests pass** for BASPI5 (and every subsequent overlay).
4. **DASH UI form renders** from `profiles/baspi5.ttl` — `pyshacl --advanced` plus a DASH-compatible viewer produces a working BASPI5 form mock-up.
5. **`opda:ValidationContext` instance present** in every profile file.
6. **`dct:source` form-question IRIs resolve** to BASPI5 schema anchors (https://www.basp.uk/forms/baspi5#...).

Manual test: `opda-gen emit-profile baspi5 && pyshacl --advanced -s profiles/baspi5.ttl -d source/03-standards/ontology/exemplars/registered-freehold-house.ttl` returns a `sh:ValidationReport` consistent with BASPI5's cardinality requirements.

**Programme-wide validation gate** (per [ADR programme plan §9 — Validation discipline](./ADR-programme-ontology-implementation.md)). In addition to the ADR-specific criteria above, this ADR moves `proposed → accepted` only when **all four** of the following hold (independent of the worker that implemented this ADR):

- **(a) Soundness check PASS** — every emitted artefact traces to a cited ODR/ADR `## Rules` or `## Operational specifications` clause via `dct:source` (for Turtle) or code-comment provenance header (for Python). The validation agent extracts emitted-artefact provenance and verifies each resolves to a ratified section.
- **(b) Completeness check PASS** — every cited ODR's `## Rules` and `## Operational specifications` subsection is realised by an emitted artefact OR explicitly deferred with a named follow-up trigger. The validation agent enumerates cited subsections and checks coverage.
- **(c) Cross-ADR consistency check PASS** — every downstream ADR's confirmation criteria can be met given this ADR's emission (e.g. classes emitted here are referenceable by downstream shapes; shapes here are composable by downstream profiles). The validation agent simulates the downstream contract against this ADR's output.
- **(d) Validation report committed** at `docs/adr/validation/ADR-0013-validation-report.md`, produced by an **independent validation-agent spawn** (NOT the implementing worker; mirrors the Council Devil's Advocate independence per [ODR-0001 §Roles for every session](../ontology/odr/ODR-0001-linked-data-council-methodology.md); see ADR programme plan §8 swarm orchestration topology).

A FAIL on any of (a)–(d) blocks `accepted` status; the implementing worker amends and validation re-runs. Two consecutive validation failures on the same ADR escalate to a Council mini-session per [ODR-0001 §Self-amendment process](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — engineering does not re-deliberate; surfaced `## Rules` ambiguity routes to Council ratification.

## More Information

* **Council-ratified inputs:** [ODR-0010 §Q1-Q7](../ontology/odr/ODR-0010-overlay-profile-mechanism.md) — overlay profile mechanism, BASPI5 round-trip framing, three-rule interface contract.
* **Predecessor ADR:** [ADR-0012 — SHACL shapes + DPV annotation emission](./ADR-0012-shacl-and-dpv-annotation-emission.md). Base shapes graph must land first.
* **MVP gate (successor):** [ADR-0014 — BASPI5 round-trip MVP harness](./ADR-0014-baspi5-round-trip-mvp-harness.md). Closes the programme.
* **Cross-corpus references:** ODR-0013 §Q1 + §Q7 (three-rule interface cross-cite); ODR-0008 §Q7a (overlay-handoff three boundary clauses + three CI tests).
* **DASH spec:** https://datashapes.org/dash.html
* **Per-overlay form schema authorities:**
  - BASPI5 — British Association of Surveyors (https://www.basp.uk/)
  - TA6/7/10 — The Law Society of England and Wales
  - NTS2 — National Trading Standards
  - LPE1 — Leasehold Property Enquiries
  - CON29R/DW + LLC1 — Local Authority searches (Law Society)
* **Out of scope for this ADR:**
  - BASPI5 round-trip integration tests (ADR-0014).
  - Overlay schemas themselves (already in `source/03-standards/schemas/`; nested git repo).
  - DASH viewer/editor implementation (third-party tooling).
