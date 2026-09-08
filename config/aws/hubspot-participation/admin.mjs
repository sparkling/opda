// Operator-only schema setup; never called by the anonymous intake or login.
import { PARTICIPATION_GROUP, assessContactPropertySchema } from './properties.mjs';

// Only explicitly authored, non-sensitive messages may reach the operator log.
export class HubSpotAdminError extends Error {}

export const APP_SCOPES = Object.freeze({
  // HubSpot's token-info response includes its implicit OAuth transport scope.
  bridge: Object.freeze(['oauth', 'crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.schemas.contacts.read']),
  bootstrap: Object.freeze(['oauth', 'crm.schemas.contacts.read', 'crm.schemas.contacts.write']),
});

export async function verifyPrivateApp(api, expected) {
  const info = await api('/oauth/v2/private-apps/get/access-token-info');
  if (info.hubId !== expected.portalId || info.appId !== expected.appId
    || !Array.isArray(info.scopes)
    || JSON.stringify([...info.scopes].sort()) !== JSON.stringify([...expected.scopes].sort())) {
    throw new HubSpotAdminError('Private app identity or scopes do not match expected configuration');
  }
  return { portalId: info.hubId, appId: info.appId, scopes: [...info.scopes].sort() };
}

function completeResults(response) {
  if (!Array.isArray(response?.results) || response.paging?.next) {
    throw new HubSpotAdminError('HubSpot did not return a complete inventory');
  }
  return response.results;
}

function remainingCapacity(limits) {
  const contacts = limits?.byObjectType?.filter(({ objectTypeId }) => objectTypeId === '0-1');
  if (contacts?.length !== 1) return undefined;
  const values = [limits.overallLimit, limits.overallUsage, contacts[0].limit, contacts[0].usage];
  if (!values.every((value) => Number.isSafeInteger(value) && value >= 0)) return undefined;
  return Math.max(0, Math.min(values[0] - values[1], values[2] - values[3]));
}

export async function readSchemaPreflight(api, limitsApi = api) {
  const [active, archived, groupResponse, limits] = await Promise.all([
    api('/crm/v3/properties/contacts?archived=false'),
    api('/crm/v3/properties/contacts?archived=true'),
    api('/crm/v3/properties/contacts/groups'),
    limitsApi('/crm/v3/limits/custom-properties').catch(() => null),
  ]);
  const properties = [...completeResults(active), ...completeResults(archived)];
  const groups = completeResults(groupResponse);
  const remainingCustomPropertySlots = remainingCapacity(limits);
  const result = assessContactPropertySchema({
    inventory: { complete: true, properties }, remainingCustomPropertySlots,
  });
  const existingGroup = groups.find(({ name }) => name === PARTICIPATION_GROUP.name);
  if (existingGroup && existingGroup.label !== PARTICIPATION_GROUP.label) {
    result.ready = false;
    result.propertiesToCreate = [];
    result.blockers.push({ code: 'incompatible-participation-group' });
  }
  return {
    ...result, remainingCustomPropertySlots, limits,
    activePropertyCount: active.results.length, archivedPropertyCount: archived.results.length,
    // HubSpot omits hubspotDefined on custom fields instead of returning false.
    customProperties: properties.filter(({ hubspotDefined }) => hubspotDefined !== true)
      .map(({ name, label, type, fieldType, archived }) => ({ name, label, type, fieldType, archived })),
    groupExists: Boolean(existingGroup),
  };
}

export async function createMissingProperties(api, limitsApi = api) {
  const before = await readSchemaPreflight(api, limitsApi);
  if (!before.ready) throw new HubSpotAdminError('HubSpot schema preflight blocked; no definitions changed');
  // No updates, deletes, restores, contact writes, consent changes or access grants.
  if (!before.groupExists) {
    await api('/crm/v3/properties/contacts/groups', { method: 'POST', body: PARTICIPATION_GROUP });
  }
  const createdProperties = [];
  for (const property of before.propertiesToCreate) {
    // Deliberately no blind retries: a timeout may have created the property.
    await api('/crm/v3/properties/contacts', { method: 'POST', body: property });
    createdProperties.push(property.name);
  }
  const after = await readSchemaPreflight(api, limitsApi);
  if (!after.ready || after.missingProperties.length || !after.groupExists) {
    throw new HubSpotAdminError('Schema creation could not be verified; rerun read-only preflight');
  }
  return { createdProperties, verified: true, remainingCustomPropertySlots: after.remainingCustomPropertySlots };
}
