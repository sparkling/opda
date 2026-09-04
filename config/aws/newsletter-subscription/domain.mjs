export const PRIVACY_NOTICE_VERSION = '2026-09-03';
export const SUBSCRIPTION_RETENTION_SECONDS = 730 * 24 * 60 * 60;
export const MINIMUM_COMPLETION_MS = 3_000;
export const CONSENT_TEXT =
  'I agree to receive OPDA email updates at this address. I can unsubscribe at any time.';

export const WORKING_GROUPS = new Set([
  'finance-and-banking',
  'conveyancing',
  'estate-agency',
  'surveying-and-valuation',
  'property-data-services',
  'property-technology',
]);

const SOURCES = new Set(['dialog', 'page']);
const SUBSCRIPTION_FIELDS = new Set([
  'fullName',
  'email',
  'organisation',
  'role',
  'workingGroups',
  'consent',
  'privacyNoticeVersion',
  'source',
  'website',
  'startedAt',
]);
const INVALID_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const HTML_MARKER = /[<>]/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function text(value, minimum, maximum) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  const length = Array.from(normalized).length;
  if (length < minimum || length > maximum) return null;
  if (INVALID_CONTROL.test(normalized) || HTML_MARKER.test(normalized) || /[\r\n]/u.test(normalized)) return null;
  return normalized;
}

function selection(value, allowlist) {
  if (!Array.isArray(value) || value.length < 1 || value.length > allowlist.size) return null;
  if (value.some((item) => typeof item !== 'string' || !allowlist.has(item))) return null;
  const unique = [...new Set(value)];
  return unique.length === value.length ? unique : null;
}

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function validateSubscription(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: { form: 'Enter the requested details.' } };
  }

  const errors = {};
  if (Object.keys(payload).some((key) => !SUBSCRIPTION_FIELDS.has(key))) {
    errors.form = 'The submission contains an unexpected field.';
  }

  const fullName = text(payload.fullName, 2, 100);
  const email = normalizeEmail(payload.email);
  const organisation = text(payload.organisation, 2, 150);
  const role = text(payload.role, 2, 120);
  const workingGroups = selection(payload.workingGroups, WORKING_GROUPS);
  const source = SOURCES.has(payload.source) ? payload.source : null;
  const website = typeof payload.website === 'string' ? payload.website.trim() : null;
  const startedAt = Number(payload.startedAt);

  if (!fullName) errors.fullName = 'Enter your full name.';
  if (!EMAIL.test(email) || email.length > 254 || INVALID_CONTROL.test(email) || HTML_MARKER.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!organisation) errors.organisation = 'Enter your organisation.';
  if (!role) errors.role = 'Enter your role or area of expertise.';
  if (!workingGroups) errors.workingGroups = 'Select at least one working group.';
  if (payload.consent !== true) errors.consent = 'Agree to receive email updates.';
  if (payload.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
    errors.privacyNoticeVersion = 'Reload the page and review the current privacy notice.';
  }
  if (!source) errors.source = 'The subscription source is invalid.';
  if (website === null || Array.from(website).length > 200) errors.form = 'The submission is invalid.';
  if (!Number.isSafeInteger(startedAt) || startedAt < 0) errors.form = 'The submission is invalid.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      fullName,
      email,
      organisation,
      role,
      workingGroups,
      consent: true,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      source,
      website,
      startedAt,
    },
  };
}

export function isPlausibleHumanSubmission(value, now) {
  if (value.website) return false;
  return now - value.startedAt >= MINIMUM_COMPLETION_MS;
}
