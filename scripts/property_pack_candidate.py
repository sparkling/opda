#!/usr/bin/env python3
"""Generate and verify the isolated Property Pack ontology candidate corpus."""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any

from _lib.property_pack_candidate import (
    build_classification, canonical_json, load_model, sha256,
)
from _lib.property_pack_candidate_rdf import build_static_outputs
from _lib.property_pack_candidate_validation import validation_report


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "source/03-standards/ontology-candidates/property-pack/0.1"
MARKER = "generated-by=scripts/property_pack_candidate.py\n"


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def prepare_output(path: Path) -> None:
    if path.exists():
        marker = path / ".generated"
        if not marker.is_file() or marker.read_text(encoding="utf-8") != MARKER:
            raise ValueError(f"refusing to replace non-generated directory: {path}")
        shutil.rmtree(path)
    path.mkdir(parents=True)
    write_text(path / ".generated", MARKER)


def source_inputs(model: dict[str, Any]) -> list[dict[str, str]]:
    manifest = model["manifest"]
    paths = [model["config_dir"] / "manifest.toml", model["root"] / manifest["catalogue_path"]]
    paths.extend(model["config_dir"] / relative for relative in manifest["context_fragments"])
    paths.extend(model["config_dir"] / relative for relative in manifest["rules_fragments"])
    paths.append(model["config_dir"] / manifest["vocabulary_fragment"])
    return [{
        "path": str(path.relative_to(model["root"])), "sha256": sha256(path.read_bytes()),
    } for path in sorted(set(paths))]


def candidate_manifest(out_dir: Path, model: dict[str, Any], classification: dict[str, Any]) -> dict[str, Any]:
    files = [{
        "path": str(path.relative_to(out_dir)), "sha256": sha256(path.read_bytes()), "bytes": path.stat().st_size,
    } for path in sorted(out_dir.rglob("*")) if path.is_file() and path.name not in {".generated", "candidate-manifest.json"}]
    home_counts: dict[str, int] = {}
    for entry in classification["coverage"]:
        home_counts[entry["semantic_home"]] = home_counts.get(entry["semantic_home"], 0) + 1
    return {
        "schema_version": "0.1", "candidate_id": model["manifest"]["candidate_id"],
        "candidate_version": model["manifest"]["candidate_version"],
        "candidate_status": model["manifest"]["status"], "publication_status": "local-review-only",
        "base_iri": model["manifest"]["base_iri"], "source_item_count": len(classification["coverage"]),
        "ontology_resource_count": len(model["terms"]), "semantic_home_counts": dict(sorted(home_counts.items())),
        "source_inputs": source_inputs(model), "files": files,
        "tree_digest": sha256("\n".join(f"{entry['path']} {entry['sha256']}" for entry in files)),
        "authority_note": "Machine-proposed candidate. OPDA working-group review and recorded human disposition are required.",
    }


def generate_to(out_dir: Path) -> dict[str, Any]:
    model = load_model(ROOT)
    classification = build_classification(model)
    prepare_output(out_dir)
    for relative, text in build_static_outputs(model, classification).items():
        write_text(out_dir / relative, text)
    report = validation_report(out_dir, model, classification)
    write_text(out_dir / "validation/report.json", canonical_json(report))
    manifest = candidate_manifest(out_dir, model, classification)
    write_text(out_dir / "candidate-manifest.json", canonical_json(manifest))
    if report["status"] != "pass":
        raise ValueError(f"candidate validation did not pass: {report['status']}")
    return manifest


def file_map(path: Path) -> dict[str, bytes]:
    return {
        str(item.relative_to(path)): item.read_bytes()
        for item in sorted(path.rglob("*")) if item.is_file() and item.name != ".generated"
    }


def check(out_dir: Path) -> None:
    if not out_dir.is_dir():
        raise ValueError(f"candidate output is missing: {out_dir}")
    with tempfile.TemporaryDirectory(prefix="opda-property-pack-candidate-") as temporary:
        expected_dir = Path(temporary) / "0.1"
        generate_to(expected_dir)
        expected = file_map(expected_dir)
        actual = file_map(out_dir)
    missing = sorted(set(expected) - set(actual))
    extra = sorted(set(actual) - set(expected))
    changed = sorted(path for path in expected.keys() & actual.keys() if expected[path] != actual[path])
    if missing or extra or changed:
        raise ValueError(f"candidate drift: missing={missing} extra={extra} changed={changed}")
    report = json.loads((out_dir / "validation/report.json").read_text(encoding="utf-8"))
    if report["status"] != "pass":
        raise ValueError(f"committed validation status is {report['status']}")
    print(f"candidate OK: {len(actual)} files; tree={json.loads((out_dir / 'candidate-manifest.json').read_text())['tree_digest']}")


def validate_existing(out_dir: Path) -> None:
    model = load_model(ROOT)
    classification = build_classification(model)
    report = validation_report(out_dir, model, classification)
    committed = json.loads((out_dir / "validation/report.json").read_text(encoding="utf-8"))
    if report != committed:
        raise ValueError("validation receipt drift; regenerate the candidate")
    if report["status"] != "pass":
        raise ValueError(f"candidate validation did not pass: {report['status']}")
    print(f"candidate validation OK: {len(report['checks'])} checks")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("generate", "check", "validate"))
    parser.add_argument("--output", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    out_dir = args.output.resolve()
    if args.command == "generate":
        manifest = generate_to(out_dir)
        print(f"generated {manifest['source_item_count']}-item candidate at {out_dir}")
    elif args.command == "check":
        check(out_dir)
    else:
        validate_existing(out_dir)


try:
    main()
except Exception as error:  # noqa: BLE001 - CLI boundary must fail closed with one diagnostic
    print(error, file=sys.stderr)
    raise SystemExit(1) from error
