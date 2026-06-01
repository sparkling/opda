# Knublauch — Session 037 (SHACL lens)

Lens: SHACL (W3C Rec), shapes-as-RDF-data, shape/ontology graph separation, profile composition, DASH. Decisive say on **Q7** and **Q8**. I weigh on Q1–Q6 only where SHACL practice bears, and abstain explicitly otherwise.

Cross-talk: extended exchange with `allemang`, ending in full convergence on Q7 and Q8. We agree no `/shacl/` namespace; his slash-vs-fragment question is answered in Q7(a). On Q8 he initially leaned profiles to `/harness/` as "adapter glue"; the provenance-vs-subject-matter cut settled it to `/pdtf/` for nodes (he conceded). Two honest course-corrections in that exchange, both recorded below: I **withdrew** a meta-shape "fracture" argument (it doesn't bite — SHACL target selection is by `rdf:type`, not namespace), and I **corrected** Allemang's attempt to re-credit it, since the load-bearing reason is authorship/part-of, not a SHACL invariant.

---

**Knublauch (Q1 — Org/standard split + base path):** AFFIRM. **Ballot: +1.**

Outside my core lens, but SHACL practice bears lightly: shapes carry `sh:targetClass <class-IRI>`, so the *target* IRI must be stable and dereferenceable for tooling (TopBraid, DASH, pyshacl all resolve targets against the shapes graph). `https://w3id.org/opda/pdtf/Property` gives a clean, redirectable PURL that a SHACL processor can treat as an opaque target node. `opda` (org) / `pdtf` (standard) cleanly anticipates a second opda standard reusing the same shape-authoring conventions without IRI collision. No SHACL objection.

---

**Knublauch (Q2 — Hash vs slash):** AFFIRM. **Ballot: +1.**

SHACL is namespace-agnostic — `sh:targetClass` and `sh:path` take any IRI, hash or slash, and DASH/TopBraid handle both. So this turns on dereference, not on SHACL. One SHACL-specific note that *favours* slash here: a vocabulary of opda's size (147 terms + enums + ~70 shape/profile nodes) is better served by per-term documents than by forcing a processor to pull one monolithic hash-document to resolve a single `sh:targetClass`. DPV uses hash *per module* because each module is itself a small bounded document; opda's flat namespace (Q4) is large enough that hash-per-namespace would mean one giant retrieval. Slash + per-term is the better fit for the shape-resolution path. The ODR-0004 §Rules.1 hash override is justified on greenfield grounds (cf. [[opda-greenfield-no-wg-gate]]); I sat DA on that S004 decision and I am content to see it revised pre-publication.

---

**Knublauch (Q3 — Versioning):** AFFIRM. **Ballot: +1.**

SHACL bearing: profile graphs already carry `owl:versionIRI <…/profiles/baspi5/0.1.0/>` *as a graph-level annotation* while shape NODES (`opda:Baspi5_AddressShape`) are unversioned in `opda:`. That is exactly the right split and it mirrors the proposed rule — version is a property of the *published artefact* (`owl:versionInfo` / `owl:versionIRI` on the ontology/shapes graph), not a segment baked into every constraint node's IRI. Baking a version into shape-node IRIs would force every `sh:targetClass`/`sh:node` reference to re-point on each release. Keep versions off the term and shape IRIs.

---

**Knublauch (Q4 — Modules / flat namespace):** AFFIRM (with a SHACL caveat noted). **Ballot: +1.**

The EVIDENCE shows both hm (`/ns/pf/`, `/ns/sds/`) and DPV (`/dpv/pd`, `/dpv/legal`) use module sub-namespaces, so flattening *does* break with the cited prior art. But from the shapes side, flattening is the safer choice: opda already splits shapes into per-module *files* (`opda-property-shapes.ttl`, `opda-agent-shapes.ttl`, …) that all mint into the single `opda:` namespace. The file split is the physical modularity; the namespace stays flat. This means a profile shape in one module can `sh:node`/`sh:targetClass`-reference a class in another module without a cross-namespace prefix dance — important because overlay profiles (Q8) compose *across* module boundaries (a BASPI5 form touches Property, Agent, and Legal terms in one profile graph). A flat term namespace keeps profile composition clean. Caveat: the modularity must then be carried by `owl:imports` / named graphs, not by IRI structure — which ODR-0004 §3a three-graph separation already does.

---

**Knublauch (Q5 — Standard-entity vs physical-resource split):** AFFIRM. **Ballot: +1.**

This is the SHACL "shapes graph vs data graph" intuition (SHACL Rec §1.5) generalised to the whole namespace, and it is sound. SHACL itself draws exactly this line: the *shapes graph* contains the abstract constraint definitions; the *data graph* contains the instances they validate. `/pdtf/` = the abstract published standard (classes, properties, schemes, *and shape definitions* — see Q7); `/harness/` = physical/instance resources (data-dictionary fields, test data, named graphs, governance). That maps onto SHACL's own graph-role distinction. It is not over-engineering — it lets a consumer dereference *the standard* without dragging in instance and governance triples. One namespace + `rdf:type` would force every consumer to filter, and would make the PURL for "the ontology" indistinguishable from the PURL for "a test fixture." Keep the split.

---

**Knublauch (Q6 — data-dictionary placement):** ABSTAIN.

The 582 data-dictionary entries are PDTF *data fields* (physical resources), not SHACL artefacts. They are not shapes, not `sh:targetClass` targets, and not part of the shapes graph. Whether they sit in `/harness/data-dictionary/` is a data-modelling call for the linked-data members (Allemang/Davis), not a SHACL question. I note only the consistency check: if a data-dictionary field is ever bound *as a shape target* (i.e. a shape says `sh:targetNode <…/data-dictionary/…>`), that would be unusual but not wrong — shapes can target individuals. No SHACL objection to `/harness/` placement; deferring the substance.

---

**Knublauch (Q7 — SHACL shapes placement) — DECISIVE:** REVISE. **Ballot: +1 on the revised form.**

This is mine to call, and the proposal as written conflates two separable things. I split the verdict:

**(a) Shape NODES → `/pdtf/` (the `opda:` term namespace). REJECT the dedicated `/shacl/` namespace.**

A SHACL shape is *not* a member of a separate metamodel that warrants its own vocabulary namespace. Per SHACL Rec §2.1, a node shape is simply an RDF node carrying `rdf:type sh:NodeShape` plus constraint triples; the *metamodel terms* (`sh:NodeShape`, `sh:property`, `sh:targetClass`, `sh:datatype`) live in the W3C `sh:` namespace and are imported, never re-minted. The application's own shapes (`opda:Baspi5_AddressShape`, `opda:DeprecationChainRule`) are application vocabulary and belong in the application's namespace — exactly as DASH, SPIN, and TopBraid model their shapes in the *target ontology's* namespace, not in a separate shapes vocabulary. opda already does this correctly today: `opda:Baspi5_AddressShape` (in `opda:`) carries `sh:targetClass opda:Address` (also `opda:`). A constraint and the class it constrains sharing one namespace is the *correct* RDF identity: they are co-governed and co-versioned. A dedicated `/shacl/` namespace would (i) buy nothing — `rdf:type sh:NodeShape` already distinguishes a shape from a class for any processor; (ii) split governance of two things that must move together; (iii) misrepresent shapes as a foreign metamodel rather than as part of the standard. Reject `/shacl/`.

Allemang pressed whether the Q2 slash override changes this. It strengthens it. Under the old hash scheme (ODR-0004 §Rules.1, my own S004 DA call) one *could* have argued shapes should be **fragments of a shapes document** (`…/opda/shapes#Baspi5_AddressShape`) — shape identity parasitic on a document IRI. The slash move frees the shape node to be a first-class, document-independent resource (`…/pdtf/Baspi5_AddressShape`), which is exactly how SHACL Rec §2.1 treats a shape: a *node*, not a document fragment. So I do **not** want shapes addressable as fragments of a shapes document; slash cleanly separates node identity from document identity, which is the point. I am content to see my own S004 commitment overridden on greenfield grounds.

The crucial distinction the proposal blurs: **SHACL's shapes-graph-vs-data-graph separation (Rec §1.5) is a GRAPH-level partition, not a NAMING partition.** Which *graph* a triple lives in is orthogonal to which *namespace* its subject IRI carries. opda already honours this: the shape nodes are `opda:` but the shapes *graph* is a distinct resource `<https://w3id.org/opda/shapes>` typed `owl:Ontology`, and that graph is loaded separately from the TBox (`opda-shapes.ttl` MUST NOT contain `owl:Class`, per its own header / ODR-0004 §3a). The new scheme must preserve this: shape nodes keep the term namespace; the graph separation is carried by `owl:imports`/named-graph membership, not by IRI namespace.

Anticipated opposing view (the `/harness/` argument): "shapes are *about* the ontology, so they are physical/supporting resources like test data → `/harness/`." I reject this for shape NODES. A shape is not commentary *about* the standard; under ODR-0010/0013 the shapes are *normative* — they define what conformance to PDTF *means* (severity, cardinality, the three-rule interface contract). A normative conformance definition is part of the published standard, not supporting scaffolding. Test data is "about"; a normative constraint is "part of." So shape nodes belong in `/pdtf/`, not `/harness/`.

**(b) Shape/profile DOCUMENTS (the named-graph resources) → `/harness/`. AFFIRM.**

The *document* `<https://w3id.org/opda/shapes>` and each profile graph IRI are physical resources — they are the loadable named graphs, the deployment units. These belong in `/harness/graph/` (or `/harness/shapes/`) alongside the other named-graph resources, consistent with the Q5 split and with the current `opda:targetsClassGraph <…/1.0.0/>` pattern. So: the *nodes* are standard entities in `/pdtf/`; the *graph resource that bundles them* is a physical resource in `/harness/`. This is precisely the SHACL §1.5 graph/instance distinction applied to naming, and it resolves the proposal's ambiguity cleanly.

Exact amendment: "Base SHACL shape NODES (in the `opda:` namespace) are standard entities and resolve under `/pdtf/`, sharing the namespace of the classes they target via `sh:targetClass`; NO dedicated `/shacl/` namespace is created. The shape *graph documents* (named-graph resources, e.g. `…/harness/graph/shapes`) are physical resources under `/harness/`. The SHACL shapes-graph/data-graph separation (Rec §1.5) is realised at the graph level (`owl:imports`/named-graph membership), not by namespace." (Profile-shape *nodes* are treated separately under Q8 — base shapes are unambiguously part-of; profile shapes turn on an identity-criterion question.)

---

**Knublauch (Q8 — Profiles) — DECISIVE:** REVISE. **Ballot: +1. SETTLED with Allemang: profile shape NODES → `/pdtf/` (`opda:`); profile DOCUMENTS → `/harness/profiles/<form>`.**

Mine to call on the SHACL substance, and it splits by granularity — the proposal's binary (`/pdtf/profiles/` *or* `/harness/profiles/`) is a false choice. A per-form overlay profile (baspi5, ta6, con29R, llc1, …) is *both* things at different levels:

- **The profile GRAPH** (`<https://w3id.org/opda/profiles/baspi5>`, today an `owl:Ontology` with `owl:imports`, `owl:versionIRI`, `dct:subject opda:EstateAgencyContext`) is a physical, separately-versioned, separately-loadable deployment unit → `/harness/profiles/<form>`.

- **The profile SHAPE NODES** (`opda:Baspi5_AddressShape`, …) are normative SHACL constraints under ODR-0010/0013, composing over the foundation/module shapes via the three-rule interface contract. They carry `sh:targetClass opda:Address` (a `/pdtf/` class) and `dct:source <https://www.basp.uk/forms/baspi5#A1.1>` (an external form question). They are NOT instance bindings — an instance binding would be `<some-baspi5-report> rdf:type opda:…` in a data graph, which lives in `/harness/data/`. They → `/pdtf/`.

This answers the EVIDENCE's "standard entities or instance bindings" framing: profile shapes are not data; they are opda's normative account of what a conformant BASPI5 submission must satisfy.

**The decisive ground (and a withdrawn argument).** The cross-talk converged through one initial disagreement and one self-correction:

- Allemang first read profile overlays as *about* an external, opda-not-owned form (`dct:source` → `basp.uk/...`) → adapter glue → `/harness/`. The correct cut is **provenance vs subject-matter**: `dct:source` records *where* the constraint was sourced; it does not make the constraint *about* the form. opda **authors and owns** the actual constraint — cardinality, enum subset, three-rule composition — and that constraint *is* opda's normative ruling on what PDTF-conformance-via-BASPI5 *means*. Decisive identity test: if BASPI revises form question A1.1, `opda:Baspi5_AddressShape` keeps its IRI and opda merely re-points the `dct:source`. The node's identity is anchored in opda's authorship, not the foreign artefact → *part-of* → `/pdtf/`. Allemang accepted this and conceded.

- I **withdrew** my own earlier argument that splitting profile nodes (`/harness/`) from base nodes (`/pdtf/`) would "fracture the shape space" the `NoIdentityOverride_MetaShape` (`sh:targetClass sh:NodeShape`, ODR-0010 §Q6) operates over. It does not bite: SHACL target selection (Rec §2.1.3) selects shapes by `rdf:type` membership in the graph being validated, **not** by IRI namespace. A `/pdtf/`-vs-`/harness/` *naming* split would not drop meta-shape coverage; only a *graph-membership* split (a node placed in a graph not loaded for meta-validation) would, and that is a graph-assembly decision, not a naming one. So the meta-shape works either way and is **not** a reason for the namespace choice. When Allemang re-credited the meta-shape argument in conceding, I corrected it: co-namespacing is a *consequence* of part-of, not of a SHACL invariant. Getting the rationale right matters so a reviewer checking the SHACL semantics doesn't reopen a settled question on a rationale that doesn't hold.

So: profile shape nodes → `/pdtf/` because opda authors them (part-of); profile documents → `/harness/profiles/`. This is the same node/document split as Q7, applied to overlays, with the node placement justified on authorship-identity rather than on any SHACL-mechanical invariant.

**Operative criterion (the A1.1 test, generalised with Allemang).** A shape node → `/pdtf/` iff its identity is opda-owned and **survives mutation of its `dct:source` target**; anything that must be retired/re-minted when a foreign artefact changes → `/harness/`. Base shapes trivially pass; profile shapes pass the A1.1 test.

**Reconciliation with Pandit (post-synthesis, honest record).** Pandit reached the *same criterion shape* — warranty, not subject-matter — but set the **opposite default**: default the 31 overlays to `/harness/profiles/`, promote individually on a recorded warranted adoption. The synthesis adopted Pandit's default and recorded the placement as an **open operator policy call**. My identity-stability test and Pandit's warranty test are the *same test viewed from two ends*: I read it from **authorship** (opda wrote the constraint; the node survives form-mutation → part-of → default `/pdtf/`); Pandit reads it from **publishing intent** (does opda *warrant* this overlay AS the standard, or merely publish it as a mapping-view onto a third party's form → default `/harness/` until warranted). The criteria agree; the *default* differs, and the difference is a genuine policy fact — **does opda publish the form overlays as normative parts of PDTF, or as mapping-views onto externally-owned forms?** — that only the operator can settle. I do not override the synthesis: the SHACL lens settles the node/document split and rejects `/shacl/` (Q7, 7-0-0); it does **not** by itself settle opda's publishing intent. I record my lean (`/pdtf/` on authorship-identity) and accept the operator policy call as the correct locus for the default. If the operator rules "mapping-views," Pandit's `/harness/` default governs and my lean yields with no SHACL objection — the node/document split and the no-`/shacl/` ruling hold either way.

Exact amendment: "Per-form overlay profile *shape nodes* (`opda:Baspi5_*Shape`) are standard entities → `/pdtf/`/`opda:`, sharing the namespace of the classes they target via `sh:targetClass`. They are opda-authored normative SHACL artefacts under ODR-0010/0013 (the `dct:source` link to an external form question is provenance, not subject-matter; the node IRI survives revision of that form), NOT instance bindings. The profile *graph documents* (`…/harness/profiles/<form>`, versioned via `owl:versionIRI`) are physical resources → `/harness/`. Conformant-submission instance data is the instance binding and lives in `/harness/data/`."

---

**Summary ballot:** Q1 +1 · Q2 +1 · Q3 +1 · Q4 +1 · Q5 +1 · Q6 abstain · **Q7 REVISE (decisive)** · **Q8 REVISE (decisive)**. Q7 and Q8 fully settled with Allemang.

The decisive calls rest on two layered principles:

1. **SHACL's shapes-graph/data-graph separation (Rec §1.5) is a GRAPH-level partition, not a NAMING one.** Which graph a triple lives in is orthogonal to which namespace its subject's IRI carries. This kills the `/shacl/` namespace and means meta-shape coverage (`NoIdentityOverride_MetaShape`, by `rdf:type` per Rec §2.1.3) is a graph-assembly concern, never a naming one.
2. **Part-of vs about decides standard-vs-harness; `dct:source` is provenance, not subject-matter.** Both base and profile shape NODES are opda-authored normative conformance definitions → `/pdtf/`/`opda:`, co-located with the classes they target. The external form an overlay sources from does not make the opda-authored constraint *about* that form; the node IRI survives the form's revision.

- **Q7:** base shape NODES → `/pdtf/`/`opda:` (no `/shacl/`; not document fragments — slash frees them to first-class resources). Shape graph DOCUMENTS → `/harness/`.
- **Q8:** node/document split holds — profile DOCUMENTS + conformant-submission fixtures → `/harness/`; the no-`/shacl/` ruling holds. Profile shape-NODE *namespace* turns on opda's publishing intent and is an **open operator policy call** (the synthesis default, per Pandit's warranty test, is `/harness/profiles/`, promote individually). I **withdrew** my meta-shape "fracture" argument (target selection is by `rdf:type`, not namespace) and corrected its re-credit; the operative criterion is the identity-stability/warranty test (authorship vs publishing-intent — the same test from two ends), not a SHACL invariant. My lean is `/pdtf/` on authorship-identity; I yield to the operator on the default with no SHACL objection either way.

Unified across Q7+Q8: **the node/document split and the rejection of `/shacl/` are SHACL-settled (graph-not-naming, Rec §1.5). The one residual — whether the 31 form overlays' shape nodes default to `/pdtf/` or `/harness/profiles/` — is a publishing-intent policy call the SHACL lens does not own; recorded as the operator's to settle.**
