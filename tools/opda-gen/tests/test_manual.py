"""
Tests for the manual frontmatter emitter (ADR-0020).

Realises:
- ADR-0020 §Confirmation #1 — emitter exists with emit_manual() API.
- ADR-0020 §Confirmation #3 — per-tier emission produces expected file counts.
- ADR-0020 §Confirmation #4 — frontmatter fields populated correctly.
- ADR-0020 §Confirmation #5 — tier READMEs / module READMEs are NOT modified.
- ADR-0020 §Confirmation #6 — byte-identity: emit twice → same bytes.
- ADR-0020 §Confirmation #7 — existing frontmatter is merged, not overwritten.
"""

from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

import pytest
import yaml

from opda_gen.emitters.manual import (
    EmitResult,
    _compute_frontmatter,
    _derive_kind,
    _derive_source_ttl,
    _parse_frontmatter,
    emit_manual,
)


# ---------------------------------------------------------------------------
# Helpers / fixtures
# ---------------------------------------------------------------------------

def _make_tree(base: Path, files: dict[str, str]) -> None:
    """Create a miniature manual tree under base from {rel_path: content}."""
    for rel, content in files.items():
        p = base / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")


ENTITY_BODY = "# Property\n\nDescription here.\n"
SCHEME_BODY = "# RoleScheme\n\nMembers table.\n"
EXEMPLAR_BODY = "# chain-of-transactions\n\nExemplar instance graph.\n"
CROSS_BODY = "# Three-graph separation\n\nBody.\n"
DEPLOY_BODY = "# Property — deployment view\n\nDeployment docs.\n"
README_BODY = "# OPDA Concept Tier\n\n## See also: Modelling section\n\nLinks here.\n"


@pytest.fixture
def mini_manual(tmp_path: Path) -> Path:
    """Small representative manual tree — one file of each kind."""
    _make_tree(tmp_path, {
        # Tier README (must be SKIPPED — G19a)
        "concept/README.md": README_BODY,
        # Module README (must be SKIPPED)
        "concept/property/README.md": "# Property module\n",
        # Entity
        "concept/property/property.md": ENTITY_BODY,
        # Enumeration scheme (logical)
        "logical/agent/enumerations/role-scheme.md": SCHEME_BODY,
        # Exemplar
        "physical-ontology/exemplars/chain-of-transactions.md": EXEMPLAR_BODY,
        # Cross-cutting
        "physical-ontology/three-graph-separation.md": CROSS_BODY,
        # Per-module deployment
        "physical-database/modules/property.md": DEPLOY_BODY,
        # Overlay deployment (physical-database)
        "physical-database/overlay-deployment/baspi5.md": "# BASPI5 overlay\n",
        # Operations
        "physical-database/operations/byte-identity-ci.md": "# Byte-identity CI\n",
        # Named-graphs (operations kind)
        "physical-database/named-graphs.md": "# Per-named-graph layout\n",
    })
    return tmp_path


# ---------------------------------------------------------------------------
# Unit: _derive_kind
# ---------------------------------------------------------------------------

def test_derive_kind_entity() -> None:
    assert _derive_kind(["concept", "property", "property.md"]) == "entity"


def test_derive_kind_scheme_enumeration() -> None:
    assert _derive_kind(["logical", "agent", "enumerations", "role-scheme.md"]) == "scheme"


def test_derive_kind_scheme_vocabulary() -> None:
    assert _derive_kind(["physical-ontology", "vocabularies", "built-form.md"]) == "scheme"


def test_derive_kind_exemplar() -> None:
    parts = ["physical-ontology", "exemplars", "chain-of-transactions.md"]
    assert _derive_kind(parts) == "exemplar"


def test_derive_kind_cross_cutting() -> None:
    parts = ["physical-ontology", "three-graph-separation.md"]
    assert _derive_kind(parts) == "cross-cutting"


def test_derive_kind_per_module_deployment() -> None:
    assert _derive_kind(["physical-database", "modules", "property.md"]) == "per-module-deployment"


def test_derive_kind_derived_profile() -> None:
    assert _derive_kind(["physical-database", "derived-profiles", "opda-inference.md"]) == "derived-profile"


def test_derive_kind_overlay_deployment() -> None:
    assert _derive_kind(["physical-database", "overlay-deployment", "baspi5.md"]) == "overlay-deployment"


def test_derive_kind_operations_dir() -> None:
    assert _derive_kind(["physical-database", "operations", "byte-identity-ci.md"]) == "operations"


def test_derive_kind_named_graphs() -> None:
    assert _derive_kind(["physical-database", "named-graphs.md"]) == "operations"


def test_derive_kind_tier_readme() -> None:
    assert _derive_kind(["concept", "readme.md"]) == "tier-readme"


def test_derive_kind_module_readme() -> None:
    assert _derive_kind(["concept", "property", "readme.md"]) == "module-readme"


# ---------------------------------------------------------------------------
# Unit: _derive_source_ttl
# ---------------------------------------------------------------------------

def test_source_ttl_concept_entity() -> None:
    parts = ["concept", "property", "property.md"]
    ttl = _derive_source_ttl(parts, "entity")
    assert ttl is not None
    assert "opda-property.ttl" in ttl


def test_source_ttl_logical_scheme() -> None:
    parts = ["logical", "agent", "enumerations", "role-scheme.md"]
    ttl = _derive_source_ttl(parts, "scheme")
    assert ttl is not None
    assert "opda-agent.ttl" in ttl


def test_source_ttl_physical_ontology_classes() -> None:
    parts = ["physical-ontology", "property", "classes.md"]
    ttl = _derive_source_ttl(parts, "entity")
    assert ttl is not None
    assert "opda-property.ttl" in ttl


def test_source_ttl_physical_ontology_shapes() -> None:
    parts = ["physical-ontology", "property", "shapes.md"]
    ttl = _derive_source_ttl(parts, "entity")
    assert ttl is not None
    assert "opda-property-shapes.ttl" in ttl


def test_source_ttl_vocabularies() -> None:
    parts = ["physical-ontology", "vocabularies", "built-form.md"]
    ttl = _derive_source_ttl(parts, "scheme")
    assert ttl is not None
    assert "opda-vocabularies.ttl" in ttl


def test_source_ttl_exemplar() -> None:
    parts = ["physical-ontology", "exemplars", "chain-of-transactions.md"]
    ttl = _derive_source_ttl(parts, "exemplar")
    assert ttl is not None
    assert "chain-of-transactions.ttl" in ttl


# ---------------------------------------------------------------------------
# Integration: emit_manual on mini tree
# ---------------------------------------------------------------------------

def test_emit_manual_returns_emit_result(mini_manual: Path) -> None:
    result = emit_manual(mini_manual)
    assert isinstance(result, EmitResult)


def test_emit_manual_skips_readmes(mini_manual: Path) -> None:
    """Tier READMEs and module READMEs must NOT be modified — G19a option c."""
    tier_readme = mini_manual / "concept" / "README.md"
    module_readme = mini_manual / "concept" / "property" / "README.md"
    original_tier = tier_readme.read_text(encoding="utf-8")
    original_module = module_readme.read_text(encoding="utf-8")

    emit_manual(mini_manual)

    assert tier_readme.read_text(encoding="utf-8") == original_tier, (
        "Tier README was modified — G19a violation"
    )
    assert module_readme.read_text(encoding="utf-8") == original_module, (
        "Module README was modified — G19a violation"
    )


def test_emit_manual_phase4_crosslinks_preserved(mini_manual: Path) -> None:
    """'See also: Modelling section' content must survive emission."""
    tier_readme = mini_manual / "concept" / "README.md"
    emit_manual(mini_manual)
    content = tier_readme.read_text(encoding="utf-8")
    assert "See also: Modelling section" in content


def test_emit_manual_entity_frontmatter_fields(mini_manual: Path) -> None:
    """Entity file gets tier, module, kind, entityUri, sourceTtl, title."""
    emit_manual(mini_manual)
    p = mini_manual / "concept" / "property" / "property.md"
    fm, _ = _parse_frontmatter(p.read_text(encoding="utf-8"))
    assert fm.get("tier") == "concept"
    assert fm.get("module") == "property"
    assert fm.get("kind") == "entity"
    assert fm.get("entityUri") == "opda:Property"
    assert fm.get("sourceTtl") is not None
    assert "opda-property.ttl" in fm["sourceTtl"]
    assert fm.get("title") == "Property"


def test_emit_manual_scheme_frontmatter_fields(mini_manual: Path) -> None:
    """Scheme file gets kind=scheme."""
    emit_manual(mini_manual)
    p = mini_manual / "logical" / "agent" / "enumerations" / "role-scheme.md"
    fm, _ = _parse_frontmatter(p.read_text(encoding="utf-8"))
    assert fm.get("kind") == "scheme"
    assert fm.get("entityUri") == "opda:RoleScheme"
    assert fm.get("tier") == "logical"


def test_emit_manual_exemplar_frontmatter_fields(mini_manual: Path) -> None:
    """Exemplar file gets kind=exemplar."""
    emit_manual(mini_manual)
    p = mini_manual / "physical-ontology" / "exemplars" / "chain-of-transactions.md"
    fm, _ = _parse_frontmatter(p.read_text(encoding="utf-8"))
    assert fm.get("kind") == "exemplar"
    assert fm.get("tier") == "physical-ontology"


def test_emit_manual_cross_cutting_frontmatter(mini_manual: Path) -> None:
    """Cross-cutting file gets kind=cross-cutting."""
    emit_manual(mini_manual)
    p = mini_manual / "physical-ontology" / "three-graph-separation.md"
    fm, _ = _parse_frontmatter(p.read_text(encoding="utf-8"))
    assert fm.get("kind") == "cross-cutting"


def test_emit_manual_deployment_frontmatter(mini_manual: Path) -> None:
    """Per-module-deployment file gets kind=per-module-deployment."""
    emit_manual(mini_manual)
    p = mini_manual / "physical-database" / "modules" / "property.md"
    fm, _ = _parse_frontmatter(p.read_text(encoding="utf-8"))
    assert fm.get("kind") == "per-module-deployment"
    assert fm.get("tier") == "physical-database"


def test_emit_manual_touched_count(mini_manual: Path) -> None:
    """All non-README in-scope files should be touched on first run."""
    result = emit_manual(mini_manual)
    # 8 in-scope files: property.md, role-scheme.md, chain-of-transactions.md,
    # three-graph-separation.md, modules/property.md, overlay-deployment/baspi5.md,
    # operations/byte-identity-ci.md, named-graphs.md
    assert result.touched_count == 8
    # 2 skipped (README.md files)
    assert result.skipped_count == 2


# ---------------------------------------------------------------------------
# Idempotency (byte-identity across two runs) — mirrors test_byte_identity.py
# ---------------------------------------------------------------------------

def test_emit_manual_idempotent(mini_manual: Path) -> None:
    """Running emit_manual twice produces byte-identical output (ADR-0020 §Confirmation #4)."""
    emit_manual(mini_manual)
    # Capture bytes after first run
    snapshots_after_first: dict[Path, bytes] = {
        p: p.read_bytes()
        for p in sorted(mini_manual.rglob("*.md"))
        if p.name != "README.md"
    }
    result2 = emit_manual(mini_manual)
    # Second run should touch no files (all frontmatter already complete)
    assert result2.touched_count == 0, (
        f"Second run modified {result2.touched_count} files — not idempotent: "
        f"{[str(p) for p in result2.touched]}"
    )
    for p, original_bytes in snapshots_after_first.items():
        assert p.read_bytes() == original_bytes, f"Bytes changed on second run: {p}"


# ---------------------------------------------------------------------------
# Existing frontmatter merge
# ---------------------------------------------------------------------------

def test_emit_manual_merge_preserves_existing_fields(tmp_path: Path) -> None:
    """Existing frontmatter fields are not overwritten; missing fields are added."""
    _make_tree(tmp_path, {
        "concept/property/property.md": (
            "---\nstatus: proposed\ndate: 2026-05-28\n---\n\n# Property\n\nBody.\n"
        ),
    })
    emit_manual(tmp_path)
    p = tmp_path / "concept" / "property" / "property.md"
    fm, _ = _parse_frontmatter(p.read_text(encoding="utf-8"))
    # Existing fields preserved
    assert fm.get("status") == "proposed"
    assert fm.get("date") is not None
    # New fields added
    assert fm.get("kind") == "entity"
    assert fm.get("tier") == "concept"


def test_emit_manual_merge_no_field_overwrite(tmp_path: Path) -> None:
    """Existing 'kind' in frontmatter is not overwritten by generator."""
    _make_tree(tmp_path, {
        "concept/property/property.md": (
            "---\nkind: custom-override\n---\n\n# Property\n\nBody.\n"
        ),
    })
    emit_manual(tmp_path)
    p = tmp_path / "concept" / "property" / "property.md"
    fm, _ = _parse_frontmatter(p.read_text(encoding="utf-8"))
    # Pre-existing 'kind' must NOT be overwritten
    assert fm["kind"] == "custom-override"


# ---------------------------------------------------------------------------
# Tier filter
# ---------------------------------------------------------------------------

def test_emit_manual_tier_filter(mini_manual: Path) -> None:
    """--tier concept processes only concept files."""
    result = emit_manual(mini_manual, tier="concept")
    touched_paths = [p.relative_to(mini_manual).parts[0] for p in result.touched]
    assert all(t == "concept" for t in touched_paths), (
        f"Non-concept files touched: {result.touched}"
    )
    assert result.touched_count >= 1


# ---------------------------------------------------------------------------
# CI-safety: _default_manual_dir + umbrella isolation (ADR-0020 G20a)
# ---------------------------------------------------------------------------

def test_default_manual_dir_is_file_relative_not_cwd(tmp_path: Path) -> None:
    """_default_manual_dir() resolves via __file__, not CWD.

    Proves R1: when CWD is an arbitrary directory (simulating CI running from
    tools/opda-gen or /tmp), the helper still returns the real docs/manual/
    path anchored to the repo root via __file__ walk — not a CWD-relative
    fallback.  Regression guard for ADR-0020 G20a.
    """
    import os
    from opda_gen.emitters.manual import _default_manual_dir

    original_cwd = os.getcwd()
    try:
        os.chdir(tmp_path)  # Move CWD away from repo — simulate CI context
        result = _default_manual_dir()
    finally:
        os.chdir(original_cwd)

    # Must resolve to the actual docs/manual/ inside the repo, not inside tmp_path
    assert result.exists(), f"_default_manual_dir() returned non-existent path: {result}"
    assert (result / "concept").exists() or result.name == "manual", (
        f"Resolved path does not look like the manual tree: {result}"
    )
    assert str(tmp_path) not in str(result), (
        f"_default_manual_dir() used CWD-relative fallback: {result}"
    )


def test_emit_umbrella_redirected_output_does_not_mutate_docs_manual(
    tmp_path: Path,
) -> None:
    """opda-gen emit --output <tmp> must not modify the committed docs/manual/.

    Proves R2: the umbrella calls emit_manual(_default_manual_dir()), which
    is idempotent (frontmatter is already committed), so git sees no changes
    in docs/manual/ after a redirected emit run.  Regression guard for
    ADR-0020 G20a umbrella integration.
    """
    import subprocess
    import sys

    from opda_gen.emitters.manual import _default_manual_dir

    manual_dir = _default_manual_dir()

    # Snapshot mtimes before running emit with a redirected --output
    before = {p: p.stat().st_mtime for p in sorted(manual_dir.rglob("*.md"))}

    result = subprocess.run(
        [sys.executable, "-m", "opda_gen.cli", "emit", "--output", str(tmp_path)],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, f"emit failed:\n{result.stderr}"

    # No .md file in docs/manual/ should have been modified
    after = {p: p.stat().st_mtime for p in sorted(manual_dir.rglob("*.md"))}
    mutated = [p for p in before if after.get(p, before[p]) != before[p]]
    assert mutated == [], (
        f"emit --output <tmp> mutated {len(mutated)} docs/manual/ file(s):\n"
        + "\n".join(str(p) for p in mutated)
    )
