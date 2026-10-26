import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveInputs} from '../scripts/notebooks/property-pack-inputs.mjs';

test('Property Pack media commission selects distinct useful format topics and retains private scope', async () => {
  const input = await resolveInputs();
  assert.equal(input.config.publish, false);
  assert.equal(input.sources.length, 7);
  assert.equal(input.requests.length, 13);
  assert.equal(new Set(input.requests.map(r=>r.topic.id)).size, 4);
  assert.equal(input.requests.filter(r=>r.acceptance).length,4);
  assert.deepEqual(Object.fromEntries(['video','slide_deck','audio','infographic'].map(k=>[k,input.requests.filter(r=>r.type===k).length])),{video:2,slide_deck:2,audio:3,infographic:6});
  const infographic = input.requests.filter(r=>r.type==='infographic');
  assert.equal(new Set(infographic.map(r=>r.promptSha256)).size,1);
  assert.equal(new Set(infographic.map(r=>JSON.stringify(r.topic.sourceKeys))).size,1);
  assert.deepEqual(infographic.map(r=>r.settings.detail_level),['concise','concise','standard','standard','detailed','detailed']);
  for(const request of input.requests) {
    assert.equal(request.settings.language,'en-GB');
    if(request.type==='slide_deck') assert.equal(request.settings.slide_length,'long');
    if(request.type==='audio') assert.equal(request.settings.audio_length,'default');
    if(request.format==='cinematic') assert.equal(request.settings.visual_style,undefined);
  }
});

test('Prospective complete source bodies retain material candidate qualifications and provenance', async () => {
  const {sources} = await resolveInputs();
  for(const source of sources) {
    assert.match(source.sha256,/^[a-f0-9]{64}$/);
    assert.ok(source.body.length > 1000);
    if(source.kind==='authored-reading') {
      assert.ok(source.provenance.length>0);
      assert.match(source.body,/candidate|machine-proposed/);
      assert.doesNotMatch(source.body,/standalone presentation|independent reading|self-contained deck|without a presenter/i);
    }
  }
  assert.match(sources.find(s=>s.id==='assurance').body,/does not claim full RDF 1\.2 or SHACL 1\.2 Union conformance/);
  assert.match(sources.find(s=>s.id==='boundaries').body,/no governed cross-context mappings/);
});
