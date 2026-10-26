import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {assertPublicText,validatePublication,publicInputs,publicReadingViews} from '../scripts/notebooks/property-pack-publication.mjs';
const digest=body=>createHash('sha256').update(body).digest('hex');
const release=JSON.parse(await fs.readFile(new URL('../config/notebook-publication.json',import.meta.url)));
function fixture(){
  const sources=[{id:'reading',sourceId:'native-reading',title:'Reading',kind:'authored-reading',uploadedBody:'# Exact reading',sha256:digest('# Exact reading'),provenance:[{path:'docs/evidence.md',sha256:'evidence'}]},
    {id:'original',sourceId:'native-original',title:'Original',kind:'original',ingestKind:'file',path:'source/report.pdf',sha256:digest('native bytes'),uploadedBody:'https://lh3.googleusercontent.com/notebooklm/private-token',provenance:[]}];
  const request={key:'topic-brief',subject:'pp-01',chapter:'pp-01',type:'audio',format:'brief',topic:{id:'topic',title:'Topic'},prompt:'Explain the subject',promptSha256:digest('Explain the subject'),sourceIds:['native-reading','native-original'],consumedCreateArguments:{notebook_id:'private-notebook',source_ids:['native-reading','native-original'],focus_prompt:'Explain the subject',format_code:1}};
  return {snapshot:{sources},requests:new Map([[request.key,request]])};
}
test('public release requires its explicit authority and exact production origin',()=>{
  assert.equal(validatePublication(release),release);
  for(const change of [{origin:'http://localhost:4340'},{route:'/elsewhere'},{authorisation:''},{run:'../private'}]) assert.throws(()=>validatePublication({...release,...change}));
});
test('public source projection preserves supplied text and references unchanged native files',()=>{
  const input=fixture(),cut=publicInputs(input,release);
  assert.equal(cut.input.sourceBodies.reading,'# Exact reading');
  assert.match(cut.input.sourceBodies.original,/https:\/\/opda.org.uk\/presentations\/platform\/media\//);
  assert.doesNotMatch(JSON.stringify(cut.manifest),/private-notebook|"native-reading"|"native-original"|private-token|source-readbacks/);
  assert.equal(cut.manifest.requests[0].prompt,input.requests.get('topic-brief').prompt);
  assert.equal(cut.manifest.sources[1].originalSha256,input.snapshot.sources[1].sha256);
  assert.equal(input.snapshot.sources[1].sourceId,'native-original');
  assert.deepEqual(cut.input.requests.get('topic-brief').sourceIds,['reading','original']);
});
test('public inspector replaces private custody fields while retaining source selection',()=>{
  const cut=publicInputs(fixture(),release);
  const views=publicReadingViews([{id:'topic-topic-data',text:'private receipt'},{id:'prompt',text:'exact prompt'}],cut.input,{id:'pp-01',topics:[{id:'topic'}]});
  assert.match(views[0].text,/Source key: reading/);
  assert.match(views[0].text,/Source key: original/);
  assert.doesNotMatch(views[0].text,/private receipt|Native ID|readbackPath/);
  assert.equal(views[1].text,'exact prompt');
});
test('public staging rejects private transport and host references',()=>{
  for(const value of ['http://127.0.0.1:4340','http://localhost:4339','/Users/henrik/source/opda','.local/runs/file','https://notebooklm.google.com/notebook/private','https://lh3.googleusercontent.com/notebooklm/signed','source-readbacks/id.json','/custody/generation/private']) assert.throws(()=>assertPublicText(value));
  assert.doesNotThrow(()=>assertPublicText('https://opda.org.uk/presentations/platform/media/property-pack/original.pdf'));
});
