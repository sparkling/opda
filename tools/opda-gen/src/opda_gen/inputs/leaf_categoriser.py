"""
Module leaf_categoriser.

Realises:
- ODR-0022 §2 gate G1 — the **path-aware** leaf→category rule. Every
  annotated base descriptive leaf (`source == "pdtf-transaction"`, a true
  leaf carrying a `title`) is binned into exactly one of the seven property
  categories A–G using the FULL PATH, never the last segment. The
  acceptance case it MUST satisfy: `propertyPack.priceInformation.price`
  bins to **G** (the headline asking price) while
  `propertyPack.fixturesAndFittings.*.price` bins to **D** (chattel price).
- ODR-0022 §3 — the regulatory-salience carve-out. A generic-tailed leaf
  (`details` / `result`) whose ancestor question is regulator-named
  (Building Safety, cladding/EWS1, spray-foam, Japanese knotweed, a named
  CON29 / environmental peril, an EPC / council-tax value-space) is lifted
  to **G** regardless of its tail: generic *shape* collapses, regulatory
  *substance* does not.
- ODR-0022 §5 — the residue register. Categories A–F are not exhaustive by
  construction; G is the default. A leaf that reaches G by fall-through and
  carries a generic prose tail (i.e. it was only kept out of A by the
  salience carve-out, or has no clean positive signal) is *flagged* into the
  residue register for the WG curation pass. "Collapsed" means *recorded as
  collapsed* — nothing is silently dropped.

BOUNDARY (ODR-0022 §Rules, this module's remit): this module produces the
candidate Category-G set as **data** and the residue register. It mints no
`opda:` IRIs, emits no TTL, and touches no byte-identity surface — it emits
no ontology triples. It does NOT decide Category E's UFO commitment or D's
inclusion-Mode; it only bins leaves into categories.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

# --------------------------------------------------------------------------
# Rule vocabularies (ODR-0022 §1 taxonomy + §3 carve-out). Path-aware:
# every test below inspects segments of the FULL path, never just the tail.
# --------------------------------------------------------------------------

# B — evidence / attachment envelope tails (ODR-0009 reuse target).
_B_TAILS = frozenset(
    {
        "attachments",
        "fileName",
        "filename",
        "supportingDocuments",
        "fileType",
        "fileSize",
        "documentType",
        "mimeType",
    }
)

# D — anything under the fixtures-&-fittings chattel checklist (§4 split).
_D_CONTAINER = "fixturesAndFittings"

# E — the six-field search / environmental risk-result structure (§1 row E),
# recognised only INSIDE a search/environmental container so a stray
# `summary` / `result` elsewhere is not mis-pulled into E.
_E_FIELDS = frozenset(
    {
        "riskIndicator",
        "actionAlertRating",
        "result",
        "summary",
        "recommendations",
        "datasetAttribution",
    }
)
_E_CONTAINERS = ("localSearches", "environmentalIssues", "searches")

# F — identity / address / contact / geo sub-fields, modelled upstream
# (ODR-0015 Address, ODR-0006 Agents). Never re-mint.
_F_TAILS = frozenset(
    {
        "line1",
        "line2",
        "line3",
        "line 3",
        "line4",
        "line 4",
        "town",
        "postcode",
        "county",
        "country",
        "countryCode",
        "buildingNumber",
        "buildingName",
        "subBuilding",
        "street",
        "homeNation",
        "department",
        "poBox",
        "localityName",
        "dependentLocality",
        "dependentStreet",
        "administrativeArea",
        "udprn",
        "latitude",
        "longitude",
        "lat",
        "lng",
        "easting",
        "northing",
        "email",
        "emailAddress",
        "phone",
        "telephone",
        "phoneNumber",
        "mobile",
        "fax",
        "website",
        "firstName",
        "lastName",
        "middleName",
        "maidenName",
        "preferredName",
        "nameOrOrganisation",
    }
)

# A — generic prose-elaboration tails (one reusable annotation property).
_A_TAILS = frozenset(
    {
        "details",
        "comments",
        "comment",
        "summary",
        "additionalInformation",
        "furtherInformation",
        "notes",
        "otherDetails",
    }
)

# §3 regulatory-salience carve-out — generic tails (`details`/`result`)
# under one of these regulator-named ancestors are lifted to G. Matched as
# lowercased substrings against the joined ancestor path.
_SALIENT_TAILS = frozenset({"details", "result"})
_REGULATOR_FRAGMENTS = (
    "buildingsafety",
    "cladding",
    "sprayfoam",
    "knotweed",
    "radon",
    "flood",
    "contaminat",
    "coalmining",
    "subsidence",
    "counciltax",
    "epc",
    "energyrating",
    "con29",
)

# C-vs-G structural rule (ODR-0024 R5 / council session-028 Q9, replacing the
# S025 seven-name `_G_PROPERTY_QUALE_TAILS` allow-list). The boundary the
# council settled: a value-space that is a CROSS-CUTTING STATUS FLAG reused
# across unrelated contexts → C; a SUBSTANTIVE Property/estate Quality or
# Substance-Kind-label whose value-space is enumerated → G, with the enum as its
# SKOS range. The old allow-list silently dropped every future enum-bearing
# Quale whose tail it did not list (it under-counted candidate-G by ~50). The
# structural rule below keys on two signals — the generic-ENVELOPE-tail signal
# (mirroring `_A_TAILS` / `_B_TAILS` / `_E_FIELDS`) and the cross-cutting
# VALUE-SPACE-FAMILY signal — so the C set is the genuinely cross-cutting
# envelopes and EVERYTHING ELSE enum-bearing is a substantive G attribute
# (the enum becomes its SKOS range). ODR-0008 §Q5a / ODR-0022 §1 names the
# flagship Quale attributes (EPC band, council-tax band, built form, …) as G
# "even if it carries an enum"; they now fall out of the structural rule rather
# than needing to be listed.

# (a) Generic cross-cutting ENVELOPE / status tails — a reusable slot whose
# value-space is a status flag carried across many unrelated questions (the
# substantive question is elsewhere, like the Category-A `details` tail). These
# are C regardless of path. NOT substantive Property facts: `hasBeenFlooded` /
# `isInsured` / `isSharedOwnership` carry their question IN the name and are G.
_C_STATUS_ENVELOPE_TAILS = frozenset(
    {
        "status",            # polysemous search / plan / road-adoption status
        "yesNo",             # the bare Yes/No envelope slot
        "units",             # unit-of-measure envelope
        "feeType",           # fee-type envelope (reused across fee blocks)
        "mediaType",         # media envelope
        "capacity",          # seller's-capacity envelope (Method/plan code)
        "role",              # participant-role envelope (anti-rigid Role)
        "appointedBy",       # appointed-by envelope
        "isProposal",        # plan proposal/decision envelope
        "paymentFrequency",  # generic payment-frequency envelope
        "rentFrequency",
        "sharedOwnershipRentFrequency",
        "listingType",       # marketing listing-type envelope
        "disposal",          # disposal-type envelope
        "title",             # name/title envelope (Mr/Mrs/…)
        "front", "rear", "left", "right",  # directional boundary-side flags
    }
)

# (b) Cross-cutting VALUE-SPACE families — value-sets that are themselves a
# status/role envelope reused across leaves, recognised by the enum members
# (not the tail). Two families cover the corpus: document/attachment-supply
# status (any enum carrying "Attached" / "To follow") and the managed-area
# responsibility-PAYEE set (Landlord / Management Company / Managing Agent /
# Rentcharge Owner). A leaf whose enum is one of these families is C even if its
# tail is substantive-looking (e.g. `deedOfCovenant` = Attached/To follow/… is a
# document-supply envelope, NOT a Property Quality).
_C_SUPPLY_VALUE_TOKENS = frozenset({"attached", "to follow"})
_C_RESPONSIBILITY_PAYEES = frozenset(
    {"management company", "managing agent", "rentcharge owner", "landlord"}
)


def _is_cross_cutting_value_space(enum: list | tuple | None) -> bool:
    """True when an enum value-set is a cross-cutting status/role family (C).

    The structural VALUE-SPACE signal of ODR-0024 R5: a value-set that is a
    document/attachment-supply envelope (carries "Attached" / "To follow") or
    the managed-area responsibility-payee set is a cross-cutting status flag,
    not a substantive Property/estate Quality — so it bins to C even under a
    Property/estate path.
    """
    if not enum:
        return False
    lowered = {str(v).strip().lower() for v in enum}
    if lowered & _C_SUPPLY_VALUE_TOKENS:
        return True
    core = lowered - {"not applicable", "not known"}
    if core and core <= _C_RESPONSIBILITY_PAYEES:
        return True
    return False


@dataclass(frozen=True)
class CategorisedLeaf:
    """One binned leaf. `category` is a single letter A–G."""

    leaf_path: str
    name: str
    title: str | None
    category: str
    is_residue: bool


@dataclass(frozen=True)
class BinningReport:
    """The counted assignment + the two WG-curation targets (ODR-0022 §1/§5)."""

    leaves: tuple[CategorisedLeaf, ...]
    counts: dict[str, int]
    candidate_g_names: tuple[str, ...]
    residue: tuple[CategorisedLeaf, ...]


def _segments(leaf_path: str) -> list[str]:
    """Split a leaf path into dotted segments, dropping `[]` array markers."""
    return leaf_path.replace("[]", "").split(".")


def categorise(
    leaf_path: str, *, has_enum: bool, enum: list | tuple | None = None
) -> str:
    """Bin a single leaf into a category A–G using the FULL path (gate G1).

    `has_enum` flags that the leaf carries an enumerated value-space; `enum`
    (optional) is the value-set itself, consulted by the ODR-0024 R5 structural
    C-vs-G rule to recognise cross-cutting VALUE-SPACE families (document-supply
    / responsibility-payee). When `enum` is None the rule falls back to the
    tail-only signal — sound for the acceptance cases (a bare envelope tail is C;
    a substantive tail is G) but the value-space family signal needs the members.

    The C-vs-G boundary (ODR-0024 R5, replacing the S025 allow-list): a leaf
    carrying an enum is C only when its value-space is a cross-cutting STATUS
    FLAG — a generic envelope tail (`_C_STATUS_ENVELOPE_TAILS`) OR a cross-cutting
    value-space family (`_is_cross_cutting_value_space`). Otherwise it is a
    SUBSTANTIVE Property/estate Quality or Substance-Kind-label and bins to G,
    the enum becoming its SKOS range (ODR-0008 §Q5a / ODR-0022 §1 — G "even if it
    carries an enum"). Rules are tried most-specific first; G is the default.
    """
    segments = _segments(leaf_path)
    tail = segments[-1]

    # B — evidence / attachment envelope.
    if tail in _B_TAILS:
        return "B"

    # D — fixtures-&-fittings chattel checklist (the §4 Object/Mode split).
    # Path-aware: this is what bins `fixturesAndFittings.*.price` to D while
    # `priceInformation.price` falls through to G (gate G1 acceptance case).
    if _D_CONTAINER in segments:
        return "D"

    # E — the six-field search / environmental risk-result structure.
    if tail in _E_FIELDS and any(c in segments for c in _E_CONTAINERS):
        return "E"

    # F — identity / address / contact / geo, settled upstream.
    if tail in _F_TAILS:
        return "F"

    # §3 salience carve-out — regulator-named generic tail → G, not A/E.
    if tail in _SALIENT_TAILS:
        ancestor = " ".join(segments[:-1]).lower()
        if any(frag in ancestor for frag in _REGULATOR_FRAGMENTS):
            return "G"

    # A — generic prose-elaboration tail.
    if tail in _A_TAILS:
        return "A"

    # C — cross-cutting status flag (ODR-0024 R5 structural rule, replacing the
    # S025 allow-list). A leaf with an enum is C ONLY when its value-space is a
    # cross-cutting status flag: a generic envelope tail, or a cross-cutting
    # value-space family (document-supply / responsibility-payee). A substantive
    # enum-bearing Property/estate attribute falls THROUGH to G (the default),
    # the enum becoming its SKOS range — never Category-C membership.
    if has_enum and (
        tail in _C_STATUS_ENVELOPE_TAILS
        or _is_cross_cutting_value_space(enum)
    ):
        return "C"

    # G — genuine descriptive concept (the default; the curated per-leaf walk).
    return "G"


def _is_residue(leaf_path: str, category: str) -> bool:
    """Flag a G leaf as residue when its binning rests on no clean signal.

    A leaf is residue (ODR-0022 §5) when it landed in G by fall-through yet
    carries a generic prose tail — i.e. it survived Category A only via the
    §3 salience carve-out. These are the boundary cases the WG must confirm,
    recorded rather than silently absorbed into the curated G set.
    """
    if category != "G":
        return False
    return _segments(leaf_path)[-1] in _SALIENT_TAILS


def _is_annotated_base_leaf(
    path: str, source: str | None, title: str | None, parents: set[str]
) -> bool:
    """True for a true-leaf annotated base descriptive leaf (ODR-0022 §1 scope).

    Scope: `source == "pdtf-transaction"`, carries a `title`, and is a true
    leaf (not a prefix-parent of any other path in the corpus).
    """
    return source == "pdtf-transaction" and bool(title) and path not in parents


def _parent_paths(records: list[dict]) -> set[str]:
    """Set of paths that are a prefix-parent of some other path.

    A path P is a parent of Q when Q starts with `P.` or `P[` — the two
    separators used in the canonical leaf paths.
    """
    base_paths = [r["path"] for r in records if r.get("source") == "pdtf-transaction"]
    base_paths.sort()
    parents: set[str] = set()
    # Adjacent-pair scan over the sorted list catches the parent relation:
    # any path that is a prefix (at a `.`/`[` boundary) of a later path.
    for i, path in enumerate(base_paths):
        dot = path + "."
        bracket = path + "["
        for other in base_paths[i + 1 :]:
            if other.startswith(dot) or other.startswith(bracket):
                parents.add(path)
            elif not other.startswith(path):
                # Sorted order: once `other` no longer shares the prefix at
                # all, no later path can either.
                break
    return parents


def categorise_all(records: list[dict]) -> BinningReport:
    """Bin every annotated base descriptive leaf and assemble the report.

    Returns the per-leaf assignment, per-category counts, the distinct
    candidate Category-G names (the WG curation target), and the residue
    register — all deterministically sorted.
    """
    parents = _parent_paths(records)
    binned: list[CategorisedLeaf] = []
    for rec in records:
        path = rec.get("path")
        if not path:
            continue
        if not _is_annotated_base_leaf(
            path, rec.get("source"), rec.get("title"), parents
        ):
            continue
        category = categorise(
            path, has_enum=bool(rec.get("enum")), enum=rec.get("enum")
        )
        binned.append(
            CategorisedLeaf(
                leaf_path=path,
                name=rec.get("name") or _segments(path)[-1],
                title=rec.get("title"),
                category=category,
                is_residue=_is_residue(path, category),
            )
        )

    binned.sort(key=lambda lf: lf.leaf_path)

    counts: dict[str, int] = {c: 0 for c in "ABCDEFG"}
    for leaf in binned:
        counts[leaf.category] += 1

    candidate_g_names = tuple(
        sorted({lf.name for lf in binned if lf.category == "G"})
    )
    residue = tuple(lf for lf in binned if lf.is_residue)

    return BinningReport(
        leaves=tuple(binned),
        counts=counts,
        candidate_g_names=candidate_g_names,
        residue=residue,
    )


def load_records(path: Path) -> list[dict]:
    """Load the canonical data dictionary as a list of leaf records."""
    return json.loads(path.read_text(encoding="utf-8"))


def report_to_dict(report: BinningReport) -> dict:
    """Render a BinningReport as a deterministic, sorted JSON-ready dict."""
    return {
        "counts": {c: report.counts[c] for c in "ABCDEFG"},
        "total": sum(report.counts.values()),
        "candidate_g": {
            "distinct_name_count": len(report.candidate_g_names),
            "names": list(report.candidate_g_names),
        },
        "residue": {
            "count": len(report.residue),
            "leaves": [
                {"leaf_path": lf.leaf_path, "name": lf.name, "category": lf.category}
                for lf in report.residue
            ],
        },
        "assignment": [
            {
                "leaf_path": lf.leaf_path,
                "name": lf.name,
                "category": lf.category,
                "is_residue": lf.is_residue,
            }
            for lf in report.leaves
        ],
    }


def _default_data_dictionary() -> Path:
    """Resolve `source/00-deliverables/semantic-models/data-dictionary-canonical.json`.

    Walks upward from this module looking for the OPDA repo root (a directory
    holding both `.git` and `source/00-deliverables/`), mirroring the locator
    convention in `cli.py`. Falls back to the CWD-relative path.
    """
    here = Path(__file__).resolve()
    rel = Path("source") / "00-deliverables" / "semantic-models" / (
        "data-dictionary-canonical.json"
    )
    for parent in here.parents:
        if (parent / ".git").exists() and (parent / "source" / "00-deliverables").exists():
            return parent / rel
    return Path.cwd() / rel


def _default_output() -> Path:
    """Resolve the report output path under the semantic-models directory."""
    return _default_data_dictionary().with_name("descriptive-category-binning.json")


def main() -> None:
    """Bin the canonical leaves and write the deterministic binning report.

    Exposed for the `categorise-leaves` CLI command (ODR-0022 §G1). Writes
    `descriptive-category-binning.json` next to the canonical dictionary and
    echoes the per-category counts + candidate-G size to stdout.
    """
    data_path = _default_data_dictionary()
    out_path = _default_output()
    report = categorise_all(load_records(data_path))
    out_path.write_text(
        json.dumps(report_to_dict(report), indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
    )
    counts = report.counts
    total = sum(counts.values())
    line = "  ".join(f"{c}={counts[c]}" for c in "ABCDEFG")
    print(f"categorised {total} annotated base leaves: {line}")
    print(f"candidate Category-G distinct names: {len(report.candidate_g_names)}")
    print(f"residue register: {len(report.residue)} leaves")
    print(f"report: {out_path}")


if __name__ == "__main__":
    main()
