---
status: proposed
date: 2026-05-27
tags: [ontology, mvp, baspi5, round-trip, exemplar, ci, retirement]
supersedes: []
depends-on: [ADR-0013, ODR-0010, ODR-0004, ODR-0003]
implements: [ADR-0008]
---

# BASPI5 round-trip MVP harness + diagnostic exemplar regression

## Context and Problem Statement

This ADR is the **MVP gate** for the OPDA ontology implementation programme. It ratifies the **BASPI5 round-trip harness** that closes [ODR-0003 §"Programme retirement criterion"](../ontology/odr/ODR-0003-pdtf-ontology-programme.md) condition (i): the MVP round-trip closes when `pdtf-transaction.json` → loaded SHACL profile → rendered BASPI5 form → validated transaction with full `dct:source` traceability all succeed end-to-end.

Per [ODR-0010 §Q7](../ontology/odr/ODR-0010-overlay-profile-mechanism.md), this is the operational pressure-test for the entire ratified ODR stack: if BASPI5 round-trips, the seven `kind: pattern` ODRs (ODR-0005/0006/0007/0008/0009/0015 + the cross-cutting ODR-0010/0011/0012/0013/0017/0018) are coherent end-to-end.

The harness also closes [ODR-0004 §8a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) diagnostic-exemplar pairing: each of the 15 ratified exemplars in `source/03-standards/ontology/exemplars/` pairs with an `expected-report.ttl` recording the SHACL validation report it should produce. Pyshacl-generated reports must match the expected reports byte-for-byte; CI regression catches any TBox/shape change that breaks an exemplar's validation outcome.

Together: this ADR transforms ODR-0003 + ODR-0010 + ODR-0004 from ratified rules into a working demonstration. Programme retirement triggers on completion.

## Decision Drivers

* **End-to-end coherence proof.** The harness must exercise every ratified ODR's emission — class graph + shapes graph + annotation graph + SKOS substrate + per-overlay profile + DASH UI predicates + PROV-O Plan-vs-Activity + DPV co-annotations + SHACL-AF rules.
* **`dct:source` traceability** ([ODR-0010 §Q3](../ontology/odr/ODR-0010-overlay-profile-mechanism.md)) — every rendered form question links back to a data-dictionary leaf URI; every minted term traces to its glossary or regulator source.
* **Regression-test discipline** ([ODR-0004 §8a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)) — exemplar + expected-report.ttl pairing means SHACL drift surfaces immediately, not after consumer breakage.
* **Reproducibility** — CI runs the same harness on every PR; round-trip success is the green-light criterion for shipping any TBox/shape change.
* **Operational pressure-test** (Davis termination signal 1 from Scope-Check 1 Q8) — "BASPI5 round-trip closes" is the MVP gate Davis named in Scope-Check 1. Closes Davis's termination test.

## Considered Options

* **A — Manual end-to-end testing.** Pro: simplest to start. Con: not CI-friendly; doesn't catch regressions; requires human in the loop for every change.
* **B — Automated round-trip harness with per-exemplar expected-report (chosen).** Pro: CI-integrated; deterministic; catches regressions at PR time. Con: substantial test fixture authoring up front.
* **C — Property-based testing only** (Hypothesis / QuickCheck over the schemas). Pro: covers more cases. Con: per-property test design is research-grade work, not a fit for the MVP gate.

## Decision Outcome

Chosen option: **B — Automated BASPI5 round-trip harness with per-exemplar `expected-report.ttl` pairing**, integrated into CI. The harness consists of three layers:

1. **Round-trip layer:** Python script in `tests/baspi5-round-trip/` that loads a BASPI5 JSON document, parses it into RDF via the ratified ontology, validates against the BASPI5 profile, and regenerates a BASPI5 JSON document. Round-trip equivalence (input JSON ≡ output JSON after normalisation) is the MVP gate.
2. **Exemplar regression layer:** `pytest`-based suite that validates each of the 15 exemplars against the shapes graph and compares the resulting `sh:ValidationReport` to its committed `expected-report.ttl`.
3. **`dct:source` traceability layer:** SPARQL queries verifying every minted form question + every shape's `sh:path` resolves to a data-dictionary leaf URI.

### Round-trip layer

```python
# tests/baspi5-round-trip/test_round_trip.py
import json
import pytest
from pyshacl import validate
from rdflib import Graph, ConjunctiveGraph

@pytest.fixture
def opda_ontology():
    """Load the full ratified ontology corpus."""
    g = ConjunctiveGraph()
    for ttl in [
        "source/03-standards/ontology/foundation.ttl",
        "source/03-standards/ontology/opda-vocabularies.ttl",
        "source/03-standards/ontology/opda-property.ttl",
        "source/03-standards/ontology/opda-agent.ttl",
        "source/03-standards/ontology/opda-transaction.ttl",
        "source/03-standards/ontology/opda-claim.ttl",
        "source/03-standards/ontology/opda-governance.ttl",
        "source/03-standards/ontology/opda-descriptive.ttl",
        "source/03-standards/ontology/profiles/baspi5.ttl",
    ]:
        g.parse(ttl, format="turtle")
    return g

def test_baspi5_round_trip(opda_ontology, baspi5_sample_json):
    # 1. JSON → RDF
    transaction_rdf = json_to_rdf(baspi5_sample_json, opda_ontology)

    # 2. Validate against BASPI5 profile
    conforms, results_graph, results_text = validate(
        transaction_rdf,
        shacl_graph=opda_ontology,
        ont_graph=opda_ontology,
        inference="rdfs",
        advanced=True,
    )
    assert conforms, f"BASPI5 profile violations: {results_text}"

    # 3. Verify dct:source traceability
    for shape in opda_ontology.subjects(RDF.type, SH.NodeShape):
        for path in opda_ontology.objects(shape, SH.path):
            sources = list(opda_ontology.objects(shape, DCT.source))
            assert sources, f"Shape {shape} missing dct:source"

    # 4. RDF → JSON (regenerate the form)
    regenerated_json = rdf_to_baspi5_json(transaction_rdf, opda_ontology)

    # 5. Round-trip equivalence (after normalisation)
    assert normalise(regenerated_json) == normalise(baspi5_sample_json), \
        "BASPI5 round-trip lost information"
```

Round-trip equivalence after normalisation accounts for: ordering of arrays (sorted); whitespace; default-value insertion (filled in JSON; absent in RDF if `xsd` default).

### Exemplar regression layer

For each of the 15 exemplars, pair with `<exemplar>-expected-report.ttl`:

```bash
source/03-standards/ontology/exemplars/
├── registered-freehold-house.ttl                          # already exists
├── registered-freehold-house-expected-report.ttl          # ADR-0014 deliverable
├── unregistered-pre-first-registration-house.ttl
├── unregistered-pre-first-registration-house-expected-report.ttl
├── flat-with-split-uprn.ttl
├── flat-with-split-uprn-expected-report.ttl
├── ... (12 more pairings)
```

Generator emits each `expected-report.ttl` once (per ADR-0007); subsequent runs compare against committed report. Drift → CI failure.

```turtle
# registered-freehold-house-expected-report.ttl
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix opda: <https://w3id.org/opda/#> .
@prefix dct: <http://purl.org/dc/terms/> .

[]
    a sh:ValidationReport ;
    sh:conforms true ;          # Baseline easy case — no violations expected
    sh:result () ;              # Empty result set
    dct:source <https://w3id.org/opda/exemplars/registered-freehold-house> ;
    opda:pairedWith <source/03-standards/ontology/exemplars/registered-freehold-house.ttl> ;
    .
```

For exemplars exercising IC-bearing surfaces (e.g. `unregistered-pre-first-registration-house.ttl` — LegalEstate-without-RegisteredTitle case), the expected report includes specific `sh:Info` SHACL-AF rule materialisations:

```turtle
# unregistered-pre-first-registration-house-expected-report.ttl
[]
    a sh:ValidationReport ;
    sh:conforms true ;
    sh:result (
        [
            a sh:ValidationResult ;
            sh:resultSeverity sh:Info ;
            sh:focusNode opda-x:estate ;
            sh:sourceShape opda:UPRNSuccessionRule ;
            sh:resultMessage "Estate has no RegisteredTitle yet; lifecycle event prov:wasGeneratedBy first-registration activity expected."@en ;
        ]
    ) ;
    .
```

### `dct:source` traceability layer

```python
# tests/baspi5-round-trip/test_traceability.py
def test_every_shape_traces_to_dictionary(opda_ontology):
    """Every shape's sh:path predicate MUST have dct:source resolving to a data-dictionary leaf."""
    query = """
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX dct: <http://purl.org/dc/terms/>
    SELECT ?shape ?path WHERE {
      ?shape sh:property [ sh:path ?path ] .
      FILTER NOT EXISTS { ?shape dct:source ?src }
    }
    """
    results = list(opda_ontology.query(query))
    assert not results, f"Shapes missing dct:source: {results}"

def test_every_minted_class_traces_to_odr(opda_ontology):
    """Every emitted owl:Class MUST have dct:source resolving to a ratified ODR."""
    # Similar SPARQL; assertion on ODR-NNNN regex in source URI
```

### CI integration

`.github/workflows/baspi5-round-trip.yml`:

```yaml
name: BASPI5 round-trip MVP gate
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  round-trip:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -e tools/opda-gen
      - run: pip install pyshacl==0.25.0 pytest
      - run: pytest tests/baspi5-round-trip/

  exemplar-regression:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        exemplar:
          - registered-freehold-house
          - unregistered-pre-first-registration-house
          - flat-with-split-uprn
          - flat-no-uprn-newly-converted
          - rural-plot-inspire-no-uprn
          - listed-building-divergent-addresses
          - person-with-name-change
          - organisation-with-merger
          - proprietorship-relator-multi-proprietor
          - simple-transaction-with-milestones
          - lease-extension-transaction
          - chain-of-transactions
          - claim-with-document-evidence
          - claim-with-electronic-record-evidence
          - claim-with-vouch-evidence
    steps:
      - uses: actions/checkout@v4
      - run: pip install pyshacl==0.25.0
      - run: |
          pyshacl --advanced \
            -s source/03-standards/ontology/opda-shapes.ttl \
            -d source/03-standards/ontology/exemplars/${{ matrix.exemplar }}.ttl \
            -f turtle \
            > /tmp/${{ matrix.exemplar }}-actual-report.ttl
          # rdflib-based diff (semantic equivalence, not byte-identity, because
          # SHACL reports can vary blank-node IDs but be semantically equivalent)
          python tests/baspi5-round-trip/compare_reports.py \
            /tmp/${{ matrix.exemplar }}-actual-report.ttl \
            source/03-standards/ontology/exemplars/${{ matrix.exemplar }}-expected-report.ttl
```

### Consequences

* Good, because the MVP gate is now mechanically verifiable — `pytest tests/baspi5-round-trip/` returns green or red.
* Good, because exemplar regression catches TBox/shape drift at PR time — Cagle's "distinctions earn their keep when SHACL treats them differently" operationalised as CI test.
* Good, because `dct:source` traceability is enforced — provenance is not honour-system.
* Good, because round-trip equivalence is the canonical end-to-end pressure-test — closes Davis's Scope-Check 1 Q8 termination signal 1.
* Good, because programme retirement triggers on this ADR's confirmation — ODR-0003 retirement criterion (i) closes; criterion (ii) "every linked ODR is accepted" already met (17 ODRs accepted).
* Bad, because expected-report.ttl emission requires SHACL report semantic comparison (blank-node renames; ordering); the comparison utility is non-trivial.
* Bad, because BASPI5 sample JSON document needs careful construction — synthetic data that exercises every ratified pattern. Mitigation: start with one real BASPI5 submission anonymised by Council member.
* Bad, because round-trip equivalence under normalisation can mask information loss in edge cases. Mitigation: explicit canary tests for known lossy cases (per-form variant rendering; profile composition collapse).
* Neutral, because non-BASPI5 overlays (TA6, NTS, etc.) are post-MVP — TA6 round-trip harness etc. land as follow-up ADRs in the Phase-7 deferred-overlay queue.

### Confirmation

The ADR is honoured when all eight hold (this is the **programme retirement gate**):

1. **Round-trip harness implemented.** `tests/baspi5-round-trip/test_round_trip.py` exists with the three-layer test suite (round-trip + exemplar regression + dct:source traceability).
2. **All 15 exemplars have `expected-report.ttl` pairings.** Generator emits via `opda-gen emit-exemplar-reports`.
3. **CI green on BASPI5 round-trip.** `pytest tests/baspi5-round-trip/test_round_trip.py::test_baspi5_round_trip` passes.
4. **CI green on all 15 exemplar regressions.** Matrix job in `baspi5-round-trip.yml` is fully green.
5. **`dct:source` traceability tests pass.** No shape or class lacks `dct:source`; every `dct:source` URI resolves.
6. **Round-trip preserves information.** No silent data loss between input BASPI5 JSON and regenerated BASPI5 JSON.
7. **Real BASPI5 form rendering works.** A DASH-compatible viewer (e.g. TopBraid Composer; or pyshacl-rendered DASH form preview) produces a recognisable BASPI5 form from `profiles/baspi5.ttl` + a sample transaction RDF.
8. **ODR-0003 retirement criterion (i) closes.** The programme retires when the gate passes — subsequent ontology work lands as fresh ODRs/ADRs.

Manual test: `pytest tests/baspi5-round-trip/ -v` → all green; `opda-gen emit-exemplar-reports && git diff` → empty diff; `pyshacl --advanced -s opda-shapes.ttl -d exemplars/registered-freehold-house.ttl` → `sh:conforms true`.

## Implications for ADR programme retirement

When this ADR moves `proposed → accepted` (Confirmation §1-8 all hold), the ADR programme itself retires per [ADR programme plan §10](./ADR-programme-ontology-implementation.md). Both conditions for retirement land:

1. **MVP gate cleared** — BASPI5 round-trip demonstrates end-to-end coherence (this ADR §Confirmation).
2. **Every ADR in this programme** (ADR-0008 through ADR-0014) is `status: accepted`.

Plus ODR-0003 §"Programme retirement criterion" closes:

- Condition (i): MVP round-trip closes ✅ (this ADR's Confirmation).
- Condition (ii): every linked ODR is `accepted` ✅ (17 ODRs accepted as of 2026-05-27).

The Council programme and the ADR programme retire jointly. Subsequent ontology-engineering work (overlay additions; module amendments; consumer-profile additions) lands as fresh ODRs/ADRs without revisiting these programmes' sequencing.

**Programme-wide validation gate** (per [ADR programme plan §9 — Validation discipline](./ADR-programme-ontology-implementation.md)). In addition to the ADR-specific criteria above, this ADR moves `proposed → accepted` only when **all four** of the following hold (independent of the worker that implemented this ADR):

- **(a) Soundness check PASS** — every emitted artefact traces to a cited ODR/ADR `## Rules` or `## Operational specifications` clause via `dct:source` (for Turtle) or code-comment provenance header (for Python). The validation agent extracts emitted-artefact provenance and verifies each resolves to a ratified section.
- **(b) Completeness check PASS** — every cited ODR's `## Rules` and `## Operational specifications` subsection is realised by an emitted artefact OR explicitly deferred with a named follow-up trigger. The validation agent enumerates cited subsections and checks coverage.
- **(c) Cross-ADR consistency check PASS** — every downstream ADR's confirmation criteria can be met given this ADR's emission (e.g. classes emitted here are referenceable by downstream shapes; shapes here are composable by downstream profiles). The validation agent simulates the downstream contract against this ADR's output.
- **(d) Validation report committed** at `docs/adr/validation/ADR-0014-validation-report.md`, produced by an **independent validation-agent spawn** (NOT the implementing worker; mirrors the Council Devil's Advocate independence per [ODR-0001 §Roles for every session](../ontology/odr/ODR-0001-linked-data-council-methodology.md); see ADR programme plan §8 swarm orchestration topology).

A FAIL on any of (a)–(d) blocks `accepted` status; the implementing worker amends and validation re-runs. Two consecutive validation failures on the same ADR escalate to a Council mini-session per [ODR-0001 §Self-amendment process](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — engineering does not re-deliberate; surfaced `## Rules` ambiguity routes to Council ratification.

## More Information

* **Ratified ODR foundations:** [ODR-0010 §Q7 MVP gate](../ontology/odr/ODR-0010-overlay-profile-mechanism.md); [ODR-0004 §8a diagnostic exemplar harness](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md); [ODR-0003 §Programme retirement criterion](../ontology/odr/ODR-0003-pdtf-ontology-programme.md); Davis Scope-Check 1 Q8 termination signal 1.
* **Predecessor ADRs:** All of ADR-0006 through ADR-0013 must be `status: accepted` (or their confirmation criteria met) before this ADR can close.
* **No successor ADRs in this programme** — retirement on close.
* **Subsequent OPDA ontology work:** Post-MVP overlay additions (TA6, NTS, LPE1, etc.) per ADR-0013 Phase-2/3; module amendments via fresh ODR ratification + corresponding ADR realisation; consumer-profile additions per ad-hoc need.
* **BASPI5 sample data:** A real anonymised BASPI5 submission is preferable to synthetic data. OPDA Council member or member-firm may contribute under CC0 license. If unavailable, hand-construct a representative synthetic transaction exercising: built-form + EPC + utilities + occupiers (PII) + Survey provenance + chain dependency + capacity/authority + listed-building variation.
* **Out of scope for this ADR:**
  - TA6 / NTS / other-overlay round-trip harnesses (Phase-2 follow-up ADRs).
  - VC/DID / wallet integration (ODR-0016 deferred-until-trigger).
  - Generator pipeline performance optimisation (in-scope only if MVP gate regresses on emission time).
