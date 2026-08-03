"""Catalogue classification contracts for the greenfield Property Pack model.

Work packages are operational review batches.  They deliberately do not imply
ontology modules, semantic homes, resources, predicates, or IRIs.
"""
from __future__ import annotations

from collections import Counter
from typing import Any


WORK_PACKAGE_HEADINGS = {
    "property-identity-address": {"propertyPack", "address"},
    "titles-ownership": {"titlesToBeSold", "legalOwners", "ownership"},
    "rights-restrictions-boundaries": {
        "legalBoundaries", "rightsAndInformalArrangements",
        "disputesAndComplaints", "listingAndConservation",
    },
    "construction-services-energy": {
        "alterationsAndChanges", "buildInformation", "connectivity",
        "electricalWorks", "electricity", "energyEfficiency",
        "guaranteesWarrantiesAndIndemnityInsurances", "heating", "insurance",
        "parking", "servicesCrossing", "smartHomeSystems", "specialistIssues",
        "typeOfConstruction", "waterAndDrainage",
    },
    "searches-notices-environment": {
        "councilTax", "environmentalIssues", "localSearches", "notices",
    },
    "fixtures-fittings": {"fixturesAndFittings"},
    "transaction-occupiers-completion": {
        "completionAndMoving", "delayFactors", "lettingInformation",
        "occupiers", "priceInformation",
    },
    "evidence-declarations": {
        "additionalInformation", "confirmationOfAccuracyByOwners",
        "consumerProtectionRegulationsDeclaration", "media", "otherIssues",
        "saleReadyDeclarations",
    },
}

ALLOWED_WORK_PACKAGES = frozenset(WORK_PACKAGE_HEADINGS)
ALLOWED_ROLES = frozenset({
    "resource", "relationship", "attribute", "validation-rule",
    "controlled-concept",
})
ALLOWED_CLASSIFICATION_STATUSES = frozenset({
    "unclassified", "machine-proposed", "challenged", "human-reviewed",
    "approved",
})
ALLOWED_HOMES = frozenset({
    "unassigned", "finance-and-banking", "conveyancing", "estate-agency",
    "surveying-and-valuation", "property-data-services",
    "property-technology", "dbt-smart-data", "common",
})


def package_for_heading(heading: str) -> str:
    """Return the one operational work package assigned to a source heading."""
    matches = [key for key, headings in WORK_PACKAGE_HEADINGS.items() if heading in headings]
    if len(matches) != 1:
        raise ValueError(f"heading must map to exactly one work package: {heading!r}")
    return matches[0]


def empty_model() -> dict[str, Any]:
    """Return a model decision record that makes no semantic assertions."""
    return {
        "classification_status": "unclassified",
        "roles": [],
        "owning_context": "unassigned",
        "consuming_contexts": [],
        "construct_refs": [],
        "disposition": "unresolved",
        "sensitivity": "unclassified",
        "rationale": "",
        "decision_refs": [],
    }


def migrate_record(record: dict[str, Any]) -> dict[str, Any]:
    """Migrate a format-1.0 record without inventing semantic decisions."""
    governance = record.pop("governance", {})
    record["work_package"] = package_for_heading(record["source"]["heading"])
    record["model"] = empty_model()
    review = record["review"]
    review["approval_status"] = governance.get("approval_status", "proposed")
    review["quality"] = governance.get("quality", "needs-semantic-review")
    return record


def validate_classification(record: dict[str, Any]) -> list[str]:
    """Validate work-package and semantic decision state for one source item."""
    errors: list[str] = []
    item_id = record.get("id", "unknown")
    if record.get("work_package") not in ALLOWED_WORK_PACKAGES:
        errors.append(f"{item_id}: invalid work package {record.get('work_package')}")
    if "governance" in record:
        errors.append(f"{item_id}: obsolete governance block remains")
    model = record.get("model", {})
    status = model.get("classification_status")
    roles = model.get("roles", [])
    home = model.get("owning_context")
    if status not in ALLOWED_CLASSIFICATION_STATUSES:
        errors.append(f"{item_id}: invalid classification status {status}")
    if home not in ALLOWED_HOMES:
        errors.append(f"{item_id}: invalid semantic home {home}")
    if any(role not in ALLOWED_ROLES for role in roles):
        errors.append(f"{item_id}: invalid semantic role in {roles}")
    for context in model.get("consuming_contexts", []):
        if context not in ALLOWED_HOMES - {"unassigned"}:
            errors.append(f"{item_id}: invalid consuming context {context}")
    if status == "unclassified":
        if roles or home != "unassigned" or model.get("construct_refs"):
            errors.append(f"{item_id}: unclassified item asserts model decisions")
    else:
        required = roles and home != "unassigned" and model.get("construct_refs")
        required = required and model.get("rationale") and model.get("decision_refs")
        if not required:
            errors.append(f"{item_id}: classified item lacks decision evidence")
    review = record.get("review", {})
    for field in ("approval_status", "quality"):
        if not review.get(field):
            errors.append(f"{item_id}: review.{field} is missing")
    return errors


def classification_report(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Return deterministic counters for catalogue validation receipts."""
    return {
        "work_packages": dict(sorted(Counter(r["work_package"] for r in records).items())),
        "classification_statuses": dict(sorted(Counter(
            r["model"]["classification_status"] for r in records
        ).items())),
        "semantic_homes": dict(sorted(Counter(
            r["model"]["owning_context"] for r in records
        ).items())),
        "unresolved_classifications": sum(
            r["model"]["classification_status"] == "unclassified" for r in records
        ),
    }
