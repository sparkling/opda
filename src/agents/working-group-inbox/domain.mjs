const implementedWorkspace = ({
  teamId,
  siteUrl,
  template,
  teamUrl,
  contributorGroupPrefix,
  indexGroup,
}) => ({
  status: 'implemented',
  teamId,
  siteUrl,
  template,
  teamUrl,
  contributorGroupPrefix,
  indexGroup,
});

const plannedWorkspace = () => ({ status: 'planned' });

export const WORKING_GROUPS = Object.freeze([
  {
    id: 'finance-and-banking',
    name: 'Finance and Banking Working Group',
    aliases: ['finance', 'banking', 'mortgage', 'mortgages', 'lending'],
    workspace: implementedWorkspace({
      teamId: '5f9b7675-328a-44fd-8df7-4755096b7629',
      siteUrl: 'https://openpropertydataassociation.sharepoint.com/sites/FinanceBankingSourceIntake',
      template: 'docs/templates/finance-banking-working-group-invitation-email',
      teamUrl: 'https://teams.microsoft.com/l/team/19%3apMps7lqMA-_UlUiCD_IftTAS9dveF4u-U16YN_88jSo1%40thread.tacv2/conversations?groupId=5f9b7675-328a-44fd-8df7-4755096b7629&tenantId=143540d4-4fbc-4005-882a-29656cd01a36',
      contributorGroupPrefix: 'Finance and Banking Contributors - ',
      indexGroup: 'Finance and Banking Organisation Index Users',
    }),
  },
  { id: 'conveyancing', name: 'Conveyancing Working Group', aliases: ['conveyancing'], workspace: plannedWorkspace() },
  { id: 'estate-agency', name: 'Estate Agency Working Group', aliases: ['estate agency'], workspace: plannedWorkspace() },
  {
    id: 'surveying-and-valuation',
    name: 'Surveying and Valuation Working Group',
    aliases: ['surveying', 'valuation', 'surveying and valuation'],
    workspace: plannedWorkspace(),
  },
  {
    id: 'property-data-services',
    name: 'Property Data Services Working Group',
    aliases: ['property data services', 'searches'],
    workspace: plannedWorkspace(),
  },
  {
    id: 'property-technology',
    name: 'Property Technology Working Group',
    aliases: ['property technology', 'proptech'],
    workspace: plannedWorkspace(),
  },
  {
    id: 'dbt-smart-data',
    name: 'DBT Smart Data Working Group',
    aliases: ['dbt smart data', 'smart data scheme'],
    workspace: plannedWorkspace(),
  },
  {
    id: 'interoperability',
    name: 'Interoperability Working Group',
    aliases: ['interoperability', 'common modelling', 'common ontology'],
    workspace: plannedWorkspace(),
  },
  {
    id: 'technology',
    name: 'Technology Working Group',
    aliases: ['technology working group', 'technical working group', 'technical assurance'],
    workspace: implementedWorkspace({
      teamId: '286b29b1-163d-4cb5-aaec-39b1c5ceef4b',
      siteUrl: 'https://openpropertydataassociation.sharepoint.com/sites/TechnologySourceIntake',
      template: 'docs/templates/technology-working-group-invitation-email',
      teamUrl: 'https://teams.microsoft.com/l/team/19%3AEhhhmMLawK4BKudHWidPdMyWweicWuJtspGc7SZEZCE1%40thread.tacv2/conversations?groupId=286b29b1-163d-4cb5-aaec-39b1c5ceef4b&tenantId=143540d4-4fbc-4005-882a-29656cd01a36',
      contributorGroupPrefix: 'Technology Contributors - ',
      indexGroup: 'Technology Organisation Index Users',
    }),
  },
]);

const GROUP_BY_ID = new Map(WORKING_GROUPS.map((group) => [group.id, group]));
const GROUP_ORDER = new Map(WORKING_GROUPS.map((group, index) => [group.id, index]));

export const GENERIC_EMAIL_DOMAINS = new Set([
  'aol.com',
  'btinternet.com',
  'gmail.com',
  'googlemail.com',
  'hotmail.co.uk',
  'hotmail.com',
  'icloud.com',
  'live.co.uk',
  'live.com',
  'mail.com',
  'me.com',
  'msn.com',
  'outlook.co.uk',
  'outlook.com',
  'proton.me',
  'protonmail.com',
  'yahoo.co.uk',
  'yahoo.com',
]);

const DOMAIN_ALIASES = new Map([['leekunited.co.uk', 'leekbs.co.uk']]);
const MAX_RESOURCE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set([
  '.csv', '.tsv', '.xls', '.xlsx', '.ods',
  '.json', '.jsonld', '.yaml', '.yml', '.xml', '.xsd',
  '.ttl', '.rdf', '.owl', '.nt', '.nq', '.trig',
  '.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt', '.md', '.html',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.drawio', '.vsdx',
  '.sql', '.ddl', '.graphql', '.proto',
]);
const REJECTED_EXTENSIONS = new Set([
  '.7z', '.app', '.bat', '.cmd', '.com', '.dmg', '.exe', '.gz', '.iso', '.jar',
  '.js', '.jsm', '.m4a', '.m4v', '.mov', '.mp3', '.mp4', '.msi', '.ps1', '.rar',
  '.sh', '.tar', '.vba', '.wav', '.webm', '.wma', '.wmv', '.xlsm', '.zip',
]);

function nonEmptyString(value, label, maximum = 500) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  if (value.length > maximum) throw new Error(`${label} is too long`);
  if (/\p{Cc}/u.test(value)) throw new Error(`${label} contains control characters`);
  return value.trim();
}

export function normalizeEmail(value) {
  const email = nonEmptyString(value, 'email', 320).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error(`Invalid email address: ${email}`);
  return email;
}

export function classifyEmailDomain(value) {
  const email = normalizeEmail(value);
  const rawDomain = email.slice(email.lastIndexOf('@') + 1);
  const domain = DOMAIN_ALIASES.get(rawDomain) ?? rawDomain;
  if (GENERIC_EMAIL_DOMAINS.has(domain)) {
    return { email, domain, sharePointEligible: false, reason: 'generic-email-provider' };
  }
  return { email, domain, sharePointEligible: true, reason: 'approved-company-domain-candidate' };
}

function canonicalGroupIds(values = []) {
  const source = Array.isArray(values) ? values : [];
  const normalized = source.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
  const unknown = normalized.filter((id) => !GROUP_BY_ID.has(id));
  if (unknown.length) return { ids: [], unknown };
  const ids = [...new Set(normalized)].sort((left, right) => GROUP_ORDER.get(left) - GROUP_ORDER.get(right));
  return { ids, unknown: [] };
}

export function resolveWorkingGroups({
  explicitGroupIds = [],
  threadGroupIds = [],
  requesterGroupIds = [],
} = {}) {
  const explicit = canonicalGroupIds(explicitGroupIds);
  if (explicit.unknown.length) {
    return { status: 'clarification', reason: 'unknown-explicit-group', options: WORKING_GROUPS.map(({ id }) => id) };
  }
  if (explicit.ids.length) return { status: 'resolved', groupIds: explicit.ids, source: 'explicit' };

  const thread = canonicalGroupIds(threadGroupIds);
  if (thread.unknown.length || thread.ids.length > 1) {
    return { status: 'clarification', reason: 'ambiguous-thread', options: WORKING_GROUPS.map(({ id }) => id) };
  }
  if (thread.ids.length === 1) return { status: 'resolved', groupIds: thread.ids, source: 'thread' };

  const requester = canonicalGroupIds(requesterGroupIds);
  if (!requester.unknown.length && requester.ids.length === 1) {
    return { status: 'resolved', groupIds: requester.ids, source: 'requester-membership' };
  }
  return { status: 'clarification', reason: 'ambiguous-or-missing', options: WORKING_GROUPS.map(({ id }) => id) };
}

export function classifyResource({ name, sizeBytes }) {
  const safeName = nonEmptyString(name, 'resource name', 255);
  const baseName = safeName.replaceAll('\\', '/').split('/').at(-1);
  const dot = baseName.lastIndexOf('.');
  const extension = dot === -1 ? '' : baseName.slice(dot).toLowerCase();
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0) throw new Error('resource size must be a non-negative integer');
  if (sizeBytes > MAX_RESOURCE_BYTES) return { status: 'manual-review', reason: 'over-50-mib', name: baseName };
  if (REJECTED_EXTENSIONS.has(extension)) return { status: 'rejected', reason: 'unsafe-or-unsupported-type', name: baseName };
  if (!ACCEPTED_EXTENSIONS.has(extension)) return { status: 'manual-review', reason: 'unknown-type', name: baseName };
  return { status: 'accepted', reason: 'allowlisted-type', name: baseName };
}

function rejectUnknownFields(plan, allowed) {
  const unknown = Object.keys(plan).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`Action plan contains unknown field(s): ${unknown.join(', ')}`);
}

function validateExecutableGroups(groupIds) {
  const canonical = canonicalGroupIds(groupIds);
  if (canonical.unknown.length || !canonical.ids.length) throw new Error('Action plan has an invalid working group');
  for (const id of canonical.ids) {
    if (GROUP_BY_ID.get(id).workspace.status !== 'implemented') {
      throw new Error(`${GROUP_BY_ID.get(id).name} is not implemented and requires manual review`);
    }
  }
}

export function validateActionPlan(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) throw new Error('Action plan must be an object');
  const common = new Set(['version', 'sourceMessageId', 'action', 'groupIds', 'requesterEmail']);
  if (plan.version !== 1) throw new Error('Action plan version must be 1');
  nonEmptyString(plan.sourceMessageId, 'sourceMessageId', 512);
  normalizeEmail(plan.requesterEmail);

  if (plan.action === 'add-participant') {
    rejectUnknownFields(plan, new Set([...common, 'participants']));
    validateExecutableGroups(plan.groupIds);
    if (!Array.isArray(plan.participants) || !plan.participants.length) throw new Error('participants are required');
    if (plan.participants.length > 10) throw new Error('add-participant accepts at most 10 people per message');
    for (const participant of plan.participants) {
      rejectUnknownFields(participant, new Set(['displayName', 'email']));
      nonEmptyString(participant.displayName, 'participant displayName', 160);
      normalizeEmail(participant.email);
    }
    return plan;
  }

  if (plan.action === 'store-resources') {
    rejectUnknownFields(plan, new Set([...common, 'resources']));
    validateExecutableGroups(plan.groupIds);
    if (!Array.isArray(plan.resources) || !plan.resources.length) throw new Error('resources are required');
    if (plan.resources.length > 25) throw new Error('store-resources accepts at most 25 resources per message');
    for (const resource of plan.resources) {
      rejectUnknownFields(resource, new Set(['name', 'sizeBytes']));
      if (classifyResource(resource).status !== 'accepted') throw new Error(`Resource is not safe for automatic intake: ${resource.name}`);
    }
    return plan;
  }

  throw new Error(`Unsupported action: ${String(plan.action)}`);
}

function greeting(name) {
  return `Hello ${nonEmptyString(name, 'recipient name', 160)},`;
}

export const AI_RESPONSE_NOTICE = 'This is an automated response generated by OPDA’s AI inbox agent.';

function responseSignature() {
  return `${AI_RESPONSE_NOTICE}\n\nKind regards,\nSmart Property Data Trust Framework`;
}

export function renderClarification(name) {
  const options = WORKING_GROUPS.map(({ name: groupName }) => `- ${groupName}`).join('\n');
  return `${greeting(name)}\n\nThanks for the request. Before I add the user, please confirm which working group or groups they should join:\n\n${options}\n\n${responseSignature()}`;
}

export function renderAccessGuidance(name) {
  return `${greeting(name)}\n\nI’m sorry you are having trouble accessing Teams or SharePoint. If your organisation's security policy permits it, you can try a personal email address or personal device for Teams participation. Please do not bypass your organisation's security controls.\n\nTeams gives you access to working-group discussions, organised reply threads, updates, and review of model drafts. If SharePoint remains unavailable, you can send authorised source material to this email address as attachments and OPDA will place it in the correct organisation folder.\n\nSharePoint uploads still require an approved company-domain account; this does not prevent an invited personal account from participating in Teams.\n\n${responseSignature()}`;
}

export function renderMembershipConfirmation(name, groupNames) {
  const groups = groupNames.map((groupName) => `- ${nonEmptyString(groupName, 'working-group name', 160)}`).join('\n');
  return `${greeting(name)}\n\nThe requested user has been added and their invitation email has been sent for:\n\n${groups}\n\n${responseSignature()}`;
}

export function renderSubmissionConfirmation(name, resourceNames) {
  const resources = resourceNames.map((resourceName) => `- ${nonEmptyString(resourceName, 'resource name', 255)}`).join('\n');
  return `${greeting(name)}\n\nThank you. The following resource${resourceNames.length === 1 ? ' has' : 's have'} been added to your organisation's SharePoint folder:\n\n${resources}\n\nYou can send further authorised material to this email address as attachments if SharePoint is unavailable.\n\n${responseSignature()}`;
}
