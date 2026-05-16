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
import subprocess
import sys
from datetime import date
from pathlib import Path

import yaml
import jinja2

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _lib import object_model, object_er  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "_build"
DICT = ROOT / "source/00-deliverables/semantic-models/data-dictionary-canonical.json"
PROVENANCE = ROOT / "source/00-deliverables/semantic-models/provenance-map.yaml"
THEME_MAP = ROOT / "source/00-deliverables/semantic-models/theme-map.yaml"
CONTENT_DIR = ROOT / "source/_content/schema"
EXAMPLES_DIR = ROOT / "source/_examples"
TEMPLATES = ROOT / "scripts/templates"
OUT_PAGES = ROOT / "src/pages/pages"
LEAVES_JSON = BUILD / "leaves.json"
PROPERTIES_JS = ROOT / "public/data/properties.js"

OVERLAY_LABELS = {
    "baspi5": "BASPI5", "ta6": "TA6", "ta7": "TA7", "ta10": "TA10",
    "nts2": "NTS2", "ntsl2": "NTSL2", "piq": "PIQ", "lpe1": "LPE1",
    "fme1": "FME1", "con29R": "CON29R", "con29DW": "CON29DW",
    "oc1": "OC1", "llc1": "LLC1", "rds": "RDS", "sr24": "SR24",
}
# Descriptive overlay names for table cells. Mirror of OVERLAY_NAMES in
# docs/ui/schema-leaf-table.js; sourced from page 49's overlay catalogue.
OVERLAY_NAMES = {
    "baspi5":  "Buyers & Sellers Property Information v5",
    "ta6":     "Law Society Property Information Form",
    "ta7":     "Law Society Leasehold Information Form",
    "ta10":    "Law Society Fittings & Contents Form",
    "nts2":    "NTS Material Information (sales)",
    "ntsl2":   "NTS Material Information (lettings)",
    "piq":     "Property Information Questionnaire",
    "lpe1":    "Leasehold Property Enquiries Form",
    "fme1":    "Freehold Management Enquiries",
    "con29R":  "Local Authority CON29R search return",
    "con29DW": "Drainage & water search return",
    "oc1":     "HMLR Official Copy data",
    "llc1":    "Local Land Charges search",
    "rds":     "Residential Disclosure Standard",
    "sr24":    "Sustainability Report 2024",
}
PAGE_FILES = {
    "34":   "34-physical-architecture.html",
    "35":   "35-transaction-participants.html",
    "36":   "36-chain-milestones-contracts.html",
    "37":   "37-property.html",
    "38":   "38-legal-estate-title.html",            # landing (hand-written)
    "38a":  "38a-tenure.html",
    "38b":  "38b-title-oc-summary.html",             # landing
    "38b1": "38b1-title-number.html",
    "38b2": "38b2-title-oc-meta.html",
    "38b3": "38b3-title-oc-owners.html",
    "38b4": "38b4-title-oc-charges-main.html",
    "38b5": "38b5-title-oc-charges-other.html",
    "38b6": "38b6-title-oc-notices-main.html",
    "38b7": "38b7-title-oc-notices-other.html",
    "38c":  "38c-title-oc-full.html",
    "38d":  "38d-ownership-freehold.html",
    "38e":  "38e-ownership-leasehold.html",          # landing
    "38e1": "38e1-lease-term.html",
    "38e2": "38e2-lease-contacts-list.html",
    "38e3": "38e3-lease-contacts-roles.html",
    "38e4": "38e4-lease-management.html",
    "38e5": "38e5-lease-rent.html",
    "38e6": "38e6-lease-charges.html",         # landing
    "38e6a": "38e6a-lease-service-charge.html",
    "38e6b": "38e6b-lease-buildings-insurance.html",
    "38e7": "38e7-lease-legal.html",           # landing
    "38e7a": "38e7a-lease-consents-alterations.html",
    "38e7b": "38e7b-lease-restrictions-enfranchisement.html",
    "38e7c": "38e7c-lease-building-safety.html",
    "38e7d": "38e7d-lease-transfer.html",
    "38e8": "38e8-lease-misc.html",            # landing
    "38e8a": "38e8a-lease-disputes.html",
    "38e8b": "38e8b-lease-general.html",
    "38e8c": "38e8c-lease-required-docs.html",
    "38f":  "38f-ownership-managed.html",      # landing
    "38f1": "38f1-managed-contacts.html",
    "38f2": "38f2-managed-transfer.html",
    "38f3": "38f3-managed-service-charge.html",
    "38f4": "38f4-managed-insurance.html",
    "38f5": "38f5-managed-disputes-docs.html",
    "38g":  "38g-boundaries-rights.html",
    "39":   "39-built-form-condition-valuation.html", # landing
    "39a":  "39a-built-form.html",
    "39b":  "39b-condition.html",
    "39c":  "39c-fixtures.html",                     # landing
    "39c1": "39c1-fixtures-summary.html",
    "39c2": "39c2-fixtures-basic.html",
    "39c3": "39c3-fixtures-kitchen.html",
    "39c4": "39c4-fixtures-bathroom.html",
    "39c5": "39c5-fixtures-carpets.html",
    "39c6": "39c6-fixtures-curtains.html",
    "39c7": "39c7-fixtures-lights.html",
    "39c8": "39c8-fixtures-units.html",
    "39c9": "39c9-fixtures-outdoor.html",
    "39c10": "39c10-fixtures-services.html",
    "39d":  "39d-surveys.html",                      # landing
    "39d1": "39d1-survey-meta.html",
    "39d2": "39d2-survey-grounds.html",
    "39d3": "39d3-survey-inside-structure.html",
    "39d4": "39d4-survey-inside-features.html",
    "39d5": "39d5-survey-inside-finishes.html",
    "39d6": "39d6-survey-outside-roof.html",
    "39d7": "39d7-survey-outside-envelope.html",
    "39d8": "39d8-survey-outside-extras.html",
    "39d9": "39d9-survey-services-energy.html",
    "39d10":"39d10-survey-services-water.html",
    "39d11":"39d11-survey-legal.html",
    "39d12":"39d12-survey-valuation.html",
    "39d13":"39d13-survey-advice.html",
    "39e":  "39e-valuation.html",
    "45":   "45-utilities-energy.html",
    "46":   "46-local-context-searches.html",        # landing
    "46a":  "46a-con29r.html",                       # landing
    "46a1": "46a1-local-authority-identity.html",
    "46a2": "46a2-local-authority-searches.html",         # landing
    "46a2a": "46a2a-la-planning-building.html",
    "46a2b": "46a2b-la-roads.html",
    "46a2c": "46a2c-la-other-planning-notices.html",
    "46a2d": "46a2d-la-other-finance.html",
    "46a2e": "46a2e-la-other-road-rail.html",
    "46a2f": "46a2f-la-other-environmental.html",
    "46a2g": "46a2g-la-other-compulsory.html",
    "46a4": "46a4-listing-conservation.html",
    "46c":  "46c-llc1.html",
    "46d":  "46d-environmental.html",                     # landing
    "46d1": "46d1-flooding.html",
    "46d2": "46d2-mining-ground.html",
    "46d3": "46d3-pollution-radon.html",
    "46d4": "46d4-coast-climate.html",
    "46d5": "46d5-infra-policy.html",
    "47":   "47-encumbrances-completion.html",            # landing
    "47a":  "47a-council-tax-insurance.html",
    "47b":  "47b-guarantees.html",
    "47c":  "47c-occupiers-notices.html",
    "47d":  "47d-letting-completion.html",
    "48":   "48-evidence-documents-declarations.html",    # landing
    "48a":  "48a-documents.html",
    "48b":  "48b-declarations.html",
    "48c":  "48c-additional.html",
    "48d":  "48d-disputes.html",
    "48e":  "48e-specialist.html",
    "49":   "49-overlays-tasks-crosscuts.html",
}
# IA-defined page ids (must match docs/ui/site.js SECTIONS.schema.groups[*].items[*].id
# for the sidebar to highlight + render on each page).
PAGE_IDS = {
    "34":    "schema-overview",
    "35":    "transaction-participants",
    "36":    "chain-milestones",
    "37":    "property",
    "38":    "legal-estate",
    "38a":   "legal-estate-tenure",
    "38b":   "legal-estate-title-oc-summary",
    "38b1":  "title-number",
    "38b2":  "title-oc-meta",
    "38b3":  "title-oc-owners",
    "38b4":  "title-oc-charges-main",
    "38b5":  "title-oc-charges-other",
    "38b6":  "title-oc-notices-main",
    "38b7":  "title-oc-notices-other",
    "38c":   "legal-estate-title-oc-full",
    "38d":   "legal-estate-ownership-freehold",
    "38e":   "legal-estate-ownership-leasehold",
    "38e1":  "lease-term",
    "38e2":  "lease-contacts-list",
    "38e3":  "lease-contacts-roles",
    "38e4":  "lease-management",
    "38e5":  "lease-rent",
    "38e6":  "lease-charges",
    "38e6a": "lease-service-charge",
    "38e6b": "lease-buildings-insurance",
    "38e7":  "lease-legal",
    "38e7a": "lease-consents-alterations",
    "38e7b": "lease-restrictions-enfranchisement",
    "38e7c": "lease-building-safety",
    "38e7d": "lease-transfer",
    "38e8":  "lease-misc",
    "38e8a": "lease-disputes",
    "38e8b": "lease-general",
    "38e8c": "lease-required-docs",
    "38f":   "legal-estate-ownership-managed",
    "38f1":  "managed-contacts",
    "38f2":  "managed-transfer",
    "38f3":  "managed-service-charge",
    "38f4":  "managed-insurance",
    "38f5":  "managed-disputes-docs",
    "38g":   "legal-estate-boundaries-rights",
    "39":    "built-form",
    "39a":   "built-form-form",
    "39b":   "built-form-condition",
    "39c":   "built-form-fixtures",
    "39c1":  "fixtures-summary",
    "39c2":  "fixtures-basic",
    "39c3":  "fixtures-kitchen",
    "39c4":  "fixtures-bathroom",
    "39c5":  "fixtures-carpets",
    "39c6":  "fixtures-curtains",
    "39c7":  "fixtures-lights",
    "39c8":  "fixtures-units",
    "39c9":  "fixtures-outdoor",
    "39c10": "fixtures-services",
    "39d":   "built-form-surveys",
    "39d1":  "survey-meta",
    "39d2":  "survey-grounds",
    "39d3":  "survey-inside-structure",
    "39d4":  "survey-inside-features",
    "39d5":  "survey-inside-finishes",
    "39d6":  "survey-outside-roof",
    "39d7":  "survey-outside-envelope",
    "39d8":  "survey-outside-extras",
    "39d9":  "survey-services-energy",
    "39d10": "survey-services-water",
    "39d11": "survey-legal",
    "39d12": "survey-valuation",
    "39d13": "survey-advice",
    "39e":   "built-form-valuation",
    "45":    "utilities-energy",
    "46":    "local-context",
    "46a":   "local-context-con29r",
    "46a1":  "local-authority-identity",
    "46a2":  "local-authority-searches",
    "46a2a": "la-planning-building",
    "46a2b": "la-roads",
    "46a2c": "la-other-planning-notices",
    "46a2d": "la-other-finance",
    "46a2e": "la-other-road-rail",
    "46a2f": "la-other-environmental",
    "46a2g": "la-other-compulsory",
    "46a4":  "listing-conservation",
    "46c":   "local-context-llc1",
    "46d":   "local-context-environmental",
    "46d1":  "env-flooding",
    "46d2":  "env-mining-ground",
    "46d3":  "env-pollution-radon",
    "46d4":  "env-coast-climate",
    "46d5":  "env-infra-policy",
    "47":    "encumbrances",
    "47a":   "encumbrances-council-tax-insurance",
    "47b":   "encumbrances-guarantees",
    "47c":   "encumbrances-occupiers",
    "47d":   "encumbrances-letting-completion",
    "48":    "evidence-documents",
    "48a":   "evidence-documents-attachments",
    "48b":   "evidence-declarations",
    "48c":   "evidence-additional",
    "48d":   "evidence-disputes",
    "48e":   "evidence-specialist",
    "49":    "overlays-tasks",
}
# Build order. Landing pages (38, 39, 46) are hand-written, like 34 and 49.
PAGE_ORDER = [
    "34",
    "35", "36", "37",
    "38",
    "38a",
    "38b",
    "38b1", "38b2", "38b3", "38b4", "38b5", "38b6", "38b7",
    "38c", "38d",
    "38e",
    "38e1", "38e2", "38e3", "38e4", "38e5",
    "38e6", "38e6a", "38e6b",
    "38e7", "38e7a", "38e7b", "38e7c", "38e7d",
    "38e8", "38e8a", "38e8b", "38e8c",
    "38f", "38f1", "38f2", "38f3", "38f4", "38f5",
    "38g",
    "39",
    "39a", "39b",
    "39c",
    "39c1", "39c2", "39c3", "39c4", "39c5",
    "39c6", "39c7", "39c8", "39c9", "39c10",
    "39d",
    "39d1", "39d2", "39d3", "39d4", "39d5", "39d6",
    "39d7", "39d8", "39d9", "39d10", "39d11", "39d12", "39d13",
    "39e",
    "45",
    "46",
    "46a",
    "46a1",
    "46a2",
    "46a2a", "46a2b", "46a2c", "46a2d", "46a2e", "46a2f", "46a2g",
    "46a4",
    "46c",
    "46d",
    "46d1", "46d2", "46d3", "46d4", "46d5",
    "47",
    "47a", "47b", "47c", "47d",
    "48",
    "48a", "48b", "48c", "48d", "48e",
    "49",
]
# Slots whose HTML is hand-curated (landing pages + Overview + Overlays). The
# builder skips them; you edit the .html files directly.
HANDWRITTEN_SLOTS = {
    "34",
    "38", "38b", "38e", "38e6", "38e7", "38e8", "38f",
    "39", "39c", "39d",
    "46", "46a", "46a2", "46d",
    "47",
    "48",
    "49",
}


def glob_match(pattern: str, path: str) -> bool:
    return fnmatch.fnmatchcase(path, pattern)


def load_leaves() -> list[dict]:
    return json.loads(LEAVES_JSON.read_text())


def load_property_descriptions() -> dict[str, str]:
    """Path → description, parsed out of docs/data/properties.js.

    The file is a JS literal (`window.OPDA_PROPERTIES = [...];`) so we
    strip the prefix and trailing semicolon and treat the array as JSON.
    """
    if not PROPERTIES_JS.exists():
        return {}
    raw = PROPERTIES_JS.read_text()
    m = re.search(r"=\s*(\[.*\])\s*;?\s*$", raw, re.DOTALL)
    if not m:
        return {}
    try:
        rows = json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}
    out: dict[str, str] = {}
    for r in rows:
        p = r.get("examplePath")
        d = r.get("description")
        if p and d and p not in out:
            out[p] = d
    return out


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
                theme: dict, examples: dict, overlay_membership: dict,
                obj_to_page: dict[str, str] | None = None,
                descriptions: dict[str, str] | None = None) -> str:
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
    # Diagrams. Backward-compat: keep `er_diagram` + `er_caption` as the primary
    # ER. A `diagrams` array adds additional diagrams (state, sequence, gantt,
    # flowchart). Each entry: { type, source, caption }.
    regions["er_diagram"] = (regions_raw.get("er_diagram") or "").strip()
    regions["er_caption"] = (regions_raw.get("er_caption") or "").strip()
    diagrams = []
    for d in (regions_raw.get("diagrams") or []):
        if d.get("source"):
            diagrams.append({
                "type": (d.get("type") or "").strip(),
                "source": d["source"].strip(),
                "caption": (d.get("caption") or "").strip(),
            })
    regions["diagrams"] = diagrams
    regions["mentioned_but_not_owned"] = ""
    mboo = fm.get("mentioned_but_not_owned") or []
    if mboo:
        regions["mentioned_but_not_owned"] = "This page references but does not own " + ", ".join(
            f"<code>{m}</code>" for m in mboo) + "."

    # ── Enrich every leaf with overlays + has_example before we build the
    # object model. The object-model walker spreads each leaf record into
    # the field row, so anything we want on the rendered row goes here. ──
    enriched_all: list[dict] = []
    for leaf in leaves_for_page:
        overlays_raw = overlay_membership.get(leaf["path"], [])
        overlays = [
            {
                "key":   k,
                "label": OVERLAY_LABELS.get(k, k),     # UPPER (e.g. BASPI5) — used for chips
                "name":  OVERLAY_NAMES.get(k, k),      # full descriptive — used in table cells
            }
            for k in overlays_raw
        ]
        enriched_all.append({
            **leaf,
            "overlays": overlays,
            "title": leaf.get("title") or leaf.get("name", ""),
            "description": (descriptions or {}).get(leaf["path"], ""),
            "required": leaf.get("required", False),
            "is_envelope": leaf.get("is_envelope", False),
            "has_example": resolve_path(examples.get("london"), leaf["path"]) is not None
                          or resolve_path(examples.get("semi"), leaf["path"]) is not None,
        })

    # ── Build the per-page object model. Every JSON object in this page's
    # subtree becomes a node — both as an ER box AND as a table — even if
    # it has no direct scalar fields. Pure-container objects (e.g.
    # `participants[].verification`, which exists only to namespace
    # identity + AML sub-objects) still belong in the physical model. ──
    page_model = object_model.build(enriched_all)
    by_path = page_model["by_path"]
    page_objects = list(page_model["objects"])

    # Sort each object's fields: required first, then declared order
    for obj in page_objects:
        obj["fields"].sort(key=lambda f: (not f.get("required", False), f.get("path", "")))

    # Compute a SHORT display_id for each object — the JSON object's last
    # path segment, PascalCased and singularised (`reports[]` → `Report`).
    # Multiple objects on the same page can share a display_id and that's
    # intentional: in the ER diagram they render as ONE box with edges
    # arriving from every parent, since they describe the same shape.
    # We keep the canonical full-path `id` for table HTML anchors (which
    # must be unique) and add a `data-display-id` attribute on each table
    # header so cross-reference clicks resolve to the first match.
    def _title(s: str) -> str:
        return s[:1].upper() + s[1:] if s else ""

    def short_for(path: str) -> str:
        if not path:
            return "Transaction"
        seg = path.rsplit(".", 1)[-1].rstrip("[]")
        out = _title(re.sub(r"[^A-Za-z0-9]", "", seg))
        # Singularise the trailing array name (e.g. "Reports" → "Report")
        if path.endswith("[]") and out.endswith("s") and not out.endswith("ss"):
            out = out[:-1]
        return out or "Object"

    for o in page_objects:
        o["display_id"] = short_for(o["path"])
    # Mirror display_id onto every child entry so er.py reads it without
    # needing a second lookup.
    for o in page_objects:
        for c in o.get("children", []):
            if c["path"] in by_path:
                c["display_id"] = by_path[c["path"]]["display_id"]

    # Section assignment for objects. Two cases beyond the obvious prefix
    # match:
    #   1. The empty-path root → first section (only on pages where root
    #      has fields; otherwise suppressed by the empty-container filter
    #      below).
    #   2. Ancestor containers (their path is a strict PREFIX of some
    #      section prefix, e.g. `propertyPack` on a page whose sections
    #      start with `propertyPack.address`) → first section. This keeps
    #      the "Contains: …" link from a parent box pointing at a real
    #      anchor that's actually rendered on this page.
    sections_cfg = page_cfg.get("sections") or []
    sec_index: list[tuple[str, str]] = []
    for sec in sections_cfg:
        for prefix in sec.get("prefixes") or []:
            sec_index.append((prefix, sec["id"]))
    sec_index.sort(key=lambda x: -len(x[0]))

    def section_for_object(obj_path: str) -> str | None:
        if obj_path == "":
            return sections_cfg[0]["id"] if sections_cfg else None
        for prefix, sec_id in sec_index:
            if obj_path == prefix or obj_path.startswith(prefix + ".") \
               or obj_path.startswith(prefix + "["):
                return sec_id
        # Ancestor container: a section prefix descends from this object.
        for prefix, _ in sec_index:
            if prefix.startswith(obj_path + ".") or prefix.startswith(obj_path + "["):
                return sections_cfg[0]["id"]
        return None

    # Set of object paths that will actually render on this page. Used
    # below to resolve child hrefs to the right anchor — same page vs
    # cross-page vs not-rendered-anywhere.
    locally_rendered: set[str] = {
        o["path"] for o in page_objects if section_for_object(o["path"]) is not None
    }
    for o in page_objects:
        for c in o.get("children", []):
            home = (obj_to_page or {}).get(c["path"])
            if c["path"] in locally_rendered:
                c["href"] = f"#{c['id'].lower()}"
            elif home and home != slot and home in PAGE_FILES:
                c["href"] = f"{PAGE_FILES[home]}#{c['id'].lower()}"
            else:
                c["href"] = f"#{c['id'].lower()}"

    grouped_objs: dict[str, list[dict]] = {}
    for obj in page_objects:
        sec_id = section_for_object(obj["path"])
        if sec_id is None:
            continue
        grouped_objs.setdefault(sec_id, []).append(obj)
    # Sort each section's objects so the parent appears before its
    # descendants (path is a stable proxy).
    for sec_id in grouped_objs:
        grouped_objs[sec_id].sort(key=lambda o: (o["path"].count("."), o["path"]))

    sections = []
    for sec in sections_cfg:
        sec_objs = grouped_objs.get(sec["id"], [])
        sections.append({
            "id":      sec["id"],
            "title":   sec["title"],
            "objects": sec_objs,
        })

    # Generate the page's ER diagram from the object graph. The sidecar
    # er_diagram + er_caption are now ignored — the physical model is
    # derived deterministically from the schema, not hand-authored.
    er_source = object_er.build_er_source(page_objects, by_path)
    regions["er_diagram"] = er_source
    obj_n = len(page_objects)
    field_n = sum(o['field_count'] for o in page_objects)
    regions["er_caption"] = (
        f"Physical model — every JSON object owned by this page is a node, "
        f"every scalar field a row. "
        f"<strong>{obj_n}</strong> object{'s' if obj_n != 1 else ''}, "
        f"<strong>{field_n}</strong> scalar field{'s' if field_n != 1 else ''}. "
        f"Generated from the schema walk; click any node to jump to its table."
    )

    # Stats — computed over the full enriched leaf list (we still summarise
    # at the field level so the "% declaration / evidence / derivation"
    # numbers stay meaningful).
    non_env = [l for l in enriched_all if not l.get("is_envelope")]
    env_total = len(enriched_all) - len(non_env)
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
        "with_examples": sum(1 for l in non_env if l.get("has_example")),
        "envelope_total": env_total,
        # New: object-model counters
        "object_count": len([o for o in page_objects if o["field_count"] > 0 or o.get("children")]),
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
            "id": PAGE_IDS.get(slot, f"schema-{slot}"),
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
    descriptions = load_property_descriptions()

    classified = classify(leaves, pmap)
    (BUILD / "classified.json").write_text(json.dumps(classified, indent=2))

    by_page, orphans = assign_to_pages(classified, theme)
    (BUILD / "page-leaves.json").write_text(json.dumps(by_page, indent=2))
    (BUILD / "orphans.json").write_text(json.dumps(orphans, indent=2))
    print(f"classified={len(classified)} orphans={len(orphans)} pages={ {k: len(v) for k,v in by_page.items()} }")

    # Global object → page map so cross-page children can render real
    # hrefs. We only include objects that ACTUALLY render somewhere — an
    # object's "home page" from object_model.assign_to_pages might fall
    # outside that page's section prefixes, in which case it's invisible
    # and we should suppress the link rather than emit a broken anchor.
    leaf_to_page: dict[str, str] = {}
    for slot, slot_leaves in by_page.items():
        for leaf in slot_leaves:
            leaf_to_page[leaf["path"]] = slot

    obj_to_page: dict[str, str] = {}
    for slot, slot_leaves in by_page.items():
        if not slot_leaves or slot in HANDWRITTEN_SLOTS:
            continue
        page_cfg = theme["pages"].get(slot, {})
        sections_cfg = page_cfg.get("sections") or []
        prefixes = [(p, s["id"]) for s in sections_cfg for p in (s.get("prefixes") or [])]
        prefixes.sort(key=lambda x: -len(x[0]))
        def _matches(path: str, prefixes=prefixes, has_sections=bool(sections_cfg)) -> bool:
            if path == "":
                return has_sections
            for prefix, _ in prefixes:
                if path == prefix or path.startswith(prefix + ".") or path.startswith(prefix + "["):
                    return True
            return False
        local_model = object_model.build(slot_leaves)
        for path in local_model["by_path"]:
            if _matches(path) and path not in obj_to_page:
                obj_to_page[path] = slot

    slots = PAGE_ORDER if args.all else [args.page]
    for slot in slots:
        if slot in HANDWRITTEN_SLOTS:
            print(f"skip {slot} (hand-written landing/overview)")
            continue
        if not by_page.get(slot):
            print(f"skip {slot} (no leaves)")
            continue
        html = render_page(slot, by_page[slot], theme, examples, overlay_membership,
                           obj_to_page=obj_to_page, descriptions=descriptions)
        out = OUT_PAGES / PAGE_FILES[slot]
        out.write_text(html)
        print(f"wrote {out}  ({len(by_page[slot])} leaves)")

    # Refresh the ER entity registry consumed by the in-page click handler.
    registry_script = Path(__file__).parent / "build-er-registry.py"
    if registry_script.exists():
        subprocess.run([sys.executable, str(registry_script)], check=True)


if __name__ == "__main__":
    main()
