/**
 * Reviewed v2 invitations: one original-layout email per independently approved domain.
 * This module is pure. Provisioning supplies the shared HTML/text shells; runtime uses
 * only the finite contracts and content pins. It neither reads files nor calls Postmark.
 */
const DOMAINS = Object.freeze({
  'finance-and-banking': {
    name: 'Finance and Banking',
    focus: 'Your experience can help distinguish what a mortgage adviser needs to prepare an application, what a lender needs to make a decision, and what the systems between them must exchange. Help us preserve those differences while making finance information easier to understand and reuse.',
    examples: 'For this domain, useful starting points include blank mortgage fact-finds and application forms, lending criteria, affordability and underwriting guidance, valuation instructions, mortgage-status definitions and non-production interface specifications. Explain the terms, decisions and exceptions behind them; do not submit customer files or live applications.',
    topics: [
      ['Announcements', 'Official notices; read-only for participants.', '19:8cc5e0e244a046fb9a737d9a041489bc@thread.tacv2', 'Announcements'],
      ['Common Topics and Coordination', 'Cross-cutting questions, coordination and whole-model review.', '19:pMps7lqMA-_UlUiCD_IftTAS9dveF4u-U16YN_88jSo1@thread.tacv2', 'OPDA Finance and Banking Working Group'],
      ['Mortgage Advice and Intermediation', 'Advice, broking, suitability, sourcing, consent and application preparation.', '19:36b776fb0cef4495be41c4522cb0d690@thread.tacv2', 'Mortgage Advice and Intermediation'],
      ['Mortgage Lending and Underwriting', 'Eligibility, affordability, underwriting, valuations, offers and lender decisions.', '19:db284555211e45909c5a2ba94676c98e@thread.tacv2', 'Mortgage Lending and Underwriting'],
      ['Mortgage Systems and Integration', 'Platforms, sourcing, APIs, schemas, status exchange and integration.', '19:616c9bc759b447bebe365a0983cfb9cd@thread.tacv2', 'Mortgage Systems and Integration'],
    ],
  },
  conveyancing: {
    name: 'Conveyancing',
    focus: 'Your experience can help distinguish the property, its legal title, the parties to a transaction and the evidence used in legal due diligence. Help us explain enquiries, obligations and transaction milestones without losing qualifications or treating every transaction as the same case.',
    examples: 'For this domain, useful starting points include blank property-information and enquiry forms, title-checking guidance, search-result structures, transaction checklists, completion requirements and definitions of legal process statuses. Explain jurisdiction, scope and exceptions. Do not submit client files, live title documents or confidential correspondence.',
    topics: [
      ['Title, rights and obligations', 'The legal interests being described, the parties involved, and the qualifications that matter when interpreting them.'],
      ['Enquiries, searches and evidence', 'What a question asks, which evidence can answer it, where it came from and what remains unresolved.'],
      ['Transaction steps and handovers', 'Instructions, due diligence, exchange and completion: the information and definitions needed at each handover.'],
    ],
  },
  'estate-agency': {
    name: 'Estate Agency',
    focus: 'Your experience can help distinguish a property from a listing, an instruction from an offer, and an agreed description from an unverified claim. Help us make marketing and sales-progression information clear enough to move between professionals without losing its meaning.',
    examples: 'For this domain, useful starting points include blank instruction and listing forms, material-information checklists, property-description guidance, offer and sales-progression status definitions, and non-production CRM field lists. Explain who supplies each fact and how it is checked. Do not submit seller, buyer or live listing records.',
    topics: [
      ['Instructions and property descriptions', 'The property being marketed, the instruction to act, and the information needed to describe it accurately.'],
      ['Marketing and material information', 'The source, meaning and qualification of listing information, including gaps and facts that still need checking.'],
      ['Offers and sales progression', 'Offers, agreed milestones and professional handovers, preserving the distinction between an event, a status and supporting evidence.'],
    ],
  },
  'surveying-and-valuation': {
    name: 'Surveying and Valuation',
    focus: 'Your experience can help distinguish the subject of an inspection, what was observed, what could not be inspected and the professional opinion that follows. Help us preserve purpose, measurement basis, date, assumptions and limitations so that a survey or valuation is not reduced to an unexplained number.',
    examples: 'For this domain, useful starting points include blank inspection and valuation forms, report structures, measurement guidance, condition-rating definitions, scope-of-service descriptions and lists of assumptions or limitations. Explain the basis and intended use of each result. Do not submit client reports, photographs from live inspections or identifiable property case files.',
    topics: [
      ['Inspection scope and observations', 'What was inspected, when and for which purpose, including access restrictions, observations and missing evidence.'],
      ['Condition and professional judgement', 'How findings, condition ratings and recommendations relate to evidence, assumptions and the professional service being provided.'],
      ['Measurement and valuation basis', 'Units, measurement boundaries, valuation purpose, effective date and qualifications needed to interpret a result.'],
    ],
  },
  'property-data-services': {
    name: 'Property Data Services',
    focus: 'Your experience can help distinguish a source dataset from a search product, a matching identifier from proof of identity, and a supplied result from the evidence behind it. Help us describe coverage, provenance, freshness and limitations so that downstream users know what information does and does not establish.',
    examples: 'For this domain, useful starting points include data dictionaries, search-product definitions, coverage and update documentation, licence guidance, provenance fields, and non-production schemas or API specifications. Explain how records are sourced, matched and qualified. Do not submit licensed datasets without permission or live customer search results.',
    topics: [
      ['Sources, provenance and coverage', 'Where information originates, what geographical or subject coverage it has, and how its date and update cycle affect interpretation.'],
      ['Identifiers and matching', 'How a result is associated with a property or record, including uncertain matches and identifiers that serve different purposes.'],
      ['Search products and data exchange', 'The question a product answers, the meaning of its results, and the restrictions or qualifications that should travel with them.'],
    ],
  },
  'property-technology': {
    name: 'Property Technology',
    focus: 'Your experience can help explain how property-sector products represent instructions, records, events and handovers, and where meaning is lost between platforms. This is the Property Technology domain working group, not OPDA’s separate cross-cutting technology-governance group. The focus is the domain information your products use and exchange.',
    examples: 'For this domain, useful starting points include non-production product data models, field dictionaries, integration specifications, event and status definitions, blank workflow forms and examples of mapping problems. Explain the business meaning behind the fields. Do not submit production databases, customer records, source-code secrets or access credentials.',
    topics: [
      ['Product concepts and data structures', 'What products mean by a property, instruction, transaction or participant, and which distinctions a field or record must preserve.'],
      ['Integrations, events and status exchange', 'Information exchanged between products, the events it describes, and the assumptions or translations made at each interface.'],
      ['Practical use of model outputs', 'How domain definitions can support familiar schemas, forms and interfaces, and where real product experience should challenge a draft.'],
    ],
  },
});

export const DOMAIN_TEMPLATE_CONTRACTS = Object.freeze(Object.fromEntries(Object.entries(DOMAINS).map(([groupId, domain]) => [groupId, Object.freeze({
  version: 2,
  groupId,
  groupName: `${domain.name} Working Group`,
  alias: `${groupId}-approval-invitation-v2`,
  subject: `Your invitation to the ${domain.name} Working Group`,
})])));

export function domainTemplateContract(groupId) {
  if (typeof groupId !== 'string' || !Object.hasOwn(DOMAIN_TEMPLATE_CONTRACTS, groupId)) {
    throw new TypeError('Invalid invitation: unknown domain template');
  }
  return DOMAIN_TEMPLATE_CONTRACTS[groupId];
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CHANNEL_TENANT = '143540d4-4fbc-4005-882a-29656cd01a36';
const FINANCE_TEAM = '5f9b7675-328a-44fd-8df7-4755096b7629';

// These are the channel resources recorded in the original Finance invitation.
// Other domains deliberately describe topics, not unverified channel names or IDs.
function financeChannelUrl(topic) {
  return `https://teams.cloud.microsoft/l/channel/${encodeURIComponent(topic[2])}/${encodeURIComponent(topic[3])}?groupId=${FINANCE_TEAM}&tenantId=${CHANNEL_TENANT}&allowXTenantAccess=False`;
}

function discussionRows(domain, html) {
  return domain.topics.map((topic, index) => {
    const [title, detail] = topic;
    const url = topic[2] ? financeChannelUrl(topic) : undefined;
    if (!html) return `${title}: ${detail}${url ? `\n${url}` : ''}`;
    const border = index < domain.topics.length - 1 ? 'border-bottom:1px solid #e6dfd0;' : '';
    const label = url ? `<a href="${escapeHtml(url)}" style="color:#a9583e;text-decoration:underline;">${escapeHtml(title)}</a>` : escapeHtml(title);
    return `<tr><td style="padding:10px 12px 10px 0;${border}font-weight:700;color:#141413;width:42%;">${label}</td><td style="padding:10px 0;${border}color:#3d3d3a;">${escapeHtml(detail)}</td></tr>`;
  }).join(html ? '\n                ' : '\n\n');
}

/** Compile six independently publishable Standard templates from one reviewed layout. */
export function compileDomainInvitationTemplate(groupId, shells) {
  const contract = domainTemplateContract(groupId);
  if (!shells || typeof shells !== 'object' || Array.isArray(shells)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(shells))
    || Object.keys(shells).some(key => !['HtmlBody', 'TextBody'].includes(key))
    || Object.values(Object.getOwnPropertyDescriptors(shells)).some(item => item.get || item.set)) {
    throw new TypeError('Invalid invitation: HTML and text shells required');
  }
  const domain = DOMAINS[groupId];
  const finance = groupId === 'finance-and-banking';
  const slots = {
    SUBJECT: contract.subject,
    ALIAS: contract.alias,
    GROUP_NAME: contract.groupName,
    DOMAIN_NAME: domain.name,
    GROUP_FOCUS: domain.focus,
    SOURCE_EXAMPLES: domain.examples,
    DISCUSSION_LEAD: finance
      ? 'Use the channels below for the Finance and Banking working group.'
      : 'Open this working group in Teams and choose the most relevant existing conversation. The topics below are examples for discussion, not a list of channel names.',
    DISCUSSION_NOTE: finance
      ? 'Use the most specific channel that fits. Use Common Topics and Coordination when a subject crosses boundaries or concerns the working group as a whole.'
      : 'Check for an existing thread before starting a new subject. Explain the practical situation, the meaning that needs clarifying and any evidence or exceptions that should inform the model.',
  };
  const compile = (body, html) => {
    if (typeof body !== 'string' || body.length === 0 || body.length > 500_000
      || !body.includes('pm:unsubscribe') || !body.includes('[[GROUP_NAME]]')
      || !body.includes('[[DISCUSSION_ROWS]]') || !body.includes('[[GROUP_FOCUS]]')
      || !body.includes('[[SOURCE_EXAMPLES]]') || html && !body.includes('cid:opda-logo')) {
      throw new TypeError('Invalid invitation: incomplete original-layout shell');
    }
    return body.replace(/\[\[([A-Z_]+)\]\]/g, (_, key) => {
      if (key === 'DISCUSSION_ROWS') return discussionRows(domain, html);
      if (!Object.hasOwn(slots, key)) throw new TypeError('Invalid invitation: unreviewed template slot');
      return html ? escapeHtml(slots[key]) : slots[key];
    });
  };
  return Object.freeze({
    Name: `${contract.groupName} Approval Invitation v2`,
    Alias: contract.alias,
    Subject: contract.subject,
    HtmlBody: compile(shells.HtmlBody, true),
    TextBody: compile(shells.TextBody, false),
    TemplateType: 'Standard',
    LayoutTemplate: null,
  });
}
