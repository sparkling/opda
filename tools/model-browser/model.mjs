/** Faithful, read-only projections of two separate committed model corpora. */
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './upstream.mjs';
import * as pack from '../../src/lib/property-pack-model.mjs';
import {projectCandidateResources, projectSchemaResources} from '../../src/lib/ontology-browser/projection.mjs';
import {pdtfResourcePath} from '../../src/lib/pdtf-resource-routes.mjs';

export const BASE = '/model-browser';
export const href = (route='') => BASE + (route ? '/'+route.replace(/^\//,'') : '');
export const schema = JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/ontology-model.json'),'utf8'));
export const corpusRoot = corpus => corpus === 'schema' ? 'schema' : '';
export const corpusHref = (corpus,route='') => href([corpusRoot(corpus),route].filter(Boolean).join('/'));
const sectionFor = kind => kind === 'class' ? 'concepts' : kind.includes('property') ? 'properties' : kind.includes('shape') ? 'shapes' : 'vocabularies';
const slug = value => encodeURIComponent(value);
export const resourcePath = (corpus,entry) => [corpusRoot(corpus),sectionFor(entry.kind),slug(entry.context || 'unassigned'),entry.id.slice(entry.id.lastIndexOf(':')+1).split('/').map(slug).join('/')].filter(Boolean).join('/');
const group = (label, refs) => ({label,refs});
const ref = entry => ({id:entry.id,label:entry.title,url:entry.url});
const schemeEntries = pack.vocabularies.map(scheme => ({
  id:scheme.key,title:scheme.label,iri:scheme.iri,summary:scheme.definition,kind:'concept-scheme',kindLabel:'Concept scheme',
  context:scheme.semantic_home,contextLabel:pack.contextById.get(scheme.semantic_home)?.label,groups:[],facts:[],
  statusLabel:'Machine-proposed · non-normative',sourceIds:scheme.source_item_ids,raw:scheme,
}));
const values = pack.vocabularies.flatMap(scheme => scheme.concepts.map(value => ({
  id:scheme.key+'/'+value.id,title:value.label,iri:scheme.iri+'/concept/'+value.id,summary:`Controlled value in ${scheme.label}.`,
  kind:'concept',kindLabel:'Controlled value',context:scheme.semantic_home,contextLabel:pack.contextById.get(scheme.semantic_home)?.label,
  groups:[],facts:[{label:'Notation',value:value.notation}],statusLabel:'Machine-proposed · non-normative',raw:value,scheme:scheme.key,
})));
const topicRows=pack.coverage.filter(item=>item.topic_iri);
for (const home of [...new Set(topicRows.map(item=>item.semantic_home))]) {
  const key=home+':PropertyPackTopicScheme';
  schemeEntries.push({id:key,title:pack.contextById.get(home).label+' Property Pack topics',iri:pack.candidateManifest.base_iri+home+'/topic/PropertyPackTopicScheme',summary:'Candidate subjects used to classify consolidated Property Pack source questions.',kind:'concept-scheme',kindLabel:'Concept scheme',context:home,contextLabel:pack.contextById.get(home).label,groups:[],facts:[],statusLabel:'Machine-proposed · non-normative',sourceIds:[],raw:{semantic_home:home}});
  values.push(...topicRows.filter(item=>item.semantic_home===home).map(item=>({id:home+':topic/'+item.item_id,title:item.preferred_label,iri:item.topic_iri,summary:item.candidate_definition,kind:'concept',kindLabel:'Source-topic concept',context:home,contextLabel:pack.contextById.get(home).label,groups:[],facts:[{label:'Notation',value:item.item_id}],statusLabel:'Machine-proposed · non-normative',sourceIds:[item.item_id],raw:item,scheme:key})));
}
const shapeEntries = pack.shapes.map(shape => ({
  id:shape.semantic_home+':shape/'+shape.target_key.split(':').pop(),title:shape.target_label+' shape',iri:shape.iri,summary:`Validation constraints targeting ${shape.target_key}.`,
  kind:'node-shape',kindLabel:'Node shape',context:shape.semantic_home,contextLabel:pack.contextById.get(shape.semantic_home)?.label,
  groups:[],facts:[],statusLabel:'Machine-proposed · non-normative',constraints:shape.properties,raw:shape,target:shape.target_class,
}));
const candidate = projectCandidateResources(pack.resources,pack.contexts,pack.resourceRoute).map(entry => ({
  ...entry,sourceIds:pack.resourceByKey.get(entry.id).source_item_ids,raw:pack.resourceByKey.get(entry.id),
  directSourceIds:pack.resourceByKey.get(entry.id).direct_source_item_ids,
  structuralSourceIds:pack.resourceByKey.get(entry.id).structural_source_item_ids,
}));
export const corpora = {
  pack:{id:'pack',title:'Property Pack candidate',description:'A connected view of the proposed model, its semantic homes, constraints and source evidence.',entries:[...candidate,...schemeEntries,...values,...shapeEntries],contexts:pack.contexts},
  schema:{id:'schema',title:'PDTF schema-derived ontology',description:'A separate draft extraction from the existing PDTF schema. Explore it as an input to modelling, with its own identities and provenance.',entries:projectSchemaResources(schema,pdtfResourcePath).map(entry=>({...entry,raw:Object.values(schema).filter(x=>x&&typeof x==='object').map(x=>x[entry.id]).find(Boolean)})),contexts:[]},
};
for (const corpus of Object.values(corpora)) {
  const oldUrls = new Map(corpus.entries.map(entry => [entry.url,entry]));
  for (const entry of corpus.entries) {
    entry.path = resourcePath(corpus.id,entry);
    entry.referenceUrl = entry.url;
    entry.url = href(entry.path);
    entry.contextUrl = corpusHref(corpus.id,'boundary/'+slug(entry.context || 'unassigned'));
    entry.identifier = entry.id; entry.aliases = [entry.iri]; entry.type='ontology'; entry.collection=corpus.id;
  }
  const byId = new Map(corpus.entries.map(entry => [entry.id,entry]));
  const byIri = new Map(corpus.entries.map(entry => [entry.iri,entry]));
  if(corpus.id==='schema')for(const entry of corpus.entries){
    entry.constraints=(entry.raw?.constraints||[]).map(c=>({label:c.pathLocal,path_iri:c.path,datatype:c.datatype||'',class:c.class||'',min_count:c.minCount,max_count:c.maxCount,pattern:c.pattern||'',severity:c.severity||'',message:c.message||''}));
    if(entry.raw?.targetSubjectsOf){const target=byIri.get(entry.raw.targetSubjectsOf);entry.groups.push(group('Target subjects of',target?[ref(target)]:[{label:entry.raw.targetSubjectsOf}]));}
  }
  for (const entry of corpus.entries) for (const section of entry.groups) for (const link of section.refs) {
    const target = byId.get(link.id) || oldUrls.get(link.url);
    if (target) link.url=target.url;
  }
  if (corpus.id === 'pack') for (const entry of corpus.entries) {
    if (entry.kind === 'concept-scheme') entry.groups.push(group('Member concepts',values.filter(value=>value.scheme===entry.id).map(ref)));
    if (entry.scheme) entry.groups.push(group('In scheme',[ref(byId.get(entry.scheme))]));
    if (entry.target) entry.groups.push(group('Target class',[ref(byIri.get(entry.target))]));
    if (entry.kind === 'class') {
      const matching = shapeEntries.filter(shape=>shape.target===entry.iri);
      if (matching.length) entry.groups.push(group('Validation shapes',matching.map(ref)));
    }
  }
  corpus.byId=byId; corpus.byIri=byIri;
  if (corpus.id === 'schema') corpus.contexts=[...new Set(corpus.entries.map(entry=>entry.context))].sort().map(id=>({id,label:corpus.entries.find(e=>e.context===id).contextLabel,definition:'Module recorded in the schema-derived ontology.'}));
}
export const sourceItems = pack.dictionary;
export const coverage = pack.coverage;
export const lifecycle = pack.propertyPackLifecycleStatus;
export const validation = pack.validationReport;
export const mappingStatus = pack.contextMap.mapping_status;
export const connections = pack.contextMap.connections;
export const workPackages = pack.workPackages;
export const manifest = pack.candidateManifest;
export function entriesFor(corpus,section) {
  return corpora[corpus].entries.filter(entry => section==='search' || sectionFor(entry.kind)===section);
}
export function sourceHref(id) { return href('sources/'+slug(id)); }
export function routes() {
  const rows=[];
  for (const corpus of Object.values(corpora)) {
    const prefix=corpusRoot(corpus.id);
    const route = (part,props) => rows.push({params:{path:[prefix,part].filter(Boolean).join('/') || undefined},props:{corpus:corpus.id,...props}});
    route('',{view:'overview'});
    for (const section of ['concepts','properties','shapes','vocabularies','search']) route(section,{view:'listing',section});
    for (const section of ['subjects','modules','boundaries']) route(section,{view:'contexts',section});
    for (const context of corpus.contexts) route('boundary/'+slug(context.id || 'unassigned'),{view:'context',context});
    for (const entry of corpus.entries) rows.push({params:{path:entry.path},props:{view:'detail',corpus:corpus.id,id:entry.id}});
    route('namespaces',{view:'namespaces'});
  }
  for (const section of ['sources','governance','validation','mappings','downloads']) rows.push({params:{path:section},props:{view:section,corpus:'pack'}});
  for (const item of sourceItems) rows.push({params:{path:'sources/'+slug(item.item_id)},props:{view:'source',corpus:'pack',id:item.item_id}});
  return rows;
}
