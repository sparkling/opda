# Domain Model Schemas

Machine-readable schema definitions for the ontology website information model (13 domain entities from [ADR-0002](../../adr/ADR-0002-ontology-website-information-model.md)).

These schemas describe the **domain model** (ontology metadata), not instance data. They define the structure for exchanging information about concepts, properties, enumerations, and related entities.

Decided in [ADR-0005](../../adr/ADR-0005-domain-model-schemas.md). Logical model specification in [information-model-logical.md](../../ontology/information-model-logical.md).

## Namespace

`https://hm.com/ns/ia/`

## File Index

### XSD (XML Schema)

| File | Description |
|------|-------------|
| `xsd/domain-model.xsd` | All 13 entity types, 6 enumerations, collection wrappers, and a composite root element |

### JSON Schema (2020-12)

| File | Entity | Required Fields |
|------|--------|----------------|
| `json-schema/concept.schema.json` | Concept | name, context, uri, subjectArea |
| `json-schema/property.schema.json` | Property | name, technicalName, usedBy |
| `json-schema/enumeration.schema.json` | Enumeration | name, values |
| `json-schema/enumeration-value.schema.json` | EnumerationValue | label |
| `json-schema/subject-area.schema.json` | SubjectArea | name |
| `json-schema/classification-facet.schema.json` | ClassificationFacet | name, facetType |
| `json-schema/cross-domain-mapping.schema.json` | CrossDomainMapping | matchType, source, target |
| `json-schema/status-badge.schema.json` | StatusBadge | badgeType |
| `json-schema/property-group.schema.json` | PropertyGroup | name, order |
| `json-schema/suggestion-generator.schema.json` | SuggestionGenerator | name, category, sparqlUpdate |
| `json-schema/action-description.schema.json` | ActionDescription | name, actionGroup |
| `json-schema/rule.schema.json` | Rule | name, ruleType, derivedProperty |
| `json-schema/instance-example.schema.json` | InstanceExample | label, sourceTable |
| `json-schema/domain-model.schema.json` | Root (all entities) | (none -- all collections optional) |

## Constrained Value Sets

| Enum | Values | Used By |
|------|--------|---------|
| ContextType | `SDS`, `PF`, `Common` | Concept.context |
| MatchType | `exact`, `close`, `broad` | CrossDomainMapping.matchType |
| BadgeType | `Deprecated`, `Uncertain`, `New`, `ToDefine` | StatusBadge.badgeType |
| FacetType | `SubjectArea`, `DataClassification`, `Lifecycle`, `Governance`, `Volatility`, `RegulatoryRelevance`, `ValueChainPosition` | ClassificationFacet.facetType |
| SeverityType | `Violation`, `Warning` | Property.severity |
| RuleType | `TripleRule`, `SPARQLRule` | Rule.ruleType |

## Relationships

All inter-entity relationships are modelled as URI string references, not inline objects. A concept's `parent` field contains a URI string pointing to another concept. Consumers resolve references by looking up the target URI in the same dataset.

## Usage

### Validate JSON with ajv

```bash
npx ajv validate -s json-schema/concept.schema.json -d my-concept.json
```

### Validate XML with xmllint

```bash
xmllint --schema xsd/domain-model.xsd my-data.xml --noout
```

### Generate TypeScript types

```bash
npx json-schema-to-typescript json-schema/concept.schema.json -o concept.d.ts
```
