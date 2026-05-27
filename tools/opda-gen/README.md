# opda-gen

OPDA ontology generator. Realises [ADR-0007](../../docs/adr/ADR-0007-ontology-generator-specification.md) (deterministic emission specification) per [ADR-0008](../../docs/adr/ADR-0008-generator-implementation-infrastructure.md) (implementation infrastructure).

## Status

**Phase 1 — Bootstrap.** Foundation emission landed (ADR-0009). Remaining
emitter bodies raise `NotImplementedError("realised in ADR-NNNN")` with the
ADR number.

| Emitter | Realised in |
|---|---|
| `emit-foundation` | ADR-0009 — landed |
| `emit` (umbrella) | extends per phase; currently emits foundation |
| `emit-vocabularies` | ADR-0010 |
| `emit-module <name>` | ADR-0011 |
| `emit-shapes` | ADR-0012 |
| `emit-profile <overlay>` | ADR-0013 |
| `compose` | ADR-0013 build-step |
| `validate-exemplar <path>` | ADR-0014 |

The `ci-three-graph`, `ci-byte-identity`, and `--version` commands are wired now.

## Installation

```bash
cd tools/opda-gen
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Usage

```bash
opda-gen --version              # version + git SHA
opda-gen --help                 # subcommand surface
opda-gen ci-three-graph --help  # specific subcommand help
pytest -q                       # run test suite (under 30s target)
```

## Architecture

See ADR-0007 §"Architecture" for the data-flow diagram (inputs →
generator → canonical TTL outputs → CI). The deterministic emission rules are
formalised in ADR-0007 §"Deterministic emission rules".

| Module | Realises |
|---|---|
| `cli.py` | ADR-0008 §"CLI design" + ADR-0009 §"Confirmation" #1/#2 |
| `emitters/foundation.py` | ADR-0009 (foundation TTL emission) |
| `serialiser/canonical.py` | ADR-0007 §"Deterministic emission rules" #1–3 + #6 + ADR-0009 G2 (Literal-IRI scan) |
| `serialiser/blank_nodes.py` | ADR-0007 §"Deterministic emission rules" #4 |
| `serialiser/ordering.py` | ADR-0007 §"Deterministic emission rules" #1–3 |
| `term_sourcing.py` | ADR-0007 §"Term-sourcing five-line precedence" + ODR-0004 §7a |
| `ci/three_graph_test.py` | ODR-0004 §3a five-part CI test + ADR-0009 G3 (git-blame impl) |
| `ci/byte_identity.py` | ODR-0004 §6a byte-identity CI + ADR-0009 §Confirmation #2 |
| `inputs/glossary.py` | ADR-0007 §"Input layer" (business glossary) |
| `inputs/data_dictionary.py` | ADR-0007 §"Input layer" (data dictionary) |
| `inputs/odr_corpus.py` | ADR-0007 §"A9 per-kind discipline output" |

## Contribution

Every Python source file MUST begin with a doc-comment header citing the
ADR(s) + ODR(s) it realises. The programme-wide validation gate (per [ADR
programme plan §9.1](../../docs/plan/ontology-implementation.md)) greps for these
headers; missing source provenance fails the soundness check.

## Links

- [ADR-0007 — Ontology generator specification](../../docs/adr/ADR-0007-ontology-generator-specification.md)
- [ADR-0008 — Generator implementation infrastructure](../../docs/adr/ADR-0008-generator-implementation-infrastructure.md)
- [ODR-0004 — PDTF ontology foundation](../../docs/ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ADR programme plan](../../docs/plan/ontology-implementation.md)
