"""
Module three_graph_test.

Realises:
- ODR-0004 §3a — five-part CI test for three-graph separation. Build pipeline
  fails on any of the five MUST checks.
- ODR-0004 §3a clause #5 — derived-profile provenance via git-blame
  (`check_derived_provenance`); resolves ADR-0008 validation report
  follow-up G3 (see ADR-0005 §G G3).
- ADR-0007 §"Three-graph emission constraints" — generator MUST enforce the
  three-graph separation at emission time; this module is the CI gate that
  validates emitted outputs.
- ADR-0008 §"CI workflow" — invoked by `opda-gen ci-three-graph`.
- ADR-0009 — first ADR to commit a real corpus; activates the byte-identity
  diff step + ci-three-graph step in the workflow.

Each check is one function returning a list of violation strings. Empty list
== PASS. The implementing functions document the exact ODR-0004 §3a clause
they enforce in the docstring.

The full corpus check (`run_all`) executes all five checks across a directory
containing `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`,
and (per check #5) optionally `derived/` artefacts whose git history is
inspected for non-service-account commits.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import OWL


SH = Namespace("http://www.w3.org/ns/shacl#")
OPDA = Namespace("https://opda.org.uk/pdtf/")


# ---------------------------------------------------------------------------
# Check 1: no sh:* triples in the annotation graph (ODR-0004 §3a #1).
# ---------------------------------------------------------------------------
def check_no_shacl_in_annotations(annotation_graph: Graph) -> list[str]:
    """Enforce ODR-0004 §3a clause #1:

      ASK { GRAPH opda:annotations { ?s ?p ?o .
        FILTER(STRSTARTS(STR(?p), "http://www.w3.org/ns/shacl#")) } }
      MUST return false.

    Returns a list of (predicate-IRI) violation strings (empty == PASS).
    """
    violations: list[str] = []
    for _s, p, _o in annotation_graph:
        if isinstance(p, URIRef) and str(p).startswith(str(SH)):
            violations.append(f"annotation graph contains sh:* predicate {p}")
    return violations


# ---------------------------------------------------------------------------
# Check 2: no owl:imports from shapes (ODR-0004 §3a #2).
# ---------------------------------------------------------------------------
def check_no_owl_imports_in_shapes(shapes_graph: Graph) -> list[str]:
    """Enforce ODR-0004 §3a clause #2:

      ASK { GRAPH opda:shapes { ?s owl:imports ?g } }
      MUST return false.

    Returns a list of violation strings (empty == PASS).
    """
    violations: list[str] = []
    for s, _p, o in shapes_graph.triples((None, OWL.imports, None)):
        violations.append(f"shapes graph imports {o} from {s}")
    return violations


# ---------------------------------------------------------------------------
# Check 3: no advisory annotations in shapes (ODR-0004 §3a #3).
# ---------------------------------------------------------------------------
ADVISORY_PREDICATE_WHITELIST: list[URIRef] = [
    OPDA.aiHint,
    OPDA.uiHint,
    OPDA.exampleValue,
]


def check_no_advisory_in_shapes(shapes_graph: Graph) -> list[str]:
    """Enforce ODR-0004 §3a clause #3:

      ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }
      (and equivalent for every advisory-predicate in the whitelist)
      MUST return false.

    Returns a list of violation strings (empty == PASS).
    """
    violations: list[str] = []
    for predicate in ADVISORY_PREDICATE_WHITELIST:
        for s, _p, o in shapes_graph.triples((None, predicate, None)):
            violations.append(
                f"shapes graph contains advisory predicate {predicate} on {s} = {o}"
            )
    return violations


# ---------------------------------------------------------------------------
# Check 4: every sh:targetClass resolves (ODR-0004 §3a #4).
# ---------------------------------------------------------------------------
def check_target_class_resolves(
    shapes_graph: Graph, class_graph: Graph
) -> list[str]:
    """Enforce ODR-0004 §3a clause #4:

      SELECT ?c WHERE { ?s sh:targetClass ?c .
        FILTER NOT EXISTS { GRAPH opda:classes { ?c a owl:Class } } }
      MUST return empty.

    OPDA-namespaced target classes (`opda:*`) MUST resolve to an
    `owl:Class` declaration in the class graph. External W3C / DPV /
    PROV-O / etc. target classes are exempt — meta-shapes legitimately
    target standard classes like `sh:NodeShape`, `owl:Class`,
    `skos:Concept` (ADR-0012 foundation meta-shapes; ODR-0017 SHACL-AF
    deprecation rule targeting `skos:Concept`).

    Returns a list of unresolved-target violations (empty == PASS).
    """
    from rdflib.namespace import RDF

    target_classes = {
        o for _s, _p, o in shapes_graph.triples((None, SH.targetClass, None))
    }
    violations: list[str] = []
    opda_ns = str(OPDA)
    for cls in target_classes:
        # External target classes (W3C / DPV / SHACL meta-targets) are
        # exempt — they exist in their own vocabularies and can't appear
        # in the OPDA class graph.
        if not str(cls).startswith(opda_ns):
            continue
        if (cls, RDF.type, OWL.Class) not in class_graph:
            violations.append(
                f"sh:targetClass {cls} does not resolve to an owl:Class "
                "in the class graph"
            )
    return violations


# ---------------------------------------------------------------------------
# Check 5: derived consumer profiles have no commits outside the service
# account (ODR-0004 §3a #5).
# ---------------------------------------------------------------------------
def _service_account_allowlist() -> list[str]:
    """Return the configured service-account email allowlist.

    Order of resolution:
    1. ``OPDA_DERIVED_SERVICE_ACCOUNTS`` env var (comma-separated emails).
    2. Hardcoded empty list (TODO: replace with a config-file plug-in
       extension point once a service account is provisioned for the
       OPDA build pipeline — tracked as a future-ADR follow-up).

    Returning an empty list means **any** author is treated as
    non-service-account. ADR-0009 leaves this as the safe-by-default
    posture: if no derived artefacts have been emitted yet, no false
    positives are possible; once derived emission lands (ADR-0013 build
    step), the env var or config file is populated.
    """
    raw = os.environ.get("OPDA_DERIVED_SERVICE_ACCOUNTS", "").strip()
    if not raw:
        # TODO: when ADR-0013 lands the build-step composition, add a
        # config-file plug-in extension point so the allowlist isn't
        # only an env var. Tracked in the ADR-0009 implementation report.
        return []
    return [email.strip() for email in raw.split(",") if email.strip()]


def _git_authors_for_file(file_path: Path) -> list[str]:
    """Return the list of commit author emails that touched ``file_path``.

    Uses ``git log --format=%ae -- <file>``. Each line of stdout is one
    author email (one entry per commit; duplicates preserved so a callers
    can spot repeated non-service-account authorship).

    Returns an empty list when:
    - the file is not tracked by git;
    - git is not on PATH or the path is not inside a git working tree;
    - the file has no commit history.
    """
    try:
        result = subprocess.run(
            ["git", "log", "--format=%ae", "--", str(file_path)],
            capture_output=True,
            check=False,
            text=True,
            cwd=file_path.parent if file_path.parent.exists() else None,
        )
    except (FileNotFoundError, OSError):
        return []
    if result.returncode != 0:
        return []
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def check_derived_provenance(
    derived_dir: Path | None,
    *,
    service_accounts: list[str] | None = None,
) -> list[str]:
    """Enforce ODR-0004 §3a clause #5:

      Consumer-profile artefacts have no commits outside the build-pipeline
      service account.

    Walks ``derived_dir`` (the build-output composition directory; created by
    ADR-0013's `compose` build-step). For each ``*.ttl`` file present, runs
    ``git log --format=%ae`` and collects authors not in the configured
    service-account allowlist.

    Tolerates a missing ``derived_dir`` (returns ``[]``) — this is the
    ADR-0009 state: foundation has emitted source graphs but no derived
    profiles yet. Returns an empty list on PASS; a list of violation strings
    on FAIL.

    The service-account allowlist is resolved via
    ``_service_account_allowlist()`` unless ``service_accounts`` is passed
    explicitly (used by tests).
    """
    if derived_dir is None or not derived_dir.exists():
        return []
    allowlist = (
        service_accounts
        if service_accounts is not None
        else _service_account_allowlist()
    )
    violations: list[str] = []
    for ttl in sorted(derived_dir.rglob("*.ttl")):
        authors = _git_authors_for_file(ttl)
        non_service = sorted({a for a in authors if a not in allowlist})
        for author in non_service:
            violations.append(
                f"derived artefact {ttl} touched by non-service-account "
                f"author {author!r}"
            )
    return violations


# ---------------------------------------------------------------------------
# Orchestration.
# ---------------------------------------------------------------------------
def run_all(ontology_dir: Path) -> list[str]:
    """Run all five checks against an emission directory.

    Returns a flat list of violation strings across all five checks (empty
    == PASS). Tolerates missing files: a missing file is reported as a
    separate violation so the caller knows the corpus is incomplete.

    Per ADR-0012, the shape and annotation layers expanded from one
    foundation TTL each to seven TTLs each (1 foundation + 6 per-module).
    `run_all` merges all `*-shapes.ttl` files into a single shapes graph
    and all `*-annotations.ttl` files into a single annotations graph
    before applying the ODR-0004 §3a checks; per-module class files
    (`opda-{module}.ttl`) merge into the classes graph similarly. This
    keeps the three-graph contract enforceable across the full Phase-4
    corpus, not just the foundation skeleton.
    """
    out: list[str] = []

    foundation_classes = ontology_dir / "opda-classes.ttl"
    foundation_shapes = ontology_dir / "opda-shapes.ttl"
    foundation_annotations = ontology_dir / "opda-annotations.ttl"

    classes_g = Graph()
    shapes_g = Graph()
    annotations_g = Graph()

    # Foundation files MUST exist.
    if foundation_classes.exists():
        classes_g.parse(str(foundation_classes), format="turtle")
    else:
        out.append(f"missing file: {foundation_classes}")
    if foundation_shapes.exists():
        shapes_g.parse(str(foundation_shapes), format="turtle")
    else:
        out.append(f"missing file: {foundation_shapes}")
    if foundation_annotations.exists():
        annotations_g.parse(str(foundation_annotations), format="turtle")
    else:
        out.append(f"missing file: {foundation_annotations}")

    # Per-module classes — opda-{module}.ttl (6 expected post-ADR-0011).
    for module in (
        "property", "agent", "transaction",
        "claim", "governance", "descriptive",
    ):
        cpath = ontology_dir / f"opda-{module}.ttl"
        if cpath.exists():
            classes_g.parse(str(cpath), format="turtle")

    # Per-module shapes + annotations — opda-{module}-shapes/annotations.ttl
    # (6 + 6 expected post-ADR-0012). Tolerates missing files (Phase 3
    # corpora that haven't run ADR-0012 yet).
    for module in (
        "property", "agent", "transaction",
        "claim", "governance", "descriptive",
    ):
        spath = ontology_dir / f"opda-{module}-shapes.ttl"
        if spath.exists():
            shapes_g.parse(str(spath), format="turtle")
        apath = ontology_dir / f"opda-{module}-annotations.ttl"
        if apath.exists():
            annotations_g.parse(str(apath), format="turtle")

    out.extend(check_no_shacl_in_annotations(annotations_g))
    out.extend(check_no_owl_imports_in_shapes(shapes_g))
    out.extend(check_no_advisory_in_shapes(shapes_g))
    out.extend(check_target_class_resolves(shapes_g, classes_g))
    out.extend(check_derived_provenance(ontology_dir / "derived"))
    return out
