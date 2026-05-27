---
voice: iannella-extended-solo
session: 012-data-governance-layer
date: 2026-05-27
role: panellist
pair-partner: pandit (Queen this session — Iannella writes solo)
load-bearing: Q4 (ODRL policy-authoring activation trigger)
---

# Iannella — solo position (Session 012)

Renato Iannella here, ODRL co-editor (W3C ODRL Information Model 2.2, Recommendation 2018). Pandit is Queen this session and the dpv-odrl-extended pairing is split; I write solo on Q4 and concede the remaining six questions where the panel has reached settlement.

My stance carries the S001 contradiction Guarino named — that ODRL `Policy` / `Permission` / `Duty` are **instance-level constructs**, so a TBox-only adoption asserts nothing — and converts it into a named activation trigger. The trigger lives in this ODR; ODR-0002's Change Log row for ODRL points back here (S002 Q10, 2026-05-27, three named-event triggers).

## Q4 — ODRL policy-authoring activation trigger (LOAD-BEARING)

**Position.** ODRL stays in [ODR-0002](../../ODR-0002-ontology-language-adoption.md) Defer-for-authoring (catalogue-admitted, policy-deferred) until **Phase-2 instance-data enters OPDA scope**. The trigger fires when any one of three named events occurs — not when any one looks plausible, but when one materialises in a published artefact or named consumer.

**Trigger 1 — W3C VC consent-receipt instances ([ODR-0016](../../ODR-0016-w3c-vc-did-compatibility.md)).** When ODR-0012's downstream consumers begin authoring `cred:VerifiableCredential` consent receipts — Pandit's S001 Q6 ambition — those receipts pair with `odrl:Policy` / `odrl:Permission` / `odrl:Duty` for the rights-expression side. The VC carries the *credential*; ODRL carries the *policy the credential evidences*. This is the canonical pairing in the W3C ODRL Community Group's VC-policy-binding pattern (post-2020 OASIS/W3C alignment work). When ODR-0016 activates `cred:` and `did:` from their ODR-0002 Defer row, ODRL activates symmetrically.

**Trigger 2 — Real-world OPDA Trust Framework policy instances.** When a TF Sub-Committee publishes a policy (data-licensing, consent-form, cross-jurisdiction-recognition) that references OPDA-modelled rights and obligations, the policy *is* the instance. At that point ODRL has bite — the published policy resolves to `odrl:Policy` triples that constrain real data flows.

**Trigger 3 — Named consumer requires policy-expression interop.** When a regulatory body or named external consumer (FCA, ICO, EU regulatory technical standards under eIDAS 2.0, UK MEES guidance authority, a cross-jurisdiction recognition arrangement) cites OPDA in architecture documentation OR requests ODRL-typed Turtle for consent / data-licensing interop, the requirement *is* the trigger.

**Reference-not-import alignment.** All three triggers honour [ODR-0002](../../ODR-0002-ontology-language-adoption.md) §Reference-not-import: when ODRL activates, it activates as `reference-only` first. Slice-import for the `odrl:action` hierarchy is admissible *only* if SHACL shapes on OPDA permission expressions become load-bearing on ODRL's class graph — and that requires a separate ODR-0002 Change Log row attributed to the activating session, per §Profile-pinning ownership (module-proposes → catalogue-records).

**One-trigger-one-Change-Log-row discipline.** Per Hendler's S002 Q13 sub-rule (one-step-per-row), each trigger event records its own Change Log row in ODR-0002. Trigger 1 (VC consent receipts) is the **coupled-trigger case** S002 Q10 already named — the consent-receipt instance is *also* a `cred:`/`did:` activation event; the coupled event records a single row covering both vocabularies. Triggers 2 and 3 are uncoupled and each records its own row.

**What does not trigger.** Three things I rule out explicitly:

1. **TBox-only ODRL term use** — referencing `odrl:Policy` as a class without authoring a `Policy` instance does not trigger. Guarino's S001 point holds: TBox alone asserts nothing in this round.
2. **`rdfs:comment` mentions of ODRL** — pointing at ODRL in prose without published `odrl:` triples does not trigger.
3. **Speculative "we might need policies someday"** — under [ODR-0001](../../ODR-0001-linked-data-council-methodology.md) A9 *Artefact identity test* and the **named consumer** discipline of ODR-0002 §Promotion and demotion criteria, hypothetical demand does not earn promotion. Same logic applies to activation: the consumer must be named, not imagined.

**Recorded as deferred-work item.** Per the project's deferred-work discipline (the auto-memory's *opda-deferred-work-tracking* note), ODR-0012 §Consequences should carry a deferred-work row pointing at the three triggers, mirrored in `/governance/deferred-work` with a `Linked-artefact` column referencing this position file's Q4 section and ODR-0002's Change Log row for ODRL.

## Kendall DA — reference-not-import as the demonstrated discipline

Engaging Kendall DA at the panel level: ODRL's deferral *is* the cleanest demonstration in the catalogue of reference-not-import discipline working in production. We admit the vocabulary (canonical URI cited, prefix declared); we write zero `odrl:` triples in Phase 1; we name the trigger that converts admission into authoring; we hold the deferral against a contradiction Guarino raised in S001 rather than papering over it. That is the FIBO discipline (Kendall+Davis, ODR-0002 References) applied to an instance-level rights-expression vocabulary — admit by reference, author when bite arrives, never import speculatively.

If Cagle's SHACL-AF automation hook (Q5; ODR-0017 tenth citing site candidate) emits `sh:Info` advisory rules over policy-bearing instances when they arrive, the rules themselves are reference-not-import-compliant: the rules cite `odrl:` URIs without importing the ODRL ontology graph.

## Q1 — Phase-1 annotation curated-set scope: CONCEDE

I concede to the panel's curated-set scope for Phase-1 DPV annotation. The PII corpus is dense enough that an unbounded sweep would defeat the SHACL sensitivity-gate review test; curating the leaves the data dictionary marks (per ODR-0012 §References) and resolving each to a `dpv-pd:` category is the auditable cut.

## Q2 — Pandit's TBox-expressible lawful-basis class vocabulary: CONCEDE

I concede to Pandit's S001 Q2 dissent: the **vocabulary** (the class definitions `dpv:LawfulBasis`, `dpv-gdpr:Consent`, the purpose taxonomy) is TBox-expressible, and defining a vocabulary is a TBox act. This does not contradict my Q4 position — defining the class vocabulary does not author *policies*; ODRL's instance-level bite is a separate concern from DPV's class-level co-annotation pattern (ODR-0018).

## Q3 — Pandit's Article-10 depth: CONCEDE

I concede to Pandit's Article-10-adjacent depth (`cautionOrConviction`, AML results flagged at TBox level with `dpv:hasSpecialCategoryPersonalData`). The special-category flag is class-level annotation per ODR-0018, not instance-level policy authoring.

## Q5 — Cagle SHACL-AF automation hook: CONCEDE (tenth ODR-0017 citing site candidate)

I concede to Cagle's SHACL-AF automation hook. When ODR-0017's tenth citing site is identified, ODR-0012's SHACL sensitivity gate is a strong candidate — `sh:Info` rules that surface un-annotated PII leaves without blocking validation match the non-blocking-data-quality-rules pattern exactly. The hook does not change Q4's trigger discipline (ODRL stays deferred; SHACL-AF is a DPV-side annotation-review tool, not a policy-authoring activator).

## Q6 — VC consent receipts: DEFER to ODR-0016

DEFER. The consent-receipt-as-VC pattern is owned by ODR-0016. ODR-0012's contribution is naming this pairing as **Trigger 1** for ODRL activation (above) — the coupled-trigger event S002 Q10 already named. Authoring the VC consent-receipt instance itself is ODR-0016's responsibility.

## Q7 — settled per ODR-0009 Q6 + ODR-0018

Settled. ODR-0009 Q6 (DPV co-annotation seam over evidence subclasses) plus ODR-0018 (DPV class-level co-annotation pattern) settle the evidence-side co-annotation question. ODR-0012 inherits ODR-0018 as authoring contract (per ODR-0018 §Consequences) and consumes the mapping tables ODR-0009 declares. No new position from me.

## Summary

| Q | Stance | One-line position |
|---|---|---|
| Q1 | CONCEDE | Curated Phase-1 PII-leaf scope; matches SHACL sensitivity-gate review test |
| Q2 | CONCEDE | Lawful-basis class vocabulary is TBox-expressible (Pandit S001 Q2) |
| Q3 | CONCEDE | Article-10 depth at TBox level via `dpv:hasSpecialCategoryPersonalData` |
| **Q4** | **LOAD-BEARING** | **Three named triggers: VC consent receipts (coupled w/ `cred:`/`did:`); TF policy instances; named regulatory/consumer interop demand** |
| Q5 | CONCEDE | SHACL-AF `sh:Info` rules over PII gate — tenth ODR-0017 citing-site candidate |
| Q6 | DEFER | VC consent receipts owned by ODR-0016; ODR-0012 names the coupled-trigger event |
| Q7 | SETTLED | ODR-0009 Q6 + ODR-0018 settle the evidence-side co-annotation |

Reference-not-import is the demonstrated discipline (Kendall DA). ODRL's deferral against a Guarino-named contradiction, with three named activation triggers and no speculative authoring, is the canonical instance of the pattern working in production.
