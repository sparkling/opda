import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {projectInputs, assertJobMatches, renditionCacheKey, matchingReview} from '../scripts/notebooks/property-pack-index.mjs';

const sha = body => createHash('sha256').update(body).digest('hex');
const notebookId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const sourceId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
function fixture() {
  const source = {id:'source', sourceId, title:'Reading', kind:'authored-reading', body:'# Reading', uploadedBody:'# Reading', sha256:sha('# Reading'), uploadedSha256:sha('# Reading'), indexedTextSha256:sha('Reading'), path:'docs/reading.md', provenance:[{path:'docs/evidence.md', sha256:'evidence'}]};
  const topic = {id:'topic', type:'infographic', title:'Topic'};
  const request = {key:'topic-concise-1', section:'section', chapter:'chapter', topic, type:'infographic', format:'landscape', ordinal:1,
    prompt:'Explain the subject', promptSha256:sha('Explain the subject'), completeInputSha256:'input', sourceIds:[sourceId],
    selectedSources:[source], settings:{detail_level:'concise'}, consumedCreateArguments:{notebook_id:notebookId, source_ids:[sourceId], focus_prompt:'Explain the subject'}};
  const snapshot = {notebookId, manifestSha256:'manifest', config:{id:'run-v1', publish:false, sections:[{id:'section', chapters:[{id:'chapter', topics:[topic]}]}]}, sources:[source], requests:[request]};
  const ledger = {notebookId, publish:false, manifestSha256:'manifest'};
  const job = {...request, id:'cccccccc-cccc-cccc-cccc-cccccccccccc', providerProof:{settingsVerified:true, sourceIds:[sourceId], promptSha256:request.promptSha256}};
  return {snapshot, request, ledger, job};
}

test('inspection projects complete supplied bodies and keeps provenance distinct', () => {
  const {snapshot} = fixture(), input = projectInputs(snapshot);
  assert.equal(input.sourceBodies[sourceId], '# Reading');
  assert.equal(input.sourceProof.sources[sourceId].bodySha256, sha('# Reading'));
  assert.equal(input.sourceProof.sources[sourceId].indexedTextSha256, sha('Reading'));
  assert.deepEqual(input.sourceProof.sources[sourceId].provenance.evidence, snapshot.sources[0].provenance);
  assert.equal(input.requests.get('topic-concise-1').infographicDetail, 'concise');
  assert.equal(input.requests.get('topic-concise-1').take, 1);
});

test('changed sources, source selection and foreign hierarchy fail admission', () => {
  for (const change of [s=>s.sources[0].uploadedBody+=' changed', s=>s.requests[0].sourceIds=[], s=>s.requests[0].chapter='elsewhere', s=>s.config.id='../run']) {
    const {snapshot} = fixture(); change(snapshot);
    assert.throws(() => projectInputs(snapshot));
  }
});

test('completed provider records must match source, prompt, settings and run', () => {
  const valid = fixture(); assert.doesNotThrow(() => assertJobMatches(valid.job, valid.request, valid.ledger, valid.snapshot));
  for (const change of [v=>v.job.providerProof.settingsVerified=false, v=>v.job.providerProof.sourceIds=[], v=>v.job.providerProof.promptSha256='other', v=>v.job.settings={detail_level:'detailed'}, v=>v.ledger.notebookId=sourceId]) {
    const value = fixture(); change(value);
    assert.throws(() => assertJobMatches(value.job, value.request, value.ledger, value.snapshot));
  }
});

test('rendition cache changes with original identity, renderer revision and settings', () => {
  const input = {sha256:'body', revision:'renderer', id:'artifact', type:'slide_deck', settings:{width:2048}};
  const first = renditionCacheKey(input);
  assert.equal(first, renditionCacheKey({...input}));
  for (const changed of [{sha256:'new'}, {revision:'new'}, {settings:{width:1376}}]) assert.notEqual(first, renditionCacheKey({...input, ...changed}));
});

test('review findings remain bound to the exact reviewed file', () => {
  const review = {key:'deck', originalSha256:'reviewed', status:'Factual corrections required', findings:['Incorrect relationship']};
  const item = {key:'deck', original:{sha256:'reviewed'}};
  assert.deepEqual(matchingReview([review], item), review);
  assert.deepEqual(matchingReview({deck:review}, item), review);
  assert.equal(matchingReview([review], {...item, original:{sha256:'replacement'}}), null);
  assert.equal(matchingReview([review], {...item, key:'another-deck'}), null);
});
