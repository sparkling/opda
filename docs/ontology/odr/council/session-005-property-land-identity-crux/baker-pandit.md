# Baker + Pandit — Governance-pair position on S005

## Pair summary

ODR-0005's gate is well-aimed: Endurant commitment, IC over hard cases, UPRN-as-checkable-key plus contingent-identifier under PROV succession, no `owl:sameAs`. Our pair contributes two cross-cutting governance disciplines the IC work must inherit: **(Baker — DCMI Usage Board / FIBO `LegalEntity` registry)** every ratified IC names its authoritative external source (HMLR Practice Guides for title-identity rules; Ordnance Survey AddressBase succession discipline for UPRN events); **(Pandit — DPV)** every identified individual carries a downstream PII regime, and the IC choices made here pre-determine where the DPV co-annotation lands (on the resource or on the mode-of-presentation). Person identity is out of scope (ODR-0006), but Property instances will eventually carry DPV PII via registered-proprietor names and addresses — the IC for `opda:RegisteredTitle` must compose with that downstream layering, not foreclose it. We concur with the panel's likely Endurant verdict (Q1) and the PROV-O succession verdict (Q4); we hold load-bearing positions on stewardship (Q2/Q3), the 2-vs-3 split (Q5) on PII-regime grounds, and the Address-as-mode question (Q6).

## Per-question positions

### Q1 — Endurant commitment (and sub-kind)

**Baker:** Concur Endurant for both classes. The DCMI lesson on stewardship-driven category commitment (Baker, Bechhofer, Isaac, Miles 2013, *Key Choices in the Design of SKOS*, §3.3 on `skos:Concept` as a persistent endurant) is that the category commitment becomes the substrate every downstream annotation depends on; under-committing now means re-litigating the category every time a new module imports the class. The sub-kind question is the right one to surface: a `dolce:PhysicalEndurant` commitment for `opda:Property` and a `dolce:NonPhysicalEndurant` (or `dolce:SocialObject` per Masolo et al. 2003, *WonderWeb Deliverable D18*) commitment for `opda:RegisteredTitle` / `opda:LegalEstate` would be the more discriminating cut — but Guizzardi/Guarino are better placed to fix the precise sub-kind. Our pair's contribution is: whatever sub-kind is committed, it must be **recorded with `dct:source` resolving to the DOLCE/UFO citation that defines it**, so the commitment is auditable. Don't commit to `dolce:PhysicalEndurant` by colour-of-text in the ODR; commit to it by URI resolving to the upstream definition.

**Pandit:** Stay agnostic on sub-kind level here. DPV's category commitments (Pandit et al. 2024, *DPV 2.0 Specification* §Class taxonomy) deliberately commit to coarse-grained DOLCE categories (`dpv:DataSubject` is a `dolce:Agent`, no finer); the DPV experience is that committing to finer sub-kinds at the gate session pre-loads downstream debate that the consuming module is better placed to resolve. The Endurant commitment is the load-bearing decision; sub-kind can be a deferred refinement noted in the ODR's `## Consequences`.

**Pair vote draft on Q1:** **FOR Endurant commitment for both classes**, with one amendment: **every category commitment carries `dct:source` to the DOLCE/UFO upstream definition** (Baker — DCMI Usage Board discipline). Sub-kind level: Baker recommends `PhysicalEndurant` / `NonPhysicalEndurant` distinction; Pandit defers to Guizzardi/Guarino on the precise sub-kind.

### Q2 — IC for physical Property (DEPTH)

**Baker (DCMI Usage Board lead — load-bearing on IC stewardship):** Concur "spatial-material continuity" as the IC framing. The substantive question is **who maintains the IC's definition over time** — stewardship is the question, not just the IC text. The DCMI Usage Board admission discipline (Baker, Bechhofer, Isaac, Miles 2013 §Design choices; DCMI Usage Board *Guidelines for Dublin Core Application Profiles*, 2009 §3.2) treats every IC as an entry in a maintained registry with a named steward. The FIBO `LegalEntity` IC (Kendall et al. 2020, *FIBO Foundations* — `fibo-be-le-le:LegalEntity` IC bound to ISO 17442) is the template: the IC is **anchored to an external authoritative source** (ISO 17442 for LEI; the source's definition is the IC's substantive content; the OPDA ontology references it, doesn't restate it).

For `opda:Property`'s IC, the authoritative external source is **Ordnance Survey AddressBase Plus (specifically the UPRN allocation rules in OS *AddressBase Plus Technical Specification* §UPRN lifecycle)** — these define what "the same physical addressable object" means over creation / merger / split / demolition, and the OS is the authoritative steward of the rules. The OPDA ODR's IC text **must cite that source** and the rules section governing each hard case (demolition: §retire; subdivision: §issue-new + retain-predecessor; merger: §retire-both + issue-one; rebuild: §retain-or-retire per assessor judgment).

The DCMI discipline has three parts:

1. **Authoritative source named.** Every IC names a single authoritative source (here: OS AddressBase Plus rules). Where the IC needs to refine the source's text for the OPDA context, the refinement is a `skos:scopeNote` in the OPDA layer, with the source's wording preserved as `skos:definition`.
2. **Steward named.** The OPDA WG must declare who, in the OPDA programme, is the responsible steward for IC updates when the upstream source revises its rules. The FIBO discipline (Kendall+Davis 2018) is one named expert with deputy.
3. **Update protocol.** When OS AddressBase issues a revised UPRN-lifecycle rule, the OPDA IC is updated by `## Change log` row in ODR-0005, attributed to the resolving Council session, with `dct:source` URI pinning the new OS version.

**Pandit:** Ratify Baker's depth. From the DPV side, the personal-data class definitions (`dpv-pd:Identifier`, `dpv-pd:OfficialID`) are bound to GDPR's text *by source URI* (Pandit et al. 2024, DPV §Provenance) — the regulatory authority *is* the IC's substance for the DPV terms. The same principle applies here: HMLR's title-register identity rules ARE the IC for `opda:RegisteredTitle`; OS AddressBase's UPRN-lifecycle rules ARE the substantive content of "same physical Property over UPRN succession." The OPDA ODR is the citation, not the definition. One DPV-specific addition: **the IC determines where PII attaches**. If the IC for `opda:Property` is "spatial-material continuity," then a re-numbered UPRN with the same property's proprietor-name data IS the same data subject's PII — the PROV-O succession trail (Q4) is also the PII-continuity trail. ODR-0012 must inherit this: PII annotations follow the `opda:Property` individual through UPRN succession, not the (retired) UPRN value.

**Pair vote draft on Q2:** **FOR "spatial-material continuity" IC**, with two amendments:

- **Amendment 1 (Baker — DCMI Usage Board / FIBO `LegalEntity` discipline):** IC text cites **Ordnance Survey AddressBase Plus UPRN-lifecycle rules** as authoritative source; OPDA WG names a steward and update protocol; `dct:source` pins the OS version.
- **Amendment 2 (Pandit — DPV co-annotation downstream):** ODR-0012's PII annotations follow the `opda:Property` individual through UPRN succession; the PROV-O succession trail IS the PII-continuity trail. Recorded in ODR-0005 `## Consequences` as a downstream constraint.

Vote: FOR Q2's IC framing + Amendments 1 + 2.

### Q3 — IC for LegalEstate / RegisteredTitle (DEPTH)

**Baker:** Concur "title-register identity" as the IC framing for `opda:RegisteredTitle`. Authoritative source is **HM Land Registry Practice Guide 1 (First Registrations)** for first-registration identity rules and **Practice Guide 8 (Execution of Deeds)** plus **Practice Guide 40 (HM Land Registry plans)** for transfer-between-registers and merger-of-titles events. The DCMI/FIBO discipline applied here: the IC text cites HMLR's published practice-guide section, not restates it.

The two questions the panel raised on the hard cases:

- **Title closure.** HMLR Practice Guide 16 (Cancellation of registered titles) is the source: a closed title retains its title-register identity (the title number is preserved in the historical record), but the `opda:RegisteredTitle` individual transitions to a `closed` lifecycle state. The IC does NOT change — the same title number, same title-register identity, with a closure event recorded via PROV-O (analogous to UPRN succession but for the legal layer).
- **Merger / transfer between registers.** When two titles are merged into one (HMLR PG 40 §Title-plan amalgamation), the resulting title is a NEW individual with a NEW title-register identity, and the predecessor titles are closed (each retaining its historical identity). When a title transfers between district registries (rare), the title-register identity is preserved (HMLR's national register is a single logical register; district allocation is administrative). The IC distinguishes substantive identity changes (merger → new individual) from administrative re-allocations (district transfer → same individual).

**Pandit (load-bearing — PII regime):** Critical to surface here. A registered freehold proprietor on a HMLR title constitutes **published personal data** under the GDPR (HMLR's Open Register publishes proprietor names since the 1990 Open Register Act; ICO has confirmed proprietor data as personal data subject to the public-task lawful basis — ICO Guidance on Public Authorities Lawful Bases, 2023 §HMLR open-register exception). This is a **distinct PII regime** from a private record:

| Class | PII regime | Lawful basis |
|---|---|---|
| `opda:Property` (physical) | Private — derived from records like AddressBase that are published but not personal | n/a (no PII inherent) |
| `opda:RegisteredTitle` (HMLR-published record) | **Public — published personal data of the proprietor**; subject to public-task lawful basis; subject access rights apply | GDPR Art. 6(1)(e); UK GDPR public-task |

**Implication for IC.** Whatever IC `opda:RegisteredTitle` carries, it must be discoverable enough to support **subject access requests** — a data subject must be able to identify "their" RegisteredTitle individual from the title number alone (HMLR's primary key for SAR processing). The IC text MUST therefore include "title number as authoritative discriminator for SAR-resolution purposes" — not as the IC's substance, but as a downstream constraint the IC text records.

**Pair vote draft on Q3:** **FOR "title-register identity" IC for `opda:RegisteredTitle`**, with two amendments:

- **Amendment 1 (Baker — DCMI / FIBO `LegalEntity` discipline):** IC text cites **HMLR Practice Guide 1 + PG 16 (closure) + PG 40 (merger)** as authoritative source; closure handled via PROV-O lifecycle event (same individual, different state); merger creates new individual + closes predecessors; district transfer preserves identity.
- **Amendment 2 (Pandit — DPV / ICO public-task regime):** ODR-0005 records that `opda:RegisteredTitle` instances carry a **distinct PII regime** (published personal data under HMLR open-register public-task lawful basis), and that IC discoverability must support GDPR Subject Access via title number. Routed to ODR-0012 for the DPV co-annotation pattern.

Vote: FOR Q3's IC framing + Amendments 1 + 2.

### Q4 — UPRN status

**Baker:** Concur "both — checkable SHACL/DASH key AND contingent administrative identifier under PROV succession." This is the DCMI lesson from the SKOS admission negotiations (Baker, Bechhofer, Isaac, Miles 2013 §Design choices): a `skos:notation` is a checkable key for discriminating instances while not being the IC; the IC is in `skos:Concept`'s definition. Apply the same cut here: `opda:uprn` is the operational discriminator (`dash:uniqueValueForClass`) — checkable, useful, degradable; the IC remains spatial-material continuity (Q2). UPRN succession via `prov:wasDerivedFrom` between predecessor and successor UPRN literals (or reified `opda:UPRNSuccessionEvent` per the flat-with-split-uprn exemplar) is the audit trail. **The succession discipline must cite the OS AddressBase Plus UPRN-lifecycle source**, as in Q2.

**Pandit:** Ratify. From the DPV side: UPRN is `dpv-pd:Identifier` (an identifier in the personal-data sense when associated with a residence's occupants), and UPRN succession events are PII-history events under GDPR Art. 5(1)(d) accuracy principle — predecessor UPRNs must be retrievable from PII records for a defined retention period (HMLR's typical retention is 12 years post-completion; the trust framework may set its own). The PROV-O succession trail (Q4 verdict) IS the PII-history trail (per Q2 Amendment 2 cross-reference).

**Pair vote draft on Q4:** **FOR "both" — checkable SHACL/DASH key AND contingent administrative identifier under PROV succession**, with one amendment:

- **Amendment (Baker + Pandit jointly):** The succession discipline cites **OS AddressBase Plus UPRN-lifecycle rules** as authoritative source for what counts as a succession event (retire, issue-new, merge, split); ODR-0012 inherits the PROV-O succession trail as the PII-history trail.

Vote: FOR Q4 + amendment.

### Q5 — Two- vs three-class split (DEPTH — PII regime turn)

**Baker:** Lean toward the pragmatic 2-class split (`opda:Property` + `opda:LegalEstate`, with `RegisteredTitle` as a state/sub-kind of `LegalEstate` rather than a separate Kind) — IF the exemplars demonstrate that the 2-class cut yields the right answers without forcing irreversible commitments. The DCMI lesson on under-modelling vs over-modelling (Baker 2013 §History of DCMI's class-vs-property debates) is that adding a class is reversible (one can introduce `RegisteredTitle` as a sub-class of `LegalEstate` later if the modelling pressure materialises), but removing one is **not** — every downstream ontology that imported the removed class breaks. Start with the minimum cardinality that survives the exemplars.

However — defer to exemplar evidence. If the multi-title flat or the unregistered-pre-first-registration case reveals that `LegalEstate` and `RegisteredTitle` have distinct IC behaviour (a `LegalEstate` exists pre-registration but `RegisteredTitle` does not until registration completes; a flat may have a leasehold `RegisteredTitle` while the freehold `LegalEstate` of the building is a separate registered title), then the 3-class split is justified by IC discipline, not by hypothetical future needs.

**Pandit (decisive — PII regime grounds):** This is where my position diverges. If `opda:RegisteredTitle` is a distinct class because it is the **HMLR-published-record class** (per Q3 PII regime analysis), then the 3-class split has a load-bearing PII justification independent of the IC discipline: `LegalEstate` and `RegisteredTitle` carry **different PII regimes**.

| Class | PII regime |
|---|---|
| `opda:LegalEstate` (legal interest, may or may not be registered) | Private until registered; PII status depends on whether the legal-estate-holder data is published |
| `opda:RegisteredTitle` (HMLR-published record) | Public personal data under HMLR open-register; ICO public-task lawful basis applies |

The unregistered-pre-first-registration exemplar makes this concrete: the freeholder of an unregistered house has a `LegalEstate` (their freehold interest is legally real) but **no** `RegisteredTitle` — and their proprietor data is **not** published personal data (no HMLR open-register entry exists). Once first registration completes, a `RegisteredTitle` individual is created, and the same freeholder's data transitions to the public PII regime. If the ontology collapses these into one class, the PII-regime transition becomes invisible at the class level and must be reconstructed from properties — exactly the kind of "missing class, no identity criterion" defect ODR-0005 exists to cure (Page 37 implicit-Property analogy).

**This is a substantive reason to split.** Not "modelling for hypothetical futures" — modelling for the **actual existing PII-regime distinction** that the unregistered-pre-first-registration exemplar exhibits.

**Pair vote draft on Q5:** **FOR the 3-class split (`opda:Property` + `opda:LegalEstate` + `opda:RegisteredTitle`)**, with the following resolution between our voices:

- Baker concedes pragmatic-2-class on Pandit's PII-regime evidence: the regime distinction is real and observable (unregistered exemplar), not speculative.
- Pandit's lead reasoning carries: `RegisteredTitle` ≠ `LegalEstate` because they carry distinct PII regimes under ICO public-task analysis.
- Joint amendment: **ODR-0005's `## Rules` MUST record the PII-regime distinction** (per Q3 Amendment 2) AND **`## Consequences` MUST route the DPV co-annotation pattern to ODR-0012** as a downstream commitment.

Vote: FOR 3-class split + PII-regime recording amendment.

### Q6 — Address-as-mode-of-presentation (DEPTH — DPV co-annotation crux)

**Baker:** This is **ODR-0015's question, not ODR-0005's**. The DCMI Usage Board discipline (Baker, Bechhofer, Isaac, Miles 2013 §Scope discipline) is that gate sessions resolve only what they must resolve to clear the gate; pre-deciding downstream questions in a gate ODR pre-empts the consuming module's authority. The Address modelling question — Frege-style modes of presentation (`marketingAddress`, `titleAddress`, `inspireAddress`) vs co-referring address resources — is rich enough to deserve its own session (ODR-0015 Address modelling, per the programme stub). ODR-0005 must NOT pre-decide it; ODR-0005 must record the **constraint** that ODR-0015 inherits.

The constraint is: whatever Address modelling ODR-0015 chooses, the addresses are NOT co-identifiers of the `opda:Property` (Guarino's Q4 framing was unanimous on this — address is a mode of presentation, not a bearer). ODR-0005's IC explicitly excludes address-as-identifier.

**Pandit (load-bearing — DPV constraint on ODR-0015):** Ratify Baker's deferral, BUT — surface the DPV constraint ODR-0015 must satisfy. The Address-as-mode-of-presentation choice has direct DPV consequences:

| ODR-0015 choice | DPV co-annotation lands on... | Consequence |
|---|---|---|
| **Address-as-mode** (each address is an attribute of the Property under a mode label: marketingAddress, titleAddress, inspireAddress) | The mode-instance (a property-value of the `opda:Property`, scoped by mode label) | Each mode-instance carries its own `dpv-pd:Address` PII tag; the property's PII regime is a function of which modes are populated and what regime each mode's source carries (HMLR title-address: public PII; marketing-address: private PII; INSPIRE-address: derived public data) |
| **Address-as-resource** (each address is a co-referring `opda:Address` individual linked to the Property via `opda:hasAddress`) | The resource (the `opda:Address` individual) | The `opda:Address` carries the `dpv-pd:Address` PII tag; mode is recorded as a property of the linking predicate or the address resource (e.g. `opda:addressKind "title"`); PII regime is uniform on the resource |

The two choices have substantively different DPV co-annotation patterns (ODR-0012). ODR-0015 MUST resolve the choice with explicit consideration of which pattern downstream PII compliance requires. ODR-0005 records this as a constraint, not a decision.

**Pair vote draft on Q6:** **FOR deferring Address modelling to ODR-0015**, with two amendments:

- **Amendment 1 (Baker — DCMI Usage Board scope discipline):** ODR-0005 records the constraint that address is NOT a co-identifier of `opda:Property` (per Guarino's Q4 framing); the Frege-mode question is routed to ODR-0015.
- **Amendment 2 (Pandit — DPV constraint on ODR-0015):** ODR-0005 `## Consequences` records the DPV co-annotation consequence — Address-as-mode means PII attaches to mode-instances; Address-as-resource means PII attaches to resource-instances; ODR-0015 must resolve with explicit PII-pattern consideration.

Vote: FOR Q6 deferral + Amendments 1 + 2.

### Q7 — Exemplar pass

**Baker:** Concur the exemplars pass IF their IC narratives explicitly state the IC over the named hard case each stresses. The Pandit amendment from S004 Q6 (Rule 8a — exemplars cited with one-line description of the named hard case) applies here: the gate-clearance check is not "does the TTL parse" but "does the exemplar's IC narrative make the right discrimination over the hard case the exemplar exists to stress." DCMI's test-description-set discipline (Singapore Framework §3) is the precedent.

For each exemplar:

| Exemplar | Named hard case | IC narrative MUST state |
|---|---|---|
| `registered-freehold-house.ttl` | Baseline (no edge condition) | One physical Property + one RegisteredTitle co-referring; IC yields one individual under spatial-material continuity; no succession |
| `unregistered-pre-first-registration-house.ttl` | UPRN absent + no LegalEstate/RegisteredTitle yet | IC for `opda:Property` works without a legal anchor and without UPRN (Cagle's graceful-degradation challenge); same individual persists when first registration later creates a `RegisteredTitle` |
| `flat-with-split-uprn.ttl` | UPRN succession event | Same physical individual across UPRN re-numbering (NOT two individuals); `prov:wasDerivedFrom` records succession; NO `owl:sameAs`; reification shape per ODR-0005 Rule 6 |

**Pandit:** Ratify Baker. Add: each exemplar's IC narrative should also note the **PII regime implications** of the case — the registered-freehold-house carries published proprietor data on the RegisteredTitle; the unregistered-pre-first-registration-house's freeholder data is private; the flat-with-split-uprn's PII history follows the physical Property through UPRN succession (per Q2 Amendment 2 / Q4 Amendment). This makes the exemplars not only IC-validators but PII-regime-validators — load-bearing for ODR-0012's eventual DPV co-annotation work.

**Pair vote draft on Q7:** **FOR exemplar pass IFF each exemplar's IC narrative explicitly states the IC over its named hard case** (Baker — DCMI test-description-set discipline; Pandit S004 Q6 amendment carry), with one amendment:

- **Amendment (Pandit — PII-regime validation):** Each exemplar's IC narrative also notes the PII regime implications of the case, as load-bearing input to ODR-0012.

Vote: FOR Q7 exemplar pass + amendment.

### Q8 — Gate clearance check

**Baker:** Gate clears at the deliberative level — the IC discipline is settled, the exemplars validate, the cure's shape is unambiguous. BUT — **`status: proposed` stays per the same namespace-block pattern as ODR-0004**. The OPDA WG has not ratified the namespace string (ODR-0004 Knublauch DA primary demand recorded 2026-05-27), and ODR-0005 carries `depends-on: [ODR-0004]`. Until ODR-0004 moves to `status: accepted`, ODR-0005 cannot move to `status: accepted` — the namespace string is load-bearing on the URI shape of every minted class (`opda:Property`, `opda:LegalEstate`, `opda:RegisteredTitle`) and every minted property (`opda:uprn`, `opda:identifiesSameProperty`, `opda:wasDerivedFromUPRN`). DCMI's namespace-persistence discipline (Baker 2013 §History on the cost of namespace changes) makes this non-negotiable.

The session's verdict is: **deliberatively cleared; artefact-status blocked on WG namespace ratification** — same pattern ODR-0004 established. Downstream module ODRs (ODR-0006, ODR-0007, ODR-0008) MAY proceed to their own Council sessions in parallel because the IC discipline is `pattern`-level content the modules can consume as draft; but their `status: accepted` chain remains blocked on the WG namespace decision.

**Pandit:** Ratify. The DPV namespace-change precedent (slash → hash 2019, 6 ecosystem-months recorded by Knublauch in S004 Q1) is exactly the cost the OPDA programme avoids by holding `status: proposed` until WG ratification. From the DPV side, the additional constraint: **ODR-0012's DPV co-annotation work (downstream of Q2/Q3/Q5/Q6 amendments above) CAN proceed in parallel** because the DPV-PD class hierarchy and the PII-regime distinctions Pandit's amendments record are `pattern`-level commitments that don't depend on the OPDA namespace string. ODR-0012 will need to wait on WG namespace ratification to move to `status: accepted`, but its working sessions are not blocked.

**Pair vote draft on Q8:** **FOR gate clearance at the deliberative level; `status: proposed` stays pending WG namespace ratification** (same pattern as ODR-0004), with one observation:

- **Joint observation (Baker + Pandit):** Downstream module ODRs (006, 007, 008, 012) MAY proceed in parallel Council sessions; their `status: accepted` chain remains blocked on the WG namespace decision; the IC discipline is `pattern`-level content consumable as draft.

Vote: FOR Q8 gate-clearance verdict + observation.

## Replies to anticipated DA (Allemang) attacks

### Allemang on Q5 — pragmatic 2-class is the working-ontologist's default

We anticipate Allemang attacks the 3-class split on pragmatic grounds: *"the 2-class cut (Property + LegalEstate) is the minimum that solves the modelling problem; adding RegisteredTitle is over-modelling unless a consumer fails under the 2-class cut. Show me the consumer that fails."*

**Our pair reply:** Pandit's PII-regime evidence IS the consumer that fails. The unregistered-pre-first-registration exemplar exhibits a real PII-regime transition that a 2-class ontology cannot record at the class level — the freeholder's PII regime transitions from private to public PII at the moment of first registration, which a 2-class ontology collapses into a property-value transition on a single `LegalEstate` individual rather than a class-level lifecycle event. ICO subject access processing (the consumer) requires class-level discrimination of "is this individual subject to HMLR open-register publication?" — a question the 2-class ontology answers with a property check; the 3-class ontology answers with a `rdf:type` check. The 3-class cut is justified by an actually-failing consumer, not by hypothetical future needs.

### Allemang on Q3 — IC for RegisteredTitle is overspecified

We anticipate Allemang attacks the IC for RegisteredTitle on operational grounds: *"title-register identity is fine, but the closure / merger / district-transfer hair-splitting is overspecified for the gate. The cure is 'title-register identity = title number'; the hard cases are downstream."*

**Our pair reply:** The hard cases are NOT downstream — they are the gate's own work. ODR-0005's gate-clearance criteria (per the ODR itself) require "stated IC that gives the right answer over its hard case." For `opda:RegisteredTitle`, the hard cases are closure (does the IC survive title closure?) and merger (do two titles becoming one preserve identity, or create a new individual?). Without explicit answers, ODR-0005 hands the question to ODR-0007 (Transactions & Lifecycle) without an IC framework, and ODR-0007 must reopen the gate. Baker's HMLR Practice Guide citations (PG 1, PG 16, PG 40) are not hair-splitting; they are the authoritative source the IC text MUST cite to be auditable.

---

**Cross-references.** Our pair's Q2/Q3 IC-stewardship amendments (HMLR + OS AddressBase Plus as authoritative sources) feed forward into ODR-0006 (shared identity discipline for Person/Organisation — different external sources: ISO 17442 for organisations via LEI; passport authorities, electoral roll, ICO published-list for persons), ODR-0008 (descriptive attributes whose IC stewardship inherits the same discipline), and ODR-0012 (DPV co-annotation — the PII-regime distinctions Pandit's Q3/Q5/Q6 amendments record). Our Q5 PII-regime evidence for the 3-class split is the load-bearing input ODR-0012 will consume when authoring the DPV co-annotation pattern. Our Q6 deferral to ODR-0015 carries forward the Address-as-mode-vs-resource DPV constraint as a load-bearing input to that session.
