import { DOMAIN_REVIEW_PROPERTIES } from '../hubspot-participation/properties.mjs';
import { CONTACT_ID } from './store.mjs';
import { DECIDED } from './decisions.mjs';

/**
 * The Teams bot's only CRM surface (ADR-0088): read the contact it is about to
 * decide on, and mirror the decision into that domain's review dropdown as an
 * INTEGRATION write. The approval worker never trusts that write by itself; it
 * trusts the durable `TEAMS#REVIEW` record the write corroborates.
 */
const PORTAL_ID = 144765514, APP_ID = 52397854;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = message => { throw new Error(message); };

async function readSecret(secretArn) {
  const aws = await import('@aws-sdk/client-secrets-manager');
  const result = await new aws.SecretsManagerClient({ maxAttempts: 2 }).send(
    new aws.GetSecretValueCommand({ SecretId: secretArn }), { abortSignal: AbortSignal.timeout(3000) });
  return JSON.parse(result.SecretString);
}

export function createCrmClient({ secretArn, getSecret = readSecret, fetch = globalThis.fetch } = {}) {
  let credential;
  async function token() {
    if (credential) return credential;
    let stored;
    try { stored = await getSecret(secretArn); } catch { fail('HubSpot credential configuration unavailable'); }
    if (stored?.portalId !== PORTAL_ID || stored?.appId !== APP_ID || stored?.role !== 'bridge'
      || typeof stored?.accessToken !== 'string' || !/^pat-[a-z0-9-]{20,200}$/i.test(stored.accessToken)) {
      fail('HubSpot credential configuration mismatch');
    }
    credential = stored.accessToken;
    return credential;
  }
  async function request(path, { method = 'GET', body } = {}) {
    let response;
    try {
      response = await fetch(`https://api.hubapi.com${path}`, { method, redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
        ...(body ? { body: JSON.stringify(body) } : {}) });
    } catch { fail('HubSpot transport failure'); }
    if ([401, 403].includes(response.status)) credential = undefined;
    if (response.status === 404) return null;
    if (!response.ok) fail(`HubSpot request failed (${response.status})`);
    try { return await response.json(); } catch { fail('Invalid HubSpot response'); }
  }
  const validId = id => { if (typeof id !== 'string' || !CONTACT_ID.test(id)) throw new TypeError('Invalid HubSpot contact identifier'); };

  return {
    async getContact(id) {
      validId(id);
      const query = new URLSearchParams({ properties: ['email', 'opda_requested_working_groups',
        ...Object.values(DOMAIN_REVIEW_PROPERTIES)].join(','), archived: 'false' });
      const contact = await request(`/crm/v3/objects/contacts/${id}?${query}`);
      if (contact === null) return null;
      if (!object(contact) || contact.id !== id || !object(contact.properties)) fail('Invalid HubSpot contact');
      return contact;
    },
    async setDomainReview(id, domainId, status) {
      validId(id);
      const property = DOMAIN_REVIEW_PROPERTIES[domainId];
      if (!property || !DECIDED.has(status)) throw new TypeError('Invalid domain review');
      const contact = await request(`/crm/v3/objects/contacts/${id}`, { method: 'PATCH', body: { properties: { [property]: status } } });
      if (!object(contact) || contact.id !== id || contact.properties?.[property] !== status) fail('HubSpot review mirror unconfirmed');
    },
  };
}
