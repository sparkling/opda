"""
Tests for the ODR-0004 §3a three-graph CI test.

Realises:
- ADR-0008 §"Confirmation" #3 — three-graph CI test in the suite.
- ADR-0009 follow-up G3 — `check_derived_provenance` git-blame inspection
  with positive + negative regression tests (creates a temp git repo and
  exercises both branches).
- ODR-0004 §3a — five-part CI test correctness verified here.
- ADR-0007 §"Three-graph emission constraints" — generator's contract surface.

Each of the first four §3a clauses gets one positive test (clean Turtle
passes) and one negative test (violating Turtle is detected). Clause #5
gets two tests (clean history; non-service-account commit detected).
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

import pytest
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import OWL, RDF

from opda_gen.ci.three_graph_test import (
    check_derived_provenance,
    check_no_advisory_in_classes,
    check_no_advisory_in_shapes,
    check_no_owl_imports_in_shapes,
    check_no_shacl_in_annotations,
    check_ontoclean_axis_consistency,
    check_ontoclean_edge_frontier,
    check_ontoclean_identity_tbox,
    check_ontoclean_tbox,
    check_target_class_resolves,
    check_ufocategory_not_instance_keyed,
    run_all,
)


OPDA = Namespace("https://opda.org.uk/pdtf/")
OPDA_SCHEME = Namespace("https://opda.org.uk/pdtf/scheme/")
OPDA_SHAPE = Namespace("https://opda.org.uk/pdtf/shape/")
SH = Namespace("http://www.w3.org/ns/shacl#")


def test_clean_annotations_pass() -> None:
    g = Graph()
    g.add((OPDA.Foo, OPDA.aiHint, Literal("hint")))
    assert check_no_shacl_in_annotations(g) == []


def test_shacl_in_annotations_fail() -> None:
    g = Graph()
    g.add((OPDA.Foo, SH.targetClass, OPDA.Bar))  # violation
    violations = check_no_shacl_in_annotations(g)
    assert len(violations) == 1
    assert "sh:" in violations[0] or "shacl" in violations[0].lower()


def test_no_owl_imports_in_clean_shapes() -> None:
    g = Graph()
    g.add((OPDA_SHAPE.fooShape, RDF.type, SH.NodeShape))
    g.add((OPDA_SHAPE.fooShape, SH.targetClass, OPDA.Foo))
    assert check_no_owl_imports_in_shapes(g) == []


def test_owl_imports_in_shapes_fail() -> None:
    g = Graph()
    g.add((URIRef("https://w3id.org/opda/shapes"), OWL.imports,
           URIRef("https://w3id.org/opda/classes")))
    violations = check_no_owl_imports_in_shapes(g)
    assert len(violations) == 1


def test_no_advisory_in_clean_shapes() -> None:
    g = Graph()
    g.add((OPDA_SHAPE.fooShape, RDF.type, SH.NodeShape))
    assert check_no_advisory_in_shapes(g) == []


def test_advisory_in_shapes_fail() -> None:
    g = Graph()
    g.add((OPDA_SHAPE.fooShape, OPDA.aiHint, Literal("don't")))
    violations = check_no_advisory_in_shapes(g)
    assert len(violations) == 1


# Check 6 (ODR-0031 R2 / ADR-0045) — no advisory predicate in the classes graph.
def test_no_advisory_in_clean_classes() -> None:
    g = Graph()
    g.add((OPDA.Foo, RDF.type, OWL.Class))
    assert check_no_advisory_in_classes(g) == []


def test_ufocategory_in_classes_fail() -> None:
    g = Graph()
    g.add((OPDA.Foo, RDF.type, OWL.Class))
    g.add((OPDA.Foo, OPDA.ufoCategory, Literal("Substance Kind")))
    violations = check_no_advisory_in_classes(g)
    assert len(violations) == 1
    assert "ufoCategory" in violations[0]


# Check 6 widened to the full ODR-0029 reasoned union (session-044) — a
# ufoCategory tag in opda-vocabularies.ttl (a reasoned graph the gate did not
# previously scan, and the file the ADR-0044 Phase-5c breach reached) must be
# caught by run_all, not only when it sits in the class graph.
def test_run_all_widens_check6_to_vocabularies(tmp_path: Path) -> None:
    prefix = (
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n"
        "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n"
    )
    (tmp_path / "opda-classes.ttl").write_text(
        prefix + "opda:Foo rdf:type owl:Class .\n"
    )
    (tmp_path / "opda-shapes.ttl").write_text(prefix)
    (tmp_path / "opda-annotations.ttl").write_text(prefix)
    (tmp_path / "opda-vocabularies.ttl").write_text(
        prefix + 'opda:SomeScheme opda:ufoCategory "Substance Kind" .\n'
    )
    violations = run_all(tmp_path)
    assert any(
        "ufoCategory" in v and "reasoned-union" in v for v in violations
    ), violations


# Check 7 (session-044) — the opda:ufoCategory sh:in meta-shape must stay a
# value-space guard (sh:targetSubjectsOf), never instance-keyed via a
# domain-class target (ODR-0030 trigger (i); ODR-0031 R3).
def test_ufocategory_metashape_value_guard_passes() -> None:
    g = Graph()
    shp = OPDA_SHAPE.UFOCategoryValue_MetaShape
    ps = OPDA_SHAPE.UFOCategoryValue_PropShape
    g.add((shp, RDF.type, SH.NodeShape))
    g.add((shp, SH.targetSubjectsOf, OPDA.ufoCategory))
    g.add((shp, SH.property, ps))
    g.add((ps, SH.path, OPDA.ufoCategory))
    assert check_ufocategory_not_instance_keyed(g) == []


def test_ufocategory_metashape_instance_keyed_fails() -> None:
    g = Graph()
    shp = OPDA_SHAPE.UFOCategoryValue_MetaShape
    ps = OPDA_SHAPE.UFOCategoryValue_PropShape
    g.add((shp, RDF.type, SH.NodeShape))
    g.add((shp, SH.targetClass, OPDA.Proprietorship))  # the forbidden regression
    g.add((shp, SH.property, ps))
    g.add((ps, SH.path, OPDA.ufoCategory))
    violations = check_ufocategory_not_instance_keyed(g)
    assert len(violations) == 1
    assert "instance-keyed" in violations[0]


def test_target_class_resolves_pass() -> None:
    classes = Graph()
    classes.add((OPDA.Foo, RDF.type, OWL.Class))
    shapes = Graph()
    shapes.add((OPDA_SHAPE.fooShape, SH.targetClass, OPDA.Foo))
    assert check_target_class_resolves(shapes, classes) == []


def test_target_class_unresolved_fail() -> None:
    classes = Graph()  # empty
    shapes = Graph()
    shapes.add((OPDA_SHAPE.fooShape, SH.targetClass, OPDA.Missing))
    violations = check_target_class_resolves(shapes, classes)
    assert len(violations) == 1
    assert "Missing" in violations[0]


# --- Check 5: derived-profile provenance (G3 follow-up) -------------------
def _init_temp_git_repo(tmp_path: Path, author_email: str) -> Path:
    """Initialise a tmp git repo with a fixed author for deterministic
    commit history. Returns the repo root path.
    """
    subprocess.run(["git", "init", "--quiet", str(tmp_path)], check=True)
    # Pin author identity for the duration of the test repo's commits.
    subprocess.run(
        ["git", "config", "user.email", author_email],
        cwd=tmp_path,
        check=True,
    )
    subprocess.run(
        ["git", "config", "user.name", "Test Author"],
        cwd=tmp_path,
        check=True,
    )
    subprocess.run(
        ["git", "config", "commit.gpgsign", "false"],
        cwd=tmp_path,
        check=True,
    )
    return tmp_path


def test_check_derived_provenance_missing_dir_passes() -> None:
    """If the derived dir doesn't exist, the check returns PASS (empty list).

    This is the foundation-emission state (ADR-0009): foundation source
    graphs exist but no derived/ profiles have been built yet.
    """
    assert check_derived_provenance(None) == []
    assert check_derived_provenance(Path("/nonexistent/path/to/derived")) == []


def test_check_derived_provenance_clean_history_passes(
    tmp_path: Path,
) -> None:
    """Positive: a derived/ artefact whose only committer is in the
    service-account allowlist returns PASS.
    """
    repo = _init_temp_git_repo(tmp_path, "build-pipeline@opda.invalid")
    derived = repo / "derived"
    derived.mkdir()
    ttl = derived / "opda-validation.ttl"
    ttl.write_text("# derived artefact\n")
    subprocess.run(["git", "add", "derived/opda-validation.ttl"],
                   cwd=repo, check=True)
    subprocess.run(
        ["git", "commit", "--quiet", "-m", "build: derive validation"],
        cwd=repo,
        check=True,
    )
    violations = check_derived_provenance(
        derived,
        service_accounts=["build-pipeline@opda.invalid"],
    )
    assert violations == [], (
        f"clean history should PASS but reported: {violations}"
    )


def test_check_derived_provenance_non_service_commit_fails(
    tmp_path: Path,
) -> None:
    """Negative: a derived/ artefact touched by a non-service-account
    author returns a violation string naming the author + the file.
    """
    repo = _init_temp_git_repo(tmp_path, "human-engineer@example.invalid")
    derived = repo / "derived"
    derived.mkdir()
    ttl = derived / "opda-ui.ttl"
    ttl.write_text("# hand-edited derived artefact (should not happen)\n")
    subprocess.run(["git", "add", "derived/opda-ui.ttl"],
                   cwd=repo, check=True)
    subprocess.run(
        ["git", "commit", "--quiet", "-m", "human edit"],
        cwd=repo,
        check=True,
    )
    violations = check_derived_provenance(
        derived,
        service_accounts=["build-pipeline@opda.invalid"],
    )
    assert len(violations) == 1, (
        f"expected exactly one violation, got: {violations}"
    )
    assert "human-engineer@example.invalid" in violations[0]
    assert "opda-ui.ttl" in violations[0]


def test_check_derived_provenance_env_var_allowlist(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The ``OPDA_DERIVED_SERVICE_ACCOUNTS`` env var supplies the allowlist
    when no explicit ``service_accounts`` kwarg is passed.

    Comma-separated list; whitespace tolerated.
    """
    repo = _init_temp_git_repo(tmp_path, "ci-bot@opda.invalid")
    derived = repo / "derived"
    derived.mkdir()
    ttl = derived / "opda-inference.ttl"
    ttl.write_text("# derived\n")
    subprocess.run(["git", "add", "derived/opda-inference.ttl"],
                   cwd=repo, check=True)
    subprocess.run(
        ["git", "commit", "--quiet", "-m", "build"],
        cwd=repo,
        check=True,
    )
    monkeypatch.setenv(
        "OPDA_DERIVED_SERVICE_ACCOUNTS",
        "ci-bot@opda.invalid, build@opda.invalid",
    )
    violations = check_derived_provenance(derived)
    assert violations == [], (
        f"env-var allowlist should PASS but reported: {violations}"
    )


# --- Check 8 (ADR-0046): TBox OntoClean canonical check -------------------
# The canonical query: SELECT ?sub ?super WHERE {
#   ?sub rdfs:subClassOf ?super . ?super opda:ontoCleanRigidity "anti-rigid" }
# A RIGID type subclassing an ANTI-RIGID super is the soundness violation.
# Anti-rigid subclassing anti-rigid (e.g. Buyer → RoleMixin) is PERMITTED.

def test_ontoclean_tbox_rigid_subclasses_rigid_passes() -> None:
    """A rigid type subclassing another rigid type — PASS."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # Relator (rigid) and Transaction (rigid subClassOf Relator) — OK.
    classes.add((OPDA.Transaction, RDFS.subClassOf, OPDA.Relator))
    annotations.add((OPDA.Relator, OPDA.ontoCleanRigidity, Literal("rigid")))
    annotations.add((OPDA.Transaction, OPDA.ontoCleanRigidity, Literal("rigid")))
    violations = check_ontoclean_tbox(classes, annotations)
    assert violations == [], f"rigid-subclasses-rigid should PASS: {violations}"


def test_ontoclean_tbox_rigid_subclasses_antrigid_fails() -> None:
    """A RIGID type subclassing an ANTI-RIGID type — FAIL (OntoClean violation)."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # Pathological case: a rigid Kind subclassing an anti-rigid RoleMixin.
    classes.add((OPDA.Property, RDFS.subClassOf, OPDA.RoleMixin))
    annotations.add((OPDA.Property, OPDA.ontoCleanRigidity, Literal("rigid")))
    annotations.add((OPDA.RoleMixin, OPDA.ontoCleanRigidity, Literal("anti-rigid")))
    violations = check_ontoclean_tbox(classes, annotations)
    assert len(violations) == 1, f"expected one violation: {violations}"
    assert "rigid" in violations[0]
    assert "anti-rigid" in violations[0]
    assert "OntoClean" in violations[0]


def test_ontoclean_tbox_antrigid_subclasses_antrigid_passes() -> None:
    """An anti-rigid type subclassing another anti-rigid type — PASS (normal)."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # Buyer (anti-rigid RoleMixin subClassOf RoleMixin) — OK; real OPDA pattern.
    classes.add((OPDA.Buyer, RDFS.subClassOf, OPDA.RoleMixin))
    annotations.add((OPDA.Buyer, OPDA.ontoCleanRigidity, Literal("anti-rigid")))
    annotations.add((OPDA.RoleMixin, OPDA.ontoCleanRigidity, Literal("anti-rigid")))
    violations = check_ontoclean_tbox(classes, annotations)
    assert violations == [], f"anti-rigid subclassing anti-rigid should PASS: {violations}"


def test_ontoclean_tbox_no_tags_passes() -> None:
    """Types without OntoClean tags are not checked — PASS."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # No tags at all — the check has nothing to evaluate.
    classes.add((OPDA.Foo, RDFS.subClassOf, OPDA.Bar))
    violations = check_ontoclean_tbox(classes, annotations)
    assert violations == [], f"untagged types should PASS: {violations}"


def test_ontoclean_predicates_in_classes_fail() -> None:
    """OntoClean predicates in the classes graph are a check-6 violation."""
    g = Graph()
    g.add((OPDA.Relator, OPDA.ontoCleanRigidity, Literal("rigid")))
    violations = check_no_advisory_in_classes(g)
    assert len(violations) == 1
    assert "ontoCleanRigidity" in violations[0]


def test_ontoclean_identity_in_classes_fail() -> None:
    """opda:ontoCleanIdentity in the classes graph is a check-6 violation."""
    g = Graph()
    g.add((OPDA.Role, OPDA.ontoCleanIdentity, Literal("no-own-IC")))
    violations = check_no_advisory_in_classes(g)
    assert len(violations) == 1
    assert "ontoCleanIdentity" in violations[0]


def test_run_all_clean_corpus_with_ontoclean_passes(tmp_path: Path) -> None:
    """A clean corpus with valid OntoClean tags passes run_all check 8."""
    prefix = (
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n"
        "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n"
        "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n"
    )
    (tmp_path / "opda-classes.ttl").write_text(
        prefix
        + "opda:Relator rdf:type owl:Class .\n"
        + "opda:Transaction rdf:type owl:Class ; rdfs:subClassOf opda:Relator .\n"
    )
    (tmp_path / "opda-shapes.ttl").write_text(prefix)
    (tmp_path / "opda-annotations.ttl").write_text(
        prefix
        + 'opda:Relator opda:ufoCategory "Relator" ; opda:ontoCleanRigidity "rigid" .\n'
        + 'opda:Transaction opda:ufoCategory "Relator" ; opda:ontoCleanRigidity "rigid" .\n'
    )
    violations = run_all(tmp_path)
    ontoclean_violations = [v for v in violations if "OntoClean" in v]
    assert ontoclean_violations == [], f"clean corpus should pass check 8: {violations}"


# --- Check 9 (ADR-0046 ±I limb): TBox OntoClean identity-criterion check ----
# The canonical violation form: SELECT ?sub ?super WHERE {
#   ?sub opda:ontoCleanIdentity "supplies-IC" . ?sub rdfs:subClassOf ?super .
#   ?super opda:ontoCleanIdentity "supplies-IC" }
# Two own-identity suppliers in a subclass relation carry incompatible ICs.
# carries-IC ⊑ supplies-IC (IC inheritance) and no-own-IC ⊑ * are PERMITTED.

def test_ontoclean_identity_supplies_subclasses_supplies_fails() -> None:
    """POSITIVE CONTROL — supplies-IC ⊑ supplies-IC is the IC-incompatibility
    violation the ±I shape MUST flag (proves the gate is non-vacuous)."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # Synthetic: two distinct own-identity suppliers in a subclass relation —
    # the subclass would bear two rival own-ICs (forbidden).
    classes.add((OPDA.Relator, RDFS.subClassOf, OPDA.Property))
    annotations.add((OPDA.Relator, OPDA.ontoCleanIdentity, Literal("supplies-IC")))
    annotations.add((OPDA.Property, OPDA.ontoCleanIdentity, Literal("supplies-IC")))
    violations = check_ontoclean_identity_tbox(classes, annotations)
    assert len(violations) == 1, f"expected one violation: {violations}"
    assert "supplies-IC" in violations[0]
    assert "OntoClean" in violations[0]


def test_ontoclean_identity_carries_subclasses_supplies_passes() -> None:
    """NEGATIVE CONTROL — carries-IC ⊑ supplies-IC is the VALID IC-inheritance
    direction (the real OPDA Transaction ⊑ Relator edge); the shape must PASS."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # Transaction (carries-IC) subClassOf Relator (supplies-IC) — VALID; the
    # subclass inherits the super's supplied IC rather than asserting a rival.
    classes.add((OPDA.Transaction, RDFS.subClassOf, OPDA.Relator))
    annotations.add((OPDA.Transaction, OPDA.ontoCleanIdentity, Literal("carries-IC")))
    annotations.add((OPDA.Relator, OPDA.ontoCleanIdentity, Literal("supplies-IC")))
    violations = check_ontoclean_identity_tbox(classes, annotations)
    assert violations == [], f"carries-IC ⊑ supplies-IC should PASS: {violations}"


def test_ontoclean_identity_noown_subclasses_noown_passes() -> None:
    """NEGATIVE CONTROL — no-own-IC ⊑ no-own-IC (Buyer ⊑ RoleMixin): neither
    owns an IC; both borrow from a bearer — compatible, the shape must PASS."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # Buyer (no-own-IC RoleMixin) subClassOf RoleMixin (no-own-IC) — real
    # OPDA pattern; compatible.
    classes.add((OPDA.Buyer, RDFS.subClassOf, OPDA.RoleMixin))
    annotations.add((OPDA.Buyer, OPDA.ontoCleanIdentity, Literal("no-own-IC")))
    annotations.add((OPDA.RoleMixin, OPDA.ontoCleanIdentity, Literal("no-own-IC")))
    violations = check_ontoclean_identity_tbox(classes, annotations)
    assert violations == [], f"no-own-IC ⊑ no-own-IC should PASS: {violations}"


def test_ontoclean_identity_noown_subclasses_supplies_passes() -> None:
    """NEGATIVE CONTROL — no-own-IC ⊑ supplies-IC (a Role under a Kind): the
    subclass borrows identity, the super supplies one — compatible, PASS."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    classes.add((OPDA.Proprietor, RDFS.subClassOf, OPDA.Person))
    annotations.add((OPDA.Proprietor, OPDA.ontoCleanIdentity, Literal("no-own-IC")))
    annotations.add((OPDA.Person, OPDA.ontoCleanIdentity, Literal("supplies-IC")))
    violations = check_ontoclean_identity_tbox(classes, annotations)
    assert violations == [], f"no-own-IC ⊑ supplies-IC should PASS: {violations}"


def test_ontoclean_identity_no_tags_passes() -> None:
    """Types without OntoClean identity tags are not checked — PASS."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    classes.add((OPDA.Foo, RDFS.subClassOf, OPDA.Bar))
    violations = check_ontoclean_identity_tbox(classes, annotations)
    assert violations == [], f"untagged types should PASS: {violations}"


def test_run_all_clean_corpus_with_ontoclean_identity_passes(tmp_path: Path) -> None:
    """A clean corpus with valid OntoClean identity tags passes run_all check 9."""
    prefix = (
        "@prefix opda: <https://opda.org.uk/pdtf/> .\n"
        "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n"
        "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n"
        "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n"
    )
    (tmp_path / "opda-classes.ttl").write_text(
        prefix
        + "opda:Relator rdf:type owl:Class .\n"
        + "opda:Transaction rdf:type owl:Class ; rdfs:subClassOf opda:Relator .\n"
    )
    (tmp_path / "opda-shapes.ttl").write_text(prefix)
    (tmp_path / "opda-annotations.ttl").write_text(
        prefix
        + 'opda:Relator opda:ufoCategory "Relator" ; opda:ontoCleanIdentity "supplies-IC" .\n'
        + 'opda:Transaction opda:ufoCategory "Relator" ; opda:ontoCleanIdentity "carries-IC" .\n'
    )
    violations = run_all(tmp_path)
    ontoclean_violations = [v for v in violations if "OntoClean" in v]
    assert ontoclean_violations == [], f"clean corpus should pass check 9: {violations}"


# --- Check 10 (ADR-0050): axis-consistency -------------------------------
# The OntoClean projection MUST agree with the single canonical ufoCategory
# axis (g): rigidity is a function of the category; identity must be in the
# category's admissible family. A mismatch is the single-valued-ness breach.

def test_axis_consistency_matching_tags_pass() -> None:
    """NEGATIVE CONTROL — tags that agree with the ufoCategory signature PASS.
    Mirrors the real OPDA corpus (Relator/Role/RoleMixin families)."""
    annotations = Graph()
    # Relator family (rigid, supplies/carries-IC), Role/RoleMixin (anti-rigid,
    # no-own-IC) — exactly the emitted projection.
    annotations.add((OPDA.Relator, OPDA.ufoCategory, Literal("Relator")))
    annotations.add((OPDA.Relator, OPDA.ontoCleanRigidity, Literal("rigid")))
    annotations.add((OPDA.Relator, OPDA.ontoCleanIdentity, Literal("supplies-IC")))
    annotations.add((OPDA.Transaction, OPDA.ufoCategory, Literal("Relator")))
    annotations.add((OPDA.Transaction, OPDA.ontoCleanRigidity, Literal("rigid")))
    annotations.add((OPDA.Transaction, OPDA.ontoCleanIdentity, Literal("carries-IC")))
    annotations.add((OPDA.Buyer, OPDA.ufoCategory, Literal("RoleMixin")))
    annotations.add((OPDA.Buyer, OPDA.ontoCleanRigidity, Literal("anti-rigid")))
    annotations.add((OPDA.Buyer, OPDA.ontoCleanIdentity, Literal("no-own-IC")))
    violations = check_ontoclean_axis_consistency(annotations)
    assert violations == [], f"agreeing tags should PASS: {violations}"


def test_axis_consistency_rigidity_mismatch_fails() -> None:
    """POSITIVE CONTROL — a rigidity tag contradicting the ufoCategory MUST
    FAIL (an anti-rigid RoleMixin tagged "rigid")."""
    annotations = Graph()
    annotations.add((OPDA.Buyer, OPDA.ufoCategory, Literal("RoleMixin")))
    # RoleMixin ⇒ anti-rigid, but tagged rigid — the single-axis breach.
    annotations.add((OPDA.Buyer, OPDA.ontoCleanRigidity, Literal("rigid")))
    violations = check_ontoclean_axis_consistency(annotations)
    assert len(violations) == 1, f"expected one violation: {violations}"
    assert "axis-consistency" in violations[0]
    assert "RoleMixin" in violations[0]


def test_axis_consistency_identity_not_admissible_fails() -> None:
    """POSITIVE CONTROL — an identity tag outside the category's family MUST
    FAIL (a Role tagged "supplies-IC" — a Role never supplies its own IC)."""
    annotations = Graph()
    annotations.add((OPDA.Proprietor, OPDA.ufoCategory, Literal("Role")))
    annotations.add((OPDA.Proprietor, OPDA.ontoCleanRigidity, Literal("anti-rigid")))
    # Role admits only {no-own-IC}; supplies-IC is inadmissible.
    annotations.add((OPDA.Proprietor, OPDA.ontoCleanIdentity, Literal("supplies-IC")))
    violations = check_ontoclean_axis_consistency(annotations)
    assert len(violations) == 1, f"expected one violation: {violations}"
    assert "axis-consistency" in violations[0]
    assert "not admissible" in violations[0]


def test_axis_consistency_tag_without_ufocategory_fails() -> None:
    """POSITIVE CONTROL — an OntoClean tag on a class with NO ufoCategory MUST
    FAIL: the projection has no single axis to derive from (ADR-0050)."""
    annotations = Graph()
    annotations.add((OPDA.Mystery, OPDA.ontoCleanRigidity, Literal("rigid")))
    violations = check_ontoclean_axis_consistency(annotations)
    assert len(violations) == 1, f"expected one violation: {violations}"
    assert "axis-consistency" in violations[0]
    assert "no opda:ufoCategory" in violations[0]


def test_axis_consistency_nonsortal_no_identity_passes() -> None:
    """NEGATIVE CONTROL — a non-sortal category bearing only non-rigid rigidity
    (no own identity) PASSES; non-sortals are never coerced to ±R/±I."""
    annotations = Graph()
    annotations.add((OPDA.SomeDoc, OPDA.ufoCategory, Literal("Information Object")))
    annotations.add((OPDA.SomeDoc, OPDA.ontoCleanRigidity, Literal("non-rigid")))
    violations = check_ontoclean_axis_consistency(annotations)
    assert violations == [], f"non-rigid non-sortal should PASS: {violations}"


# --- Check 11 (ADR-0050): edge-targeted growth-frontier guard ------------
# A sortal-categorised endpoint of an intra-opda subClassOf edge MUST bear a
# rigidity projection, else check 8 goes silently vacuous across that edge.

def test_edge_frontier_tagged_endpoints_pass() -> None:
    """NEGATIVE CONTROL — the real OPDA edge (Transaction ⊑ Relator), both
    endpoints sortal AND rigidity-tagged, PASSES."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    classes.add((OPDA.Transaction, RDFS.subClassOf, OPDA.Relator))
    for cls in (OPDA.Transaction, OPDA.Relator):
        annotations.add((cls, OPDA.ufoCategory, Literal("Relator")))
        annotations.add((cls, OPDA.ontoCleanRigidity, Literal("rigid")))
    violations = check_ontoclean_edge_frontier(classes, annotations)
    assert violations == [], f"tagged sortal endpoints should PASS: {violations}"


def test_edge_frontier_untyped_sortal_endpoint_fails() -> None:
    """POSITIVE CONTROL — Guarino's growth-frontier counterexample: a sortal
    endpoint (a Relator-categorised middle class) lacking a rigidity projection
    MUST FAIL (else check 8 is silently vacuous across the new edge)."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # CreditRiskAssessment ⊑ RiskAssessment, where RiskAssessment is sortal-
    # categorised but carries NO rigidity projection (the untyped middle class).
    classes.add((OPDA.CreditRiskAssessment, RDFS.subClassOf, OPDA.RiskAssessment))
    annotations.add((OPDA.RiskAssessment, OPDA.ufoCategory, Literal("Relator")))
    annotations.add((OPDA.CreditRiskAssessment, OPDA.ufoCategory, Literal("Relator")))
    annotations.add((OPDA.CreditRiskAssessment, OPDA.ontoCleanRigidity, Literal("rigid")))
    # RiskAssessment (the super) has ufoCategory but NO ontoCleanRigidity.
    violations = check_ontoclean_edge_frontier(classes, annotations)
    assert len(violations) == 1, f"expected one violation: {violations}"
    assert "edge-frontier" in violations[0]
    assert "RiskAssessment" in violations[0]


def test_edge_frontier_nonsortal_endpoint_exempt_passes() -> None:
    """NEGATIVE CONTROL — a NON-sortal endpoint (Information Object) needs no
    rigidity projection; the edge PASSES (edge-participant scope, not
    corpus-wide pre-typing)."""
    from rdflib.namespace import RDFS

    classes = Graph()
    annotations = Graph()
    # An edge between two Information Objects — g assigns them no ±R, so no
    # rigidity projection is required.
    classes.add((OPDA.SpecialSearch, RDFS.subClassOf, OPDA.Search))
    annotations.add((OPDA.SpecialSearch, OPDA.ufoCategory, Literal("Information Object")))
    annotations.add((OPDA.Search, OPDA.ufoCategory, Literal("Information Object")))
    violations = check_ontoclean_edge_frontier(classes, annotations)
    assert violations == [], f"non-sortal endpoints should PASS: {violations}"


def test_edge_frontier_external_super_ignored_passes() -> None:
    """NEGATIVE CONTROL — an edge whose super is NOT opda:-namespaced (an
    external super, e.g. prov:Entity) is out of scope; PASS even if the opda
    subclass is sortal-untyped (the guard is intra-opda only)."""
    from rdflib.namespace import RDFS

    PROV = Namespace("http://www.w3.org/ns/prov#")
    classes = Graph()
    annotations = Graph()
    classes.add((OPDA.Person, RDFS.subClassOf, PROV.Agent))
    annotations.add((OPDA.Person, OPDA.ufoCategory, Literal("Substance Kind")))
    # Person is sortal + untyped-for-rigidity, but its only super is external —
    # not an intra-opda edge, so out of the guard's scope.
    violations = check_ontoclean_edge_frontier(classes, annotations)
    assert violations == [], f"external-super edge should be out of scope: {violations}"
