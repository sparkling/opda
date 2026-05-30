# Session 021 — Evans & Vernon (DDD) — Settled Position

**Council:** OPDA Linked Data Council, Session 021 — *Bounded-Context Implementation Plan*
**Voice:** Eric Evans & Vaughn Vernon (Domain-Driven Design)
**Methodology:** ODR-0001. Queen: Kendall. DA: Davis.
**Status:** settled (one opening + one rebuttal pass)

---

## The one thing this council must not get wrong

The PDTF forms (`baspi5`, `ta6`, `piq`, `fme1`, …) are the **Published Language** of the
contexts (Evans 2003, ch. 14). They are *not* the contexts, and they are not the home of the
domain model. A Published Language is the shared lingua franca that contexts translate *into*
at their boundary — by construction it is the part of the model that is **not owned by any one
context**. This single fact resolves the Architect's two claims and the whole Q1 fork:

> **"Which context's Published Language uses this term?"** and **"Which context *owns* (authors,
> stewards, defines) this term?"** are two different questions. The first is read off the forms.
> The second is a Context-Map fact and must be authored. OPDA already has two predicates for
> exactly this split — `opda:servesContext` and `opda:definedInContext` — and the live defect is
> that only the first is ever populated.**

Everything below follows from keeping those two questions apart. It lets me agree with Allemang/
Cagle/Davis on derivation (for `servesContext`) **and** with the Architect's Claim B on domain
ownership (for `definedInContext`) without contradiction — and without re-litigating the S019
7–0 vote, which I accept.

I also record up front where I was overruled and accept it: in **S020 I argued upstream-as-
Conformist-peer-in-scheme and a Shared-Kernel tag; the Queen ruled against both on verified facts**
(no upstream overlay edges → non-derivable; "absence-of-tag = kernel signal"). I do not reopen the
*scheme population* (six industry contexts, flat). I reopen only the narrow, implementation-forced
question of **how an entity's home is recorded**, because that is this council's Goal #2
("PLACE every entity in its correct bounded context") and the current gate makes it un-recordable.

---

## Architect's two claims — DDD verdict

**Claim A — SHACL overlays only validate already-defined entities; must not define the ontology.**
**AGREE, strongly, and it is already ratified doctrine.** ODR-0008's slogan is "ontology DEFINES;
SHACL CONSTRAINS"; ODR-0010 §Decision: "Overlays are views over a fixed TBox — they constrain, they
do not declare"; the class-per-overlay option was rejected *unanimously* at S001 Q3/Q5 precisely
because a form-shaped class hierarchy "conflates UI contract with semantics." In DDD terms an overlay
is the Published Language's **constraint surface** (presence + vocabulary at the boundary), never the
model. The JSON-Schema-overlay analogy the Architect draws (select/constrain a base, never mint) is
exactly right and is the SHACL `sh:minCount`/`sh:in`/`sh:xone` story of ODR-0010 Rule 1–3.

*The one place Claim A bites the plan (Q3):* the 935-leaf descriptive walk **must be sourced from the
data-dictionary leaf inventory** (ODR-0008 "data dictionary as the leaf inventory"), with overlays only
*adding* per-form `sh:minCount`/`sh:in`. If the walk were driven *by which overlay references a leaf*,
the forms would be minting the TBox — the inversion Claim A warns against. Source of truth for
*existence of a term* = the dictionary; source of truth for *constraint on a term* = the profile. Keep
that seam clean and Claim A holds throughout.

**Claim B — Bounded contexts belong to the ontology/domain; deriving the partition from form artifacts
may be a layering inversion.**
**PARTLY AGREE — and the part I agree with is the part this council must fix.** The Architect has
correctly smelled an inversion, but it is not in *deriving `servesContext`* (which is sound — see
below). It is in **ODR-0019 Rule 8 gating `definedInContext` to homonyms-only, with the corpus
attesting zero.** The effect is that today the partition is *100% form-readable and 0% authored* —
which is precisely Claim B's complaint, and it is true as stated. A bounded context **is** a
domain-ownership fact (Evans 2003: a context is owned by a team and bounded by a model); the Context
Map **is** a deliberate, authored design artefact (Evans 2003, ch. 14, "drawn", not reverse-
engineered). You cannot read team ownership off a message format — the form tells you the PL *uses*
a term, not who *owns* it. So Claim B is right that *ownership* must be authored; it is wrong only if
read as "therefore `servesContext` must also be authored" — that conflates the two questions above.

---

## Q1 — Membership authority

**Lead proposal voted on:** *authored at ontology layer / derived from SHACL overlays (current
ODR-0020) / hybrid.*

**VOTE: FOR HYBRID — split by predicate.** `opda:servesContext` is **derived** from the profiles
(unchanged from ODR-0020 Rule 5). `opda:definedInContext` is **authored** as the Context Map as data,
and its activation gate (ODR-0019 Rule 8) is **decoupled from the homonym question**.

**Key argument.** Two predicates, two authorities, because they answer two questions (Evans 2003,
Bounded Context + Published Language + Context Map):

| Predicate | Question | Authority | DDD construct |
|---|---|---|---|
| `opda:servesContext` | "Used at which contexts' boundary?" | **Derived** from `overlaysContext`+`requires` | Published-Language usage |
| `opda:definedInContext` | "Whose model owns/authors this term?" | **Authored** — the Context Map | Bounded-Context ownership |

`servesContext` SHOULD be derived: the form a payload arrives through genuinely *is* its boundary, and
hand-maintaining "used-by" across 15 forms would drift the instant a form moves (Cagle's S020 finding;
I concede it cleanly). `definedInContext` MUST be authored: ownership is not a function of which form
happens to require a term — `opda:Address` is *used* by ~10 contexts' PLs but is *owned* by no single
industry context (it is shared kernel), and `opda:RegisteredTitle` is *owned upstream* (HMLR) however
many forms surface it. No derivation rule can recover an ownership decision that was never written down.

**Why this is not a re-litigation of S019.** S019 ruled 7–0 that *namespace* never encodes context and
that `servesContext` is derived. I accept both without reservation. I am not proposing a new authority
for `servesContext`; I am proposing that the **already-ratified** `definedInContext` (ODR-0019 Rule 5,
ODR-0020 Rule 4 last paragraph) be *populated for owned terms* rather than left dormant behind a gate
that only ever opens for homonyms. The homonym gate (Rule 8) was scoped to *polysemy machinery*
(scopeNotes, SKOS-XL, sense registers) — not to the elementary act of recording a term's home. Those
are different builds; the plan should say so.

**Citations:** Evans 2003 (Bounded Context; Published Language as the *unowned* shared language;
Context Map as an authored artefact); Vernon 2013 *Implementing DDD* ch. 2–3 (context ownership;
"the model is owned by one team"); ODR-0019 Rule 5 (`definedInContext` exists); ODR-0020 Rule 4
(`definedInContext` hand-applied); Cagle S020 (derivation of `servesContext`, which I accept).

---

## Q2 — Placement method & coverage (assign EVERY entity to its correct context)

**VOTE: FOR a four-signal placement method that distinguishes ownership from usage and, decisively,
distinguishes *deliberate Shared Kernel* from *incidental co-occurrence*.**

ODR-0020's four buckets (A single / B spanning / C upstream / D untagged) classify **usage** well but
**cannot tell three different things apart**, because all three land in "no `servesContext` tag, or
multiple `servesContext` tags":

1. a **deliberate Shared Kernel** term (Address, Participant) — jointly governed by agreement;
2. **incidental co-occurrence** — two forms happen to ask for the same leaf, no joint governance;
3. **scaffolding** nobody has mapped yet (`GeneratorRun`, `DiagnosticExemplar`).

Evans 2003 is explicit that a **Shared Kernel** is a *deliberate, jointly-governed* overlap that "two
teams agree to share … changes require consultation with the other team" — it is categorically
different from incidental overlap, and from un-owned scaffolding. ODR-0020 bucket-B ("the multiplicity
IS the spanning") collapses (1) and (2); bucket-D collapses (1)/(3). **Placement-by-usage cannot
recover placement-by-ownership** — which is Goal #2 of this council.

**The method (the discriminator is `definedInContext`, NOT a new boolean — the boolean was rightly
rejected in S020):**

| Signal | Source | Bucket meaning |
|---|---|---|
| **0+ `servesContext`** | DERIVED (Cagle's CONSTRUCT) | which PLs use it (ODR-0020 buckets A/B) |
| **`definedInContext` → an industry context** | AUTHORED | this context **owns/authors** the term |
| **`definedInContext` → a kernel home** | AUTHORED | **deliberate Shared Kernel** (jointly governed) |
| **`consumesFrom` → `opda:Organisation`** | AUTHORED (ODR-0020 Rule 2/C) | **upstream-owned** (Conformist) |
| *(none of the above)* | — | un-owned **scaffolding** (true bucket-D) |

This turns ODR-0020's four buckets into a **completeness checklist**: every emitted `opda:` term must
resolve to exactly one *ownership* answer — industry-owned, kernel, upstream-owned, or
scaffolding — and **CI can assert that the union is total** (every term carries either a
`definedInContext`, a `consumesFrom`, or is on an explicit scaffolding allow-list). That total-cover
assertion is the only real test that "EVERY entity has been placed." Usage tags (`servesContext`)
remain derived and additive on top.

**The Shared-Kernel home — the one genuinely open sub-decision.** A deliberate kernel needs a
*target* for `definedInContext`, but ODR-0020 Rule 3 forbids minting `skos:Concept`s for spanning
concerns (it routes them to the ODR-0006 RoleMixin family and the ODR-0007 phase-space). I do **not**
reopen that — I propose the kernel's home is exactly those existing structures: a kernel **role-bearing
term** (Participant) is `definedInContext` the ODR-0006 *Participants & roles* home; a kernel
**lifecycle term** is `definedInContext` the ODR-0007 *Transaction lifecycle* home; a kernel
**reference term with no single owner** (Address, UPRN) is `definedInContext` the **foundation module**
itself (`opda:` foundation), which is already where ODR-0015 homes it. So the kernel is *named by where
it is already defined*, not by a new sentinel — this respects S020's "no `SharedKernel` boolean" while
making the kernel **legible** instead of being silence indistinguishable from scaffolding.

**Multi-membership (Address ∈ ~10).** Handled cleanly by the split: Address gets ~10 *derived*
`servesContext` edges (its PL footprint) **and** exactly one *authored* `definedInContext` →
foundation (its single home). Multi-membership is a usage fact; single-home is an ownership fact;
no `owl:sameAs`, no duplication (ODR-0005 Rule 5 preserved; ODR-0019 Rule 1 preserved).

**Upstream-as-Organisation.** Accepted exactly as ODR-0020 Rule 2/C (Conformist relationship → 
`opda:consumesFrom` → `opda:Organisation`). This is the DDD Conformist/Anticorruption-Layer story: we
conform to HMLR's published model and reach it as an Agent, never as one of our own contexts. (I lost
the "upstream-in-scheme" vote in S020; I do not reopen it — `consumesFrom` is the right home.)

**Citations:** Evans 2003 (Shared Kernel — *deliberate*, jointly-governed; Conformist; Anti-Corruption
Layer; Context Map); Vernon 2013 ch. 3 (Shared Kernel governance cost); ODR-0020 Rules 2–4; ODR-0015
(Address home); ODR-0006/0007 (kernel role/lifecycle homes).

---

## Q3 — Missing-ontology creation & sequencing

**VOTE: FOR — execute the 935-leaf descriptive walk and the ~14 overlay-profile emitters as
*prerequisite supply*, and let *ownership placement proceed in parallel* while *usage derivation
blocks on the profiles*.**

Two different "missing" things, two different dependencies:

- **The 935-leaf descriptive walk** (ODR-0008 declare-once) emits the datatype properties onto
  `opda:Property`/`opda:LegalEstate` from the **data dictionary** (Claim A seam: dictionary-sourced,
  not overlay-sourced). This is **TBox definition** and is the bulk of the un-emitted ontology. It does
  **not** block on the profiles — the dictionary is the inventory. Placement-by-ownership
  (`definedInContext`) can be authored for these as they are emitted, because ownership is a Context-Map
  decision independent of any form.

- **The ~14 unwritten overlay-profile emitters** (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29…)
  are the **Published-Language constraint surfaces**. These are the *only* thing `servesContext`
  derivation depends on. ODR-0020 itself flags this: "the term→context map cannot be complete until
  those profile emitters land." So **usage-completeness blocks on the profiles; ownership-completeness
  does not.** That is the sequencing dependency the plan must state plainly.

**Does placement block on them?** *Partly, and the split tells you exactly which part.* Ownership
placement (Goal #2 proper) proceeds independently and immediately. Usage enrichment (`servesContext`)
fills in profile-by-profile and is **shipped dormant anyway** (ODR-0019 Rule 8 / ADR-0026), so its
incompleteness is not a release blocker — it is a backlog burn-down. This means **the council does not
have to finish 14 profile emitters before it can claim "every entity is placed"** — it has to finish
the *ownership authoring*, which is dictionary- and Context-Map-bound, not form-bound. That is a far
smaller, non-blocked critical path, and it is the honest reading of Goal #2.

**One caution I must surface (Karpathy "don't hide confusion"):** the descriptive walk is large
(935 annotated leaves) and ODR-0008 reserves deliberation for "genuinely ambiguous reconciliations."
*Ownership authoring should not become 935 individual adjudications.* The vast majority of descriptive
leaves are property-physical facts owned by **no industry context** — they describe the asset, not a
business function — so their honest `definedInContext` is **foundation/property module**, authored once
as a *default rule* ("descriptive property leaves default to `definedInContext` foundation unless a
context demonstrably authors the concept"), with per-term authoring reserved for the genuine
exceptions (e.g. a valuation concept owned by Surveying, a charge concept owned by Conveyancing). That
keeps placement tractable and honest rather than theatrical.

---

## Q4 — ODR/ADR scaffolding

**VOTE: FOR a *narrow amendment to ODR-0019 (Rule 8) + a revision of ADR-0026*, AGAINST a brand-new
ODR.** New records only where a domain fact genuinely changes.

Enumerated:

1. **Amend ODR-0019 Rule 8** (not a new ODR): split the gate. The polysemy-machinery gate (≥3
   attested collisions + named consumer) stays for scopeNotes/SKOS-XL/sense-registers. **Add an explicit
   carve-out:** recording a term's *home* via `opda:definedInContext` is **not** polysemy machinery and
   is **not** gated — it is ordinary Context-Map authoring, done as the descriptive walk emits terms.
   This is the minimal change that cures the Architect's Claim B inversion. *Rationale for amend-not-new:
   ODR-0019 already owns `definedInContext` and Rule 8; the fact "homes are authored, not gated" refines
   an existing rule rather than introducing a new domain commitment.*

2. **Amend ODR-0020 Rule 4** (light): add the **ownership-completeness checklist** of Q2 (every term
   resolves to industry-owned / kernel / upstream / scaffolding) and name the **kernel home convention**
   (kernel terms `definedInContext` their existing ODR-0006/0007/foundation home). This is a refinement
   of bucket-D and the `definedInContext` paragraph, not a new partition.

3. **Revise ADR-0026** (in place — it is already the emission ADR and is *written, not executed*): it
   currently emits the six-concept scheme + the dormant `servesContext` CONSTRUCT + the `profiles.py:250`
   fix. Add to its work-items: (a) emit authored `definedInContext` for owned terms as the descriptive
   walk lands; (b) the CI **total-cover** assertion from Q2; (c) the default-rule for descriptive leaves
   from Q3. No new ADR needed for the scheme itself.

4. **New ADR(s) for the supply work** — *yes, two, because these are large deterministic-emission builds
   with their own byte-identity baselines, exactly the kind ADR-0005 §G says lands "as fresh ADRs"*:
   - **ADR-00XX — Descriptive-layer walk emission** (the 935-leaf ODR-0008 execution: dictionary-sourced
     datatype properties + class promotions per Q4a + reconciliation register). This is the single
     biggest un-executed build and deserves its own record + CI baseline.
   - **ADR-00YY — Overlay-profile emitter completion** (the ~14 form profiles + their `overlaysContext`
     wiring per ADR-0026's `CONTEXT_OF` map). ADR-0026 already names these as "downstream work (their own
     ADR or the descriptive-layer backlog)" — so this is the record ADR-0026 anticipated.

5. **No new ODR.** Every ontological commitment here (servesContext derived; definedInContext authored;
   kernel vs incidental; upstream-as-Org) is already *latent* in ODR-0019/0020 — the work is to *finish*
   them, plus the two emission ADRs. Minting a fresh `kind: pattern` ODR would be ceremony over a
   decision already made (Karpathy "simplicity first").

---

## Q5 — Implementation plan (phases, dependencies, gates, emission order)

Critical-path insight: **ownership placement is NOT on the profile-emitter critical path.** Two tracks
run in parallel; only the usage track is gated by the 14 profiles.

```
PHASE 0 — Records (no emission)            gate: odr-review/adr lint green
  0.1 Amend ODR-0019 Rule 8 (definedInContext un-gated; polysemy gate retained)   [Q4.1]
  0.2 Amend ODR-0020 Rule 4 (ownership checklist + kernel-home convention)          [Q4.2]
  0.3 Write ADR-00XX (descriptive walk) + ADR-00YY (profile completion)             [Q4.4]
  0.4 Revise ADR-0026 (definedInContext emission + total-cover CI + default rule)    [Q4.3]

PHASE 1 — Scheme + bug fix (ADR-0026, already specified)   gate: byte-identity CI re-pinned
  1.1 emitters/contexts.py → opda-contexts.ttl (6 concepts, scheme, 3 predicates)
  1.2 fix profiles.py:250 (overlaysContext → industry concept; baspi5→EstateAgency)
  1.3 dormant servesContext CONSTRUCT in shapes.py  (ships off, ODR-0019 Rule 8)
      → DEPENDS-ON: nothing new.  This is the foundation both tracks build on.

PHASE 2A — OWNERSHIP track (NOT gated by profiles)   gate: CI total-cover assertion
  2A.1 descriptive walk emission (ADR-00XX): 935 dict-leaves → datatype props on
       opda:Property/LegalEstate; class promotions (Survey/EPC/Search/Valuation/
       Comparable already present); reconciliation register.
  2A.2 author definedInContext: default rule (descriptive→foundation) + per-term
       exceptions (Surveying owns valuation concepts; Conveyancing owns charge/search
       concepts; HMLR-sourced → consumesFrom opda:Organisation).
  2A.3 kernel homes: Address/UPRN → foundation; Participant family → ODR-0006 home;
       lifecycle terms → ODR-0007 home.
  2A.4 CI: assert TOTAL cover — every opda: term has definedInContext OR consumesFrom
       OR is on the scaffolding allow-list.  ← THIS is the Goal-#2 "every entity placed" gate.

PHASE 2B — USAGE track (gated by profiles; can lag)   gate: per-profile round-trip
  2B.1 overlay-profile emitters (ADR-00YY): ta6/7/10, lpe1, fme1, piq, rds, oc1,
       llc1, con29… each wired overlaysContext → its industry concept (CONTEXT_OF).
  2B.2 servesContext fills in mechanically as each profile lands (derivation stays
       dormant until ODR-0019 Rule 8 polysemy/consumer gate opens — usage incomplete
       is NOT a release blocker).
  2B.3 MVP gate already exists: BASPI5 round-trip (ODR-0010 §Q7) — keep as the proof
       that the profile→servesContext path works on one context before burning down 14.

DEPENDENCIES
  Phase 0 → everything (records first).
  Phase 1 → 2A and 2B (scheme + predicates + bug fix are the shared substrate).
  2A independent of 2B  ← the load-bearing claim: placement-by-ownership does not wait
                          on 14 profile emitters.
  2B internally serial-ish per profile; burns down as a backlog.

EMISSION ORDER:  opda-contexts.ttl  →  baspi5.ttl (re-pointed)  →  descriptive TTL(s)
                 + definedInContext  →  remaining profiles (each re-pointed).

GATES:  byte-identity CI (ADR-0007 §6a) on every emission;  total-cover CI (new) is the
        "every entity placed" gate;  BASPI5 round-trip (ODR-0010 §Q7) is the usage-path MVP;
        derivation stays dormant (ODR-0019 Rule 8) until a named term-grain consumer.
```

**Must-have plan elements (the three I will not concede):**

1. **Two predicates, two authorities** — `servesContext` DERIVED (accept ODR-0020), `definedInContext`
   AUTHORED and **un-gated** (amend ODR-0019 Rule 8). This is the cure for Claim B's inversion and the
   only way Goal #2 ("place every entity") is even expressible.

2. **Ownership-completeness as the placement gate, with kernel made legible** — a CI total-cover
   assertion (industry-owned / kernel / upstream / scaffolding), where deliberate **Shared Kernel** is
   `definedInContext` its existing foundation/ODR-0006/0007 home rather than indistinguishable silence.
   Distinguishing deliberate kernel from incidental co-occurrence is the DDD heart of placement.

3. **Decouple the critical path** — ownership placement (Phase 2A) does **not** block on the 14 profile
   emitters (Phase 2B). Usage derivation is dormant and incremental; the council can truthfully claim
   "every entity placed" via the data-dictionary + Context-Map, without first finishing every form.

**Citations (plan):** Evans 2003 (Context Map authored; Shared Kernel deliberate; Conformist; Published
Language unowned); Vernon 2013 ch. 2–3; ODR-0008 (declare-once, dictionary-sourced); ODR-0010 §Q7
(BASPI5 round-trip MVP); ODR-0019 Rule 5 & 8; ODR-0020 Rules 2–5; ADR-0026 (scheme emission +
`profiles.py:250` + dormant CONSTRUCT); ADR-0007 §6a (byte-identity); ADR-0005 §G (new work as fresh
ADRs).

---

## Where I expect to be pushed (and my held line)

- **Davis** will say authored ownership *rots* and forms are the falsifiable artefact. **Conceded for
  `servesContext`; held for `definedInContext`.** A form cannot falsify *ownership* — it never encoded
  it. The anti-rot defence is the **total-cover CI** (an un-homed new term fails the build) + the
  **default rule** (descriptive→foundation), so authoring is a one-line rule plus a short exception list,
  not 935 hand-edits. If Davis shows a *named consumer* that only needs usage, I will agree ownership
  authoring can ship behind the same dormancy flag as derivation — but it must be *authorable now*, not
  gated behind homonyms.

- **Allemang** will say derive-don't-declare, full stop. **Agreed for the half that is derivable.** But
  ownership is *not* in the profiles to be derived — there is no `overlaysContext` edge that says "HMLR
  owns RegisteredTitle" or "this is shared kernel." Declaring the *home* is not the same sin as declaring
  *usage*; it is recording a decision the generator cannot reconstruct. I will move to "derive everything
  the profiles actually contain; author only the irreducible Context-Map residue."

- **Guizzardi** I expect to agree: a bounded context is anti-rigid/perspectival (SKOS facet, never a
  Kind) — fully consistent with `definedInContext` being an `owl:AnnotationProperty` (membership, not
  typing), which ODR-0019 Rule 5 already fixes.
