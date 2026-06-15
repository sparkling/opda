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
    check_target_class_resolves,
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
