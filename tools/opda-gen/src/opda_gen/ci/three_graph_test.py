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

The full corpus check (`run_all`) executes all eleven checks across a directory
containing `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`,
the 6 per-module TTLs, plus `opda-vocabularies.ttl` + `opda-contexts.ttl` (the
ODR-0029 reasoned union, scanned by check 6), and (per check #5) optionally
`derived/` artefacts whose git history is inspected for non-service-account
commits. Checks 6-7 (ufoCategory quarantine + meta-shape guard) realise
ODR-0030/0031 + the session-044 regression-hardening.  Check 8 (ADR-0046 ±R limb)
runs the TBox OntoClean rigidity meta-shape over the class+annotation graph only
(the editorial pass — never the instance-validation union), enforcing the
violation form `rigid ⊑ anti-rigid` returns empty.  Check 9 (ADR-0046 ±I limb)
is its identity-criterion sibling over the same editorial pass, enforcing that
the violation form `supplies-IC ⊑ supplies-IC` (two incompatible own-identity
criteria) returns empty.  Checks 10-11 (ADR-0050 / council session-049) enforce
the single-canonical-axis invariant: check 10 (axis-consistency) asserts every
rigidity/identity-tagged class's OntoClean projection agrees with g(ufoCategory)
— rigidity/identity is a derived function of the single canonical typing axis,
never an independent assertion; check 11 (edge-targeted growth-frontier guard)
fails when a sortal-categorised endpoint of an intra-`opda:` rdfs:subClassOf edge
lacks a rigidity projection, catching the silent-false-green where check 8 goes
vacuous across an edge through an untyped middle class.
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
# Check 9: TBox OntoClean ±I identity check (ADR-0046 — the ±I limb).
# ---------------------------------------------------------------------------
def check_ontoclean_identity_tbox(
    class_graph: Graph, annotation_graph: Graph
) -> list[str]:
    """ADR-0046 ±I limb — the canonical OntoClean identity-criterion check.

    The identity (±I) sibling of `check_ontoclean_tbox` (the ±R limb). Over the
    MERGED class+annotation graph (the TBox editorial pass — NEVER the
    instance-validation union), enforce the OntoClean IC-compatibility
    constraint (Guarino & Welty 2009 §3): **a type that supplies its own
    identity criterion cannot subsume another type that also supplies its own
    identity criterion.** The VIOLATION form is

      SELECT ?sub ?super WHERE {
        ?sub   opda:ontoCleanIdentity "supplies-IC" .
        ?sub   rdfs:subClassOf ?super .
        ?super opda:ontoCleanIdentity "supplies-IC" .
      }

    which MUST return EMPTY. Two independent own-identity suppliers carry
    *distinct, incompatible* identity criteria; a subsumption between them
    would force the subclass to bear two rival own-ICs on the same instances
    (a sortal cannot subsume a different sortal). The compatible directions —
    `carries-IC ⊑ supplies-IC` (the subclass inherits the super's supplied IC;
    e.g. `Transaction ⊑ Relator`) and `no-own-IC ⊑ *` (Roles/RoleMixins, which
    borrow identity from a bearer; e.g. `Buyer ⊑ RoleMixin`,
    `Proprietor ⊑ Role`) — are PERMITTED. In the OPDA corpus the check is empty:
    `Relator` is the only `supplies-IC` type and it subclasses nothing tagged.

    Mirrors the ±R limb's sole `rigid ⊑ anti-rigid` pairing with the sole
    `supplies-IC ⊑ supplies-IC` pairing. Returns a list of violation strings
    (empty == PASS).
    """
    from rdflib.namespace import RDFS

    merged = Graph()
    for t in class_graph:
        merged.add(t)
    for t in annotation_graph:
        merged.add(t)

    violations: list[str] = []

    # Canonical check: a SUPPLIES-IC type must not subclass another SUPPLIES-IC
    # type. (carries-IC ⊑ supplies-IC and no-own-IC ⊑ anything are compatible.)
    for sub, super_ in merged.subject_objects(RDFS.subClassOf):
        if not (isinstance(sub, URIRef) and isinstance(super_, URIRef)):
            continue
        super_identity = merged.value(super_, OPDA.ontoCleanIdentity)
        if super_identity is None or str(super_identity) != "supplies-IC":
            continue
        sub_identity = merged.value(sub, OPDA.ontoCleanIdentity)
        if sub_identity is not None and str(sub_identity) == "supplies-IC":
            violations.append(
                f"OntoClean violation: {sub} (supplies-IC) rdfs:subClassOf "
                f"{super_} (supplies-IC) — a type supplying its own identity "
                "criterion must not subclass another own-IC supplier "
                "(incompatible identity criteria; ADR-0046 ±I limb; "
                "Guarino & Welty 2009 §3)."
            )

    return violations


# ---------------------------------------------------------------------------
# Check 10: axis-consistency — the OntoClean projection MUST agree with the
# ufoCategory signature (ADR-0050 / council session-049; hm ODR-0100).
# ---------------------------------------------------------------------------
# ADR-0050 ratifies opda:ufoCategory as the SINGLE canonical typing axis; the
# OntoClean (±R, ±I) triple is a DERIVED VIEW of it (a function g of the
# category), never an independent assertion. The emitter now computes the tags
# via g (ufo_categories.ontoclean_signature) — but a hand-edit to the emitted
# TTL, or a future divergence, would break single-valued-ness silently. This
# check is the INDEPENDENT oracle: it re-derives the expected (rigidity,
# identity-family) from each rigidity-tagged class's emitted ufoCategory and
# asserts the emitted OntoClean tags agree. It is the consuming gate Davis's
# held dissent requires (the rule must not ship as prose without one).
#
# The check encodes g as a validation spec independent of the emitter, so it
# is a genuine cross-check of the emitted artefact, not a tautology against the
# generator. Rigidity is a pure function of the category. Identity is the
# category's identity FAMILY: a supplies-IC category admits {supplies-IC (the
# category root), carries-IC (a subkind that inherits the IC)}; an −I category
# admits only {no-own-IC}; a non-sortal category admits no own OntoClean
# identity at all.

# category -> expected rigidity. Non-sortals + the perdurant Event are
# "non-rigid" (NEVER a coerced ±R — session-049 rejected corpus-wide ±R).
_CATEGORY_RIGIDITY: dict[str, str] = {
    "Substance Kind": "rigid",
    "Relator": "rigid",
    "Role": "anti-rigid",
    "RoleMixin": "anti-rigid",
    "Information Object": "non-rigid",
    "Event": "non-rigid",
    "Quality": "non-rigid",
    "Quality Value": "non-rigid",
    "Collective": "non-rigid",
}

# category -> the admissible OntoClean identity family for a class of that
# category. A supplies-IC (+I) category admits supplies-IC (root) or carries-IC
# (subkind inheriting the IC); a −I category admits only no-own-IC; a
# non-sortal category admits none (so an own-identity tag there is a violation).
_CATEGORY_IDENTITY_FAMILY: dict[str, frozenset[str]] = {
    "Substance Kind": frozenset({"supplies-IC", "carries-IC"}),
    "Relator": frozenset({"supplies-IC", "carries-IC"}),
    "Role": frozenset({"no-own-IC"}),
    "RoleMixin": frozenset({"no-own-IC"}),
    "Information Object": frozenset(),
    "Event": frozenset(),
    "Quality": frozenset(),
    "Quality Value": frozenset(),
    "Collective": frozenset(),
}


def check_ontoclean_axis_consistency(annotation_graph: Graph) -> list[str]:
    """Enforce the ADR-0050 single-axis invariant on the emitted tags.

    For every class bearing an `opda:ontoCleanRigidity` (or `…Identity`) tag,
    re-derive the expected rigidity / identity-family from its emitted
    `opda:ufoCategory` and assert the tags agree:

      * `ontoCleanRigidity` MUST equal g(ufoCategory)'s rigidity
        (`ufoCategory` "Role"/"RoleMixin" ⇒ "anti-rigid";
         "Relator"/"Substance Kind" ⇒ "rigid"; non-sortals ⇒ "non-rigid");
      * `ontoCleanIdentity` MUST be in g(ufoCategory)'s admissible identity
        family (a `−I`/non-sortal category may NOT bear `supplies-IC`).

    A rigidity/identity tag on a class with no `ufoCategory`, or with a
    category outside the closed scheme, is itself a violation (the projection
    has nothing to derive from). Returns a list of violation strings (empty
    == PASS). TBox-only — reads the annotation graph; emits no shape.
    """
    violations: list[str] = []
    tagged: set = set()
    for s, _p, _o in annotation_graph.triples((None, OPDA.ontoCleanRigidity, None)):
        tagged.add(s)
    for s, _p, _o in annotation_graph.triples((None, OPDA.ontoCleanIdentity, None)):
        tagged.add(s)

    for subj in sorted(tagged, key=str):
        cat_lit = annotation_graph.value(subj, OPDA.ufoCategory)
        if cat_lit is None:
            violations.append(
                f"axis-consistency: {subj} bears an OntoClean tag but no "
                "opda:ufoCategory — the single canonical typing axis is "
                "absent, so the OntoClean projection has nothing to derive "
                "from (ADR-0050)."
            )
            continue
        category = str(cat_lit)
        if category not in _CATEGORY_RIGIDITY:
            violations.append(
                f"axis-consistency: {subj} has opda:ufoCategory {category!r} "
                "outside the closed UFOCategoryScheme — cannot derive an "
                "OntoClean signature (ADR-0050)."
            )
            continue

        rigidity = annotation_graph.value(subj, OPDA.ontoCleanRigidity)
        if rigidity is not None:
            expected = _CATEGORY_RIGIDITY[category]
            if str(rigidity) != expected:
                violations.append(
                    f"axis-consistency: {subj} opda:ontoCleanRigidity "
                    f"{str(rigidity)!r} contradicts its opda:ufoCategory "
                    f"{category!r} (expected {expected!r}) — OntoClean "
                    "rigidity must be a function of the single canonical "
                    "ufoCategory axis (ADR-0050; session-049)."
                )

        identity = annotation_graph.value(subj, OPDA.ontoCleanIdentity)
        if identity is not None:
            family = _CATEGORY_IDENTITY_FAMILY[category]
            if str(identity) not in family:
                allowed = (
                    "{" + ", ".join(sorted(family)) + "}" if family else "{}"
                )
                violations.append(
                    f"axis-consistency: {subj} opda:ontoCleanIdentity "
                    f"{str(identity)!r} is not admissible for opda:ufoCategory "
                    f"{category!r} (admissible: {allowed}) — OntoClean "
                    "identity must agree with the single canonical ufoCategory "
                    "axis (ADR-0050; session-049)."
                )

    return violations


# ---------------------------------------------------------------------------
# Check 11: edge-targeted growth-frontier guard (ADR-0050 — REQUIRED for
# soundness; council session-049, Guarino's growth-frontier counterexample).
# ---------------------------------------------------------------------------
# The OntoClean rigidity-subsumption gate (check 8) is only sound while every
# endpoint of an intra-`opda:` rdfs:subClassOf edge that NEEDS a rigidity
# projection actually has one. Today it does (the 5 edges' 8 endpoints are all
# tagged). But adding a future sortal subkind edge through an UNTYPED middle
# class (Guarino's `CreditRiskAssessment ⊐ RiskAssessment ⊐ AssessorRole`) would
# slip past check 8 silently — the gate stays vacuously green because the
# untyped middle class carries no rigidity to contradict. This guard fails CI
# at edge-authoring time: any intra-`opda:` subClassOf edge whose endpoint is a
# SORTAL-categorised class (Substance Kind / Relator / Role / RoleMixin —
# categories that DO carry a rigidity) MUST bear an `opda:ontoCleanRigidity`
# projection. Non-sortal endpoints (Information Object / Quality / Event / …)
# are exempt — g assigns them no ±R, so they need none (this is the
# edge-participant scope, NOT corpus-wide pre-typing of edgeless classes).

# The sortal categories — those for which g yields a ±R rigidity that a
# subsumption edge can contradict. A subClassOf endpoint of one of these MUST
# carry a rigidity projection or check 8 goes silently vacuous.
_SORTAL_CATEGORIES: frozenset[str] = frozenset(
    {"Substance Kind", "Relator", "Role", "RoleMixin"}
)


def check_ontoclean_edge_frontier(
    class_graph: Graph, annotation_graph: Graph
) -> list[str]:
    """Enforce the ADR-0050 edge-targeted growth-frontier guard.

    Over the intra-`opda:` `rdfs:subClassOf` edges (both endpoints
    `opda:`-namespaced), FAIL when an endpoint is a sortal-categorised class
    (its `opda:ufoCategory` is one of Substance Kind / Relator / Role /
    RoleMixin) yet lacks an `opda:ontoCleanRigidity` projection. Such a gap
    makes the rigidity-subsumption gate (check 8) vacuously green across that
    edge — the silent-false-green session-049's growth-frontier counterexample
    exposed. Non-sortal endpoints are exempt (g assigns them no ±R).

    Passes today: the five intra-`opda:` edges' endpoints (Relator, Role,
    RoleMixin, Transaction, Proprietorship, Proprietor, Buyer, Seller) are all
    tagged. Returns a list of violation strings (empty == PASS). TBox-only.
    """
    from rdflib.namespace import RDFS

    opda_ns = str(OPDA)
    violations: list[str] = []
    seen: set = set()
    for sub, super_ in class_graph.subject_objects(RDFS.subClassOf):
        if not (isinstance(sub, URIRef) and isinstance(super_, URIRef)):
            continue
        if not (str(sub).startswith(opda_ns) and str(super_).startswith(opda_ns)):
            continue
        for endpoint in (sub, super_):
            if endpoint in seen:
                continue
            cat_lit = annotation_graph.value(endpoint, OPDA.ufoCategory)
            if cat_lit is None or str(cat_lit) not in _SORTAL_CATEGORIES:
                continue
            if annotation_graph.value(endpoint, OPDA.ontoCleanRigidity) is None:
                seen.add(endpoint)
                violations.append(
                    f"edge-frontier: {endpoint} is a sortal-categorised "
                    f"({str(cat_lit)!r}) endpoint of an intra-opda "
                    "rdfs:subClassOf edge but lacks an opda:ontoCleanRigidity "
                    "projection — the rigidity-subsumption gate (check 8) would "
                    "be silently vacuous across this edge (ADR-0050; "
                    "session-049 growth-frontier guard)."
                )
    return violations


# ---------------------------------------------------------------------------
# Orchestration.
# ---------------------------------------------------------------------------
def run_all(ontology_dir: Path) -> list[str]:
    """Run all eleven checks against an emission directory.

    Returns a flat list of violation strings across all eleven checks (empty
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
    # Check 8 (ADR-0046 seventh CI gate): TBox OntoClean canonical check (±R).
    # Runs over class + annotation graph ONLY (editorial pass; never instances).
    out.extend(check_ontoclean_tbox(classes_g, annotations_g))
    # Check 9 (ADR-0046 ±I limb): TBox OntoClean identity-criterion check.
    # Same editorial pass (class + annotation graph only; never instances).
    out.extend(check_ontoclean_identity_tbox(classes_g, annotations_g))
    # Check 10 (ADR-0050): axis-consistency — the OntoClean projection must
    # agree with the single canonical ufoCategory axis (annotation graph only).
    out.extend(check_ontoclean_axis_consistency(annotations_g))
    # Check 11 (ADR-0050): edge-targeted growth-frontier guard — every sortal
    # endpoint of an intra-opda subClassOf edge must bear a rigidity projection.
    out.extend(check_ontoclean_edge_frontier(classes_g, annotations_g))
    return out
