# OPDA Knowledge Base — Makefile
#
# Task runner for the site, the build-time triplestore/API, the ontology
# generator, and the CI validation gates. Targets are thin wrappers over the
# npm scripts (package.json) and the opda-gen CLI (tools/opda-gen) so the same
# commands work locally and in CI. Run `make help` for the grouped list.

.DEFAULT_GOAL := help
SHELL         := /usr/bin/env bash

# Canonical ontology corpus (source of truth) + opda-gen working dir.
ONTOLOGY_DIR := source/03-standards/ontology
OPDA_GEN     := cd tools/opda-gen &&

# -----------------------------------------------------------------------------
.PHONY: help
help:	## Show this help
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next} \
		/^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' \
		$(MAKEFILE_LIST)
	@echo ""

##@ Site (Astro website)
.PHONY: install
install:	## Install npm deps
	npm install --no-fund --no-audit

.PHONY: dev
dev: node_modules	## Astro dev server (auto-picks port 4330–4339)
	npm run dev

.PHONY: build
build: node_modules	## Build the static site → dist/ (no triplestore)
	npm run build

.PHONY: build-data
build-data: node_modules	## Full build: Fuseki + GRLC API + astro → dist/ (mirrors CI deploy; needs JDK 17+)
	npm run build:data

.PHONY: preview
preview: build	## Build then serve dist/ via Astro preview
	npm run preview

.PHONY: css
css: node_modules	## Rebuild the Tailwind stylesheet
	npm run css

##@ Triplestore / API (Jena Fuseki — ADR-0021, build-time only)
.PHONY: serve-data
serve-data: node_modules	## Start Fuseki + GRLC API and keep them running (Ctrl-C to stop)
	npm run serve:data

.PHONY: jena-load
jena-load: node_modules	## Load the ontology TTLs into an already-running Fuseki (--clear)
	npm run jena:load

.PHONY: api
api: node_modules	## Run the GRLC SPARQL→REST API alone (needs Fuseki on :3031 — use `make serve-data`)
	npm run api

.PHONY: ontology-model
ontology-model: node_modules	## Extract src/data/ontology-model.json from a running Fuseki (ADR-0044 Phase 1; needs `make serve-data`)
	npm run ontology:model

.PHONY: skosmos
skosmos: ## Browse the SKOS vocabularies in Skosmos over the local Fuseki (needs `make serve-data`) → http://localhost:9090/
	@docker rm -f opda-skosmos >/dev/null 2>&1 || true
	@echo "Skosmos → http://localhost:9090/  (needs 'make serve-data' on :3031; Ctrl-C to stop)"
	docker run --rm --name opda-skosmos --platform linux/amd64 \
	  -p 9090:80 \
	  -v "$(CURDIR)/config/skosmos-config.ttl:/var/www/html/config.ttl:ro" \
	  quay.io/natlibfi/skosmos:latest

##@ Ontology (opda-gen — Python, runs in tools/opda-gen)
.PHONY: ontology-install
ontology-install:	## Install the opda-gen toolchain (editable + dev extras)
	$(OPDA_GEN) pip install -e .[dev]

.PHONY: ontology-test
ontology-test:	## Run the opda-gen unit suite (pytest)
	$(OPDA_GEN) pytest -q

##@ Validation / CI gates (run before pushing)
.PHONY: test
test: node_modules	## Remark plugin tests (mermaid fence / details unwrap)
	npm test

.PHONY: test-smoke
test-smoke: node_modules	## Playwright smoke test (mermaid + data tables); needs a running server + Playwright
	npm run test:smoke

.PHONY: verify-ontology
verify-ontology:	## Byte-identity: re-emit the ontology and diff it against the committed corpus
	$(OPDA_GEN) opda-gen emit --output /tmp/opda-ontology-verify
	diff -rq /tmp/opda-ontology-verify $(ONTOLOGY_DIR) --exclude=exemplars --exclude=derived
	@echo "✓ ontology corpus is byte-identical to the generator output"

.PHONY: ci-ontology
ci-ontology:	## All opda-gen CI gates (byte-identity, three-graph, dup, profile, baspi5, object-property-coverage, excluded-construct, description-coverage, isDefinedBy) — mirrors the GH workflows
	$(OPDA_GEN) pytest -q
	$(OPDA_GEN) opda-gen ci-three-graph      --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-dup-declaration  --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-profile-contract --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-baspi5-roundtrip --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-object-property-coverage --strict --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-excluded-construct --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-description-coverage --strict --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-isdefinedby --strict --ontology-dir ../../$(ONTOLOGY_DIR)
	$(MAKE) verify-ontology
	@echo "✓ all ontology CI gates passed"

.PHONY: ci-ontology-doc
ci-ontology-doc:	## Doc-drift gate (ADR-0041): the custom /ontology reference must match the committed corpus
	node scripts/ci-ontology-doc-drift.mjs

.PHONY: ci-ontology-model
ci-ontology-model:	## Model doc-drift gate (ADR-0044): regen ontology-model.json from live Fuseki & diff (needs `make serve-data`)
	node scripts/ci-ontology-model-drift.mjs

.PHONY: ci-ontology-graph
ci-ontology-graph:	## Graph-element drift gate (ADR-0043): re-derive ontology-graph-elements.json from the committed model & diff (no Fuseki)
	node scripts/ontology-graph.mjs --check

.PHONY: check-links
check-links:	## Link-validation sweep (ADR-0044 Phase 8): no dangling/orphan links on /ontology + /pdtf (needs `make build-data` first)
	node scripts/check-links.mjs

.PHONY: check-links-external
check-links-external:	## Live external-URL 200 sweep over /ontology + /pdtf (ADR-0044 Phase 8; report-only, opt-in, needs `make build-data` first)
	node scripts/check-external-links.mjs

.PHONY: ci
ci: test ci-ontology ci-ontology-doc ci-ontology-graph	## Everything CI runs that is checkable locally (JS + ontology gates + doc-drift)
	@echo "✓ all local CI gates passed"

##@ Deploy
.PHONY: deploy
deploy:	## Push main → GitHub Actions builds (Fuseki+API+astro) & deploys to Cloudflare Pages
	npm run deploy:ci

.PHONY: deploy-manual
deploy-manual:	## Build + wrangler deploy directly (bypasses CI — avoid; CI-on-push is canonical)
	npm run deploy

##@ Data / housekeeping
.PHONY: data
data:	## Regenerate the JSON resource bundles → public/data/resources/
	python3 scripts/build-json-bundles.py

.PHONY: clean
clean:	## Remove build artefacts (dist/, .astro/)
	npm run clean

.PHONY: distclean
distclean: clean	## clean + remove node_modules
	rm -rf node_modules

# node_modules sentinel — triggers `make install` when missing
node_modules:
	$(MAKE) install
