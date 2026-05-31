# Council Session 033 — Lawful-basis / consent / purpose class vocabulary: adopt-now vs Phase-2 (ODR-0012 live dissent)

- **Date:** 2026-05-31
- **Records:** **Reconciles a stale-record defect in [ODR-0012](../ODR-0012-data-governance-layer.md)** (§"Live question" / §Consequences) against its own ratifying session-012; ratifies the **purpose SKOS scheme** model (emission-gated) in [ODR-0011](../ODR-0011-enumeration-vocabularies.md); logs **three verified emission defects** in the governance surface (→ [ADR-0005](../../adr/ADR-0005-deferred-work-register.md) §G). Plan item **A2**.
- **Queen / synthesis:** convening orchestrator. **Devil's Advocate:** Allemang (argued defer; **HELD-as-live**). **Panel:** Pandit (DPV; dissent-holder), Guarino (DOLCE/OntoClean), Cagle (operational SHACL), Baker (SKOS/DCMI).
- **`consensus-mode`:** `agent-fan-out` (Agent Teams `council-012b` + `SendMessage`). **Format:** Full Council (5 voices). No hive-mind (single decision; not conditional/typed-output).
- **Outcome:** **REVISE** — P carries only in **reconciled/decomposed** form. Per-question **3–2**; **DA HELD** on all three (this is NOT a clean-withdrawal session).

## Context + the pre-flight finding

ODR-0012 records Pandit's "Live question": is the lawful-basis/consent/purpose **class** vocabulary TBox-expressible **now** or Phase-2? The pre-flight scope check surfaced — and the DA + Pandit independently corroborated — that **the question was already adjudicated**: **session-012 Q2 ruled 10-0 FOR the lawful-basis class vocabulary VIA reference-not-import** (the ODR-0018 §3a mapping-table mechanism; DPV TBox external; "Pandit's S001 dissent VINDICATED", adoption.md). Yet ODR-0012's **published body still reads** "does not resolve the question… must be ruled by a follow-up Council… governance TBox not frozen" (§"Live question" lines 45–46; §Consequences line 124). **The record contradicts its own ratifying session — a stale-record defect.** S033's true deliverable is therefore reconciliation + the genuinely-residual decisions, not a re-vote of S012.

## Proposition P

Adopt the lawful-basis/consent/purpose **class** vocabulary (`dpv:hasLegalBasis` + lawful-basis classes, `dpv-gdpr:Consent`, the purpose taxonomy) into the OPDA TBox **now**, via reference-not-import — vs defer the class layer to Phase-2.

## Questions + verdicts (per-voice 3–2)

- **Q1 — adopt now vs defer?** **REVISE (decompose). AFFIRM 3 (Pandit, Guarino, Baker) / REVISE 2 (Allemang, Cagle) / REJECT 0.**
- **Q2 — does the class vocab bite at TBox level now, or only on instances?** **AFFIRM 3 / REJECT 2 (Allemang, Cagle).** Reconciled below (the two camps answer different questions, both true).
- **Q3 — mint the purpose SKOS scheme now?** **REVISE (ratify model, gate emission). AFFIRM 3 (Pandit, Guarino, Baker) / REVISE 1 (Cagle) / REJECT 1 (Allemang).**

## Dialectic

**The reference-not-import reframing (Allemang, DA — the decisive turn, verified).** Guarino argued the lawful-basis lattice (`Consent ⊑ LawfulBasis`; `dpv:hasLegalBasis rdfs:range LawfulBasis`) is a *genuine* TBox commitment that constrains models with zero individuals — and Allemang **conceded** "inert" is the wrong word for a subsumption lattice (it is non-inert *in DPV's model theory*; cf. the adopted instance-free ODR-0011 SKOS register and ODR-0009 `opda:Claim ⊑ prov:Entity`). **But Allemang verified empirically that the lattice is absent from OPDA's models:** OPDA never `owl:imports` DPV (only `dct:references`); `dpv:hasLegalBasis` has no `rdfs:range` in-graph (it occurs only inside a `sh:message` string + a `FILTER` clause); `opda:lawfulBasis` is never declared an `owl:ObjectProperty`. Under reference-not-import the DPV axioms stay external, so OPDA-side the lawful-basis surface is **opaque references + SHACL checks, not entailments**. The entailment benefit Guarino invokes would require `owl:import DPV` — which the Council has repeatedly refused (reference-not-import discipline) and which P does not propose. So "adopt a model-constraining class lattice via reference-not-import" is incoherent; the coherent core of P (the reference + mapping + SHACL floor) **is already adopted and emitted (S012)**.

**The class/instance boundary (Guarino, accepted by Pandit).** The lawful-basis CATEGORY named `Consent` (a class of basis) is class-layer; a `dpv-gdpr:Consent` consent-RECORD ("subject X consented to purpose Y at T") and `dpv:hasLegalBasis` asserted as a binding to a specific processing event are **instance-shaped** — Phase-2, governed by S012 Q4's three triggers. Pandit confirmed he claims **only the class layer (a)**, conceding the instance residue (b). Allemang sharpened: a lawful basis is *itself* an assertion about a processing **act** (GDPR Art. 6), so even the predicate's *use* waits for Phase-2 — and "special-category data is typed but no basis is asserted for processing that hasn't occurred" is **correct silence, not incoherence** (the disanalogy with the OWL-Time precedent, which filled a structural gap under facts that *were* true).

**The OWL-Time coherence lever (Guarino) → answered.** Guarino's strongest pro-adopt lever — PII typed but governing basis untyped is incoherent the way PROV-instants-without-OWL-Time-intervals was (which beat deferral 6-3 at S001). Allemang distinguished it structurally: OWL-Time supplied a *missing expressive primitive* for a fact (claim-validity interval) that held; the basis layer pre-builds typing for **acts the brief forbids this round**, and reference-not-import voids the OPDA-side entailment anyway.

**Q3 — the purpose SKOS scheme split.** Guarino/Baker/Pandit: the purpose taxonomy (`IdentityVerification`/`AntiMoneyLaundering`/`ConveyancingDueDiligence`) is a controlled vocabulary of **concepts** (ODR-0011 §8a Method/plan-code) — TBox-meaningful without instances, like the other 47 emitted schemes — data-grounded in ODR-0009's `prov:Plan` chain `identity→AML→source-of-funds`; mint now (Baker: *a fortiori* given Q1, and ODR-0009's worked examples will need it to `dct:source` into). Allemang/Cagle: no purpose scheme is emitted, no `opda:hasPurpose` triples exist, and the purposes are already carried by PROV-O activity-chaining where they bite; mint at the first driver (generator-first). **Both minority voices conceded the mechanism** and hold only on emit-now — so this reconciles to a **REVISE**: ratify the model, gate emission on the first driver.

**Three verified emission defects (Cagle, Queen-verified).** Independent of P, in the *accepted, emitted* ODR-0012/0018 surface:
- **D1 (namespace bug):** `SpecialCategoryPIIWithoutLawfulBasisShape` binds `PREFIX dpv: <…/dpv/pd#>` then queries `dpv:hasLegalBasis` — but `hasLegalBasis` is **core** `dpv:` (`…/dpv#`); the gate checks a non-existent predicate and would miss a real legal-basis triple. *(Verified: `opda-agent-shapes.ttl`.)*
- **D2 (predicate overload):** `opda:lawfulBasis` carries `dpv-pd:DateOfBirth`/`dpv-pd:EmailAddress` (PD-categories) in `opda-agent-annotations.ttl`, but `dpv:PublicTask`/`Consent`/`LegitimateInterest` (lawful bases) in claim/property annotations. *(Verified.)*
- **D3 (enforcement inert — highest value):** `opda:isPIIBearing true` is asserted on **zero** classes (the token occurs only inside `PIIWithoutDPVCoAnnotationRule`'s own comment + WHERE clause, `opda-shapes.ttl:61,87`) — so the Phase-1 PII-co-annotation enforcement rule fires on the empty set. **The Phase-1 floor exists as data but is currently UNENFORCED.** *(Verified.)*

## Tally appendix

| Voice | Q1 | Q2 | Q3 |
|---|---|---|---|
| Pandit (dissent) | AFFIRM (as already-decided) | AFFIRM | AFFIRM |
| Guarino | AFFIRM | AFFIRM | AFFIRM |
| Baker | AFFIRM | AFFIRM (scoped) | AFFIRM |
| Allemang (DA) | REVISE-to-defer | REJECT | REJECT |
| Cagle | REVISE | REJECT | REVISE-defer |
| **Count** | **3 AFFIRM / 2 REVISE** | **3 AFFIRM / 2 REJECT** | **3 AFFIRM / 1 REVISE / 1 REJECT** |

**DA scorecard (Allemang): HELD-as-live on all three** (this session carries a surviving dissent). Q1 HELD — withdraws on `owl:import DPV` (own the import; don't smuggle a lattice under "reference") OR any S012 Q4 Phase-2 trigger. Q2 HELD — withdraws when a SHACL shape *consumes* a lawful-basis/purpose value (`sh:in`/`sh:hasValue`/`sh:class`) over a non-placeholder predicate. Q3 **CONCEDED-IN-PART** (the ODR-0011 §8a mechanism is sound) / **HELD-IN-PART** (emit-now not data-grounded; withdraws on a non-instance purpose consumer, e.g. an ODR-0010 overlay-profile purpose filter). Cagle concurs with the deferral/gating half and adds the three defects.

## Verdict + dispositions — REVISE (reconciled/decomposed)

1. **Reconcile the stale record (ODR-0012).** Rewrite §"Live question" + §Consequences to record that **session-012 Q2 resolved the lawful-basis class vocabulary 10-0 via reference-not-import** (the ODR-0018 §3a mapping-table form, emitted); flip "active live dissent / not frozen" → "**resolved-via-reference-not-import; the governance TBox class layer is settled in that form.**" (Directed edit attributable to S012's verdict, dated as the S033 reconciliation; in-place per ODR-0002 change-log discipline.)
2. **Q1 — the reference-not-import floor stands (already adopted); the rest is scoped out.** A *model-constraining* lawful-basis lattice would require `owl:import DPV` — **out of scope** (reference-not-import discipline; a distinct future proposition if ever). Consent-records / basis-bound-to-event / policy instances → **Phase-2** (S012 Q4 triggers).
3. **Q3 — purpose SKOS scheme: model ratified, emission gated.** `opda:PurposeScheme` is the correct model (ODR-0011 §8a Method/plan-code; §4a verbatim regulator citation — GDPR Art. 6 / UK MLR 2017; §2a `skos:definition @en` exactly-1). **Emit it on the first driver** — ODR-0009's worked-example authoring referencing the purposes, or a purpose-bearing field — per the generator-first discipline. **Steward split (proposed):** lead = DPV authority (ODR-0012/Pandit, GDPR/MLR definitional grounding) + DCMI deputy (Baker, SKOS hygiene) — panel/WG confirms.
4. **Three emission defects → a generator-fix work item** (ADR-0005 §G; an ADR-0012/0018 emitter fix), to proceed **regardless of P**: D1 (namespace), D2 (overload), D3 (emit `opda:isPIIBearing true` on the PII Kinds so Phase-1 enforcement actually fires). D3 is the highest-value action in this whole question — it activates enforcement of the already-adopted floor with no new class vocab.

## Held-as-live dissent + re-open triggers

**Held-as-live (Allemang DA, concurred-in-part by Cagle):** the class layer beyond the emitted reference-not-import floor (a model-constraining lattice; consent/purpose class machinery as standalone TBox) and the purpose-scheme *emission* are deferred. **Re-open triggers:** (i) the Council elects to `owl:import DPV` (then the lattice constrains OPDA models — own it explicitly); (ii) any S012 Q4 Phase-2 trigger fires (VC consent receipts; an OPDA-TF policy instance referencing OPDA-modelled basis; a named consumer regulatory requirement); (iii) a SHACL shape consumes a lawful-basis/purpose value over a non-placeholder predicate; (iv) the purpose-scheme driver lands (ODR-0009 worked examples / a purpose-bearing field / an ODR-0010 overlay purpose filter).

## A9 note

No new `kind: pattern` ODR. The class layer's IC framework is ODR-0011 §8a + ODR-0018's DPV co-annotation pattern (both ratified); the purpose scheme rides ODR-0011 §8a Method/plan-code. This session reconciles a record + ratifies a scheme model + logs defects — A9 relaxed.

## Consequences

- **ODR-0012** §"Live question" + §Consequences reconciled (resolved-via-reference-not-import; class layer settled in that form; consent/policy instances Phase-2).
- **ODR-0011** records `opda:PurposeScheme` as ratified-model, emission-gated on the first driver, with the steward split.
- **ADR-0005 §G** gains the three-defect generator-fix work item.
- Greenfield first-cut; no WG (council + directing authority ratify). **A live DA dissent stands** — the deferral of anything beyond the emitted reference-not-import floor — bound by the re-open triggers above.

## References

- [ODR-0012](../ODR-0012-data-governance-layer.md) (Phase-1 floor; the stale §"Live question"); [session-012](./session-012-data-governance-layer.md) Q2 (the 10-0 reference-not-import ruling); [ODR-0018](../ODR-0018-dpv-class-level-coannotation-pattern.md) §3a (mapping-table mechanism); [ODR-0011](../ODR-0011-enumeration-vocabularies.md) §8a (Method/plan-code; purpose scheme) + §1a/§2a/§4a; [ODR-0009](../ODR-0009-claims-evidence-provenance.md) §Rules (`prov:Plan` purpose chain) + §"Vocabulary delegation"; [ODR-0002](../ODR-0002-ontology-language-adoption.md) (reference-not-import; no `owl:imports`); [ODR-0013](../ODR-0013-shacl-validation-and-severity.md) (severity); [ODR-0010](../ODR-0010-overlay-profile-mechanism.md) (overlay filters — a potential purpose consumer).
- Methodology: [ODR-0001](../ODR-0001-linked-data-council-methodology.md). Plan: [outstanding-work-and-modelling §A2](../../../plan/outstanding-work-and-modelling.md).
- Grounding cited by the panel: DPV 2.x (`https://w3id.org/dpv#` core vs `dpv-pd`); W3C SKOS Reference (2009); Guarino & Welty OntoClean; Allemang, Hendler & Gandon SWWO (3e); GDPR Art. 6 / UK MLR 2017.
