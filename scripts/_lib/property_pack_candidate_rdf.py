"""Deterministic RDF and semantic projection generation for the candidate model."""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from typing import Any

from .property_pack_candidate import (
    canonical_json, canonical_term_key, compact_array, full_iri, sha256,
)


STANDARD_PREFIXES = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "sh": "http://www.w3.org/ns/shacl#",
    "dcterms": "http://purl.org/dc/terms/",
    "prov": "http://www.w3.org/ns/prov#",
}


def ttl_literal(value: Any, language: str = "") -> str:
    rendered = json.dumps(str(value), ensure_ascii=False)
    return f"{rendered}@{language}" if language else rendered


def ttl_header(model: dict[str, Any], shapes: bool = False) -> str:
    base = model["manifest"]["base_iri"]
    prefixes = {**STANDARD_PREFIXES, "opdac": f"{base}meta/"}
    for context in model["contexts"].values():
        prefixes[context["prefix"]] = f"{base}{context['id']}/"
    lines = ['VERSION "1.2-basic"', ""]
    for prefix, iri in sorted(prefixes.items()):
        if prefix == "sh" and not shapes:
            continue
        lines.append(f"@prefix {prefix}: <{iri}> .")
    return "\n".join(lines) + "\n\n"


def predicate_block(subject: str, pairs: list[tuple[str, str]]) -> str:
    lines = [subject]
    for index, (predicate, value) in enumerate(pairs):
        punctuation = " ." if index + 1 == len(pairs) else " ;"
        lines.append(f"  {predicate} {value}{punctuation}")
    return "\n".join(lines)


def term_turtle(
    model: dict[str, Any], context_id: str, traces: dict[str, list[str]],
    selected_terms: list[tuple[str, dict[str, Any]]] | None = None, part: int = 1, total: int = 1,
) -> str:
    manifest = model["manifest"]
    context = model["contexts"][context_id]
    ontology_iri = f"<{manifest['base_iri']}ontology/{context_id}>"
    part_label = f" (part {part} of {total})" if total > 1 else ""
    blocks = [predicate_block(ontology_iri, [
        ("a", "owl:Ontology"),
        ("rdfs:label", ttl_literal(f"{context['label']} candidate ontology{part_label}", "en")),
        ("dcterms:description", ttl_literal(context["definition"], "en")),
        ("owl:versionInfo", ttl_literal(manifest["candidate_version"])),
        ("opdac:candidateStatus", ttl_literal(manifest["status"])),
    ])]
    type_map = {
        "class": "owl:Class", "object-property": "owl:ObjectProperty",
        "datatype-property": "owl:DatatypeProperty",
    }
    terms = selected_terms if selected_terms is not None else [
        (key, term) for key, term in sorted(model["terms"].items()) if term["home"] == context_id
    ]
    for key, term in terms:
        pairs = [
            ("a", type_map[term["kind"]]),
            ("rdfs:label", ttl_literal(term["label"], "en")),
            ("skos:definition", ttl_literal(term["definition"], "en")),
            ("opdac:semanticHome", f"<{manifest['base_iri']}context/{context_id}>"),
            ("opdac:sourceItemCount", f'"{len(traces[key])}"^^xsd:integer'),
            ("opdac:candidateStatus", ttl_literal(manifest["status"])),
        ]
        if term.get("identity"):
            pairs.append(("opdac:identityCriterion", ttl_literal(term["identity"], "en")))
        if term.get("subclass_of"):
            pairs.append(("rdfs:subClassOf", f"<{full_iri(model, term['subclass_of'])}>"))
        if term.get("domain"):
            pairs.append(("rdfs:domain", f"<{full_iri(model, term['domain'])}>"))
        if term.get("range"):
            pairs.append(("rdfs:range", f"<{full_iri(model, term['range'])}>"))
        if term.get("datatype"):
            pairs.append(("rdfs:range", f"<{full_iri(model, term['datatype'])}>"))
        blocks.append(predicate_block(f"<{full_iri(model, key)}>", pairs))
    return ttl_header(model) + "\n\n".join(blocks) + "\n"


def context_map_turtle(model: dict[str, Any]) -> str:
    base = model["manifest"]["base_iri"]
    blocks = [
        predicate_block("opdac:semanticHome", [("a", "owl:AnnotationProperty"), ("rdfs:label", ttl_literal("semantic home", "en"))]),
        predicate_block("opdac:sourceItemCount", [("a", "owl:AnnotationProperty"), ("rdfs:label", ttl_literal("source item count", "en"))]),
        predicate_block("opdac:candidateStatus", [("a", "owl:AnnotationProperty"), ("rdfs:label", ttl_literal("candidate status", "en"))]),
        predicate_block("opdac:identityCriterion", [("a", "owl:AnnotationProperty"), ("rdfs:label", ttl_literal("identity criterion", "en"))]),
    ]
    for context in sorted(model["contexts"].values(), key=lambda entry: entry["id"]):
        pairs = [
            ("a", "skos:Concept"),
            ("skos:prefLabel", ttl_literal(context["label"], "en")),
            ("skos:definition", ttl_literal(context["definition"], "en")),
            ("opdac:contextKind", ttl_literal(context["kind"])),
        ]
        if context["id"] != "common":
            pairs.append(("opdac:interoperatesThrough", f"<{base}context/common>"))
        blocks.append(predicate_block(f"<{base}context/{context['id']}>", pairs))
    return ttl_header(model) + "\n\n".join(blocks) + "\n"


def vocabulary_turtle(model: dict[str, Any], context_id: str, vocabularies: list[dict[str, Any]]) -> str:
    base = model["manifest"]["base_iri"]
    blocks: list[str] = []
    for vocabulary in sorted(vocabularies, key=lambda entry: entry["id"]):
        scheme_iri = full_iri(model, vocabulary["key"], vocabulary=True)
        blocks.append(predicate_block(f"<{scheme_iri}>", [
            ("a", "skos:ConceptScheme"),
            ("skos:prefLabel", ttl_literal(vocabulary["label"], "en")),
            ("skos:definition", ttl_literal(vocabulary["definition"], "en")),
            ("opdac:semanticHome", f"<{base}context/{context_id}>"),
            ("opdac:candidateStatus", ttl_literal(model["manifest"]["status"])),
        ]))
        for concept in vocabulary["concepts"]:
            concept_iri = f"{scheme_iri}/concept/{concept['id']}"
            blocks.append(predicate_block(f"<{concept_iri}>", [
                ("a", "skos:Concept"),
                ("skos:inScheme", f"<{scheme_iri}>"),
                ("skos:prefLabel", ttl_literal(concept["label"], "en")),
                ("skos:notation", ttl_literal(concept["notation"])),
            ]))
    return ttl_header(model) + "\n\n".join(blocks) + "\n"


def topic_turtle(model: dict[str, Any], context_id: str, entries: list[dict[str, Any]]) -> str:
    base = model["manifest"]["base_iri"]
    scheme = f"{base}{context_id}/topic/PropertyPackTopicScheme"
    blocks = [predicate_block(f"<{scheme}>", [
        ("a", "skos:ConceptScheme"),
        ("skos:prefLabel", ttl_literal(f"{model['contexts'][context_id]['label']} Property Pack topics", "en")),
        ("skos:definition", ttl_literal("Candidate subjects used to classify consolidated Property Pack source questions.", "en")),
        ("opdac:semanticHome", f"<{base}context/{context_id}>"),
    ])]
    for entry in entries:
        blocks.append(predicate_block(f"<{entry['topic_iri']}>", [
            ("a", "skos:Concept"),
            ("skos:inScheme", f"<{scheme}>"),
            ("skos:prefLabel", ttl_literal(entry["preferred_label"], "en")),
            ("skos:definition", ttl_literal(entry["candidate_definition"], "en")),
            ("skos:notation", ttl_literal(entry["item_id"])),
            ("dcterms:source", f"<urn:opda:property-pack:item:{entry['item_id']}>")
        ]))
    return ttl_header(model) + "\n\n".join(blocks) + "\n"


def shapes_turtle(model: dict[str, Any], context_id: str) -> str:
    base = model["manifest"]["base_iri"]
    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for term in model["terms"].values():
        if term["home"] == context_id and term["kind"] != "class" and term.get("domain"):
            by_domain[term["domain"]].append(term)
    blocks: list[str] = []
    for domain, properties in sorted(by_domain.items()):
        domain_key = domain.split(":", 1)[1]
        shape_iri = f"<{base}shape/{context_id}/{domain_key}>"
        pairs: list[tuple[str, str]] = [
            ("a", "sh:NodeShape"),
            ("sh:targetClass", f"<{full_iri(model, domain)}>")
        ]
        for term in sorted(properties, key=lambda entry: entry["id"]):
            constraints = [f"sh:path <{full_iri(model, term['key'])}>"]
            if term.get("datatype"):
                constraints.append(f"sh:datatype <{full_iri(model, term['datatype'])}>")
            elif term.get("range"):
                constraints.append(f"sh:class <{full_iri(model, term['range'])}>")
            if "min_count" in term:
                constraints.append(f"sh:minCount {term['min_count']}")
            if "max_count" in term:
                constraints.append(f"sh:maxCount {term['max_count']}")
            if term.get("pattern"):
                constraints.append(f"sh:pattern {ttl_literal(term['pattern'])}")
            pairs.append(("sh:property", "[ " + " ; ".join(constraints) + " ]"))
        blocks.append(predicate_block(shape_iri, pairs))
    return ttl_header(model, shapes=True) + "\n\n".join(blocks) + "\n"


def fixture_turtle(model: dict[str, Any], valid: bool) -> str:
    header = ttl_header(model)
    if valid:
        body = """<urn:example:property> a common:Property ;
  common:uprn "100023336956" ;
  pds:hasAddress <urn:example:address> .

<urn:example:address> a pds:Address ;
  pds:addressLine1 "1 Example Street" ;
  pds:postcode "AB1 2CD" .
"""
    else:
        body = """<urn:example:property> a common:Property ;
  common:uprn "NOT-A-UPRN" ;
  pds:hasAddress <urn:example:address> .

<urn:example:address> a pds:Address ;
  pds:addressLine1 "1 Example Street" .
"""
    return header + body


def query_files(model: dict[str, Any]) -> dict[str, str]:
    prefixes = "\n".join([
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        f"PREFIX common: <{model['manifest']['base_iri']}common/>",
        f"PREFIX pds: <{model['manifest']['base_iri']}property-data-services/>",
        f"PREFIX conv: <{model['manifest']['base_iri']}conveyancing/>",
    ])
    return {
        "property-identity.rq": prefixes + "\nASK { common:Property a owl:Class . common:uprn rdfs:domain common:Property ; rdfs:range xsd:string . }\n",
        "address-separation.rq": prefixes + "\nASK { pds:Address a owl:Class . pds:hasAddress rdfs:domain common:Property ; rdfs:range pds:Address . }\n",
        "fixture-consolidation.rq": prefixes + "\nASK { conv:FixtureItem a owl:Class . conv:hasFixtureItem rdfs:range conv:FixtureItem . conv:inclusionStatus rdfs:domain conv:FixtureItem . }\n",
        "no-same-as.rq": prefixes + "\nASK { ?subject owl:sameAs ?object }\n",
    }


def semantic_projections(model: dict[str, Any], classification: dict[str, Any]) -> dict[str, str]:
    base = model["manifest"]["base_iri"]
    coverage = sorted(classification["coverage"], key=lambda entry: entry["item_id"])
    glossary: list[dict[str, Any]] = []
    for key, term in sorted(model["terms"].items()):
        glossary.append({
            "iri": full_iri(model, key), "key": key, "kind": term["kind"], "semantic_home": term["home"],
            "label": term["label"], "definition": term["definition"], "identity_criterion": term.get("identity", ""),
            "domain": full_iri(model, term["domain"]) if term.get("domain") else "",
            "range": full_iri(model, term.get("range") or term.get("datatype")) if term.get("range") or term.get("datatype") else "",
            "subclass_of": full_iri(model, term["subclass_of"]) if term.get("subclass_of") else "",
            "constraints": {
                "datatype": full_iri(model, term["datatype"]) if term.get("datatype") else "",
                "min_count": term.get("min_count"), "max_count": term.get("max_count"),
                "pattern": term.get("pattern", ""),
            },
            "source_item_ids": classification["term_traces"][key],
            "direct_source_item_ids": classification["term_direct_traces"][key],
            "structural_source_item_ids": classification["term_structural_traces"][key],
            "candidate_status": model["manifest"]["status"],
        })
    dictionary = [{
        "item_id": entry["item_id"], "source_path": entry["source_path"], "label": entry["preferred_label"],
        "definition": entry["candidate_definition"], "semantic_home": entry["semantic_home"],
        "construct_refs": entry["construct_refs"], "topic_iri": entry["topic_iri"],
        "datatype": entry["source_constraints"]["datatype"], "requiredness": entry["source_constraints"]["requiredness"],
        "cardinality": {"min": entry["source_constraints"]["min_count"], "max": entry["source_constraints"]["max_count"], "scope": entry["source_constraints"]["occurrence_scope"]},
        "conditional": entry["source_constraints"]["requiredness"] == "conditional",
        "repeatable_context": entry["source_constraints"]["repeatable_context"],
        "permitted_values": entry["source_constraints"]["permitted_values"],
        "vocabulary_ref": entry["vocabulary_ref"], "candidate_status": entry["candidate_status"],
    } for entry in coverage]
    context_counts = Counter(entry["semantic_home"] for entry in coverage)
    context_map = {
        "common_boundary": "common",
        "rule": "Each OPDA resource has one semantic home; common is exceptional and does not control internal domain meaning.",
        "contexts": [{**context, "source_item_count": context_counts[context["id"]]} for context in sorted(model["contexts"].values(), key=lambda item: item["id"])],
        "connections": [{"from": context_id, "to": "common", "kind": "interoperates-through"} for context_id in sorted(model["contexts"]) if context_id != "common"],
        "cross_domain_mappings": [],
        "mapping_status": "awaiting working-group evidence",
    }
    vocabulary_projection = [{
        "iri": full_iri(model, vocabulary["key"], vocabulary=True), "key": key,
        "semantic_home": vocabulary["home"], "label": vocabulary["label"], "definition": vocabulary["definition"],
        "concepts": vocabulary["concepts"], "source_item_ids": classification["vocabulary_traces"][key],
        "candidate_status": model["manifest"]["status"],
    } for key, vocabulary in sorted(model["vocabularies"].items())]
    shape_projection: list[dict[str, Any]] = []
    for context_id in sorted(model["contexts"]):
        by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for key, term in sorted(model["terms"].items()):
            if term["home"] == context_id and term["kind"] != "class" and term.get("domain"):
                by_domain[term["domain"]].append({
                    "path_iri": full_iri(model, key), "path_key": key, "label": term["label"],
                    "kind": term["kind"],
                    "datatype": full_iri(model, term["datatype"]) if term.get("datatype") else "",
                    "class": full_iri(model, term["range"]) if term.get("range") else "",
                    "min_count": term.get("min_count"), "max_count": term.get("max_count"),
                    "pattern": term.get("pattern", ""),
                })
        for domain, properties in sorted(by_domain.items()):
            target_key = canonical_term_key(model, domain)
            shape_projection.append({
                "iri": f"{base}shape/{context_id}/{domain.split(':', 1)[1]}",
                "semantic_home": context_id, "target_class": full_iri(model, domain),
                "target_key": target_key,
                "target_label": model["terms"][target_key]["label"],
                "properties": properties, "candidate_status": model["manifest"]["status"],
            })
    standards = {
        "target": model["manifest"]["standards"],
        "claims": {
            "rdf": "RDF 1.2 Basic authoring profile with explicit VERSION labels",
            "sparql": "SPARQL 1.2 target; competency queries use the portable basic graph-pattern subset",
            "shacl": "SHACL 1.2 Core target; emitted constraints use the implementation-tested Core subset",
            "full_union_profile": "not claimed until a qualified implementation passes the required feature matrix",
        },
        "candidate_status": model["manifest"]["status"],
    }
    return {
        "projections/coverage.json": compact_array(coverage),
        "projections/data-dictionary.json": compact_array(dictionary),
        "projections/business-glossary.json": compact_array(glossary),
        "projections/resource-register.json": compact_array(glossary),
        "projections/controlled-vocabularies.json": compact_array(vocabulary_projection),
        "projections/shapes.json": compact_array(shape_projection),
        "projections/context-map.json": canonical_json(context_map),
        "standards-profile.json": canonical_json(standards),
        "candidate-summary.json": canonical_json({
            "candidate_id": model["manifest"]["candidate_id"], "status": model["manifest"]["status"],
            "source_item_count": len(coverage), "ontology_resource_count": len(glossary),
            "controlled_vocabulary_count": len(vocabulary_projection), "semantic_home_counts": dict(sorted(context_counts.items())),
            "coverage_digest": sha256(compact_array(coverage)), "base_iri": base,
        }),
    }


def build_static_outputs(model: dict[str, Any], classification: dict[str, Any]) -> dict[str, str]:
    outputs = semantic_projections(model, classification)
    outputs["ontology/context-map.ttl"] = context_map_turtle(model)
    for context_id in sorted(model["contexts"]):
        terms = [(key, term) for key, term in sorted(model["terms"].items()) if term["home"] == context_id]
        chunks = [terms[index:index + 32] for index in range(0, len(terms), 32)]
        for index, chunk in enumerate(chunks, start=1):
            suffix = f"-{index:02d}" if len(chunks) > 1 else ""
            outputs[f"ontology/{context_id}{suffix}.ttl"] = term_turtle(
                model, context_id, classification["term_traces"], chunk, index, len(chunks),
            )
        outputs[f"shapes/{context_id}.ttl"] = shapes_turtle(model, context_id)
    by_home: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for vocabulary in model["vocabularies"].values():
        by_home[vocabulary["home"]].append(vocabulary)
    for context_id, vocabularies in sorted(by_home.items()):
        outputs[f"vocabularies/{context_id}-controlled.ttl"] = vocabulary_turtle(model, context_id, vocabularies)
    topics: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for entry in classification["coverage"]:
        if entry["topic_iri"]:
            topics[entry["semantic_home"]].append(entry)
    chunk_size = 55
    for context_id, entries in sorted(topics.items()):
        entries.sort(key=lambda entry: entry["item_id"])
        for index in range(0, len(entries), chunk_size):
            chunk = entries[index:index + chunk_size]
            part = index // chunk_size + 1
            outputs[f"vocabularies/topics/{context_id}-{part:02d}.ttl"] = topic_turtle(model, context_id, chunk)
    outputs["validation/fixtures/valid-property.ttl"] = fixture_turtle(model, True)
    outputs["validation/fixtures/invalid-property.ttl"] = fixture_turtle(model, False)
    for name, query in query_files(model).items():
        outputs[f"validation/competency/{name}"] = query
    return dict(sorted(outputs.items()))
