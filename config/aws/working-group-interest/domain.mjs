import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const PRIVACY_NOTICE_VERSION = '2026-08-12';
export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const PENDING_RETENTION_SECONDS = 30 * 24 * 60 * 60;
export const VERIFIED_RETENTION_SECONDS = 180 * 24 * 60 * 60;
export const MINIMUM_COMPLETION_MS = 3_000;

export const WORKING_GROUPS = new Set([
  'conveyancing',
  'estate-agency',
  'surveying-and-valuation',
  'property-data-services',
  'property-technology',
  'not-sure',
]);

export const CONTRIBUTIONS = new Set([
  'share-source-material',
  'explain-domain-language-and-rules',
  'review-model-candidates',
  'test-schemas-and-integrations',
  'contribute-consumer-accessibility-regulatory-public-interest-experience',
]);

const REGISTRATION_FIELDS = new Set([
  'fullName',
  'email',
  'organisation',
  'role',
  'workingGroups',
  'contributions',
  'relevantPerspective',
  'acknowledgement',
  'privacyNoticeVersion',
  'turnstileToken',
  'website',
  'startedAt',
]);

const INVALID_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const HTML_MARKER = /[<>]/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function text(value, minimum, maximum, options = {}) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  const length = Array.from(normalized).length;
  if (length < minimum || length > maximum) return null;
  if (INVALID_CONTROL.test(normalized) || HTML_MARKER.test(normalized)) return null;
  if (!options.multiline && /[\r\n]/u.test(normalized)) return null;
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

export function validateRegistration(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: { form: 'Enter the requested details.' } };
  }

  const errors = {};
  if (Object.keys(payload).some((key) => !REGISTRATION_FIELDS.has(key))) {
    errors.form = 'The submission contains an unexpected field.';
  }

  const fullName = text(payload.fullName, 2, 100);
  const email = normalizeEmail(payload.email);
  const organisation = text(payload.organisation, 2, 150);
  const role = text(payload.role, 2, 120);
  const workingGroups = selection(payload.workingGroups, WORKING_GROUPS);
  const contributions = selection(payload.contributions, CONTRIBUTIONS);
  const relevantPerspective = text(payload.relevantPerspective ?? '', 0, 600, { multiline: true });
  const turnstileToken = text(payload.turnstileToken, 1, 2_048);
  const website = typeof payload.website === 'string' ? payload.website.trim() : null;
  const startedAt = Number(payload.startedAt);

  if (!fullName) errors.fullName = 'Enter your full name.';
  if (!EMAIL.test(email) || email.length > 254 || INVALID_CONTROL.test(email) || HTML_MARKER.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!organisation) errors.organisation = 'Enter your organisation.';
  if (!role) errors.role = 'Enter your role or area of expertise.';
  if (!workingGroups) errors.workingGroups = 'Select at least one working group.';
  if (workingGroups?.includes('not-sure') && workingGroups.length > 1) {
    errors.workingGroups = 'Select “Not sure” on its own, or choose specific groups.';
  }
  if (!contributions) errors.contributions = 'Select at least one way to contribute.';
  if (relevantPerspective === null) errors.relevantPerspective = 'Use 600 characters or fewer and do not include HTML.';
  if (payload.acknowledgement !== true) errors.acknowledgement = 'Confirm that this is an expression of interest.';
  if (payload.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
    errors.privacyNoticeVersion = 'Reload the page and review the current privacy notice.';
  }
  if (!turnstileToken) errors.turnstileToken = 'Complete the anti-spam check.';
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
      contributions,
      relevantPerspective,
      acknowledgement: true,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      turnstileToken,
      website,
      startedAt,
    },
  };
}

export function isPlausibleHumanSubmission(value, now) {
  if (value.website) return false;
  const elapsed = now - value.startedAt;
  // Only reject impossibly fast submissions. There is deliberately no upper
  // time limit: people using assistive technology can take as long as needed.
  return elapsed >= MINIMUM_COMPLETION_MS;
}

export function registrationKey(email, hmacSecret) {
  return createHmac('sha256', hmacSecret).update(normalizeEmail(email)).digest('hex');
}

export function createVerification(registrationId, bytes = randomBytes(32)) {
  const secret = Buffer.from(bytes).toString('base64url');
  return {
    token: `${registrationId}.${secret}`,
    tokenHash: createHash('sha256').update(secret).digest('hex'),
  };
}

export function parseVerificationToken(token) {
  if (typeof token !== 'string' || token.length > 160) return null;
  const match = token.match(/^([a-f0-9]{64})\.([A-Za-z0-9_-]{43})$/u);
  if (!match) return null;
  return {
    registrationId: match[1],
    tokenHash: createHash('sha256').update(match[2]).digest('hex'),
  };
}

export function tokenHashesMatch(left, right) {
  if (!/^[a-f0-9]{64}$/u.test(left ?? '') || !/^[a-f0-9]{64}$/u.test(right ?? '')) return false;
  return timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

export function publicWorkingGroupName(slug) {
  return {
    'conveyancing': 'Conveyancing',
    'estate-agency': 'Estate Agency',
    'surveying-and-valuation': 'Surveying and Valuation',
    'property-data-services': 'Property Data Services',
    'property-technology': 'Property Technology',
    'not-sure': 'Not sure — help me choose',
  }[slug];
}
