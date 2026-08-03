#!/usr/bin/env python3
"""One-way Property Pack catalogue migration from format 1.0 to 1.1."""
from __future__ import annotations

import tomllib

import property_pack_catalogue as catalogue
from _lib.property_pack_classification import migrate_record


def main() -> int:
    with catalogue.MANIFEST_PATH.open("rb") as handle:
        manifest = tomllib.load(handle)
    if manifest.get("format_version") != "1.0":
        raise ValueError("migration requires catalogue format 1.0")
    for name in manifest["fragments"]:
        path = catalogue.DATA_DIR / name
        with path.open("rb") as handle:
            records = tomllib.load(handle).get("property", [])
        body = "# Maintained source; curate fields in place, then run generate/check.\n\n"
        body += "\n".join(
            catalogue.render_record(migrate_record(record)) for record in records
        )
        path.write_text(body, encoding="utf-8")
    text = catalogue.MANIFEST_PATH.read_text(encoding="utf-8")
    text = text.replace('format_version = "1.0"', 'format_version = "1.1"', 1)
    anchor = 'scope_note = "The 451 rows are source data points, not 451 pre-decided ontology properties or entities."\n'
    note = 'work_package_note = "Operational review batches only; not ontology modules or semantic homes."\n'
    catalogue.MANIFEST_PATH.write_text(text.replace(anchor, anchor + note, 1), encoding="utf-8")
    catalogue.generate()
    print("migrated catalogue format 1.0 to 1.1")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
