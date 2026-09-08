// ADR-0084: an offline schema contract, not a provisioner or an access-control source.
// Keep the versioned choices self-contained for a future isolated Lambda package.
// Tests compare their IDs with the public intake contract.
export const OPTION_SET_VERSION = 1;
export const PARTICIPATION_GROUP = Object.freeze({
  name: 'opda_participation', label: 'OPDA participation', displayOrder: -1,
});

const choices = (entries) => entries.map(([value, label], displayOrder) => ({
  value, label, displayOrder, hidden: false,
}));
function freeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child);
  return Object.freeze(value);
}

export const PARTICIPATION_PROPERTIES = freeze([
  {
    name: 'opda_full_name', label: 'Full name', type: 'string', fieldType: 'text',
    description: 'Complete applicant name, without an inferred first-name/last-name split.',
  },
  {
    name: 'opda_role_or_expertise', label: 'Role or area of expertise', type: 'string', fieldType: 'text',
    description: 'Professional role or expertise supplied on the join form. Not an application permission.',
  },
  {
    name: 'opda_requested_working_groups', label: 'Requested working groups', type: 'enumeration', fieldType: 'checkbox',
    description: 'Requested interests, not approved membership or Microsoft Teams access.',
    options: choices([
      ['finance-and-banking', 'Finance and Banking'], ['conveyancing', 'Conveyancing'],
      ['estate-agency', 'Estate Agency'], ['surveying-and-valuation', 'Surveying and Valuation'],
      ['property-data-services', 'Property Data Services'], ['property-technology', 'Property Technology'],
    ]),
  },
  {
    name: 'opda_contribution_preferences', label: 'Contribution preferences', type: 'enumeration', fieldType: 'checkbox',
    description: 'Ways the applicant would like to contribute, preserving the join form choices.',
    options: choices([
      ['share-source-material', 'Share authorised source material'],
      ['explain-domain-language-and-rules', 'Explain domain language and rules'],
      ['review-model-candidates', 'Review draft definitions and proposals'],
      ['test-schemas-and-integrations', 'Test practical outputs'],
      ['represent-commercial-interests', 'Represent commercial interests'],
      ['represent-public-interests', 'Represent public interests'],
    ]),
  },
  {
    name: 'opda_relevant_perspective', label: 'Relevant perspective', type: 'string', fieldType: 'textarea',
    description: 'Optional professional perspective, limited to 600 characters by the intake and bridge.',
  },
  {
    name: 'opda_review_status', label: 'Application review status', type: 'enumeration', fieldType: 'select',
    description: 'AWS-owned review snapshot. Editing this CRM property never approves website access.',
    options: choices([
      ['received', 'Received'], ['under_review', 'Under review'], ['approved', 'Approved'],
      ['rejected', 'Rejected'], ['withdrawn', 'Withdrawn'],
    ]),
  },
  {
    name: 'opda_enrolment_status', label: 'Account enrolment status', type: 'enumeration', fieldType: 'select',
    description: 'AWS-owned enrolment snapshot. Editing this CRM property never completes enrolment.',
    options: choices([
      ['not_invited', 'Not invited'], ['invited', 'Invited'], ['complete', 'Complete'], ['expired', 'Expired'],
    ]),
  },
  {
    name: 'opda_active', label: 'Website account active', type: 'bool', fieldType: 'booleancheckbox',
    description: 'AWS-owned enabled-state snapshot, initially false. Not sufficient for login or a command to grant access.',
    options: choices([['true', 'Yes'], ['false', 'No']]),
  },
].map((property) => ({ ...property, groupName: PARTICIPATION_GROUP.name })));

const STANDARD_PROPERTIES = [
  { name: 'email', type: 'string', fieldType: 'text' },
  { name: 'company', type: 'string', fieldType: 'text' },
];
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function compatible(actual, expected) {
  if (actual.archived || actual.calculated || actual.modificationMetadata?.readOnlyValue) return false;
  if (expected.groupName && actual.hasUniqueValue) return false;
  if (actual.type !== expected.type || actual.fieldType !== expected.fieldType) return false;
  if (expected.groupName && actual.groupName !== expected.groupName) return false;
  if (!expected.options) return true;
  if (actual.externalOptions) return false;
  if (!Array.isArray(actual.options) || actual.options.length !== expected.options.length) return false;
  const byValue = new Map(actual.options.filter(object).map((option) => [option.value, option]));
  if (byValue.size !== expected.options.length) return false;
  return expected.options.every((option) => {
    const found = byValue.get(option.value);
    return found && found.label === option.label && !found.hidden;
  });
}

/**
 * Read-only assessment of a complete active AND archived contact-property inventory.
 * The caller must verify portal capacity, not infer a limit from a plan name or
 * visible custom fields. No API calls, property updates, deletions or purchases.
 * `ready` covers property compatibility/capacity only, not deployment readiness;
 * a separately authorised provisioner must also ensure the property group exists.
 * @param {{inventory?: {complete: boolean, properties: object[]}, remainingCustomPropertySlots?: number}} options
 */
export function assessContactPropertySchema({ inventory, remainingCustomPropertySlots } = {}) {
  const blockers = [];
  const block = (code, property) => blockers.push({ code, ...(property ? { property } : {}) });
  const finish = (missing = []) => ({
    ready: blockers.length === 0, blockers,
    missingProperties: missing.map((property) => property.name),
    propertiesToCreate: blockers.length ? [] : structuredClone(missing),
  });
  if (!object(inventory) || inventory.complete !== true || !Array.isArray(inventory.properties)) {
    block('complete-property-inventory-required');
    return finish();
  }
  const properties = new Map();
  for (const property of inventory.properties) {
    if (!object(property) || typeof property.name !== 'string' || !/^[a-z][a-z0-9_]*$/.test(property.name)) {
      block('invalid-property-inventory');
      continue;
    }
    if (properties.has(property.name)) block('duplicate-property-name', property.name);
    properties.set(property.name, property);
  }
  for (const expected of STANDARD_PROPERTIES) {
    const actual = properties.get(expected.name);
    if (!actual) block('missing-standard-property', expected.name);
    else if (!compatible(actual, expected)) block('incompatible-standard-property', expected.name);
  }
  const missing = [];
  for (const expected of PARTICIPATION_PROPERTIES) {
    const actual = properties.get(expected.name);
    if (!actual) missing.push(expected);
    else if (!compatible(actual, expected)) block('incompatible-participation-property', expected.name);
  }
  if (missing.length) {
    if (!Number.isSafeInteger(remainingCustomPropertySlots) || remainingCustomPropertySlots < 0) {
      block('verified-property-capacity-required');
    } else if (remainingCustomPropertySlots < missing.length) block('insufficient-property-capacity');
  }
  return finish(missing);
}
