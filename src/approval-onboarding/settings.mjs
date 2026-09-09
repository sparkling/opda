import { WORKING_GROUPS } from '../agents/working-group-inbox/domain.mjs';
import { APPROVAL_GROUP_IDS, OPDA_TENANT_ID, WEBSITE_LOGIN_URL } from './invitation.mjs';
import { DOMAIN_TEMPLATE_CONTRACTS } from './domain-templates.mjs';

export const WORKSPACES = Object.freeze(Object.fromEntries(APPROVAL_GROUP_IDS.map(id => {
  const group = WORKING_GROUPS.find(group => group.id === id);
  if (!group || !['implemented', 'provisioned'].includes(group.workspace.status)) throw new Error('Onboarding workspace unavailable');
  return [id, Object.freeze({ ...group.workspace })];
})));
export const INVITATION_REGISTRY = Object.freeze({ tenantId: OPDA_TENANT_ID, websiteLoginUrl: WEBSITE_LOGIN_URL,
  groups: Object.fromEntries(Object.entries(WORKSPACES).map(([id, workspace]) => [id, {
    teamId: workspace.teamId, teamUrl: workspace.teamUrl, sourceIntakeSiteUrl: workspace.siteUrl, status: workspace.status,
  }])) });
export const TEMPLATE_PIN = Object.freeze({ version: 1, serverId: 20188829, templateId: 46437816,
  fingerprint: '4e8fa616f54ccdf32d602aee80662e9f6ae7fbe28e8c4ac635ee99d40ab04d8e' });

// Compiled from the shared original-layout shells. Created and byte-verified on
// Postmark server 20188829 on 2026-09-09; this does not activate the approval policy.
const DOMAIN_TEMPLATE_IDS = Object.freeze({
  'finance-and-banking': 46444294,
  conveyancing: 46444295,
  'estate-agency': 46444297,
  'surveying-and-valuation': 46444274,
  'property-data-services': 46444261,
  'property-technology': 46444262,
});
const DOMAIN_TEMPLATE_FINGERPRINTS = Object.freeze({
  'finance-and-banking': '328cdd8c971168afeb9b68beb435a0896dda66d107dc2ece63b82ee4b2ce9bca',
  conveyancing: 'bce579ca22f53499985dd34216af85fddfae1caab92b780807513224c8b7609f',
  'estate-agency': 'd52be4230b311e3c47b918aa8cac1f0d19063e4717631761ad1a3f83b2edda74',
  'surveying-and-valuation': '42cadac1a286112a5c4d70f7fe02ed57d85ca1892c9497feb8f666096555f8e0',
  'property-data-services': '7d02aba17bab5aad2db271edf09c539afe528356f3bdb0156da6ec98d3021be2',
  'property-technology': 'a3a5b9ff621b1c6ab359a731d3583335304b4b5d5f09d5f0125df9920428b06d',
});
export const TEMPLATE_PINS = Object.freeze(Object.fromEntries(APPROVAL_GROUP_IDS.map(groupId => [groupId, Object.freeze({
  ...DOMAIN_TEMPLATE_CONTRACTS[groupId], serverId: 20188829, templateId: DOMAIN_TEMPLATE_IDS[groupId],
  fingerprint: DOMAIN_TEMPLATE_FINGERPRINTS[groupId],
})])));
