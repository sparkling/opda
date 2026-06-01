# Session 037 — Pandit

**Lens:** principal author of the W3C Data Privacy Vocabulary (DPV), `https://w3id.org/dpv/`. DPV is the precedent ADR-0006 cites, so its scheme is the live counter-evidence on Q2 (hash) and Q4 (modules). I argue from what DPV actually did and *why*, not from generic "best practice."

**Sources I rely on:**
- DPV specification + namespace/serialisation docs (`https://w3id.org/dpv/`, the `dpv`, `dpv/pd`, `dpv/legal`, `dpv/legal/eu/gdpr` module IRIs).
- Pandit et al., "Creating a Vocabulary for Data Privacy: The First-Year Report of Data Privacy Vocabularies and Controls Community Group (DPVCG)", SEMANTiCS / OTM 2019 — the hash + modular-namespace rationale.
- DPV release practice (unversioned term IRIs, dated/numbered releases) at `https://w3id.org/dpv/`.
- The W3C PICG redirect (`https://github.com/perma-id/w3id.org`) as DPV uses it.

---

**Pandit (Q1 — Org/standard split + base path): AFFIRM. Ballot: AYE.**

`https://w3id.org/opda/pdtf/` (org `opda`, standard `pdtf`) is the right shape, and it is *more* disciplined than DPV's own root, which I would change if I were starting over.

DPV occupies the bare `w3id.org/dpv/` — `dpv` is simultaneously the organisation-ish CG namespace and the core vocabulary. That conflation is a known wart: it means the core terms and the project root share a path, and there is no clean place to hang a *second* standard from the same owner. opda avoids exactly that by separating the **owner segment** (`opda`) from the **standard segment** (`pdtf`). Under w3id, the owner directory is the unit the PICG redirect is keyed on (one `/opda/` directory, one maintainer entry), and the standard is a sub-path within it. That is the correct granularity: it lets opda mint a future second standard under `/opda/<other>/` without re-litigating the redirect or colliding term spaces.

Rejecting the single `w3id.org/opda/` (no standard segment) is correct — it would repeat DPV's conflation. Rejecting `w3id.org/pdtf/` (no owner segment) is correct — it drops the persistence anchor that the whole w3id choice exists to provide; the owner is what survives a programme rename, exactly the argument Knublauch and I made at S004 for w3id over an institutional domain.

---

**Pandit (Q2 — Hash vs slash): REVISE → Option H. Ballot: AGAINST bare slash as the default; FOR `…/opda/pdtf#Property` (hash within the `/pdtf/` standard segment). Bare slash admissible only with a committed per-term resolution build.**

I revised here. My first draft voted "slash-conditional-AYE" on the view that slash is the better long-run choice with a recorded dereference caveat. Gandon (web architecture) supplied the sharpening that changed my mind, and on reflection it is decisive — so I am now FOR **Option H**, hash retained within opda's good `/pdtf/` standard segment. The honest position, given that DPV is *my* hash precedent, is to recommend hash, not to hedge toward slash.

**Why DPV chose hash.** DPV uses hash terms within each module (`dpv/pd#Address`, `dpv/legal/eu/gdpr#A6-1-a`) for one dominant operational reason, recorded in the 2019 report: a hash term is a **fragment of a single document**. Dereferencing any term fetches the whole module file in **one HTTP round-trip with no per-term server configuration** — the fragment is resolved client-side. For a vocabulary served as static files behind a w3id 302, that is the lowest-friction arrangement that still satisfies httpRange-14 (the hash URI denotes a non-information resource; the document it is a fragment of is the information resource; no 303 dance, no negotiation config).

**Why that rationale applies to opda *more* strongly than to a DPV module (Gandon's Recipe-3 point).** The Q5 `/pdtf/` ÷ `/harness/` partition does decisive work here: because `/harness/` already pulls the 582 data-dictionary entries and all instance/test data *out* of the term space, what remains at `…/opda/pdtf` is **~147 terms + the SKOS schemes = one co-evolving document**. That is textbook **Cool URIs §4.1 / Berrueta & Phipps 2008 Recipe 3** — the small, stable, single-document vocabulary case where **hash is the canonical recommendation, not a fallback**. opda's `/pdtf/` is *more* mono-artefact than a DPV module, so I cannot coherently cite DPV-hash as the precedent and then default opda to slash.

**The dichotomy bare slash leaves you with (the concern I raised with gandon, and he confirmed).** A bare per-term slash URI under w3id's single flat 302 rewrite gives you either:
1. **302 → 200 of a document with no per-term content negotiation** — the consumer parses the whole graph anyway, so you paid a redirect round-trip for *addressability only, not partial retrieval*, and arguably leave an httpRange-14 ambiguity about what the 302 target denotes; or
2. **real per-term content negotiation at the hosting target** — which w3id's redirect layer does **not** provide, so it is **net-new hosting infrastructure** opda must build and maintain.

Hash collapses both away with zero added infrastructure. Option H is therefore the lower-friction *and* the more conformant choice.

**Exact amendment I move:** revise ADR-0006 rule 2 to — *"Terms are addressed as hash fragments of the single `/pdtf/` ontology document: `https://w3id.org/opda/pdtf#Property`, `…/pdtf#role/Buyer`. This reaffirms ODR-0004 §Rules.1. Bare per-term slash URIs are admissible ONLY if opda builds and maintains per-term content negotiation at the hosting target (w3id's flat 302 does not provide it); absent that build, slash either wastes a redirect round-trip or leaves an httpRange-14 ambiguity, so Option H is the recommended form."* Co-signed dereference-infrastructure caveat with Gandon.

**Composition note (so we don't overclaim):** Option H composes cleanly with my other rulings. The `opda` org segment (Q1) + `pdtf` standard segment (Q1) + `#term` fragment are orthogonal and stack: `https://w3id.org/opda/pdtf#Property`. The SKOS concepts become fragments of the same single `/pdtf` document (`…/pdtf#role/Buyer`) — SKOS-correct because scheme identity is `skos:inScheme` membership, not URI prefix (Baker, §4.6) — and that is fully consistent with the flat-namespace ruling (Q4). Hash does **not** reintroduce a module segment and does **not** disturb the standard/harness split (Q5).

**Where this leaves the greenfield override — and this is the one question where the proposal's rule should flip.** ADR-0006 cites "DPV's slash→hash six-month precedent" as the reason hash was *originally* safer. That precedent shows that **changing the dereference scheme after publication is the expensive thing** — it argues for the override's *admissibility* (opda is pre-publication, so it may change freely), but it does **not** argue that slash is *better*. On the merits the engineering case points the other way: three web-architects (incl. Gandon), DPV's principal author (me), and the original directing-authority hash decision (ODR-0004 §Rules.1) all align on hash. Greenfield means opda is free to pick the right scheme — and the right scheme is hash. So the override should be exercised to **keep hash**, not to discard it. Q2 is the single point where the proposal's slash rule is weakest; I recommend the synthesis flip it to Option H.

---

**Pandit (Q3 — Versioning): AFFIRM. Ballot: AYE.**

No version segment in term IRIs; version carried by `owl:versionInfo` — this is exactly DPV's practice and I endorse it without qualification.

DPV term IRIs are **unversioned** (`dpv:PersonalData` is stable forever); releases are dated/numbered at the *release artefact* level, not in the term path. The reason is the one that matters most for a standard meant to be cited: a consumer who writes `opda:Property` into their data should never have that reference silently rot or fork because opda cut a 1.1.0. The term identity must outlive the release. Baking `1.0.0/` into the IRI (the current `…/opda/1.0.0/` form) forces either citation churn on every release or a pile of `owl:sameAs`/`owl:priorVersion` glue — DPV avoided both by keeping the term path version-free and putting version metadata on the ontology node.

`owl:versionInfo` on the single `owl:Ontology` is the right carrier. I'd add, from DPV experience, that opda should *also* emit `owl:versionIRI` if it wants a dereferenceable snapshot (e.g. `…/opda/pdtf/` as the version-independent ontology IRI, plus an optional dated `owl:versionIRI` for archival pinning) — but that snapshot IRI lives in the **harness** (it is provenance about a release), not in the term space. The proposal's instinct (version is metadata, not path) is correct and matches the strongest analogue. AYE.

---

**Pandit (Q4 — Modules / flat namespace): AFFIRM, with a recorded reopening criterion. Ballot: AYE.**

Here I am again the counter-evidence — DPV uses module segments (`dpv/pd`, `dpv/legal/eu/gdpr`) and the proposal flattens. I have thought about this against davis-DA's anticipated "modules are over-engineering" line, and on opda's facts the flat namespace is correct. But the *reason* matters, because it tells you when to revisit.

DPV modularised for two drivers that opda does **not** currently have:
1. **Independent governance domains.** Personal-data categories (`pd`), purposes, processing, and *jurisdiction-specific* legal bases (`legal/eu/gdpr`, `legal/eu/dga`, …) are owned and evolve on different clocks. The GDPR module changes when EU law changes; the `pd` taxonomy changes when the CG extends categories. Module segments let each version and be cited independently.
2. **Independent adoption / partial consumption.** A consumer building on GDPR legal bases does not want the entire 1000+-term DPV graph; the module boundary is the retrieval and import boundary.

opda/pdtf has neither: it is **one** standard, ~150 terms, a single governance owner, released as a unit. Imposing `/property/`, `/role/`, etc. as IRI segments would be premature segmentation — it manufactures versioning/import boundaries that nothing in the standard actually crosses. The six module TTLs are a *file-organisation* convenience; the ADR-0006 instinct that they are "organisational splits, not URL segments" is right. AYE.

Where I push back on a *pure unconditional* flat rule: flattening forecloses carving a module later **without an IRI break**, and an IRI break post-publication is the expensive thing DPV's history warns about. So the rule should be flat-*now* with an explicit reopening criterion.

**The SKOS-governance grounding (Baker raised this; it sharpens the verdict).** Baker (DCMI/SKOS) asked whether DPV's per-module namespace was *essential* for governance/deprecation, or whether one flat namespace + `skos:inScheme` membership could have carried the partition. The decisive fact, per **SKOS Reference §4.6**, is that `skos:ConceptScheme` membership is asserted by **`skos:inScheme`, not by URI prefix** — so *scheme identity* is intact under a flat namespace. What DPV's module segment actually bought was **not** scheme identity but three *operational* affordances `skos:inScheme` cannot give: (a) independent **dereference** (fetch just the GDPR module, not the 1000+-term graph); (b) independent **versioning** (the GDPR module re-releases on EU-law's clock); (c) independent **citation/import** (`owl:imports` one module). Baker's "deprecate `dpv/legal/eu/gdpr` wholesale" example is really (b)+(c) — deprecating a *release+import unit*, a document boundary the URI segment was made to coincide with. opda's six modules are **file splits, not release/import/dereference units** — nothing re-releases "role" independently of "property" — so none of (a)-(c) has a driver. Hence flattening is correct, and `skos:inScheme` carries scheme identity logically. opda's **45 SKOS schemes under one flat `/pdtf/`** are SKOS-correct *precisely because membership ≠ prefix*.

**Exact amendment I move (agreed wording, davis-DA).** davis-DA's REJECT on Q4 was never "flat is wrong" — it was (1) the proposition states flatness as *doctrine* rather than a *finding*, and (2) a pure flat rule forecloses the carve irreversibly. He withdrew the AGAINST on the explicit condition that the reopening criterion is *recorded*. We converged on his phrasing, which I adopt verbatim because it names the holding condition as well as the trigger:

> *"The flat term namespace holds while PDTF is released as a single unit under one governance owner. Introduce a module segment (`…/pdtf/<module>/`) only when a sub-vocabulary acquires an independent versioning cadence OR an independent adoption/import constituency. Until then, flat."*

Add to it the SKOS rider (Baker, §4.6) and the non-breaking-carve rider (davis-DA):
> *"SKOS scheme identity is carried by `skos:inScheme` membership (SKOS Reference §4.6), not by URI prefix. A later carve adds a segment for NEW sub-vocabulary terms; already-minted flat IRIs are NEVER rebased — they stay at their minted IRIs, tied to the new module via `owl:imports` + `rdfs:isDefinedBy`."*

The non-breaking-carve rider is the linked-data-correct mechanic and the thing that makes the deferral genuinely reversible: a minted `…/pdtf/Property` must denote the same thing forever (the w3id persistence guarantee), so rebasing it into a module *is* the IRI break.

**This is not a theoretical reassurance — DPV is the documented proof (davis-DA asked this be stated as evidence, not abstraction).** DPV grew exactly this way: the bare `dpv:` core terms *kept their original IRIs* as the `pd`, `legal`, `legal/eu/gdpr` modules were added around them; nothing already minted ever moved. So "flat now, carve later without breaking" is not "trust us it's reversible" — it is the way a real, widely-adopted w3id vocabulary actually evolved. That converts davis-DA's abstract Rebased-URI warning into a precedent the council can point at. With the criterion + both riders recorded, davis-DA and I are aligned FOR flat: flat is now a *finding with a trigger*, not asserted doctrine.

Note the cross-evidence tension with the hm sibling project, which *does* use `/ns/pf/`, `/ns/sds/` sub-namespaces: hm has multiple bounded contexts with distinct ownership — same driver as DPV. opda does not. So opda diverging from *both* DPV and hm on this point is defensible specifically because opda is single-context. Record that, so the divergence is not read as an oversight.

---

**Pandit (Q5 — Standard-entity vs physical-resource split): AFFIRM. Ballot: AYE.**

Partitioning `/pdtf/` (the published standard entities a consumer cites *as* the standard) from `/harness/` (resources *about* and *supporting* the standard — governance, build, instance data) is sound linked-data practice, and it is the discipline I wish DPV had enforced from day one.

DPV's pain point was precisely the *absence* of this line: spec prose, examples, guides, and the normative vocabulary all hung off the same `w3id.org/dpv/` root, so consumers could not tell, from an IRI alone, whether a thing was *part of the standard they must implement* or *editorial scaffolding about it*. opda's split makes that legible at the URL level: if it's under `/pdtf/`, it is the standard; if it's under `/harness/`, it is apparatus. That is not over-engineering — it is the difference between a citable standard and a project folder. The "one namespace + `rdf:type`" alternative pushes that distinction into the graph, where it is invisible to anyone reading or dereferencing a bare IRI, and where a typo in a type assertion silently promotes scaffolding into "the standard."

The cost is one extra w3id redirect entry (`/opda/harness/`), which is trivial. AYE.

**One framing correction (Baker asked if `/harness/` is the analogue of DPV keeping `dpv-owl` / `dpv-skos` serialisations separate).** Only *partly*, and the record should not lean on that analogy. `dpv-owl` / `dpv-skos` are **serialisation variants of the same entities** — the OWL view vs the SKOS view of `dpv:PersonalData`, same denoted thing, different representation, content-negotiated. opda's `/pdtf/` ÷ `/harness/` is **not** a serialisation split: it partitions by **entity kind** (standard entity vs physical resource/apparatus), not by representation of one entity. The true DPV analogue to `/harness/` is the boundary DPV *wished* it had — spec prose, examples, guides, scaffolding all hung off the same root as the normative vocabulary with no URL-level signal of which was which. So defend `/harness/` on the **citability-legibility** argument (is this THE standard, or apparatus *about* it?), and explicitly **not** as "like `dpv-owl`/`dpv-skos`" — that framing would mislead the synthesis.

---

**Pandit (Q6 — data-dictionary placement): AFFIRM. Ballot: AYE.**

The 582 data-dictionary entries are concrete PDTF *data fields* (`propertyPack.environmentalIssues.flooding`) — physical resources, not abstract standard entities — so they belong in `/harness/data-dictionary/`, not `/pdtf/`.

This is the correct application of the Q5 line, and it mirrors a DPV distinction: the *concepts* (`dpv:PersonalData`) are standard entities; a *specific dataset's field catalogue* is instance-level material *about* a deployment, not part of the vocabulary. The data-dictionary entries are the latter — they are the PDTF form/field inventory, downstream of the ontology, addressable but not normative-as-vocabulary. Putting them under `/pdtf/` would assert that each of 582 form fields is itself a published standard term, which over-claims. `/harness/data-dictionary/` is right.

One grounding caveat I want recorded: the data-dictionary entries presumably *reference* `/pdtf/` terms (a field is typed by or maps to an ontology property). That cross-namespace link is exactly what the split is for — physical resource in `/harness/`, pointing at the standard entity in `/pdtf/` via `dct:conformsTo` / `rdfs:isDefinedBy` / a mapping predicate. Confirm the emitter wires that direction (`/harness/` → `/pdtf/`), never the reverse; the standard must not depend on the dictionary. AYE on placement.

---

**Pandit (Q7 — SHACL shape placement): REVISE. Ballot: AYE on shapes-in-`/pdtf/`, reject a dedicated `/shacl/`.**

Shape *nodes* in the `opda:` namespace (base shapes + profile shapes) are **standard entities** and belong in `/pdtf/`, alongside the classes and properties they constrain. Shape *documents* (the serialised files) are build artefacts and belong in `/harness/`. So: shape **identities** → `/pdtf/`; shape **files** → `/harness/`. This is just the Q5 entity-vs-document line applied consistently, and it is the same split the proposal already draws for the ontology (terms in `/pdtf/`, per-file provenance in `/harness/`).

I **reject** a dedicated `/shacl/` segment. Carving SHACL out into its own namespace would (a) re-introduce a module segment by the back door — the very thing Q4 just flattened — and (b) wrongly imply the shapes are a *separate standard* from the ontology. In opda's design the shapes ARE part of what PDTF normatively *is*: the constraints are co-normative with the class/property definitions (a `Property` is partly *defined by* the shape that says what a conformant Property looks like). They are one standard; they share `/pdtf/`. A `/shacl/` split is the over-engineering trap on this question.

This is consistent with how DPV-adjacent work treats SHACL: validation shapes that are part of the normative deliverable sit in the vocabulary namespace, not a sibling `/shacl/` silo. The silo only makes sense when shapes are an *independent* validation profile maintained by a different party — not opda's case.

**Exact amendment I move:** ADR-0006 should add a Q7 row — *"SHACL shape nodes (base + profile shapes, `opda:` namespace) → `/pdtf/`; shape/profile documents (serialised files) → `/harness/`. No dedicated `/shacl/` namespace — shapes are co-normative with the ontology."* AYE.

---

**Pandit (Q8 — Profiles): REVISE. Ballot: AYE, with a sharpened criterion.**

The 31 per-form overlay profiles (baspi5, ta6, con29R, llc1, …) are SHACL overlays, each `dct:source`-linked to an *external* form question. Whether a profile is a standard entity or a physical resource is genuinely split, and the answer is **not** uniform — which is why I REVISE rather than AFFIRM the proposal's apparent "profiles → `/pdtf/profiles/`" default.

Apply the Q5 test — *"is this what a consumer cites as the PDTF standard?"* — and profiles divide:

- A profile that is a **published, governed part of PDTF** — i.e. opda warrants "to conform to PDTF *for this form*, satisfy this shape" — is a **standard entity** → `/pdtf/profiles/<name>`. Its identity is normative.
- A profile that is merely **opda's overlay mapping to a third party's form** (the `dct:source` points at an external, opda-uncontrolled form question) is closer to a **physical resource / mapping artefact** about an external thing → arguably `/harness/profiles/<name>`.

The DPV analogue is direct and decisive here: DPV's *jurisdiction extensions* (`dpv/legal/eu/gdpr`) are first-class standard entities **because the DPVCG governs them and warrants them as part of DPV**. But a *one-off mapping* from DPV to some external regulator's specific form would be an application artefact, not part of the vocabulary. The governing question is **warranty/ownership, not subject-matter**.

So the criterion is: **does opda govern and warrant the profile as part of the PDTF standard?** If yes → `/pdtf/profiles/`. If the profile is just a convenience overlay onto an externally-owned form that opda does not warrant as normative → `/harness/profiles/`. My read of the 31 forms (BASPI, TA6, CON29, LLC1 are external instruments opda is *mapping onto*, not authoring) is that **most lean toward `/harness/profiles/`**, with promotion to `/pdtf/profiles/` only for profiles opda formally adopts as normative PDTF conformance targets.

**Exact amendment I move:** ADR-0006 Q8 row — *"Profile placement is governed by warranty, not subject-matter: a profile opda governs and warrants as a normative PDTF conformance target → `/pdtf/profiles/<name>`; an overlay that merely maps to an externally-owned form (`dct:source` → third-party instrument) opda does not warrant as part of the standard → `/harness/profiles/<name>`. Default the 31 form overlays to `/harness/profiles/` and promote individually on a recorded adoption."* AYE on that criterion; I would NOT vote AYE on a blanket "all profiles → `/pdtf/`."

---

## Summary ballot

| Q | Verdict | Ballot |
|---|---|---|
| Q1 org/standard split | AFFIRM | AYE |
| Q2 hash vs slash | REVISE → **Option H** (`…/opda/pdtf#Property`); reaffirm ODR-0004 hash. Bare slash only with a per-term content-negotiation build | **AGAINST bare-slash default / FOR Option H** |
| Q3 versioning | AFFIRM | AYE |
| Q4 flat namespace | AFFIRM (+ unified reopening criterion + non-breaking-carve + §4.6 rider) | AYE |
| Q5 standard/physical split | AFFIRM | AYE |
| Q6 data-dictionary → /harness/ | AFFIRM | AYE |
| Q7 shape placement | REVISE (nodes→/pdtf/, docs→/harness/, no /shacl/) | AYE |
| Q8 profiles | REVISE (warranty test; default /harness/, promote individually) | AYE conditional |

**Framing for the synthesis — the two divergences are NOT symmetric.** ADR-0006 cites DPV as precedent while the proposal departs from DPV on *both* hash (Q2) and modules (Q4). But the two depart for opposite reasons, and the synthesis should treat them differently:

- **Q4 (modules → flat): a sound divergence.** DPV modularised because it has independent versioning/adoption units; opda does not. Flattening is the right call *for opda's facts*. Keep it (with davis-DA's recorded reopening criterion + the non-breaking-carve rider).
- **Q2 (hash → slash): the divergence to reverse.** Here the proposal departs from DPV in the *wrong* direction. DPV's hash rationale applies to opda's mono-artefact-small `/pdtf/` *more* strongly than to a DPV module (Recipe 3). The greenfield override licenses changing the scheme freely but does **not** make slash better; the engineering merits — and three web-architects + DPV's principal author + the original-DA ODR-0004 hash decision — point to **hash**. Recommend the synthesis flip Q2 to **Option H** and reaffirm ODR-0004 §Rules.1 rather than override it.

In short: opda should diverge from DPV on modules and *align* with DPV (and its own prior DA decision) on hash. The amendment as drafted gets Q4 right and Q2 wrong.

**One unified reopening principle (Q2 + Q4 are a matched pair; agreed with Baker, dovetails with the Q2 trigger Baker/Gandon landed).** Record a single principle rather than two scattered triggers:

> *"A sub-vocabulary earns its own URI segment — and with it a hash-document boundary — ONLY when it becomes an independent dereference / version / import unit. Until then: one flat term namespace (Q4), addressed as hash fragments of the single `/pdtf` document (Q2). The driver is the document/release boundary, not logical scheme membership — SKOS scheme identity is carried by `skos:inScheme` (SKOS Reference §4.6), independent of URI prefix. A later carve hosts NEW terms only; already-minted IRIs are never rebased."*

This makes Q2 and Q4 cohere: both hold precisely because `/pdtf` is one co-versioned dereference unit, and both reopen on the same event (a sub-vocabulary ceasing to be a fragment-of-the-whole and becoming its own document). Option H makes the "`/pdtf` is one document" claim literal — the term IRI's fragment *is* a fragment of that document — so the principle reads identically for the hash decision and the flat decision.

**Cross-consistency note (Baker's Q5/Q7 point, which I endorse):** namespace boundaries are moved by **entity-kind / citability** differences (Q5: standard entity vs apparatus; Q7: shape nodes are co-normative standard entities), **never** by **serialisation / representation** differences (OWL-vs-SHACL expression, or content-negotiated variants). That is why `/harness/` is justified (citability boundary) while a `/shacl/` split is not (serialisation/expression difference), and it is the same consistency rule that defeats the dpv-owl/dpv-skos analogy for `/harness/`.
