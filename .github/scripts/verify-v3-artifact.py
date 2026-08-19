#!/usr/bin/env python3
"""Fail-closed verification for an untrusted /v3 preview build artifact."""

from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import re
import sys

MANIFEST_NAME = "_preview-manifest.json"
TEXT_EXTENSIONS = {".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".txt", ".webmanifest", ".xml"}
SOURCE_SHA = re.compile(r"^[a-f0-9]{40}$")
QUOTED_ROOT = re.compile(r'''(["'`])(/(?!/)[^"'`<>\r\n]*)\1''')
CSS_ROOT = re.compile(r"url\(\s*(/(?!/)[^)\s]+)\s*\)", re.IGNORECASE)
REFRESH_ROOT = re.compile(r'''\burl\s*=\s*(/(?!/)[^\s"'>]+)''', re.IGNORECASE)
SITE_ORIGIN_ROOT = re.compile(r"https://opda\.org\.uk/(?!v3(?:/|<|$))")


def digest_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def allowed_root_url(value: str) -> bool:
    if value == "/v3" or value.startswith("/v3/"):
        return True
    if value.startswith("/resources/"):
        return True
    return any(value == prefix or value.startswith(f"{prefix}/") for prefix in ("/_auth", "/api", "/comments"))


class PreviewHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root_urls: list[str] = []
        self.noindex = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name.lower(): value or "" for name, value in attrs}
        if tag.lower() == "meta" and values.get("name", "").lower() == "robots":
            self.noindex = "noindex" in values.get("content", "").lower()
        for name in ("href", "src", "action", "poster", "formaction", "xlink:href", "data-src", "data-href", "data-url"):
            value = values.get(name, "")
            if value.startswith("/") and not value.startswith("//"):
                self.root_urls.append(value)
        for candidate in values.get("srcset", "").split(","):
            value = candidate.strip().split(maxsplit=1)[0] if candidate.strip() else ""
            if value.startswith("/") and not value.startswith("//"):
                self.root_urls.append(value)


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ValueError(f"cannot read valid JSON from {path}: {error}") from error
    if not isinstance(value, dict):
        raise ValueError(f"expected a JSON object in {path}")
    return value


def safe_record_path(root: Path, raw: object) -> Path:
    if not isinstance(raw, str):
        raise ValueError("receipt file path must be a string")
    relative = PurePosixPath(raw)
    if relative.is_absolute() or not relative.parts or any(part in {"", ".", ".."} for part in relative.parts):
        raise ValueError(f"unsafe receipt path: {raw!r}")
    target = root.joinpath(*relative.parts)
    resolved = target.resolve()
    if root != resolved and root not in resolved.parents:
        raise ValueError(f"receipt path escapes artifact root: {raw!r}")
    return target


def verify_prefix_boundaries(root: Path, files: list[dict]) -> None:
    failures: list[str] = []
    for record in files:
        relative = str(record["path"])
        path = root.joinpath(*PurePosixPath(relative).parts)
        if path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError as error:
            raise ValueError(f"declared text artifact is not UTF-8: {relative}") from error
        for pattern in (QUOTED_ROOT, CSS_ROOT, REFRESH_ROOT):
            value_group = 2 if pattern is QUOTED_ROOT else 1
            for match in pattern.finditer(source):
                value = match.group(value_group)
                if not allowed_root_url(value):
                    failures.append(f"{relative}: {value}")
        if relative.endswith(".html"):
            parser = PreviewHtmlParser()
            parser.feed(source)
            if not parser.noindex:
                failures.append(f"{relative}: missing noindex,nofollow boundary")
            for value in parser.root_urls:
                if not allowed_root_url(value):
                    failures.append(f"{relative}: {value}")
        if relative == "robots.txt" or re.fullmatch(r"sitemap(?:-index|-\d+)?\.xml", relative):
            if SITE_ORIGIN_ROOT.search(source):
                failures.append(f"{relative}: unprefixed opda.org.uk URL")
    if failures:
        shown = "\n".join(sorted(set(failures))[:30])
        raise ValueError(f"preview prefix/noindex boundary failed:\n{shown}")


def verify(root: Path, receipt_path: Path, prefix: str, source_sha: str) -> dict:
    if prefix != "v3":
        raise ValueError("the trusted publisher permits only the v3 prefix")
    if not SOURCE_SHA.fullmatch(source_sha):
        raise ValueError("source SHA must be an exact lowercase 40-character Git SHA")
    root = root.resolve()
    if not root.is_dir() or root.is_symlink():
        raise ValueError(f"artifact root is not a regular directory: {root}")
    receipt = load_json(receipt_path.resolve())
    manifest = load_json(root / MANIFEST_NAME)
    expected_header = {
        "schemaVersion": 1,
        "prefix": f"/{prefix}",
        "sourceSha": source_sha,
    }
    for field, expected in expected_header.items():
        if receipt.get(field) != expected or manifest.get(field) != expected:
            raise ValueError(f"receipt/manifest {field} does not match the requested publication")
    for field in ("fileCount", "htmlCount", "treeSha256"):
        if receipt.get(field) != manifest.get(field):
            raise ValueError(f"receipt and manifest disagree on {field}")

    records = receipt.get("files")
    if not isinstance(records, list) or receipt.get("publishedFileCount") != len(records):
        raise ValueError("receipt file inventory is missing or has the wrong count")
    expected_paths: set[str] = set()
    for record in records:
        if not isinstance(record, dict):
            raise ValueError("receipt inventory entries must be objects")
        target = safe_record_path(root, record.get("path"))
        relative = str(record["path"])
        if relative in expected_paths:
            raise ValueError(f"duplicate receipt path: {relative}")
        expected_paths.add(relative)
        if not target.is_file() or target.is_symlink():
            raise ValueError(f"receipt path is missing or not a regular file: {relative}")
        if target.stat().st_size != record.get("bytes"):
            raise ValueError(f"size mismatch: {relative}")
        if digest_file(target) != record.get("sha256"):
            raise ValueError(f"hash mismatch: {relative}")

    actual_paths: set[str] = set()
    for target in root.rglob("*"):
        if target.is_symlink():
            raise ValueError(f"artifact contains a symbolic link: {target}")
        if target.is_file():
            actual_paths.add(target.relative_to(root).as_posix())
    if actual_paths != expected_paths:
        missing = sorted(expected_paths - actual_paths)[:5]
        extra = sorted(actual_paths - expected_paths)[:5]
        raise ValueError(f"artifact inventory mismatch; missing={missing}, extra={extra}")

    content_records = [record for record in records if record["path"] != MANIFEST_NAME]
    tree_input = "".join(
        f"{record['path']}\t{record['bytes']}\t{record['sha256']}\n" for record in content_records
    ).encode("utf-8")
    if hashlib.sha256(tree_input).hexdigest() != receipt.get("treeSha256"):
        raise ValueError("tree hash mismatch")
    if len(content_records) != receipt.get("fileCount"):
        raise ValueError("content file count mismatch")
    if sum(1 for record in content_records if str(record["path"]).endswith(".html")) != receipt.get("htmlCount"):
        raise ValueError("HTML file count mismatch")
    verify_prefix_boundaries(root, records)
    return receipt


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--receipt", required=True, type=Path)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--source-sha", required=True)
    args = parser.parse_args()
    try:
        receipt = verify(args.root, args.receipt, args.prefix, args.source_sha)
    except (OSError, ValueError) as error:
        print(f"[v3-artifact] FAIL — {error}", file=sys.stderr)
        return 1
    print(
        f"[v3-artifact] PASS — {receipt['publishedFileCount']} files, "
        f"source {receipt['sourceSha']}, tree {receipt['treeSha256']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
