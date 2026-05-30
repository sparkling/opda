# Session 021 — Bounded-Context Implementation Plan — Guizzardi (UFO / OntoClean)

**Role:** Giancarlo Guizzardi. Lens: UFO (Unified Foundational Ontology) + OntoClean.
**Grounding (ODR-0001):** Guizzardi 2005, *Ontological Foundations for Structural Conceptual Models*, Ch. 4 (Substance Sortals/Kinds, Roles, Phases, Relators, Modes, Qualities; the anti-rigidity and identity-supplying meta-properties). Guarino & Welty, *OntoClean* (Identity, Rigidity, Unity, Dependence meta-properties; the level/typing constraints).

---

## Framing: the two relations are not one relation

The whole council turns on a distinction that UFO makes sharp and that the current architecture has blurred. There are **two different predicates** in play, and they answer **two different ontological questions**:

- **`opda:definedInContext`** — answers *"within which community of practice was this Universal individuated / given its identity criterion?"* This is a **quasi-identity / provenance-of-conception** relation. It is about the **home** of a Kind, Relator, Mode or Quality. It is authored, because individuation is an act of conceptual modelling, not a runtime event. It is (near-)functional: a Universal has **one** conceptual home, even when used everywhere.

- **`opda:servesContext`** — answers *"on which form-payloads, validated under which overlay profile, do instances of this Universal appear?"* This is a **usage / participation** relation. It is many-valued by nature (the same Universal is used in many perspectives). It is *correctly* derived, because it is a fact about SHACL profiles, which are the single source of truth for what a form requires.

These are categorially different. `definedInContext` is to `servesContext` as **a Kind's identity criterion** is to **a Role a thing plays**. Conflating them is precisely the OntoClean level-confusion: treating an anti-rigid, externally-dependent *usage* as if it supplied the *home*.

**The load-bearing observation for this whole council:** ODR-0019 §8 records **zero attested homonyms**, and ODR-0020 §4 says `definedInContext` "is hand-applied only for a genuine homonym (corpus attests zero today)." Put those together and you get the defect the Architect's Claim B is gesturing at: **`definedInContext` is currently emitted on ZERO terms, so a term's entire relationship to the context partition is, today, 100% the derived `servesContext` predicate.** The authored *home* relation exists in the ODRs but is materialised nowhere. The partition is, in practice, a projection of the SHACL forms.

That is not *wrong* as far as `servesContext` goes — usage really is derivable and really should be derived. It is wrong as a **completeness** claim. The architecture has the right derived predicate and is **missing the authored predicate almost entirely**. My plan elements below are about restoring the authored *home* relation to non-dormancy for the cases where it is genuinely needed — not about un-deriving usage.

---

## Q1 — Membership authority: authored / derived / hybrid?

### Stance

**HYBRID — but a *typed* hybrid, not a fallback hybrid.** The current ODR-0019/0020 framing presents authoring as the *exception* ("hand-author `dct:subject`/`definedInContext` ONLY for a term no profile references / a genuine homonym," ODR-0019 Rule 3, ODR-0020 Rule 4). That gets the relationship backwards by treating the two predicates as **rivals for one job**. They are not. They do **two different jobs** and BOTH are always-on:

- **`servesContext` is ALWAYS derived.** Never hand-authored. Davis is right that usage is the falsifiable signal and that hand-tagged usage rots. I concede this fully and without reservation — usage-membership belongs to the profiles.
- **`definedInContext` is ALWAYS authored, and is NOT gated to homonyms.** This is where I break from the ratified text. The *home* of a Universal is a modelling fact established the moment the Universal is minted; it does not wait for a homonym collision to become true. `opda:RegisteredTitle` was conceived inside the HMLR/Land-Registry community of practice whether or not its label ever collides with anything. `opda:floodRisk` was individuated inside Surveying/Search practice. Gating `definedInContext` to "≥3 homonym collisions" (ODR-0019 Rule 8) confuses **a disambiguation device** (which is genuinely YAGNI until collisions exist) with **a provenance-of-conception relation** (which is true from birth and is cheap to record).

So the honest answer to Q1 is: **authority is split by predicate, not by exception.** Usage → derived (Davis). Home → authored (me). The "hybrid" is not "derive, then patch the gaps by hand"; it is "two orthogonal relations, each with its proper authority."

### The category-slip test (the Architect's Claim A and B, adjudicated)

**Is "required by form F" a sound membership criterion?** For `servesContext`: **yes** — it is the *definition* of usage-membership and is exactly what that predicate should mean. For `definedInContext`: **no — it is a category slip.** "A payload validated under the Conveyancing overlay requires this term" tells you the term is *used* in conveyancing. It does **not** tell you the term was *individuated* there. `opda:Address` is required by ~10 profiles; it was individuated in none of them — it is a shared-kernel Substance Kind whose home is the foundation layer, not any single perspective. Deriving its "home" from "it's required by 10 forms" would assert ten homes, which is incoherent for a quasi-identity relation. **So the Architect's Claim B is half-right:** the *partition's home-assignment* belongs to the ontology and must not be derived from forms; but the *usage-overlay* of the partition is correctly derived from forms. The error in the ratified design is not that it derives — it is that it derives *the only predicate it materialises*, leaving home un-asserted.

**Is near-total reliance on the derived predicate an OntoClean level-confusion?** **Yes — today, in practice.** With `definedInContext` emitted on zero terms, the system's only operative answer to "which context does X belong to?" is `servesContext`, i.e. "which forms use it." That is using an anti-rigid, externally-dependent participation relation as the sole identity-locating relation. OntoClean's rigidity/identity constraints exist precisely to forbid this: a rigid Kind's home cannot be defined by the non-rigid contexts that happen to use it. The fix is not to demote `servesContext` — it is to **stand up `definedInContext` as a first-class authored relation** so the rigid home is recorded where it belongs.

### Vote

**Q1: FOR hybrid — typed by predicate.** `servesContext` always-derived (concede to Davis); `definedInContext` always-authored and un-gated from the homonym trigger (break from ODR-0019 Rule 8). One-line reason: *usage and home are different ontological relations; deriving usage is right, but home must be authored from birth, not patched in only when labels collide.*

### Plan elements (Q1)

- **PE-Q1.1 — Split the gate.** Amend ODR-0019 Rule 8 so the gate applies to **polysemy/sense-register machinery** (SKOS-XL, per-context `scopeNote` registries) — which is genuinely YAGNI at zero homonyms — but **NOT** to `definedInContext` itself. `definedInContext` becomes an always-emitted authored annotation recording a term's home context (or `opda:FoundationLayer` / no-home for shared-kernel terms — see Q2).
- **PE-Q1.2 — Keep `servesContext` derivation exactly as ODR-0020 Rule 5 specifies** (the SHACL-AF CONSTRUCT off `overlaysContext`+`requires`). No change. It ships dormant per Davis's consumer-gate; I do not contest that gate for the *derived* predicate.
- **PE-Q1.3 — A consistency check, not a derivation.** Once both predicates are materialised, add a (non-blocking) report: for every term, `definedInContext`'s context SHOULD appear among its `servesContext` set (a thing is normally used in the perspective that conceived it). A term defined-in-C-but-never-serving-C is a *flag for review* (dead home, or mis-authored), not an error. This is the OntoClean cross-check that the two relations are coherent without collapsing them into one.

---

## Q2 — Placement method & coverage (every entity → its context)

### Stance

Placement must be done **per UFO meta-category**, because the meta-category determines *which* of the two predicates carries the weight and whether the entity even has a single home. The ratified ODR-0020 four-bucket table (A single / B spanning / C upstream / D untagged) is a **usage**-classification — it routes `servesContext`/`consumesFrom`. It is correct as far as it goes but it is silent on **home**. I add the home dimension.

**The placement matrix (home × usage), by UFO category:**

| UFO meta-category | Examples | `definedInContext` (HOME — authored) | `servesContext` / other (USAGE — derived) |
|---|---|---|---|
| **Substance Kind — shared kernel** | `opda:Property`, `opda:Address`, `opda:LegalEstate`, `opda:RegisteredTitle`, `opda:Organisation` | **No single industry home** → either no `definedInContext`, or `definedInContext opda:FoundationLayer` if we mint a foundation pseudo-context (see PE-Q2.1). These are the kernel; their home is the shared model, not a perspective. | Many derived `servesContext` edges (Bucket B) — the multiplicity IS the sharing (ODR-0020 Rule 3). `RegisteredTitle` also `consumesFrom opda:HMLandRegistry` (Bucket C). |
| **Substance Kind — perspectival** | a Kind individuated inside one practice (e.g. `opda:Comparable` for Surveying, an estate-agency-specific listing Kind) | **One** authored `definedInContext` → its home context. This is the case the ratified design wrongly leaves blank. | Derived `servesContext` (often Bucket A, single-context, matching its home). |
| **Relator** | `opda:LegalCharge` (encumbrance over estate), `opda:Transaction` (the lifecycle relator, ODR-0007), a listing/agency relator (S007) | Authored `definedInContext` → the practice that defines the legal/relational bond. `LegalCharge` → MortgageLending/Conveyancing home (per ODR-0019 §4 worked table). The Transaction relator is **spanning by construction** → home = the lifecycle subdomain (ODR-0007), NOT an industry context → no industry `definedInContext`. | Derived `servesContext` per the forms that carry the relator's relata. Transaction relator: many edges = spanning (Bucket B), consistent with ODR-0020 Rule 3 keeping it un-declared as a context. |
| **Mode / Quality** | `opda:Fee` (monetary mode), `currentEnergyRating`, `floodRisk`, `councilTaxBand` (Qualities/Quale-in-region per ODR-0008 Q5a) | Authored `definedInContext` → the practice that *individuates the quality space*. `currentEnergyRating` home = the EPC/energy practice; `floodRisk` home = Search/Survey practice; `councilTaxBand` home = the LA/valuation practice. Qualities inhere in a bearer but are *conceived* within a measuring/assessing practice — that practice is the home. | Derived `servesContext` — often Bucket B (a Quality of `Property` shows up on many forms). `floodRisk`: piq+ta6 (ODR-0020 §6 worked case). |
| **Role / RoleMixin** | Seller, Buyer, Valuer, Mortgagee (ODR-0006) | **No new home, no new Kind** (ODR-0006; ODR-0019 Rule 8 first clause). A role is anti-rigid and externally dependent; it does **not** get a `definedInContext` of its own — it inherits the home of the RoleMixin family / the spanning Participants concern. | The Participants concern is spanning (ODR-0020 Rule 3) → derived multiplicity, no declared context. |
| **Phase** | a withdrawn/active valuation, a transaction phase (ODR-0007) | **No new home, no new Kind** (anti-rigid phase of its Kind). Inherits its Kind's home. | Lifecycle phase-space (ODR-0007); spanning. |
| **The bounded context itself** | `opda:ConveyancingContext` etc. | **Not a Kind at all** — it is the anti-rigid perspectival *facet* (SKOS Concept). It is the **target** of both predicates, never the bearer. It carries `opda:hasSteward`, not `definedInContext`. | n/a — it is the partition, not a member of it. |

**Completeness check (the method that proves every entity is placed):**

1. **Type every named entity to its UFO meta-category first** (Kind / Relator / Mode / Quality / Role / Phase). This is already substantially done across the ratified TBox ODRs; the residual is the ~935 descriptive leaves whose categories ODR-0008 Q5a binds (Quale-in-region, Substance-Kind-label, Mode/Quality-value, non-§8a). The meta-category is what tells you whether the entity *can* have a single home (Kinds/Relators/Modes/Qualities: yes, exactly one) or *must not* (Roles/Phases: none; shared-kernel Kinds: none/foundation).
2. **Authored-home pass (`definedInContext`):** for each Kind/Relator/Mode/Quality, ask the OntoClean individuation question — *"inside which community of practice was this Universal given its identity criterion?"* Record exactly one (or `FoundationLayer`/none for the shared kernel). Roles/Phases: skip (inherit). This pass is **finite and bounded** — it is one annotation per minted Universal (~81 named entities + the promoted descriptive classes), not per leaf and not per form.
3. **Derived-usage pass (`servesContext` / `consumesFrom`):** mechanical, per ODR-0020 Rule 5 + buckets A–D. No human input.
4. **The completeness invariant:** *every named `owl:` term is either (a) a Role/Phase that inherits, or (b) a Kind/Relator/Mode/Quality with exactly one authored home-decision recorded — even if that decision is "FoundationLayer / shared kernel / no industry home."* A term with **no** home-decision at all is the gap signal — it means the modeller never asked the individuation question for it. This is a far stronger completeness test than the ratified design has, because the ratified design's only completeness signal is "does a profile require it?" (a usage test), which by construction cannot detect an un-homed Kind.

**Multi-membership = one home, many uses.** This is the slogan and it is exactly UFO: `opda:Address` has **one** ontological status (shared-kernel Substance Kind, no perspectival home) and **many** usages (Bucket B, ~10 derived `servesContext` edges). The ratified design captures the "many uses" correctly and **drops the "one home"** — for Address the right home-decision is explicitly *FoundationLayer/none*, and recording that is informative (it positively asserts "this is kernel," rather than leaving it implicit in tag-absence). Tag-absence (ODR-0020 Bucket D) conflates two very different things — "shared kernel, used everywhere" and "scaffolding, used nowhere" — which an authored home-decision separates cleanly.

### Vote

**Q2: FOR the four-bucket usage method (ODR-0020 Rule 4) AS the usage layer, AGAINST it as the *whole* placement method.** It needs the orthogonal authored-home pass above to be complete. One-line reason: *the buckets place usage correctly but are blind to home; UFO requires placing both, and home is exactly what proves an entity was actually individuated somewhere rather than merely used.*

### Plan elements (Q2)

- **PE-Q2.1 — Decide the shared-kernel home convention.** Either (preferred) mint a single non-industry SKOS concept `opda:FoundationLayer` (or reuse "shared kernel" semantics) as the explicit `definedInContext` target for kernel Kinds, OR adopt the convention "kernel Kinds carry no `definedInContext`, and tag-absence-with-multiplicity = kernel." I lean to the explicit concept because it converts a silence into an assertion and makes the completeness invariant checkable. (Cagle/Knublauch will care about the SHACL cost; flag to them.)
- **PE-Q2.2 — Author the home pass over the ~81 named entities + Q4a class promotions.** One `definedInContext` decision per Kind/Relator/Mode/Quality. Bounded, finite, one-time. Roles/Phases excluded by rule.
- **PE-Q2.3 — Bind the home pass to the UFO meta-category typing already in the TBox ODRs** (ODR-0005 Kinds, ODR-0006 Roles/Org, ODR-0007 Transaction relator/phases, ODR-0008 Q5a descriptive categories, ODR-0019 §4 worked Relator/Mode/Kind table). No new typing work — read the category off the existing ODR, then ask the individuation question.
- **PE-Q2.4 — Sequence: home-pass and usage-derivation are independent and parallel.** Home is authored from the TBox; usage is derived from profiles. Neither blocks the other. (Bears on Q5.)

---

## Q3 — Missing-ontology creation & sequencing (935-leaf walk; ~14 overlay profiles)

### Stance

**The descriptive properties acquire their HOME at creation time — that is the whole point, and it is the cheapest possible moment to record it.** When the generator walks the 935 annotated leaves (ODR-0008 declare-once) and mints each `opda:` datatype property, the leaf *already carries its provenance*: `dct:source` to a form-question IRI and the dictionary description (ODR-0008 §Q3a per-property + per-overlay-array citation). The form-question IRI is **exactly the signal for the home context** — `baspi5Ref` → EstateAgency, `piqRef` → Surveying, etc. So at the moment of minting, the generator knows (or can know) the *originating* form, which is the strongest available evidence of the individuating practice.

This is the key sequencing insight and it cuts directly against treating home as a later, separate, hand-tagging chore: **home-assignment is a by-product of the 935-leaf walk, not a follow-on to it.** The generator that emits the datatype property from a leaf is holding, in the same loop iteration, the `dct:source` that identifies the home. Recording `definedInContext` there is nearly free.

**Caveat — first-source vs union-of-sources.** A spanning leaf carries an *array* of `dct:source` (one per overlay it appears in, ODR-0008 Q3a). Which one is the home? UFO answer: the home is the practice in which the Quality/Mode/Kind was *individuated*, which is **not** necessarily the first form to reference it nor the union of all forms that do. For genuine shared-kernel descriptive properties (e.g. a `propertyPack`-level field on 18 overlays) the right home is *FoundationLayer/none* (PE-Q2.1), exactly as for `Address`. For a property that originates in one practice and is merely reused (e.g. `currentEnergyRating` — conceived in EPC/energy practice, reused on many forms), the home is that originating practice and the generator cannot always infer it mechanically from the source array. **So the home-pass has a mechanical default + a small adjudicated residue**, mirroring ODR-0008 Q1a's "mechanical-default + consumer-query reconciliation trigger." Mechanical default: if a property's `dct:source` array points at exactly one form → that form's context is the home; if it points at ≥N forms or at a `propertyPack`-level path → default to FoundationLayer/none, flag for optional adjudication.

**Does placement block on the 935-leaf walk and the ~14 profile emitters?** Partially, and the dependency is **asymmetric**:

- **`servesContext` (usage/derived) HARD-BLOCKS on the profile emitters.** You cannot derive "which contexts use term X" until the profiles that use X exist and point `overlaysContext` at real industry concepts. Today only `baspi5` is emitted, and it mis-points at the profile-layer IRI (ODR-0020 §6, `profiles.py:250`). So usage-membership is genuinely blocked on: (a) the `profiles.py:250` fix, and (b) emitting the other ~14 profiles. This is a real backlog ODR-0020 already surfaces.
- **`definedInContext` (home/authored) does NOT block on profiles at all.** Home comes from the TBox + the leaf's own `dct:source`, both of which exist now (or are produced by the 935-walk, which is ODR-0008 work proceeding on its own track). The home-pass can run the moment the descriptive properties are minted, independent of whether any overlay profile beyond baspi5 exists.

This asymmetry is the scheduling gift: **the authored half of placement can complete early and independently; only the derived half waits on the profile backlog.** It also means the context partition is *useful before the profiles are done* — every term has a recorded home long before its usage edges materialise.

### Vote

**Q3: FOR sequencing home-assignment INTO the 935-leaf walk (not after it), and FOR treating the ~14 profile emitters as a hard prerequisite for `servesContext` ONLY.** One-line reason: *a descriptive property's home is fixed by its provenance the instant it is minted, so capture it in the same generator pass; usage waits on the profiles, home does not.*

### Plan elements (Q3)

- **PE-Q3.1 — Emit `definedInContext` inside the ODR-0008 935-leaf generator pass**, derived from the leaf's `dct:source` form-question IRI via the same `baspi5Ref→EstateAgency` mapping ODR-0020 §6 defines for `overlaysContext`. Mechanical default per the first-source/union rule above; flag the ≥N-source / propertyPack-level cases for optional adjudication (reuse ODR-0008 Q1a reconciliation-register machinery — do NOT invent a parallel register).
- **PE-Q3.2 — Fix `profiles.py:250` FIRST among the derived-half work** (re-point `overlaysContext` from `profiles/foundation` to the industry `…Context` concept; introduce `opda:profileLayer` for the genuine profile-layer link, per ODR-0020 §6). This unblocks `servesContext` derivation and is a prerequisite for the other ~14 emitters being correct.
- **PE-Q3.3 — The ~14 profile emitters block ONLY `servesContext`, not the scheme, not `definedInContext`, not the homonym handling.** Schedule them as the long-pole of the *usage* track; do not let them gate the *home* track or the scheme emission.
- **PE-Q3.4 — Class promotions (ODR-0008 Q4a: Survey, EPCCertificate, Search, Valuation, Comparable) each get a home-decision at promotion time.** These are authority-retrieved Substance Kinds with `prov:wasGeneratedBy` chains — their home is the practice that runs the generating activity (Survey→Surveying, EPCCertificate→energy/EPC practice, Search→Search/PropertyDataServices, Valuation→Surveying *unless/until* it splits into Mortgage/RedBook/AVM sub-Kinds per ODR-0019 §4, each with its own home). Record `definedInContext` on each as it is promoted.

---

## Q4 — ODR/ADR scaffolding

### Stance

**Amend ODR-0019 (one targeted amendment) + amend ODR-0020 (one targeted amendment) + one fresh ADR for the home-emission; do NOT write a new ODR, and revise ADR-0026's scope rather than replacing it.** My changes are *corrections to the authority split*, not a new pattern — they belong as amendments to the records that already own `definedInContext`/`servesContext`, exactly as ODR-0001's per-kind discipline expects (a `kind: pattern` ODR is amended in place when the same pattern is refined). A new ODR would fragment the bounded-context pattern across three records for no methodological gain.

### Enumeration

- **Amend ODR-0019 Rule 8 (the gate).** Narrow the gate to polysemy/sense-register machinery; explicitly exempt `definedInContext` from the homonym trigger and re-cast it as an always-authored provenance-of-conception relation. Add the "home-decision is required for every Kind/Relator/Mode/Quality, including the explicit FoundationLayer/none decision for shared-kernel terms" completeness invariant (PE-Q2.4). This is a refinement of the same `kind: pattern`, council-ratified — appropriate as an amendment with a session-021 provenance note, mirroring how ODR-0019 itself records the two Author-only amendments and how ODR-0010/0008 absorbed later-session amendments inline.
- **Amend ODR-0020 Rule 4 (the four buckets) + Rule 5 (firewall).** Add the orthogonal **home** dimension to the usage buckets: each bucket A/B/C row gains its `definedInContext` treatment (A→ likely its single home; B→ likely FoundationLayer/none; C→ the upstream-sourced term still has a *home* in our model even though its data is `consumesFrom` an Organisation — sourcing-from is not being-defined-in). Bucket D splits into D1 (shared-kernel: FoundationLayer home, no usage) and D2 (scaffolding: no home, no usage) — the distinction tag-absence currently hides.
- **One fresh ADR — "Authored home-context emission" (the implementation record).** Covers: the `definedInContext` generator pass (PE-Q3.1), the FoundationLayer convention decision (PE-Q2.1), the home-vs-usage consistency report (PE-Q1.3), and the D1/D2 split. `implements: [ODR-0019, ODR-0020, ODR-0008]`. Distinct from ADR-0026 because ADR-0026 is scoped to *scheme emission + overlaysContext correction + dormant derivation* (the **usage** half); this is the **home** half, which ADR-0026 does not currently cover.
- **Revise ADR-0026's scope note (not replace).** ADR-0026 stays the home of scheme-emission + `profiles.py:250` fix + dormant `servesContext` derivation. Add a cross-reference: ADR-0026 = usage/derived half; new ADR = home/authored half; the two together discharge ODR-0019+0020. No revision to ADR-0026's mechanics is required by my position — I am *adding* a sibling, not rewriting it.
- **ADR-0027 (council-session indexing) — untouched by my positions** (it is process plumbing).

### Vote

**Q4: FOR amend-0019 + amend-0020 + one fresh ADR (home-emission) + ADR-0026 scope-note revision; AGAINST a new standalone ODR.** One-line reason: *my correction is a refinement of the existing bounded-context pattern's authority split, which belongs in the records that own the two predicates, plus one implementation ADR for the authored half that ADR-0026 doesn't cover.*

### Plan elements (Q4)

- **PE-Q4.1** — Draft the ODR-0019 Rule 8 amendment text (gate-narrowing + `definedInContext` always-on + completeness invariant), via `odr-create`/in-place amend per ODR-0001 discipline; carry a session-021 provenance line.
- **PE-Q4.2** — Draft the ODR-0020 Rule 4/5 amendment (home dimension on the buckets; D1/D2 split).
- **PE-Q4.3** — `adr-create` the "Authored home-context emission" ADR; `implements: [ODR-0019, ODR-0020, ODR-0008]`; register in AgentDB.
- **PE-Q4.4** — Edit ADR-0026 scope note to declare the usage/home division of labour and cross-link the new ADR.

---

## Q5 — Implementation plan (phases, dependencies, gates, emission order)

### Stance

Two **parallel tracks** (home/authored and usage/derived) that share the scheme as a common prerequisite, joined at the end by a consistency gate. The deep insight from Q1–Q3: **home does not wait on usage.** The ratified plan implicitly serialises everything behind the profile backlog because it only materialises the derived predicate; splitting the tracks lets the authored half deliver value immediately.

### Phased plan

**Phase 0 — Scaffolding decisions (gates the rest; small).**
- Ratify this council's authority split (Q1) and FoundationLayer convention (PE-Q2.1).
- Land the ODR-0019/0020 amendments + new ADR + ADR-0026 scope note (Q4).
- *Gate:* amendments accepted; FoundationLayer decided. → verify: `odr-review` passes on amended 0019/0020.

**Phase 1 — Scheme emission (common prerequisite; ADR-0026).**
- Emit `opda:BoundedContextScheme` + the six industry `…Context` concepts to `opda-contexts.ttl` (ODR-0020 Rule 1). Emit `opda:FoundationLayer` concept if PE-Q2.1 chose the explicit form. Mint `opda:definedInContext` + `opda:servesContext` as `owl:AnnotationProperty`.
- *Gate:* scheme + six concepts emit; byte-identity CI green (ADR-0007). → verify: SKOS scheme validates; `skos:topConceptOf` on all six.

**Phase 2A — HOME track (authored; parallel with 2B; NO profile dependency).**
- Run the home-pass over the ~81 named entities (PE-Q2.2) using TBox UFO categories (PE-Q2.3): one `definedInContext` per Kind/Relator/Mode/Quality; Roles/Phases skipped; shared-kernel → FoundationLayer/none.
- Fold `definedInContext` emission into the ODR-0008 935-leaf generator pass (PE-Q3.1) — mechanical default from `dct:source`, adjudicated residue via the existing reconciliation register.
- Home-decisions on the Q4a class promotions (PE-Q3.4).
- *Gate (completeness invariant, PE-Q2.4):* every named Kind/Relator/Mode/Quality has exactly one home-decision recorded (incl. explicit FoundationLayer/none). → verify: a report lists zero un-homed Kinds.

**Phase 2B — USAGE track (derived; parallel with 2A; HARD-BLOCKS on profiles).**
- Fix `profiles.py:250` first (PE-Q3.2): re-point `overlaysContext` → industry concept; add `opda:profileLayer`.
- Emit the ~14 missing form-profiles (PE-Q3.3), each wiring `overlaysContext` to its context per ODR-0020 §6.
- Author the SHACL-AF CONSTRUCT derivation rule (ODR-0020 Rule 5), shipped **dormant** per ODR-0019 Rule 8 / Davis's consumer-gate.
- *Gate:* `profiles.py:250` fixed; profiles point at industry concepts; derivation rule authored-but-dormant. → verify: each profile's `overlaysContext` resolves to a scheme concept; CONSTRUCT rule present, not active.

**Phase 3 — Join / consistency (after 2A and 2B).**
- Run the home-vs-usage coherence report (PE-Q1.3): flag terms defined-in-C-but-never-serving-C, and terms serving contexts wildly inconsistent with their home (a possible mis-home or a genuine shared-kernel mislabel).
- Activate `servesContext` derivation only when Davis's named-term-grain-consumer gate clears (unchanged).
- *Gate:* coherence report reviewed; no incoherent home/usage pairs unexplained. → verify: report empty or every flag dispositioned.

**Emission order (single sentence):** scheme + properties (Phase 1) → then in parallel: authored homes from TBox+dictionary (2A) and the `profiles.py:250` fix + profile emitters + dormant derivation (2B) → coherence join (3).

**Critical-path / dependency notes:**
- The **long pole is 2B** (the ~14 profile emitters). 2A is short and unblocked.
- **2A delivers a usable home-partition before 2B finishes** — this is the payoff of the split and the main planning contribution of my lens.
- Everything rides `foundation.ttl`'s `owl:versionIRI`; no new version surface (ODR-0020 Consequences).
- Determinism/byte-identity CI (ADR-0007) gates every emission step.

### Vote

**Q5: FOR the two-parallel-track plan (home-authored ∥ usage-derived, joined by a coherence gate), AGAINST any plan that serialises home behind the profile backlog.** One-line reason: *home is authored from artefacts that exist today and must not wait on the ~14-profile usage backlog; parallelising the tracks delivers a complete home-partition early and isolates the real long pole.*

### Plan elements (Q5)

- **PE-Q5.1** — Adopt the Phase 0→1→{2A∥2B}→3 structure with the gates above.
- **PE-Q5.2** — `profiles.py:250` fix is the **first** action of track 2B and a hard prerequisite for correct `servesContext`.
- **PE-Q5.3** — Phase-3 coherence report is the OntoClean cross-check that the two relations stay distinct yet consistent; it is non-blocking (flags, not failures) except where a flag reveals a mis-typed Kind.
- **PE-Q5.4** — Keep the derived-predicate activation behind Davis's consumer-gate; do NOT extend that gate to the authored predicate.

---

## Summary of votes

| Q | Vote | One-line reason |
|---|---|---|
| **Q1** | **FOR hybrid, typed by predicate** | Usage→derived (concede Davis); home→authored & un-gated from homonym trigger; they are different ontological relations. |
| **Q2** | **FOR buckets as usage-layer; AGAINST as whole method** | Buckets place usage; UFO requires also placing *home* (one per Kind/Relator/Mode/Quality, incl. explicit FoundationLayer for kernel). |
| **Q3** | **FOR home-assignment INTO the 935-walk; profiles block `servesContext` ONLY** | A property's home is fixed by its `dct:source` provenance the instant it is minted; usage waits on profiles, home does not. |
| **Q4** | **FOR amend-0019 + amend-0020 + 1 fresh ADR + ADR-0026 scope-note; AGAINST new ODR** | A refinement of the existing pattern's authority split belongs in the records owning the two predicates, plus one ADR for the authored half. |
| **Q5** | **FOR two-parallel-track plan (home ∥ usage, coherence join); AGAINST serialising home behind profiles** | Home is authorable today; parallelising isolates the ~14-profile long pole and delivers the partition early. |

## Must-have plan elements (top 3)

1. **Stand up `opda:definedInContext` as an always-authored, un-gated home relation** (split ODR-0019 Rule 8's gate so it covers only polysemy machinery) — the architecture currently materialises ZERO homes, making the partition 100% form-derived, which is the OntoClean level-confusion the Architect's Claim B half-detects.
2. **Emit home inside the ODR-0008 935-leaf walk** from each leaf's `dct:source` (mechanical default + small adjudicated residue via the existing reconciliation register); shared-kernel terms get an explicit FoundationLayer/none home — converting tag-absence into a positive assertion and giving a real completeness invariant.
3. **Two parallel tracks** — authored-home (unblocked, short) ∥ derived-usage (`profiles.py:250` fix + ~14 profile emitters, the long pole) — joined by a non-blocking home-vs-usage coherence report; keep `servesContext` derivation dormant behind Davis's consumer-gate, but do NOT extend that gate to the authored home predicate.
