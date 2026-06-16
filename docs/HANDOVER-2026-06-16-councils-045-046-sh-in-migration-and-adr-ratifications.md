# Handover — Councils 045/046, the coded `sh:in` → concept-IRI migration, ODR/ADR ratifications + ADR-0046 OntoClean gate (2026-06-16, session 2)

> Second session of 2026-06-16. Follows `HANDOVER-2026-06-16-graph-engine-bakeoff-and-ontology-web-deploys.md` (which ended at `origin/main = 22c7bf2`). This session took `main` from `22c7bf2` → **`282fe45`** (10 commits), **all pushed + live on AWS**.

## TL;DR

Started from three observations about `/ontology/graph` + `/ontology/classes` (too many unconnected nodes; too few entities; the graph conflates domain-model / SHACL / SKOS / gUFO). That cascaded into: a graph-viz redesign, two extractor bug-fixes, two Councils (045, 046), the **big one** — the Council-046 Q3b migration of **32 coded properties from string-literal `sh:in` to concept-IRI `sh:in`** (retyped `owl:DatatypeProperty`→`owl:ObjectProperty`) — then a full **audit of all 32 ODRs + 47 ADRs**, **ratification of 4 proposed docs**, and the **implementation of ADR-0046** (OntoClean meta-property markup + a TBox CI gate). Everything is committed, gated, pushed, deploying.

## What shipped — PUSHED + LIVE (`origin/main = 282fe45`)

Ten commits, oldest→newest:

| Commit | What |
|---|---|
| `899b7df` | Graph facets are a **filter**, nodes coloured by **type** (not facet) — kills the colour noise |
| `334e00d` | Hide **edgeless external** targets under facet filtering |
| `2a1f774` | Extractor fix: recover `skos:topConceptOf` + `usesSchemes` via the `sh:in`-IRI→`skos:inScheme` join |
| `9417a40` | Council records **session-045** (graph observations) + **session-046** (currency/peril range + scheme binding) |
| `195e3b8` | **Item A** — graph `opda:layer` facet (owl/skos/external) + derived `constrainedByScheme` bridge edge (045 Q1/Q3) |
| `82f8514` | **Item B** — assert `opda:mediates`/`opda:founds` on the Relator spine (045 Q2) |
| `6781745` | **Item C** — migrate 19 coded properties' `sh:in` from string literals to concept IRIs (046 Q3b) |
| `001e072` | Item C cont. — migrate `opda:roleNotation` (the renamed `opda:role`) too |
| `ab7ef1b` | Ratify **ADR-0039 / ADR-0041 / ADR-0042** (operator) → `accepted` |
| `282fe45` | Ratify + implement **ADR-0046** (OntoClean markup + TBox gate) |

## Detail — the big one: Council-046 Q3b coded `sh:in` → concept-IRI migration (`6781745` + `001e072`)

**What changed.** Coded value-space properties emitted `sh:datatype xsd:string` + `sh:in ("Freehold" …)` — bare strings, ambiguous across schemes (`"Other"` ∈ 8 schemes, `"Yes"/"No"` ∈ 6). They now emit `sh:nodeKind sh:IRI` + `sh:in (<…/scheme/tenureKind/Freehold> …)` — scheme-qualified concept IRIs that join via `skos:inScheme` exactly like `opda:currency`/`opda:peril` always did. Non-injectivity killed.

**The decisive modelling call (operator-ratified).** The holdouts were `owl:DatatypeProperty rdfs:range xsd:string`, NOT `ObjectProperty` like currency/peril. A datatype property cannot coherently carry an IRI, so "regenerate like currency/peril" *required* retyping them to **`owl:ObjectProperty rdfs:range skos:Concept`** — which technically touches the OWL layer the council also said to "leave untouched." That contradiction was surfaced and the operator chose **retype** (the only coherent realisation). Total **32 properties** retyped (10 base coded + `hasAssertedCapacity` + 8 overlay scheme-value + 12 BASPI5 yes/no discriminators + `roleNotation`). **`opda:actionAlertRating` deliberately excluded** (it's an `xsd:integer` ordinal, not a coded concept). Corpus is now ~64 object / ~193 datatype properties / ~365 SHACL node shapes (was 32/225/331).

**Atomic base+overlay** (ODR-0010 — stacked `sh:in` is conjunctive; a mixed string/IRI pair empties the intersection). Generator version `1.0.0 → 1.0.1`.

**Instance layer:** the round-trip translator mints/recovers concept IRIs; the 2 baspi5 fixtures + **8 canonical exemplars** migrated string→IRI; expected-reports regenerated (deterministic); the exemplar-regression test aligned to validate `exemplar ∪ TBox` (so Jena's `sh:class skos:Concept` resolves referenced concept types). `/ontology` custom doc regenerated.

## Detail — ODR/ADR audit + ratifications (`ab7ef1b`, `282fe45`)

Audited all 32 ODRs + 47 ADRs. Result: the **entire ontology implementation programme is complete** (ADR-0005 register §G all closed; programme "RETIRED" 2026-05-28). Incompleteness was 5 `proposed` docs + the trigger-gated deferred-work register §A–F.

- **ADR-0039 / 0041 / 0042** → ratified `accepted` (`ab7ef1b`). 0041 (ontology reference-doc gen) + 0042 (/manual→/model) were already implemented; 0039 is strategic direction.
- **ADR-0046** → ratified + implemented (`282fe45`, below).
- **ODR-0016** (W3C VC/DID) → **deliberately left `proposed`**. Its own ratified disposition says it stays proposed until an activation trigger fires, and any future activation spawns a *fresh* ODR (ODR-0003 retirement), not a reactivation. Flipping it would contradict the council. **Do not "ratify" it.**

## Detail — ADR-0046 OntoClean markup + gate (`282fe45`)

Operator ratified the gate (session-042's precondition). Per-type `owl:AnnotationProperty` OntoClean tags (`opda:ontoCleanRigidity` + `ontoCleanIdentity`, + `ontoCleanDependence` on the Relator family) in `opda-annotations.ttl` over 8 scoped types; a TBox meta-shape (ODR-0031 R3 tag-guard — `sh:targetSubjectsOf`, never instance-keyed); an **8th** three-graph CI check; byte-identity re-pinned. **No `opda:ontoCleanUnity`.**

**A real bug was caught in verification** (see ⚠ below): the meta-shape as the implementer first emitted it checked `anti-rigid ⊑ rigid` — the *valid* `Student ⊑ Person` direction — not the OntoClean violation. Corrected to **`rigid ⊑ anti-rigid`** (an anti-rigid type cannot subsume a rigid one). Both empty against the corpus; the valid `anti-rigid⊑anti-rigid` edges (Buyer/Seller⊑RoleMixin, Proprietor⊑Role) are correctly *not* flagged.

## ⚠ Things a reader MUST know

1. **The `sh:in` migration is a breaking instance-data change.** Old string-valued instances (`opda:tenureKind "Freehold"`) are now non-conformant — coded values MUST be concept IRIs (`<…/scheme/tenureKind/Freehold>`). It shipped as a **patch bump (1.0.0→1.0.1)** by operator choice; arguably warrants a larger bump given the break. If you cut a release, weigh this.
2. **`make ci-ontology` is NOT the full CI surface.** Its pytest is `cd tools/opda-gen && pytest` — it does **not** run the repo-root `tests/baspi5_round_trip/` suite (incl. `test_exemplar_regression`), the **expected-report byte-identity gates** (`opda-gen emit-exemplar-reports` + `git diff` — in `ontology-byte-identity.yml` + `baspi5-round-trip.yml`), or **doc-drift**. To mirror GH CI locally run: `make ci` (adds doc + graph drift) **plus** `python3 -m pytest tests/baspi5_round_trip/ -q` **plus** a deterministic `emit-exemplar-reports`. (This session's C migration broke 8 exemplar-regression tests + the expected-report + doc gates that `make ci-ontology` alone showed green.)
3. **Agent "all gates green" must be semantically verified, not trusted.** Two implementer agents this session reported green while leaving real defects: the C agent missed the 8 exemplars + expected-reports + doc-drift and over-stated a `roleNotation` flip it never made; the ADR-0046 agent shipped a **backwards meta-shape**. Gates passed vacuously in both cases. Verify the *deliverable's semantics*, not just the gate colour.
4. **ADR-0046 `±I` tags are queryable but not gated.** The rigidity (`±R`) limb has its consuming meta-shape; the *IC-incompatible-subsumption* limb of change-3 is a noted follow-up. Baker's held dissent ("no decoration") technically eyes the `±I` tags until that gate lands.
5. **Always run gates with the venv on PATH:** `PATH="$PWD/tools/opda-gen/.venv/bin:$PATH" make …` (bare `make ci` dies `ModuleNotFoundError`).

## What's left / open

- **ADR-0046 `±I` IC-incompatibility gate-limb** — add the identity-subsumption check so `±I` tags have a consumer (returns empty on the current corpus; the OntoClean IC constraint needs care to encode correctly).
- **Deferred-work register §A–F (bucket 2)** — mostly gated on real-world triggers nobody can manufacture (C&R WG recruitment, member firms submitting VCs, ICO/EU-AI-Act guidance). **Engineering-fulfillable subset:** E1 (visual smoke-test script), E3 (DCAM attribution note in `governance.md`), B1/B2 (DAMA-Wheel per-page tagging), any trigger-cleared ODR-0023 item. The Wave-2 governance pages (data-quality / data-security / accreditation) are stubs that need *WG policy content* — drafting first-cut provisional content is possible but is domain/policy work, not engineering.
- **Held-dissent trigger sweep** — ~12 council sessions carry held-as-live dissents with named re-open triggers (all watches on future evidence; almost all correctly dormant). Offered but not done: audit each trigger against current data and flag any genuinely fired → reconvene a Reduced Council on that one question.
- **Operator's open choice** (last presented, unanswered): (a) the engineering-fulfillable deferred subset, (b) draft Wave-2 governance content, (c) the held-dissent sweep, (d) the ADR-0046 `±I` gate-limb — or any combination.

## Key pointers

- Council records: `docs/ontology/odr/council/session-045-*.md`, `session-046-*.md` (+ `working/session-04{5,6}/` transcripts incl. `EVIDENCE.md`).
- Deferred-work register (canonical): `docs/adr/ADR-0005-deferred-work-register.md` + mirror `/governance/deferred-work`.
- The `sh:in` migration surface: `tools/opda-gen/src/opda_gen/emitters/{shapes.py,profiles.py,modules/{descriptive,property,agent,claim}.py}`; the helper-mediated flip is `_add_enum_value_shape` (base) + `_scheme_members`/`_add_in_list`/`_scheme_member_uris_subset` (overlay) + the `_g11_scheme_valued` set (property.py) + `OBJECT_PROPERTIES` lists.
- ADR-0046: `emitters/ufo_categories.py` (tags), `emitters/shapes.py` (`build_ontoclean_tbox_meta_shape`), `ci/three_graph_test.py` (`check_ontoclean_tbox`, the 8th check).
- Exemplar validation architecture: `tests/baspi5_round_trip/conftest.py` + `test_exemplar_regression.py`; the emitter `emitters/exemplar_reports.py` (`_exemplar_data_with_tbox` merges TBox into the data graph — the test now mirrors this).

## Memory (cross-session)

Relevant auto-memories applied/reinforced this session: `[[invoke-skills-via-skill-tool]]` (load skills via the Skill tool, not by reading files), `[[dont-overstate-blockers]]` (verify a blocker against real repo state — but genuine external gates ARE real), `[[opda-make-ci-needs-venv-path]]`, `[[opda-classification-over-inheritance]]`, `[[opda-greenfield-no-wg-gate]]`. A new lesson worth recording: **`make ci-ontology` ≠ full GH CI, and agent "green" needs semantic verification** (the two missed-defect cases above).

## State

- `origin/main = 282fe45`; local `main` = `282fe45` (**ahead 0 — everything pushed**); tree clean.
- All gates green locally and on push: 8 three-graph checks, dup, profile, baspi5-roundtrip, exemplar regression (27 repo-root tests), byte-identity, doc-drift, graph-drift; `tools/opda-gen` pytest 359; JS remark 29.
- Ontology programme: retired. This session's work landed as council-shaped follow-ons (045/046) + ADR ratifications, per the post-retirement "fresh records" convention.
