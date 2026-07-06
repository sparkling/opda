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
OUT_PAGES = ROOT / "src/pages/schema"
LEAVES_JSON = BUILD / "leaves.json"
PROPERTIES_JS = ROOT / "public/data/properties.js"
DAMA_KA_MAPPING = ROOT / "scripts/dama-ka-mapping.json"

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
    "34": "index.astro",
    "35": "transaction-participants.astro",
    "36": "chain-milestones.astro",
    "37": "property.astro",
    "38": "legal-estate/index.astro",
    "38a": "legal-estate/tenure.astro",
    "38b": "legal-estate/title/oc-summary/index.astro",
    "38b1": "legal-estate/title/oc-summary/title-number.astro",
    "38b2": "legal-estate/title/oc-summary/oc-meta.astro",
    "38b3": "legal-estate/title/oc-summary/oc-owners.astro",
    "38b4": "legal-estate/title/oc-summary/oc-charges-main.astro",
    "38b5": "legal-estate/title/oc-summary/oc-charges-other.astro",
    "38b6": "legal-estate/title/oc-summary/oc-notices-main.astro",
    "38b7": "legal-estate/title/oc-summary/oc-notices-other.astro",
    "38c": "legal-estate/title/oc-full.astro",
    "38d": "legal-estate/ownership/freehold.astro",
    "38e": "legal-estate/ownership/leasehold/index.astro",
    "38e1": "legal-estate/ownership/leasehold/lease-term.astro",
    "38e2": "legal-estate/ownership/leasehold/lease-contacts-list.astro",
    "38e3": "legal-estate/ownership/leasehold/lease-contacts-roles.astro",
    "38e4": "legal-estate/ownership/leasehold/lease-management.astro",
    "38e5": "legal-estate/ownership/leasehold/lease-rent.astro",
    "38e6": "legal-estate/ownership/leasehold/lease-charges/index.astro",
    "38e6a": "legal-estate/ownership/leasehold/lease-charges/service-charge.astro",
    "38e6b": "legal-estate/ownership/leasehold/lease-charges/buildings-insurance.astro",
    "38e7": "legal-estate/ownership/leasehold/lease-legal/index.astro",
    "38e7a": "legal-estate/ownership/leasehold/lease-legal/consents-alterations.astro",
    "38e7b": "legal-estate/ownership/leasehold/lease-legal/restrictions-enfranchisement.astro",
    "38e7c": "legal-estate/ownership/leasehold/lease-legal/building-safety.astro",
    "38e7d": "legal-estate/ownership/leasehold/lease-legal/lease-transfer.astro",
    "38e8": "legal-estate/ownership/leasehold/lease-misc/index.astro",
    "38e8a": "legal-estate/ownership/leasehold/lease-misc/disputes.astro",
    "38e8b": "legal-estate/ownership/leasehold/lease-misc/general.astro",
    "38e8c": "legal-estate/ownership/leasehold/lease-misc/required-docs.astro",
    "38f": "legal-estate/ownership/managed/index.astro",
    "38f1": "legal-estate/ownership/managed/contacts.astro",
    "38f2": "legal-estate/ownership/managed/transfer.astro",
    "38f3": "legal-estate/ownership/managed/service-charge.astro",
    "38f4": "legal-estate/ownership/managed/insurance.astro",
    "38f5": "legal-estate/ownership/managed/disputes-docs.astro",
    "38g": "legal-estate/boundaries-rights.astro",
    "39": "built-form/index.astro",
    "39a": "built-form/built-form-form.astro",
    "39b": "built-form/condition.astro",
    "39c": "built-form/fixtures/index.astro",
    "39c1": "built-form/fixtures/fixtures-summary.astro",
    "39c2": "built-form/fixtures/basic.astro",
    "39c3": "built-form/fixtures/kitchen.astro",
    "39c4": "built-form/fixtures/bathroom.astro",
    "39c5": "built-form/fixtures/carpets.astro",
    "39c6": "built-form/fixtures/curtains.astro",
    "39c7": "built-form/fixtures/lights.astro",
    "39c8": "built-form/fixtures/units.astro",
    "39c9": "built-form/fixtures/outdoor.astro",
    "39c10": "built-form/fixtures/services.astro",
    "39d": "built-form/surveys/index.astro",
    "39d1": "built-form/surveys/meta.astro",
    "39d2": "built-form/surveys/grounds.astro",
    "39d3": "built-form/surveys/inside-structure.astro",
    "39d4": "built-form/surveys/inside-features.astro",
    "39d5": "built-form/surveys/inside-finishes.astro",
    "39d6": "built-form/surveys/outside-roof.astro",
    "39d7": "built-form/surveys/outside-envelope.astro",
    "39d8": "built-form/surveys/outside-extras.astro",
    "39d9": "built-form/surveys/services-energy.astro",
    "39d10": "built-form/surveys/services-water.astro",
    "39d11": "built-form/surveys/legal.astro",
    "39d12": "built-form/surveys/valuation.astro",
    "39d13": "built-form/surveys/advice.astro",
    "39e": "built-form/valuation.astro",
    "45": "utilities-energy.astro",
    "46": "local-context/index.astro",
    "46a": "local-context/con29r/index.astro",
    "46a1": "local-context/con29r/identity.astro",
    "46a2": "local-context/con29r/searches/index.astro",
    "46a2a": "local-context/con29r/searches/planning-building.astro",
    "46a2b": "local-context/con29r/searches/roads.astro",
    "46a2c": "local-context/con29r/searches/other-planning-notices.astro",
    "46a2d": "local-context/con29r/searches/other-finance.astro",
    "46a2e": "local-context/con29r/searches/other-road-rail.astro",
    "46a2f": "local-context/con29r/searches/other-environmental.astro",
    "46a2g": "local-context/con29r/searches/other-compulsory.astro",
    "46a4": "local-context/con29r/listing-conservation.astro",
    "46c": "local-context/llc1.astro",
    "46d": "local-context/environmental/index.astro",
    "46d1": "local-context/environmental/flooding.astro",
    "46d2": "local-context/environmental/mining-ground.astro",
    "46d3": "local-context/environmental/pollution-radon.astro",
    "46d4": "local-context/environmental/coast-climate.astro",
    "46d5": "local-context/environmental/infra-policy.astro",
    "47": "encumbrances/index.astro",
    "47a": "encumbrances/council-tax-insurance.astro",
    "47b": "encumbrances/guarantees.astro",
    "47c": "encumbrances/occupiers-notices.astro",
    "47d": "encumbrances/letting-completion.astro",
    "48": "evidence/index.astro",
    "48a": "evidence/documents.astro",
    "48b": "evidence/declarations.astro",
    "48c": "evidence/additional.astro",
    "48d": "evidence/disputes.astro",
    "48e": "evidence/specialist.astro",
    "49": "overlays-tasks.astro",
}


def page_url(slot: str) -> str:
    """The real Astro route for a page slot — converts a PAGE_FILES file path
    ("legal-estate/title/oc-summary/index.astro") into the URL Astro serves it
    at ("/schema/legal-estate/title/oc-summary"), per astro.config.mjs's
    format:'directory' + trailingSlash:'never' convention. Cross-page hrefs
    (breadcrumb ancestors, "Contains ->" children links) must use this, not
    the raw PAGE_FILES value — a real file path is not a real URL."""
    rel = PAGE_FILES[slot].rsplit(".", 1)[0]
    rel = re.sub(r"(^|/)index$", "", rel)
    return "/schema" + (f"/{rel}" if rel else "")


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


def load_dama_ka() -> dict[str, dict]:
    """Path -> {category, kas, primary} from scripts/dama-ka-mapping.json
    (ADR-0005 B1). Added to schema pages by hand after the original
    generator ran (commit e70d2b3) — restoring it here so regenerating a
    page doesn't silently drop the DAMA-DMBOK2 Knowledge Area line."""
    if not DAMA_KA_MAPPING.exists():
        return {}
    data = json.loads(DAMA_KA_MAPPING.read_text())
    return {p["path"]: p for p in data.get("pages", []) if p.get("path")}


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
                descriptions: dict[str, str] | None = None,
                dama_ka: dict[str, dict] | None = None) -> str:
    page_cfg = theme["pages"][slot]
    # Sidecar markdown filenames still use the OLD numbered convention
    # ("37-property.md") — unrelated to the Astro output path rename, so
    # glob for it directly rather than reconstruct the exact suffix from
    # the (now differently-shaped) PAGE_FILES value.
    md_matches = sorted(CONTENT_DIR.glob(f"{slot}-*.md"))
    md_path = md_matches[0] if md_matches else CONTENT_DIR / f"{slot}-missing.md"
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
            # Page-unique id so a specific FIELD (not just its containing
            # object) can be linked to and scrolled to directly.
            "anchor": object_model.leaf_anchor(leaf["path"]),
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

    # Sentinel for objects that render on the page but don't conceptually
    # belong to any of its real, named sections — the page root and any
    # ancestor container that exists only so a deeper section's own prefix
    # has somewhere to live. Previously these were silently folded into
    # sections_cfg[0]'s bucket (e.g. "Address"), which misrepresented that
    # section's actual contents — a design critique caught this directly on
    # /schema/property, where "Address" opened with Transaction and Property
    # Pack object blocks that have nothing to do with address.
    _ANCESTOR = "__ancestor__"

    def section_for_object(obj_path: str) -> str | None:
        if obj_path == "":
            return _ANCESTOR
        for prefix, sec_id in sec_index:
            if obj_path == prefix or obj_path.startswith(prefix + ".") \
               or obj_path.startswith(prefix + "["):
                return sec_id
        # Ancestor container: a section prefix descends from this object.
        for prefix, _ in sec_index:
            if prefix.startswith(obj_path + ".") or prefix.startswith(obj_path + "["):
                return _ANCESTOR
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
                c["href"] = f"{page_url(home)}#{c['id'].lower()}"
            else:
                c["href"] = f"#{c['id'].lower()}"

    # Real, clickable ancestor breadcrumb per object (e.g. "Transaction ›
    # Property Pack › Address") — walks the parent chain object_model.py
    # already computes, resolving each ancestor's href with the identical
    # same-page/cross-page/unrendered logic used for `children` above.
    # Replaces a single small, non-clickable path string that gave no real
    # sense of depth or a way to jump to an ancestor.
    def build_breadcrumb(obj_path: str) -> list[dict]:
        crumbs: list[dict] = []
        cur = by_path.get(obj_path, {}).get("parent")
        while cur is not None:
            anc = by_path.get(cur)
            if anc is None:
                break
            home = (obj_to_page or {}).get(cur)
            if cur in locally_rendered:
                href = f"#{anc['id'].lower()}"
            elif home and home != slot and home in PAGE_FILES:
                href = f"{page_url(home)}#{anc['id'].lower()}"
            else:
                href = f"#{anc['id'].lower()}"
            crumbs.append({"display": anc["display"], "href": href})
            cur = anc.get("parent")
        crumbs.reverse()
        return crumbs

    for obj in page_objects:
        obj["breadcrumb"] = build_breadcrumb(obj["path"])

    # De-duplicate leaf anchors within the page. Some JSON Schema paths are
    # genuinely walked more than once (a pre-existing leaves.json artefact,
    # not something this pass tries to fix — e.g. the same $ref'd sub-schema
    # visited twice), which collides two rows onto one leaf_anchor() value.
    # HTML ids must be document-unique, so give every collision after the
    # first a disambiguating -2/-3/... suffix rather than emit an invalid
    # duplicate id.
    seen_anchors: dict[str, int] = {}
    for obj in page_objects:
        for f in obj.get("fields", []):
            base = f.get("anchor")
            if not base:
                continue
            seen_anchors[base] = seen_anchors.get(base, 0) + 1
            if seen_anchors[base] > 1:
                f["anchor"] = f"{base}-{seen_anchors[base]}"

    grouped_objs: dict[str, list[dict]] = {}
    ancestor_objs: list[dict] = []
    for obj in page_objects:
        sec_id = section_for_object(obj["path"])
        if sec_id is None:
            continue
        if sec_id == _ANCESTOR:
            ancestor_objs.append(obj)
            continue
        grouped_objs.setdefault(sec_id, []).append(obj)
    ancestor_objs.sort(key=lambda o: (o["path"].count("."), o["path"]))
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

    # Template
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(TEMPLATES)),
        extensions=["jinja2.ext.loopcontrols"],
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    # A value going into Astro frontmatter (title="...", description="...")
    # is a JS/TS string literal, NOT an HTML attribute — it must NOT be
    # HTML-escaped there (Astro does its own HTML-escaping when it later
    # interpolates the value into the real <title>/<meta> tags). The
    # previous template used Jinja's `|e` (HTML-escape) filter on frontmatter
    # values, producing a real, confirmed double-escaping bug on the live
    # site (schema&amp;#39;s in a description attribute — visibly broken in
    # page source / link previews). json.dumps() correctly quotes + escapes
    # for a JS string literal instead.
    env.filters["astro_str"] = lambda s: json.dumps(s or "", ensure_ascii=False)
    tmpl = env.get_template("aggregate-page.html.j2")
    ctx = {
        "page": {
            "slot": slot,
            "id": PAGE_IDS.get(slot, f"schema-{slot}"),
            "title": page_cfg["title"],
            "voice": page_cfg.get("voice", "reference-prose-with-opinion"),
            "generated_on": str(date.today()),
            "dama_ka": (dama_ka or {}).get(f"src/pages/schema/{PAGE_FILES[slot]}", {}).get("kas") or [],
        },
        "regions": regions,
        "sections": sections,
        "ancestor_objects": ancestor_objs,
        "stats": stats,
        "show_envelopes": page_cfg.get("show_envelopes", False),
    }
    return tmpl.render(**ctx)


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
    dama_ka = load_dama_ka()

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
                           obj_to_page=obj_to_page, descriptions=descriptions, dama_ka=dama_ka)
        out = OUT_PAGES / PAGE_FILES[slot]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html)
        print(f"wrote {out}  ({len(by_page[slot])} leaves)")

    # Refresh the ER entity registry consumed by the in-page click handler.
    registry_script = Path(__file__).parent / "build-er-registry.py"
    if registry_script.exists():
        subprocess.run([sys.executable, str(registry_script)], check=True)


if __name__ == "__main__":
    main()
