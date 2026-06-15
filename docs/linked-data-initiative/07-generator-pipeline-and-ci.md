# Generator, Pipeline, Validation & CI — the engineering that makes the standard trustworthy

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.
>
> Builds on `_research-synthesis.md`, `_external-research.md`, `_fact-sheet.md`. Every
> claim below was checked against the generator code, the CI gates, the emitted Turtle
> corpus, and the GitHub workflows — not just the prose. Where a verified count or a
> build-state differs from the seed fact-sheet, it is flagged inline.

## TL;DR

- **The ontology is not hand-written — it is *emitted* deterministically** by `opda-gen`, a Python package (`tools/opda-gen/`) that reads the PDTF data dictionary + business glossary + parsed ODR rules and produces 24 canonical Turtle files. The same inputs always produce **byte-for-byte identical** output, and CI fails the build on a single byte of drift. ✅
- **OPDA owns the serialiser.** `rdflib` builds the graph in memory, but the final Turtle is written by a **custom canonical N-Triples→Turtle serialiser** (`serialiser/canonical.py`) — rdflib's own writer is bypassed so byte-identity is contractually OPDA's, not a hostage to rdflib's release cadence. Blank nodes are skolemised by SHA-256 of their content. ✅
- **Three graphs, kept structurally separate** (classes / SHACL shapes / advisory annotations), enforced by a five-part CI gate: no `sh:*` in the annotation graph, no advisory hints in the shapes graph, every `sh:targetClass` resolves. ✅
- **Apache Jena 6.1.0 is the sole RDF/SHACL/SPARQL toolchain** (ADR-0036/0037). pyshacl was *retired* — it silently skips SHACL 1.2 — and Jena's `shacl` CLI now validates the ontology and the 17 diagnostic exemplars (each paired with a byte-matched expected report). ✅
- **8 CI gates** front every push and PR; the keystone is **byte-identity** (regenerate → diff vs committed). The **BASPI5 round-trip** is the MVP gate that closed the implementation programme (ADR-0014): a real statutory form goes JSON → ontology → validated RDF → JSON with full `dct:source` traceability. ✅
- **Honesty markers:** OWL-RL inference is real but *shallow* — only subclass-type-propagation fires today (~30 inferred triples; flat hierarchy, no inverse/transitive properties yet) 🟡. The derived consumer-profile composer (`opda-validation.ttl`/`opda-ui.ttl`) is still a `NotImplementedError` stub 🔵. Both are honest phased-roadmap points, not gaps in the live corpus.

---

## 1. Why determinism is the whole game

A standard you cannot **reproduce** is a standard you cannot **trust**. If two people regenerate the ontology from the same sources and get different bytes — different blank-node IDs, different triple order, a stray trailing space — then nobody can tell a *meaningful* change (a new class, a corrected datatype) from *noise*, and a reviewer cannot diff a pull request with confidence. Worse, hand-editing creeps in and the emitted artefact silently diverges from its declared inputs.

OPDA's answer is a chain of four interlocking guarantees, each enforced in CI:

| Guarantee | Mechanism | What it buys |
|---|---|---|
| **Determinism** | Custom canonical serialiser; SHA-256 blank-node skolemisation | Same input → identical bytes, every run, on every machine |
| **Byte-identity** | `ci-byte-identity`: regenerate into a temp dir, diff vs committed corpus | The anti-drift keystone — no hand-edits, no rdflib-version surprises |
| **Three-graph separation** | `ci-three-graph`: 5 MUST-checks | Model / validation-contract / advice never bleed into each other |
| **Round-trip equivalence** | `ci-baspi5-roundtrip`: JSON → RDF → validate → JSON | Proof the model *losslessly* re-expresses a real statutory form |

The rest of this document is how each is built.

---

## 2. opda-gen — the generator (ADR-0007 / ADR-0008) ✅

`opda-gen` is a Click-based Python CLI living in `tools/opda-gen/`. It is `rdflib`-backed for RDF primitives (graph construction, term types) but emits Turtle through its **own** serialiser. ADR-0007 §"Considered Options" rejected both hand-authored TTL (drift risk) and off-the-shelf generators (no byte-identity guarantee) in favour of a bespoke ~800–1200-line Python tool "small enough for one engineer to maintain."

### 2.1 Inputs (`opda_gen/inputs/`)

The generator's authoritative inputs are **data, not prose**:

- **`data-dictionary-canonical.json`** — the schema-leaf authority (`inputs/data_dictionary.py`). Each canonical leaf is a `DictionaryLeaf` carrying its dotted JSON path, datatype, `rdfs:comment`, cardinality and `source` overlay. This is the mechanical supply for the "slot → `owl:DatatypeProperty`" half of TBox production (ODR-0004 §Rules.6 *generator-first*).
- **`business-glossary.ttl`** — 54 curated terms (`inputs/glossary.py`).
- **Parsed ODR corpus** — `inputs/odr_corpus.py` reads `docs/ontology/odr/ODR-*.md`, slicing the YAML frontmatter and the `## Rules` / `## Operational specifications` sections. A `kind: pattern` ODR's committed UFO/DOLCE meta-category drives the class emission and supplies the `dct:source` back-link. (The parser is a deliberately small permissive mini-parser on this path — no heavyweight YAML dependency for frontmatter slicing — to keep the lock-file thin.)
- **Leaf categoriser** (`inputs/leaf_categoriser.py`) — bins annotated descriptive leaves into the A–G taxonomy (ODR-0022); the `categorise-leaves` subcommand writes the binning report.

### 2.2 Term-sourcing — the five-line precedence (`term_sourcing.py`) ✅

Every minted term **must** carry a `dct:source` — provenance is not honour-system. `resolve_term()` walks ODR-0004 §7a's precedence and stops at the first authoritative hit:

| Slot | Source | Kind | Predicate |
|---|---|---|---|
| 1 | W3C / external spec (RDFS, OWL, SKOS, SHACL, VANN, DCTERMS…) | authoritative | `dct:source` |
| 2 | OPDA Trust Framework (`trust.propdata.org.uk` vocab) | authoritative | `dct:source` |
| 3 | Other regulators (FCA, ICO, HM Land Registry) | **contextual** | `skos:scopeNote` / `skos:closeMatch` |
| 4 | OPDA business glossary | authoritative | `dct:source` |
| 5 | Data-dictionary schema-leaf path | authoritative | `dct:source` |

The subtlety that matters: **slot 3 is always evaluated** even when a higher slot wins, so a term can carry both an authoritative `dct:source` *and* a regulator `skos:scopeNote`. A regulator-only term resolves with `primary=None` and a non-empty `contextual` list (it does not raise). A term that matches **no** slot raises `UnsourceableTerm` — the build fails loudly and names the term. (Note: the slot order was corrected in a 2026-05-27 "G1" amendment — earlier code wrongly placed glossary at tier 3 / regulators at tier 5; `term_sourcing.py` now matches §7a verbatim. A stale docstring in `data_dictionary.py` still calls the dictionary "tier 4" — the live resolver is the authority: glossary 4, dictionary 5.)

For descriptive properties, `dct:source` points at the **schema leaf path** (the form-question IRI `…/pdtf/harness/forms/<overlay>#<leaf.path>`), never the deciding ODR section (ODR-0022 G2). A leaf that spans overlays gets a **per-overlay array** of source IRIs — lossless audit in both directions.

### 2.3 Per-concern emitters (`opda_gen/emitters/`) ✅

The ontology is partitioned **by ontological concern** (FIBO-style modules reconciled with UFO layering), not by JSON page. The `emit` umbrella runs them in a fixed order so the byte-identity diff exercises the whole corpus in one shot:

```
emit  →  foundation  →  vocabularies  →  contexts  →  modules(classes)
      →  shapes  →  annotations  →  profiles(baspi5)  →  manual frontmatter
```

| Emitter | Emits | Notes |
|---|---|---|
| `foundation.py` | `foundation.ttl` (ontology header, `owl:versionIRI`, `sh:declare`), `opda-classes.ttl` (foundation + UFO meta-classes `RoleMixin`/`Role`/`Relator`), header-only `opda-shapes.ttl` + `opda-annotations.ttl` | The three-graph skeleton |
| `vocabularies.py` | `opda-vocabularies.ttl` | The SKOS substrate — **48 `skos:ConceptScheme`, 314 `skos:Concept`** (every JSON enum → a scheme) |
| `contexts.py` | `opda-contexts.ttl` | 6-member `BoundedContextScheme` (DDD; ODR-0019/0020) |
| `modules/{property,agent,transaction,claim,governance,descriptive}.py` | `opda-<module>.ttl` ×6 | Each `owl:imports` the one flat ontology |
| `shapes.py` | `opda-<module>-shapes.ttl` ×6 + foundation meta-shapes | The SHACL validation contract |
| `annotations.py` | `opda-<module>-annotations.ttl` ×6 | DPV baselines, gUFO `Quality` typing, advisory hints — *reference-not-import* for DPV |
| `profiles.py` | `profiles/<overlay>.ttl` | Overlay form profiles (BASPI5 emitted; catalogue lists 31) |
| `exemplar_reports.py` | `exemplars/<stem>-expected-report.ttl` ×17 | The Jena SHACL report each exemplar should produce |
| `manual.py` | YAML frontmatter on `docs/manual/**` | Feeds the Astro site (ADR-0020) |

**Verified emitted corpus** (live counts, `rdf:type` declarations, from `source/03-standards/ontology/`):

| Term | Count | vs fact-sheet |
|---|---|---|
| `owl:Class` | **40** | (fact-sheet said 41 — live is 40) |
| `owl:DatatypeProperty` | **226** | ✓ |
| `owl:ObjectProperty` | **30** | ✓ |
| `skos:ConceptScheme` | **48** | (fact-sheet 47) |
| `skos:Concept` | **314** | (fact-sheet ~315) ✓ |
| `sh:NodeShape` | **90** (52 module/foundation + 38 in profiles) | ✓ exact |
| `sh:Violation` severities | **~291** | (fact-sheet 287) |
| TTL files | **24** top-level + 31 profiles + 17 exemplars (+17 reports) | ✓ |

These are close to but slightly above the seed fact-sheet — the corpus moved a little since it was written. Treat the numbers here as the current verified state.

---

## 3. The canonical serialiser — where byte-identity is won (`serialiser/`) ✅

This is the single most load-bearing component. rdflib's own Turtle serialiser is **never** used for emitted output (ADR-0007 §"Deterministic emission rules"). Three small, pure modules own the contract:

**`blank_nodes.py` — content-addressed blank nodes.** Each `BNode` is skolemised to `_:b<hex>` where the hex is the first 12 chars of the **SHA-256 of its canonical N-Triples representation** (recursive for nested blanks, with a depth-32 cycle guard). Two structurally-identical blank-node sub-graphs therefore get the *same* label across runs; rdflib's own internal `Nf3a2…`-style labels (which are non-deterministic between runs) are discarded. This fixed a latent bug (ADR-0013 "G12") where a profile shape carrying multiple `sh:property` blank nodes reordered between invocations.

**`ordering.py` — canonical sort keys.** Pure functions:
- *Term-type order:* `owl:Ontology` → `owl:Class` → `owl:DatatypeProperty` → `owl:ObjectProperty` → `sh:NodeShape` → `sh:PropertyShape` → `skos:ConceptScheme` → `skos:Concept` → other.
- *Within-term predicate order:* `rdf:type` first, then `rdfs:label`/`skos:prefLabel`, then `rdfs:comment`/`skos:definition`, then `dct:source`, then predicate-lexicographic.
- *Prefixes:* alphabetised.

**`canonical.py` — the writer.** Groups triples by subject, sorts subjects by `(type_rank, iri)`, sorts predicate-objects per the rank above (blank-node objects keyed by skolem hex so multi-object lists are stable), and emits with **locked formatting**: LF endings, 4-space indent, no trailing whitespace, single final newline, no BOM, and **only prefixes actually referenced** by the graph (so rdflib's auto-bind table changing between releases can't perturb the output). One neat touch: it scans literal *lexical values* for IRI-shaped strings so a header that binds a namespace as an `^^xsd:anyURI` literal (via `sh:namespace`) still gets its prefix emitted.

> Tested invariant (`tests/test_serialiser.py`): same input → identical bytes across 100 runs, including multi-object blank-node references.

---

## 4. Three-graph separation (ODR-0004 §3a, CI-enforced) ✅

The model is split into **three graphs that must never bleed into each other**:

- **classes** (`opda-classes.ttl` + the six `opda-<module>.ttl`) — the OWL/RDFS TBox.
- **shapes** (`opda-shapes.ttl` + six `opda-<module>-shapes.ttl`) — the SHACL validation contract.
- **annotations** (`opda-annotations.ttl` + six `opda-<module>-annotations.ttl`) — advisory hints, DPV baselines, gUFO typing.

**Why it matters:** a consumer who wants *only the model* should not be forced to ingest validation machinery; a validator should not trip over advisory hints; advice should never masquerade as a constraint. Keeping them separate makes each independently consumable and lets the inference layer write to a *fourth* derived graph without ever polluting the source three.

`ci/three_graph_test.py::run_all` merges the per-module files into three graphs and runs **five MUST-checks**:

1. **No `sh:*` in the annotation graph** — advisory ≠ constraint.
2. **No `owl:imports` in the shapes graph** — shapes don't drag in the TBox (also stops Jena eagerly dereferencing unresolvable IRIs).
3. **No advisory predicates** (`opda:aiHint`/`uiHint`/`exampleValue`) **in the shapes graph.**
4. **Every `opda:` `sh:targetClass` resolves** to an `owl:Class` in the class graph. (External targets like `skos:Concept`, `owl:Class`, `sh:NodeShape` are exempt — meta-shapes legitimately target standard classes.)
5. **Derived-profile provenance** — any `derived/*.ttl` has no commits outside the build-pipeline service account (git-blame check). Tolerates a missing `derived/` dir, which is the current state (see §8).

A sibling gate, **`ci-dup-declaration`** (`ci/dup_declaration_test.py`), asserts every `opda:` term is *typed* in exactly one module TTL. This was added by hand after the `opda:riskIndicator` regression — the same term declared in both `opda-property.ttl` and `opda-descriptive.ttl` with conflicting `rdfs:domain`, which byte-identity and three-graph both missed. A good illustration that gates are added in response to real escapes.

---

## 5. Validation — Apache Jena as the sole toolchain (ADR-0036 / ADR-0037) ✅

### 5.1 The pyshacl → Jena migration

OPDA originally validated with **pyshacl** (`==0.25.0`, `inference="rdfs"`). The wall: **pyshacl does not support SHACL 1.2** — it tracks SHACL 1.0 / the 2017 Recommendation, so any 1.2 construct is *silently skipped* (best case) or *mis-reported* (worst). ODR-0002 pins SHACL 1.2 *by name*, and OPDA had already brushed the edge (`sellersCapacity` `sh:xone` needing `advanced=True`).

ADR-0036 moved validation to **Apache Jena 6.1.0** (`jena-shacl`), which implements SHACL 1.2 **and** the SHACL-AF features (`sh:rule`, `sh:sparql`) that ODR-0010/0017 depend on. ADR-0037 generalised the rule: **Jena is the sole RDF/SHACL/SPARQL toolchain — pyshacl and `rdflib` are prohibited from the parse/serialise/validate/infer/query paths**, because `rdflib` 7.x cannot parse the RDF 1.2 triple-term syntax either.

The swap was gated on a **parity check** (demonstrate Jena ≡ pyshacl on `sh:conforms` across the exemplar matrix before removing the incumbent — ODR-0010's "demonstrate the floor before removing the incumbent" discipline). Per ADR-0036's as-built note, **parity passed 17/17 exemplars** (after adding a missing `PREFIX rdf:` that strict Jena rejected but pyshacl had tolerated), the parity machinery was retired, and pyshacl was dropped.

> **Honest nuance worth surfacing at review:** the dated amendments conflict on the surface. ADR-0014's last amendment (2026-06-01) still says the BASPI5 harness "validates with pyshacl … migration NOT yet implemented," while ADR-0036's implementation note (same date) says "transition COMPLETE — pyshacl removed." **The code is the tiebreaker and it agrees with ADR-0036:** `pyproject.toml` lists `rdflib==7.0.0` + `click` + `pydantic` + `pyyaml` and **no `pyshacl`**; the live SHACL engine is `opda_gen/jena_shacl.py`; the in-tree gate is `ci/baspi5_roundtrip_test.py`. (`pyshacl==0.25.0` lingers only in the generated `src/opda_gen.egg-info/requires.txt`, a build artefact, not the source manifest.) ADR-0014's amendment is the stale one.
>
> A second precise caveat on ADR-0037: it says "`rdflib` prohibited." In practice the generator **still imports `rdflib`** to *build* graphs in memory (every emitter does `from rdflib import Graph`) before the custom serialiser writes them, and the CI gates use `rdflib` to *parse* committed TTL for their checks. The prohibition is honoured where it bites — **SHACL validation and the production parse/infer paths are Jena** (no `rdflib`/pyshacl) — but "no `rdflib` anywhere" is not literally true of the Python generator/CI internals. Worth stating plainly rather than over-claiming a pure-Jena stack.

### 5.2 How Jena validation runs (`jena_shacl.py`)

`validate()` shells out to Jena's `shacl` CLI. The distribution is resolved from `OPDA_JENA_HOME` → `PATH` → an auto-provisioned `.jena/` cache (downloaded from `archive.apache.org`, **sha512-verified** before use, refused on mismatch). So a dev or CI runner needs only a **JDK 17+** and network access — no Docker, no published Jena container (Apache ships none for Jena 6.x; verified 2026-06-01). Before validating it strips `owl:imports` from the shapes graph (the imported content is already merged; otherwise Jena would try to dereference the unresolvable IRIs over HTTP).

### 5.3 The 17 diagnostic exemplars ✅

Each exemplar in `exemplars/` (e.g. `registered-freehold-house.ttl`, `flat-with-split-uprn.ttl`, `claim-with-vouch-evidence.ttl`) is paired with a generator-emitted `<stem>-expected-report.ttl` — the exact `sh:ValidationReport` Jena should produce. `opda-gen validate-exemplar` runs Jena and **byte-compares** the actual report to the committed expected report. Drift in Jena's output or in shape semantics surfaces immediately as a CI failure, not after a downstream consumer breaks. (Seed docs say "15"; the live corpus has **17** exemplar/report pairs — the count grew.)

---

## 6. Inference — OWL-RL-safe materialisation at load time (ODR-0025 + ADR-0035) 🟡

Inference does **not** run a live reasoner. Instead, at Jena/Fuseki LOAD time, `scripts/fuseki-load.mjs::materializeEntailments()` materialises a bounded OWL-RL-*safe* closure into a **derived graph** `https://opda.org.uk/pdtf/graph/inferred/entailment`, kept separate from the asserted module graphs so asserted-vs-inferred provenance stays queryable.

**The 7 safe rules** (verified in `fuseki-load.mjs`), each an idempotent `INSERT … WHERE … FILTER NOT EXISTS`, run to a **fixpoint** (loop until a pass adds 0 triples; guard at 10 passes), in dependency order:

1. `rdfs:subClassOf` transitivity
2. `rdfs:subPropertyOf` transitivity
3. `rdfs:subPropertyOf` value propagation
4. **`rdfs:subClassOf` type propagation**
5. `owl:inverseOf` (both directions)
6. `owl:SymmetricProperty`
7. `owl:TransitiveProperty`

The rule WHERE-clauses read Jena's `urn:x-arq:UnionGraph` ARQ pseudo-graph so they range across every named graph at once. **Excluded by design** (ODR-0025 §R2): `owl:sameAs`, Functional/InverseFunctional, equivalence, and `rdfs:domain`/`range` typing — the last exclusion is deliberate; it is *why* the load-time closure does not mis-type `opda:EPCCertificate` as an `opda:Property`. A **post-load consistency gate** then COUNT-checks `owl:disjointWith` violations and fails the load on any — "disjointness as validation, not materialisation."

> **The honest as-built picture (🟡).** Per ADR-0035's own implementation note and the `ci-inference-closure` gate (`ci/inference_closure_test.py`): the closure produces only **~30 inferred triples**, and **only rule 4 (subclass type-propagation) ever fires.** The model currently declares **zero** `owl:inverseOf`, `owl:TransitiveProperty`, `owl:SymmetricProperty`, or `owl:disjointWith`, and the class hierarchy is **flat** (no A⊑B⊑C chains). The other six rules pass *vacuously*. The CI gate is written so the inverse/transitive/symmetric checks are **conditional guards** that "start enforcing the instant such a construct lands" — no gate edit needed. This is a faithful reflection of a young, flat model, not a relaxation of the rule set.

A nice engineering detail: `ci-inference-closure` runs the **same seven rule bodies** in-process via `rdflib` (rewriting the Jena `urn:x-arq:UnionGraph` read as a portable `GRAPH ?g` pattern) so the closure can be proven correct in the hermetic pytest harness without standing up Fuseki — a Docker-free static proof that the production loader does what ODR-0025 §R1 specifies and nothing R2 forbids.

---

## 7. The BASPI5 round-trip harness — the MVP gate (ADR-0014) ✅

This is the gate that **retired the implementation programme**. BASPI5 (a real PDTF statutory form overlay) is driven end-to-end:

```
BASPI5 JSON  →  parse to RDF via the ontology  →  validate against the BASPI5 SHACL profile
            →  regenerate BASPI5 JSON   (with full dct:source traceability throughout)
```

Round-trip equivalence (input JSON ≡ output JSON after normalising array order / whitespace / xsd-default insertion) is the green-light. It closes ODR-0003's *programme-retirement criterion (i)*. The harness has three layers:

1. **Round-trip layer** — JSON → RDF → validate → JSON; equivalence asserted.
2. **Exemplar regression layer** — each of the 17 exemplars validated, report byte-matched to its committed expected report.
3. **`dct:source` traceability layer** — SPARQL proving every form question and every shape `sh:path` resolves back to a data-dictionary leaf.

The in-tree gate `ci-baspi5-roundtrip` (`ci/baspi5_roundtrip_test.py`) asserts three concrete things on the two committed transaction exemplars: **(a)** the conformant transaction conforms with zero violations; **(b)** the non-conformant one — *a power-of-attorney seller with no evidenced authority* — trips a violation that **traces to form-question B1.3.2** via the `SellersCapacity` `sh:xone` (the asserted-vs-evidenced authority gap PDTF collapsed into free text, now mechanically caught); **(c)** every BASPI5 property shape carrying a form-question `dct:source` also carries a DASH render hint.

This is also the seed of **model-driven JSON generation** — the same machinery that regenerates BASPI5 JSON from validated RDF is what a future "PDFs → APIs" pipeline would generalise (cross-ref KB doc 09). A worked debugging note from the ADR's history shows the gates earning their keep: a Cat-4 SHACL shape from ADR-0012 was *over-firing* `sh:Violation` on every Person instance (7 of 15 exemplars); the round-trip harness surfaced it, and the fix (switch to a conditional SHACL-AF `sh:sparql` constraint) was caught and verified before merge.

---

## 8. The 8 CI gates and the GitHub workflows ✅

All gates are subcommands of `opda-gen` (`tools/opda-gen/src/opda_gen/ci/`), so the **same commands run locally (`make ci-ontology`) and in CI** — no CI-only magic.

| # | Gate | Subcommand | What it proves |
|---|---|---|---|
| 1 | **Byte-identity** | `ci-byte-identity` | Regenerate → diff vs committed TTL. **The anti-drift keystone.** |
| 2 | **Three-graph separation** | `ci-three-graph` | The 5 MUST-checks of §4 |
| 3 | **Dup-declaration** | `ci-dup-declaration` | Every `opda:` term typed in exactly one module |
| 4 | **Profile contract** | `ci-profile-contract` | 3 rules per overlay: `sh:in` semantics, `sh:Violation` floor, no-identity-override |
| 5 | **BASPI5 round-trip** | `ci-baspi5-roundtrip` | The MVP gate of §7 |
| 6 | **Descriptive round-trip** | `ci-descriptive-roundtrip` | Every form-question leaf is `dct:source` of exactly one profile shape `sh:path` (report-only unless `--strict`; profiles emitted thin pending the descriptive walk) 🟡 |
| 7 | **Category-G coverage** | `ci-category-g-coverage` | Every candidate-G leaf minted-or-collapsed (needs the gitignored data dictionary; `UNAVAILABLE`+exit 0 on a bare CI checkout) 🟡 |
| 8 | **Inference closure** | `ci-inference-closure` | The §6 OWL-RL-safe closure proof (non-empty, no R2-excluded triple, disjointness satisfiable) |

**GitHub workflows** (`.github/workflows/`):

- **`ontology-byte-identity.yml`** — the spine. On every push/PR to `main`: clone the upstream PDTF schemas (pinned to commit `996a56a`; the profile/descriptive emitters read overlay JSON that is gitignored, not a submodule) → install `opda-gen` → run the pytest suite → `opda-gen emit` into `/tmp` → **`diff -rq` against the committed corpus** → three-graph, dup-declaration, per-module per-file byte gates, profile-contract, exemplar validation, and an expected-report `git diff --exit-code`. Provisions only a JDK 21 (`setup-java`) + caches `.jena`.
- **`baspi5-round-trip.yml`** — three jobs: the round-trip + traceability + exemplar-regression pytest layer; a **per-exemplar matrix** (one job per exemplar, `fail-fast: false`, so a failure pinpoints the exact exemplar); and an expected-report byte-identity job.
- **`deploy.yml`** — see §9.

The `Makefile` mirrors all of this: `make verify-ontology` (byte-identity alone), `make ci-ontology` (all gates), `make ci` (JS remark tests + ontology gates). `make test` is the JS unit suite; there is **no `lint` script** by design.

---

## 9. Live serving — Fuseki + grlc + Astro → Cloudflare Pages (ADR-0021) ✅

The published entity pages at `https://opda.org.uk/pdtf/` are **generated from the ontology graph at build time**, not hand-written markdown — so the structured facts (typed attributes, cardinalities, UFO meta-category, SHACL constraints, SKOS membership, `dct:source`) come straight from the 24 TTLs rather than a lossy prose projection (ADR-0021).

The build pipeline (`npm run build:data` → `scripts/build-with-data.mjs`):

1. Launch a local **Apache Jena Fuseki 6.1.0** binary (self-provisioned, no Docker).
2. **`scripts/fuseki-load.mjs`** uploads each TTL into a named graph `…/pdtf/graph/<module>` via Graph Store Protocol, then materialises the OWL-RL closure (§6) and runs the consistency gate.
3. Start the **grlc** layer (`src/api/` — `server.js` + `queries/` + `routes/`), which exposes parameterised SPARQL as a REST API ("SPARQL-as-REST").
4. Run **`astro build`**, which queries that API to render the entity pages.
5. Tear it all down — the triplestore + API are **build-exclusive and ephemeral**; only the static `dist/` is deployed.

`deploy.yml` runs that on push to `main` (path-filtered to the production bundle + ontology + scripts) and `wrangler pages deploy dist` to Cloudflare Pages. **Deploys are CI-only** — `make deploy-manual` (direct wrangler) exists as an escape hatch but is avoided. The runtime site never runs, reaches, or exposes Fuseki.

For development: `make serve-data` keeps Fuseki + the grlc API up; `make jena-load` loads TTLs into an already-running Fuseki; `make api` runs grlc alone against Fuseki on `:3031`.

---

## 10. Why this chain = a standard you can trust *and* reproduce

Pulling the threads together — each guarantee answers a specific way a standard can fail:

- **Determinism + byte-identity** answer *"can I reproduce it, and is the committed artefact really what the inputs say?"* — yes, to the byte, on any machine, enforced on every PR. Diffs carry only meaning, never noise.
- **Three-graph separation** answers *"can I take just the model / just the validation / just the advice?"* — yes, and CI guarantees they never contaminate each other.
- **`dct:source` everywhere + the precedence ladder** answer *"where did this term come from, and by what authority?"* — every term traces to a W3C spec, the Trust Framework, the glossary, or a data-dictionary leaf, with regulator context attached; an unsourceable term fails the build.
- **Jena 1.2 validation** answers *"is the validation contract actually enforced, or silently skipped?"* — actually enforced (the precise reason pyshacl was retired).
- **BASPI5 round-trip** answers the hardest one: *"does this ontology actually, losslessly, re-express a real statutory form?"* — demonstrably yes, JSON → RDF → validated → JSON, every question traceable to its origin.

That is the difference between a slide-deck model and a **governed, versioned, reproducible semantic standard** the wider ecosystem can dereference, validate against, and extend.

---

## Built vs planned

| Capability | Status | Evidence |
|---|---|---|
| Deterministic `opda-gen` generator (rdflib-backed, custom serialiser) | ✅ | `emitters/`, `serialiser/canonical.py` |
| Byte-identity CI gate | ✅ | `ci/byte_identity.py`, `ontology-byte-identity.yml` |
| Three-graph separation (5 checks) + dup-declaration | ✅ | `ci/three_graph_test.py`, `ci/dup_declaration_test.py` |
| Term-sourcing 5-line precedence with `dct:source` | ✅ | `term_sourcing.py` (1,061 `dct:source` triples in corpus) |
| SHACL 1.2 validation via Apache Jena (pyshacl retired) | ✅ | `jena_shacl.py`, ADR-0036/0037, `pyproject.toml` (no pyshacl) |
| 17 diagnostic exemplars + byte-matched expected reports | ✅ | `exemplars/`, `emitters/exemplar_reports.py` |
| BASPI5 round-trip MVP gate (incl. B1.3.2 traceability) | ✅ | `ci/baspi5_roundtrip_test.py`, `baspi5-round-trip.yml` |
| OWL-RL-safe load-time inference (7 rules, fixpoint) | ✅ (mechanism) | `scripts/fuseki-load.mjs::materializeEntailments` |
| …but only subclass-type-propagation actually fires (~30 triples) | 🟡 | `ci/inference_closure_test.py`, ADR-0035 note |
| Fuseki + grlc + Astro build-time entity-page generation | ✅ | `scripts/build-with-data.mjs`, `src/api/`, ADR-0021 |
| CI-only deploy to Cloudflare Pages | ✅ | `deploy.yml` |
| Descriptive round-trip + Category-G coverage (full enforcement) | 🟡 | report-only / `--strict`; profiles emitted thin (ADR-0028/0029/0031) |
| Derived consumer profiles (`opda-validation.ttl`/`opda-ui.ttl`/`opda-inference.ttl`) | 🔵 | `composer.py` is a `NotImplementedError` stub; `emit` does not call it |
| Inverse/transitive/symmetric inference; richer class hierarchy | 🔵 | model declares none today; CI guards pre-wired |
| Model-driven downstream JSON/API/code generation | 🔵 | BASPI5 round-trip is the seed; see KB doc 09 |

---

## Talking points for the quarterly tech review (mixed senior + technical)

- **"The standard regenerates itself, to the byte."** The ontology isn't maintained by hand — a generator emits it from the PDTF data dictionary, and CI fails the build on a *single byte* of drift. That is what makes it reviewable, reproducible, and trustworthy: a pull-request diff shows real change, never noise.
- **"We own the part that guarantees reproducibility."** rdflib helps build the graph, but we wrote our own canonical serialiser and content-addressed blank-node scheme, so byte-identity is *our* contract, not a hostage to a third-party library's release cadence.
- **"We validate against the spec we actually committed to."** We retired pyshacl and standardised on Apache Jena precisely because pyshacl *silently skips* SHACL 1.2 — a validator that quietly ignores your rules is worse than none. (Honest footnote if pressed: Jena is the validator/parser; the Python generator still uses rdflib internally to *build* graphs — the spec-conformant boundary is the validate/parse path.)
- **"A real statutory form round-trips, losslessly, with full provenance."** BASPI5 goes JSON → ontology → validated RDF → JSON, and every form question traces back to a data-dictionary leaf — including the seller's *asserted-vs-evidenced authority* distinction that PDTF's JSON collapsed into free text. This is the seed of "PDFs → APIs."
- **"Eight automated gates guard every change; the same ones run on a laptop and in CI."** No CI-only magic — `make ci-ontology` reproduces the pipeline locally.
- **Be candid about the roadmap (it's a strength, not a gap):** OWL reasoning is *real but shallow today* — only subclass entailment fires (~30 triples) because the model is intentionally flat so far; the inference gate is pre-wired to enforce inverse/transitive rules the moment such a property lands. And the derived consumer-profile composer is still a stub. Both are phased, and the CI scaffolding for them already exists.

---

## Source files

**Generator (`tools/opda-gen/src/opda_gen/`):**
- `cli.py` — Click CLI; all `emit-*` and `ci-*` subcommands
- `term_sourcing.py` — the 5-line precedence resolver (W3C > TF > regulators(contextual) > glossary > dictionary)
- `namespaces.py` — frozen kind-namespace split + flatten-collision guard
- `jena_shacl.py` — Apache Jena 6.1.0 `shacl` CLI wrapper (sole SHACL engine)
- `composer.py` — derived-profile composition (🔵 `NotImplementedError` stub)
- `serialiser/{canonical.py, ordering.py, blank_nodes.py}` — the byte-identity serialiser
- `emitters/{foundation,vocabularies,contexts,shapes,annotations,profiles,exemplar_reports,manual}.py` + `emitters/modules/{property,agent,transaction,claim,governance,descriptive}.py`
- `inputs/{data_dictionary,glossary,odr_corpus,leaf_categoriser,leaf_resolver,category_g_curation}.py`
- `ci/{byte_identity,three_graph_test,dup_declaration_test,profile_contract_test,baspi5_roundtrip_test,descriptive_roundtrip_test,category_g_coverage_test,inference_closure_test}.py`

**Serving + CI:**
- `scripts/fuseki-load.mjs` — Fuseki GSP loader + 7-rule OWL-RL fixpoint + consistency gate
- `scripts/build-with-data.mjs` — orchestrates Fuseki + grlc + `astro build`
- `src/api/` — grlc-style SPARQL-as-REST layer (`server.js`, `queries/`, `routes/`)
- `Makefile` — `build-data`, `serve-data`, `jena-load`, `api`, `ci-ontology`, `verify-ontology`
- `.github/workflows/{ontology-byte-identity,baspi5-round-trip,deploy}.yml`

**Decision records:**
- ADR-0007 (generator spec) · ADR-0008 (generator infra) · ADR-0014 (BASPI5 MVP gate) · ADR-0021 (Fuseki+grlc serving) · ADR-0034 (gUFO typing) · ADR-0035 (load-time OWL-RL inference) · ADR-0036 (SHACL 1.2 via Jena) · ADR-0037 (Jena sole toolchain)
- ODR-0003 (programme) · ODR-0004 (foundation: §3a three-graph, §6a byte-identity, §7a precedence) · ODR-0025 (bounded entailment)

**Emitted corpus:** `source/03-standards/ontology/` — 24 TTLs + `profiles/` (31) + `exemplars/` (17 + 17 expected reports).
