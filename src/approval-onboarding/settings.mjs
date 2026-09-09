import { WORKING_GROUPS } from '../agents/working-group-inbox/domain.mjs';
import { APPROVAL_GROUP_IDS, OPDA_TENANT_ID, WEBSITE_LOGIN_URL } from './invitation.mjs';
import { DOMAIN_TEMPLATE_CONTRACTS } from './domain-templates.mjs';
import { withdrawalNoticeContract } from './withdrawal-notice.mjs';

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

// Original-layout transactional notices, validated and byte-verified on 2026-09-09.
const NOTICE_RESOURCES = Object.freeze({
  'finance-and-banking': [46447105, '46feee58e0034425074fe61130b826222e6b6ea957dd1773e8fd53b8fcb24006'],
  conveyancing: [46447079, '547987273eff1575de60a9345e1aa784f0da2c58cb03407a14db857ed4f929b4'],
  'estate-agency': [46447080, 'cf873f01b813dd0578716acfdd92c47412a13044980ac3f1ccb6f68b3312c094'],
  'surveying-and-valuation': [46447092, 'e9441305658df63b94668ba2caddd4f3d324b2637023a801dd70e5e52da56c1f'],
  'property-data-services': [46447106, '78365fc8350e07092a8731a2f261b56b8b827b830df98e34019eb716a148fb7d'],
  'property-technology': [46447107, '54ef7cd73399805bd3bb16d63275b0fa6f2f721dec43925ef1258ec061119fe6'],
});
export const NOTICE_PINS = Object.freeze({
  website: Object.freeze({ ...withdrawalNoticeContract('website-disabled'), serverId: 20188829,
    templateId: 46447081, fingerprint: '5e99270c8f3fc335c8d230757dd85db636cd61d4d090ce9b740a30a68a1650d1' }),
  groups: Object.freeze(Object.fromEntries(APPROVAL_GROUP_IDS.map(groupId => [groupId, Object.freeze({
    ...withdrawalNoticeContract('group-withdrawn', groupId), serverId: 20188829,
    templateId: NOTICE_RESOURCES[groupId][0], fingerprint: NOTICE_RESOURCES[groupId][1],
  })]))),
});
