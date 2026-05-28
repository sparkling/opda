---
kind: operations
tier: physical-database
title: Format matrix
---

# Format matrix

Per-resource format availability against the OPDA namespace `https://w3id.org/opda/*`. The 302 redirect via W3C PICG resolves each URL to the OPDA institutional domain (`https://openpropdata.org.uk/ontology/`); the matrix below shows what the origin server returns at the redirect target per `Accept` header.

## Headline matrix

| Resource path | `text/turtle` | `application/ld+json` | `application/rdf+xml` | `text/html` | Notes |
|---|---|---|---|---|---|
| `https://w3id.org/opda/` | yes | yes | yes | redirect to docs | Foundation namespace; serves `foundation.ttl` (15 triples) |
| `https://w3id.org/opda/1.0.0/` | yes | yes | yes | yes | Version-IRI; immutable per release |
| `https://w3id.org/opda/vocabularies/` | yes | yes | yes | redirect to docs | SKOS scheme aggregate (873 triples; 23 schemes) |
| `https://w3id.org/opda/<module>/` | yes | yes | yes | yes | Module TBox where `<module>` ∈ {property, agent, transaction, claim, governance, descriptive} |
| `https://w3id.org/opda/<module>/1.0.0/` | yes | yes | yes | yes | Module version-IRI |
| `https://w3id.org/opda/<module>-shapes/` | yes | yes | yes | redirect to docs | Per-module SHACL shapes |
| `https://w3id.org/opda/<module>-annotations/` | yes | yes | yes | redirect to docs | Per-module DPV annotations |
| `https://w3id.org/opda/shapes` | yes | yes | yes | redirect to docs | Foundation meta-shapes |
| `https://w3id.org/opda/annotations` | yes | yes | yes | redirect to docs | Foundation meta-annotations |
| `https://w3id.org/opda/profiles/baspi5` | yes | yes | yes | docs page | BASPI5 overlay profile (488 triples) |
| `https://w3id.org/opda/profiles/baspi5/0.1.0/` | yes | yes | yes | yes | BASPI5 version-IRI |
| `https://w3id.org/opda/<EntityLocalName>` | yes | yes | yes | Concept-tier page | Per-entity dereference (e.g. `…/Property`, `…/LegalEstate`, `…/Buyer`) |
| `https://w3id.org/opda/derived/opda-validation.ttl` | yes | yes | yes | redirect to docs | Pending composer activation |
| `https://w3id.org/opda/derived/opda-ui.ttl` | yes | yes | yes | redirect to docs | Pending composer activation |
| `https://w3id.org/opda/derived/opda-inference.ttl` | yes | yes | yes | redirect to docs | Pending composer activation |
| `https://w3id.org/opda/context.jsonld` | no (JSON-only) | yes | no | no | Canonical JSON-LD `@context` (see [jsonld-context.md](./jsonld-context.md)) |

## Per-entity dereference behaviour

A request like `GET https://w3id.org/opda/Property` with `Accept: text/turtle` returns the **fragment of `opda-property.ttl` containing `opda:Property`** plus the foundation-level context triples needed for the entity to make sense in isolation:

- The `opda:Property` `owl:Class` declaration
- `rdfs:subClassOf` chain to the nearest `owl:Class` in the foundation graph (transitive)
- `rdfs:label`, `rdfs:comment`, `skos:scopeNote`, `dct:source` on `opda:Property`
- The `opda:` and `xsd:` prefix declarations
- The `https://w3id.org/opda/` `owl:Ontology` header (so the consumer knows which release the fragment came from)

This is the "concise bounded description" pattern: enough context to validate the fragment in isolation, but not the whole module. Consumers needing the full module fetch `https://w3id.org/opda/property/` instead.

## Conditional requests

Origin server honours `If-None-Match` (`ETag`-based) and `If-Modified-Since` (`Last-Modified`-based). Version-IRI URIs (`/1.0.0/`, `/0.1.0/`) are immutable, so consumers can cache aggressively (`Cache-Control: public, max-age=31536000, immutable`). Non-version-IRI URIs revalidate per cycle.

## Source ADR

- [ADR-0006 — w3id.org/opda ontology namespace](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md) — namespace + per-resource resolution.
- [ADR-0013 — Overlay profile emission](../../../adr/ADR-0013-overlay-profile-emission.md) — BASPI5 + derived-profile URLs.
