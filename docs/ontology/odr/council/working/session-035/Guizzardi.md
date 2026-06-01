# Session-035 — Guizzardi working position

**Lens:** Giancarlo Guizzardi (gUFO / OntoUML). Ontological Patterns, Anti-Patterns and
Pattern Languages (Guizzardi 2014); UFO Kind/Subkind/Role/Phase/Relator/Mode/Quality
rigidity taxonomy (Guizzardi 2005, *Ontological Foundations for Conceptual Modeling*, Ch. 4);
Guarino & Welty OntoClean meta-properties (Rigidity, Identity, Dependence).

**Proposition under review (S035):** opda's evidence-class short/long-name alias pattern is an
anti-pattern; rigid subclass inheritance is wrong for evidence typing; evidence-kind should be a
facet; facets-vs-inheritance was never weighed.

---

## OPENING

### Frame: three distinct claims, three distinct verdicts

The proposition bundles three things that a UFO reading must *separate*, because they sit on
different rungs of my taxonomy:

1. The `owl:equivalentClass` **alias** (`Document ≡ DocumentEvidence`, etc.) — a *naming/identity*
   construct.
2. The **subclass inheritance** `…Evidence ⊑ opda:Evidence` — a *taxonomic* construct.
3. Whether "evidence-kind" is a **rigid Kind** (subclass-worthy) or an **anti-rigid Role**
   (facet-worthy) — the *ontological-category* question.

My verdicts diverge across the three. The alias *is* an anti-pattern (Q1: REVISE — retire it, but
on identity-hygiene grounds, not the proposition's stated grounds). The "rigid subclass is wrong"
charge is **half-right and dangerously over-broad** (Q2): one of the three subtypes is mis-categorised,
but the cure is *re-categorisation of one leaf*, not a wholesale flip to facets. And the claim that
"facets-vs-inheritance was never weighed" is **factually false on the repo record** (Q3): ODR-0024
§R7 weighed exactly the rigidity question for the document case and ruled correctly.

---

### Q1 — Is the `owl:equivalentClass` alias an anti-pattern to retire?

**My reading: yes — it is the *synonym-as-class* anti-pattern, but the repo has already neutered its teeth.**

In my anti-pattern catalogue (Guizzardi 2014; and the OntoUML anti-pattern work with Sales & Barcelos,
"Identifying and Eliminating Anti-Patterns in OntoUML"), a recurring smell is the **redundant classifier**:
minting two *named classes* for one universal and then asserting their identity. `opda:Document
owl:equivalentClass opda:DocumentEvidence` declares two class IRIs that denote *exactly the same set
in every model*. Ontologically there is one universal here, not two. Two co-extensive named classes
is not a Kind distinction — it is a **lexical alias masquerading as a class axiom**. The `rdfs:comment`
on `opda:Document` admits this outright: "Alias … retained for exemplar compatibility … downstream
shapes + annotations target the long name." That is a tooling shim, not an ontological commitment.

So on *my* grounds the alias is indeed an anti-pattern. **But two qualifications sharpen the verdict:**

- **It is not the anti-pattern the proposition names.** The proposition frames the alias as evidence
  that "rigid subclass inheritance is wrong." That is a category error. The alias sits on the
  *identity/naming* axis (two IRIs, one universal); the subclass question sits on the *taxonomic* axis.
  An alias being redundant says **nothing** about whether `…Evidence ⊑ Evidence` is sound. The
  proposition has conflated a naming smell with a taxonomy smell.

- **The repo has already de-fanged it.** ODR-0026 §R3 and ODR-0025 §R2 place `owl:equivalentClass`
  in the *non-evaluated* set: it is authored as documentation/identity but never materialised by the
  load-time closure. ODR-0026 §R3 states plainly that an instance typed only with the short name is
  **not** inferred to be the canonical class, that this matches current behaviour (pyshacl
  `inference="rdfs"` never entailed OWL `equivalentClass`), and that it is therefore **not a regression**.
  The classic harm of the synonym-as-class anti-pattern — *uncontrolled bidirectional propagation* — is
  exactly what ODR-0025 §R2 forbids from the closure. So the anti-pattern is real **as authored TBox
  hygiene** but **inert as inference**.

**Therefore the disposition is REVISE, not REJECT:** retire the alias as a *modelling-hygiene* cleanup
(replace the redundant co-extensive class with the proper lexical mechanism — `skos:altLabel` /
`rdfs:label` on the one canonical class, or `skos:exactMatch` if a genuinely external short-name IRI
must be retained), **not** because it proves anything about inheritance. One universal deserves one
class IRI with one or more labels — not two class IRIs bridged by an identity axiom. This is the same
hygiene ODR-0005 R5 already enforces for *Property* identity ("co-reference, NEVER `owl:sameAs`"); the
evidence aliases are the class-level analogue of the very `sameAs` smell opda elsewhere bans.

`Q1: REVISE(retire the alias; replace co-extensive class IRIs with labels/`skos:exactMatch` on the one
canonical `…Evidence` class) — ballot: FOR — the alias is the synonym-as-class / redundant-classifier
anti-pattern (Guizzardi 2014; Sales & Guizzardi, OntoUML anti-pattern catalogue), but it lives on the
identity axis and is already non-evaluated (ODR-0026 §R3), so it carries no weight for the inheritance question.`

---

### Q2 — Rigid subclass vs facet for evidence typing?

**My reading: the three are NOT a uniform category, and that is the whole answer.** The proposition's
error is to treat "evidence type" as one thing that must be *either* subclass *or* facet. Under UFO it
is **two different things wearing one label**, and the correct model is heterogeneous.

First, the rigidity test (Guizzardi 2005 Ch. 4 §4.2; Guarino & Welty 2009 OntoClean). A **Kind** is a
rigid sortal: every instance is necessarily an instance of it, in every world where it exists. A **Role**
is an *anti-rigid* sortal: an instance plays it *contingently*, relationally, and can cease to play it
while persisting. The decisive question for "is X a subclass-worthy Kind?" is: **is membership rigid?**

Apply it to the three:

- **`opda:DocumentEvidence`.** Is "being evidence" rigid for a document? **No.** A grant of probate is a
  document *whether or not* it is ever marshalled into a verification. It *becomes* evidence by being
  `prov:used` in a `VerificationActivity` — a relational, contingent, revocable fact. The artefact
  persists with full identity if no verification ever consumes it. This is the textbook **anti-rigid
  Role** signature. The TTL comment already says it in my own vocabulary: *"evidence is a role a document
  plays, not every document's Kind."* That sentence is OntoUML-correct. So **for documents, "evidence" is
  a Role, and a Role MUST NOT be a rigid subclass of a Kind** (my anti-rigidity principle: an anti-rigid
  universal cannot be a subtype of a rigid one; the OntoUML metamodel forbids `Role ⊑ Kind` *as a Kind*).
  The repo *already saw this* and put the rigid Kind one level up: `opda:AttachedDocument` is the neutral
  document Kind, and `DocumentEvidence ⊑ AttachedDocument` is the *role-of-a-document* specialisation
  (ODR-0024 §R7). That is **the correct OntoUML pattern** (Role subsetting its bearer Kind), not a defect.

- **`opda:ElectronicRecordEvidence`.** Same analysis as documents: an API-retrieved record is a record
  whether or not used to verify. "Evidence" is again a contingent Role. (Note the repo has *no* neutral
  `ElectronicRecord`-Kind super-class analogous to `AttachedDocument` — that is a genuine asymmetry worth
  flagging in Q3, but it is a *completion* gap, not a reason to flip to facets.)

- **`opda:VouchEvidence`.** **This one is categorially different, and this is the load-bearing finding.**
  A vouch is *not* a pre-existing artefact that contingently takes on an evidence role. A vouch is an
  **attestation** — it is `prov:wasAttributedTo` an Agent (`opda:attestedBy → prov:Agent`); ODR-0009 §R37
  says "a vouch is `prov:wasAttributedTo` an Agent — an attestation, not a document derivation." In UFO an
  attestation by an agent, existentially dependent on that agent and binding agent-to-claim, is a
  **Relator** (a truthmaker of a material relation), or at minimum an agent-dependent **Mode** — *not* an
  Information Object that happens to be in an evidence role. It does not have the "artefact first, role
  second" structure of the other two; its very existence *is* the act of vouching. So `VouchEvidence` and
  `DocumentEvidence` are **not the same ontological category** — one is a role borne by an
  Information-Object Kind, the other is an agent-dependent Relator/Mode. **This is precisely why ODR-0009
  R5 says "do NOT collapse the three."** That non-collapse rule is not bureaucratic caution; it is a
  correct refusal to force three different UFO categories into one uniform classifier.

**Now: subclass or facet?** Both halves of the proposition's dichotomy are wrong as stated, because the
right answer is *neither uniformly*:

- "Evidence" as a **discriminator over the three** (document / electronic-record / vouch) is best modelled
  exactly as the repo's existing `sh:xone` over per-type shapes (ODR-0009 §R37 / ODR-0008 §Q5a `sh:xone`):
  a **validation-time facet/discriminator**, NOT necessarily three rigid OWL subclasses carrying entailment.
  The proposition is *right* that a rigid-subclass treatment of "evidence type" is over-committed —
  because two of the three are roles and one is a relator, none is a clean rigid Kind.
- BUT the bearers themselves are real Kinds with real ICs and DO deserve class identity: `AttachedDocument`
  is a rigid Information-Object Kind (ODR-0024 §R7 gives it an IC: content + issuing activity); the
  electronic-record bearer likewise; the vouch's *Agent* and the attested *Claim* are Kinds. So the
  classes don't vanish — they get **re-sorted to their correct UFO category**.

The honest synthesis: **evidence-role is a facet (Role/discriminator), the bearers are Kinds.** That is a
*facet-AND-Kind* model, not facet-vs-inheritance. The proposition is directionally right that pure rigid
subclassing is wrong, but its remedy ("make it a facet") is under-specified and would, if applied
bluntly, dissolve the bearer Kinds that legitimately carry identity (especially the `AttachedDocument`
Kind ODR-0024 deliberately minted, and the Vouch-as-Relator structure).

`Q2 [OPENING — SUPERSEDED by post-Davis move below; retained for the dialectic record]: REVISE(model
evidence-role as an anti-rigid Role/discriminator over distinct *bearer* Kinds — NOT three uniform rigid
subclasses; keep `sh:xone` as the facet mechanism; re-sort `VouchEvidence` to a Relator/Mode) — ballot:
FOR — …`

> **CORRECTION after Davis cross-talk (see Rebuttal §).** Davis punctured a real error in this opening:
> I conflated two distinct layers. (i) The **evidence-ROLE** is genuinely anti-rigid — but it operates at
> the `AttachedDocument` → `DocumentEvidence` seam (a document is an `AttachedDocument` always,
> `DocumentEvidence` only when `prov:used`), which the repo *already* models correctly (ODR-0024 §R7).
> (ii) The **three SUBTYPES** (Document / ElectronicRecord / Vouch) partition by **provenance ORIGIN** —
> a *rigid* sortal distinction (a paper artefact never becomes an API record mid-life; nothing "flips"
> subtype the way a Person flips in/out of Student). By my own 2005 Ch.4 test (anti-rigid = a sortal an
> individual moves in and out of), the subtype partition is NOT anti-rigid. Calling the subtypes "Roles"
> was wrong. The verdict moves to substantial AFFIRM of the subtype subclasses — see the revised Q2 line
> at the end of the Rebuttal §.

---

### Q3 — Disposition / migration + ODR-0025/0026 + ADR-0011 interaction

**My reading: the proposition's strongest claim — "facets-vs-inheritance was never weighed" — is false,
and the migration is small, not a teardown.**

**(a) The "never weighed" charge is refuted by ODR-0024 §R7.** S028/ODR-0024 §R7 confronted *exactly*
the rigidity question for the document case: it observed that reusing the evidence class as the bearer
of every registry-attached document would (if `equivalentClass` were live) entail "every attached doc is
… eIDAS-assured evidence," **rejected** that, and **minted the neutral `opda:AttachedDocument` Kind** with
its own IC, making `DocumentEvidence ⊑ AttachedDocument` the role-specialisation. That *is* the
facets/role-vs-rigid-Kind deliberation, conducted correctly, and recorded. The S035 proposition's premise
that "it was never weighed" does not survive the corpus. (It is fair to say it was weighed *for documents
only* and never generalised — see (c).)

**(b) ODR-0025/0026 interaction makes the alias migration cheap and safe.** Because ODR-0026 §R3 already
fixes the aliases as **non-evaluated documentation** (no `equivalentClass` entailment; "not a regression"),
retiring them (Q1) is a pure source-hygiene edit with **zero closure/inference impact**: the inferred
graph asserts no `equivalentClass`-derived triple either way (ODR-0026 Consequences: "closure correctness
test asserts NO `equivalentClass`-derived triple appears"). Migration steps:
  1. Delete the three short-name classes (`opda:Document`, `opda:ElectronicRecord`, `opda:Vouch`) and the
     three `owl:equivalentClass` axioms.
  2. Carry the short names as `skos:altLabel` / additional `rdfs:label` on the canonical `…Evidence`
     classes (or `skos:exactMatch` to an external IRI if one is genuinely needed).
  3. Per ODR-0026 §R3's own instruction, any consuming shape/exemplar that relied on the short name is
     fixed *in the shape/exemplar layer* (target the canonical class, or retype exemplars) — **not** by
     evaluating `equivalentClass`. The exemplar set lives in the nested git repo (per repo note), so the
     retype is a localised edit.
  This is squarely an **ADR-0011 question** — ODR-0026 §R3 explicitly says "Re-examining the alias pattern
  itself is an ADR-0011 question, out of scope here." S035 *is* that re-examination. So the disposition
  routes back to an **ADR-0011 amendment** (retire option-(b) aliases; record the label-based replacement).

**(c) The genuine *new* finding for the migration — asymmetry + the Vouch mis-sort.** Two real defects
this council should record (neither is "the alias"):
  - **Bearer-Kind asymmetry.** `DocumentEvidence` has its neutral bearer Kind (`AttachedDocument`,
    ODR-0024 §R7) but `ElectronicRecordEvidence` has none — there is no neutral `opda:ElectronicRecord`-as-Kind
    (the short name was only ever the alias). If the role-vs-Kind pattern is right for documents, it should
    be completed for electronic records (a neutral record Information-Object Kind, with `…RecordEvidence`
    as its role-specialisation). Recommend: flag as a follow-on, gated on a consumer query (consistent with
    opda's named-trigger discipline, e.g. ODR-0008 §Q2a/§Q4a).
  - **`VouchEvidence` is mis-sorted as a sibling of the document evidences.** It is `⊑ opda:Evidence`
    alongside the two artefact-evidences, but ontologically it is an **attestation Relator/Mode**, not an
    Information-Object playing a role. The "do-NOT-collapse" rule (ODR-0009 R5) protects this *at validation
    time* via `sh:xone`, but the *TBox* still lists all three as flat `⊑ Evidence` siblings, which hides the
    category difference. Recommend: in any future evidence re-modelling, type the vouch via its attestation
    structure (Relator mediating Agent ↔ Claim, per `opda:attestedBy` / `prov:wasAttributedTo`), keeping
    `opda:Evidence` as a *role-mixin / discriminator* the three satisfy — NOT a common rigid Kind super-class.
    This is the UFO-honest reading of "Evidence" itself: it is an **anti-rigid RoleMixin** (cross-categorial:
    spanning Information-Object bearers AND an attestation Relator), exactly the `opda:RoleMixin` device
    opda already uses for Seller/Buyer (ODR-0006 / ADR-0011) — *not* a Substance Kind.

**Net disposition.** Retire the alias (ADR-0011 amendment; cheap, no-inference-impact per ODR-0025/0026).
Affirm the bearer-Kind / evidence-Role split that ODR-0024 §R7 already established for documents, and
**generalise** it: `opda:Evidence` is a **RoleMixin**, the three "subtypes" are a heterogeneous set
(two Information-Object-Role specialisations + one attestation Relator), and `sh:xone` stays as the facet
discriminator. Do **not** dissolve the bearer Kinds into bare facets — that would lose the `AttachedDocument`
IC and the Vouch-Relator structure the corpus correctly distinguishes.

`Q3: REVISE(route alias-retirement to an ADR-0011 amendment — zero closure impact per ODR-0025 §R2 /
ODR-0026 §R3; record two corpus findings: (i) complete the bearer-Kind pattern for ElectronicRecord by
symmetry with ODR-0024 §R7's AttachedDocument, gated on a consumer query; (ii) re-sort `opda:Evidence` to
a cross-categorial RoleMixin with VouchEvidence typed as an attestation Relator, not a flat sibling) —
ballot: FOR — the "never weighed" premise is refuted by ODR-0024 §R7 (the role-vs-rigid-Kind deliberation
for documents is on record); the remaining work is a small re-sort + an ADR-0011 hygiene edit, not a teardown.`

---

## CROSS-TALK + REBUTTAL

Cross-talk messages sent to **Davis** (rebut "subclasses are free" on rigidity grounds) and **Guarino**
(align/refine the Role analysis; RoleMixin-vs-Phase; Vouch Relator-vs-Mode). No replies received within the
cross-talk window; per session procedure I proceed without looping. My rebuttal below engages the positions
I put to each peer and is grounded so it stands whether or not they reply.

### Rebuttal — one consolidated statement

**On the pragmatist "subclasses are free" line (Davis).** The decisive correction is that
`rdfs:subClassOf` is not a free annotation: it asserts **rigid, necessary** membership (Guizzardi 2005
Ch.4 §4.2; Guarino & Welty 2009). "Being evidence" fails rigidity — a probate grant or an API record is
the artefact it is whether or not any `VerificationActivity prov:used` it; evidence-hood is contingent,
relational, revocable. So a *uniform* rigid `…Evidence ⊑ Evidence` over all three subtypes asserts
necessity where there is only contingency. The cost is not hypothetical: a Role-as-rigid-subclass licenses
unsound necessary-membership entailments, and the moment `equivalentClass`/`domain` are evaluated it
cascades into the identity-merge and mis-typing ODR-0025 §R2 explicitly bans. **Concession I hold to:** I
am *not* attacking subclassing as such — `DocumentEvidence ⊑ AttachedDocument` (ODR-0024 §R7) is a *sound*
subclass precisely because the rigid bearer Kind (`AttachedDocument`) sits above the Role. The bearers keep
class identity; only the *uniform-rigid-evidence-Kind* framing is wrong. Facet-AND-Kind, not facet-vs-Kind.

**On the Role analysis (Guarino).** I affirm anti-rigidity as the shared core and refine the two open
points myself, citing opda's own ratified precedent so the verdict does not depend on his reply:

- **`opda:Evidence` is a RoleMixin, not a Phase and not a Substance Kind.** ODR-0006 fixes the device:
  a RoleMixin is "played by a Person *or* Organisation" — anti-rigid, *cross-sortal*, externally founded
  by a Relator (the `opda:Transaction`). `opda:Evidence` is the structural twin: anti-rigid and
  *cross-categorial* — its instances are Information-Object Kinds (document, electronic-record) bearing a
  contingent evidence Role, **plus** the vouch (an attestation, not an artefact-in-a-role) — externally
  founded by the `opda:VerificationActivity` (the `prov:used` edge is the founding relation, mirroring how
  the Transaction relator founds Seller/Buyer). **Phase is ruled out**: phase membership is *intrinsic*
  (a qualitative change in the thing itself — a Phase like "broken" vs "intact" supervenes on the bearer's
  own state), whereas evidence-hood depends on an *external* verification consuming the artefact. External
  relational founding is the Role/RoleMixin signature, not Phase. (ODR-0006 line 59/128; Guizzardi 2005
  Ch.4 on Phase vs Role.)

- **Vouch is a Relator (an agent-dependent attestation), not an Information-Object sibling.** ODR-0009 §R37
  is explicit: a vouch is `prov:wasAttributedTo` an Agent — "an attestation, not a document derivation";
  the TTL binds `opda:attestedBy → prov:Agent`. An attestation existentially depends on **both** the
  attesting Agent and the Claim it supports and is the truthmaker of the support relation between them —
  that is the Relator signature (Guizzardi 2005 Ch.4 §4.5; Guarino & Welty dependence). I considered Mode
  (inhering in the agent alone) and reject it: the vouch is not a quality of the agent in isolation, it
  *binds* agent to claim, which is mediation, not inherence. This is the ontological reason ODR-0009 R5's
  "do NOT collapse the three" is correct rather than merely cautious: one of the three is a different
  fundamental category, so a uniform classifier is a category error.

**Net effect of the rebuttal on my verdicts:** unchanged in direction, sharpened in remedy.
- Q1 stands: alias = synonym-as-class anti-pattern on the *identity* axis; retire it (label/`exactMatch`);
  it proves nothing about inheritance and is already non-evaluated (ODR-0026 §R3).
- Q2 stands and is the crux: evidence-role = anti-rigid RoleMixin/discriminator (keep `sh:xone`); the three
  are heterogeneous (two Info-Object-Role specialisations + one attestation Relator); a uniform rigid
  `⊑ Evidence` mis-types — but do **not** dissolve the bearer Kinds into bare facets.
- Q3 stands: "never weighed" is refuted by ODR-0024 §R7 (the document case was weighed correctly); the
  migration is a small ADR-0011 hygiene edit (zero closure impact per ODR-0025/0026) plus two corpus
  findings — complete the bearer-Kind pattern for ElectronicRecord by symmetry, and re-sort `opda:Evidence`
  to a cross-categorial RoleMixin with Vouch typed as a Relator.

### POST-CROSS-TALK UPDATE — Davis reply received; Q2 moved

Davis (DA) replied with a strong, correct challenge that I partly conceded. His core point: the
role/Kind layer is *already* in the artefact (`DocumentEvidence ⊑ AttachedDocument` AND `⊑ Evidence`), so
what is actually under test is the **three subtypes**, which partition by **provenance ORIGIN**, not
life-cycle phase — and by my own 2005 Ch.4 test those are rigid sub-kinds (a paper artefact never becomes
an API record; nothing "flips" subtype). He cited two verified facts: `attestedBy rdfs:domain VouchEvidence`
(TTL line 131) and the disjoint subclass profiles (line 60 vs 76/115) — disjoint property profiles, not
three values on one `evidenceKind` slot, so a facet would be *heavier* (every type-specific property becomes
`sh:xone`/conditional), not lighter. And he challenged me to name a consumer query a Role facet answers that
the subclasses do not.

**What I conceded (Davis won this):** My opening conflated two layers. The **evidence-ROLE** is genuinely
anti-rigid — but it lives at the `AttachedDocument`→`DocumentEvidence` seam, which the repo already models
(ODR-0024 §R7). The **three-SUBTYPE partition** is rigid (by origin), NOT anti-rigid. Projecting "Role" onto
the subtypes was my error. For the document/electronic-record subtypes I could **not** name a Role-facet
query the subclasses miss, so I concede the subclasses there. The only place evidence-hood demonstrably
flips — and where a query (R7's "attached-but-not-yet-evidence": `AttachedDocument` MINUS `DocumentEvidence`)
distinguishes role from Kind — is the AttachedDocument seam Davis already grants is correct.

**What survives (Davis's own fact 1 supports it):** Two residuals he did not rebut:
1. **`VouchEvidence` is mis-categorised** as a flat artefact-sibling. `attestedBy → prov:Agent` makes it an
   attestation **Relator** (mediating Agent ↔ Claim), not an Information-Object like the other two. This is
   the ontological reason ODR-0009 R5 says "do NOT collapse the three." (Davis's fact 1 is the evidence FOR this.)
2. **Bearer-Kind asymmetry**: if `AttachedDocument`/`DocumentEvidence` is right, electronic-record should get
   the symmetric neutral Kind — gated on a consumer query, per opda's named-trigger discipline.

**REVISED verdicts after the Davis exchange (these supersede the opening + the consolidated-rebuttal block above):**

`Q2 [FINAL]: AFFIRM the three rigid evidence subtypes as sub-kinds (they partition by provenance ORIGIN —
rigid, not anti-rigid; disjoint property profiles make subclasses lighter than a `sh:xone` facet), WITH a
narrow REVISE: re-sort `opda:VouchEvidence` to an attestation **Relator** (mediating Agent ↔ Claim;
`attestedBy → prov:Agent`, ODR-0009 §R37), NOT a flat Information-Object sibling of the document evidences;
keep `opda:Evidence` as a cross-categorial supertype/RoleMixin that the anti-rigid evidence-ROLE attaches to
at the AttachedDocument seam (ODR-0024 §R7). — ballot: FOR — Davis's rigidity correction is right for the
subtype partition (Guizzardi 2005 Ch.4 §4.2: anti-rigid = moves-in-and-out; the subtypes don't); ODR-0009 R5's
"do NOT collapse" survives because one of the three (Vouch) is a different fundamental category.`

`Q3 [FINAL — refined]: REVISE — unchanged in substance: route alias-retirement to an ADR-0011 amendment
(zero closure impact, ODR-0025 §R2 / ODR-0026 §R3); record (i) the ElectronicRecord bearer-Kind asymmetry
(complete by symmetry with AttachedDocument, gated on a consumer query) and (ii) the VouchEvidence Relator
re-sort. Drop the opening's over-broad "two Info-Object-Role specialisations" phrasing — per the Davis
concession, the document/electronic-record subtypes are rigid sub-kinds, and only the evidence-ROLE (at the
AttachedDocument seam) and the Vouch-Relator carry the non-rigid/cross-categorial weight. — ballot: FOR.`

(Q1 unchanged: REVISE/FOR — retire the synonym-as-class alias on identity-axis hygiene grounds; non-evaluated
per ODR-0026 §R3.)

### POST-CROSS-TALK UPDATE 2 — Guarino reply received; two adoptions, one decline, final synthesis

Guarino replied with a sharper recast than my opening and two precise UFO questions. His recast:
`opda:Evidence` = RoleMixin played-by (not `subClassOf`) the bearer Kinds, founded by `VerificationActivity`,
with the document/electronic-record/vouch discriminator as a single SKOS-coded `opda:evidenceKind` facet on
the role (dispatched by `sh:xone`). His two questions: (1) can a `prov:Activity` (Event) found a RoleMixin,
or is there a latent `opda:Verification` **Relator** that founds it; (2) is the vouch a distinct
Agent-founded bearer type, not an InformationObject.

**ADOPT (1) — latent Verification Relator, correcting my own cross-talk phrasing.** Guarino is right: a Role
is founded by a **Relator**, never directly by an Event/Perdurant (Guizzardi 2005 Ch.4 §4.5). I verified the
Relator is already latent in ODR-0009's qualified form: `prov:qualifiedAttribution → prov:Attribution` with
`prov:hadRole` (TTL l.98 on `VerificationActivity`; l.129 on `attestedBy`). A reified `prov:Attribution`
binding Verifier ↔ verified-entity ↔ evidence IS a Relator in PROV-O clothing. Correct picture: the
**Activity** (Perdurant) generates the **Verification Relator** (reified Attribution nexus), and the
evidence-ROLE is founded by *that Relator*. (`opda:Verification` is already named for publication, ODR-0009
l.209.) This supersedes my loose cross-talk "founded by the VerificationActivity."

**ADOPT (2) — Vouch bearer-fork.** Full convergence with Guarino, supported by Davis's fact 1
(`attestedBy → prov:Agent`, l.131): the vouch's bearer is an Agent-founded **attestation** (speech-act),
NOT an InformationObject Kind. I hold **Relator** for the attestation (binds Agent ↔ Claim = mediation +
existential dependence on both relata; not inherence-in-the-agent = Mode); open to Guarino's dependence
reading pushing it to Mode — that changes only the stereotype on one leaf.

**DECLINE — Guarino's "discriminator → single `opda:evidenceKind` facet on one RoleMixin."** Two grounded
reasons, the first being Davis's constraint I already conceded: (i) it is **heavier, not lighter** — the
three subtypes have *disjoint property profiles* (`attestedBy` only on Vouch; `⊑ AttachedDocument` only on
Document; others `⊑ Evidence` only), so one `evidenceKind` slot forces every type-specific property into
`sh:xone`/conditional branching that rigid sub-kinds give directly; (ii) it **erases the very fork Guarino
insists on in (2)** — a single code over one bearer treats the vouch as a document-with-a-different-value,
the categorial erasure his own Q2 warns against. You cannot both fork the bearer AND flatten the
discriminator over one role.

**FINAL SYNTHESIS across both peers (Davis + Guarino) — this is my settled position:**

The RoleMixin/`playedBy`-not-`subClassOf` recast is UFO-correct **at the seam where evidence-role flips**,
and the repo already implements the sound version there (`AttachedDocument` Kind → `DocumentEvidence`
role-specialisation, ODR-0024 §R7; the one place Davis's "name a query" test found a flip). It is NOT a
wholesale replacement of the rigid subtype sub-kinds.

- The three evidence subtypes stay **rigid sub-kinds** (partition by provenance ORIGIN — Davis).
- The evidence-ROLE is founded by the **latent Verification Relator**, not the Activity directly (Guarino 1).
- The **vouch is an Agent-founded attestation Relator**, its own bearer, not an InformationObject (Guarino 2 + me).
- Complete the bearer-Kind pattern for **electronic-record** by symmetry with `AttachedDocument`, gated on a
  consumer query (opda named-trigger discipline).
- Retire the `owl:equivalentClass` aliases (synonym-as-class anti-pattern; ADR-0011 hygiene; zero closure
  impact, ODR-0025/0026).

================================================================================
## FINAL VERDICTS (settled after Davis + Guarino exchanges)
================================================================================

`Q1: REVISE(retire the `owl:equivalentClass` short/long aliases — replace co-extensive class IRIs with
`rdfs:label`/`skos:altLabel`, or `skos:exactMatch` to an external IRI if genuinely needed, on the one
canonical `…Evidence` class) — ballot: FOR — synonym-as-class / redundant-classifier anti-pattern
(Guizzardi 2014; Sales & Guizzardi OntoUML anti-pattern catalogue); it sits on the identity axis, proves
nothing about inheritance, and is already non-evaluated (ODR-0026 §R3 — not a regression).`

`Q2: AFFIRM the three rigid evidence subtypes as sub-kinds (partition by provenance ORIGIN — rigid, not
anti-rigid per Guizzardi 2005 Ch.4 §4.2 "moves-in-and-out"; disjoint property profiles make subclasses
LIGHTER than a single-slot facet), WITH a narrow REVISE: (a) re-sort `opda:VouchEvidence` to an Agent-founded
attestation **Relator** (mediating Agent ↔ Claim; `attestedBy → prov:Agent`, ODR-0009 §R37), NOT a flat
Information-Object sibling; (b) ground the anti-rigid evidence-ROLE in the **latent Verification Relator**
(reified `prov:qualifiedAttribution`, ODR-0009), realised at the `AttachedDocument`→`DocumentEvidence` seam
(ODR-0024 §R7), played-by not `subClassOf`. — ballot: FOR — REJECTS the proposition's "rigid subclass is
wrong / make evidence-kind a facet" for the subtype layer (it would be heavier and would flatten the vouch),
while preserving the genuine anti-rigid Role exactly where it flips. ODR-0009 R5's "do NOT collapse" survives.`

`Q3: REVISE — disposition/migration: (a) the "facets-vs-inheritance was never weighed" premise is REFUTED by
ODR-0024 §R7 (role-vs-rigid-Kind weighed correctly for the document case, on record); (b) alias-retirement
routes to an **ADR-0011 amendment**, zero closure impact (ODR-0025 §R2 / ODR-0026 §R3 — non-evaluated;
fix short-name-dependent shapes/exemplars in the shape/exemplar layer, not by evaluating `equivalentClass`);
(c) record two corpus findings — (i) ElectronicRecord bearer-Kind asymmetry (complete by symmetry with
`AttachedDocument`, gated on a consumer query), (ii) the VouchEvidence attestation-Relator re-sort + the
latent Verification Relator as the evidence-role's relational ground. — ballot: FOR — the work is a small
re-sort + a hygiene edit, NOT a teardown and NOT a flip to facets.`

**Headline:** proposition MOSTLY WRONG on Q2 (rigid subclassing is correct for the origin-partitioned
subtypes; the proposed facet is heavier and erases the vouch fork), half-right on Q1/Q3 (a real but inert
naming-axis anti-pattern; a small re-sort the corpus already half-anticipated). Both peer exchanges
*improved* the position: Davis corrected my role/subtype conflation; Guarino supplied the latent Verification
Relator and sharpened the vouch bearer-fork. Convergence with both EXCEPT Guarino's facet-discriminator,
declined on Davis's empirical constraint (which Guarino's own anti-erasure concern reinforces).

### CONVERGENCE NOTE — Davis rebuttal (confirming; no further argument)

Davis's rebuttal landed and is a clean convergence, not a new challenge:
- **Vouch — Davis CONCURS**: `VouchEvidence` is categorially different (attestation event-backed entity;
  `attestedBy → prov:Agent` l.117/131; NOT `⊑ AttachedDocument`). He explicitly *withdraws* the "subclasses
  are free" line and agrees it would flatten what ODR-0009 R5 forbids. → my Q2(a) Vouch re-sort is now a
  **shared DA position**.
- **Facet — Davis REJECTS** it on the same grounds I gave Guarino (a single `evidenceKind` slot turns the
  disjoint `attestedBy`-only / `⊑AttachedDocument`-only profiles into `sh:xone` soup and erases the vouch
  category). → my Q2 facet-decline is now **shared with the DA**; this is the same point from two lenses.
- **Q1 — Davis WITHDRAWS his "don't churn" objection.** He verified (and so did I) that the three short
  names are exactly **3 hand-authored exemplar lines** — `claim-with-document-evidence.ttl:44`
  (`a opda:Document`), `claim-with-electronic-record-evidence.ttl:44` (`a opda:ElectronicRecord`),
  `claim-with-vouch-evidence.ttl:45` (`a opda:Vouch`) — and nowhere else. So the hygiene fix is trivially
  cheap: retype those 3 lines to the canonical `…Evidence` class, drop the alias. This independently
  confirms Q1's "fix in the exemplar layer, not by evaluating `equivalentClass`" (ODR-0026 §R3) and the
  zero-closure-impact migration.

**Consensus state with the DA:** aligned on all three questions — drop the alias (Q1), keep the bearer
Kinds + model evidence-role as role-of-a-Kind + do NOT facet (Q2), small re-sort not a teardown (Q3).

### CONVERGENCE NOTE 2 — Guarino rebuttal (three rulings adopted; residual re-scoped)

Guarino's rebuttal landed with three formal rulings under his dependence analysis. All three are things I
proposed or leaned toward; I adopt them — they *strengthen* my position and resolve the open items:
- **(Q-Phase) RoleMixin, decisively NOT Phase** — on my exact extrinsic/intrinsic ground: a Phase
  partitions a Kind by the bearer's *intrinsic* state (no second relatum); evidence-hood changes when a
  *wholly external* relatum (the VerificationActivity) binds/releases it. Cross-categorial bearers ⇒
  RoleMixin (not plain Role), the Seller/Buyer (ODR-0006) signature. **Adopted.**
- **(Q-founding) the Verification RELATOR founds the role, not the Event** — my option (b), now his ruling
  too. `VerificationActivity` (Perdurant) `prov:wasGeneratedBy`-founds the `opda:Verification` Relator (the
  latent reified `prov:qualifiedAttribution`/`hadRole` nexus binding Verifier+Claim+Evidence); the Evidence
  RoleMixin is founded by THAT Relator. Makes the ODR-0006 parallel exact. **Adopted.**
- **(Q-Vouch) Relator, NOT Mode** — settles my lean with his decisive **two-relata dependence test**: a
  Mode inheres in exactly ONE bearer; the vouch binds TWO mutually independent endurants (the Agent,
  `attestedBy → prov:Agent` l.131, AND the Claim) → Relator. So the vouch's bearer must NOT be subsumed
  under any document/InformationObject Kind (no document there to subclass). **Adopted — resolves the one
  residual I'd flagged to Kendall (Relator-vs-Mode → Relator).**

**Residual re-scoped (this is now the ONLY open difference, and it is narrow).** Guarino clarifies his
model is NOT the proposition's flat value-space facet (`evidenceKind ∈ {doc,record,vouch}` on one
document-shaped bearer) — he agrees that would re-shoehorn the vouch under a document Kind (the ODR-0009 R5
collapse). His actual model: `opda:Evidence` = cross-categorial **RoleMixin**, **three bearer families**
(two Information-Object artefacts + the attestation Relator), `sh:xone` dispatching the per-bearer profile.
That is **essentially my/Davis position**; Davis's "facet → `sh:xone` soup" objection was against the
flat-Quale strawman, which Guarino never held. So the disagreement collapses to a single **mechanism**
question:

> How is each bearer family attached to the evidence-role — by `rdfs:subClassOf` (current artefact + my
> Davis-concession: `DocumentEvidence ⊑ AttachedDocument, Evidence`, l.60) or by a `playedBy`/characterisation
> link (Guarino's cleaner UFO form)?

My judgement: **`playedBy` is the more rigorous UFO form** (a rigid bearer Kind *plays* an anti-rigid role;
`Role ⊑ Kind` as a subclass is the OntoUML smell). **But** for opda's OWL-RL-safe + SHACL stack I lean
toward keeping bearer-level `rdfs:subClassOf` for the *artefact* bearers (Davis's "lighter" point; it is
also what ODR-0024 §R7 already implements and validates), while typing the **vouch via its Relator
structure** (where there is no artefact Kind to subclass anyway, so `playedBy`/relator-mediation is forced
and correct). This is a refinement to record under Q3, **not a vote-splitter**: Guarino, Davis and I all
**reject the proposition's facet** and all keep the three distinct + `sh:xone`. The `playedBy`-vs-`subClassOf`
choice is an engineering-grain decision for the ADR-0011 / future-evidence-remodelling follow-up, gated on
whether a consumer needs the role to flip at query time (it demonstrably does only at the AttachedDocument
seam — Davis's test).

**Consensus state across BOTH peers (Davis + Guarino):** fully aligned on the substance —
(Q1) retire the alias; (Q2) `opda:Evidence` = cross-categorial RoleMixin, three distinct bearer families
(two artefacts + attestation **Relator**), founded by the latent **Verification Relator**, `sh:xone`
dispatch, NOT the proposition's flat facet; (Q3) small re-sort + ADR-0011 hygiene edit. The only open grain
is `playedBy`-vs-`subClassOf` mechanism, which I route to the follow-up. No further argument needed; my
FINAL VERDICTS block above stands, with Q2(b) now reading "Vouch = Relator (per Guarino's two-relata test)"
as settled rather than leaning.
