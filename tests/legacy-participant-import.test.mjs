import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  APPROVAL_ID, parseArguments, validateSnapshot, createLegacyImporter,
} from '../scripts/legacy-participant-import.mjs';

const emails = Array.from({ length: 6 }, (_, i) => `member${i}@example.test`);
const snapshot = { schemaVersion: 1, source: 'legacy-auth0-allowlist',
  sourceFunction: 'opda-auth-session', capturedAt: '2026-09-08T22:00:00.000Z', emails };
const bytes = Buffer.from(JSON.stringify(snapshot));
const pin = { bucket: 'opda-participant-recovery-355653384628-eu-west-2', key: `migration/${APPROVAL_ID}.json`,
  versionId: 'version-1', sha256: createHash('sha256').update(bytes).digest('hex') };
const args = ['apply', '--bucket', pin.bucket, '--key', pin.key, '--version-id', pin.versionId, '--sha256', pin.sha256];
const uuid = '00000000-0000-4000-8000-000000000001';

function fixture() {
  const items = new Map(), users = new Map(), calls = [];
  let sequence = 0, failCommit = false;
  const deps = {
    now: () => Date.parse('2026-09-08T23:00:00.000Z'),
    newId: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`,
    readSnapshot: async supplied => { calls.push(['read', supplied]); return { bytes, versionId: pin.versionId }; },
    get: async pk => structuredClone(items.get(pk)),
    putMarker: async item => { assert.ok(!items.has(item.pk)); items.set(item.pk, structuredClone(item)); calls.push(['marker']); },
    prepare: async (operation, claim) => {
      assert.ok(!items.has(operation.pk) && !items.has(claim.pk));
      items.set(operation.pk, structuredClone(operation)); items.set(claim.pk, structuredClone(claim));
      calls.push(['prepare']);
    },
    createUser: async input => {
      calls.push(['create', input]);
      if (users.has(input.Username)) throw Object.assign(new Error('already exists'), { name: 'UsernameExistsException' });
      const user = { Enabled: true, Attributes: [...input.UserAttributes,
        { Name: 'sub', Value: `10000000-0000-4000-8000-${String(users.size + 1).padStart(12, '0')}` }] };
      users.set(input.Username, user); return user;
    },
    getUser: async email => users.get(email),
    complete: async (operation, participant) => {
      if (failCommit) { failCommit = false; throw new Error('connection lost'); }
      assert.ok(!items.has(participant.pk));
      items.set(participant.pk, structuredClone(participant));
      items.set(operation.pk, { ...operation, phase: 'complete', cognitoSub: participant.cognitoSub });
      calls.push(['complete']);
    },
  };
  return { deps, items, users, calls, failNextCommit: () => { failCommit = true; } };
}

test('CLI requires explicit immutable source pins and rejects unknown or repeated arguments', () => {
  assert.deepEqual(parseArguments(args), { action: 'apply', pin });
  for (const invalid of [[], args.slice(0, -2), [...args, '--email', emails[0]], [...args, '--sha256', pin.sha256],
    args.map(x => x === 'version-1' ? 'null' : x), args.map(x => x === pin.sha256 ? 'bad' : x)]) {
    assert.throws(() => parseArguments(invalid));
  }
});

test('only six distinct valid captured legacy allowlist entries with the exact digest/version pass', () => {
  assert.deepEqual(validateSnapshot(bytes, pin, 'version-1').emails, emails);
  assert.throws(() => validateSnapshot(bytes, pin, 'different-version'));
  assert.throws(() => validateSnapshot(Buffer.concat([bytes, Buffer.from(' ')]), pin, 'version-1'));
  for (const changed of [{ emails: emails.slice(1) }, { emails: [...emails, 'extra@example.test'] },
    { emails: [emails[0], ...emails.slice(0, 5)] }, { emails: ['not-email', ...emails.slice(1)] },
    { source: 'crm' }, { sourceFunction: 'other' }, { capturedAt: 'invalid' }, { schemaVersion: 2 },
    { roles: ['admin'] }, { sourceRevisionId: [uuid] }]) {
    const altered = Buffer.from(JSON.stringify({ ...snapshot, ...changed }));
    assert.throws(() => validateSnapshot(altered, { ...pin, sha256: createHash('sha256').update(altered).digest('hex') }, 'version-1'));
  }
});

test('plan is read-only and returns counts without emails, identities or grants', async () => {
  const f = fixture();
  const result = await createLegacyImporter(f.deps).run('plan', pin, 'actor');
  assert.equal(result.expected, 6);
  assert.equal(result.mutations, false);
  assert.equal(f.items.size, 0); assert.equal(f.users.size, 0);
  assert.doesNotMatch(JSON.stringify(result), /member0|example\.test|admin|hubspotContactId/);
});

test('apply preserves approval with no invitation, password, verified-email assertion, role or CRM association', async () => {
  const f = fixture();
  const result = await createLegacyImporter(f.deps).run('apply', pin, 'actor');
  assert.equal(result.complete, 6); assert.equal(result.failed, 0);
  const marker = f.items.get(`MIGRATION#${APPROVAL_ID}`);
  assert.equal(marker.versionId, pin.versionId); assert.equal(marker.digest, pin.sha256);
  for (const [, input] of f.calls.filter(([kind]) => kind === 'create')) {
    assert.equal(input.MessageAction, 'SUPPRESS'); assert.equal(input.ForceAliasCreation, false);
    assert.equal(input.TemporaryPassword, undefined);
    assert.ok(!input.UserAttributes.some(x => x.Name === 'email_verified'));
  }
  for (const row of [...f.items.values()].filter(x => x.pk.startsWith('USER#'))) {
    assert.equal(row.source, 'legacy-auth0-allowlist'); assert.equal(row.reviewStatus, 'approved');
    assert.equal(row.active, true); assert.equal(row.suspended, false);
    assert.equal(row.enrolmentStatus, 'not_invited'); assert.equal(row.accessVersion, 1);
    assert.equal(row.hubspotContactId, undefined); assert.equal(row.roles, undefined);
    assert.equal(row.verifiedEmailAt, undefined); assert.equal(row.approvalId, APPROVAL_ID);
  }
});

test('replay preserves later deactivation, suspension, onboarding and access version without Cognito calls', async () => {
  const f = fixture(), importer = createLegacyImporter(f.deps);
  await importer.run('apply', pin, 'actor');
  const row = [...f.items.values()].find(x => x.pk.startsWith('USER#'));
  Object.assign(row, { active: false, suspended: true, enrolmentStatus: 'complete', accessVersion: 99 });
  const count = f.calls.length;
  assert.equal((await importer.run('apply', pin, 'actor')).complete, 6);
  assert.equal(row.active, false); assert.equal(row.suspended, true); assert.equal(row.accessVersion, 99);
  assert.ok(f.calls.slice(count).every(([kind]) => kind === 'read'));
});

test('an interrupted Cognito-to-DynamoDB write resumes only the import-owned custom participant ID', async () => {
  const f = fixture(), importer = createLegacyImporter(f.deps);
  f.failNextCommit();
  assert.equal((await importer.run('apply', pin, 'actor')).failed, 1);
  assert.equal((await importer.run('apply', pin, 'actor')).complete, 6);
  assert.equal(f.users.size, 6);
});

test('unknown existing Cognito users and foreign email claims are never adopted or overwritten', async () => {
  const f = fixture();
  f.users.set(emails[0], { Enabled: true, Attributes: [{ Name: 'email', Value: emails[0] },
    { Name: 'sub', Value: uuid }, { Name: 'custom:participant_id', Value: 'someone-else' }] });
  const hash = createHash('sha256').update(emails[1]).digest('hex');
  f.items.set(`EMAIL#${hash}`, { pk: `EMAIL#${hash}`, participantId: 'foreign', importKey: 'IMPORT#other' });
  const result = await createLegacyImporter(f.deps).run('apply', pin, 'actor');
  assert.equal(result.failed, 2); assert.equal(result.complete, 4);
  assert.equal(f.items.get(`EMAIL#${hash}`).participantId, 'foreign');
  assert.equal(f.items.has(`USER#${uuid}`), false);
});

test('a persisted migration marker rejects any changed source binding before account writes', async () => {
  const f = fixture();
  f.items.set(`MIGRATION#${APPROVAL_ID}`, { pk: `MIGRATION#${APPROVAL_ID}`, ...pin, digest: '0'.repeat(64) });
  await assert.rejects(createLegacyImporter(f.deps).run('apply', pin, 'actor'));
  assert.equal(f.users.size, 0);
});

test('a disabled import-owned Cognito account is not enabled or made into a participant', async () => {
  const f = fixture(), importer = createLegacyImporter(f.deps);
  f.failNextCommit();
  assert.equal((await importer.run('apply', pin, 'actor')).failed, 1);
  f.users.get(emails[0]).Enabled = false;
  assert.equal((await importer.run('apply', pin, 'actor')).failed, 1);
  assert.equal([...f.items.values()].filter(x => x.pk.startsWith('USER#')).length, 5);
});

test('native adapter binds account, S3 version/owner, email claim and migration marker without profile updates', async () => {
  const source = await readFile(new URL('../scripts/legacy-participant-import.mjs', import.meta.url), 'utf8');
  assert.match(source, /fromIni\(\{ profile: 'opda' \}\)/);
  assert.match(source, /actor\.Account !== ACCOUNT/);
  assert.match(source, /VersionId: pin\.versionId, ExpectedBucketOwner: ACCOUNT/);
  assert.match(source, /ConsistentRead: true/);
  assert.match(source, /TransactItems: \[markerGuard\(pin\), putNew\(op\), putNew\(claim\)\]/);
  assert.match(source, /markerGuard\(pin\), putNew\(participant\)/);
  assert.match(source, /participantId = :id AND importKey = :import/);
  assert.match(source, /ConditionExpression: 'attribute_not_exists\(pk\)'/);
  assert.doesNotMatch(source, /AdminEnableUser|AdminUpdateUserAttributes|AdminSetUserPassword|api\.hubapi\.com|hubspotContactId/);
});
