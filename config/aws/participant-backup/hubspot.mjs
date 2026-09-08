// Pinned v3 read APIs. CRM values are backup data, never application access decisions.
export const CONTACT_PROPERTIES = Object.freeze([
  'email', 'firstname', 'lastname', 'company', 'jobtitle', 'linkedin_account',
  'membership_type', 'relationship_type', 'opda_full_name', 'opda_role_or_expertise',
  'opda_requested_working_groups', 'opda_contribution_preferences', 'opda_relevant_perspective',
  'opda_review_status', 'opda_enrolment_status', 'opda_active',
]);
// Kept standalone for this Lambda package; a contract test compares the schema-admin scope set.
export const BRIDGE_SCOPES = Object.freeze([
  'oauth', 'crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.schemas.contacts.read',
]);
const fail = () => { throw new Error('Scoped CRM snapshot incomplete'); };
function completeBatch(response, expected, identifier) {
  if (response?.status !== 'COMPLETE' || !Array.isArray(response.results)
    || response.results.length !== expected.length || response.errors?.length
    || response.numErrors > 0 || response.paging?.next) fail();
  const expectedSet = new Set(expected), seen = new Set();
  for (const record of response.results) {
    const id = record?.[identifier];
    if (!expectedSet.has(id) || seen.has(id) || record.archived) fail();
    seen.add(id);
  }
  return response.results;
}

export async function snapshotContacts({ ids, portalId, prefix, api, put, now }) {
  if (!Array.isArray(ids) || ids.length > 10000 || new Set(ids).size !== ids.length
    || ids.some(id => typeof id !== 'string' || !/^[1-9][0-9]*$/.test(id))) fail();
  const startedAt = now().toISOString(), objects = [];
  const schemaResponse = await api('/crm/v3/properties/contacts/batch/read', {
    method: 'POST', body: { archived: false, inputs: CONTACT_PROPERTIES.map(name => ({ name })) },
  });
  const definitions = completeBatch(schemaResponse, CONTACT_PROPERTIES, 'name');
  objects.push(await put(`${prefix}/properties.json`, { definitions }));
  for (let offset = 0; offset < ids.length; offset += 100) {
    const batch = ids.slice(offset, offset + 100);
    const response = await api('/crm/v3/objects/contacts/batch/read', {
      method: 'POST', body: { properties: CONTACT_PROPERTIES, propertiesWithHistory: [], inputs: batch.map(id => ({ id })) },
    });
    const records = completeBatch(response, batch, 'id').map(record => {
      if (!Number.isFinite(Date.parse(record.createdAt)) || !Number.isFinite(Date.parse(record.updatedAt))) fail();
      const properties = {};
      for (const name of CONTACT_PROPERTIES) {
        const value = record.properties?.[name];
        if (value != null && typeof value !== 'string') fail();
        properties[name] = value ?? null;
      }
      return { id: record.id, createdAt: record.createdAt, updatedAt: record.updatedAt, archived: false, properties };
    });
    objects.push(await put(`${prefix}/contacts-${String(offset / 100).padStart(4, '0')}.json`, { records }));
  }
  return { scope: 'mapped-contact-profiles-and-property-definitions', apiVersion: 'v3', portalId,
    atomic: false, mappingSource: 'participant-native-PITR-export', startedAt,
    completedAt: now().toISOString(), contactCount: ids.length, properties: CONTACT_PROPERTIES, objects };
}

export function createHubSpotReader({ accessToken, fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) }) {
  if (typeof accessToken !== 'string' || !/^pat-[a-z0-9-]{20,200}$/i.test(accessToken)) fail();
  const request = async (path, body) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      // At most 5 calls/second, comfortably below the app's shared limit.
      await sleep(200);
      let response;
      try {
        response = await fetchImpl(`https://api.hubapi.com${path}`, { method: 'POST', redirect: 'error',
          signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body) });
      } catch { if (attempt === 3) fail(); await sleep(1000 * 2 ** attempt); continue; }
      if (response.status === 429 || response.status >= 500) {
        if (attempt === 3) fail();
        const retry = response.headers.get('Retry-After');
        const seconds = /^\d+$/.test(retry ?? '') ? Number(retry) : Math.max(0, (Date.parse(retry) - Date.now()) / 1000);
        // A longer server-directed pause is retried by the next scheduled invocation.
        if (Number.isFinite(seconds) && seconds > 30) fail();
        await sleep(Math.max(1000 * 2 ** attempt, Number.isFinite(seconds) ? seconds * 1000 : 0));
        continue;
      }
      if (response.status !== 200 || Number(response.headers.get('content-length') ?? 0) > 8 * 1024 * 1024) fail();
      try { return await response.json(); } catch { fail(); }
    }
    fail();
  };
  let verified;
  return async (path, options) => {
    if (!['/crm/v3/properties/contacts/batch/read', '/crm/v3/objects/contacts/batch/read'].includes(path)) fail();
    verified ??= (async () => {
      const info = await request('/oauth/v2/private-apps/get/access-token-info', { tokenKey: accessToken });
      if (info?.hubId !== 144765514 || info.appId !== 52397854 || !Array.isArray(info.scopes)
        || JSON.stringify([...info.scopes].sort()) !== JSON.stringify([...BRIDGE_SCOPES].sort())) fail();
    })();
    await verified;
    return request(path, options.body);
  };
}
