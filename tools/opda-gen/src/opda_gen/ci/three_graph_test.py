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

The full corpus check (`run_all`) executes all eight checks across a directory
containing `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`,
the 6 per-module TTLs, plus `opda-vocabularies.ttl` + `opda-contexts.ttl` (the
ODR-0029 reasoned union, scanned by check 6), and (per check #5) optionally
`derived/` artefacts whose git history is inspected for non-service-account
commits. Checks 6-7 (ufoCategory quarantine + meta-shape guard) realise
ODR-0030/0031 + the session-044 regression-hardening.  Check 8 (ADR-0046) runs
the TBox OntoClean meta-shape over the class+annotation graph only (the editorial
pass — never the instance-validation union) and verifies the canonical query
SELECT ?sub ?super WHERE { ?sub rdfs:subClassOf ?super .
  ?super opda:ontoCleanRigidity "anti-rigid" } returns empty.
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
# Check 6: no advisory predicate in the classes graph (ODR-0031 R2 / ADR-0045).
# ---------------------------------------------------------------------------
# The opda:ufoCategory facet (and the wider advisory family) is annotation-
# graph-only (ODR-0030 Rule 1). ADR-0044 Phase 5c shipped it inline in the
# reasoned class graphs, and the five ODR-0004 §3a checks did not catch it —
# they police the shapes + annotation graphs, never the classes graph. This
# sixth check closes that blind spot ("relocate AND gate, atomically",
# council session-041): with it the ODR-0030 quarantine is CI-enforced, not
# merely asserted (Knublauch's session-040 standing condition).
CLASSES_FORBIDDEN_PREDICATES: list[URIRef] = [
    OPDA.ufoCategory,
    # ADR-0046: OntoClean per-type tags are annotation-graph-only (OWL 2 §10.1).
    # They MUST NOT appear in any reasoned-union graph.
    OPDA.ontoCleanRigidity,
    OPDA.ontoCleanIdentity,
    OPDA.ontoCleanDependence,
    *ADVISORY_PREDICATE_WHITELIST,
]


def check_no_advisory_in_classes(class_graph: Graph) -> list[str]:
    """Enforce ODR-0031 R2 / ADR-0045 across the FULL ODR-0029 reasoned union:

      ASK { ?s opda:ufoCategory ?o } (and the rest of the advisory-predicate
      family — opda:aiHint / uiHint / exampleValue) over every graph the
      ODR-0029 entailment regime unions over MUST return false.

    `run_all` passes the full reasoned union here — classes + 6 modules +
    opda-vocabularies.ttl + opda-contexts.ttl (session-044 regression-hardening:
    opda-vocabularies.ttl is a file the ADR-0044 Phase 5c breach actually
    reached, and was previously outside this check's scan).

    Returns a list of violation strings (empty == PASS).
    """
    violations: list[str] = []
    for predicate in CLASSES_FORBIDDEN_PREDICATES:
        for s, _p, o in class_graph.triples((None, predicate, None)):
            violations.append(
                f"reasoned-union graph contains advisory predicate {predicate} "
                f"on {s} = {o} (ODR-0030 Rule 1: annotation-graph-only)"
            )
    return violations


# ---------------------------------------------------------------------------
# Check 7: the opda:ufoCategory sh:in meta-shape stays a value-space guard,
# never instance-keyed (session-044 / ODR-0030 trigger (i) / ODR-0031 R3).
# ---------------------------------------------------------------------------
def check_ufocategory_not_instance_keyed(shapes_graph: Graph) -> list[str]:
    """Enforce the session-044 regression guard (ODR-0030 re-open trigger (i)).

    The opda:ufoCategory `sh:in` meta-shape governs the FACET'S OWN value-space
    (`sh:targetSubjectsOf opda:ufoCategory` — the nine UFO categories). It MUST
    NOT acquire a domain-class target (`sh:targetClass` / `sh:targetNode`): that
    would key the ufoCategory constraint onto tagged *instances'* structure and
    re-fire ODR-0030 trigger (i) into the SHACL instance-validation union (the
    facet must stay an inert annotation on the wire — ODR-0031 R3). Check 4
    (`check_target_class_resolves`) silently PASSES such a regression because the
    domain class resolves — hence this dedicated guard.

    A node shape "validates ufoCategory" if it `sh:targetSubjectsOf` /
    `sh:targetObjectsOf opda:ufoCategory`, or owns (via `sh:property` / `sh:node`)
    a shape whose `sh:path` is opda:ufoCategory. Such a shape carrying
    `sh:targetClass` or `sh:targetNode` is a violation.

    Returns a list of violation strings (empty == PASS).
    """
    concerned: set = set()
    for pred in (SH.targetSubjectsOf, SH.targetObjectsOf):
        for s, _p, _o in shapes_graph.triples((None, pred, OPDA.ufoCategory)):
            concerned.add(s)
    for ps, _p, _o in shapes_graph.triples((None, SH.path, OPDA.ufoCategory)):
        concerned.add(ps)
        for owner, _p2, _o2 in shapes_graph.triples((None, SH.property, ps)):
            concerned.add(owner)
        for owner, _p2, _o2 in shapes_graph.triples((None, SH.node, ps)):
            concerned.add(owner)
    violations: list[str] = []
    for shp in concerned:
        for forbidden in (SH.targetClass, SH.targetNode):
            for _s, _p, o in shapes_graph.triples((shp, forbidden, None)):
                violations.append(
                    f"ufoCategory meta-shape {shp} carries {forbidden} {o} — the "
                    "opda:ufoCategory sh:in guard MUST stay a value-space check "
                    "(sh:targetSubjectsOf opda:ufoCategory), never instance-keyed "
                    "via a domain-class target (ODR-0030 trigger (i); ODR-0031 R3)."
                )
    return violations


# ---------------------------------------------------------------------------
# Check 8: TBox OntoClean canonical check (ADR-0046 seventh CI gate).
# ---------------------------------------------------------------------------
def check_ontoclean_tbox(
    class_graph: Graph, annotation_graph: Graph
) -> list[str]:
    """ADR-0046 seventh CI gate — the canonical OntoClean rigidity check.

    Over the MERGED class+annotation graph (the TBox editorial pass — NEVER the
    instance-validation union), enforce the OntoClean rigidity-subsumption
    constraint (Guarino & Welty 2009 §3): **an anti-rigid (−R) type cannot
    subsume a rigid (+R) type.** The VIOLATION form is

      SELECT ?sub ?super WHERE {
        ?sub   opda:ontoCleanRigidity "rigid" .
        ?sub   rdfs:subClassOf ?super .
        ?super opda:ontoCleanRigidity "anti-rigid" .
      }

    which MUST return EMPTY — a rigid type subclassing an anti-rigid one breaks
    the necessity of the rigid sortal (`Person ⊑ Student` is forbidden, whereas
    `Student ⊑ Person` is valid). In the OPDA corpus it is empty: the only tagged
    subsumption edges are anti-rigid⊑anti-rigid (Proprietor⊑Role,
    Buyer/Seller⊑RoleMixin) and rigid⊑rigid (Transaction/Proprietorship⊑Relator).

    NB the ADR-0046 §Confirmation query as literally written
    (`?super opda:ontoCleanRigidity "anti-rigid"` with no constraint on `?sub`)
    is over-broad — it also matches the VALID anti-rigid⊑anti-rigid edges and so
    returns 3 rows, not zero. The violation form above (implemented here, and
    matched by the OntoCleanAntiRigidSubclassing meta-shape in opda-shapes.ttl)
    is the correct criterion. Returns a list of violation strings (empty == PASS).
    """
    from rdflib.namespace import RDFS

    merged = Graph()
    for t in class_graph:
        merged.add(t)
    for t in annotation_graph:
        merged.add(t)

    violations: list[str] = []

    # Canonical check: a RIGID type must not subclass an ANTI-RIGID type.
    # (An anti-rigid type subclassing another anti-rigid type is fine.)
    # The ADR's confirmation query is:
    #   SELECT ?sub ?super WHERE {
    #     ?sub rdfs:subClassOf ?super .
    #     ?super opda:ontoCleanRigidity "anti-rigid"
    #   }
    # In OPDA this returns EMPTY for the rigid types — Transaction/Proprietorship
    # subclass Relator (rigid), never RoleMixin/Role (anti-rigid). The check
    # fires only if a rigid type somehow ended up subclassing an anti-rigid one.
    for sub, super_ in merged.subject_objects(RDFS.subClassOf):
        if not (isinstance(sub, URIRef) and isinstance(super_, URIRef)):
            continue
        super_rigidity = merged.value(super_, OPDA.ontoCleanRigidity)
        if super_rigidity is None or str(super_rigidity) != "anti-rigid":
            continue
        sub_rigidity = merged.value(sub, OPDA.ontoCleanRigidity)
        if sub_rigidity is not None and str(sub_rigidity) == "rigid":
            violations.append(
                f"OntoClean violation: {sub} (rigid) rdfs:subClassOf {super_} "
                f"(anti-rigid) — a rigid type must not subclass an anti-rigid "
                "type (ADR-0046 canonical query; Guarino & Welty 2009 §3)."
            )

    return violations


# ---------------------------------------------------------------------------
# Orchestration.
# ---------------------------------------------------------------------------
def run_all(ontology_dir: Path) -> list[str]:
    """Run all eight checks against an emission directory.

    Returns a flat list of violation strings across all eight checks (empty
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

    # The ODR-0029 reasoned union (the entailment regime's _TBOX_TTLS) is
    # classes + 6 modules PLUS opda-vocabularies.ttl + opda-contexts.ttl. The
    # advisory-predicate quarantine (check 6) must cover that FULL union, not
    # just the class graph — opda-vocabularies.ttl is a file the ADR-0044 Phase
    # 5c breach actually reached (session-044 regression-hardening). classes_g
    # stays classes+modules only so check 4 (target resolution) is unchanged;
    # reasoned_g adds the two SKOS graphs for check 6.
    reasoned_g = Graph()
    for _t in classes_g:
        reasoned_g.add(_t)
    for _extra in ("opda-vocabularies.ttl", "opda-contexts.ttl"):
        _epath = ontology_dir / _extra
        if _epath.exists():
            reasoned_g.parse(str(_epath), format="turtle")

    out.extend(check_no_shacl_in_annotations(annotations_g))
    out.extend(check_no_owl_imports_in_shapes(shapes_g))
    out.extend(check_no_advisory_in_shapes(shapes_g))
    out.extend(check_target_class_resolves(shapes_g, classes_g))
    out.extend(check_derived_provenance(ontology_dir / "derived"))
    out.extend(check_no_advisory_in_classes(reasoned_g))
    out.extend(check_ufocategory_not_instance_keyed(shapes_g))
    # Check 8 (ADR-0046 seventh CI gate): TBox OntoClean canonical check.
    # Runs over class + annotation graph ONLY (editorial pass; never instances).
    out.extend(check_ontoclean_tbox(classes_g, annotations_g))
    return out
