"""
Module object_property_residue.

The relationship-layer **residue register** (ADR-0048 work-item 2; the
object-property analogue of `inputs/category_g_curation.COLLAPSED`): the single
source of truth for §R2 object-property associations whose disposition is NOT a
straight GATED emit of a type-pinned `opda:` object property.

ODR-0032 §R1 (as amended by Council session-047, 2026-06-17) resolves every
source inter-entity association to exactly one of three dispositions —
*nothing is silently dropped*:

- **GATED** — both endpoints carry an identity criterion (+I) and a worked
  SPARQL competency query motivates the edge → emit the typed object property
  (type-pinned in OWL `rdfs:range` OR a SHACL `sh:class`/`sh:node` value-type
  shape). GATED edges are NOT recorded here; the coverage gate detects them by
  predicate-declaration + type-pinning against the emitted corpus, exactly as
  `ci-category-g-coverage` detects a minted leaf by name-match.
- **VALUE-SLOT** — a −I endpoint (a quality/mode with no bearer-independent
  identity, e.g. a name) → a `DatatypeProperty` / `sh:in` value path, never an
  `ObjectProperty`. Recorded here with a reason so the strike from the
  object-property inventory is accounted-for, not collapsed-by-silence.
- **RESIDUE-PENDING** (`PENDING-upstream-IC`) — an endpoint whose identity
  criterion is owned by an *unfinished upstream council* → emit the predicate
  now, defer the range, and record the blocking record. The gate is
  **forbidden from manufacturing a class** to satisfy coverage (Council
  session-047 Q6, Address pending ODR-0015).
- **DEFERRED** — a GATED-in-principle edge with **no exemplar + worked query
  yet** → record here with the blocking reason until a concrete consumer lands
  (honours the ODR-0007 "defer until a concrete consumer" dissent; Council
  session-047 Q2: only `dependsOnTransaction`/`chainMembers` defer, the basic
  competency edges gate on their retrieving query).

The register is **gate-checked**: a registered association MUST carry a
non-empty disposition + reason. An empty / "TODO" disposition is a violation
(ODR-0032 §R1 "collapse-by-silence is never available"; ADR-0048 §4 limb (d)).

This module records ONLY the exceptions (VALUE-SLOT / RESIDUE-PENDING /
DEFERRED). The GATED inventory is the emitted corpus itself — see the companion
gate `ci/object_property_coverage_test.py`.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Disposition(str, Enum):
    """The three non-GATED dispositions of ODR-0032 §R1 (Council session-047).

    GATED is deliberately ABSENT: a gated edge is not residue — it is the
    emitted corpus, detected by the coverage gate against the TTLs. Only the
    non-emit dispositions live in this register.
    """

    # −I endpoint → datatype/sh:in value path, struck from the object-property
    # inventory (ODR-0032 §R2 Council session-047 Q3: `hasName`+`opda:Name`).
    VALUE_SLOT = "VALUE-SLOT"
    # An endpoint IC owned by an unfinished upstream council → emit the
    # predicate, defer the range; the gate MUST NOT manufacture a class
    # (Council session-047 Q6: Address pending ODR-0015).
    PENDING_UPSTREAM_IC = "PENDING-upstream-IC"
    # GATED-in-principle but no exemplar + worked query yet → defer until a
    # concrete consumer lands (Council session-047 Q2: the chain pair only).
    DEFERRED = "DEFERRED"
    # Co-domain is an EXTERNAL IRI cited reference-not-import (ODR-0012
    # §Reference-not-import / ODR-0018 §Rule 4) — intentionally un-ranged to an
    # opda: class and un-pinned in SHACL, because the target vocabulary (e.g.
    # DPV-PD) is deliberately NOT imported. This is a principled exception to
    # the corpus-wide rangeless-AND-shapeless limb (a) that the §R2 council did
    # not enumerate; recorded here so the exception is accounted-for, never
    # silently excused. (Pre-existing predicate, outside the §R2 inventory.)
    REFERENCE = "REFERENCE"


@dataclass(frozen=True)
class ResidueEntry:
    """One residue-register row: a non-GATED disposition + its (non-empty)
    reason and the blocking upstream record where one applies.

    `is_well_formed` is the gate-checked invariant — a registered entry MUST
    carry a real disposition and a non-empty, non-"TODO" reason (ODR-0032 §R1;
    ADR-0048 §4 limb (d))."""

    disposition: Disposition
    reason: str
    # The upstream record that must settle before this can become GATED
    # (e.g. "ODR-0015" for Address; empty for a pure VALUE-SLOT strike).
    blocking_record: str = ""

    @property
    def is_well_formed(self) -> bool:
        reason = self.reason.strip()
        return bool(reason) and reason.upper() != "TODO"


# Predicate local name -> its non-GATED disposition. Mirrors the shape of
# `category_g_curation.COLLAPSED` (a flat dict keyed on the local name): the
# coverage gate reads this to (a) account for every §R2 association that is NOT
# an emitted GATED edge, and (b) fail on any malformed (empty/"TODO") entry.
#
# Seeded from the Council session-047 dispositions over the ODR-0032 §R2
# inventory (the "dispositions over this inventory" amendment block):
RESIDUE_REGISTER: dict[str, ResidueEntry] = {
    # --- VALUE-SLOT: −I endpoint, struck from object-property inventory ------
    # `hasName`+`opda:Name` is STRUCK (Council session-047 Q3, 7–0–0). A name
    # carries no bearer-independent identity criterion (−I); it is emitted as a
    # structured DATATYPE value (component DatatypeProperties + bearer-typing in
    # a SHACL NameShape, no rdfs:domain), NOT an owl:ObjectProperty. The
    # promote-to-(dependent, non-owl:Class)-node trigger is corpus-verified NOT
    # to have fired (opda:NameChangeEvent names the Person via
    # prov:wasAssociatedWith; names are string literals — opda-agent.ttl:34 /
    # opda-agent-shapes.ttl:75 / exemplars/person-with-name-change.ttl).
    # Entity-resolution is explicitly excluded as a trigger.
    "hasName": ResidueEntry(
        Disposition.VALUE_SLOT,
        "−I endpoint, no bearer-independent identity criterion; served by the "
        "structured datatype path opda:hasName + SHACL NameShape, not an "
        "owl:ObjectProperty (Council session-047 Q3; ODR-0032 §R2 strike). "
        "Promote-to-dependent-Name-node trigger corpus-verified not fired.",
    ),
    # --- PENDING-upstream-IC: range class owned by an unfinished council -----
    # `hasAddress` predicate IS extended to Person/Organisation (drop its
    # Property-only rdfs:domain; bearer-typing → SHACL; keep rdfs:range
    # opda:Address) — the PREDICATE is GATED and emitted. What is PENDING is the
    # opda:Address CLASS/IC: ODR-0005 §6b deferred Mode-vs-Resource to ODR-0015.
    # The gate MUST NOT manufacture an opda:Address class to satisfy coverage
    # (Council session-047 Q6, 7–0–0). Recorded here against the Address-class
    # endpoint, NOT the hasAddress predicate (which is covered as GATED).
    "Address": ResidueEntry(
        Disposition.PENDING_UPSTREAM_IC,
        "opda:Address class/IC pending: ODR-0005 §6b deferred Mode-vs-Resource "
        "to ODR-0015. The hasAddress PREDICATE is extended + emitted (GATED); "
        "the gate must not manufacture an opda:Address class to satisfy "
        "coverage (Council session-047 Q6).",
        blocking_record="ODR-0015",
    ),
    # --- DEFERRED: GATED-in-principle, no worked-query consumer yet ----------
    # The chain pair is pure ODR-0007 §S007-Q4 comment-ware. Council
    # session-047 Q2 deferred ONLY this pair (Davis's carried nuance: a blanket
    # per-edge defer would strand participant/property edges that have obvious
    # consumers, so the basic competency edges gate on their retrieving query;
    # only the chain pair defers to the register). NOTE: the
    # chain-of-transactions.ttl exemplar DOES carry dependsOnTransaction /
    # chainMembers ABox today — but the Council ruling defers them at the
    # modelling layer (no GATED worked-query acceptance yet), so they are
    # registered DEFERRED and the competency limb reports them as deferred
    # (logged, never silently skipped) rather than gating on them. They graduate
    # to GATED when a chain exemplar + worked query is ratified.
    "dependsOnTransaction": ResidueEntry(
        Disposition.DEFERRED,
        "no GATED chain exemplar + worked competency query yet — ODR-0007 "
        "§S007-Q4 comment-ware; deferred until a concrete chain consumer lands "
        "(Council session-047 Q2 defers the chain pair only).",
        blocking_record="ODR-0007",
    ),
    "chainMembers": ResidueEntry(
        Disposition.DEFERRED,
        "no GATED chain exemplar + worked competency query yet — ODR-0007 "
        "§S007-Q4 comment-ware; deferred until a concrete chain consumer lands "
        "(Council session-047 Q2 defers the chain pair only).",
        blocking_record="ODR-0007",
    ),
    # --- REFERENCE: external co-domain cited reference-not-import ------------
    # opda:baselineCategory references a DPV-PD personal-data category that is
    # deliberately NOT imported (ODR-0012 §Reference-not-import + ODR-0018 §Rule
    # 4): it has no rdfs:range to an opda: class and no SHACL sh:class pin BY
    # DESIGN. It is a pre-existing predicate OUTSIDE the ODR-0032 §R2 inventory
    # that the corpus-wide rangeless-AND-shapeless limb (a) catches; this
    # disposition accounts for the principled exception so it is not silently
    # excused. NOTE: surfaced by the gate as a finding for team-lead — the §R2
    # council did not enumerate it; the disposition is the gate engineer's
    # honest accounting, ratifiable upstream.
    "baselineCategory": ResidueEntry(
        Disposition.REFERENCE,
        "co-domain is an external DPV-PD category IRI cited reference-not-import "
        "(ODR-0012 §Reference-not-import / ODR-0018 §Rule 4) — intentionally "
        "un-ranged + un-pinned because DPV is not imported; pre-existing, "
        "outside the §R2 relationship inventory.",
        blocking_record="ODR-0018",
    ),
}


def malformed_entries() -> dict[str, ResidueEntry]:
    """Residue rows whose disposition/reason is empty or "TODO" — the gate-check
    on the register itself (ODR-0032 §R1; ADR-0048 §4 limb (d)). Empty == every
    registered association carries a real disposition + reason."""
    return {
        name: entry
        for name, entry in RESIDUE_REGISTER.items()
        if not entry.is_well_formed
    }


def deferred_predicates() -> frozenset[str]:
    """Local names dispositioned DEFERRED — the competency-query limb routes
    these to the residue register (reported as deferred, never silently
    skipped) instead of failing on an empty query result."""
    return frozenset(
        name
        for name, entry in RESIDUE_REGISTER.items()
        if entry.disposition is Disposition.DEFERRED
    )


def reference_predicates() -> frozenset[str]:
    """Local names dispositioned REFERENCE — co-domain is an external IRI cited
    reference-not-import, so the rangeless-AND-shapeless limb (a) excuses them
    (the exception is accounted-for here, never silently excused)."""
    return frozenset(
        name
        for name, entry in RESIDUE_REGISTER.items()
        if entry.disposition is Disposition.REFERENCE
    )
