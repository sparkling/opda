# Allemang + Hendler: Position on Programme Scope-Check

## Framing

Scope-check: not whether to *do* the PDTF→ontology programme (Session 001
settled that), but whether **ODR-0002 through ODR-0014 are the right
unit of decision**. Each ODR pulls a Council session; bad cuts mean
either re-litigating one decision in two rooms or jamming two decisions
into one.

Two tests. Allemang (*Working Ontologist*, 3rd ed. with Kendall): merge
where re-use across consumers is high and the user-mental-model is the
same; split where consumers genuinely think about the things separately.
Hendler (W3C/RPI, Berners-Lee/Hendler/Lassila 2001 + W3C TAG findings):
an ODR is the unit of governance behind a URI graph — if two decisions
produce one URI graph, one ODR; if two graphs, two ODRs. Where these
disagree we record both.

Reading focus per brief: ODR-0004 through ODR-0008, plus skim of
0010–0013 and the anchor 0003.

---

## Q1 — Is the 13-ODR cut right?

**Allemang:** Right *number*, mostly right *cuts*. Thirteen sits in the
band a working ontologist would expect: foundation, identity gate, three
domain modules, four cross-cutting mechanisms, validation, plus
catalogue + amendment. *Working Ontologist* ch. 12 (enterprise rollout):
partition by the questions you can answer in one sitting, not by the
artefacts on the shelf. Eleven of these satisfy that test cleanly; my
doubts are 0008's size (Q2), the 0009/0012 boundary (Q5), and whether
0002/0014 are really one record with a revision log (Q4). Net: keep 13.

**Hendler:** Stronger version. Each ODR corresponds to a distinct
URI-graph commitment: 0004 mints namespace + graph-separation policy;
0005 the Property/Title class graph; 0006 the Agent/Role graph; 0007 the
Transaction relator graph; 0008 the descriptive-attribute graph; 0009
the PROV-O claims graph; 0010 the SHACL profile graphs; 0011 the SKOS
scheme graphs; 0012 the governance annotation graph; 0013 the validation
report graph. Each dereferenceable on its own terms — that is the test
(W3C TAG URI-persistence findings; Berners-Lee/Hendler/Lassila 2001).
Where two graphs collapse to one — see Q5 (0009/0012), Q6 (0010/0013) —
the cut is wrong; otherwise stands.

**Joint vote:** AGREE the 13-ODR cut is approximately right; both flag
specific merges below.

---

## Q2 — Should 0008 split into sub-modules (built-form / energy / encumbrances)?

**Allemang:** No. 0008's volume (≈935 annotated leaves across built-form,
condition, valuation, energy, utilities, searches, encumbrances,
completion) is *drafting*-volume, not *decision*-volume. The
deliberation in 0008 — does declare-once-reconcile-overlays work, what
is the spanning-leaf threshold, where falls the datatype-vs-SKOS line —
is the *same* across all eight families. The leaves differ; the
modelling pattern doesn't. *Working Ontologist*: one decision unit, many
concept instances. Split at the TTL artefact level
(`property-built-form.ttl`, `property-energy.ttl`,
`property-encumbrances.ttl`), not the ODR level. The follow-up plan's
§4 session-008 Q2 asks exactly this; the right session answer is "no
ODR split, but yes TTL split."

**Hendler:** Same outcome, URI-graph reasoning. Built-form, energy,
encumbrances all attach to the *same* Property/Title URI graph — they
are predicates on those subjects, not separate subjects. One graph, one
ODR. The only family I'd watch is *searches* (CON29R, LLC1) — those
*are* arguably activity-like entities (searches happen at a time, by
an agent, against an authority register, with a return) and may want
PROV-O treatment via 0009 rather than flat-attribute treatment. That's
an "is it a claim?" question, not a "split 0008" question.
*Spinning the Semantic Web*: every new URI subject is a governance cost
paid forever; mint only when predicates can't live on existing subjects.

**Joint vote:** AGAINST splitting 0008. **Agree** the volume is real but
the modelling decisions are uniform across families. Use TTL-level
modularisation, not ODR-level.

---

## Q3 — Should 0008 and 0011 combine (descriptive attrs + enumerations)?

**Allemang:** No. Different modelling mechanisms, different consumers.
0011 is the *register* (SKOS schemes for the 160 enum leaves with
prefLabel/notation/definition); 0008 is the *attachment* (datatype
properties on Property/Title sourced from the data dictionary). The
handoff is clean: 0008 cites 0011 via `sh:in` or SKOS-typed values.
Splitting them lets 0011 serve Agents (0006), Transactions (0007),
Claims (0009) and Governance (0012) equally — not just Property attrs.
Combine them and you couple every consumer of the SKOS register to
0008's drafting cycle. Bad bargain.

**Hendler:** Same outcome, sharper. The SKOS scheme URIs
(`opda:builtForm/Detached`) are a *separate URI graph* from the
descriptive-property URIs (`opda:builtForm` the predicate). Different
governance: schemes accept new members without the ontology version
bumping; predicates don't. Different dereferencing: fetch
`opda:builtForm/Detached` → SKOS concept (prefLabel, definition,
broader); fetch `opda:builtForm` → property (domain, range, comment).
One ODR can't honestly own two graph commitments with different
governance cycles. Keep apart.

**Joint vote:** AGAINST combining. **Strong agree.**

---

## Q4 — Should 0014 be retired in favour of 0002?

**Allemang:** Closest call in the programme. 0014 records six tiering
changes to 0002; the partial-supersession mechanism (row-level
"Superseded in part by 0014" notes) is honest but expensive — readers
must hold two records to see current tiering. *Working Ontologist*
discipline: minimum records to do the job. After 0014 lands, ask
whether 0002+0014 should be re-issued as a consolidated 0002b retiring
both. That's a single-record consolidation, not a silent edit. **Don't
retire 0014 in the current round**, but *do* retire it in a future
consolidation.

**Hendler:** Keep 0014, permanently. Catalogue tiering decisions are
*governance acts* with named voters and recorded dissent. 0002 is the
survey baseline; 0014 is the first amendment. Two distinct governance
acts. Collapse them and you lose "when did OWL-Time get promoted from
Conditional-deferred to Conditional-active, and on whose dissent?" —
the kind of question a regulator asks in three years. Pattern: W3C
Recommendation chain (REC + ERRATA + REC-revision) — errata are
published alongside, not folded in.

**Where we disagree:** Allemang would retire 0014 in a future
consolidation; Hendler would keep both permanently. The deeper split:
Allemang weights reader-economy (minimum records); Hendler weights
audit-trail (every governance act permanent).

**Joint vote:** **AGAINST retiring 0014 now.** Both agree it survives
the current round. **Disagree** on whether a later consolidation should
retire it (Allemang yes; Hendler no).

---

## Q5 — Should 0009 and 0012 combine (Claims + Governance)?

**Allemang:** No, though it's tempting. Both ODRs co-annotate
evidence/Person nodes with different vocabularies — 0009 says "this is
evidence of that claim by this verifier"; 0012 says "this is PII of
category X under regime Y." The follow-up plan even acknowledges the
tight loop with cross-ODR supersession scope. But: PROV-O and DPV are
two different vocabularies with two different design centres (causality
vs regulatory tagging), authored by different expert communities
(Moreau vs Pandit), with different governance cycles. *Working
Ontologist* practice: when two record-readers would each skip half the
content, that's two records.

**Hendler:** Two URI graphs, two governance acts, two ODRs. PROV-O
extensions (`opda:Claim`, `opda:Verification`, `opda:DocumentEvidence`)
mint URIs in the PROV family; DPV annotations attach to existing URIs
with DPV-namespace predicates. Different supersession profiles too: DPV
shifts with regulatory weather (UK AI Act, eIDAS revisions); PROV-O
backbone doesn't. Authored in different W3C forums for good reason —
preserve the separation.

**Joint vote:** AGAINST combining 0009 and 0012. **Strong agree.**

---

## Q6 — Should 0010 and 0013 combine (Overlay Profiles + SHACL validation)?

**Allemang:** The one I'd genuinely consider merging. Both records are
SHACL, both authored by Knublauch in the plan, both have Cagle on
dissent, both consume the data dictionary. 0010's shapes *are* SHACL
shapes governed by 0013's severity discipline. In TopBraid practice,
profile and severity tiering usually ship as one technical commitment.

Counter that holds for me: 0013 owns shapes the *base* TBox produces
(Property identity violation, unprovenanced claim violation, PII
sensitivity warning); 0010 owns shapes the *overlays* produce
(required-leaves per form, merged enums, `sh:xone` discriminators).
Different artefacts, different authoring processes (generator output
for 0013; per-overlay reification for 0010). Lean: keep separate, with
explicit cross-references; flag that 0010 inherits 0013's severity
tiering.

**Hendler:** Two graphs. 0010's profile graphs are *named*,
*dereferenceable* views (`https://opda.uk/profiles/baspi5/`) with their
own URI lifecycle. 0013's base shapes graph is *the* validation graph
for unprofiled transactions. Two URI commitments, two governance cycles
(BASPI5 v5.1 ships without bumping the base shapes), two ODRs. But I
take Allemang's authorial-economy point: the seam must be specified
sharply. `opda:ValidationContext` reification (Guarino's withdrawal
condition in Session 001) *is* the seam — profile shapes are
constraints *of a named context*; base shapes are constraints
simpliciter. That seam is the answer to "why two ODRs."

**Joint vote:** AGAINST combining 0010 and 0013. **Agree** with
mild reservation (Allemang) that authorial overlap could justify a
fused record if the seam isn't kept sharp. The `opda:ValidationContext`
reification is the seam — both insist it stays load-bearing.

---

## Q7 — Missing ODRs

**(a) Address & Geography**

**Allemang:** Genuine gap. The follow-up plan half-notices it —
session-006 Q5 asks "Address declared in 0006 or in a shared
'Geography & Addressing' sub-module?", and 008 inherits the verdict.
That's a hot-potato: a decision serving three+ downstream consumers
(Person, Property, Search localities, EPC certificate addresses)
belongs in its own ODR. Add **ODR-0015 (Address & Geography)**, gated
after 0005, before 0006/0008. Covers: Address class structure (SKOS
country, postcode pattern), INSPIRE Identifier relation, UPRN's
status *as a geographic identifier* distinct from its Property-key role
(0005 settled), and the deferred GeoSPARQL disposition.

**Hendler:** Strong agree, harder. Address is the *most reused* URI
subject in PDTF — Person, Property, Title, Search Authority, EPC,
transport, school, occupier history all reference it. Routing that to
a module-internal 006 decision is exactly the URI-persistence failure
W3C TAG warns about: the most-cited URI gets fixed by the first
consumer who happens to need it. Add Geography too: `geoX`/`geoY`,
INSPIRE polygons, `titleExtents` GeoJSON, search polygons, plot
boundaries. 0002 defers GeoSPARQL pending a consumer; we *are* that
consumer.

**Joint vote:** AGREE **ODR-0015 (Address & Geography)** belongs in
the programme, gated after 0005, before 0006/0008. **Strong agree.**

**(b) Generator policy**

**Allemang:** Mostly covered by 0004 rule 6 ("Generator-first"), but
mechanics deferred — input format, location, ownership, version
control. The plan's session-004 Q5 routes those back to Foundation. If
session-004 actually pins them down, no new ODR. If "declared but
unspecified" (a familiar failure mode), a follow-up **ODR-0015b
(Generator Policy)** is warranted. Watching brief.

**Hendler:** Slightly different framing. Generator produces URIs under
the namespace policy — so it's *part of* URI policy, which is 0004's
remit. If 0004 under-determines it, the failure is in 0004's scope, not
in a missing ODR.

**Joint vote:** AGREE generator policy stays inside 0004 *provided
session-004 pins it down*. No new ODR now; **Allemang flags it as
contingent.**

**(c) W3C VC / DID**

**Allemang:** Genuine add, deferred. 0009 names VC/DID/ToIP terms
(Claim, Issuer, Holder, Verifier) and aligns PROV-O extensions to
them, but stops short of committing to the VC data model and DID
resolution. Honest for the schema-to-ontology round, but PDTF's
trust-framework remit *will* demand it. When buyer-controlled wallets
or DID-resolved verifiers enter scope (the business glossary already
names ToIP terms), a Claims-v2 round is inevitable. Name **ODR-0016
(W3C VC / DID alignment)** as a deferred follow-up, activated when
wallet consumer or DID-method instance data lands.

**Hendler:** Strong yes, *named in advance*. VC and DID are
URI-architectures in their own right (both W3C Recs). OPDA will
eventually commit to specific bindings — `cred:VerifiableCredential`
for claims, `did:web`/`did:key` for verifiers, JSON-LD contexts for
serialisation. Each is a URI-graph decision deserving its own ODR.
Trigger Allemang names is right. Until then, 0009's
alignment-by-reference is correct.

**Joint vote:** AGREE **deferred ODR-0016 (VC / DID alignment)**:
named now, drafted when triggered. Not in the current 13. **Strong
agree.**

---

## Q8 — What signals the cut is right?

**Allemang:** Three signals, *Working Ontologist* style:

1. **Each session produces a verdict writable into `## Rules` in one
   sitting.** Sessions that get stuck routing back to the plan or to
   sibling ODRs signal a wrong cut. 0008 (volume) and 0009/0012
   (co-annotation seam) are the ones to watch.
2. **A downstream consumer can name the ODR owning its question.**
   "Where is Address declared?" → 0015. "What severity for missing
   UPRN?" → 0013. "Why is OWL-Time Conditional?" → 0014. If the answer
   is "across 0005, 0007 and 0010," the cut is wrong.
3. **Supersession trail stays readable.** Two layers of partial
   supersession is fine; four layers means the cut is producing churn,
   not absorbing change.

**Hendler:** Three signals, W3C-architecture style:

1. **Each ODR has a stable, dereferenceable set of URIs that survive
   supersession of *other* ODRs.** Test: amend 0008. Does 0005's
   Property URI change? No. Does 0011's `opda:builtForm` scheme
   change? Only if attribute is enum-typed.
2. **ODR cross-references form an acyclic graph mirroring URI
   dependencies.** 0005 → 0006 (Person identity reuses Property
   discipline); 0006 → 0007 (Roles founded by Transaction); 0009 →
   0012 (DPV co-annotates PROV-O). Cycles = co-decision = merge-or-
   resplit signal.
3. **A new consumer writes a useful query reading ≤3 ODRs.** "EPC-A
   properties with seller acting under POA" needs Property attrs
   (0008), Agent capacity (0006), identity discipline (0005). Three
   records, no more. Seven-ODR queries = over-fragmentation.

**Convergence on signals:** all six reduce to "the cut absorbs change
well." Allemang frames it author/reader (one-sitting verdicts,
single-ownership questions, readable supersession); Hendler frames it
URI/graph (stable URIs, acyclic cross-refs, ≤3-ODR queries). Same
test, different vocabulary.

---

## Summary — where we agree, where we disagree

**Where we agree:**

- The 13-ODR cut is approximately right (Q1).
- 0008 should not split into sub-modules — TTL-level modularisation
  suffices (Q2).
- 0008 and 0011 should not combine — different mechanisms, different
  consumer profiles, different URI graphs (Q3).
- 0009 and 0012 should not combine — different vocabularies, different
  expert communities, different governance cycles (Q5).
- 0010 and 0013 should not combine — the `opda:ValidationContext`
  reification is the seam that justifies two records (Q6).
- An **ODR-0015 (Address & Geography)** belongs in the programme,
  gated after 0005, before 0006/0008 (Q7a).
- A **deferred ODR-0016 (W3C VC / DID alignment)** should be named
  now, drafted when wallet or DID instance data enters scope (Q7c).
- Generator policy stays inside 0004 *provided* session 004 pins it
  down; otherwise a contingent follow-up (Q7b).
- The signals for a good cut are convergent: stable URIs, single
  ownership of each question, short query traversals, readable
  supersession trails (Q8).

**Where we genuinely disagree:**

- **0014's long-term fate (Q4).** Allemang would retire 0014 in a
  future consolidation that re-issues 0002+0014 as a clean
  catalogue-v2. Hendler would keep both records permanently as the
  governance trail, even after consolidation, with a consolidated
  record citing both. This reflects the deeper methodological split:
  Allemang weights reader-economy (minimum records to do the job);
  Hendler weights audit-trail (every governance act is permanent).
  Recorded as a live disagreement; neither view should be silenced
  by the session that closes 014.

- **Mild reservation on Q6 (0010/0013).** Allemang holds open that
  authorial economy could justify a fused record if the
  `opda:ValidationContext` seam isn't kept sharp. Hendler insists
  the seam is sharp by W3C-architecture test and the two records
  stand regardless. Not a vote split, but a different threshold for
  reconsidering.

**Net recommendation to the scope-check process:** the 13-ODR
programme is the right working scope. Add **ODR-0015 (Address &
Geography)** now and **name ODR-0016 (VC/DID)** as a deferred
follow-up. Keep generator policy inside 0004 for now. Resist the
temptation to merge 0009/0012 or 0010/0013, both of which would
collapse two distinct governance cycles into one. The 0002/0014
relationship is a live methodological question that should not be
forced to resolution in the current round.
