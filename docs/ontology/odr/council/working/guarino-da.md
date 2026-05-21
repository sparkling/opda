# Guarino — Devil's Advocate working position

**Expert:** Nicola Guarino (ISTC-CNR; DOLCE; *Formal Ontology in Information Systems*; OntoClean; identity criteria)
**Role:** Devil's Advocate (ODR-0001 §Roles). Mandate: attack each proposition; lean DISAGREE; withdraw only when the methodology genuinely persuades.
**Session:** 001 — PDTF schema → ontology (TBox only).

A preliminary remark, because it conditions every vote below. ODR-0001 names "Council theatre" as the failure mode I exist to prevent. The fastest route to theatre is a convening brief that has already decided the answer and seeks ratification. Several constraints here — "no instance data," the vocabulary inclusions-by-fiat, "partition by aggregate page" — are presented as settled. They are not settled; they are the very things a foundational ontologist must contest. I contest them.

---

## Q1 — "Data model (TBox) only, no instance data this round"

**Position: DISAGREE.** This is a category error dressed as a scoping convenience.

**Reasoning (OntoClean; *Formal Ontology in Information Systems*, 1998).** A class is not a label over a set of strings; it is a *unary property with an identity criterion* (IC) — the relation that tells you when two presentations denote the same individual and when one individual persists through change. OntoClean's whole apparatus (the meta-properties +I/-I for carrying/supplying identity, +R/-R for rigidity) operates on the claim that you cannot competently *declare* a class without committing to whether it supplies identity. "Define the TBox but defer all individuals" is therefore incoherent at the join points: you cannot write `opda:Property rdfs:subClassOf ...` responsibly without answering "same property?" — and that answer is unintelligible without exemplars. The IC is *tested* against instances (does UPRN-retirement preserve identity? does subdivision?). A TBox whose ICs are never exercised against a single individual is a TBox of unfalsifiable assertions.

This does not mean the round must ingest production data. It means the round must admit **diagnostic individuals** — three or four worked cases (a registered freehold house; an unregistered house pre-first-registration; a flat whose UPRN was split) used solely to pressure-test identity and rigidity. That is not "instance data this round" in the sense the brief forbids (no ABox deliverable); it is the conformance test for the TBox. Forbidding it guarantees the ICs ship untested.

**Vote: DISAGREE.**
**Withdrawn if:** the brief is amended to permit *diagnostic exemplars* (non-deliverable, IC-probing individuals) and each class deliverable carries an IC statement validated against at least one such exemplar. Then I withdraw — the TBox/ABox split is fine *as a deliverable boundary*, only not as a thinking boundary.

---

## Q2 — Vocabulary set (Core + DASH + PROV-O + DPV family + ODRL; BBO out; rest TBD)

**Position: DISAGREE — two independent defects.**

**(a) Arbitrary exclusion under a stated modelling concern.** ODR-0002 defers OWL-Time and FOAF while admitting the very concerns they answer. The brief models a *transaction lifecycle* — `status`, milestones, `lastDemandPeriod {from,to}`, lease terms, `dateToBeConnected` — i.e. intervals and instants. That is OWL-Time's subject matter exactly (W3C Rec 2020: `time:Interval`, `time:Instant`, `time:hasBeginning`). Deferring it while the lifecycle is in scope is not scoping; it is declining to model temporality with the standard vocabulary while modelling temporality. Likewise FOAF: ODR-0002 says `prov:Agent` "covers the need," but `prov:Agent` is deliberately thin — it has no person/organisation distinction, no name/account structure. The participant model (firstName/lastName/maidenName/organisation/role) is FOAF/org-ontology shaped. "prov:Agent covers it" is asserted, not argued. (I will concede DPV-pd's `dpv-pd:Person` may cover the personal-data framing — but that is a privacy classifier, not an agent model.)

**(b) ODRL contradicts Q1.** ODRL `Policy`/`Permission`/`Duty`/`Constraint` are deontic statements over *instances* — a permission to process *this* data for *that* purpose by *this* party. With "no instance data," there are no policies to express; an ODRL TBox alone asserts nothing the upstream W3C ontology doesn't already assert. So the brief simultaneously (i) forbids instances and (ii) mandates a vocabulary whose only bite is on instances. One of the two must yield. Same objection, weaker, for the DPV processing-records and for SHACL severity (see Q5).

**Vote: DISAGREE.** Strongest ground for the record: **(b)**, the internal contradiction — it is a logical defect, not a judgement call.
**Withdrawn if:** OWL-Time and FOAF are either admitted or refused *with a use-case-grounded reason* (not "H&M didn't use it" — H&M's `src/` is evidence of H&M's scope, not of property-transaction temporality); and ODRL is demoted to "adopt when consent/policy *instances* enter scope," consistent with Q1.

---

## Q3 — Bounded-context partition "by aggregate page"

**Position: DISAGREE.** The partition fossilises documentation accident as ontological structure.

**Reasoning.** The 50-odd `_content/schema/NN-*.md` pages were authored as *web-app documentation* — grouped by lifecycle stage and issuing authority for a human reader. That is excellent didactics and says nothing about ontological cohesion. Two pages already confess cross-cutting status: page 35 states "every other Schema page hangs off this one… a claim about the property has no meaning without an asserter; an evidence document has no force without an issuer"; page 37 documents Property as referenced from four scattered surfaces. **Evidence/attachments and VerifiedClaims are not modules — they are relations that cut across every module.** `attachments` appears under capacity, alterations, insurance, leasehold, fittings, environmental — dozens of leaves. Modelling that as one "Evidence page module" buries a cross-cutting concern inside an accidental bin. Eric Evans' own caution (a bounded context is a *linguistic/semantic* boundary, not a documentation table of contents) applies: aligning contexts to pages imports the page author's convenience as if it were a domain invariant.

**Vote: DISAGREE.**
**Withdrawn if:** Evidence/Documents/Declarations and VerifiedClaims are promoted to **cross-cutting axes** (modelled as relations/shapes available to all contexts) rather than peer modules, and the remaining page→context mapping is justified by *shared identity criterion + shared lifecycle* (page 35's own cohesion test) rather than by page adjacency. Where a page passes that test (participants plausibly do), I concede the boundary.

---

## Q4 — Property / LegalEstate split; UPRN as key (STRONGEST ATTACK)

**Position: DISAGREE — the split is the right instinct but the identity criteria are absent, and absent ICs are the one thing OntoClean forbids.**

**Reasoning.** Begin with the prior question the JSON Schema never answers: **is `opda:Property` an Endurant (a physical thing that persists through time, present in full at every moment) or a Quale/descriptive region (a bundle of attributes)?** The schema (page 37) conflates them — it reconstructs "the property" from Address, UPRN, INSPIRE-ID and title-links, which are a *physical referent* (the building/parcel) and a *legal-administrative description* jumbled together. DOLCE forces the disjunction:

- **If Endurant** (physical building/parcel): its IC must survive *demolition, subdivision, merger, rebuild*. What individuates the house at 5 High Street after it is demolished and two houses are built on the plot? After two flats are knocked through into one? The schema is silent; therefore the class as drawn has *no* IC for exactly the cases that matter. Under OntoClean this is a class carrying -I where the modeller assumes +I — a violation.
- **If Quale/description** (an address-and-attributes record): it has, strictly, *no* identity criterion of its own — descriptions are individuated by their content, so two qualitatively identical descriptions are the same Quale, which is plainly wrong for two identical-looking houses on the same street. A Quale cannot be the load-bearing endurant the transaction is *about*.

So `opda:Property` as currently conceived is neither cleanly: it is a Kind-pretending-to-be that fails OntoClean's rigidity (+R) and identity (+I) tests.

Now **UPRN as natural key.** A natural/rigid key must hold in every world in which the individual exists (Kripke rigidity, imported into OntoClean as +R). UPRN fails this: it is a *contingent administrative identifier* — UPRNs are **retired, split on subdivision, merged, and re-issued** by the addressing authority. An identifier that can be retired while its referent persists, or split while its referent stays one thing, is by definition *not* an identity criterion; it is at best a *contingent designator* (Guizzardi & I would call it a `relator`/external identifier carried by an `IdentificationScheme`, never the IC itself). The address-based fallback is worse: "5 High Street, Anytown, AB12 3CD" is a contingent description (streets renumber, postcodes redistrict) — using it as a key confuses a *mode of presentation* with the *bearer*.

The genuinely defensible move — and I will say so, since the DA records what would persuade — is the inverse of the brief's proposal: the **LegalEstate** (the registered title, identified by `titleNumber`) has a far stronger claim to a rigid IC than the physical Property, because the title *is* an institutional object individuated by its register entry and persisting precisely through physical change. But that strands the *unregistered* property (page: "isFirstRegistration"): before first registration there is no title number, so a title-based IC leaves pre-registration properties identity-less. The honest conclusion is **two endurants with distinct ICs** — a physical `Site/BuiltStructure` (IC: spatial-material continuity, explicitly defined over subdivision/merger) and a `LegalEstate` (IC: title-register identity) — related by a time-indexed `realises`/`vests-in` relation, with UPRN and address modelled as `qua`-identifiers (contingent, scheme-scoped), never as the criterion.

**Vote: DISAGREE.** This is my strongest objection and should anchor the session record.
**Withdrawn if:** the proposal (i) commits each of Property and LegalEstate to the Endurant category explicitly, (ii) states an IC for each that is defined over the hard cases (demolition/subdivision/merger for the physical thing; first-registration for the legal thing), and (iii) demotes UPRN and address from "key" to scheme-scoped contingent identifiers. If those three land, the split is not just acceptable — it is correct, and I will say so on the record.

---

## Q5 — "Loaded profile = active requirement" semantics for overlays

**Position: DISAGREE.** A syntactic merge artefact has been promoted to ontological status without a fixed semantics.

**Reasoning.** Per `schema-composition.astro`, `getTransactionSchema` deep-merges overlays and *unions* `required` arrays. The proposed reading — "a property is mandatory iff some loaded profile requires it" — makes `sh:minCount 1` a function of *which files were passed to a build call*. That is not a logical semantics; it is build-time configuration masquerading as a constraint. Ask the OntoClean-adjacent question: is the proposition "every Property has ≥1 UPRN" *true*, or true-relative-to-a-profile? If the latter, it is not an axiom about Properties at all — it is an axiom about *a validation context*, and conflating the two is precisely the use/mention slip foundational ontology exists to catch. SHACL's own semantics are closed-world validation over a fixed data graph and a fixed shapes graph; "the shapes graph depends on a merge order (later overlay wins for scalars, union for `required`)" is *outside* SHACL's defined semantics — it is a fragment with no fixed model theory, because the shapes graph is not fixed. Two different overlay orderings can yield two different `sh:minCount`/`oneOf` outcomes (the page admits order matters for `oneOf`), so the "requirement" is not even a well-defined function of the loaded set.

**Vote: DISAGREE.**
**Withdrawn if:** conditionality is *reified* — model the profile/product as a first-class `ValidationContext` (or DPV/ODRL-style policy node) and make `minCount` a constraint *of a named context*, not a free-floating axiom. "Required under the Conveyancer profile" is a coherent, expressible proposition; "required (depending)" is not.

---

## Q6 — eIDAS / verifiedClaims envelope mapped onto PROV-O

**Position: DISAGREE.** The mapping flattens a legal-evidential concept into a generic causal-provenance trace.

**Reasoning.** The `pdtf-verified-claims.json` envelope is OIDC4IDA/eIDAS-shaped: it distinguishes **`validation_method`** (is the document genuine?) from **`verification_method`** (does it bind to this person?), enumerates `evidence.type ∈ {document, electronic_record, vouch}`, and carries `issuer.jurisdiction`. These encode *evidential weight under a legal regime* — a vouch is not a passport scan; a validated-and-verified document under eIDAS High is not a self-asserted record. PROV-O answers a different question: `prov:wasDerivedFrom`, `prov:wasGeneratedBy`, `prov:wasAttributedTo` capture *who derived what from what, by which activity*. That is necessary but not sufficient: PROV-O has **no vocabulary for the validation/verification distinction, no notion of assurance level, no jurisdiction-bound claim certainty.** Forcing eIDAS onto PROV-O alone collapses "what is the evidential force of this assertion under English property/AML law" into "this assertion has a derivation history" — a genuine loss, and exactly the kind of conceptual flattening *Formal Ontology in Information Systems* warns against (mapping by structural resemblance rather than by ontological commitment). PROV-O is the right *substrate* for the trace; it is the wrong *home* for the legal semantics.

**Vote: DISAGREE.**
**Withdrawn if:** PROV-O is used only for the derivation backbone and the eIDAS-specific semantics (validation vs verification, assurance level, jurisdiction) are carried by a dedicated evidence/assurance vocabulary (DPV's evidence/`dpv:Evidence` and legal extensions are candidate hosts; a thin `opda:Assurance` is acceptable) layered *over* PROV-O — not folded *into* it. Provenance and assurance are two relations, not one.

---

## Q7 — Scope: the proposed programme of ODRs

**Position: DISAGREE / demand reduction.** A multi-ODR programme demonstrates intent; it does not *prove* the methodology, and proving-not-demonstrating is the standard a foundational review must hold.

**Reasoning.** A programme of that size is several person-years and front-loads commitment before a single hard identity question has been resolved. Worse, it risks the Council theatre ODR-0001 warns of: volume of decisions read as evidence of rigour. The Popperian test is the opposite — the smallest set that could *falsify* the approach. That set is whatever forces the Q4 identity problem to be solved in anger, because Q4 is where this ontology will live or die. Everything else (vocabulary catalogue, naming, DASH hints) is downstream of getting the load-bearing endurant right.

**Concrete reduction I will defend:** a **three-ODR spike** — (1) the Property/LegalEstate identity-criteria decision *with diagnostic exemplars* (Q1+Q4 fused — the crux); (2) the participant/agent model *including* the FOAF-vs-prov:Agent and capacity-vs-evidenced-authority question (Q2 + page 35's own flagged gap); (3) the evidence/provenance/assurance layering (Q6). If those three survive contact with worked cases, the methodology is *proven* and the remaining ODRs become *demonstration*, which can proceed at lower scrutiny. If they do not, the programme was going to fail anyway and we have spent three ODRs, not fifteen, finding out.

**Vote: DISAGREE** (on the full programme as the proving instrument).
**Withdrawn if:** the session adopts an explicit *spike-then-scale* structure — a named minimal subset (the three above, or an equivalently crux-first set) gated on diagnostic-exemplar validation before the remainder is authorised.

---

## Summary of votes

| Q | Vote | Strongest withdrawal trigger |
|---|------|------------------------------|
| Q1 | DISAGREE | Admit non-deliverable diagnostic exemplars to test ICs |
| Q2 | DISAGREE | Resolve ODRL/instance contradiction; justify Time/FOAF on use-case grounds |
| Q3 | DISAGREE | Promote Evidence + VerifiedClaims to cross-cutting axes; justify boundaries by IC+lifecycle |
| Q4 | **DISAGREE (anchor)** | Commit each entity to Endurant + state IC over hard cases; demote UPRN to contingent identifier |
| Q5 | DISAGREE | Reify a first-class `ValidationContext`; no free-floating conditional axioms |
| Q6 | DISAGREE | PROV-O for derivation only; eIDAS assurance in a dedicated layer |
| Q7 | DISAGREE | Adopt spike-then-scale; gate the remainder on the three-ODR crux |

**Closing (DA):** I have voted DISAGREE on all seven, as my mandate expects — but every one carries a *named, specific* condition under which I withdraw. That is the point. If the panel meets those conditions, the dissent collapses into a stronger proposal and is recorded as withdrawn. If it cannot meet the Q4 condition in particular, no amount of vocabulary tidiness rescues the ontology, because an ontology whose central endurant has no identity criterion is not an ontology — it is a schema with RDF syntax.
