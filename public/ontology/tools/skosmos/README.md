# Skosmos — SKOS vocabulary browser

**Status: STOOD UP (2026-06-14). `make skosmos` runs Skosmos 3.x
(`quay.io/natlibfi/skosmos`) over the local Fuseki — browse at
<http://localhost:9090/>. The static scheme list ([`schemes.html`](./schemes.html))
remains the always-available fallback for the deployed site.**

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

## Exact localhost launch

The official image moved to **`quay.io/natlibfi/skosmos`** (the Docker Hub
`natlibfi/skosmos` repo is retired). It is **amd64-only**, so on Apple silicon
it runs under emulation (`--platform linux/amd64`) — fine for a localhost
browse tool. `make skosmos` wraps the whole thing; the raw command is:

```bash
# 1. Bring up the OPDA triplestore (separate terminal) — loads the SKOS corpus
make serve-data        # Fuseki at :3031, dataset /opda

# 2. Run Skosmos against it (config.ttl hardcodes host.docker.internal:3031)
docker run --rm --name opda-skosmos --platform linux/amd64 \
  -p 9090:80 \
  -v "$PWD/config/skosmos-config.ttl:/var/www/html/config.ttl:ro" \
  quay.io/natlibfi/skosmos:latest
# → browse at http://localhost:9090/
```

`-p 9090:80` plus the config's `host.docker.internal:3031` endpoint reaches the
host Fuseki on Docker Desktop / Rancher Desktop — no `--network=host` needed.

The committed `config/skosmos-config.ttl` declares **one umbrella vocabulary**
over the whole `/opda` graph (all 48 schemes; union-default-graph per ADR-0035,
so no `skosmos:sparqlGraph` restriction). Two Skosmos-3.x schema points it must
satisfy — both are **fatal** if wrong, which is why the first attempt 500'd:

- `skosmos:languages` is a list of **resources**:
  `( [ rdfs:label "en" ; rdf:value "en-GB" ] )` — **not** plain `( "en" )`
  literals (those throw `Call to undefined method EasyRdf\Literal::getLiteral()`
  in `GlobalConfig::getLanguages`).
- the per-vocabulary endpoint key is **`void:sparqlEndpoint`** (the global one,
  on `:config`, is `skosmos:sparqlEndpoint`).

## The `make skosmos` target (ADR-0041 B2 localhost-link model)

Shipped in the Makefile alongside `serve-data`:

```makefile
.PHONY: skosmos
skosmos: ## Browse the SKOS vocabularies in Skosmos over the local Fuseki (needs `make serve-data`) → http://localhost:9090/
	@docker rm -f opda-skosmos >/dev/null 2>&1 || true
	@echo "Skosmos → http://localhost:9090/  (needs 'make serve-data' on :3031; Ctrl-C to stop)"
	docker run --rm --name opda-skosmos --platform linux/amd64 \
	  -p 9090:80 \
	  -v "$(CURDIR)/config/skosmos-config.ttl:/var/www/html/config.ttl:ro" \
	  quay.io/natlibfi/skosmos:latest
```

The `/ontology/vocabularies` page links to `http://localhost:9090/` with a note
that it resolves only when the local stack is running — the same contract as the
existing `make serve-data` links.

## How it was stood up (2026-06-14)

Pulled `quay.io/natlibfi/skosmos:latest` (amd64, emulated on arm64), mounted the
committed `config/skosmos-config.ttl`, and verified end-to-end against the live
Fuseki: the REST API (`/rest/v1/search?query=energy*&vocab=opda`) returns real
corpus concepts (e.g. `…/pdtf/scheme/peril/Energy`) and the HTML concept pages
render. The only fix needed was aligning `config.ttl` to the Skosmos-3.x schema
(the two points above). The live server still cannot be captured into the static
deploy (B2), so the static `schemes.html` remains the deployed fallback and
`make skosmos` is the localhost browser.

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
