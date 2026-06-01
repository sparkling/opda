# Session 037 — Davis (Devil's Advocate) positions

**Ian Davis** — co-author, *Linked Data Patterns* (Dodds & Davis, 2012). Lens: publish-first, scope-discipline, deployment realism. BBC / UK Gov linked-data deployments.

My through-line: this scheme is **strongest where it buys persistence** (w3id.org, no version segment) and **weakest where it invents structure before it has consumers** (the multi-namespace `/pdtf/` vs `/harness/` partition, and the foreclosure of modules). *Linked Data Patterns* warns repeatedly against designing the namespace topology ahead of the data and the consumers it must serve. I attack the partition hardest; I concede persistence cleanly. Silent contrarianism would fail this role as much as silent alignment, so where the proposition is right I say so and ballot FOR.

---

## Q1 — Org/standard split + base path (`https://w3id.org/opda/pdtf/`)

**Davis (DA): AFFIRM. Ballot: FOR.**

This is the **Hierarchical URIs** pattern (Dodds & Davis) used correctly: the path expresses a real, durable containment — an organisation (`opda`) that may one day steward more than one standard, and the standard itself (`pdtf`). That is exactly the dimension along which hierarchy is cheap and honest: it reflects ownership/stewardship, which is the *one* thing about a namespace that genuinely does not change. The DPV precedent is `w3id.org/dpv/` (org-ish root) with the vocabulary hung beneath it; `opda/pdtf/` is the same move. I would only flag that putting the standard name in the path is a mild bet that opda-the-org outlives pdtf-the-standard-name — but that is the *correct* bet to make under a persistence-first policy (the org redirect persists; a standard rename is a new path, not a broken one).

Rejected alternatives are rightly rejected: bare `w3id.org/opda/` loses the ability to ever host a second standard without retrofitting; `w3id.org/pdtf/` couples the permanent identifier to a programme name (the same coupling S004 rejected for `trust.propdata`).

**Disposition: WITHDRAW.** I have no dissent. The org/standard hierarchy is the load-bearing, change-resistant axis and the proposition partitions along it correctly.

---

## Q2 — Hash vs slash (slash per-term, no hash)

**Davis (DA): REVISE. Ballot: ABSTAIN (leaning AGAINST the framing, not the outcome).**

The proposition overrides ODR-0004's council-ratified **hash** commitment (S004, 9-0, Knublauch DA fully withdrawn) on greenfield grounds. I do not contest the *authority* to override pre-publication — [[opda-greenfield-no-wg-gate]] is legitimate. I contest the *reasoning*, because the brief's own prior art cuts against slash:

- **DPV — the cited precedent — uses HASH for terms** (`w3id.org/dpv/pd#Address`). The proposition cites DPV for w3id.org persistence and then discards DPV's actual term shape.
- The classic trade (Berners-Lee, *Cool URIs for the Semantic Web*, W3C Interest Group Note 2008; httpRange-14): **hash** means one document dereferences the whole vocabulary and fragments resolve client-side — *cheap* for a small, stable vocabulary that ships as one file. **Slash** means each term is independently dereferenceable — which only pays off if you actually serve per-term content negotiation.

opda emits **one flat namespace** (Rule 4). So slash buys the per-term-dereference benefit only if the redirect/host actually serves 147+ individual term documents. If — as is overwhelmingly likely at this stage — it serves one TTL file behind a `w3id.org/opda/pdtf/` redirect, then **slash gives no dereference advantage over hash**, and the override of a 9-0 council decision purchases nothing operationally. This is the **Rebased URI** anti-pattern in miniature: re-coining every term URI for a benefit you are not positioned to realise.

That said — I withhold an AGAINST ballot because slash is the strictly more *future-proof* default if per-term resolution is ever wanted, and re-coining now (pre-publication, zero consumers) is precisely when re-coining is free. The cost is one-time and internal. So the decision is defensible; the *rationale as written* ("slash, because") is not. **Revise the rationale to state the actual trade**: slash is chosen not because it dereferences better today (it does not, given Rule 4's single document) but because it preserves the *option* of per-term resolution at zero migration cost while we have no consumers — and to note explicitly that this overrides DPV's hash shape, not follows it.

Citation: *Linked Data Patterns* — **Patterned URIs** (consistency over cleverness) and the hash/slash discussion; Sauermann & Cyganiak, *Cool URIs for the Semantic Web* (W3C Note, 2008).

**Disposition: HOLD.** Dissent: the scheme cites DPV for persistence while silently inverting DPV's term shape, and the stated benefit of slash is not realisable under Rule 4. **Single named re-open trigger:** if, at first publication, the host serves *one* ontology document rather than per-term-negotiated resources, re-open Q2 to confirm slash earned its override of ODR-0004 — otherwise the hash decision should have stood and the re-coin was waste.

---

## Q3 — Versioning (no version segment; `owl:versionInfo` literal)

**Davis (DA): REVISE. Ballot: FOR (with a required addition).**

Removing the version segment from the *term IRI* is correct and is the DPV precedent (unversioned namespace + dated releases). The **Identifier Opacity / persistent-identifier** discipline says the thing a consumer cites — `opda:Property` — must NOT carry a version, or every release breaks every citation. AFFIRM that much without reservation.

But the proposition as drafted answers only half of Q3, and the half it drops is the half a publisher actually needs. Q3 asks: *does removing the version segment lose the ability to cite a fixed release?* As written, **yes it does** — an `owl:versionInfo "1.0.0"` literal on the ontology is metadata you can read *after* you have dereferenced, but it is **not a citable identifier**. There is no URI that means "PDTF as it stood at 1.0.0." A consumer who needs reproducibility (a conformance claim, a regulatory filing, a test fixture pinned to a release — and PDTF is a *trust framework*, so this WILL be demanded) has nothing to cite.

DPV does not have this gap: DPV ships **dated/versioned release artefacts** alongside the unversioned namespace. The current opda scheme already had `…/opda/1.0.0/` version IRIs (63 of them); the proposition deletes them and replaces them with a literal, which is a strict loss of citability.

**Revise:** keep the live term namespace version-free (correct), but commit to a **memento-style versioned release URI for the document/snapshot** in the *harness* namespace — e.g. `…/opda/harness/pdtf/1.0.0/` resolving to the frozen TTL of that release. Terms stay unversioned and stable; releases stay citable and reproducible. This is the standard split (W3C uses it: `/TR/` dated vs `/TR/latest`). Carrying version *only* in a literal fails the reproducibility requirement of a trust framework.

Citation: *Linked Data Patterns* — **Unique URIs / Identifier opacity**; W3C dated-vs-latest publication convention (`/TR/`); DPV's versioned-release practice.

**Disposition: HOLD.** Dissent: a `versionInfo` literal is not a citable fixed release, and a trust framework will be asked to produce one. **Single named re-open trigger:** the first time any consumer, conformance test, or regulator needs to cite "PDTF at version X" — at which point a versioned release URI must be minted, and it is cheaper to reserve the harness path for it now than to retrofit.

---

## Q4 — Modules / flat namespace (no module segment)

**Davis (DA): REJECT. Ballot: AGAINST.** *(This is my primary attack.)*

Rule 4 is **premature partitioning by fiat — in reverse**. Both sibling precedents in the brief segment by module/context, and both are run by people who had to publish:

- **DPV** (Pandit, principal author): `dpv/pd`, `dpv/legal`, `dpv/legal/eu/gdpr` — slash sub-vocabularies, so a consumer can `owl:imports` the GDPR sub-vocabulary *without* dragging in the whole graph.
- **hm** (the sibling project sharing opda's Jena toolchain): `hm.com/ns/pf/`, `hm.com/ns/sds/` — explicit bounded-context segments.

The proposition flattens 147 terms + enums into one namespace and declares the six module TTLs "organisational splits, not URL segments" — and then admits in the ADR's own implementation note that this **destroys per-module ontology identity** (the six files can no longer each be a distinct `owl:Ontology`; everything collapses to one `owl:Ontology` at the root). That is not a neutral simplification. It **forecloses modular import forever**, pre-publication, with zero consumers having told us they don't want it. The asymmetry is the whole argument: keeping a module segment costs nothing and preserves the option; removing it is irreversible once published (re-introducing a segment later is the **Rebased URI** cost on every term).

The framing error is to treat "flat is simpler" as scope-discipline. It is the opposite. Scope-discipline (my lens) says: do not make an *irreversible, option-destroying* decision to buy a *cosmetic* simplicity, before the consumers who would benefit from modularity exist to weigh in. The honest publish-first move is the *reversible* one: ship module segments (cheap, matches both precedents), and collapse to flat later if and only if no consumer ever uses the modularity — collapsing is far cheaper than splitting.

I will note the one genuine point in the proposition's favour: if opda's six modules are *not* independently importable in practice (heavy cross-references, no clean cut-points), then DPV-style modular import is illusory and the segment is dead weight. But that is an empirical claim about the graph's cut-structure that the proposition does **not** make or evidence — it asserts flatness as doctrine, not as a finding about this graph.

Citation: *Linked Data Patterns* — **Hierarchical URIs** (segment along durable, meaningful boundaries) and the explicit warning *"do not over-design — but equally, do not foreclose — the namespace before you have consumers"*; DPV and hm both segment by context.

**Disposition (revised after cross-talk with Pandit): CONDITIONAL WITHDRAW — ballot moves AGAINST → FOR, conditioned on a recorded reopening criterion.** Pandit supplied the *finding* I demanded: he distinguished *why* DPV earned its segments (GDPR-bound consumers version and adopt independently of the 1000+ term graph) from opda/pdtf's facts (one standard, ~150 terms, single governance owner, released as a unit — no independent-versioning or independent-adoption driver). On those facts segmentation today is dead weight, and a segment with one occupant buys nothing. That converts my objection (1) — flatness-as-doctrine — into flatness-as-finding, and I concede it. **Verbatim what won me over:** *"modules would be premature segmentation with no independent-versioning or independent-adoption driver."*

My objection (2) — irreversible foreclosure — survives *only* if the rule is left unconditional, and is fully cured by **recording the reopening criterion**: *"The flat term namespace holds while PDTF is released as a single unit under one governance owner. Introduce a module segment (`…/pdtf/<module>/`) only when a sub-vocabulary acquires an independent versioning cadence OR an independent adoption/import constituency. Until then, flat."* With a non-breaking carve discipline noted (a future segment hosts *new* sub-vocabulary terms; legacy flat terms stay put, wired by `owl:imports`/`rdfs:isDefinedBy` — they are *not* rebased), the reopening is genuinely cost-free, which removes the only thing my advocacy was protecting.

**So: FOR flat *with* the criterion recorded; AGAINST an *unconditional* flat rule.** The single re-open trigger is now the criterion itself (independent versioning cadence or adoption constituency for a sub-vocabulary). Citation unchanged: *Linked Data Patterns* — **Hierarchical URIs**, the over-design-but-don't-foreclose warning; DPV's segmentation rationale (Pandit, principal author) as the discriminating precedent.

**Settled (Pandit adopted the criterion + rider verbatim — condition met, clean withdrawal).** Pandit is recording the criterion as the agreed Q4 amendment *and* the non-breaking-carve rider — *"a later carve adds a segment for NEW terms; already-minted flat IRIs are never rebased"* — with the proof point that this is exactly how DPV itself grew: the bare `dpv:` core terms kept their minted IRIs as modules were added around them; nothing already published moved. That turns my abstract Rebased-URI warning into a documented precedent (a w3id vocabulary that actually performed the non-breaking carve), which is stronger than my objection assumed. **The condition on my conditional withdrawal is fully met; I withdraw to FOR, single-voiced with Pandit on Q4.**

---

## Q5 — Standard-entity vs physical-resource split (`/pdtf/` vs `/harness/`)

**Davis (DA): REVISE. Ballot: AGAINST as stated; FOR a narrowed version.** *(Second primary attack.)*

The split's *coarse* form is defensible: keeping governance/build apparatus (ADRs, ODRs, exemplars) out of the term namespace is sound — those genuinely are "about" the standard, not part of it, and conflating documentation URIs with vocabulary URIs is a real **Patterned URIs** smell. To that extent I AFFIRM.

What I REJECT is the split as a **load-bearing semantic boundary** ("standard entities vs physical resources") that placement decisions must be adjudicated against. The brief proves the problem itself: in the *first sitting*, the rule generates **three boundary disputes** — data-dictionary (Q6), shape nodes (Q7), profiles (Q8). A boundary that needs three council rulings on first contact is not a boundary; it is a standing tribunal. Every future artefact kind (crosswalks, mappings, fixtures, examples) will arrive asking "pdtf or harness?" and the proposition supplies **no decision procedure**, only the intuition *"is it a standard entity?"* — an intuition Q7 already breaks, because a SHACL shape is minted in the `opda:` namespace, is arguably part of what the standard *is*, yet describes physical data.

The publish-first counter is the cheaper design: **one term namespace `…/opda/pdtf/`, distinguish kinds with `rdf:type`.** Type is queryable (`?s a opda:Shape`), re-classifiable without re-coining, and never strands a URI on the wrong side of a wall. The split's only claimed benefit — "what a consumer cites *as* the standard" — is *hypothetical* (no consumers) while its governance cost is *immediate and recurring* (three disputes already). This is the textbook case of designing the namespace topology ahead of the consumers it is meant to serve.

**Revise to a two-tier, not a semantic-boundary, split:** (1) `…/opda/pdtf/` = everything in the published vocabulary graph (classes, properties, SKOS, **and** shapes — all `rdf:type`-distinguished); (2) `…/opda/harness/` = build/governance/instance apparatus that is uncontroversially *not* vocabulary (ADRs, ODRs, test data, named graphs). The dividing line becomes "is it in the published graph?" — a near-mechanical test — rather than "is it a *standard entity*?" — a metaphysical one. That dissolves Q6/Q7/Q8 into one rule instead of three votes.

**Refinement after cross-talk with Allemang (the load-bearing distinction).** There are *three* positions, and precision matters for the record: **(1)** two **coordinate** w3id namespaces — `/opda/pdtf/` and `/opda/harness/` as *separate PICG submissions / separate redirect rules* (the proposition); **(2)** one namespace, period — everything flat under `/pdtf/`, churn and all; **(3)** **one redirect root with a `/harness/` path prefix** — `/opda/` is the single authority, `/opda/pdtf/...` and `/opda/harness/...` are *paths beneath it*, not coordinate namespaces. I am at **(3)**, not (2). I explicitly **want** the `/harness/` path: putting 300+ ADR-citation URIs and test fixtures into the flat space a consumer dereferences as the vocabulary is the over-design's mirror-image error — it makes the published graph unbounded and unstable. The churny apparatus must be off the term path. So instance/test data goes under `…/opda/harness/data/...` — a *path*, not a coordinate namespace. My attack is precisely the gap between (1) and (3): the standard-vs-physical distinction is **already carried twice** — by `rdf:type` *and* by ADR-0036/0037's three-graph separation — so minting it a *third* time as two coordinate w3id namespaces (two PRs to perma-id, two redirect rules that can drift) pays again for a cut the data model already makes. One redirect, two paths, kinds by type. The one place (1) legitimately returns: if PICG mechanics cannot fan a single `/opda/` rule out to *different hosting targets* for pdtf vs harness, then two rules is a **deployment** necessity — but ADR-0006 itself decouples URI policy from redirect target, so that is a hosting concern that must not drive the URI scheme.

Citation: *Linked Data Patterns* — **Hierarchical URIs**, **Natural Keys** (let the type, not the path, carry classification), and the over-design warning; the **rdf:type-over-URI-partition** principle (classification is data, not topology) — consistent with opda's own [[opda-classification-over-inheritance]] doctrine (ODR-0027): *classify with values, don't fork structure*. Partitioning the namespace by kind is the URI-space version of the subclass-tree mistake ODR-0027 already rejected.

**Resolution after cross-talk with Baker (the "standing tribunal" charge is killed).** Baker did not defend the boundary as drafted — he *hardened* it in direct response to this attack, and supplied the decision procedure whose absence was the whole of my charge. His procedure: **governance/identity boundaries go in the URI; logical/serialisation/type distinctions go in triples**, operationalised by a falsifiable test — *"Would a consumer ever cite this resource AS part of the normative standard, or version/deprecate it as a unit of the standard?"* (Yes → `/pdtf/`; No → `/harness/`) — plus a fallback: **ambiguous → default `/harness/` (the re-classifiable side); promote to `/pdtf/` only by council; never DEMOTE a published `/pdtf/` URI.** This kills my "standing tribunal" objection at the root: the test gives the same answer to the next artefact kind without a fresh vote, so the three "disputes" are a one-time *calibration* at design time, not recurring litigation. **Verbatim what won me over:** *"put governance/identity boundaries in the URI; put logical/serialisation/type distinctions in triples"* — with the citation-test as the binding placement procedure.

Baker also landed a correction I own: the **DCMI never-reassign-a-published-term-URI** rule. I was sloppy — `rdf:type` is re-classifiable, but *which side of a wall a URI sits on, when the wall is IN the URI*, is not, and that asymmetry is real (a published `/pdtf/` URI can never be demoted). The default-to-harness + promote-only-by-council fallback resolves it correctly: my re-classifiability where it's cheap, his stability where it's load-bearing. **I withdraw the "standing tribunal" attack and the single-namespace REVISE in full.**

**Residual (a refinement to Baker's hardened position, not a rejection):** his "boundary earns the URI" principle is *agnostic between* (a) two **coordinate** w3id namespaces (two PICG PRs, two redirect rules) and (b) **one redirect root with `/pdtf/` and `/harness/` as PATH segments**. The citation-test resolves placement identically under both; (b) achieves it at half the redirect-maintenance surface (one rule, no sibling drift). So my surviving point is narrow: *the wall is a path segment under one authority, not a second authority* — unless the governance model genuinely needs `/pdtf/` and `/harness/` separately delegable/transferable (different stewardship/PICG ownership), in which case the second coordinate authority is earned and I withdraw the residual too. That is Baker's call to make; he owns the governance lens.

**Disposition: PARTIAL WITHDRAW.** Withdrawn: the standing-tribunal attack and the single-namespace REVISE (Baker's binding citation-test + default-to-harness + promote-only-by-council + never-demote fully answer the governance objection — I ballot FOR that procedure). **Retained (narrow):** path-segment vs coordinate-namespace for the standard/harness cut. **Single named re-open / collapse trigger:** if the governance model requires `/pdtf/` and `/harness/` to be *separately delegable authorities*, two coordinate namespaces is earned and the residual collapses to FOR; if they are always co-stewarded by opda, the cut is a path under one authority.

---

## Q6 — data-dictionary placement (582 entries → `/harness/`)

**Davis (DA): AFFIRM. Ballot: FOR.**

Under *my* revised Q5 test ("in the published vocabulary graph?") the data-dictionary entries are the **physical PDTF data fields** — concrete instance-level field descriptors keyed `propertyPack.environmentalIssues.flooding`, not abstract vocabulary terms — so they fall to `/harness/`. That happens to be the proposition's outcome too, so I ballot FOR the *placement*. The keys are **Natural Keys** (Dodds & Davis) — the existing dotted field path is a perfectly good, meaningful natural key and should be preserved verbatim in the new URI (`…/harness/data-dictionary/propertyPack.environmentalIssues.flooding`), which the mapping does. Good.

One caution, not a dissent: this is the *easy* case (582 obviously-instance-level fields), and the proposition uses it to make the whole split look self-evident. The split's difficulty lives in Q7/Q8, not here. So I affirm Q6 while noting it is not evidence for the split's general soundness.

Citation: *Linked Data Patterns* — **Natural Keys** (preserve the meaningful existing key in the URI).

**Disposition: WITHDRAW** on placement. The data-dictionary is not vocabulary by any test; `/harness/` is right, and the natural key is preserved. No dissent on Q6 itself.

---

## Q7 — SHACL shape node placement (`/pdtf/` vs `/shacl/` vs `/harness/`)

**Davis (DA): REJECT the three-way question; the answer is `/pdtf/`. Ballot: FOR `/pdtf/`, AGAINST a dedicated `/shacl/`.**

This is the question that breaks the proposition's own boundary, and it is decided cleanly by my Q5 revision. A SHACL shape node minted in the `opda:` namespace **is part of the published vocabulary graph** — it is a first-class artefact a conformance consumer dereferences to validate against the standard. So it lives in `…/opda/pdtf/`, `rdf:type opda:Shape` (or `sh:NodeShape`), distinguished by type, not by a wall.

I ballot **AGAINST a dedicated `/shacl/` namespace** outright: that is a *third* partition introduced to paper over the fact that shapes don't fit the standard-vs-physical binary. Adding a namespace to resolve a boundary dispute is the partition disease metastasising — exactly the over-design *Linked Data Patterns* warns against. Two namespaces that can't classify shapes do not get better by becoming three.

The shape/profile **documents** (the .ttl files, build artefacts) are a different thing from the shape **nodes** (the `sh:NodeShape` IRIs); documents are not vocabulary and belong in `/harness/` (consistent with Q6's "physical artefact" reasoning). The proposition already half-says this — I'm endorsing the document/node distinction and ruling that *nodes* go to `/pdtf/`.

Citation: *Linked Data Patterns* — over-design warning, **Patterned URIs**; [[opda-classification-over-inheritance]] (ODR-0027) — type-as-classification, not namespace-as-classification.

**Disposition: HOLD** against any `/shacl/` namespace. Dissent: a third namespace is the wrong fix; type-distinguish shape nodes inside `/pdtf/`. **Single named re-open trigger:** a published SHACL profile that a consumer must dereference *independently of the ontology* (separate content negotiation, separate versioning cadence) — only then does a distinct shapes-document namespace earn its keep, and even then for *documents*, never for *nodes*.

---

## Q8 — Profiles (per-form overlays: baspi5, ta6, con29R, llc1, … 31 forms)

**Davis (DA): REVISE. Ballot: AGAINST `/pdtf/profiles/` as a blanket rule; FOR a node/document split.**

Profiles are the hardest case and the proposition's binary handles them worst. A per-form overlay profile is a **SHACL shape document** that is `dct:source`-linked to an *external* form question (baspi5, con29R, etc.). Two facts pull in opposite directions: the profile *shape nodes* are minted in `opda:` (vocabulary-graph members, like Q7's shapes → `/pdtf/`); but a profile is intrinsically *about an external, physical artefact* (a specific paper/agency form) and is far closer to instance/harness material than to the abstract standard. baspi5 is not "the PDTF standard" — it is "how PDTF binds to *this one form*."

Resolve it exactly as Q7: **shape nodes → `…/opda/pdtf/profiles/<name>`** (type-distinguished, part of the published graph a consumer validates against); **profile documents + the external-form binding/provenance → `…/opda/harness/profiles/<name>`**. Do **not** adopt a blanket "profiles are standard entities → `/pdtf/profiles/`," because that drags 31 form-specific, externally-sourced overlays into the namespace a consumer is told *is the PDTF standard* — and 31 form bindings are emphatically *not* the standard; they are applications of it. This matters for the very "what does a consumer cite as PDTF?" rationale the split was built on: you do not want `con29R` answering to `…/pdtf/`.

I flag a scope-discipline point too: with 31 forms each potentially versioning on its own cadence (forms get revised by their issuing bodies), profiles are precisely where the **versioned-release** gap from Q3 bites first. A profile pinned to "baspi5 as the form stood in 2026" needs the versioned harness URI I asked for in Q3.

Citation: *Linked Data Patterns* — **Patterned URIs** (the node/document distinction applied consistently across Q7 and Q8), over-design warning; ODR-0010/0013 (overlay mechanism) constrain the *shape* semantics, not the *URI* placement, so this is open for the council to set.

**Disposition: HOLD.** Dissent: blanket `/pdtf/profiles/` mis-files 31 externally-sourced form bindings as "the standard"; split nodes (`/pdtf/`) from documents+binding (`/harness/`), as in Q7. **Single named re-open trigger:** the WG (or a real consumer) explicitly declares the form-profiles to be normative parts of the PDTF standard itself, not applications of it — then profile documents may move to `/pdtf/`. Absent that declaration, they are applications and the binding lives in `/harness/`.

---

## Summary ballot

| Q | Verdict | Ballot | Disposition |
|---|---|---|---|
| Q1 org/standard base | AFFIRM | FOR | WITHDRAW |
| Q2 slash vs hash | REVISE | ABSTAIN | HOLD — re-open if host serves one document |
| Q3 versioning | REVISE | FOR (+ versioned release URI) | HOLD — re-open on first "cite version X" |
| Q4 flat / no modules | REVISE | FOR flat *with* recorded criterion / AGAINST unconditional flat | CONDITIONAL WITHDRAW (Pandit) — re-open when a sub-vocabulary versions or is adopted independently |
| Q5 standard-vs-physical split | REVISE | FOR Baker's citation-test procedure + default-to-harness; AGAINST two coordinate namespaces (narrow residual: path, not 2nd authority) | PARTIAL WITHDRAW (Baker) — residual collapses to FOR if `/pdtf/` & `/harness/` need separate delegation |
| Q6 data-dictionary → harness | AFFIRM | FOR | WITHDRAW |
| Q7 shape nodes | REJECT 3-way; → `/pdtf/` | FOR `/pdtf/`, AGAINST `/shacl/` | HOLD against any `/shacl/` |
| Q8 profiles | REVISE | AGAINST blanket `/pdtf/profiles/` | HOLD — node/document split |

**Net (after cross-talk).** Both of my primary structural attacks were answered by grounded counters and I moved on both — which is the point of the role, not its failure. I affirm the persistence-bearing, change-resistant decisions (Q1, Q3-core, Q6). On **Q4 (flat namespace)** I conditionally withdrew after Pandit supplied the missing finding (no independent-versioning/adoption driver at opda's scale) — flat is sound *provided the reopening criterion is recorded* so the carve stays non-breaking. On **Q5 (the standard/harness partition)** I withdrew the "standing tribunal" attack after Baker hardened the boundary into a *falsifiable, binding citation-test* with a default-to-harness / promote-only-by-council / never-demote fallback — that fully answers the governance objection (and corrected me on the DCMI never-reassign asymmetry), so I ballot FOR the procedure. My remaining dissent is now a single narrow refinement: express the standard/harness cut as a **path segment under one authority**, not as **two coordinate w3id namespaces**, unless the governance model needs them separately delegable — Baker's call. On **Q2/Q3** I HOLD with narrow re-open triggers rather than attack: the decisions are defensible but their stated rationales are incomplete (slash buys nothing under a single document; a `versionInfo` literal is not a citable release — a versioned release URI should be reserved in `/harness/`). The through-line holds: the scheme is right where it buys persistence and earns its structure; my residuals are about *not minting a distinction twice* and *recording reopening triggers so nothing is foreclosed irreversibly*.
