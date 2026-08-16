#!/usr/bin/env python3
"""Build and validate the 451-item Property Pack seed catalogue.

The maintained source is TOML. ``bootstrap`` is a guarded, one-time import from
the evidence workbook and legacy schema; ``generate`` projects TOML to JSON;
``check`` proves the projection is current and, when the local evidence files
are available, reconciles every source row again.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import tomllib
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from _lib.property_pack_classification import (
    classification_report, empty_model, package_for_heading, validate_classification,
)


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src/data/property-pack"
PARTS_DIR = DATA_DIR / "properties"
MANIFEST_PATH = DATA_DIR / "catalogue.toml"
JSON_PATH = DATA_DIR / "required-properties.json"
REPORT_PATH = DATA_DIR / "validation-report.json"
WORKBOOK_PATH = ROOT / "source/04-governance-bodies/working-groups/regulator/PDTF base schema.xlsx"
SCHEMA_PATH = ROOT / "source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json"
EXPECTED_COUNT = 451
PART_SIZE = 35
ALLOWED_TYPES = {"string", "boolean", "integer", "number"}
XSD_TYPES = {
    "string": "xsd:string",
    "boolean": "xsd:boolean",
    "integer": "xsd:integer",
    "number": "xsd:decimal",
}
FORMAT_TYPES = {"date": "xsd:date", "date-time": "xsd:dateTime", "time": "xsd:time"}
NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def humanise(value: str) -> str:
    value = value.replace("[]", "").replace("_", "-")
    value = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", value)
    value = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", value)
    return clean(value).replace("-", " ").capitalize()


def cell_text(cell: ET.Element, shared: list[str]) -> str:
    cell_type = cell.attrib.get("t", "")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//x:t", NS))
    node = cell.find("x:v", NS)
    if node is None or node.text is None:
        return ""
    if cell_type == "s":
        return shared[int(node.text)]
    if cell_type == "b":
        return "true" if node.text == "1" else "false"
    return node.text


def read_xlsx_rows(path: Path) -> list[list[str]]:
    if not path.is_file():
        raise FileNotFoundError(path)
    with zipfile.ZipFile(path) as archive:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = ["".join(t.text or "" for t in si.findall(".//x:t", NS)) for si in root]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    rows: list[list[str]] = []
    for row in sheet.findall(".//x:sheetData/x:row", NS):
        values = [""] * 8
        for cell in row.findall("x:c", NS):
            ref = cell.attrib.get("r", "")
            match = re.match(r"([A-Z]+)", ref)
            if not match:
                continue
            column = 0
            for char in match.group(1):
                column = column * 26 + ord(char) - 64
            if 1 <= column <= 8:
                values[column - 1] = clean(cell_text(cell, shared))
        rows.append(values)
    return rows


def required_workbook_rows(path: Path) -> list[dict[str, Any]]:
    rows = read_xlsx_rows(path)
    expected_headers = [
        "JSON Path", "Top-level Section", "Property Pack Heading", "Field Name",
        "Data Type", "Required Status", "Condition", "Title / Description",
    ]
    if not rows or rows[0] != expected_headers:
        raise ValueError(f"unexpected workbook headers: {rows[0] if rows else 'none'}")
    records: list[dict[str, Any]] = []
    for row_number, values in enumerate(rows[1:], start=2):
        if values[5].casefold() != "required":
            continue
        records.append({
            "row": row_number,
            "path": values[0],
            "top_level_section": values[1],
            "heading": values[2],
            "field_name": values[3],
            "datatype": values[4],
            "status": values[5],
            "condition": values[6],
            "description": values[7],
        })
    if len(records) != EXPECTED_COUNT:
        raise ValueError(f"expected {EXPECTED_COUNT} required rows, found {len(records)}")
    return records


def legacy_schema_index() -> dict[str, list[dict[str, Any]]]:
    sys.path.insert(0, str(ROOT / "scripts"))
    from _lib.schema_walker import walk  # pylint: disable=import-outside-toplevel

    index: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for leaf in walk(SCHEMA_PATH):
        index[leaf.path].append(leaf.to_dict())
    return index


def legacy_constraint_index() -> dict[str, list[dict[str, Any]]]:
    """Index raw schema constraints without treating them as semantic truth."""
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    index: dict[str, list[dict[str, Any]]] = defaultdict(list)
    constraint_keys = (
        "enum", "format", "pattern", "minLength", "maxLength", "minimum", "maximum",
        "minItems", "maxItems",
    )

    def visit(node: Any, path: str) -> None:
        if not isinstance(node, dict):
            return
        found = {key: node[key] for key in constraint_keys if key in node}
        if path and found:
            index[path].append(found)
        for branch in node.get("oneOf", []):
            visit(branch, path)
        for name, child in node.get("properties", {}).items():
            visit(child, f"{path}.{name}" if path else name)
        if "items" in node:
            visit(node["items"], path + "[]")

    visit(schema, "")
    return index


def unique_values(records: list[dict[str, Any]], key: str) -> list[Any]:
    result: list[Any] = []
    for record in records:
        value = record.get(key)
        values = value if isinstance(value, list) else ([value] if value not in (None, "") else [])
        for item in values:
            if item not in result:
                result.append(item)
    return result


def first_value(records: list[dict[str, Any]], key: str) -> str:
    values = unique_values(records, key)
    return clean(values[0]) if values else ""


def first_scalar(records: list[dict[str, Any]], key: str) -> Any:
    values = unique_values(records, key)
    return values[0] if values else ""


def preferred_label(row: dict[str, Any]) -> str:
    title = row["description"]
    if title and len(title) <= 80 and "?" not in title:
        return title.rstrip(".")
    if row["field_name"] == "yesNo":
        parent = row["path"].rsplit(".", 2)[-2]
        return humanise(parent)
    return humanise(row["field_name"])


def candidate_definition(row: dict[str, Any], label: str) -> str:
    title = row["description"].rstrip()
    if title:
        if title.endswith("?"):
            return f"Records the response to the source question: {title}"
        return f"The value recorded for “{title.rstrip('.')}” in the Property Pack."
    if row["field_name"] == "yesNo":
        return f"Indicates whether {label[0].lower() + label[1:]} is applicable."
    parent = humanise(row["path"].rsplit(".", 2)[-2])
    return f"Records the {label.lower()} for {parent.lower()}."


def catalogue_record(
    row: dict[str, Any],
    schema_records: list[dict[str, Any]],
    raw_constraints: list[dict[str, Any]],
) -> dict[str, Any]:
    if not schema_records:
        raise ValueError(f"required path absent from legacy schema: {row['path']}")
    schema_types = unique_values(schema_records, "type")
    if row["datatype"] not in schema_types:
        raise ValueError(f"datatype mismatch at {row['path']}: {row['datatype']} vs {schema_types}")
    enum_values = unique_values(raw_constraints, "enum") or unique_values(schema_records, "enum")
    schema_format = first_value(raw_constraints, "format") or first_value(schema_records, "format")
    label = preferred_label(row)
    conditional = bool(row["condition"])
    flags = ["model-role-unassigned", "owning-context-unassigned", "iri-unassigned"]
    if not row["description"]: flags.append("source-description-missing")
    if conditional: flags.append("condition-expression-unresolved")
    if enum_values: flags.append("controlled-vocabulary-candidate")
    if "[]" in row["path"]: flags.append("container-cardinality-needs-review")
    if row["field_name"].lower().endswith("date") and not schema_format: flags.append("date-format-needs-review")
    stable_id = "pp-" + hashlib.sha256(row["path"].encode()).hexdigest()[:12]
    return {
        "id": stable_id,
        "source": {
            "row": row["row"], "path": row["path"], "top_level_section": row["top_level_section"],
            "heading": row["heading"] or "propertyPack", "field_name": row["field_name"],
            "datatype": row["datatype"], "status": row["status"], "condition": row["condition"],
            "description": row["description"],
        },
        "semantic": {
            "preferred_label": label, "candidate_definition": candidate_definition(row, label),
            "definition_status": "machine-drafted-from-source", "source_description": row["description"],
        },
        "work_package": package_for_heading(row["heading"] or "propertyPack"),
        "model": empty_model(),
        "value": {
            "source_datatype": row["datatype"],
            "xsd_datatype": FORMAT_TYPES.get(schema_format, XSD_TYPES[row["datatype"]]),
            "min_count": 0 if conditional else 1, "max_count": 1,
            "requiredness": "conditional" if conditional else "unconditional",
            "repeatable_context": "[]" in row["path"], "occurrence_scope": "per-list-item" if "[]" in row["path"] else "per-parent-resource",
        },
        "restrictions": {
            "format": schema_format, "pattern": first_value(raw_constraints, "pattern"),
            "min_length": first_scalar(raw_constraints, "minLength"),
            "max_length": first_scalar(raw_constraints, "maxLength"),
            "minimum": first_scalar(raw_constraints, "minimum"),
            "maximum": first_scalar(raw_constraints, "maximum"),
            "permitted_values": enum_values,
        },
        "vocabulary": {"status": "candidate" if enum_values else "not-applicable", "scheme_id": "unresolved" if enum_values else "", "values": enum_values},
        "legacy_schema": {
            "matched_occurrences": len(schema_records), "title": first_value(schema_records, "title"),
            "description": first_value(schema_records, "description"), "format": schema_format,
        },
        "evidence": [f"workbook:Sheet1!A{row['row']}:H{row['row']}", f"legacy-schema:{row['path']}"],
        "review": {
            "status": "needs-semantic-review", "confidence": "low", "flags": flags,
            "approval_status": "proposed", "quality": "needs-semantic-review",
        },
    }


def toml_scalar(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, list):
        return "[" + ", ".join(toml_scalar(item) for item in value) + "]"
    raise TypeError(f"unsupported TOML value: {type(value).__name__}")


def toml_inline(table: dict[str, Any]) -> str:
    return "{ " + ", ".join(f"{key} = {toml_scalar(value)}" for key, value in table.items()) + " }"


def render_record(record: dict[str, Any]) -> str:
    lines = ["[[property]]", f"id = {toml_scalar(record['id'])}",
             f"work_package = {toml_scalar(record['work_package'])}"]
    for key in ("source", "semantic", "model", "value", "restrictions", "vocabulary", "legacy_schema"):
        lines.append(f"{key} = {toml_inline(record[key])}")
    lines.append(f"evidence = {toml_scalar(record['evidence'])}")
    lines.append(f"review = {toml_inline(record['review'])}")
    return "\n".join(lines) + "\n"


def render_manifest(fragment_names: list[str]) -> str:
    return "\n".join([
        'format_version = "1.1"',
        'title = "451 required Property Pack source properties"',
        'status = "working-baseline"',
        'maintained_source = "TOML"',
        'extracted_on = "2026-08-03"',
        f"expected_count = {EXPECTED_COUNT}",
        f'workbook_sha256 = "{digest(WORKBOOK_PATH)}"',
        f'legacy_schema_sha256 = "{digest(SCHEMA_PATH)}"',
        'workbook = "source/04-governance-bodies/working-groups/regulator/PDTF base schema.xlsx"',
        'worksheet = "Sheet1"',
        'legacy_schema = "source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json"',
        'legacy_schema_role = "Structural corroboration only; not semantic authority."',
        'approval_status = "proposed"',
        'scope_note = "The 451 rows are source data points, not 451 pre-decided ontology properties or entities."',
        'work_package_note = "Operational review batches only; not ontology modules or semantic homes."',
        'authority_note = "Complete against the workbook baseline; not evidence of final DPMSG approval."',
        f"fragments = {toml_scalar(fragment_names)}",
        "",
    ])

def bootstrap(force: bool) -> None:
    if MANIFEST_PATH.exists() and not force:
        raise FileExistsError(f"{MANIFEST_PATH} exists; bootstrap will not overwrite it without --force")
    rows = required_workbook_rows(WORKBOOK_PATH)
    schema = legacy_schema_index()
    constraints = legacy_constraint_index()
    records = [catalogue_record(row, schema[row["path"]], constraints[row["path"]]) for row in rows]
    PARTS_DIR.mkdir(parents=True, exist_ok=True)
    for old in PARTS_DIR.glob("part-*.toml"):
        old.unlink()
    names: list[str] = []
    for index in range(0, len(records), PART_SIZE):
        name = f"properties/part-{index // PART_SIZE + 1:02d}.toml"
        names.append(name)
        body = "# Generated bootstrap; curate fields in place, then run generate/check.\n\n"
        body += "\n".join(render_record(record) for record in records[index:index + PART_SIZE])
        (DATA_DIR / name).write_text(body, encoding="utf-8")
    MANIFEST_PATH.write_text(render_manifest(names), encoding="utf-8")
    generate()
    print(f"bootstrapped {len(records)} records across {len(names)} TOML fragments")

def load_catalogue() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    with MANIFEST_PATH.open("rb") as handle:
        manifest = tomllib.load(handle)
    records: list[dict[str, Any]] = []
    for name in manifest.get("fragments", []):
        path = (DATA_DIR / name).resolve()
        if DATA_DIR.resolve() not in path.parents:
            raise ValueError(f"fragment escapes catalogue directory: {name}")
        with path.open("rb") as handle:
            records.extend(tomllib.load(handle).get("property", []))
    return manifest, records

def validate(manifest: dict[str, Any], records: list[dict[str, Any]], compare_sources: bool) -> dict[str, Any]:
    errors: list[str] = []
    ids = [record.get("id") for record in records]
    paths = [record.get("source", {}).get("path") for record in records]
    rows = [record.get("source", {}).get("row") for record in records]
    array_containers = set()
    for path in paths:
        parts = path.split(".")
        array_containers.update(".".join(parts[:index + 1]) for index, part in enumerate(parts) if part.endswith("[]"))
    if len(records) != EXPECTED_COUNT:
        errors.append(f"expected {EXPECTED_COUNT} records; found {len(records)}")
    for label, values in (("id", ids), ("source path", paths), ("source row", rows)):
        duplicates = [value for value, count in Counter(values).items() if count > 1]
        if duplicates:
            errors.append(f"duplicate {label}: {duplicates[:5]}")
    for record in records:
        source, value = record.get("source", {}), record.get("value", {})
        errors.extend(validate_classification(record))
        if source.get("status") != "Required":
            errors.append(f"{record.get('id')}: source status is not Required")
        if source.get("datatype") not in ALLOWED_TYPES:
            errors.append(f"{record.get('id')}: unsupported datatype {source.get('datatype')}")
        expected_min = 0 if source.get("condition") else 1
        if value.get("min_count") != expected_min or value.get("max_count") != 1:
            errors.append(f"{record.get('id')}: cardinality does not reflect source requiredness")
        permitted = record.get("restrictions", {}).get("permitted_values", [])
        if len(permitted) != len({json.dumps(item, sort_keys=True) for item in permitted}):
            errors.append(f"{record.get('id')}: duplicate permitted value")
        if not record.get("semantic", {}).get("candidate_definition"):
            errors.append(f"{record.get('id')}: missing candidate definition")
        if not record.get("evidence"):
            errors.append(f"{record.get('id')}: missing evidence")
    fragment_lines = {}
    for name in manifest.get("fragments", []):
        count = len((DATA_DIR / name).read_text(encoding="utf-8").splitlines())
        fragment_lines[name] = count
        if count >= 500:
            errors.append(f"{name}: {count} lines exceeds the under-500-line rule")
    source_comparison: dict[str, Any] = {"performed": False}
    if compare_sources and WORKBOOK_PATH.is_file() and SCHEMA_PATH.is_file():
        workbook_rows = required_workbook_rows(WORKBOOK_PATH)
        workbook_by_path = {row["path"]: row for row in workbook_rows}
        source_comparison = {
            "performed": True,
            "workbook_sha256_matches": digest(WORKBOOK_PATH) == manifest.get("workbook_sha256"),
            "legacy_schema_sha256_matches": digest(SCHEMA_PATH) == manifest.get("legacy_schema_sha256"),
            "missing_from_catalogue": sorted(set(workbook_by_path) - set(paths)),
            "not_required_in_workbook": sorted(set(paths) - set(workbook_by_path)),
            "field_mismatches": [],
        }
        for record in records:
            row = workbook_by_path.get(record["source"]["path"])
            if not row:
                continue
            for key in ("row", "top_level_section", "heading", "field_name", "datatype", "status", "condition", "description"):
                expected = row[key] or ("propertyPack" if key == "heading" else "")
                if record["source"].get(key) != expected:
                    source_comparison["field_mismatches"].append({"id": record["id"], "field": key})
        for key in ("workbook_sha256_matches", "legacy_schema_sha256_matches"):
            if not source_comparison[key]:
                errors.append(f"source comparison failed: {key}")
        for key in ("missing_from_catalogue", "not_required_in_workbook", "field_mismatches"):
            if source_comparison[key]:
                errors.append(f"source comparison failed: {key} ({len(source_comparison[key])})")
    report = {
        "status": "pass" if not errors else "fail",
        "expected_count": EXPECTED_COUNT,
        "actual_count": len(records),
        "unique_ids": len(set(ids)),
        "unique_paths": len(set(paths)),
        "unconditional_required": sum(not bool(r["source"]["condition"]) for r in records),
        "conditional_required": sum(bool(r["source"]["condition"]) for r in records),
        "repeatable_context": sum(bool(r["value"]["repeatable_context"]) for r in records),
        "distinct_array_containers": len(array_containers),
        "source_datatypes": dict(sorted(Counter(r["source"]["datatype"] for r in records).items())),
        "unique_terminal_field_names": len({r["source"]["field_name"] for r in records}),
        "source_descriptions_present": sum(bool(r["source"]["description"]) for r in records),
        "source_descriptions_missing": sum(not bool(r["source"]["description"]) for r in records),
        "controlled_vocabulary_candidates": sum(bool(r["restrictions"]["permitted_values"]) for r in records),
        "legacy_formats": sum(bool(r["restrictions"]["format"]) for r in records),
        "legacy_min_lengths": sum(r["restrictions"]["min_length"] != "" for r in records),
        "legacy_numeric_minimums": sum(r["restrictions"]["minimum"] != "" for r in records),
        "review_statuses": dict(sorted(Counter(r["review"]["status"] for r in records).items())),
        "fragment_lines": fragment_lines,
        "source_comparison": source_comparison,
        "errors": errors,
    }
    report.update(classification_report(records))
    return report

def generated_bytes(records: list[dict[str, Any]]) -> bytes:
    return (json.dumps(records, ensure_ascii=False, separators=(",", ":")) + "\n").encode()

def report_bytes(report: dict[str, Any]) -> bytes:
    return (json.dumps(report, indent=2, ensure_ascii=False, sort_keys=True) + "\n").encode()

def generate() -> None:
    manifest, records = load_catalogue()
    report = validate(manifest, records, compare_sources=True)
    if report["status"] != "pass":
        raise ValueError("catalogue validation failed:\n- " + "\n- ".join(report["errors"]))
    JSON_PATH.write_bytes(generated_bytes(records))
    REPORT_PATH.write_bytes(report_bytes(report))
    print(f"generated {JSON_PATH.relative_to(ROOT)} ({len(records)} records)")

def check() -> None:
    manifest, records = load_catalogue()
    report = validate(manifest, records, compare_sources=True)
    if report["status"] != "pass":
        raise ValueError("catalogue validation failed:\n- " + "\n- ".join(report["errors"]))
    if not JSON_PATH.is_file() or JSON_PATH.read_bytes() != generated_bytes(records):
        raise ValueError(f"stale generated JSON: run {Path(__file__).name} generate")
    if not REPORT_PATH.is_file():
        raise ValueError(f"missing validation report: run {Path(__file__).name} generate")
    committed = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    if WORKBOOK_PATH.is_file() != SCHEMA_PATH.is_file():
        raise ValueError("source comparison evidence is incomplete")
    if not WORKBOOK_PATH.is_file():
        frozen = {"field_mismatches": [], "legacy_schema_sha256_matches": True, "missing_from_catalogue": [], "not_required_in_workbook": [], "performed": True, "workbook_sha256_matches": True}
        if committed.get("source_comparison") != frozen:
            raise ValueError("committed source comparison receipt is not a complete pass")
        report["source_comparison"] = frozen
    if REPORT_PATH.read_bytes() != report_bytes(report):
        raise ValueError(f"stale validation report: run {Path(__file__).name} generate")
    print(f"catalogue OK: {len(records)} records; JSON and validation report are current")

def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    bootstrap_parser = sub.add_parser("bootstrap")
    bootstrap_parser.add_argument("--force", action="store_true")
    sub.add_parser("generate")
    sub.add_parser("check")
    args = parser.parse_args()
    if args.command == "bootstrap":
        bootstrap(args.force)
    elif args.command == "generate":
        generate()
    else:
        check()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
