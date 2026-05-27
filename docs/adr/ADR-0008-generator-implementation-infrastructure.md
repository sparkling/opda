---
status: accepted
date: 2026-05-27
tags: [ontology, generator, python, infrastructure, ci]
supersedes: []
depends-on: [ADR-0007, ODR-0004]
implements: [ADR-0007]
---

# Ontology generator — implementation infrastructure

## Context and Problem Statement

[ADR-0007](./ADR-0007-ontology-generator-specification.md) ratifies the **specification** of the OPDA ontology generator: a bespoke Python tool with `rdflib`-backed primitives plus a custom canonical N-Triples → Turtle serialiser, satisfying [ODR-0004 §6a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) byte-identity CI contract.

This ADR ratifies the **implementation infrastructure** that realises ADR-0007:

- Repository structure for the generator package (`tools/opda-gen/`).
- CLI design (`opda-gen emit ...`).
- Test framework and per-module test fixtures.
- CI workflow integration with GitHub Actions.
- Dependency pinning and reproducibility guarantees.
- Local-development workflow (one-command regeneration).

Without this ADR, ADR-0007 stays as documentation without executable code. With it, ADR-0009 (foundation emission) and onwards can land.

## Decision Drivers

* **One-command developer experience.** `opda-gen emit` must produce byte-identical TTL with no further configuration. Onboarding cost for a new contributor: read README, install, run, see green CI.
* **Reproducibility across machines.** Two engineers running the generator on different platforms (macOS, Linux, Windows-via-WSL) MUST produce byte-identical output. Mitigation: lock all dependencies; pin Python version; use deterministic stdlib hash + canonical serialiser.
* **Fast iteration.** Generator runs in under 5 seconds on a typical laptop for the full corpus. Test suite runs in under 30 seconds.
* **CI feedback loop.** Every PR sees byte-identity test result within 2 minutes of push.
* **Inspectable.** No opaque framework behaviour. Every emission rule traceable to a line of OPDA-owned Python.

## Considered Options

* **A — Standalone repository for the generator** (separate from main OPDA repo). Pro: focused scope; cross-project reuse potential. Con: cross-repo coordination overhead; ODR + ADR + generator stay in lockstep regardless, so single-repo is operational kindness.
* **B — Inline Python module at root of OPDA repo** (`src/ontology_generator/`). Pro: zero cross-repo coordination. Con: pollutes the Astro site repo namespace; root-level Python invites accidental coupling.
* **C — `tools/opda-gen/` subdirectory within main repo** (chosen). Pro: clearly scoped utility; idiomatic Python package; doesn't pollute Astro site src/; one PR per ODR-driven change touches both ODR + generator together.

## Decision Outcome

Chosen option: **C — `tools/opda-gen/` subdirectory within the main OPDA repository**, because it satisfies all five decision drivers while keeping ODR + ADR + generator in one commit-stream for traceability.

### Repository structure

```
opda/                                          # Repository root
├── docs/
│   ├── adr/                                   # This ADR + siblings
│   └── ontology/odr/                          # ODR corpus (ratified inputs)
├── source/
│   ├── 00-deliverables/semantic-models/       # Glossary + data dictionary (inputs)
│   └── 03-standards/
│       ├── schemas/                           # JSON schemas (inputs; nested git repo)
│       └── ontology/                          # Generator outputs (this programme)
│           ├── foundation.ttl                 # ADR-0009 output
│           ├── opda-classes.ttl
│           ├── opda-shapes.ttl
│           ├── opda-annotations.ttl
│           ├── opda-vocabularies.ttl          # ADR-0010 output
│           ├── opda-property.ttl              # ADR-0011 outputs
│           ├── opda-agent.ttl
│           ├── opda-transaction.ttl
│           ├── opda-claim.ttl
│           ├── opda-governance.ttl
│           ├── opda-descriptive.ttl
│           ├── profiles/                      # ADR-0013 outputs
│           │   ├── baspi5.ttl
│           │   ├── ta6.ttl
│           │   └── ...
│           ├── derived/                       # Build-step composition
│           │   ├── opda-validation.ttl
│           │   ├── opda-ui.ttl
│           │   └── opda-inference.ttl
│           └── exemplars/                     # ADR-0014 + existing
│               ├── *.ttl                       # 15 diagnostic exemplars
│               └── *-expected-report.ttl       # ADR-0014 pairings
└── tools/
    └── opda-gen/                              # This ADR's deliverable
        ├── pyproject.toml                     # Python project metadata + deps
        ├── README.md                          # Developer-facing docs
        ├── src/opda_gen/
        │   ├── __init__.py
        │   ├── __main__.py                    # `python -m opda_gen` entry
        │   ├── cli.py                         # Click-based CLI
        │   ├── inputs/                        # Input parsers
        │   │   ├── glossary.py
        │   │   ├── data_dictionary.py
        │   │   └── odr_corpus.py              # Parse `kind: pattern` UFO commitments
        │   ├── term_sourcing.py               # 5-line precedence resolver (ODR-0004 §7a)
        │   ├── emitters/
        │   │   ├── foundation.py              # ADR-0009 implementation
        │   │   ├── vocabularies.py            # ADR-0010 implementation
        │   │   ├── classes.py                 # ADR-0011 implementation
        │   │   ├── shapes.py                  # ADR-0012 implementation
        │   │   ├── annotations.py             # ADR-0012 implementation
        │   │   └── profiles.py                # ADR-0013 implementation
        │   ├── serialiser/
        │   │   ├── canonical.py               # Canonical N-Triples → Turtle
        │   │   ├── blank_nodes.py             # SHA-256 skolemisation
        │   │   └── ordering.py                # Deterministic emission ordering
        │   ├── composer.py                    # Derived-profile build-step
        │   └── ci/
        │       ├── three_graph_test.py        # ODR-0004 §3a five-part CI test
        │       └── byte_identity.py           # Regenerate-and-diff check
        ├── tests/
        │   ├── fixtures/
        │   │   ├── minimal_glossary.json
        │   │   └── minimal_dictionary.json
        │   ├── test_serialiser.py             # Canonical ordering invariants
        │   ├── test_term_sourcing.py          # 5-line precedence cases
        │   ├── test_blank_nodes.py            # SHA-256 skolemisation determinism
        │   ├── test_three_graph.py            # CI test correctness
        │   └── test_byte_identity.py          # End-to-end regeneration determinism
        └── .python-version                    # 3.11 lock
```

### CLI design

```bash
$ opda-gen --help
Usage: opda-gen [OPTIONS] COMMAND [ARGS]...

OPDA ontology generator.

Options:
  --version                       Show generator version + git SHA
  --help                          Show this message

Commands:
  emit                            Emit the full ontology corpus
  emit-foundation                 Emit foundation.ttl only (Phase 1)
  emit-vocabularies               Emit SKOS schemes only (Phase 2)
  emit-module <name>              Emit one module .ttl (Phase 3)
  emit-shapes                     Emit shapes graph (Phase 4)
  emit-profile <overlay>          Emit one overlay profile (Phase 5)
  compose                         Build-step compose derived consumer profiles
  ci-byte-identity                Run byte-identity check (regenerate + diff)
  ci-three-graph                  Run ODR-0004 §3a five-part CI test
  validate-exemplar <path>        Run pyshacl against an exemplar; compare to expected-report
```

The `emit` command is the default umbrella: regenerates the full corpus. Sub-commands enable incremental work + targeted testing.

### Dependencies (locked)

`pyproject.toml`:

```toml
[project]
name = "opda-gen"
version = "0.1.0"
requires-python = ">=3.11,<3.12"
dependencies = [
    "rdflib==7.0.0",        # RDF primitives; canonical serialiser is OPDA-owned
    "pyshacl==0.25.0",      # SHACL validation (CI + exemplar tests)
    "click==8.1.7",         # CLI framework
    "pydantic==2.5.0",      # Input schema validation
    "tomli==2.0.1",         # pyproject reading
]

[project.scripts]
opda-gen = "opda_gen.cli:main"

[tool.pytest.ini_options]
testpaths = ["tests"]
```

Lock file (`uv.lock` or `requirements.txt`) committed to repo. CI installs with `pip install -e .` from the locked manifest.

### CI workflow

`.github/workflows/ontology-byte-identity.yml`:

```yaml
name: Ontology byte-identity
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  byte-identity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - working-directory: tools/opda-gen
        run: pip install -e .
      - working-directory: tools/opda-gen
        run: opda-gen emit --output /tmp/ontology
      - run: diff -rq /tmp/ontology source/03-standards/ontology --exclude=exemplars --exclude=derived
      - working-directory: tools/opda-gen
        run: opda-gen ci-three-graph
      - working-directory: tools/opda-gen
        run: opda-gen validate-exemplar source/03-standards/ontology/exemplars/registered-freehold-house.ttl
        # (Plus per-exemplar iteration in matrix strategy.)
```

Sub-2-minute target (Python startup + rdflib parse + emit + diff is fast).

### Consequences

* Good, because the generator lives where the ODRs and ADRs live — one commit can touch all three (rule + spec + implementation).
* Good, because Python 3.11 + rdflib 7.0 is a mature, well-supported stack with predictable behaviour.
* Good, because `tools/opda-gen/` clearly scopes the utility — not part of the Astro site build (ADR-0003) and not part of the schemas nested git repo.
* Good, because CLI sub-commands enable incremental Phase-by-Phase development (Phase 1 emit-foundation; Phase 2 emit-vocabularies; etc.).
* Good, because dependency locking + Python version pinning guarantee cross-machine reproducibility.
* Good, because the test suite catches serialiser regressions before they hit byte-identity CI on the full corpus.
* Bad, because Python adds a runtime dependency to OPDA's build chain (alongside Node for Astro). Mitigation: Python is only required for ontology regeneration, not for site rendering or general contribution.
* Bad, because rdflib version-lock means OPDA can't auto-upgrade with security patches without a generator regression test. Mitigation: weekly Dependabot PR; manual review; small surface area (canonical serialiser bypasses most rdflib code paths).
* Neutral, because the generator is small enough (~800-1200 LOC target per ADR-0007) to be maintained by one engineer.

### Confirmation

The ADR is honoured when all six hold:

1. **Package installs.** `cd tools/opda-gen && pip install -e .` succeeds on a fresh Python 3.11 environment.
2. **CLI runs.** `opda-gen --version` returns a sensible version + git SHA.
3. **Test suite green.** `pytest tools/opda-gen/tests/` passes (initial scope: serialiser invariants + term-sourcing + blank-node determinism + three-graph CI test).
4. **CI workflow exists.** `.github/workflows/ontology-byte-identity.yml` exists and runs on push + PR.
5. **README ships.** `tools/opda-gen/README.md` includes: installation, usage, contribution guide, link back to ADR-0007 specification + ADR-0008 implementation.
6. **Reproducibility verified.** Two contributors regenerate from the same input commit; outputs are byte-identical.

Manual test: clone fresh, install, run `opda-gen emit --output /tmp/test`, `diff -rq /tmp/test source/03-standards/ontology/...` → empty diff.

**Programme-wide validation gate** (per [ADR programme plan §9 — Validation discipline](../plan/ontology-implementation.md)). In addition to the ADR-specific criteria above, this ADR moves `proposed → accepted` only when **all four** of the following hold (independent of the worker that implemented this ADR):

- **(a) Soundness check PASS** — every emitted artefact traces to a cited ODR/ADR `## Rules` or `## Operational specifications` clause via `dct:source` (for Turtle) or code-comment provenance header (for Python). The validation agent extracts emitted-artefact provenance and verifies each resolves to a ratified section.
- **(b) Completeness check PASS** — every cited ODR's `## Rules` and `## Operational specifications` subsection is realised by an emitted artefact OR explicitly deferred with a named follow-up trigger. The validation agent enumerates cited subsections and checks coverage.
- **(c) Cross-ADR consistency check PASS** — every downstream ADR's confirmation criteria can be met given this ADR's emission (e.g. classes emitted here are referenceable by downstream shapes; shapes here are composable by downstream profiles). The validation agent simulates the downstream contract against this ADR's output.
- **(d) Validation report committed** at `docs/adr/validation/ADR-0008-validation-report.md`, produced by an **independent validation-agent spawn** (NOT the implementing worker; mirrors the Council Devil's Advocate independence per [ODR-0001 §Roles for every session](../ontology/odr/ODR-0001-linked-data-council-methodology.md); see ADR programme plan §8 swarm orchestration topology).

A FAIL on any of (a)–(d) blocks `accepted` status; the implementing worker amends and validation re-runs. Two consecutive validation failures on the same ADR escalate to a Council mini-session per [ODR-0001 §Self-amendment process](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — engineering does not re-deliberate; surfaced `## Rules` ambiguity routes to Council ratification.

## More Information

* **Specification (predecessor ADR):** [ADR-0007 — Ontology generator specification](./ADR-0007-ontology-generator-specification.md). This ADR implements ADR-0007's architectural specification.
* **First emission ADR (successor):** [ADR-0009 — Foundation TTL emission](./ADR-0009-foundation-ttl-emission.md). Validates that ADR-0008's infrastructure produces byte-identical foundation output.
* **Sibling Astro build:** [ADR-0003 — Idiomatic Astro refactor](./ADR-0003-idiomatic-astro-refactor.md). The Node-based site build is parallel infrastructure; ontology generation lives in `tools/opda-gen/`, not in `src/`.
* **Council-ratified contract:** [ODR-0004 §6a generator-first + byte-identity CI](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md). The MUST-level rules the generator implements.
* **Reference repositories to study:**
  - [DPV generator pipeline](https://github.com/dpvcg/dpv) — Python + rdflib-based TBox generation for W3C DPV. Closest published precedent.
  - [LinkML `gen-shacl`](https://github.com/linkml/linkml) — SHACL emission from a structured schema source. Pattern reference for shapes-emission.
  - [rdflib serialisers](https://github.com/RDFLib/rdflib) — study Turtle serialiser internals; bypass for canonical output.
* **Out of scope:**
  - SHACL profile composition mechanics (ADR-0013).
  - JSON-LD context emission (deferred per ODR-0011 Q3).
  - Ontology editor UI integration (third-party tools consume OPDA TTL).

## Amendments

- **2026-05-27 — Implementation landed (commit `2ac4ce2`).** 41 files / 2,713 lines added under `tools/opda-gen/`; 28/28 pytest green; CLI surface complete (all 10 subcommands per §"CLI design"); CI workflow at `.github/workflows/ontology-byte-identity.yml`. Implementation report at [`docs/adr/implementation-reports/ADR-0008-implementation.md`](./implementation-reports/ADR-0008-implementation.md).
- **2026-05-27 — Independent validation PASS-WITH-FOLLOW-UPS (commit `6439b57`).** Soundness 28/28, Completeness 23 PASS + 8 explicit deferrals + 1 N/A, Cross-ADR 6/6 + 4/4 probes. Status moves `proposed → accepted` with five named follow-ups queued at [ADR-0005 §G](./ADR-0005-deferred-work-register.md) (G1–G5). Validation report at [`docs/adr/validation/ADR-0008-validation-report.md`](./validation/ADR-0008-validation-report.md).
