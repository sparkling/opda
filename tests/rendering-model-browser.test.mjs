import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {corpora,routes,sourceItems,sourceHref,manifest} from '../tools/model-browser/model.mjs';
import {resources,coverage,vocabularies,shapes} from '../src/lib/property-pack-model.mjs';

test('standalone browser preserves the complete candidate and distinct schema identities',()=>{
  for(const item of resources){const entry=corpora.pack.byId.get(item.key);assert.equal(entry.iri,item.iri);assert.equal(entry.summary,item.definition);assert.deepEqual(entry.directSourceIds,item.direct_source_item_ids);assert.deepEqual(entry.structuralSourceIds,item.structural_source_item_ids);}
  for(const scheme of vocabularies)for(const value of scheme.concepts)assert.ok(corpora.pack.byIri.has(scheme.iri+'/concept/'+value.id));
  for(const item of coverage.filter(item=>item.topic_iri)){const entry=corpora.pack.byIri.get(item.topic_iri);assert.equal(entry.title,item.preferred_label);assert.equal(entry.summary,item.candidate_definition);}
  for(const shape of shapes)assert.ok(corpora.pack.byIri.has(shape.iri));
  assert.equal(sourceItems.length,451);
  assert.ok(corpora.schema.entries.every(entry=>entry.url.startsWith('/model-browser/schema/')));
  for(const entry of corpora.schema.entries)assert.equal(entry.constraints.length,(entry.raw?.constraints||[]).length,entry.id);
  assert.ok(corpora.pack.entries.every(entry=>!entry.url.startsWith('/model-browser/schema/')));
});

test('every resource relationship and source trace resolves inside its own standalone model',()=>{
  for(const model of Object.values(corpora))for(const entry of model.entries){
    assert.ok(model.contexts.some(context=>context.id===entry.context),entry.id);
    for(const section of entry.groups)for(const ref of section.refs){
      if(ref.id){const target=model.byId.get(ref.id);assert.ok(target,ref.id);assert.equal(ref.url,target.url);}
    }
    for(const id of entry.sourceIds||[])assert.ok(sourceItems.some(item=>item.item_id===id),id);
  }
  const paths=routes().map(route=>route.params.path||'');
  assert.equal(new Set(paths).size,paths.length,'Duplicate output route');
  const routeSet=new Set(paths.map(route=>'/model-browser'+(route?'/'+route:'')));
  for(const model of Object.values(corpora))for(const entry of model.entries)assert.ok(routeSet.has(entry.url),entry.url);
  for(const item of sourceItems)assert.ok(routeSet.has(sourceHref(item.item_id)));
});

test('pinned semantic-app source is exact and canonical ontology bytes are untouched',()=>{
  const pin=JSON.parse(fs.readFileSync('config/model-browser/upstream.json','utf8'));
  assert.equal(createHash('sha256').update(fs.readFileSync(pin.archive)).digest('hex'),pin.sha256);
  assert.match(pin.revision,/^[a-f0-9]{40}$/);
  for(const file of manifest.files){
    const body=fs.readFileSync(path.join('source/03-standards/ontology-candidates/property-pack/0.1',file.path));
    assert.equal(createHash('sha256').update(body).digest('hex'),file.sha256,file.path);
  }
});
