"""
Module contexts.

Realises:
- ADR-0026 §"Decision Outcome" work-item 1 (S022-amended) — emit
  `opda:BoundedContextScheme a skos:ConceptScheme` plus the six industry
  `skos:Concept`s (EstateAgency / Conveyancing / MortgageLending /
  Surveying / PropertyDataServices / PropertyTechnology), each
  `skos:inScheme` + `skos:topConceptOf` (flat scheme — no broader) +
  `skos:prefLabel` + `skos:definition` + `opda:hasSteward` (Literal,
  from `/modelling/bounded-contexts`) + `dct:source`.
- ADR-0026 §"Decision Outcome" work-item 2 (S022-amended) — declare
  `opda:consumesFrom` as `owl:AnnotationProperty`
  (`rdfs:subPropertyOf prov:wasInfluencedBy`) with A9 metadata +
  `rdfs:isDefinedBy` → ODR-0020.
- ODR-0020 §Rules — one flat scheme of the six industry contexts only;
  upstream authorities reached by `opda:consumesFrom` (never members of
  the scheme); spanning concerns stay homed in ODR-0006/0007.
- ODR-0019 §Rule 8 — membership is a DERIVED, on-demand query
  (`opda:servesContext`), NEVER materialised; this emitter therefore
  declares NO `opda:servesContext` / `opda:overlaysContext` /
  `opda:definedInContext` predicates (S022 retired all three) and ships
  no dormant CONSTRUCT.
- ADR-0007 §"Deterministic emission rules" — output produced by the
  canonical serialiser; sentinel-pinned `dct:modified`-equivalent header
  date; byte-identity CI green on regeneration.
- ADR-0010 house style — a dedicated module emitting a dedicated TTL via
  the canonical serialiser, beside `vocabularies.py`.
- ADR-0008 §"CLI design" — the `emit-contexts` subcommand invokes
  `emit_contexts()`.

The bounded-context scheme is classes-side substrate (SKOS concepts +
one annotation-property declaration); it carries no `sh:*` triples, so
ODR-0004 §3a three-graph separation holds.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

from opda_gen import __version__
from opda_gen.serialiser.canonical import to_canonical_turtle


# --- Namespaces ----------------------------------------------------------
OPDA = Namespace("https://opda.org.uk/pdtf/")
PROV = Namespace("http://www.w3.org/ns/prov#")


# --- Output ---------------------------------------------------------------
CONTEXTS_FILENAME = "opda-contexts.ttl"


# --- Sentinel-pinned constants per the G6 convention ---------------------
# Advance when a future ADR materially mutates the bounded-context scheme.
# ADR-0026 (S022-amended) is the first emission.
_CONTEXTS_LAST_MODIFIED = "2026-05-30"
_CONTEXTS_SOURCE_COMMIT = "pinned-by-ADR-0026"


# --- opda:servesContext — the on-demand derived query (NOT emitted) ------
# Per the FINAL design (handover §5 P5; ODR-0019 Rule 8; ODR-0020 Rule 5):
# term→context membership ("which contexts use term X") is a DERIVED,
# ON-DEMAND query — NEVER materialised, NOT a stored triple, NOT a dormant
# rule artefact (governance directive 2026-05-30). It is held here as a
# documented, reviewable constant — mirroring how vocabularies.py holds the
# deprecation-chain SPARQL — so the query has a single canonical home, but
# the emitter writes NO servesContext triples and ships NO CONSTRUCT.
#
# A domain term ?term serves a context ?ctx iff some form's SHACL overlay
# graph constrains ?term (via sh:path) and that form graph's owl:Ontology
# header carries `dct:subject ?ctx` (ODR-0029 / S022 community tag).
# Run it across the union of the module TBoxes + the emitted profiles +
# opda-contexts.ttl when a named term-grain consumer needs the mapping.
_SERVES_CONTEXT_QUERY_SPARQL = """\
# opda:servesContext — on-demand derivation (ODR-0020 Rule 5; ODR-0019 Rule 8).
# NEVER materialised. Run on demand against (modules ∪ profiles ∪ contexts).

PREFIX opda: <https://opda.org.uk/pdtf/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX sh:   <http://www.w3.org/ns/shacl#>
PREFIX dct:  <http://purl.org/dc/terms/>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?term ?context WHERE {
    # the form graph is owned by an industry context (S022 dct:subject tag)
    ?formGraph a owl:Ontology ;
               dct:subject ?context .
    ?context skos:inScheme opda:BoundedContextScheme .
    # the form's shapes constrain ?term via sh:path
    ?shape sh:path ?term .
    FILTER(STRSTARTS(STR(?term), STR(opda:)))
}
"""


# --- dct:source / rdfs:isDefinedBy anchors -------------------------------
_ODR_0020 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0020/section-decision"
)
_ODR_0019_RULE_8 = URIRef(
    "https://opda.org.uk/pdtf/harness/odr/ODR-0019/section-rule-8"
)


# --- Scheme + concept definitions ----------------------------------------
SCHEME_LOCAL_NAME = "BoundedContextScheme"
SCHEME_LABEL = "PDTF Bounded Contexts"
SCHEME_DEFINITION = (
    "The six industry bounded contexts of the UK PDTF, each owning a "
    "SHACL overlay profile (ODR-0010). Domain-term membership in a "
    "context is a derived, on-demand query (opda:servesContext per "
    "ODR-0020), never hand-authored except per ODR-0019 Rule 8."
)


@dataclass(frozen=True)
class Context:
    """A single industry bounded context emitted as a `skos:Concept`.

    `local_name` is the CamelCase URI segment appended to the `opda:`
    namespace (e.g. "EstateAgencyContext"). `steward` is the industry
    steward(s) (regulators / professional bodies) drawn verbatim-in-
    spirit from the `/modelling/bounded-contexts` table, emitted as the
    `opda:hasSteward` Literal.
    """

    local_name: str
    pref_label: str
    definition: str
    steward: str

    def uri(self) -> URIRef:
        return URIRef(f"{OPDA}{self.local_name}")


# The six industry contexts, in deterministic emission order. The
# canonical serialiser re-sorts subjects by (type_rank, IRI); this order
# is preserved for documentation. Definitions mirror ODR-0020's ratified
# sketch ("X; overlays a/b/c."); Conveyancing + Surveying are verbatim.
def _all_contexts() -> tuple[Context, ...]:
    return (
        Context(
            local_name="EstateAgencyContext",
            pref_label="Estate Agency",
            definition=(
                "Marketing and sale of residential property; overlays "
                "baspi5/nts2."
            ),
            steward=(
                "Propertymark; property portals (Rightmove, Zoopla); "
                "regulated by NTSELAT (transitioning to MHCLG)."
            ),
        ),
        Context(
            local_name="ConveyancingContext",
            pref_label="Conveyancing",
            definition="Legal transfer of estate; overlays ta6/ta7/ta10/lpe1.",
            steward=(
                "Law Society; SRA; CLC; Society of Licensed Conveyancers; "
                "CILEx; CILEx Regulation."
            ),
        ),
        Context(
            local_name="MortgageLendingContext",
            pref_label="Mortgage Lending",
            definition="Lending secured against property; overlays fme1.",
            steward="UK Finance; BSA; regulated by the FCA.",
        ),
        Context(
            local_name="SurveyingContext",
            pref_label="Surveying",
            definition="Physical inspection and valuation; overlays piq.",
            steward="RICS.",
        ),
        Context(
            local_name="PropertyDataServicesContext",
            pref_label="Property Data Services",
            definition=(
                "Aggregation and supply of property data; overlays "
                "con29R/con29DW/llc1/oc1/rds/sr24."
            ),
            steward="COPSO.",
        ),
        Context(
            local_name="PropertyTechnologyContext",
            pref_label="Property Technology",
            definition=(
                "Orchestration and system-to-system messaging spanning the "
                "industry contexts."
            ),
            steward=(
                "No single regulator — orchestration layer across the "
                "industry contexts."
            ),
        ),
    )


# --- Graph builder --------------------------------------------------------
def _bind_common(graph: Graph) -> None:
    """Bind the prefixes used by the scheme.

    The canonical serialiser drops prefixes whose namespace is not
    referenced, so binding broadly is safe.
    """
    graph.bind("opda", OPDA)
    graph.bind("skos", SKOS)
    graph.bind("dct", DCTERMS)
    graph.bind("owl", OWL)
    graph.bind("rdfs", RDFS)
    graph.bind("prov", PROV)
    graph.bind("xsd", XSD)


def build_contexts_graph() -> Graph:
    """Build the bounded-context scheme graph per ADR-0026 (S022-amended).

    Subjects:
    - `opda:BoundedContextScheme` — the flat `skos:ConceptScheme`.
    - six `opda:<Name>Context` — `skos:Concept`s, each `skos:inScheme`
      AND `skos:topConceptOf` the scheme.
    - `opda:consumesFrom` — `owl:AnnotationProperty`
      (`rdfs:subPropertyOf prov:wasInfluencedBy`) for the DDD Conformist
      link to upstream authorities.
    """
    g = Graph()
    _bind_common(g)

    # --- The scheme ----------------------------------------------------
    scheme = URIRef(f"{OPDA}{SCHEME_LOCAL_NAME}")
    g.add((scheme, RDF.type, SKOS.ConceptScheme))
    g.add((scheme, RDFS.label, Literal(SCHEME_LABEL, lang="en")))
    g.add((scheme, SKOS.definition, Literal(SCHEME_DEFINITION, lang="en")))
    g.add((scheme, DCTERMS.source, _ODR_0020))

    # --- opda:hasSteward (ODR-0019 Rule 2 / ODR-0020) -------------------
    # Both ODRs name this as "the existing opda:hasSteward annotation
    # property" — it was never actually declared despite 53 live uses
    # across this file and emitters/vocabularies.py (bounded-context
    # concepts and SKOS enumeration schemes alike).
    g.add((OPDA.hasSteward, RDF.type, OWL.AnnotationProperty))
    g.add((OPDA.hasSteward, RDFS.label, Literal("has steward", lang="en")))
    g.add((OPDA.hasSteward, RDFS.comment, Literal(
        "The organisation(s) or body(ies) responsible for authoring or "
        "maintaining the resource — a bounded context, or a SKOS "
        "enumeration scheme's value space (ODR-0019 Rule 2 / ODR-0020). "
        "Literal-valued (per value-scheme house style, not an IRI-valued "
        "link to a minted opda:Organisation) to carry steward plurality "
        "without namespace plurality.",
        lang="en",
    )))
    g.add((OPDA.hasSteward, DCTERMS.source, _ODR_0020))
    g.add((OPDA.hasSteward, SKOS.definition, Literal(
        "Names the organisation or body responsible for authoring or "
        "maintaining this resource.",
        lang="en",
    )))
    g.add((OPDA.hasSteward, RDFS.isDefinedBy,
           URIRef("https://opda.org.uk/pdtf/")))

    # --- The six industry contexts -------------------------------------
    for ctx in _all_contexts():
        uri = ctx.uri()
        g.add((uri, RDF.type, SKOS.Concept))
        g.add((uri, SKOS.inScheme, scheme))
        g.add((uri, SKOS.topConceptOf, scheme))
        g.add((uri, SKOS.prefLabel, Literal(ctx.pref_label, lang="en")))
        g.add((uri, SKOS.definition, Literal(ctx.definition, lang="en")))
        g.add((uri, OPDA.hasSteward, Literal(ctx.steward, lang="en")))
        g.add((uri, DCTERMS.source, _ODR_0020))

    # --- opda:consumesFrom (the one justified local predicate) ---------
    # Per ODR-0020: the DDD Conformist relationship pointing at the
    # upstream authority (an opda:Organisation / prov:Agent). Declared
    # as an annotation property (membership/provenance, not logical
    # typing) sub-propertied under prov:wasInfluencedBy.
    g.add((OPDA.consumesFrom, RDF.type, OWL.AnnotationProperty))
    g.add((OPDA.consumesFrom, RDFS.subPropertyOf, PROV.wasInfluencedBy))
    g.add((OPDA.consumesFrom, RDFS.label,
           Literal("consumes from", lang="en")))
    g.add((OPDA.consumesFrom, RDFS.comment, Literal(
        "Links a domain term (or its owning module) to an upstream "
        "conformist authority — an opda:Organisation / prov:Agent whose "
        "published model PDTF conforms to (HM Land Registry, Local "
        "Authority, MHCLG Material Information, DSIT/DIATF Identity, W3C "
        "Trust & VCs). The DDD Conformist relationship per ODR-0020: "
        "upstream authorities own no overlay, so they are NEVER "
        "opda:servesContext targets and are NOT members of "
        "opda:BoundedContextScheme.",
        lang="en",
    )))
    g.add((OPDA.consumesFrom, SKOS.scopeNote, Literal(
        "Annotation property (membership/provenance, not logical "
        "typing). rdfs:subPropertyOf prov:wasInfluencedBy so consumers "
        "can traverse it as PROV influence. ODR-0020 Rule on upstream "
        "authorities.",
        lang="en",
    )))
    g.add((OPDA.consumesFrom, SKOS.definition, Literal(
        "Relates a domain term, or its owning module, to the upstream "
        "conformist authority — an organisation or agent whose published model "
        "PDTF aligns to (e.g. HM Land Registry, a local authority) — whose "
        "definitions and codes it adopts, per the DDD Conformist relationship.",
        lang="en",
    )))
    g.add((OPDA.consumesFrom, RDFS.isDefinedBy,
           URIRef("https://opda.org.uk/pdtf/")))
    g.add((OPDA.consumesFrom, DCTERMS.source, _ODR_0019_RULE_8))

    return g


# --- Generator-comment header --------------------------------------------
def _comment_header(emission_date: str, git_sha: str) -> str:
    """Build the generator-comment block prepended to `opda-contexts.ttl`."""
    lines = [
        f"# {CONTEXTS_FILENAME} — OPDA bounded-context scheme",
        f"# Generated by opda-gen {__version__} at {emission_date}; "
        f"DO NOT HAND-EDIT.",
        "# Specification: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0007-ontology-generator-specification",
        "# Implementation: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0008-generator-implementation-infrastructure",
        "# This emission: "
        "https://opda.org.uk/pdtf/harness/adr/ADR-0026-bounded-context-scheme-emission",
        f"# Generator version: opda-gen-{__version__}",
        f"# Source commit: {git_sha}",
        "# Ratifying ODR(s): ODR-0019 (representation pattern + Rule 8 "
        "gate); ODR-0020 (the six-context scheme + consumesFrom).",
        "# S022-final: no opda:servesContext / opda:overlaysContext / "
        "opda:definedInContext predicates emitted (membership is an "
        "on-demand derived query, never materialised).",
        "",
    ]
    return "\n".join(lines) + "\n"


# --- Public API ----------------------------------------------------------
def emit_contexts(
    output_dir: Path,
    *,
    emission_date: str | None = None,
    git_sha: str | None = None,
) -> dict[Path, str]:
    """Emit `opda-contexts.ttl` into ``output_dir``.

    Returns a dict mapping written ``Path`` → Turtle content (utf-8 str),
    matching the vocabularies emitter's interface so callers (tests, CI)
    can inspect emitted content without re-reading from disk.

    ``emission_date`` and ``git_sha`` default to the pinned constants per
    the G6 convention; CI MUST regenerate with the pinned defaults so the
    byte-identity diff is zero. Override in tests to exercise alternate
    values.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = emission_date or _CONTEXTS_LAST_MODIFIED
    sha_str = git_sha or _CONTEXTS_SOURCE_COMMIT

    graph = build_contexts_graph()
    header = _comment_header(date_str, sha_str)
    body = to_canonical_turtle(graph).decode("utf-8")
    content = header + body

    out_path = output_dir / CONTEXTS_FILENAME
    out_path.write_text(content, encoding="utf-8", newline="")
    return {out_path: content}
