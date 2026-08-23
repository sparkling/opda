#!/usr/bin/env python3
"""Schema-section drift checker. Validates spec §10 invariants over the most
recent build artefacts. Exit non-zero on failure.

Currently enforced:
  #2  Theme coverage         — every leaf maps to a page (no orphans except $schema)
  #3  Provenance coverage    — every leaf has a kind
  #6  Example-path resolution — every ${path} in sidecar resolves in BOTH examples
  #9  Reproducibility        — rebuild produces bit-identical HTML
  #11 Sub-table size         — > 60 warn, > 90 error

Run after `build-schema-pages.py build --all`.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "_build"
CONTENT_DIR = ROOT / "source/_content/schema"
EXAMPLES_DIR = ROOT / "source/_examples"
SCHEMA_PAGE_ROOT = Path("src/pages/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema")
OUT_PAGES = ROOT / SCHEMA_PAGE_ROOT

# These are checked before reading any build artefact. The canonical dictionary
# and upstream PDTF schema are gitignored inputs, while the remaining files
# are the build products required by this checker. A clean checkout without
# the input bundle must be reported as unavailable, never as a passing drift
# check or an opaque traceback.
REQUIRED_SCHEMA_INPUTS = (
    Path("source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json"),
    Path("source/00-deliverables/semantic-models/data-dictionary-canonical.json"),
    Path("source/00-deliverables/semantic-models/provenance-map.yaml"),
    Path("source/00-deliverables/semantic-models/theme-map.yaml"),
    Path("source/_content/schema"),
    Path("source/_examples/flat-london.json"),
    Path("source/_examples/semi-manchester.json"),
    Path("_build/leaves.json"),
)

REQUIRED_DERIVED_INPUTS = (
    Path("_build/classified.json"),
    Path("_build/orphans.json"),
)

errors: list[str] = []
warnings: list[str] = []


def missing_required_inputs(root: Path = ROOT) -> list[Path]:
    """Return absent schema inputs/artifacts, including an empty content dir."""
    missing = []
    for relative in REQUIRED_SCHEMA_INPUTS:
        path = root / relative
        if relative == Path("source/_content/schema"):
            if not path.is_dir() or not any(path.glob("*.md")):
                missing.append(relative)
        elif not path.is_file():
            missing.append(relative)
    return missing


def generated_page_files(root: Path = ROOT) -> list[Path]:
    """Return every generated Astro page, preserving nested relative paths."""
    pages_root = root / SCHEMA_PAGE_ROOT
    return sorted(path for path in pages_root.rglob("*.astro") if path.is_file())


def source_date_epoch_error() -> str | None:
    """Validate the reproducibility input without importing the generator."""
    value = os.environ.get("SOURCE_DATE_EPOCH")
    if value is None:
        return "SOURCE_DATE_EPOCH is required for strict reproducibility"
    if not re.fullmatch(r"[0-9]+", value.strip()):
        return "SOURCE_DATE_EPOCH must be a non-negative Unix epoch integer"
    try:
        # Keep this bound platform-independent and aligned with ISO year 9999.
        if int(value.strip(), 10) > 253402300799:
            return "SOURCE_DATE_EPOCH is outside the supported UTC date range"
    except ValueError:
        return "SOURCE_DATE_EPOCH must be a non-negative Unix epoch integer"
    return None


def check_theme_coverage():
    """Invariant #2 — orphans should be empty (except meta-paths)."""
    orphans = json.loads((BUILD / "orphans.json").read_text())
    real = [o for o in orphans if not o["path"].startswith("$")]
    if real:
        errors.append(f"#2 theme-coverage: {len(real)} unmapped leaves (e.g. {real[0]['path']})")


def check_provenance_coverage():
    """Invariant #3 — every leaf has a kind."""
    classified = json.loads((BUILD / "classified.json").read_text())
    unclassified = [c for c in classified if not c.get("kind")]
    if unclassified:
        errors.append(f"#3 provenance-coverage: {len(unclassified)} unclassified leaves")


def check_example_paths():
    """Invariant #6 — every ${path} cited in sidecar resolves in BOTH examples."""
    london = json.loads((EXAMPLES_DIR / "flat-london.json").read_text())
    semi = json.loads((EXAMPLES_DIR / "semi-manchester.json").read_text())

    def resolve(data, path):
        parts = re.findall(r"[^.\[\]]+|\[\d+\]", path)
        cur = data
        for part in parts:
            if part.startswith("["):
                try: cur = cur[int(part[1:-1])]
                except (IndexError, TypeError, ValueError): return None
            elif isinstance(cur, dict): cur = cur.get(part)
            else: return None
            if cur is None: return None
        return cur

    for md in CONTENT_DIR.glob("*.md"):
        text = md.read_text()
        for m in re.finditer(r"\$\{([^}]+)\}", text):
            tok = m.group(1).strip()
            if ":" in tok:
                prefix, path = tok.split(":", 1)
                prefix = prefix.strip().lower(); path = path.strip()
                target = london if prefix in ("london", "flat") else semi
                if resolve(target, path) is None:
                    errors.append(f"#6 example-path: {md.name}: ${{{tok}}} unresolved")
            else:
                if resolve(london, tok) is None and resolve(semi, tok) is None:
                    errors.append(f"#6 example-path: {md.name}: ${{{tok}}} unresolved")


def check_reproducibility():
    """Invariant #9 — second build produces identical HTML."""
    pages_a = generated_page_files()
    if not pages_a:
        errors.append(
            "#9 reproducibility: no generated pages found under "
            f"{SCHEMA_PAGE_ROOT.as_posix()}"
        )
        return
    hashes_a = {
        p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in pages_a
    }
    try:
        subprocess.run(
            ["python3", "scripts/build-schema-pages.py", "build", "--all"],
            cwd=str(ROOT), check=True, capture_output=True, text=True,
        )
    except subprocess.CalledProcessError as exc:
        output = (exc.stderr or exc.stdout or "").strip()
        detail = output.splitlines()[-1] if output else "generator failed"
        errors.append(f"#9 reproducibility: generator failed: {detail}")
        return
    hashes_b = {
        p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in generated_page_files()
    }
    changed = sorted(name for name in hashes_a if hashes_a[name] != hashes_b.get(name))
    added_or_removed = sorted(set(hashes_a) ^ set(hashes_b))
    if changed or added_or_removed:
        errors.append(
            f"#9 reproducibility: {len(changed) + len(added_or_removed)} pages changed "
            f"on second build: {(changed + added_or_removed)[:3]}"
        )


def check_subtable_sizes():
    """Invariant #11 — warn > 60, error > 90."""
    for page in generated_page_files():
        html = page.read_text()
        for m in re.finditer(r'data-section-id="([^"]+)"[^>]*data-leaf-count="(\d+)"', html):
            sid, count = m.group(1), int(m.group(2))
            if count > 90:
                errors.append(f"#11 sub-table: {page.name} {sid}: {count} rows (cap 90)")
            elif count > 60:
                warnings.append(f"#11 sub-table: {page.name} {sid}: {count} rows (warn at 60)")


def main():
    strict = "--strict" in sys.argv
    missing = missing_required_inputs()
    if not strict:
        missing.extend(path for path in REQUIRED_DERIVED_INPUTS if not (ROOT / path).is_file())
    if missing:
        print("=== drift check === status=UNAVAILABLE")
        print("  UNAVAILABLE required schema inputs/artifacts are absent:")
        for relative in missing:
            print(f"    - {relative}")
        sys.exit(2)

    if strict:
        date_error = source_date_epoch_error()
        if date_error:
            print("=== drift check === status=UNAVAILABLE")
            print(f"  UNAVAILABLE {date_error}")
            sys.exit(2)

    # Strict mode regenerates the derived build artefacts and schema pages
    # before the coverage checks consume them. This keeps a clean checkout
    # fail-closed without requiring ignored intermediates to be pre-populated.
    if strict:
        check_reproducibility()
    check_theme_coverage()
    check_provenance_coverage()
    check_example_paths()
    check_subtable_sizes()

    print(f"=== drift check ===  errors={len(errors)}  warnings={len(warnings)}")
    for e in errors:
        print(f"  ERR  {e}")
    for w in warnings[:5]:
        print(f"  warn {w}")
    if len(warnings) > 5:
        print(f"  ... {len(warnings) - 5} more warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
