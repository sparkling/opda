# Context, Problem & Market — why OPDA is re-expressing PDTF as linked data

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.
>
> This is the **WHY** document. It establishes what the Property Data Trust Framework (PDTF)
> is, where JSON Schema as a *standard* runs out of road, the UK policy and market forces
> that make this urgent now, and the membership feedback that the linked-data direction
> answers. Sister documents cover the *what* (the ontology, the standards stack) and the
> *how* (the generator, the AI council, the pipeline). Build on
> [`_research-synthesis.md`](./_research-synthesis.md),
> [`_external-research.md`](./_external-research.md) and [`_fact-sheet.md`](./_fact-sheet.md);
> do not contradict them.

## TL;DR

- **PDTF is the UK's open data standard for residential property transactions** — a ~37,224-line
  JSON Schema (Draft-07) base model plus a dozen statutory-form overlays (BASPI, TA6/7/10, NTS,
  LPE1, CON29R/DW, LLC1, FME1) and an OIDC4IDA/eIDAS `verifiedClaims` envelope. It is stewarded
  by OPDA / the Home Buying & Selling Council and published on GitHub under MIT licence
  (`Property-Data-Trust-Framework/schemas`, `/api`, `/trust-framework`).
- **JSON Schema is a brilliant *validation* language but a weak *standard*.** It names slots,
  shapes and required-ness, but cannot express stable identity, real-world semantics,
  governance/privacy classification, validation beyond structure, machine reasoning, or
  cross-system meaning. Every consumer re-hand-codes the meaning — and they do it differently.
  PDTF shows this concretely: **`uprn` is defined three different ways in the same file** (twice
  as `integer`, once as `string`), in unjoined branches, with no notion that they denote the
  same real-world property; and the legally load-bearing **seller's capacity / authority**
  (probate, power of attorney) collapses into a free-text `sellersCapacityDetails` string.
- **The policy clock is running.** The DMCC Act 2024 puts the **Smart Data** scheme on a
  statutory footing; DPMSG, MHCLG and HM Land Registry are pushing **Digital Property Packs** and
  a "**from PDFs to APIs**" mandate. OPDA frames 2026 as "**from momentum to mandate**", backed by
  **£742,700** of government sandbox funding, targeting **~15-day** transactions (vs 3–6 months)
  and **~43%** fall-through/fraud reduction via consent-based APIs.
- **The linked-data initiative is the technical substrate under that mandate** — one governed,
  machine-validated, dereferenceable model that consent-based APIs are generated *from*, that
  carries provenance for *trust*, and that classifies *privacy* at the type level. It is the
  answer to the membership's standing feedback: ambiguity, interoperability friction,
  extensibility pain, validation gaps, and maintenance burden.
- **Schema trajectory: v2.2 → v3.6.** **v3.6 (incl. updated TA-form alignment) is up for approval
  at the Friday 2026-06-05 workshop.** This document feeds the "Review of data-schema feedback &
  next steps" slot that follows that approval — i.e. it sets the *technical direction*.
- **Honest framing throughout.** The ontology, generator, SHACL validation, byte-identity CI and
  BASPI5 round-trip are ✅ built; machine-readable consent policies (ODRL), deep OWL reasoning,
  and model-driven downstream code/schema/API generation are 🔵 a phased roadmap, not a claim of
  today.

---

## 1. What PDTF is, and who stewards it

### 1.1 The standard

The **Property Data Trust Framework (PDTF)** is an open data standard for the digital exchange of
UK residential-property-transaction data (England & Wales). Its canonical artefact is a single
**JSON Schema** model, **`pdtf-transaction.json`** — **37,224 lines**, JSON Schema **Draft-07**
(`source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json`). The schema's own header
self-describes as the "Open data schema for digital residential property data exchange".

It is not one flat document. PDTF uses an **overlay system**: a base transaction schema that is
deep-merged with **form-specific overlays** so that one underlying model can render as any of the
statutory and trade forms a transaction touches. The overlay catalogue
(`source/03-standards/schemas/CLAUDE.md`, ODR-0003 §Context) includes:

| Overlay family | Forms | Role |
|---|---|---|
| **BASPI** | BASPI v4, **BASPI v5** | Buyer's & Seller's Property Information — the upfront-information backbone |
| **Law Society TA** | TA6, TA7, TA10 | Seller's property information / leasehold / fittings & contents |
| **NTS** | NTS (2023), NTS2 (2025, material information) | National Trading Standards material-information disclosure |
| **Searches** | CON29R, CON29DW, LLC1, LPE1, FME1 | Local-authority, drainage & water, land-charges, leasehold, mining/ground |
| **Other** | PIQ, RDS, OC1, SR24 | Property Information Questionnaire, Requisitions, official copies, survey |
| **Trust envelope** | `verifiedClaims` | OIDC4IDA / eIDAS verified-claims structure for identity & assurance |

The `index.js` utility (`getTransactionSchema(schemaId, overlays)`) merges the base with the
requested overlays via `deepmerge` with custom strategies and returns an AJV validator
(`getValidator`). So PDTF-as-shipped is: **a base model + a merge engine + per-form overlays + a
verified-claims validator**, published to npm as `@pdtf/schemas`.

### 1.2 The stewards

PDTF is governed within the UK home-buying-and-selling reform ecosystem:

- **OPDA — the Open Property Data Association** (`openpropdata.org.uk`) — the membership body that
  now stewards the framework and convenes the quarterly workshops. Chaired by **Maria Harris**.
- The **Home Buying & Selling Council** and the wider **DPMSG** (Digital Property Market Steering
  Group) ecosystem — the cross-industry/government governance layer PDTF sits inside (see §3).
- Reference/identity: `propdata.org.uk` and `trust.propdata.org.uk` carry the framework's
  canonical schema URLs (e.g. `https://trust.propdata.org.uk/schemas/v3/pdtf-transaction.json`).

### 1.3 The GitHub artefacts

The framework is developed in the open at **`github.com/Property-Data-Trust-Framework`**
(`_external-research.md`):

| Repo | Contents |
|---|---|
| **`schemas`** | The JSON-Schema base model + overlays + merge engine + tests (MIT, ~26★). The artefact this initiative re-expresses. |
| **`api`** | OpenAPI specifications for the framework's REST surface. |
| **`trust-framework`** | The governance/trust-framework documents (roles, conformance, change management). |
| `web`, `smart-data-challenge-2025`, `opda-shared-services` (Go), `opda-shared-infra` (HCL) | Website, the Moverly/OPDA DBT Smart Data Challenge entry, and shared platform infra. |

The `schemas` repo and the `opda-shared-*` platform repos were **updated 2026-06-03**, i.e. the
standard is actively maintained right up to the workshop.

> **Repo note.** In this knowledgebase, the PDTF upstream lives under
> `source/03-standards/schemas/` (a nested git repo — see the project memory on nested repos). The
> OPDA linked-data work lives alongside it under `source/03-standards/ontology/` and
> `source/00-deliverables/semantic-models/`.

---

## 2. The limits of JSON Schema *as a standard*

JSON Schema is excellent at what it was designed for: **validating the structure of a JSON
document** — does this object have these keys, of these types, within these bounds, with these
required. PDTF uses it well. The problem is not that PDTF used JSON Schema badly; it is that a
**data-exchange standard for a whole industry needs to carry meaning that JSON Schema, by design,
cannot carry**. Below, each limit is stated, then grounded in a real PDTF example verified against
`pdtf-transaction.json`.

### 2.1 It names slots and shapes — not stable identity

JSON Schema gives you **slot-names scoped to a position in a tree**, never **global identifiers**.
There is no way to say "this field, here, denotes *the same real-world thing* as that field, over
there." ODR-0003 §Context names this as the load-bearing defect: *"JSON Schema gives slot-names,
not global identifiers, so the genuine modelling question is which things get URIs."*

**Concrete PDTF example — UPRN floats, unjoined and inconsistently typed.** The Unique Property
Reference Number is the closest thing UK property data has to a primary key. In
`pdtf-transaction.json` the *same logical concept* appears in **multiple, disconnected branches,
typed three different ways**:

| Location | Definition | Type |
|---|---|---|
| L437 | `"uprn": { "title": "Unique Property Reference Number" }` | **`integer`** |
| L36650 | `"uprn": { "title": "Unique Property Reference Number (UPRN)", "description": "A unique identifier for the property." }` | **`string`** |
| L37094 | `"uprn": { "title": "Unique Property Reference Number" }` | **`integer`** |

Plus a separate `uprnSource` (L8520) and a UPRN nested under address structures. **Nothing in the
schema joins these.** A consumer reading a merged transaction cannot rely on UPRN being one type,
in one place, denoting one property. ODR-0003 records the same defect at the design level: UPRN in
four-plus leaf paths, an INSPIRE ID and a title-linked address besides, **with zero schema-level
joins** — *"a missing class with no identity criterion."*

The downstream cost: **every consumer hand-codes its own joins and coercions** (is this UPRN a
string or an int? which of the three is canonical? do two records with the same UPRN describe the
same property, the same title, or the same listing?). Two systems will answer differently, and
that is where data silently diverges.

### 2.2 It cannot express real-world semantics

JSON Schema cannot say what a thing *is*, only what a value *looks like*. It cannot distinguish a
**physical property** from the **legal estate** in it from the **registered title** that records
that estate — three things English land law treats as distinct, with distinct lifecycles
(demolition, subdivision, first registration). PDTF conflates them into one implicit "property"
with no identity criterion (ODR-0003 Q4, ODR-0005 — *the identity crux*).

> **What the ontology does instead** (✅, `opda-property.ttl`): splits the conflated entity into
> three classes — **`opda:Property`** (physical), **`opda:LegalEstate`** (the estate/tenure, e.g.
> the leasehold term), **`opda:RegisteredTitle`** (the Land-Registry record) — each with its own
> identity criterion, and treats **UPRN as a contingent identifier, not the identity criterion**.
> This is the headline "before → after" of the whole initiative.

### 2.3 It cannot validate beyond structure — so legal meaning leaks into free text

JSON Schema validates structure; it cannot encode a **business or legal rule** ("a seller selling
under power of attorney must carry evidence of that authority"). When such a rule exists, the
schema's only escape valve is a **free-text string**, which validates as "is a string" and
asserts nothing.

**Concrete PDTF example — seller's capacity vs. evidenced authority.** `sellersCapacity`
(L298) is a tidy closed enum:

```json
"capacity": { "enum": [
  "Legal Owner", "Personal Representative for a Deceased Owner",
  "Under Power of Attorney", "Mortgagee in Possession", "Assistant", "Other" ] }
```

…but the moment a non-trivial capacity is selected, the *evidence* — the thing that legally
matters — is dumped into a free-text field:

```json
"sellersCapacityDetails": {
  "title": "Please provide details and provide any probate, grant of representation
            or power of attorney " }   // type: string
```

So "the seller is acting under a power of attorney, and here is the proof" is, to the schema, an
unconstrained string. There is no way to validate that the evidence exists, links to a verified
claim, or matches the asserted capacity.

> **What the ontology does instead** (✅, `opda-agent.ttl`): models a two-predicate split —
> **`opda:hasAssertedCapacity`** (the sales-side claim, SKOS-typed against a `SellersCapacityScheme`)
> deliberately separated from **`opda:hasEvidencedAuthority`** (the conveyancing-side link `→
> opda:Claim`, e.g. probate / power of attorney). The BASPI5 round-trip gate even reports a
> *violation* on "a Seller acting as Attorney with no evidenced authority" (ODR-0003 §Gate
> conditions). The gap PDTF papered over with a text box becomes a checkable constraint.

### 2.4 It cannot classify governance / privacy

A property transaction is dense with **personal and special-category data** (names, addresses,
financial details, sometimes health- or vulnerability-related disclosures). JSON Schema has no
vocabulary for "**this field carries personal data / special-category data under UK GDPR**." There
is nowhere to attach a lawful basis, a sensitivity tier, or a consent requirement. Privacy
classification therefore lives only in prose, spreadsheets, or each consumer's head — exactly
where a *consent-based* API mandate (§3) cannot rely on it.

> **What the ontology does instead** (🟡, `opda-governance.ttl`): types PII at the schema level
> with **DPV / DPV-PD** (`opda:DPVMappingRecord`, `opda:baselineCategory → dpv-pd:` value), with a
> **SHACL sensitivity gate** that warns when a PII-bearing field lacks its DPV annotation. The
> *policy* layer (lawful-basis/consent *instances*, ODRL permissions) is 🔵 deferred — see §6.

### 2.5 It cannot be reasoned over

JSON Schema is inert. You cannot ask it to *infer* anything — that a registered freehold is a kind
of legal estate, that a buyer in one transaction is the seller in the onward chain, that two
records describe one property. There is no entailment, no class hierarchy a machine can traverse,
no transitivity. Every "obvious" inference is something an application must be coded to perform.

> **What the ontology does instead** (🟡): OWL 2 RL entailment is materialised at Jena/Fuseki
> load time. **Honest caveat (carried from the synthesis):** today only RDFS subclass
> type-propagation actually fires (~30 inferred triples) — the model is deliberately flat with no
> inverse/transitive properties *yet*. The *capability* is real and wired; the *depth* is roadmap.

### 2.6 It cannot interoperate across systems — every consumer re-hand-codes meaning

This is the cumulative cost of 2.1–2.5. Because the standard carries names and shapes but not
**identity, semantics, rules, governance, or inference**, **every consumer reconstructs all of
that by hand** — and independently. A lender, a conveyancer's case-management system, a portal and
a search provider each write their own code to decide what a UPRN means, how to join a title to a
property, whether a capacity is evidenced, and which fields are sensitive. The standard guarantees
they parse the *same bytes*; it cannot guarantee they reach the *same meaning*. That gap is where
integration projects stall, where data quality erodes on every hop, and where the "shared
language" the market actually needs fails to materialise.

### 2.7 Summary — the six gaps

| JSON Schema (as a standard) | Gives you | Cannot give you | PDTF symptom |
|---|---|---|---|
| **Identity** | Position-scoped slot names | Stable global identifiers / joins | `uprn` typed 3 ways, unjoined |
| **Semantics** | Value shapes | What a thing *is* | property = estate = title, conflated |
| **Validation** | Structural constraints | Business/legal rules | capacity-evidence in free text |
| **Governance** | (nothing) | PII / special-category / consent typing | privacy lives in prose |
| **Reasoning** | (nothing — inert) | Entailment / inference | every inference hand-coded |
| **Interoperability** | Same bytes | Same *meaning* | each consumer re-hand-codes |

None of this is a criticism of PDTF's authors — it is the **ceiling of the tool**. A linked-data
re-expression raises that ceiling without throwing away the JSON the market already runs on (the
JSON stays the wire format; the ontology becomes the meaning behind it).

---

## 3. The UK policy & market context — why now

The initiative is not a research exercise; it lands inside a hardening UK policy programme to
digitise the property market.

- **DPMSG — Digital Property Market Steering Group.** The cross-industry/government body
  coordinating home-buying-and-selling reform; the governance context PDTF and OPDA operate within
  (README §Governance).
- **DMCC Act 2024 — Digital Markets, Competition and Consumers Act.** Puts the **Smart Data**
  scheme on a **statutory footing**, giving government powers to mandate secure, consented data
  sharing between authorised parties in regulated sectors — the legal engine behind "consent-based
  APIs."
- **The Smart Data scheme / Smart Property Data Trust Framework.** The property-sector application
  of Smart Data — the framework under which a buyer/seller can authorise data to flow between
  lenders, conveyancers, agents and registries. **OPDA secured £742,700 of government funding for a
  sandbox** to test exactly this (the "sandbox" agenda item at the workshop, owned by Paul A).
- **Digital Property Packs (DPP).** The policy push to assemble property information *upfront* and
  *digitally* (replacing the late, paper-driven searches that cause fall-throughs). OPDA's stated
  2026 priority is to **"embed Digital Property Packs as standard."**
- **MHCLG & HM Land Registry.** The policy owner (Ministry of Housing, Communities & Local
  Government) and the authoritative title registry — both on the workshop invite list (Tom
  Treadwell, Stephen Rhodes; HM Land Registry), both central to "trust" and "provenance."
- **"From PDFs to APIs."** The explicit OPDA mandate: move the market off emailed PDFs and
  re-keyed forms onto **machine-readable APIs generated from a shared model**. This is the single
  sentence the linked-data initiative most directly serves — *a model APIs are generated from* is
  precisely an ontology.

**Why this matters for the technical direction.** Each of these levers needs something JSON Schema
cannot supply: consent-based APIs need **machine-readable governance**; PDFs→APIs needs **a model
to generate from**; trust needs **provenance + validation**; HMLR/registry alignment needs
**stable identity**. The linked-data layer is the substrate under all four.

---

## 4. OPDA's mission & 2026 vision — "from momentum to mandate"

From OPDA's "Connected Future for Property Data: Setting the 2026 Vision" and roadmap
(`_external-research.md`):

- **Framing:** *"from momentum to mandate"* — systematic change, not incremental tweaks. Chair
  **Maria Harris**: *"the property market cannot modernise without fixing its data foundations."*
- **Priorities:** scale pilots across regions and transaction types; **embed Digital Property
  Packs as standard**; **universal trust-framework implementation including mandatory consent-based
  APIs**; complete the transition **"from PDFs to APIs."**
- **Funding:** **£742,700** of government funding for **sandbox** testing of the Smart Property
  Data Trust Framework.
- **Outcomes claimed in pilots:** **~15-day** transactions (vs the usual **3–6 months**); **~43%**
  reduction in **fall-throughs / fraud**; genuine **consumer control** over what data is shared and
  with whom.

The linked-data initiative is, in OPDA's own words, *"fixing the data foundations."* It is the
technical answer that makes consent-based APIs governable, PDFs→APIs generable, and trust
provable. This document's purpose at the workshop is to connect that **technical direction** to the
**published strategic mandate** — so the membership reads the ontology not as a side-project but as
the substrate the 2026 vision rests on.

---

## 5. The schema version trajectory (v2.2 → v3.6)

PDTF has evolved steadily through public GitHub releases (`_external-research.md`; dates are
GitHub relative-rendered and approximate):

| Version | ~Date | Highlights |
|---|---|---|
| v2.2.0 | 06 Sep | v2 line |
| v2.3.0 / v2.3.1 | 28 Nov / 07 Dec | v2 line |
| 3.0.0-beta.1 → **v3.0.0** | 31 Jan → 07 Feb | major v3 |
| v3.1.0 | 15 Mar | |
| v3.2.0 | 24 Jul | **BASPI v5** support; conveyancing-quote info; BASPI/PIQ/TA licensing caveats |
| v3.3.0 | 17 Mar | "wide range of small improvements" |
| v3.4.0 | 12 Jun | `participantStatus` (replaces `isRemoved`); chain objects into core; NTS2 overlay (material information) |
| v3.5.0 | 28 Aug | NTS extension overlays; milestones schema (transaction level); draft survey & valuation schemas; overlay-merge fixes |
| **v3.6** | **this workshop** | **up for approval Fri 2026-06-05**; incl. **updated TA-form alignment** |

Two observations matter for the WHY:

1. **The change cadence itself is evidence of the maintenance burden** (§6). Every minor version
   re-touches the hand-built JSON, re-aligns overlays, and re-breaks downstream consumers who had
   hand-coded the previous shape. `v3.4`'s `participantStatus`-replaces-`isRemoved` and the
   recurring "overlay-merge fixes" are exactly the kind of churn a generated, identity-stable model
   is designed to absorb.
2. **The workshop sequence is deliberate.** v3.6 (with TA-form alignment) is **approved first**;
   the "data-schema feedback & next steps" slot follows. That ordering is the natural place to set
   out the linked-data evolution as *the answer to the feedback* — not a replacement for v3.6, but
   the next layer above it.

> **Note on internal version markers.** The nested upstream's `CLAUDE.md` still reads "Schema
> version is currently 3.4.0" and the generated-ontology header reads `owl:versionInfo "1.0.0"`.
> These are independent version lines: the **PDTF schema** is tracking toward v3.6; the **OPDA
> ontology generator/corpus** is at v1.0.0. Don't conflate them.

---

## 6. The membership's data-schema feedback — the problem the initiative answers

The workshop's pre-meeting action asks every attendee to email
`TechSupport@openpropdata.org.uk` with *"learnings / implementation & maintenance challenges with
the current data schema"* (`_external-research.md`). The recurring themes — the standing feedback
the linked-data direction is the answer to — map one-to-one onto the JSON-Schema limits of §2:

| Feedback theme | What members hit | §2 root cause | What linked data offers |
|---|---|---|---|
| **Ambiguity** | Same concept, different fields/types; unclear which is canonical (UPRN ×3) | No stable identity / semantics (2.1, 2.2) | URIs + identity criteria; one term, one meaning, dereferenceable |
| **Interoperability** | Every consumer re-codes joins & meaning; systems agree on bytes, diverge on meaning | No shared semantics (2.6) | One governed model every system dereferences & validates against |
| **Extensibility** | Adding a form/field means editing 37k lines of hand-built JSON + overlays | Flat hand-authored tree | Generated, concern-partitioned modules; new overlays as SHACL profiles |
| **Validation** | Structure validates; business/legal rules don't (capacity-evidence in free text) | No rules beyond structure (2.3) | SHACL severity-tiered constraints; checkable legal rules |
| **Maintenance burden** | Every minor version re-breaks downstream; overlay-merge churn | Hand-maintained, no provenance | Deterministic generator + byte-identity CI; `dct:source` traceability |

This is the crux of the slot: **the linked-data initiative is not a competing standard — it is the
governed meaning layer that makes the JSON standard the membership already uses stop costing them
ambiguity, re-integration, and churn.** The JSON stays the wire format; the ontology becomes the
single source of truth behind it, from which (🔵, roadmap) JSON Schemas, APIs, DDLs, forms and docs
can in time be generated rather than hand-maintained.

---

## Built vs planned

| Capability | Status | Evidence |
|---|---|---|
| PDTF v3 JSON-Schema model + overlays (the input) | ✅ (upstream) | `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json` (37,224 lines) |
| Ontology re-expression (41 classes; Property/LegalEstate/RegisteredTitle split) | ✅ | `source/03-standards/ontology/opda-property.ttl`; ODR-0005 |
| Capacity vs. evidenced-authority two-predicate split | ✅ | `opda-agent.ttl` (`opda:hasAssertedCapacity` / `opda:hasEvidencedAuthority`) |
| SHACL validation contract (90 NodeShapes, severity tiers) | ✅ | `opda-*-shapes.ttl`; 31 overlay profiles in `profiles/` |
| PII/governance typing via DPV (+ SHACL sensitivity gate) | 🟡 | `opda-governance.ttl`; ODR-0012 |
| BASPI5 round-trip MVP (JSON → ontology → validated RDF → JSON) | ✅ | ADR-0014; ODR-0003 §Gate conditions |
| Deterministic generator + byte-identity CI (8 gates) | ✅ | `tools/opda-gen/`; `_research-synthesis.md` §4 |
| OWL reasoning (entailment wired; shallow today) | 🟡 | ODR-0025 / ADR-0035 — only RDFS subclass fires (~30 triples) |
| Machine-readable consent/permission policies (ODRL) | 🔵 | Vocabulary adopted; zero `odrl:` triples emitted (Phase 2) |
| Model-driven downstream generation (JSON Schema / APIs / DDL / forms / UI from the model) | 🔵 | Vision; today = markdown model docs (✅) + SPARQL-rendered entity pages (✅) |
| W3C Verifiable Credentials / DID binding | 🔵 | ODR-0016 — deferred until a real wallet/DID consumer |
| End-user MCP servers / embeddings / local install | 🔵 | AgentDB/ReasoningBank exist internally for the council (✅); no published end-user product |

---

## Talking points for the quarterly tech review

*(Audience: mixed senior decision-makers + data/technical leads — lenders, conveyancers, estate
agents, proptech, HM Land Registry, government. Pitch: technical but accessible; lead with the
problem each constituency feels.)*

- **"PDTF already says what the data looks like; it can't say what the data *means*."** JSON Schema
  names slots and shapes — but in the live v3 schema, **`uprn` is defined three different ways and
  nothing joins them**, and a seller's **power of attorney is a free-text box, not a checkable
  fact**. Every one of your systems re-invents the meaning, differently. *(One slide, two real
  screenshots from the schema — this lands for everyone.)*
- **For lenders & government — trust, fraud, consent.** The headline fix turns "the seller claims
  authority" into "the seller's *asserted* capacity vs. the *evidenced* authority (probate, POA),
  validated by SHACL, traceable by provenance." That is the data foundation under **consent-based
  APIs and the ~43% fraud/fall-through reduction** the 2026 vision promises.
- **For proptech — interoperability & APIs.** One governed model that every system **dereferences
  and validates against**, instead of N hand-coded interpretations — and the path that makes
  **"PDFs → APIs"** mean *APIs generated from the model* (🔵 roadmap), not yet more hand-built
  endpoints.
- **For conveyancers & agents — forms without the re-keying.** The same ontology already
  round-trips a real statutory form: **BASPI5 goes JSON → ontology → validated RDF → JSON with
  every field traceable to its data-dictionary origin** (✅). Overlays (BASPI, TA6, CON29, LPE1)
  become validation profiles over one model, not a dozen divergent JSON trees.
- **This is the substrate under the published mandate.** DMCC 2024 + Smart Data + Digital Property
  Packs + the **£742,700 sandbox** all need machine-readable governance, stable identity and
  provenance. The linked-data layer is exactly "**fixing the data foundations**" — it sits *above*
  v3.6, not against it.
- **Be honest about the roadmap.** ✅ built: the ontology, SHACL validation, the deterministic
  generator under a byte-identity CI gate, the BASPI5 round-trip. 🔵 next: machine-readable consent
  policies (ODRL), deeper reasoning, and model-driven generation of schemas/APIs/code. The
  credibility of the direction rests on *not* over-claiming the destination.

---

## Source files

**Read-first (built upon):**
- `docs/linked-data-initiative/_research-synthesis.md` — verified backbone (standards, what's
  modelled, methodology, pipeline, the honest caveats).
- `docs/linked-data-initiative/_external-research.md` — market, audience, PDTF version history,
  OPDA 2026 vision, the workshop agenda this feeds.
- `docs/linked-data-initiative/_fact-sheet.md` — verified key numbers, standards table, caveats.

**Primary evidence cited:**
- `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json` — the PDTF v3 base model
  (37,224 lines); UPRN at L437/L36650/L37094; `sellersCapacity`/`sellersCapacityDetails` at
  L298–L355.
- `source/03-standards/schemas/CLAUDE.md` — overlay system, merge engine, npm `@pdtf/schemas`.
- `source/03-standards/ontology/opda-property.ttl` — Property / LegalEstate / RegisteredTitle.
- `source/03-standards/ontology/opda-agent.ttl` — `opda:hasAssertedCapacity` /
  `opda:hasEvidencedAuthority`.
- `source/03-standards/ontology/profiles/` — 31 overlay profile shapes (incl. `baspi5.ttl`).
- `docs/ontology/odr/ODR-0003-pdtf-ontology-programme.md` — the conversion problem, the implicit-
  Property defect, programme partition, the BASPI5 round-trip gate.
- `docs/plan/ontology-implementation.md` — inputs table, engineering programme, CI gates, MVP gate.
- `README.md` — OPDA KB overview; Governance vs Modelling workstreams; live site.
