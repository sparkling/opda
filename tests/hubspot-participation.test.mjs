import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PARTICIPATION_PROPERTIES,
  OPTION_SET_VERSION,
  assessContactPropertySchema,
} from '../config/aws/hubspot-participation/properties.mjs';
import { planInitialContactSync } from '../config/aws/hubspot-participation/mapping.mjs';
import { WORKING_GROUPS, CONTRIBUTIONS } from '../config/aws/working-group-interest/domain.mjs';

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

test('the eight-property manifest preserves all current signup option IDs', () => {
  assert.equal(OPTION_SET_VERSION, 1);
  assert.equal(PARTICIPATION_PROPERTIES.length, 8);
  assert.equal(new Set(PARTICIPATION_PROPERTIES.map((item) => item.name)).size, 8);
  assert.deepEqual(property('opda_requested_working_groups').options.map((item) => item.value), [...WORKING_GROUPS]);
  assert.deepEqual(property('opda_contribution_preferences').options.map((item) => item.value), [...CONTRIBUTIONS]);
  assert.ok(PARTICIPATION_PROPERTIES.every((item) => item.groupName === 'opda_participation'));
  assert.ok(Object.isFrozen(property('opda_requested_working_groups').options[0]));
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
  const assessment = assessContactPropertySchema({ inventory: inventory(), remainingCustomPropertySlots: 8 });
  assert.equal(assessment.ready, true);
  assert.equal(assessment.propertiesToCreate.length, 8);
  assert.deepEqual(assessment.blockers, []);
  for (const options of [
    {}, { inventory: { complete: false, properties: standardProperties }, remainingCustomPropertySlots: 8 },
    { inventory: inventory() }, { inventory: inventory(), remainingCustomPropertySlots: 7 },
    { inventory: inventory(), remainingCustomPropertySlots: '8' },
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
    inventory: inventory([...standardProperties, ...PARTICIPATION_PROPERTIES.slice(0, 7)]),
    remainingCustomPropertySlots: 1,
  });
  assert.equal(assessment.ready, true);
  assert.deepEqual(assessment.propertiesToCreate.map((item) => item.name), ['opda_active']);
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
