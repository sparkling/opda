"""Load and classify the closed Property Pack scope against the candidate model."""
from __future__ import annotations

import hashlib
import json
import tomllib
from pathlib import Path
from typing import Any


EXPECTED_CONTEXTS = {
    "common", "conveyancing", "property-data-services", "surveying-and-valuation",
    "estate-agency", "finance-and-banking", "property-technology", "dbt-smart-data",
}
ALLOWED_ROLES = {"resource", "relationship", "attribute", "validation-rule", "controlled-concept"}
ALLOWED_DISPOSITIONS = {"model", "consolidate", "split", "challenge"}


def sha256(data: bytes | str) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def read_toml(path: Path) -> dict[str, Any]:
    return tomllib.loads(path.read_text(encoding="utf-8"))


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def compact_array(values: list[dict[str, Any]]) -> str:
    lines = ["["]
    for index, value in enumerate(values):
        suffix = "," if index + 1 < len(values) else ""
        lines.append(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + suffix)
    return "\n".join(lines) + "\n]\n"


def load_model(root: Path) -> dict[str, Any]:
    config_dir = root / "src/data/property-pack/candidate-model"
    manifest = read_toml(config_dir / "manifest.toml")
    catalogue_path = root / manifest["catalogue_path"]
    catalogue_bytes = catalogue_path.read_bytes()
    catalogue = json.loads(catalogue_bytes)
    contexts = {entry["id"]: entry for entry in manifest["context"]}
    errors: list[str] = []
    if set(contexts) != EXPECTED_CONTEXTS:
        errors.append(f"unexpected contexts: {sorted(set(contexts) ^ EXPECTED_CONTEXTS)}")
    if sha256(catalogue_bytes) != manifest["catalogue_sha256"]:
        errors.append("catalogue digest mismatch")
    if len(catalogue) != manifest["scope"]["source_item_count"]:
        errors.append("catalogue count mismatch")

    terms: dict[str, dict[str, Any]] = {}
    prefixes = {entry["prefix"]: entry["id"] for entry in contexts.values()}
    for relative in manifest["context_fragments"]:
        fragment = read_toml(config_dir / relative)
        context_id = fragment["context"]["id"]
        if context_id not in contexts:
            errors.append(f"unknown context fragment: {context_id}")
            continue
        if fragment["context"]["prefix"] != contexts[context_id]["prefix"]:
            errors.append(f"prefix mismatch: {context_id}")
        for term in fragment.get("term", []):
            key = f"{context_id}:{term['id']}"
            if key in terms:
                errors.append(f"duplicate term: {key}")
            terms[key] = {**term, "home": context_id, "key": key}

    rules: list[dict[str, Any]] = []
    for relative in manifest["rules_fragments"]:
        rules.extend(read_toml(config_dir / relative).get("rule", []))
    vocabulary_data = read_toml(config_dir / manifest["vocabulary_fragment"])
    vocabularies = {
        f"{entry['home']}:{entry['id']}": {**entry, "key": f"{entry['home']}:{entry['id']}"}
        for entry in vocabulary_data.get("vocabulary", [])
    }
    model = {
        "root": root, "config_dir": config_dir, "manifest": manifest, "catalogue": catalogue,
        "contexts": contexts, "prefixes": prefixes, "terms": terms, "rules": rules,
        "vocabularies": vocabularies, "vocabulary_rules": vocabulary_data.get("vocabulary_rule", []),
        "errors": errors,
    }
    validate_model(model)
    return model


def context_for_alias(model: dict[str, Any], alias: str) -> str | None:
    if alias in model["contexts"]:
        return alias
    return model["prefixes"].get(alias)


def full_iri(model: dict[str, Any], reference: str, vocabulary: bool = False) -> str:
    standard = {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "owl": "http://www.w3.org/2002/07/owl#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "skos": "http://www.w3.org/2004/02/skos/core#",
        "dcterms": "http://purl.org/dc/terms/",
        "prov": "http://www.w3.org/ns/prov#",
    }
    alias, local = reference.split(":", 1)
    if alias in standard:
        return standard[alias] + local
    context = context_for_alias(model, alias)
    if not context:
        raise ValueError(f"unknown reference prefix: {reference}")
    segment = "vocabulary/" if vocabulary else ""
    return f"{model['manifest']['base_iri']}{context}/{segment}{local}"


def canonical_term_key(model: dict[str, Any], reference: str) -> str | None:
    alias, local = reference.split(":", 1)
    context = context_for_alias(model, alias)
    return f"{context}:{local}" if context else None


def rule_matches(rule: dict[str, Any], record: dict[str, Any]) -> bool:
    source = record["source"]
    checks = {
        "path": source["path"], "heading": source["heading"], "field_name": source["field_name"],
    }
    for key, actual in checks.items():
        if key in rule and rule[key] != actual:
            return False
    if "path_contains" in rule and rule["path_contains"] not in source["path"]:
        return False
    if "path_prefix" in rule and not source["path"].startswith(rule["path_prefix"]):
        return False
    return True


def rule_for(model: dict[str, Any], record: dict[str, Any]) -> dict[str, Any]:
    matches = [rule for rule in model["rules"] if rule_matches(rule, record)]
    if not matches:
        raise ValueError(f"no semantic rule for {record['id']} {record['source']['path']}")
    highest = max(rule["priority"] for rule in matches)
    winners = [rule for rule in matches if rule["priority"] == highest]
    if len(winners) != 1:
        raise ValueError(f"ambiguous semantic rule for {record['id']}: {[rule['id'] for rule in winners]}")
    return winners[0]


def vocabulary_for(model: dict[str, Any], record: dict[str, Any]) -> dict[str, Any] | None:
    values = record["restrictions"]["permitted_values"]
    if not values:
        return None
    matches = [rule for rule in model["vocabulary_rules"] if rule_matches(rule, record)]
    if len(matches) > 1:
        raise ValueError(f"ambiguous vocabulary rule for {record['id']}")
    if matches:
        key = matches[0]["scheme"]
    else:
        response = model["vocabularies"]["common:ResponseStatusScheme"]
        response_values = {concept["notation"] for concept in response["concepts"]}
        if not set(values).issubset(response_values):
            raise ValueError(f"unmapped source vocabulary for {record['id']}: {values}")
        key = response["key"]
    scheme = model["vocabularies"].get(key)
    if not scheme:
        raise ValueError(f"unknown vocabulary scheme: {key}")
    known = {concept["notation"] for concept in scheme["concepts"]}
    missing = sorted(set(values) - known)
    if missing:
        raise ValueError(f"{record['id']} values absent from {key}: {missing}")
    return scheme


def validate_model(model: dict[str, Any]) -> None:
    errors = model["errors"]
    term_kinds = {"class", "object-property", "datatype-property"}
    for term in model["terms"].values():
        if term["kind"] not in term_kinds:
            errors.append(f"{term['key']}: invalid kind")
        for field in ("domain", "range", "subclass_of"):
            if field not in term:
                continue
            key = canonical_term_key(model, term[field])
            if key and key not in model["terms"]:
                errors.append(f"{term['key']}: unresolved {field} {term[field]}")
    rule_ids: set[str] = set()
    for rule in model["rules"]:
        if rule["id"] in rule_ids:
            errors.append(f"duplicate rule: {rule['id']}")
        rule_ids.add(rule["id"])
        if rule["home"] not in model["contexts"]:
            errors.append(f"{rule['id']}: unknown home")
        if not set(rule["roles"]).issubset(ALLOWED_ROLES) or not rule["roles"]:
            errors.append(f"{rule['id']}: invalid roles")
        if rule["disposition"] not in ALLOWED_DISPOSITIONS:
            errors.append(f"{rule['id']}: invalid disposition")
        for reference in rule["construct_refs"]:
            key = canonical_term_key(model, reference)
            if not key or key not in model["terms"]:
                errors.append(f"{rule['id']}: unresolved construct {reference}")
    if len({record["id"] for record in model["catalogue"]}) != len(model["catalogue"]):
        errors.append("duplicate source item IDs")
    if len({record["source"]["path"] for record in model["catalogue"]}) != len(model["catalogue"]):
        errors.append("duplicate source paths")
    for record in model["catalogue"]:
        try:
            rule_for(model, record)
            vocabulary_for(model, record)
        except ValueError as error:
            errors.append(str(error))
    if errors:
        raise ValueError("\n".join(errors))


def build_classification(model: dict[str, Any]) -> dict[str, Any]:
    coverage: list[dict[str, Any]] = []
    traces: dict[str, set[str]] = {key: set() for key in model["terms"]}
    vocabulary_traces: dict[str, set[str]] = {key: set() for key in model["vocabularies"]}
    for record in model["catalogue"]:
        rule = rule_for(model, record)
        scheme = vocabulary_for(model, record)
        construct_keys = [canonical_term_key(model, ref) for ref in rule["construct_refs"]]
        for key in construct_keys:
            traces[key].add(record["id"])
        if scheme:
            vocabulary_traces[scheme["key"]].add(record["id"])
        topic_iri = ""
        if "controlled-concept" in rule["roles"]:
            topic_iri = f"{model['manifest']['base_iri']}{rule['home']}/topic/{record['id']}"
        coverage.append({
            "item_id": record["id"],
            "source_path": record["source"]["path"],
            "work_package": record["work_package"],
            "preferred_label": record["semantic"]["preferred_label"],
            "candidate_definition": record["semantic"]["candidate_definition"],
            "definition_status": record["semantic"]["definition_status"],
            "semantic_home": rule["home"],
            "consuming_contexts": rule.get("consuming_contexts", []),
            "roles": rule["roles"],
            "construct_refs": [full_iri(model, ref) for ref in rule["construct_refs"]],
            "construct_keys": construct_keys,
            "topic_iri": topic_iri,
            "disposition": rule["disposition"],
            "rationale": rule["rationale"],
            "rule_id": rule["id"],
            "source_constraints": {
                "datatype": record["value"]["xsd_datatype"],
                "min_count": record["value"]["min_count"],
                "max_count": record["value"]["max_count"],
                "requiredness": record["value"]["requiredness"],
                "repeatable_context": record["value"]["repeatable_context"],
                "occurrence_scope": record["value"]["occurrence_scope"],
                **record["restrictions"],
            },
            "vocabulary_ref": full_iri(model, scheme["key"], vocabulary=True) if scheme else "",
            "evidence": record["evidence"],
            "candidate_status": "machine-proposed",
        })
    direct_traces = {key: set(values) for key, values in traces.items()}
    changed = True
    while changed:
        changed = False
        for term in model["terms"].values():
            for field in ("domain", "range", "subclass_of"):
                dependency = canonical_term_key(model, term.get(field, "")) if term.get(field) else None
                if dependency and traces[term["key"]] - traces[dependency]:
                    traces[dependency].update(traces[term["key"]])
                    changed = True
    untraced = sorted(key for key, item_ids in traces.items() if not item_ids)
    if untraced:
        raise ValueError(f"ontology resources without Property Pack trace: {untraced}")
    return {
        "coverage": coverage,
        "term_traces": {key: sorted(values) for key, values in traces.items()},
        "term_direct_traces": {key: sorted(values) for key, values in direct_traces.items()},
        "term_structural_traces": {
            key: sorted(values - direct_traces[key]) for key, values in traces.items()
        },
        "vocabulary_traces": {key: sorted(values) for key, values in vocabulary_traces.items()},
    }
