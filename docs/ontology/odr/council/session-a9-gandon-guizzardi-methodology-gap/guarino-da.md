# Guarino (DA) — Position on the A9 methodology gap

## DA stance summary (one paragraph)

Both pure readings are wrong, and both for the same reason: each picks one half of *Formal Ontology and Information Systems* (Guarino 1998) and pretends the other half is decorative. Gandon's pure artefact-engineering reading collapses the conceptualisation onto the ontology — a shapes graph without a committed referent is just URI-flavoured naming, and *naming is not falsifiable*. Guizzardi's pure ontological-commitment reading is the inverse error: a UFO meta-category (Kind, Role, Phase, Relator, Quale-in-Region) assigned to a class without an *identity criterion stated over hard cases* is **typing**, not **committing**. I conceded this point against my own intuition in Session 001 Q1 (the diagnostic-exemplars amendment): an IC is unintelligible — untestable — without exemplars; a UFO label without an IC is unintelligible — untestable — without exemplars *for the same reason*. The discipline ODR-0001 must encode is therefore three-part for any ODR whose `kind` is `pattern` or `mapping`: (a) a UFO meta-category commitment per declared class, (b) an IC stated over named hard cases, and (c) the artefact realisation (URI / shape / graph composition). For `kind: methodology | architecture | programme`, requirement (b) is relaxed because these records are constitutively about artefact rather than about *what the world is like*. **Withdrawal condition (anchor):** the A9 amendment text MUST, for `kind: pattern | mapping`, require an explicit IC stated over named hard cases in `## Rules`. An ODR of those kinds that ships without it is non-ratifiable. Anything weaker — "UFO meta-category SHOULD be declared", "ICs are encouraged", "withdrawal-conditions track this informally" — leaves the methodology Guizzardi-flavoured in posture but Gandon-flavoured in enforcement, and I will hold dissent.

---

## Attack on Gandon's pure artefact-engineering reading

Gandon's reading is internally coherent and very seductive to a W3C-trained reader. It says: an ODR records *a decision about an artefact* (a URI, a namespace policy, a shapes graph, a SHACL severity scheme, an `owl:imports` chain, a DASH UI annotation). The decision is about what we *publish*, not about what the world is like. The shapes-graph cleanness argument he advanced in Scope-Check 1 Q6 — that ODR-0010 (Overlay Profiles) and ODR-0013 (SHACL Severity) are *one artefact decision* — follows from this reading directly: same shapes graph, same DASH integration, same severity scheme; therefore same ODR.

This reading is *partly right* and *partly fatal*, and I will attack the fatal part.

### The fatal part: pure artefact-engineering ODRs are unfalsifiable

Per *Formal Ontology and Information Systems* (Guarino 1998, §3 "Ontology and conceptualization"), an ontology is "a formal specification of a conceptualization". The conceptualisation is what the world is like; the ontology is what we *commit to* about the world. Two distinct artefacts can encode the same conceptualisation (RDF/XML vs Turtle vs JSON-LD); two formally identical artefacts can encode incompatible conceptualisations (the same `:Property rdfs:Class` line means different things in two ontologies if the referent's identity criterion differs). The artefact is the *consequence*; the conceptualisation is the *commitment*. Gandon's reading collapses these.

Test this directly on ODR-0005 (the IC crux). Imagine a pure-Gandon ODR-0005 that says, in its `## Rules`:

- Mint `opda:Property` under the `opda:` hash namespace.
- Mint `opda:LegalEstate` under the same namespace.
- Add `dash:uniqueValueForClass true` to `opda:uprn`.
- Add a SHACL co-reference shape between Property and LegalEstate.
- Forbid `owl:sameAs` across UPRN surfaces.

This ODR is *publishable*. It produces dereferenceable URIs, a valid shapes graph, a coherent SHACL severity report. Every Gandon-reading test passes: URIs resolve, the open-world TBox and closed-world shapes graph stay in their own files, the namespace stays flat.

And it is **unfalsifiable**.

Test it with the three exemplars from Session 001 Q4 (the demolition / subdivision / flat-with-split-UPRN cases). A pure-Gandon ODR-0005 *cannot tell you whether the resulting graph is right or wrong*, because it has not committed to **what `opda:Property` refers to**. Is it the physical built structure (so demolition retires it; rebuild creates a new one)? Is it the parcel (so demolition leaves it intact; the structure-on-it changes)? Is it the title's referent (so the parcel's structure is irrelevant)? Pure artefact-engineering does not say. The shapes graph fires no violations on any of these readings. The URI policy is silent. *The decision has not been made.*

This is what I objected to in Session 001 Q1: "Data model only, no instance data" is a category error because *a class is a unary property with an identity criterion, and an IC is unintelligible without exemplars*. The amendment that won — diagnostic exemplars admitted — is the same amendment I demand here, generalised: the identity criterion is the *test* of an ontological commitment. Without one, the commitment is just naming. Gandon's reading licenses naming-as-commitment, and that is the methodology fooled.

### The DCAP already concedes the load-bearing point against Gandon

DCAP's `kind` enum (DCAP.md §Frontmatter, Kind enum) distinguishes:

- `methodology` — "Decisions about how decisions are made"
- `architecture` — "Framework decisions"
- `pattern` — "Reusable modelling conventions"
- `mapping` — "Specific source→ontology mappings"
- `programme` — "Workplans, dependency graphs, roadmaps"

The very existence of `pattern` and `mapping` as distinct kinds is an *implicit Guizzardi-side commitment*: a "modelling convention" and a "source→ontology mapping" are not artefacts. The artefact is the SKOS scheme, the SHACL shape, the OWL class declaration. The `pattern` / `mapping` ODR is the *commitment about what these artefacts are about*. Gandon's reading cannot account for why `pattern` and `mapping` are separate kinds from `architecture` — under his reading they would all be one kind (`artefact-engineering`).

So Gandon's reading is already inconsistent with DCAP. The amendment must make this consistency explicit, not implicit.

### What Gandon *is* right about

He is right that not every ODR is a pattern-or-mapping commitment. ODR-0001 (this methodology) is a `methodology` ODR. ODR-0003 (the programme anchor) is a `programme` ODR. ODR-0004 (URI / namespace / generator policy) is largely an `architecture` ODR. *None of these need an IC over hard cases*, because they are not committing to what kinds of entities exist; they are committing to how the work is organised, named, and serialised. Demanding an IC of ODR-0001 would be a category error of my own. The amendment must respect this asymmetry.

---

## Attack on Guizzardi's pure ontological-commitment reading

Guizzardi's reading is harder for me to attack, because I broadly agree with him. UFO is the formal extension of DOLCE I most trust, and his Scope-Check 1 Q3 sub-finding (ODR-0011 should declare a UFO meta-category per scheme) is correct *in the abstract*. But "correct in the abstract" is the failure mode the methodology must guard against. I will attack the abstract.

### The fatal part: UFO meta-category without IC is decoration

Take Guizzardi's Q3 amendment as currently formulated: ODR-0011's `## Rules` will require each SKOS concept scheme to declare its UFO meta-category — Quale-in-Region, Role label, Phase label, method/plan code. Beautiful. UFO-clean. And — if it stops there — *useless*.

Consider `councilTaxBand` (A-I). Guizzardi will say: this is a **Quality Region** with **Qualia** as its members; the relation to a `Property` is `inheres-in` an individualised `councilTaxBandQuality` mode. Excellent UFO. Now ask the load-bearing question: *what is the identity criterion of a Quale-in-Region for `councilTaxBand`?* Is Band-E in 2010 the same Quale as Band-E in 2025 (it is not — the value bands have shifted)? Is Band-E in England the same Quale as Band-E in Wales (the schema's leaf description says "Band I relates to Wales only", which is a *signal* that the Region is jurisdictionally indexed, but ODR-0011 currently does not say so)? Is a "deleted" Band still a member of the scheme? Under what individuation does `skos:exactMatch` apply between two `councilTaxBand` schemes from different sources?

Without an IC, the UFO label is decorative. It produces no test that any reviewer, downstream consumer, or future maintainer can run. The same is true for `role` (a Role label — but what individuates a Role across time and party? if the Buyer becomes a Co-Owner, has the Role-instance changed?), for `participantStatus` (a Phase label — what individuates a Phase boundary? is it temporal, is it event-driven, is it the speech act of declaring it?), and most damningly for `evidence type` and `verification-method` (which are in ODR-0009's authoring scope but whose UFO category is currently under-declared).

This is the same attack I leveled at Guizzardi in Session 001 Q4 implicitly. He said `owl:hasKey` on the rigid Kind. I said: that is *typing*, not *committing* — UPRN is contingent, so `owl:hasKey (opda:uprn)` either fails (when UPRN is absent) or asserts identity over a non-identifier. Cagle's follow-up — "a rigid Kind with `owl:hasKey` is inert for a consumer whose record has no UPRN; mine produces a violation, what does yours *do*?" — went unrebutted by Guizzardi. The ungrounded UFO label is the same failure mode at scheme scale.

### Test the attack on ODR-0011 directly

Imagine ODR-0011 with Guizzardi's amendment landed but no IC requirement, ratifying tomorrow. Each scheme declares: `councilTaxBand` is Quale-in-Region; `role` is Role label; `evidenceType` is Phase label or method/plan code. The drafter who authors the schemes does *not* know:

- Whether Band-I (Wales-only) is the same Quale as Band-A (universal). If she models it as one Region, jurisdictional indexing is lost. If she models it as two Regions, the Wales/England merger is impossible.
- Whether `Seller` and `SellerOnSecondaryTitle` are the same Role-instance or distinct. Co-reference behaviour depends on this.
- Whether `documentEvidence` superseded by `electronic-evidence` is supersession-in-fact (the same evidential commitment under a new modality) or supersession-of-record (a new evidential commitment that retires the old). PROV-O traceability behaviour depends on this.

The UFO category does not constrain any of these decisions. The IC does. **Therefore the amendment that requires UFO meta-categories without ICs over hard cases is exactly the discipline Gandon would license under the artefact-engineering reading** — every scheme has a published label, no scheme has a falsifiable commitment.

### What Guizzardi *is* right about

He is right that the IC is not enough by itself either. The IC tells you what individuates an instance; the UFO meta-category tells you *what kind of thing it is in the first place* (a Substance, a Mode, a Relator, a Quale, a Role). The amendment needs *both*: the meta-category to fix what is being committed to, the IC to make the commitment falsifiable. My own DOLCE work (Masolo et al. 2003, the Endurant/Perdurant/Quality/Abstract taxonomy) is meaningless without the OntoClean meta-properties (Guarino & Welty 2009 — rigidity, unity, identity, dependence) that test whether the taxonomy is coherent. The DOLCE category is the *what*; OntoClean is the *test*. Guizzardi's UFO label is the *what*; the IC over hard cases is the *test*. The amendment must require both, and the test is load-bearing.

---

## What I think the methodology should say (concrete amendment)

Add the following subsection to ODR-0001 `## Rules` under §Session protocol, as a new clause numbered after rule 11 (Worker failure protocol). Place it before §Citation grounding so it is recognisably a per-session deliverable requirement, not a substrate matter.

> **Per-kind ODR commitment requirements.** What an ODR records depends on its declared `kind` (per DCAP §Frontmatter):
>
> - For `kind: pattern` and `kind: mapping`, the ODR's `## Rules` MUST include, for every class or scheme it declares or commits to:
>   - **(a) A UFO/DOLCE meta-category commitment.** State whether the class is a Substance Kind, a Role (RoleMixin / RoleType / Role-instance), a Phase, a Relator, a Mode, a Quality Region (with Qualia members), or an Abstract. Use the UFO ontological taxonomy as published in Guizzardi's *Ontological Foundations for Conceptual Modeling with Applications* (2005), Ch. 4; or, where the DOLCE taxonomy is more apt (Endurant / Perdurant / Quality / Abstract), use Masolo, Borgo, Gangemi, Guarino, Oltramari, *The WonderWeb Library of Foundational Ontologies* (D18, 2003), §3.
>   - **(b) An identity criterion stated over named hard cases.** State the IC of the class or scheme over at least the hard cases the relevant session's panel identified (e.g. ODR-0005's demolition / subdivision / merger / rebuild / first-registration; ODR-0011's per-scheme cross-overlay synonymy and jurisdictional indexing). The IC is the *test* of the meta-category commitment; without it the commitment is decorative.
>   - **(c) The artefact realisation.** URI minting, shape graph location, SHACL/DASH machinery, namespace, build composition. These remain load-bearing — Gandon's reading captures a real necessary condition — but they are insufficient.
>   - **Withdrawal-condition gate.** An ODR of `kind: pattern | mapping` whose `## Rules` does not state all three is not ratifiable; the Council session that produced it is incomplete. The drafting may proceed only with the gating items (a) and (b) deferred to a named follow-up session that gates downstream ODRs (precedent: ODR-0005 deferred 2-vs-3 cardinality and IC-over-hard-cases to a follow-up exemplar gate; ODR-0006/0007/0008 stay in planning until that gate clears).
>
> - For `kind: methodology`, `kind: architecture`, and `kind: programme`, requirements (a) and (b) are relaxed. These ODRs are constitutively about artefact, process, or organisation — they do not commit to what kinds of entities exist in the modelled domain. ODR-0001 (this methodology) is a `kind: methodology` exemplar — it does not declare a UFO category or an IC and is correct in not doing so. ODR-0003 (programme) and ODR-0004 (foundation / URI policy) are exemplars of the relaxed regime. *Where these ODRs incidentally make commitments about modelled-domain entities, those commitments are themselves `pattern`-level and must satisfy (a)–(c) inline or by reference to a `pattern` ODR that does.*
>
> **Enforcement.** `odr-review` checks `kind: pattern | mapping` records for the presence of (a) and (b) in `## Rules` (lint: any class or scheme declared without a stated UFO/DOLCE category OR without an IC over named hard cases is non-conforming). The lint is a *warning* on first commit and a *blocker* on `status: accepted`. The check is text-pattern based per DCAP's prose-profile discipline; full SHACL-shape enforcement is out of scope per DCAP §Purpose.

This amendment text is calibrated to the discipline ODR-0005 *already* practices — it generalises an existing precedent into a methodology rule. It does not invent new machinery; it makes normative what the panel has already done by hand on the hardest record in the corpus.

---

## Withdrawal condition (explicit per ODR-0001 §Roles)

I withdraw dissent if and only if the methodology amendment that lands has all four of the following:

1. **The kind-distinction is explicit.** The amendment names `pattern` and `mapping` as the kinds bound by the stricter requirement, and explicitly relaxes the requirement for `methodology`, `architecture`, `programme`. A blanket "all ODRs must state UFO category and IC" amendment is wrong (it would imply ODR-0001 itself is non-conforming, which it is not). A blanket "ODRs SHOULD state UFO category and IC where applicable" amendment is also wrong (it relaxes the load-bearing test into a courtesy).

2. **IC over named hard cases is MUST, not SHOULD.** For `kind: pattern | mapping`, the IC requirement is normative (MUST), not advisory (SHOULD). Per RFC 2119 / BCP 14 conventions. SHOULD-level discipline is precisely the failure mode I am attacking on the Guizzardi side: it licenses UFO labels without the test that makes them falsifiable.

3. **The hard cases are *named*, not gestured at.** The amendment requires the ODR's `## Rules` to *name* the hard cases the IC is stated over (precedent: ODR-0005 names demolition / subdivision / merger / rebuild / first-registration; ODR-0011's amendment, when it lands, must name per-scheme hard cases — Band-I-Wales vs Band-A-universal for `councilTaxBand`; Seller-vs-SecondaryTitle-Seller for `role`). An IC stated over an unnamed "the relevant hard cases" is no IC.

4. **`odr-review` lint is configured to enforce (a) and (b) on `status: accepted`.** Lint as advisory on `proposed`; lint as blocker on `accepted`. Without this enforcement step the methodology rule is a polite request rather than a methodology rule.

If the amendment text that lands meets all four conditions, I withdraw on this session.

**If any of the four is missing — particularly if (2) lands as SHOULD or (3) admits unnamed hard cases — I hold dissent.** The held-dissent record should read:

> **Guarino DA holds dissent on A9 amendment.** The amendment licenses UFO meta-category declarations without identity criteria over named hard cases as ratifiable in `kind: pattern | mapping` ODRs. This recapitulates the precise failure mode my Session 001 Q1 amendment (diagnostic exemplars admitted) was designed to prevent: a TBox whose ICs never meet exemplars is unfalsifiable. The amendment is Guizzardi-flavoured in posture but Gandon-flavoured in enforcement — the worst of both readings. Withdrawal condition: re-amend with MUST-level IC requirement over named hard cases for `kind: pattern | mapping`, enforced by `odr-review` lint at `status: accepted`. Until then, future `kind: pattern | mapping` ODRs ratified under the weaker amendment are flagged as carrying my held dissent on identity-criterion discipline.

---

## Procedural attack — process gaps the panel may have missed

Three procedural concerns the panel should not skip.

### 1. A9 is itself a `kind: methodology` deliberation — apply the relaxed rule to its own output

This session amends ODR-0001 (`kind: methodology`). Per the amendment I propose, ODR-0001 is *not* required to state UFO categories or ICs over hard cases. Good — that would be circular. *But* the amendment ODR-0001 *produces* governs every future `kind: pattern | mapping` ODR. The panel should recognise that A9 is a meta-Council with high downstream leverage: 12 more sessions are queued in `docs/plan/council-followup-sessions.md`, most producing `kind: pattern` or `kind: mapping` ODRs. The amendment must be calibrated for them, not for the methodology-internal case it is being written in.

The procedural risk: drafting an amendment that is *easy to land in ODR-0001* (a `methodology` record where laxity feels natural) but *hard to enforce on ODR-0011 / 0006 / 0008 / 0009 / 0012* (pattern records where laxity will be costly). The Queen (Kendall) should pressure-test the amendment text against the next three queued `kind: pattern` sessions (S006 Agents & Roles, S008 Property descriptive attributes, S011 Enumerations) before ratifying it. Does the amendment text *bite* on those? If not, it is theatre.

### 2. The existing kind enum's prose semantics in DCAP §Frontmatter Kind enum are load-bearing — read them

DCAP §Frontmatter, Kind enum, already says:

- `pattern` = "Reusable modelling conventions (SKOS for enumerations, identity criteria, role/view pattern)"
- `mapping` = "Specific source→ontology mappings (PDTF clause to ontology fragment)"

The phrase "identity criteria" appears *inside* the `pattern` definition. This is not coincidental — it is a signal that the DCAP authors (in setting up the kind enum) had IC commitments in mind for `pattern` records. A9 should *invoke* this existing prose, not re-litigate it. The amendment lands as a *strengthening of an existing implicit commitment*, not an invention from nothing. This is the strongest defence against the panel watering the amendment down to SHOULD-level: the DCAP prose already names ICs as constitutive of `pattern` records; A9 is making explicit what DCAP made implicit.

### 3. Meta-Council numbering — A9 vs scope-check-3

Scope-Check 1 numbered the amendments A1 through A9 (with A9 the one routing this gap back). The convening block for *this* session calls it "Session A9" — fine as a referent, but it is procedurally a *meta-Council on ODR-0001* per ODR-0001 §Meta-Council type, which would be `scope-check-3-<slug>.md`. The filename `session-a9-gandon-guizzardi-methodology-gap.md` is non-conforming with the §Meta-Council type filename pattern (`scope-check-N-<slug>.md`). Either:

(a) treat A9 as a single-question Reduced Council with `kind: methodology` output (current convening), and accept the filename irregularity *for this one session* with a note;

(b) rename to `scope-check-3-gandon-guizzardi-methodology-gap.md` and renumber the amendments it produces as C1, C2, etc.

Procedurally, (b) is more honest — A9 is a meta-deliberation on the methodology, which is exactly what §Meta-Council type addresses. The Queen should resolve this in the synthesis. *This is not a held-dissent matter; it is a procedural cleanup the panel may have skipped.* But: if the panel treats A9 as a Full or Reduced Council producing a session transcript (not a scope-check), then by §Session protocol rule 11 the working files belong at `working/session-a9-<slug>/` not `working/scope-check-3-<slug>/`. The current path (`session-a9-gandon-guizzardi-methodology-gap/`) is at least internally consistent with (a). If the Queen ratifies (b) in the synthesis, file moves follow.

### 4. The Reduced Council format chosen for A9 is appropriate — but the panel composition is the load-bearing decision

A9 is convened as Reduced Council, one question, Agent fan-out. Per §Format tiers, Reduced Council suits "amendment / ratification-with-targeted-disputes". The amendment is targeted; the dispute is between two named positions (Gandon vs Guizzardi). The format is right.

But the panel composition for a Reduced Council is the load-bearing decision. The convening block has me (Guarino) as DA, the Queen presumably Kendall, and one or two panellists (presumably Gandon and Guizzardi as the named disputants; Allemang or Hendler may be the additional standing-panel voice). My procedural concern: *the DA selection criterion (load-bearing) requires the DA's published methodology be genuinely opposed to the framing the proposition carries*. My published methodology is *neither* purely Gandon-side nor purely Guizzardi-side — it is the synthesis I am proposing here. That is a methodology-internal tension. The strongest DA selection would have been *Davis* (BBC publish-first / time-box) against the IC discipline, on the grounds that the discipline I demand will slow Phase 1 down. The panel should know this: my DA position pushes the methodology *toward* the harder discipline; a Davis DA would push it *toward* relaxation. *Both attacks have to land for the amendment to be tested.* If the Queen has already taken Davis's "13 ODRs is twice the work" framing on board from Scope-Check 1 Q1 (the held dissent in plan §9 risks), the relaxation pressure is in the record but not in this session. The panel should note that the absence of a relaxation-side DA in A9 is itself a procedural risk — the amendment may be tested only on the strict side, and land stricter than the programme can sustain.

This is not a held-dissent matter; it is a procedural acknowledgement for the synthesis.

---

## Coda — why this matters for the 12 sessions to come

The OPDA programme has 12 more sessions queued (per `docs/plan/council-followup-sessions.md`). Of those:

- S005 (the IC-crux follow-up) is already gated on Guarino-discipline (the three exemplars).
- S006 (Agents & Roles), S007 (Transactions & Lifecycle), S008 (Property descriptive attributes), S009 (Claims & Evidence), S011 (Enumerations), S012 (Data Governance), S015 (Address & Geography) — all `kind: pattern`. All will produce ODRs whose ratifiability depends on what A9 lands.
- S010 (Overlay Profiles), S013 (SHACL Severity) — `kind: pattern` with strong artefact flavour; the Gandon-vs-Guizzardi split is genuinely live here.
- S014 retired; S016 deferred.

Whichever amendment lands on A9 governs the discipline applied to ≥7 future ODRs. If A9 lands SHOULD-level, those ODRs will accumulate as UFO-labeled artefact bundles without falsifiable commitments — and the OPDA ontology will be a schema with RDF syntax, not an ontology. If A9 lands MUST-level on `kind: pattern | mapping`, the IC discipline will gate every one of them — and the methodology will be *harder to fool*. That is the only outcome I withdraw on.

My DA job is to make the methodology harder to fool. The panel's job is to weigh that against programme tractability. If the panel decides MUST is too strict and SHOULD is the live amendment, **I hold dissent and the held-dissent record stands above** — because silent alignment is itself a methodology violation. The amendment that licenses Guizzardi-posture-without-Guarino-test produces records the next-decade reader cannot interrogate. I have seen enough TBoxes whose ICs never met an exemplar. I will not bless another one.

---

*Guarino (DA), Session A9, 2026-05-27.*

*Citations grounded per ODR-0001 §Citation grounding: Guarino 1998 (Formal Ontology and Information Systems); Masolo, Borgo, Gangemi, Guarino, Oltramari 2003 (WonderWeb Library of Foundational Ontologies, D18 — DOLCE); Guarino & Welty 2009 (OntoClean — meta-properties methodology); Guizzardi 2005 (Ontological Foundations for Conceptual Modeling with Applications, Ch. 4 — UFO); Session 001 Q1 amendment (diagnostic exemplars admitted) and Q4 IC requirement (this corpus); ODR-0005 §Rules and §Gate conditions (this corpus); ODR-0011 §Rules (this corpus); DCAP.md §Frontmatter Kind enum (this corpus); Scope-Check 1 Q6 verdict and A9 amendment routing (this corpus).*
