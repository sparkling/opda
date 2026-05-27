# Kendall (Queen): Position on Programme Scope-Check

## Methodological frame

I review the 13-ODR cut from FIBO programme architecture and *Ontology
Engineering* (Allemang/Hendler/Schneider — Ch. 5 reuse, Ch. 9
modularisation, Ch. 11 applications). Three anchors:

1. **FIBO modular taxonomy.** Modules carved by **business-domain
   concern**, not by document/form. Reasoning profiles
   (Production/Development) layered *over* the module set — never *as*
   modules. Each module has a namespace, a stable identity-bearing core,
   and reuse seams **by reference** (canonical IRI, no `owl:imports` into
   consumers).
2. ***Ontology Engineering* Ch. 9** small-and-coherent maxim: "It is
   better to have a small, well-modelled ontology than a large
   monolithic one whose entailments no maintainer can predict." Working
   test — can a new contributor author the module's `.ttl` skeleton from
   its `## Rules` alone, without consulting sibling internals? If no,
   the module is too big or its seams are wrong.
3. **EDM Council reuse rule.** Entities referenced by N>1 unrelated
   modules (`LegalEntity`, `Person`, `Place`, `Address`,
   `MonetaryAmount`) are declared **once** in a shared module and
   referenced. Re-declaring is the textbook anti-pattern.

Against those three, the 13-ODR cut is **mostly right** with two
corrections and one promotion. Positions follow.

---

## Q1 — Is the 13-ODR cut right? Granularity check

### Position

**APPROVE the count as the right order of magnitude; corrections needed
at three *boundaries*, not at the total.** 13 ODRs is *modest* for the
scope (1,556 base leaves, ~935 annotated, 15 overlays, three-graph
separation, PROV-O + DPV + SHACL + DASH). The risk is **under-cutting
specific entities** (Q7: Address), not over-cutting.

### Reasoning (FIBO / OE Ch. 9)

FIBO BE decomposes into ~30 modules (LegalEntities, Corporations,
Partnerships, FunctionalEntities, GovernmentEntities,
OwnershipAndControl, …), each 50–200 classes with a stable
identity-bearing core reusing FND. OPDA's surface (Property, Title,
Transaction, Agent, Claim, Profile, Enum, Governance, Validation +
PDTF-specific cross-cutting) sits in the same order-of-magnitude band.

OE Ch. 9 granularity test (above) reveals **three boundary problems**,
not a count problem: ODR-0008 too big (Q2), ODR-0014 has no independent
existence (Q4), Address undeclared anywhere (Q7).

### Vote

**APPROVE current cut** (count) — with the Q2 / Q4 / Q7 corrections.

---

## Q2 — ODR-0008 sub-module split

### Position

**SPLIT** into four sub-ODRs. 935 leaves is past the OE Ch. 9
single-engineer line, and the four families have **different attachment
classes and different evidence shapes** — the load-bearing reason.

### Reasoning (FIBO / OE Ch. 9)

FIBO FND splits Quantities, Utilities, Specifications, Plans because the
*kind of evidence* differs (measured vs asserted vs committed-to). The
same distinction bites here:

| Sub-module | Evidence shape | Attaches to |
|---|---|---|
| Built form & condition (`buildInformation`, surveys, rooms, areas) | RICS survey; intrinsic | `opda:Property` |
| Energy & utilities (EPC, heating, water, meters) | EPC Register; utility-provider | `opda:Property` |
| Searches & environmental (CON29R, LLC1, floodRisk, radon) | claims-shaped (regulator return) | `opda:Property` (consumes ODR-0009) |
| Encumbrances & completion (council tax, ground rent, insurance, occupiers) | contractual/regulatory state | **`opda:LegalEstate`** |

The fourth row is decisive: encumbrances attach to the **legal estate**,
not the **physical property**. ODR-0005's multi-class split is erased
if all four families share one module. Splitting forces each
sub-module to commit to its attachment class — exactly the FIBO
"identity-bearing things stay in their own module" rule.

Proposal: **ODR-0008a** (Built form & condition), **0008b** (Energy &
utilities), **0008c** (Searches & environmental — claims-shaped),
**0008d** (Encumbrances — attaches to LegalEstate). Land *after*
ODR-0005's IC gate clears, *before* ODR-0011's substrate session.

### Vote

**SPLIT** — four sub-ODRs.

---

## Q3 — ODR-0008 vs ODR-0011 combine (SKOS sub-section)?

### Position

**APPROVE current cut — keep separate.** ODR-0011 is cross-cutting: it
serves 0006 (role enums), 0007 (`participantStatus`, `legalForms`),
0008 (built-form, EPC, council-tax band), 0009 (evidence-type,
assurance-level), 0012 (DPV PII categories, purpose). Folding into 0008
orphans four other consumers.

### Reasoning (FIBO / OE Ch. 5)

FIBO precedent: `FND/Utilities/AnnotationVocabulary`, `FND/Quantities/Units`,
ISO 4217 currencies, ISO 17442 LEI, ISO 3166 country codes — all
cross-cutting concept schemes in their own modules, **referenced** by
every consumer. The OE Ch. 5 reuse rule: a concept referenced by N>1
unrelated modules belongs in its own module. `role`, `councilTaxBand`,
`evidenceType`, `assuranceLevel` all fail to belong in 0008 — each is
referenced by ≥2 other modules.

The plan's §4.1 shared-question routing encodes this correctly: SKOS
scheme criteria are *substrate* for sessions 006, 007, 008, 009, 012.
Folding into 0008 would invert the substrate relationship.

### Vote

**APPROVE current cut** — keep separate.

---

## Q4 — ODR-0002 vs ODR-0014: fold 0014 back into 0002?

### Position

**RETIRE ODR-0014.** It exists only because Session 001 produced
amendments to a then-accepted ODR-0002 out of band. The plan now runs
S002 *before* S014 (§5 Phase 0); S002 can absorb the Session 001 row
changes directly. The amendment-ODR pattern is **not a FIBO convention**.

### Reasoning (FIBO / OE Ch. 5)

FIBO's vocabulary catalogue does not have a parallel "amendments to
FIBO" ontology. When FIBO 2020Q4 added `lcc:`, the change landed in the
FND module header with `dct:modified` and a release-note pointing at
the WG decision. The deliberation lives in the transcript; the catalogue
carries current state with provenance per row.

For OPDA: ODR-0002's catalogue tables (Core / Conditional / Defer)
carry per-row `dct:source` to the Council session that authored or
amended the row. Session 001 Q2 amendments (OWL-Time Conditional, SSSOM
deferred, ODRL deferred-policy, DPV Phase-1, OBO RO open, FOAF ruled out)
land directly in ODR-0002 with session-001 attribution. No separate ODR.

Three reasons author-only on 0014 is still inadequate:

1. **Audit-trail fragmentation.** Plan §1.4 admits "must read across two
   records until a future consolidation" — the consolidation should
   happen now.
2. **Row-by-row partial supersession buys nothing** over an
   edit-with-provenance. The DCAP `supersedes` edge should be reserved
   for *decision* replacement, not row restatement.
3. **S002 does the work anyway** — adding the Session 001 row changes
   to its agenda costs one question. Saves the entire S014 run (~6 agent
   runs per plan §10).

OBO RO objection: it's a question, not a decision. ODR-0002's Defer
table carries an entry "OBO RO — open; route to ODR-0005 (part-of)." No
ODR-0014 needed.

### Vote

**RETIRE ODR-0014.** Fold into ODR-0002 via S002. Per plan §9
"trim only if proven" — this is the trim.

---

## Q5 — ODR-0009 vs ODR-0012: Claims + Governance one ODR?

### Position

**APPROVE current cut — keep separate.** PROV-O and DPV answer
**different questions** about the same nodes. Co-annotation ≠
co-definition.

### Reasoning (FIBO / OE Ch. 11)

The clean test — what question does each ODR answer?

- **0009**: what is the derivation chain producing this verified claim?
  (PROV-O; evidence subtypes; `prov:qualifiedAttribution`; assurance as
  SKOS annotation.)
- **0012**: under what lawful regime, what PII category, what processing
  purpose, may this claim and its evidence be processed? (DPV class
  vocabulary; lawful-basis dissent; ODRL deferral; sensitivity gate.)

A claim with no DPV annotation is *under-governed*. A claim with no
PROV-O chain is *unverified*. Different defects, different audits,
different owning experts (Moreau queens 009; Pandit queens 012),
different downstream consumers (W3C VC ecosystem vs ICO/regulators).
Folding produces a 600-line ODR with two heads.

FIBO precedent: `Loans` and `RegulatoryAgencies` share the same `loan
instance` node via co-annotation — `Loans` says "30-year fixed mortgage
with these terms"; `RegulatoryAgencies` says "subject to TILA/RESPA in
jurisdiction X." Each independently authored, reviewed, versioned. OE
Ch. 11: "Vocabulary co-annotation is the **opposite** of vocabulary
merger."

The DPV co-annotation seam *is* a real risk — plan §4.1 routes it
carefully (S009 drafts the pattern; S012 may amend via
`## Supersession scope:`). That's the right machinery. Merging the ODRs
would destroy it.

### Vote

**APPROVE current cut** — keep separate.

---

## Q6 — ODR-0010 vs ODR-0013: both SHACL-shaped. One ODR?

### Position

**APPROVE current cut — keep separate.** Both SHACL-shaped on the
surface but answer different load-bearing questions: 0010 is
**mechanism**, 0013 is **policy**.

### Reasoning (FIBO Production-vs-Development; OE Ch. 9)

FIBO's Production vs Development reasoning profiles are the analogue —
separate artefacts with separate review and versioning despite both
being views over the same OWL axiom set. *Mechanism* of producing a
profile is one decision; *policy* of assigning each axiom is another.

- **0010** = mechanism: overlay → profile graph; composition is
  build-step graph-union; `opda:ValidationContext` reifies conditionality;
  round-trip property (JSON → profile → form + validated transaction).
- **0013** = policy: severity tracks regulatory weight; the rarest
  most-damaging error must be loudest; class ⊥ shapes ⊥ annotation
  graph separation; open/closed-world drift check; `opda:aiHint` exile.

Two further structural reasons:

1. **The no-identity-override gate lives in 0010** (where overlay
   composition rules are). The sensitivity gate lives in 0013 (where
   severity is assigned). Same vocabulary (SHACL), different decisions
   from different ODRs.
2. **Cagle's `aiHint` exile (7-2 in Session 001 Q5) is a 0013
   decision** — graph-separation, not profile-composition. Folding would
   re-litigate or quietly inherit the 7-2.

Cross-reference overhead between 0010 and 0013 is real (~30% References
overlap) but that's overhead **of cross-references between two records**,
not overhead **inside one record**. FIBO Loans heavily cross-references
RegulatoryAgencies; nobody merges them on those grounds.

### Vote

**APPROVE current cut** — keep separate.

---

## Q7 — Missing ODRs

### Position

**Three flags. One mandatory new ODR; two follow-up flags.**

1. **Address & Geography — MANDATORY new ODR (spawn ODR-0015).**
   Address is referenced by 0005, 0006, 0008 and declared by none.
2. **Generator policy — FLAG for follow-up, not blocking.**
3. **W3C VC / DID integration — FLAG for follow-up after S012.**

### Reasoning (FIBO Places / OE Ch. 5)

**Address.** FIBO Places is the controlling precedent. FIBO does **not**
declare Address inside `Agents-People` or `LegalEntities` — it declares
Place/Address/Region in `FND/Places` and references them from every
consumer. EDM Council reuse rule: an entity referenced by N>1 unrelated
modules belongs in its own module with stable identity. Address fails
that test (3 references, 0 declarations).

Plan §4.1 punts Address to S006 Q5 ("in 006, in 008, or shared sub-module?").
That's the wrong forum: S006's Queen (Guizzardi) is optimising for UFO
Kind/Role/Phase clarity, not for Address's relationship to INSPIRE / ISO
19160 / OS AddressBase. Address needs its own session and ODR — its own
input documents (geo-vocab standards), its own identity-criterion work,
its own INSPIRE Identifier modelling as a contingent identifier under
`prov:wasDerivedFrom` (same pattern as UPRN in 0005).

Proposal: **ODR-0015 — Address & Geography (Reuse).** Spawn S015
between S005 and S006, *before* S006 makes participant-address
commitments. Cost: one extra session. Alternative: three modules
independently invent overlapping Address classes; Phase-2 reconciliation
costs more than spawning now.

**Generator policy.** Currently Rule 6 of ODR-0004 (Foundation). The
generator is one paragraph there; the downstream work is mechanical
(slot→DatatypeProperty). Acceptable on small-and-coherent grounds. If
implementation surfaces non-trivial decisions (input format,
regeneration on schema delta, generated-TTL versioning), spawn a
follow-up ODR. **Non-blocking.**

**W3C VC / DID.** The verifiedClaims envelope is the seam between PDTF
and the W3C VC / DID ecosystem the business glossary names (Claim,
Issuer, Holder, Verifier). FIBO's interop pattern (e.g.
`Cross-Border-Settlement`) carves this as its own "Trust-Framework
Interop" ODR. ODR-0009's S009 Q8 ("`opda:Claim` as
`cred:VerifiableCredential`-compatible") will reveal whether genuine
VC-side decisions exist. **Non-blocking for Phase 1; spawn after S012
if Q8 forces it.**

### Vote

- **Address & Geography**: **SPAWN ODR-0015**. Mandatory.
- **Generator policy**: **FLAG**; keep inside 0004 for now.
- **W3C VC / DID**: **FLAG**; spawn after S012 if S009 Q8 reveals
  decisions.

---

## Q8 — What signals the cut is right? When does scope terminate?

### Position

Three FIBO/EDM tests. The scope question terminates when all three
hold for every ODR.

### Reasoning (FIBO / OE Ch. 9, 11)

**Test 1 — One home, one identity.** Every load-bearing entity
(Property, LegalEstate, Person, Organisation, Transaction, Address,
Claim, Profile) has exactly one declaring ODR with a stable identity
criterion. Today **fails** for Address (Q7); edge-case on 0008 (Q2). Fix
via Q7 + Q2.

**Test 2 — Reference, not import.** Every cross-module relationship is
canonical URI reference, not `owl:imports`. Class/shapes/annotation
graphs are separate. Today **passes** (0004 R3; 0010 explicit
no-`owl:imports`).

**Test 3 — MVP exercises every module.** Today the BASPI5 MVP exercises
0005 / 0006 / 0009 / 0010 / 0011 / 0013. It does **not** currently
exercise 0007 (lifecycle intervals), 0008 (descriptive cover), 0012
(DPV sensitivity gate). Two responses:

- **Tighten the MVP success criterion**: every module produces ≥1
  instance the round-trip consumes; DPV sensitivity gate fires ≥1
  warning on a BASPI5 PII leaf.
- **OR name 0007/0008/0012 as "post-MVP" modules** with their own
  Phase-2 round-trip gate (plan §5.1 fast-path implicitly accepts this).

Either is acceptable. The discipline is that the choice is **named
explicitly**, not left unsaid.

### Vote

**APPROVE the cut once all three tests pass.** Today: Test 1 fails on
Address; Test 2 passes; Test 3 partially fails. Fix Test 1 via Q7. Fix
Test 3 by tightening MVP or naming the post-MVP gate. When both are
answered, scope terminates. No further re-cuts without a triggering
deliverable failure.

---

## Synthesis priority

**Most load-bearing: Q7 (Address & Geography).** Current cut violates
FIBO/EDM "declare reused entities once" for Address (referenced by 005,
006, 008; declared nowhere). Plan §4.1's routing to S006 Q5 is itself a
symptom — S006 is the wrong forum. If we don't spawn ODR-0015, three
modules will independently invent overlapping Address classes;
Phase-2 reconciliation will cost more than spawning now. **This is the
question whose answer changes the programme shape most.**

**Second: Q4 (retire ODR-0014).** Cheap action, high signal. Saves ~6
agent runs. Removes "must hold two records" cognitive load (plan §1.4
admits). Amendment-ODR is not FIBO convention.

**The rest cluster:** Q2 (split 0008) — concrete refactor, not
re-architecture. Q1, Q3, Q5, Q6 — all defensible as cut; FIBO precedent
on each is clear. Q8 — the *discipline* of naming the tests matters
more than the answer.

### Closing position

I will defend in synthesis:

1. **Spawn ODR-0015 (Address & Geography).** Mandatory.
2. **Retire ODR-0014.** Fold into S002.
3. **Split ODR-0008 four ways.** After 0005's IC gate.
4. **Tighten the MVP criterion** OR **name the post-MVP gate**.

The 13-ODR count goes to 16 (15 + 0008a/b/c/d − 0014). The programme
shape genuinely changes — it does not merely renumber.

I will withdraw on Q7 if the panel shows Address has *one* coherent home
inside the current cut. I do not believe it can. The panel that engages
me on the rest should bring the strongest case against ODR-0015 — that
is the most expensive of my four positions and the one whose reversal
would most simplify the programme.
