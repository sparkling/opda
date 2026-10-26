# Reading the Property Pack ontology and its data model

Authored OPDA learning reading, 26 October 2026, grounded in candidate property-pack-0.1 (0.1.0-draft) and the accepted first-principles modelling decisions. The structures described are a machine-proposed candidate for review.

## From questions to connected meaning

An ontology identifies types of things, their properties and the relationships between them. In this model, a class such as Property describes a kind of resource. An object property such as has address links one resource to another. A datatype property such as postcode links a resource to a literal value. A controlled concept identifies a permitted response or classification. These distinctions give information a meaning beyond its position in a JSON document.

In the current candidate, common:Property is a class for an identifiable unit of land, buildings or both. property-data-services:Address is a separate class for a structured and mutable address description. property-data-services:hasAddress links Property to Address. common:uprn attaches a string identifier to Property, while property-data-services:postcode attaches text to Address. The semantic home of a property is not automatically the home of its domain or range.

The candidate namespace is https://w3id.org/opda/candidate/property-pack/0.1/. These are candidate identifiers. A later accepted namespace policy for the governed model is not evidence that these candidate identifiers have migrated or that the candidate has been adopted.

## A worked consolidation

Source item pp-0067a00fc9eb asks whether water mains are subject to an adoption agreement. Its legacy path ends in waterMainsSubjectOfAdoptionAgreement.yesNo and its source evidence includes workbook row 1684. It is mapped to the property-data-services home and the water-drainage modelling rule.

The proposed representation uses UtilityServiceRecord, hasUtilityServiceRecord, utilityTopic, utilityOutcome, serviceProviderName, serviceCharge and supportingMap. The question is not turned into a unique boolean predicate whose name reproduces the entire source path. A topic concept identifies the particular source question and a controlled response expresses its outcome. The source permits Yes and No for this item and records conditional requiredness.

A neighbouring source item, pp-01613c1f9655, concerns an extract from the public sewer map. It has the same construct set but different source evidence and constraints. Shared structure does not mean the questions are interchangeable. The coverage record preserves the item identity, label, path, evidence, roles, disposition and rationale. Reviewers can test whether the consolidation preserves the distinctions that practitioners need.

## The semantic package

The glossary provides labels and definitions for business discussion. The data dictionary connects source items with definitions, constraints and their proposed model constructs. The ontology supplies classes, properties and relationships. SKOS vocabularies provide named controlled concepts and classifications. SHACL shapes express constraints over data. Coverage records join the 451 source items to the candidate constructs, and provenance records why those joins were made.

These are complementary views of the same modelling work. A reader can move from a familiar question to its source item, then to the resource or relationship, the relevant vocabulary and shape, and finally the evidence and validation. Separate projections should not be treated as independent competing models.

The candidate has 159 ontology resources and 14 controlled vocabularies for the 451 source items. Many-to-many item-to-construct relationships explain why these totals differ. Coverage proves that every scoped item has a disposition and reaches constructs; it does not prove that every proposed definition is correct.

## Rules and evidence

The Property shape requires one string UPRN with a digits-only pattern. The Address shape requires a postcode. A valid example and an intentionally invalid example test these mechanisms: the latter omits the postcode and uses NOT-A-UPRN. The recorded validator catches both failures.

SHACL evaluates specified constraints. It cannot establish that a supplied UPRN belongs to the property in the real world, that a survey is sound, that a statement is current or that a person is authorised to share it. Those require appropriate evidence, processes and decisions. The model retains these as distinct concerns rather than claiming that a parseable graph is trustworthy by definition.

An implementer should therefore trace a concrete source item through the model, inspect its identity and relationships, understand the shape and vocabulary, and examine the recorded limitations before designing an exchange. The current candidate is a useful object for that review, not an approved contract to deploy unchanged.
