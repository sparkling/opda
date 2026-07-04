#!/usr/bin/env python3
"""Materialise PDTF JSON -> OPDA RDF via an RML mapping (RMLMapper engine).

CLI:
    run_mapping.py --mapping <rml.ttl> --data <instance.json> --out build/out.nt

RMLMapper (the Java reference implementation) is self-provisioned on first
use: downloaded + sha256-verified into the repo-root-level, gitignored
``.rmlmapper/`` cache (mirrors how Fuseki self-provisions into ``.fuseki/`` in
``scripts/build-with-data.mjs``). Every ``rml:source`` in the mapping is the
literal placeholder ``"INSTANCE.json"``; RMLMapper resolves a relative
``rml:source`` against the *mapping file's own directory* (verified
empirically), not the process cwd. So to point the same committed mapping
file at an arbitrary ``--data`` instance without touching its Turtle text,
the (unmodified) mapping is copied into a fresh temp directory alongside a
symlink literally named ``INSTANCE.json`` resolving to the chosen instance,
and RMLMapper is invoked on that copy. No text-rewriting of the mapping's
RDF is involved.

If ``mapping/functions/functions.ttl`` exists alongside the mapping, it is
passed via RMLMapper's ``-f`` (dynamic function loading) — this is how the
mapping's FNML (``fnml:functionValue``) call sites resolve their Java
implementations (see ``mapping/functions/OpdaFunctions.java``). RMLMapper
resolves a function jar's ``doap:download-page`` relative to the process cwd,
so the subprocess is run with cwd set to that functions directory.

Output is N-Triples. Importable via ``main(argv) -> int``.
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]

# RMLMapper release pin. r380 is the build-number suffix Maven's
# buildNumber.properties baked into this specific v8.1.0 release's filename —
# tied to this release, not expected to change on re-download.
RMLMAPPER_TAG = "v8.1.0"
RMLMAPPER_JAR_NAME = "rmlmapper-8.1.0-r380-all.jar"
RMLMAPPER_SHA256 = "819371d49ca47d8ffddae0f34e95f38e8eaaf588ee023e3c2c7527a14d302f58"
RMLMAPPER_DOWNLOAD_URL = (
    f"https://github.com/RMLio/rmlmapper-java/releases/download/"
    f"{RMLMAPPER_TAG}/{RMLMAPPER_JAR_NAME}"
)
RMLMAPPER_CACHE_DIR = REPO_ROOT / ".rmlmapper"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def ensure_rmlmapper() -> Path:
    """Return a verified RMLMapper jar path, downloading it if absent."""
    jar = RMLMAPPER_CACHE_DIR / RMLMAPPER_JAR_NAME
    if jar.exists() and _sha256(jar) == RMLMAPPER_SHA256:
        return jar

    RMLMAPPER_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"provisioning RMLMapper {RMLMAPPER_TAG} -> {jar}", file=sys.stderr)
    # curl (not urllib): relies on the system CA store, sidestepping Python's
    # own (sometimes absent, e.g. python.org macOS installs) cert bundle.
    tmp_jar = jar.with_suffix(".jar.tmp")
    subprocess.run(
        ["curl", "-sL", "--fail", "-o", str(tmp_jar), RMLMAPPER_DOWNLOAD_URL],
        check=True,
    )
    digest = _sha256(tmp_jar)
    if digest != RMLMAPPER_SHA256:
        tmp_jar.unlink(missing_ok=True)
        raise RuntimeError(
            f"RMLMapper download sha256 mismatch: expected {RMLMAPPER_SHA256}, got {digest}"
        )
    tmp_jar.rename(jar)
    return jar


def ensure_function_jar(functions_dir: Path) -> None:
    """Compile OpdaFunctions.java if its .jar is missing or stale."""
    java_src = functions_dir / "OpdaFunctions.java"
    class_file = functions_dir / "OpdaFunctions.class"
    jar_file = functions_dir / "OpdaFunctions.jar"
    if not java_src.exists():
        return
    if jar_file.exists() and jar_file.stat().st_mtime >= java_src.stat().st_mtime:
        return
    subprocess.run(["javac", java_src.name], cwd=functions_dir, check=True)
    subprocess.run(["jar", "cf", jar_file.name, class_file.name], cwd=functions_dir, check=True)


def _stage_mapping(mapping_ttl: Path, data: Path, workdir: Path) -> Path:
    """Copy `mapping_ttl` unmodified into `workdir`, alongside an INSTANCE.json
    symlink resolving to `data` (see module docstring for why this works)."""
    temp_ttl = workdir / mapping_ttl.name
    shutil.copy(mapping_ttl, temp_ttl)
    (workdir / "INSTANCE.json").symlink_to(data.resolve())
    return temp_ttl


def run(mapping: Path, data: Path | None, out: Path) -> int:
    """Materialise `mapping` (+ `data`) to N-Triples at `out`. Returns 0 on success."""
    if not mapping.exists():
        print(f"error: mapping not found: {mapping}", file=sys.stderr)
        return 2
    if data is None:
        print("error: --data is required", file=sys.stderr)
        return 2
    if not data.exists():
        print(f"error: data not found: {data}", file=sys.stderr)
        return 2

    out.parent.mkdir(parents=True, exist_ok=True)
    jar = ensure_rmlmapper()

    functions_dir = mapping.parent / "functions"
    functions_ttl = functions_dir / "functions.ttl"
    run_cwd = REPO_ROOT
    extra_args: list[str] = []
    if functions_ttl.exists():
        ensure_function_jar(functions_dir)
        extra_args = ["-f", "functions.ttl"]
        run_cwd = functions_dir

    with tempfile.TemporaryDirectory(prefix="rmlmapper-") as tmp:
        temp_ttl = _stage_mapping(mapping, data, Path(tmp))
        cmd = [
            "java", "-jar", str(jar.resolve()),
            "-m", str(temp_ttl.resolve()),
            "-s", "ntriples",
            "-o", str(out.resolve()),
            *extra_args,
        ]
        result = subprocess.run(cmd, cwd=run_cwd, capture_output=True, text=True)

    if result.returncode != 0 or not out.exists():
        sys.stderr.write(result.stdout)
        sys.stderr.write(result.stderr)
        print(f"error: RMLMapper failed (exit {result.returncode})", file=sys.stderr)
        return result.returncode or 1

    n_triples = sum(1 for _ in out.open(encoding="utf-8") if _.strip())
    print(f"materialised {n_triples} triples -> {out}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mapping",
        required=True,
        type=Path,
        help="RML mapping (.ttl)",
    )
    parser.add_argument(
        "--data",
        type=Path,
        default=None,
        help="PDTF JSON instance",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("build/out.nt"),
        help="output N-Triples file (default: build/out.nt)",
    )
    args = parser.parse_args(argv)
    return run(args.mapping, args.data, args.out)


if __name__ == "__main__":
    raise SystemExit(main())
