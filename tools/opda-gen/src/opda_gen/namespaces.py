"""Single source of truth for OPDA namespace IRIs (ADR-0006 frozen scheme).

Migration 2026-06-02: base ``https://w3id.org/opda/#…`` → ``https://opda.org.uk/pdtf/…``.
See ``docs/PLAN-2026-06-02-namespace-migration.md`` and ADR-0006 (definitive block).

This is a **kind-namespace split**, NOT a flat prefix swap — each kind of
resource lands in its own sub-namespace:

==========================  =============  =====================================
kind                        constant       IRI shape
==========================  =============  =====================================
class / property (term)     ``OPDA``         ``https://opda.org.uk/pdtf/``
SKOS scheme + concept       ``OPDA_SCHEME``  ``https://opda.org.uk/pdtf/scheme/``
SHACL shape node            ``OPDA_SHAPE``   ``https://opda.org.uk/pdtf/shape/``
named graph (logical)       ``OPDA_GRAPH``   ``https://opda.org.uk/pdtf/graph/``
physical + governance       ``OPDA_HARNESS`` ``https://opda.org.uk/pdtf/harness/``
==========================  =============  =====================================

Slash, no hash, no version-in-IRI (version via ``owl:versionInfo`` +
``owl:versionIRI`` → release snapshot). External namespaces (dpv, W3C,
``trust.propdata.org.uk``, ``www.basp.uk/forms``, regulator citations,
``urn:opda:exemplar:*``) are NOT defined here and never migrate.
"""

from __future__ import annotations

from collections.abc import Iterable

from rdflib import Namespace, URIRef

# --- Base + kind namespaces ----------------------------------------------
_BASE = "https://opda.org.uk/pdtf/"

OPDA = Namespace(_BASE)
OPDA_SCHEME = Namespace(_BASE + "scheme/")
OPDA_SHAPE = Namespace(_BASE + "shape/")
OPDA_GRAPH = Namespace(_BASE + "graph/")
OPDA_HARNESS = Namespace(_BASE + "harness/")

# The flat term-namespace string (vann:preferredNamespaceUri, sh:declare,
# PREFIX lines in embedded SPARQL). Trailing-slash, no hash.
OPDA_NS_STR = _BASE

# --- Flatten-collision guard (ADR-0006 / migration plan §5) --------------
# Reserved path segments under the flat term namespace. A class/property whose
# local name equals one of these would be indistinguishable from a kind
# sub-namespace once flattened under /pdtf/.
RESERVED_SEGMENTS = frozenset(
    {
        "scheme",
        "shape",
        "graph",
        "harness",
        "profiles",
        "release",
        "data",
        "odr",
        "adr",
        "data-dictionary",
    }
)


def assert_no_segment_collision(local_names: Iterable[str]) -> None:
    """Fail loudly if any minted term local-name collides with a reserved kind
    segment under the flat ``/pdtf/`` namespace."""
    clash = sorted({n for n in local_names if n in RESERVED_SEGMENTS})
    if clash:
        raise ValueError(
            "term local-name(s) collide with reserved kind segments under the "
            f"flat /pdtf/ namespace: {clash} (ADR-0006 flatten-collision guard)"
        )


# --- Harness reference helpers (hash→slash; governance under /harness/) ---
_HARNESS = _BASE + "harness/"


def odr_ref(odr_id: str, section: str) -> URIRef:
    """ODR section anchor → ``…/pdtf/harness/odr/<ODR-NNNN>/<section>``.

    ``section`` is the anchor WITHOUT a leading ``#`` (e.g. ``"section-Q1"``).
    Hash→slash: the old ``…/opda/odr/ODR-NNNN#section-X`` becomes a slash path.
    """
    return URIRef(f"{_HARNESS}odr/{odr_id}/{section}")


def adr_ref(slug: str) -> URIRef:
    """ADR link → ``…/pdtf/harness/adr/<ADR-NNNN-slug>``.

    Replaces the old ``https://openpropdata.org.uk/adr/<slug>`` base.
    """
    return URIRef(f"{_HARNESS}adr/{slug}")


def dd_entry(safe_path: str) -> URIRef:
    """Data-dictionary entry → ``…/pdtf/harness/data-dictionary/<safe.path>``.

    ``safe_path`` is the already-URL-safe dotted leaf path (percent-encoding
    applied by the caller, unchanged from the pre-migration form). Hash→slash:
    the old ``…/opda/data-dictionary#<safe>`` becomes a slash path.
    """
    return URIRef(f"{_HARNESS}data-dictionary/{safe_path}")


def release_iri(version: str) -> URIRef:
    """Release snapshot (``owl:versionIRI`` target) → ``…/pdtf/harness/release/<v>/``."""
    return URIRef(f"{_HARNESS}release/{version}/")


def harness_data(suffix: str = "") -> URIRef:
    """Instance / test data → ``…/pdtf/harness/data/<suffix>``."""
    return URIRef(f"{_HARNESS}data/{suffix}")
