import assert from 'node:assert/strict';
import test from 'node:test';

import { validateRegistration } from '../config/aws/working-group-interest/domain.mjs';
import { registrationErrorIssues } from '../src/lib/working-group-registration-errors.ts';

test('registration errors use fixed client copy for allowlisted fields', () => {
  const issues = registrationErrorIssues({
    ok: false,
    errors: {
      email: '<server-controlled text>',
      workingGroups: 'another server message',
      unknown: 'must never reach the page',
      constructor: 'must not read an inherited property from the allowlist',
    },
  });

  assert.deepEqual(issues, [
    { selector: '#email', errorId: 'email-error', message: 'Enter a valid email address.' },
    {
      selector: 'input[name="workingGroups"]',
      errorId: 'working-groups-error',
      message: 'Select one or more working groups.',
    },
  ]);
});

test('stale privacy errors get local reload guidance without a field link', () => {
  assert.deepEqual(registrationErrorIssues({
    ok: false,
    errors: { privacyNoticeVersion: 'untrusted server text' },
  }), [{
    selector: null,
    errorId: null,
    message: 'This page is out of date. Reload it, review the current privacy notice, then register again.',
  }]);
});

test('form, unknown and malformed errors fall back to the retryable service message', () => {
  for (const value of [
    null,
    { ok: false },
    { ok: false, errors: { form: 'invalid' } },
    { ok: false, errors: { unknown: 'invalid' } },
    { ok: false, errors: [] },
  ]) assert.deepEqual(registrationErrorIssues(value), []);
});

test('every field error emitted by the server has a safe client-side issue', () => {
  const result = validateRegistration({
    fullName: '',
    email: '',
    organisation: '',
    role: '',
    workingGroups: [],
    contributions: [],
    relevantPerspective: '<invalid>',
    acknowledgement: false,
    privacyNoticeVersion: 'outdated',
    website: '',
    startedAt: 1,
  });

  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    'acknowledgement',
    'contributions',
    'email',
    'fullName',
    'organisation',
    'privacyNoticeVersion',
    'relevantPerspective',
    'role',
    'workingGroups',
  ]);
  assert.equal(registrationErrorIssues(result).length, 9);
});
