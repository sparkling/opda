/**
 * Pure post-approval invitation boundary. No provider calls, rendering or sending.
 * The caller must bind input.groups to the CURRENT review stamp's frozen selection,
 * verify every Microsoft/SharePoint postcondition, recheck withdrawal/suppressions,
 * and claim a durable per-review send ledger before dispatching the returned payload.
 * Verification booleans are caller attestations, not authorization or a live check.
 */
import { domainTemplateContract } from './domain-templates.mjs';

export const OPDA_TENANT_ID = '143540d4-4fbc-4005-882a-29656cd01a36';
export const WEBSITE_LOGIN_URL = 'https://opda.org.uk/_auth/login';
export const INVITATION_SUBJECT = 'Your OPDA working-group access is ready';
export const INVITATION_TEMPLATE_ALIAS = 'working-group-approval-invitation';

const GROUPS = Object.freeze({
  'finance-and-banking': Object.freeze({
    name: 'Finance and Banking Working Group',
    scope: 'Mortgage advice, lending, underwriting and the exchange of finance data.',
  }),
  conveyancing: Object.freeze({
    name: 'Conveyancing Working Group',
    scope: 'Legal due diligence, title, enquiries and property transaction processes.',
  }),
  'estate-agency': Object.freeze({
    name: 'Estate Agency Working Group',
    scope: 'Property marketing, instructions, offers and sales progression.',
  }),
  'surveying-and-valuation': Object.freeze({
    name: 'Surveying and Valuation Working Group',
    scope: 'Property condition, inspections, survey evidence and valuations.',
  }),
  'property-data-services': Object.freeze({
    name: 'Property Data Services Working Group',
    scope: 'Property datasets, searches, provenance and information services.',
  }),
  'property-technology': Object.freeze({
    name: 'Property Technology Working Group',
    scope: 'Property-sector products, platforms and integrations; separate from OPDA’s cross-cutting technology governance.',
  }),
});
export const APPROVAL_GROUP_IDS = Object.freeze(Object.keys(GROUPS));
const SHAREPOINT_HOST = 'openpropertydataassociation.sharepoint.com';
const TECHNOLOGY_TEAM_ID = '286b29b1-163d-4cb5-aaec-39b1c5ceef4b';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNSAFE_TEXT = /[<>\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/u;

function requireValue(condition, message) {
  if (!condition) throw new TypeError(`Invalid invitation: ${message}`);
}

function object(value, keys, label) {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)), `${label} must be a plain object`);
  requireValue(Object.keys(value).every((key) => keys.includes(key)), `${label} contains an unsupported field`);
  requireValue(Object.values(Object.getOwnPropertyDescriptors(value)).every((property) => !property.get && !property.set), `${label} cannot contain accessors`);
}

function displayName(value) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.length <= 256
    && !UNSAFE_TEXT.test(value) && !/[{}]/u.test(value), 'displayName must be safe, non-empty plain text');
  return value.trim();
}

function recipient(value) {
  requireValue(typeof value === 'string' && value.length <= 254
    && /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(value), 'email must be one bare email address');
  requireValue(value.split('@')[0].length <= 64 && value.split('@')[1].split('.').every((part) => part.length <= 63), 'email exceeds address limits');
  return value.toLowerCase();
}

function decodedPath(value) {
  let decoded = value;
  for (let index = 0; index < 4 && /%[0-9a-f]{2}/i.test(decoded); index += 1) {
    try { decoded = decodeURIComponent(decoded); } catch { throw new TypeError('Invalid invitation: malformed URL encoding'); }
  }
  requireValue(!/%[0-9a-f]{2}/i.test(decoded) && !UNSAFE_TEXT.test(decoded) && !/[\\{}]/u.test(decoded)
    && !decoded.split('/').some((part) => part === '.' || part === '..'), 'unsafe URL path');
  return decoded;
}

function httpsUrl(value, allowedHosts, label) {
  requireValue(typeof value === 'string' && value.length > 0 && value.length <= 8192
    && !/[\s\\<>"{}]/u.test(value) && !UNSAFE_TEXT.test(value)
    && !/%(?![0-9a-f]{2})/i.test(value), `${label} must be an encoded HTTPS URL`);
  // Check before URL parsing, which otherwise normalizes dot segments away.
  decodedPath(value.split(/[?#]/u)[0]);
  let url;
  try { url = new URL(value); } catch { throw new TypeError(`Invalid invitation: malformed ${label}`); }
  requireValue(url.protocol === 'https:' && allowedHosts.includes(url.hostname)
    && !url.username && !url.password && !url.port && !url.hash, `${label} is outside the allowed origin`);
  const keys = [...url.searchParams.keys()];
  requireValue(new Set(keys).size === keys.length, `${label} has duplicate query parameters`);
  for (const [key, item] of url.searchParams) {
    requireValue(!UNSAFE_TEXT.test(key + item) && !/[\\{}]/u.test(key + item), `${label} has unsafe query text`);
  }
  return url;
}

function workspace(value, groupId, tenantId) {
  object(value, ['teamId', 'teamUrl', 'sourceIntakeSiteUrl', 'status'], 'workspace');
  requireValue(value.status === undefined || ['implemented', 'provisioned'].includes(value.status), 'workspace is not provisioned');
  requireValue(typeof value.teamId === 'string' && UUID.test(value.teamId), 'workspace needs a Team ID');
  requireValue(value.teamId.toLowerCase() !== TECHNOLOGY_TEAM_ID, 'cross-cutting Technology is not a selected domain group');
  const team = httpsUrl(value.teamUrl, ['teams.microsoft.com', 'teams.cloud.microsoft'], 'Team URL');
  requireValue(/^\/l\/(?:team|channel)\/[^/]+\/[^/]+\/?$/u.test(team.pathname), 'Team URL is not a Team or channel resource');
  requireValue(team.searchParams.get('groupId')?.toLowerCase() === value.teamId.toLowerCase()
    && team.searchParams.get('tenantId')?.toLowerCase() === tenantId, 'Team URL does not match the registered resource');
  requireValue([...team.searchParams.keys()].every((key) => ['groupId', 'tenantId', 'allowXTenantAccess'].includes(key))
    && (!team.searchParams.has('allowXTenantAccess') || team.searchParams.get('allowXTenantAccess') === 'False'), 'unsupported Team URL query');
  let sitePath;
  if (value.sourceIntakeSiteUrl !== undefined) {
    const site = httpsUrl(value.sourceIntakeSiteUrl, [SHAREPOINT_HOST], 'source intake site');
    sitePath = decodedPath(site.pathname).replace(/\/$/u, '');
    requireValue(/^\/sites\/[a-z0-9_-]+$/i.test(sitePath) && !site.search, 'source intake site is not a registered site root');
    requireValue(!/^\/sites\/TechnologySourceIntake$/i.test(sitePath), 'cross-cutting Technology intake cannot serve a selected domain group');
  }
  return { ...GROUPS[groupId], teamId: value.teamId.toLowerCase(), teamUrl: value.teamUrl, sitePath };
}

function sourceFolder(value, sitePath) {
  requireValue(Boolean(sitePath), 'ready source access needs a registered intake site');
  const url = httpsUrl(value, [SHAREPOINT_HOST], 'company folder URL');
  const path = decodedPath(url.pathname).replace(/\/$/u, '');
  let folder = path;
  if (url.search) {
    requireValue(path === `${sitePath}/Incoming Source Material/Forms/AllItems.aspx`
      && [...url.searchParams.keys()].length === 1 && url.searchParams.has('id'), 'unsupported company folder view');
    folder = decodedPath(url.searchParams.get('id')).replace(/\/$/u, '');
  }
  const prefix = `${sitePath}/Incoming Source Material/By Organisation/`;
  requireValue(folder.startsWith(prefix), 'company folder is outside the registered private intake');
  const company = folder.slice(prefix.length);
  requireValue(company.length > 0 && company.length <= 255 && !/[/?#]/u.test(company)
    && company.trim() === company, 'company folder must identify one organisation, not an index or child item');
  return value;
}

function microsoftAccess(value) {
  object(value, ['redemptionRequired', 'redemptionUrl'], 'microsoft');
  requireValue(typeof value.redemptionRequired === 'boolean', 'redemptionRequired must be a boolean');
  if (!value.redemptionRequired) {
    requireValue(value.redemptionUrl === undefined, 'accepted Microsoft access must not carry a redemption URL');
    return { microsoft_redemption_required: false };
  }
  const url = httpsUrl(value.redemptionUrl, ['login.microsoftonline.com'], 'Microsoft redemption URL');
  requireValue(/^\/redeem\/?$/u.test(url.pathname), 'Microsoft URL is not a redemption endpoint');
  requireValue([...url.searchParams.keys()].every((key) => ['rd', 'tenant', 'ticket', 'ver'].includes(key)), 'unsupported Microsoft redemption query');
  requireValue(url.searchParams.has('rd') || url.searchParams.has('ticket'), 'Microsoft redemption URL is missing its invitation');
  if (url.searchParams.has('rd')) {
    const inner = httpsUrl(url.searchParams.get('rd'), ['invitations.microsoft.com'], 'Microsoft invitation target');
    requireValue(/^\/redeem\/?$/u.test(inner.pathname), 'Microsoft invitation target is not a redemption endpoint');
    requireValue([...inner.searchParams.keys()].every((key) => ['tenant', 'ticket', 'ver'].includes(key))
      && Boolean(inner.searchParams.get('ticket')), 'unsupported Microsoft invitation target query');
    if (inner.searchParams.has('tenant')) requireValue(inner.searchParams.get('tenant')?.toLowerCase() === OPDA_TENANT_ID, 'Microsoft invitation tenant mismatch');
  }
  if (url.searchParams.has('tenant')) requireValue(url.searchParams.get('tenant')?.toLowerCase() === OPDA_TENANT_ID, 'Microsoft redemption tenant mismatch');
  return { microsoft_redemption_required: true, microsoft_redemption_url: value.redemptionUrl };
}

/**
 * input: { displayName, email, microsoft: { redemptionRequired, redemptionUrl? },
 *   groups: [{ groupId, teamMembershipVerified: true,
 *     sourceAccess: { status: 'ready'|'teams_only', permissionsVerified: true, folderUrl? } }] }
 * registry: { tenantId, websiteLoginUrl, groups: { [id]:
 *   { teamId, teamUrl, sourceIntakeSiteUrl?, status?: 'implemented'|'provisioned' } } }
 * v1 (history): all groups in the historical review are supplied together.
 * v2: options.groupId requires exactly one independently approved domain. It is
 * never a filter that silently discards other groups supplied by a caller.
 * A generic email domain may have verified Teams-only access; a pending company
 * folder is NOT Teams-only success.
 */
export function buildInvitationModel(input, registry, options = {}) {
  object(input, ['displayName', 'email', 'microsoft', 'groups'], 'input');
  object(options, ['groupId'], 'model options');
  const contract = options.groupId === undefined ? undefined : domainTemplateContract(options.groupId);
  object(registry, ['tenantId', 'websiteLoginUrl', 'groups'], 'registry');
  requireValue(registry.tenantId === OPDA_TENANT_ID && registry.websiteLoginUrl === WEBSITE_LOGIN_URL, 'registry tenant or website login mismatch');
  object(registry.groups, Object.keys(registry.groups ?? {}), 'registry groups');
  const name = displayName(input.displayName);
  recipient(input.email);
  requireValue(Array.isArray(input.groups) && input.groups.length >= 1 && input.groups.length <= APPROVAL_GROUP_IDS.length, 'select one to six groups');
  requireValue(!contract || input.groups.length === 1 && input.groups[0]?.groupId === contract.groupId, 'domain invitation requires exactly its independently approved group');
  const selected = new Map();
  const teamIds = new Set();
  const sites = new Set();
  for (const group of input.groups) {
    object(group, ['groupId', 'teamMembershipVerified', 'sourceAccess'], 'group');
    requireValue(APPROVAL_GROUP_IDS.includes(group.groupId) && !selected.has(group.groupId), 'unknown or duplicate selected group');
    requireValue(group.teamMembershipVerified === true, 'Team membership is not verified');
    const registered = workspace(registry.groups[group.groupId], group.groupId, registry.tenantId);
    requireValue(!teamIds.has(registered.teamId) && (!registered.sitePath || !sites.has(registered.sitePath.toLowerCase())), 'selected groups cannot share a workspace');
    teamIds.add(registered.teamId);
    if (registered.sitePath) sites.add(registered.sitePath.toLowerCase());
    object(group.sourceAccess, ['status', 'permissionsVerified', 'folderUrl'], 'sourceAccess');
    const source = group.sourceAccess;
    requireValue(['ready', 'teams_only'].includes(source.status) && source.permissionsVerified === true, 'source access is pending or unverified');
    const ready = source.status === 'ready';
    requireValue(ready || source.folderUrl === undefined, 'Teams-only access cannot carry a company folder URL');
    selected.set(group.groupId, {
      group_id: group.groupId,
      group_name: registered.name,
      group_scope: registered.scope,
      team_url: registered.teamUrl,
      source_folder_ready: ready,
      teams_only: !ready,
      ...(ready ? { source_folder_url: sourceFolder(source.folderUrl, registered.sitePath) } : {}),
    });
  }
  return {
    display_name: name,
    website_login_url: WEBSITE_LOGIN_URL,
    ...microsoftAccess(input.microsoft),
    has_source_folders: [...selected.values()].some((group) => group.source_folder_ready),
    groups: APPROVAL_GROUP_IDS.filter((id) => selected.has(id)).map((id) => selected.get(id)),
    ...(contract ? selected.get(contract.groupId) : {}),
  };
}

/** Returns a Postmark template payload, not permission to send it. Never log it. */
export function buildInvitationPayload(input, registry, options) {
  object(options, ['logoBase64', 'groupId'], 'options');
  const model = buildInvitationModel(input, registry, { groupId: options.groupId });
  requireValue(typeof options.logoBase64 === 'string' && options.logoBase64.length <= 350_000
    && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(options.logoBase64), 'logo must be bounded base64 PNG content');
  const image = Buffer.from(options.logoBase64, 'base64');
  requireValue(image.length > 8 && image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'logo must be a PNG');
  return {
    From: 'Smart Property Data Trust Framework <smartdata@openpropdata.org.uk>',
    To: recipient(input.email),
    ReplyTo: 'smartdata@openpropdata.org.uk',
    TemplateAlias: options.groupId === undefined ? INVITATION_TEMPLATE_ALIAS : domainTemplateContract(options.groupId).alias,
    TemplateModel: model,
    InlineCss: true,
    MessageStream: 'broadcast',
    TrackLinks: 'None',
    TrackOpens: false,
    Attachments: [{ Name: 'opda-email-logo.png', Content: options.logoBase64, ContentType: 'image/png', ContentID: 'cid:opda-logo' }],
  };
}
