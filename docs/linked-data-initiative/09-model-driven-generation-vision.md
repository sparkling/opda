# Model-driven generation: a candidate implementation pattern for SPDTF

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.
>
> Builds on `_research-synthesis.md`, `_external-research.md`, `_fact-sheet.md`. Cross-refs
> KB docs `07-generator-pipeline-and-ci.md`, `10-ai-value-and-developer-ecosystem.md`,
> `11-standards-development-releases-and-extensibility.md`.
> The current ontology is a draft artefact derived from the PDTF schema. Only the
> collaborative SPDTF process can decide whether a future governed model becomes an
> authoritative source for scheme outputs.

## TL;DR

- **The candidate inversion.** Today the draft ontology is generated *from* the PDTF schema
  (`opda-gen` reads the data dictionary distilled from `pdtf-transaction.json`). The
  proposed direction is to let collaboratively governed **SPDTF decisions** drive a
  linked-data model and generate JSON Schema, APIs, code, DB schema/DDL, forms, UI and
  docs from it—if the working groups validate that pattern. 🔵
- **SHACL is the pivot.** The generation contract is not the OWL class graph (open-world,
  says what *can* be true) but the **SHACL shapes graph** (closed-world, says what a
  *conformant instance* must look like): cardinality, datatypes, value sets, node kinds,
  structure. The corpus already ships **96 SHACL NodeShapes** with `sh:minCount` (×176),
  `sh:in` (×51), `sh:datatype` (×38), `sh:maxCount` (×38) — the raw material a generator
  consumes. ✅ (shapes) → 🔵 (generators on top).
- **What exists today is the proof-of-concept, not the product.** Two targets are *already*
  generated from the model: the **website "modelling" section + 4-tier manual** (markdown
  + SPARQL-rendered entity pages, ADR-0015–0021 ✅) and the **DASH-driven form-render
  contract** in the profiles (🟡). One target is proven *round-trip* (JSON ↔ ontology,
  BASPI5 harness ADR-0014 ✅). The rest — full SHACL→JSON-Schema, OpenAPI, code, DDL — are
  credible **vision** (🔵).
- **Why it matters.** This is the technical substance under OPDA's published *"PDFs →
  APIs"* mandate: every form, API, database and UI becomes a *projection* of one governed,
  versioned, machine-checkable model. Consistency is structural, not maintained by hand;
  conformance is mechanical; the standard can evolve faster because change propagates.
- **Honest status.** This facet is **heavy on 🔵**. The architecture is credible and the
  seeds are real and in-repo, but most per-target generators are not built. We present a
  phased roadmap, not a finished product. The one thing we must *not* claim is that the
  model already emits JSON Schema/OpenAPI/DDL — it does not (the only `json-schema`
  reference in the generator is on the **input** side).

---

## 1. The core idea — invert the flow

### Today: ontology generated *from* the schema (✅, but the "wrong" way round for the vision)

The current pipeline runs **JSON Schema → ontology**:

```
pdtf-transaction.json (37,224 lines, Draft-07)
  → data-dictionary-canonical.json (1,557 leaves, 935 annotated)
  → opda-gen emitters (foundation, vocabularies, shapes, modules, profiles)
  → canonical Turtle (byte-identity CI gate)
```

This was the right *first* move: the PDTF schema already exists, so the ontology had to
be reverse-engineered from it (see `02-linked-data-model-architecture.md`,
`07-generator-pipeline-and-ci.md`). The generator literally loads the JSON schema as
**input** — confirmed in `tools/opda-gen/src/opda_gen/emitters/profiles.py:40` ("Load
BASPI5 JSON schema …"). The JSON Schema is the source; the ontology is the artefact.

### The vision: model as source of truth, everything else generated *from* it (🔵)

The strategic direction (the project owner's stated forward requirement) is to **invert
the arrow**:

> *"We will use this linked-data model to drive our governance and standards development,
> releases, modules, extensibility. We will use SHACL to define data shapes, and tools to
> generate JSON Schemas, APIs, code, database schemas, DDLs, interfaces, forms, UI, UX —
> all driven by and artefacts of the linked data — including markdown documentation of the
> models."*

Concretely, the model (OWL classes/properties + SHACL shapes + SKOS vocabularies +
profiles) becomes the **single editable source**, and a generation tier emits each
downstream representation:

```
                       ┌───────────────────────────────────────────────┐
                       │  LINKED-DATA MODEL  (single source of truth)    │
                       │  OWL classes/properties · SKOS vocabularies ·   │
                       │  PROV-O · DPV typing · UFO/DOLCE identity        │
                       └───────────────────────┬───────────────────────┘
                                               │  classes + properties
                                               ▼
                       ┌───────────────────────────────────────────────┐
                       │  SHACL SHAPES  (the data-shape contract)        │
                       │  sh:minCount/maxCount · sh:datatype · sh:in ·   │
                       │  sh:class · sh:xone · sh:pattern · DASH hints ·  │
                       │  sh:severity · opda:ValidationContext (profile)  │
                       └──┬────┬────┬────┬────┬────┬────┬────────────────┘
                          │    │    │    │    │    │    │
            ┌─────────────┘    │    │    │    │    │    └─────────────┐
            ▼                  ▼    ▼    ▼    ▼    ▼                  ▼
     ┌────────────┐   ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
     │JSON Schema │   │ OpenAPI /  │  │ Code /   │  │ DB schema│  │ Forms /  │
     │  🔵 (✅ rt) │   │   REST     │  │interfaces│  │  / DDL   │  │  UI/UX   │
     └────────────┘   │ 🟡 grlc ✅  │  │   🔵     │  │   🔵     │  │ 🟡→🔵    │
                      └────────────┘  └──────────┘  └──────────┘  └──────────┘
                                               │
                                               ▼
                                      ┌──────────────────┐
                                      │  Markdown docs    │
                                      │  of the model     │
                                      │   ✅ (live site)   │
                                      └──────────────────┘
```

The single rule that makes this worth doing: **change the model once, regenerate
everything, and there is no drift** — because the JSON Schema, the API, the DB, the form
and the docs are no longer hand-kept-in-sync siblings; they are all *outputs* of one input.

---

## 2. SHACL as the canonical data-shape contract

Why SHACL, and not the OWL class graph, is the pivot for generation:

- **OWL is open-world and inferential** — it says what *may* be entailed about an
  individual (`owl:DatatypeProperty`, `rdfs:domain/range` as *documentary* per ODR-0027).
  It deliberately does **not** say "this field is required" or "this list is closed". You
  cannot generate a JSON Schema `required` array or a `NOT NULL` column from OWL alone.
- **SHACL is closed-world and structural** — it describes what a *conformant instance graph*
  must look like. That is exactly the shape of a JSON Schema, a DDL table, a form, a typed
  interface. SHACL is the standard whose semantics line up with generation targets.

The mapping from SHACL constructs to generation targets is direct and already exercised by
the overlay-profile mechanism (ODR-0010):

| SHACL construct | In the corpus | JSON Schema | DDL / DB | Form / UI | Code / type |
|---|---|---|---|---|---|
| `sh:minCount 1` | ✅ ×176 | `required: [...]` | `NOT NULL` | mandatory field | non-optional |
| `sh:maxCount 1` | ✅ ×38 | not-an-array | scalar column / FK | single input | `T` not `T[]` |
| `sh:datatype xsd:…` | ✅ ×38 | `type`/`format` | column SQL type | input widget type | primitive type |
| `sh:in ( … )` | ✅ ×51 | `enum: [...]` | `CHECK`/lookup table | `<select>` options | union / enum |
| `sh:class opda:X` | ✅ ×1 | `$ref` | foreign key | linked-entity picker | typed reference |
| `sh:pattern` | ✅ ×4 | `pattern` | `CHECK` regex | input mask | validator |
| `sh:nodeKind` | ✅ ×10 | IRI vs literal | URI vs value col | link vs text | ref vs value |
| `sh:xone` / `sh:or` | ✅ ×3 / ×2 | `oneOf` / `anyOf` | discriminated table | conditional branch | discriminated union |
| `sh:severity` | ✅ (287 V / 28 I / ~4 W) | (validation tiering) | constraint hardness | error vs warning UX | strict vs lax |
| `opda:ValidationContext` | ✅ (per profile) | per-form schema subset | per-form view | per-form render | per-profile type |
| `dash:editor`/`dash:viewer` | ✅ (118 lines, baspi5) | — | — | **widget choice** | — |

(Counts are `grep` over `source/03-standards/ontology/*.ttl`, 2026-06-03; **96
`sh:NodeShape`** total.) The point: **the contract a generator needs already exists in the
shapes graph today** ✅. What is missing is the generators that *consume* it 🔵.

Two existing disciplines make the shapes graph generation-grade:

- **Profiles reify form context** (ODR-0010 ✅). A profile (e.g. `profiles/baspi5.ttl`) is a
  **named SHACL graph over the fixed TBox** plus an `opda:ValidationContext` node. So "what
  must a BASPI5 document contain" is itself a first-class, dereferenceable thing — the
  natural unit a per-form JSON Schema / API / form generator targets.
- **`dct:source` traceability** (✅). Every shape carries `dct:source` back to the
  data-dictionary leaf / form-question IRI (e.g. `…/forms/baspi5#A1.3`). Generated artefacts
  inherit that provenance — a generated JSON Schema field can point at the form question it
  realises.

---

## 3. Per-target generation

A subsection per target the owner named: what in the model drives it, the realistic
tooling, and an honest status. The honest split throughout: the **model/SHACL inputs are
✅**; most **generators on top are 🔵**; two targets (docs, SPARQL UI) are **✅ already
generated**; forms are **🟡** (the render *contract* exists; the renderer is a consumer-app
boundary).

### 3.1 JSON Schema ← SHACL shapes — ✅ round-trip seed · 🔵 full generation

- **What drives it:** the SHACL shapes graph — `sh:minCount`→`required`, `sh:datatype`→
  `type`/`format`, `sh:in`→`enum`, `sh:maxCount 1`→scalar-not-array, `sh:xone`→`oneOf`. A
  profile's `opda:ValidationContext` scopes *which* schema (BASPI5 vs TA6 vs base).
- **Realistic tooling:** SHACL→JSON-Schema is a recognised transform (e.g. TopQuadrant /
  community `shacl2jsonschema` style tools, or a bespoke `opda-gen` emitter — the inverse of
  today's `leaf_categoriser`). JSON Schema Draft-07 is the existing PDTF target, so the
  generated output is drop-in comparable.
- **Status — the strongest seed in this whole facet.** The **BASPI5 round-trip harness**
  (ADR-0014 ✅) already proves **JSON ↔ ontology fidelity**: BASPI5 JSON → parsed to RDF via
  the ontology → validated against the BASPI5 SHACL profile → **regenerated as BASPI5 JSON**,
  with byte-level round-trip equivalence asserted in CI (`baspi5-round-trip.yml`, programme
  retirement gate, commit `28dd92a`). That is the hard half: it demonstrates the model
  carries enough structure to *reconstitute* the JSON. **What it does not yet do** is emit a
  JSON *Schema* (it round-trips JSON *instances*). Full SHACL→JSON-Schema generation — emit
  `baspi5.schema.json` from `baspi5.ttl` and diff it against PDTF's hand-authored overlay —
  is 🔵. (Honesty note: the only `json-schema` reference in `opda-gen` today is *reading*
  the schema as input, not emitting it.)

### 3.2 APIs / OpenAPI ← classes + shapes + profiles — 🟡 live SPARQL-as-REST · 🔵 OpenAPI

- **What drives it:** classes become resources; shapes become request/response schemas;
  profiles become per-form endpoints; `sh:class` object-properties become sub-resource links.
- **Realistic tooling:** the **grlc** convention — SPARQL queries in `.rq` files decorated
  with `#+` comments (`endpoint:`, `method:`, `mime:`) that *become* REST routes returning
  JSON-LD (https://grlc.io). OpenAPI/Swagger generation from SHACL shapes is the 🔵 layer on
  top (shapes → OpenAPI `components/schemas`).
- **Status — a *live, working* example of "API generated from the model" already exists.**
  ADR-0021 ✅ ported the grlc pattern: a custom Node/Express GRLC engine at `src/api/`
  (`lib/`, `middleware/`, `routes/`, `server.js`) reads `.rq` `CONSTRUCT` queries
  (`queries/get-entity.rq`, `list-entities.rq`, `list-entities-count.rq`) and serves
  structured entity JSON-LD straight out of Fuseki — **a SPARQL-as-REST API whose responses
  are generated from the ontology graph**, no hand-written controllers. This is build-time
  today (feeds the static site) but is explicitly designed as the stepping-stone to the live
  `opda.org.uk/pdtf/<Entity>` dereference endpoint (ADR-0021 §"Forward link"; ADR-0006). What
  is **not** built: an OpenAPI document generated from the shapes, a full CRUD/write API, or
  a typed client SDK — all 🔵. (See `10-ai-value-and-developer-ecosystem.md` for the
  API-as-AI-substrate angle.)

### 3.3 Code / interfaces ← classes/properties → typed models — 🔵 planned

- **What drives it:** `owl:Class` → a type; `owl:DatatypeProperty` + `sh:datatype` +
  `sh:maxCount` → a typed field (optional vs required from `sh:minCount`); `sh:in` → an enum;
  `owl:ObjectProperty` + `sh:class` → a typed reference. The corpus has **41 classes, 226
  datatype properties, 30 object properties** ✅ — a rich enough type surface.
- **Realistic tooling:** SHACL/OWL → TypeScript or Python (Pydantic) / Java (POJO) via a
  template-based emitter, or off-the-shelf (`shacl-form` typings, LinkML-style code-gen). The
  generated types would be the canonical models proptech consumers import — guaranteed in
  step with the standard.
- **Status:** 🔵. No code-generation emitter exists. The inputs (classes, properties, shapes,
  enums) are all ✅; this is a generator to build, not a modelling gap.

### 3.4 Database schema / DDL ← classes/shapes → relational or graph DDL — 🔵 planned

- **What drives it:** a node shape → a table (or a node label); each property shape → a
  column (`sh:datatype`→SQL type, `sh:minCount 1`→`NOT NULL`, `sh:maxCount 1`→scalar vs a
  join table, `sh:in`→`CHECK` or a lookup table, `sh:class`→foreign key,
  `sh:pattern`→`CHECK` regex).
- **Realistic tooling:** SHACL→SQL DDL emitters exist in the ecosystem; or, because the data
  *is* RDF, the "DB" can simply be the **triplestore** (Fuseki/Jena) — which is already the
  live store ✅ (ADR-0036/0037). A relational DDL emitter for consumers who need SQL is the 🔵
  layer. The manual's **physical-database tier** already documents named-graphs, per-module
  deployment views, and "derived-profiles (validation / ui / inference)" (ADR-0021 data
  inventory) — the conceptual scaffold for "this entity → this storage" exists in prose ✅,
  the DDL emitter does not 🔵.
- **Status:** 🔵 for relational DDL generation; ✅ if "database" means the RDF store itself.

### 3.5 Forms ← SHACL + DASH UI hints — 🟡 render contract built · 🔵 full form generation

- **What drives it:** SHACL structure (which fields, required, value sets) **plus DASH UI
  hints** (TopQuadrant's `dash:` vocabulary) that say *how* to render: `dash:editor`
  (`dash:EnumSelectEditor` for `sh:in` enums, `dash:TextFieldEditor` for free text,
  `dash:DetailsEditor` for nested objects), `dash:viewer` (`dash:LabelViewer`/
  `dash:LiteralViewer`/`dash:URIViewer`), `dash:propertyRole` (`dash:KeyRole`/`LabelRole`),
  plus `sh:order` + `sh:group` (`sh:PropertyGroup`) reproducing field order and sectioning.
- **Realistic tooling:** a DASH-aware form renderer (TopBraid; `@ulb-darmstadt/shacl-form`;
  or a bespoke React renderer that walks the shapes graph) consumes the profile and emits the
  form. This is "forms as a pure projection of the shape."
- **Status — 🟡, and concretely so.** The **form-render contract is emitted and real**:
  `profiles/baspi5.ttl` carries **118 lines** of DASH/`sh:order`/`sh:group` directives —
  `dash:EnumSelectEditor`, `dash:TextFieldEditor`, `dash:LabelViewer`, `dash:LiteralViewer`,
  and named `sh:PropertyGroup`s (`Baspi5_Address_Group`, `Baspi5_Energy_Group`, …) with
  `sh:order` reproducing the BASPI form's sectioning. ODR-0010 §Rule 5 makes "loading the
  BASPI5 profile yields a graph that both validates a transaction *and* generates the BASPI
  form" the **canonical round-trip**. ADR-0014 §Confirmation #7 lists "real BASPI5 form
  rendering works (a DASH-compatible viewer produces a recognisable BASPI form)" as a gate —
  but verifies it as a **data-contract** check (31/31 property shapes carry resolvable
  `dct:source` + DASH hints), explicitly noting "the DASH-UI render itself is the
  consumer-app boundary." **So:** the model *fully specifies* the form (🟡 — contract done);
  shipping an OPDA-hosted form renderer that takes any profile and produces a live form is 🔵.

### 3.6 UI / UX ← entity pages already SPARQL-rendered — ✅ entity pages · 🔵 generalised UI

- **What drives it:** SPARQL `CONSTRUCT` queries over the graph → structured JSON-LD →
  templated pages. Per ADR-0021's data inventory, the entity page surfaces label
  (`skos:prefLabel`), narrative (`rdfs:comment`), UFO category (`skos:scopeNote`), the
  attribute table (`owl:DatatypeProperty` ⋈ SHACL cardinality), the relationship table
  (`owl:ObjectProperty` + `sh:class`), constraints (`sh:message`/`sh:severity`), and
  classification — **all from the graph**.
- **Realistic tooling:** the Fuseki + grlc + Astro pipeline already in place (ADR-0021),
  generalised from "entity pages" to arbitrary model-driven UI.
- **Status — ✅ for the entity-page class of UI.** The website's entity pages are *already*
  generated from the ontology via the build-time Fuseki/grlc/SPARQL pipeline, rendering
  through the data-driven manual components (`AttributeTable.astro`, `ShapeBlock.astro`,
  `TurtleBlock.astro`, `SchemeMembersTable.astro`, `EntityHeader.astro`, `CrossTierLinks.astro`
  — all present in `src/components/manual/`, wired per ADR-0021 closing "G17"). The website
  "modelling" section (`src/pages/modelling/`) ships dedicated model views: `ontology.astro`,
  `shacl-shapes.astro`, `concept-taxonomy.astro`, `data-dictionary.astro`, `overlays.astro`,
  `jsonld-mappings.astro`, `standards-stack.astro`, `bounded-contexts.astro`,
  `business-glossary.astro`. **Generalised UI/UX generation** (arbitrary apps, dashboards,
  workflow UIs driven by the model) is 🔵.

### 3.7 Markdown documentation of the models — ✅ already generated (the flagship "done")

- **What drives it:** the same model. Two complementary mechanisms, both ✅:
  1. **The 4-tier manual** (ADR-0015–0020) — concept / logical / physical-database /
     physical-ontology tiers, authored as a markdown tree and integrated as Astro content
     collections, with the **entity pages now data-driven from the ontology** (ADR-0021):
     change a TTL → rebuild → the page updates with **zero markdown re-authoring**.
  2. **ODR/ADR documentation** (ADR-0023→0024) — the decision records render through the
     `odr` content collection, with Mermaid diagrams authored into the canonical markdown and
     HTML regenerated **every build, nothing committed** (no derived-artefact drift).
- **How it's produced:** `scripts/fuseki-load.mjs` loads the ontology TTLs into **Fuseki**;
  the **grlc** `.rq` API (`src/api/`) exposes the graph as REST/JSON-LD; **Astro** queries it
  at build time (`getStaticPaths`) and renders via the manual components; the static site
  deploys to **Cloudflare Pages** via CI. (`Fuseki → grlc → SPARQL → Astro → Cloudflare`.)
- **Status — ✅, and it is the existence proof for the whole vision.** "Markdown
  documentation of the models, driven by and an artefact of the linked data" is **not
  aspirational — it is live today.** It is the single completed instance of the
  model-as-source-of-truth → generated-artefact pattern, and the template every other target
  follows. (See `07-generator-pipeline-and-ci.md` and
  `11-standards-development-releases-and-extensibility.md`.)

---

## 4. SPDTF governance supported by the model

The same inversion could support how the *SPDTF scheme* is governed (full treatment in
`11-standards-development-releases-and-extensibility.md`; the model-driven angle here):

- **Releases as model artefacts.** A release is a *versioned snapshot of the model*, carried
  by `owl:versionInfo "1.0.0"` + `owl:versionIRI` → a dated snapshot under
  `…/pdtf/harness/release/1.0.0/` (✅, the DPV practice). Downstream artefacts (JSON Schema,
  API, docs) are regenerated *per release* — so a PDTF schema release such as v3.6 could be a model tag from which
  every representation is emitted, not a JSON file someone hand-edits while the docs lag. 🔵
  (for the multi-target emit) on top of ✅ (versioning scheme).
- **Modules as model partitions.** The six ontology modules
  (`opda-property/agent/transaction/claim/descriptive/governance.ttl`, ✅) already partition
  the model by ontological concern. Module = a generation unit: a consumer who only needs the
  agent/role slice generates *that* schema/API/types. 🔵 (selective generation) on ✅
  (modular model).
- **Extensibility as profiles.** New forms / sub-standards are **new SHACL profiles over the
  fixed TBox** (ODR-0010 ✅) — the TBox never forks. A new overlay (e.g. a future TA-form
  variant) is authored as a profile and *generates* its JSON Schema / form / API view. 🟡
  (mechanism proven on BASPI5) → 🔵 (generators per profile). **31 overlay profiles** already
  exist (`profiles/*.ttl`, ✅) — the extensibility substrate is built; the per-profile
  generators are the 🔵 layer.
- **Conformance becomes machine-checkable.** Because the contract is SHACL, "does this
  vendor's data validate against the PDTF schema v3.6 / BASPI5 candidate profile?" is a `pyshacl`/Jena run, not a
  human review (✅ — this is exactly what the exemplar-regression + round-trip gates already
  do internally). Generated artefacts and the validator share one source, so a conformant
  document is conformant against *every* representation at once.

---

## 5. Why this matters — the payoff

Tie-back to OPDA's published *"from PDFs to APIs"* mandate and the 2026 vision
("fixing the data foundations", "consent-based APIs"):

- **Consistency across every form / API / DB / UI — structurally, not by discipline.** The
  BASPI5 form, the BASPI5 API view, the BASPI5 JSON Schema and the BASPI5 storage shape stop
  being four hand-synced things and become four *renderings of one shape graph*. They cannot
  disagree, because they share an input.
- **Zero drift.** The drift that plagues "the docs say X, the schema says Y, the API does Z"
  is **eliminated by construction** — the manual already proves it (change a TTL, the entity
  page changes, no re-authoring). Extend that property to schema/API/DDL/forms.
- **One change propagates.** A single modelling decision (add a property, tighten a
  cardinality, extend an enum) regenerates every artefact. The cost of evolving the standard
  drops from "edit N representations and reconcile" to "edit the model, regenerate."
- **Conformance is mechanical.** SHACL validation replaces human schema review; the same
  contract gates ingestion, generation and certification. This is the trust/fraud story the
  lenders and HM Land Registry care about, made checkable.
- **Faster standard evolution.** New forms = new profiles; new modules = new partitions; new
  releases = new tags — each *generates* its downstream surface. This is the engine under
  "universal trust-framework implementation incl. mandatory consent-based APIs."
- **It is the literal substance of "PDFs → APIs."** An API you *generate from a governed
  model* is the credible version of that slogan — not a bespoke service per form, but a
  model from which the API (and the schema, and the form, and the docs) falls out.

---

## Built vs planned

| Capability | Drives from | Status | Evidence |
|---|---|---|---|
| **Markdown model docs** (4-tier manual) | ontology → SPARQL/grlc → Astro | ✅ built | ADR-0015–0021; `src/components/manual/*`, `src/pages/modelling/*` |
| **ODR/ADR doc generation** (build-time HTML) | markdown + `odr` collection | ✅ built | ADR-0023→0024; `src/generated/odr/` |
| **SPARQL-rendered entity pages (UI)** | ontology → grlc `.rq` → JSON-LD → Astro | ✅ built | ADR-0021; `src/api/queries/*.rq`, `src/api/server.js` |
| **SPARQL-as-REST API (grlc)** | classes/shapes → `.rq` CONSTRUCT → JSON-LD | 🟡 build-time live | ADR-0021; `src/api/` (engine + 3 `.rq`) |
| **JSON ↔ ontology round-trip** | ontology + BASPI5 SHACL profile | ✅ built (instances) | ADR-0014; `tests/baspi5_round_trip/`, `baspi5-round-trip.yml` |
| **Form-render contract** (DASH UI hints) | SHACL + `dash:` + `sh:order`/`sh:group` | 🟡 contract built | ODR-0010 §R5; `profiles/baspi5.ttl` (118 DASH lines) |
| **SHACL shapes corpus** (the contract) | OWL classes → 96 NodeShapes | ✅ built | `source/03-standards/ontology/*shapes.ttl` |
| **Profiles / overlays** (extensibility unit) | profile graph + `opda:ValidationContext` | ✅ built (31) | ODR-0010; `profiles/*.ttl` |
| **Versioned releases** (`owl:versionIRI`) | model snapshot | ✅ built (scheme) | `08-namespace-versioning-and-publishing.md` |
| **JSON Schema *generation*** | SHACL → Draft-07 | 🔵 planned | (round-trip ✅ is the seed) |
| **OpenAPI *document* generation** | shapes → `components/schemas` | 🔵 planned | (grlc ✅ is the seed) |
| **Code / typed interfaces** | classes/props/`sh:` → TS/Python/Java | 🔵 planned | inputs ✅ (41 cls / 226 dp / 30 op) |
| **Relational DB schema / DDL** | node/property shapes → SQL DDL | 🔵 planned | (RDF store itself ✅) |
| **Full form generation** (hosted renderer) | profile → live form | 🔵 planned | render contract 🟡 |
| **Generalised UI/UX generation** | model → arbitrary apps | 🔵 planned | entity-page UI ✅ is the seed |
| **Multi-target emit per release/module/profile** | model tag → all artefacts | 🔵 planned | versioning/modules/profiles ✅ |

---

## Talking points for the quarterly tech review (mixed senior + technical)

- **The headline inversion, in one line.** "Today we *derive* the model from the JSON
  Schema; the direction is to make the model the source and *generate* the JSON Schema, the
  APIs, the database, the forms and the docs from it — so one change propagates everywhere and
  nothing drifts." That is the technical meaning of OPDA's *"PDFs → APIs."*
- **We already have the existence proof.** The website's model documentation and entity pages
  are **already generated from the linked data** (Fuseki → grlc → SPARQL → Astro): change a
  Turtle file, the page updates with zero re-authoring. The pattern works; we are extending it
  to the other targets.
- **SHACL is the contract that makes it possible** — and it already exists: **96 shapes** with
  cardinality, datatypes and value sets that map one-to-one onto JSON Schema `required`/`enum`,
  DDL `NOT NULL`/`CHECK`, form fields and typed code.
- **The BASPI5 round-trip is the proof the model is "complete enough."** A real statutory form
  goes JSON → ontology → validated RDF → JSON with full field-level provenance, green in CI.
  That de-risks JSON-Schema/API generation: we have shown the model carries the information.
- **Be honest about the line.** *Built today:* model docs, SPARQL entity pages/UI, the
  SPARQL-as-REST API, JSON round-trip, and the DASH form-render *contract*. *Vision (next):*
  full SHACL→JSON-Schema, OpenAPI documents, code/types, relational DDL, and a hosted form
  renderer. The architecture is credible because the hard parts (the model, the shapes, the
  pipeline) are real; the rest are generators on top.
- **The "ask" framing.** Endorse the technical direction — model-as-source-of-truth, SHACL as
  the generation contract — and prioritise the first generator (JSON Schema from the BASPI5
  profile, diffed against the hand-authored overlay) as the proof-of-value milestone for the
  next quarter.

---

## Source files

**Evidence read for this facet (all paths absolute-resolvable from repo root):**

- `docs/linked-data-initiative/_research-synthesis.md`, `_external-research.md`, `_fact-sheet.md`, `00-INDEX.md` — seeds.
- `docs/adr/ADR-0014-baspi5-round-trip-mvp-harness.md` — JSON ↔ ontology round-trip (✅ seed for JSON Schema gen).
- `docs/adr/ADR-0021-generate-manual-entity-pages-via-fuseki-grlc-sparql-api.md` — SPARQL entity pages + grlc API (✅ UI/API).
- `docs/adr/ADR-0015`…`ADR-0020` — manual/site integration (✅ docs generation).
- `docs/adr/ADR-0023` / `ADR-0024-odr-enrichment-in-markdown-generate-html-every-build.md` — ODR/ADR doc generation (✅).
- `docs/ontology/odr/ODR-0010-overlay-profile-mechanism.md` — SHACL profiles, DASH rendering, `opda:ValidationContext`, the canonical round-trip (✅/🟡).
- `docs/ontology/odr/ODR-0027` — OWL domain/range as documentary (why SHACL, not OWL, is the contract).
- `source/03-standards/ontology/profiles/baspi5.ttl` — emitted DASH/`sh:order`/`sh:group`/`sh:xone`/`dct:source` form contract (118 DASH lines).
- `source/03-standards/ontology/*-shapes.ttl` (`opda-shapes`, `opda-property-shapes`, `opda-agent-shapes`, …) — the 96-NodeShape contract (constraint counts).
- `src/api/` (`server.js`, `lib/`, `middleware/`, `routes/`, `queries/{get-entity,list-entities,list-entities-count}.rq`) — the live grlc SPARQL-as-REST engine (✅).
- `src/pages/modelling/` (`ontology.astro`, `shacl-shapes.astro`, `overlays.astro`, `jsonld-mappings.astro`, `data-dictionary.astro`, …) — the website "modelling" section (✅).
- `src/components/manual/` (`AttributeTable`, `ShapeBlock`, `TurtleBlock`, `SchemeMembersTable`, `EntityHeader`, `CrossTierLinks`, …) — data-driven render components (✅).
- `tools/opda-gen/src/opda_gen/emitters/profiles.py` — confirms JSON Schema is an **input** today (the flow to be inverted).

**Honesty markers preserved throughout:** this facet is heavy on 🔵. The model, the SHACL
contract, the pipeline, the docs/entity-page generation, the grlc API and the JSON round-trip
are ✅/🟡 and verifiable in-repo; SHACL→JSON-Schema, OpenAPI, code, DDL, hosted form and
generalised UI generators are 🔵 — a credible, seeded roadmap, not a finished product.
