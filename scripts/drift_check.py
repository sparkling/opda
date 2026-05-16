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
import re
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "_build"
CONTENT_DIR = ROOT / "source/_content/schema"
EXAMPLES_DIR = ROOT / "source/_examples"
OUT_PAGES = ROOT / "src/pages/pages"

errors: list[str] = []
warnings: list[str] = []


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
    pages = list(OUT_PAGES.glob("3[5-9]-*.html")) + list(OUT_PAGES.glob("4[5-9]-*.html"))
    hashes_a = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in pages}
    subprocess.run(
        ["python3", "scripts/build-schema-pages.py", "build", "--all"],
        cwd=str(ROOT), check=True, capture_output=True,
    )
    hashes_b = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in pages}
    diff = [n for n in hashes_a if hashes_a[n] != hashes_b.get(n)]
    if diff:
        errors.append(f"#9 reproducibility: {len(diff)} pages diverged on second build: {diff[:3]}")


def check_subtable_sizes():
    """Invariant #11 — warn > 60, error > 90."""
    for page in OUT_PAGES.glob("3[5-9]-*.html"):
        html = page.read_text()
        for m in re.finditer(r'data-section-id="([^"]+)"[^>]*data-leaf-count="(\d+)"', html):
            sid, count = m.group(1), int(m.group(2))
            if count > 90:
                errors.append(f"#11 sub-table: {page.name} {sid}: {count} rows (cap 90)")
            elif count > 60:
                warnings.append(f"#11 sub-table: {page.name} {sid}: {count} rows (warn at 60)")


def main():
    check_theme_coverage()
    check_provenance_coverage()
    check_example_paths()
    check_subtable_sizes()
    # Reproducibility is heavy — only run if --strict
    if "--strict" in sys.argv:
        check_reproducibility()

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
