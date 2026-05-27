# ADR-0009 Validation Report

**Validation agent:** independent-validator-adr-0009
**Validated:** 2026-05-27
**Implementing worker:** general-purpose agent (commit `c5629e7`)
**Cited ODRs:** ODR-0004
**Cited prior ADRs:** ADR-0007, ADR-0008
**Closed follow-ups (from ADR-0005 §G):** G2, G3
**Bonus follow-up closed:** G4

## Soundness check

### Emitted Turtle artefacts — `dct:source` provenance

Every `opda:` term in the emission has a `dct:source` triple resolving to a ratified ODR section. Header-only files (`foundation.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`) mint no terms; their generator-comment headers cite ADR-0009/0008/0007 + the namespace IRI.

| Emitted term | `dct:source` URI | Verified against | Verdict |
|---|---|---|---|
| `opda:DiagnosticExemplar` (`opda-classes.ttl:18-23`) | `https://w3id.org/opda/odr/ODR-0004#section-8a-diagnostic-exemplars` | ODR-0004 §8a (lines 115-124) — diagnostic-exemplars rule with CI-regression pairing + parent-repo storage | PASS |
| `opda:GeneratorRun` (`opda-classes.ttl:25-30`) | `https://w3id.org/opda/odr/ODR-0004#section-6a-generator-first` | ODR-0004 §6a (lines 84-99) — generator-first + deterministic emission + byte-identity CI | PASS |
| `foundation.ttl` generator-comment block | ADR-0007/0008/0009 backlinks | All three ADRs exist and §"Deterministic emission rules", §"CLI design", and §"foundation.ttl — ontology header" sections are present at the cited locations | PASS |
| `opda-shapes.ttl` generator-comment block | Same three ADRs + §3a backlink in body comment | Verified | PASS |
| `opda-annotations.ttl` generator-comment block | Same + ODR-0018 backlink in body comment | Verified ODR-0018 exists in corpus | PASS |
| `foundation.ttl` ontology header | `dct:creator/title/issued/modified/license`; `vann:preferredNamespacePrefix/Uri`; `owl:versionIRI`; `opda:generatorVersion`; `sh:declare → sh:prefix + sh:namespace` blank node | Matches ADR-0009 §"foundation.ttl" template lines 41-79 verbatim (only difference: pinned `<git-sha>` and `<emission-date>` — see Surfaced ambiguity) | PASS |

**A9 per-kind discipline confirmed:** both emitted classes carry the full ADR-0007 §"A9 per-kind discipline output" triple set — `rdf:type owl:Class` + `rdfs:label` + `rdfs:comment` (with IC over hard cases) + `skos:scopeNote` (UFO/DOLCE category) + `dct:source` (ODR-0004 section). Predicate ordering verified independently against the canonical serialiser output: `rdf:type → rdfs:label → rdfs:comment → dct:source → skos:scopeNote` (within-term order per ADR-0007 §"Deterministic emission rules" #3; predicate-specific lex after dct:source places skos:scopeNote last because `skos:scopeNote` > `dct:source` lexicographically — correct).

### Modified Python files — `Realises:` doc-comment headers

| File | Header cites ADR-0009 + cited ODR sections | Verdict |
|---|---|---|
| `tools/opda-gen/src/opda_gen/emitters/foundation.py` (366 LOC) | ADR-0009 §"foundation.ttl"/"opda-classes.ttl"/"opda-shapes.ttl"/"opda-annotations.ttl"; ADR-0007 §"Deterministic emission rules" + §"A9 per-kind discipline output"; ADR-0008 §"CLI design"; ODR-0004 §3a/§6a/§7a/§8a — all sections verified to exist at cited locations | PASS |
| `tools/opda-gen/src/opda_gen/cli.py` (284 LOC) | Added ADR-0009 §Confirmation #1 + #2 citations — verified | PASS |
| `tools/opda-gen/src/opda_gen/serialiser/canonical.py` (215 LOC) | Added ADR-0009 §"foundation.ttl — ontology header" + ADR-0008 follow-up G2 backlink — verified G2 entry exists at ADR-0005 line 107 | PASS |
| `tools/opda-gen/src/opda_gen/ci/three_graph_test.py` (269 LOC) | Added ODR-0004 §3a clause #5 + ADR-0009 + ADR-0008 follow-up G3 backlink — verified G3 entry exists at ADR-0005 line 108 | PASS |
| `tools/opda-gen/src/opda_gen/ci/byte_identity.py` (51 LOC) | Added ADR-0009 §"Confirmation" #2 citation — verified | PASS |
| `tools/opda-gen/tests/test_serialiser.py` (207 LOC; 60 new LOC) | Added ADR-0009 follow-up G2 citation — verified | PASS |
| `tools/opda-gen/tests/test_three_graph.py` (218 LOC; 136 new LOC) | Added ADR-0009 follow-up G3 citation — verified | PASS |
| `tools/opda-gen/tests/test_byte_identity.py` (81 LOC; ~50 new LOC) | Added ADR-0009 §"Confirmation" #2 citation — verified | PASS |

**Soundness verdict: 13/13 PASS.** Every emitted Turtle artefact has `dct:source` resolving to a ratified ODR section; every modified Python file declares its ADR/ODR provenance via `Realises:` header; every cited section was independently verified to exist in the cited document.

## Completeness check

### ADR-0009 §Confirmation criteria (five ADR-specific + four programme-wide)

| # | Criterion | Verification (independent re-run) | Verdict |
|---|---|---|---|
| 1 | First emission lands | `opda-gen emit-foundation` → 4 TTLs in `/tmp/adr-0009-revalidate/` (default also writes to `source/03-standards/ontology/`). `ls` confirms presence | PASS |
| 2 | Byte-identity CI green | `opda-gen ci-byte-identity` → `byte-identity: PASS`. Independent emission to `/tmp/adr-0009-revalidate` + `diff -rq` against committed → empty (exit 0) | PASS |
| 3 | Three-graph CI test green (ODR-0004 §3a five-part) | `opda-gen ci-three-graph` → `three-graph CI: PASS (all 5 checks)`. Independent verification: grep for `sh:` triples in annotations (no triple-level matches — only the comment-line warning); grep for `owl:imports` in shapes (no triple-level matches); grep for advisory predicates in shapes (0); `sh:targetClass` vacuously satisfied (no shapes yet); derived/ directory absent so check #5 PASSES vacuously | PASS |
| 4 | `vann:` header resolves | `rdflib.Graph().parse(format='turtle')` succeeds; 15 triples parsed including `vann:preferredNamespacePrefix "opda"` + `vann:preferredNamespaceUri "https://w3id.org/opda/#"^^xsd:anyURI` + `sh:declare → BNode → sh:prefix/sh:namespace` resolution | PASS |
| 5 | Diagnostic exemplars still validate | Independently parsed ALL 15 exemplars + `foundation.ttl` + `opda-classes.ttl` via rdflib — 15/15 PASS, no "undefined class" errors. `opda:DiagnosticExemplar` resolves to its `owl:Class` declaration in `opda-classes.ttl` line 19 | PASS |
| Programme-wide (a) | Soundness PASS | See Soundness check above — 13/13 PASS | PASS |
| Programme-wide (b) | Completeness PASS | See this section — 23 PASS + 8 explicit deferrals | PASS |
| Programme-wide (c) | Cross-ADR consistency PASS | See Cross-ADR consistency check below — 5/5 downstream ADRs supported | PASS |
| Programme-wide (d) | Validation report committed | This file (`docs/adr/validation/ADR-0009-validation-report.md`) | PASS |

**Manual `rapper` test:** worker reports `rapper` not installed; rdflib's strict parser provides functionally equivalent coverage. PASS-with-substituted-tool (rdflib is the reference parser the rest of the pipeline depends on; if rdflib parses, the file is well-formed Turtle).

### ADR-0007 cited subsections

| Subsection | Realisation | Verdict |
|---|---|---|
| §"Deterministic emission rules" #1 (alphabetised prefixes) | `serialiser/canonical.py:160` sort_prefixes call; verified independently in test_prefixes_alphabetised PASS | PASS |
| §"Deterministic emission rules" #2 (term-type order) | `ordering.py:TERM_TYPE_ORDER`; verified in test_term_type_ordering PASS | PASS |
| §"Deterministic emission rules" #3 (within-term order) | `ordering.py:PREDICATE_PRIORITY`; verified independently in emitted `opda-classes.ttl` — rdf:type→rdfs:label→rdfs:comment→dct:source→skos:scopeNote | PASS |
| §"Deterministic emission rules" #4 (blank-node SHA-256) | `blank_nodes.py`; foundation.ttl emits `_:b0bdbfe4f895a` for sh:declare — 12-char hex prefix per spec | PASS |
| §"Deterministic emission rules" #5 (literal escaping; xsd:string implicit; @en explicit) | `_format_literal` lines 65-82; verified — `"OPDA Linked Data Council"` emitted without `^^xsd:string`; `@en` tags present | PASS |
| §"Deterministic emission rules" #6 (LF, no trailing whitespace, no BOM, final newline, 4-space indent) | `test_file_formatting` PASS; independently verified emitted bytes end `b"\n"`, no `\r`, no BOM | PASS |
| §"A9 per-kind discipline output" | Both DiagnosticExemplar + GeneratorRun emit dct:source + skos:scopeNote + rdfs:comment; matches §"A9 per-kind discipline output" example pattern exactly | PASS |
| §"Three-graph emission constraints" | At emission time: build_classes_graph emits no sh:* triples; build_shapes_graph emits no owl:Class/owl:imports; build_annotations_graph emits no sh:*/advisory predicates. CI verifies | PASS |
| §"Byte-identity CI test" (sub-test #1) | test_foundation_byte_identical_across_runs PASS — two emissions byte-identical | PASS |
| §"Byte-identity CI test" (sub-tests #2-4) | DEFERRED to ADR-0010+ — need dictionary input (no dictionary-driven content at foundation). Named in implementation report §4 | PASS-deferred |
| §"Module pluralism" | DEFERRED to ADR-0011 with named trigger ("module TBox emission") | PASS-deferred |

### ODR-0004 cited subsections

| Subsection | Realisation | Verdict |
|---|---|---|
| §3a clause #1 (no sh:* in annotations) | check_no_shacl_in_annotations + emission complies (live verified) | PASS |
| §3a clause #2 (no owl:imports in shapes) | check_no_owl_imports_in_shapes + emission complies | PASS |
| §3a clause #3 (no advisory in shapes) | check_no_advisory_in_shapes with [aiHint, uiHint, exampleValue] whitelist + emission complies | PASS |
| §3a clause #4 (sh:targetClass resolves) | check_target_class_resolves; vacuously satisfied (no shapes yet) | PASS-vacuous |
| §3a clause #5 (derived provenance) | check_derived_provenance via git log; 4 new regression tests covering missing-dir + clean-history + non-service + env-var allowlist (G3 follow-up — see below) | PASS |
| §6a #1 (deterministic emission ordering) | Realised end-to-end via canonical serialiser; verified | PASS |
| §6a #2 (generator version in header) | `opda:generatorVersion "opda-gen-0.1.0"` triple at foundation.ttl line 30 | PASS |
| §6a #3 (byte-identity CI test) | ci_byte_identity + workflow step active | PASS |
| §7a (term-sourcing five-line precedence) | N/A for foundation (no dictionary input); term_sourcing.py unchanged | N/A |
| §7a (conflict-recording protocol) | DEFERRED to ADR-0011 with named trigger | PASS-deferred |
| §7a (dct:source URI discipline) | Foundation classes cite specific section anchors (`#section-8a-diagnostic-exemplars`, `#section-6a-generator-first`) — no "latest" URIs | PASS |
| §Rules.4 (vann: header pattern) | `vann:preferredNamespacePrefix "opda"` + `vann:preferredNamespaceUri "https://w3id.org/opda/#"^^xsd:anyURI` + `sh:declare → sh:prefix/sh:namespace` blank-node — full pattern emitted | PASS |
| §8a (diagnostic exemplars + parent-repo storage) | `opda:DiagnosticExemplar` class minted; 15 existing exemplars in `source/03-standards/ontology/exemplars/` parse cleanly against foundation+classes (independently verified) | PASS |

### Explicit deferrals (named with downstream trigger)

- Per-module classes → ADR-0011 ("module TBox emission")
- SHACL shapes content → ADR-0012
- DPV/annotations content → ADR-0012
- SKOS schemes → ADR-0010
- Overlay profiles → ADR-0013
- Cagle byte-identity sub-tests #2-4 → ADR-0010+ (need dictionary)
- Service-account allowlist persistence → future ADR (TODO in `_service_account_allowlist`)
- Exemplar regression harness (pyshacl comparison) → ADR-0014 (validate-exemplar still raises NotImplementedError)

**Completeness verdict: 23 PASS + 8 explicit deferrals + 1 N/A.** No silent gaps. Every cited ODR/ADR subsection is either realised by an emitted artefact OR explicitly deferred with a named downstream ADR trigger.

## Cross-ADR consistency check

For each downstream ADR whose `depends-on:` cites ADR-0009 (directly or transitively), verify the emitted foundation supports the downstream's confirmation criteria.

- [x] **ADR-0010 SKOS vocabulary emission supported.** ADR-0010 (depends-on: ADR-0009 + ODR-0011) needs (a) a stable foundation prefix-binding pattern + (b) `skos:Concept`/`skos:ConceptScheme` term-type ordering + (c) a class-graph version IRI to import. Verified: (a) `_bind_common` in foundation.py binds the prefix set that ADR-0010 will reuse (opda, owl, rdfs, dct, vann, sh, xsd, skos); (b) `ordering.py:TERM_TYPE_ORDER` includes SKOS.Concept at index 6 (per ADR-0008 validation report cross-check); (c) `owl:versionIRI <https://w3id.org/opda/0.1.0/>` is emitted as a stable identifier (does not need to dereference for import semantics). ADR-0010's emission can append to `opda-classes.ttl` OR emit a separate `opda-vocabularies.ttl` per its chosen option B. PASS.

- [x] **ADR-0011 module TBox emission supported.** ADR-0011 (depends-on: ADR-0009 + ADR-0010 + module ODRs) needs (a) `owl:imports <https://w3id.org/opda/0.1.0/>` resolving to the foundation class-graph; (b) per-module `owl:versionIRI` pattern; (c) A9 per-kind discipline output emitting `dct:source` + `skos:scopeNote` + `rdfs:comment` per class. Verified: (a) foundation emits `owl:versionIRI <https://w3id.org/opda/0.1.0/>` as the import target — stable as an identifier even if w3id.org redirect isn't live yet (ADR-0009 §Consequences explicitly tolerates this); (b) per-module versioning is a pattern the foundation establishes (`<https://w3id.org/opda/0.1.0/>`); (c) the foundation's two classes (DiagnosticExemplar + GeneratorRun) demonstrate the A9 emission pattern that ADR-0011 modules will follow per-class. The within-term order rdf:type→rdfs:label→rdfs:comment→dct:source→skos:scopeNote matches ADR-0007 §A9 example exactly. PASS.

- [x] **ADR-0012 SHACL shapes + DPV annotation emission supported.** ADR-0012 (depends-on: ADR-0011) needs (a) `opda-shapes.ttl` as an existing file to append to; (b) `opda-annotations.ttl` as an existing file to append to; (c) three-graph separation CI running so violations surface at PR time. Verified: (a) `opda-shapes.ttl` is present (21 LOC; header-only); ADR-0012 can append `sh:NodeShape`/`sh:PropertyShape` blocks; (b) `opda-annotations.ttl` is present (21 LOC; header-only); ADR-0012 can append `opda:aiHint`/`opda:uiHint`/`opda:exampleValue` advisory triples; (c) the three-graph CI runs against the real corpus from ADR-0009 onwards (workflow step active). The shapes-graph ontology URI `<https://w3id.org/opda/shapes>` allows downstream `sh:declare` additions via additional triples on the same subject. PASS.

- [x] **ADR-0013 overlay profile emission supported.** ADR-0013 (depends-on: ADR-0012) needs (a) per-overlay shapes can import the foundation shapes graph; (b) `opda:ValidationContext` class will be mintable per ODR-0010 §Q1; (c) the three-rule interface contract can be CI-enforced. Verified: (a) foundation's shapes graph IRI `<https://w3id.org/opda/shapes>` is a stable target for `owl:imports`; (b) the foundation's A9 pattern carries through to future `opda:ValidationContext` minting (ADR-0009 explicitly names `opda:ValidationContext` as a downstream class per ADR-0009 §Decision Drivers); (c) the three-graph CI test surface is present and active. PASS.

- [x] **ADR-0014 BASPI5 round-trip MVP harness supported.** ADR-0014 (depends-on: ADR-0013) needs (a) the harness can load `foundation.ttl` + `opda-classes.ttl` via rdflib; (b) `opda:DiagnosticExemplar` class is resolvable so exemplars typed as such don't raise "undefined class" errors; (c) `dct:source` traceability layer can resolve back to ODR-0004 sections. Verified: (a) independently parsed all 15 exemplars + foundation + classes via rdflib — 15/15 PASS; (b) `opda:DiagnosticExemplar` resolves to its `owl:Class` declaration; (c) emitted `dct:source` URIs use stable section anchors (`#section-6a-generator-first`, `#section-8a-diagnostic-exemplars`). PASS.

### Additional probes

- [x] **Determinism across two runs (the harder test).** Independent emission to `/tmp/adr-0009-revalidate` + `diff -rq /tmp/adr-0009-revalidate source/03-standards/ontology --exclude=...` → empty output. PASS.
- [x] **Generator-comment header invariance.** The `_FOUNDATION_LAST_MODIFIED` + `_FOUNDATION_SOURCE_COMMIT` pinning is what guarantees this (see Surfaced ambiguity below for the discussion). PASS.
- [x] **Test count non-regression.** ADR-0008 landed 28 tests; ADR-0009 reports 34 tests (28 + 6 new). Independently re-ran: 34 passed in 0.20s. PASS.
- [x] **Test coverage non-triviality on G2/G3.** Read all 6 new tests:
  - `test_literal_iri_lexical_value_retains_prefix` exercises the **specific** ADR-0009 header pattern (`sh:namespace "https://..."^^xsd:anyURI` Literal) — not a smoke test.
  - `test_non_iri_literals_do_not_pollute_prefix_set` is a real negative test (plain `"opda"` string MUST NOT trigger retention).
  - `test_check_derived_provenance_missing_dir_passes` covers the ADR-0009 live state.
  - `test_check_derived_provenance_clean_history_passes` uses a tmp git repo with pinned author identity — exercises the git-log integration end-to-end, not just the in-memory logic.
  - `test_check_derived_provenance_non_service_commit_fails` verifies the violation string format (author + filename).
  - `test_check_derived_provenance_env_var_allowlist` covers the env-var path with comma+whitespace tolerance.
  All exercise the invariant claimed, not just code paths. PASS.

**Cross-ADR consistency verdict: 5/5 PASS for required downstream ADRs + 4/4 PASS for additional probes.**

## G2/G3/G4 follow-up resolution (verified independently)

### G2 — Prefix-filter heuristic refinement (CLOSED)

**Status: VERIFIED CLOSED.** Implementation lives at `serialiser/canonical.py:143-148`:

```python
if isinstance(o, Literal):
    if o.datatype is not None:
        referenced_iris.add(str(o.datatype))
    lex = str(o)
    if lex.startswith("http://") or lex.startswith("https://"):
        referenced_iris.add(lex)
```

The fix preserves the "only emit referenced" discipline (option (a) per ADR-0008 validation report). The literal lexical value `"https://w3id.org/opda/#"` (object of `sh:namespace` in foundation header line 33) joins the referenced-IRI set, so the opda prefix is retained even in a header-only graph that references the opda namespace only via Literal.

Independent assessment: the operational evidence is that for the **actual** emitted foundation, the opda prefix is also referenced by `opda:generatorVersion` and `opda:targetsClassGraph` URIRef predicates — the fix wasn't strictly required for the emitted corpus to be correct. It is preventive against future header-only graphs (e.g. ADR-0012's per-module shapes header that may bind a namespace only via `sh:namespace` Literal). Two tests guard the fix; both PASS. Edge cases unchecked but acceptable:

- IRIs in `rdfs:comment` Literals (e.g. a comment mentioning a URL) WOULD now trigger prefix retention if a matching prefix is bound. Low risk: prefix bindings are explicit (worker controls them via `_bind_common`). Worth a follow-up note but not a blocker.
- Literals with `^^xsd:string` and lexical starting with `http://` would also trigger. Same low risk.

ADR-0005 §G G2 should be marked closed (date 2026-05-27; closing commit `c5629e7`).

### G3 — `check_derived_provenance` git-blame implementation (CLOSED)

**Status: VERIFIED CLOSED.** Implementation lives at `ci/three_graph_test.py:138-229` with three helpers:

- `_service_account_allowlist()` reads `OPDA_DERIVED_SERVICE_ACCOUNTS` env var (comma-separated emails). TODO comment names a future config-file extension point.
- `_git_authors_for_file(path)` runs `git log --format=%ae -- <file>`; tolerates missing git / not-a-repo / no-history with empty list.
- `check_derived_provenance(derived_dir, *, service_accounts=None)` walks `derived_dir/**/*.ttl` and emits violation strings for non-service-account authors.

Independent assessment of edge cases:

- **Missing `derived_dir`**: returns `[]` (PASS — this is the ADR-0009 live state since no `derived/` directory exists yet). Correct.
- **Empty allowlist + commits exist**: returns violations for EVERY commit author (the safe-by-default posture per `_service_account_allowlist()` docstring). The worker explicitly flagged this is operationally aggressive but correct under ODR-0004 §3a clause #5 ("no commits outside service account"). Once derived/ lands at ADR-0013, the env var (or config file) is populated.
- **No service account configured but derived/ committed by human**: would FAIL correctly. This is the intended discipline.
- **Service account configured + commits all from that account**: returns `[]` (clean history PASS).

Four regression tests cover: missing-dir baseline, clean-history positive, non-service-account negative (verifies violation string includes author + filename), env-var allowlist path. Each test uses a tmp git repo with pinned author identity for determinism. The fixture `_init_temp_git_repo` also pins `commit.gpgsign=false` to avoid GPG-signing requirements in CI.

One observation: the `cwd` for `git log` is `file_path.parent`. This is correct for files inside a working tree; would surface as empty-list for files outside any git repo (acceptable). ADR-0005 §G G3 should be marked closed (date 2026-05-27; closing commit `c5629e7`).

### G4 — CI workflow comment block split (CLOSED)

**Status: VERIFIED CLOSED.** `.github/workflows/ontology-byte-identity.yml` now has two comment blocks:

- Lines 31-35: "Activated by ADR-0009 (foundation TTL emission)" — covers regenerate-corpus + byte-identity-diff + three-graph-CI steps (37-46, ACTIVATED).
- Lines 48-52: "Activated by ADR-0014 (BASPI5 round-trip MVP harness)" — covers validate-exemplar step (still commented out).

This is the cosmetic split the ADR-0008 validation report recommended. Implementation report calls it out under G4. ADR-0005 §G G4 should be marked closed (date 2026-05-27; closing commit `c5629e7`).

## Surfaced ambiguity (worker-flagged)

### Pinned `Source commit:` sentinel vs live HEAD SHA

**The tension.** ADR-0009 §"foundation.ttl — ontology header" template line 50 shows `# Source commit: <git-sha>`, and line 67 shows `dct:modified "<emission-date>"^^xsd:date`. Both placeholders, if filled in with live HEAD SHA / today's date at emission time, would break byte-identity CI on the very next unrelated commit or next day.

**Worker's resolution.** Pin both to constants documented inline at `emitters/foundation.py:67-87`:

- `_FOUNDATION_LAST_MODIFIED = "2026-05-27"` (advances when foundation content materially mutates)
- `_FOUNDATION_SOURCE_COMMIT = "pinned-by-ADR-0009"` (sentinel string; advances per future ADR that mutates foundation)

**Independent assessment.** The worker is correct that byte-identity is the binding constraint:

1. ODR-0004 §6a #3 makes byte-identity a hard MUST: "build pipeline regenerates, byte-compares against committed TTL, fails on any byte difference."
2. ADR-0007 §"Byte-identity CI test" enforces this as a GitHub Actions step.
3. ADR-0009 §Confirmation #2 makes "subsequent regeneration produces zero diff" a confirmation criterion.

A live `<git-sha>` placeholder would mutate on every unrelated commit. A live `dct:modified` would mutate daily. Both would silently fail byte-identity CI without the foundation content having changed. The two operational constraints (provenance recording + byte-identity) are incompatible under the literal template reading.

**Could the template be read as illustrative?** Yes. The ADR-0009 template is wrapped in a `turtle` code-fence with placeholder syntax (`<git-sha>`, `<emission-date>`, `<version>` — note the angle brackets) — the angle brackets signal "fill in" without specifying when/how. The worker's interpretation (pin at emission-defining ADR; advance on future ADR that mutates foundation) is a coherent reading. The pinning is documented inline (8 lines of explanation at `foundation.py:76-84`).

**Council route?** Per programme plan §9.4, the Council route opens for genuine `## Rules` ambiguity. This is NOT a Rules ambiguity (the Rules — ODR-0004 §6a byte-identity — are unambiguous); it's a within-engineering ADR-9 template-rendering decision. The worker's note is right: "the route only opens for `## Rules` ambiguities. The template syntax is illustrative — the worker has resolved it within ADR-0009 scope."

**Recommendation.** PASS the resolution. Recommend a **cosmetic ADR-9 amendment** to update the §"foundation.ttl — ontology header" template to either (a) document the pinning convention explicitly in prose immediately above the code-fence, OR (b) replace the placeholder syntax `<git-sha>` with the sentinel format `pinned-by-ADR-NNNN` in the example so future ADRs that extend the foundation see the established pattern. This is a within-engineering ADR-side amendment — does NOT require Council. Queue as **G6** at ADR-0005 §G.

If the validator were to disagree and require live SHA / live date, the only alternative I can see is a **post-commit rewrite step** (compute committed SHA → rewrite header → amend commit) which violates the byte-identity contract differently (the commit's tree-hash and the file's content-hash become coupled in an unprincipled way). The pinning is the cleaner discipline.

## Additional findings (not worker-flagged)

### Finding 1: Foundation TTL author is Henrik (the human), not a build-pipeline service account

Independent `git log --format="%ae" -- source/03-standards/ontology/foundation.ttl` returns `henrik@sparklingideas.co.uk`. Under the ODR-0004 §3a clause #5 strict reading ("no commits outside the build-pipeline service account"), the foundation TTLs themselves WOULD be a violation — except clause #5 applies specifically to **derived consumer profiles** (`derived/opda-validation.ttl`, `opda-ui.ttl`, `opda-inference.ttl`), not to the canonical source graphs that ADR-0009 emits. The worker correctly scopes `check_derived_provenance` to a `derived_dir` argument, not the full ontology dir.

This is a **non-finding** (the implementation is correct); flagging here only because the live `git log` evidence is worth recording: the canonical source TTLs are authored by humans (via the generator); the derived consumer profiles are the artefact class that ODR-0004 §3a clause #5 polices.

### Finding 2: Foundation header inline comment `# MUST NOT contain sh:* or owl:Class triples` matches a regex search and could mislead an unsophisticated CI grep

`grep -c "sh:" source/03-standards/ontology/opda-annotations.ttl` returns 1 — matching the header comment line `# MUST NOT contain sh:* or owl:Class triples`. The check `check_no_shacl_in_annotations` correctly parses the Turtle (rdflib ignores comments) and reports 0 violations.

This is **not a defect** — the CI uses rdflib parsing, not raw grep. But it's worth noting that a naive operator who runs `grep` for spot-checking would see a false positive in the count. The header comment is operationally honest documentation; recommend leaving as-is and noting in `tools/opda-gen/README.md` that CI must use `opda-gen ci-three-graph`, not grep.

### Finding 3: `_default_ontology_dir()` walks for `.git` AND `source/03-standards/` — fragile to nested git repos

`cli.py:65-76` walks parent directories looking for both `.git` and `source/03-standards/`. The OPDA repo's `source/03-standards/schemas/` is itself a nested git repo (per the user's MEMORY notes). The walk could in principle stop at a nested `.git` directory inside `source/03-standards/schemas/` — but the `parent / "source" / "03-standards"` check requires the parent to contain that directory, not be inside it. The current logic is correct (the walk starts from the `cli.py` file location upward; the nested `.git` is a sibling of `03-standards/`, not a parent of `cli.py`).

Live test confirms: `opda-gen emit-foundation` (no args) writes to `/Users/henrik/source/opda/source/03-standards/ontology/` correctly.

This is a **non-finding** but warrants a comment in `_default_ontology_dir` noting why the dual-check is necessary (the nested-repo risk is the reason).

### Finding 4: `pinned-by-ADR-0009` sentinel format will accumulate

When ADR-0011 lands and mutates foundation content (e.g. adding ValidationContext class), the sentinel becomes `pinned-by-ADR-0011`. By the time the ontology programme retires, the sentinel could have advanced many times. The constant `_FOUNDATION_SOURCE_COMMIT` would need to be updated per-mutation.

Recommendation: the sentinel-advance convention should be named in the ADR-0009 cosmetic amendment (G6 above) so future ADR-implementers know the discipline. The current inline comment at `foundation.py:82-84` says "advances when a future ADR materially mutates the foundation content (e.g. ADR-0011 module emissions will bump this to 'pinned-by-ADR-0011')" — this is good but lives only in the Python file, not in ADR-0009 itself. Queue under G6.

### Finding 5: `validate-exemplar` CLI still raises NotImplementedError

`cli.py:274-280` correctly defers `validate-exemplar` to ADR-0014 (BASPI5 round-trip MVP harness). The CI workflow comment block at G4 correctly notes this. Independent test — running `opda-gen validate-exemplar source/03-standards/ontology/exemplars/registered-freehold-house.ttl` would raise NotImplementedError; not tested live to avoid noise but the code path is clear.

This is a **non-finding** (correctly deferred); flagging only because if a validator tried to run ADR-0009's manual test command from the brief literally (`opda-gen validate-exemplar ...`), they would hit the NotImplementedError. The ADR-0009 §Confirmation criteria do NOT require validate-exemplar to work; ADR-0014 does.

## Verdict

**PASS-WITH-FOLLOW-UPS**

ADR-0009 honourably realises every implementation criterion in scope. The four foundation TTLs (106 LOC; 31 triples) are emitted to canonical paths; byte-identity CI is GREEN; three-graph CI is GREEN (all 5 checks); all 34 tests pass; all 15 existing diagnostic exemplars parse cleanly against the foundation. G2 (prefix-filter Literal-scan), G3 (git-blame derived-provenance), and G4 (CI comment split) are correctly closed.

The worker's pinned-sentinel approach to `<git-sha>` + `<emission-date>` is the correct resolution of the operational tension between ADR-0009's template (suggests live values) and ODR-0004 §6a #3 (mandates byte-identity). This is a within-engineering decision, not a Council-route case. Recommend one cosmetic ADR-9 amendment (G6) to document the pinning convention in the template prose itself.

**Recommendation:** ADR-0009 status moves `proposed → accepted` subject to the follow-ups below being explicitly named-and-queued.

### Named follow-ups

1. **G6 (NEW) — ADR-0009 cosmetic amendment: document pinned-sentinel convention.** Update ADR-0009 §"foundation.ttl — ontology header" template to either (a) add prose immediately above the code-fence explaining the `<git-sha>` and `<emission-date>` pinning discipline, OR (b) replace the placeholder syntax with the live sentinel format (`pinned-by-ADR-NNNN`). Document the sentinel-advance convention (per Finding 4) so future ADR-implementers know when to bump the constant. Non-blocking; can land at any time before ADR-0011.

2. **(carry forward, not introduced by ADR-0009) — G1 Council Author-only term-sourcing-precedence reconciliation.** Still queued; no movement at ADR-0009 (foundation has no dictionary input).

3. **(NEW — note from G2 review) — G7 Optional: audit prefix-filter Literal-scan edge cases.** Two edge cases not covered by the new G2 tests: (a) IRIs appearing in `rdfs:comment` Literals could trigger spurious prefix retention if a matching prefix is bound; (b) Literals with explicit `^^xsd:string` whose lexical value starts with `http://` would also trigger. Low risk because prefix bindings are explicit. Worth a single regression test to confirm bound-vs-unbound behaviour with comment-style literals. Non-blocking; can land at ADR-0011 or ADR-0012 when the first real `rdfs:comment` with embedded URLs is emitted.

### Acceptance criteria post-follow-up

ADR-0009 moves to `status: accepted` once:

- G6 (cosmetic amendment) is queued at ADR-0005 §G.
- G2, G3, G4 entries in ADR-0005 §G are marked closed (date 2026-05-27; closing commit `c5629e7`).
- G7 (optional regression test) is queued at ADR-0005 §G.

The implementation itself does not require further changes for acceptance.

## References

- [ADR-0009 — Foundation TTL emission](../ADR-0009-foundation-ttl-emission.md)
- [ADR-0008 — Generator implementation infrastructure](../ADR-0008-generator-implementation-infrastructure.md) (predecessor)
- [ADR-0007 — Ontology generator specification](../ADR-0007-ontology-generator-specification.md)
- [ODR-0004 — PDTF ontology foundation](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) (§3a + §6a + §7a + §8a + §Rules.4)
- [ADR-0005 — Deferred work register §G](../ADR-0005-deferred-work-register.md)
- [Programme plan §9 — Validation discipline](../../plan/ontology-implementation.md)
- [ADR-0008 validation report](./ADR-0008-validation-report.md) (G2 + G3 + G4 origin)
- [ADR-0009 implementation report](../implementation-reports/ADR-0009-implementation.md) (worker's self-report)
- Worker commit: `c5629e77f3ceb4d58f8a1e617239415a773c0265`
