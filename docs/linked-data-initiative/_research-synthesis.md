# Verified research synthesis — the OPDA / PDTF linked-data ontology initiative

> Seed/backbone document. Produced by a first verified research pass that read the ODR
> corpus, the implementation ADRs, the emitted Turtle (`source/03-standards/ontology/`)
> and the generator code (`tools/opda-gen/`), cross-checking prose claims against the
> emitted artefacts. Facet docs build on this — do not contradict it without evidence.

**One-line frame.** OPDA took the PDTF v3 JSON Schemas and, via an AI-assisted "Linked
Data Council" methodology, built a formal, machine-reasonable, SHACL-validated OWL/RDF
ontology that re-expresses the entire UK residential-property-transaction data model —
its data dictionary, its governance/privacy layer, and its agent/role (RBAC-style) layer
— in a multitude of W3C and community linked-data standards, emitted deterministically by
a byte-identity-gated generator and served from a live triplestore.

**Build-status caveat.** `tools/opda-gen/README.md` is stale ("Phase 2"); the *actual*
emitted TTL and generator code show the pipeline is built and CI-green at **version
1.0.0**. Every major prose claim below was verified against emitted artefacts;
discrepancies are flagged inline.

---

## 1. Standards used (the "multitude")

Marked **[emitted]** (in shipped TTL), **[catalogue-only]** (adopted but not yet emitted),
or **[reasoning/CI]**.

**Core RDF stack — all emitted:**
- **RDF 1.2** (`rdf:`) — triples, typing, lists; v1.2 for triple-terms (statement-level annotation). [emitted]
- **RDFS** (`rdfs:`) — class/property hierarchy, labels, comments; domain/range treated as *documentary*, not reasoner-enforced (ODR-0027). [emitted]
- **OWL 2** (`owl:`) — classes, datatype/object properties, ontology headers, `owl:imports`, `owl:versionIRI`/`versionInfo`. [emitted]
- **OWL 2 RL** — the entailment regime; a curated OWL-RL-*safe* rule subset materialised at load time in Jena/Fuseki (ODR-0025, ADR-0035). [reasoning] *Honest finding: only `rdfs:subClassOf` type-propagation actually fires — the model declares zero inverse/transitive/symmetric properties and has a flat hierarchy.*
- **XSD** (`xsd:`) — literal datatypes. [emitted]
- **SHACL 1.2** (`sh:`) — the validation contract; node shapes, `sh:targetClass`, severity tiers, `sh:in`/`sh:or`/`sh:xone`. Validated via **Apache Jena** (ADR-0036), the sole RDF/SHACL/SPARQL toolchain (ADR-0037). [emitted — 90 NodeShapes]
- **SHACL-AF** — SPARQL-based non-blocking data-quality rules + deprecation-lifecycle rules (ODR-0017). [emitted in shapes]
- **SKOS** (`skos:`) — every JSON enum becomes a `skos:ConceptScheme`; controlled vocabularies (roles, statuses, tenure, council-tax bands, perils…). [emitted — 47 schemes, ~315 concepts]
- **Dublin Core Terms** (`dct:`) — admin metadata + the load-bearing **`dct:source`** provenance traceability (every term/shape traces to a data-dictionary leaf, glossary row, ODR section, or regulator). [emitted — 2nd-most-used prefix]
- **VANN** (`vann:`) — preferred namespace prefix/URI on the ontology header. [emitted]

**Conditional tier — adopted where the use-case is present:**
- **DPV** + **DPV-PD** (`dpv:`, `dpv-pd:`) — privacy/governance vocabulary: `dpv:hasPersonalData`, `dpv-pd:Name`/`OfficialID`/`Address`/`EmailAddress`, special-category flags. [emitted] (`dpv-gdpr`, `dpv-legal` catalogue-adopted, not in TTL → [catalogue-only]).
- **PROV-O** (`prov:`) — backbone of the claims/evidence/provenance layer (~80% of the eIDAS verifiedClaims envelope): Entity/Activity/Agent, `wasDerivedFrom`, `qualifiedAttribution`, `hadPlan`. [emitted — 22 files reference it]
- **gUFO** (`gufo:`) — lightweight UFO; per-property `rdf:type gufo:Quality` meta-typing on descriptive leaves (EPC rating, council-tax band, built-form, heating). [emitted — `opda-descriptive-annotations.ttl`, ADR-0034]
- **W3C Org Ontology** (`org:`) — `org:Organization` superclass of `opda:Organisation` (ruled out FOAF). [emitted — `opda-agent.ttl`]
- **vCard** (`vcard:`) — `opda:Address rdfs:subClassOf vcard:Address` (ODR-0015). [emitted]
- **OWL-Time** (`time:`) — intervals/instants for lease-term / proprietorship / claim-validity. [emitted]
- **DASH** (`dash:`) — TopQuadrant UI hints on SHACL shapes to drive form rendering. [emitted — profile shapes]
- **DCAT 3** — dataset catalogue records. [catalogue-only — gated on a publishing trigger]
- **ODRL** (`odrl:`) — machine-readable consent/data-licensing policies. **Vocabulary adopted, policy-authoring DEFERRED to Phase 2** (a TBox-only ODRL asserts nothing without instances). [catalogue-only — ZERO `odrl:` triples in emitted TTL]. *Important for the RBAC story.*
- **SSSOM / SEMAPV** — cross-vocabulary mapping metadata. [catalogue-only — deferred until external mappings authored]

**Defer tier — reviewed and explicitly NOT adopted (audit-trail discipline):** schema.org,
DCAT-AP, FIBO, SOSA/SSN, QUDT, GeoSPARQL (deferred behind a named `opda:hasGeometry`
seam), FOAF (superseded by `prov:Agent` + W3C Org + `dct:` + `opda:`), BBO, ArchiMate,
**W3C Verifiable Credentials** and **DID Core** (Defer; activation owned by deferred
ODR-0016, fires on a real wallet/DID consumer).

**Foundational-ontology theory used as a typing/methodology layer (not serialised):**
**UFO** (Guizzardi) and **DOLCE** supply the Kind / RoleMixin / Role / Relator / Mode /
Quality stereotypes and the **OntoClean** rigidity/identity discipline that drive the
modelling (appear as `skos:scopeNote`/`rdfs:comment` citations and, via gUFO, as
`rdf:type` markers).

---

## 2. What's modelled

### (a) PDTF data models
Source: **`pdtf-transaction.json`** (37,224 lines, JSON Schema Draft-07) + 10+ deep-merge
form overlays (BASPI, TA6/7/10, NTS, LPE1, CON29R/DW, LLC1, FME1) + the **`verifiedClaims`**
OIDC4IDA/eIDAS envelope. The generator's authoritative *input* is the **data dictionary**
(`data-dictionary-canonical.json`: 1,557 leaves / 8,458 path entries / 935 annotated) and
the **business glossary** (`business-glossary.ttl`: 54 terms).

Partitioned **by ontological concern** (FIBO-style modules reconciled with UFO layering),
not by JSON page. Six emitted modules, each `owl:imports` the one flat ontology:
`opda-property.ttl` (Property / LegalEstate / RegisteredTitle), `opda-agent.ttl`
(Person/Organisation Kinds; Seller/Buyer/Proprietor/Conveyancer roles), `opda-transaction.ttl`,
`opda-claim.ttl` (PROV-O), `opda-descriptive.ttl`, `opda-governance.ttl`.

**Flagship modelling win (ODR-0005, "the identity crux"):** PDTF's JSON conflated the
*physical property*, the *legal estate*, and the *registered title* into one implicit
entity with no identity criterion (UPRN in 4 leaf paths, zero joins). The ontology splits
this into **3 classes** with distinct DOLCE/UFO identity criteria, treats **UPRN as a
contingent identifier (not the IC)**, and forbids `owl:sameAs` (uniqueness is
SHACL/DASH-checkable instead).

**Verified counts:** **41 `owl:Class`**, **226 `owl:DatatypeProperty`**, **30
`owl:ObjectProperty`**. The descriptive layer was deliberately *collapsed*: of ~1,493
annotated base leaves only **~181 (~12%)** are genuine descriptive concepts; ~88% are
form-ergonomics/repeated micro-structure (e.g. `yesNo` × 1,135) — the ODR-0022/0023
"import by category (A–G taxonomy)" decision (AI did not blindly transliterate).

**Bounded contexts (ODR-0019/0020, DDD):** a 6-member SKOS `BoundedContextScheme`
(`opda:EstateAgencyContext`, `ConveyancingContext`, …) tags entities via
`dct:subject`/`opda:servesContext`. Late reversal (session-022): the bespoke
`opda:definedInContext` predicate was retired as reinventing `rdfs:isDefinedBy` +
`dct:source` + `dct:subject` — a PDTF form **IS a** DCMI Application Profile (DCAP); its
SHACL shapes are its Description Set Profile; the data dictionary is a DCTAP.

### (b) Governance
Two senses, both modelled:
- **(i) Data-governance / privacy (ODR-0012 + ODR-0018):** PII typed at TBox via **DPV**,
  reference-not-import (DPV URIs cited, never `owl:imports`-ed). Mechanism: an OPDA
  `opda:DPVMappingRecord` (in `opda-governance.ttl`) — each PII-bearing Kind declares
  `opda:baselineCategory` → `dpv-pd:` value and `opda:targetsKind` → the OWL class. A
  **SHACL sensitivity gate** warns if a PII leaf lacks its DPV annotation. Article-10/
  special-category terms get `dpv:hasSpecialCategoryPersonalData`. **Lawful-basis/consent/
  policy *instances* deferred to Phase 2** (irreducibly about a processing act).
- **(ii) Project/decision governance (meta layer):** the ODR/ADR/council apparatus is
  itself the governance model — partly indexed *as data* in AgentDB (ADR-0027: sessions as
  vector embeddings + provenance edges + ReasoningBank trajectories). Real-world authority:
  Council verdict (a *proposal*) → OPDA Working Group → Modelling Sub-Committee → AGM
  ratification (`council/adoption.md`).

### (c) Authorisation / RBAC — be specific
**No ODRL policy layer and no classic RBAC permission scheme in the emitted ontology**
(zero `odrl:` triples; the one "permission" string is "planningPermission"). What exists is
a **role/capacity/authority model grounded in UFO** — the *substrate* on which access
control would be expressed; the policy/permission rules are **deferred to Phase 2**.

What **is** built (ODR-0006, `opda-agent.ttl`):
- **Roles as UFO RoleMixins/Roles, not subclasses** (anti-rigidity — a Seller is not a
  *kind of* Person): `opda:Seller`, `opda:Buyer` (RoleMixins, cross-sortal, founded by an
  `opda:Transaction` relator); `opda:Proprietor`, `opda:Conveyancer`, `opda:EstateAgent`,
  `opda:Surveyor`, `opda:Lender`, `opda:Insurer` (Roles). Role-bearers are **Kinds**:
  `opda:Person`, `opda:Organisation`.
- **The capacity/authority split** (closest thing to authorisation logic):
  `opda:hasAssertedCapacity` (sales-side claim, SKOS-typed) is deliberately separated from
  `opda:hasEvidencedAuthority` (conveyancing-side `→ opda:Claim`, e.g. probate / power of
  attorney) — modelling the gap between *asserted* and *evidenced* authority that PDTF
  collapsed into free text.
- Roles drawn from a SKOS **`RoleScheme`** (BASPI5 `role` enum) + a
  **`ParticipantStatusScheme`** (Proposed/Invited/Active/Removed).
- **Enforcement via SHACL**, not policy triples.

Honest framing: "We modelled the *actors, roles, capacities and authority-evidence* of the
trust framework (UFO role-ontology + SKOS vocabularies + SHACL); the machine-readable
*authorisation policies* (ODRL permissions/consent receipts) are an adopted-but-deferred
Phase-2 layer that plugs into this substrate."

---

## 3. Methodology — the AI Linked Data Council

The genuinely novel part and the strongest "technical direction" story.

- **A council session (ODR-0001)** is a *simulated dialectic expert panel* — each
  panellist is an **AI agent role-playing a real, named linked-data authority**, arguing
  **only from that authority's actual published positions** (W3C specs + section, named book
  + chapter, documented deployment). Every position MUST cite a verifiable source; the
  Queen verifies citations during synthesis — unverifiable positions don't count.
- **Standing panel of 9:** Dean Allemang (pragmatic RDF), Jim Hendler (OWL/web arch),
  Elisa Kendall (FIBO/enterprise), Kurt Cagle (SHACL/taxonomy), Fabien Gandon (RDF
  standards), Tom Baker (Dublin Core/namespace governance), Ian Davis (UK-gov linked data
  at scale), Giancarlo Guizzardi (UFO/OntoUML), Nicola Guarino (formal ontology/identity).
  Extended guests: Knublauch (SHACL), Isaac/Miles (SKOS), Pandit (DPV), Moreau (PROV-O),
  Iannella (ODRL), Sporny/Reed (VC/DID).
- **Roles per session:** **Queen/Moderator** (frames, sequences, calls votes, writes
  synthesis — composes but must not fabricate; every quote traces to the agent's position
  file); **Devil's Advocate** (a named expert whose *published methodology genuinely
  opposes* the proposition — must explicitly withdraw or hold dissent on every contested
  question); **Panel** (must cross-talk — agree/refine/withdraw, not opine in parallel).
- **Ratification flow:** proposition → pre-flight scope-check (ratify/re-scope/retire) →
  convene (format tier + consensus-mode) → one-message parallel spawn of the panel →
  per-question deliberation with **`N-M-K` vote tallies** (for/against/abstain, verbatim
  dissent) → Queen synthesis (narrative verdict + tally appendix; "narrative wins") →
  produce the ODR. Self-amending (ODR-0001 amended itself 4×).
- **ODR-vs-ADR boundary (DCAP discipline):** *modelling* decisions → **ODRs**
  (`docs/ontology/odr/`); *engineering* decisions → **ADRs** (`docs/adr/`). A `kind:
  pattern` ODR must state (a) the UFO/DOLCE meta-category, (b) the identity criterion over
  named hard cases, (c) the artefact realisation.
- **AgentDB (ADR-0027):** sessions indexed for recall (semantic search before convening),
  provenance traversal (session⇄ODR edges), and learning (ReasoningBank: which
  argument/DA patterns win). Operationalises the "re-open trigger" discipline.
- **"Directing authority" override:** the human owner can override the Council on greenfield
  grounds. Cases: council recommended reverting to hash URIs (session-037 Q2, 5-2) but the
  authority kept slash; authority mandated one-go full descriptive coverage vs staged;
  ODR-0027 was a directing-authority decision with no panel. The honest "AI proposes, human
  disposes" governance story.

---

## 4. Generator / pipeline

- **Generator (`opda-gen`, ADR-0007/0008):** Python (`rdflib`-backed) with a **custom
  canonical N-Triples→Turtle serialiser** (rdflib's serialiser bypassed for determinism).
  Flow: inputs (data-dictionary canonical JSON + glossary + parsed ODR frontmatter/§Rules)
  → **term-sourcing 5-line precedence** (W3C-spec > OPDA Trust Framework > glossary > schema
  text > regulator) → per-concern emitters (`foundation`, `vocabularies`, `shapes`,
  `annotations`, `profiles`, `modules/{property,agent,transaction,claim,governance,
  descriptive}`) → canonical TTL.
- **Three-graph separation (ODR-0004 §3a, CI-enforced):** classes / shapes / advisory
  annotations are *separate graphs* — no `sh:*` in the annotation graph, no advisory
  annotations in the shapes graph.
- **Validation:** pyshacl in CI for exemplar regression; **Apache Jena** as the production
  SHACL 1.2 validator and **sole** RDF/SHACL/SPARQL toolchain (ADR-0036/0037).
- **Inference (OWL-RL, ODR-0025 + ADR-0035):** materialised at **Jena/Fuseki load time** via
  a SPARQL-`INSERT` fixpoint (7 OWL-RL-safe rules) → derived graph `…/pdtf/graph/inferred/
  entailment`; asserted vs inferred kept separate. Excluded by design: `owl:sameAs`,
  Functional/InverseFunctional, domain/range typing. *Honest as-built: only
  subclass-type-propagation fires today (30 inferred triples).*
- **BASPI5 round-trip harness (MVP gate, ADR-0014):** BASPI5 JSON → parse to RDF via the
  ontology → validate against the BASPI5 SHACL profile → regenerate BASPI5 JSON, with full
  `dct:source` traceability. Round-trip equivalence is the green-light; closes ODR-0003's
  programme-retirement criterion.
- **8 CI gates** (`tools/opda-gen/src/opda_gen/ci/`): byte-identity (regenerate→diff vs
  committed TTL — the anti-drift keystone), three-graph separation, BASPI5 round-trip,
  descriptive round-trip, Category-G coverage (239/239), dup-declaration, inference-closure,
  profile-contract. GH workflows: `ontology-byte-identity.yml`, `baspi5-round-trip.yml`.
- **Live serving:** `scripts/fuseki-load.mjs` loads modules into **Fuseki**; a **grlc** layer
  exposes SPARQL-as-REST; the Astro site renders entity pages from it (ADR-0021); deploy to
  Cloudflare Pages via CI.

---

## 5. Namespace / publishing

- **Org-vs-standard split:** domain = organisation, path = standard. Org `https://opda.org.uk/`;
  PDTF standard at **`https://opda.org.uk/pdtf/`** (`@prefix opda: <https://opda.org.uk/pdtf/>`).
- **Slash, not hash; no version-in-IRI; flat term namespace** (6 modules are editorial file
  splits, not URL segments). *Council recommended hash (session-037); directing authority
  kept slash.*
- **Kind sub-segments** (enforced in `namespaces.py`): terms `…/pdtf/Property`; SKOS
  `…/pdtf/scheme/role/Buyer`; SHACL `…/pdtf/shape/Baspi5_PropertyShape`; graphs
  `…/pdtf/graph/foundation`; physical apparatus `…/pdtf/harness/` (data-dictionary entries,
  ODR/ADR anchors, exemplar data, release snapshots). Flatten-collision guard.
- **Versioning:** no version in any IRI; carried by `owl:versionInfo "1.0.0"` +
  `owl:versionIRI` → dated release snapshot under `…/pdtf/harness/release/1.0.0/` (the DPV
  practice).
- **Resolution:** OPDA controls `opda.org.uk` DNS + hosting and serves RDF directly (the
  original w3id.org/PICG redirect plan in ADR-0006 was superseded). Migration history:
  `w3id.org/opda/#` → `w3id.org/opda/pdtf/` → `opda.org.uk/pdtf/`.

---

## 6. Key numbers (verified) — see `_fact-sheet.md` for the full table

41 owl:Class · 226 owl:DatatypeProperty · 30 owl:ObjectProperty · 47 SKOS schemes · ~315
SKOS concepts · 90 SHACL NodeShapes · 31 overlay profiles · 17 exemplars (+17 expected
reports) · 28 ODRs · ADRs 0006–0037 (ontology slice; repo 0001–0038) · ~37 council sessions
(54 files incl. per-expert) · 8 CI gates · 6 bounded contexts · generator/ontology v1.0.0 ·
source schema 37,224 lines / 1,557 leaves / 935 annotated · glossary 54 terms.

---

## 7. Narrative arc (for a mixed senior + technical audience)

> The Property Data Trust Framework already defines, in JSON Schema, what a UK residential
> property transaction's data looks like — but JSON Schema only names slots and shapes; it
> cannot say *which things have stable identity*, *how a seller's asserted authority differs
> from evidenced authority*, or *which fields carry special-category personal data*, and it
> cannot be reasoned over or validated outside the apps that hand-code it. We took PDTF v3 —
> 37,000 lines, 1,557 fields, a dozen statutory form overlays (BASPI, TA6, CON29, LPE1…) —
> and re-expressed it as a formal, machine-readable ontology on the full W3C linked-data
> stack: RDF/OWL for the model, SHACL for the validation contract, SKOS for the controlled
> vocabularies, PROV-O for the chain of evidence, DPV for GDPR-grade privacy typing, and
> UFO/DOLCE for principled identity criteria. The headline fix: PDTF's single implicit
> "property" (a UPRN floating across four fields with no joins) becomes three precisely
> distinguished things (physical property, legal estate, registered title), and people
> become Kinds that *play* anti-rigid roles (Buyer, Seller, Conveyancer) founded by the
> transaction, with a clean seam between asserted capacity and the evidence (probate, power
> of attorney) that backs it. Crucially, none of this was hand-waved by AI: every modelling
> decision was adjudicated by an **AI "Linked Data Council"** — agents arguing from the
> actual published work of real authorities (Allemang, Hendler, Guizzardi, Cagle, Baker,
> Davis…), with a mandatory Devil's Advocate, recorded votes, and a human "directing
> authority" who can override — producing ~28 citable Ontology Decision Records and a full
> audit trail. The artefacts aren't a slide-deck model: a deterministic generator emits the
> Turtle under a byte-identity CI gate, Apache Jena validates it with SHACL and materialises
> OWL-RL inferences, and a BASPI5 round-trip harness proves a real statutory form can go
> JSON → ontology → validated RDF → JSON with every field traceable to its data-dictionary
> origin. The result is a governed, versioned, publishable semantic standard (resolving at
> `https://opda.org.uk/pdtf/`) that the wider ecosystem — lenders, conveyancers, estate
> agents, proptech, HM Land Registry — can dereference, validate against, and extend, with a
> clear forward path to W3C Verifiable Credentials and machine-readable consent (ODRL).

## Two things to flag so we don't over-claim
1. **RBAC/authorisation** is a *role + authority-evidence* model (UFO + SKOS + SHACL), **not**
   an ODRL permission-policy layer — policies are adopted-but-deferred (Phase 2).
2. **OWL reasoning** is real but *shallow today* — only RDFS subclass entailment fires
   (flat hierarchy, no inverse/transitive properties yet).

Both are honest, defensible "phased roadmap" points, not gaps.
