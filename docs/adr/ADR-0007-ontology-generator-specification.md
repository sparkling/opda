---
status: proposed
date: 2026-05-27
tags: [ontology, generator, code, deterministic, ci, infrastructure]
supersedes: []
depends-on: [ODR-0004, ODR-0005, ODR-0011, ADR-0006]
implements: []
---

# Ontology generator — deterministic emission specification

## Context and Problem Statement

The OPDA ontology programme committed at [ODR-0004 §Rules.6](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) to a **generator-first policy**: the mechanical half of TBox production — slot → DatatypeProperty mapping with `dct:source` + `rdfs:comment` drawn from the data dictionary + business glossary — is generated, not hand-authored. Council and module-ODR cycles are reserved for genuinely ambiguous moves (aggregate boundaries, cross-overlay synonymy, `oneOf`-as-subclass-vs-state).

[ODR-0004 §6a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) (added by Session 004 Q5) operationalised the policy with three layers of discipline:

1. **Deterministic emission ordering** — triples emitted in canonical order (`owl:Class` alphabetised, then `owl:DatatypeProperty`, then `owl:ObjectProperty`, then `sh:NodeShape`/`sh:PropertyShape`; within-term order: `rdf:type` first, `rdfs:label` second, `rdfs:comment` third, then predicate-specific lexicographic). Blank nodes skolemised by SHA-256 of canonical N-Triples form. Prefix declarations alphabetised. LF line endings; no trailing whitespace; no BOM; final newline.
2. **Generator version recorded** in the ontology header (`owl:versionIRI`, `owl:versionInfo`, `opda:generatorVersion`).
3. **Byte-identity CI test** — build pipeline regenerates, byte-compares against committed TTL, **fails on any byte difference**.

What is not yet recorded: **the engineering specification of the generator itself**. ODR-0004 §6a is the contract; this ADR is the implementation specification. Without a concrete spec, downstream engineering work (emitting `foundation.ttl`, module `.ttl` files, expected-report.ttl pairings, the BASPI5 round-trip MVP gate) cannot begin.

This is the **second ADR in the ontology-implementation programme** (after [ADR-0006](./ADR-0006-w3id-opda-ontology-namespace.md) on the namespace + redirect infrastructure). Subsequent ADRs will specify: module TTL emission (one ADR per ratified module or one cross-module rollup); SHACL shapes-graph generation (downstream of ODR-0013); diagnostic-exemplar harness wiring; expected-report.ttl CI integration; BASPI5 round-trip harness.

## Decision Drivers

* **Byte-identity CI is non-negotiable.** ODR-0004 §6a defines the build pipeline contract: regenerate → byte-compare → fail-on-diff. The generator MUST satisfy this; non-deterministic output breaks the contract.
* **Three-graph separation is structural** ([ODR-0004 §3a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)). Generator MUST emit three source artefacts (`opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`) — never one merged file. CI tests on three-graph separation MUST pass on emitted output.
* **Term sourcing per ODR-0004 §7a five-line precedence** (W3C-spec > OPDA TF > business glossary > schema text > external regulator). Generator MUST resolve each term against this precedence and emit `dct:source` to the authoritative origin.
* **Input format is the data dictionary + glossary, not the JSON Schema directly.** The JSON Schema is a translation artefact; the dictionary + glossary are the authoritative inputs. (The dictionary is itself derived from the schema, but Council ratification operates at the dictionary layer.)
* **A9 per-kind discipline applies to generator output.** For `kind: pattern` module ODRs, the generator MUST emit the UFO/DOLCE meta-category as `dct:source` or `skos:scopeNote` triples on each minted class.
* **Generator is small enough to be inspected.** Prefer ~500-1500 lines of Python or TypeScript over a 5000-line framework. The generator is a build-step utility, not a platform.

## Considered Options

* **A — Hand-authored TTL with informal generator scripts as helpers (chosen REJECT).** Defers the byte-identity CI contract; risks human-edit drift; ODR-0004 §6a contract violated.
* **B — Off-the-shelf ontology generator** (e.g. OWL API + a templating layer; or RDF4J ConsoleProcessor). Heavy framework; canonical ordering not guaranteed; non-trivial to make output byte-identical.
* **C — Bespoke generator in Python with `rdflib` + custom canonical serialiser (chosen).** Python is OPDA-friendly (data dictionary already in Python pipelines); `rdflib` provides RDF primitives; we own the serialiser (mandatory for byte-identity); ~800-1200 line scope.
* **D — Bespoke generator in TypeScript / Deno.** Plausible alternative — TypeScript pairs with the Astro site (ADR-0003) and node tooling. Slightly more boilerplate for RDF. Defer to D as fallback if Python tooling is unavailable.

## Decision Outcome

Chosen option: **C — Bespoke generator in Python with `rdflib`-backed primitives plus a custom canonical N-Triples → Turtle serialiser**, because it directly satisfies ODR-0004 §6a's byte-identity CI contract, fits OPDA's existing data-dictionary tooling, and stays small enough for one engineer to maintain.

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Input layer (read-only)                   │
├────────────────────────────────────────────────────────────┤
│  source/00-deliverables/semantic-models/                   │
│    business-glossary.{md,ttl,json}        (~54 terms)      │
│    data-dictionary.{md,json}              (~1,557 leaves)  │
│    data-dictionary-canonical.json         (machine input)  │
│                                                            │
│  docs/ontology/odr/ODR-*.md               (ratified ODRs)  │
│    ↳ frontmatter parsed for kind/depends-on/implements     │
│    ↳ §Rules parsed for UFO category + IC + artefact realis │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│             Generator (~800-1200 LOC Python)               │
├────────────────────────────────────────────────────────────┤
│  src/ontology_generator/                                   │
│    cli.py              # `opda-gen emit [--profile X]`     │
│    inputs.py           # Read + parse glossary + dict + ODRs│
│    term_sourcing.py    # 5-line precedence resolver        │
│    classes_emitter.py  # owl:Class graph (canonical order) │
│    properties_emitter.py # DatatypeProperty + ObjectProperty│
│    shapes_emitter.py   # sh:NodeShape + sh:PropertyShape   │
│    annotations_emitter.py # opda:aiHint + opda:uiHint      │
│    serialiser.py       # Canonical N-Triples → Turtle      │
│    canonicaliser.py    # SHA-256 blank-node skolemisation  │
│    header.py           # vann + dct + owl:versionIRI       │
│    composer.py         # Build-step derived profiles       │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│           Output layer (canonical; CI-checked)             │
├────────────────────────────────────────────────────────────┤
│  source/03-standards/ontology/                             │
│    foundation.ttl        (header-only; class skeleton)     │
│    opda-classes.ttl      (OWL/RDFS graph)                  │
│    opda-shapes.ttl       (SHACL shapes graph)              │
│    opda-annotations.ttl  (advisory annotations graph)      │
│                                                            │
│    derived/              (build output; never hand-edited) │
│      opda-validation.ttl  (classes ⊕ shapes)               │
│      opda-ui.ttl          (classes ⊕ shapes ⊕ annotations) │
│      opda-inference.ttl   (classes alone)                  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│              CI pipeline (GitHub Actions)                  │
├────────────────────────────────────────────────────────────┤
│  1. Regenerate all three source TTLs from inputs           │
│  2. `diff -q` against committed copies → fail on any diff  │
│  3. Run ODR-0004 §3a five-part CI test (SHACL queries)     │
│  4. Run pyshacl validation: exemplars vs shapes graph      │
│  5. Compare against expected-report.ttl pairings           │
└────────────────────────────────────────────────────────────┘
```

### Deterministic emission rules (formalising ODR-0004 §6a)

1. **Prefix declarations** — alphabetised by prefix string.
2. **Term emission order** — by RDF type, then alphabetised by URI within type:
   - `owl:Ontology` (single, file header)
   - `owl:Class` blocks
   - `owl:DatatypeProperty` blocks
   - `owl:ObjectProperty` blocks
   - `sh:NodeShape` blocks (shapes graph only)
   - `sh:PropertyShape` blocks (shapes graph only)
   - `skos:Concept` blocks (for inline SKOS scheme members; full schemes in module TTLs)
   - Advisory annotation triples (annotations graph only)
3. **Within-term triple order:**
   1. `rdf:type` (always first)
   2. `rdfs:label` / `skos:prefLabel`
   3. `rdfs:comment` / `skos:definition`
   4. `dct:source`
   5. Predicate-specific triples lexicographically (predicate URI alphabetised; per-predicate object-list sorted)
4. **Blank nodes** — skolemised by SHA-256 hash of their canonical N-Triples representation (recursive for nested blanks). Prefix: `_:b<hex-digest-first-12-chars>`.
5. **String literals** — escaped consistently (`\n`, `\t`, `\"`, `\\`); `xsd:string` datatype implicit (never emit `^^xsd:string`); `@en` language tag explicit when present.
6. **File formatting** — LF line endings; no trailing whitespace; no BOM; single final newline; 4-space indentation within blocks; one empty line between term blocks.

### Term-sourcing five-line precedence (formalising ODR-0004 §7a)

ODR-0004 §7a names **five precedence slots**, but slot 3 (Other regulatory authorities) is **contextual, not authoritative** — it produces `skos:scopeNote` or `skos:closeMatch`, never the primary `dct:source`. The resolver therefore distinguishes (a) the primary `dct:source` lookup (slots 1, 2, 4, 5) from (b) parallel contextual-citation collection (slot 3). Resolver pseudocode:

```python
def resolve_term(term_id: str) -> ResolvedTerm:
    """Returns (primary, contextual_citations) per ODR-0004 §7a five-slot rule.

    Slot numbering follows ODR-0004 §7a verbatim:
      1. W3C / external spec     (authoritative;  → dct:source)
      2. OPDA Trust Framework    (authoritative;  → dct:source)
      3. Other regulatory authorities (contextual; → skos:scopeNote / skos:closeMatch)
      4. OPDA business glossary  (project-internal; → dct:source)
      5. Schema-leaf annotation  (lowest-trust;   → dct:source)

    The primary dct:source comes from the first of slots {1, 2, 4, 5} that matches.
    Slot 3 (regulators) is always collected separately as contextual_citations and
    emitted as skos:scopeNote / skos:closeMatch alongside the primary dct:source.
    """
    contextual_citations = []
    # Slot 3 — collected in parallel (always; never primary dct:source)
    if term_id in EXTERNAL_REGULATORS:
        contextual_citations.append(SourceRecord(
            url=EXTERNAL_REGULATORS[term_id], tier=3, kind="contextual",
        ))

    # Primary dct:source resolution (skips slot 3 by ODR-0004 §7a design)
    # Slot 1 — W3C / external spec
    if term_id in W3C_REGISTRY:
        primary = SourceRecord(url=W3C_REGISTRY[term_id], tier=1, kind="authoritative")
    # Slot 2 — OPDA Trust Framework (per Session 003c Item 3)
    elif term_id in OPDA_TF_REGISTRY:
        primary = SourceRecord(url=OPDA_TF_REGISTRY[term_id], tier=2, kind="authoritative")
    # Slot 4 — OPDA business glossary
    elif term_id in glossary:
        primary = SourceRecord(url=glossary_url(term_id), tier=4, kind="project-internal")
    # Slot 5 — Data dictionary canonical leaf path
    elif term_id in dictionary:
        primary = SourceRecord(url=dictionary_url(term_id), tier=5, kind="lowest-trust")
    else:
        raise UnsourceableTerm(term_id)

    return ResolvedTerm(primary=primary, contextual=contextual_citations)
```

Conflicts (e.g. glossary and dictionary disagree on definition) produce a `## Change log` row in the consuming module ODR per ODR-0004 §7a "Conflict-recording protocol". Generator MUST fail on unresolved conflicts; the build-pipeline error message names the conflicting sources verbatim.

**ADR-0007 amendment history.** The original pseudocode in this section had regulators at "tier 5" and glossary at "tier 3" — that mis-ordered ODR-0004 §7a's slot numbering. Independent validation of ADR-0008 (commit `6439b57`) surfaced the discrepancy; queued at [ADR-0005 §G item G1](./ADR-0005-deferred-work-register.md). Author-only Council amendment (2026-05-27): the pseudocode above now matches ODR-0004 §7a's slot ordering and contextual-citation distinction. ADR-0008's `term_sourcing.py` implementation predated this clarification and ranks "business glossary" at tier 3 in its `Tier` IntEnum; that code is amended in lockstep at ADR-0012's worker brief (the next worker touching `term_sourcing.py`) so the implementation matches the corrected pseudocode + ODR-0004 §7a.

### Three-graph emission constraints (formalising ODR-0004 §3a)

Generator MUST enforce:

| File | MUST contain | MUST NOT contain |
|---|---|---|
| `opda-classes.ttl` | `owl:Class`, `owl:DatatypeProperty`, `owl:ObjectProperty`, `rdfs:label`, `rdfs:comment`, `skos:prefLabel`, `skos:definition` | `sh:*` triples; `opda:aiHint`/`opda:uiHint`/`opda:exampleValue` |
| `opda-shapes.ttl` | `sh:NodeShape`, `sh:PropertyShape`, `sh:targetClass`, `sh:path`, `sh:datatype`, `sh:minCount`/`maxCount`, etc. | `owl:Class`; `owl:imports`; advisory annotations |
| `opda-annotations.ttl` | `opda:aiHint`, `opda:uiHint`, `opda:exampleValue`, generator notes; keyed via `dct:relation`/`opda:appliesTo` | `sh:*` triples; `owl:Class` triples |

Five-part CI test from ODR-0004 §3a runs against emitted output. Generator failure here is a generator bug, not a content bug.

### Module pluralism

Generator emits **one TTL file per ratified module ODR** (`opda-property.ttl`, `opda-agent.ttl`, `opda-transaction.ttl`, `opda-claim.ttl`, etc.) in addition to the foundation. Each module file:

- Declares only the classes/properties scoped to that module's ratified ODR.
- Imports `opda-classes.ttl` (foundation) via `owl:imports`.
- Carries `owl:versionIRI` pinned to the ratifying ODR's date + generator version.
- Pairs with `opda-<module>-shapes.ttl` + `opda-<module>-annotations.ttl` (three-graph separation preserved per module).

The composer step assembles the derived consumer profiles (`opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl`) from the per-module source graphs.

### A9 per-kind discipline output

For `kind: pattern` and `kind: mapping` module ODRs (per Session A9 + ODR-0001 §"What an ODR records"), the generator MUST emit on each minted class:

1. `dct:source` triple pointing to the ODR + §Rules subsection that committed the UFO/DOLCE meta-category.
2. `skos:scopeNote` triple (literal) restating the UFO/DOLCE category in human-readable form.
3. `rdfs:comment` triple naming the IC over hard cases (synthesised from §Rules; verbatim where the source is concise).

Examples:

```turtle
opda:LegalEstate
    a owl:Class ;
    rdfs:label "Legal Estate" ;
    rdfs:comment "UFO Substance Kind / DOLCE NonPhysicalEndurant. IC: rights-bundle persistence — same individual through grant, transfer, registration, and discharge events; distinguishable from coexisting RegisteredTitle and physical Property by extension of property rights." ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant" ;
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-3b> ;
    .
```

### Byte-identity CI test (formalising ODR-0004 §6a)

```yaml
# .github/workflows/ontology-byte-identity.yml
name: Ontology byte-identity
on: [push, pull_request]
jobs:
  byte-identity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -e .[generator]
      - run: opda-gen emit --output /tmp/ontology
      - run: diff -q /tmp/ontology/foundation.ttl source/03-standards/ontology/foundation.ttl
      - run: diff -q /tmp/ontology/opda-classes.ttl source/03-standards/ontology/opda-classes.ttl
      - run: diff -q /tmp/ontology/opda-shapes.ttl source/03-standards/ontology/opda-shapes.ttl
      - run: diff -q /tmp/ontology/opda-annotations.ttl source/03-standards/ontology/opda-annotations.ttl
      # Plus: per-module .ttl files iterated similarly
```

Failure on any diff → PR/push fails. Reviewable PR diff is the consequence, not the primary check.

### Consequences

* Good, because ODR-0004 §6a's byte-identity CI contract is mechanically enforceable from day one.
* Good, because the generator is small (~800-1200 LOC) and inspectable — no opaque framework behaviour.
* Good, because Python pairs with OPDA's existing data-dictionary tooling — minimal new dependency surface.
* Good, because the three-graph separation is enforced by emission, not by post-hoc lint.
* Good, because per-module emission scales cleanly as new module ODRs ratify — generator scope grows linearly, not combinatorially.
* Good, because the A9 per-kind discipline output is mechanical — no human-author drift in UFO category declarations.
* Good, because emission is fast (deterministic single-pass over inputs; expected sub-second for the full corpus).
* Bad, because byte-identity is brittle: any rdflib version change risks diff churn unless the canonical serialiser is fully version-pinned. Mitigation: lock `rdflib` version; the canonical serialiser bypasses rdflib's own serialiser entirely for the final output stage.
* Bad, because we own the canonical serialiser — maintenance burden on OPDA, not the rdflib community. Mitigation: well-tested + simple; ~150 LOC for the canonicaliser.
* Bad, because the generator is a new artefact OPDA must maintain alongside the dictionary + glossary + ODR corpus. Mitigation: small scope; CI guards against drift.
* Neutral, because the SHACL shapes graph emission requires ratified `kind: pattern` module ODRs — generator scope grows incrementally as Council ratifies each module.

### Confirmation

The ADR is honoured when all five hold:

1. **Repository structure exists.** `src/ontology_generator/` directory created with the file layout above (cli.py, inputs.py, term_sourcing.py, etc.).
2. **CLI works.** `opda-gen emit --output <dir>` produces three TTL files matching the deterministic-emission specification.
3. **CI test wired.** `.github/workflows/ontology-byte-identity.yml` exists and runs on push + PR.
4. **First emission committed.** `source/03-standards/ontology/foundation.ttl` + per-module files committed; subsequent regeneration matches byte-for-byte.
5. **A9 per-kind discipline output verified.** Every `owl:Class` emitted from a `kind: pattern` ODR carries `dct:source` + `skos:scopeNote` + `rdfs:comment` per §"A9 per-kind discipline output" above.

Manual test: regenerate, commit nothing, run `git diff` → should be empty.

## Pros and Cons of the Options

### A — Hand-authored TTL

* Good, because immediate output; no engineering investment.
* Bad, because byte-identity CI contract (ODR-0004 §6a) cannot be enforced; human-edit drift inevitable.
* Bad, because three-graph separation depends on author discipline; lint catches violations post-hoc, not at-source.

### B — Off-the-shelf generator framework

* Good, because pre-built infrastructure (validation, inference, multiple serialisers).
* Bad, because byte-identity is hard: most frameworks emit non-canonical Turtle by default.
* Bad, because heavy dependency surface — OPDA inherits the framework's release cadence and breaking changes.
* Bad, because customisation for A9 per-kind output requires framework-specific extension APIs.

### C — Bespoke Python generator (chosen)

* Good, because every emission rule is OPDA-owned and inspectable.
* Good, because Python integrates with existing data-dictionary tooling.
* Good, because scope stays small and incrementally growable.
* Bad, because OPDA owns serialiser maintenance; rdflib version pinning required.

### D — Bespoke TypeScript generator

* Good, because pairs with Astro site (ADR-0003) and Node tooling.
* Bad, because TS RDF tooling (n3.js, rdflib.js) is less mature than Python's rdflib for SHACL.
* Bad, because OPDA's existing tooling skew is Python.

## More Information

* **Architecture decision provenance:** [ODR-0004 §Rules.6 (generator-first)](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md), [§6a (operationalisation)](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md), [§7a (term-sourcing precedence)](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md), [§3a (three-graph separation)](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md).
* **Session A9** ratified the per-kind discipline applied here: [session-a9-gandon-guizzardi-methodology-gap](../ontology/odr/council/session-a9-gandon-guizzardi-methodology-gap.md).
* **Sibling ADR:** [ADR-0006 — Ontology namespace at w3id.org/opda/ via W3C PICG redirect](./ADR-0006-w3id-opda-ontology-namespace.md). Together with this ADR, the two form the bootstrap of the ontology-implementation ADR programme.
* **Inputs (read-only):** `source/00-deliverables/semantic-models/business-glossary.{md,ttl,json}`, `glossary-merged.json`, `data-dictionary.{md,json}`, `data-dictionary-canonical.json`. Also: every ratified ODR under `docs/ontology/odr/ODR-*.md` (for `kind: pattern` UFO category extraction).
* **Outputs:** `source/03-standards/ontology/foundation.ttl`, `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`, plus per-module `opda-<module>.ttl` files. Build-step derived: `derived/opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl`.
* **CI integration:** `.github/workflows/ontology-byte-identity.yml` (to be authored as part of generator implementation).
* **Reference implementations to study:** rdflib's serialisers (for canonical patterns); DPV's `rdfgen` pipeline; LinkML's `gen-shacl` (for SHACL shape emission from a structured input source).
* **First emission target:** `foundation.ttl` — the header + class skeleton. Subsequent emissions add module-by-module as each ratified `kind: pattern` ODR carries enough §Rules detail.
* **Out of scope for this ADR (deferred to subsequent ADRs):** SHACL profile composition mechanics (ADR-NNNN for ODR-0010 implementation); diagnostic-exemplar harness wiring (ADR-NNNN for ODR-0005 §8a); BASPI5 round-trip harness (ADR-NNNN — the MVP gate); JSON-LD context emission (deferred until a named consumer demands ld-json output).
* **Out of scope for the OPDA ADR programme overall:** ontology editor UIs (third-party tools — Protégé, TopBraid Composer, VocBench — consume OPDA's TTL output without OPDA-side build integration).
