# OPDA Physical-Database Tier

This is the **Physical-Database tier** view of OPDA's ontology — written for triplestore operators, SPARQL endpoint consumers, downstream ontology integrators, devops engineers running the deployment, and JSON-LD client developers. It describes the **deployed/served form** of the ontology: which named graphs hold which TTLs, what load order produces a coherent graph, how derived consumer profiles compose, and how HTTP requests to `https://w3id.org/opda/<resource>` resolve to TTL / JSON-LD / RDF/XML representations.

If you have ever asked questions like:

- "Which named graph do I load to validate a BASPI5 submission?"
- "What's the difference between `opda-validation.ttl` and `opda-ui.ttl`?"
- "How does the build-step composer assemble the derived consumer profiles?"
- "What does `Accept: text/turtle` against `https://w3id.org/opda/Property` return?"
- "Which CI gate blocks a commit that introduces drift in expected SHACL reports?"

then this tier is for you. It is operational, not deliberative — the Physical-Ontology tier owns the source TTLs; this tier owns the deployment.

## Reading order

1. Start with **[index.md](./index.md)** — deployment topology + named-graph catalogue at a glance.
2. Read **[named-graphs.md](./named-graphs.md)** — per-named-graph layout, load order, triple counts, version IRIs.
3. Read **[derived-profiles/README.md](./derived-profiles/README.md)** — three consumer profiles (`opda-validation`, `opda-ui`, `opda-inference`) the build-step composer assembles from per-module TTLs.
4. Read **[content-negotiation/README.md](./content-negotiation/README.md)** — Accept-header routing to TTL / JSON-LD / RDF/XML / HTML per resource.
5. Read **[overlay-deployment/README.md](./overlay-deployment/README.md)** — overlay profile deployment, starting with BASPI5 (the MVP gate).
6. Read **[operations/byte-identity-ci.md](./operations/byte-identity-ci.md)**, **[operations/three-graph-ci.md](./operations/three-graph-ci.md)**, **[operations/round-trip-ci.md](./operations/round-trip-ci.md)** — the three CI gates the deployment depends on.

For "what's deployed for this module" queries, the **[modules/](./modules/)** subdirectory carries a per-module deployment view (foundation + 6 business modules). Use it when you have a module name in hand and want to chase its source TTLs, named graphs, derived-profile membership, overlay bindings, and content-negotiation entry points in one place.

## What is *not* in this tier

- **Business narrative — Identity Criterion, Hard Cases** — see [Concept tier](../concept/).
- **Typed attributes, cardinalities, ER diagrams** — see [Logical tier](../logical/).
- **OWL / SHACL / SKOS Turtle source-tree layout, per-class blocks** — see [Physical-Ontology tier](../physical-ontology/).
- **PDTF JSON Schemas** at `source/03-standards/schemas/` — those were upstream Council programme input, NOT deployment output. They are documented in the nested schemas repo and are deliberately out of scope for the four-tier documentation here.

## Provenance

This documentation is generated from:

- The 24 emitted TTL files at `source/03-standards/ontology/` (`foundation.ttl`, `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`, `opda-vocabularies.ttl`, six `opda-<module>.ttl`, six `opda-<module>-shapes.ttl`, six `opda-<module>-annotations.ttl`)
- The BASPI5 overlay profile at `source/03-standards/ontology/profiles/baspi5.ttl`
- The build-step composer stub at `tools/opda-gen/src/opda_gen/composer.py` (activation pending per [ADR-0013](../../adr/ADR-0013-overlay-profile-emission.md))
- The two CI workflows at `.github/workflows/ontology-byte-identity.yml` and `.github/workflows/baspi5-round-trip.yml`
- The round-trip MVP harness at `tests/baspi5_round_trip/`

The `source/03-standards/ontology/derived/` directory does **not yet exist** in the repository. This tier documents the three derived profiles per [ADR-0013 §"Module pluralism"](../../adr/ADR-0013-overlay-profile-emission.md) as their specification — each profile file is marked "spec only; composer activation pending" until the composer body lands.
