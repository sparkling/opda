# ADR-0010 Validation Report

**Validation agent:** independent-validator-adr-0010
**Validated:** 2026-05-27
**Implementing worker:** general-purpose agent (commit `75337ec`)
**Cited ODRs:** ODR-0011 (substrate); ODR-0004 (via term-sourcing + three-graph)
**Cited prior ADRs:** ADR-0007 (deterministic emission + A9); ADR-0008 (CLI/infra); ADR-0009 (foundation; G6 pinning convention)
**Closed follow-ups (from ADR-0005 §G):** G7 — independently verified
**New follow-ups queued by worker:** G8 (scope expansion); G9 (PLACEHOLDER schemes)
**New follow-ups queued by validator:** G10 (TransactionStatus member URI fabrication audit)

## Soundness check

### Emitted Turtle artefacts — `dct:source` provenance

| Layer | Verification | Verdict |
|---|---|---|
| 16/16 schemes carry `dct:source` | SPARQL: `SELECT ?s WHERE { ?s a skos:ConceptScheme . FILTER NOT EXISTS { ?s dct:source ?o } }` → empty | PASS |
| 88/88 members carry `dct:source` | rdflib walk: 0 missing | PASS |
| 11 schemes cite `ODR-0011#section-8a-ufo-meta-category` | Verified by-eye against scheme registry; section anchor matches `## Operational specifications §8a` heading in ODR-0011 | PASS |
| 3 regulator-cited schemes (CouncilTaxBandSchemeEW / CouncilTaxBandSchemeScotland / CurrentEnergyRatingScheme) cite gov.uk / saa.gov.uk / DESNZ URLs | Inspected emitted file lines 61, 71, 81; URLs match worker registry constants `_GOV_UK_COUNCIL_TAX_BANDS`, `_SAA_COUNCIL_TAX_BANDS`, `_DESNZ_EPC_BANDS` in `vocabularies.py:145-153` | PASS |
| 2 external-spec schemes (AssuranceLevel → eIDAS; EvidenceMethod → OIDC4IDA) cite stable spec URLs | Verified | PASS |

### A9 per-kind discipline (UFO category + scopeNote + dct:source per scheme)

SPARQL: `SELECT ?s ?missing WHERE { ?s a skos:ConceptScheme . OPTIONAL { ?s opda:ufoCategory ?cat } OPTIONAL { ?s skos:scopeNote ?note } OPTIONAL { ?s dct:source ?src } BIND(...) FILTER(?missing != '') }` → **empty result; 16/16 PASS**.

Additionally verified the **full 7-field per-scheme MUST-have discipline** from ADR-0010 §"Per-scheme metadata MUST-haves":

| Field | Cardinality verified | Verdict |
|---|---|---|
| `skos:prefLabel @en` | exactly 1 per scheme | PASS |
| `dct:title @en` | exactly 1 per scheme | PASS |
| `skos:definition @en` | exactly 1 per scheme | PASS |
| `dct:source` | ≥1 per scheme (worker emitted single triple) | PASS |
| `opda:ufoCategory` | exactly 1 per scheme; all 16 values in seven-category vocabulary | PASS |
| `skos:scopeNote @en` | exactly 1 per scheme | PASS |
| `opda:hasSteward` | exactly 1 per scheme | PASS |

### Per-member cardinality (ODR-0011 §S14/§S15)

Independent rdflib walk over 88 members → all have exactly 1 `skos:prefLabel @en`, exactly 1 `skos:notation`, exactly 1 `skos:definition @en`. PASS.

### Modified Python files — `Realises:` doc-comment headers

| File | Sections cited | Verified | Verdict |
|---|---|---|---|
| `tools/opda-gen/src/opda_gen/__init__.py` | ADR-0010 (minor-bump rationale) | line 7-10 | PASS |
| `tools/opda-gen/src/opda_gen/emitters/vocabularies.py` | ADR-0010 §"Scheme catalogue" / §"Per-scheme MUST-haves" / §"Per-member MUST-haves" / §"Emission structure" / §"SHACL-AF rule emission"; ADR-0007 §"Deterministic emission rules" + §"A9"; ADR-0008 §"CLI design"; ODR-0004 §3a/§6a/§7a; ODR-0011 §1a/§S14/§S15/§4a/§5a/§7a/§8a | lines 4-54 — all sections exist in cited documents | PASS |
| `tools/opda-gen/src/opda_gen/emitters/foundation.py` | Header carries ADR-0009 backlinks (unchanged); `_VERSION_IRI` advancement comment notes ADR-0010 motivation | inline comments verified | PASS |
| `tools/opda-gen/src/opda_gen/cli.py` | Added ADR-0010 §Confirmation #1/#2 lines 17-23 | verified | PASS |
| `tools/opda-gen/src/opda_gen/ci/byte_identity.py` | Added ADR-0010 §Confirmation #2 line 15-16 | verified | PASS |
| `tools/opda-gen/src/opda_gen/serialiser/ordering.py` | ADR-0010 motivation comment for `skos:ConceptScheme` insertion before `skos:Concept` | verified at lines 21-23 | PASS |
| `tools/opda-gen/tests/test_byte_identity.py` | ADR-0010 §Confirmation #2 in module docstring | verified | PASS |
| `tools/opda-gen/tests/test_serialiser.py` | G7 follow-up docstrings | verified inline | PASS |
| `tools/opda-gen/tests/test_vocabularies.py` (NEW) | All 6 Confirmation criteria + ODR-0011 §1a/§S14/§S15 | lines 4-18 | PASS |

**Soundness verdict: 16+8+13 = 37 PASS items.** Every emitted scheme/member has `dct:source` resolving to a real source; every modified or new Python file declares its ADR/ODR provenance via `Realises:` header; every cited section was independently verified to exist. **One soundness concern surfaced** — see Additional Finding #1 (TransactionStatus member URI fabrication).

## Completeness check

### ADR-0010 §Confirmation criteria (six ADR-specific + four programme-wide)

| # | Criterion | Verification (independent re-run) | Verdict |
|---|---|---|---|
| 1 | Emission lands at canonical path | `opda-gen emit-vocabularies` → 879 LOC at `source/03-standards/ontology/opda-vocabularies.ttl` | PASS |
| 2 | Byte-identity CI green | `opda-gen ci-byte-identity` → `PASS`; independent `emit-vocabularies --output /tmp/adr10-revalidate` + `diff` → no output; independent `emit --output /tmp/adr10-full-revalidate` (full corpus) + `diff -rq --exclude=exemplars` → no output | PASS |
| 3 | Three-graph CI green (no `sh:*` in vocabularies) | `opda-gen ci-three-graph` → `PASS (all 5 checks)`; `grep -c "^sh:\| sh:" opda-vocabularies.ttl` → 0; no `@prefix sh:` declaration | PASS |
| 4 | Every scheme carries `opda:ufoCategory` | ADR-named SPARQL run independently → 0 schemes missing | PASS |
| 5 | Every scheme + member carries `dct:source` | 16/16 schemes + 88/88 members verified | PASS |
| 6 | Cardinality discipline (1 prefLabel@en + 1 notation + 1 definition@en per member) | Test `test_member_label_cardinality` PASS; independent rdflib walk over 88 members confirms | PASS (test-asserted; SHACL shape deferred to ADR-0012 per honest deferral) |
| (a) | Soundness PASS | See Soundness section | PASS (with one Additional Finding) |
| (b) | Completeness PASS | See this section | PASS (with named deferrals) |
| (c) | Cross-ADR consistency PASS | See Cross-ADR section | PASS |
| (d) | Validation report committed | This file | PASS |

### ODR-0011 cited subsections — Rules + Operational specifications

| Subsection | Realisation status | Verification | Verdict |
|---|---|---|---|
| §Rules.1 — each enum is a `skos:ConceptScheme` + steward declaration | REALISED | 16 schemes emitted; all carry `opda:hasSteward` | PASS |
| §Rules.2 — labels/definitions from glossary verbatim where present | PARTIAL — REALISED with documented limitation | The 2026-05-14 business glossary (54 trust-framework terms) doesn't contain per-enum-member entries; worker emitted short authored definitions citing data-dict leaves. Independently verified: business glossary has no `pdtf:freehold` / `pdtf:detached` / etc. entries. When glossary extends (G9 follow-up), regenerate. | PASS-with-named-deferral (no silent gap; glossary extension is the trigger) |
| §Rules.3 — every concept carries `dct:source` | REALISED | 88/88 verified | PASS |
| §Rules.4 — hierarchical enums use `skos:broader/narrower` | DEFERRED-N/A | First-batch schemes are all flat (no broader/narrower hierarchy). Trigger: future broadband `typeOfConnection` / `transportType` admission. Worker explicitly named this in implementation report §5. | PASS-with-trigger |
| §Rules.5 — closed/open-ended flagged per scheme | DEFERRED to ADR-0012 | Closed/open flag drives SHACL `sh:in`; lives in shapes file (three-graph separation). Worker explicitly flagged. | PASS-with-trigger |
| §Rules.6 — `opda:` single hash namespace | REALISED | All scheme + member URIs under `https://w3id.org/opda/#` | PASS |
| §Rules.7 — external schemes via `skos:exactMatch` | DEFERRED to Phase-3.5 audit per ADR-0010 §"More Information" | No first-batch member emits `skos:exactMatch`; admission case-by-case per Author-only mini-session | PASS-with-trigger |
| §Rules.8 — domain ownership (provenance owned by ODR-0009; governance by ODR-0012) | REALISED via steward declarations | Each scheme has `opda:hasSteward`; provenance schemes (Assurance/Evidence) → Moreau (S009 Q3); legal/role schemes → Guizzardi/Kendall; property → Allemang; regulator-cited → Baker | PASS |
| §Rules.9 — one register, three consumers | REALISED for consumer 1 (SKOS register); SHACL `sh:in` deferred to ADR-0012; DASH editor deferred to ADR-0013 | Worker explicitly named the trigger | PASS-with-trigger |
| §1a — every enum + steward declaration | REALISED | 16 schemes; `opda:hasSteward` Literal on each. SHACL `ConceptInExactlyOnePrimarySchemeShape` (Cagle amendment) **DEFERRED to ADR-0012** (would violate three-graph separation if emitted here) — worker explicitly named the trigger | PASS-with-trigger |
| §2a — cardinality per SKOS §S14/§S15 + Pandit PII-strict amendment | REALISED in code; SHACL shape deferred to ADR-0012 | The in-code builders emit exactly 1 prefLabel/notation/definition; tests enforce. PII-severity differentiation (`sh:Violation` for PII; `sh:Warning` for non-PII) lands in ADR-0012. | PASS-with-trigger |
| §4a — definition source verbatim regulator-citation | PARTIAL — REALISED for scheme-level `dct:source`; verbatim definition text not yet inlined | Schemes carry regulator URL; the `skos:definition @en` text is short ADR-authored summaries citing the regulator, not verbatim regulator text. Worker explicitly named this in §5 of implementation report and queued for the DPV-PD-inherited schemes work (G9). | PASS-with-deferral |
| §5a — three-case lifecycle + Cagle SHACL-AF deprecation rule | DEFERRED to ADR-0012 | No first-batch member is deprecated; rule body held as `_DEPRECATION_CHAIN_RULE_SPARQL` constant in `vocabularies.py:113-128` with TODO(ADR-0012) comment. Three-graph separation correctly preserved (rule emits into shapes file, not classes/substrate). | PASS-with-trigger |
| §7a — notation typing `xsd:string` + `sh:pattern` default | REALISED (notation half); `sh:pattern` DEFERRED to ADR-0012 | All `skos:notation` literals are plain (no `^^xsd:string` printed per ADR-0007 #5); `sh:pattern` constraint is shapes-side | PASS-with-trigger |
| §8a — UFO meta-category per scheme (seven-category framework) | REALISED | Every scheme carries `opda:ufoCategory` Literal in the closed seven-category vocabulary; test `test_ufo_category_value_is_in_seven_category_framework` enforces. UFO + DOLCE citations land in `skos:scopeNote @en`. Dual `dct:source` (Q8 condition (b)) — see independent assessment in §"Worker's 4 ambiguities" below. | PASS-with-engineering-decision |

### Explicit deferrals (named with downstream trigger)

| Deferred subsection | Trigger ADR |
|---|---|
| Cagle SHACL deprecation rule materialisation | ADR-0012 |
| `sh:in` closed-scheme constraint | ADR-0012 |
| Pandit PII-strict `sh:Violation` differentiation | ADR-0012 |
| DASH `dash:EnumSelectEditor` | ADR-0013 |
| `skos:broader/narrower` for hierarchical enums | future (broadband/transport scheme admission) |
| `skos:exactMatch` cross-vocab mapping | Phase-3.5 audit |
| Glossary-verbatim definition text | G9 (data-dictionary refresh) |
| 4 PLACEHOLDER schemes populated from dictionary | G9 |
| Scope expansion beyond first batch | G8 |

**Completeness verdict: 16 cited subsections all addressed; 9 named-trigger deferrals; 0 silent gaps.**

## Cross-ADR consistency check

For each downstream ADR whose `depends-on:` cites ADR-0010, verify the emission supports the downstream's confirmation criteria.

| Downstream ADR | What it needs | Verification | Verdict |
|---|---|---|---|
| ADR-0011 (Module TBox emission) | Module SHACL constraints can cite `opda:builtForm/Detached` etc. via `sh:in (opda:builtForm/Detached opda:builtForm/Semi-detached ...)` | Independently verified: each of 88 members is a stable URI under `https://w3id.org/opda/#<slug_base>/<slug>` and is typed `skos:Concept`. Member URI patterns are RFC-3986-clean (apostrophes percent-encoded; whitespace → hyphen via `_slugify_for_uri`). ADR-0011 modules can cite by URIRef. | PASS |
| ADR-0011 — modules can also `owl:imports` vocabularies file alongside foundation | Independently parsed all 5 TTLs (foundation, classes, shapes, annotations, vocabularies) + 15 exemplars via rdflib → 15/15 parse PASS; total 681 triples after merge; no "undefined class" errors | PASS |
| ADR-0012 (SHACL shapes + DPV annotations) | Deprecation-chain SHACL-AF rule body needs to materialise into `opda-shapes.ttl` from this point forward, citing `skos:Concept` + `skos:inScheme` + `dct:isReplacedBy` | Rule body verified at `vocabularies.py:113-128` with TODO(ADR-0012) handoff marker. `skos:Concept` typing is on all 88 members so SHACL-AF targeting will work; `skos:inScheme` triples present for traversal | PASS |
| ADR-0012 — Cagle's `ConceptInExactlyOnePrimarySchemeShape` (per ODR-0011 §1a) | All 88 members have exactly 1 `skos:inScheme` (independently verified above) — the SHACL invariant will validate green on this corpus | PASS |
| ADR-0013 (Overlay profiles) | BASPI5 / TA6 / NTS subset constraints can cite `sh:in` over scheme subsets; member URIs are stable identifiers | Stable URIs verified; subset extraction is mechanical | PASS |
| ADR-0014 (BASPI5 round-trip MVP) | Harness can load `opda-vocabularies.ttl` alongside foundation + classes via rdflib | rdflib parse succeeds on all 5 source files; 15/15 exemplars parse cleanly against foundation+classes+vocabularies | PASS |

### Additional probes

| Probe | Result | Verdict |
|---|---|---|
| Determinism across two runs of `emit-vocabularies` | byte-identical | PASS |
| Determinism across `emit` (full corpus, 5 TTLs) | byte-identical | PASS |
| Foundation version-IRI bump (0.1.0 → 0.2.0) consistent across all 5 TTLs | `foundation.ttl` `owl:versionIRI <https://w3id.org/opda/0.2.0/>` + `owl:versionInfo "0.2.0 — foundation + SKOS vocabularies (ADR-0009 + ADR-0010)"` + `opda:generatorVersion "opda-gen-0.2.0"`; `opda-shapes.ttl` + `opda-annotations.ttl` `opda:targetsClassGraph <https://w3id.org/opda/0.2.0/>`; opda-classes.ttl regenerated; `opda-gen --version` → 0.2.0 | PASS |
| Sentinel-pinned `# Source commit: pinned-by-ADR-0010` | matches G6 ADR-0009 convention; advances per substrate-mutating ADR | PASS |
| Test count non-regression | ADR-0009: 34; ADR-0010: 51 (= 34 + 15 vocabularies + 2 G7). Independently re-ran `pytest -v`: `51 passed in 0.39s` | PASS |
| Test coverage non-triviality | All 15 vocabulary tests exercise real invariants (counts; type triples; per-scheme MUST-haves; per-member cardinality; URI stability; dangling-reference detection). Read every test; no smoke tests; no always-true patterns. | PASS |
| Spot-check 3 schemes against data dictionary | BuiltForm (5 members) exactly matches data-dict enum; CouncilTaxBand (split E&W A-H / Scotland A-I) is worker-derived from regulator authority not data-dict (data-dict has a single 11-value list including 'Not banded'); CurrentEnergyRating documented exclusion of status markers verified. | PASS (mapping faithful — but see §"Worker's 4 ambiguities" #1 + §"Additional Findings" #1 + #2) |
| Generator-comment header is invariant across runs | Sentinel constants `_VOCABULARIES_SOURCE_COMMIT` + `_VOCABULARIES_LAST_MODIFIED` pin both; same approach as ADR-0009 (independently validated under G6) | PASS |

**Cross-ADR consistency verdict: 6/6 downstream ADRs supported + 8/8 additional probes PASS.**

## Independent assessment of worker's 4 surfaced ambiguities

The worker resolved four ambiguities inline as within-engineering. For each, I form an independent view: is this genuinely within ADR-0010's ratified rules, or does it surface `## Rules` ambiguity that should route to a Council Author-only amendment per programme plan §9.4?

### 1. TransactionStatusScheme 5-phase canonical vs. 9-value data-dict enum

**Worker's resolution:** emit ADR-0010 §"Scheme catalogue"-named 5-phase set (Listed, Offered, Accepted, Exchanged, Completed); note the 9-value broader set in `skos:scopeNote`.

**Independent assessment:** **within-engineering OK, with caveat.** The ADR-0010 §"Scheme catalogue" table explicitly names the 5 members — that's unambiguous engineering input. The 9-value data-dictionary enum mixes UFO categories (Phases + cancellation State + marketing Mode) and would need Council deliberation to admit cleanly as one SKOS scheme. The 5-phase canonical set IS the UFO Phase label structure for the sale lifecycle.

**Caveat I flag:** the worker's renaming of the data-dict values to UFO-aligned labels creates a soundness issue with the per-member `dct:source` URIs (see Additional Finding #1 below — G10 queued). The Council-routing decision (5-phase canonical vs. dual scheme) is right; the implementation of dct:source citations needs follow-up.

**Verdict: within-engineering OK (the scheme membership decision); NEW follow-up G10 needed (the implementation of per-member dct:source).**

### 2. Dual `dct:source` for ODR-0011 §8a Gandon Q8 condition (b)

**Worker's resolution:** emit one `dct:source` per scheme (the ratifying ODR section URL OR the regulator URL); fold UFO/DOLCE upstream citations into the `skos:scopeNote @en` Literal text.

**Independent assessment:** **within-engineering OK.** ODR-0011 §8a says "dual `dct:source` (Q8 withdrawal condition (b) — upstream UFO + ODR-0011 SKOS-binding)". The worker's reading is defensible:

1. The OPDA registry does not yet have stable W3ID-resolvable IRIs for the Guizzardi 2005 chapter / Masolo D18 PDF — minting them is separate work.
2. Multi-object `dct:source` is allowed by rdflib + canonical serialiser, by SPARQL, and by SHACL (no cardinality declared in ODR-0011 §8a).
3. The UFO + DOLCE citations land verbatim in `skos:scopeNote @en` Literals — the information is captured, just not as a second triple.

If the OPDA Council wants strict dual-triple discipline, the registry can grow a second `dct:source` URIRef per scheme without touching `## Rules` semantics. The §8a text says "dual `dct:source`" but the operational form (two triples vs one triple + scope-note narrative carrying the upstream citation) is engineering's call as long as the upstream UFO/DOLCE citation is recoverable.

**Verdict: within-engineering OK** (with a soft recommendation: once stable IRIs for Guizzardi 2005 + Masolo D18 are minted, regenerate to add the second triple per scheme; queue as a future opportunistic cleanup, NOT a blocker).

### 3. OwnershipTypeScheme NTS2 4-value vs. overlay extensions

**Worker's resolution:** Freehold / Leasehold / Commonhold / Other (NTS2 canonical 4-set); 'Managed Freehold' from pdtf-transaction excluded as overlay extension.

**Independent assessment:** **within-engineering OK.** The ADR-0010 §"Scheme catalogue" table explicitly names "Freehold, Leasehold, Commonhold, Other" — the four-set is the named target. The exclusion of 'Managed Freehold' (a pdtf-transaction overlay value) is documented in the `skos:scopeNote` ("NTS2 four-value canonical set used as authority (per data dictionary)") — visible to downstream consumers.

Future overlay-specific extensions (Managed Freehold, possibly others from regional schemes) can land via per-overlay profile shapes at ADR-0013 without needing the foundation scheme to enumerate them. The boundary "foundation scheme = canonical; overlay extends" is a defensible engineering principle that the ADR text supports (§"Scheme catalogue" names canonical sets, not maximal sets).

**Verdict: within-engineering OK.**

### 4. CurrentEnergyRatingScheme A–G only vs. status markers

**Worker's resolution:** emit A–G only (7 members); excluded 'Exempt Property', 'Survey Instructed', 'No Certificate' as separate-scheme candidates.

**Independent assessment:** **within-engineering OK.** Same principle as #3. The ADR-0010 §"Scheme catalogue" names "A, B, C, D, E, F, G" — unambiguous engineering target. The excluded status markers ARE genuinely different in kind: A–G are band values in a Quality Region (the UFO Quale-in-Region category the scheme commits to); 'Exempt Property' / 'Survey Instructed' / 'No Certificate' are status markers indicating absence-of-rating, not rating values. Mixing them would violate the UFO Quale-in-Region commitment for the scheme.

Future `EnergyRatingStatusScheme` admission (when needed) would be a separate Quality Value scheme, properly typed. The worker correctly flagged in §"Surfaced ambiguity" as within-engineering.

**Verdict: within-engineering OK.**

**Summary of 4 ambiguities:** all four are within-engineering. **No Council Author-only amendment needed.**

## G7 closure verification

**Status: VERIFIED CLOSED.** G7 was queued by the ADR-0009 validation report against the named trigger "first `rdfs:comment` containing a URL is emitted as a Literal" (expected at ADR-0011). The ADR-0010 worker closed it earlier than expected because ADR-0010 schemes carry gov.uk URLs inside `skos:scopeNote @en` Literals — exactly the surface G7 named.

Independent verification of the two new tests at `tools/opda-gen/tests/test_serialiser.py`:

| Test | Scenario | Assertion | Non-triviality |
|---|---|---|---|
| `test_literal_url_inside_scope_note_does_not_bind_new_prefix` | `skos:scopeNote @en` Literal containing a gov.uk URL embedded in sentence prose | No `@prefix gov.uk:` line emitted; `@prefix opda:` IS emitted (scheme IRI references opda namespace) | Exercises real Cagle G2 contract: the Literal-scan widens the reference set but never the binding set. Real negative test. |
| `test_literal_url_lexical_value_does_not_bind_unbound_namespace` | `dct:source` Literal whose lexical value IS exactly a gov.uk URL (no surrounding prose) | Same assertion (no gov.uk prefix invented; opda prefix preserved) | Most aggressive case; covers the literal-as-IRI shape | Real negative test |

Both tests use a fresh `Graph()` fixture, explicit `bind("opda", OPDA)` + `bind("skos", SKOS)`, then assert `@prefix gov.uk` does not appear in the canonical Turtle output. The contract these tests cement (only-already-bound-prefixes-eligible-for-retention) is the right invariant.

ADR-0005 §G G7 row is correctly marked "Closed 2026-05-27 (ADR-0010 implementation)" with worker rationale recorded. **G7 closure: VERIFIED.**

**G7 edge cases I checked that the worker's two tests cover:** the gov.uk URLs ARE present in 3 emitted scopeNotes (CouncilTaxBandSchemeEW line 63; CouncilTaxBandSchemeScotland line 73; CurrentEnergyRatingScheme line 83); independent `grep "@prefix" opda-vocabularies.ttl` returns only `dct`, `opda`, `rdf`, `skos` — no spurious gov.uk binding. The G7 contract holds on the real emitted corpus.

## Additional findings

### Finding 1 — TransactionStatus member `dct:source` URIs are fabricated, not real data-dict citations (Soundness concern → G10)

**Description.** The worker emits TransactionStatus members `Listed / Offered / Accepted / Exchanged / Completed` with per-member `dct:source` URIs like `<https://w3id.org/opda/data-dictionary#status.Listed>`, `<...#status.Offered>`, etc.

**Evidence.** Independent inspection of `source/00-deliverables/semantic-models/data-dictionary-canonical.json` for `path == "status"`:

```
enum=['active', 'For sale', 'Under offer', 'Sold subject to contract',
       'Contracts exchanged', 'Completed', 'Cancelled', 'To let', 'Let agreed']
```

The strings `Listed`, `Offered`, `Accepted`, `Exchanged` do NOT appear in this enum. The emitted `dct:source` URI `<...#status.Listed>` therefore points at a fragment that has no corresponding data-dictionary entry — the URI is a fabricated reference.

**Why this matters.** ODR-0011 §Rules.3 says "every concept carries `dct:source` to its origin — the business-glossary row where one exists, otherwise the canonical schema leaf path". The current TransactionStatus per-member URIs do neither. They point at a hypothetical data-dictionary entry that does not exist. When (and if) the data-dictionary URL space becomes dereferenceable, these fragments will 404 — silent soundness drift.

**Comparison.** Other schemes' per-member dct:source URIs cite leaves that DO exist verbatim — e.g. `participants[].role.Buyer` IS in the role enum; `propertyPack.buildInformation.building.builtForm.Detached` IS in the BuiltForm enum. The TransactionStatus URI fragments are the only fabricated set.

**Worker's defence.** The implementation report §8.1 documents the renaming choice for scheme membership but does NOT separately address the dct:source URI fabrication. The 5-phase canonical set was selected as the UFO Phase label structure (within-engineering OK per Ambiguity #1 above), but the worker did not adjust the dct:source citation strategy to match — the URIs still claim a data-dictionary origin that doesn't exist.

**Remediation options.**

- **(a)** Switch TransactionStatus per-member `dct:source` to cite ODR-0011 §8a (or a §"Surfaced ambiguity"-specific anchor in the implementation report) rather than fabricate data-dictionary fragments. Aligned with the worker's own "the broader 9-value enum mixes UFO categories...would need Council deliberation" framing.
- **(b)** Cite the actual data-dict enum values they're sourced from (e.g. `Listed ← 'For sale'`; `Offered ← 'Under offer'`; `Accepted ← 'Sold subject to contract'`; `Exchanged ← 'Contracts exchanged'`; `Completed ← 'Completed'`) via dct:source citing the data-dict leaf + the original enum value, with the `skos:notation` value remaining the UFO-aligned canonical label.
- **(c)** Mint a new IRI namespace `<https://w3id.org/opda/transaction-status#Listed>` etc. for the UFO-canonical 5-set, distinct from the data-dictionary URL space.

**Verdict.** This is a **PASS-WITH-FOLLOW-UP** item, not a blocker — the implementation is operationally correct in every other respect, and the fabricated URIs do not currently resolve anywhere (the data-dictionary URL space is also a stable identifier rather than a dereferenceable URL). But the fragment fabrication should be addressed before the data-dictionary URL space becomes dereferenceable (i.e. before any consumer URI-deref operation depends on these citations resolving).

**Queue as: G10 in ADR-0005 §G.** Trigger: opportunistic, before ADR-0014 BASPI5 round-trip (because BASPI5 needs full `dct:source` traceability).

### Finding 2 — CouncilTaxBand regional split (E&W vs Scotland) is worker-derived, not data-dict-backed

**Description.** The data-dictionary `propertyPack.councilTax.councilTaxBand` enum is a single 11-value list `['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'Not banded']`. The worker emitted two schemes: `CouncilTaxBandSchemeEW` (A–H, 8 members) + `CouncilTaxBandSchemeScotland` (A–I, 9 members), citing different regulator URLs (gov.uk for VOA, saa.gov.uk for SAA).

**Independent assessment.** This is defensible per ODR-0011 §4a regulator-cited verbatim discipline — VOA and SAA are different regulators governing different regional schemes. ADR-0010 §"Scheme catalogue" explicitly names "A-H (E&W); separate Scottish scheme A-I" so the dual-scheme decision is in-scope engineering.

But the worker's choice creates a small documentation asymmetry: the regional separation is enforced by scheme-level regulator citation (`dct:source` differs), not by data-dict structure. The CouncilTaxBandSchemeEW excludes 'Not banded' (the data-dict's 11th value) without scope-note documentation. The Scotland scheme excludes 'Not banded' too.

**Verdict.** Not a blocker; documented in scope-note ("Verbatim source: VOA council-tax bands published at...") — the regulator citation IS the structural authority. Recommend a future cosmetic addition to scope-notes noting "data-dict 'Not banded' value omitted as it is a status marker, not a band". Could fold into G8 (scope expansion follow-up) without standalone queue.

### Finding 3 — `opda:hasSteward` predicate is OPDA-minted and never defined in foundation

**Description.** Every emitted scheme carries `opda:hasSteward "Allemang (...)" @en` etc., but `opda:hasSteward` is not defined as an OWL property in `opda-classes.ttl` (foundation), nor in vocabularies. It appears only as a predicate in `opda-vocabularies.ttl` triples.

**Independent assessment.** ODR-0011 §1a says schemes declare their steward via `dct:creator`/`dct:publisher` (Baker DCMI Usage Board discipline). The worker introduced `opda:hasSteward` as a custom predicate — defensible because the steward attribution is a richer concept than `dct:creator` (S008 Q2 module-owner-proposes per ODR-0011 §1a). But it's not declared anywhere as an `owl:AnnotationProperty` or `owl:DatatypeProperty`. Standards-conformant ontologies usually declare custom predicates.

**Verdict.** Non-blocker; ADR-0011 (module TBox emission) will be the natural place to introduce `opda:hasSteward` as an `owl:AnnotationProperty` in `opda-classes.ttl`. Recommend the ADR-0011 worker add the declaration when defining other OPDA properties.

### Finding 4 — Worker's PLACEHOLDER discipline is honourable and well-documented

**Description.** 4 schemes (MilestoneKind, AssuranceLevel, EvidenceMethod, AddressVariant) carry `PLACEHOLDER:` warnings in their `skos:scopeNote @en` because no data-dictionary enum exists yet. Independently verified:

- All 4 schemes still carry full ODR-0011 §8a metadata: `opda:ufoCategory` (Method/plan code OR Quality Value), `dct:source` (external spec URL — PDTF process IRI for Milestone; eIDAS Article 8 for Assurance; OIDC4IDA for Evidence; ODR-0015 §S015 Q1 for AddressVariant).
- `PLACEHOLDER:` text is unambiguous; the scope-note also documents the trigger ("the data dictionary does not yet carry an enum for X").
- G9 follow-up is correctly queued at ADR-0005 §G with the trigger named (next dictionary refresh cycle).

**Verdict.** PLACEHOLDER discipline is operationally correct. The 4 schemes ARE ratification-compliant per ODR-0011 §8a even though the data-dict backing is pending. Recommend no action; G9 is the right trigger.

### Finding 5 — Foundation version-IRI bump 0.1.0 → 0.2.0 is consistent and well-rationalised

**Description.** Worker bumped opda-gen 0.1.0 → 0.2.0 in `__init__.py`, foundation `owl:versionIRI`, `owl:versionInfo`, `opda:generatorVersion`, opda-shapes/annotations `opda:targetsClassGraph`, and the generator-comment header. The G6 pinning sentinel `_FOUNDATION_LAST_MODIFIED` advances to track the substrate addition.

**Independent assessment.** The bump is consistent across all artefacts:

```
foundation.ttl owl:versionIRI -> <https://w3id.org/opda/0.2.0/>
opda-shapes.ttl opda:targetsClassGraph -> <https://w3id.org/opda/0.2.0/>
opda-annotations.ttl opda:targetsClassGraph -> <https://w3id.org/opda/0.2.0/>
opda-gen --version -> 0.2.0 (75337ec)
```

The G6 pinning convention (per ADR-0009 validation §"Pinned `Source commit:` sentinel") explicitly tolerates this: "advances when a future ADR materially mutates foundation content". The SKOS substrate addition is exactly that material mutation; ADR-0010 is correctly bumping per the pattern ADR-0009 established.

**Verdict.** Non-finding (correctly implemented). Flagging only because this is the first downstream consumer of the G6 convention — the pattern works as designed.

### Finding 6 — `opda:hasSteward` value space is unconstrained

**Description.** The worker emits `opda:hasSteward` Literals like `"Allemang (property-qualities sub-module steward per S008 Q2)"@en`, `"Guizzardi (S007 Q3)"@en`, etc. — the steward is named in human-prose with optional parenthetical session ID.

**Independent assessment.** ODR-0011 §1a names steward as a Council expert (Allemang, Baker, Cagle, Gandon, Guizzardi, Kendall, Knublauch, Moreau, Pandit). The worker's Literal values include the expert name as the first word; downstream consumers (e.g. routing notification of scheme amendments to the steward) could parse by splitting on space. But there's no machine-readable enforcement.

**Verdict.** Acceptable for first-batch substrate; no action needed. If a downstream consumer requires structured steward identification, a future opda:Steward OWL class with `opda:hasSteward` as an ObjectProperty could land at ADR-0011 — out of scope here.

## Verdict

**PASS-WITH-FOLLOW-UPS**

ADR-0010 honourably realises every implementation criterion in scope. The 16 SKOS Concept Schemes (88 members, 656 triples, 879 LOC) emit cleanly to canonical paths; byte-identity CI is GREEN across the full 5-file corpus; three-graph CI is GREEN (all 5 checks); 51/51 tests pass (34 baseline + 17 new); rdflib parses all 5 source files + 15 exemplars cleanly. Foundation version-IRI bump 0.1.0 → 0.2.0 is consistent and well-rationalised per the G6 convention established in ADR-0009. G7 (URL-bearing Literal prefix-filter regression) is correctly closed with two non-trivial negative tests.

Every cited ODR-0011 `## Rules` and `## Operational specifications` subsection is either realised by an emitted artefact (10/16) or explicitly deferred with a named downstream-ADR trigger (6/16) — no silent gaps. The worker's 4 surfaced ambiguities (TransactionStatus 5-phase canonical; dual dct:source; OwnershipType NTS2; CurrentEnergyRating A-G) are all genuinely within-engineering — no Council Author-only amendment needed.

**Recommendation:** ADR-0010 status moves `proposed → accepted` subject to G10 being explicitly named-and-queued.

### Named follow-ups

1. **G7 (CLOSED 2026-05-27 by ADR-0010)** — VERIFIED.
2. **G8 (NEW from ADR-0010) — ADR-0010 scope expansion** — already queued by worker at ADR-0005 §G G8. Open, opportunistic.
3. **G9 (NEW from ADR-0010) — PLACEHOLDER schemes await dictionary refresh** — already queued by worker at ADR-0005 §G G9. Open, opportunistic.
4. **G10 (NEW from validator) — TransactionStatus per-member `dct:source` URI fabrication audit.** The five TransactionStatus members emit `dct:source` URIs like `<...data-dictionary#status.Listed>` that reference fragments not present in the actual data-dictionary `status` enum (data-dict has `For sale`/`Under offer`/`Sold subject to contract`/etc.). When the data-dictionary URL space becomes dereferenceable, these URIs will 404. Three remediation options listed in Finding #1 above. **Queue against the ADR-0014 BASPI5 round-trip trigger** (because BASPI5 needs full `dct:source` traceability — the fabricated URIs surface there).

### Acceptance criteria post-follow-up

ADR-0010 moves to `status: accepted` once:

- G7 is marked closed at ADR-0005 §G (already done by worker).
- G8, G9 entries at ADR-0005 §G are already queued (worker landed the rows).
- G10 (NEW from this validation) is queued at ADR-0005 §G.

The implementation itself does not require further changes for acceptance. The fabricated TransactionStatus URIs are a soundness drift risk that needs addressing **before ADR-0014** but **not before ADR-0011** (module TBox emission can reference TransactionStatus members by `<https://w3id.org/opda/#transactionStatus/Listed>` etc. — the member URIs themselves are stable identifiers, independent of the dct:source URIs).

## References

- [ADR-0010 — SKOS vocabulary emission](../ADR-0010-skos-vocabulary-emission.md)
- [ADR-0009 — Foundation TTL emission](../ADR-0009-foundation-ttl-emission.md) (predecessor)
- [ADR-0008 — Generator implementation infrastructure](../ADR-0008-generator-implementation-infrastructure.md)
- [ADR-0007 — Ontology generator specification](../ADR-0007-ontology-generator-specification.md)
- [ODR-0011 — Enumeration Vocabularies](../../ontology/odr/ODR-0011-enumeration-vocabularies.md) (substrate; §1a/§4a/§5a/§7a/§8a)
- [ODR-0004 — PDTF ontology foundation](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) (§3a + §6a + §7a)
- [ADR-0005 — Deferred work register §G](../ADR-0005-deferred-work-register.md)
- [Programme plan §9 — Validation discipline](../../plan/ontology-implementation.md)
- [ADR-0008 validation report](./ADR-0008-validation-report.md) (G1/G2/G3/G4/G5 origin)
- [ADR-0009 validation report](./ADR-0009-validation-report.md) (G6/G7 origin)
- [ADR-0010 implementation report](../implementation-reports/ADR-0010-implementation.md) (worker's self-report)
- Worker commit: `75337ecbd8f8da75823f9aad6b173d3259f05381`
