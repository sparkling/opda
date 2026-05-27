# Allemang + Hendler — Pragmatic-pair position on S002

*Joint position file. The pair is two voices — where Allemang and Hendler
diverge, both are recorded. Where they converge, the pair signs jointly.*

## Pair summary (≤120 words)

The catalogue is 80% settled and the meta-discipline is the real work.
Three-tier cut is right (Q1); version-pin only where breakage is plausible
(Q2). **Promotion criteria (Q3)** must combine usage evidence with SHACL
enforcement — neither alone — and demotion *of Core* is forbidden because
removing a Core term breaks every downstream URI graph that already
dereferences it (Hendler, *Cool URIs* / W3C TAG); demotion *of Conditional*
to Defer is editorial. **Reference-not-import (Q4)** is the W3C TAG
discipline made normative, generalised across every Conditional with one
documented exception lever. On Q5–Q13 the pair defers to specialist
teammates with named one-liners; Hendler attaches a URI-persistence
concern to OWL-Time demotion (Q7) and to the `cred:`/`did:` admission (Q13).

---

## Per-question positions

### Q1 — Tier cut (3-tier vs 4-tier)

**Allemang:** Three tiers is right. A fourth "under-review" tier is a
project-tracking artefact, not a catalogue tier — it belongs in
`docs/governance/deferred-work`, not in ODR-0002. A "deprecated" tier
would tempt modellers to keep dereferencing a term that has been ruled
out; better to remove from Core/Conditional and add a `## Change log`
row noting the deprecation reason. *Working Ontologist* 3rd ed. Ch. 3:
"the smallest sufficient vocabulary"; every tier you add is a tier you
have to govern.

**Hendler:** Three tiers, with one caveat. *Tier-movement is itself a
governance act* — the `## Change log` MUST capture every movement with
named voters and rationale, because the audit trail is what makes the
catalogue accountable. My recorded dissent on the ODR-0014 retirement
(Scope-Check 1 Q4, vote 7-1-1, plan §9 risks) is preserved, not
relitigated: I lost on the parallel-record question; I did not lose on
the audit-trail question. Collapsing tiers without preserving "when, by
whom, why" loses precisely what makes a catalogue defensible to a future
maintainer. W3C Process precedent — REC + ERRATA + REC-revision keeps
the lineage visible.

**Pair vote:** AGREE three-tier; AGREE Change-log-as-audit-trail. *No
fourth tier; deferred-work tracking is project-side, not catalogue-side.*

---

### Q2 — Per-entry metadata (version-pin needed?)

**Allemang:** Pragmatic — pin only when a breaking change is plausible
within the round. The current pins (RDF 1.2, SHACL 1.2) are correct
because both are draft-status W3C work where breakage has happened. DPV
moves fast (the DPV CG is actively redrafting the legal/jurisdictional
modules); a version-pin on the DPV family is *currently* unnecessary
because we adopt the annotation slice only, but it becomes load-bearing
the moment we adopt lawful-basis class vocabulary (Pandit's dissent
routed to ODR-0012). Don't pre-pin against speculative breakage. Add a
`## Change log` rule: when a Conditional vocab undergoes a *breaking*
version change upstream, that triggers a Reduced Council session (cited
in current ODR-0002 §Consequences — keep it).

**Hendler:** Version is part of the URI policy. Every Core entry SHOULD
declare its W3C Recommendation date and status (REC / CR / WD / Note),
and every Conditional entry MUST. The dereferenceable namespace is what
the URI policy commits to; the version is what the *commitment is
against*. SHACL 1.2 vs SHACL 1.0 are not the same vocabulary; the
URI is, but the semantics aren't. Pin where the dereferenceable upstream
lineage is non-trivial. (Aligns with Q6 — W3C status citation.)

**Pair vote:** AGREE add a `version-pin` field as OPTIONAL for Core
(except where already declared), RECOMMENDED for Conditional. Pin
content: `W3C Rec date | status` (REC/CR/WD/Note) at minimum; vendor
release versions for community-maintained entries (DASH at TopQuadrant
release N). *Don't pin speculatively — add when the upstream is moving.*

---

### Q3 — Promotion / demotion criteria — DEPTH

**This is the load-bearing question of the session.** Without explicit
criteria, "Promotion to Core" becomes a popularity vote and "Defer-list
discipline" becomes informal. We propose two distinct mechanisms,
because *promotion* and *demotion* are not symmetric — Hendler's
URI-persistence concern bites only on the demotion side.

#### Q3a — Conditional → Core promotion: three conditions

**Allemang's two (usage + engineering):**

1. **Usage evidence.** ≥3 OPDA layers (ODR records, layer-counted)
   actively use it AND ≥1 is a normative use (not annotation). Three
   is the threshold: one is anecdote, two is coincidence, three is a
   pattern (*Working Ontologist* Ch. 12 on enterprise rollout).
2. **SHACL gate exists.** Per-layer scope enforced by SHACL shape,
   not reviewer discipline. Honour-system Conditional has a known
   half-life; promotion to Core means "scope-gating no longer needed"
   — itself a SHACL-checkable claim.

**Hendler's third (architecture):**

3. **Stable dereferenceable upstream.** W3C Rec with active
   maintenance, OR 10-year stable-URI deployment, OR Foundation-class
   commitment (DCMI, W3C). Community drafts at mutable URIs (GitHub
   `main` with no tags) do NOT promote even if used everywhere — Core
   carries a stronger ontology-wide commitment than Conditional, and
   every modeller is *expected* to dereference Core URIs. URI movement
   breaks the whole programme.

**Worked examples.** OWL-Time: trips (1) — used in ODR-0005, 0007,
0009 — but not (2) yet (no SHACL gate). Promotes when ODR-0013 adds
the interval shape, not before. DASH: trips (1) and (2) but Hendler's
(3) holds it at Conditional until TopQuadrant commits versioned-URI
lineage OR DASH advances at W3C. Difference between "we promise to
serve this" and "we hope someone keeps serving this."

#### Q3b — Demotion: asymmetric rule

**Pair (joint):**

- **Core never demotes.** URI-graph break — every downstream module
  dereferences Core, every published header includes its prefix.
  Honest move when problematic: deprecation by `## Change log` row
  (`deprecated: true, replaced-by: X`); row stays. Hendler: W3C
  Process pattern — Recs don't demote, they're *superseded by new
  Recs*; old one stays dereferenceable.
- **Conditional → Defer is editorial.** No URI-graph cost (Conditional
  is already layer-scoped). Precedent: BBO + ArchiMate, S001 Q2.
- **Defer rows never delete.** Audit-trail discipline — Hendler's
  preserved Scope-Check 1 Q4 dissent. Reviewed-and-not-adopted is a
  governance act; row stays so future maintainers don't ask twice.
  FOAF is canonical (Q12 codifies the reason discipline).

**Pair vote Q3:** AGREE all three promotion conditions; AGREE
asymmetric demotion. *Allemang accepts (3) as MUST for Core, SHOULD
for Conditional admission; Hendler accepts the softening at
Conditional admission.* Joint propose: new `### Promotion and demotion
criteria` subsection in ODR-0002 `## Rules`.

---

### Q4 — Reference-not-import discipline — DEPTH

The session question: generalise reference-not-import (currently
buried in ODR-0002's `### Adoption pattern` rule 3) across every
Conditional entry, hoist to normative `## Rules` subsection.

**Allemang:** Generalise as **default MUST** with two documented
exception levers. *Working Ontologist* 3rd ed. Ch. 8 (the W3C
"follow your nose" pattern): clients dereference the prefix when
they need upstream class definitions; the OPDA TBox doesn't carry
the import burden. Documented exceptions, not laxity:

- **Profile slice.** Vocab huge (DPV, FIBO), OPDA use case small:
  canonical URI references the *profile slice*, not the upstream.
  Pin on slice. Connects Q5.
- **Reasoner-required.** Downstream consumer runs OWL reasoner over
  OPDA + upstream axioms (rare in our domain): `owl:imports`
  acceptable IF declared in a `## Reasoner profile` ODR.

**Hendler:** This IS the **W3C TAG cool-URIs discipline** made
normative. Berners-Lee 2006 *Linked Data Principles* 2–3; W3C TAG
*"Cool URIs don't change"* (2008): if OPDA `owl:imports` an
upstream vocabulary into its TBox, OPDA is now *responsible for what
that import means* even if upstream changes. Reference-only
externalises that responsibility to the upstream maintainer where it
belongs. **MUST, not SHOULD.**

Connects to ODR-0004 §Foundation rule 5 (*"Don't ship URIs you don't
serve"*) symmetrically: don't dereference URIs you haven't committed
to serving; don't import URIs you haven't committed to maintaining.
Same persistence rule, inverse direction.

#### Worked exception cases

| Vocabulary | Default applies? | Exception? | Reason |
|---|---|---|---|
| DPV (+ family) | Yes — reference only | Profile slice (Exception 1) | DPV is huge; OPDA adopts Phase-1 annotation only. Reference profile slice URI, not `https://w3id.org/dpv#` whole |
| PROV-O | Yes — reference only | None | Stable W3C Rec; OPDA TBox imports nothing; consumers dereference `http://www.w3.org/ns/prov#` for spec |
| OWL-Time | Yes — reference only | None | Stable W3C Rec 2020; reference by canonical URI |
| ODRL | Yes — reference only | None (policy-authoring deferred per Q10) | When policy-authoring activates, profile-pinning may apply |
| SHACL/DASH | N/A (Core; effectively imported via runtime) | — | Validators load SHACL natively; DASH-shape rendering loads via SHACL processor; not an `owl:imports` question |

**Pair vote on Q4:** AGREE generalise to **every Conditional entry as
default MUST**. AGREE two documented exception levers (profile-slice;
reasoner-required) with the deviation recorded in the ODR's `##
References`. Joint propose: hoist Adoption-pattern rule 3 to a
first-class `### Reference-not-import (normative)` subsection in ODR-
0002 `## Rules`, with the exception levers spelled out below.

---

### Q5 — Profile-pinning ownership

**Pair:** Consuming-ODR owns; catalogue points. Allemang: catalogue
stays light. Hendler: profile-slice URI lives in consuming ODR's
`## References` (precedent: SKOS-XL profiles SKOS in its own spec, not
the SKOS catalogue). **AGREE.**

### Q6 — W3C status citation per entry

**Pair:** AGREE. Add `Authority status` column to Core and Conditional
tables: `W3C Rec (date)` | `CR/WD/Note (date)` | `Community Standard
(maintainer)` | `OMG/ISO (id, date)`. Defer rows: status as-at-deferral
so revisits know the baseline. Hendler: aligns with ODR-0001 citation
grounding — catalogue should cite named specs, not gesture at
"standards-based." Backfill existing rows.

### Q7 — OWL-Time demotion trigger

**Pair:** Demotion (Conditional → Defer) requires BOTH triggers:
(a) Allemang editorial — post-Phase-1 review finds no module uses
interval algebra in shapes (this was Allemang's lost Session 001
dissent — recorded ≈6-3); (b) Hendler hard test — zero downstream
consumers AND no SHACL shape references AND no external integration.
**AGREE; codify in `### Promotion and demotion criteria`.**

### Q8 — DCAT gate condition

**Pair:** Confirm Conditional. Activation trigger: OPDA publishes
ontology distribution OR reference-data catalogue. Davis Core-push
held off in S001; Baker's Conditional stands. **AGREE.**

### Q9 — SSSOM re-open trigger

**Pair:** Confirm deferred (S001 Q2, Cagle dissent ≈5-4). Re-open
trigger: external mapping work to FIBO / INSPIRE / HMLR RDF. Hendler:
trigger is when external dereferenceable target identified — mapping
isn't a mapping until both sides resolve. ODR-0011 inherits.
**AGREE.**

### Q10 — ODRL policy-authoring activation trigger

**Pair:** Catalogue admission stands; policy-authoring deferred.
Trigger: consent-receipt or data-rights-expression instances enter
Phase 2 (Pandit's S001 dissent via ODR-0012). Allemang: Guarino's
S001 contradiction stands — TBox alone asserts nothing. Hendler: at
activation, ODRL Policy graph gets own dereferenceable namespace;
ODR-0004 persistence commitment extends. **AGREE; ODR-0012 inherits.**

### Q11 — OBO RO (adopt / defer / reject)

**Pair: defer-with-reason.** Formal-pair (Gandon + Guizzardi) leads;
they own the meronymic-semantics expertise. *Working Ontologist*
view: BFO `part-of` semantics deployable but `dct:isPartOf` covers
the flat → block → estate transitivity OPDA needs (Davis S001).
**Defer pending formal-pair verdict; record reason in `## Change log`
either way (per Q12 discipline).**

### Q12 — FOAF reason in `## Change log`

**Pair: AGREE.** Current Defer row says "ruled out" with reason
distributed across row text and ODR-0006 cross-ref. Tighten: dated
Change Log row with verbatim reason — "`prov:Agent` covers
provenance-role need; person/org distinction via W3C Org or `opda:`
per ODR-0006; FOAF person-modelling surface exceeds OPDA need; FOAF
URI persistence at `xmlns.com/foaf/0.1/` since 2000 is acceptable but
not load-bearing."

### Q13 — `cred:` / `did:` admission confirmation

**Pair: AGREE admission** (Scope-Check 1 Q7c, 8-1). Rows exist; this
session ratifies them and the ODR-0016 activation pointer.

Hendler: both VCDM 2.0 and DID Core 1.0 meet Core upstream-persistence
bar (W3C Rec); currently Defer only because no OPDA module consumes
them. When activation triggers fire, the legitimate path is
**Defer → Conditional → Core, one step at a time** — skipping
Conditional would breach the audit-trail discipline. Codify
one-step-per-Change-Log-row as a sub-rule of `### Promotion and
demotion criteria`.

---

## Proposed amendment text

### Insert into ODR-0002 `## Rules`, after `### Adoption pattern`:

**Two new `## Rules` subsections** (sketched — Queen tightens to
ODR-0002 voice):

- `### Promotion and demotion criteria` — three-condition promotion
  (usage ≥3 layers / SHACL gate / stable dereferenceable upstream;
  conditions 1–2 MUST; condition 3 MUST for Core promotion, SHOULD
  for Conditional admission). Asymmetric demotion: Core never
  demotes (deprecation by `## Change log` row only); Conditional →
  Defer editorial when three demotion conditions hold (zero
  downstream consumers + no SHACL ref + no external integration);
  Defer rows never delete (audit-trail discipline, Hendler S-C1 Q4).
  One-step-per-Change-Log-row (no Defer → Core skip).

- `### Reference-not-import (normative)` — default MUST per
  Conditional entry: reference by canonical URI with local SHACL
  scope; OPDA TBox does NOT `owl:imports` upstream. Two exception
  levers (declared in consuming ODR's `## References`): profile
  slice (DPV, FIBO huge vocabs → slice URI), reasoner-required
  (downstream OWL reasoner → declared in `## Reasoner profile` ODR).
  Rationale: Berners-Lee 2006 *Linked Data Principles* 2–3; W3C TAG
  *"Cool URIs don't change"* (2008); symmetric to ODR-0004
  §Foundation rule 5.

### Append to ODR-0002 `## Change log`:

| Date | Source | Row(s) affected | What changed |
|---|---|---|---|
| 2026-05-27 | Session 002 Q3 | All — meta-discipline | Added `### Promotion and demotion criteria` subsection: three-condition promotion (usage + SHACL + upstream-persistence); asymmetric demotion (Core never demotes; Conditional editorial; Defer never deletes). |
| 2026-05-27 | Session 002 Q4 | All Conditional rows | Hoisted reference-not-import to first-class `### Reference-not-import (normative)` subsection. Default MUST; two documented exception levers (profile-slice, reasoner-required). |
| 2026-05-27 | Session 002 Q6 | All Core + Conditional rows | Added Authority status column to catalogue tables (W3C Rec date, CR/WD/Note, OMG/ISO/community status). Backfilled existing rows. |
| 2026-05-27 | Session 002 Q12 | FOAF | Reason recorded verbatim per Q12 ruling: `prov:Agent` covers provenance-role need; person/organisation distinction via W3C Org or `opda:` per ODR-0006; FOAF surface exceeds OPDA need. |

---

## Replies to anticipated objections

### Baker (Queen) on Q3 — "Three conditions is too strict; you'll never promote anything"

Three conditions sounds rigid but each is necessary. Usage alone is
popularity; SHACL alone is engineering; upstream alone is wishful
thinking. The conjunction is what makes Core *actually* enforceable:
when a vocabulary trips all three, modellers across the programme can
rely on it as substrate. The current Core rows all trip the
three-condition test trivially because they're W3C Recs in universal
use — the test is doing nothing on them. The test bites on the
*next* promotion, where the bar should bite.

### Cagle (DA) on Q4 — "Reference-not-import is W3C TAG dogma; real ontology engineering imports vocabularies all the time"

Cagle's likely line — "the TAG's persistence concerns are for the
open web; inside an enterprise, imports are how you compose
ontologies." Two-part reply:

1. **OPDA isn't enterprise-internal.** It's a public-interest
   linked-data programme aiming at UK-gov-style publishing
   discipline (per the adoption record §Project Weighting on
   Davis/Baker). The TAG concerns apply.

2. **The exception levers cover legitimate enterprise composition.**
   Profile-slice and reasoner-required are exactly the cases Cagle
   has in mind. They're documented, not forbidden — they're just
   labelled as deviations from default, which is what reviewers need
   to be able to check.

The deeper point: `owl:imports` is a *commitment to maintain the
imported semantics*. Defaulting to reference (not import) makes that
commitment explicit when it happens, rather than tacit.

### Davis (Plan §9, recurring) on Q3 — "Editorial overhead; just amend in place"

Davis won the Scope-Check 1 Q4 retirement vote partly on this
ground (W3C WD has no Errata). Fair on the parallel-record question.
But the Q3 discipline isn't a parallel record — it's a *test* you
apply to a candidate promotion *before* writing the Change Log row.
The row remains the artefact; the test is the gate. Davis-aligned.

### Guarino (possible challenge) on Q3 condition (3) — "Upstream-persistence is an empirical fact, not an ontological one"

Guarino might argue that catalogue-tier criteria mixing
deployment-empirical bars with semantic criteria is a category error.
Reply: tier-membership is itself an artefact-engineering decision
(ODR-0002 is `kind: architecture` per the A9 amendment — explicitly
not requiring UFO meta-category commitments). Mixing empirical and
semantic criteria is permitted at the artefact-engineering layer; the
test is whether the criterion is reviewable, and persistence IS
reviewable (the URI either has been stable for 10 years or it
hasn't).

---

## Vote draft on Q3 and Q4

**Q3:** AGREE three-condition promotion (usage + SHACL + upstream-
persistence); AGREE asymmetric demotion (Core never demotes;
Conditional demotes editorially; Defer rows never delete). Vote
shape: **2-0-0** within the pair. *Allemang carries the
usage+SHACL conditions; Hendler carries the upstream-persistence
condition; both carry the asymmetric demotion rule.*

**Q4:** AGREE generalise reference-not-import to every Conditional
entry as default MUST; AGREE two documented exception levers
(profile-slice, reasoner-required). Vote shape: **2-0-0** within
the pair. *Hendler carries the W3C TAG persistence-rationale;
Allemang carries the exception-lever pragmatism; both carry the
default-MUST upgrade.*
