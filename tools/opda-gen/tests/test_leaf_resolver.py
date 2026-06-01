"""
Tests for opda_gen.inputs.leaf_resolver — the S034 bind-only-what-exists
resolver (ADR-0029 gap-1).

Realises the S034 as-built fix 5 (Davis's withdrawal condition): a resolver
test exercises the three branches BEFORE the resolver drives any non-baspi5
form —
  - single-domain predicate    -> BIND
  - zero-domain predicate      -> GAP
  - multiple-domain predicate  -> GAP
plus COLLAPSED routing (uprn -> hasUPRN) and the path-aware collider-ambiguity
GAP (a fixtures price binds; a headline price does not).
"""

from __future__ import annotations

import json
from pathlib import Path

from rdflib import URIRef

from opda_gen.inputs.leaf_resolver import (
    EmittedPredicate,
    OPDA,
    ParsedForm,
    ParsedLeaf,
    bind,
    emitted_predicates,
    ref_key_for,
    resolve,
    walk_form,
)


def _pred(local: str, *, domains: int, ranges: int = 1) -> EmittedPredicate:
    """Build an EmittedPredicate fixture with the given domain/range counts.

    `emitted_predicates` collapses zero-or->1 domains to None; mirror that
    here so the fixtures match what the parser would produce.
    """
    dom = OPDA[f"{local.title()}Domain"] if domains == 1 else None
    rng = OPDA[f"{local.title()}Range"] if ranges == 1 else None
    return EmittedPredicate(
        local_name=local, iri=OPDA[local], kind="datatype",
        domain_iri=dom, range_iri=rng,
    )


def _leaf(path: str, name: str | None = None, *, enum=None) -> ParsedLeaf:
    return ParsedLeaf(
        leaf_path=path,
        name=name or path.split(".")[-1],
        ref="X.1",
        required=False,
        enum=tuple(enum) if enum else None,
    )


# --- the three branches (Davis condition) ---------------------------------
def test_bind_single_domain_predicate_binds() -> None:
    preds = {"bedrooms": _pred("bedrooms", domains=1)}
    result = bind(_leaf("propertyPack.bedrooms", "bedrooms"), preds)
    assert result is not None
    assert result.local_name == "bedrooms"
    assert result.domain_iri is not None


def test_bind_zero_domain_predicate_gaps() -> None:
    # A domain-less predicate gives no sound sh:targetClass -> GAP.
    preds = {"orphanProp": _pred("orphanProp", domains=0)}
    assert bind(_leaf("propertyPack.orphanProp", "orphanProp"), preds) is None


def test_bind_multiple_domain_predicate_gaps() -> None:
    # _pred(domains=2) collapses domain_iri to None like the parser does for
    # a >1-domain predicate -> GAP (binding to a guessed domain is unsound).
    preds = {"multiProp": _pred("multiProp", domains=2)}
    assert bind(_leaf("propertyPack.multiProp", "multiProp"), preds) is None


def test_bind_no_predicate_gaps() -> None:
    assert bind(_leaf("propertyPack.notEmitted", "notEmitted"), {}) is None


# --- COLLAPSED routing (ODR-0024 register) --------------------------------
def test_resolve_consults_collapsed_register() -> None:
    assert resolve("uprn") == "hasUPRN"
    assert resolve("address") == "hasAddress"
    # A name absent from the register resolves to itself (flat-default).
    assert resolve("bedrooms") == "bedrooms"


def test_bind_uprn_routes_to_hasuprn() -> None:
    preds = {"hasUPRN": _pred("hasUPRN", domains=1)}
    result = bind(_leaf("propertyPack.uprn", "uprn"), preds)
    assert result is not None
    assert result.local_name == "hasUPRN"


# --- path-aware collider guard (FIX 4 / ODR-0022 G1) ----------------------
def test_fixtures_price_binds_when_emitted_with_domain() -> None:
    # If opda:price had a single domain, a fixtures price would bind (it is
    # the Category-D chattel price). Use a single-domain fixture to prove the
    # path-aware branch admits it.
    preds = {"price": _pred("price", domains=1)}
    leaf = _leaf("propertyPack.fixturesAndFittings.basicFittings.boiler.price",
                 "price")
    assert bind(leaf, preds) is not None


def test_headline_price_gaps_even_when_predicate_exists() -> None:
    # A non-fixtures `price` (headline asking price) must NOT bind to the
    # Category-D chattel price predicate — collider-ambiguous GAP.
    preds = {"price": _pred("price", domains=1)}
    leaf = _leaf("propertyPack.priceInformation.price", "price")
    assert bind(leaf, preds) is None


def test_disclosure_detail_collider_gaps_via_zero_domain() -> None:
    # `details` resolves to disclosureDetail, which is domain-less in the real
    # corpus -> GAP. Mirror that: a zero-domain disclosureDetail GAPs.
    preds = {"disclosureDetail": _pred("disclosureDetail", domains=0)}
    leaf = _leaf("propertyPack.listingAndConservation.isListed.details",
                 "details")
    assert bind(leaf, preds) is None


# --- ref-key map (FIX 2) --------------------------------------------------
def test_ref_key_for_main_form() -> None:
    assert ref_key_for("ta6") == "ta6Ref"
    assert ref_key_for("con29R") == "con29RRef"
    assert ref_key_for("nts2") == "nts2Ref"


def test_ref_key_for_extension_is_ntsref() -> None:
    for code in ("as", "sf", "tf", "jk"):
        assert ref_key_for(code) == "ntsRef"


# --- walk_form on a real overlay ------------------------------------------
_OVERLAYS = (
    Path(__file__).resolve().parents[3]
    / "source" / "03-standards" / "schemas" / "src" / "schemas" / "v3"
    / "overlays"
)


def test_walk_form_ta6_finds_ref_leaves() -> None:
    form = walk_form("ta6", _OVERLAYS / "ta6.json")
    assert form.schema_id.endswith("/overlays/ta6.json")
    assert len(form.leaves) > 10
    # Every leaf carries a ref and a non-empty path.
    for lf in form.leaves:
        assert lf.ref
        assert lf.leaf_path
    # Leaves are deterministically sorted by path with no duplicate paths.
    paths = [lf.leaf_path for lf in form.leaves]
    assert paths == sorted(paths)
    assert len(paths) == len(set(paths))


def test_walk_form_extension_uses_ntsref() -> None:
    # sf.json keys on ntsRef; with the {form_id}Ref heuristic it would find
    # zero leaves. Prove the extension override reaches its leaves.
    form = walk_form("sf", _OVERLAYS / "extensions" / "sf.json")
    assert len(form.leaves) >= 1


def test_emitted_predicates_parses_corpus() -> None:
    onto = (
        Path(__file__).resolve().parents[3]
        / "source" / "03-standards" / "ontology"
    )
    preds = emitted_predicates(onto)
    # The descriptive TBox is substantially complete (S034: 254 predicates).
    assert len(preds) > 200
    # A known single-domain flagship attribute binds.
    assert "councilTaxBand" in preds
    assert preds["councilTaxBand"].domain_iri is not None
