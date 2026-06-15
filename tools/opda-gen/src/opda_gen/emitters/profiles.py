"""
Module profiles.

Realises:
- ADR-0013 §"Profile emission template" — overlay profile shapes graph
  with `owl:Ontology` header + `opda:ValidationContext` reification +
  per-class SHACL `sh:NodeShape`s carrying `sh:property` blocks +
  per-class `sh:xone` patterns for nested `oneOf` discriminators +
  DASH UI predicates per ODR-0010 §Q4 + form-question `dct:source` IRIs
  per ODR-0010 §Q3.
- ADR-0013 §"Three-rule interface contract — CI enforcement" — every
  emitted overlay profile honours the three rules (sh:in semantics;
  sh:Violation floor; no-identity-override gate). Enforced by
  `tools/opda-gen/src/opda_gen/ci/profile_contract_test.py`.
- ADR-0013 §"`dct:source` form-question IRI minting" — every property
  shape carries `dct:source <https://www.basp.uk/forms/baspi5#...>`.
- ADR-0013 G11 closure (bundled) — BASPI5-required DatatypeProperties
  emit in opda-property.ttl / opda-agent.ttl per ODR-0008 §Q5a binding
  table; this module's per-class shapes bind them to schemes via
  `sh:in` (no new predicates declared here — declarations live in the
  TBox modules).
- ADR-0014 G19 closure — four BASPI5 form-question anchors realigned
  against the actual `baspi5Ref` values in
  `source/03-standards/schemas/src/schemas/v3/overlays/baspi5.json`:
  the Property shape's overall anchor `A1` → `A1.1` (the property's
  primary address anchor — there is no A1-only baspi5Ref); spray-foam
  `A1.8.7` → `A1.8.4.1` (`sprayFoamInsulation.hasSprayFoamInstalled`);
  supply-meter `A7.5.1` → `B4.6.2` (`waterAndDrainage.water.mainsWater.`
  `waterMeter.isSupplyMetered`); seller name `B1.2` → `B1.1` (the
  legal-owners namesOfLegalOwners level — no participants[].name
  baspi5Ref exists). All four now exact-match a baspi5Ref value.
- ADR-0008 §"CLI design" — `emit-profile <overlay>` subcommand.
- ADR-0007 §"Deterministic emission rules" — canonical serialiser
  produces byte-identical output across runs.
- ODR-0010 §Rules + §Q1 (ValidationContext reification) + §Q3
  (dct:source form-question IRIs) + §Q4 (DASH UI) + §Q5
  (oneOf → sh:xone) + §Q6 (no-identity-override) + §Q7 (BASPI5 round-trip).

Pipeline:
  1. Load BASPI5 JSON schema (`source/03-standards/schemas/src/schemas/v3/
     overlays/baspi5.json`).
  2. Build per-class shapes (Baspi5_PropertyShape, Baspi5_AddressShape,
     Baspi5_LegalEstateShape, Baspi5_SellerShape, etc.) by walking
     well-known top-level structures in the schema + the SKOS scheme
     registry.
  3. Build `opda:ValidationContext` reification node with 5 properties.
  4. Build DASH `sh:PropertyGroup` instances for the major form sections.
  5. Build `sh:xone` shape for the sellersCapacity nested oneOf.
  6. Serialise via canonical serialiser; prepend generator-comment header.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

from opda_gen import __version__
from opda_gen.namespaces import OPDA, OPDA_HARNESS, OPDA_SHAPE
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces -----------------------------------------------------------
SH = Namespace("http://www.w3.org/ns/shacl#")
DASH = Namespace("http://datashapes.org/dash#")
PROV = Namespace("http://www.w3.org/ns/prov#")


# --- Sentinel-pinned constants per ADR-0013 + G6 convention --------------
# ADR-0014 G19 + foundation version bump (0.4.0 → 1.0.0) makes the BASPI5
# profile regenerate with new owl:imports + 4 corrected dct:source anchors.
_PROFILE_LAST_MODIFIED = "2026-05-30"
_PROFILE_SOURCE_COMMIT = "pinned-by-ADR-0029"


# --- BASPI5 form-question authority -------------------------------------
BASPI5_FORMS_AUTHORITY = "https://www.basp.uk/forms/baspi5"


def _baspi5_question(anchor: str) -> URIRef:
    """Mint a BASPI5 form-question URI per ODR-0010 §Q3 anchor pattern."""
    return URIRef(f"{BASPI5_FORMS_AUTHORITY}#{anchor}")


# --- ODR/ADR anchor URIs (dct:source on shapes) --------------------------
_ODR_0010 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Q1")
_ODR_0010_Q3 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Q3")
_ODR_0010_Q4 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Q4")
_ODR_0010_Q5 = URIRef("https://opda.org.uk/pdtf/harness/odr/ODR-0010/section-Q5")
_ADR_0013 = URIRef(
    "https://opda.org.uk/pdtf/harness/adr/ADR-0013-overlay-profile-emission"
)
_ADR_0029 = URIRef(
    "https://opda.org.uk/pdtf/harness/adr/"
    "ADR-0029-overlay-profile-emitter-generalisation-and-rollout"
)


# --- Profile catalogue ----------------------------------------------------
# 31 in-scope overlays (ADR-0029): baspi5 (full shapes) + 14 active-main +
# 16 NTS2 extension fragments. The 3 legacy editions (baspi4/nts/ntsl) are
# OUT OF SCOPE — never listed here (OPDA validates current-edition data).
_ACTIVE_MAIN_OVERLAYS = (
    "ta6", "ta7", "ta10", "lpe1", "fme1", "piq", "rds",
    "oc1", "llc1", "con29R", "con29DW", "sr24", "nts2", "ntsl2",
)
PROFILE_FILENAMES: dict[str, str] = {
    "baspi5": "baspi5.ttl",
    **{f: f"{f}.ttl" for f in _ACTIVE_MAIN_OVERLAYS},
    **{ext: f"{ext}.ttl" for ext in (
        "as", "dr", "er", "fd", "hi", "hs", "jk", "la",
        "ma", "mc", "oa", "oc", "sb", "sf", "sl", "tf",
    )},
}


# --- Overlay → community map (ADR-0029 work-item 2; S022) -----------------
# Per the governance directive (2026-05-30): the form↔community link is one
# standard `dct:subject` triple on the form graph's owl:Ontology header,
# pointing at the owning industry context concept in
# `opda:BoundedContextScheme` (emitted by emitters/contexts.py). NOT
# `opda:overlaysContext` / PROF (those are retired by S022). The 3 legacy
# editions (baspi4/nts/ntsl) are out of scope; Property Tech owns no
# overlay (base only). Extension fragments all sit in Estate Agency.
_MAIN_COMMUNITY: dict[str, str] = {
    "baspi5": "EstateAgencyContext",
    "nts2": "EstateAgencyContext",
    "ntsl2": "EstateAgencyContext",
    "ta6": "ConveyancingContext",
    "ta7": "ConveyancingContext",
    "ta10": "ConveyancingContext",
    "lpe1": "ConveyancingContext",
    "fme1": "MortgageLendingContext",
    "piq": "SurveyingContext",
    "rds": "PropertyDataServicesContext",
    "oc1": "PropertyDataServicesContext",
    "llc1": "PropertyDataServicesContext",
    "con29R": "PropertyDataServicesContext",
    "con29DW": "PropertyDataServicesContext",
    "sr24": "PropertyDataServicesContext",
}
_EXTENSION_OVERLAYS = (
    "as", "dr", "er", "fd", "hi", "hs", "jk", "la",
    "ma", "mc", "oa", "oc", "sb", "sf", "sl", "tf",
)
OVERLAY_COMMUNITY: dict[str, URIRef] = {
    **{ov: OPDA[ctx] for ov, ctx in _MAIN_COMMUNITY.items()},
    **{ext: OPDA.EstateAgencyContext for ext in _EXTENSION_OVERLAYS},
}


# --- ProfileSpec + generic builder (ADR-0029 work-item 1) ----------------
@dataclass(frozen=True)
class ProfileSpec:
    """Declarative per-form overlay-profile spec (ADR-0029).

    Per the S022 governance directive a form IS its SHACL overlay graph:
    the generic builder emits the `owl:Ontology` header + the one
    `dct:subject` community tag (the form↔community link) and — when a
    form supplies one — a `shape_builder` callback that adds the form's
    SHACL NodeShapes (form↔base via `sh:targetClass` + per-leaf
    constraints).

    The 30 non-BASPI5 forms ship with `shape_builder=None` (header +
    community only): their leaves have no `opda:` property paths to
    constrain until the descriptive-layer terms (ADR-0028) land — see the
    ADR-0029 implementation note. BASPI5 supplies its full shape logic via
    `shape_builder=_build_baspi5_shapes` and so routes through the same
    `_build_profile` path as every other form (ADR-0029 gap 2).

    `comment_header` selects the generator-comment block prepended to the
    serialised graph: the 30 thin forms use `_thin_comment_header`; BASPI5
    keeps its own `_comment_header` (the only field that still differs
    between BASPI5 and the thin forms).
    """

    form_id: str
    title: str
    description: str
    community: URIRef
    dct_source: URIRef
    shape_builder: Callable[[Graph, URIRef], None] | None = None
    comment_header: Callable[[str, str, str, str], str] | None = None

    def profile_iri(self) -> URIRef:
        # ADR-0006: profiles are normative-standard SHACL → /pdtf/shape/profiles/,
        # no version in the IRI.
        return OPDA_SHAPE[f"profiles/{self.form_id}"]

    def version_iri(self) -> URIRef:
        # owl:versionIRI → harness release snapshot (version out of the IRI path).
        return OPDA_HARNESS[f"release/profiles/{self.form_id}/0.1.0/"]


def _build_profile(spec: ProfileSpec) -> Graph:
    """Build an overlay-profile graph from a ``ProfileSpec`` (ADR-0029).

    Emits the shared `owl:Ontology` header (title, imports, versionIRI,
    `dct:source`) + the one `dct:subject` community triple, then delegates
    the form's SHACL shapes to ``spec.shape_builder`` when present.
    """
    g = Graph()
    g.bind("opda", OPDA)
    g.bind("sh", SH)
    g.bind("dash", DASH)
    g.bind("dct", DCTERMS)
    g.bind("rdf", RDF)
    g.bind("rdfs", RDFS)
    g.bind("owl", OWL)
    g.bind("skos", SKOS)
    g.bind("xsd", XSD)
    g.bind("prov", PROV)

    pi = spec.profile_iri()
    g.add((pi, RDF.type, OWL.Ontology))
    g.add((pi, DCTERMS.title, Literal(spec.title, lang="en")))
    g.add((pi, DCTERMS.description, Literal(spec.description, lang="en")))
    # ADR-0006: one collapsed ontology at …/pdtf/ (modules + vocab folded in).
    g.add((pi, OWL.imports, URIRef(str(OPDA))))
    g.add((pi, OWL.versionIRI, spec.version_iri()))
    g.add((pi, DCTERMS.source, spec.dct_source))
    # S022: the one form↔community link (no opda:overlaysContext / PROF).
    g.add((pi, DCTERMS.subject, spec.community))
    if spec.shape_builder is not None:
        spec.shape_builder(g, pi)
    return g


# --- The 30 non-BASPI5 forms (thin: header + community; ADR-0029) ---------
# Active-main titles use the standard UK form names; the 16 NTS2 extension
# fragment titles are read verbatim from each overlay JSON's `title`.
_MAIN_FORM_TITLES: dict[str, str] = {
    "ta6": "TA6 Property Information Form",
    "ta7": "TA7 Leasehold Information Form",
    "ta10": "TA10 Fittings and Contents Form",
    "lpe1": "LPE1 Leasehold Property Enquiries",
    "fme1": "FME1 Mortgage Valuation Enquiry",
    "piq": "PIQ Property Information Questionnaire",
    "rds": "RDS Residential Data Set",
    "oc1": "OC1 Official Copy of Register and Title Plan",
    "llc1": "LLC1 Local Land Charges Search",
    "con29R": "CON29R Local Authority Search (Required Enquiries)",
    "con29DW": "CON29DW Drainage and Water Enquiry",
    "sr24": "SR24 Survey Report",
    "nts2": "NTS2 Material Information",
    "ntsl2": "NTS2 Lettings Material Information",
}
_EXTENSION_TITLES: dict[str, str] = {
    "as": "Asbestos specialist issue",
    "dr": "Dry rot treatment specialist issue",
    "er": "Estate rentcharges for freehold properties",
    "fd": "Flood defence information",
    "hi": "Central heating installation date",
    "hs": "Health and safety specialist issue",
    "jk": "Japanese knotweed specialist issue",
    "la": "Loft access and details",
    "ma": "Managing agent contact details for leasehold",
    "mc": "Main construction type if standard form",
    "oa": "Outside areas extension for NTS",
    "oc": "Other property in chain dependency",
    "sb": "Subsidence or structural fault specialist issue",
    "sf": "Spray foam insulation",
    "sl": "Solar panels ownership details",
    "tf": "Transfer fees for leasehold",
}


# --- S034 enumeration scope (ADR-0029 gap-1) -----------------------------
# The 12 ref-carrying main forms enumerated by the bind-only-what-exists
# resolver. oc1/llc1 are ODR-0008d authority-retrieved register EXTRACTS
# (zero form-question refs is ontologically correct) — they stay THIN, held
# per S034 Q2 (re-open trigger: a register-data consumer query). The 16 NTS2
# extensions (all keyed on `ntsRef`) are also enumerated.
_ENUMERATED_MAIN_OVERLAYS: tuple[str, ...] = (
    "ta6", "ta7", "ta10", "lpe1", "fme1", "piq", "rds",
    "con29R", "con29DW", "sr24", "nts2", "ntsl2",
)
_THIN_MAIN_OVERLAYS: tuple[str, ...] = ("oc1", "llc1")


def _thin_description(title: str, community: URIRef) -> str:
    """Thin (header + community) description for oc1/llc1 — the two held
    ODR-0008d authority-retrieved register extracts (S034 Q2; held-as-live,
    Davis). Kept VERBATIM from the pre-S034 emission so oc1.ttl / llc1.ttl
    stay byte-identical (the S034 implementation regression gate). The
    re-typing as register artefacts is recorded in ODR-0008d / the session
    record, not minted into the thin TTL (it would break byte-identity)."""
    ctx = str(community).rsplit("/", 1)[-1]
    return (
        f"SHACL overlay profile for {title}. Per S022 (ODR-0010 / "
        f"ADR-0029) the SHACL overlay IS the form; this graph carries the "
        f"form-community link (dct:subject -> opda:{ctx}). Per-leaf "
        f"constraint shapes are added as the descriptive-layer terms "
        f"(ADR-0028) land to give the form's leaves opda: property paths "
        f"to constrain -- currently header + community only."
    )


def _enumerated_specs() -> dict[str, ProfileSpec]:
    """Build the enumerated (S034) ProfileSpecs: the 12 ref-carrying main
    forms + the 16 NTS2 extensions.

    Coverage is computed ONCE per form at spec-construction time (walking the
    overlay through the resolver) so the per-form gap register can be baked
    into the spec ``description`` (S034 Q4: emitted, literal). The
    ``shape_builder`` is a closure factory-bound to ``form_id`` that re-runs
    the enumeration onto the profile graph at emit time (deterministic — same
    inputs, same output).
    """
    from opda_gen.inputs.leaf_resolver import (
        bind,
        emitted_predicates,
        walk_form,
    )

    onto_dir = _default_ontology_dir_for_resolver()
    predicates = emitted_predicates(onto_dir)

    def _coverage(form_id: str) -> dict[str, object]:
        form = walk_form(form_id, _overlay_path(form_id))
        seen: set[str] = set()
        gaps: dict[str, list[str]] = {}
        bound = 0
        for leaf in form.leaves:
            if leaf.ref in seen:
                gaps.setdefault("ref-collision", []).append(leaf.leaf_path)
                continue
            seen.add(leaf.ref)
            pred = bind(leaf, predicates)
            if pred is not None:
                bound += 1
                continue
            from opda_gen.inputs.leaf_resolver import resolve
            resolved = resolve(leaf.name)
            if resolved not in predicates:
                gaps.setdefault("no-predicate", []).append(leaf.leaf_path)
            elif predicates[resolved].domain_iri is None:
                gaps.setdefault("no-domain", []).append(leaf.leaf_path)
            else:
                gaps.setdefault("collider-ambiguous", []).append(
                    leaf.leaf_path
                )
        return {
            "total": len(form.leaves),
            "bound": bound,
            "gapped": sum(len(v) for v in gaps.values()),
            "gaps_by_reason": gaps,
        }

    def _builder(form_id: str) -> Callable[[Graph, URIRef], None]:
        def build(g: Graph, profile_iri: URIRef) -> None:
            _build_enumerated_shapes_for(g, profile_iri, form_id)
        return build

    specs: dict[str, ProfileSpec] = {}
    for fid in _ENUMERATED_MAIN_OVERLAYS:
        title = _MAIN_FORM_TITLES[fid]
        community = OVERLAY_COMMUNITY[fid]
        cov = _coverage(fid)
        specs[fid] = ProfileSpec(
            form_id=fid,
            title=f"{title} overlay profile",
            description=_gap_register_description(title, cov),
            community=community,
            dct_source=_ADR_0029,
            shape_builder=_builder(fid),
            comment_header=_enumerated_comment_header,
        )
    for code, topic in _EXTENSION_TITLES.items():
        community = OVERLAY_COMMUNITY[code]
        title = f"NTS2 extension: {topic}"
        cov = _coverage(code)
        specs[code] = ProfileSpec(
            form_id=code,
            title=f"{title} overlay profile",
            description=_gap_register_description(title, cov),
            community=community,
            dct_source=_ADR_0029,
            shape_builder=_builder(code),
            comment_header=_enumerated_comment_header,
        )
    return specs


def _thin_specs() -> dict[str, ProfileSpec]:
    """Build the thin (header + community) non-BASPI5 ProfileSpecs.

    Per S034 only oc1/llc1 stay thin (ODR-0008d authority-retrieved register
    extracts, held). The 12 ref-carrying mains + 16 extensions are now
    ENUMERATED (`_enumerated_specs`)."""
    specs: dict[str, ProfileSpec] = {}
    for fid in _THIN_MAIN_OVERLAYS:
        title = _MAIN_FORM_TITLES[fid]
        community = OVERLAY_COMMUNITY[fid]
        specs[fid] = ProfileSpec(
            form_id=fid,
            title=f"{title} overlay profile",
            description=_thin_description(title, community),
            community=community,
            dct_source=_ADR_0029,
            comment_header=_thin_comment_header,
        )
    return specs


def _thin_comment_header(
    form_id: str, filename: str, emission_date: str, git_sha: str,
) -> str:
    """Generator-comment block for a thin (non-BASPI5) overlay profile."""
    lines = [
        f"# profiles/{filename} — {form_id} overlay profile",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://opda.org.uk/pdtf/harness/adr/"
        "ADR-0029-overlay-profile-emitter-generalisation-and-rollout",
        f"# Generator version: opda-gen-{__version__}",
        f"# Source commit: {git_sha}",
        "# Ratifying ODR(s): ODR-0010 (overlay-profile mechanism); ODR-0020 "
        "(form->community via dct:subject).",
        "# S022/ADR-0029: a form IS its SHACL overlay graph. This profile "
        "is THIN (header + community tag) pending the ADR-0028 descriptive-"
        "layer terms that give its leaves opda: property paths to constrain.",
        "",
    ]
    return "\n".join(lines) + "\n"


# --- S034 overlay-leaf enumerator (ADR-0029 gap-1) -----------------------
# The generic `shape_builder` that enumerates a ref-carrying overlay's
# *bindable* leaves into SHACL NodeShapes via the bind-only-what-exists
# resolver (opda_gen.inputs.leaf_resolver). Council session-034 ruling:
# "full coverage" = full coverage of the bindable set + an emitted per-form
# gap register. A GAPped leaf emits NO sh:path and NO dct:source (so the
# hard G3 gate stays green) but IS named in the form's gap register.
_OVERLAYS_SUBPATH = (
    "source/03-standards/schemas/src/schemas/v3/overlays"
)


def _overlays_dir() -> Path:
    """Resolve the PDTF v3 overlays directory (the nested upstream schemas
    repo). Walks upward from this module for the OPDA repo root (a dir with
    both `.git` and `source/03-standards/`), mirroring the cli.py locator.
    """
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (
            parent / "source" / "03-standards"
        ).exists():
            return parent / _OVERLAYS_SUBPATH
    return Path.cwd() / _OVERLAYS_SUBPATH


def _overlay_path(form_id: str) -> Path:
    """The overlay JSON path for ``form_id`` (extensions live one level down)."""
    from opda_gen.inputs.leaf_resolver import _EXTENSION_CODES

    base = _overlays_dir()
    if form_id in _EXTENSION_CODES:
        return base / "extensions" / f"{form_id}.json"
    return base / f"{form_id}.json"


def _title_form(form_id: str) -> str:
    """Title-case a form id for a shape IRI segment (ta6 -> Ta6, con29R ->
    Con29R, nts2 -> Nts2)."""
    return form_id[:1].upper() + form_id[1:]


def _local_name(iri: URIRef) -> str:
    return str(iri).rsplit("#", 1)[-1].rsplit("/", 1)[-1]


def _schema_leaf_source(schema_id: str, leaf_path: str) -> URIRef:
    """Build the JSON-pointer schema-leaf-path `dct:source` anchor.

    ODR-0022 §Rules.2 G2 (S034 amendment): a JSON-pointer into the overlay
    schema — `<schema $id>#/path/to/field` — is an admissible `dct:source`;
    it dereferences to the originating leaf and is NOT the deciding ODR. The
    dotted leaf_path is rendered as a JSON Pointer (`/seg/seg`).
    """
    pointer = "/" + leaf_path.replace(".", "/")
    return URIRef(f"{schema_id}#{pointer}")


def _maybe_scheme_members(
    range_local: str, enum: tuple[str, ...] | None,
) -> list[str] | None:
    """Return `sh:in` members for a bound leaf, or None.

    Only when the predicate's `rdfs:range` is an emitted `opda:*Scheme` that
    maps to a registry scheme AND the leaf carries an enum. The corpus
    currently emits NO `*Scheme`-ranged predicates (all ranges are XSD
    datatypes or value-structured classes), so this returns None in practice;
    kept for forward-correctness per the S034 spec. `_scheme_members` raises
    ValueError on an unknown scheme — caught here → omit `sh:in` on miss.
    """
    if not enum or not range_local.endswith("Scheme"):
        return None
    try:
        return _scheme_members(range_local)
    except ValueError:
        return None


def _build_enumerated_shapes_for(
    g: Graph, profile_iri: URIRef, form_id: str,
) -> dict[str, object]:
    """Enumerate a ref-carrying overlay's bindable leaves into NodeShapes.

    Returns a coverage dict (total ref leaves / bound / gapped-by-reason +
    the GAP list) so the spec builder can emit the per-form gap register and
    the caller can print coverage. Deterministic: leaves walked sorted by
    leaf_path; bound leaves grouped by target class; shapes + properties
    emitted in sorted order.

    Contract (S034 / ODR-0022 / ODR-0024):
    - bind each ref-bearing leaf via the resolver (else GAP);
    - one ref -> one sh:path (dedupe; never double-bind — the G3 hard gate
      fails on double-binds);
    - one sh:NodeShape per (form, target-class), IRI
      `opda:<TitleForm>_<TargetLocalName>Shape`, sh:targetClass <domain>;
    - each leaf -> _add_property_shape(path=<pred iri>, min_count=1 iff
      required, dct_source_iri=<JSON-pointer anchor>, severity sh:Violation,
      sh:in only on a scheme-ranged enum leaf);
    - GAPs emit NO sh:path + NO dct:source.
    """
    from opda_gen.inputs.leaf_resolver import (
        bind,
        emitted_predicates,
        resolve,
        walk_form,
    )

    onto_dir = _default_ontology_dir_for_resolver()
    predicates = emitted_predicates(onto_dir)
    form = walk_form(form_id, _overlay_path(form_id))

    bound_by_class: dict[URIRef, list[tuple]] = {}
    seen_refs: set[str] = set()
    gaps_by_reason: dict[str, list[str]] = {}
    total = len(form.leaves)
    bound_count = 0

    def _gap(reason: str, leaf_path: str) -> None:
        gaps_by_reason.setdefault(reason, []).append(leaf_path)

    for leaf in form.leaves:  # already sorted by leaf_path
        # one ref -> one sh:path (dedupe; later same-ref leaves GAP).
        if leaf.ref in seen_refs:
            _gap("ref-collision", leaf.leaf_path)
            continue
        seen_refs.add(leaf.ref)

        pred = bind(leaf, predicates)
        if pred is None:
            resolved = resolve(leaf.name)
            if resolved not in predicates:
                _gap("no-predicate", leaf.leaf_path)
            elif predicates[resolved].domain_iri is None:
                _gap("no-domain", leaf.leaf_path)
            else:
                _gap("collider-ambiguous", leaf.leaf_path)
            continue

        bound_count += 1
        bound_by_class.setdefault(pred.domain_iri, []).append((leaf, pred))

    # Emit one NodeShape per target class, deterministically.
    for domain_iri in sorted(bound_by_class, key=str):
        target_local = _local_name(domain_iri)
        shape_iri = OPDA_SHAPE[f"{_title_form(form_id)}_{target_local}Shape"]
        g.add((shape_iri, RDF.type, SH.NodeShape))
        g.add((shape_iri, SH.targetClass, domain_iri))
        for leaf, pred in sorted(
            bound_by_class[domain_iri], key=lambda lp: lp[0].leaf_path
        ):
            range_local = (
                _local_name(pred.range_iri) if pred.range_iri else ""
            )
            members = _maybe_scheme_members(range_local, leaf.enum)
            _add_property_shape(
                g, shape_iri,
                path=pred.iri,
                min_count=1 if leaf.required else None,
                in_scheme_members=members,
                dct_source_iri=_schema_leaf_source(
                    form.schema_id, leaf.leaf_path
                ),
            )

    return {
        "form_id": form_id,
        "total": total,
        "bound": bound_count,
        "gaps_by_reason": {k: sorted(v) for k, v in gaps_by_reason.items()},
        "gapped": sum(len(v) for v in gaps_by_reason.values()),
    }


def _default_ontology_dir_for_resolver() -> Path:
    """Resolve `source/03-standards/ontology/` for the resolver's predicate
    inventory (the same locator the CLI uses)."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / ".git").exists() and (
            parent / "source" / "03-standards"
        ).exists():
            return parent / "source" / "03-standards" / "ontology"
    return Path.cwd() / "source" / "03-standards" / "ontology"


def _gap_register_description(title: str, coverage: dict[str, object]) -> str:
    """The emitted per-form gap register (S034 Q4 — literally emitted, an
    `rdfs:comment`/`dct:description` on the form header, NOT a published
    DCTAP artefact). Names the GAP count by reason."""
    total = coverage["total"]
    bound = coverage["bound"]
    gapped = coverage["gapped"]
    by_reason = coverage["gaps_by_reason"]
    reason_summary = (
        ", ".join(f"{r}: {len(v)}" for r, v in sorted(by_reason.items()))
        or "none"
    )
    return (
        f"SHACL overlay profile for {title}. Per S034 (ADR-0029 gap-1) this "
        f"graph enumerates the form's ref-bearing overlay leaves via the "
        f"bind-only-what-exists resolver (ODR-0022 G1/G2; ODR-0024 COLLAPSED): "
        f"a leaf binds to its emitted opda: predicate (with exactly one "
        f"rdfs:domain as sh:targetClass) or is GAPped (no sh:path, no "
        f"dct:source). Coverage: {total} ref leaves; {bound} bindable leaves "
        f"enumerated; {gapped} GAPped pending their opda: term "
        f"[{reason_summary}]. dct:source on each property shape is the "
        f"JSON-pointer schema-leaf-path anchor (ODR-0022 §Rules.2 G2, "
        f"S034-amended). The gap register is internal generator output, not a "
        f"published DCTAP (ODR-0021 F3 stays deferred); enumeration does NOT "
        f"discharge G3's worked-query limb (per-consumer, session-034)."
    )


def _enumerated_comment_header(
    form_id: str, filename: str, emission_date: str, git_sha: str,
) -> str:
    """Generator-comment block for an enumerated (S034) overlay profile."""
    lines = [
        f"# profiles/{filename} — {form_id} overlay profile (enumerated)",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://opda.org.uk/pdtf/harness/adr/"
        "ADR-0029-overlay-profile-emitter-generalisation-and-rollout",
        f"# Generator version: opda-gen-{__version__}",
        f"# Source commit: {git_sha}",
        "# Ratifying ODR(s): ODR-0010 (overlay-profile mechanism); ODR-0020 "
        "(form->community via dct:subject); ODR-0022 §Rules.2 G1/G2 "
        "(path-aware binning + JSON-pointer anchor); ODR-0024 (COLLAPSED).",
        "# S034/ADR-0029 gap-1: this profile ENUMERATES the form's bindable "
        "overlay leaves (bind-only-what-exists). Un-bindable leaves are "
        "GAPped (named in the header gap register) — never fabricated.",
        "",
    ]
    return "\n".join(lines) + "\n"


def _scheme_members(scheme_local_name: str) -> list[str]:
    """Return the notation values of an emitted SKOS scheme by local name.

    Used to compute `sh:in` lists for profile shapes — the profile cites
    the scheme members as a closed enumeration per ODR-0010 §Rule 2
    (build-step replacement, NOT entailment). The members are pulled
    from the in-code scheme registry rather than re-parsing the emitted
    Turtle so this module remains a pure emitter (no I/O dependency on
    the vocabularies file at profile-emit time).
    """
    from opda_gen.emitters.vocabularies import _all_schemes

    for scheme in _all_schemes():
        if scheme.local_name == scheme_local_name:
            return [m.notation for m in scheme.members]
    raise ValueError(f"unknown scheme: {scheme_local_name}")


def _add_in_list(g: Graph, blank: BNode, items: list[str]) -> None:
    """Attach a SHACL `sh:in` RDF list of string literals to ``blank``."""
    rdf_list = BNode()
    g.add((blank, SH["in"], rdf_list))
    Collection(g, rdf_list, [Literal(v) for v in items])


def _add_property_shape(
    g: Graph,
    parent_shape: URIRef,
    *,
    path: URIRef,
    min_count: int | None = None,
    max_count: int | None = None,
    in_scheme_members: list[str] | None = None,
    severity: URIRef = SH.Violation,
    dash_viewer: URIRef | None = None,
    dash_editor: URIRef | None = None,
    sh_order: int | None = None,
    sh_group: URIRef | None = None,
    form_question_anchor: str | None = None,
    dct_source_iri: URIRef | None = None,
    message: str | None = None,
) -> BNode:
    """Attach a `sh:property` block to ``parent_shape`` with the given
    constraints. Returns the blank node so callers can extend.

    Per ADR-0013 §"Profile emission template" lines 84-107 the canonical
    property-shape carries: sh:path, sh:minCount/maxCount, sh:in,
    sh:severity, dash:viewer/editor, sh:order, sh:group, dct:source,
    sh:message. Each argument is honoured iff supplied; the helper does
    NOT inject defaults beyond `severity = sh:Violation`.

    `dct:source` is set by EITHER ``form_question_anchor`` (the baspi5
    `https://www.basp.uk/forms/baspi5#<anchor>` mint, ODR-0010 §Q3) OR
    ``dct_source_iri`` (a pre-built IRI — used by the S034 overlay
    enumerator to carry a JSON-pointer schema-leaf-path anchor,
    ODR-0022 §Rules.2 G2 as S034-amended). At most one is given.
    """
    prop = BNode()
    g.add((parent_shape, SH.property, prop))
    g.add((prop, SH.path, path))
    if min_count is not None:
        g.add((prop, SH.minCount, Literal(min_count)))
    if max_count is not None:
        g.add((prop, SH.maxCount, Literal(max_count)))
    if in_scheme_members is not None:
        _add_in_list(g, prop, in_scheme_members)
    g.add((prop, SH.severity, severity))
    if dash_viewer is not None:
        g.add((prop, DASH.viewer, dash_viewer))
    if dash_editor is not None:
        g.add((prop, DASH.editor, dash_editor))
    if sh_order is not None:
        g.add((prop, SH.order, Literal(sh_order)))
    if sh_group is not None:
        g.add((prop, SH.group, sh_group))
    if form_question_anchor is not None:
        g.add((prop, DCTERMS.source, _baspi5_question(form_question_anchor)))
    if dct_source_iri is not None:
        g.add((prop, DCTERMS.source, dct_source_iri))
    if message is not None:
        g.add((prop, SH.message, Literal(message, lang="en")))
    return prop


def _add_property_group(
    g: Graph, group_uri: URIRef, *, label: str, order: int,
) -> None:
    """Emit a `sh:PropertyGroup` per ODR-0010 §Q4 DASH-driven sectioning."""
    g.add((group_uri, RDF.type, SH.PropertyGroup))
    g.add((group_uri, RDFS.label, Literal(label, lang="en")))
    g.add((group_uri, SH.order, Literal(order)))


# --- BASPI5 shape builder (ADR-0029 gap 2) -------------------------------
def _build_baspi5_shapes(g: Graph, profile_iri: URIRef) -> None:
    """Add the BASPI5 SHACL shapes to ``g`` (a ``shape_builder`` callback).

    The shared `owl:Ontology` header (title / imports / versionIRI /
    `dct:source` / the one `dct:subject` community tag) is emitted by
    `_build_profile` from the BASPI5 ``ProfileSpec``; this callback adds
    only the BASPI5-specific shapes onto the same graph (ADR-0029 gap 2 —
    BASPI5 now routes through the generic builder like every other form).

    Realises ADR-0013 §"Profile emission template" + ODR-0010 §Q1-Q7.

    Coverage:
    - opda:ValidationContext reification per ODR-0010 §Q1 with 5 properties.
    - Per-class Baspi5_* NodeShapes:
        * Baspi5_PropertyShape    — built form / energy / heating /
                                     drainage / flood / smart-home /
                                     boundaries / spray-foam / vacant
                                     possession / property type / etc.
        * Baspi5_AddressShape     — line1 + postcode required.
        * Baspi5_LegalEstateShape — ownership type / tenure / shared-
                                     ownership / ground rent.
        * Baspi5_SellerShape      — name/email/role; sellersCapacity oneOf.
        * Baspi5_EPCCertificateShape — DROPPED (ODR-0029 R4b): was a bare
                                     dangling sh:targetClass; the certificate
                                     IC tuple is validated by the base
                                     opda-descriptive-shapes.ttl, not here.
    - sh:PropertyGroup instances for the major DASH groups.
    - sh:xone shape for the BASPI5 sellersCapacity oneOf discriminator.
    """
    # --- opda:ValidationContext reification per ODR-0010 §Q1 -----------
    # S022 (ADR-0026/0029 amendments): opda:requires + opda:overlaysContext
    # are DROPPED — `requires` is redundant (the shapes' sh:path/sh:minCount
    # already enumerate required terms) and `overlaysContext` is retired
    # (the form↔community link is dct:subject on the header above; the
    # form↔base link is the shapes' sh:targetClass). The ValidationContext
    # node itself stays exactly as ODR-0010 §Q1 defines it.
    vctx = OPDA.Baspi5ValidationContext
    g.add((vctx, RDF.type, OPDA.ValidationContext))
    g.add((vctx, OPDA.profileURI, profile_iri))
    g.add((vctx, OPDA.sourcedFrom, URIRef(BASPI5_FORMS_AUTHORITY)))
    g.add((vctx, OPDA.formVersion, Literal("5.0.3")))
    g.add((vctx, DCTERMS.source, _ODR_0010))

    # --- DASH PropertyGroups per ODR-0010 §Q4 --------------------------
    grp_participants = OPDA.Baspi5_Participants_Group
    grp_address = OPDA.Baspi5_Address_Group
    grp_built = OPDA.Baspi5_BuiltForm_Group
    grp_energy = OPDA.Baspi5_Energy_Group
    grp_heating = OPDA.Baspi5_Heating_Group
    grp_ownership = OPDA.Baspi5_Ownership_Group
    grp_drainage = OPDA.Baspi5_Drainage_Group
    grp_environmental = OPDA.Baspi5_Environmental_Group
    grp_completion = OPDA.Baspi5_Completion_Group
    _add_property_group(g, grp_participants, label="Participants", order=1)
    _add_property_group(g, grp_address, label="Address", order=2)
    _add_property_group(g, grp_built, label="Built form", order=3)
    _add_property_group(g, grp_energy, label="Energy & EPC", order=4)
    _add_property_group(g, grp_heating, label="Heating & utilities", order=5)
    _add_property_group(g, grp_ownership, label="Ownership & tenure", order=6)
    _add_property_group(g, grp_drainage, label="Water & drainage", order=7)
    _add_property_group(
        g, grp_environmental, label="Environmental issues", order=8,
    )
    _add_property_group(g, grp_completion, label="Completion", order=9)

    # --- Baspi5_AddressShape (BASPI5 A1.1) -----------------------------
    addr_shape = OPDA_SHAPE.Baspi5_AddressShape
    g.add((addr_shape, RDF.type, SH.NodeShape))
    g.add((addr_shape, SH.targetClass, OPDA.Address))
    g.add((addr_shape, DCTERMS.source, _baspi5_question("A1.1")))
    _add_property_shape(
        g, addr_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#street-address"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=1, sh_group=grp_address,
        form_question_anchor="A1.1.1",
        message="BASPI5 question A1.1.1: address line 1 is required.",
    )
    _add_property_shape(
        g, addr_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#postal-code"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=5, sh_group=grp_address,
        form_question_anchor="A1.1.5",
        message="BASPI5 question A1.1.5: postcode is required.",
    )

    # --- Baspi5_PropertyShape (BASPI5 propertyPack.*) ------------------
    prop_shape = OPDA_SHAPE.Baspi5_PropertyShape
    g.add((prop_shape, RDF.type, SH.NodeShape))
    g.add((prop_shape, SH.targetClass, OPDA.Property))
    # G19: anchor realigned from `A1` (no baspi5Ref) to `A1.1` (the
    # property's primary address-bearing anchor; nearest stable
    # baspi5Ref value covering the property's identity surface).
    g.add((prop_shape, DCTERMS.source, _baspi5_question("A1.1")))

    # UPRN required (BASPI5 propertyPack.uprn). The schema reuses baspi5Ref
    # `A1.1.5` for BOTH propertyPack.uprn AND address.postcode (two distinct
    # schema leaves sharing one coarse form-question reference). The
    # dct:source cites the REAL BASPI5 form question — `A1.1.5`, the
    # baspi5Ref baspi5.json assigns to both leaves — per the G19 acceptance
    # gate (every anchor MUST be an exact baspi5Ref value;
    # tests/baspi5_round_trip/test_traceability.py). The two shapes are
    # distinguished by their sh:path (opda:hasUPRN here vs vcard:postal-code
    # on Baspi5_AddressShape), NOT by a fabricated `A1.1.5.uprn` ref; G3
    # round-trip coverage still holds because each schema leaf is reached by
    # its own sh:path under the shared form-question anchor.
    _add_property_shape(
        g, prop_shape,
        path=OPDA.hasUPRN,
        min_count=1, max_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=1, sh_group=grp_built,
        form_question_anchor="A1.1.5",
        message="BASPI5: UPRN is required (identity key).",
    )
    # Address (object-property; multiplicity 1 in BASPI5 — propertyPack.address)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.hasAddress,
        min_count=1,
        dash_viewer=DASH.URIViewer,
        dash_editor=DASH.DetailsEditor,
        sh_order=2, sh_group=grp_address,
        form_question_anchor="A1.1",
    )
    # propertyType (sub-set: House/Bungalow/Park home/Flat/Maisonette/Other)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.propertyType,
        min_count=1, max_count=1,
        in_scheme_members=_scheme_members("PropertyTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=3, sh_group=grp_built,
        form_question_anchor="A1.8",
        message="BASPI5 question A1.8: property type is required.",
    )
    # builtForm (Detached/Semi/Mid-terrace/End-terrace/Other)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.builtForm,
        min_count=1,
        in_scheme_members=_scheme_members("BuiltFormScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=4, sh_group=grp_built,
        form_question_anchor="A1.8.1",
    )
    # EPC certificate container (A1.8.3.1) — the Property → EPCCertificate
    # join. Bound here, on the shape whose target (opda:Property) matches the
    # predicate's rdfs:domain, NOT on Baspi5_EPCCertificateShape where it
    # reused a Property-domain predicate on a non-Property subject (handover
    # 2026-06-01 §8 / ODR-0025 §R7 / ADR-0035 §"EPCCertificate emitter fix").
    _add_property_shape(
        g, prop_shape,
        path=OPDA.hasEPCCertificate,
        dash_viewer=DASH.URIViewer,
        dash_editor=DASH.DetailsEditor,
        sh_order=9, sh_group=grp_energy,
        form_question_anchor="A1.8.3.1",
        message="BASPI5 question A1.8.3.1: EPC certificate.",
    )
    # currentEnergyRating (A-G)
    _add_property_shape(
        g, prop_shape,
        path=OPDA.currentEnergyRating,
        min_count=1, max_count=1,
        in_scheme_members=_scheme_members("CurrentEnergyRatingScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=10, sh_group=grp_energy,
        form_question_anchor="A1.8.3.1.1",
        message="BASPI5 question A1.8.3.1.1: EPC current energy rating.",
    )
    # heatingType
    _add_property_shape(
        g, prop_shape,
        path=OPDA.heatingType,
        min_count=1,
        in_scheme_members=_scheme_members("HeatingTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=11, sh_group=grp_heating,
        form_question_anchor="A7.1",
    )
    # centralHeatingFuelType
    _add_property_shape(
        g, prop_shape,
        path=OPDA.centralHeatingFuelType,
        in_scheme_members=_scheme_members("CentralHeatingFuelTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=12, sh_group=grp_heating,
        form_question_anchor="A7.4.0.2",
    )
    # offMainsDrainageSystemType
    _add_property_shape(
        g, prop_shape,
        path=OPDA.offMainsDrainageSystemType,
        in_scheme_members=_scheme_members("OffMainsDrainageSystemTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=20, sh_group=grp_drainage,
        form_question_anchor="A6.2.1",
    )
    # Yes/No discriminators
    yes_no_members = _scheme_members("YesNoScheme")
    yes_no_na_members = _scheme_members("YesNoNotApplicableScheme")
    for path, anchor, group, order, label in [
        (OPDA.areBoundariesUniform, "A1.2.1", grp_built, 5, "boundaries uniform"),
        (OPDA.isLocatedOverCommercialPremises, "A1.8.6.1",
         grp_built, 6, "over commercial premises"),
        # G19: anchor realigned from `A1.8.7` (no baspi5Ref) to
        # `A1.8.4.1` (the actual sprayFoamInsulation.hasSprayFoamInstalled
        # baspi5Ref leaf in baspi5.json).
        (OPDA.hasSprayFoamInstalled, "A1.8.4.1", grp_built, 7,
         "spray foam installed"),
        (OPDA.hasBeenFlooded, "A4.1.1", grp_environmental, 21,
         "has been flooded"),
        (OPDA.hasSmartHomeSystems, "A8.1.1", grp_built, 8,
         "has smart home systems"),
        (OPDA.hasValidGuaranteesOrWarranties, "A9.1", grp_built, 9,
         "has valid guarantees or warranties"),
        (OPDA.isInsured, "A10.1.1", grp_built, 14, "is insured"),
        # G19: anchor realigned from `A7.5.1` (no baspi5Ref) to
        # `B4.6.2` (the actual mainsWater.waterMeter.isSupplyMetered
        # baspi5Ref leaf — supply-metering is bound to the water
        # subsystem in BASPI5, not heating).
        (OPDA.isSupplyMetered, "B4.6.2", grp_heating, 13, "supply metered"),
        (OPDA.soldWithVacantPossession, "A11.1.1", grp_completion, 30,
         "vacant possession"),
    ]:
        _add_property_shape(
            g, prop_shape,
            path=path,
            in_scheme_members=yes_no_members,
            dash_viewer=DASH.LabelViewer,
            dash_editor=DASH.EnumSelectEditor,
            sh_order=order, sh_group=group,
            form_question_anchor=anchor,
            message=f"BASPI5 question {anchor}: {label} (Yes/No).",
        )

    # --- Baspi5_LegalEstateShape (BASPI5 ownership / tenure) -----------
    estate_shape = OPDA_SHAPE.Baspi5_LegalEstateShape
    g.add((estate_shape, RDF.type, SH.NodeShape))
    g.add((estate_shape, SH.targetClass, OPDA.LegalEstate))
    g.add((estate_shape, DCTERMS.source, _baspi5_question("A1.3")))

    # ownershipType (Freehold/Leasehold/Commonhold/Managed Freehold/Other).
    # Anchored at the precise leaf `A1.3.0.2`
    # (propertyPack.ownership.ownershipsToBeTransferred.items.ownershipType) —
    # NOT the coarse container `A1.3` (propertyPack.ownership), which the
    # tenureKind shape retains. This separates the two LegalEstate paths so
    # each form leaf binds exactly one sh:path (ODR-0022 §2 G3).
    _add_property_shape(
        g, estate_shape,
        path=OPDA.ownershipType,
        min_count=1, max_count=1,
        in_scheme_members=_scheme_members("OwnershipTypeScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=1, sh_group=grp_ownership,
        form_question_anchor="A1.3.0.2",
        message="BASPI5 question A1.3.0.2: ownership type is required.",
    )
    # tenureKind (Freehold/Leasehold/Commonhold). Retains the container-level
    # `A1.3` (propertyPack.ownership) — BASPI5 carries no distinct tenure
    # baspi5Ref; tenure is the ownership question's Substance-Kind reading
    # (ODR-0008 §Q5a row 2), so it sources the ownership block as a whole.
    _add_property_shape(
        g, estate_shape,
        path=OPDA.tenureKind,
        in_scheme_members=_scheme_members("TenureKindScheme"),
        dash_viewer=DASH.LabelViewer,
        dash_editor=DASH.EnumSelectEditor,
        sh_order=2, sh_group=grp_ownership,
        form_question_anchor="A1.3",
    )
    for path, anchor, label in [
        (OPDA.isSharedOwnership, "A1.3.1", "shared ownership"),
        (OPDA.isGroundRentPayable, "A1.4.2", "ground rent payable"),
        (OPDA.sellerContributesToServiceCharge, "A1.5.1",
         "seller contributes to service charge"),
    ]:
        _add_property_shape(
            g, estate_shape,
            path=path,
            in_scheme_members=yes_no_members,
            dash_viewer=DASH.LabelViewer,
            dash_editor=DASH.EnumSelectEditor,
            sh_group=grp_ownership,
            form_question_anchor=anchor,
            message=f"BASPI5 question {anchor}: {label} (Yes/No).",
        )

    # --- Baspi5_SellerShape (BASPI5 participants[].role==Seller) ------
    seller_shape = OPDA_SHAPE.Baspi5_SellerShape
    g.add((seller_shape, RDF.type, SH.NodeShape))
    g.add((seller_shape, SH.targetClass, OPDA.Seller))
    g.add((seller_shape, DCTERMS.source, _baspi5_question("B1")))
    # role (Seller-only branch — discriminator). Anchored at `B1`
    # (properties.participants — the participants block whose oneOf is
    # discriminated on `role`; BASPI5 carries no separate role baspi5Ref).
    # This is the one property shape that sources the participants container
    # `B1` by sh:path, so `B1` is addressable rather than node-shape-only
    # (ODR-0022 §2 G3); the seller name retains the distinct `B1.1`.
    _add_property_shape(
        g, seller_shape,
        path=OPDA.roleNotation,
        min_count=1, max_count=1,
        in_scheme_members=["Seller"],
        sh_order=1, sh_group=grp_participants,
        form_question_anchor="B1",
    )
    # name + email required per BASPI5 participants[].required
    _add_property_shape(
        g, seller_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#fn"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=2, sh_group=grp_participants,
        # G19: anchor realigned from `B1.2` (no baspi5Ref) to
        # `B1.1` (the namesOfLegalOwners level — the closest stable
        # baspi5Ref covering the seller's name field; BASPI5 has no
        # participants[].name baspi5Ref directly). It is now the SOLE path
        # sourcing `B1.1` (the role discriminator moved up to `B1`).
        form_question_anchor="B1.1",
    )
    _add_property_shape(
        g, seller_shape,
        path=URIRef("http://www.w3.org/2006/vcard/ns#email"),
        min_count=1,
        dash_viewer=DASH.LiteralViewer,
        dash_editor=DASH.TextFieldEditor,
        sh_order=3, sh_group=grp_participants,
        form_question_anchor="B1.3",
    )

    # --- Baspi5_SellersCapacityShape (BASPI5 sellersCapacity oneOf) ---
    # Per ODR-0010 §Q5: oneOf → sh:xone. Two branches:
    #   (a) Legal Owner / Mortgagee in Possession (no extra requirements)
    #   (b) Personal Representative / Power of Attorney / Assistant /
    #       Other → REQUIRE sellersCapacityDetails + attachments.
    capacity_shape = OPDA_SHAPE.Baspi5_SellersCapacityShape
    g.add((capacity_shape, RDF.type, SH.NodeShape))
    g.add((capacity_shape, SH.targetClass, OPDA.Seller))
    g.add((capacity_shape, SH.severity, SH.Violation))
    g.add((capacity_shape, DCTERMS.source, _baspi5_question("B1.3")))

    # xone list
    xone_list = BNode()
    g.add((capacity_shape, SH.xone, xone_list))

    # Each xone branch property shape carries a form-question dct:source so
    # the path it binds is traceable to a schema leaf (ODR-0022 §2 G2 — a
    # path-bearing shape with no form-question dct:source is untraceable).
    # The hasAssertedCapacity branches source the capacity discriminator leaf
    # `B1.3.1` (participants.items.sellersCapacity.capacity); both branches
    # carry the same predicate, so B1.3.1 binds exactly one distinct path.
    # Branch (a) — Legal Owner / Mortgagee in Possession
    branch_a = BNode()
    branch_a_prop = BNode()
    g.add((branch_a, SH.property, branch_a_prop))
    g.add((branch_a_prop, SH.path, OPDA.hasAssertedCapacity))
    _add_in_list(g, branch_a_prop, ["Legal Owner", "Mortgagee in Possession"])
    g.add((branch_a_prop, SH.minCount, Literal(1)))
    g.add((branch_a_prop, DCTERMS.source, _baspi5_question("B1.3.1")))

    # Branch (b) — Personal Rep / PoA / Assistant / Other
    branch_b = BNode()
    branch_b_prop = BNode()
    g.add((branch_b, SH.property, branch_b_prop))
    g.add((branch_b_prop, SH.path, OPDA.hasAssertedCapacity))
    _add_in_list(g, branch_b_prop, [
        "Personal Representative for a Deceased Owner",
        "Under Power of Attorney",
        "Assistant",
        "Other",
    ])
    g.add((branch_b_prop, SH.minCount, Literal(1)))
    g.add((branch_b_prop, DCTERMS.source, _baspi5_question("B1.3.1")))
    # Branch (b) ALSO requires evidenced authority (sellersCapacityDetails +
    # attachments per BASPI5 B1.3.2 + B1.3.3). The hasEvidencedAuthority shape
    # sources the sellersCapacityDetails leaf `B1.3.2` (the primary evidence
    # leaf; attachments B1.3.3 is the same evidenced-authority requirement).
    branch_b_evidence = BNode()
    g.add((branch_b, SH.property, branch_b_evidence))
    g.add((branch_b_evidence, SH.path, OPDA.hasEvidencedAuthority))
    g.add((branch_b_evidence, SH.minCount, Literal(1)))
    g.add((branch_b_evidence, DCTERMS.source, _baspi5_question("B1.3.2")))
    g.add((branch_b_evidence, SH.message, Literal(
        "BASPI5 question B1.3.2-3: Personal Representative / Power of "
        "Attorney / Assistant / Other capacity requires sellersCapacity"
        "Details + attachments.",
        lang="en",
    )))

    # Attach branches to the xone RDF list (deterministic order)
    Collection(g, xone_list, [branch_a, branch_b])

    # --- Baspi5_BuyerShape (participants[].role==Buyer) ----------------
    buyer_shape = OPDA_SHAPE.Baspi5_BuyerShape
    g.add((buyer_shape, RDF.type, SH.NodeShape))
    g.add((buyer_shape, SH.targetClass, OPDA.Buyer))
    g.add((buyer_shape, DCTERMS.source, _baspi5_question("B1")))
    # role-branch admission (non-seller branch of participants oneOf).
    # Anchored at `B1` (the participants block) like the seller-branch role —
    # same opda:role predicate, so `B1` still binds exactly one distinct
    # sh:path. (Was `B1.1`, which collided with the seller-name path.)
    _add_property_shape(
        g, buyer_shape,
        path=OPDA.roleNotation,
        min_count=1, max_count=1,
        in_scheme_members=[
            "Buyer", "Seller's Conveyancer", "Prospective Buyer",
            "Buyer's Conveyancer", "Estate Agent", "Buyer's Agent",
            "Surveyor", "Mortgage Broker", "Lender", "Landlord", "Tenant",
        ],
        sh_order=1, sh_group=grp_participants,
        form_question_anchor="B1",
    )

    # --- Baspi5_EPCCertificateShape — DROPPED (ODR-0029 R4b) ----------
    # The shape was a bare, dangling `sh:targetClass opda:EPCCertificate` with
    # NO sh:property — it earned its keep nowhere. ODR-0029 R4(b) disposes it:
    # drop it OR populate with certificate-intrinsic constraints ONLY (issue
    # date / authority reference / the ODR-0008d IC tuple), NEVER the Property
    # rating. We DROP it here, because (1) the certificate-intrinsic IC tuple
    # ⟨issuing authority, authority reference, issue date⟩ is ALREADY validated
    # by the base EPCCertificateInternalStructureShape + EPCCertificateIdentity-
    # KeyShape in opda-descriptive-shapes.ttl (ODR-0008d Rule 3) — duplicating
    # it in the profile would be redundant; and (2) those intrinsics are DESNZ-
    # register fields, not BASPI5 form questions, so they have no baspi5Ref to
    # anchor a profile property-shape `dct:source` and carry sh:Info — both of
    # which collide with the BASPI5 profile's own invariants (the sh:Violation
    # severity-floor and the one-ref→one-sh:path G3 gate, ODR-0022 §2 G3). The
    # rating (opda:currentEnergyRating, rdfs:domain opda:Property) and the
    # Property → EPCCertificate join (opda:hasEPCCertificate) remain bound on
    # Baspi5_PropertyShape, whose target matches their domain; the certificate-
    # container leaf A1.8.3.1 and rating leaf A1.8.3.1.1 round-trip via
    # Baspi5_PropertyShape.


# --- Generator-comment header --------------------------------------------
def _comment_header(
    _form_id: str, filename: str, emission_date: str, git_sha: str,
) -> str:
    """Build the generator-comment block prepended to the BASPI5 file.

    Takes the uniform ``(form_id, filename, emission_date, git_sha)``
    signature shared with `_thin_comment_header` so both can sit on a
    ``ProfileSpec.comment_header`` and dispatch through one call site
    (ADR-0029 gap 2); ``_form_id`` is unused here — the BASPI5 label is
    fixed.
    """
    lines = [
        f"# profiles/{filename} — BASPI5 overlay profile",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0013-overlay-profile-emission",
        f"# Generator version: opda-gen-{__version__}",
        f"# Source commit: {git_sha}",
        "# Ratifying ODR: ODR-0010 (overlay profile mechanism); §Q1 "
        "ValidationContext reification, §Q3 dct:source IRIs, §Q4 DASH UI, "
        "§Q5 oneOf-as-xone, §Q6 no-identity-override, §Q7 BASPI5 MVP gate.",
        "# Three-rule interface contract enforced by "
        "tools/opda-gen/src/opda_gen/ci/profile_contract_test.py.",
        "",
    ]
    return "\n".join(lines) + "\n"


# --- BASPI5 spec + full registry (ADR-0029 gap 2) ------------------------
# BASPI5 is a regular ProfileSpec carrying its shape logic as a
# `shape_builder` and its own `comment_header`. It routes through
# `_build_profile` exactly like the 30 thin forms — no special case in
# `emit_profile`. The header triples it needs (dct:source -> ADR-0013;
# dct:subject -> Estate Agency) are reproduced byte-for-byte by
# `_build_profile` from these fields, so `baspi5.ttl` is unchanged.
_BASPI5_SPEC = ProfileSpec(
    form_id="baspi5",
    title="BASPI5 overlay profile",
    description=(
        "SHACL profile graph for the BASPI5 (British Association of "
        "Surveyors Property Information) version 5 form. Per-form "
        "cardinality, enum subsets, DASH UI rendering. Composes over "
        "the foundation + module TBox + base shapes per ODR-0010."
    ),
    community=OVERLAY_COMMUNITY["baspi5"],
    dct_source=_ADR_0013,
    shape_builder=_build_baspi5_shapes,
    comment_header=_comment_header,
)

_PROFILE_SPECS: dict[str, ProfileSpec] = {
    "baspi5": _BASPI5_SPEC,
    **_enumerated_specs(),
    **_thin_specs(),
}


# --- Public API ----------------------------------------------------------
def emit_profile(
    overlay: str,
    output_dir: Path,
    *,
    emission_date: str | None = None,
    git_sha: str | None = None,
) -> dict[Path, str]:
    """Emit one overlay profile under ``output_dir/profiles/``.

    Returns a dict mapping written ``Path`` → Turtle content (utf-8 str)
    matching the foundation/vocabularies emitter interface.

    ``emission_date`` and ``git_sha`` default to the pinned constants
    per the G6 convention; CI MUST regenerate with the pinned defaults
    so the byte-identity diff is zero. Override in tests to exercise
    alternate values.
    """
    if overlay not in PROFILE_FILENAMES:
        raise ValueError(
            f"unknown overlay {overlay!r}; supported: {sorted(PROFILE_FILENAMES)}"
        )
    profiles_dir = output_dir / "profiles"
    profiles_dir.mkdir(parents=True, exist_ok=True)

    date_str = emission_date or _PROFILE_LAST_MODIFIED
    sha_str = git_sha or _PROFILE_SOURCE_COMMIT

    filename = PROFILE_FILENAMES[overlay]
    spec = _PROFILE_SPECS[overlay]
    graph = _build_profile(spec)
    build_header = spec.comment_header or _thin_comment_header
    header = build_header(overlay, filename, date_str, sha_str)
    body = to_canonical_turtle(graph).decode("utf-8")
    content = header + body

    out_path = profiles_dir / filename
    out_path.write_text(content, encoding="utf-8", newline="")
    return {out_path: content}


# Backwards-compat alias kept for the ADR-0008 stub-importers (none
# in production code, but the docstring promised this symbol).
def emit(overlay: str, output_dir: Path) -> dict[Path, str]:
    """Alias for :func:`emit_profile`; preserved for ADR-0008 stub callers."""
    return emit_profile(overlay, output_dir)
