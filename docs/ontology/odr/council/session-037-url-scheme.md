# Council Session 037 — The opda/pdtf URL scheme (Full Council)

- **Date:** 2026-06-01
- **Records:** Amends [ADR-0006](../../adr/ADR-0006-w3id-opda-ontology-namespace.md) (namespace scheme); cross-refs [ODR-0004](../ODR-0004-pdtf-ontology-foundation.md) §Rules.1 (hash override), [ODR-0027](../ODR-0027-classification-roles-inheritance-skos-doctrine.md) (classification-over-inheritance, invoked on Q5).
- **Queen:** Elisa Kendall (OMG/EDM Council; enterprise vocabulary publishing precedent).
- **Devil's Advocate:** Ian Davis (*Linked Data Patterns*, Dodds & Davis; publish-first / scope-discipline — genuinely opposed to the multi-namespace partition).
- **Panel:** Tom Baker (DCMI — namespace/URI policy, SKOS governance); Fabien Gandon (W3C/Inria — web architecture, hash-vs-slash, httpRange-14); Dean Allemang (*Working Ontologist* — pragmatic simplicity); Holger Knublauch (TopQuadrant — SHACL, decisive on Q7/Q8); Harshvardhan Pandit (DPV — the cited precedent / live counter-evidence).
- **Voices:** 7 (Queen + DA + 5 panel) across teammates on `council-036`.
- **`consensus-mode`:** `agent-fan-out` (one-message parallel spawn; Agent-Teams `SendMessage` cross-talk; no hive-mind — no byzantine/typed-output trigger).
- **Format:** Full Council (~6 agent runs + Queen synthesis).
- **Input:** `working/session-037/EVIDENCE.md` + the URL inventory + ADR-0006 amendment + hm (`hm.com/ns/` slash + `/pf/`,`/sds/` modules + `urn:hm:graph:`) and DPV (`w3id.org/dpv/` slash-module + `#`-terms) prior art.

## Context

opda revises the IRI scheme for the pre-publication PDTF ontology. The directing-authority rules under review: (1) base `https://w3id.org/opda/pdtf/` (org/standard split); (2) slash, no hash; (3) no version segment; (4) no module segment / flat namespace; (5) a `/pdtf/` (standard entities) vs `/harness/` (physical resources + governance) split — with sub-disputes on data-dictionary (Q6), SHACL shapes incl. a proposed `/shacl/` namespace (Q7), and per-form profiles (Q8). The panel verified two prior-art findings: **hm and DPV both modularise and DPV uses hash** — so the proposal *diverges from its own cited precedent* on rules 2 and 4, admissible only on greenfield/single-context grounds.

## Question 1 — Org/standard split + base path

**7–0–0 FOR. DA WITHDRAWN.**

**Pandit:** AFFIRM — `opda` (owner, the PICG-redirect unit) / `pdtf` (standard) is *more* disciplined than DPV's own conflated `w3id.org/dpv/` root; lets opda mint a future `/opda/<other>/` without colliding term spaces (DPV spec + DPVCG 2019 report). **Allemang:** AFFIRM — authority/artefact split; `w3id.org/pdtf/` would repeat the `trust.propdata` coupling defect S004 rejected (*Working Ontologist* ch. 3). **Baker:** AFFIRM — mirrors DCMI's `purl.org/dc/ → /dc/terms/` two-level shape. **Davis (DA):** AFFIRM/WITHDRAW — Hierarchical URIs along the durable stewardship axis (*Linked Data Patterns*).

**Vote Q1: 7–0–0** (base path `https://w3id.org/opda/pdtf/` stands).

## Question 2 — Hash vs slash

**REVISE toward HASH (Option H `…/opda/pdtf#Property`) — ~5–2 after cross-talk. ⚠ The council's reasoned majority is AGAINST directing-authority rule 2 → operator ratifies.**

> **Cross-talk resolution (supersedes the openers below).** A four-voice convergence formed — **Gandon (Cool URIs/httpRange-14) + Baker (W3C Best Practice Recipes, Recipe-3) + Pandit (DPV principal author) + Davis (DA)** — on the decisive ground that **rule 2's slash override fails its OWN governing test**: ODR-0004/ADR-0006 fixed when slash earns its keep ("≥1,000 terms OR a named per-term-content-negotiation consumer"), and both limbs are unmet (~147 terms, no consumer). DPV (`/dpv/pd#Address`) and hm are slash-to-module + hash-within — counter-precedents to flat-slash, not support. The Q5 `/harness/` split keeps `/pdtf/` to ~147 terms + SKOS = one document = Recipe-3 (hash). **Recommendation: revert to the ODR-0004 hash now (Option H); adopt slash only when a reopening trigger fires, then as slash-to-module + hash-within.** Minority FOR slash: Allemang (schema.org flat-slash precedent) + Knublauch (deferring to web-architects), conditional on opda building per-term 303/conneg (w3id's flat 302 does not provide it).

**Allemang:** AFFIRM slash — schema.org (`schema.org/Person`, thousands of terms, flat slash) is the scaled precedent; gate on content-negotiation actually working or the URIs 404 (*Cool URIs* §4.1–4.4). **Pandit:** REVISE/AYE-conditional — DPV chose hash precisely because a fragment resolves in one round-trip with no per-term server config; slash is the better *long-run* choice but is "only honest if opda commits to a dereference behaviour." Moves an exact ADR line: per-term slash 302s to the single `pdtf` document returning the full graph; no per-term conneg committed at this scale; reuse ODR-0004's reopening trigger. **Gandon:** REVISE/AGAINST the bare rule — ≈147 terms is the textbook *hash* case (*Cool URIs* §4.3); ODR-0004's own reopening trigger (1,000 terms / per-term negotiation) is **not met**; proposes **Option H — a hash *within* the slash standard segment** (`…/opda/pdtf#Property`), which also minimally disturbs ODR-0004's ratified hash. REJECTs "slash, no hash, no stated mechanics." **Baker:** REVISE/FOR with binding condition — slash acceptable *only* if the ADR commits to slash-resolution infrastructure (W3C Best Practice Recipes; a 404ing slash URI is worse than an always-resolving hash). **Davis (DA):** REVISE/ABSTAIN/HOLD — under rule 4's single document, slash "buys nothing"; DPV (the cited precedent) uses hash. **Knublauch:** FOR (not contested from SHACL lens). **Kendall (Queen):** FOR the amended proposition — slash is retained (the directing-authority rule survives) but is grounded only by adding Pandit's dereference commitment + reopening trigger to ADR-0006 rule 2.

**Vote Q2: 5–2 toward HASH/REVISE** (Kendall, Gandon, Baker, Pandit, Davis → Option H hash; Allemang, Knublauch → slash-with-conneg-build). Council recommends reverting to hash; **the no-hash directive is the operator's to keep or drop.**

## Question 3 — Versioning

**7–0–0 FOR (amended: version-free term IRI **+** retain `owl:versionIRI` + `owl:versionInfo` + dated release snapshot in `/harness/`). DA WITHDRAWN.**

**Pandit:** AFFIRM — exactly DPV practice (term IRIs unversioned forever; releases dated at the artefact level); the `…/opda/1.0.0/` segment is the mistake. **Gandon:** REVISE — `owl:versionInfo` *alone* violates OWL 2 §3.1 (it is a human annotation with no machine identity); keep `owl:versionIRI` too. **Allemang:** REVISE — add `owl:versionIRI` → a release-snapshot under `/harness/release/1.0.0/`. **Davis (DA):** REVISE/FOR+addition/HOLD → "a versionInfo literal is not a citable fixed release; demand a versioned release URI in `/harness/`" — **condition met** by the harness release snapshot. **Kendall:** FOR — the version-free term IRI is the highest-value fix; fold in versionIRI + the harness release URI.

**Vote Q3: 7–0–0** (version out of the term IRI; machine version handle retained on the ontology header + a harness release snapshot).

## Question 4 — Modules / flat namespace

**7–0–0 FOR flat (amended: record a module-reopening criterion). DA WITHDREW cleanly after cross-talk.**

> **Cross-talk resolution:** Davis's primary attack (AGAINST flat) **withdrew** once Pandit supplied the *finding* he demanded — "modules would be premature segmentation with no independent-versioning or independent-adoption driver" — converting flatness from doctrine (rejected) to a finding (accepted), conditional on the reopening criterion being recorded. Baker + Pandit then unified the Q2 and Q4 reopening triggers into one principle: **"a sub-vocabulary earns its own URI segment exactly when it becomes an independent dereference / version / import unit."**

**Allemang:** AFFIRM — sub-namespaces are warranted only by *independent authority or lifecycle*; opda's 6 modules are editorial file-splits of one standard with one author/cadence; schema.org (flat, thousands of terms) shows flat is navigable; navigation is the documentation's job, not the URI's. **Pandit:** AFFIRM + criterion — DPV/hm modularise for independent governance + partial consumption, *which opda lacks*; moves an exact line: "introduce a module segment only when a sub-vocabulary acquires an independent versioning clock OR is adopted/imported independently." **Baker:** REVISE/FOR — flattening is sound because `skos:inScheme` carries scheme identity (SKOS Reference §4), not the URI prefix; record the test (modules are co-versioned, never independently cited). **Gandon/Knublauch:** FOR. **Davis (DA):** REJECT/AGAINST/HOLD — both DPV and hm segment; flattening "irreversibly forecloses modular import pre-consumer to buy cosmetic flatness." **Re-open trigger:** a dependency-cut analysis proving the six modules are not separable. **Kendall:** FOR flat; adopt Pandit's reopening criterion — which *names* Davis's re-open trigger, so the dissent is protected without blocking.

**Vote Q4: 7–0–0** (flat now; module segment only on the recorded independent-dereference/version/import trigger).

## Question 5 — Standard-entity vs physical-resource split

**7–0–0 FOR Baker's binding placement procedure; `/harness/` realised as a PATH under ONE `/opda/` redirect (NOT two coordinate namespaces). DA FULLY WITHDREW.**

> **Cross-talk resolution (the session's most productive exchange).** Davis's "standing tribunal with no decision procedure" attack forced **Baker to HARDEN the boundary into a binding rule**, not defend it as drafted: **(a)** placement test "would a consumer cite/version/deprecate this AS the normative standard?"; **(b)** ambiguity → default `/harness/`, promote to `/pdtf/` only by council, **never demote a published `/pdtf/` URI** (DCMI never-reassign); **(c)** one-directional dependency. Davis then narrowed his residual to *two coordinate namespaces vs one redirect + path*; **Baker ruled the harness is co-stewarded (not separately delegable) → a path, not a second namespace**, and Allemang's httpRange-14 point (only a path segment is in the cold URI at routing time) closed it. Davis **fully withdrew**. Baker also fixed `/harness/` as a *citability/entity-kind* boundary, explicitly not a serialisation-variant split.

**Pandit:** AFFIRM — DPV's pain was the *absence* of this line (spec, examples, vocabulary all on one root); the split makes "is this the standard or apparatus?" legible from the IRI; one extra redirect is trivial. **Baker:** AFFIRM + rule — a real governance boundary; record that dependency is one-directional (nothing in `/pdtf/` may `rdfs:isDefinedBy` `/harness/`). **Gandon/Knublauch:** AFFIRM. **Allemang:** REVISE — keep the distinction + the `/harness/` **path**, but drop the *second coordinate PICG redirect root*: one `/opda/` redirect, `pdtf`/`harness` as paths the host resolves (ADR-0006 already decouples URI policy from redirect target). **Davis (DA):** REVISE/AGAINST-as-stated/HOLD — the semantic boundary is "a standing tribunal with no decision procedure" (already 3 disputes Q6/Q7/Q8); replace it with the **mechanical test "is it in the published graph?" + `rdf:type`**, citing **ODR-0027** (partitioning the namespace by kind repeats the subclass-tree mistake classification-over-inheritance rejected). **Kendall:** FOR keeping the split, but **adopt Davis's mechanical "published-graph membership" test as the decision procedure** (it dissolves Q6/Q7/Q8 into one rule and aligns with opda's own ODR-0027), plus Baker's one-directional-dependency rule, plus Allemang's path-not-root realisation where hosting allows.

**Vote Q5: 7–0–0** (split kept; Baker's placement procedure + harness-default + promote-by-council + never-demote + one-directional dependency; `/harness/` a path under ONE `/opda/` redirect).

## Question 6 — data-dictionary placement

**6–0–1 FOR (Knublauch abstain). DA WITHDRAWN.**

**Pandit/Allemang/Baker/Gandon/Davis:** AFFIRM — the 582 dotted-path entries are concrete PDTF *data fields* (physical resources), not abstract standard entities → `/harness/data-dictionary/`; they would over-claim if each were a published term. **Pandit caveat (recorded):** the dictionary entries *reference* `/pdtf/` terms via `dct:conformsTo`/`rdfs:isDefinedBy`; the emitter must wire that direction `/harness/ → /pdtf/`, never the reverse. **Knublauch:** abstain (outside SHACL lens).

**Vote Q6: 6–0–1** (data-dictionary → `/harness/data-dictionary/<dotted.key>`; cross-link harness→pdtf only).

## Question 7 — SHACL shape placement (and the `/shacl/` proposal)

**7–0–0: shape NODES → `/pdtf/`; shape DOCUMENTS → `/harness/`; `/shacl/` REJECTED unanimously.**

**Knublauch (decisive):** the shapes-graph/data-graph separation (SHACL Rec §1.5) is a **graph-level partition, NOT a naming partition**; shape nodes are normative standard entities co-located with their `sh:targetClass` (as opda emits today, and as DASH/SPIN/TopBraid practice dictates); the `/shacl/` split would re-introduce a module by the back door (Q4) and wrongly imply shapes are a *separate standard*. **Allemang:** REVISE — minting `/shacl/` is the Q5 over-reach one level smaller; base shapes are part-of, not about. **Baker:** REVISE — `/shacl/` splits the standard by serialisation tech, the same error as version-in-URI. **Pandit:** REVISE — shapes are co-normative; the silo only makes sense for an independently-maintained validation profile. **Davis (DA):** REJECT the 3-way — nodes `/pdtf/`, AGAINST `/shacl/` ("partition disease"). **Kendall:** REVISE the open question → shape nodes `/pdtf/`, shape/profile documents `/harness/`, **no `/shacl/` namespace**.

**Vote Q7: 7–0–0** (nodes `/pdtf/`; documents `/harness/`; no `/shacl/`).

## Question 8 — Profiles

**REVISE — disaggregate; documents → `/harness/`; node/resource placement by WARRANTY; default the 31 external-form overlays → `/harness/profiles/`, promote individually to `/pdtf/profiles/` on recorded adoption. RESIDUAL POLICY CALL → directing authority. DA HELD→largely WITHDRAWN.**

The panel split on a genuine axis:

- **"profiles are external-form adapters → `/harness/`"** — **Allemang:** REVISE → `/harness/profiles/`; a profile is `dct:source`-linked to a third-party form (BASPI/TA6/CON29/LLC1 are external instruments opda maps *onto*, not authors); session-034 already treats profiles as a binding layer over the core. **Pandit:** REVISE → placement governed by **warranty/ownership, not subject-matter** (the DPV analogue: jurisdiction extensions are first-class *because DPVCG warrants them*; a one-off external mapping is an application artefact); default the 31 to `/harness/profiles/`, promote on recorded adoption. **Davis (DA):** REVISE/AGAINST blanket `/pdtf/profiles/` → 31 externally-sourced form bindings are *applications of* PDTF, not PDTF.
- **"profile shape NODES are normative SHACL → `/pdtf/`"** — **Knublauch:** profile shapes are normative artefacts under ODR-0010/0013, NOT instance bindings; nodes → `/pdtf/`, graph → `/harness/profiles/` (keeps cross-module `sh:node` composition + the NoIdentityOverride meta-shape reference-clean). **Baker:** a profile *resource* is a citable spec artefact (Singapore Framework for DC Application Profiles) → `/pdtf/profiles/<form>`; document + fixtures → `/harness/`.

**Kendall (Queen):** the agreed core is firm — **documents/fixtures → `/harness/` (unanimous); no blanket `/pdtf/profiles/`**. The residual split (do profile *shape nodes / the profile resource* sit in `/pdtf/` or `/harness/`) reduces to **one policy question only the directing authority can answer: does opda publish the overlay profiles AS normative parts of the PDTF standard, or as opda's mapping-views onto externally-owned forms?** Both Allemang and Pandit explicitly flagged this as the operator's call. Adopt **Pandit's warranty test** as the criterion and **default to `/harness/profiles/`** (the 31 are external instruments), with individual promotion to `/pdtf/profiles/` on a recorded adoption that opda warrants the profile as a normative conformance target.

**Vote Q8: REVISE** (disaggregate; documents → `/harness/`; warranty test; default `/harness/profiles/`; per-profile promotion on warranted adoption — operator ratifies the default).

## Synthesis (Queen — Elisa Kendall)

The council lands on one decisive criterion, stated first by Baker and reinforced by every voice: **put governance/identity boundaries in the URI; put logical, serialisation, and version distinctions in the triples — never in the URI string.** Allemang's through-line is the operational form of it: **AFFIRM the modelling decisions, REVISE the namespace-proliferation.**

- **Affirmed as proposed:** the `opda`/`pdtf` org-standard base (Q1, 7–0–0); version out of the term IRI (Q3); the flat term namespace (Q4, 6–1–0); the standard-vs-physical *distinction* and data-dictionary → harness (Q5/Q6).
- **Affirmed-with-amendment (the load-bearing REVISEs):**
  1. **Q2 — the council recommends REVERTING TO HASH, against the directing-authority's no-hash rule (5H-2S).** After cross-talk, Gandon + Baker + Pandit + Davis converged on **Option H (`…/opda/pdtf#Property`)** because rule 2's slash override **fails its own governing reopening test** (≥1,000 terms / named consumer — both unmet) and DPV/hm are slash-to-module + hash-within counter-precedents. The minority (Allemang on schema.org; Knublauch deferring) holds slash *only* if opda funds a per-term 303/conneg build. **This is the one place the council's reasoned majority opposes a directing-authority directive — the operator ratifies (accept hash, or keep slash with the resolution build).**
  2. **Q3 — keep `owl:versionIRI` (not just `owl:versionInfo`) + a dated release snapshot in `/harness/`** (OWL 2 §3.1; Gandon).
  3. **Q4 — flat now (7-0-0), with the unified reopening criterion** (a sub-vocabulary earns a URI segment only when it becomes an independent dereference/version/import unit). Davis withdrew his primary attack once Pandit supplied that finding.
  4. **Q5 — keep the split (7-0-0), governed by Baker's binding placement procedure** (citation test + harness-default + promote-only-by-council + never-demote + one-directional dependency), realised as **`/harness/` a PATH under ONE `/opda/` redirect, not two coordinate namespaces** (the harness is co-stewarded, not separately delegable). Davis fully withdrew; his "standing tribunal" attack is what forced the procedure into existence — the session's most durable artefact — and it aligns with opda's own ODR-0027 doctrine.
  5. **Q7 — shape nodes `/pdtf/`, documents `/harness/`, `/shacl/` rejected 7–0–0.** This answers the directing authority's `/shacl/` question: no.
  6. **Q8 — disaggregate; documents → `/harness/`; profile node/resource placement by warranty, default `/harness/profiles/`.** The one genuine policy question for the operator: *are the overlay profiles published as normative PDTF?* If yes, named profiles promote to `/pdtf/profiles/`.

**As-built findings that sharpened the verdict:** the EVIDENCE/ADR-0006 framing of DPV as a "hash precedent" is imprecise — DPV is *slash-to-module + hash-within*, a **counter-precedent** to flat-slash-per-term (Gandon, Pandit). The record must state plainly that opda diverges from **both** DPV and hm on hash (Q2) and modules (Q4), with eyes open, *because it is pre-publication and single-context* — not imply the precedents endorse the choice.

**Downstream:** the namespace migration (emitter + all TTLs + loader + ODR/ADR + scripts/docs) is unblocked once ADR-0006 is amended per the six dispositions and the directing authority rules on Q8. Status: the amendments are **proposed**; the operator ratifies. ODR-0004 §Rules.1's hash commitment is overridden by Q2 *conditionally* (with the dereference commitment).

## Tally appendix

Positions are FINAL (post cross-talk). Q2 stance: **H** = Option H hash (`…/pdtf#Property`), **S** = slash.

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
|---|---|---|---|---|---|---|---|---|
| Kendall (Queen) | FOR | **H** | FOR | FOR | FOR | FOR | FOR | REVISE |
| Davis (DA) | FOR | **H**¹ | FOR | FOR² | FOR³ | FOR | FOR | REVISE⁴ |
| Baker | FOR | **H** | FOR | FOR | FOR | FOR | FOR | REVISE⁵ |
| Gandon | FOR | **H** | FOR | FOR | FOR | FOR | FOR | REVISE |
| Allemang | FOR | **S** | FOR | FOR | FOR | FOR | FOR | REVISE⁴ |
| Knublauch | FOR | **S**⁶ | FOR | FOR | FOR | ABSTAIN | FOR | REVISE⁵ |
| Pandit | FOR | **H** | FOR | FOR | FOR | FOR | FOR | REVISE⁴ |
| **Tally** | **7-0-0** | **5H-2S → REVISE→hash** | **7-0-0** | **7-0-0** | **7-0-0** | **6-0-1** | **7-0-0** | **REVISE** |

¹ Q2 hash is Davis's one remaining held dissent (joint with the H-majority). ² withdrew clean once Pandit supplied the reopening-criterion finding. ³ fully withdrew once Baker hardened the boundary into a binding procedure + ruled path-not-coordinate-namespace. ⁴ default `/harness/profiles/`; node namespace = operator policy call. ⁵ lean normative shape-nodes → `/pdtf/` on authorship/part-of. ⁶ deferred to the web-architects; FOR-slash as filed.

### DA scorecard (Ian Davis)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **WITHDRAWN** | Hierarchical URIs along the stewardship axis — correct. |
| Q2 | **HELD** (now the majority view) | His hash position *won the room* — Gandon + Baker + Pandit joined. The held content: rule 2's slash override fails its own reopening test → revert to hash (Option H). **Re-open trigger:** if the operator keeps slash, a per-term 303/content-negotiation build is mandatory or the URIs 404. |
| Q3 | **WITHDRAWN** | His demand — a citable versioned release URI in `/harness/` — was adopted. |
| Q4 | **WITHDRAWN** (clean) | Pandit supplied the finding he demanded ("premature segmentation, no independent-versioning/adoption driver"); condition (record the reopening criterion) met. |
| Q5 | **WITHDRAWN** (full) | Baker hardened the boundary into a binding placement procedure (the attack's payoff) and ruled `/harness/` a path under one authority, not a coordinate namespace; Allemang's httpRange-14 point closed the residual. |
| Q6 | **WITHDRAWN** | Easy case; natural key preserved. |
| Q7 | **CONCEDED** (aligned) | He independently rejected `/shacl/` and placed nodes in `/pdtf/`. |
| Q8 | **WITHDRAWN** (substantially) | Node/document split + default-to-`/harness/profiles/` adopted. **Held residual:** opposes any blanket `/pdtf/profiles/`; node namespace is the operator's policy call. |

**Held-as-live dissent (Q2) — now the council's majority recommendation, not a lone DA hold.** Gandon + Baker + Pandit + Davis (4 of 7, incl. the DPV principal author + two web-architects + the DA) recommend a **hash within the standard segment** (`https://w3id.org/opda/pdtf#Property`): rule 2's slash override **fails ODR-0004's own reopening trigger** (≥1,000 terms / named consumer — both unmet) and the DPV/hm precedents are slash-to-module + hash-within, not flat-slash. This **contradicts the directing-authority's explicit no-hash directive** — recorded as a verdict the **operator ratifies**: accept Option H (hash), or override the council and keep slash *with* a committed per-term resolution build. **Re-open trigger** (if slash kept): the per-term 303/conneg infrastructure is not delivered → hash reinstated. Recorded in ADR-0006 council-dispositions §1.

### Per-question count

Q1 7-0-0 · Q2 **5H-2S** (the one genuinely contested question; council recommends hash against the directing-authority rule — operator ratifies) · Q3 7-0-0 · Q4 7-0-0 · Q5 7-0-0 · Q6 6-0-1 · Q7 7-0-0 · Q8 REVISE (policy call to operator). After full cross-talk only Q2 (hash vs the no-hash directive) and Q8 (profile normativity) remain for the operator; everything else converged.
