/** One task hierarchy for the Property Pack sidebar and local wayfinding. */
import type { Item } from './site.ts';
import { contexts, contextRoute, workPackageRoute, workPackages } from './property-pack-model.mjs';
const base = '/development/property-pack';
export const PROPERTY_PACK_JOURNEY: Item = {
  url: base, title: 'Property Pack ontology', children: [
    { url: `${base}/definition-and-scope`, title: 'Understand the pack', children: [
      { url: `${base}/worked-example`, title: 'Follow an energy-certificate example' },
      { url: `${base}/data-dictionary`, title: 'Find a source data point' },
      { url: `${base}/pdtf-schema-lineage`, title: 'How it relates to PDTF and SPDTF' },
    ] },
    { url: `${base}/work-packages`, title: 'Review by topic', children: workPackages.map(({ id, label }) => ({
      url: workPackageRoute(id), title: label.replace(/\b\w/gu, (letter) => letter.toUpperCase()),
    })) },
    { url: `${base}/model`, title: 'Explore the candidate model', children: [
      { url: `${base}/contexts`, title: 'Contextual boundaries', children: contexts.map((context) => ({
        url: contextRoute(context), title: context.id === 'dbt-smart-data' ? 'DBT Smart Data candidate context' : context.label,
      })) },
      { url: `${base}/resources`, title: 'Browse terms and relationships' },
      { url: `${base}/relationships`, title: 'Relationship reference' },
      { url: `${base}/vocabularies`, title: 'Allowed values and topics' },
      { url: `${base}/shapes`, title: 'Data rules (SHACL shapes)' },
    ] },
    { url: `${base}/coverage`, title: 'Check evidence and decisions', children: [
      { url: `${base}/technical-working-group-determination`, title: 'Review status and next decision' },
      { url: `${base}/validation`, title: 'Technical validation evidence' },
      { url: `${base}/standards`, title: 'Standards and tested support' },
      { url: `${base}/artefacts`, title: 'Download candidate files' },
      { url: `${base}/review-and-releases`, title: 'Later review and releases' },
    ] },
  ],
};
