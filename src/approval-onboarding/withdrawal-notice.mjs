/**
 * Pure access-change notice contracts, original-layout compiler and payload boundary.
 * No provider calls, filesystem access, rendering or sending. A payload is not send
 * authorization: the caller must verify current decisions, complete owned-grant
 * removal (group) or website denial/identity disablement (website), and claim a
 * durable, participant-bound notice operation immediately before dispatch.
 * These essential account notices are separate from broadcast invitations.
 */
import { DOMAIN_TEMPLATE_CONTRACTS } from './domain-templates.mjs';

export const WITHDRAWAL_NOTICE_KINDS = Object.freeze(['group-withdrawn', 'website-disabled']);
const GROUP_CONTRACTS = Object.freeze(Object.fromEntries(Object.entries(DOMAIN_TEMPLATE_CONTRACTS).map(([groupId, domain]) => [groupId, Object.freeze({
  version: 1,
  kind: 'group-withdrawn',
  groupId,
  groupName: domain.groupName,
  alias: `${groupId}-approval-withdrawn-v1`,
  subject: `Your ${domain.groupName} approval has been withdrawn`,
})])));
const WEBSITE_CONTRACT = Object.freeze({
  version: 1,
  kind: 'website-disabled',
  alias: 'website-login-disabled-v1',
  subject: 'Your OPDA website sign-in has been disabled',
});
const UNSAFE_TEXT = /[<>\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/u;
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function requireValue(condition, message) {
  if (!condition) throw new TypeError(`Invalid withdrawal notice: ${message}`);
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

/** A group notice always selects exactly one finite domain; website notices select none. */
export function withdrawalNoticeContract(kind, groupId) {
  requireValue(typeof kind === 'string' && WITHDRAWAL_NOTICE_KINDS.includes(kind), 'unknown notice kind');
  if (kind === 'website-disabled') {
    requireValue(groupId === undefined, 'website notice cannot select a group');
    return WEBSITE_CONTRACT;
  }
  requireValue(typeof groupId === 'string' && Object.hasOwn(GROUP_CONTRACTS, groupId), 'unknown notice group');
  return GROUP_CONTRACTS[groupId];
}

function content(contract) {
  if (contract.kind === 'website-disabled') return {
    NOTICE_LABEL: 'Your OPDA website access',
    NOTICE_TITLE: 'Your website sign-in has been disabled',
    NOTICE_SUMMARY: 'Your OPDA website sign-in has been disabled because you no longer have any approved working groups.',
    NOTICE_LEAD: 'You no longer have any approved OPDA working groups, so your OPDA website sign-in has been disabled.',
    ACCESS_DETAIL: 'You cannot sign in to the OPDA website with this account.',
    PRESERVED_DETAIL: 'Public information on the OPDA website remains available without signing in.',
    FOOTER_PURPOSE: 'This is an essential notice about a change to your OPDA website access.',
  };
  return {
    NOTICE_LABEL: contract.groupName,
    NOTICE_TITLE: 'Your working-group approval has been withdrawn',
    NOTICE_SUMMARY: `Your approval for the ${contract.groupName} has been withdrawn.`,
    NOTICE_LEAD: `Your approval to participate in the ${contract.groupName} has been withdrawn.`,
    ACCESS_DETAIL: 'You no longer have the Microsoft Teams or SharePoint access granted through this approval for this working group.',
    PRESERVED_DETAIL: 'This withdrawal does not change your approval or access for any other working group that remains approved.',
    FOOTER_PURPOSE: 'This is an essential notice about a change to your working-group participation and access.',
  };
}

/** Compile seven independently publishable Standard templates from the two shared shells. */
export function compileWithdrawalNoticeTemplate(kind, groupId, shells) {
  const contract = withdrawalNoticeContract(kind, groupId);
  object(shells, ['HtmlBody', 'TextBody'], 'shells');
  const slots = { SUBJECT: contract.subject, ALIAS: contract.alias, ...content(contract) };
  const required = ['NOTICE_LABEL', 'NOTICE_TITLE', 'NOTICE_LEAD', 'ACCESS_DETAIL', 'PRESERVED_DETAIL', 'FOOTER_PURPOSE'];
  const compile = (body, html) => {
    requireValue(typeof body === 'string' && body.length > 0 && body.length <= 500_000
      && required.every(key => body.includes(`[[${key}]]`)) && body.includes('{{display_name}}')
      && (!html || body.includes('cid:opda-logo') && body.includes('width="680"')),
    'incomplete original-layout shell');
    const compiled = body.replace(/\[\[([A-Z_]+)\]\]/g, (_, key) => {
      requireValue(Object.hasOwn(slots, key), 'unreviewed template slot');
      return html ? escapeHtml(slots[key]) : slots[key];
    });
    requireValue(!/\[\[|\]\]|pm:unsubscribe/u.test(compiled), 'unreviewed template slot or broadcast control');
    requireValue(!/[{}]/u.test(compiled.replaceAll('{{display_name}}', '')), 'unreviewed or raw interpolation');
    return compiled;
  };
  return Object.freeze({
    Name: contract.kind === 'group-withdrawn' ? `${contract.groupName} Approval Withdrawal v1` : 'OPDA Website Login Disabled v1',
    Alias: contract.alias,
    Subject: contract.subject,
    HtmlBody: compile(shells.HtmlBody, true),
    TextBody: compile(shells.TextBody, false),
    TemplateType: 'Standard',
    LayoutTemplate: null,
  });
}

/** input: { displayName, email }; options: { kind, groupId?, logoBase64 }. Never log. */
export function buildWithdrawalNoticePayload(input, options) {
  object(input, ['displayName', 'email'], 'input');
  object(options, ['kind', 'groupId', 'logoBase64'], 'options');
  const contract = withdrawalNoticeContract(options.kind, options.groupId);
  const name = displayName(input.displayName);
  const email = recipient(input.email);
  requireValue(typeof options.logoBase64 === 'string' && options.logoBase64.length <= 350_000
    && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(options.logoBase64), 'logo must be bounded base64 PNG content');
  const image = Buffer.from(options.logoBase64, 'base64');
  requireValue(image.length > 8 && image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'logo must be a PNG');
  return {
    From: 'Smart Property Data Trust Framework <smartdata@openpropdata.org.uk>',
    To: email,
    ReplyTo: 'smartdata@openpropdata.org.uk',
    TemplateAlias: contract.alias,
    TemplateModel: { display_name: name, notice_kind: contract.kind,
      ...(contract.kind === 'group-withdrawn' ? { group_id: contract.groupId, group_name: contract.groupName } : {}) },
    InlineCss: true,
    MessageStream: 'outbound',
    TrackLinks: 'None',
    TrackOpens: false,
    Attachments: [{ Name: 'opda-email-logo.png', Content: options.logoBase64, ContentType: 'image/png', ContentID: 'cid:opda-logo' }],
  };
}
