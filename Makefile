# OPDA Knowledge Base — Makefile
#
# Common tasks. Run `make help` for the full list.

.DEFAULT_GOAL := help
SHELL         := /usr/bin/env bash

# -----------------------------------------------------------------------------
# Help
# -----------------------------------------------------------------------------
.PHONY: help
help:	## Show this help
	@echo ""
	@echo "OPDA Knowledge Base — make targets"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) \
	  | sort \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo ""

# -----------------------------------------------------------------------------
# Dev / build / preview
# -----------------------------------------------------------------------------
.PHONY: install
install:	## Install npm deps
	npm install --no-fund --no-audit

.PHONY: dev
dev: node_modules	## Run Astro dev (auto-picks port in 4330–4339)
	npm run dev

.PHONY: build
build: node_modules	## Build the static site → dist/
	npm run build

.PHONY: preview
preview: build	## Build then serve dist/ via Astro preview
	npm run preview

.PHONY: serve
serve:	## Serve docs/ over Python http.server on :8000 (no build needed)
	./serve.sh

# -----------------------------------------------------------------------------
# Data builders
# -----------------------------------------------------------------------------
.PHONY: data
data:	## Regenerate JSON resource bundles for docs/data/resources/
	python3 scripts/build-json-bundles.py

# -----------------------------------------------------------------------------
# Deploy
# -----------------------------------------------------------------------------
.PHONY: deploy
deploy: build	## Push to GitHub + deploy dist/ to Cloudflare Pages (needs gh + wrangler)
	./deploy.sh

# -----------------------------------------------------------------------------
# Housekeeping
# -----------------------------------------------------------------------------
.PHONY: clean
clean:	## Remove build artefacts
	rm -rf dist .astro

.PHONY: distclean
distclean: clean	## Remove build artefacts + node_modules
	rm -rf node_modules package-lock.json

# node_modules sentinel — triggers `make install` when missing
node_modules:
	$(MAKE) install
