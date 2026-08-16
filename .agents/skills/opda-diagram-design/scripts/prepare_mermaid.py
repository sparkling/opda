#!/usr/bin/env python3
"""Remove only Mermaid accessibility directives unsupported by the upstream extractor."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

DIRECTIVE_RE = re.compile(r"^[ \t]*acc(Title|Descr):[^\r\n]*(?:\r?\n|$)", re.MULTILINE)
ALLOWED_NAMES = {"Title", "Descr"}


def normalize(source: str) -> tuple[str, list[str]]:
    removed: list[str] = []

    def remove(match: re.Match[str]) -> str:
        name = match.group(1)
        if name not in ALLOWED_NAMES:
            raise ValueError(f"unsupported accessibility directive acc{name}")
        removed.append(f"acc{name}")
        return ""

    normalized = DIRECTIVE_RE.sub(remove, source)
    if removed != ["accTitle", "accDescr"]:
        found = ", ".join(removed) if removed else "none"
        raise ValueError(
            "expected exactly one accTitle followed by one accDescr; "
            f"found {found}"
        )
    return normalized, removed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Strip only accTitle/accDescr before Diagram Design Mermaid extraction."
    )
    parser.add_argument("source", type=Path)
    output = parser.add_mutually_exclusive_group(required=True)
    output.add_argument("--stdout", action="store_true")
    output.add_argument("--output", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_path = args.source.resolve()
    if not source_path.is_file():
        print(f"prepare_mermaid: source is not a file: {source_path}", file=sys.stderr)
        return 2
    try:
        source = source_path.read_text(encoding="utf-8")
        normalized, _removed = normalize(source)
    except (OSError, UnicodeError, ValueError) as error:
        print(f"prepare_mermaid: {error}", file=sys.stderr)
        return 2

    if args.stdout:
        sys.stdout.write(normalized)
        return 0

    output_path = args.output.resolve()
    if output_path == source_path:
        print("prepare_mermaid: output must not overwrite the raw source", file=sys.stderr)
        return 2
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(normalized, encoding="utf-8")
    except OSError as error:
        print(f"prepare_mermaid: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
