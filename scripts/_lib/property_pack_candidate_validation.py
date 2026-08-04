"""Fail-closed validation for the isolated Property Pack ontology candidate."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from .property_pack_candidate import sha256


ALLOWED_STATES = {"pass", "fail", "infrastructure-error", "not-run", "not-applicable"}
FORBIDDEN_CONCERNS = (
    "businessCapability", "applicationService", "processStep", "sourceMapping",
    "dataProduct", "governancePolicy", "enterpriseArchitecture",
)


def command_version(command: Path, argument: str = "--version") -> str:
    result = subprocess.run([str(command), argument], check=False, capture_output=True, text=True)
    return (result.stdout or result.stderr).strip().splitlines()[0] if result.returncode == 0 else "unknown"


def find_jena(root: Path) -> dict[str, Path] | None:
    candidates: list[Path] = []
    if os.environ.get("JENA_HOME"):
        candidates.append(Path(os.environ["JENA_HOME"]) / "bin")
    candidates.extend(sorted((root / ".jena").glob("apache-jena-*/bin"), reverse=True))
    for binary in ("riot", "arq", "shacl"):
        found = shutil.which(binary)
        if found:
            candidates.append(Path(found).parent)
    for directory in candidates:
        commands = {name: directory / name for name in ("riot", "arq", "shacl")}
        if all(path.is_file() and os.access(path, os.X_OK) for path in commands.values()):
            return commands
    return None


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, check=False, capture_output=True, text=True, timeout=120)


def strip_version(text: str) -> str:
    return "\n".join(line for line in text.splitlines() if not line.startswith("VERSION ")) + "\n"


def expected_boolean(output: str, expected: bool) -> bool:
    normalised = output.casefold()
    if expected:
        return ("true" in normalised or "yes" in normalised) and "false" not in normalised and "no" not in normalised
    return "false" in normalised or "no" in normalised


def static_checks(out_dir: Path, model: dict[str, Any], classification: dict[str, Any]) -> list[dict[str, Any]]:
    coverage = json.loads((out_dir / "projections/coverage.json").read_text(encoding="utf-8"))
    checks: list[dict[str, Any]] = []

    def add(name: str, passed: bool, detail: str) -> None:
        checks.append({"name": name, "state": "pass" if passed else "fail", "detail": detail})

    item_ids = [entry["item_id"] for entry in coverage]
    add("exact-451-coverage", len(coverage) == 451 and len(set(item_ids)) == 451, f"{len(coverage)} unique={len(set(item_ids))}")
    add("one-semantic-home-per-item", all(entry["semantic_home"] in model["contexts"] for entry in coverage), "Every coverage row has one recognised home.")
    add("construct-reference-closure", all(entry["construct_refs"] for entry in coverage), "Every source item reaches at least one ontology resource.")
    add("topic-closure", all(entry["topic_iri"] for entry in coverage if "controlled-concept" in entry["roles"]), "Every consolidated controlled subject has a topic concept.")
    add("term-trace-closure", all(classification["term_traces"].values()), "Every ontology resource traces to source items directly or structurally.")
    add("legacy-import-exclusion", all("source/03-standards/ontology" not in path.read_text(encoding="utf-8") for path in out_dir.rglob("*.ttl")), "No current ontology path is imported.")
    rdf_text = "\n".join(path.read_text(encoding="utf-8") for path in out_dir.rglob("*.ttl"))
    add("no-owl-imports", "owl:imports" not in rdf_text, "Candidate graphs import no legacy or external ontology graph.")
    add("no-default-same-as", "owl:sameAs" not in rdf_text, "No equivalence is asserted without reviewed identity evidence.")
    forbidden = sorted(token for token in FORBIDDEN_CONCERNS if token in rdf_text)
    add("excluded-concerns", not forbidden, f"forbidden tokens={forbidden}")
    oversized = sorted(str(path.relative_to(out_dir)) for path in out_dir.rglob("*") if path.is_file() and len(path.read_text(encoding="utf-8").splitlines()) > 500)
    add("generated-file-size", not oversized, f"files over 500 lines={oversized}")
    version_errors = sorted(str(path.relative_to(out_dir)) for path in out_dir.rglob("*.ttl") if not path.read_text(encoding="utf-8").startswith('VERSION "1.2-basic"'))
    add("rdf-1.2-version-labels", not version_errors, f"missing or invalid labels={version_errors}")
    return checks


def jena_checks(out_dir: Path, root: Path) -> tuple[list[dict[str, Any]], dict[str, str]]:
    commands = find_jena(root)
    if not commands:
        return ([{
            "name": "jena-toolchain", "state": "infrastructure-error",
            "detail": "RIOT, ARQ and SHACL commands were not found; semantic validation was not inferred.",
        }], {})
    versions = {name: command_version(path) for name, path in commands.items()}
    checks: list[dict[str, Any]] = []
    turtle_files = sorted(out_dir.rglob("*.ttl"))
    for path in turtle_files:
        result = run([str(commands["riot"]), "--validate", "--syntax=turtle", str(path)])
        checks.append({
            "name": f"riot-parse:{path.relative_to(out_dir)}",
            "state": "pass" if result.returncode == 0 else "fail",
            "detail": (result.stderr or result.stdout).strip() or "RDF 1.2 Basic syntax accepted.",
        })
    with tempfile.TemporaryDirectory(prefix="opda-property-pack-validation-") as temporary:
        temp = Path(temporary)
        model_files = [path for path in turtle_files if "shapes" not in path.parts and "fixtures" not in path.parts]
        shape_files = [path for path in turtle_files if "shapes" in path.parts]
        combined_model = temp / "model.ttl"
        combined_shapes = temp / "shapes.ttl"
        combined_model.write_text("\n".join(strip_version(path.read_text(encoding="utf-8")) for path in model_files), encoding="utf-8")
        combined_shapes.write_text("\n".join(strip_version(path.read_text(encoding="utf-8")) for path in shape_files), encoding="utf-8")
        for fixture, expected in (("valid-property.ttl", True), ("invalid-property.ttl", False)):
            result = run([
                str(commands["shacl"]), "validate", "--text", "--shapes", str(combined_shapes),
                "--data", str(out_dir / "validation/fixtures" / fixture),
            ])
            observed = (result.stdout or result.stderr).strip()
            conforms = observed == "Conforms"
            passed = result.returncode == 0 and conforms is expected
            checks.append({
                "name": f"shacl-probe:{fixture}", "state": "pass" if passed else "fail",
                "detail": f"expected_conforms={str(expected).lower()} observed={observed[:500]}",
            })
        for query in sorted((out_dir / "validation/competency").glob("*.rq")):
            expected = query.name != "no-same-as.rq"
            result = run([str(commands["arq"]), "--data", str(combined_model), "--query", str(query)])
            passed = result.returncode == 0 and expected_boolean(result.stdout + result.stderr, expected)
            checks.append({
                "name": f"sparql-competency:{query.name}", "state": "pass" if passed else "fail",
                "detail": f"expected={str(expected).lower()} observed={((result.stdout or result.stderr).strip())[:500]}",
            })
    return checks, versions


def validation_report(out_dir: Path, model: dict[str, Any], classification: dict[str, Any]) -> dict[str, Any]:
    checks = static_checks(out_dir, model, classification)
    semantic_checks, versions = jena_checks(out_dir, model["root"])
    checks.extend(semantic_checks)
    states = {check["state"] for check in checks}
    if "fail" in states:
        status = "fail"
    elif "infrastructure-error" in states:
        status = "infrastructure-error"
    else:
        status = "pass"
    if not states.issubset(ALLOWED_STATES):
        raise ValueError(f"invalid validation states: {states - ALLOWED_STATES}")
    checked_files = [
        path for path in sorted(out_dir.rglob("*"))
        if path.is_file()
        and path.name != ".generated"
        and str(path.relative_to(out_dir)) not in {
            "candidate-manifest.json", "validation/report.json",
        }
    ]
    checked_tree_digest = sha256("\n".join(
        f"{path.relative_to(out_dir)} {sha256(path.read_bytes())}"
        for path in checked_files
    ))
    return {
        "schema_version": "0.1", "candidate_id": model["manifest"]["candidate_id"],
        "status": status, "candidate_status": model["manifest"]["status"],
        "source_item_count": len(classification["coverage"]),
        "tooling": versions,
        "standards_assurance": {
            "rdf_1_2_basic": "pass" if status == "pass" else status,
            "sparql_1_2_target": "portable-subset-tested" if status == "pass" else status,
            "shacl_1_2_core_target": "implementation-tested-core-subset" if status == "pass" else status,
            "rdf_1_2_full": "not-applicable",
            "shacl_1_2_union_profile": "not-applicable",
            "qualification_note": "Full RDF 1.2 and SHACL 1.2 Union conformance are not claimed by this Jena 6.1.0 compatibility run.",
        },
        "checks": checks,
        "checked_tree_digest": checked_tree_digest,
    }
