import assert from 'node:assert/strict';
import test from 'node:test';
import {
  messageFor,
  parseArgs,
  selectAcrossDomains,
  sha256,
  validatePrerequisiteDelivery,
  validatePrerequisiteWave,
  waveConfig,
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

test('Wave 2 selects 100 deterministic, distinct organisations', () => {
  const input = candidates(120);
  const first = selectAcrossDomains(input);
  const second = selectAcrossDomains(input);
  assert.equal(first.length, 100);
  assert.equal(new Set(first.map((row) => row.domain)).size, 100);
  assert.deepEqual(first, second);
  assert.equal(sha256(JSON.stringify(first)), sha256(JSON.stringify(second)));
});

test('Wave 3 configuration selects every remaining eligible recipient', () => {
  const config = waveConfig({
    OPDA_INVITATION_WAVE_ID: 'finance-banking-wave-3',
    OPDA_INVITATION_WAVE_SIZE: 'remaining',
    OPDA_INVITATION_PREREQUISITE_WAVE_ID: 'finance-banking-wave-2',
    OPDA_INVITATION_PREREQUISITE_COUNT: '100',
  });
  assert.deepEqual(config, {
    id: 'finance-banking-wave-3',
    size: null,
    prerequisite: { id: 'finance-banking-wave-2', count: 100 },
  });
  const input = candidates(37);
  const selected = selectAcrossDomains(input, { waveId: config.id, waveSize: config.size });
  assert.equal(selected.length, input.length);
  assert.deepEqual(new Set(selected.map((row) => row.email)), new Set(input.map((row) => row.email)));
});

test('Wave 3 blocks unless Wave 2 is complete in the ledger and settled in Postmark', () => {
  const prerequisite = { id: 'finance-banking-wave-2', count: 2 };
  const ledger = ['a@example.com', 'b@example.com'].flatMap((email) => [
    { wave_id: prerequisite.id, email, status: 'attempting' },
    { wave_id: prerequisite.id, email, status: 'accepted' },
  ]);
  const accepted = validatePrerequisiteWave(ledger, prerequisite);
  const delivery = {
    TotalCount: 2,
    Messages: [
      { MessageID: 'one', Tag: prerequisite.id, Status: 'Sent' },
      { MessageID: 'two', Tag: prerequisite.id, Status: 'Sent' },
    ],
  };
  assert.doesNotThrow(() => validatePrerequisiteDelivery(delivery, [], prerequisite, accepted));
  assert.throws(
    () => validatePrerequisiteWave([...ledger, {
      wave_id: prerequisite.id,
      email: 'b@example.com',
      status: 'unknown',
    }], prerequisite),
    /has not completed cleanly/,
  );
  assert.throws(
    () => validatePrerequisiteDelivery(
      delivery,
      [{ EmailAddress: 'a@example.com' }],
      prerequisite,
      accepted,
    ),
    /has not settled cleanly/,
  );
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
