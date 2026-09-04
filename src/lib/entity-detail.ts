/**
 * Build-time entity-page projection over the committed ontology model.
 *
 * The model is generated from Fuseki by `scripts/ontology-model.mjs` when the
 * ontology changes. Ordinary Astro builds consume that deterministic snapshot
 * directly; they do not start a triplestore or make localhost HTTP requests.
 */
import { model, type ClassEntry, type Constraint } from './ontology-model.ts';

export interface EntityAttribute {
  localName: string;
  label: string;
  type: string;
  cardinality: string;
  required: boolean;
  description: string;
}

export interface EntityRelationship {
  predicate: string;
  target: string;
  cardinality: string;
  inverse: string | null;
  description: string;
}

export interface EntityConstraint {
  message: string;
  severity: 'Violation' | 'Warning' | 'Info';
  shape: string;
}

export interface CrossTierUrls {
  concept: string | null;
  logical: string | null;
  physicalDatabase: string | null;
  physicalOntology: string | null;
}

export interface EntityDetail {
  uri: string;
  localName: string;
  label: string;
  module: string;
  tier: string;
  summary: string;
  scopeNote: string;
  dctSource: string[];
  attributes: EntityAttribute[];
  relationships: EntityRelationship[];
  constraints: EntityConstraint[];
  crossTier: CrossTierUrls;
}

const XSD = 'http://www.w3.org/2001/XMLSchema#';
const PUBLISHED_RELATIONSHIP_TARGETS = new Map([
  ['concerns', 'LegalEstate'],
  ['founds', 'RoleMixin'],
  ['hasParticipant', 'Buyer'],
  ['playedBy', 'Organisation'],
  ['plays', 'RoleMixin'],
]);

const compareText = (left: unknown, right: unknown): number => {
  const a = String(left ?? '');
  const b = String(right ?? '');
  return a === b ? 0 : a < b ? -1 : 1;
};

const canonicalClassNames = new Map(
  Object.values(model.classes).map((entry) => [entry.localName.toLowerCase(), entry.localName]),
);

function pascalToKebab(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1-$2')
    .replace(/([a-z\d])([A-Z])/gu, '$1-$2')
    .toLowerCase();
}

function crossTierLinks(entry: ClassEntry): CrossTierUrls {
  if (!entry.module) {
    return { concept: null, logical: null, physicalDatabase: null, physicalOntology: null };
  }
  const slug = pascalToKebab(entry.localName);
  const base = '/development/inputs/pdtf-schema/schema-derived-ontology/model-views-by-audience';
  return {
    concept: `${base}/concept/${entry.module}/${slug}`,
    logical: `${base}/logical/${entry.module}/${slug}`,
    physicalDatabase: null,
    physicalOntology: `${base}/physical-ontology/${entry.module}/classes#opda${entry.localName.toLowerCase()}`,
  };
}

function classConstraints(entry: ClassEntry): Array<Constraint & { shapeName: string }> {
  return entry.shapes.flatMap((reference) => {
    const shape = model.shapes[reference.id];
    if (!shape) return [];
    return shape.constraints.map((constraint) => ({
      ...constraint,
      shapeName: shape.localName,
    }));
  }).sort((left, right) =>
    compareText(left.pathLocal, right.pathLocal)
      || compareText(left.shapeName, right.shapeName)
      || compareText(left.minCount, right.minCount)
      || compareText(left.maxCount, right.maxCount));
}

function cardinality(constraint: Constraint | undefined, requireBoth = false): string {
  if (!constraint || (requireBoth && (constraint.minCount == null || constraint.maxCount == null))) {
    return '0..*';
  }
  const minimum = constraint.minCount ?? '0';
  const maximum = constraint.maxCount ?? '*';
  return `${minimum}..${maximum}`;
}

function datatype(attributeId: string, fallback: string | null): string {
  const property = model.datatypeProperties[attributeId];
  const range = property?.objects[0];
  if (range?.id.startsWith(XSD)) return `xsd:${range.localName}`;
  return range?.localName ?? (fallback ? `xsd:${fallback}` : 'xsd:string');
}

function relationshipTarget(predicate: string, targets: ClassEntry['outgoing'][number]['targets']): string {
  const preferred = PUBLISHED_RELATIONSHIP_TARGETS.get(predicate);
  return targets.find((target) => target.localName === preferred)?.localName
    ?? [...targets].sort((left, right) => compareText(left.id, right.id))[0]?.localName
    ?? '';
}

function severity(value: string | null): EntityConstraint['severity'] {
  return value === 'Warning' || value === 'Info' ? value : 'Violation';
}

/** Return the class detail used by concept and logical manual pages. */
export function getEntityDetail(tier: string, module: string, localName: string): EntityDetail | null {
  const canonical = canonicalClassNames.get(localName.toLowerCase());
  const entry = canonical ? model.classes[canonical] : undefined;
  if (!entry || entry.module !== module.toLowerCase()) return null;

  const constraints = classConstraints(entry);
  const attributes = entry.attributes.map((attribute) => {
    const constraint = constraints.find((candidate) => candidate.pathLocal === attribute.localName);
    return {
      localName: attribute.localName,
      label: attribute.label,
      type: datatype(attribute.id, attribute.type),
      cardinality: cardinality(constraint),
      required: constraint?.minCount != null && Number(constraint.minCount) >= 1,
      description: attribute.description,
    };
  }).sort((left, right) => compareText(left.localName, right.localName));

  const relationships = entry.outgoing.map((relationship) => {
    const constraint = constraints.find((candidate) => candidate.pathLocal === relationship.predicateLocal);
    return {
      predicate: relationship.predicateLocal,
      target: relationshipTarget(relationship.predicateLocal, relationship.targets),
      cardinality: cardinality(constraint, true),
      inverse: relationship.inverse?.replace(/^.*[/#]/u, '') ?? null,
      description: relationship.description,
    };
  }).sort((left, right) => compareText(left.predicate, right.predicate));

  const seenMessages = new Set<string>();
  const entityConstraints = constraints.flatMap((constraint) => {
    if (!constraint.message || seenMessages.has(constraint.message)) return [];
    seenMessages.add(constraint.message);
    return [{
      message: constraint.message,
      severity: severity(constraint.severity),
      shape: constraint.shapeName,
    }];
  }).sort((left, right) => compareText(left.shape, right.shape) || compareText(left.message, right.message));

  return {
    uri: entry.uri,
    localName: entry.localName,
    label: entry.label,
    module: entry.module ?? '',
    tier,
    summary: entry.comment,
    scopeNote: entry.scopeNote,
    dctSource: [...entry.dctSource].sort(compareText),
    attributes,
    relationships,
    constraints: entityConstraints,
    crossTier: crossTierLinks(entry),
  };
}
