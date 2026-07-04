# RML mapping harness: PDTF JSON -> OPDA RDF, validated + completeness-checked.
#
# Paths are relative to this directory (source/03-standards/rml/); the repo root is ../../..
ROOT      := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))../../..)
PY        := $(ROOT)/tools/opda-gen/.venv/bin/python
HARNESS   := $(ROOT)/source/03-standards/rml/harness
BUILD     := $(ROOT)/source/03-standards/rml/build
TESTDATA  := $(ROOT)/source/03-standards/rml/testdata

MAPPING   := $(ROOT)/source/03-standards/rml/mapping/opda-pdtf.rml.ttl
INDEX     := $(ROOT)/source/03-standards/rml/provenance-index.json
BASPI5    := $(ROOT)/source/03-standards/ontology/profiles/baspi5.ttl

# Conformant soundness/completeness corpus (each: map -> CONFORMS -> 0 dropped).
INSTANCES := 01-conformant-full 02-minimal 03-multi-participant
NEGATIVE  := 04-negative-invalid

# Back-compat single-instance convenience (01).
INSTANCE  := $(TESTDATA)/01-conformant-full.json
OUT       := $(BUILD)/out.nt

.PHONY: rml-test rml-map rml-shacl rml-complete rml-negative rml-acyclicity-test rml-pytest \
        rml-clean help provenance-test dct-audit

help:
	@echo "--- primary gate: RML as declarative provenance (no instance data) ---"
	@echo "provenance-test  RML<->OWL consistency + resource<->schema-location tracing (Jena arq, no morph-kgc)"
	@echo "dct-audit        audit every ontology dct:source citation against the canonical schema dictionary"
	@echo ""
	@echo "--- secondary: instance-materialisation harness (kept for the RML file's own executability) ---"
	@echo "rml-test     full pipeline over all conformant instances (01/02/03) + negative (04)"
	@echo "rml-map      materialise $(INSTANCE) -> $(OUT)"
	@echo "rml-shacl    validate $(OUT) against opda-shapes-merged.ttl"
	@echo "rml-complete layer-1 completeness gate over $(OUT)"
	@echo "rml-negative materialise 04 and require a SHACL violation (merged + BASPI5)"
	@echo "rml-acyclicity-test  ODR-0024 R11 hand-authored RiskAssessment cycle must violate, valid chain must conform"
	@echo "rml-pytest   run tests/test_rml_mapping.py"
	@echo "rml-clean    remove build artefacts"

# Primary gate. No instance data, no morph-kgc, no SHACL-on-materialised-data —
# validates the RML mapping AS PROVENANCE: every rr:class/rr:predicate is a
# real ontology term (Jena arq against opda-merged.ttl), and every reference
# resolves to a real JSON Schema location (canonical data dictionary). See
# harness/validate_provenance.py module docstring.
provenance-test:
	$(PY) $(HARNESS)/validate_provenance.py

# Audits the ONTOLOGY's own dct:source citations against the canonical
# dictionary directly (distinct from provenance-test, which checks the RML
# mapping's references). See harness/audit_dct_source.py module docstring.
dct-audit:
	$(PY) $(HARNESS)/audit_dct_source.py

rml-map:
	$(PY) $(HARNESS)/run_mapping.py --mapping $(MAPPING) --data $(INSTANCE) --out $(OUT)

rml-shacl:
	bash $(HARNESS)/validate_shacl.sh $(OUT)

rml-complete:
	$(PY) $(HARNESS)/check_completeness.py --instance $(INSTANCE) --index $(INDEX) --triples $(OUT) --out-dir $(BUILD)

# Soundness + completeness for every conformant instance.
rml-conformant:
	@for name in $(INSTANCES); do \
	  echo "=== $$name ==="; \
	  $(PY) $(HARNESS)/run_mapping.py --mapping $(MAPPING) --data $(TESTDATA)/$$name.json --out $(BUILD)/$$name.nt || exit 1; \
	  bash $(HARNESS)/validate_shacl.sh $(BUILD)/$$name.nt || exit 1; \
	  $(PY) $(HARNESS)/check_completeness.py --instance $(TESTDATA)/$$name.json --index $(INDEX) --triples $(BUILD)/$$name.nt --out-dir $(BUILD) || exit 1; \
	done

# Negative: 04 must FAIL SHACL against merged + BASPI5 profile (violation => exit 1).
rml-negative:
	$(PY) $(HARNESS)/run_mapping.py --mapping $(MAPPING) --data $(TESTDATA)/$(NEGATIVE).json --out $(BUILD)/$(NEGATIVE).nt
	@if bash $(HARNESS)/validate_shacl.sh $(BUILD)/$(NEGATIVE).nt $(BASPI5); then \
	  echo "rml-negative: FAIL — 04 conformed but must produce a violation" >&2; exit 1; \
	else \
	  echo "rml-negative: PASS — 04 produced the expected SHACL violation"; \
	fi

# ODR-0024 R11 acyclicity guard regression test. Hand-authored RDF (not
# RML-mapped — no PDTF JSON leaf drives opda:hasSubAssessment cycles), so this
# validates directly against opda-shapes-merged.ttl rather than going through
# run_mapping.py. A genuine 2-cycle (riskA <-> riskB) MUST violate via
# opda:shape:RiskAssessmentAcyclicityConstraint (the SPARQL property-path
# shape — plain sh:node recursion cannot detect a cycle); a non-cyclic chain
# MUST conform (no false positive on legitimate nesting).
rml-acyclicity-test:
	@if bash $(HARNESS)/validate_shacl.sh $(TESTDATA)/shacl-fixtures/risk-acyclicity-cyclic.ttl; then \
	  echo "rml-acyclicity-test: FAIL — cyclic RiskAssessment conformed but must violate" >&2; exit 1; \
	else \
	  echo "rml-acyclicity-test: PASS — cyclic RiskAssessment produced the expected acyclicity violation"; \
	fi
	@if bash $(HARNESS)/validate_shacl.sh $(TESTDATA)/shacl-fixtures/risk-acyclicity-valid.ttl; then \
	  echo "rml-acyclicity-test: PASS — acyclic RiskAssessment chain conforms"; \
	else \
	  echo "rml-acyclicity-test: FAIL — acyclic RiskAssessment chain must not violate" >&2; exit 1; \
	fi

rml-test: rml-conformant rml-negative rml-acyclicity-test
	@echo "rml-test: PASS (01/02/03 sound + layer-1 complete; 04 violates; acyclicity guard regression-tested)"

rml-pytest:
	cd $(ROOT) && $(PY) -m pytest source/03-standards/rml/tests/test_rml_mapping.py -v

rml-clean:
	rm -rf $(BUILD)/*.nt $(BUILD)/*.json
