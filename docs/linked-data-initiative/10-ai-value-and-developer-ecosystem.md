# AI value & the developer / end-user ecosystem

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.
>
> Builds on `_research-synthesis.md`, `_external-research.md`, `_fact-sheet.md`. Where this
> doc says "already built", it cites a file path. The honest split: the *internal* tooling
> that proves the pattern (AgentDB vector index, ReasoningBank, the grlc SPARQL→REST API)
> is ✅/🟡; a *published, end-user* OPDA/PDTF MCP + embedding product is 🔵 — a roadmap, not
> a shipped deliverable. This document is a credible engineering roadmap, not a pitch.

## TL;DR

- **A governed linked-data model is unusually good context for AI.** Every term has an IRI, a
  definition, a `dct:source` provenance trail, a UFO/DOLCE identity criterion, and a SHACL
  shape. That turns "the model" from free text an LLM must guess at into a graph an AI can
  *retrieve*, *cite*, *reason over*, and *validate against* — the difference between a plausible
  answer and a grounded, checkable one.
- **The owner's forward requirement** — *"provide APIs and MCP servers for end users to interact
  with, installable locally, along with embeddings, vectors, etc."* — decomposes into three
  delivery surfaces: **APIs** (SPARQL + REST), an **OPDA MCP server** (tool-callable by AI agents,
  locally installable for data sovereignty), and an **embedding/vector index** (semantic search /
  RAG over SKOS concepts, class/shape definitions, and ODR rationales).
- **One of the three already exists in build form.** The **grlc SPARQL→REST API** is real, with
  a working query engine and a JSON-LD-shaped contract (`src/api/`, ✅ ADR-0021) — today scoped
  to build-time static-site generation, not yet a runtime public endpoint (🟡→🔵).
- **The embedding/RAG pattern is already proven internally, on this very corpus.** AgentDB
  (vector embeddings + HNSW + semantic search) and ReasoningBank index the council/ODR
  deliberations for recall, provenance traversal, and learning (✅ ADR-0027). That is the
  proof-of-pattern for an end-user embedding product — but it indexes *the project's own
  governance*, not yet a published PDTF concept index (🔵).
- **The OPDA MCP server is the keystone 🔵 deliverable.** A small server exposing tools like
  `lookup_term`, `validate_shacl`, `sparql_query`, `get_profile`, `trace_provenance` — installable
  locally so a lender or conveyancer keeps their data in-house — is the most direct way to make
  the standard *actionable* inside the AI tools the whole industry is now adopting. It does not
  exist yet; the substrate it would wrap does.
- **Strategic fit.** This is the technical answer to OPDA's published 2026 mandate —
  consent-based APIs, data sovereignty, "PDFs → APIs" — extended one step further: not just APIs
  for systems, but a *machine-actionable knowledge surface* for the AI agents those systems will
  increasingly be built from.

---

## 1. Why a governed linked-data model is high-value context for AI

The PDTF JSON Schema is a fine *data contract* but a poor *knowledge source* for an AI. JSON
Schema names slots and constrains shapes; it cannot say which things have stable identity, how a
seller's *asserted* authority differs from *evidenced* authority, which fields carry
special-category personal data, or *why* a modelling choice was made. An LLM asked about PDTF from
free text fills those gaps by guessing. The ontology closes them — and each closure maps to a
concrete AI capability.

### 1.1 Grounding & disambiguation — IRIs, definitions, provenance, not guesses

Every class, property, and concept in the OPDA ontology is a dereferenceable IRI carrying an
`rdfs:label`, an `rdfs:comment` (definition, plus the identity criterion and hard cases verbatim),
a `skos:scopeNote` (the UFO/DOLCE meta-category), and a `dct:source` provenance link
(`source/03-standards/ontology/opda-*.ttl`, ✅). `dct:source` is the second-most-used prefix in
the corpus — *every* term traces to a data-dictionary leaf, glossary row, ODR section, or
regulator (`_research-synthesis.md` §1).

For an AI this is the difference between "I think PDTF's *property* means the building" and
"`opda:Property` is the UFO Substance Kind (the physical thing), distinct from `opda:LegalEstate`
and `opda:RegisteredTitle`, identity-criterion = *physical continuity*, UPRN is a *contingent*
identifier not the IC — sourced from ODR-0005 §2a." The flagship identity split (ODR-0005) is
precisely a *disambiguation* win: PDTF conflated three things into one implicit entity with no join
key; the ontology gives an AI three crisply separated referents and forbids `owl:sameAs` so the
machine cannot silently merge them.

### 1.2 Reasoning — OWL/SHACL give machine-checkable structure

Structure an AI can compute over, rather than infer stochastically:

- **OWL class/property axioms** let an agent answer "what is `opda:Conveyancer` and what may bear
  that role?" structurally — Roles are borne by `opda:Person`/`opda:Organisation` Kinds
  (`opda-agent.ttl`, ✅), not free-associated.
- **SHACL shapes** (90 NodeShapes, ✅) are a *machine-checkable* statement of what a valid instance
  looks like — cardinalities, value sets (`sh:in`), identity-key uniqueness, severity tiers.
- **OWL-RL entailment** materialises derived facts at load time in Jena/Fuseki (ADR-0035, ✅).

**Honest scope (🟡):** the reasoning that *fires today* is shallow — only `rdfs:subClassOf`
type-propagation, ~30 inferred triples, because the model is a flat hierarchy with no
inverse/transitive/symmetric properties yet (`_fact-sheet.md` caveat 2). The *value to AI* is
less about deep inference and more about the **explicit, queryable structure** (the SHACL shapes
and the class/property graph) being present at all — that is what an LLM otherwise lacks.

### 1.3 Provenance & trust — the AI can cite its basis

PROV-O is the backbone of the claims/evidence layer (`opda-claim.ttl`, ~80% of the eIDAS
`verifiedClaims` envelope, ✅) and `dct:source` threads every term back to an authority. An AI
grounded in this graph can answer *"and how do you know?"* — citing the ODR that decided it, the
regulator behind a constraint, or the evidence type (probate, power of attorney) that backs an
authority claim. For a lender or HM Land Registry, an answer it can *audit* is worth far more than
one it must trust blindly; provenance is what makes AI output admissible in a regulated workflow.

### 1.4 Machine-actionable governance & consent — DPV (and ODRL, later)

PII is typed at the schema (TBox) level via **DPV/DPV-PD** — each PII-bearing Kind declares its
baseline category (`opda:DPVMappingRecord` in `opda-governance.ttl`, ✅), Article-10 terms get
`dpv:hasSpecialCategoryPersonalData`, and a SHACL sensitivity gate warns when a PII leaf lacks its
DPV annotation (`_research-synthesis.md` §2b). An AI agent operating over a transaction can read
*from the model* which fields are personal/special-category and gate its own behaviour accordingly
— consent and data-handling become things the agent can *check*, not policy it must be told.

**Honest scope (🔵):** the machine-readable *permission policies* — ODRL consent receipts,
lawful-basis instances — are adopted-but-deferred (zero `odrl:` triples emitted,
`_fact-sheet.md` caveat 1). DPV gives the AI the *sensitivity map* today; ODRL would give it
*enforceable consent rules* in Phase 2.

### 1.5 Reduced hallucination — validate AI output against SHACL

The capability that most directly "makes the AI harness more capable": when an AI *generates*
PDTF-shaped data (drafting a BASPI return, filling a TA6, proposing a transaction record), the
output can be **validated against the SHACL shapes** before anyone trusts it. The model already
proves the round-trip: BASPI5 JSON → ontology → SHACL-validated RDF → BASPI5 JSON, with full
`dct:source` traceability (ADR-0014 round-trip harness, ✅). An AI in that loop has a
*deterministic critic* — invalid structure is rejected by the validator, not waved through by a
plausible-sounding model. This is retrieval-augmented generation closed into a
**generate-then-validate** loop, which is materially stronger than RAG alone.

### 1.6 RAG grounded in a curated ontology vs free-text RAG — the core argument

Ordinary RAG retrieves *text chunks* and hopes the model stitches them correctly. Ontology-grounded
RAG retrieves *typed, linked, sourced facts*:

| Dimension | Free-text RAG over PDF/JSON | Ontology-grounded RAG (this initiative) |
|---|---|---|
| Unit of retrieval | Text chunk | Typed node (IRI + definition + class) |
| Disambiguation | Model guesses sense | IRI + UFO identity criterion fix the referent (§1.1) |
| Structure | Implicit in prose | Explicit OWL/SHACL graph (§1.2) |
| "How do you know?" | Cite a chunk | Cite `dct:source` → ODR/regulator (§1.3) |
| Output validation | None | SHACL critic (§1.5) |
| Consent/PII awareness | Not represented | DPV typing readable from the model (§1.4) |
| Drift | Re-chunk on every edit | Regenerated under byte-identity gate; index rebuilds from TTL |

The curated ontology is, in effect, a *high-precision retrieval corpus* purpose-built so an AI
retrieves the right thing, knows what it is, and can prove it.

---

## 2. The delivery vision (🔵) — three surfaces on one substrate

The owner's requirement names three things: **APIs**, **MCP servers (locally installable)**, and
**embeddings/vectors**. They are three *consumption surfaces* over the one ontology + triplestore.

### 2.1 APIs — SPARQL + REST  (✅ build-form / 🔵 as a public product)

**What exists (✅ ADR-0021).** A working **grlc-style SPARQL→REST API** lives at `src/api/`:

- A query engine (`src/api/lib/grlc-engine.js`, `grlc-handler.js`) reads `.rq` SPARQL files
  decorated with `#+` comments (`endpoint:`, `method:`, `mime:`, `querytype:`) and builds Express
  routes — the grlc convention (https://grlc.io).
- A small query catalogue (`src/api/queries/*.rq`): `get-entity.rq`, `list-entities.rq`,
  `list-entities-count.rq`. `get-entity.rq` is a UNION SELECT that assembles an entity's core
  facts, `dct:source`, typed attributes (with SHACL cardinality joins), relationships, and SHACL
  constraints into a single JSON contract (`src/api/README.md`).
- Operational routes (`src/api/routes/operational.js`): `GET /health`, **`GET /namespaces`**
  (prefix→IRI map), and a read-only **`GET /sparql?query=...`** pass-through.
- Served by Apache Jena Fuseki 6.1.0, self-provisioned and launched by
  `scripts/build-with-data.mjs`; TTLs loaded into per-module named graphs by
  `scripts/fuseki-load.mjs`. Run locally with `make serve-data` / `make api`.

**Honest scope (🟡→🔵).** This API is **build-time-only** today — Astro's `getStaticPaths`
queries it to generate static entity pages, then it is torn down; production ships only `dist/`,
with *no runtime triplestore or API* (ADR-0021 §CI integration). Two gaps before it is an
end-user product: (a) it must be **stood up as a persistent, hardened endpoint** (auth/rate-limit
— see the hosting work in ADR-0038); (b) the emitted IRIs the API returns still carry the
transitional `w3id.org/opda/#` namespace in code, while the published target is
`opda.org.uk/pdtf/` slash (`_research-synthesis.md` §5) — the dereference story lands when those
converge. The `.rq` + JSON-LD contract is *designed* to be the stepping stone to the live
`opda.org.uk/pdtf/<Entity>` endpoint (ADR-0021 forward link).

So: **the REST half of "APIs" is built as a reusable engine and contract (✅); exposing it as a
public, consent-gated API is 🔵.** SPARQL is available today via the pass-through but is, likewise,
build-time-scoped.

### 2.2 MCP servers, locally installable — the keystone (🔵)

The **Model Context Protocol** is the emerging open standard by which AI agents (Claude Code,
IDE assistants, agentic harnesses) call external *tools* and read external *resources* over a
uniform interface. An **OPDA/PDTF MCP server** would wrap the substrate above as a set of
agent-callable tools. None of this is built; the value is that the things it would wrap mostly
*are*.

**Why local installation matters (the data-sovereignty argument).** Lenders and conveyancers
cannot send live transaction data — names, valuations, title detail — to a third-party cloud
service on a whim. An MCP server distributed as a small, locally-runnable process (the ontology +
a embedded triplestore + the tool handlers) lets a member firm point its *own* AI tooling at PDTF
knowledge **without data leaving the building**. The ontology is public; the firm's instances stay
in-house. This is the technical embodiment of OPDA's data-sovereignty and consent-based-API
stance, applied to the AI layer.

**Sketch of the tool surface (🔵).** Each tool maps to a capability that already has a substrate:

| MCP tool (proposed) | What it does | Wraps (today's substrate) | Status of substrate |
|---|---|---|---|
| `lookup_term` | Resolve a label/IRI → definition, IC, hard cases, UFO category, `dct:source` | `get-entity.rq` over Fuseki | ✅ (build-form) |
| `sparql_query` | Run a read-only SPARQL query over the PDTF graph | `GET /sparql` pass-through | ✅ (build-form) |
| `validate_shacl` | Validate a candidate instance graph against the PDTF/profile shapes → report | Jena SHACL 1.2 validator (ADR-0036) | ✅ |
| `get_profile` / `get_form` | Return the SHACL profile + DASH UI hints for a form (BASPI5, TA6…) | 31 overlay profiles (`profiles/*.ttl`) | ✅ |
| `trace_provenance` | Given a term/shape, return its ODR/regulator chain and the deliberation behind it | `dct:source`; AgentDB session↔ODR edges (ADR-0027) | ✅ |
| `list_concepts` / `search_concepts` | Enumerate / semantically search the SKOS vocabularies (roles, tenure, perils…) | 47 SKOS schemes; embedding index (§2.3) | ✅ schemes / 🔵 semantic search |
| `roundtrip_baspi5` | JSON → ontology → validated RDF → JSON with traceability | ADR-0014 round-trip harness | ✅ |

**How a developer or AI agent would consume it (🔵).** A developer adds the OPDA MCP server to
their agent config (the same way the `ruflo` MCP server is registered in this very repo —
`CLAUDE.md`); the agent then *discovers* the tools and calls them. Concretely, an agent drafting a
property pack would: `search_concepts("tenure")` to find the right controlled value →
`get_profile("BASPI5")` to learn the required shape → draft the JSON → `validate_shacl(draft)` →
fix what the report flags → `trace_provenance` to cite each field's basis in its answer. That loop
is *grounded* (every value from the vocabulary), *validated* (SHACL critic), and *auditable*
(provenance) — the three §1 properties, delivered as tools.

### 2.3 Embeddings + vectors — semantic search / RAG  (🔵 product / ✅ pattern)

**The deliverable (🔵).** Embed the *content* of the ontology — `skos:prefLabel` +
`skos:definition`/`scopeNote` for each of the ~315 SKOS concepts, the `rdfs:comment` (definition +
IC + hard cases) of each of the 41 classes, the SHACL `sh:message` text of each shape, and the
narrative of each ODR rationale — into a vector index, **HNSW-indexed** for fast approximate
nearest-neighbour search. That index powers `search_concepts`/semantic lookup (§2.2) and is the
retrieval stage of ontology-grounded RAG (§1.6): a natural-language query → nearest concepts/
classes/shapes → their *typed, sourced* facts handed to the model.

**Why this corpus embeds well.** Unlike raw JSON, each unit to embed is already a *curated,
self-contained definition with a stable IRI key* — so a vector hit returns not a text fragment but
a resolvable node the agent can then expand structurally (via `lookup_term`/SPARQL). Embeddings do
the *fuzzy recall*; the graph does the *precise expansion*. That hybrid (vector recall → graph
traversal) is exactly the pattern the next section shows is already running internally.

---

## 3. What exists today that proves the pattern (✅/🟡)

The end-user product (§2) is mostly 🔵 — but the **mechanisms it depends on are already in
production use inside this project**, which de-risks the roadmap considerably. The honest line:
*these prove the pattern; they are not yet a published end-user PDTF product.*

### 3.1 AgentDB — vector embeddings + HNSW + semantic search, on this corpus (✅, ADR-0027)

The Linked Data Council's deliberations are indexed in **AgentDB** with four complementary
mechanisms (ADR-0027 §Mapping):

1. **Recall — semantic search.** A `council-sessions` vector namespace holds each session's
   verdict + re-open triggers + held-as-live dissents, so a new council can semantically search
   prior deliberations before convening ("what has the Council already argued about namespaces?").
2. **Provenance — graph.** Traversable `session —deliberated→ ODR` / `ODR —derivedFrom→ session`
   causal edges, so "trace this rule → its deliberation → the ratifying vote" is a *query*, not a
   grep.
3. **Learning — ReasoningBank.** One trajectory per session (position → DA-challenge → vote),
   tagged with the verdict, for distilling which argument patterns win.
4. **Enumeration — hierarchical `episodic` tier**, alongside the `odr/*`/`adr/*` records (recorded
   honestly as largely redundant with #1).

This is **embeddings + vectors + HNSW + semantic search + provenance graph, working, today** — the
precise stack §2.3 proposes for the *public concept index*. The difference is the *corpus*: AgentDB
indexes the project's **own governance** (the council/ODR record), not yet the PDTF concept model
exposed to end users. Promoting the pattern from "index our decisions" to "index the standard for
the world" is a scoping/productisation step, not a research gamble.

> Note on artefacts: AgentDB and ReasoningBank are **MCP-tool-backed infrastructure** (the `ruflo`
> server registered in `CLAUDE.md`), not files committed to this repo — so "it exists" means "the
> tooling is in use per ADR-0027", verifiable through the ADR and the tool registry, not via an
> emitted `.ttl`. Stated plainly so the claim is not mistaken for a checked-in artefact.

### 3.2 ReasoningBank — adaptive learning over the deliberation corpus (✅, ADR-0027)

ReasoningBank (mechanism 3 above) is the "make the harness *more intelligent over time*" piece: it
captures *why* arguments succeed and feeds that back so AI-assisted councils reason better. ADR-0027
is candid that this **only pays off at scale** — it adds storage now for a benefit that
materialises across many sessions. That is the same honest economics any end-user learning layer
would carry, and worth stating: the *learning* surface is the least mature of the three.

### 3.3 The grlc REST + SPARQL endpoint (✅ build-form, ADR-0021)

Covered in §2.1: a real engine, real `.rq` catalogue, real JSON-LD contract, real Fuseki backing —
serving build-time static generation today, one hardening step from a live API.

### 3.4 The ruflo MCP toolset is in active use (✅)

This repository is *already developed through* an MCP server (`ruflo`, registered per `CLAUDE.md`,
with deferred tools loaded via `ToolSearch`). The team therefore has first-hand operational
experience of the exact delivery mechanism §2.2 proposes for end users — building *and consuming*
MCP tools is established practice here, not a new bet. The novelty in §2.2 is the *server's
content* (PDTF knowledge), not the protocol or the integration pattern.

---

## 4. Concrete reference architecture (diagram-as-text)

```
                         ┌──────────────────────────────────────────┐
                         │  SOURCE OF TRUTH                          │
                         │  OPDA/PDTF ontology (OWL/RDF/SHACL/SKOS)  │  ✅
                         │  source/03-standards/ontology/*.ttl       │
                         │  emitted by opda-gen under byte-identity  │
                         └───────────────────┬──────────────────────┘
                                             │ load (scripts/fuseki-load.mjs)
                                             ▼
                         ┌──────────────────────────────────────────┐
                         │  TRIPLESTORE — Apache Jena Fuseki 6.1.0   │  ✅
                         │  SHACL 1.2 validation · OWL-RL inference  │  (🟡 shallow)
                         └───┬──────────────────┬───────────────┬───┘
                             │                  │               │
              ┌──────────────▼───┐   ┌──────────▼─────────┐   ┌─▼────────────────────┐
              │ SPARQL + REST API│   │ OPDA MCP server    │   │ Embedding / vector   │
              │ (grlc engine,    │   │ tools: lookup_term,│   │ index (HNSW)         │
              │  .rq + JSON-LD)  │   │ validate_shacl,    │   │ SKOS concepts, class │
              │ src/api/         │   │ sparql_query,      │   │ + shape defs, ODR    │
              │ ✅ build-form    │   │ get_profile,       │   │ rationales           │
              │ 🔵 public/hosted │   │ trace_provenance   │   │ 🔵 product           │
              │                  │   │ 🔵 (substrate ✅)   │   │ ✅ pattern (AgentDB, │
              │                  │   │ locally installable│   │    ADR-0027)         │
              └──────────┬───────┘   └─────────┬──────────┘   └──────────┬───────────┘
                         │                     │                         │
                         └──────────┬──────────┴────────────┬───────────┘
                                    ▼                        ▼
                     ┌──────────────────────────┐  ┌────────────────────────────┐
                     │ Developers / IDEs         │  │ Member-firm apps           │
                     │ AI agents & harnesses     │  │ (lenders, conveyancers,    │
                     │ (Claude Code, etc.)       │  │  estate agents, proptech)  │
                     │ → grounded, validated,    │  │ → consent-gated, data      │
                     │   auditable PDTF answers  │  │   stays in-house (local MCP)│
                     └──────────────────────────┘  └────────────────────────────┘
```

The shape is deliberately simple: **one governed model → three consumption surfaces → consumed by
the AI tools the industry is already adopting.** Two of the three surfaces have a built substrate
(REST API ✅; embedding pattern ✅ via AgentDB); the MCP server is the new assembly (🔵) that binds
them into one agent-facing product, and local installation is what makes it acceptable to
regulated data holders.

---

## 5. Tie to OPDA strategy

The initiative is the technical substrate for OPDA's published 2026 mandate
(`_external-research.md` §"OPDA 2026 vision"), and the AI layer extends each strand:

- **Consent-based APIs.** OPDA's roadmap calls for *mandatory consent-based APIs*. DPV typing in
  the model (§1.4, ✅) makes consent/PII *machine-readable*; ODRL (🔵) would make it *enforceable*;
  the MCP `validate_shacl`/`get_profile` tools (🔵) let an AI agent *honour* those constraints
  programmatically. The AI surface is where consent rules get *executed*, not just declared.
- **Data sovereignty.** The locally-installable MCP server (§2.2) is the concrete mechanism for
  "the firm keeps its data" — public ontology in, private instances never out. This directly
  answers the lender/gov constituency's concern (trust, fraud, consent) named in
  `_external-research.md`.
- **"PDFs → APIs" → "APIs → agent-actionable knowledge."** OPDA frames the transition from PDFs to
  APIs. This adds the next rung: not only can a *system* call an API, an *AI agent* can call a
  tool, retrieve a grounded fact, validate its own output, and cite its basis — making the standard
  actionable inside the agentic tooling every represented sector (lenders, proptech, conveyancers)
  is now adopting.
- **Making the standard *actionable*.** A JSON Schema is something engineers read. A governed,
  IRI-keyed, SHACL-validated, embedding-indexed, MCP-exposed model is something *both* engineers
  *and* their AI tools can act on — which is what "from momentum to mandate" needs to mean at the
  data-foundations layer.

---

## Built vs planned

| Capability | Status | Evidence / note |
|---|---|---|
| IRIs + definitions + UFO IC + `dct:source` on every term (grounding) | ✅ | `source/03-standards/ontology/opda-*.ttl`; ODR-0005 identity split |
| SHACL shapes as a machine-checkable validity contract | ✅ | 90 NodeShapes; Jena SHACL 1.2 (ADR-0036) |
| PROV-O provenance / `dct:source` so an AI can cite its basis | ✅ | `opda-claim.ttl`; `dct:source` corpus-wide |
| DPV/DPV-PD PII typing readable from the model | ✅ | `opda-governance.ttl`; SHACL sensitivity gate |
| Generate-then-validate loop (SHACL critic for AI output) | ✅ | BASPI5 round-trip harness (ADR-0014) |
| OWL-RL reasoning materialised at load time | 🟡 | ADR-0035; only subclass entailment fires (~30 triples) |
| ODRL machine-readable *consent/permission policies* | 🔵 | zero `odrl:` triples; Phase-2 (`_fact-sheet.md` caveat 1) |
| grlc SPARQL→REST API engine + `.rq` catalogue + JSON-LD contract | ✅ | `src/api/` (engine, queries, README); ADR-0021 |
| SPARQL read-only pass-through + `/namespaces` + `/health` | ✅ | `src/api/routes/operational.js` |
| …exposed as a **public, hosted, consent-gated** API endpoint | 🔵 | today build-time-only; hardening + namespace convergence pending (ADR-0021, ADR-0038) |
| AgentDB vector index + HNSW + semantic search (recall) | ✅ | ADR-0027 (indexes the *council/ODR* corpus) |
| AgentDB provenance graph (session↔ODR causal edges) | ✅ | ADR-0027 mechanisms 2 |
| ReasoningBank adaptive-learning layer | ✅ | ADR-0027 mechanism 3 (pays off only at scale) |
| ruflo MCP toolset in active use (proves MCP build+consume) | ✅ | `CLAUDE.md` (registered, deferred tools) |
| **OPDA/PDTF MCP server** (lookup/validate/sparql/profile/provenance tools) | 🔵 | substrate mostly ✅; server is unbuilt assembly |
| MCP server **locally installable** (data sovereignty) | 🔵 | design goal; not yet packaged |
| **Embedding index of PDTF concepts/classes/shapes/ODRs** for public RAG | 🔵 | pattern ✅ (AgentDB on council corpus); PDTF-content index not built |

---

## Talking points for the quarterly tech review (mixed senior + technical)

- **"AI is only as good as the context it's given — and we have built the best possible context for
  PDTF."** A JSON Schema lets an AI *guess*; a governed ontology lets it *retrieve a definition,
  reason over structure, validate its own output, and cite its source.* That is the difference
  between a plausible answer and an auditable one — and in a regulated market, auditable is the
  only kind that counts.
- **One of the three pieces the owner asked for already runs.** The SPARQL→REST API is built (`src/api/`,
  ADR-0021); it serves our site today and is one hardening step from a public, consent-gated
  endpoint. We are not starting from zero.
- **The embedding/RAG pattern is already proven *on our own corpus*.** AgentDB (vectors + HNSW +
  semantic search + a provenance graph) indexes the AI-Council deliberations today (ADR-0027). The
  open work is pointing that same proven machinery at the *PDTF concepts* for end users — a
  productisation step, not a research risk.
- **The headline new build is a locally-installable OPDA MCP server.** It wraps the model as tools
  an AI agent can call — *look up a term, validate against SHACL, run a SPARQL query, fetch a form
  profile, trace provenance* — and it runs **in the firm's own environment, so transaction data
  never leaves the building.** That is data sovereignty and consent-based access, applied to the AI
  layer the whole industry is adopting.
- **Be honest about the split.** Most of the *end-user AI product* is roadmap (🔵). What's real
  (✅/🟡) is the substrate it stands on — the governed model, the validation critic, the API engine,
  and the internal embedding/learning stack that proves the pattern. We are proposing to *assemble
  and expose* proven parts, not invent new ones.
- **This is the AI-era answer to "fix the data foundations."** OPDA's mandate is consent-based APIs,
  data sovereignty, and PDFs→APIs. The linked-data model is that foundation; the MCP + embedding
  layer is how the standard becomes *actionable inside the AI tools* lenders, conveyancers, and
  proptech are already deploying.

---

## Source files

- `docs/linked-data-initiative/_research-synthesis.md` — backbone (standards, modules, identity
  split, methodology, AgentDB §2b/§3, namespace, caveats).
- `docs/linked-data-initiative/_external-research.md` — OPDA 2026 vision, consent-based APIs,
  PDFs→APIs, audience sectors.
- `docs/linked-data-initiative/_fact-sheet.md` — verified counts; the four honest caveats
  (RBAC/ODRL, shallow OWL reasoning, model-driven generation, MCP/embeddings as vision).
- `docs/adr/ADR-0027-council-session-indexing-in-agentdb.md` — AgentDB vector/HNSW + provenance
  edges + ReasoningBank over the council/ODR corpus (the proof-of-pattern).
- `docs/adr/ADR-0021-generate-manual-entity-pages-via-fuseki-grlc-sparql-api.md` — grlc SPARQL→REST
  API; build-time-only; forward link to the live `opda.org.uk/pdtf/<Entity>` endpoint.
- `src/api/` — the live engine: `lib/grlc-engine.js`, `lib/grlc-handler.js`, `queries/*.rq`,
  `routes/operational.js` (SPARQL pass-through, `/namespaces`), `README.md` (contract + endpoints).
- `scripts/build-with-data.mjs`, `scripts/fuseki-load.mjs` — Fuseki 6.1.0 self-provision + load
  (the triplestore tier of the diagram).
- `docs/adr/ADR-0038-hosting-auth-and-comments-architecture-aws.md` — hosting/auth context for
  standing the API up as a hardened public endpoint (the 🔵 step in §2.1).
- `CLAUDE.md` — the `ruflo` MCP server registration (proof that MCP build+consume is established
  practice here).
