# Allemang — Devil's Advocate on S005

## DA framing

The panel will reach for foundational-ontology purity on this question — Guarino will push spatial-material continuity; Hendler and Guizzardi will push the three-class split (`Property` + `LegalEstate` + `RegisteredTitle`); Cagle will defend the SHACL/DASH operational key. Every position is genuinely opposed to one of the others. My job as DA is to ask the question none of them ask of themselves: **does this identity criterion produce the right answer for a *named consumer query*, and if so, does it produce a right answer that a 2-class model fails to deliver?** That is the discipline of *Working Ontologist* 3rd ed. Ch. 7 ("Identity and Identifiers") and Ch. 13 ("Linked Data and the World") — identity criteria are *testable*, not *theoretical*. A category-theoretic IC that no SHACL shape can verify and no consumer query can exercise is, operationally, decoration. The panel is at risk of producing exactly that.

My S001 Q4 position was the two-class model: `Property` (physical) + `LegalEstate` (legal), related by `hasLegalEstate`. Hendler's third class (`RegisteredTitle`) is, in my reading, either a Phase of `LegalEstate` (the registered-vs-unregistered phase) or a sub-role of it (the registry's view of the same legal-institutional object) — not its own Kind. The carry from S001 was unanimous on the *diagnosis* (the implicit-Property defect) and convergent on a multi-class split (≥2), but **the 2-vs-3 boundary was explicitly left to this session, decided by the exemplars**. My S001 challenge to the three-class camp was concrete: *show me a consumer query that fails under the 2-class model and succeeds under the 3-class model.* That challenge stands. Without consumer-side evidence, the third class is ontological vanity — load-bearing only in the panel's heads, not in any SHACL shape, SPARQL query, or registry consumer.

The DA frame I bring: the IC discipline is *necessary* (Guarino is right that an ontology without ICs is "a schema with RDF syntax") but the panel risks over-engineering the legal layer past the point any consumer needs. *Working Ontologist* 3rd ed. Ch. 7 §"Pragmatic Identity" warns this exact failure mode: enterprise ontologists who model the world the registrar sees, not the world the *consumer* sees, produce ontologies that validate beautifully and serve no query. I have shipped two TopQuadrant customer programmes that started with a Hendler-style multi-class registry model and ended with an Allemang-style two-class consumer model after the third class produced zero consumer queries in eighteen months of production use. That is the operational record this DA position is grounded in.

## Per-question DA positions

### Q1 — Endurant commitment

**DA position:** Concur with the Endurant frame for the physical thing — there is no serious alternative; the *property* is what persists through the transaction, not the transaction's event-time slices. But the sub-kind question (Site / BuiltStructure / Property-as-such, per Guarino's S001 framing) is where the panel risks decoration. *Working Ontologist* 3rd ed. Ch. 7 §"What is identity in RDF?" frames identity testably: an identity criterion is a *test* the consumer can run, not a *category* the modeller can name. If the panel commits to a sub-kind (say `opda:Site` or `opda:BuiltStructure`) without naming a consumer query that needs the sub-kind to answer correctly, the sub-kind is decoration.

**Concrete example.** The PDTF v3 base schema has `propertyPack.uprn`, `energyEfficiency.certificate.uprn`, etc. — four UPRN surfaces total. Every named consumer query I can construct against PDTF v3 either (a) joins these surfaces by UPRN-as-key, in which case the sub-kind doesn't enter the query, or (b) asks about the property *as a thing transacted*, in which case `opda:Property` is the answer. I cannot construct a query where the sub-kind is the load-bearing handle. If the panel can, I'll concede; if not, the sub-kind belongs in a downstream pattern ODR (or `skos:scopeNote`), not in ODR-0005's load-bearing `## Rules`.

**Engagement with panel positions.** Guarino's "Site/BuiltStructure" framing in S001 was concrete — it pointed at the demolition-and-rebuild case, where the *site* persists but the *built structure* doesn't. That is a real distinction, but it's a *Phase* distinction or a *Quality* distinction, not a Kind distinction. *Working Ontologist* 3rd ed. Ch. 7 §"Distinctions that earn their keep": a distinction earns its keep when a SHACL shape would treat the two cases differently. If `opda:Site` and `opda:BuiltStructure` validate against the same shape (same UPRN-uniqueness check, same address constraints, same first-registration status), they should be the same Kind.

**Withdrawal condition:** the panel either (a) names a consumer query of the form *"find all properties where X"* where X requires the sub-kind to resolve correctly, AND that query produces a wrong answer under the unified `opda:Property` Kind; OR (b) folds the sub-kind into a `skos:scopeNote` on `opda:Property` rather than committing to it as a Kind in `## Rules`.

**Per-voice vote: AGAINST sub-kind commitment in `## Rules` + withdrawal condition stated.** AGAINST a Site/BuiltStructure split as Kinds; would withdraw on a named consumer query OR demotion to `skos:scopeNote`.

### Q2 — IC for physical Property

**DA position (PRIMARY ATTACK):** Strong attack on spatial-material continuity as the IC for `opda:Property`. Guarino will push this because DOLCE wants it, but spatial-material continuity fails three named hard cases that consumers care about:

1. **Rebuild on the same plot.** A Victorian terrace house at 12 Acacia Avenue is demolished in 2020 after a fire; a new house is built on the same plot in 2022. Is the new building the same `opda:Property`? Spatial-material IC says: spatial-continuity-yes, material-continuity-no — *new property*. Stewardship IC says: same UPRN, same address, same chain of legal estates — *same property*. Every consumer query I can construct against PDTF v3 (mortgage history, insurance continuity, EPC chain, valuation comparators) gives the right answer under stewardship continuity and the *wrong* answer under spatial-material continuity. The rebuilt house IS the same property for every consumer purpose; the IC must reflect that.

2. **Surveying-revision identity drift.** The Ordnance Survey periodically revises spatial coordinates (most recently the 2014 OSGB36 → ETRS89 adjustment, sub-metre but real). Under spatial-material IC, every parcel whose coordinates were adjusted got a new identity — which is absurd. Stewardship IC is invariant under surveying revision; the property is the same property regardless of which coordinate system the registry uses to locate it.

3. **Conveyancer pragmatic-identity practice.** *Working Ontologist* 3rd ed. Ch. 13 §"Linked Data in the Real World" notes the principle: when the domain experts' working practice systematically gives a different answer from the formal IC, the formal IC is wrong. UK conveyancers treat property-identity through *title continuity* (same chain of legal estates, same registered title number, same UPRN-equivalent registry handle). They do not run material-continuity tests. The IC must align with the domain practice or it produces an ontology no UK conveyancer consumes.

**Alternative IC: stewardship continuity.** The same `opda:Property` is the property over which a continuous chain of `opda:LegalEstate` instances has been asserted. Operationally testable in HMLR: the registry's title-register history is the canonical chain. This IC handles all three hard cases correctly: the rebuild is the same property (same chain of LegalEstates persists through the rebuild), the surveying revision doesn't touch the chain, and conveyancer practice is the chain.

**Hybrid IC (fallback).** If the panel insists on retaining spatial-material as the *default* IC, the hybrid form is: spatial-material is the default; stewardship overrides for rebuilds and surveying-revision cases. This is operationally messy — two IC rules with a tie-breaker — but survives the named hard cases. *Working Ontologist* 3rd ed. Ch. 7 §"Hybrid Identity" admits this pattern but warns it is a *concession*, not a *clean* IC.

**Engagement with panel positions.** Guarino's S001 framing of "spatial-material continuity *defined over demolition / subdivision / merger*" was honest about the hard cases but didn't actually state the IC's verdict on them. The S001 DA position said "demolition / subdivision / merger" without saying *what the IC produces for each*. That is the test ODR-0005 must pass. If the panel commits to spatial-material IC, I need a per-exemplar verdict: rebuild on the same plot → which class? subdivision (one parcel becomes two) → which class instances? merger (two parcels become one) → which class instances? Without the verdicts, the IC is not operational.

**Withdrawal condition:** the panel adopts EITHER (a) stewardship-continuity IC as the primary IC for `opda:Property`, OR (b) a hybrid IC where spatial-material is the default and stewardship-continuity overrides for rebuild + surveying-revision cases, OR (c) the panel demonstrates that the spatial-material IC delivers the correct verdict for all three named scenarios (rebuild on same plot, subdivision, merger) against ALL THREE diagnostic exemplars (registered freehold house, unregistered pre-first-registration house, flat with split UPRN), with the verdicts stated explicitly per exemplar in the Queen synthesis.

**Per-voice vote: AGAINST spatial-material as the sole IC + withdrawal condition stated.** AGAINST a pure spatial-material IC. Withdrawal on adoption of stewardship-IC OR hybrid OR explicit-per-exemplar verdict demonstration.

### Q3 — IC for LegalEstate (and the registry-side handle)

**DA position:** Concur with title-register identity as the IC for `opda:LegalEstate`. The legal-institutional object is exactly what HMLR's title register tracks; the title number is the canonical handle (HMLR title number is operationally stable across leasehold extensions, proprietor changes, charge variations). This is a clean case: the IC is operationally testable (lookup against the title register), the consumer query is well-defined ("find the registered LegalEstate for this property"), and the hard cases (first registration, voluntary registration, compulsory registration) are handled by the register's own machinery.

**The deeper attack lives at Q5.** If `opda:LegalEstate`'s IC is title-register identity, then `opda:RegisteredTitle` is — operationally — *the same identity from a different vantage point*. One IC, one class. I'll engage that fully at Q5.

**Withdrawal condition for Q3 alone:** none — I concur. The IC for `LegalEstate` is title-register identity, and the title number is the operational handle. (My disagreement with the 3-class split is a Q5 question, not a Q3 question; conceding Q3's IC does NOT concede Q5's class cardinality.)

**Per-voice vote: FOR title-register identity as IC for LegalEstate.** Concede.

### Q4 — UPRN status

**DA position:** Concur with Cagle's S001 framing: UPRN as a contingent scheme-scoped identifier, operationally checked via `dash:uniqueValueForClass`, succession tracked via `prov:wasDerivedFrom`. This is the right answer and the panel has converged on it; no DA attack here. The argument *against* UPRN-as-IC was settled in S001 (Cagle's challenge to Guizzardi went unrebutted; UPRN is administratively contingent, not rigid).

The only sub-question worth flagging: the S001 DA framing said "checkable key vs contingent identifier". *Working Ontologist* 3rd ed. Ch. 7 §"Identity vs Identifiers" makes this distinction crisp — UPRN is an *identifier* (a system's handle for the thing), not the *identity* (the test for sameness). The two coexist cleanly: UPRN is the operational key the SHACL shape checks; the identity is whatever the IC adopted in Q2 says it is. ODR-0005's draft `## Rules` Rule 6 ("UPRN is a contingent identifier, not the IC") gets this right.

**Withdrawal condition:** none — I concur with the draft Rule 6 framing.

**Per-voice vote: FOR draft Rule 6 (UPRN contingent + SHACL-DASH operational key + PROV-O succession).** Concede.

### Q5 — Two- vs three-class split (PRIMARY ATTACK)

**DA position (PRIMARY ATTACK):** Two-class default; three-class only on named consumer-query evidence. This is the load-bearing question of the session and the load-bearing carry from my S001 Q4 position.

The 2-class model: `opda:Property` (physical Endurant, IC per Q2) + `opda:LegalEstate` (legal-institutional object, IC per Q3 = title-register identity). Related by `opda:hasLegalEstate`. A property can have zero LegalEstates (unregistered house pre-first-registration); a property can have multiple LegalEstates (the multi-title flat — leasehold + freehold are two LegalEstate instances over the same Property); a LegalEstate exists at most once per (Property, title-register-entry) pair.

The 3-class model adds `opda:RegisteredTitle` as a distinct Kind. Hendler and Guizzardi's S001 argument: the registry's *record* has its own lifecycle (created on first registration, modified on lease extension, closed on title merger), distinct from the LegalEstate it records. This is the argument I have to engage seriously, because it is *not* strawman — there is a real distinction between the legal thing (the freehold or leasehold itself) and the registry's record of it.

**My engagement.** *Working Ontologist* 3rd ed. Ch. 7 §"Identity Through Multiple Views" addresses this exact pattern: the same legal-institutional object can be described from multiple vantage points (the freeholder's view, the registry's view, the conveyancer's view) without becoming multiple objects. The test is: do the views have *distinct identity criteria*? If yes, three classes; if no, two classes with views as properties or sub-roles.

For LegalEstate vs RegisteredTitle, the identity criteria collapse: both are *title-register identity* (the same HMLR title number identifies both). The lifecycle distinction Hendler points at — registry-record-created-on-first-registration, modified-on-lease-extension — is a *Phase* distinction on the LegalEstate, not a Kind distinction. The LegalEstate enters the "registered" phase on first registration; it stays in that phase through lease extensions; it leaves the phase only on title closure. A Phase is not a Kind.

**Hendler-anticipated battleground: the lease-extension scenario.** A leasehold LegalEstate's term is extended from 99 years to 999 years. Under the 3-class model, this is described as: the LegalEstate's parameters change AND the RegisteredTitle's record updates. Two updates on two classes. Under the 2-class model, this is described as: the LegalEstate's `opda:term` property updates from `99 years` to `999 years`; the SHACL shape revalidates; the title-register history records the update. One update on one class, with the registry-side history captured by PROV-O `prov:wasRevisionOf` between the pre-extension and post-extension states. Both models capture the same information. The 3-class model adds modelling and validation surface (two classes to instantiate, two SHACL shapes, two sets of PROV-O wiring) without delivering a consumer query that the 2-class model fails on.

**The multi-title-flat: Hendler's strongest case.** A leasehold flat in a converted Victorian terrace, where the leaseholder owns the flat and the freeholder owns the building. Under the 2-class model: one `opda:Property` (the flat); two `opda:LegalEstate` instances (the leasehold over the flat + the freehold over the building, with the flat as a part-of). Under the 3-class model: one `opda:Property` (the flat); two `opda:LegalEstate` instances (same); two `opda:RegisteredTitle` instances (one per LegalEstate). The third-class additions are 1-to-1 with LegalEstates; they add no information.

The Hendler-anticipated query is: "find the LegalEstate's registered-title number". Under 3-class, this is `?legalEstate opda:hasRegisteredTitle / opda:titleNumber ?n`. Under 2-class, this is `?legalEstate opda:titleNumber ?n`. The query is shorter under 2-class. There is no consumer query I can construct where the 3-class model gives a *different answer* from the 2-class model. There are consumer queries where the 3-class model is *more verbose*, but verbosity is not the test of an ontology.

**Engagement with Guizzardi.** Guizzardi's UFO framing would distinguish RegisteredTitle as a `Relator` (a relational entity binding LegalEstate-asserter to LegalEstate-registry). That is a coherent UFO move and I respect it. But: the Relator's IC collapses into the LegalEstate's IC (same title number identifies both ends); the Relator has no independent identity test. UFO admits this case (Guizzardi 2005 Ch. 7 §"Relator identity"); the answer there is that a Relator without an independent IC is a *Mode* on the related Substance, not a Substance itself. So under Guizzardi's own framing, RegisteredTitle is a Mode on LegalEstate, not a Kind.

**Withdrawal condition:** Hendler/Guizzardi name EITHER (a) a specific SHACL validation case that fires a violation under 3-class and passes silently under 2-class (or vice versa) — i.e. a class-cardinality choice that affects validation correctness, OR (b) a specific SPARQL query that produces a different answer-set under 3-class vs 2-class, where the 3-class answer is the right answer for the consumer, OR (c) a specific lifecycle event (lease extension, title closure, charge variation, title merger, sub-tenancy creation) where the 3-class model captures information the 2-class model loses. The query / shape / event must be named explicitly with the SPARQL or SHACL text reviewable in the synthesis; "the registry record has its own lifecycle" is a *premise*, not *consumer-query evidence*.

**Per-voice vote: AGAINST 3-class default + withdrawal condition stated.** AGAINST the 3-class split as the default. Withdrawal on a named consumer query / shape / event that 2-class fails on.

### Q6 — Address as mode of presentation

**DA position:** Attack the "mode" framing as theoretical Guarino-purity that has no SHACL operationalisation in ODR-0005's scope. Address is genuinely complex (UPRN-linked, INSPIRE-linked, BS7666-structured, free-text-on-search, postcode-as-key, etc.) and committing to *Address as a Quality borne by Property via a presentation Mode* in ODR-0005 risks dragging the entire Address-modelling problem into the property-identity gate. That conflation is what killed three TopQuadrant deployments I worked on between 2015 and 2019: the team committed to Address as a load-bearing Kind in the IC discipline, then spent six months re-litigating Address before clearing the IC gate.

**The right move:** ODR-0005's job is the `opda:Property` / `opda:LegalEstate` IC question. Address-modelling is its own programme deliverable — ODR-0015 (or whichever module ODR the OPDA programme schedules for Address). ODR-0005 should defer with a stub pointer: "Address modelling is routed to ODR-0015; ODR-0005 treats Address as an opaque label-bearer for human-readable identification, not as part of the IC for `opda:Property`."

**Engagement with panel positions.** Guarino's S001 framing was "address-as-key is worse than UPRN-as-key (a mode of presentation, not a bearer)" — and I agree address is not the IC. But the corollary Guarino-Hendler-Guizzardi camp may push — that Address is a *Mode of Presentation* in the Frege-Hendler sense, with its own ontological commitments — is exactly the over-engineering risk this DA position is built to resist. *Working Ontologist* 3rd ed. Ch. 13 §"Address as a First-Class Citizen": address is structurally complex and deserves its own deliberation; folding it into the property-identity gate creates a session that resolves nothing.

The 2-class IC story does not require Address-as-Mode. It requires: Property has a `dct:title` or `rdfs:label` (free-text address for human-readable identification); the structured-address modelling is downstream. The IC for Property does not depend on Address; if it did, we would have to commit to Address modelling here, which would expand the session past its scope.

**Withdrawal condition:** the panel routes Address modelling to a separate ODR (ODR-0015 or equivalent) with a stub pointer in ODR-0005's `## Consequences`, AND ODR-0005's `## Rules` does NOT include a substantive Address-as-Mode commitment. The Queen synthesis explicitly states: "Address modelling is out of scope for ODR-0005; routed to ODR-0015."

**Per-voice vote: AGAINST substantive Address-as-Mode commitment in ODR-0005 + withdrawal condition stated.** AGAINST. Withdrawal on routing to ODR-0015 with stub pointer here.

### Q7 — Exemplar pass

**DA position:** Concede the principle (exemplars are the IC's test, per the S001 Q1 amendment that admitted them; per ODR-0001 A9 §What an ODR records requirement (b) "identity criterion stated over named hard cases") — but the verdict on each exemplar depends on the IC adopted in Q2.

**Per-exemplar concerns:**

1. **Registered freehold house.** The 2-class model with stewardship-continuity IC handles this cleanly: one `opda:Property` + one `opda:LegalEstate` (the freehold), title-register-identity-keyed on the LegalEstate, UPRN-keyed on the Property. The only failure case I can construct is the rebuild-on-same-plot scenario; if the IC is stewardship-continuity, the rebuild is the same property; if the IC is spatial-material, the rebuild is a new property. The verdict depends on Q2.

2. **Unregistered pre-first-registration house.** The 2-class model handles this too: one `opda:Property` (UPRN may or may not exist; SHACL shape degrades gracefully when absent) + zero `opda:LegalEstate` instances (no register entry yet). On first registration, an `opda:LegalEstate` is minted and linked via `opda:hasLegalEstate`. The 3-class model would add a `opda:RegisteredTitle` minting on the same event, but the event is the same. The PDTF v3 `propertyPack.isFirstRegistration` leaf is the trigger for the LegalEstate-minting event under either model.

3. **Flat with split UPRN (the worry case).** This is where the IC choice in Q2 has teeth. A flat's UPRN was originally `123456789012`; the flat was subdivided into two sub-flats with new UPRNs `123456789013` and `123456789014`, with the original UPRN retired. Under spatial-material IC: there is no longer a property with UPRN `123456789012`; the spatial referent persists but is now divided; the IC needs to handle the subdivision case explicitly. Under stewardship-continuity IC: the original flat as one `opda:Property` ended when the chain of LegalEstates over it was extinguished; two new `opda:Property` instances begin when the new chains start. The PROV-O `prov:wasDerivedFrom` chain on the UPRNs captures the succession. *Both ICs can be made to work on this exemplar*, but the spatial-material IC requires a special case for "subdivision" and the stewardship-continuity IC handles it as the chain of LegalEstates being extinguished. The latter is cleaner.

**The verdict-naming requirement.** The S001 Q1 amendment admitted exemplars to *pressure-test* ICs. The pressure test only counts if the Queen synthesis names the correct-answer verdict for each exemplar AND demonstrates the adopted IC produces that verdict. A synthesis that says "the exemplars pass under the adopted IC" without showing the working is theatre.

**Withdrawal condition:** the Queen synthesis names the correct-answer verdict for ALL THREE exemplars (registered freehold house under the adopted IC; unregistered pre-first-registration house; flat with split UPRN) AND demonstrates that the adopted IC (whichever is settled in Q2) produces that verdict. The demonstration must be a one-paragraph per-exemplar walk-through showing: class instances minted, IC test applied, hard case verdict. Vague "the exemplars pass" is not sufficient.

**Per-voice vote: CONDITIONAL FOR — concede iff verdict naming is done + withdrawal condition stated.** Withdrawal on per-exemplar verdict-naming in synthesis.

### Q8 — Gate clearance

**DA position:** The gate clears when AT LEAST 6 of the 7 DA positions above are withdrawn (which means the panel adopted my withdrawal conditions on those questions) AND the gate-clearance criteria stated in ODR-0005's `## Rules` (the four items 1-4 followed by criteria a/b/c) are met for all three exemplars. If 2+ DA positions remain held-as-live, the gate does NOT clear and downstream sessions (ODR-0006, ODR-0007, ODR-0008) wait.

**The hierarchy of my DA positions:**

- **Load-bearing (cannot concede without strong evidence):** Q2 (IC for physical Property — withdrawal on stewardship-IC OR hybrid OR explicit-per-exemplar verdict demonstration), Q5 (2-class default — withdrawal on named consumer-query evidence for 3-class).
- **Negotiable (concede on lighter conditions):** Q1 (sub-kind decoration — withdrawal on named consumer query OR demotion to `skos:scopeNote`), Q6 (Address-as-Mode — withdrawal on routing to ODR-0015), Q7 (exemplar pass — withdrawal on verdict-naming).
- **Already conceded:** Q3 (LegalEstate IC = title-register identity), Q4 (UPRN as contingent + SHACL/DASH operational key).

**My gate-clearance vote:** AGAINST gate clearance unless Q2 AND Q5 are withdrawn. The other five (Q1, Q3, Q4, Q6, Q7) are concedable or already conceded. The session's load-bearing decision is the 2-vs-3-class question (Q5) and the IC for the physical thing (Q2); without those settled, the gate is not actually cleared, regardless of what the other questions resolve.

**The catastrophic-failure mode I am guarding against.** The panel reaches consensus on Q1, Q3, Q4, Q6, Q7 (the easier questions), declares the gate cleared on a 5-of-7 wash, and proceeds to ODR-0006 — at which point ODR-0006 inherits an unresolved IC and re-litigates it within Person/Organisation identity. *Working Ontologist* 3rd ed. Ch. 7 §"The IC Inheritance Trap" warns this exact pattern: an unresolved IC at level N propagates as a re-litigation cost at level N+1 because every downstream class that *related to* the level-N class inherits the unresolved discipline. ODR-0006 (Agents & Roles) explicitly inherits ODR-0005's identity discipline (per the draft ODR-0005 `## Consequences`); if the inheritance is unresolved, ODR-0006 is unimplementable.

**Withdrawal condition (the gate condition itself):** Queen synthesis records explicit withdrawal of EITHER Q2 AND Q5 (the load-bearing pair) OR documents that the panel held against my withdrawal conditions on those two questions, in which case the gate does NOT clear and the synthesis names the held-dissent live-question with a routing decision (back to S005 with revised IC framing; or to ODR-0015 or another downstream record). Silent gate-clearance on the easier questions while load-bearing questions remain held is a methodology violation per ODR-0001 §Roles ("The DA MUST explicitly withdraw or hold on every contested question").

**Per-voice vote: CONDITIONAL — AGAINST gate clearance unless Q2 AND Q5 withdrawn; FOR gate clearance iff Q2 AND Q5 withdrawn alongside at least 4-of-5 on Q1/Q3/Q4/Q6/Q7.**

## DA scorecard target

The minimum I will concede the session on: **6 of 8 questions withdrawn**, where the 6 include Q2 AND Q5 (the load-bearing pair). If Q2 OR Q5 remains held, the gate does not clear regardless of the count on the other six.

**Negotiable axis breakdown:**

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| Q1 | Yes | No | Named consumer query OR `skos:scopeNote` demotion |
| **Q2** | **Yes, with high evidence bar** | **Yes** | **Stewardship-IC OR hybrid OR per-exemplar verdict demonstration on all three named scenarios** |
| Q3 | (already conceded) | — | (LegalEstate IC = title-register identity) |
| Q4 | (already conceded) | — | (UPRN as contingent + SHACL/DASH operational key) |
| **Q5** | **Yes, with high evidence bar** | **Yes** | **Named SHACL violation case OR SPARQL query OR lifecycle event where 3-class wins** |
| Q6 | Yes | No | Routing Address modelling to ODR-0015 |
| Q7 | Yes | No | Per-exemplar verdict-naming in synthesis |
| Q8 | (derived) | — | (Q2 AND Q5 withdrawn; ≥4-of-5 on Q1/Q3/Q4/Q6/Q7) |

**Held-dissent texts (for the Queen's record if my withdrawal conditions are unmet):**

- **Q2 held:** "Spatial-material continuity as the sole IC fails three named hard cases (rebuild-on-same-plot; surveying-revision identity drift; conveyancer pragmatic-identity practice). The IC discipline ODR-0001 A9 §(b) requires must produce the right verdict on the rebuild case and surveying-revision case, which spatial-material does not. Withdraw on stewardship-IC OR hybrid OR per-exemplar verdict demonstration. (*Working Ontologist* 3rd ed. Ch. 7 §'Pragmatic Identity'.)"

- **Q5 held:** "Three-class split (`Property` + `LegalEstate` + `RegisteredTitle`) is unsupported by any named consumer query, SHACL validation case, or lifecycle event. The lease-extension scenario the Hendler/Guizzardi camp anticipates is captured as a parameter update on `opda:LegalEstate` under the 2-class model with PROV-O `prov:wasRevisionOf` for registry-side history; no information is lost. RegisteredTitle as a UFO Relator collapses to a Mode on LegalEstate (Guizzardi 2005 Ch. 7 §'Relator identity'); not a Substance Kind. Withdraw on named consumer query / SHACL case / lifecycle event evidence. (*Working Ontologist* 3rd ed. Ch. 7 §'Distinctions that earn their keep'; TopQuadrant deployment record 2015-2019: two customer programmes shifted from 3-class registry models to 2-class consumer models after 3-class produced zero consumer queries in 18 months of production.)"

- **Q8 held (if Q2 or Q5 unwithdrawn):** "Gate does not clear. Load-bearing questions remain held; ODR-0006/0007/0008 cannot proceed against an unresolved IC. The S001 Q4 deferral was to *this* session; this session does not resolve the deferral if Q2 or Q5 remains held. Recommend S005-bis to discharge the remaining held questions before downstream sessions proceed."

## DA discipline note (for the Queen)

Per ODR-0001 §Roles, my withdrawal or hold MUST be explicitly recorded on every contested question. The conditions above are *mechanical* — the Queen reads my position file, checks whether the synthesis adopts each withdrawal condition, and records "Allemang DA withdrew on Q[n] on condition met: [verbatim condition]" or "Allemang DA held on Q[n]; condition unmet: [verbatim condition]". No vague "Allemang DA aligned with majority" — the alignment must trace to the specific condition that was met.

The S001 Q4 panel converged on the multi-class split (≥2) and deferred the cardinality decision to this session. I voted for 2-class in S001; the session record states "convergence on a multi-class split (≥2)... exact cardinality (2 vs 3) deferred to the crux ODR". This session settles the deferred cardinality. My S001 vote stands as the load-bearing prior commitment; the burden of proof is on the 3-class camp to deliver consumer-query evidence, not on me to disprove the third class.

The cited authority for every position above: *Semantic Web for the Working Ontologist* 3rd ed. (Allemang, Hendler, Gandon 2020), Ch. 7 "Identity and Identifiers" and Ch. 13 "Linked Data in the Real World"; TopQuadrant customer deployment record 2015-2019 (two programmes' shift from 3-class to 2-class models); Guizzardi 2005 *Ontological Foundations for Conceptual Modeling with Applications* Ch. 7 §"Relator identity" (the Mode-vs-Substance distinction that collapses RegisteredTitle into a Mode on LegalEstate under Guizzardi's own framework). These citations meet ODR-0001 §Citation grounding ("a named book authored by the expert"; "a documented deployment the expert led or co-authored").
