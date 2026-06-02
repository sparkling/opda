---
kind: operations
tier: physical-database
title: Shared JSON-LD `@context`
---

# Shared JSON-LD `@context`

OPDA serves a **single canonical JSON-LD `@context`** across every `Accept: application/ld+json` response, independent of which resource is requested. The context is published at `https://opda.org.uk/pdtf/context.jsonld` and embedded inline in every JSON-LD response.

## Why one context

Per [ADR-0013](../../../adr/ADR-0013-overlay-profile-emission.md), JSON-LD consumers need stable predicate names that work the same way regardless of which graph the data came from. If the foundation namespace served one context and the BASPI5 overlay served another, a consumer aggregating both would have to reconcile naming differences. The canonical-context discipline pushes that complexity to build time: every JSON-LD payload speaks the same vocabulary.

## Context specification

The canonical `@context` carries three sets of mappings.

### 1. Default vocabulary

```json
"@vocab": "https://opda.org.uk/pdtf/"
```

Unqualified terms (e.g. `"Property"`, `"hasSpecialCategoryData"`) resolve to OPDA's flat term namespace without explicit prefix. Per [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md), the slash-based scheme means `opda:Property` serialises as `https://opda.org.uk/pdtf/Property` — the `@vocab` setting honours this.

### 2. Standard ontology prefixes

| Prefix | URI |
|---|---|
| `dct` | `http://purl.org/dc/terms/` |
| `dpv` | `https://w3id.org/dpv/` |
| `owl` | `http://www.w3.org/2002/07/owl#` |
| `rdf` | `http://www.w3.org/1999/02/22-rdf-syntax-ns#` |
| `rdfs` | `http://www.w3.org/2000/01/rdf-schema#` |
| `skos` | `http://www.w3.org/2004/02/skos/core#` |
| `sh` | `http://www.w3.org/ns/shacl#` |
| `dash` | `http://datashapes.org/dash#` |
| `xsd` | `http://www.w3.org/2001/XMLSchema#` |
| `vann` | `http://purl.org/vocab/vann/` |
| `prov` | `http://www.w3.org/ns/prov#` |

These match the `@prefix` declarations across the 24 source TTLs at `source/03-standards/ontology/`, so a JSON-LD consumer round-trips to the same IRIs the TTL serialiser produces.

### 3. OPDA predicate type-coercions

Type-coercions let JSON consumers omit explicit `@type` on every literal. The OPDA-specific subset:

| Predicate | Type coercion |
|---|---|
| `opda:hasSpecialCategoryData` | `xsd:boolean` |
| `opda:formVersion` | `xsd:string` |
| `opda:profileURI` | `@id` (treat value as IRI, not literal) |
| `opda:overlaysContext` | `@id` |
| `opda:sourcedFrom` | `@id` |
| `opda:requires` | `@id` (in `@container: @set`) |
| `dct:issued` | `xsd:date` |
| `dct:modified` | `xsd:date` |
| `dct:source` | `@id` |
| `dct:references` | `@id` |
| `owl:versionIRI` | `@id` |
| `owl:imports` | `@id` (in `@container: @set`) |

## Worked example

A consumer requesting `https://opda.org.uk/pdtf/shape/profiles/baspi5` with `Accept: application/ld+json` receives:

```json
{
  "@context": "https://opda.org.uk/pdtf/context.jsonld",
  "@id": "https://opda.org.uk/pdtf/shape/profiles/baspi5",
  "@type": "owl:Ontology",
  "dct:title": { "@value": "BASPI5 overlay profile", "@language": "en" },
  "dct:source": "https://opda.org.uk/pdtf/harness/adr/ADR-0013-overlay-profile-emission",
  "owl:imports": [
    "https://opda.org.uk/pdtf/"
  ],
  "owl:versionIRI": "https://opda.org.uk/pdtf/harness/release/profiles/baspi5/0.1.0/"
}
```

Note that `owl:imports` is a single JSON array (driven by `@container: @set` in the context) and IRI values stay bare strings (driven by `@id` coercion); a consumer round-trips this to the BASPI5 profile graph without needing per-predicate handling code. The profile imports the one collapsed ontology at `https://opda.org.uk/pdtf/` (modules + SKOS schemes fold into it; ADR-0006), and its `owl:versionIRI` points at a harness release snapshot.

## Versioning

The `@context` itself is versioned. A breaking change (e.g. adding a new type-coercion that changes how an existing predicate serialises) bumps the context URL to `https://opda.org.uk/pdtf/context-2.jsonld` and the old URL continues to serve the prior version. Consumers pin to a context URL; the deployment never silently mutates a published context.

## Source ADR

- [ADR-0006 — w3id.org/opda ontology namespace](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md) — slash-based namespace the `@vocab` honours.
- [ADR-0013 — Overlay profile emission](../../../adr/ADR-0013-overlay-profile-emission.md) — derived-profile composition that feeds JSON-LD serialisation.
