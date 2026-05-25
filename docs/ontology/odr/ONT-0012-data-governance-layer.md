---
status: proposed
date: 2026-05-20
tags: [governance, dpv, privacy, dissent]
supersedes: []
depends-on: [ONT-0004]
implements: [ONT-0003]
---

# Data-Governance Layer

## Context and Problem Statement

A PDTF transaction is dense with personal data. The base schema and overlays carry participant names, dates of birth, addresses, phone and email, identity-document and personal numbers, AML results, conveyancer notes, occupier names (including the `aged17OrOverNames` of every adult occupier), and seller-capacity evidence. Some of it is special-category-adjacent: `cautionOrConviction` ("has the property been occupied by someone who has been cautioned or convicted of a serious crime?") and AML outcomes touch Article-10 territory. Governance over this data is not an administrative afterthought to be bolted on once the model is built — Pandit's position (Q2, owns DPV) is that **personal-data governance is a primary concern that shapes the TBox**: which classes and properties bear personal data, of what category, under which lawful regime, is a modelling fact about the ontology, not metadata about a deployment.

The PDTF brief constrains this round to a **data model only — TBox, no instance-data deliverable**. That constraint cuts cleanly through the governance vocabulary in two places and raises the central tension of this ODR. Council Session 001 (Q2) adopted **DPV Phase-1 annotation-only** as the floor: type the personal-data-bearing terms, reference DPV rather than importing it (Kendall). But Pandit dissented — arguing that part of what was deferred to "Phase 2, needs instances" is in fact TBox-expressible and was wrongly held back. And the ODRL adoption carries Guarino's contradiction: a policy vocabulary whose constructs only assert anything about *instances* cannot do any work in a round that forbids instance data.

The question: what governance vocabulary does the ontology adopt now, as TBox annotation, given the data-model-only constraint — and where exactly does the line fall between "TBox-expressible class vocabulary, adopt now" and "needs instances or policy decisions OPDA has not made, defer"? That line is contested, and this ODR must situate the contest rather than paper over it.

## Decision Drivers

* **Governance is a primary TBox concern** (Pandit) — the personal-data character of a term is a modelling fact; it belongs in the ontology, not in a downstream privacy register.
* **Reference, do not import** (Kendall; ONT-0002 adoption pattern) — DPV's surface area is large; the ontology cites canonical DPV URIs and writes local SHACL, with no `owl:imports` dragging in the upstream graph.
* **The data-model-only constraint is real but its scope is contested** — declaring a class vocabulary is a TBox act; *populating* it with instances is not. Whether "no instance data" forbids declaring the lawful-basis/purpose *slots* is exactly the live question (Pandit vs the brief).
* **A policy vocabulary that bites only on instances asserts nothing as bare TBox** (Guarino) — ODRL `Policy`/`Permission` constructs make claims about specific permissions/prohibitions/duties; with no instances to attach to, an ODRL TBox is inert. Adopting the vocabulary is harmless; *authoring policies* is premature.
* **Evidence is saturated with PII** (Pandit, Q6) — the verifiedClaims envelope is not a separate, clean layer: a `document_number` is a `dpv-pd:OfficialID`, and a voucher is itself a data subject. Governance co-annotates the provenance layer (ONT-0009), it does not sit beside it.
* **A standing cost on new PII** (Pandit, Q7) — any new personal-data-bearing field is a governance event; the model should make adding one expensive enough to force review rather than letting PII accrete silently.

## Considered Options

* **No governance layer this round** — defer all DPV/ODRL adoption until instances and policy decisions exist. Minimal, but it leaves the densest PII corpus in the programme entirely unannotated and treats governance as post-hoc, contradicting Pandit's primary-concern position.
* **Full DPV + ODRL adoption now** — declare personal-data categories, lawful basis bound to operations, consent records, purpose bound to processing events, and ODRL policies. Maximally complete, but most of it requires instances or policy decisions OPDA has not made, and the ODRL policies would be inert TBox (Guarino's contradiction).
* **DPV Phase-1 annotation-only as the floor, with the lawful-basis/purpose class-vocabulary question held open, and ODRL adopted-but-policy-authoring-deferred** (chosen) — type the personal-data-bearing terms now via DPV annotation; reference-not-import; record Pandit's dissent on the class vocabulary as a live, unresolved question for this ODR; adopt ODRL in the catalogue but defer authoring any policy until consent/policy instances enter scope.

## Decision Outcome

Chosen option: **DPV Phase-1 annotation-only as the adopted floor, the lawful-basis/purpose class-vocabulary question held open as a live dissent, and ODRL adopted-but-deferred for policy authoring**, because it secures the uncontested win — typing the dense PII corpus now — without pretending to resolve the genuinely contested boundary or authoring a policy vocabulary that would assert nothing in an instance-free round.

**Phase 1 — adopt now (TBox annotation, no instances):**

- **`dpv:hasPersonalData`** types personal-data-bearing classes/properties — `opda:dateOfBirth`, `opda:email`, `opda:address`, and the participant-contact leaves.
- **`dpv:hasPersonalDataCategory`** classifies them: `dpv-pd:Name`, `dpv-pd:DateOfBirth`, `dpv-pd:Address`, `dpv-pd:EmailAddress`, `dpv-pd:TelephoneNumber`, and `dpv-pd:OfficialID` for document and personal numbers.
- **`dpv:hasSpecialCategoryPersonalData`** flags the Article-10-adjacent terms — `cautionOrConviction` and AML results — at TBox level.
- **`dpv-legal:` jurisdiction tagging** annotates the governing regime — UK-GDPR + DPA 2018 — on the relevant module.
- **Reference-not-import**: canonical DPV URIs (`dpv`, `dpv-pd`, `dpv-legal`, `dpv-gdpr`) are cited; local SHACL enforces usage; no `owl:imports` (Kendall; ONT-0002 pattern).

**Live question this ODR must rule on (Pandit's recorded dissent — kept open):**

Pandit (who owns DPV) argues that the **lawful-basis / consent / purpose *class* vocabulary** — the TBox terms `dpv:hasLegalBasis`, `dpv-gdpr:Consent`, and a purpose taxonomy (`opda:IdentityVerification`, `opda:AntiMoneyLaundering`, `opda:ConveyancingDueDiligence`) — is **TBox-expressible and was wrongly deferred**. His argument: defining a vocabulary is a TBox act; only *populating* it with instances is Phase 2. The brief's "no instance data" forbids the latter, not the former — declaring the slots and the purpose taxonomy commits no instance data. This ODR **does not resolve the question**; it records it as live and frames the ruling its follow-up session must make: does Phase 1 extend to the lawful-basis/consent/purpose class vocabulary, or hold at annotation-only? The data dictionary's PII density and the AML/identity/source-of-funds purposes implicit in the verifiedClaims chain are the evidence the follow-up session weighs.

**ODRL — adopted in catalogue, policy-authoring deferred (Guarino's contradiction resolved):**

ODRL is adopted in the vocabulary catalogue ([ONT-0002](./ONT-0002-ontology-language-adoption.md) as amended by [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md)), but **authoring policies is deferred** until consent/policy instances enter scope. This resolves Guarino's Session-001 contradiction directly: ODRL `Policy`/`Permission`/`Duty` constructs bite only on *instances*, which the data-model-only brief forbids; an ODRL TBox alone asserts nothing, so adopting the vocabulary is harmless but writing policies now would be writing inert triples. The deferral is conditional, not a rejection — policy authoring begins when consent records and access-control policy instances are in scope (Phase 2).

**DPV co-annotation of evidence (cross-ref [ONT-0009](./ONT-0009-claims-evidence-provenance.md)):**

The verifiedClaims/evidence layer is not a PII-free zone. Evidence entities are saturated with personal data and are co-annotated under this layer: a `document_number` is a `dpv-pd:OfficialID`; a **voucher is itself a data subject** (the vouching person's identity is personal data), not merely a provenance node (Pandit, Q6). Governance therefore co-annotates ONT-0009's `prov:Entity` evidence subclasses (`document`/`electronic_record`/`vouch`) rather than treating provenance and governance as disjoint graphs.

### Consequences

* Good, because the densest PII corpus in the programme is typed now — every personal-data-bearing class and property carries its `dpv-pd:` category and jurisdiction at TBox level, so governance is a modelling fact rather than a deployment afterthought (Pandit's primary-concern position honoured for the annotation floor).
* Good, because reference-not-import keeps DPV's large surface out of the ontology graph while preserving canonical, dereferenceable URIs (Kendall; ONT-0002 pattern).
* Good, because deferring ODRL policy authoring while adopting the vocabulary resolves Guarino's contradiction cleanly — no inert policy triples are written, and the catalogue is ready when instances arrive.
* Good, because co-annotating evidence under DPV closes the gap Pandit flagged — the verifiedClaims envelope is not mistaken for a PII-free provenance layer; a voucher is modelled as a data subject.
* Bad, because the central boundary — whether the lawful-basis/consent/purpose class vocabulary is in Phase 1 — is left **unresolved**, so the governance TBox is not frozen and a follow-up session must rule before the layer is complete.
* Neutral, because the purpose taxonomy (`opda:IdentityVerification` / `opda:AntiMoneyLaundering` / `opda:ConveyancingDueDiligence`) is a SKOS scheme delegated to [ONT-0011](./ONT-0011-enumeration-vocabularies.md) for its mechanism, whether or not the dissent carries — only its *adoption-now* status is contested here, not its modelling.

### Confirmation

- A SHACL **sensitivity gate** ([ONT-0013](./ONT-0013-shacl-validation-and-severity.md)) raises a `sh:Warning` where special-category or personal-data-bearing terms lack their `dpv:hasPersonalDataCategory` / `dpv:hasSpecialCategoryPersonalData` annotation — making an un-annotated PII leaf a validation finding, not a silent omission.
- Phase-1 conformance is confirmed by review: every leaf the data dictionary marks as carrying name/DOB/address/contact/identity-number data resolves to a `dpv-pd:` category annotation, and `cautionOrConviction` + AML results carry the special-category flag.
- The ODRL deferral is confirmed by the **absence** of any authored `odrl:Policy`/`odrl:Permission` in the Phase-1 deliverable — the vocabulary is referenced in the catalogue but no policy instances are written.
- The live lawful-basis/purpose question is confirmed *resolved* only when the follow-up Council session rules explicitly one way or the other; until then this ODR's `### Consequences` records it as open.

## Pros and Cons of the Options

### No governance layer this round

* Good, because it is the least work and defers every contested call.
* Bad, because it leaves the densest PII corpus in the programme entirely unannotated and treats governance as post-hoc — directly contradicting Pandit's primary-concern position that the personal-data character of a term is a TBox fact.

### Full DPV + ODRL adoption now

* Good, because it would deliver a complete governance layer in one pass.
* Bad, because most of it (lawful basis bound to operations, consent records, purpose bound to processing events, ODRL policies) requires instances or policy decisions OPDA has not made — it would commit instance data the brief forbids.
* Bad, because the ODRL policies would be inert TBox asserting nothing (Guarino's contradiction).

### DPV Phase-1 annotation-only floor + open class-vocabulary question + ODRL-deferred

* Good, because it secures the uncontested win (typing the PII corpus) without forcing the contested boundary or writing inert policy triples.
* Good, because it preserves Pandit's dissent as a live, framed question rather than silently resolving it against him.
* Bad, because the governance TBox is not frozen — the central boundary is explicitly left for a follow-up session.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Vocabularies**: DPV family (`dpv`, `dpv-pd`, `dpv-legal`, `dpv-gdpr`), referenced-not-imported (Kendall; ONT-0002 pattern); SKOS for the PD-category and purpose taxonomies (→ [ONT-0011](./ONT-0011-enumeration-vocabularies.md)); ODRL (adopted in catalogue, policy-authoring deferred). Catalogue status of all of these is set by [ONT-0002](./ONT-0002-ontology-language-adoption.md) as amended by [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md).
- **Glossary & data dictionary as inputs**: the personal-data-bearing leaves are identified from the data dictionary (`data-dictionary.md` / `data-dictionary-canonical.json`) — `name`, `firstName`, `lastName`, `maidenName`, `title`, `dateOfBirth`, `address`, `email`/`emailAddress`, `telephone`, identity/`document_number`, `aged17OrOverNames`, `cautionOrConviction`, AML results; the purpose taxonomy is grounded in the identity-verification / AML / source-of-funds chain implicit in the verifiedClaims envelope. `dct:source` provenance follows the [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md) convention.
- **Evidence co-annotation**: cross-references [ONT-0009](./ONT-0009-claims-evidence-provenance.md) — `document_number` = `dpv-pd:OfficialID`; the `vouch` evidence type's `voucher` is a data subject. The verifiedClaims schema (`source/03-standards/schemas/src/schemas/verifiedClaims/pdtf-verified-claims.json`) carries the `document_number`, evidence-type `{document, electronic_record, vouch}`, and `voucher` definitions co-annotated here.
- **Deliverables (when fleshed out)**: `governance.ttl` (Phase-1 annotations + the lawful-basis/purpose class vocabulary *if the dissent carries*); the PII-module boundary; the SHACL sensitivity gate (→ [ONT-0013](./ONT-0013-shacl-validation-and-severity.md)); a standing rule that any new PII-bearing field costs a Council session (Pandit, Q7).
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); co-annotates Agents & Roles [ONT-0006](./ONT-0006-agents-and-roles.md) (participant PII) and Claims & Evidence [ONT-0009](./ONT-0009-claims-evidence-provenance.md) (evidence PII); purpose/PD-category SKOS schemes [ONT-0011](./ONT-0011-enumeration-vocabularies.md); SHACL sensitivity gate [ONT-0013](./ONT-0013-shacl-validation-and-severity.md); catalogue [ONT-0002](./ONT-0002-ontology-language-adoption.md) as amended by [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q2 (DPV/ODRL; owned by Pandit), Q6 (DPV evidence co-annotation).

## Vote and Dissent

This cross-cutting ODR records no vote of its own — it is a planning record carrying a **live recorded dissent** to be ruled on in its own follow-up session. The Council Session 001 positions it inherits:

- **Q2 DPV Phase-1 annotation** — adopted as the floor: personal-data flags, categories, jurisdiction tagging as TBox annotations; reference-not-import (Kendall).
- **Q2 Pandit's dissent (kept live)** — Pandit, who owns DPV, argues the lawful-basis/consent/purpose **class vocabulary** (not instances) is TBox-expressible and was wrongly deferred; defining the slots is a TBox act, only populating them is Phase 2. **This ODR must rule** whether Phase 1 extends to that class vocabulary or holds at annotation-only — recorded here as unresolved.
- **Q2 ODRL (Guarino's contradiction)** — ODRL `Policy`/`Permission` bite only on instances, which this round forbids; resolved by **adopting the vocabulary but deferring policy authoring** until consent/policy instances enter scope.
- **Q6 DPV co-annotation of evidence** (Pandit) — evidence entities are saturated with PII; a `document_number` is a `dpv-pd:OfficialID` and a voucher is itself a data subject. Co-annotation crosses into [ONT-0009](./ONT-0009-claims-evidence-provenance.md).
