import { APP_SCOPES, verifyPrivateApp } from '../hubspot-participation/admin.mjs';
import { CONTACT_PROPERTIES } from '../hubspot-participation/import.mjs';
import { RetryLater, retryAfter } from '../hubspot-sync/errors.mjs';

const PORTAL_ID = 144765514;
const APP_ID = 52397854;
const CONTACT_ID = /^[1-9][0-9]{0,19}$/;
const ENROLMENTS = new Set(['not_invited', 'invited', 'complete', 'expired']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = () => { throw new Error('Invalid or incomplete HubSpot approval response'); };

function validateId(id) {
  if (typeof id !== 'string' || !CONTACT_ID.test(id)) throw new TypeError('Invalid HubSpot contact identifier');
}

function validateContact(contact, expectedId) {
  if (!object(contact) || typeof contact.id !== 'string' || !CONTACT_ID.test(contact.id)
    || (expectedId !== undefined && contact.id !== expectedId) || !object(contact.properties)) fail();
  if (contact.propertiesWithHistory !== undefined && !object(contact.propertiesWithHistory)) fail();
  for (const name of ['opda_review_status', 'email']) {
    const history = contact.propertiesWithHistory?.[name];
    if (history !== undefined && !Array.isArray(history)) fail();
  }
  return contact;
}

function readQuery() {
  return new URLSearchParams({ properties: CONTACT_PROPERTIES.join(','),
    propertiesWithHistory: 'opda_review_status,email', archived: 'false' });
}

async function readSecret(secretArn) {
  const aws = await import('@aws-sdk/client-secrets-manager');
  const result = await new aws.SecretsManagerClient({ maxAttempts: 2 }).send(
    new aws.GetSecretValueCommand({ SecretId: secretArn }),
  );
  return JSON.parse(result.SecretString);
}

/** Reads staff decisions; writes only AWS-owned active/enrolment projections. */
export function createHubSpotClient(overrides = {}) {
  const fetcher = overrides.fetch ?? globalThis.fetch;
  const now = overrides.now ?? Date.now;
  let credential, verifiedAt;
  async function request(token, path, { method = 'GET', body, notFound = false } = {}) {
    let response;
    try {
      response = await fetcher(`https://api.hubapi.com${path}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new Error('HubSpot transport failure'); }
    if (response.status === 429) throw new RetryLater(retryAfter(response.headers.get('retry-after'), now()));
    if (notFound && response.status === 404) return null;
    if (!response.ok) {
      if ([401, 403].includes(response.status)) { credential = undefined; verifiedAt = undefined; }
      throw new Error('HubSpot approval request failed');
    }
    try { return await response.json(); } catch { fail(); }
  }

  async function verifiedCredential() {
    const timestamp = now();
    if (!Number.isSafeInteger(timestamp) || timestamp < 0) throw new Error('Invalid approval clock');
    if (!credential || timestamp < verifiedAt || timestamp - verifiedAt > 300000) {
      let stored;
      try { stored = await (overrides.getSecret ?? readSecret)(overrides.secretArn); }
      catch { throw new Error('HubSpot credential configuration unavailable'); }
      if (stored?.portalId !== PORTAL_ID || stored?.appId !== APP_ID || stored?.role !== 'bridge'
        || typeof stored?.accessToken !== 'string' || !/^pat-[a-z0-9-]{20,200}$/i.test(stored.accessToken)) {
        throw new Error('HubSpot credential configuration mismatch');
      }
      await verifyPrivateApp(path => request(stored.accessToken, path, {
        method: 'POST', body: { tokenKey: stored.accessToken },
      }), { portalId: PORTAL_ID, appId: APP_ID, scopes: APP_SCOPES.bridge });
      credential = stored.accessToken;
      verifiedAt = timestamp;
    }
    return credential;
  }

  return {
    async getContact(id) {
      validateId(id);
      const contact = await request(await verifiedCredential(),
        `/crm/v3/objects/contacts/${id}?${readQuery()}`, { notFound: true });
      if (contact === null) return null;
      validateContact(contact);
      // HubSpot can resolve a merged-away ID to its survivor. The original
      // identity is unavailable; never transfer its account to the survivor.
      return contact.id === id ? contact : null;
    },

    async listContacts() {
      const contacts = [], ids = new Set(), cursors = new Set();
      let after, pages = 0;
      do {
        if (++pages > 50) fail();
        const query = readQuery();
        query.set('limit', '100');
        if (after !== undefined) query.set('after', after);
        const page = await request(await verifiedCredential(), `/crm/v3/objects/contacts?${query}`);
        if (!object(page) || !Array.isArray(page.results) || page.results.length > 100
          || contacts.length + page.results.length > 5000) fail();
        for (const result of page.results) {
          const contact = validateContact(result);
          if (ids.has(contact.id)) fail();
          ids.add(contact.id);
          contacts.push(contact);
        }
        if (page.paging !== undefined && !object(page.paging)) fail();
        if (page.paging?.next === undefined) return contacts;
        if (!object(page.paging.next)) fail();
        const cursor = page.paging.next?.after;
        if ((typeof cursor !== 'string' && !(Number.isSafeInteger(cursor) && cursor >= 0))
          || !String(cursor).length || String(cursor).length > 512 || /[\u0000-\u001f\u007f]/u.test(String(cursor))) fail();
        after = String(cursor);
        if (cursors.has(after)) fail();
        cursors.add(after);
      } while (true);
    },

    async projectStatus(id, status) {
      validateId(id);
      if (!object(status) || Object.keys(status).length !== 2 || !Object.hasOwn(status, 'active')
        || typeof status.active !== 'boolean'
        || !Object.hasOwn(status, 'enrolmentStatus') || !ENROLMENTS.has(status.enrolmentStatus)) {
        throw new TypeError('Only active and enrolment status projections are allowed');
      }
      const contact = await request(await verifiedCredential(), `/crm/v3/objects/contacts/${id}`, {
        method: 'PATCH', body: { properties: {
          opda_active: String(status.active), opda_enrolment_status: status.enrolmentStatus,
        } },
      });
      return validateContact(contact, id);
    },
  };
}
