"""
Module odr_corpus.

Realises:
- ADR-0007 §"Input layer" — parses `docs/ontology/odr/ODR-*.md` frontmatter
  + `## Rules` section. This is the upstream supply for the A9 per-kind
  discipline output (UFO/DOLCE category extraction for `kind: pattern` ODRs).
- ADR-0007 §"A9 per-kind discipline output" — minted classes from
  `kind: pattern` ODRs must carry `dct:source` to the ODR + §Rules subsection
  that committed the meta-category.
- ADR-0008 §"Repository structure" — `inputs/odr_corpus.py` per layout.
- ODR-0001 A9 §"Per-kind discipline" — pattern/mapping/architecture/rule
  taxonomy whose `kind: pattern` line drives generator emission.

The parser is deliberately small: it reads the YAML frontmatter (a permissive
mini-parser; no PyYAML dependency to keep the lock-file thin) and slices the
markdown body into ordered `## Rules` subsections. Emitters (ADR-0011+) consume
the records.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path


FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.DOTALL)
_KEY_VAL_RE = re.compile(r"^([A-Za-z_][\w-]*):\s*(.*)$")


@dataclass(frozen=True)
class OdrRecord:
    """A parsed ODR markdown file."""

    path: Path
    frontmatter: dict
    rules_section: str
    operational_spec_section: str = ""
    extras: dict = field(default_factory=dict)


def _parse_frontmatter(raw: str) -> dict:
    """Permissive YAML-frontmatter parser.

    Handles flat `key: value` and inline `key: [a, b, c]` lists — the only
    shapes used by the OPDA ODR corpus. No nested mappings, no block scalars.
    """
    out: dict = {}
    for line in raw.splitlines():
        line = line.rstrip()
        if not line or line.startswith("#"):
            continue
        match = _KEY_VAL_RE.match(line)
        if not match:
            continue
        key, val = match.group(1), match.group(2).strip()
        if val.startswith("[") and val.endswith("]"):
            inner = val[1:-1].strip()
            out[key] = [item.strip() for item in inner.split(",") if item.strip()]
        else:
            out[key] = val
    return out


def parse_one(path: Path) -> OdrRecord:
    """Parse a single ODR markdown file."""
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if not match:
        return OdrRecord(path=path, frontmatter={}, rules_section="")
    fm_raw, body = match.group(1), match.group(2)
    fm = _parse_frontmatter(fm_raw)
    rules = _extract_section(body, "## Rules")
    ops = _extract_section(body, "### Operational specifications")
    return OdrRecord(
        path=path,
        frontmatter=fm,
        rules_section=rules,
        operational_spec_section=ops,
    )


def _extract_section(body: str, header: str) -> str:
    """Return body of a markdown ## or ### section, stopping at the next
    same-level heading."""
    level = header.count("#")
    next_pattern = re.compile(rf"^{'#' * level}\s+", re.MULTILINE)
    lines = body.split("\n")
    out: list[str] = []
    in_section = False
    header_stripped = header.strip()
    for line in lines:
        if line.strip() == header_stripped:
            in_section = True
            continue
        if in_section and next_pattern.match(line) and line.strip() != header_stripped:
            break
        if in_section:
            out.append(line)
    return "\n".join(out).strip()


def load_corpus(corpus_dir: Path) -> list[OdrRecord]:
    """Parse every `ODR-*.md` in the corpus dir (non-recursive)."""
    records: list[OdrRecord] = []
    for path in sorted(corpus_dir.glob("ODR-*.md")):
        records.append(parse_one(path))
    return records
