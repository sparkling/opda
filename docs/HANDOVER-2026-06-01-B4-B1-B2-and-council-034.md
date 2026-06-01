# Handover — B4 + B1 + B2 shipped, via Council session-034 (2026-06-01)

**Author:** Henrik (with Claude). **Scope:** one session that implemented the three named plan work-items — **B4** (governance-emission fix), **B1** (overlay-profile leaf-enumeration rollout, both gaps), **B2** (BASPI5 MVP round-trip) — convening **Council session-034** to ratify B1's contested completion scope before building it. **Status: 8 commits on `main` (7 work-commits `b0fd662`…`a6ef5e1` + this handover), ALL local (NOT pushed); full gate suite green (6 CI gates + `ci-baspi5-roundtrip`); 337 pytest pass (opda-gen); byte-identity clean.**

> Continues [HANDOVER-2026-05-31-session-031-revert-and-councils-032-033.md](./HANDOVER-2026-05-31-session-031-revert-and-councils-032-033.md). That session ended with the plan register (§A–F) current and B3 re-index + B4 defect-fix flagged as cleanest next actions. This session did B4 + B1 + B2.

---

## TL;DR

The request was "follow the plan for B1, B2, B4 … implement everything, no shortcuts." **B4** (3 verified governance-emission defects) went straight to implementation. **B1** (enumerate the 30 thin overlay profiles) turned out to rest on **contested governance** — ADR-0029's "one-go full coverage" directive vs ODR-0021's "the overlay IS the form / YAGNI" — plus a partly-impossible sub-case (oc1/llc1 carry zero form-question refs). Rather than decide that unilaterally mid-implementation (the [session-031] failure mode), the user directed a **Council**. **session-034** (Full Council, Queen Knublauch, DA Davis, 6 voices, agent-fan-out) ruled it: **eager enumeration of *bindable* leaves + an honest gap register**; ratified the **bind-only-what-exists** resolver with **7 verified as-built fixes**; held **oc1/llc1 thin** (they're ODR-0008d register extracts, not forms). B1 was then implemented to that ratified scope. **B2** demonstrated ODR-0003 termination signal 1 (conformant + non-conformant + B1.3.2-traceable + render-contract). All green.

---

## What shipped — 8 commits on `main` (all local; this handover is the tip)

| Commit | What |
|---|---|
| `b0fd662` | **B4** — governance D1/D2/D3 fix: D1 `dpv:` namespace binding in `SpecialCategoryPIIWithoutLawfulBasisShape` (→ core `dpv#`); D2 split overloaded `opda:lawfulBasis` (email/DOB → `dpv-pd:hasPersonalDataCategory`); D3 emit `opda:isPIIBearing true` on the 6 PII Kinds → **Phase-1 PII floor now ENFORCED** (was a no-op). ADR-0005 §G + ODR-0012 §Consequences cleared. 274 tests. |
| `8753784` | **B1 gap-2** — route baspi5 through the generic `_build_profile` (special-case removed); **byte-identical** (SHA-256 manifest matched). |
| `92f59b0` | **Council session-034** — the record + routed amendments (ADR-0029, ODR-0022 G2, ODR-0008d, ODR-0021) + 6 working position files. |
| `cc09e5c` | adoption.md track-record row + plan B1 status + removed the orphan `leaf_resolver.py` draft. |
| `bea76ff` | **B1 gap-1** — enumerate the 12 ref-carrying main forms + 16 NTS2 extensions; oc1/llc1 thin; bind-only-what-exists resolver rebuilt with the 7 fixes; emitted per-form gap register (**224 bound / 1095 GAPped** across 28 forms). 329 tests. |
| `adae020` | **B2** — BASPI5 MVP round-trip (`ci-baspi5-roundtrip`): conformant conforms; non-conformant (Seller-as-PoA, no evidenced authority) → violation traceable to `…/forms/baspi5#B1.3.2`; render-contract 29/29. 337 tests. |
| `a6ef5e1` | ODR-0010 §Rules note: records the B2 demonstration + the **SHACL-AF validator-capability** finding (the sellersCapacity `sh:xone` needs pyshacl `advanced=True`; SHACL-Core passes it vacuously). |
| *(this doc)* | session handover. |

---

## ⚠ Things a reader MUST know

1. **Council session-034 is the authority for B1's scope.** [session-034](./ontology/odr/council/session-034-overlay-leaf-enumeration-discipline.md). It ruled ONLY the un-councilled *enumeration layer*; the leaf→category **mappings stayed scope-fenced** (ODR-0022/0024/0008d untouched — no voice re-litigated them). Verdicts: **Q1+Q4** "full coverage" REDEFINED to *bindable leaves + an honest emitted gap register* (the ADR-0029-vs-ODR-0021 tension **dissolved** — enumerating a form's own leaves IS the SHACL overlay, not a YAGNI-fenced wrapper; it activates already-committed terms, mints no IRI — Kendall's "activation ≠ new commitment" lever). **Q3** ratified the bind-only-what-exists resolver, **conditional on 7 as-built fixes** the panel verified. **Q2** the JSON-pointer schema-leaf-path is a valid ODR-0022 G2 anchor (5–1) BUT oc1/llc1 stay **thin** (4–2; ODR-0008d register extracts, DA HELD with a re-open trigger).
2. **The "descriptive TBox is incomplete" premise (ADR-0029's reason for thin profiles) is SPENT.** Verified: **254 emitted `opda:` predicates**; Category-G walk 239/239; the **monetary walk executed** (2026-05-31). The thin profiles were thin by *omission*, not necessity. This fact decisively reframed B1 from "blocked" to "do it now."
3. **B1 coverage is intentionally low — and that is correct.** The enumerator binds only what baspi5 (the hand-curated reference profile) binds: **Category-G substantive attributes**, not A/B/C/D/E/F leaves. *Verified against baspi5.ttl: it binds 0 `disclosureDetail` (zero A-collapse leaves), only G attributes.* Most overlay leaves are A/B/C/D/E/F (collapse/reuse/scheme/class treatments) which are **not** per-leaf profile `sh:path` bindings — exactly as ODR-0022 §Rules.1 dictates ("the question is carried by subject + `dct:source`, never a per-question property). **224 sound bindings / 1095 GAPped across 28 forms** + honest per-form gap registers = full coverage of the *bindable* set. Several forms bind 0 (lpe1/fme1 carry all refs on container nodes; con29R is 101 yesNo/details envelopes with no emitted predicate) — honest partials, the ratified outcome. The implementation agent flagged the low coverage as a "divergence"; on inspection it is correct convention-adherence.
4. **The 7 as-built fixes (now landed in B1)** the council verified and required: (1) the orphan resolver's broken `..namespaces` import (→ inline `OPDA`); (2) the 16 NTS2 extensions key on `ntsRef`, not `{code}Ref`; (3) the G3 gate recognised only the `basp.uk` authority (→ also recognise the overlay `$id` authority); (4) intrinsic path-awareness (the categoriser disambiguates the `price`/`details` colliders, not a name-key); (5) 3-branch resolver tests (single-domain bind / zero-domain GAP / multi-domain GAP); (6) wire the resolver (it had zero importers); (7) a GAPped leaf emits **no** `dct:source` ref so the hard G3 gate stays green.
5. **oc1/llc1 are held-as-live (Davis DA).** They are HMLR/local-authority register extracts (ODR-0008d), not human-filled forms; zero form-question refs is *correct*. **Re-open trigger:** a named consumer issues a worked SPARQL query against an oc1/llc1 register leaf → then model them as ODR-0008d authority-artefact validation profiles on the JSON-pointer anchor, NEVER by redefining the G2 form-question anchor.
6. **B2 does not retire the programme.** It demonstrates ODR-0003 termination signal 1 (the round-trip). The *other* retirement condition — every linked ODR `accepted` — is separate and unmet (**ODR-0016 is still `proposed`**, deferred-named stub). The programme stays live.
7. **`ci-baspi5-roundtrip` requires a SHACL-AF validator.** pyshacl `advanced=True` — else the sellersCapacity `sh:xone` passes vacuously. Recorded in ODR-0010 §Rules (`a6ef5e1`). A guard exemplar (conformant Legal-Owner) catches the vacuous-pass direction.
8. **A latent baspi5-profile defect surfaced by B2 (worth a follow-up).** `Baspi5_EPCCertificateShape` binds `opda:currentEnergyRating` (whose `rdfs:domain` is `opda:Property`) on `opda:EPCCertificate` → under the rdfs inference the round-trip mandates, an EPCCertificate carrying that rating is inferred to ALSO be a Property and trips the Property minCounts. The B2 conformant exemplar models the rating on the Property (where the domain places it) and documents the defect in its header. Not fixed (out of B2's additive scope); the fix is in the emitter (give EPCCertificate its own rating predicate, or scope the shape). The ADR-0014 JSON→RDF translator carries the same latent issue.

---

## The Council (this session's governance output)

**[session-034](./ontology/odr/council/session-034-overlay-leaf-enumeration-discipline.md) — overlay leaf-enumeration discipline.** Full Council, 6 voices, `agent-fan-out` (no hive-mind — scope-check confirmed Q1 doesn't *condition* Q2–Q4). Queen **Knublauch** (owns ODR-0010); DA **Davis** (the demand-pulled "watching-brief" voice ADR-0029 names + rejects as Option C — correct DA selection); panel **Allemang** (owns ODR-0022 gates), **Cagle** (SHACL/DCTAP mechanism), **Guarino** (ValidationContext truth-maker — decisive on Q2: a register extract has no form-*question* truth-maker), **Kendall** (the "activation ≠ commitment" lever that dissolved the YAGNI objection). DA disposition: **WITHDRAWN** Q1/Q3, **CONCEDED** Q4, **HELD** Q2 (oc1/llc1). Routed into ADR-0029 (amendment block), ODR-0022 §Rules.2 G2, ODR-0008d, ODR-0021 (YAGNI-boundary clarification), adoption.md. Working positions verbatim in [`working/session-034/`](./ontology/odr/council/working/session-034/).

---

## What's open / next steps (suggested order)

1. **B3 — AgentDB re-index** (`adr-index` / `odr-index`): now covers session-032/033/**034**, ADR-0034, and the records amended this session (ADR-0029, ODR-0010/0021/0022/0008d, ODR-0012). NOT done this session (out of the named B1/B2/B4 scope). Needs the `ruflo` MCP. The file + frontmatter edges are authoritative in the interim. Quick, cleanest next action.
2. **A3 — ODR-0016 VC/DID council** (trigger-gated; hive-mind/byzantine per plan §E) — the last `proposed` linked ODR; gates the programme-retirement "all ODRs accepted" condition. Runs only on a fired trigger or a deliberate go.
3. **Programme-retirement check** (ODR-0003): signal 1 now demonstrated (B2). Remaining: every linked ODR `accepted` (ODR-0016 is the holdout; ODR-0016 is reviewed/waivable at the gate if no trigger ever fired).
4. **C/D/E profile binding (deferred, if ever):** the enumerator binds Category-G only. Binding C (status-scheme `sh:in`), D (fixtures inclusion-Mode), E (RiskAssessment) leaves into profiles is a larger follow-on the council noted "arguably re-opens mapping mechanics" — gate it on a real consumer, do NOT do it speculatively.

---

## Key pointers

- **The council:** [session-034](./ontology/odr/council/session-034-overlay-leaf-enumeration-discipline.md) + [`working/session-034/`](./ontology/odr/council/working/session-034/). Routed into ADR-0029, ODR-0022 G2, ODR-0008d, ODR-0021, ODR-0010.
- **B4:** `tools/opda-gen/src/opda_gen/emitters/{annotations,foundation,shapes}.py`; ADR-0005 §G + ODR-0012 §Consequences (cleared).
- **B1:** `tools/opda-gen/src/opda_gen/inputs/leaf_resolver.py` (the resolver + walker), `emitters/profiles.py` (`_build_enumerated_shapes` + the 28 wired forms), `ci/descriptive_roundtrip_test.py` (dual-authority G3). The 28 enumerated profile TTLs under `source/03-standards/ontology/profiles/`.
- **B2:** `tools/opda-gen/src/opda_gen/ci/baspi5_roundtrip_test.py` + the `ci-baspi5-roundtrip` CLI; exemplars `source/03-standards/ontology/exemplars/baspi5-transaction-{conformant,nonconformant}.ttl`.
- **Run the gates:** `cd tools/opda-gen && .venv/bin/python -m pytest -q` (337 pass) and `.venv/bin/python -m opda_gen {ci-byte-identity | ci-three-graph | ci-dup-declaration | ci-profile-contract | ci-descriptive-roundtrip | ci-category-g-coverage | ci-baspi5-roundtrip}`. Re-pin = `emit --output source/03-standards/ontology/` then `ci-byte-identity`. (A separate repo-root harness `tests/baspi5_round_trip/` — the ADR-0014 JSON↔RDF round-trip, 27 tests — also passes.)

## Memory

Touched/relevant: [[opda-greenfield-no-wg-gate]] (council + directing authority are the ratifying bodies), [[opda-avoid-hive-mind-cost]] (session-034 ran agent-fan-out), [[opda-action-over-negotiation]] (the AskUserQuestion I tried for the B1 scope fork was the wrong tool — the user redirected to a Council; see the new [[opda-council-for-scope-forks]]). **Written this session:** [[opda-session-034-overlay-enumeration]] (the ruling + the baspi5-convention finding), [[opda-council-for-scope-forks]] (convene a council, not AskUserQuestion, for high-stakes modelling/scope forks).

## State

8 commits on `main` since `43fbf0d` (7 work-commits `b0fd662`…`a6ef5e1` + this handover), **all local — NOT pushed** (deploys via CI on push to main; left for the user to push). Working tree clean. Full gate suite green (6 CI gates + `ci-baspi5-roundtrip`); 337 pytest pass; byte-identity clean. B1 + B2 + B4 complete; B3 re-index is the cleanest next action.
