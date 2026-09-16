import { WORKING_GROUP_LABELS } from '../hubspot-participation/properties.mjs';
import { VERBS, buildSignupCard, hubspotRecordUrl, plain } from './card.mjs';
import { OBJECT_ID, teamsDecisionId } from './decisions.mjs';
import { contactReference } from './notifier.mjs';
import { REGISTRATION_ID, reviewKey } from './store.mjs';

/**
 * A button click (ADR-0088). By the time this runs the request has passed Bot
 * Framework authentication, so `from.aadObjectId` is the clicker's verified
 * Entra identity. The flag, the approver list, the applicant's own request and
 * the CRM's current interests are all checked live; then the decision is stored,
 * mirrored to the CRM and handed to the approval worker through the same hint
 * queue the HubSpot webhook uses. The card is re-rendered for everyone.
 */
export const CARD_RESPONSE = 'application/vnd.microsoft.card.adaptive';
export const MESSAGE_RESPONSE = 'application/vnd.microsoft.activity.message';
export const ERROR_RESPONSE = 'application/vnd.microsoft.error';
export const NOT_ENABLED = 'Approval in Teams is not enabled yet. Decide this group in HubSpot for now.';

export const cardResponse = card => ({ statusCode: 200, type: CARD_RESPONSE, value: card });
export const messageResponse = text => ({ statusCode: 200, type: MESSAGE_RESPONSE, value: text });
export const errorResponse = (statusCode, code, message) => ({ statusCode, type: ERROR_RESPONSE, value: { code, message } });

class Refused extends Error {
  constructor(response) { super('Refused'); this.response = response; }
}
const refuse = response => { throw new Refused(response); };

export function parseAction(activity) {
  const action = activity?.value?.action, data = action?.data;
  if (action?.type !== 'Action.Execute' || !VERBS.has(action.verb) || !data || typeof data !== 'object'
    || data.v !== 1 || typeof data.registrationId !== 'string' || !REGISTRATION_ID.test(data.registrationId)
    || !Object.hasOwn(WORKING_GROUP_LABELS, data.domainId)) refuse(errorResponse(400, 'BadRequest', 'Unrecognised action.'));
  const from = activity.from;
  if (typeof from?.aadObjectId !== 'string' || !OBJECT_ID.test(from.aadObjectId)) refuse(errorResponse(401, 'Unauthorized', 'No verified user identity.'));
  if (typeof activity.replyToId !== 'string' || !activity.replyToId || activity.replyToId.length > 256
    || typeof activity.conversation?.id !== 'string' || !activity.conversation.id) refuse(errorResponse(400, 'BadRequest', 'No card reference.'));
  return { verb: action.verb, status: action.verb === 'approve' ? 'approved' : 'rejected',
    registrationId: data.registrationId, domainId: data.domainId, actorObjectId: from.aadObjectId,
    actorName: plain(from.name, 80), messageId: activity.replyToId, conversationId: activity.conversation.id,
    serviceUrl: activity.serviceUrl };
}

export function createDecisionFlow({ store, crm, microsoft, sendHint, approverGroupId, approvalsEnabled = false, now = Date.now }) {
  async function decisionsFor(contactId, groups) {
    const decisions = {};
    for (const domainId of groups) {
      const record = await store.get(reviewKey(contactId, domainId));
      if (record) decisions[domainId] = { status: record.status, actorName: record.actorName, at: record.at };
    }
    return decisions;
  }

  async function decide(activity) {
    const click = parseAction(activity);
    if (!approvalsEnabled) return messageResponse(NOT_ENABLED);
    if (!OBJECT_ID.test(approverGroupId ?? '') || !await microsoft.isGroupMember(approverGroupId, click.actorObjectId)) {
      return errorResponse(403, 'Forbidden', 'You are not on the OPDA approver list.');
    }
    const registration = await store.getRegistration(click.registrationId);
    if (!registration || registration.erasedAt || registration.deletedAt
      || !Array.isArray(registration.workingGroups) || !registration.workingGroups.includes(click.domainId)) {
      return errorResponse(410, 'Gone', 'This signup is no longer available for review.');
    }
    const link = contactReference(await store.getSyncClaim(registration.email));
    if (!link.contactId) return messageResponse('No single HubSpot contact is linked to this signup yet. Decide in HubSpot.');
    const contact = await crm.getContact(link.contactId);
    const interests = typeof contact?.properties?.opda_requested_working_groups === 'string'
      ? contact.properties.opda_requested_working_groups.split(';') : [];
    if (!contact || contact.archived || String(contact.properties.email ?? '').trim().toLowerCase() !== registration.email
      || !interests.includes(click.domainId)) {
      return messageResponse(`HubSpot no longer matches this signup for ${WORKING_GROUP_LABELS[click.domainId]}. Decide in HubSpot: ${hubspotRecordUrl(link.contactId)}`);
    }
    const contactId = link.contactId, pk = reviewKey(contactId, click.domainId);
    let record = await store.get(pk);
    const groups = registration.workingGroups.filter(id => Object.hasOwn(WORKING_GROUP_LABELS, id));
    const render = async () => buildSignupCard({ registration, contactId, decisions: await decisionsFor(contactId, groups) });
    if (record?.status === click.status && record.mirroredAt) return cardResponse(await render());
    if (record?.status !== click.status) {
      const at = now();
      const fields = { contactId, domainId: click.domainId, status: click.status, at,
        actorObjectId: click.actorObjectId, messageId: click.messageId };
      record = await store.put({ ...fields, pk, decisionId: teamsDecisionId(fields), actorName: click.actorName,
        conversationId: click.conversationId, registrationId: click.registrationId, mirroredAt: null, updatedAt: at }, record);
    }
    try { await crm.setDomainReview(contactId, click.domainId, click.status); }
    catch { return errorResponse(502, 'BadGateway', 'Recorded in Teams, but the HubSpot update failed. Click again to retry, or decide in HubSpot.'); }
    record = await store.put({ ...record, mirroredAt: now(), updatedAt: now() }, record);
    await sendHint(contactId);
    const card = await render();
    // Best effort: the invoke response below still updates the card for the clicker.
    try { await microsoft.updateCard({ serviceUrl: click.serviceUrl, conversationId: click.conversationId, activityId: click.messageId, card }); }
    catch { /* The durable record and CRM mirror are already in place. */ }
    return cardResponse(card);
  }

  return async activity => {
    try { return await decide(activity); }
    catch (error) {
      if (error instanceof Refused) return error.response;
      // No raw errors, identities or credentials leave this boundary.
      return errorResponse(500, 'InternalError', 'The decision could not be completed. Try again or decide in HubSpot.');
    }
  };
}
