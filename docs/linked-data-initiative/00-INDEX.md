# OPDA Linked-Data Initiative — Knowledgebase

> **Purpose.** The single source of background material for the OPDA (Open Property
> Data Association) linked-data initiative: what we have built, how we built it, and
> where it is going. This knowledgebase is the raw material that will *later* be
> whittled into (a) a ~10-minute technical talk for the OPDA quarterly tech-review
> workshop (Fri 2026-06-05, 10:00–11:00) and (b) a new ADR (ADR-0039) recording the
> proposed technical direction of standards development.
>
> **Current terminology and authority.** The existing **PDTF schema** is the JSON Schema
> package and its supporting dictionary, glossary, overlays and implementation material.
> The ontology described here is a separate draft technical artefact derived from that
> corpus; internal ODR or AI-council status does not confer OPDA or industry endorsement.
> **SPDTF** is the first collaboratively authored scheme draft. The progression is
> schema → scheme, and this directory records evidence that can inform that work.

## Status legend (used across all docs)

- ✅ **built** — implemented and verifiable in the repo today (emitted TTL, generator code, CI gate, live page).
- 🟡 **partial** — partially built / scaffolded / true-but-shallow.
- 🔵 **planned** — direction / vision / roadmap; not built yet.

## The thesis in one paragraph

The existing **PDTF schema** expresses residential property-transaction data as a
versioned JSON Schema package with supporting material. OPDA's technical work used that
corpus to construct a separate draft **linked-data / OWL ontology** covering classes,
properties, controlled vocabularies, validation and candidate governance concepts. The
artefact is SHACL-validated, generated deterministically, and uses stable `/pdtf/**`
identifiers; those identifiers do not make it part of the schema or an endorsed scheme.
The forward direction is for the collaboratively authored **SPDTF** scheme to decide
which of this evidence to adopt, revise or reject, and then to generate downstream
schemas, APIs, code, database views, forms and documentation from governed scheme
decisions where that approach is validated.

## Document map

| Doc | Topic | Status |
|---|---|---|
| `_external-research.md` | Market, audience, PDTF version history, OPDA 2026 vision, the quarterly-workshop context | seed (authored) |
| `_research-synthesis.md` | Verified end-to-end synthesis of the initiative (backbone reference) | seed (authored) |
| `_fact-sheet.md` | Verified key numbers + the standards list + honest caveats | seed (authored) |
| `_10-minute-slide-content.md` | Management-friendly 10-minute slide content aligned to ADR-0039 | seed (authored) |
| `_gamma-deck.md` | Paste-ready Gamma deck source for the quarterly tech review | seed (authored) |
| `01-context-problem-and-market.md` | Why: the PDTF schema, JSON-Schema limits, UK market, OPDA mission, the workshop | ✅ done |
| `02-linked-data-model-architecture.md` | The schema-derived ontology: modules, identity split, classes/properties, bounded contexts and data dictionary | ✅ done |
| `03-standards-and-vocabularies.md` | The "multitude of standards": exhaustive enumeration + adoption tiering | ✅ done |
| `04-governance-and-privacy-modelling.md` | DPV privacy layer + meta-governance (ODR/ADR/council, real-world handoff) | ✅ done |
| `05-authorisation-roles-and-rbac.md` | UFO roles, capacity vs evidenced authority, SKOS role schemes, SHACL enforcement, ODRL-deferred | ✅ done |
| `06-ai-linked-data-council-methodology.md` | The internal AI "Linked Data Council": panellists, Devil's Advocate, voting, ODR technical status, AgentDB | ✅ done |
| `07-generator-pipeline-and-ci.md` | `opda-gen`, three-graph separation, byte-identity, 8 CI gates, Jena/SHACL, OWL-RL, BASPI5 round-trip, serving | ✅ done |
| `08-namespace-versioning-and-publishing.md` | Schema-derived artefact identifiers, slash/no-version, releases and resolution | ✅ done |
| `09-model-driven-generation-vision.md` | Linked data → JSON Schema, APIs, code, DDL, forms, UI/UX, docs (SHACL as the contract) | ✅ done |
| `10-ai-value-and-developer-ecosystem.md` | AI grounding, MCP servers, embeddings/vectors, local install | ✅ done |
| `11-standards-development-releases-and-extensibility.md` | How schema-derived evidence can inform SPDTF releases, modules, profiles, conformance and change management | ✅ done |

## How this knowledgebase was built

Researched and authored by an AI **research swarm** (max-effort, hierarchical/specialised):
each facet doc is written by a dedicated expert agent that reads the ODR corpus, the
implementation ADRs, the emitted Turtle, and the generator code, and cites file-path
evidence. Seed documents (`_*`) were authored from a first verified research pass.

## Caveats (read before quoting anything)

- **Built vs planned.** Several headline claims are *direction*, not done. Respect the
  status legend. Two specific honesty points the whole KB must preserve:
  1. **Authorisation/RBAC** today is a *role + authority-evidence* model (UFO roles +
     SKOS vocabularies + SHACL enforcement). Machine-readable *permission policies*
     (ODRL / consent receipts) are **adopted-but-deferred** (🔵), not built.
  2. **OWL reasoning** is real but **shallow today** — only RDFS subclass entailment
     actually fires, because the model is a flat hierarchy with no inverse/transitive
     properties yet.
- **Prior-meeting research via email was blocked.** The claude.ai Gmail connector is
  authenticated but with insufficient scopes to search/read message bodies, so prior
  workshop threads could not be mined. Prior-meeting context here is reconstructed from
  the **public record** (PDTF GitHub releases, OPDA website/LinkedIn). To unlock the
  email trail, re-grant the Gmail connector read scope.
- **PDTF release dates** taken from GitHub are approximate (relative-date rendering).

## Status & next steps

- ✅ **Knowledgebase complete** — 11 facet docs + 4 seed docs (~4,550 lines), all
  skeleton-compliant; key numbers reconciled (see the counting note in `_fact-sheet.md`).
- ✅ **ADR-0039** written — `../adr/ADR-0039-linked-data-model-as-spdtf-foundation.md`
  — recording the technical proposal that the schema-derived model should provide evidence
  for collaborative SPDTF scheme development.
- 🔜 **Whittle to a ~10-minute talk** — story arc + the "ask" to the working group; each
  facet doc ends with a "Talking points for the quarterly tech review" section to seed this.
- 🔜 *Optional:* re-grant the claude.ai Gmail connector read scope to fold prior-workshop
  email threads into `_external-research.md`.
