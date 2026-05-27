# Guarino — Devil's Advocate on S010

## DA framing

The panel will reach for SHACL-profile completeness on this question — Knublauch (as Queen and SHACL/DASH owner) will press the canonical mapping; Cagle will press his three-rule interface contract carryover from S013; Gandon will press the build-step composition discipline; Guizzardi will press the no-identity-override gate. Every position is correctly framed within the overlays-as-SHACL-profiles framework already ratified at [S001 Q5](../session-001-pdtf-schema-to-ontology.md#q5-—-overlays--shacl-profiles-owned-by-knublauch). My job as DA is to hold the line I conceded — *but did not abandon* — at S001 Q5: **"loaded profile = active requirement" promotes a build-config artefact to ontological status with no fixed model theory; `sh:minCount 1` becomes a function of which files a build call passed, with no model-theoretic ground.** The S001 panel met my withdrawal condition by **reifying** conditionality as a first-class `opda:ValidationContext` — "required under the Conveyancer profile" is a coherent proposition; "required (depending)" is not. I withdrew on that reification, and the concession is binding.

The DA frame this session: verify the reification is **complete**. The S001 concession was *structural* — a `ValidationContext` class exists as a first-class node — but the *ontological* commitment was deferred to the ODR-0010 fleshing-out. The risk at S010 is that the reification is performed structurally (the class is named) without committing to its UFO meta-category (the class is grounded), leaving an `opda:ValidationContext` node that floats free of the foundation discipline ratified by ODR-0011 §8a / ODR-0005 §2a. If `opda:ValidationContext` is not explicitly committed to a UFO meta-category (specifically: **Substance Kind / Endurant** — a profile is a record-entity with its own lifecycle, created at form-publication, versioned, deprecated), the constraint-as-axiom conflation can re-enter through the back door: the profile is treated as a derived projection of the TBox rather than as a first-class entity *over* the TBox, and `sh:minCount 1` quietly drifts back toward the "required (depending)" reading my S001 dissent rejected.

Guarino & Welty 2002 *OntoClean* §"Rigidity, Identity, Unity, Dependence" makes the case mechanically: a class that lacks a committed UFO meta-category lacks the discipline that distinguishes regulated record-entity (Substance Kind, +R +I +U) from derived projection (Mode or Quality, dependent). Without that commitment, `opda:ValidationContext` can be read as a derived projection of the TBox — a view, not an entity — and the "no fixed model theory" objection reawakens. The S005 Q1 unanimous vote committing Property + LegalEstate + RegisteredTitle to Substance Kind set the precedent; the S015 Q1 vote committing Address to Substance Kind / NonPhysicalEndurant extended it; the S011 §8a seven-category framework operationalised it at scheme level. ODR-0010 must follow the precedent: name `opda:ValidationContext` as a Substance Kind with its own IC, or the reification is incomplete.

The risk at S010 is not the SHACL-profile framing (that is settled by S001 + Knublauch SHACL Rec discipline) and not the build-step composition (that is settled by Gandon + Knublauch insistence on graph-union as code). The risk is the **reification commitment**: as ODR-0010 §Rules names the `opda:ValidationContext` pattern, the §Rules must also commit the class to a UFO meta-category and name its IC (created at form-publication; versioned by `opda:profileURI` or equivalent; deprecated under named lifecycle rule). Without that commitment, the S001 withdrawal condition is met *in name* but not *in substance*.

The DA frame I bring: each per-question position below tests whether the reification is complete. Most concede — the panel has done the structural work and Knublauch's mapping is correct. The one place I press is Q1 (`opda:ValidationContext` reification), which is the load-bearing question for the S001 withdrawal-condition test. Q6 (no-identity-override gate) gets STRONG SUPPORT because Cagle's `sh:Violation` enforcement is the right operational check on the cross-cutting risk (a profile touching identity is exactly the constraint-as-axiom conflation in its sharpest form). The rest are settled or near-settled.

## Per-question DA positions

### Q1 — `opda:ValidationContext` reification (PRIMARY VIGILANCE)

**DA position (PRIMARY VIGILANCE):** Concede the *structural commitment* — `opda:ValidationContext` is a first-class node with `opda:profileURI`, `opda:requires`, and `opda:overlaysContext` (or equivalent) properties. The structural answer is correct; this is exactly the reification the S001 withdrawal condition required. **What I will hold the line on is the §Rules text** that commits `opda:ValidationContext` to a UFO meta-category.

`opda:ValidationContext` is a record-entity. A BASPI5 profile is *created* at form-publication (a real point in time when the BASPI form was issued in version 5); it is *versioned* (BASPI5 succeeds BASPI4, both exist as identifiable validation contexts); it is *deprecated* (a future BASPI6 may supersede BASPI5, and the deprecation lifecycle must be addressable). This is the lifecycle of a Substance Kind / Endurant per UFO discipline (Guizzardi 2005 Ch. 4) — a rigid bearer of its own identity, not a Mode or Phase of something else. The S005 Q1 precedent committed Property + LegalEstate + RegisteredTitle to Substance Kind on exactly this discipline; the S015 Q1 precedent extended it to Address; the S011 §8a precedent operationalised it at scheme level. ODR-0010 must follow.

The S001 reification was structural: a class was named. The S010 commitment must be ontological: the class must be grounded in a UFO meta-category. Without the grounding, downstream consumers (ODR-0013 SHACL severity; ODR-0012 governance; module overlays beyond BASPI5) may treat `opda:ValidationContext` as a derived projection of the TBox — a view, not an entity — and the constraint-as-axiom conflation re-enters through the back door. The §Rules text must say: **`opda:ValidationContext rdfs:subClassOf prov:Entity` AND `opda:ValidationContext a opda:SubstanceKind`** (per ODR-0011 §8a — the UFO meta-category label vocabulary) **with an IC** (the IC being: identified by `opda:profileURI` and `opda:contextVersion`, with lifecycle phases governed by ODR-0011 §5 three-case discipline transposed to profile lifecycle).

The three BASPI exemplars (or the exemplars the session selects) exhibit this directly. A BASPI5 profile has its own identity independent of any transaction it validates (it is published once and validates many transactions); the same transaction may be validated under multiple profiles (BASPI5 + NTS2 + CON29R, each its own `ValidationContext`); profiles persist across the transactions they validate (the profile is the *Endurant*; the transactions are the *occurrents* against which the profile fires). The Substance Kind commitment captures this; the bare "first-class node" structural commitment does not.

**Withdrawal condition:** ODR-0010 §Rules explicitly names (in the `opda:ValidationContext` reification row or in a §Rules-adjacent note) that **`opda:ValidationContext a opda:SubstanceKind`** (UFO meta-category per ODR-0011 §8a; precedent: ODR-0005 §2a Property + LegalEstate + RegisteredTitle; ODR-0015 §2a Address) **with `rdfs:subClassOf prov:Entity`** (a profile is a `prov:Entity` whose generation history is `getTransactionSchema`'s deep-merge build) **and an IC** (identified by `opda:profileURI` + `opda:contextVersion`; lifecycle governed by ODR-0011 §5 three-case discipline transposed). Without this text, the S001 withdrawal condition is met structurally but not ontologically; downstream ODRs may treat `opda:ValidationContext` as a derived projection of the TBox and the "no fixed model theory" objection reawakens.

**Per-voice vote: CONDITIONAL FOR — concede on §Rules text + withdrawal condition stated.** Concede the structural reification; hold-as-live on the UFO meta-category commitment.

### Q2 — Composition semantics

**DA position:** CONCEDE. Profile composition as a documented build-step graph-union (Gandon + Knublauch S001 insistence; mirroring `getTransactionSchema`'s deep-merge) is the right operational pattern. The build-step replacement discipline for `sh:in` (set-union, not stacked) is correctly captured in the stub's §Rules. Commutativity is empirically resolved by the union semantics: `sh:minCount 1` shapes are purely additive (commutative); merged `sh:in` is set-union (commutative); `oneOf`/`sh:xone` is the only place where order *could* matter if the discriminator interpretation drifts across profiles — but the discriminator is keyed on `role` / `sellersCapacity` value semantics that the underlying SKOS scheme governs (ODR-0011), and SKOS scheme membership does not vary across profiles. No DA attack on the composition mechanics.

**Per-voice vote: FOR build-step graph-union composition.** Concede.

### Q3 — `dct:source` form-question IRI minting

**DA position:** CONCEDE. The `…/forms/baspi5#B1.3.2` IRI pattern (hash-fragment URIs on a dereferenceable form document) is the W3C-grade interop signal — Cagle precedent + Kendall FIBO `LegalEntityIdentifier`/LEI pattern (Kendall et al. *FIBO Foundations* §"Identifier Properties"). The hash-fragment design provides stable per-question anchors that survive form versioning if the form-publication discipline keeps `#B1.3.2` anchors stable across BASPI5.x patch versions; the minor-version axis (BASPI5 → BASPI6) crosses into the `opda:contextVersion` reification of Q1. Whoever mints (OPDA at form-publication time; the form-publication discipline is operational, not ontological) and how the anchors stay stable (publication discipline + redirect map at the form-publication endpoint) are operational questions, not DA-scope. No DA attack.

**Per-voice vote: FOR `…/forms/baspi5#B1.3.2` IRI minting pattern.** Concede.

### Q4 — DASH coverage

**DA position:** CONCEDE. DASH is the operational rendering vocabulary (Knublauch et al. *DASH Data Shapes* specification — `dash:propertyRole`, `dash:viewer`, `dash:editor`, `sh:order`, `sh:group`); the BASPI5 PDF audit is the empirical coverage check the session performs (or the session names as ODR-0010's confirmation criterion if the audit is deferred). DASH's expressive ceiling against complex form constructs (multi-page forms, branching narratives) is a known scoping concern but does not bear on the reification line. No DA attack.

**Per-voice vote: FOR DASH rendering coverage.** Concede.

### Q5 — `oneOf` → `sh:xone`

**DA position:** CONCEDE. `sh:xone` for exactly-one (Knublauch & Kontokostas 2017 *SHACL Recommendation* §3.7.2 — `sh:xone` is the W3C-grade construct for exclusive-disjunction; `sh:or` is "at least one" and the wrong choice for JSON `oneOf` strict-one semantics) with `sh:qualifiedValueShape` on the `role` / `sellersCapacity` discriminator is the right SHACL operationalisation. The nested `oneOf` (the Personal-Representative/Attorney branch requiring `sellersCapacityDetails` and `attachments`) → nested `sh:xone` is correct. No DA attack.

**Per-voice vote: FOR `sh:xone` with `sh:qualifiedValueShape` discriminator.** Concede.

### Q6 — No-identity-override gate (STRONG SUPPORT)

**DA position (STRONG SUPPORT):** Strongly support. Cagle's `sh:Violation` enforcement at ODR-0013 is the **non-negotiable** operational check on the cross-cutting risk: a profile that touches a Kind's identity or key is exactly the constraint-as-axiom conflation in its sharpest form (an overlay reaching down into the rigid TBox to alter the identity criterion of a Substance Kind it is supposed to merely constrain). Guizzardi's S001 gate is correct in principle (no overlay may declare or override a Kind's identity/key); Cagle's ODR-0017 carryover at the 11th citing site materialises the gate as a SHACL meta-shape firing `sh:Violation` on any profile graph that mints triples touching `owl:hasKey`, `dash:uniqueValueForClass`, or the IC-bearing properties named in ODR-0005 §3 / ODR-0015 §2a / module ODRs.

This is the load-bearing operational check: the cross-cutting risk for the entire overlay programme is that a future profile (BASPI6, TA8, or a third-party profile a downstream consumer authors) silently overrides identity — a profile that mints `owl:hasKey` triples on `opda:PropertyPack`, or a profile that introduces `dash:uniqueValueForClass` on a Mode that was deliberately left non-identifying — and the gate must fire `sh:Violation` (not `sh:Warning`) so that the profile graph is **rejected** at validation time, not silently absorbed. The S001 Guizzardi gate without operational enforcement is just policy; with Cagle's `sh:Violation` materialisation, it is policy + check.

The DA framing concern: the gate's specification must be tight enough to fire on the right cases without overshooting. The properties the gate watches must be enumerated (the IC-bearing properties named in ODR-0005 §3 + ODR-0011 §8a + ODR-0015 §2a + module ODRs as they ratify); the gate must not fire on properties that are presence-and-vocabulary constraints (the legitimate scope of overlays). ODR-0013 owns the enumeration; ODR-0010 inherits it. This is the right division of labour.

**Per-voice vote: STRONG FOR `sh:Violation` enforcement via ODR-0013 carryover.** Strong support, not just concede.

### Q7 — Round-trip test on BASPI5 slice

**DA position:** CONCEDE the MVP gate. The round-trip test — load profile → validate conformant transaction → reject non-conformant transaction → re-generate BASPI form via DASH annotations with full `dct:source` traceability — is the right empirical check on the BASPI5 vertical slice (S001 Q7 spike-then-scale verdict; Cagle + Knublauch S001 consensus). The build-step regression guard (composed profile's effective `sh:in` is the set-union, not the intersection, of base and loaded members) is the right tooling-level check that catches the silent-failure mode (stacked `sh:in` = conjunction = intersection, the opposite of intent). Profile and form-question URIs MUST dereference, per the S004 namespace-discipline carry. No DA attack.

**Per-voice vote: FOR round-trip MVP gate.** Concede.

### Q8 — Three-rule interface contract

**DA position:** CONCEDE. Cagle's three-rule interface contract from Scope-Check 1 Q6 — `sh:in` semantics (merged at build time / 0010 applied to closed schemes / 0013), `sh:Violation` floor (profile cannot add a Violation not already in base; 0013 owns the floor, 0010 inherits), no-identity-override gate (profile cannot touch a Kind's key; 0013 owns the keys, 0010 enforces) — is the right cross-ODR seam discipline. The §References citation requirement (ODR-0010 §References MUST explicitly cite ODR-0013 on the three rules) is the operational mechanism that prevents the seam from leaking silently. If the seam *does* leak (build-step composition produces surprises), the spawn-ODR-0010b/0013b SHACL-composition-semantics escape valve is the right A9 §Artefact identity test pressure response, not in-place merging. No DA attack.

**Per-voice vote: FOR three-rule interface contract + spawn-rule escape valve.** Concede.

## Replies to anticipated panel positions

### Knublauch on Q1 — `opda:ValidationContext` is structurally a SHACL artefact

**Anticipated:** Knublauch (as Queen and SHACL/DASH owner) may press that `opda:ValidationContext` is *structurally* a SHACL artefact (a named shapes graph with a profile-URI) and that the UFO meta-category commitment is over-ontological for what is operationally a SHACL profile pointer.

**DA reply:** Concede the structural framing — `opda:ValidationContext` *is* a SHACL artefact pointer; that is its operational role. The UFO meta-category commitment does not contradict that role; it grounds it. A SHACL profile is a published, versioned, deprecable record — that is the lifecycle of a Substance Kind. The S005 + S015 + S011 precedents all committed structural classes (Property, Address, SKOS schemes) to UFO meta-categories without contradicting their structural roles; ODR-0010 follows the precedent. If Knublauch's concern is the *weight* of the commitment (UFO meta-category may overdetermine a class whose primary identity is SHACL artefact), the answer is: ODR-0011 §8a established the lightweight-commitment discipline (the meta-category is a label vocabulary, not a heavy axiom layer); ODR-0010 inherits the lightweight pattern.

### Cagle on Q6 — `sh:Violation` enforcement may need profile-graph meta-validation

**Anticipated:** Cagle may surface that the `sh:Violation` enforcement requires meta-validation on the *profile graph itself* (the profile is the validation target; the IC-bearing properties enumeration is the meta-shape; firing `sh:Violation` on profile-graph triples that touch IC-bearing properties is the gate). This is a meta-shape pattern that may need its own ODR-0010 §Rules row.

**DA reply:** Strong concede. The meta-validation framing is exactly correct — the profile graph is the validation target for the no-identity-override gate; the IC-bearing properties enumeration is the meta-shape's `sh:targetSubjectsOf` set; the gate fires `sh:Violation` on any profile graph that mints triples on those properties. This is the operational mechanism that distinguishes the gate from mere policy. ODR-0010 §Rules should include the meta-validation row explicitly (not just inherit from ODR-0013), so that the gate's operational scope is named in the profile-mechanism ODR. This is a §Rules tightening, not a DA attack; the structural commitment is correct.

### Gandon on Q2 — composition commutativity may need explicit proof

**Anticipated:** Gandon (RDF-standards rigor) may surface that profile composition commutativity is *empirically* true under the union semantics but is not *formally proven* — a future overlay that introduces a non-commutative construct (e.g. a profile that mints `sh:not` shapes whose composition under graph-union is order-sensitive) could break the commutativity assumption silently.

**DA reply:** Concede the formal-proof concern as scope-bounding rather than DA-blocking. The commutativity is true for the constructs ratified in S001 Q5 (the canonical mapping: `sh:minCount 1`, merged `sh:in`, `sh:xone`, `dct:source`, DASH annotations); a future construct that violates commutativity is a future ODR-0010 amendment under the A9 §Artefact identity test (the construct doesn't fit the existing pattern; spawn ODR-0010b for the new construct). The §References to ODR-0013's three-rule interface contract (Q8) is the seam-check that catches the violation. No re-open trigger from S010; this is forward-supersession territory.

### Guizzardi on Q1 — Substance Kind commitment may need IC over multi-profile case

**Anticipated:** Guizzardi may surface that `opda:ValidationContext`'s Substance Kind commitment needs an IC over the multi-profile case (a transaction validated by BASPI5 + NTS2 + CON29R has three concurrent `ValidationContext` instances; how do they relate? Is the merged graph a fourth `ValidationContext`?).

**DA reply:** Strong concede the IC question as legitimate; mild DA framing on the answer. The merged graph (BASPI5 + NTS2 + CON29R composed) is **not** a fourth `ValidationContext` — it is the *application* of three concurrent `ValidationContext` instances to one transaction; each profile remains its own Substance Kind, each persists across transactions, the composition is operational (the build-step graph-union) not ontological (no fourth profile is created). This is exactly the discipline that distinguishes Substance Kind (each profile is its own rigid bearer) from a derived projection (the merged graph would be a derived view, not an entity). The §Rules text on the IC should name this case explicitly: composition is graph-union of concurrent profiles, each retaining its own identity; the merged graph is not a `ValidationContext`. This is a §Rules tightening that strengthens the reification, not a DA attack.

## Held-as-live re-open trigger (the reification-completeness line)

The primary DA framing concern lives at the ODR-0010 §Rules text. Two scenarios trigger a re-open of S010:

1. **Downstream consumer treats `opda:ValidationContext` as derived projection.** If ODR-0013 (SHACL Validation & Severity), ODR-0012 (Data-Governance Layer), or a module overlay beyond BASPI5 (TA6, NTS2, CON29R as they ratify) treats `opda:ValidationContext` as a view-over-TBox rather than as a Substance Kind / Endurant — e.g. mints `opda:ValidationContext` instances that lack `opda:profileURI` or `opda:contextVersion` identity, or derives `opda:ValidationContext` from TBox content rather than from a published profile artefact — the §Rules text on the Substance Kind commitment has failed its load-bearing test and S010 re-opens to tighten the text.

2. **18-month consumer-side conflation check.** If 18 months / downstream consumers (OPDA's own tooling; profile-publishing systems; downstream validators) treat `sh:minCount 1` shapes inside a profile as if they were free-floating axioms whose truth varies with build-call file lists — i.e. produce outputs of the form "this property is required (depending on which profile loaded)" rather than "this property is required under the [named] profile" — the consumer-side conflation indicates the §Rules text did not preserve the distinction operationally and S010 re-opens.

The re-open triggers are mechanical: the next session that touches ODR-0010 (or any downstream ODR consuming the overlay-profile mechanism) checks for both trigger conditions and records the result; if either fires, S010 reconvenes with the specific §Rules tightening on the table.

## DA scorecard target

Target concession profile: **7 of 8 concedes** (Q2 + Q3 + Q4 + Q5 + Q6 + Q7 + Q8 outright; Q1 withdrawn on the §Rules text naming `opda:ValidationContext` as Substance Kind with IC). The SHACL-profile framing is correct; the structural commitments are settled; only the §Rules text on the reification-completeness line remains as the load-bearing condition. If the Queen synthesis adopts the Q1 withdrawal condition, the scorecard lands at 8-of-8 concedes (full withdrawal on every question).

**Negotiable axis breakdown:**

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| **Q1** | **Yes** | **Yes (§Rules text)** | **§Rules names `opda:ValidationContext a opda:SubstanceKind` (per ODR-0011 §8a; precedent ODR-0005 §2a / ODR-0015 §2a) with `rdfs:subClassOf prov:Entity` AND an IC (identified by `opda:profileURI` + `opda:contextVersion`; lifecycle per ODR-0011 §5 three-case discipline transposed)** |
| Q2 | (already conceded) | — | (Build-step graph-union composition — Gandon + Knublauch S001 insistence) |
| Q3 | (already conceded) | — | (`…/forms/baspi5#B1.3.2` IRI minting — Cagle + Kendall FIBO precedent) |
| Q4 | (already conceded) | — | (DASH operational coverage — Knublauch DASH spec authority) |
| Q5 | (already conceded) | — | (`sh:xone` with `sh:qualifiedValueShape` — Knublauch SHACL Rec §3.7.2) |
| Q6 | (strong support) | (cross-cutting) | (`sh:Violation` enforcement via ODR-0013 carryover — Cagle's 11th citing site) |
| Q7 | (already conceded) | — | (Round-trip MVP gate — S001 Q7 spike-then-scale + Cagle/Knublauch consensus) |
| Q8 | (already conceded) | — | (Three-rule interface contract — Scope-Check 1 Q6 + Cagle ODR-0013 seam discipline) |

**Held-dissent text (for the Queen's record if my withdrawal condition is unmet):**

- **Q1 held:** "The S001 Q5 withdrawal condition — that profile conditionality be reified as a first-class `opda:ValidationContext` to give the fixed model theory the Devil's Advocate demanded — was met *structurally* at S001 by naming the class. The ODR-0010 §Rules text as it stands names the structural reification but does not commit `opda:ValidationContext` to a UFO meta-category. Without that commitment, `opda:ValidationContext` floats free of the foundation discipline ratified by ODR-0005 §2a / ODR-0015 §2a / ODR-0011 §8a; downstream consumers may treat it as a derived projection of the TBox (a view, not an entity) and the constraint-as-axiom conflation re-enters through the back door. The S001 'no fixed model theory' objection reawakens. Withdraw on §Rules text that explicitly names `opda:ValidationContext a opda:SubstanceKind` with `rdfs:subClassOf prov:Entity` and an IC over `opda:profileURI` + `opda:contextVersion` lifecycle. (Guarino & Welty 2002 *OntoClean* §'Rigidity, Identity, Unity, Dependence' — a class lacking a committed UFO meta-category lacks the discipline that distinguishes regulated record-entity from derived projection; Guizzardi 2005 *Ontological Foundations for Conceptual Modeling* Ch. 4 — Substance Kind as rigid Endurant with own IC; Moreau & Missier 2013 *PROV-O Recommendation* §3 — `prov:Entity` as the W3C-grade superclass for record-entities with generation history.)"

## DA discipline note (for the Queen)

Per ODR-0001 §Roles, my withdrawal or hold MUST be explicitly recorded on every contested question. The condition above is *mechanical* — the Queen reads my position file, checks whether the synthesis adopts the Q1 withdrawal condition (specifically the §Rules text naming `opda:ValidationContext` as a Substance Kind with `rdfs:subClassOf prov:Entity` and an IC), and records "Guarino DA withdrew on Q1 on condition met: [verbatim condition]" or "Guarino DA held on Q1; condition unmet: [verbatim condition]". No vague "Guarino DA aligned with majority" — the alignment must trace to the specific §Rules text that names the Substance Kind commitment.

The S001 Q5 precedent matters: I conceded the structural reification at S001 because the panel met my "no fixed model theory" withdrawal condition by naming `opda:ValidationContext` as a first-class node. That concession is binding; I do not get to reopen the structural commitment from S010. But the concession was *structural*, not ontological — the ontological line (the class must be grounded in a UFO meta-category, not floating free) is what this S010 position holds. The structural pattern is settled; the §Rules text on the meta-category commitment is the test.

The cited authority for every position above: Guarino & Welty 2002, *Evaluating Ontological Decisions with OntoClean*, Communications of the ACM 45(2) §"Rigidity, Identity, Unity, Dependence" (the meta-property discipline that distinguishes rigid Substance Kind from dependent projection); Guarino 2008, *On the Need for an Explicit Treatment of Domain Concepts*, Proc. EKAW 2008 §3-4 (the domain-concept commitment discipline that requires `opda:ValidationContext` to be its own bearer with named IC); Moreau & Missier eds. 2013, *PROV-O Recommendation* W3C (the authoritative scope of `prov:Entity` as the W3C-grade superclass for record-entities with own generation history); Guizzardi 2005, *Ontological Foundations for Conceptual Modeling*, PhD Thesis Ch. 4 (UFO Substance Kind as rigid Endurant with own IC). These citations meet ODR-0001 §Citation grounding ("a peer-reviewed paper authored by the expert"; "a W3C Recommendation, Working Draft, or Note — named spec + section number").
