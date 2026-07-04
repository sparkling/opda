#!/usr/bin/env bash
# Validate an RDF data file against the merged OPDA SHACL shapes (Jena CLI),
# plus any extra shapes graphs (e.g. a BASPI5 profile whose shapes are not in
# opda-shapes-merged.ttl).
#
# Usage: validate_shacl.sh <data.ttl|data.nt> [extra_shapes.ttl ...]
#
# The base merged shapes and every extra shapes file are concatenated into one
# temp graph (Jena `shacl validate` takes a single --shapes file).
#
# Exit 0 + print "CONFORMS" when the report has no sh:Violation results.
# Exit 1 + print the full report when any sh:resultSeverity sh:Violation is present.
set -euo pipefail

DATA="${1:-}"
if [[ -z "$DATA" ]]; then
  echo "usage: $(basename "$0") <data-file> [extra_shapes.ttl ...]" >&2
  exit 2
fi
if [[ ! -f "$DATA" ]]; then
  echo "error: data file not found: $DATA" >&2
  exit 2
fi
shift
EXTRA_SHAPES=("$@")

# Resolve repo root from this script's location (harness/ -> rml-mapping -> tools -> root).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

SHACL="$REPO_ROOT/.jena/apache-jena-6.1.0/bin/shacl"
SHAPES="$REPO_ROOT/public/ontology/artefacts/opda-shapes-merged.ttl"

# Jena's shacl launcher resolves java via `which java` unless JAVA_HOME is set
# (see .jena/apache-jena-6.1.0/bin/shacl). In a stripped/sandboxed environment
# (e.g. MetaHarness Darwin Mode's variant sandbox) PATH may not include the
# mise/asdf/nvm shim dir that fronts java, which would make every invocation
# fail identically regardless of the variant under test — a false, uninformative
# signal. Discover JAVA_HOME once, deterministically, if not already set.
if [[ -z "${JAVA_HOME:-}" ]]; then
  for candidate in \
    /Users/henrik/.local/share/mise/installs/java/temurin-23.0.2+7 \
    /Library/Java/JavaVirtualMachines/*/Contents/Home \
    /usr/lib/jvm/*; do
    if [[ -x "$candidate/bin/java" ]]; then
      export JAVA_HOME="$candidate"
      break
    fi
  done
fi

for f in "$SHACL" "$SHAPES" "${EXTRA_SHAPES[@]}"; do
  if [[ ! -e "$f" ]]; then
    echo "error: required file missing: $f" >&2
    exit 2
  fi
done

# Build the effective shapes graph. With no extras this is just the merged file;
# with extras, concatenate them (duplicate @prefix directives are legal Turtle).
if [[ ${#EXTRA_SHAPES[@]} -eq 0 ]]; then
  SHAPES_GRAPH="$SHAPES"
  CLEANUP=""
else
  # Temp dir with a .ttl-suffixed file so Jena detects Turtle by extension.
  TMPDIR_SHAPES="$(mktemp -d -t opda-shapes.XXXXXX)"
  SHAPES_GRAPH="$TMPDIR_SHAPES/shapes.ttl"
  CLEANUP="$TMPDIR_SHAPES"
  # Drop owl:imports: we supply the full shapes graph here, so Jena must not
  # follow imports (e.g. <https://opda.org.uk/pdtf/>) to the live network.
  cat "$SHAPES" "${EXTRA_SHAPES[@]}" | grep -v 'owl:imports' >"$SHAPES_GRAPH" || true
fi
trap '[[ -n "$CLEANUP" ]] && rm -rf $CLEANUP' EXIT

# Closed-world domain/range SHACL constraints (ODR-0029 R3, sh:class checks
# via sh:targetSubjectsOf/targetObjectsOf) need the referenced individual's
# rdf:type to be PRESENT in the validated graph to resolve — e.g. a correctly
# bound SKOS concept object (opda:scheme/sellersCapacity/Legal-Owner) is only
# confirmed `a skos:Concept` in the ontology itself, never restated by the RML
# mapping's own instance data. Without the ontology loaded alongside the
# instance graph, every genuinely-correct SKOS-concept-object binding fails
# this check with a false "range violation" — not a mapping defect, a missing
# validation-context gap. Load the ontology (opda-merged.ttl) as additional
# --data context so these individuals' types are actually present to check
# against.
ONTOLOGY="$REPO_ROOT/public/ontology/artefacts/opda-merged.ttl"
TMPDIR_DATA="$(mktemp -d -t opda-shacl-data.XXXXXX)"
DATA_GRAPH="$TMPDIR_DATA/data.ttl"
cat "$ONTOLOGY" "$DATA" >"$DATA_GRAPH"
if [[ -n "$CLEANUP" ]]; then
  CLEANUP="$CLEANUP $TMPDIR_DATA"
else
  CLEANUP="$TMPDIR_DATA"
fi

REPORT="$("$SHACL" validate --shapes "$SHAPES_GRAPH" --data "$DATA_GRAPH")"

# Explicit, named allowlist of KNOWN, BY-DESIGN or OUT-OF-SCOPE violations —
# not a general exception mechanism. Any NEW, unexpected violation (any
# resultMessage not matching one of these exact strings) still fails loudly.
#
# Group 1 — M1b/M12/M27c's deliberately-UNTYPED declaration/signature/
# occupier/ownership-record records (opda-pdtf.rml.ttl): typing them
# opda:Transaction/opda:Seller would assert a false second identity (no
# transactionId/capacity is reachable from their JSON context) — a real,
# correct modelling choice that predates ODR-0029 R3's closed-world domain
# check and is not something to "fix" by fabricating a type assertion (see
# M1b's and M27c's own comments in the mapping file).
# Group 2 — opda:targetsKind (opda:AddressVariant*Refinement etc.): these
# individuals are STATIC content baked into the ontology itself
# (opda-merged.ttl, loaded above as SHACL validation context), not emitted
# by this RML mapping at all (verified: zero references to targetsKind or
# DPVMappingRecord anywhere in opda-pdtf.rml.ttl) — a pure ontology-authoring
# matter (DPVMappingRefinement vs. targetsKind's declared domain
# DPVMappingRecord), unrelated to and unfixable from the RML mapping side.
ALLOWLISTED_VIOLATION_SUBSTRINGS=(
  "opda:aged17OrOverNames is used off its declared rdfs:domain"
  "opda:confirmInformationIsAccurate is used off its declared rdfs:domain"
  "opda:confirmWillProvideAdditionalDocumentation is used off its declared rdfs:domain"
  "opda:consumerProtectionRegulationsResponse is used off its declared rdfs:domain"
  "opda:leaveKeys is used off its declared rdfs:domain"
  "opda:removeRubbish is used off its declared rdfs:domain"
  "opda:replaceLightFittings is used off its declared rdfs:domain"
  "opda:signedOn is used off its declared rdfs:domain"
  "opda:takeReasonableCare is used off its declared rdfs:domain"
  "opda:authorisationToShare is used off its declared rdfs:domain"
  "opda:authorisedToActOnBehalfOfAllSellers is used off its declared rdfs:domain"
  "opda:confirmation is used off its declared rdfs:domain"
  "opda:costsApplicableToTheDeed is used off its declared rdfs:domain"
  "opda:feeIncludingVAT is used off its declared rdfs:domain"
  "opda:targetsKind is used off its declared rdfs:domain"
)

# NB: the filter script is written to a real temp file, not a heredoc, because
# a heredoc (<<) and a herestring (<<<) both targeting the same command's
# stdin conflict — the herestring silently wins, so python would receive the
# SHACL report text AS ITS OWN SOURCE CODE (crashing) instead of the filter
# script, and (with the crash's empty stdout swallowed by `set -e`'s known
# inconsistency around command-substitution assignments) FILTERED_REPORT
# would end up empty, making the whole check falsely report CONFORMS
# regardless of real violations. Caught via rml-negative (04 must violate)
# during this session's testing.
FILTER_SCRIPT="$TMPDIR_DATA/filter_allowlist.py"
cat >"$FILTER_SCRIPT" <<'PYEOF'
import os, sys
report = sys.stdin.read()
allowlist = os.environ["ALLOWLIST"].splitlines()
# blocks are separated by the literal "sh:result    [" marker used by Jena's
# pretty-printer; keep the preamble (everything before the first block).
parts = report.split("sh:result    [")
kept = [parts[0]]
for block in parts[1:]:
    if any(a in block for a in allowlist):
        continue
    kept.append("sh:result    [" + block)
sys.stdout.write("".join(kept))
PYEOF

ALLOWLIST_NEWLINE="$(printf '%s\n' "${ALLOWLISTED_VIOLATION_SUBSTRINGS[@]}")"
FILTERED_REPORT="$(ALLOWLIST="$ALLOWLIST_NEWLINE" python3 "$FILTER_SCRIPT" <<<"$REPORT")"

if grep -q "sh:Violation" <<<"$FILTERED_REPORT"; then
  echo "$FILTERED_REPORT"
  echo "---" >&2
  echo "SHACL VIOLATIONS present in $DATA" >&2
  exit 1
fi

echo "CONFORMS"
exit 0
