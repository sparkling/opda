import assert from 'node:assert/strict';
import test from 'node:test';
import {
  messageFor,
  parseArgs,
  selectAcrossDomains,
  sha256,
} from '../scripts/postmark-invitation-wave.mjs';

function candidates(count) {
  return Array.from({ length: count }, (_, index) => ({
    display_name: `Participant ${index}`,
    email: `participant-${index}@company-${index}.example`,
    domain: `company-${index}.example`,
    access_url: `https://login.microsoftonline.com/redeem/${index}`,
  }));
}

test('dry run is the command-line default', () => {
  assert.deepEqual(parseArgs([]), { execute: false, digest: '' });
});

test('execution requires the exact digest shape', () => {
  assert.throws(() => parseArgs(['--execute']), /requires --digest/);
  assert.deepEqual(parseArgs(['--execute', '--digest', 'a'.repeat(64)]), {
    execute: true,
    digest: 'a'.repeat(64),
  });
});

test('Wave 1 selects 50 deterministic, distinct organisations', () => {
  const input = candidates(60);
  const first = selectAcrossDomains(input);
  const second = selectAcrossDomains(input);
  assert.equal(first.length, 50);
  assert.equal(new Set(first.map((row) => row.domain)).size, 50);
  assert.deepEqual(first, second);
  assert.equal(sha256(JSON.stringify(first)), sha256(JSON.stringify(second)));
});

test('template message preserves recipient URL, CID logo and tracking policy', () => {
  const [candidate] = candidates(1);
  const message = messageFor(candidate, 'base64-logo', 'b'.repeat(64));
  assert.equal(message.To, candidate.email);
  assert.deepEqual(message.TemplateModel, {
    display_name: candidate.display_name,
    access_url: candidate.access_url,
  });
  assert.equal(message.MessageStream, 'broadcast');
  assert.equal(message.TrackOpens, true);
  assert.equal(message.TrackLinks, 'None');
  assert.equal(message.Attachments[0].ContentID, 'cid:opda-logo');
});
