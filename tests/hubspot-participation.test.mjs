import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PARTICIPATION_PROPERTIES,
  DOMAIN_REVIEW_PROPERTIES,
  OPTION_SET_VERSION,
  assessContactPropertySchema,
} from '../config/aws/hubspot-participation/properties.mjs';
import { planInitialContactSync } from '../config/aws/hubspot-participation/mapping.mjs';
import { WORKING_GROUPS, CONTRIBUTIONS } from '../config/aws/working-group-interest/domain.mjs';
import {
  verifyPrivateApp, readSchemaPreflight, createMissingProperties,
} from '../config/aws/hubspot-participation/admin.mjs';

const now = Date.parse('2026-09-08T12:00:00Z');
const registration = (changes = {}) => ({
  registrationId: '4aa91913-382a-46f8-8eb6-4341b2c6d0c7',
  fullName: 'Ada van Example', email: 'ada@example.com', organisation: 'Example Ltd',
  role: 'Surveyor and data reviewer', workingGroups: ['surveying-and-valuation'],
  contributions: ['review-model-candidates'], relevantPerspective: 'Practical inspection experience.',
  acknowledgement: true, privacyNoticeVersion: '2026-08-13', status: 'received',
  createdAt: now - 1000, expiresAt: Math.floor(now / 1000) + 86400,
  ...changes,
});
const property = (name) => PARTICIPATION_PROPERTIES.find((item) => item.name === name);
const standardProperties = [
  { name: 'email', type: 'string', fieldType: 'text', hubspotDefined: true },
  { name: 'company', type: 'string', fieldType: 'text', hubspotDefined: true },
];
const inventory = (properties = standardProperties) => ({ complete: true, properties });
const allProperties = () => structuredClone([...standardProperties, ...PARTICIPATION_PROPERTIES]);
const sync = (record = registration(), contactMatches = []) =>
  planInitialContactSync(record, { now, contactMatches });

test('the fourteen-property manifest preserves signup choices and adds six independent domain reviews', () => {
  assert.equal(OPTION_SET_VERSION, 1);
  assert.equal(PARTICIPATION_PROPERTIES.length, 14);
  assert.equal(new Set(PARTICIPATION_PROPERTIES.map((item) => item.name)).size, 14);
  assert.deepEqual(property('opda_requested_working_groups').options.map((item) => item.value), [...WORKING_GROUPS]);
  assert.deepEqual(property('opda_contribution_preferences').options.map((item) => item.value), [...CONTRIBUTIONS]);
  assert.ok(PARTICIPATION_PROPERTIES.every((item) => item.groupName === 'opda_participation'));
  assert.ok(Object.isFrozen(property('opda_requested_working_groups').options[0]));
  assert.deepEqual(Object.keys(DOMAIN_REVIEW_PROPERTIES), [...WORKING_GROUPS]);
  assert.ok(Object.isFrozen(DOMAIN_REVIEW_PROPERTIES));
  for (const name of Object.values(DOMAIN_REVIEW_PROPERTIES)) {
    assert.equal(property(name).fieldType, 'select');
    assert.deepEqual(property(name).options.map(({ value }) => value),
      ['received', 'under_review', 'approved', 'rejected', 'withdrawn']);
    assert.match(property(name).description, /only this domain/);
  }
  assert.match(property('opda_review_status').description, /no longer approves all selected groups/);
});

test('new-contact mapping uses only the agreed fields and never grants access', () => {
  const record = registration({
    email: ' ADA@EXAMPLE.COM ', fullName: ' Ada van Example ',
    website: 'https://example.com', startedAt: 123, membership_type: 'Member',
    opda_active: true, approvedGroups: ['finance-and-banking'], marketingConsent: true,
  });
  const before = structuredClone(record);
  const plan = sync(record);
  assert.equal(plan.action, 'create-contact');
  assert.equal(plan.registrationId, record.registrationId);
  assert.deepEqual(plan.properties, {
    email: 'ada@example.com', company: 'Example Ltd', opda_full_name: 'Ada van Example',
    opda_role_or_expertise: 'Surveyor and data reviewer',
    opda_requested_working_groups: 'surveying-and-valuation',
    opda_contribution_preferences: 'review-model-candidates',
    opda_relevant_perspective: 'Practical inspection experience.',
    opda_review_status: 'received', opda_enrolment_status: 'not_invited', opda_active: 'false',
  });
  assert.deepEqual(record, before);
});

test('multi-select values have stable order, without append syntax', () => {
  const plan = sync(registration({
    workingGroups: [...WORKING_GROUPS].reverse(), contributions: [...CONTRIBUTIONS].reverse(),
  }));
  assert.equal(plan.properties.opda_requested_working_groups, [...WORKING_GROUPS].join(';'));
  assert.equal(plan.properties.opda_contribution_preferences, [...CONTRIBUTIONS].join(';'));
});

test('historic notice evidence is retained in AWS, without inventing a form version', () => {
  const plan = sync(registration({ privacyNoticeVersion: '2025-01-01', relevantPerspective: '' }));
  assert.equal(plan.action, 'create-contact');
  assert.equal(plan.properties.opda_relevant_perspective, '');
  assert.equal(plan.formVersion, undefined);
  assert.equal(plan.optionSetVersion, undefined);
  assert.equal(plan.properties.privacyNoticeVersion, undefined);
});

test('a current or ambiguous contact match produces review only, with no contact properties', () => {
  assert.deepEqual(sync(registration(), ['123']), {
    action: 'review-existing-contact', registrationId: registration().registrationId, contactIds: ['123'],
  });
  assert.deepEqual(sync(registration(), ['123', '456']), {
    action: 'review-ambiguous-contacts', registrationId: registration().registrationId, contactIds: ['123', '456'],
  });
  assert.throws(() => planInitialContactSync(registration(), { now }), /contactMatches/);
  for (const matches of [null, [''], [123], ['123', '123'], ['invalid/id']]) {
    assert.throws(() => sync(registration(), matches), /contactMatches/);
  }
});

test('invalid persisted fields fail without including personal values in errors', () => {
  for (const changes of [
    { fullName: 'X' }, { email: 'private-invalid-email' }, { organisation: '<script>' },
    { role: 'Line\nbreak' }, { relevantPerspective: 'x'.repeat(601) },
    { workingGroups: [] }, { workingGroups: ['unknown'] },
    { contributions: ['review-model-candidates', 'review-model-candidates'] },
    { contributions: ['review-model-candidates;represent-public-interests'] },
    { acknowledgement: false }, { privacyNoticeVersion: '' }, { status: 'approved' },
    { registrationId: '../record' }, { createdAt: '123' },
    { createdAt: now + 1 }, { expiresAt: now / 1000 }, { expiresAt: String(now) },
  ]) {
    assert.throws(() => sync(registration(changes)), (error) => {
      assert.equal(error instanceof TypeError, true);
      assert.equal(error.message.includes('private-invalid-email'), false);
      return true;
    });
  }
  for (const value of [undefined, null, [], 'record']) {
    assert.throws(() => planInitialContactSync(value, { now, contactMatches: [] }), TypeError);
  }
});

test('complete inventory and verified capacity are needed before proposing field creation', () => {
  const assessment = assessContactPropertySchema({ inventory: inventory(), remainingCustomPropertySlots: 14 });
  assert.equal(assessment.ready, true);
  assert.equal(assessment.propertiesToCreate.length, 14);
  assert.deepEqual(assessment.blockers, []);
  for (const options of [
    {}, { inventory: { complete: false, properties: standardProperties }, remainingCustomPropertySlots: 14 },
    { inventory: inventory() }, { inventory: inventory(), remainingCustomPropertySlots: 13 },
    { inventory: inventory(), remainingCustomPropertySlots: '14' },
  ]) {
    const blocked = assessContactPropertySchema(options);
    assert.equal(blocked.ready, false);
    assert.deepEqual(blocked.propertiesToCreate, []);
    assert.ok(blocked.blockers.length > 0);
  }
});

test('matching schema is an idempotent no-op, preserving other custom properties', () => {
  const properties = [...allProperties(),
    { name: 'membership_type', type: 'enumeration', fieldType: 'select' },
    { name: 'relationship_type', type: 'enumeration', fieldType: 'select' },
  ];
  const before = structuredClone(properties);
  const assessment = assessContactPropertySchema({ inventory: inventory(properties) });
  assert.equal(assessment.ready, true);
  assert.deepEqual(assessment.propertiesToCreate, []);
  assert.deepEqual(properties, before);
});

test('only missing fields consume capacity on a partially completed setup', () => {
  const assessment = assessContactPropertySchema({
    inventory: inventory(allProperties().filter(item => item.name !== 'opda_active')),
    remainingCustomPropertySlots: 1,
  });
  assert.equal(assessment.ready, true);
  assert.deepEqual(assessment.propertiesToCreate.map((item) => item.name), ['opda_active']);
});

test('an existing eight-field setup needs only the six verified domain-review slots', () => {
  const properties = [...standardProperties, ...PARTICIPATION_PROPERTIES.slice(0, 8)];
  const result = assessContactPropertySchema({ inventory: inventory(properties), remainingCustomPropertySlots: 6 });
  assert.equal(result.ready, true);
  assert.deepEqual(result.missingProperties, Object.values(DOMAIN_REVIEW_PROPERTIES));
  assert.equal(assessContactPropertySchema({ inventory: inventory(properties),
    remainingCustomPropertySlots: 5 }).ready, false);
});

test('conflicting, archived, calculated or read-only fields block setup without changing them', () => {
  for (const change of [
    { type: 'number' }, { fieldType: 'textarea' }, { archived: true }, { calculated: true },
    { modificationMetadata: { readOnlyValue: true } }, { groupName: 'unrelated_group' },
    { hasUniqueValue: true },
  ]) {
    const properties = allProperties();
    Object.assign(properties.find((item) => item.name === 'opda_full_name'), change);
    const assessment = assessContactPropertySchema({ inventory: inventory(properties) });
    assert.equal(assessment.ready, false);
    assert.deepEqual(assessment.propertiesToCreate, []);
    assert.ok(assessment.blockers.some((item) => item.property === 'opda_full_name'));
  }
});

test('renamed, missing, hidden or extra enumeration choices require explicit review', () => {
  for (const alter of [
    (options) => { options[0].value = 'unexpected'; },
    (options) => { options[0].label = 'Different meaning'; },
    (options) => { options[0].hidden = true; },
    (options) => { options.pop(); },
    (options) => { options.push({ value: 'other', label: 'Other' }); },
  ]) {
    const properties = allProperties();
    alter(properties.find((item) => item.name === 'opda_requested_working_groups').options);
    assert.equal(assessContactPropertySchema({ inventory: inventory(properties) }).ready, false);
  }
  const properties = allProperties();
  properties.find((item) => item.name === 'opda_requested_working_groups').options.reverse();
  assert.equal(assessContactPropertySchema({ inventory: inventory(properties) }).ready, true);
});

test('missing default fields, duplicate names and malformed inventory are never treated as empty', () => {
  for (const properties of [
    [], allProperties().filter((item) => item.name !== 'email'),
    [...allProperties(), standardProperties[0]], [...allProperties(), null],
  ]) {
    const assessment = assessContactPropertySchema({ inventory: inventory(properties), remainingCustomPropertySlots: 8 });
    assert.equal(assessment.ready, false);
    assert.deepEqual(assessment.propertiesToCreate, []);
  }
});

const bridgeScopes = ['oauth', 'crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.schemas.contacts.read'];
const expectedApp = { portalId: 123, appId: 456, scopes: bridgeScopes };
const limits = (overall = 14, contacts = 14) => ({
  overallLimit: overall + 2, overallUsage: 2,
  byObjectType: [{ objectTypeId: '0-1', limit: contacts + 2, usage: 2 }],
});
function mockApi({ properties = standardProperties, archived = [], capacity = limits(), groups = [] } = {}) {
  const calls = [];
  const api = async (path, options = {}) => {
    calls.push({ path, ...options });
    if (options.method === 'POST') {
      if (path.endsWith('/groups')) groups.push(options.body);
      else properties.push(options.body);
      return options.body;
    }
    if (path.endsWith('archived=false')) return { results: properties };
    if (path.endsWith('archived=true')) return { results: archived };
    if (path.endsWith('/groups')) return { results: groups };
    if (path.endsWith('custom-properties')) {
      if (capacity instanceof Error) throw capacity;
      return capacity;
    }
    throw new Error('Unexpected endpoint');
  };
  return { api, calls };
}

test('private app identity and exact scopes must match before credential use', async () => {
  const info = { hubId: 123, appId: 456, scopes: bridgeScopes };
  assert.equal((await verifyPrivateApp(async () => info, expectedApp)).portalId, 123);
  for (const wrong of [
    { ...info, hubId: 789 }, { ...info, appId: 789 },
    { ...info, scopes: bridgeScopes.slice(1) }, { ...info, scopes: [...bridgeScopes, 'crm.schemas.contacts.write'] },
  ]) {
    await assert.rejects(verifyPrivateApp(async () => wrong, expectedApp), /identity or scopes/);
  }
});

test('live schema preflight uses the smaller of account-wide and contact capacity', async () => {
  for (const capacity of [limits(13, 15), limits(15, 13)]) {
    const { api, calls } = mockApi({ capacity });
    const result = await readSchemaPreflight(api);
    assert.equal(result.ready, false);
    assert.equal(result.remainingCustomPropertySlots, 13);
    assert.ok(calls.every((call) => !call.method));
  }
  assert.equal((await readSchemaPreflight(mockApi().api)).ready, true);
});

test('unavailable or invalid portal limits never become assumed free slots', async () => {
  for (const capacity of [new Error('Forbidden'), {}, { ...limits(), overallLimit: -1 }, { ...limits(), overallUsage: '2' }]) {
    const result = await readSchemaPreflight(mockApi({ capacity }).api);
    assert.equal(result.ready, false);
    assert.ok(result.blockers.some(({ code }) => code === 'verified-property-capacity-required'));
  }
});

test('incomplete inventory and incompatible groups fail closed', async () => {
  await assert.rejects(readSchemaPreflight(async () => ({ results: [], paging: { next: {} } })), /complete inventory/);
  const result = await readSchemaPreflight(mockApi({
    groups: [{ name: 'opda_participation', label: 'An unrelated purpose' }],
  }).api);
  assert.equal(result.ready, false);
  assert.ok(result.blockers.some(({ code }) => code === 'incompatible-participation-group'));
});

test('provisioning only creates missing OPDA definitions and is an idempotent no-op on rerun', async () => {
  const { api, calls } = mockApi({ properties: structuredClone(standardProperties) });
  const first = await createMissingProperties(api);
  assert.equal(first.createdProperties.length, 14);
  assert.equal(first.verified, true);
  const writes = calls.filter(({ method }) => method === 'POST');
  assert.equal(writes.length, 15);
  assert.ok(writes.every(({ path }) => path.startsWith('/crm/v3/properties/contacts')));
  assert.equal((await createMissingProperties(api)).createdProperties.length, 0);
  assert.equal(calls.filter(({ method }) => method === 'POST').length, 15);
});

test('provisioning cannot write anything when preflight has a blocker', async () => {
  const { api, calls } = mockApi({ capacity: limits(7) });
  await assert.rejects(createMissingProperties(api), /preflight blocked/);
  assert.ok(calls.every(({ method }) => !method));
});

test('schema bootstrap can use a separate read-only limits credential without broader scopes', async () => {
  const { api, calls } = mockApi({ capacity: new Error('Schema-only token cannot read object limits') });
  const limitCalls = [];
  const limitsApi = async (path) => { limitCalls.push(path); return limits(); };
  assert.equal((await readSchemaPreflight(api, limitsApi)).ready, true);
  assert.deepEqual(limitCalls, ['/crm/v3/limits/custom-properties']);
  assert.ok(calls.every(({ path }) => path !== '/crm/v3/limits/custom-properties'));
});

test('custom-property inventory includes fields where HubSpot omits the false flag', async () => {
  const { api } = mockApi({ properties: [...standardProperties,
    { name: 'linkedin_account', label: 'LinkedIn account', type: 'string', fieldType: 'text' },
    { name: 'membership_type', label: 'Membership type', hubspotDefined: false, type: 'enumeration', fieldType: 'select' },
  ] });
  assert.deepEqual((await readSchemaPreflight(api)).customProperties.map(({ name }) => name), ['linkedin_account', 'membership_type']);
});
