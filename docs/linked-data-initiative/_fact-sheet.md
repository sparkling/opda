# Fact sheet — verified key numbers, standards, caveats

> Quick-reference for slide-building. All figures verified against the repo in the first
> research pass. Legend: ✅ built · 🟡 partial · 🔵 planned.

## Headline numbers

| Metric | Value | Evidence |
|---|---|---|
| Source JSON Schema (base) | **37,224 lines**, Draft-07 | `ODR-0003` context; `pdtf-transaction.json` |
| Unique schema leaves | **1,557** (8,458 path entries) | `docs/plan/ontology-implementation.md` §2 |
| Annotated dictionary leaves | **935** | plan §2 |
| Business-glossary terms | **54** | `business-glossary.ttl` |
| Genuine descriptive concepts after collapse | **~181 (~12% of leaves)** | ODR-0022 / session-023 |
| `owl:Class` (emitted) | **41** | `source/03-standards/ontology/opda-*.ttl` |
| `owl:DatatypeProperty` | **226** | emitted modules |
| `owl:ObjectProperty` | **30** | emitted modules |
| SKOS ConceptSchemes | **47** | `opda-vocabularies.ttl` |
| SKOS Concepts | **~315** | corpus grep `a skos:Concept` |
| SHACL NodeShapes | **≈90** base · **≈96** incl. form profiles | `rdf:type sh:NodeShape` (≈58 base + 38 profile) |
| SHACL severity Violation / Info / Warning | **287 / 28 / ~4** | grep `sh:severity` |
| Overlay profiles (forms) | **31** | `profiles/*.ttl` |
| Diagnostic exemplars (+ expected reports) | **17 (+17)** | `exemplars/` |
| ODRs (modelling decision records) | **28** | `docs/ontology/odr/ODR-*.md` |
| ADRs (engineering) — ontology slice | **0006–0037** (repo set 0001–0038) | `docs/adr/` |
| Council sessions | **~37** (54 files incl. per-expert) | `council/`, `adoption.md` |
| CI gates | **8** | `tools/opda-gen/src/opda_gen/ci/` |
| Bounded contexts | **6** | ODR-0019/0020 |
| Generator / ontology version | **1.0.0** | TTL headers |

> *Counting note (reconciled 2026-06-03): figures are approximate — they vary by **scope**
> (base ontology vs base + the 31 form profiles) and **method** (declared triples vs text
> grep, net of header comments). NodeShapes ≈ 58 base + 38 profile ≈ 96 total (≈90
> base-declared); `owl:Class` ≈ 41–44; SKOS schemes ≈ 47–50. Use ≈ when quoting.*

*Framing tip:* "~28 modelling decision records (ODRs) + ~30 implementation decision
records (ADRs), ~37 AI-council sessions, 8 CI gates" is the cleanest way to quote the
governance/rigour numbers.

## Standards adopted (the "multitude")

**Emitted today (✅):** RDF 1.2, RDFS, OWL 2, XSD, SHACL 1.2 (+ SHACL-AF), SKOS, DCTERMS
(incl. `dct:source` provenance), VANN, DPV + DPV-PD, PROV-O, gUFO, W3C Org, vCard, OWL-Time,
DASH. Foundational theory (typing/methodology, not serialised): **UFO**, **DOLCE**,
**OntoClean**.

**Adopted but deferred (🔵):** ODRL (consent/permission policies), DCAT 3 (catalogue),
SSSOM/SEMAPV (mappings), W3C Verifiable Credentials + DID Core (ODR-0016), `dpv-gdpr`/
`dpv-legal`.

**Reviewed & explicitly NOT adopted:** schema.org, DCAT-AP, FIBO, SOSA/SSN, QUDT,
GeoSPARQL (behind an `opda:hasGeometry` seam), FOAF, BBO, ArchiMate.

## The six ontology modules (✅)

`opda-property.ttl` · `opda-agent.ttl` · `opda-transaction.ttl` · `opda-claim.ttl` ·
`opda-descriptive.ttl` · `opda-governance.ttl` — each `owl:imports` the one flat ontology
at `https://opda.org.uk/pdtf/`.

## Pipeline at a glance (✅)

JSON Schema → data dictionary → `opda-gen` emitters → canonical Turtle (byte-identity
gate) → Apache Jena (SHACL 1.2 validation + OWL-RL load-time inference) → Fuseki + grlc
(SPARQL-as-REST) → Astro site → Cloudflare Pages.

## Honest caveats (must survive into the talk)

1. 🟡 **Authorisation/RBAC** = role + authority-evidence model (UFO roles + SKOS + SHACL).
   Machine-readable **permission policies (ODRL)** are 🔵 adopted-but-deferred (zero
   `odrl:` triples emitted).
2. 🟡 **OWL reasoning** real but shallow — only RDFS subclass entailment fires today (flat
   hierarchy; no inverse/transitive/symmetric properties). ~30 inferred triples.
3. 🔵 **Model-driven downstream generation** (JSON Schema / APIs / code / DDL / forms /
   UI from the model) — vision; what exists today is the **markdown model documentation**
   on the website (✅) and SPARQL-rendered entity pages (✅). Verify each claim before
   quoting.
4. 🔵 **MCP servers / embeddings / local install for end users** — vision; AgentDB +
   ReasoningBank exist internally for the council process (✅), not yet a published end-user
   MCP/embedding product.

## The "directing authority" pattern (for the methodology story)

AI Council *proposes* (with votes + dissent); the human directing authority *disposes* and
can override on greenfield grounds (e.g. kept slash URIs against a 5-2 council vote for
hash; mandated full descriptive coverage). "AI proposes, human disposes."
