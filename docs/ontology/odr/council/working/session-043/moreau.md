# Session 043 — Luc Moreau (PROV-O / PROV-DM lens)

Argued strictly from PROV-DM's event-vs-state distinction (PROV-DM §5.7.2) and PROV-O's
Activity/Entity/Agent + generation/usage/`prov:atTime`/`prov:startedAtTime`/`prov:endedAtTime`
vocabulary (PROV-O, W3C Rec 2013). Grounding I verified in-repo before voting: the
`simple-transaction-with-milestones.ttl` event-log (instruction→offerAccepted→exchange→
completion→registration, each a reified `prov:Activity`/`opda:Milestone` with Plan-vs-Activity);
the `chain-of-transactions.ttl` and `lease-extension-transaction.ttl` exemplars (which carry
**no** milestone events at all — the `opda:status` tokens were the only lifecycle carriers, and
`4905c6b` removed them); `opda:TransactionStatusScheme` (Listed/Offered/Accepted/Exchanged/
Completed) and `opda:MilestoneKindScheme` (instruction/offerAccepted/exchange/completion/
registration), both already emitted in `opda-vocabularies.ttl`; S032's two-bearer refinement.

---

**Moreau (Q1) — VERDICT: REVISE. BALLOT: FOR (materialise the snapshot AND keep the event-log; do not mint a *third* construct).**

The cleanest model is PROV-DM's: a changing characteristic (the lifecycle phase) is *recovered from the
event history*, not stored as standalone mutable truth (PROV-DM §5.7.2, "an entity's situation … is
fixed aspects; a changing characteristic must be described through a succession of entities or recovered
from the activities that changed it"). On that doctrine alone the milestone event-log is the *primary
record* and a phase is its derivation — Davis is right that where the log exists you mint nothing new for
the *history*. **But the decisive fact defeats a derive-only rule for the snapshot:** `chain-of-transactions`
and `lease-extension` carry **no milestone events whatsoever** (verified — the only lifecycle triple either
ever held was `opda:status`, now removed in `4905c6b`). A derivation has nothing to range over there; `SELECT
?phase WHERE { ?milestone … }` returns empty, so "phase" would be silently *undefined* for two of three
exemplars. In PROV terms there is no `prov:Activity` set to recover the characteristic *from*. Therefore a
**materialised current-phase property on the `opda:Transaction` is the only available carrier** when the
producer emits no event-log — its absence is not "phase unknown", it is "phase unrepresentable", which is a
model gap, not a modelling choice. Amendment: **(a)** declare a single current-phase property (bearer =
`opda:Transaction` Relator, per Q2) whose value-space is `opda:TransactionStatusScheme`; **(b)** where a
milestone event-log *is* present (the `simple-transaction` case), the snapshot is the **derived projection of
the latest milestone** — i.e. it is `prov:wasDerivedFrom` the terminal `opda:Milestone`/`prov:Activity`, making
the drift-risk auditable rather than hidden (a snapshot that contradicts its own event-log is then a detectable
SHACL/`prov:wasDerivedFrom` inconsistency, not a quiet lie); **(c)** the property is explicitly a *latest-known
state*, the event-log remains the system of record for *when* and *how* (PROV's job), and no fact is stored
twice as independent truth. This is the honest reconciliation of Davis (log suffices for *history*) and the
data (snapshot is the *only* carrier for the log-less producers) — neither alone is adequate.
*Cross-talk — Davis (DA):* you are correct that minting a parallel state-machine when a full event-log exists is
redundant and risks the very drift PROV-DM §5.7.2 warns against; I have met you halfway by making the snapshot a
*derived* projection (`prov:wasDerivedFrom` the terminal milestone) wherever the log exists. Where it does *not*
exist (two of three exemplars), "don't mint" leaves phase unrepresentable — that is not parsimony, it is data loss,
and the PDTF source carries `status` precisely because producers ship a coarse snapshot without an event stream.

**Moreau (Q2) — VERDICT: AFFIRM (reuse `opda:TransactionStatusScheme`; bearer = the Transaction Relator). BALLOT: FOR.**

Reuse the existing five-phase `opda:TransactionStatusScheme` (Listed/Offered/Accepted/Exchanged/Completed) — do
NOT mint a coarse scheme. It already exists, is ADR-0010-named, and each label `prov:wasDerivedFrom` its
data-dictionary enum (verified in `opda-vocabularies.ttl`). Crucially for my lens there is a clean **homomorphism
between the milestone-completion *events* and the status *values*** — exactly the event↔state correspondence PROV-DM
§5.7.2 formalises: the `offerAccepted` milestone-event leaves the transaction in the `Accepted` phase; `exchange`→
`Exchanged`; `completion`→`Completed`; the `Listed`/`Offered` phases precede the first recorded milestone. The status
scheme enumerates the *resting states between events*; the milestone scheme enumerates the *transitions*. They are
two projections of one state machine, so a *second* scheme would duplicate the state-space and break the homomorphism
— precisely the duplicate-concept hazard Isaac flagged at S032 (one-primary-scheme IC, ODR-0011 §1a). Confirm bearer:
the snapshot bears on the **`opda:Transaction` Relator** (the milestone-Phase bearer per S032's two-bearer refinement,
co-signed Guizzardi/Guarino/Isaac/Kendall, 5–0–0), **distinct** from `participantStatus` (Proposed/Invited/Active/
Removed) which bears on the participant's role-play (qua-individual). One axis, one bearer, never per-role.
**One coherence snag I must flag (REVISE-rider, non-blocking):** the emitted `TransactionStatusScheme`
`skos:definition` says "lifecycle of a Transaction **Substance Kind**", but S032/ODR-0011 §8a fix the milestone-Phase
bearer as the Transaction **Relator**, and a Phase bears on its host — calling the host a "Substance Kind" in the very
scheme that carries the Phase is internally inconsistent. Recommend the editors correct "Substance Kind" → "Relator"
(or drop the category word) when this scheme is first bound to a property. It does not change my FOR.
*Cross-talk — Guizzardi (UFO phase-as-attribute):* a current-phase *attribute* on the Relator is exactly your
anti-rigid Phase realised as a datatype/coded facet, and it sits comfortably with PROV — the Phase is the *state*,
the milestone `prov:Activity` is the *event that transitions* it; the two never collapse, so I support binding
phase as a facet on the Relator rather than a subclass.

**Moreau (Q3) — VERDICT: AFFIRM the mapping below. BALLOT: FOR.**

Map the removed exemplar tokens onto canonical `opda:TransactionStatusScheme` notations by the event→state
homomorphism (PROV-DM §5.7.2):
- `chain-of-transactions` had `opda:status "active"` ×3. "Active" in the conveyancing lifecycle = under-offer /
  proceeding — i.e. the `Accepted` phase (the §8a/ODR-0007 lifecycle mermaid's "UnderOffer", entered at offer
  acceptance). **`active` → `Accepted`.** (The sibling `opda:chainStatus "active"` on the `TransactionChain`
  is a *different bearer* — chain-level, derived "any-blocked→blocked" per the exemplar's own scopeNote — and is
  out of scope for the transaction-phase property; leave it, or re-map it under a separate chain-status decision.)
- `lease-extension` had `opda:status "completed"`. The extension `prov:Activity` carries `prov:atTime
  "2024-09-30"` (a *finished* event). **`completed` → `Completed`.**
- `simple-transaction` had `opda:status "completed"`; its terminal milestone is `registration` (an interval that
  *ended* 2024-08-30). **`completed` → `Completed`**, and here the snapshot should be emitted as
  `prov:wasDerivedFrom` the `registration` milestone Activity (the Q1(b) derived-projection rule), demonstrating the
  reconciliation on the one exemplar that *has* a log.
The removed comment "proposed/active/exchanged/completed" conflated participant-status vocabulary (`Proposed` is a
*participantStatus* value, S032) with transaction-phase — a symptom of the very bearer-confusion S032 resolved; the
canonical mapping above keeps the two axes cleanly separate.
*Cross-talk — Davis (DA):* note this mapping needs *only the five existing labels* — zero new concepts — which is the
parsimony you (rightly) press for; the snapshot reuses the scheme the project already emits.

**Moreau (Q4) — VERDICT: AFFIRM (it should dereference). BALLOT: FOR (coherence-only; defer the rendering mechanics to Gandon/Q5).**

Outside my core remit, so I weigh only on coherence with provenance/transparency, then lean on Gandon. From the
transparency stance that underpins PROV (provenance exists so a consumer can *inspect why a value is what it is*): an
annotation that records the design-time foundational commitment is itself provenance-of-the-model, and provenance you
cannot dereference is provenance you cannot audit. `opda:ufoCategory` already carries a `dct:source` to ODR-0011 §8a
and ODR-0031 (verified) — a predicate that *asserts its own sources* but 404s at its own IRI is internally
inconsistent with the linked-data contract ("anyone should be able to look up the URI", PROV-O §1, Linked Data
principles). So it should resolve. The "inert facet ≠ first-class term" worry is real but is a *presentation*
problem (Q5), not a reason to leave the term un-dereferenceable. AFFIRM with no PROV-specific amendment.
*Cross-talk — Gandon (dereferenceability):* I defer to you on the mechanics; from the provenance side the only
hard requirement is that the page *render the `dct:source` + the "UFO-informed, not UFO-grounded" `skos:scopeNote`
verbatim* so the audit trail (why this class bears this category, and the explicit non-entailment) survives to the
consumer — that disclosure is the provenance, and it must be the page's load-bearing content, not a footnote.

**Moreau (Q5) — VERDICT: ABSTAIN. BALLOT: ABSTAIN.**

Site model / `entryKind` / badge rendering is outside my expertise (PROV-O lead editor lens). I defer to Baker
(SKOS scheme surfacing) and Gandon (dereferenceability) on the generator and presentation contract. My only
provenance-grounded ask — already stated under Q4 — is that whatever `entryKind` is chosen, the disclosure
(`dct:source` + the never-reasoned `skos:scopeNote`) is rendered as the page's spine so the model's own provenance
and its explicit non-entailment reach the reader. Beyond that I cast no vote on the rendering design.
