"""
Module manual.

Realises:
- ADR-0020 §"Decision Outcome" — `emit_manual(output_dir, *, tier=None)`
  walks docs/manual/ and inserts or merges collection-valid YAML frontmatter
  into in-scope markdown files, matching the Zod schema declared in ADR-0016
  (`src/content.config.ts`).

Scope decision (G19a — option c):
  Tier READMEs, module READMEs, and the umbrella README / VALIDATION-REPORT
  are excluded from generator scope.  Their content is editorial framing not
  mechanically derivable from TTLs; Phase 4 added bidirectional "See also:
  Modelling section" blocks that must not be overwritten.  The generator
  focuses on entity / scheme / exemplar / cross-cutting / per-module-
  deployment / derived-profile / overlay-deployment / operations files where
  frontmatter addition is purely mechanical.

Path-to-kind heuristic (mirrors `deriveKind` in src/lib/manual.ts):
  - <tier>/readme                          → tier-readme    (SKIP)
  - <tier>/<module>/readme                 → module-readme  (SKIP)
  - <tier>/<module>/<sub>/readme           → module-readme  (SKIP)
  - physical-database/modules/*            → per-module-deployment
  - physical-database/derived-profiles/*   → derived-profile
  - physical-database/overlay-deployment/* → overlay-deployment
  - physical-database/named-graphs, content-negotiation/*, operations/*
                                           → operations
  - physical-ontology/exemplars/*          → exemplar
  - physical-ontology/vocabularies/*       → scheme
  - physical-ontology/{three-graph-separation,severity-tiers,shacl-af-rules}
                                           → cross-cutting
  - logical/**enumerations/*               → scheme
  - everything else                        → entity

sourceTtl mapping:
  entity/scheme in concept or logical tier → source/03-standards/ontology/opda-<module>.ttl
  physical-ontology/<module>/classes.md    → opda-<module>.ttl
  physical-ontology/<module>/shapes.md     → opda-<module>-shapes.ttl
  physical-ontology/<module>/annotations.md→ opda-<module>-annotations.ttl
  physical-ontology/vocabularies/*         → opda-vocabularies.ttl
  physical-ontology/exemplars/*            → source/03-standards/ontology/exemplars/<stem>.ttl
  physical-database/modules/*              → opda-<stem>.ttl (+ shapes + annotations)
  others                                   → None (omit field)
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import yaml

# ---------------------------------------------------------------------------
# Public types
# ---------------------------------------------------------------------------

TIERS = frozenset(["concept", "logical", "physical-database", "physical-ontology"])

MODULES = frozenset(
    ["foundation", "property", "agent", "transaction", "claim", "governance", "descriptive"]
)

# Files to skip entirely (not in generator scope)
_SKIP_NAMES = frozenset(["README.md", "VALIDATION-REPORT.md"])

# Cross-cutting stems in physical-ontology
_CROSS_CUTTING_STEMS = frozenset(
    ["three-graph-separation", "severity-tiers", "shacl-af-rules"]
)

# Source TTL root (relative to repo root; emitter detects repo root)
_ONTOLOGY_DIR = Path("source/03-standards/ontology")


@dataclass
class EmitResult:
    """Summary returned by emit_manual."""

    touched: list[Path] = field(default_factory=list)
    skipped: list[Path] = field(default_factory=list)

    @property
    def touched_count(self) -> int:
        return len(self.touched)

    @property
    def skipped_count(self) -> int:
        return len(self.skipped)


# ---------------------------------------------------------------------------
# Path analysis helpers
# ---------------------------------------------------------------------------

def _relative_parts(path: Path, manual_root: Path) -> list[str]:
    """Return path parts relative to manual_root, all lowercase."""
    rel = path.relative_to(manual_root)
    return [p.lower() for p in rel.parts]


def _derive_tier(parts: list[str]) -> Optional[str]:
    if parts and parts[0] in TIERS:
        return parts[0]
    return None


def _derive_module(parts: list[str]) -> Optional[str]:
    """Return module name if parts[1] is a known module (or sub-path under one)."""
    if len(parts) >= 2 and parts[1] in MODULES:
        return parts[1]
    return None


def _is_readme(parts: list[str]) -> bool:
    return parts[-1] == "readme.md"


def _derive_kind(parts: list[str]) -> str:
    """Mirror deriveKind from src/lib/manual.ts (operates on lowercased parts)."""
    tier = parts[0] if parts else ""
    without_tier = parts[1:]

    if _is_readme(parts):
        # Tier readme or module readme — both excluded
        return "tier-readme" if len(without_tier) == 1 else "module-readme"

    if tier == "physical-database":
        if without_tier and without_tier[0] == "modules":
            return "per-module-deployment"
        if without_tier and without_tier[0] == "derived-profiles":
            return "derived-profile"
        if without_tier and without_tier[0] == "overlay-deployment":
            return "overlay-deployment"
        if (
            parts[-1] == "named-graphs.md"
            or (without_tier and without_tier[0] in ("content-negotiation", "operations"))
        ):
            return "operations"

    if tier == "physical-ontology":
        if without_tier and without_tier[0] == "exemplars":
            return "exemplar"
        if without_tier and without_tier[0] == "vocabularies":
            return "scheme"
        stem = parts[-1].replace(".md", "")
        if stem in _CROSS_CUTTING_STEMS:
            return "cross-cutting"
        if without_tier and without_tier[0] == "profiles":
            return "overlay-deployment"

    if "enumerations" in parts:
        return "scheme"

    return "entity"


def _slug_to_pascal(slug: str) -> str:
    """Convert a kebab-case slug to PascalCase: 'role-mixin' → 'RoleMixin'."""
    return "".join(w.capitalize() for w in slug.split("-"))


def _derive_entity_uri(parts: list[str], kind: str) -> Optional[str]:
    """Derive opda:<LocalName> URI from the file stem for entity/scheme/exemplar."""
    if kind not in ("entity", "scheme", "exemplar"):
        return None
    stem = parts[-1].replace(".md", "")
    # Strip scheme suffix for logical/concept enumerations: 'role-scheme' → 'RoleScheme'
    return f"opda:{_slug_to_pascal(stem)}"


def _derive_source_ttl(parts: list[str], kind: str) -> Optional[str]:
    """Derive the canonical source TTL path for a file."""
    tier = parts[0] if parts else ""
    without_tier = parts[1:]
    base = _ONTOLOGY_DIR

    if tier in ("concept", "logical") and kind in ("entity", "scheme"):
        mod = _derive_module(parts)
        if mod:
            return str(base / f"opda-{mod}.ttl")
        return None

    if tier == "physical-ontology":
        if kind == "exemplar":
            stem = parts[-1].replace(".md", "")
            return str(base / "exemplars" / f"{stem}.ttl")
        if kind == "scheme":
            return str(base / "opda-vocabularies.ttl")
        if kind == "cross-cutting":
            return None
        # physical-ontology/<module>/classes|shapes|annotations
        if without_tier and without_tier[0] in MODULES:
            mod = without_tier[0]
            suffix_part = parts[-1].replace(".md", "")
            if suffix_part == "classes":
                return str(base / f"opda-{mod}.ttl")
            if suffix_part == "shapes":
                return str(base / f"opda-{mod}-shapes.ttl")
            if suffix_part == "annotations":
                return str(base / f"opda-{mod}-annotations.ttl")
            if suffix_part == "meta-shapes":
                return str(base / "opda-shapes.ttl")
        if kind == "overlay-deployment":
            stem = parts[-1].replace(".md", "")
            return str(base / "profiles" / f"{stem}.ttl")

    if tier == "physical-database" and kind == "per-module-deployment":
        stem = parts[-1].replace(".md", "")
        return str(base / f"opda-{stem}.ttl")

    return None


def _extract_title_from_body(body: str) -> Optional[str]:
    """Extract first H1 from markdown body."""
    m = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    return m.group(1).strip() if m else None


# ---------------------------------------------------------------------------
# Frontmatter read / write helpers
# ---------------------------------------------------------------------------

_FM_PATTERN = re.compile(r"^---\n(.*?\n)---\n", re.DOTALL)


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """Return (frontmatter_dict, body_text). body_text includes leading newlines."""
    m = _FM_PATTERN.match(text)
    if m:
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except yaml.YAMLError:
            fm = {}
        return fm, text[m.end():]
    return {}, text


def _serialise_frontmatter(fm: dict) -> str:
    """Serialise frontmatter dict to YAML block (without leading/trailing ---)."""
    # Use default_flow_style=False for block style; sort keys for determinism.
    return yaml.dump(fm, default_flow_style=False, allow_unicode=True, sort_keys=True)


def _build_file_content(fm: dict, body: str) -> str:
    """Combine frontmatter and body into a full markdown file string."""
    fm_yaml = _serialise_frontmatter(fm)
    # Ensure exactly one blank line between frontmatter and body
    body_stripped = body.lstrip("\n")
    return f"---\n{fm_yaml}---\n\n{body_stripped}"


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def _compute_frontmatter(
    path: Path, manual_root: Path
) -> Optional[dict]:
    """Compute the target frontmatter dict for one file.

    Returns None if the file should be skipped.
    """
    parts = _relative_parts(path, manual_root)

    # Skip non-tier files (e.g. README.md, VALIDATION-REPORT.md at root)
    if not parts:
        return None
    if _derive_tier(parts) is None:
        return None
    if _is_readme(parts):
        return None

    kind = _derive_kind(parts)
    # Skip tier-readme and module-readme (G19a option c)
    if kind in ("tier-readme", "module-readme"):
        return None

    tier = _derive_tier(parts)
    module = _derive_module(parts)
    entity_uri = _derive_entity_uri(parts, kind)
    source_ttl = _derive_source_ttl(parts, kind)

    result: dict = {"kind": kind, "tier": tier}
    if module is not None:
        result["module"] = module
    if entity_uri is not None:
        result["entityUri"] = entity_uri
    if source_ttl is not None:
        result["sourceTtl"] = source_ttl

    return result


def _process_file(path: Path, manual_root: Path) -> bool:
    """Add/merge frontmatter in one file. Returns True if file was written."""
    new_fields = _compute_frontmatter(path, manual_root)
    if new_fields is None:
        return False

    text = path.read_text(encoding="utf-8")
    existing_fm, body = _parse_frontmatter(text)

    # Derive title from body if not already in frontmatter
    if "title" not in existing_fm:
        title = _extract_title_from_body(body)
        if title:
            new_fields["title"] = title

    # Merge: new_fields fills in missing keys; existing keys are preserved
    merged = {**new_fields, **existing_fm}

    new_text = _build_file_content(merged, body)
    if new_text == text:
        return False

    path.write_text(new_text, encoding="utf-8", newline="")
    return True


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _default_manual_dir() -> Path:
    """Resolve docs/manual/ relative to the OPDA repo root."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "docs" / "manual").exists():
            return parent / "docs" / "manual"
    return Path.cwd() / "docs" / "manual"


def emit_manual(
    output_dir: Path,
    *,
    tier: Optional[str] = None,
) -> EmitResult:
    """Emit collection-valid frontmatter to manual markdowns under output_dir.

    Walks `output_dir` for `.md` files. For each in-scope file (per ADR-0020
    scope decision — option c), derives YAML frontmatter fields and either
    inserts a new frontmatter block or merges missing fields into the existing
    one. Body content is never modified. Idempotent: a second run produces
    zero changes if frontmatter is already complete.

    Args:
        output_dir: Root of the manual directory tree (defaults to docs/manual/).
        tier:       Optional filter — process only the named tier
                    (concept / logical / physical-database / physical-ontology).
    Returns:
        EmitResult with lists of touched and skipped paths.
    """
    result = EmitResult()

    for md_file in sorted(output_dir.rglob("*.md")):
        # Skip files not in generator scope by name
        if md_file.name in _SKIP_NAMES:
            result.skipped.append(md_file)
            continue

        # Apply tier filter if requested
        if tier is not None:
            parts = _relative_parts(md_file, output_dir)
            if not parts or parts[0] != tier:
                result.skipped.append(md_file)
                continue

        written = _process_file(md_file, output_dir)
        if written:
            result.touched.append(md_file)
        else:
            result.skipped.append(md_file)

    return result
