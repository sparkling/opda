# Per-module deployment views

This subdirectory provides a **per-module deployment view** of OPDA's seven modules — the foundation graph plus the six business modules. Each page shows, for one module:

- which source TTL(s) the module emits,
- which named-graph IRIs it declares (via `owl:Ontology` + `owl:versionIRI`),
- which derived consumer profile(s) include it,
- which deployed overlays bind classes/properties from it,
- which HTTP content-negotiation entry points resolve into it.

The per-module breakdown is **complementary** to the existing tier organisation (named graphs / derived profiles / content negotiation / overlay deployment / operations). Use this view when you have a module name in hand and want to see "what's deployed for this module". Use the deployment-concern files when you have a deployment question and want to see "which modules participate".

## Module index

| Module | Source TTLs | Module-TBox named graph | Derived profile(s) | Overlay binding |
|---|---|---|---|---|
| [foundation](./foundation.md) | `foundation.ttl` + `opda-classes.ttl` + `opda-shapes.ttl` + `opda-annotations.ttl` | `https://opda.org.uk/pdtf/` | all three | every overlay imports it |
| [property](./property.md) | `opda-property.ttl` + `opda-property-shapes.ttl` + `opda-property-annotations.ttl` | `https://opda.org.uk/pdtf/graph/property` | all three | BASPI5 (Property, Address, LegalEstate) |
| [agent](./agent.md) | `opda-agent.ttl` + `opda-agent-shapes.ttl` + `opda-agent-annotations.ttl` | `https://opda.org.uk/pdtf/graph/agent` | all three | BASPI5 (Seller, Buyer) |
| [transaction](./transaction.md) | `opda-transaction.ttl` + `opda-transaction-shapes.ttl` + `opda-transaction-annotations.ttl` | `https://opda.org.uk/pdtf/graph/transaction` | all three | none yet |
| [claim](./claim.md) | `opda-claim.ttl` + `opda-claim-shapes.ttl` + `opda-claim-annotations.ttl` | `https://opda.org.uk/pdtf/graph/claim` | all three | none yet |
| [governance](./governance.md) | `opda-governance.ttl` + `opda-governance-shapes.ttl` + `opda-governance-annotations.ttl` | `https://opda.org.uk/pdtf/graph/governance` | all three | none yet |
| [descriptive](./descriptive.md) | `opda-descriptive.ttl` + `opda-descriptive-shapes.ttl` + `opda-descriptive-annotations.ttl` | `https://opda.org.uk/pdtf/graph/descriptive` | all three | BASPI5 (EPCCertificate) |

"All three" derived profiles means `opda-validation`, `opda-ui`, and `opda-inference` — see [derived-profiles/](../derived-profiles/) for projection-rule differences.

## Per-page shape

Each module page follows this skeleton:

1. **Source TTL(s)** — links to source files in `source/03-standards/ontology/` + the corresponding Physical-Ontology tier page.
2. **Named graph(s)** — the `owl:Ontology` IRIs declared and their `owl:versionIRI`; load order (which graphs must be loaded before this module's graphs).
3. **Derived-profile membership** — table showing how `opda-validation.ttl` / `opda-ui.ttl` / `opda-inference.ttl` project this module's TTLs.
4. **Overlay bindings** — which deployed overlays target classes/properties from this module.
5. **Content-negotiation entry points** — HTTP resources at `https://opda.org.uk/pdtf/<EntityLocalName>` that resolve into this module's TTLs.
6. **Per-module deployment-graph diagram** — Mermaid `flowchart` showing TTL → named graph → derived profile → overlay binding → HTTP entry point.
7. **Cross-tier links** — back-link to the Logical-tier and Physical-Ontology-tier module pages.

## Why a per-module view at the Physical-DB tier?

The tier's primary organisation is by **deployment concern** (named graphs, derived profiles, content negotiation, overlay deployment, CI operations). That organisation answers "what does the deployment look like". The per-module view answers a different question: **"for this module, where do I find its deployed artefacts and which consumers see it?"**

Both organisations are mechanical projections of the same 24 source TTLs + 1 overlay profile; nothing here is novel content. The per-module pages are link tables + a deployment-graph diagram, not new specification.

## Source ADR + ODR

- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — per-module TBox emission contract.
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012) — per-module shape + annotation emission.
- [ADR-0013 — Overlay profile emission](/modelling/adr/adr-0013) §"Module pluralism" — three derived consumer profiles.
- [ODR-0004 — PDTF ontology foundation](/modelling/odr/odr-0004) §3a — five-part separation contract preserved per module.
