import { APP_SCOPES, verifyPrivateApp } from '../hubspot-participation/admin.mjs';
import { DOMAIN_REVIEW_PROPERTIES, WORKING_GROUP_LABELS } from '../hubspot-participation/properties.mjs';
import { RetryLater, retryAfter } from '../shared/http-retry.mjs';

const PORTAL_ID = 144765514;
const APP_ID = 52397854;
const CONTACT_ID = /^[1-9][0-9]*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// HubSpot-defined association: task -> contact.
const TASK_TO_CONTACT = 204;
const DOMAIN_PROPERTY_TO_GROUP = new Map(Object.entries(DOMAIN_REVIEW_PROPERTIES).map(([group, property]) => [property, group]));
const WRITABLE = new Set(['email', 'firstname', 'lastname', 'company', 'opda_role_or_expertise',
  'opda_requested_working_groups', 'opda_contribution_preferences', 'opda_relevant_perspective',
  'opda_referral_sources', 'opda_referral_other',
  'opda_enrolment_status', 'opda_active', ...DOMAIN_PROPERTY_TO_GROUP.keys()]);

async function readSecret(secretArn) {
  const aws = await import('@aws-sdk/client-secrets-manager');
  const result = await new aws.SecretsManagerClient({ maxAttempts: 2 }).send(
    new aws.GetSecretValueCommand({ SecretId: secretArn }),
  );
  return JSON.parse(result.SecretString);
}

/** Narrow pinned CRM v3 adapter. It has no update, merge, consent or identity API. */
export function createHubSpotClient(overrides = {}) {
  const fetcher = overrides.fetch ?? globalThis.fetch;
  let credential;
  let verifiedAt = 0;
  async function request(token, path, { method = 'GET', body, notFound = false } = {}) {
    let response;
    try {
      response = await fetcher(`https://api.hubapi.com${path}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new Error('HubSpot transport failure'); }
    if (response.status === 429) throw new RetryLater(retryAfter(response.headers.get('retry-after')));
    if (notFound && response.status === 404) return null;
    if (!response.ok) {
      if ([401, 403].includes(response.status)) { credential = undefined; verifiedAt = 0; }
      // A create failure, including 5xx, may have committed. The worker must
      // reconcile its durable "creating" marker rather than retrying this POST.
      throw new Error(`HubSpot HTTP failure ${response.status}`);
    }
    try { return await response.json(); } catch { throw new Error('Invalid HubSpot response'); }
  }
  async function verifiedCredential() {
    if (!credential || Date.now() - verifiedAt > 300000) {
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
      verifiedAt = Date.now();
    }
    return credential;
  }
  return {
    async findContacts(email) {
      if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
        throw new TypeError('Invalid lookup email');
      }
      // Use the unique email lookup, not the eventually consistent search index.
      // A match only means review; it never proves a participant identity.
      const contact = await request(await verifiedCredential(),
        `/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email&properties=email`, { notFound: true });
      if (!contact) return [];
      if (!CONTACT_ID.test(contact.id)) throw new Error('Invalid HubSpot contact identifier');
      return [contact.id];
    },
    async createContact(properties) {
      if (!properties || Object.keys(properties).some(key => !WRITABLE.has(key))
        || properties.opda_enrolment_status !== 'not_invited'
        || properties.opda_active !== 'false') throw new TypeError('Only pending applicant creation is allowed');
      // Domain dropdowns may only be marked Requested, and only for groups the applicant selected.
      const requested = new Set(String(properties.opda_requested_working_groups ?? '').split(';').filter(Boolean));
      for (const [property, group] of DOMAIN_PROPERTY_TO_GROUP) {
        if (!Object.hasOwn(properties, property)) continue;
        if (properties[property] !== 'received' || !requested.has(group)) throw new TypeError('Only pending applicant creation is allowed');
      }
      const contact = await request(await verifiedCredential(), '/crm/v3/objects/contacts', {
        method: 'POST', body: { properties },
      });
      if (!CONTACT_ID.test(contact?.id) || contact.archived
        || contact?.properties?.email?.toLowerCase() !== properties.email) {
        throw new Error('Ambiguous HubSpot create response');
      }
      return { id: contact.id, email: properties.email };
    },
    /**
     * ADR-0084 §4: an existing contact is never updated from anonymous input, so a
     * human review task carries the application to staff instead. The task holds only
     * finite group labels and the registration reference: applicant free text stays
     * in the AWS intake record. Task creation needs no scope beyond contacts.write.
     */
    async createReviewTask({ contactIds, registrationId, requestedGroups, dueAt } = {}) {
      if (!Array.isArray(contactIds) || contactIds.length < 1 || contactIds.length > 5
        || contactIds.some(id => typeof id !== 'string' || !CONTACT_ID.test(id))
        || typeof registrationId !== 'string' || !UUID.test(registrationId)
        || !Array.isArray(requestedGroups) || requestedGroups.length < 1
        || requestedGroups.some(group => !Object.hasOwn(WORKING_GROUP_LABELS, group))
        || !Number.isSafeInteger(dueAt)) throw new TypeError('Only a bounded review task is allowed');
      const groups = requestedGroups.map(group => `${WORKING_GROUP_LABELS[group]} Working Group`).join('; ');
      const task = await request(await verifiedCredential(), '/crm/v3/objects/tasks', { method: 'POST', body: {
        properties: {
          hs_task_subject: 'Review working-group application from an existing contact',
          hs_task_body: `A website working-group application matched this existing contact. Requested: ${groups}. `
            + `Review the application, then set the relevant working-group review dropdown(s) on the contact. `
            + `AWS registration reference: ${registrationId}.`,
          hs_task_status: 'NOT_STARTED', hs_task_priority: 'HIGH', hs_task_type: 'TODO',
          hs_timestamp: new Date(dueAt).toISOString(),
        },
        associations: contactIds.map(id => ({ to: { id },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: TASK_TO_CONTACT }] })),
      } });
      if (!CONTACT_ID.test(task?.id) || task.archived) throw new Error('Ambiguous HubSpot task response');
      return { id: task.id };
    },
  };
}
