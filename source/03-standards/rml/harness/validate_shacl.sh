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

if grep -q "sh:Violation" <<<"$REPORT"; then
  echo "$REPORT"
  echo "---" >&2
  echo "SHACL VIOLATIONS present in $DATA" >&2
  exit 1
fi

echo "CONFORMS"
exit 0
