/** Read-only browser projections. Corpus boundaries and existing route owners stay intact. */
import { KINDS, labelFor } from '../site-search-model.mjs';

function record({ id, title, url, iri, summary = '', kind, context = '', ...rest }) {
  return { id, title, url, iri, summary, kind, context, identifier:id, aliases:[iri], type:'ontology',
    kindLabel:labelFor(KINDS,kind,'singular') || kind, groups:[], facts:[], ...rest };
}
const group = (label, refs) => ({label, refs:refs.filter(Boolean)});

export function projectCandidateResources(resources, contexts, resourceRoute, contextRoute = () => null) {
  const byIri = new Map(resources.map(item => [item.iri,item]));
  const contextLabels = new Map(contexts.map(item => [item.id,item.label]));
  const reference = iri => {
    const resource = byIri.get(iri);
    return resource ? {id:resource.key,label:resource.label,url:resourceRoute(resource)} : iri ? {label:iri} : null;
  };
  return resources.map(item => record({
    id:item.key, title:item.label, url:resourceRoute(item), iri:item.iri, summary:item.definition,
    kind:item.kind, context:item.semantic_home, contextLabel:contextLabels.get(item.semantic_home) || item.semantic_home,
    contextUrl:contextRoute({id:item.semantic_home}),
    collection:'property-pack', status:item.candidate_status, statusLabel:'Machine-proposed · non-normative',
    isRootClass:item.kind === 'class' && !item.subclass_of,
    evidence:`${item.direct_source_item_ids.length} direct · ${item.structural_source_item_ids.length} structural source traces`,
    facts:item.identity_criterion ? [{label:'Identity criterion',value:item.identity_criterion}] : [],
    groups:[
      group('Superclass',[reference(item.subclass_of)]),
      group('Subclasses',resources.filter(other => other.subclass_of === item.iri).map(other => reference(other.iri))),
      group('Domain',[reference(item.domain)]), group('Range',[reference(item.range)]),
      group('Properties with this domain',resources.filter(other => other.domain === item.iri).map(other => reference(other.iri))),
      group('Properties with this range',resources.filter(other => other.range === item.iri).map(other => reference(other.iri))),
    ].filter(entry => entry.refs.length),
  }));
}

export function projectSchemaResources(model, resourceRoute, contextRoute = () => null) {
  const kinds = {classes:'class',objectProperties:'object-property',datatypeProperties:'datatype-property',shapes:'node-shape',concepts:'concept',schemes:'concept-scheme'};
  const source = Object.entries(kinds).flatMap(([key,kind]) => Object.values(model[key]).map(item => ({...item,kind})));
  const byId = new Map(source.map(item => [item.id,item]));
  const reference = value => {
    if (!value) return null;
    const raw = typeof value === 'string' ? value : value.id;
    const id = raw?.startsWith(model.namespace) ? raw.slice(model.namespace.length) : raw;
    const target = byId.get(id);
    if (target) return {id,label:target.label || target.prefLabel || target.localName,url:resourceRoute(id)};
    return {label:typeof value === 'string' ? value : value.localName || raw,
      ...(/^https?:\/\//u.test(raw || '') ? {url:raw} : {})};
  };
  return source.map(item => record({
    id:item.id,title:item.label || item.prefLabel || item.localName,url:resourceRoute(item.id),iri:item.uri || model.namespace+item.id,
    summary:item.definition || item.comment || '',kind:item.kind,context:item.context || item.module || 'unassigned',
    contextLabel:item.context || item.module || 'No module recorded',
    contextUrl:contextRoute(item.context || item.module),
    collection:'pdtf-derived',status:'schema-derived-draft',statusLabel:'Schema-derived draft',
    isRootClass:item.kind === 'class' && !(item.superClasses || []).some(parent => byId.has(parent.id)),
    evidence:item.dctSource?.length ? `${item.dctSource.length} recorded source references` : '',
    facts:[item.ufoCategory && {label:'UFO-informed category',value:item.ufoCategory},item.scopeNote && {label:'Scope note',value:item.scopeNote}].filter(Boolean),
    groups:[
      group('Superclasses',(item.superClasses || []).map(reference)),
      group('Subclasses',source.filter(other => other.superClasses?.some(parent => parent.id === item.id)).map(reference)),
      group('Datatype attributes',(item.attributes || []).map(reference)),
      group('Outgoing properties',(item.outgoing || []).map(edge => reference(edge.predicate))),
      group('Incoming properties',(item.incoming || []).map(edge => reference(edge.predicate))),
      group('Domain',(item.subjects || []).map(reference)), group('Range',(item.objects || []).map(reference)),
      group('Inverse property',[reference(item.inverse)]), group('Target class',[reference(item.target)]),
      group('SHACL shapes',(item.shapes || []).map(reference)),
      group('Controlled vocabularies',(item.usesSchemes || item.schemes || []).map(reference)),
      group('Broader concepts',(item.broader || []).map(reference)), group('Narrower concepts',(item.narrower || []).map(reference)),
      group('Member concepts',(item.concepts || []).map(reference)),
      group('Constrained properties',(item.constraints || []).map(constraint => reference(constraint.path))),
    ].filter(entry => entry.refs.length),
  }));
}
