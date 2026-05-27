# Baker + Pandit: Position on Programme Scope-Check

> Two voices for the scope-check session ahead of the 13-ODR follow-up
> programme (sessions 002–014). **Tom Baker** (Dublin Core; DCMI
> vocabulary governance; "Vocabularies as a Common Language") and
> **Harshvardhan Pandit** (DPV / DPV-PD / DPV-LEGAL editor; GDPR
> semantics). Lens: vocabulary-governance discipline + data-governance
> crispness. We share the substrate (thin OPDA layer over shared
> vocabularies, governable by ODR-gated admission); we lean opposite
> ways on the governance cluster — Baker toward fewer ODRs and a cleaner
> catalogue, Pandit toward more first-class shelf space for DPV and
> W3C VC consent receipts.

## Framing

The question is not whether sessions 002–014 should run. Most should.
The question is whether the 13 records are the right *units of decision*
— each carrying one decision a Working Group could ratify, no record
collapsing two unrelated decisions, none so thin it folds into a
neighbour without loss.

Two shapes of worry:

- **Baker — catalogue discipline.** ODR-0002 (catalogue) and ODR-0014
  (its amendment) are one decision tracked across two records by
  historical accident. The DCMI hygiene rule — terms vs amendments,
  provenance preserved but not duplicated — collapses them cleanly
  once session-002 ratifies the admission rule schema.
- **Pandit — where DPV actually lives.** 0009 drafts co-annotation;
  0012 ratifies and may amend back. Both carry the lawful-basis /
  consent / purpose dissent. Two records doing two jobs, or one
  decision split across two pages with cross-amendment hooks?
  Separately: a property-data *Trust Framework* is W3C VC / DID
  shaped. The framework deserves a citation; whether it earns a
  first-class ODR is the call.

Eight verdicts below. Two splits, six agreements.

---

## Q1 — Is the 13-ODR cut right?

**Baker.** Mostly yes, with one collapse. The cut handles each
recognisable ontological concern once (Foundation, Identity, Agents,
Transactions, Property attrs, Claims, Profiles, Enumerations, Governance,
Validation) plus a catalogue. That is a Dublin-Core-shaped programme:
small, declared up front, each record a separate term of art. **0002 +
0014 is one decision tracked across two records** by a scheduling quirk.
**Vote.** Ratify-with-collapse: 13 → 12 after sessions 002/014.

**Pandit.** Mostly yes, with a duplication observation. The cluster
009 / 011 / 012 carries the heaviest cross-cutting load — PROV-O
backbone (009), purpose taxonomy + PD-category register (011), DPV
adoption discipline (012). The **co-annotation pattern is currently
described in 0009 §"DPV co-annotation" and again in 0012's §"Evidence
co-annotation"** — same pattern, two homes. Same duplication signal
Baker raises, but biting at the governance seam.
**Vote.** Ratify, with: 0012 owns DPV authoring; 0009 cites.

**Joint.** Cut is right; both duplications recoverable in
session-002/012/014. No spawn from this question.

---

## Q2 — Should ODR-0008 (Property descriptive attributes) split into sub-modules?

**Baker.** Not yet. Sub-dividing 0008 (built form / energy / utilities /
searches / encumbrances) is right *once volume is felt*, but doing it
pre-drafting is premature optimisation. DCMI's repeated lesson: the
catalogue grows on adoption pressure, not on speculative future
structure. Wait for spanning-leaf reconciliation (plan §4 Q5) to push
back; then split.
**Vote.** Hold; revisit after session-008.

**Pandit.** Agreed. The PII density I care about (occupier names,
`aged17OrOverNames`, AML results, `cautionOrConviction`) is not
descriptive-attribute volume — it sits between 0006 and 0008's
encumbrances sub-area, governed by 0012's annotation. Sub-dividing 0008
makes the governance handoff *harder*, not easier — the DPV tag has to
follow across whichever sub-module owns it.
**Vote.** Hold.

**Joint.** Do not split 0008 pre-emptively.

---

## Q3 — ODR-0008 vs ODR-0011: combine?

**Baker.** No. Different jobs at different layers. 0011 decides *the
SKOS mechanism* — closed list → `skos:ConceptScheme` with
`skos:prefLabel`/`skos:notation`/`skos:definition` and `dct:source`,
hierarchical vs flat declared per scheme. 0008 decides *which datatype
properties exist on Property* and *whether a given category-like
attribute is datatype-typed or SKOS-typed*. The plan's §4.1 routing
("Datatype-vs-SKOS — Session 011 general criterion, Session 008
per-attribute application") is exactly how DCMI / DCAT split this seam:
schema vocabulary in one record, application profile in another.
Collapsing would force 0011 to deliberate every attribute and 0008 to
re-decide the SKOS pattern.
**Vote.** Keep separate.

**Pandit.** Agreed. 0011 is where the purpose taxonomy and the
PD-category register live, consumed by 009 / 012 / 006. Folding into
0008 orphans those.
**Vote.** Keep separate.

**Joint.** Keep separate; tighten §4.1 routing so 008 does not
re-litigate SKOS shape.

---

## Q4 — ODR-0002 vs ODR-0014: retire 0014?

This is Baker's call. Both speak; Baker votes.

**Baker.** Yes, collapse — with an explicit provenance ledger. **The
DCMI hygiene rule: a vocabulary catalogue is a single record; amendments
are a change log inside that record, not a parallel record.** DCTERMS
does not have one record per term and another per amendment — it has a
single namespace with dated change notes. The two-record split was
correct at the time (provenance of *which Council session* moved each
row was load-bearing), but once session-002 ratifies the admission rule
schema and session-014 applies it, the records describe one decision
with two timestamps. Clean cut:

1. **0002 becomes the canonical catalogue** with `## Change log` inside
   `## Rules` carrying each amendment row (vocabulary, what 0002 said,
   session-NNN decision, rationale).
2. **0014 is `superseded`** by 0002 with `## Decision Outcome` pointing
   at the change log.
3. 0003's dependency graph reflects: one catalogue record; 0014 is a
   historical pointer.

The discipline reason, not just tidiness: **catalogue provenance must
be readable in one pass**. A modeller asking "is OWL-Time Core or
Conditional?" should not have to read two records and reconcile.

**Vote (Baker).** Retire 0014 after session-002/014. Plan §11 already
flags it as a pre-flight candidate; the answer is yes.

**Pandit (concurring).** No governance objection. The ODRL deferral
trigger (§4.1 — owned by 014) lives just as well inside 0002's change
log.

**Joint.** Retire 0014; fold rows into 0002's change log.

---

## Q5 — ODR-0009 vs ODR-0012: combine? (Is DPV-on-Claims one ODR's job or two?)

This is Pandit's call. Both speak; Pandit votes.

**Pandit.** Keep them separate. **DPV is not a Claims annotation — it
is a primary TBox concern** (my session-001 Q2 argument). Personal-data
governance answers a modelling question about every class and property,
not a pattern question scoped to evidence entities. Co-annotation on
`prov:Entity` evidence subclasses in 0009 is *one consumer* of the DPV
TBox; participant `dateOfBirth`/`email`/`address` in 0006 is another;
occupier names in 0008's encumbrances sub-area is a third; AML outcome
and `cautionOrConviction` are special-category-flagged. The governance
layer crosses every module. Folding into 0009 locks it inside Claims
and forces the other modules to re-cite without an owner.

Two reinforcements:

1. **Lawful-basis / consent / purpose class vocabulary** is my recorded
   dissent against the Phase-1 floor — substantively about governance
   (whether `dpv:hasLegalBasis`, `dpv-gdpr:Consent`, and the purpose
   taxonomy are TBox-expressible without instance data). Must live in
   0012; in 0009 it gets buried under PROV-O mechanics.
2. **The standing PII cost rule** (new PII field → Council review) is a
   governance-process rule, not a claims rule. Belongs in 0012's
   `## Consequences`.

The tightening: 0009's §"DPV co-annotation" should *cite* 0012's
authoring, not re-author. Editorial fix in session-009 / session-012 —
authoritative listing in 0012; 0009 keeps a one-paragraph pointer.

**Vote (Pandit).** Keep 0009 and 0012 separate. Move co-annotation
authority to 0012. Keep the `## Supersession scope:` hook (plan §5
Phase 4).

**Baker (concurring).** Right. One catalogue note: 0002 lists four DPV
prefixes (`dpv`, `dpv-gdpr`, `dpv-pd`, `dpv-legal`); when 0012 names a
Phase-2 ambition, the catalogue picks up the *profile slice* via
session-002 (post-retire).

**Joint.** Keep 0009 and 0012 separate; route co-annotation authoring
to 0012; DPV-profile depth tracked through 002.

---

## Q6 — ODR-0010 vs ODR-0013: combine Overlay Profiles + SHACL Severity?

**Baker.** No. Different layers, even though they share a
graph-separation concern. 0010 is *what an overlay is* (named SHACL
profile reified as `opda:ValidationContext`, with the JSON → profile →
form round-trip). 0013 is *what severity a constraint carries*
(identity-key breach = Violation; sensitivity-marker gap = Warning;
absent optional = Info) and *how the annotation graph holds advisory
items*. The Cagle/Knublauch/Gandon fight (`aiHint` exile) is a 0013
question; the Guarino reification fix is a 0010 question. Two records,
two deliberations, two DAs.
**Vote.** Keep separate.

**Pandit.** Agreed. The **DPV sensitivity gate** ([0012] §"SHACL
sensitivity gate") fires from 0013, not 0010 — Warning on a PII
property lacking `dpv:hasPersonalDataCategory` is a severity rule.
Folding would scatter the governance severity gate.
**Vote.** Keep separate.

**Joint.** Keep separate.

---

## Q7 — Missing ODRs?

We see four candidate gaps. Two are Baker-shaped, one is Pandit-shaped,
one neither owns. Both must speak.

### 7a. Address & Geography sub-module

**Baker.** Plan §4.1 routes "Address class location" to session-006
(Agents) with 008 inheriting. Fine routing, but the *shape of the
answer* is unsettled — Address could live in 0006, in 0008, or in a
shared Geography & Addressing sub-module. If the shared sub-module wins
in session-006, that *is* a new ODR (0006a or sibling number), not an
in-place amendment. Flag, don't commit.

**Pandit.** Concurring. Addresses are PII (UK-GDPR Art 4(1)); the DPV
tag follows wherever Address lives.

**Joint vote.** Defer to session-006; flag as possible spawn.

### 7b. Generator policy

**Baker.** Session-004's Q5 (generator-first policy — input format,
location, run discipline, version-control entry) is substantial enough
to be its own ODR (DCMI calls this "metadata application architecture").
The plan slots it under 0004 as one of seven questions. If session-004
finds it bites, spawn 0004a.

**Joint vote.** Inside 0004; spawn-if-bite.

### 7c. W3C VC / DID as a first-class ODR

This is Pandit's call. Both speak.

**Pandit.** The gap that worries me most. **`verifiedClaims` is W3C
VC-shaped at every level**: OIDC4IDA inherits from ToIP's *Trust
Framework* (in the glossary); each claim is a `cred:VerifiableCredential`
candidate; evidence is *attestation*; the verifier is an *Issuer* /
*Verifier* in VC's lexicon; a consent receipt is — by W3C draft — exactly
the shape `verifiedClaims` is groping toward. The framework is *cited*
in 0009 (References + Q8 "W3C VC interop") but nowhere *adopted*.

Two options:

1. **Fold into 0009** — `opda:Claim rdfs:subClassOf cred:VerifiableCredential`,
   `opda:Verifier` aligned to the VC role. Downside: VC + DID is a
   substantial family (Data Integrity, status lists, DID methods); a
   one-paragraph alignment will feel sufficient until the first wallet
   integration discovers it isn't.
2. **Spawn ODR-0015 (W3C VC / DID Compatibility Layer).** Anchor the
   alignment; name the VC profile slice the catalogue admits (VCDM 2.0;
   DID Core; `did:web` or `did:key` for property-data); declare which
   assurance primitives map natively and which need the eIDAS layer
   (counterpart to 0009's 80%/5% boundary); pin the *consent receipt*
   shape `opda:Consent` will take if Phase-2 admits it.

My position: **spawn**. Same logic as ODRL deferral — adopt the
vocabulary, defer the authoring — but the catalogue admission *is* the
first-class act. A Trust Framework that does not cite VC/DID first-class
produces an ontology wallet implementors cannot consume, defeating the
*Trust Framework* part of "Property Data Trust Framework."

Subsidiary: **consent receipts** are the natural target for the Phase-2
ambition I've been pushing on lawful-basis / consent class vocabulary.
If 0012 ratifies Phase-2, the receipt shape lands in 0015 or 0012;
either way the receipt is VC-shaped and the alignment must be cited.

**Vote (Pandit).** Spawn ODR-0015. Co-owned by Claims (0009) and
Governance (0012). Run after 009 (clarifies PROV-O/assurance boundary)
and before 012 (decides consent class vocabulary). Slot Phase 4.5.
Queen: Moreau; DA: a VC-WG voice (Sporny or Reed, extended).

**Baker (concurring with a catalogue note).** Ratify the spawn. 0002
lists no VC/DID prefix; admitting `cred:` (VCDM) and `did:` (DID Core)
is a session-002 amendment (post-retire). Adoption pattern is what 0002
already prescribes: canonical URI + local SHACL + no `owl:imports`.

**Joint vote.** Spawn ODR-0015. Phase 4.5. Catalogue-admit `cred:` and
`did:` in session-002.

---

## Q8 — What signals the cut is right?

**Baker.** Three signals. (i) No record cross-references another for
normative authority on the same decision (Q5 fix makes this green).
(ii) The catalogue lives in one place (Q4 retire makes this green).
(iii) A new vocabulary admission has exactly one route — session-002
produces the schema, session-014 (or its successor) applies it. No
other record mints vocabularies; currently green.

**Pandit.** Two signals. (i) PII never accretes silently — every new
personal-data-bearing property triggers 0012's standing-cost review;
the DPV tag follows the property across modules. (ii) The Trust
Framework citation is honoured (Q7c spawn makes this green).

**Joint.** The cut is right *after* (a) 0014 retires into 0002, (b)
co-annotation authoring moves to 0012, (c) 0015 spawns for VC/DID, (d)
§4.1 routing tightens so 008 does not re-litigate SKOS shape. None
require new Council sessions beyond those already planned.

---

## Recommended governance topology

After the four adjustments above:

```
                 ODR-0001 Methodology (accepted)
                          │
                          ▼
                 ODR-0003 Programme anchor
                          │
                          ▼
                 ODR-0002 Vocabulary catalogue  ◀── ODR-0014 (superseded; folded)
                  (one record; change log inside ## Rules)
                          │
                          ▼
                 ODR-0004 Foundation  (gate)
                          │
                          ▼
                 ODR-0005 Property identity crux  (gate)
                          │
                ┌─────────┼─────────┐
                ▼         ▼         ▼
            ODR-0011  ODR-0006   ODR-0008     (substrate / Agents / Property)
              SKOS    Agents     Property
                          │
                          ▼
                 ODR-0007 Transactions
                          │
                          ▼
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
         ODR-0009     ODR-0015     ODR-0012     (Claims / VC-DID / Governance)
         Claims      VC / DID      Governance
            └─────────────┼─────────────┘
                          ▼
                 ODR-0010 Overlay profiles
                          │
                          ▼
                 ODR-0013 SHACL & severity   (closing)
```

**Twelve records, one spawn.** Net change from the current plan: −1
(0014 folded) +1 (0015 spawned) = same count, different shape, with
the governance cluster (009/012/015) now genuinely three crisp records
rather than two records with overlapping authorship plus a missing
citation.

**What this topology buys.**

- *Baker's catalogue discipline* — one catalogue record, one admission
  route, change log inside. The DCMI hygiene rule holds.
- *Pandit's data-governance crispness* — DPV adoption discipline owned
  by 0012; co-annotation authoring lives there; W3C VC / DID is a
  first-class commitment via 0015; the Trust Framework name is honoured.
- *No record collapses two decisions.* 0010 and 0013 stay separate
  (overlay mechanism vs severity). 0008 and 0011 stay separate
  (descriptive properties vs SKOS scheme mechanism). 0009 and 0012
  stay separate (PROV-O backbone vs governance layer).
- *The crux gate (0005) and the Agents gate (0006) still hold.* No
  module ODR drafts in anger until 0005 clears; 007/008/009/012 wait
  on 0006 per the followup plan §5.

**Recorded split.** Baker leans toward retiring 0014 (fewer ODRs, cleaner
catalogue) and Pandit leans toward spawning 0015 (more ODRs, expanded
governance). Both moves are net-zero on count but net-positive on
catalogue discipline + Trust-Framework honour. The split is real but
non-contradictory: both shift mass *toward the right unit of decision*,
just from different directions.

---

## References

- ODR-0001 (methodology); ODR-0002, ODR-0009, ODR-0011, ODR-0012, ODR-0014
  (the governance cluster + catalogue).
- Council Session 001 — Q2 (DPV/ODRL deliberation; OWL-Time adopted;
  SSSOM deferred; DPV Phase-1 with Pandit's recorded dissent).
- Followup-sessions plan §4.1 (shared-question routing), §5 (sequencing
  and gates), §11 (pre-flight scope check candidates — 0008, 0014, 0010).
- DCMI: *Vocabularies as a Common Language* (Baker). DPV / DPV-PD /
  DPV-LEGAL specifications (Pandit). W3C VC Data Model 2.0; DID Core;
  W3C VC consent receipt draft.
