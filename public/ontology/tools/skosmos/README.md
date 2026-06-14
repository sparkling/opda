# Skosmos — SKOS vocabulary browser

**Status in this bake-off: NOT STOOD UP (Docker/Fuseki too heavy for this run);
launch recipe + `make` proposal documented; static scheme list shipped as the
fallback ([`schemes.html`](./schemes.html)).**

Skosmos (NatLibFi) is the best-in-class SKOS browser, but it is a **live PHP
web application** that runs over a SPARQL endpoint — it is not a static
generator. Per ADR-0041 §Hosting (B2, resolved 2026-06-14: *localhost +
link-out*), runtime/server tools are **not** embedded in the static deploy.
They run from localhost via a `make` target alongside the existing build-time
Fuseki/GRLC stack (`make serve-data`), and the `/ontology` site **links out**
to the localhost instance.

This run documents the exact launch command and proposes the `make` target,
and ships a **static HTML list of the 47 SKOS concept schemes**
([`schemes.html`](./schemes.html)) as the always-available fallback so the
scheme inventory is visible even without the local stack running.

## What Skosmos needs

- A SPARQL 1.1 endpoint serving the SKOS data. OPDA already has one:
  **Fuseki on `http://localhost:3031/opda/sparql`** (dataset `/opda`), started
  by `make serve-data` and loaded by `make jena-load` (which loads
  `source/03-standards/ontology/opda-vocabularies.ttl` among the corpus).
- A Skosmos config (`config.ttl`) declaring each `skosmos:Vocabulary` and
  pointing it at the endpoint + the vocabulary's concept-scheme URI.

## Exact localhost launch (official Docker image)

With the OPDA Fuseki already up (`make serve-data`) and the vocabularies
loaded (`make jena-load`):

```bash
# 1. Bring up the OPDA triplestore (separate terminal) — loads opda-vocabularies.ttl
make serve-data        # Fuseki at :3031, dataset /opda

# 2. Run Skosmos against that endpoint.
#    --network=host lets the container reach Fuseki on the host's :3031.
#    Mount a config.ttl that declares the OPDA vocabularies and the sparqlEndpoint.
docker run --rm -it \
  --name opda-skosmos \
  --network=host \
  -e SKOSMOS_SPARQL_ENDPOINT=http://localhost:3031/opda/sparql \
  -v "$PWD/config/skosmos-config.ttl:/var/www/html/config.ttl:ro" \
  natlibfi/skosmos:latest
# → browse at http://localhost:9090/
```

(On Docker Desktop for macOS, `--network=host` is limited; substitute
`-p 9090:80` and set `SKOSMOS_SPARQL_ENDPOINT=http://host.docker.internal:3031/opda/sparql`.)

A minimal `config/skosmos-config.ttl` registers one Skosmos vocabulary per
scheme (or one umbrella vocabulary over the whole `/opda` graph), e.g.:

```turtle
@prefix skosmos: <http://purl.org/net/skosmos#> .
@prefix void:    <http://rdfs.org/ns/void#> .
@prefix dc:      <http://purl.org/dc/terms/> .

:opda a skosmos:Vocabulary, void:Dataset ;
    dc:title "OPDA PDTF Vocabularies"@en ;
    skosmos:sparqlEndpoint <http://localhost:3031/opda/sparql> ;
    skosmos:sparqlGraph <https://opda.org.uk/pdtf/graph/vocabularies> ;
    void:uriSpace "https://opda.org.uk/pdtf/" ;
    skosmos:language "en" .
```

## Proposed `make` target (ADR-0041 B2 localhost-link model)

Add alongside `serve-data` in the Makefile (wraps an npm script or runs Docker
directly):

```makefile
.PHONY: skosmos
skosmos: ## Run Skosmos (SKOS browser) over the local Fuseki — needs `make serve-data` first
	docker run --rm -it --name opda-skosmos \
	  -p 9090:80 \
	  -e SKOSMOS_SPARQL_ENDPOINT=http://host.docker.internal:3031/opda/sparql \
	  -v "$(PWD)/config/skosmos-config.ttl:/var/www/html/config.ttl:ro" \
	  natlibfi/skosmos:latest
	# browse at http://localhost:9090/  (resolves only while this + `make serve-data` run)
```

The `/ontology` webapp links to `http://localhost:9090/` with a note that the
link resolves only when the local stack is running — the same contract as the
existing `make serve-data` links.

## Why not stood up in this run

The Docker pull (`natlibfi/skosmos` is a multi-hundred-MB PHP+Apache image) +
authoring a complete per-scheme `config.ttl` + booting Fuseki and loading the
corpus is heavier than this bake-off run warrants, and the output is a live
server that cannot be captured into the static deploy anyway. The decision is
recorded, the recipe is exact, and the static fallback below carries the
inventory.

## Fallback: static scheme list

[`schemes.html`](./schemes.html) — all **47 named SKOS concept schemes** in
`opda-vocabularies.ttl` with prefLabel and in-scheme concept counts (308
concepts total; the full merged graph carries 48 schemes / 314 concepts once
the agent/governance module vocabularies are included). Generated from the
committed TTL; it is an inventory, not a browsable thesaurus — for
broader/narrower navigation, run Skosmos per above.

## Role in the M6 rubric

Skosmos is **the** SKOS layer: scheme tree, concept pages, broader/narrower
navigation, alt-labels, multilingual, search — **Full** for SKOS. It documents
**None** of OWL axioms, SHACL, profiles, exemplars, three-graph, governance, or
known-issues. Integration cost is the highest of any tool (live PHP server,
not static; localhost-link contract). Scored in `../COMPARISON.md`.
