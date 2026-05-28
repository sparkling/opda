---
kind: operations
tier: physical-database
title: Round-trip MVP CI gate
---

# Round-trip MVP CI gate

The round-trip gate is the **MVP gate** for the OPDA ontology-implementation programme per [ODR-0010 §Q7](../../../ontology/odr/) and [ODR-0003 §"Programme retirement criterion" condition (i)](../../../ontology/odr/). It guarantees that BASPI5 instance data validates against the BASPI5 overlay profile + foundation + module shape graphs without false positives or false negatives across the 15 diagnostic exemplars. **Three layers** run in two GitHub Actions workflows:

- **`ci-profile-contract`** — three-rule interface contract enforcement (defined in `.github/workflows/ontology-byte-identity.yml`).
- **`tests/baspi5_round_trip/`** — Python-driven round-trip equivalence + traceability + exemplar regression (defined in `.github/workflows/baspi5-round-trip.yml`).
- **Expected-report byte-identity** — regenerated `<stem>-expected-report.ttl` matches committed (defined in `.github/workflows/baspi5-round-trip.yml`).

## What the gate enforces

Per [ADR-0013](../../../adr/ADR-0013-overlay-profile-emission.md) + [ADR-0014](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md):

1. **Three-rule interface contract** (`ci-profile-contract`):
   - `sh:in` semantics — overlay enum subsets are subset-of-foundation.
   - `sh:Violation` floor — overlay severity ≥ foundation severity.
   - No-identity-override — overlays MUST NOT redefine foundation identity-key shapes (Cat 3 NoIdentityOverride meta-shape catches this).

2. **Round-trip equivalence** ([`test_round_trip.py`](../../../../tests/baspi5_round_trip/test_round_trip.py)):
   JSON ⇄ Turtle ⇄ JSON-LD ⇄ Turtle round-trips on the synthetic BASPI5 sample preserve every dct:source URI, every `opda:` predicate, every value (no lossy conversion).

3. **`dct:source` traceability** ([`test_traceability.py`](../../../../tests/baspi5_round_trip/test_traceability.py)):
   Every emitted shape resolves its `dct:source` to a form-question IRI under `https://www.basp.uk/forms/baspi5#…`; every IRI matches a `baspi5Ref` value in `source/03-standards/schemas/src/schemas/v3/overlays/baspi5.json` (per ADR-0014 G19 closure).

4. **Exemplar regression** ([`test_exemplar_regression.py`](../../../../tests/baspi5_round_trip/test_exemplar_regression.py)):
   Per-exemplar pyshacl validation report matches `<stem>-expected-report.ttl` exactly across all 15 exemplars (registered-freehold-house, chain-of-transactions, etc.).

5. **Expected-report byte-identity**:
   `opda-gen emit-exemplar-reports` regenerates all 15 expected-report TTLs byte-for-byte; CI fails if any expected-report drifts (catches silent pyshacl-version drift or shape-semantics change).

## Commands

```bash
# Interface contract (3 rules)
opda-gen ci-profile-contract --ontology-dir source/03-standards/ontology
# Expected: "profile contract CI: PASS (all 3 rules)"

# Per-exemplar validation (single exemplar)
opda-gen validate-exemplar \
  source/03-standards/ontology/exemplars/registered-freehold-house.ttl
# Exit 0 if report matches expected; exit 1 otherwise.

# Expected-report regeneration + byte-identity diff
opda-gen emit-exemplar-reports
git diff --exit-code source/03-standards/ontology/exemplars/*-expected-report.ttl

# Full three-layer harness
cd /Users/henrik/source/opda
/Users/henrik/source/opda/tools/opda-gen/.venv/bin/python -m pytest tests/baspi5_round_trip -v
# Expected tail: "27 passed"
```

## Workflow definition — Layer 1 (round-trip, traceability, regression)

`.github/workflows/baspi5-round-trip.yml` job `round-trip`:

```yaml
round-trip:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        submodules: recursive

    - uses: actions/setup-python@v5
      with:
        python-version: '3.11'

    - name: Install opda-gen + harness deps
      working-directory: tools/opda-gen
      run: pip install -e .[dev]

    - name: Round-trip equivalence (Confirmation #3, #6)
      run: pytest tests/baspi5_round_trip/test_round_trip.py -v

    - name: dct:source traceability (Confirmation #5)
      run: pytest tests/baspi5_round_trip/test_traceability.py -v

    - name: Exemplar regression — combined (Confirmation #4)
      run: pytest tests/baspi5_round_trip/test_exemplar_regression.py -v
```

## Workflow definition — Layer 2 (per-exemplar matrix)

The matrix runs each of the 15 exemplars in an isolated job so a single-exemplar failure surfaces as one row in the CI dashboard. `fail-fast: false` keeps all rows running independently:

```yaml
exemplar-matrix:
  runs-on: ubuntu-latest
  strategy:
    fail-fast: false
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
    - uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    - name: Install opda-gen
      working-directory: tools/opda-gen
      run: pip install -e .[dev]
    - name: Validate exemplar via opda-gen validate-exemplar
      run: |
        opda-gen validate-exemplar \
          source/03-standards/ontology/exemplars/${{ matrix.exemplar }}.ttl
```

## Workflow definition — Layer 3 (expected-report byte-identity)

```yaml
expected-report-byte-identity:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    - name: Install opda-gen
      working-directory: tools/opda-gen
      run: pip install -e .[dev]
    - name: Regenerate expected reports
      run: opda-gen emit-exemplar-reports --ontology-dir /tmp/exemplar-roundtrip
    - name: Copy ontology fixtures
      run: |
        mkdir -p /tmp/exemplar-roundtrip/exemplars
        cp -r source/03-standards/ontology/*.ttl /tmp/exemplar-roundtrip/
        cp -r source/03-standards/ontology/exemplars/*.ttl /tmp/exemplar-roundtrip/exemplars/
        opda-gen emit-exemplar-reports --ontology-dir /tmp/exemplar-roundtrip
    - name: Compare regenerated vs committed expected-report.ttl
      run: |
        for f in source/03-standards/ontology/exemplars/*-expected-report.ttl; do
          stem=$(basename "$f")
          diff -q "$f" "/tmp/exemplar-roundtrip/exemplars/$stem"
        done
```

## Expected output

When all three layers pass, the BASPI5 round-trip workflow shows:

```
Round-trip equivalence (Confirmation #3, #6)
  6 passed in 0.10s
dct:source traceability (Confirmation #5)
  3 passed in 0.05s
Exemplar regression — combined (Confirmation #4)
  18 passed in 0.55s
exemplar-matrix: 15 jobs passed
expected-report-byte-identity: passed
```

The local `pytest tests/baspi5_round_trip -v` tail reads:

```
======================= 27 passed, 719 warnings in 0.70s =======================
```

The warnings are rdflib's pyparsing-deprecation noise; they do not gate the build.

## Failure modes

**Interface-contract violation:**

```
PROFILE-CONTRACT VIOLATION: Baspi5_AddressShape carries identity-override on opda:Address (rule 3: no-identity-override)
```

A new overlay shape attempted to redefine a foundation identity key. Either move the constraint into a non-identity shape, or escalate to ODR amendment if the foundation key itself needs revising.

**Round-trip failure:**

```
test_round_trip.py::test_jsonld_roundtrip FAILED
  AssertionError: predicate opda:hasSpecialCategoryData lost during JSON→TTL→JSON-LD cycle
```

A predicate's JSON-LD context entry drifted. Check `content-negotiation/jsonld-context.md`; the canonical context must carry a type-coercion or `@id` mapping for every predicate that appears in BASPI5 instance data.

**Traceability failure:**

```
test_traceability.py::test_all_dct_sources_resolve FAILED
  AssertionError: dct:source <https://www.basp.uk/forms/baspi5#A1.8.4.2> has no matching baspi5Ref
```

A shape's `dct:source` form-question IRI doesn't exist in the BASPI5 JSON schema. Realign to an actual `baspi5Ref` value (per the ADR-0014 G19 closure pattern), or update the JSON schema if the question genuinely exists in form version 5.0.3 but is missing from the schema.

**Exemplar regression failure:**

```
test_exemplar_regression.py::test_exemplar_validation_matches_expected_report[chain-of-transactions] FAILED
  AssertionError: actual report has 2 results; expected 1
```

Either the shape semantics changed (intentional → regenerate `<stem>-expected-report.ttl` via `opda-gen emit-exemplar-reports`) or pyshacl regressed (unintentional → pin pyshacl version, file upstream issue).

**Expected-report byte-identity failure:**

```
Files source/03-standards/ontology/exemplars/registered-freehold-house-expected-report.ttl and /tmp/exemplar-roundtrip/exemplars/registered-freehold-house-expected-report.ttl differ
```

The expected-report TTL serialiser became non-deterministic, or a fresh pyshacl run produced different output. Investigate via `diff -u` between committed and regenerated. If pyshacl drift, pin the version. If serialiser drift, check `tools/opda-gen/src/opda_gen/emitters/exemplar_reports.py`.

## Source ADR + ODR

- [ADR-0013 — Overlay profile emission](../../../adr/ADR-0013-overlay-profile-emission.md) §"Three-rule interface contract — CI enforcement".
- [ADR-0014 — BASPI5 round-trip MVP harness](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md) §"CI integration" + §Confirmation #3..#5.
- [ODR-0010 — Overlay profile mechanism](../../../ontology/odr/) §Q6 (no-identity-override) + §Q7 (BASPI5 MVP gate).
- [ODR-0003 — PDTF ontology programme](../../../ontology/odr/) §"Programme retirement criterion" condition (i).
