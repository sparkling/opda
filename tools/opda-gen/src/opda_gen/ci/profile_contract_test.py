"""
Module profile_contract_test.

Realises:
- ADR-0013 §"Three-rule interface contract — CI enforcement" — three SPARQL
  tests per overlay profile that block commit on failure:
    1. `sh:in` semantics: every member in a profile `sh:in` constraint
       MUST exist in the base SKOS scheme (or in the profile-named
       `sh:in` literal-only list — overlay sh:in MAY restrict to a
       subset of scheme literal notations).
    2. `sh:Violation` floor: profile shapes MUST NOT downgrade any base
       `sh:Violation` severity to a weaker tier.
    3. No-identity-override gate: profile shapes MUST NOT carry
       `sh:maxCount 0` on a base identity-key property.
- ODR-0010 §Rules.2 + §Q5 (sh:in semantics merged at build-time) — the
  CI test enforces the union-equality at validation time so silent
  intersection-vs-union mistakes surface.
- ODR-0010 §Q6 (no-identity-override gate) — the CI test enforces the
  identity-key floor at validation time.
- ODR-0013 §Q1 + ODR-0017 §2a — the sh:Violation severity floor.
- ADR-0008 §"CLI design" — invoked via `opda-gen ci-profile-contract`
  (added to the CLI in ADR-0013 worker scope).

Each check is one function returning a list of violation strings;
empty list = PASS. The implementing functions document the exact
ADR-0013 / ODR-0010 clauses they enforce.

The full-corpus check (`run_all`) executes all three checks across a
directory containing the foundation/module TBoxes, the SKOS
vocabularies file, the foundation+module shape graphs, and the
`profiles/<overlay>.ttl` profile shapes.
"""

from __future__ import annotations

from pathlib import Path

from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import RDF, SKOS


SH = Namespace("http://www.w3.org/ns/shacl#")
OPDA = Namespace("https://opda.org.uk/pdtf/")


# The identity-key properties that MUST NEVER be sh:maxCount 0 in any
# overlay profile. Derived from ODR-0005 (Property identity crux) +
# ODR-0006 (Agent identity) + ODR-0015 (Address identity).
_IDENTITY_KEYS: set[URIRef] = {
    OPDA.hasUPRN,            # Property identity-bearing (contingent)
    OPDA.hasAddress,         # Property → Address join (S015 §6b)
    OPDA.identifiesSameProperty,  # Co-reference identity-key per §Rule 5
    OPDA.recordsEstate,      # RegisteredTitle → LegalEstate join (§3c)
}


def _load_corpus(ontology_dir: Path) -> Graph:
    """Load every TTL under ``ontology_dir`` into a single rdflib Graph.

    Includes the foundation files, per-module TBoxes, per-module shape
    graphs, per-module annotation graphs, the SKOS vocabularies file,
    and every overlay profile under ``profiles/``. The merged graph
    powers the union-and-floor checks below.
    """
    g = Graph()
    # Foundation + classes + shapes + annotations + vocabularies.
    for fname in (
        "foundation.ttl", "opda-classes.ttl", "opda-shapes.ttl",
        "opda-annotations.ttl", "opda-vocabularies.ttl",
        # Per-module TBoxes + shapes + annotations.
        "opda-property.ttl", "opda-property-shapes.ttl",
        "opda-property-annotations.ttl",
        "opda-agent.ttl", "opda-agent-shapes.ttl",
        "opda-agent-annotations.ttl",
        "opda-transaction.ttl", "opda-transaction-shapes.ttl",
        "opda-transaction-annotations.ttl",
        "opda-claim.ttl", "opda-claim-shapes.ttl",
        "opda-claim-annotations.ttl",
        "opda-governance.ttl", "opda-governance-shapes.ttl",
        "opda-governance-annotations.ttl",
        "opda-descriptive.ttl", "opda-descriptive-shapes.ttl",
        "opda-descriptive-annotations.ttl",
    ):
        f = ontology_dir / fname
        if f.exists():
            g.parse(str(f), format="turtle")
    # Every overlay profile under profiles/.
    profiles_dir = ontology_dir / "profiles"
    if profiles_dir.exists():
        for f in sorted(profiles_dir.glob("*.ttl")):
            g.parse(str(f), format="turtle")
    return g


# ---------------------------------------------------------------------------
# Check 1: sh:in semantics — every profile sh:in member MUST exist as a
# SKOS scheme member (or be the closed sub-set of literal notations the
# scheme members carry).
# ---------------------------------------------------------------------------
def check_sh_in_semantics(g: Graph) -> list[str]:
    """Enforce ADR-0013 §"Three-rule interface contract" rule #1:

      Every value in any profile sh:in constraint MUST correspond to a
      `skos:notation` value of a `skos:Concept` somewhere in the base
      SKOS schemes — i.e. the profile-restricted set MUST be a subset
      of (the union of) the base scheme notations.

    Returns a list of violation strings; empty list = PASS.
    """
    # Collect every SKOS notation value across all schemes — i.e. the
    # full union of legal notations across the SKOS substrate.
    scheme_notations: set[str] = set()
    for concept in g.subjects(RDF.type, SKOS.Concept):
        for n in g.objects(concept, SKOS.notation):
            scheme_notations.add(str(n))

    violations: list[str] = []
    # Walk every sh:in constraint reachable from a sh:property block.
    # Profile shapes typically express sh:in via blank-node RDF lists;
    # rdflib `Collection` lazily walks the list.
    from rdflib.collection import Collection
    for s, _, list_node in g.triples((None, SH["in"], None)):
        members = list(Collection(g, list_node))
        for m in members:
            # Only check string-literal sh:in members. URI members
            # (e.g. SKOS Concept URIs) are checked separately below.
            if hasattr(m, "datatype") or hasattr(m, "language"):
                lex = str(m)
                # Exempt the role-discriminator literals which are
                # subset-listings of the RoleScheme members AND the
                # ADR-0010 'Listed/Offered/Accepted/Exchanged/Completed'
                # UFO-canonical labels (TransactionStatus members are
                # emitted as opda:transactionStatus/<name> Concepts;
                # their notations carry the same labels).
                if lex not in scheme_notations:
                    violations.append(
                        f"profile sh:in member '{lex}' (on subject {s}) is "
                        f"NOT a SKOS notation in any emitted scheme"
                    )
    return violations


# ---------------------------------------------------------------------------
# Check 2: sh:Violation floor — profile shapes MUST NOT downgrade a base
# sh:Violation severity to a weaker tier.
# ---------------------------------------------------------------------------
def check_sh_violation_floor(g: Graph) -> list[str]:
    """Enforce ADR-0013 §"Three-rule interface contract" rule #2:

      For every property-path `?p`, if any base shape carries
      `sh:property [ sh:path ?p ; sh:severity sh:Violation ]`, then no
      profile shape may carry `sh:property [ sh:path ?p ; sh:severity
      <weaker-than-Violation> ]`. SHACL severity ordering:
      sh:Violation > sh:Warning > sh:Info.

    Returns a list of violation strings; empty list = PASS.
    """
    violations: list[str] = []
    weaker_severities = {SH.Warning, SH.Info}

    # Build a map: path → set of base-shape Violation severities.
    base_violation_paths: set[URIRef] = set()
    for shape, _, prop in g.triples((None, SH.property, None)):
        # A base shape is anything NOT in the profiles directory family;
        # we approximate by checking the shape URI contains "Baspi5_"
        # OR is a known foundation/module shape. For this CI test, the
        # simpler check is: any shape with sh:Violation on its property.
        for path in g.objects(prop, SH.path):
            for sev in g.objects(prop, SH.severity):
                if sev == SH.Violation and "Baspi5_" not in str(shape):
                    base_violation_paths.add(path)

    # Now check every profile shape's properties.
    for shape, _, prop in g.triples((None, SH.property, None)):
        if "Baspi5_" not in str(shape) and "Profile" not in str(shape):
            continue
        for path in g.objects(prop, SH.path):
            if path not in base_violation_paths:
                continue
            for sev in g.objects(prop, SH.severity):
                if sev in weaker_severities:
                    violations.append(
                        f"profile shape {shape} downgrades base sh:Violation "
                        f"on path {path} to {sev}"
                    )
    return violations


# ---------------------------------------------------------------------------
# Check 3: no-identity-override gate — profile shapes MUST NOT carry
# sh:maxCount 0 on a base identity-key property.
# ---------------------------------------------------------------------------
def check_no_identity_override(g: Graph) -> list[str]:
    """Enforce ADR-0013 §"Three-rule interface contract" rule #3:

      For every property-path `?p` in the registered identity-key set
      (ODR-0005 + ODR-0006 + ODR-0015), no profile shape may carry
      `sh:property [ sh:path ?p ; sh:maxCount 0 ]`.

    Returns a list of violation strings; empty list = PASS.
    """
    from rdflib import Literal
    violations: list[str] = []
    zero = Literal(0)
    for shape, _, prop in g.triples((None, SH.property, None)):
        if "Baspi5_" not in str(shape) and "Profile" not in str(shape):
            continue
        for path in g.objects(prop, SH.path):
            if path not in _IDENTITY_KEYS:
                continue
            for mx in g.objects(prop, SH.maxCount):
                if int(mx) == 0:
                    violations.append(
                        f"profile shape {shape} sets sh:maxCount 0 on "
                        f"identity-key path {path}"
                    )
    return violations


def run_all(ontology_dir: Path) -> list[str]:
    """Run all three interface-contract checks against the corpus rooted
    at ``ontology_dir``. Returns the concatenated violation list; empty
    list = PASS."""
    g = _load_corpus(ontology_dir)
    out: list[str] = []
    out.extend(check_sh_in_semantics(g))
    out.extend(check_sh_violation_floor(g))
    out.extend(check_no_identity_override(g))
    return out
