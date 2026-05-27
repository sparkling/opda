# Davis (DA): Devil's Advocate position on Programme Scope-Check

*Ian Davis — BBC / UK Government linked-data lead; ex-Talis; co-author of
the BBC `/things/` URI pattern; former chair of the UK Gov Linked Data
WG. I write from deployment, not from drafts.*

## Methodological frame

Three things have to be true before a linked-data programme has earned
its complexity:

1. **A consumer can dereference one URI and get something useful.** At
   the BBC the test was: a journalist types `bbc.co.uk/things/<X>` and
   a page renders. At `data.gov.uk`: a developer hits the SPARQL
   endpoint and joins one government dataset to another in under five
   minutes. Neither shop earned the right to publish a thirteen-record
   programme of decisions before *anything dereferenced*.

2. **Publish-first beats perfect-first.** Every BBC Programmes release
   shipped a TTL with known compromises visible in the URI; we
   documented what was wrong inline and iterated. Drafting a forensic
   record per concern *before* shipping inverts the discipline: you
   accrete decision debt without the only feedback that constrains
   it — a real consumer breaking.

3. **The unit of decision is the contract, not the record.** A
   consumer cares where the namespace resolves, what the shapes graph
   requires, what the round-trip looks like. They do not care that you
   wrote thirteen files. Records exist to justify the URI and the
   SHACL contract, not to subdivide thinking into administrable
   chunks.

The 13-ODR cut violates all three. Below: one section per question,
in the form the Council requires. I read titles, `## Decision`, and
skimmed `## Rules` — the budget a downstream consumer actually has.

---

## Q1. Is the 13-ODR cut right?

**Attack.** No. Roughly twice the records the work needs, and the
proliferation is a methodology smell. Session 001 actually decided
seven things — anchor, identity crux, vocabulary list, foundation,
overlays, enumerations, PROV-O backbone. The expansion to thirteen
comes from treating every paragraph of the anchor as a record
candidate. That is forensic archaeology, not engineering. At the BBC
we covered Brand → Broadcast → Version with one ontology, one
shapes graph, one URI policy. It scaled to iPlayer and every news
microsite without a thirteen-record corpus.

**Evidence (BBC / UK Gov / deployment).**

- BBC `/programmes/`: one canonical TTL, one DASH-rendered admin UI,
  one shapes graph. Decisions sat in `rdfs:comment` and commit
  messages.
- `data.gov.uk`: the linked-data cookbook was one document.
  Departments that wrote four records per dataset shipped slower and
  were reorganised. Departments that shipped TTL with a TODO list
  got iterated and survived.
- LOD community (DBpedia, GeoNames, MusicBrainz): none published a
  thirteen-record decision corpus before the first dereferenceable
  URI. They shipped, then refined.

**Counter-proposal.** Compress to five records, max seven:

1. **0002-extended** — catalogue *plus* amendments (fold 0014 in).
2. **0003** — anchor (sequencing only; retire at MVP).
3. **0004-extended** — Foundation + URI policy + Address + generator
   policy + the general SKOS pattern + identity-criterion gate.
4. **0006-extended** — Agents + Roles + Transactions (people-and-
   what-they-do is one consumer-facing concern).
5. **0008-extended** — Property attrs *and* their enumeration schemes
   (one register, not two cross-referenced records).
6. **(Optional) 0009-extended** — Claims + Evidence + Provenance +
   Governance co-annotation.
7. **(Optional) SHACL-contract** — overlays + severity + annotation-
   graph (merging 0010 and 0013).

Seven records, every one ratifying something a consumer can
dereference or validate against.

**Vote: DISSENT.** ODR-0001 explicitly warns: "Routine work MUST NOT
trigger a session; padding the agenda dilutes the methodology and
risks Council theatre." Thirteen sessions before one BASPI5 round-
trip is exactly that pattern.

---

## Q2. ODR-0008 sub-module split — built-form / energy / searches / encumbrances?

**Attack.** Splitting 0008 is the wrong direction. The 935-leaf
volume argument is real but answered by **generation, not
partition**. ODR-0004 already commits generator-first; 0008 already
says the mechanical mapping is generated. If it is generated, the
split is editorial — split the output files, not the record.
Splitting the record splits governance of a single declare-once-
reconcile-overlays decision into four threads. The right unit is the
**reconciliation rule**, not the family of things being reconciled.

**Evidence.**

- BBC `/programmes/` descriptive attributes (Genre, Format, Series
  membership, Schedule slot, iPlayer availability) — one record /
  one TTL. We split *files* by editorial concern; we did not split
  *decisions* about how reconciliation worked.
- UK Gov `organogram`: 60+ descriptive leaves spanning department /
  role / grade / salary band. Same record. Same reconciliation
  rule. Split governance would have killed cross-department
  joinability.

**Counter-proposal.** Keep 0008 single. Fold the SKOS enumeration
mechanism (0011) into it. Built form, EPC band, council-tax band are
descriptive attributes whose value sets are SKOS schemes — one
declaration.

**Vote: DISSENT** on the split.

---

## Q3. ODR-0008 vs ODR-0011 — combine descriptive attrs + enumerations?

**Attack.** Yes, combine. A consumer does not see two things; they
see `opda:builtForm` as a datatype property whose range is a SKOS
scheme `opda:BuiltFormScheme` whose members are
`opda:Detached`/`opda:Semi-detached`/.... One declaration. Splitting
across two records means a maintainer chases two files to understand
one property.

The plan (§4.1) acknowledges the problem by routing six shared
questions between session 011 and sessions 006/007/008/009/012. Six
shared questions between two records is a smell. The plan even
proposes a "two-pass" session 011 to deliberate the SKOS shape early
and then re-litigate per-scheme later. Re-litigation is not a
feature; it is rework caused by a bad cut.

**Evidence.**

- BBC: `bbc:Genre`, `bbc:Format`, `po:Brand` — SKOS schemes
  declared *in the same TTL* as the properties whose ranges they
  were. One file. One pull request. One review.
- UK Gov `data.gov.uk` reference data: lookup vocabularies
  (PostType, OrganisationFunction) sat alongside the schemas that
  consumed them. Splitting them off was tried at one department
  and produced a drifting vocabulary and maintenance overhead.
- SKOS is a *mechanism*. We do not have a separate ODR for "how we
  use `rdfs:label`". Mechanism choices embed in the consuming
  record.

**Counter-proposal.** Retire 0011 as standalone. Fold per-scheme
content into 0008 (and cross-pointers from 0006-ext, 0009-ext). The
general SKOS pattern becomes a one-paragraph section in 0004
(Foundation).

**Vote: DISSENT** on keeping 0011 separate. Withdraw if Q1 carries
(5-7 record cut absorbs this).

---

## Q4. ODR-0002 vs ODR-0014 — retire 0014 by folding into 0002?

**Attack.** Yes, obviously. 0014 is a partial-supersession amendment
to 0002 written *before 0002 has been ratified*. Both are
`proposed`. We are amending a draft. That is double-bookkeeping,
not governance.

Amendment-ODRs are right when the amended record has been live for
two years and the change needs an audit trail. They are wrong when
both records are simultaneous drafts of the same deliberation. The
"preserves Council provenance" argument is worthless in this
corpus — Session 001's transcript already preserves the provenance.
The amendment record is provenance about provenance.

The plan sequences 002 → 014 sequentially in Phase 0. That is the
case where the two should be one record.

**Evidence.**

- BBC: when we amended the Programmes Ontology vocabulary, we
  amended the canonical TTL and noted the change in the commit
  message. We did not write a "supersedes" record before the
  original had shipped.
- UK Gov linked-data cookbook: single canonical version, revisions
  edited in place with a changelog appendix.
- W3C's own discipline: a CR has Errata; a WD does not. 0002 is
  `proposed` — a WD equivalent. Edit it in place.

**Counter-proposal.** Fold 0014 into 0002 before ratification. Mark
the changed rows with "carried by Session 001 Q2" and a tally in
`rdfs:comment`. Retire 0014. If amendment-discipline is wanted as a
future practice, document the *pattern* in ODR-0001 — do not reify a
particular instance of it in this round.

**Vote: DISSENT.** Strong.

---

## Q5. ODR-0009 vs ODR-0012 — combine Claims + Data Governance?

**Attack.** The plan acknowledges (§4.1, §6, Phase 4 description)
that 009 and 012 are entangled enough that 012 *amends a slice of
009's `## Rules`* via a `## Supersession scope:` mechanism in the
same drafting cycle. The mechanism exists because the cut is wrong:
a single record would not need to supersede itself.

PROV-O claim and DPV co-annotation are one decision. Every evidence
entity carries (a) its PROV-O type and (b) its DPV PII tag. The
shapes co-validate the two annotations. Splitting governance from
claims forces a forward-reference (009 → 012 → 009) that the §6
supersession-scope mechanism then has to resolve.

Same pattern as Q3: two records, one decision, an elaborate cross-
reference machine to keep them coherent.

**Evidence.**

- BBC PII handling: rights/consent annotations on `bbc:Programme`
  and `bbc:Person` sat inside the same TTL as the entity
  declarations. Privacy team reviewed the TTL once.
- UK Gov consent / GDPR: when DPA 2018 / UK-GDPR landed, guidance
  was embedded in the dataset's documentation, not maintained as
  parallel governance. Departments that tried the parallel-record
  approach shipped neither correctly because the two records were
  always one quarter out of date.
- Pandit's standing-cost rule ("any new PII field is a Council
  event") is a workflow discipline, not a record-structure one. It
  fits as a paragraph in 0009-extended.

**Counter-proposal.** One record: "Claims, Evidence, Provenance,
Governance" — Phase-1 DPV annotation co-located with the PROV-O
backbone, lawful-basis class-vocabulary question recorded as a
*live dissent inside the same record*. Pandit's session-2 ruling
lands as an in-place amendment.

**Vote: DISSENT.** Withdraw if the plan documents the §6
cross-record amendment as a *transitional bridge* and commits to
consolidation after MVP.

---

## Q6. ODR-0010 vs ODR-0013 — combine Overlay Profiles + SHACL Validation?

**Attack.** 0010 is "SHACL profiles for overlays". 0013 is "SHACL
shapes with severity". These are *the same shapes graph*. The
split is editorial: one record covers build-step graph union, the
other covers severity. A consumer sees one shapes graph, one
severity scheme, one DASH layer, generated from one dictionary.

Both records reference `dash:` identically. Both reference
`dct:source` identically. Both reference the no-identity-override
gate from 0005. Session 001 settled both in Q5 — one question with
two facets, not two questions. The plan places 013 as the closing
session consuming every prior ratified shape inventory. That is a
clue: the record is a synthesis, not an independent decision.

**Evidence.**

- BBC PIPS validation: one shapes graph, one severity policy
  (`sh:Violation` for identity loss, `sh:Warning` for missing
  optional metadata, `sh:Info` for editorial hints). Severity was
  a section of the shapes spec, not a parallel document.
- TopBraid practice (Knublauch's shop): profile shapes and base
  shapes are the same vocabulary; severity is per-shape, not per-
  graph. Knublauch documents this as one concern.
- The `aiHint` exile to a separate annotation graph (Q5 outcome)
  is the *only* genuinely separate-graph decision. One paragraph;
  not a record.

**Counter-proposal.** Merge 0010 and 0013 into a single
"SHACL contract" record: shapes generation, overlay profile
mechanism, severity, DASH rendering, annotation-graph exile. The
MVP BASPI5 round-trip is the single gate.

**Vote: DISSENT.** Withdraw if the plan commits to merging post-MVP
and treats them as a single editorial bundle during authoring.

---

## Q7. Missing ODRs — Address & Geography? Generator policy split? W3C VC / DID?

**Attack.** The interesting answer to "is the cut right" is not
"add more ODRs" but "are the cuts you made the *right* cuts". Three
places the plan defers a decision a consumer hits immediately:

1. **Address & Geography.** §4.1 routes "Address class location" as
   a shared question between 006 and 008. `opda:Address` is touched
   by 0005, 0006, 0007, 0008, 0009, 0012. Six records touch it;
   none owns it. A consumer dereferencing `opda:Address` from the
   BASPI5 round-trip will hit a declaration in one of six places.
   This is a missing foundational decision, not a missing ODR. Put
   the `Address` class declaration in 0004 (Foundation, extended).

2. **Generator policy.** 0004 commits generator-first; the rules-
   of-the-game are open questions deferred to session-004. The
   artefact that produces 80% of the deliverable does not have a
   dedicated decision while "vocabulary catalogue amendments" does.
   Either give the generator a record, or commit to code-with-
   tests inside 0004.

3. **W3C VC / DID.** PDTF is a *Trust* Framework; the glossary
   names Claim/Issuer/Holder/Verifier/Trust Framework as W3C VCDM
   2.0 terms; 0009 declares `opda:Claim rdfs:subClassOf
   prov:Entity` but does *not* declare it
   `cred:VerifiableCredential`-compatible. The VC/DID interop
   question is more load-bearing than ten of the proposed records.
   If the OPDA Trust Framework cannot interop with W3C VC wallets,
   gov.uk OneLogin, or EU eIDAS 2.0, the linked-data work has
   missed its largest external consumer.

**Evidence.**

- BBC: minted `bbc:Person` and `bbc:Place` once, in the core, and
  every downstream record consumed them. We did not defer to
  whichever module first needed Person.
- UK Gov: `org:Organisation` was a single declaration in the W3C
  Org ontology adopted at the foundational layer.
- W3C VC interop: EU eIDAS 2.0 wallet, gov.uk OneLogin, W3C VCDM
  2.0 are the consumers of any PDTF Trust Framework. Missing the
  interop record is missing the use case.

**Counter-proposal.**

- Address → 0004-extended.
- Generator → its own record *or* code-with-tests in 0004.
- **Add a VC/DID Interop record** — more important than at least
  three currently proposed.

**Vote: WITHDRAW-CONDITIONAL.** I do not oppose adding records
*where they shift the contract*. I oppose adding records that
elaborate one already written. Address-in-Foundation and VC/DID-
Interop shift the contract; the existing 13 mostly do not.

---

## Q8. What signals the cut is right?

**Attack.** The cut signals nothing about correctness *until a
consumer dereferences a URI and the contract holds*. The 13-ODR
programme proposes thirteen-session deliberation before the first
consumer touches anything. That is the inversion.

Operational signals the cut is right:

1. **The BASPI5 round-trip works.** ODR-0003's MVP. Load the
   profile; validate a transaction; render the BASPI form; pass
   the exemplars. If that round-trips with the minimal cut (5
   records), the cut is right. Every record past the round-trip is
   justification debt.

2. **A second consumer joins data without asking us.** The
   `data.gov.uk` test: a developer wires PDTF to Land Registry RDF
   or Ordnance Survey linked-data without needing a Council
   session. If they can, the SHACL contract is doing its job.

3. **The diff to ODR-0003 stops moving.** After two sessions, if
   0003 stops getting commits, the substrate is stable. If it
   keeps getting commits, the records are noise.

4. **A new PII field forces a five-minute decision, not a five-
   session debate.** With 13 records, a new PII field touches
   0006, 0009, 0011, 0012, 0013 — five records. With the minimal
   cut, one record absorbs it.

5. **Council sessions stop spawning Council sessions.** If session
   005 spawns 005a/005b (§6 spawn rule), if session 009 forces 012
   to supersede a slice, if session 011 needs a two-pass split,
   the cut is producing rework. A well-cut programme produces
   downstream implementation, not downstream recordkeeping.

**Evidence.** Every BBC and UK-Gov programme I worked on shared one
pattern: the documentation count *shrank* as deployment matured,
because the canonical TTL became self-documenting through
`rdfs:comment` and the SHACL contract became self-validating. The
healthy programme has one foundational record and an ever-shrinking
set of amendments. The unhealthy programme has a growing record
corpus and a SPARQL endpoint nobody can query.

**Counter-proposal.** **Replace the 13-session default with the
MVP-fast-path (§5.1) as the *only* path.** Remaining sessions run
on-demand, if and only if the MVP exposes a question the substrate
cannot answer. On-demand is the UK-Gov deployment discipline;
scheduled is the consultancy-engagement discipline.

**Vote: DISSENT** on the default sequence.

---

## Withdrawal conditions

| Question | Objection | Withdrawal condition |
|---|---|---|
| Q1 | 13-ODR cut is wrong | (a) compress to ≤7 records; *or* (b) commit to a post-MVP consolidation that retires ≥6 stubs by absorbing them into Foundation / Property / Agents / Claims / SHACL-contract once BASPI5 round-trips. The cut can stay at 13 *only if* it is a working set with a documented retirement schedule. |
| Q2 | 0008 sub-module split | The split is editorial (file structure inside one record), not governance. One record continues to own the spanning-leaf reconciliation rule. |
| Q3 | 0011 should fold into 0008 | General SKOS *mechanism* moves into ODR-0004; per-scheme content moves into the consuming module record (0008, 0006-ext, 0009-ext). No standalone 0011 ratification. |
| Q4 | 0014 should fold into 0002 | Merge them. If post-ratification amendment is a future concern, document the *pattern* in ODR-0001, do not reify it in this round. |
| Q5 | 0012 should fold into 0009 | One record covers PROV-O + DPV co-annotation + live Pandit dissent. §6 supersession-scope is documented as a *transitional bridge*, not a permanent governance pattern. |
| Q6 | 0010 should fold into 0013 | One record covers overlay profiles + severity + annotation-graph exile. MVP BASPI5 round-trip is the single gate. |
| Q7 | Missing Address / Generator / VC-DID | (a) Address moves to 0004-extended; (b) Generator-policy is either its own record *or* code-with-tests in 0004; (c) **a VC/DID-interop record is added before the cut closes**, ratifying `opda:Claim` ↔ `cred:VerifiableCredential` and the OPDA Trust Framework's posture toward W3C VCDM 2.0 / DID Core / EU eIDAS 2.0 wallets. |
| Q8 | Default sequence is wrong | §5.1 MVP-fast-path becomes the default; full sequence is contingency. Signal-of-correctness shifts from "all 13 ODRs ratified" to "BASPI5 round-trip ships with a substrate that supports it". |

**Net effect if all conditions hold.** The corpus becomes: **0001
(accepted), 0002 (absorbing 0014), 0003 (retires at MVP),
0004-extended (Foundation + Address + Generator), 0005 (Property
identity), 0006-extended (Agents + Roles + Transactions),
0008-extended (Property attrs + enumeration mechanism),
0009-extended (Claims + Evidence + Provenance + Governance),
0010-13-merged (SHACL contract + overlays + severity), and a new
00NN (VC/DID interop)**. Ten records, of which four are already in
flight. Six to author, not thirteen. Every record ratifies
something a downstream consumer dereferences or validates against.

ODR-0001 is right that the Devil's Advocate is the immune system
against rubber-stamping. This is what the immune system says:
thirteen records is the shape of a programme that has forgotten
what it is for. *The ontology and the SHACL contract are what
consumers see. Records exist to justify them, not to constitute
them.*

— **Davis (DA)**
