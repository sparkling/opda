# Handover — Jena 6.1.0 toolchain built + pyshacl retired + the opda.org.uk/pdtf URL scheme frozen (2026-06-02)

**Author:** Henrik (with Claude). **Scope:** one long session that (1) **built the accepted-but-unbuilt Jena inference toolchain** — Fuseki 6.1.0 as a local binary (full hm parity, Docker dropped) + **retired pyshacl** so Apache Jena 6.1.0 is the sole SHACL engine; (2) fixed the EPCCertificate emitter defect + the `PREFIX rdf:` shapes defect; (3) reconciled ADR-0035/0036 to the as-built reality; (4) ran **Council session-037** to review the entire URL scheme; and (5) on directing-authority instruction **designed and FROZE a new namespace scheme** (base `https://opda.org.uk/`, the `/pdtf/` family with `/pdtf/shape/`, `/pdtf/graph/`, `/pdtf/harness/` sub-segments) recorded definitively in ADR-0006. **Status: 13 commits on branch `fix/epccertificate-emitter-domain-mismatch` (`586fcc5`…`be48091`), 29 ahead of `origin/main`; ALL LOCAL, NOT pushed; `main` untouched at `a116492`. Full gate suite green on the Jena path (345 pytest + 8 CI gates + 27 repo-root round-trip + byte-identity), auto-provisioning Jena with no `OPDA_JENA_HOME`. THE NAMESPACE MIGRATION IS NOT YET RUN — it is the main open work, and the scheme it implements is now frozen.**

> Continues [HANDOVER-2026-06-01-inference-regime-and-classification-doctrine.md](./HANDOVER-2026-06-01-inference-regime-and-classification-doctrine.md). That session left the inference toolchain "accepted but unbuilt" as the cleanest next action; this session built it.

---

## TL;DR

The inference toolchain the prior handover flagged is **built and green**: opda runs a **local Apache Jena Fuseki 6.1.0 binary** (self-provisioned, no Docker) against a `config/fuseki-config.ttl` assembler, and **pyshacl is gone** — all SHACL validation runs on the Jena 6.1.0 `shacl` CLI (`opda_gen.jena_shacl`, auto-provisioned). Then a **Full Council (session-037)** reviewed the URL scheme; the directing authority took the verdict + several overrides and **froze a new namespace scheme**: base **`https://opda.org.uk/`**, everything under a **`/pdtf/`** family root with role sub-segments (**`/pdtf/shape/`** shapes, **`/pdtf/graph/`** named graphs, **`/pdtf/harness/`** physical/governance), **slash, flat, no version-in-IRI**. ADR-0006 carries the definitive block. **The repo-wide migration to that scheme has NOT been run** — it is the next big task, and it is a structural kind-namespace split, not a find-replace.

---

## What shipped — 13 commits on `fix/epccertificate-emitter-domain-mismatch` (all local; NOT pushed)

| Commit | What |
|---|---|
| `586fcc5` | **EPCCertificate emitter defect fixed** — re-homed the EPC rating off the `opda:EPCCertificate` subject (a `Property`-domain predicate on a non-`Property` subject; ADR-0035 / prior handover §8). |
| `634c875` | Docker Fuseki pin to `stain/jena-fuseki:5.1.0` — **superseded** by `a6accf1` (Docker dropped entirely); left in history. |
| `a42abab` | `ci-inference-closure` gate (ADR-0035) + `ci-shacl-parity` gate (ADR-0036). Inference-closure asserts inferred-graph non-empty, subclass type-entailment, NO R2-excluded triple; inverse/transitive carried as vacuous-until-present guards (the model declares none). |
| `eee461e` | pyshacl↔Jena parity harness module. |
| `a6accf1` | **Fuseki 6.1.0 as a LOCAL BINARY (full hm parity, Docker dropped).** `config/fuseki-config.ttl` (declarative `/opda` TDB2 dataset, `unionDefaultGraph`); `build-with-data.mjs` rewritten to launch + self-provision the Apache 6.1.0 dist (sha512-verified into `.fuseki/`) instead of `docker compose`; `docker-compose.yml` **removed**; `deploy.yml` gains `setup-java@21`; `.gitignore` `/.fuseki/`+`/run/`. Verified `build:data` end-to-end green (427 pages). |
| `7696f65` | **`PREFIX rdf:` fix** at the shapes emitter (`ShInSemantics_MetaShape` `sh:select` used `rdf:rest*/rdf:first` with no `rdf:` prefix — strict Jena rejected it). `ci-shacl-parity` → **17/17 PASS** (pyshacl ≡ Jena). |
| `207c89d` | **pyshacl RETIRED — Jena 6.1.0 sole SHACL engine** (ADR-0036/0037). New `opda_gen/jena_shacl.py` (resolve `OPDA_JENA_HOME`/PATH/auto-provision via **curl** + sha512 into `.jena/`; `validate()→(conforms, report_graph)`). `exemplar_reports.py` + the round-trip harness + `cli.py validate-exemplar` → Jena; the committed exemplar reports came out **byte-identical** (the normaliser was already engine-neutral). Parity machinery removed (`ci-shacl-parity`, `shacl_parity_test.py`, `test_shacl_parity.py`); `pyproject` drops pyshacl; both CI workflows gain `setup-java@21` + a `.jena` cache. |
| `428e327` | ADR-0035/0036 reconciled to as-built (ADR-0035 §Confirmation criterion 2 only partially demonstrable — model declares zero inverse/transitive/symmetric; ADR-0036 transition COMPLETE, no Jena-6.x container exists so the binary is used). |
| `e3f5ca6` | **ADR-0006 amended (1st)** — `opda/pdtf` slash-based scheme + `harness` namespace + full old→new mapping. |
| `b211b68` | **Council session-037** — Full Council ratifying the URL scheme; record + working positions + adoption row. |
| `fac845c` | session-037 final convergence (cross-talk moved Q2→hash recommendation, Q4/Q5→unanimous). |
| `8d1fc9e` | **ADR-0006 — base domain → `https://opda.org.uk/`** (supersedes the w3id/PICG choice). |
| `be48091` | **ADR-0006 — final topology LOCKED** (everything under `/pdtf/`: `shape`, `graph`, `harness` sub-segments). The definitive scheme block. |

---

## ⚠ Things a reader MUST know

1. **The URL scheme is FROZEN — see the definitive block at the top of [ADR-0006](./adr/ADR-0006-w3id-opda-ontology-namespace.md).** Base `https://opda.org.uk/`; PDTF family under `/pdtf/`. The table below is the contract; the migration implements it.
2. **The migration is NOT run.** Today's emitted corpus is still entirely `https://w3id.org/opda/#…`. Re-emitting to the frozen scheme is **the main open task** (detailed in §What's open). It is a **structural kind-namespace split** (terms/shapes/graphs/harness in *different* namespaces) — NOT a find-replace.
3. **All work is on branch `fix/epccertificate-emitter-domain-mismatch`, not `main`.** The branch name is a misnomer — it carries the whole session (toolchain, pyshacl retirement, council, ADR scheme). `main` is at `a116492` (prior session). Branch is **29 ahead of `origin/main`**; nothing is pushed. Integrate branch→main (or push the branch) is deferred.
4. **pyshacl is GONE; Jena 6.1.0 is the sole SHACL engine, auto-provisioned.** Tests/CI need only a JDK 17+; `opda_gen.jena_shacl` downloads the Jena dist (curl + sha512) into `.jena/` if `OPDA_JENA_HOME`/PATH don't resolve it. Locally a dist sits at `/tmp/apache-jena-6.1.0`; CI caches `.jena/` + `setup-java@21`.
5. **Fuseki is a LOCAL BINARY, no Docker.** `build:data` self-provisions Fuseki 6.1.0 into `.fuseki/` and runs it against `config/fuseki-config.ttl`. `docker-compose.yml` was removed (`src/api/` Dockerfile kept). No Jena 6.x Fuseki *container* exists anywhere (verified) — the binary is used by design.
6. **Council session-037 recommended a HASH (5H-2S); the directing authority OVERRODE to slash.** The panel (incl. DPV author + two web-architects) argued the slash override fails ODR-0004's own reopening trigger. The directing authority overrode on the grounds that the **document-dereferenceability paradigm (Cool URIs / httpRange-14 / hash-as-document-fragment) is obsolete** — modern linked data treats IRIs as graph-node identifiers and resolution as infrastructure, not a URI-shape driver. **Slash stands.** (Reinforced by the move to opda.org.uk: opda controls hosting, so resolution is fully theirs.)
7. **Q8 resolved → profiles are normative standard SHACL** at `…/pdtf/shape/profiles/<form>` (the `/pdtf/shape/` segment subsumed the open question).
8. **B3 re-index (`odr-index`/`adr-index`) remains FORBIDDEN** until explicitly authorised (carried from the prior handover). New records registered via file edits only.

---

## The FROZEN scheme (ADR-0006 definitive block)

Base **`https://opda.org.uk/`** · slash · no hash · no version segment (`owl:versionInfo` + `owl:versionIRI`) · flat term namespace.

| Resource | IRI |
|---|---|
| Ontology IRI | `https://opda.org.uk/pdtf/` (+ `owl:versionInfo "1.0.0"`) |
| Class / property | `…/pdtf/Property` · `…/pdtf/evidenceType` |
| SKOS scheme / concept | `…/pdtf/role` · `…/pdtf/role/Buyer` (incl. nested `…/pdtf/fixtureItem/kitchen/dishwasher`) |
| SHACL shape node | `…/pdtf/shape/EvidenceFacetShape` · `…/pdtf/shape/Baspi5_PropertyShape` |
| Profile (form overlay) | `…/pdtf/shape/profiles/baspi5` |
| Named graph | `…/pdtf/graph/foundation` · `…/pdtf/graph/inferred/entailment` |
| data-dictionary entry | `…/pdtf/harness/data-dictionary/propertyPack.environmentalIssues.flooding` |
| ODR anchor | `…/pdtf/harness/odr/ODR-0011/section-5a` |
| ADR link | `…/pdtf/harness/adr/ADR-0007-ontology-generator-specification` |
| instance / test data | `…/pdtf/harness/data/…` · `…/pdtf/harness/data/exemplar/<stem>` |
| release snapshot | `…/pdtf/harness/release/1.0.0/` |

**Standard vs physical:** core `/pdtf/` + `/pdtf/shape/` + `/pdtf/graph/` are the standard; `/pdtf/harness/` is physical/governance. One-directional dependency: nothing in core may depend on `/pdtf/harness/`.

---

## Council session-037 (the URL-scheme governance output)

- **[session-037](./ontology/odr/council/session-037-url-scheme.md)** — Full Council, 7 voices (Queen Kendall, DA Davis; Baker, Gandon, Allemang, Knublauch, Pandit), `agent-fan-out` + SendMessage cross-talk. Reviewed the entire scheme (Q1–Q8) vs best practice + hm/DPV prior art. Verdicts (final, post cross-talk): Q1 base 7-0-0; Q2 **5H-2S → recommended hash** (overridden by DA → slash, see §6); Q3 version-out-of-IRI 7-0-0; Q4 flat 7-0-0; Q5 split 7-0-0 (Baker's binding placement procedure; one redirect + path); Q6 data-dictionary→harness 6-0-1; Q7 **no `/shacl/` 7-0-0** (later overridden to `/pdtf/shape/` — milder, under pdtf authority); Q8 → resolved normative. Davis's adversarial pressure produced the two most durable artefacts (Baker's placement procedure, Pandit's reopening criterion). Working positions in [`working/session-037/`](./ontology/odr/council/working/session-037/); track-record row in [adoption.md](./ontology/odr/council/adoption.md).
- **hm prior art checked** (the directing authority requested it): hm ODR-0013 (slash, per-BC+facet modules), ODR-0065 (namespace topology + falsifiable inclusion criteria = Baker's procedure), ODR-0020 (`/id/` `/data/` instance separation), ODR-0064 (shapes in-namespace, no `/shacl/`), ODR-0055 (`vann:` resolution); hm council session-359 ranked dereferenceability "aspirational, not required". hm is **pure slash** — supports opda's slash.

---

## What's open / next steps (suggested order)

1. **THE NAMESPACE MIGRATION** (the big task; implements the frozen ADR-0006 scheme). It is a **structural kind-namespace split**, not a string swap:
   - **Emitter:** replace the single `OPDA = Namespace("https://w3id.org/opda/#")` (≈10 sites: `emitters/{foundation,shapes,contexts}.py` + the CI test modules) with **role-keyed namespaces** — terms `https://opda.org.uk/pdtf/`, shapes `…/pdtf/shape/`, graphs `…/pdtf/graph/`, harness `…/pdtf/harness/…`. Best done as one `opda_gen/namespaces.py` source-of-truth that all emitters import.
   - **foundation.py:** `_ONTOLOGY_IRI`→`…/pdtf/`; **drop** `_VERSION_IRI` path (carry `owl:versionInfo` + a `…/pdtf/harness/release/1.0.0/` `owl:versionIRI`); `_SHAPES_GRAPH_IRI`/`_ANNOTATIONS_GRAPH_IRI`→`…/pdtf/graph/…`; `_OPDA_NS_LITERAL`.
   - **Shape emitter:** mint shape NODES under `…/pdtf/shape/` (a NEW namespace, separate from the class namespace they `sh:targetClass`). Profiles → `…/pdtf/shape/profiles/<form>`.
   - **ODR/ADR ref URIRefs:** hundreds of `…/opda/odr/ODR-NNNN#section-X` → `…/pdtf/harness/odr/ODR-NNNN/section-X` (slash, harness); `openpropdata.org.uk/adr/ADR-NNNN-slug` → `…/pdtf/harness/adr/…`.
   - **data-dictionary:** `…/opda/data-dictionary#<dotted>` → `…/pdtf/harness/data-dictionary/<dotted>`.
   - **Loader** (`scripts/fuseki-load.mjs`) graph IRIs → `…/pdtf/graph/…`; `config/fuseki-config.ttl` if it references IRIs; `ci/inference_closure_test.py` `ENTAILMENT_GRAPH`; `term_sourcing.py` `_SCHEMA_LEAF_AUTHORITY`.
   - **Then:** re-emit all TTLs + **re-pin byte-identity** + regenerate exemplar reports + update ODR/ADR markdown cross-refs + `fuseki-load` reload + **full gate suite green** (345 pytest + 8 gates + 27 round-trip).
   - **Watch:** the flatten-collision guard (a class/property name == a scheme name would collide under flat `/pdtf/`); detect + report, don't silently merge.
2. **Finalise ADR-0006 `proposed → accepted`** once the migration lands and gates are green (it currently records the frozen scheme as the directing-authority decision).
3. **Integrate `fix/epccertificate-emitter-domain-mismatch` → `main`** (or push the branch), then **push** (29 commits vs `origin/main`; deploys run via CI on push to main — left for the user; `opda-deploys-via-ci-only`).
4. **EPCCertificate**: the emitter fix landed (`586fcc5`); confirm it survives the namespace migration's re-emit.
5. **B3 re-index** — only on explicit instruction.
6. **hm hand-offs** (carried from the prior handover) — `docs/hm-handoff-*.md`, deliver in an hm session.

---

## Key pointers

- **Scheme (frozen):** [ADR-0006](./adr/ADR-0006-w3id-opda-ontology-namespace.md) — definitive block at top. Council: [session-037](./ontology/odr/council/session-037-url-scheme.md).
- **Jena toolchain:** `opda_gen/jena_shacl.py` (SHACL engine + auto-provision); `config/fuseki-config.ttl`; `scripts/build-with-data.mjs` (local Fuseki launch + self-provision); `emitters/exemplar_reports.py` (Jena reports). ADR-0035/0036/0037 + ODR-0025/0026.
- **Run the gates** (no `OPDA_JENA_HOME` needed — auto-provisions; a JDK must be on PATH): `cd tools/opda-gen && .venv/bin/python -m pytest -q` (345) and `.venv/bin/python -m opda_gen {ci-byte-identity|ci-three-graph|ci-dup-declaration|ci-profile-contract|ci-descriptive-roundtrip|ci-category-g-coverage|ci-baspi5-roundtrip|ci-inference-closure}`. Repo-root round-trip: `PYTHONPATH=tools/opda-gen/src tools/opda-gen/.venv/bin/python -m pytest tests/baspi5_round_trip -q`. Re-pin: `emit --output source/03-standards/ontology/` then `ci-byte-identity` (+ `emit-exemplar-reports` if shapes/exemplars changed).
- **Live build:** `npm run build:data` (self-provisions Fuseki 6.1.0; needs Docker? NO — needs Java + network).
- **hm prior art:** `~/source/hm/semantic-modelling` — ODR-0013/0017/0020/0055/0064/0065 (namespace), council session-359 (URI scheme); config/fuseki-config.ttl, scripts/fuseki-*.sh.

## Memory

No auto-memory writes this session. Relevant survivors: [[opda-greenfield-no-wg-gate]] (directing authority ratifies/overrides directly — exercised repeatedly here: hash→slash, no-/shacl/→/pdtf/shape/, w3id→opda.org.uk), [[opda-deploys-via-ci-only]] (push triggers deploy — left for the user), [[opda-odr-format-vs-skills]] (use odr-create/adr-create), [[opda-binning-report-vs-emitted]].

## State

13 commits on `fix/epccertificate-emitter-domain-mismatch` (`586fcc5`…`be48091`), **29 ahead of `origin/main`, all local — NOT pushed**; `main` untouched at `a116492`. Working tree clean. Jena toolchain built + pyshacl retired + ADR-0035/0036 reconciled — full gate suite green on auto-provisioned Jena (345 pytest + 8 CI gates + 27 round-trip + byte-identity). URL scheme designed, council-reviewed (session-037), and **FROZEN** in ADR-0006 (base `https://opda.org.uk/`, `/pdtf/` family with `shape`/`graph`/`harness` sub-segments). **The namespace migration to that scheme is the main open task and has NOT been run.**
