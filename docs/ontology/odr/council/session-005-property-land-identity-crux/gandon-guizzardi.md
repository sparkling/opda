# Gandon + Guizzardi — formal-pair on S005

*Joint pair voice. **Guizzardi-led** on Q1–Q3, Q5, Q6, Q7 (UFO meta-category commitments + IC discipline + Endurant kinds + Role/Mode separation — this session is fundamentally UFO/DOLCE territory). **Gandon-led** on Q4 (W3C inference discipline; `owl:sameAs` semantics; SHACL/DASH key mechanism) and Q8 (artefact realisation / programme consequence). Pair-joint stance throughout — Guizzardi is the **essential voice** on this session per the S005 convening; Gandon supplies the W3C-grounded artefact discipline that operationalises the UFO commitments.*

## Stance summary

ODR-0005 is `kind: pattern`. Per the A9 amendment we co-authored (landed 2026-05-27, Reduced Council, Queen Kendall, DA Guarino — withdrew on all four conditions met), `## Rules` of a `pattern` ODR MUST state (a) a UFO/DOLCE meta-category commitment, (b) an IC over named hard cases, (c) the artefact realisation. ODR-0005 as drafted has (c) (the SHACL/DASH uniqueness + PROV succession machinery) but (a) and (b) are still gated — the four "gate conditions" in `## Rules` are precisely the (a) and (b) the A9 amendment now requires inline. This session discharges that gate.

The substantive ask is to **commit `opda:Property` and the legal counterpart(s) to DOLCE Endurant with UFO sub-kinds, state ICs over the named hard cases (demolition / subdivision / merger / replacement for the physical thing; closure / merger / transfer between registers for the legal thing), and settle the 2-vs-3 class cardinality the three exemplars exist to decide.** Our pair carries a settled position from S001 Q4 that has not been weakened by the intervening work: **three classes** — `opda:Property` (physical Substance Kind, IC = spatial-material continuity over the hard cases), `opda:LegalEstate` (legal/institutional Kind, IC = the bundle of rights vested at a point in title-register history), `opda:RegisteredTitle` (registry-record Kind, IC = the title-number-scoped record with its own lifecycle: opened / closed / merged / transferred). The two-class collapse (Allemang) folds the legal-record lifecycle into the legal-estate lifecycle and loses the multi-title-flat case the exemplar exists to test.

What is at stake for UFO theory if S005 settles wrong is the readability of the entire downstream programme. If `Property` and `RegisteredTitle` are not committed to Endurant with stated ICs over hard cases, **A9's per-kind discipline becomes a paper rule** — the very first `kind: pattern` ODR to discharge under the amendment fails to do what the amendment requires. The downstream module ODRs (0006 Agents & Roles, 0007 Transactions, 0008 Descriptive attributes, 0015 Identity Crux follow-on) inherit the methodology; if the A9 pressure-test fails here, every downstream ODR's UFO commitment is rebuttable on the precedent.

The depth questions we own are Q1 (Endurant commitment + sub-kind), Q2 (IC for Property — the Guizzardi 2005 + Guarino-OntoClean joint stance on spatial-material continuity over the hard cases), Q3 (IC for the legal layer — the title-register-record lifecycle Hendler named in S001 Q4), Q4 (the W3C inference discipline around UPRN, where Cagle's unrebutted challenge to me must be answered head-on), and Q6 (Address-as-Mode-of-presentation, which is the Guarino DA hill if S005 collapses Address into a key). Q5 (2-vs-3) is the cardinality question the exemplars decide; Q7 (exemplar pass) is the mechanical IC test; Q8 (gate clearance + downstream consequence) is the programme-management consequence of the depth verdicts.

## Per-question positions

### Q1 — Endurant commitment

**Guizzardi (lead).** Both classes commit to DOLCE Endurant — and the UFO sub-kind matters. Per Guizzardi 2005, *Ontological Foundations for Conceptual Modeling with Applications*, Ch. 4 (the UFO meta-category taxonomy carried through the UFO 2007/2011/2015 lineage), Endurant is the supercategory that "exists in time with all its parts present at every moment of its existence" — distinguished from Perdurant (events/processes, which extend in time and have temporal parts). DOLCE's Endurant (Masolo, Borgo, Gangemi, Guarino, Oltramari 2003, *The WonderWeb Library of Foundational Ontologies*, D18) is the equivalent meta-category; the A9 amendment admits either as acceptable.

The sub-kinds:

- **`opda:Property` — UFO Substance Kind (Endurant, Sortal, Rigid, supplies own IC).** A Substance Kind is the canonical UFO category for a Sortal that is rigid (an instance cannot cease to be a member without ceasing to exist) and supplies its own identity criterion. Property meets all three: a dwelling cannot stop being a Property without ceasing to exist as that dwelling; it is rigid; and it carries its own IC (spatial-material continuity — discharged in Q2). This is the canonical mapping for a physical real-property unit.

- **`opda:LegalEstate` — UFO Substance Kind (Endurant, Sortal, Rigid, supplies own IC).** A legal estate (freehold; leasehold; commonhold) is a *bundle of legal rights vested at a point in registry history*. It is itself an Endurant — it persists through time as the same individual rights-bundle (subject to registry events that modify it). It is Rigid: an instance cannot cease to be a LegalEstate without ceasing to exist (the rights-bundle either is the rights-bundle or it is dissolved). It is Sortal: it provides a counting principle. It carries its own IC (the bundle of rights vested + the time-indexed history — discharged in Q3).

- **`opda:RegisteredTitle` — UFO Substance Kind (Endurant, Sortal, Rigid, supplies own IC).** A registered title is the *title-register record* — the document, the title number, the registry-side lifecycle (opened on first registration; closed on merger / amalgamation; transferred between HM Land Registry districts; reissued on title-plan correction). It is itself an Endurant, persisting through time as the same registry record. It is Rigid: a RegisteredTitle cannot stop being a RegisteredTitle without ceasing to exist as that record (the title number may be retired, but the record itself persists in the registry's audit trail). It is Sortal. It carries its own IC (title-number lineage + registry-event history — discharged in Q3).

The temptation that must be resisted is to commit `RegisteredTitle` to UFO Mode (a particularised quality inhering in `LegalEstate`). That would make it dependent on LegalEstate for its identity, which contradicts the registry-record lifecycle: a RegisteredTitle is opened *before* the LegalEstate is vested (during first registration, the record exists while the estate is being conveyed). It is closed *after* the LegalEstate is dissolved (the registry retains the record for audit even after the estate is gone). The Mode-of-LegalEstate framing fails the temporal-extent test.

**Gandon.** Concur with the three-Substance-Kind commitment. The W3C-side grounding is the requirement that each Endurant Kind has a stable URI lineage (per *Cool URIs Don't Change*, Berners-Lee 1998) and a dereferenceable identity (per LDP Principle 3 per Heath & Bizer 2011, Ch. 2). The URI architecture from ODR-0004 (single `opda:` hash namespace; layer-segregated CamelCase for Sortal Kinds) accommodates the three Kinds trivially: `opda:Property`, `opda:LegalEstate`, `opda:RegisteredTitle` are all CamelCase Sortal-Kind nouns in the same namespace; the URI shape itself labels the Kind discipline.

**Pair vote on Q1.**

- **Gandon vote: FOR three-Endurant-Substance-Kind commitment** — `opda:Property`, `opda:LegalEstate`, `opda:RegisteredTitle` each commit to DOLCE Endurant as UFO Substance Kinds with their own URI in the layer-segregated `opda:` hash namespace per ODR-0004 Rule 2.
- **Guizzardi vote: FOR three-Endurant-Substance-Kind commitment** — same. The UFO sub-kind for each is Substance Kind (Sortal, Rigid, supplies own IC), not Role (which is anti-rigid), not Phase (which is intra-Kind), not Mode (which is existence-dependent on a bearer), not Relator (which mediates between Kinds).

---

### Q2 — IC for physical Property

**Guizzardi (lead).** The IC of `opda:Property` is **spatial-material continuity**, stated explicitly over the named hard cases drawn from the three exemplars and the Q4 S001 panel's stated cases (demolition, subdivision, merger, replacement). Per Guarino & Welty 2002/2009 (OntoClean meta-properties), an IC must be *testable* — it must give a determinate yes/no answer over a set of hard cases the modeller declares. Vague "the same dwelling" is not an IC; the OntoClean discipline forbids it.

The IC, stated:

> A `opda:Property` *p₁* at time *t₁* and a candidate-individual *p₂* at time *t₂ > t₁* are the same individual iff there is a spatial-material continuity chain from *p₁* to *p₂* under the following rules over the hard cases:
>
> 1. **Demolition.** If the built structure of *p₁* is entirely demolished and the site is left bare, *p₁* ceases to exist; any replacement built structure on the same site is a new `opda:Property` *p₃*. (Site ≠ Property under UFO; Site is a separate Endurant Kind, deferred to ODR-0015 if modelled.)
> 2. **Subdivision.** If *p₁* is subdivided into two or more new physical units (e.g. a house split into flats), *p₁* ceases to exist; each new unit is a new `opda:Property` *p₂*, *p₃*, … with `prov:wasDerivedFrom` chains to *p₁*.
> 3. **Merger.** If *p₁* and *p₂* (adjacent properties) are merged into one new physical unit (e.g. two flats knocked into one), *p₁* and *p₂* cease to exist; the merged unit is a new `opda:Property` *p₃* with `prov:wasDerivedFrom` chains to both *p₁* and *p₂*.
> 4. **Replacement.** If the built structure of *p₁* is entirely rebuilt on the same site with substantially the same footprint and function (e.g. extension that consumes the original house), the IC is *contested*: the OntoClean discipline admits two readings. The Council names the default: the rebuilt structure is a new `opda:Property` (matching the demolition case); a heritage exception may be carved out via SHACL profile on listed buildings (ODR-0010 territory).
> 5. **Boundary modification.** If *p₁*'s legal boundary is modified (e.g. easement granted; transfer of part) but the built structure and site are unchanged, *p₁* persists. The IC is *physical*, not *legal*; the boundary change affects `opda:LegalEstate`, not `opda:Property`.

This IC is testable: any maintainer reading the rule and a candidate case can produce a determinate answer. It gives the right answer for the three exemplars (registered freehold house: no hard case fires, same Property; unregistered house: no hard case fires, same Property persists even when legal layer attaches; flat-with-split-UPRN: building was subdivided pre-flat, the flat *is* one of the new units from a subdivision case, so it is a new Property `prov:wasDerivedFrom` the pre-subdivision building — and its identity persists across UPRN re-numbering because UPRN succession is administrative, not physical).

The DOLCE grounding is Masolo et al. 2003 §3 (Endurants and their identity criteria — material objects are identified by their spatial-material continuity through time). This is the canonical foundational-ontology mapping; OPDA inherits it rather than inventing.

**Gandon.** Concur on the IC content; the W3C-side concern is that the IC be *encoded* in the artefact, not just stated in the ODR. The IC discharge lives in two places: (i) `rdfs:comment` on `opda:Property` stating the IC verbatim, with `dct:source` to ODR-0005's `## Rules`; (ii) the SHACL shapes graph for `opda:Property` referencing the IC via `dct:references` and the diagnostic-exemplar harness (per ODR-0004 §8a, the exemplars are CI regression tests against the IC). The IC becomes part of the artefact's persistent semantic surface, not just an ODR prose statement.

**Pair vote on Q2.**

- **Guizzardi vote: FOR the five-rule IC** — spatial-material continuity over demolition / subdivision / merger / replacement / boundary-modification; OntoClean-discipline grounded; tested against the three exemplars; DOLCE Endurant identity.
- **Gandon vote: FOR the five-rule IC + artefact-encoding requirement** — IC stated as `rdfs:comment` on `opda:Property` with `dct:source` to this ODR; exemplars wired as CI regression tests per ODR-0004 §8a.

---

### Q3 — IC for LegalEstate / RegisteredTitle

**Guizzardi (lead).** Two distinct ICs because two distinct Kinds:

**`opda:LegalEstate` IC.** A LegalEstate *e₁* at time *t₁* and a candidate-individual *e₂* at time *t₂ > t₁* are the same individual iff the bundle of rights vested has not been dissolved (and re-vested as a new estate). Stated over the hard cases:

1. **Estate transfer.** When a freehold is transferred from proprietor A to proprietor B, the *same* `opda:LegalEstate` persists; proprietorship is a Role borne by different bearers across time (per ODR-0006). The estate's identity is the bundle of rights vested, not who holds them.
2. **Estate enlargement.** A leasehold enlarged into a freehold (rare; statutory conditions) is a new `opda:LegalEstate` — the rights-bundle has changed kind. `prov:wasDerivedFrom` chains the new estate to the old.
3. **Estate determination.** A leasehold determined on lease expiry ceases to exist; the freehold reverts to the freeholder (who already exists as a separate `opda:LegalEstate`).
4. **Charges and easements.** These do not change the estate's identity; they are Modes inhering in it (per UFO Mode — a quality particularised in the bearer estate).
5. **First registration.** A *previously-unregistered* LegalEstate (which existed as a common-law estate prior to registration) persists as the same individual when registration completes; first registration is a *registry-side event*, not an estate-side change.

**`opda:RegisteredTitle` IC.** A RegisteredTitle *t₁* at time *τ₁* and a candidate-individual *t₂* at time *τ₂ > τ₁* are the same individual iff the title-register record has the same title-number lineage. Stated over the hard cases:

1. **Title opening (first registration).** A new RegisteredTitle is *opened* — `prov:wasGeneratedBy` a registration activity. This is the registry-side event Hendler named in S001 Q4 as "a third entity with its own lifecycle."
2. **Title closure.** A RegisteredTitle can be *closed* — when the estate is amalgamated with another (the title is closed; a new title is opened for the amalgamation); when the estate is determined; when administrative reasons require (e.g. title plan was corrupt and replaced). Closure is a registry-side event; the LegalEstate it recorded may persist (under a new title) or cease (if the estate was determined).
3. **Title merger.** Two RegisteredTitles can be merged into one (the registry's amalgamation procedure). The two source titles are closed; one new title is opened with `prov:wasDerivedFrom` chains to both. **This is the multi-title-flat case** — the flat-with-split-UPRN exemplar's leasehold title (`TGL654321`) is one registered title; the underlying freehold of the building is a *separate* registered title for a *separate* legal estate (the freeholder's estate in the building). The two titles cannot be collapsed.
4. **Title transfer between registers.** A title can move between HM Land Registry districts (rare, but possible on administrative re-zoning). The title-number changes; `prov:wasDerivedFrom` chains the new title-number to the old; the underlying LegalEstate persists.
5. **Title reissue on corrupt-plan replacement.** The title-record is reissued under a new title-number; same `prov:wasDerivedFrom` discipline; same LegalEstate.

The crucial UFO claim: **RegisteredTitle is NOT a Mode of LegalEstate.** A Mode is existence-dependent on a bearer; a RegisteredTitle exists before its LegalEstate is vested (during the first-registration period, the record is being opened while the estate is being conveyed) and after its LegalEstate is dissolved (the registry keeps the closed-title record for audit). The dependence relation runs the other way: a LegalEstate, *if it is registered*, has a RegisteredTitle that records it, but the LegalEstate's identity does not depend on the RegisteredTitle (proven by the unregistered-house exemplar — the LegalEstate exists at common law without any RegisteredTitle).

**The unregistered-house exemplar is the load-bearing test.** Under the 2-class collapse (Allemang), the unregistered house has no legal counterpart at all (no RegisteredTitle = no `opda:LegalEstate` = ontological hole). Under the 3-class split (us, Hendler), the unregistered house has a `opda:LegalEstate` (the common-law freehold the owner-occupier has held for decades) but no `opda:RegisteredTitle`. The 3-class split is the only modelling that gives the unregistered case a coherent answer; the 2-class collapse forces us to either fabricate a RegisteredTitle (false) or omit the LegalEstate (loses the common-law estate's existence). This decides Q5.

**Gandon.** Concur. The W3C-side grounding for the title-register-record-as-its-own-Kind is the LDP / dereferenceability discipline (Heath & Bizer 2011, Ch. 2 Principle 3): a RegisteredTitle has its own URI (`opda:RegisteredTitle` class; instance URIs at `opda:registeredTitle/<titleNumber>` pattern); HMLR's title-register record is a separate dereferenceable thing from the underlying estate. The IC discipline gives the registry-record its own audit trail in the linked-data graph, which matches the registry's own discipline (HMLR holds the record; the title is the record).

**Pair vote on Q3.**

- **Guizzardi vote: FOR distinct ICs for `opda:LegalEstate` and `opda:RegisteredTitle`** — five hard cases each; LegalEstate IC = rights-bundle persistence + estate-determination rules; RegisteredTitle IC = title-number lineage + registry-event history; RegisteredTitle is **not** a Mode of LegalEstate (proven by temporal-extent test + unregistered-house exemplar).
- **Gandon vote: FOR distinct ICs + URI/artefact discipline** — each class gets its own URI in the `opda:` hash namespace; each carries `rdfs:comment` with the IC verbatim and `dct:source` to ODR-0005; SHACL shapes target each class independently.

---

### Q4 — UPRN status

**Gandon (lead).** UPRN is **both** — a checkable SHACL/DASH key (operationally primary) **and** a contingent administrative identifier under PROV-O succession (ontologically correct). The two are not in tension; they are at different levels of the artefact stack.

The W3C-grounded position. Per RDF 1.1 Concepts §1.5 (W3C Recommendation, 2014) and Hayes & Patel-Schneider, *RDF 1.1 Semantics* (W3C Recommendation, 2014), `owl:sameAs` propagates irreversibly under reasoning: from `<A> owl:sameAs <B>` and `<A> rdfs:label "X"`, a reasoner derives `<B> rdfs:label "X"`. Every triple about A becomes a triple about B. This is *desirable* when A and B genuinely identify the same resource (the OWL semantics); it is *catastrophic* when A and B are records about the same thing from different contexts that should remain distinguishable (the `verifiedClaims` context, the BASPI5 context, the conveyancing context). The unanimous S001 Q4 rejection of `owl:sameAs` across UPRN surfaces is grounded in this irreversibility.

The Cagle challenge in S001 Q4 — "`owl:hasKey (opda:uprn)` is inert when UPRN is absent; my SHACL/DASH `dash:uniqueValueForClass` fires a violation report and degrades gracefully; what does yours *do*?" — went unrebutted to me (Guizzardi) at S001. I rebut it here, head-on. Cagle's challenge is *correct*. `owl:hasKey` is an OWL-inference license — it allows a reasoner to infer co-reference when two individuals share the same UPRN. It does *nothing* operationally when UPRN is absent (the unregistered-house exemplar). The SHACL/DASH `dash:uniqueValueForClass true` constraint on `opda:uprn` is the primary, *checkable* mechanism: when UPRN is present and duplicated, it fires `sh:Violation`; when UPRN is absent, the constraint vacuously passes (degrades gracefully). This is precisely what ODR-0005 Rule 3 already states; Cagle wins on the operational point.

The deeper point I (Guizzardi) want to make beside Cagle's: `owl:hasKey` is not the *identity criterion*. The IC is spatial-material continuity (Q2); UPRN is a *contingent administrative identifier* assigned by Ordnance Survey AddressBase that may be retired / split / merged / reissued. The flat-with-split-UPRN exemplar proves this: the same physical Property persists across UPRN re-numbering (`opda:previousUPRN "100000000111"` → `opda:uprn "100000000222"`); the UPRN succession is administrative, not identity. PROV-O is the right framework: `<property> opda:uprn "100000000222"`; the succession event is reified as `opda:UPRNSuccessionEvent` (per the flat-with-split-UPRN exemplar lines 32-38) with `prov:wasDerivedFrom` chaining the new UPRN to the predecessor. This is the canonical PROV-O pattern for identifier succession (Moreau & Missier 2013, *PROV-O Recommendation*, §3 on `prov:wasDerivedFrom`).

The two levels coexist:

- **Artefact level (operational).** `dash:uniqueValueForClass` SHACL constraint on `opda:uprn` *for the SHACL shapes graph* — checkable, degrades gracefully, primary mechanism.
- **Ontological level (commitment).** UPRN is a *Quality* of the Property (UFO Quality — a property that can be measured / assigned / changed), inhering in the Property via UPRN-assignment events recorded with PROV-O. The IC of the Property is spatial-material continuity (Q2); UPRN is a Quality that may change while the IC continues to identify the same individual.

**`owl:hasKey (opda:uprn)`** is admissible as a *secondary* OWL-inference license under one strict precondition: it applies only when UPRN is *present* on both sides. The OWL reasoner that uses `owl:hasKey` will infer co-reference when both individuals carry the same UPRN; it will not fire when one or both lack UPRN. This is acceptable as a *secondary* annotation (matches ODR-0005 Rule 4 as drafted) but it is **not** the primary mechanism and it is **not** the IC. ODR-0005's Rule 4 as drafted ("`owl:hasKey` is optional/secondary — a semantic annotation valid only where UPRN is truly identifying") states this correctly. The anti-pattern is using `owl:hasKey` as the *sole* identity mechanism (ODR-0005 Anti-patterns §2 — "`owl:hasKey (opda:uprn)` as the *sole* identity mechanism (inert when UPRN is absent — Cagle's unrebutted challenge to Guizzardi)").

**Guizzardi.** Concur with Gandon's W3C-grounded position. The UFO reading is consistent: UPRN is a UFO Quality (the value of a measurable property of the Property, akin to "weight" or "area" but assigned by an external authority rather than measured). The Quality is contingent on the assignment event; the Property's identity is not contingent on the Quality. The PROV-O succession chain reifies the assignment-event sequence; the IC is independent of it.

**Pair vote on Q4.**

- **Gandon vote: FOR both — SHACL/DASH operational key + PROV-O contingent identifier with succession.** The two levels are at different artefact strata; SHACL is the runtime check (degrades gracefully — Cagle wins on the operational point); PROV-O is the historical-record discipline. `owl:hasKey` admissible as secondary OWL-inference license only when UPRN is present; never the sole mechanism.
- **Guizzardi vote: FOR both + concession on Cagle's challenge.** I conceded the operational point in this position file. UPRN is a UFO Quality, not the IC; succession is `prov:wasDerivedFrom`; the spatial-material continuity IC (Q2) is the real identity.

---

### Q5 — 2- vs 3-class split

**Guizzardi (lead).** **Three classes.** `opda:Property` (physical), `opda:LegalEstate` (legal-institutional), `opda:RegisteredTitle` (registry-record). The unregistered-house exemplar is the load-bearing case; the multi-title-flat exemplar reinforces.

The argument from the unregistered-house exemplar (`unregistered-pre-first-registration-house.ttl`). The exemplar deliberately has:

- One `opda:Property` (the cottage at 7 Old Lane, no UPRN, `opda:isFirstRegistration true`).
- **No** RegisteredTitle individual (registration has not completed).
- The exemplar's `skos:scopeNote` states: "the right answer is one physical Property — and it must persist as the same individual when first registration later completes and a LegalEstate/RegisteredTitle subsequently appears."

Under the 2-class collapse (Allemang's `Property` + `LegalEstate`), what is the LegalEstate here? Either:

1. **It is omitted** — the owner-occupier has no LegalEstate in the graph until registration completes. This is *false*: the owner has a common-law freehold that they have held for decades; the absence of registration does not mean the absence of the estate. The 2-class collapse forces us to either lie (omit the estate) or fabricate a registration that has not happened. Both are wrong.
2. **It is collapsed with the registration record** — the LegalEstate *is* the registration record, so the unregistered house has no LegalEstate. Same problem.

Under the 3-class split:

- One `opda:Property` (the cottage).
- One `opda:LegalEstate` (the common-law freehold the owner has held; UFO Substance Kind; IC = rights-bundle persistence; exists at common law without registration).
- **No** `opda:RegisteredTitle` (registration has not completed; the registry record does not exist yet).
- When first registration later completes, a new `opda:RegisteredTitle` is created with `prov:wasGeneratedBy` the registration activity; it `opda:identifiesSameProperty` the Property; it records the LegalEstate; the LegalEstate persists as the same individual through the registration event.

The 3-class split is the only modelling that gives the unregistered-house case a coherent answer.

The argument from the multi-title-flat exemplar (`flat-with-split-uprn.ttl`). The exemplar's leasehold title (`TGL654321`) is one RegisteredTitle covering one LegalEstate (the leasehold of the flat). The freehold of the building is a *separate* RegisteredTitle covering a *separate* LegalEstate (the freeholder's estate in the building). One physical Property (the flat); two LegalEstates that overlap on it (the leasehold of the flat + the freehold's reversion); two RegisteredTitles that record the two LegalEstates. The 2-class collapse cannot represent this: there is no way to have two `LegalEstate`s where one of them is the registry-record and the other is the common-law-or-statutory rights-bundle they record. The 3-class split represents it natively.

The Kendall/FIBO LegalEntity/LEI pattern (alternative in ODR-0005 §Alternatives — "one `opda:Property` Kind with alternative identifiers + SHACL co-reference") is **not** the same situation. The FIBO LEI pattern keys one Kind (`LegalEntity`) by alternative identifiers (LEI, EIN, CRN, etc.) — it is about *multiple identifier schemes for one Kind*, not *multiple Kinds with different lifecycles*. The Property identity crux is about the latter. Kendall's S001 Q4 position misapplied the FIBO pattern here; the 3-class split is the right move.

**Gandon.** Concur. The W3C-side grounding: three Kinds means three URI types in the `opda:` hash namespace, each with its own SHACL shape, each with its own IC stated as `rdfs:comment` + `dct:source` to ODR-0005. The artefact cost is minor (three CamelCase Sortal-Kind URIs vs two); the modelling correctness is decisive.

**Pair vote on Q5.**

- **Guizzardi vote: FOR three classes** — `opda:Property` + `opda:LegalEstate` + `opda:RegisteredTitle`. Unregistered-house exemplar decides against the 2-class collapse; multi-title-flat exemplar reinforces. Kendall/FIBO LEI pattern misapplied here (LEI is for multiple identifiers on one Kind; not for multiple Kinds with different lifecycles).
- **Gandon vote: FOR three classes + three URIs in the layer-segregated `opda:` namespace** — minor artefact cost; decisive modelling correctness.

---

### Q6 — Address-as-mode-of-presentation

**Guizzardi (lead).** Addresses (`marketingAddress`, `titleAddress`, `inspireAddress`) are **UFO Modes of presentation** — qualities that inhere in the bearer Property but vary by *context of presentation*. They are not the identity of the Property; they are not separate Kinds; they are Modes (Guizzardi 2005, Ch. 4 — Modes are particularised qualities that inhere in their bearer, with their own existence-dependence on the bearer but their own particular identity within that dependence).

The three address surfaces are:

- **`opda:marketingAddress`** — the address as presented by the marketing channel (Rightmove, Zoopla; estate agent's preferred presentation). May omit unit-number; may use a colloquial street name; may include marketing-flavour ("Penthouse" appended).
- **`opda:titleAddress`** — the address as stated on the title-register record. Authoritative for the registered title's location reference; may differ from `marketingAddress` in punctuation, capitalisation, abbreviation; carried as a string field in HMLR records.
- **`opda:inspireAddress`** — the address derived from the INSPIRE feature's geometric/cadastral location; may be generated from the cadastral parcel's centroid via reverse geocoding; pinned to the cadastral identifier.

All three inhere in the same `opda:Property`; all three are *different presentations* of the Property's location; none of the three is the IC. The IC remains spatial-material continuity (Q2). The Modes are *informative* — they help downstream consumers locate the Property in their own context — but they are not *identifying*.

The temptation to collapse them (one `opda:address` field with a single canonical string) loses real information. A conveyancer needs the title-address for legal correspondence; a buyer needs the marketing-address for property listings; a planning consultant needs the INSPIRE-address for cadastral lookups. The three are not equivalent; they are not freely substitutable; the modelling must preserve them as distinct.

The UFO Mode framing matches DOLCE's *quale* and *quality region* concepts (Masolo et al. 2003 §4): each address is a value in the address-quality-space; the Property has a quality-region (the set of admissible address-presentations); each Mode is a *point* in that region tagged by context (marketing / title / INSPIRE). This is the canonical DOLCE pattern for context-varying qualities.

**Anti-pattern: address as Kind.** Treating Address as a Kind (`opda:Address` class with instances `opda:marketingAddress/<x>`, `opda:titleAddress/<y>`, ...) is plausible but wrong here. A Kind has its own identity; an Address-as-Kind would mean the marketing address and the title address are two distinct individuals with their own identity criteria. But what is the IC of the marketing address? It does not have one; it is *the marketing presentation of the address of this Property*. Its identity is given by its bearer + its context-tag; it is existence-dependent on both. That is the UFO Mode signature, not the Substance Kind signature.

**Anti-pattern: address as key.** Treating any address-string as the key for `opda:Property` is the Guarino DA hill (per S001 Q4: "address-as-key is worse than UPRN-as-key — it's a mode of presentation, not a bearer"). Address presentation varies by context; even within a single context (the title-register), address presentations are reformatted across HMLR record-history; equality of strings is not equality of address; substring matching does not converge. SHACL/DASH uniqueness on address would produce false-positive violations (two Properties with similar-but-not-identical addresses flagged as duplicates) and false-negative misses (one Property with two different address-presentations flagged as separate). The Guarino DA position from S001 Q4 stands: address is not a key.

**Gandon.** Concur. The W3C-side discipline: the three address Modes are encoded as three separate `owl:DatatypeProperty`s on `opda:Property` (`opda:marketingAddress`, `opda:titleAddress`, `opda:inspireAddress` — each with `rdfs:range xsd:string` and `rdfs:comment` documenting the context-tag). The SHACL shape on `opda:Property` constrains each independently; no SHACL `sh:unique`-style constraint on any of them. The downstream Address modelling (whether Address gets its own Kind for canonical-address-element decomposition à la INSPIRE Address Component model) is **deferred to ODR-0006 or ODR-0008** — not in ODR-0005's scope. ODR-0005 commits to the *Mode-of-presentation* framing; the structural decomposition is the next ODR's question.

**Pair vote on Q6.**

- **Guizzardi vote: FOR Address-as-Mode** — three Modes (`opda:marketingAddress`, `opda:titleAddress`, `opda:inspireAddress`) inhering in `opda:Property`; not Kinds; not the IC; not a key. UFO Mode + DOLCE quale grounding; matches the Guarino DA position from S001 Q4 ("address is a mode of presentation, not a bearer").
- **Gandon vote: FOR three Mode predicates + deferral of canonical-address structural modelling to ODR-0006/0008** — the three address Modes are encoded as DatatypeProperties on `opda:Property` in ODR-0005; address-component decomposition is deferred.

---

### Q7 — Exemplar pass

**Guizzardi (lead) and Gandon (joint).** All three exemplars survive the proposed cure. Walking through each:

**Exemplar 1: `registered-freehold-house.ttl` (24 Acacia Avenue).**

- **(a) Class instantiation with DOLCE category.** `opda:property` is a `opda:Property` (DOLCE Endurant, UFO Substance Kind); `opda:title` is a `opda:RegisteredTitle` (DOLCE Endurant, UFO Substance Kind). LegalEstate is implicit (registered freehold; the title records a LegalEstate; the exemplar may add `opda:estate a opda:LegalEstate` explicitly on gate clearance for completeness, but the Q5 3-class commitment requires it).
- **(b) IC over the hard case.** The baseline-easy case fires no hard case; the IC trivially gives the same Property + same RegisteredTitle through the dataset cut.
- **(c) SHACL key.** `opda:uprn "100070123456"` present; `dash:uniqueValueForClass` constraint fires no violation; `owl:sameAs` absent (co-reference via `opda:identifiesSameProperty`).

Pass. No violation report the IC can't justify.

**Exemplar 2: `unregistered-pre-first-registration-house.ttl` (7 Old Lane).**

- **(a) Class instantiation.** `opda:property` is a `opda:Property` (DOLCE Endurant); on gate clearance, the LegalEstate (common-law freehold) should be added as `opda:estate a opda:LegalEstate` to discharge the 3-class split. RegisteredTitle deliberately absent (registration not completed) — the 3-class split's IC for RegisteredTitle does not produce one here, which is the correct answer.
- **(b) IC over the hard case.** First-registration-pending fires no hard case for `opda:Property` (no demolition / subdivision / merger / replacement); the IC gives the same Property. The IC for `opda:LegalEstate` (common-law freehold persistence) gives the same estate; first registration when later completed will be a `prov:wasGeneratedBy` activity that produces a new `opda:RegisteredTitle` recording the existing estate. **The IC the Council settles produces a stable answer for this case** — exactly the criterion the exemplar's `skos:scopeNote` demands.
- **(c) SHACL key.** `opda:uprn` deliberately absent; `dash:uniqueValueForClass` constraint vacuously passes (Cagle's graceful-degradation challenge — the SHACL key does the right thing); `owl:sameAs` absent; no `owl:hasKey` enforced (would be inert without UPRN — the Anti-pattern §2 prohibition).

Pass. The 3-class split's IC handles this case; the 2-class collapse cannot (Q5 argument).

**Exemplar 3: `flat-with-split-uprn.ttl` (Flat 5C Glasshouse Mansions).**

- **(a) Class instantiation.** `opda:property` is a `opda:Property` (DOLCE Endurant); `opda:title-leasehold` is a `opda:RegisteredTitle` (the leasehold-of-flat registered title). On gate clearance, the LegalEstate (leasehold) should be added as `opda:estate a opda:LegalEstate`; the freehold's separate RegisteredTitle + LegalEstate may be added for completeness, but their absence does not invalidate the exemplar (the exemplar's `skos:scopeNote` says "the freehold of the building is a separate title not included here — multi-title cardinality is the parallel S005 Q5 question").
- **(b) IC over the hard case.** UPRN succession fires no hard case for `opda:Property` (the flat is the same physical individual before and after the UPRN re-numbering); the IC gives the same Property. UPRN succession is administrative (Q4); the IC is independent of UPRN. `prov:wasDerivedFrom` chains the current UPRN (`100000000222`) to the predecessor (`100000000111`) via the reified `opda:UPRNSuccessionEvent`.
- **(c) SHACL key.** `opda:uprn` present (`100000000222`); `dash:uniqueValueForClass` constraint fires no violation; `owl:sameAs` absent; `opda:previousUPRN` carried as a literal pair *and* the reified event resource — the Council may **prefer one or the other** as the canonical succession-reification shape (the exemplar's `skos:scopeNote` says "S005 will settle whether succession needs a reified event resource, a literal pair, or both"). **Our pair's position: the reified event resource is the canonical shape; the literal pair is a denormalised convenience for SHACL constraints** (allows a `dash:uniqueValueForClass`-style check on `opda:previousUPRN` to spot stale references). Both can coexist; the reified event is authoritative.

Pass. UPRN succession discharged via PROV-O; IC independent of UPRN; 3-class structure accommodates the multi-title-flat parallel case.

**The summary verdict on Q7.** All three exemplars satisfy the gate-clearance criteria (a)/(b)/(c) under the 3-class commitment + spatial-material-continuity IC + UPRN-as-Quality-with-PROV-succession + Address-as-Mode framing. No violation report the IC can't justify. The exemplars become CI regression tests against the IC (per ODR-0004 §8a — `expected-report.ttl` paired with each); when a future change to the IC breaks an exemplar, CI fails and the change is reverted or the IC is amended.

**Pair vote on Q7.**

- **Guizzardi vote: FOR pass on all three exemplars** — each instantiates the three Kinds (Property always; LegalEstate where the estate exists at common law or statutorily; RegisteredTitle where registration has completed); each has a stated IC that gives the right answer over its hard case; each keys via SHACL/DASH where UPRN is present, degrades gracefully where absent, succession via PROV-O.
- **Gandon vote: FOR pass on all three exemplars + minor enhancement** — recommend gate-clearance enhancement to add the LegalEstate individual explicitly in exemplars 1 and 2 (Substance-Kind discipline + 3-class verification); exemplar 3's succession-reification shape is the canonical pattern; advocate for the reified event resource over the literal pair (Gandon W3C-side recommendation — reified resource has its own URI, dereferenceable identity, audit trail).

---

### Q8 — Gate clearance + downstream consequence

**Gandon (lead).** ODR-0005 is **ready to be `accepted` modulo the namespace block** (per ODR-0004's Knublauch-DA-extracted requirement: ODR-0004 stays `proposed` until the WG ratifies the namespace string; ODR-0005 inherits the block via `depends-on: [ODR-0004]`). The Council-side gate (the four gate conditions in `## Rules`) is cleared by this session's verdicts:

1. **Class cardinality.** Settled: 3 classes (Q5).
2. **DOLCE category commitment per class.** Settled: all three commit to DOLCE Endurant / UFO Substance Kind (Q1).
3. **IC over hard cases.** Settled: spatial-material continuity for `opda:Property` (Q2); rights-bundle persistence for `opda:LegalEstate` + title-number lineage for `opda:RegisteredTitle` (Q3).
4. **UPRN's precise status.** Settled: SHACL/DASH operational key + PROV-O contingent identifier with succession; UFO Quality, not IC (Q4).

The Address question (Q6) is settled as a Mode-of-presentation framing in ODR-0005; the structural decomposition deferred to ODR-0006 / ODR-0008. The exemplar gate (Q7) clears under the verdicts.

**The status discipline.** Per the OPDA adoption record (§Real-world Governance Handoff) and the Knublauch DA carve-out from S004:

- ODR-0005 moves from `proposed` to `proposed` with `council: session-005` (the session is the council-side ratification).
- ODR-0005 stays `status: proposed` until ODR-0004's namespace string is WG-ratified (block inherited via `depends-on`).
- When ODR-0004 moves to `accepted`, ODR-0005 follows.

**Downstream consequence — ODRs 0006, 0007, 0008, 0015.**

- **ODR-0006 (Agents & Roles).** Unblocked. The Person/Organisation identity work + Address modelling (canonical-address structural decomposition deferred from Q6) inherits the ODR-0005 IC discipline. Same SHACL-primary + no-`owl:sameAs` + PROV-succession-for-administrative-identifiers pattern.
- **ODR-0007 (Transactions & Lifecycle).** Unblocked. The Transaction Relator + milestone discipline inherits the ODR-0005 framework. The 3-class split for Property is load-bearing for transaction-against-which-thing modelling (a transaction is against a `opda:LegalEstate`, with the `opda:RegisteredTitle` providing the registry-side record; the `opda:Property` is the physical referent the transaction is about-the-location-of). The OWL-Time intervals (per ODR-0014) attach to LegalEstate (tenure terms) and RegisteredTitle (registry-event timestamps).
- **ODR-0008 (Property Descriptive Attributes).** Unblocked. Descriptive attributes (built form, condition, valuation, EPC, utilities, searches, encumbrances) all hang off `opda:Property` (physical) or `opda:LegalEstate` (legal — for encumbrances, easements). The 3-class split tells the modeller which attributes go where.
- **ODR-0015 (Identity Crux follow-on).** This is the appropriate home for the Site-vs-Property distinction (deferred from Q2 — "Site ≠ Property under UFO; Site is a separate Endurant Kind, deferred to ODR-0015 if modelled"). The follow-on may also extend the IC to commonhold and to leasehold-enlargement-into-freehold edge cases. The follow-on is unblocked.

**Guizzardi.** Concur. The A9 pressure-test passes: ODR-0005 has (a) UFO/DOLCE meta-category commitment (three Substance Kinds, DOLCE Endurant), (b) IC over named hard cases (five hard cases for Property; five for LegalEstate; five for RegisteredTitle), (c) artefact realisation (SHACL/DASH uniqueness + PROV-O succession + co-reference via `opda:identifiesSameProperty`). The first `kind: pattern` ODR to discharge under the A9 amendment satisfies the per-kind discipline; the amendment is operationally proven.

**The downstream consequence we want recorded.** This Council verdict + the A9 amendment together establish the *template* for downstream `pattern` ODRs. ODR-0006's `## Rules` on Person/Organisation Kinds must follow the same form: state UFO meta-category (Substance Kind for Person and Organisation; Role for Seller/Buyer/Proprietor); state IC over hard cases for the Substance Kinds (Person IC over name-change, gender-recognition, death; Organisation IC over merger, demerger, dissolution); commit to the artefact realisation. The first `pattern` ODR's template becomes the second `pattern` ODR's discipline; the Council's pressure-test becomes the methodology's normal operation.

**Pair vote on Q8.**

- **Gandon vote: FOR `accepted` modulo namespace block** — Council-side gate cleared; ODR-0005 stays `proposed` per the inherited block from ODR-0004; downstream ODRs 0006/0007/0008/0015 unblocked; `council: session-005` recorded.
- **Guizzardi vote: FOR `accepted` modulo namespace block + A9 pressure-test passes** — three Substance Kinds + DOLCE Endurant + IC over hard cases + artefact realisation = the per-kind discipline operationally proven. The first `pattern` ODR to discharge under A9 sets the template for downstream `pattern` ODRs.

---

## Cross-cutting concerns

**Thread 1: The per-kind discipline contract from A9.** ODR-0005 is the first `kind: pattern` ODR to discharge under the A9 amendment we co-authored (Guizzardi as panel teammate; Gandon partial-alignment). The pressure-test is whether `## Rules` can name (a) UFO/DOLCE meta-category, (b) IC over named hard cases, (c) artefact realisation **inline**, without the ODR collapsing into UFO theory-statement or artefact-engineering-only. The verdicts above demonstrate this is operationally possible. ODR-0005's `## Rules` will read: "(a) three Substance Kinds committed to DOLCE Endurant; (b) five hard cases each, with IC stated; (c) SHACL/DASH + PROV-O + co-reference via `opda:identifiesSameProperty`." All three legs of the A9 stool are present and load-bearing. The amendment proves itself in operation.

**Thread 2: The Substance-Kind-vs-Mode distinction across questions.** Q1 commits three Substance Kinds; Q6 commits three Modes. The distinction is load-bearing throughout. A Substance Kind has its own identity criterion and lifecycle; a Mode has its identity given by bearer + context. Conflating them produces the "Address-as-key" anti-pattern (Mode treated as if it were a Substance Kind) and the "RegisteredTitle-as-Mode-of-LegalEstate" anti-pattern (Substance Kind treated as if it were a Mode). The 3-class split for Property/Estate/Title (Q5) preserves the Substance-Kind side; the three Address Modes (Q6) preserve the Mode side. The discipline is consistent.

**Thread 3: PROV-O as the contingent-identifier substrate.** Q4 (UPRN succession) and Q3 (RegisteredTitle history) and Q1 (LegalEstate registration events) all use `prov:wasDerivedFrom` / `prov:wasGeneratedBy` / `prov:wasInformedBy` for the administrative-event history. This is consistent with ODR-0009's PROV-O backbone (S001 Q6) and with Moreau's S001 Q6 analysis (~80% of administrative-history maps natively to PROV-O). ODR-0005 contributes the *Property-side* PROV usage (UPRN succession, registration events); ODR-0009 owns the *Claims-side* PROV usage. The two are coherent; no PROV-vocabulary conflict.

**Thread 4: The W3C alignment story.** The 3-class split + IC discipline + SHACL/DASH key + PROV-O succession + Address-as-Mode all align with W3C Recommendations and Working Group Notes:

- DOLCE Endurant + UFO Substance Kind grounding ↔ A9 amendment requirement (the methodology itself authorises the commitment).
- IC over hard cases ↔ OntoClean (Guarino & Welty 2002/2009) and ER-modelling identity discipline.
- SHACL/DASH key ↔ SHACL Core §4 (W3C Rec 2017) + DASH (Knublauch's TopBraid extension; community-blessed).
- PROV-O succession ↔ PROV-O Rec (Moreau & Missier 2013, W3C Recommendation) §3.
- No-`owl:sameAs` ↔ RDF 1.1 Semantics (Hayes & Patel-Schneider 2014, W3C Rec) §6.
- Co-reference via `opda:identifiesSameProperty` ↔ the controlled-co-reference pattern (community-blessed; cited in the W3C TAG "Cool URIs" pattern for context-distinct references).
- Address-as-Mode ↔ DOLCE quale/quality-region (Masolo et al. 2003).

The verdicts cohere as a single W3C-and-foundational-ontology-grounded modelling. The artefact realisation discharges what the commitment requires; the commitment discharges what the methodology (A9) requires.

---

## DA anticipation

**The Devil's Advocate for S005 will be selected per the methodology's DA selection criterion (§Roles).** We anticipate three opposition lines, each from a different panellist's published methodology. Each is engaged head-on.

### Allemang's working-ontologist push-back

**Anticipated position.** "Three classes is over-modelling. The pragmatic enterprise-KG move is two: `Property` (physical) + `LegalEstate`. The registry record is a metadata layer (last-registered-on, title-number-as-literal) on `LegalEstate`, not its own Kind. Adding RegisteredTitle as a third Kind invites three SHACL shapes, three URI types, three reasoning surfaces — for what gain? Per Allemang & Hendler 2020, *Semantic Web for the Working Ontologist*, 3rd ed., Ch. 8 (Minimal modeling), the enterprise discipline is to model the minimum that supports the use cases."

**Engagement.** Allemang is right on the minimal-modeling discipline; the question is what is minimal *here*. The 2-class collapse is *not* minimal for the unregistered-house case — it forces the modeller to either omit a real LegalEstate (lie about the common-law freehold) or fabricate a registration that has not happened. The 3-class split is the *minimum* that gives the unregistered case a coherent answer. Minimal modeling is the floor for *what works*, not the floor for *what compiles*. Two classes does not work for the unregistered case; three does. The minimum is three.

The pragmatic enterprise-KG concern (Allemang's Ch. 8) is real but addressed: the three classes share the `opda:` hash namespace; the three SHACL shapes are co-located in `opda-shapes.ttl`; the three URI types follow ODR-0004's layer-segregated naming pattern. The artefact cost is small (three CamelCase Sortal-Kind URIs and three SHACL shapes); the modelling correctness is decisive. We do not over-model when the third Kind is load-bearing for a real case the exemplar exists to test.

### Cagle's owl:hasKey challenge

**Anticipated position.** This is the *unrebutted* challenge from S001 Q4: "`owl:hasKey (opda:uprn)` is inert when UPRN is absent; my SHACL/DASH `dash:uniqueValueForClass` fires a violation report and degrades gracefully; what does yours *do*? You (Guizzardi) said `owl:hasKey` on the rigid Kind is canonical UFO; my counter is that it is inert in the cases the exemplars exist to test (unregistered-house, new-build). Your turn."

**Engagement (Guizzardi, conceding the operational point).** Cagle is *right* on the operational point. `owl:hasKey` is an OWL-inference license; it is inert without UPRN. My S001 position confused the IC (which is a *modelling commitment* about what makes two individuals the same) with the *operational key* (which is an artefact-stratum check that fires violations or co-reference inferences). The IC is spatial-material continuity (Q2); the operational key is `dash:uniqueValueForClass` (Q4); `owl:hasKey` is admissible only as a *secondary* OWL-inference license when UPRN is present on both sides. ODR-0005 Rule 4 ("`owl:hasKey` is optional/secondary — a semantic annotation valid only where UPRN is truly identifying") states this correctly; the Anti-pattern §2 prohibits `owl:hasKey` as the sole mechanism. Cagle's challenge is converted into an amendment that strengthens the proposal — the canonical DA arc.

The remaining UFO point: the rigidity of `opda:Property` (as a Substance Kind) does not require `owl:hasKey` to be operationalised. Rigidity is a *meta-property* of the class (Guarino & Welty 2002/2009 — OntoClean's `+R` for rigidity); it is encoded as an annotation on the class (`opda:Property opda:metaCategory "Substance Kind"`; `opda:Property opda:rigidity "+R"`) and *checked* by OntoClean-style review, not by `owl:hasKey`. The two are independent; the rigidity commitment stands; the operational key is SHACL/DASH; `owl:hasKey` is secondary annotation. Cagle and I converge.

### Kendall's FIBO LEI pattern

**Anticipated position.** "Per FIBO's `LegalEntity`/LEI pattern (Allemang & Hendler 2020 Ch. 13; FIBO Foundations 2020), the canonical move is one Kind (`LegalEntity`) with alternative identifiers (LEI, EIN, CRN, ...). Apply this to Property: one `opda:Property` Kind with alternative identifiers (UPRN, INSPIRE ID, title-number, postal-address-pattern). The 3-class split is a needless multiplication of Kinds where alternative-identifier-modelling does the work."

**Engagement.** Kendall's FIBO LEI pattern is a *real* enterprise pattern; the question is whether it applies here. The FIBO LEI pattern handles *multiple identifier schemes for one Kind* — a LegalEntity has an LEI, an EIN, a CRN, a DUNS, etc., and the Kind is one because the *referent* is one. Apply this to Property: a Property has a UPRN, an INSPIRE ID, a HMLR title number (sometimes — and *sometimes more than one*). If the title-number-per-Property is always exactly one and the LegalEstate is conflated with the Property, then Kendall's pattern works. But the *titles-per-Property is not always one* — the multi-title-flat exemplar has a leasehold title for the flat *and* a freehold title for the underlying building's reversion. Two RegisteredTitles; the building's freehold and the flat's leasehold cover *different LegalEstates* on overlapping physical Properties (the flat and the building, where the flat is contained-in-the-building). The FIBO LEI pattern collapses this: it treats the title-number as just-another-identifier-for-the-Property; it cannot represent two-titles-on-overlapping-LegalEstates.

The FIBO LEI pattern *would* apply if we were asking "what are the alternative identifiers for `opda:Property`?" — UPRN, INSPIRE ID, postal-address-hash, cadastral-parcel-ID. Each is a different identifier for *the same* physical Property. We use the FIBO pattern for *that* question. We do *not* use it for the LegalEstate-vs-RegisteredTitle question because they are not alternative identifiers for the same thing; they are different things (Q5).

The 3-class split + the FIBO LEI pattern on `opda:Property`'s identifiers are *compatible*. The 3-class split tells us there are three Kinds; the FIBO LEI pattern tells us each Kind may have multiple alternative identifiers (UPRN, INSPIRE ID for Property; title-number, registry-district-code for RegisteredTitle; etc.). The two patterns operate at different scales; both belong in the modelling.

### Guarino DA carry from S001 Q4

**Anticipated position (held-over).** Guarino's S001 Q4 dissent set the bar: "ODR-0005 must (i) commit each entity to a DOLCE category (Endurant), (ii) state an IC over the hard cases, (iii) settle UPRN's status (checkable key vs contingent identifier), all validated against diagnostic exemplars." Guarino withdraws *iff* ODR-0005 meets all three conditions.

**Engagement.** Q1 settles (i) — DOLCE Endurant + UFO Substance Kind for all three Kinds. Q2 + Q3 settle (ii) — IC stated over five hard cases each. Q4 settles (iii) — UPRN is both (SHACL/DASH operational key + PROV-O contingent identifier with succession). Q7 validates against the three exemplars. **Guarino's three conditions are met.** Per the S001 Q4 protocol, Guarino's dissent is **withdrawn**; the panel records the withdrawal verbatim ("Guarino DA withdrew on Q4-conditions met by S005 Q1+Q2+Q3+Q4+Q7"). The Council-side gate clears.

---

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind, Role, Phase, Relator, Mode, Quale taxonomy).
- Guizzardi, G. et al. (2015). *Towards Ontological Foundations for Conceptual Modeling: The Unified Foundational Ontology (UFO) Story*. Applied Ontology 10(3-4). — UFO 2007/2011/2015 lineage.
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N., Oltramari, A. (2003). *The WonderWeb Library of Foundational Ontologies*. D18. (DOLCE — Endurant, Perdurant, Quality, Quale.)
- Guarino, N., Welty, C. (2002, 2009). *An Overview of OntoClean*. In Handbook on Ontologies. — OntoClean meta-properties (Rigidity, Identity, Unity, Dependence).
- Hayes, P., Patel-Schneider, P. (2014). *RDF 1.1 Semantics*. W3C Recommendation. §6 (`owl:sameAs` semantics + IRI-equality vs same-resource).
- Moreau, L., Missier, P., eds. (2013). *PROV-O: The PROV Ontology*. W3C Recommendation. §3 (`prov:wasDerivedFrom`, `prov:wasGeneratedBy`).
- Knublauch, H., Kontokostas, D., eds. (2017). *Shapes Constraint Language (SHACL)*. W3C Recommendation. §4 (Core Constraint Components — `sh:unique` family; via DASH `dash:uniqueValueForClass`).
- Berners-Lee, T. (1998). W3C TAG Note: "Cool URIs Don't Change". Berners-Lee, T., Connolly, D., eds. (2008). W3C TAG Note: "Hash vs Slash". Sauermann, L., Cyganiak, R. (2008). *Cool URIs for the Semantic Web*. W3C Interest Group Note.
- Heath, T., Bizer, C. (2011). *Linked Data: Evolving the Web into a Global Data Space*. Ch. 2 (Linked Data Principles); Ch. 3 (Patterns for Publishing Linked Data).
- Allemang, D., Hendler, J. (2020). *Semantic Web for the Working Ontologist*, 3rd ed. Ch. 8 (Minimal modeling); Ch. 13 (FIBO and Enterprise Ontologies).
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment landed 2026-05-27. The MUST-level (a)/(b)/(c) discipline for `kind: pattern` ODRs.
- ODR-0004 §Rules 1–8 + §Operational specifications 3a/6a/7a/8a — the substrate this ODR realises (URI namespace, three-graph separation, exemplar harness, term-sourcing precedence).
- ODR-0005 §Rules (settled + gate conditions) — the proposal under deliberation; gate cleared by the Q1–Q8 verdicts above.
- S001 Q4 transcript — Hendler/Guizzardi 3-class position; Allemang 2-class position; Kendall FIBO LEI pattern; Cagle's unrebutted `owl:hasKey` challenge to Guizzardi (rebutted with concession in Q4 above); Guarino DA three-condition withdrawal anchor.
- Diagnostic exemplars: `source/03-standards/ontology/exemplars/registered-freehold-house.ttl`, `unregistered-pre-first-registration-house.ttl`, `flat-with-split-uprn.ttl` — the three IC tests the Q7 verdict discharges.
