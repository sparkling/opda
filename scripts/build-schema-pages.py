#!/usr/bin/env python3
"""Schema-section page orchestrator. Pipeline per source/_working/schema-content-generation-spec.md.

Pipeline steps:
  1. walk       — uses _build/leaves.json (produced by walk_schema.py)
  2. classify   — joins leaves.json + provenance-map.yaml -> classified.json
  3. assign     — joins classified.json + theme-map.yaml -> page-leaves.json
  4. bind       — joins page-leaves.json + _examples/*.json -> page-leaves.examples.json
  5. render     — sidecar md + aggregate-page.html.j2 -> docs/pages/<slot>-*.html
  6. index      — emits docs/data/schema-index.json
  7. drift      — validates invariants

Usage:
  python3 scripts/build-schema-pages.py build --page 39
  python3 scripts/build-schema-pages.py build --all
"""
import argparse
import fnmatch
import json
import re
import sys
from datetime import date
from pathlib import Path

import yaml
import jinja2

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "_build"
DICT = ROOT / "source/00-deliverables/semantic-models/data-dictionary-canonical.json"
PROVENANCE = ROOT / "source/00-deliverables/semantic-models/provenance-map.yaml"
THEME_MAP = ROOT / "source/00-deliverables/semantic-models/theme-map.yaml"
CONTENT_DIR = ROOT / "source/_content/schema"
EXAMPLES_DIR = ROOT / "source/_examples"
TEMPLATES = ROOT / "scripts/templates"
OUT_PAGES = ROOT / "docs/pages"
LEAVES_JSON = BUILD / "leaves.json"

OVERLAY_LABELS = {
    "baspi5": "BASPI5", "ta6": "TA6", "ta7": "TA7", "ta10": "TA10",
    "nts2": "NTS2", "ntsl2": "NTSL2", "piq": "PIQ", "lpe1": "LPE1",
    "fme1": "FME1", "con29R": "CON29R", "con29DW": "CON29DW",
    "oc1": "OC1", "llc1": "LLC1", "rds": "RDS", "sr24": "SR24",
}
PAGE_FILES = {
    "34": "34-physical-architecture.html",
    "35": "35-transaction-participants.html",
    "36": "36-chain-milestones-contracts.html",
    "37": "37-property.html",
    "38": "38-legal-estate-title.html",
    "39": "39-built-form-condition-valuation.html",
    "45": "45-utilities-energy.html",
    "46": "46-local-context-searches.html",
    "47": "47-encumbrances-completion.html",
    "48": "48-evidence-documents-declarations.html",
    "49": "49-overlays-tasks-crosscuts.html",
}
PAGE_ORDER = ["34", "35", "36", "37", "38", "39", "45", "46", "47", "48", "49"]


def glob_match(pattern: str, path: str) -> bool:
    return fnmatch.fnmatchcase(path, pattern)


def load_leaves() -> list[dict]:
    return json.loads(LEAVES_JSON.read_text())


def load_overlay_membership() -> dict[str, list[str]]:
    """For each path, collect overlay sources from the canonical dictionary."""
    by_path: dict[str, set[str]] = {}
    entries = json.loads(DICT.read_text())
    for e in entries:
        src = e.get("source")
        if src and src != "pdtf-transaction":
            by_path.setdefault(e["path"], set()).add(src)
    return {p: sorted(srcs) for p, srcs in by_path.items()}


def classify(leaves: list[dict], pmap: dict) -> list[dict]:
    """Step 2 — attach kind/rationale to each leaf."""
    explicit = pmap.get("explicit", {}) or {}
    patterns = pmap.get("patterns", []) or []
    default = pmap.get("default", "declaration")
    out = []
    for leaf in leaves:
        path = leaf["path"]
        kind = None
        rationale = None
        # explicit first
        if path in explicit:
            entry = explicit[path]
            kind = entry.get("kind")
            rationale = entry.get("rule") or entry.get("note")
        else:
            for pat in patterns:
                if glob_match(pat["match"], path):
                    kind = pat.get("kind")
                    rationale = pat.get("rationale")
                    break
        if kind is None:
            kind = default
            rationale = "default"
        out.append({**leaf, "kind": kind, "rationale": rationale})
    return out


def assign_to_pages(classified: list[dict], theme: dict) -> dict[str, list[dict]]:
    """Step 3 — group leaves by page+section. Longest matching prefix wins."""
    pages_cfg = theme.get("pages", {})
    overrides = theme.get("overrides", {}) or {}
    # Build (prefix, page, section) index sorted longest-first.
    index: list[tuple[str, str, str]] = []
    for slot, cfg in pages_cfg.items():
        for sec in cfg.get("sections") or []:
            for prefix in sec.get("prefixes", []):
                index.append((prefix, slot, sec["id"]))
    index.sort(key=lambda x: -len(x[0]))

    by_page: dict[str, list[dict]] = {s: [] for s in PAGE_ORDER}
    orphans: list[dict] = []

    for leaf in classified:
        path = leaf["path"]
        # explicit override?
        if path in overrides:
            ov = overrides[path]
            leaf2 = {**leaf, "page": ov["page"], "section": ov["section"]}
            by_page.setdefault(leaf2["page"], []).append(leaf2)
            continue
        # longest-prefix match
        assigned = False
        for prefix, slot, section in index:
            if path == prefix or path.startswith(prefix + ".") or path.startswith(prefix + "["):
                leaf2 = {**leaf, "page": slot, "section": section}
                by_page.setdefault(slot, []).append(leaf2)
                assigned = True
                break
        if not assigned:
            orphans.append(leaf)
    return by_page, orphans


def resolve_path(data, path: str):
    """Resolve ${path} into a JSON instance. Supports dot-paths and [N] array indices."""
    parts = re.findall(r"[^.\[\]]+|\[\d+\]", path)
    cur = data
    for part in parts:
        if part.startswith("["):
            try:
                cur = cur[int(part[1:-1])]
            except (IndexError, TypeError, ValueError):
                return None
        else:
            if isinstance(cur, dict):
                cur = cur.get(part)
            else:
                return None
        if cur is None:
            return None
    return cur


def substitute(text: str, examples: dict) -> str:
    """Replace ${path} tokens. Optional `london:` / `semi:` / `manchester:` prefix
    selects an example explicitly; otherwise falls through london -> semi."""
    london = examples.get("london")
    semi = examples.get("semi")

    def replace(m):
        token = m.group(1).strip()
        if ":" in token:
            prefix, path = token.split(":", 1)
            prefix = prefix.strip().lower()
            path = path.strip()
            target = london if prefix in ("london", "flat") else semi if prefix in ("semi", "manchester") else None
            if target is None:
                return "{?" + token + "?}"
            v = resolve_path(target, path)
        else:
            path = token
            v = resolve_path(london, path)
            if v is None:
                v = resolve_path(semi, path)
        if v is None:
            return "{?" + token + "?}"
        return str(v)

    return re.sub(r"\$\{([^}]+)\}", replace, text)


def parse_frontmatter(md_text: str) -> tuple[dict, str]:
    if not md_text.startswith("---"):
        return {}, md_text
    end = md_text.find("\n---", 3)
    if end < 0:
        return {}, md_text
    fm = yaml.safe_load(md_text[3:end]) or {}
    body = md_text[end + 4:]
    return fm, body


def markdown_to_html(md: str) -> str:
    """Lightweight Markdown-to-HTML for our limited needs: paragraphs, **bold**, *em*, `code`, ${path} already substituted."""
    if not md:
        return ""
    # paragraphs split by blank line
    paras = re.split(r"\n\s*\n", md.strip())
    out = []
    for p in paras:
        p = p.strip()
        if not p:
            continue
        # inline transforms
        p = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", p)
        p = re.sub(r"\*([^*]+?)\*", r"<em>\1</em>", p)
        p = re.sub(r"`([^`]+?)`", r"<code>\1</code>", p)
        # newlines inside a paragraph -> spaces
        p = re.sub(r"\s*\n\s*", " ", p)
        out.append(f"<p>{p}</p>")
    return "\n".join(out)


def render_page(slot: str, leaves_for_page: list[dict],
                theme: dict, examples: dict, overlay_membership: dict) -> str:
    page_cfg = theme["pages"][slot]
    md_path = CONTENT_DIR / f"{slot}-{slot_filename_root(slot)}.md"
    fm, _body = parse_frontmatter(md_path.read_text()) if md_path.exists() else ({}, "")
    regions_raw = (fm.get("regions") or {})
    # Apply substitution + lightweight markdown for each region
    regions = {}
    for key in ("intro", "why_this_exists", "pull_quote", "gap_notes", "worked_example"):
        raw = regions_raw.get(key, "")
        substituted = substitute(raw, examples) if raw else ""
        if key == "pull_quote":
            regions[key] = substituted.strip().strip('"')
        else:
            regions[key] = markdown_to_html(substituted)
    regions["intro_plain"] = re.sub(r"<[^>]+>", "", regions.get("intro", "")).strip()[:280]
    # ER diagram is raw Mermaid source from frontmatter (passed through |safe in template)
    regions["er_diagram"] = (regions_raw.get("er_diagram") or "").strip()
    regions["er_caption"] = (regions_raw.get("er_caption") or "").strip()
    regions["mentioned_but_not_owned"] = ""
    mboo = fm.get("mentioned_but_not_owned") or []
    if mboo:
        regions["mentioned_but_not_owned"] = "This page references but does not own " + ", ".join(
            f"<code>{m}</code>" for m in mboo) + "."

    # Group leaves by section per theme-map.yaml order
    sections_cfg = page_cfg.get("sections") or []
    grouped = {}
    for leaf in leaves_for_page:
        sec = leaf.get("section")
        grouped.setdefault(sec, []).append(leaf)
    # Sort within each section: required desc, path asc
    for sec_id in grouped:
        grouped[sec_id].sort(key=lambda l: (not l.get("required", False), l["path"]))

    sections = []
    for sec in sections_cfg:
        sec_leaves = grouped.get(sec["id"], [])
        # Attach overlay objects per leaf
        enriched = []
        for leaf in sec_leaves:
            overlays_raw = overlay_membership.get(leaf["path"], [])
            overlays = [{"key": k, "label": OVERLAY_LABELS.get(k, k)} for k in overlays_raw]
            enriched.append({
                **leaf,
                "overlays": overlays,
                "title": leaf.get("title") or leaf.get("name", ""),
                "required": leaf.get("required", False),
                "is_envelope": leaf.get("is_envelope", False),
                "has_example": resolve_path(examples.get("london"), leaf["path"]) is not None
                              or resolve_path(examples.get("semi"), leaf["path"]) is not None,
            })
        sections.append({"id": sec["id"], "title": sec["title"], "leaves": enriched})

    # Stats
    non_env = [l for l in leaves_for_page if not l.get("is_envelope")]
    env_total = len(leaves_for_page) - len(non_env)
    total = len(non_env)
    by_kind = {"declaration": 0, "evidence": 0, "derivation": 0}
    for l in non_env:
        by_kind[l.get("kind", "declaration")] = by_kind.get(l.get("kind", "declaration"), 0) + 1
    def pct(n): return round(100 * n / total, 1) if total else 0
    stats = {
        "total": total,
        "decl_pct": pct(by_kind["declaration"]),
        "evid_pct": pct(by_kind["evidence"]),
        "deriv_pct": pct(by_kind["derivation"]),
        "with_overlays": sum(1 for l in non_env if overlay_membership.get(l["path"])),
        "with_examples": sum(1 for sec in sections for l in sec["leaves"] if l["has_example"]),
        "envelope_total": env_total,
    }

    # Prev/next
    idx = PAGE_ORDER.index(slot)
    prev = None
    nxt = None
    if idx > 0:
        prev_slot = PAGE_ORDER[idx - 1]
        prev = {"file": PAGE_FILES[prev_slot], "title": theme["pages"][prev_slot]["title"]}
    if idx < len(PAGE_ORDER) - 1:
        nxt_slot = PAGE_ORDER[idx + 1]
        nxt = {"file": PAGE_FILES[nxt_slot], "title": theme["pages"][nxt_slot]["title"]}

    # Template
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(TEMPLATES)),
        extensions=["jinja2.ext.loopcontrols"],
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    tmpl = env.get_template("aggregate-page.html.j2")
    ctx = {
        "page": {
            "slot": slot,
            "title": page_cfg["title"],
            "voice": page_cfg.get("voice", "reference-prose-with-opinion"),
            "prev": prev,
            "next": nxt,
            "generated_on": str(date.today()),
        },
        "regions": regions,
        "sections": sections,
        "stats": stats,
        "show_envelopes": page_cfg.get("show_envelopes", False),
    }
    return tmpl.render(**ctx)


def slot_filename_root(slot: str) -> str:
    return PAGE_FILES[slot].rsplit(".", 1)[0].split("-", 1)[1]  # e.g. "built-form-condition-valuation"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["build"])
    p.add_argument("--page", default="39")
    p.add_argument("--all", action="store_true")
    args = p.parse_args()

    BUILD.mkdir(exist_ok=True)
    leaves = load_leaves()
    pmap = yaml.safe_load(PROVENANCE.read_text())
    theme = yaml.safe_load(THEME_MAP.read_text())
    examples = {
        "london": json.loads((EXAMPLES_DIR / "flat-london.json").read_text()),
        "semi": json.loads((EXAMPLES_DIR / "semi-manchester.json").read_text()),
    }
    overlay_membership = load_overlay_membership()

    classified = classify(leaves, pmap)
    (BUILD / "classified.json").write_text(json.dumps(classified, indent=2))

    by_page, orphans = assign_to_pages(classified, theme)
    (BUILD / "page-leaves.json").write_text(json.dumps(by_page, indent=2))
    (BUILD / "orphans.json").write_text(json.dumps(orphans, indent=2))
    print(f"classified={len(classified)} orphans={len(orphans)} pages={ {k: len(v) for k,v in by_page.items()} }")

    slots = PAGE_ORDER if args.all else [args.page]
    for slot in slots:
        if slot == "34" or slot == "49":
            print(f"skip {slot} (uses different template)")
            continue
        if not by_page.get(slot):
            print(f"skip {slot} (no leaves)")
            continue
        html = render_page(slot, by_page[slot], theme, examples, overlay_membership)
        out = OUT_PAGES / PAGE_FILES[slot]
        out.write_text(html)
        print(f"wrote {out}  ({len(by_page[slot])} leaves)")


if __name__ == "__main__":
    main()
