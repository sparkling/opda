import { WORKING_GROUPS } from '../agents/working-group-inbox/domain.mjs';
import { APPROVAL_GROUP_IDS, OPDA_TENANT_ID, WEBSITE_LOGIN_URL } from './invitation.mjs';

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
