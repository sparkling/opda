import { PARTICIPATION_PROPERTIES } from './properties.mjs';

const optionValues = (name) => PARTICIPATION_PROPERTIES.find((property) => property.name === name)
  .options.map((option) => option.value);
const GROUPS = optionValues('opda_requested_working_groups');
const CONTRIBUTIONS = optionValues('opda_contribution_preferences');
const INVALID_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

function invalid(field) {
  // Never put submitted personal values in an error that a worker might log.
  throw new TypeError(`Invalid persisted registration field: ${field}`);
}

function text(value, field, minimum, maximum, multiline = false) {
  if (typeof value !== 'string') invalid(field);
  const normalized = value.trim();
  const length = Array.from(normalized).length;
  if (length < minimum || length > maximum || INVALID_CONTROL.test(normalized) || /[<>]/u.test(normalized)) invalid(field);
  if (!multiline && /[\r\n]/u.test(normalized)) invalid(field);
  return normalized;
}

function selection(values, field, options) {
  if (!Array.isArray(values) || !values.length || values.length > options.length) invalid(field);
  if (new Set(values).size !== values.length || values.some((value) => !options.includes(value))) invalid(field);
  return options.filter((option) => values.includes(option)).join(';');
}

function validateSource(record, now) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) invalid('record');
  if (typeof record.registrationId !== 'string' || !UUID.test(record.registrationId)) invalid('registrationId');
  if (record.acknowledgement !== true) invalid('acknowledgement');
  text(record.privacyNoticeVersion, 'privacyNoticeVersion', 1, 100);
  if (record.status !== 'received') invalid('status');
  if (!Number.isSafeInteger(now) || now < 0) throw new TypeError('Invalid current timestamp');
  if (!Number.isSafeInteger(record.createdAt) || record.createdAt < 0 || record.createdAt > now) invalid('createdAt');
  if (!Number.isSafeInteger(record.expiresAt) || record.expiresAt <= Math.floor(now / 1000)) invalid('expiresAt');

  const email = text(record.email, 'email', 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) invalid('email');
  return {
    email, company: text(record.organisation, 'organisation', 2, 150),
    opda_full_name: text(record.fullName, 'fullName', 2, 100),
    opda_role_or_expertise: text(record.role, 'role', 2, 120),
    opda_requested_working_groups: selection(record.workingGroups, 'workingGroups', GROUPS),
    opda_contribution_preferences: selection(record.contributions, 'contributions', CONTRIBUTIONS),
    opda_relevant_perspective: text(record.relevantPerspective, 'relevantPerspective', 0, 600, true),
    opda_review_status: 'received', opda_enrolment_status: 'not_invited', opda_active: 'false',
  };
}

/**
 * Plan only the initial CRM action for a decoded, persisted AWS intake record.
 * `contactMatches` is mandatory: a missing/failed lookup is NOT an empty result.
 * Existing contacts are reviewed, never updated from this anonymous submission.
 *
 * No network calls or durable side effects. A future executor must additionally
 * check suppression/deletion, trusted email matches, daily budgets, uniqueness
 * locks and operation reconciliation BEFORE executing a create. This plan is not
 * an eligibility decision, a marketing-consent record, or an idempotency lock.
 * Historical form/option-set versions and checkbox-click times are not inferred.
 *
 * @param {Record<string, unknown>} record Decoded AWS record, not the public request.
 * @param {{contactMatches: string[], now?: number}} options
 */
export function planInitialContactSync(record, { contactMatches, now = Date.now() } = {}) {
  if (!Array.isArray(contactMatches) || contactMatches.some((id) => typeof id !== 'string' || !/^[1-9][0-9]*$/.test(id))
    || new Set(contactMatches).size !== contactMatches.length) {
    throw new TypeError('contactMatches must contain distinct resolved HubSpot contact IDs');
  }
  const properties = validateSource(record, now);
  if (contactMatches.length) {
    return {
      action: contactMatches.length === 1 ? 'review-existing-contact' : 'review-ambiguous-contacts',
      registrationId: record.registrationId, contactIds: [...contactMatches],
    };
  }
  return { action: 'create-contact', registrationId: record.registrationId, properties };
}
