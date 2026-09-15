/**
 * ADR-0084: applicant acknowledgement. Pure template contract, shell compiler and
 * payload boundary; no provider calls, filesystem access or sending. One reviewed
 * Postmark template carries the working group as a variable, and the sync worker
 * sends it once per requested working group. Receipt is acknowledged for every
 * validated application, created or quarantined; it promises review, never approval
 * and never a timescale. Lives beside the schema contract so the sync Lambda can
 * import it without the onboarding bundle.
 */
import { createHash } from 'node:crypto';
import { WORKING_GROUP_LABELS } from './properties.mjs';

export const ACKNOWLEDGEMENT_CONTRACT = Object.freeze({
  version: 1,
  kind: 'application-received',
  alias: 'working-group-application-received-v1',
  subject: 'Your {{group_name}} application has been received',
});
const VARIABLES = ['{{display_name}}', '{{group_name}}'];
const UNSAFE_TEXT = /[<>\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/u;
const DIGEST = /^[a-f0-9]{64}$/;
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function requireValue(condition, message) {
  if (!condition) throw new TypeError(`Invalid acknowledgement: ${message}`);
}

function object(value, keys, label) {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)), `${label} must be a plain object`);
  requireValue(Reflect.ownKeys(value).every(key => typeof key === 'string' && keys.includes(key)), `${label} contains an unsupported field`);
  requireValue(Object.values(Object.getOwnPropertyDescriptors(value)).every(property => !property.get && !property.set), `${label} cannot contain accessors`);
}

function displayName(value) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.length <= 256
    && !UNSAFE_TEXT.test(value) && !/[{}]/u.test(value), 'displayName must be safe, non-empty plain text');
  return value.trim();
}

function recipient(value) {
  requireValue(typeof value === 'string' && value.length <= 254
    && /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(value), 'email must be one bare email address');
  requireValue(value.split('@')[0].length <= 64 && value.split('@')[1].split('.').every(part => part.length <= 63), 'email exceeds address limits');
  return value.toLowerCase();
}

export function workingGroupName(groupId) {
  requireValue(typeof groupId === 'string' && Object.hasOwn(WORKING_GROUP_LABELS, groupId), 'unknown working group');
  return `${WORKING_GROUP_LABELS[groupId]} Working Group`;
}

// Reviewed copy. The group name is a Mustachio variable so one template serves every domain.
const CONTENT = Object.freeze({
  NOTICE_TITLE: 'We have received your application',
  NOTICE_SUMMARY: 'Your {{group_name}} application has been received and will be reviewed.',
  NOTICE_LEAD: 'Thank you for applying to take part in the {{group_name}}. Your application has been received and will be reviewed.',
  REVIEW_DETAIL: 'OPDA reviews each working-group application individually. If your application is approved, you will receive a separate invitation email for this working group explaining how to take part.',
  SEPARATE_DETAIL: 'If you applied for more than one working group, each application is reviewed on its own and you will receive a separate email for each.',
  FOOTER_PURPOSE: 'This is an essential notice confirming that OPDA has received your working-group application.',
});

/** Compile the single publishable Standard template from the shared HTML/text shells. */
export function compileAcknowledgementTemplate(shells) {
  object(shells, ['HtmlBody', 'TextBody'], 'shells');
  const slots = { SUBJECT: ACKNOWLEDGEMENT_CONTRACT.subject, ALIAS: ACKNOWLEDGEMENT_CONTRACT.alias, ...CONTENT };
  const required = ['NOTICE_TITLE', 'NOTICE_LEAD', 'REVIEW_DETAIL', 'SEPARATE_DETAIL', 'FOOTER_PURPOSE'];
  const compile = (body, html) => {
    requireValue(typeof body === 'string' && body.length > 0 && body.length <= 500_000
      && required.every(key => body.includes(`[[${key}]]`)) && VARIABLES.every(variable => body.includes(variable))
      && (!html || body.includes('cid:opda-logo') && body.includes('width="680"')),
    'incomplete original-layout shell');
    const compiled = body.replace(/\[\[([A-Z_]+)\]\]/g, (_, key) => {
      requireValue(Object.hasOwn(slots, key), 'unreviewed template slot');
      return html ? escapeHtml(slots[key]) : slots[key];
    });
    requireValue(!/\[\[|\]\]|pm:unsubscribe/u.test(compiled), 'unreviewed template slot or broadcast control');
    let stripped = compiled;
    for (const variable of VARIABLES) stripped = stripped.replaceAll(variable, '');
    requireValue(!/[{}]/u.test(stripped), 'unreviewed or raw interpolation');
    return compiled;
  };
  return Object.freeze({
    Name: 'Working Group Application Received v1',
    Alias: ACKNOWLEDGEMENT_CONTRACT.alias,
    Subject: ACKNOWLEDGEMENT_CONTRACT.subject,
    HtmlBody: compile(shells.HtmlBody, true),
    TextBody: compile(shells.TextBody, false),
    TemplateType: 'Standard',
    LayoutTemplate: null,
  });
}

/** Byte-exact content pin, computed identically for a compiled template and a Postmark readback. */
export function fingerprintAcknowledgementTemplate(template) {
  requireValue(template !== null && typeof template === 'object', 'template required');
  const { Alias = ACKNOWLEDGEMENT_CONTRACT.alias, Subject = ACKNOWLEDGEMENT_CONTRACT.subject,
    HtmlBody, TextBody, TemplateType = 'Standard', LayoutTemplate = null } = template;
  requireValue(Alias === ACKNOWLEDGEMENT_CONTRACT.alias && Subject === ACKNOWLEDGEMENT_CONTRACT.subject
    && TemplateType === 'Standard' && LayoutTemplate === null, 'unexpected template contract');
  for (const body of [HtmlBody, TextBody]) {
    requireValue(typeof body === 'string' && body.length > 0 && body.length <= 500_000
      && !body.includes('pm:unsubscribe') && !body.includes('{{{'), 'bounded transactional body required');
  }
  requireValue(HtmlBody.includes('cid:opda-logo'), 'CID logo required');
  return createHash('sha256').update(JSON.stringify([Alias, Subject, HtmlBody, TextBody, TemplateType, LayoutTemplate])).digest('hex');
}

/** Idempotent: accepts the raw pin or an already-built pin, but never a pin for another contract. */
export function acknowledgementPin(pin) {
  object(pin, ['serverId', 'templateId', 'fingerprint', ...Object.keys(ACKNOWLEDGEMENT_CONTRACT)], 'pin');
  for (const key of Object.keys(ACKNOWLEDGEMENT_CONTRACT)) {
    requireValue(!Object.hasOwn(pin, key) || pin[key] === ACKNOWLEDGEMENT_CONTRACT[key], 'pin belongs to another template contract');
  }
  requireValue([pin.serverId, pin.templateId].every(value => Number.isSafeInteger(value) && value > 0), 'positive server and template IDs required');
  requireValue(typeof pin.fingerprint === 'string' && DIGEST.test(pin.fingerprint), 'SHA-256 template pin required');
  return Object.freeze({ ...ACKNOWLEDGEMENT_CONTRACT, serverId: pin.serverId, templateId: pin.templateId, fingerprint: pin.fingerprint });
}

/** input: { displayName, email, groupId }; options: { logoBase64 }. Never log. */
export function buildAcknowledgementPayload(input, options) {
  object(input, ['displayName', 'email', 'groupId'], 'input');
  object(options, ['logoBase64'], 'options');
  const name = displayName(input.displayName);
  const email = recipient(input.email);
  const groupName = workingGroupName(input.groupId);
  requireValue(typeof options.logoBase64 === 'string' && options.logoBase64.length <= 350_000
    && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(options.logoBase64), 'logo must be bounded base64 PNG content');
  const image = Buffer.from(options.logoBase64, 'base64');
  requireValue(image.length > 8 && image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'logo must be a PNG');
  return {
    From: 'Smart Property Data Trust Framework <smartdata@openpropdata.org.uk>',
    To: email,
    ReplyTo: 'smartdata@openpropdata.org.uk',
    TemplateAlias: ACKNOWLEDGEMENT_CONTRACT.alias,
    TemplateModel: { display_name: name, group_id: input.groupId, group_name: groupName },
    InlineCss: true,
    MessageStream: 'outbound',
    TrackLinks: 'None',
    TrackOpens: false,
    Attachments: [{ Name: 'opda-email-logo.png', Content: options.logoBase64, ContentType: 'image/png', ContentID: 'cid:opda-logo' }],
  };
}
