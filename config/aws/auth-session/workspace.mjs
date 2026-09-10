import { randomBytes } from 'node:crypto';

export const OPDA_ORIGIN = 'https://opda.org.uk';
export const OPDA_TENANT_ID = '143540d4-4fbc-4005-882a-29656cd01a36';
export const WORKSPACE_RUNTIME_ARN = 'arn:aws:lambda:eu-west-2:355653384628:function:opda-workspace-entry';
export const WORKSPACE_GROUPS = Object.freeze({
  'finance-and-banking': Object.freeze({ name: 'Finance and Banking Working Group', teamId: '5f9b7675-328a-44fd-8df7-4755096b7629', teamUrl: 'https://teams.microsoft.com/l/team/19%3apMps7lqMA-_UlUiCD_IftTAS9dveF4u-U16YN_88jSo1%40thread.tacv2/conversations?groupId=5f9b7675-328a-44fd-8df7-4755096b7629&tenantId=143540d4-4fbc-4005-882a-29656cd01a36' }),
  conveyancing: Object.freeze({ name: 'Conveyancing Working Group', teamId: 'aab9afb4-a959-4b3a-be5b-6fbd92ecf22d', teamUrl: 'https://teams.microsoft.com/l/team/19%3a_zZicFW0oJReC4seUosrcdU_NSkosNnH8DMp0vMBIWs1%40thread.tacv2/conversations?groupId=aab9afb4-a959-4b3a-be5b-6fbd92ecf22d&tenantId=143540d4-4fbc-4005-882a-29656cd01a36' }),
  'estate-agency': Object.freeze({ name: 'Estate Agency Working Group', teamId: '0bea5db6-f0d5-46ba-8785-cfb1c4393805', teamUrl: 'https://teams.microsoft.com/l/team/19%3abEeGItoblFaHbJ4jv824umyxGbXMTPN9ajEoQfkbMuI1%40thread.tacv2/conversations?groupId=0bea5db6-f0d5-46ba-8785-cfb1c4393805&tenantId=143540d4-4fbc-4005-882a-29656cd01a36' }),
  'surveying-and-valuation': Object.freeze({ name: 'Surveying and Valuation Working Group', teamId: '3d45ce47-aa03-4331-84ae-285fad735896', teamUrl: 'https://teams.microsoft.com/l/team/19%3aezfKYsrJrKYZLAF-yy-4OHy0D0xD5kQvZK9VQF8Pdts1%40thread.tacv2/conversations?groupId=3d45ce47-aa03-4331-84ae-285fad735896&tenantId=143540d4-4fbc-4005-882a-29656cd01a36' }),
  'property-data-services': Object.freeze({ name: 'Property Data Services Working Group', teamId: 'f1281e5f-8097-4ece-8226-7be1864cff13', teamUrl: 'https://teams.microsoft.com/l/team/19%3aMlFTOJZA08QsDMrkinrpxpTwsao4mpTWwPE5Rm_ZHgU1%40thread.tacv2/conversations?groupId=f1281e5f-8097-4ece-8226-7be1864cff13&tenantId=143540d4-4fbc-4005-882a-29656cd01a36' }),
  'property-technology': Object.freeze({ name: 'Property Technology Working Group', teamId: 'c9e907e8-5fdf-4165-adba-d3b2a7a466ff', teamUrl: 'https://teams.microsoft.com/l/team/19%3ajusLihthBkrjaHq68Udr0dSn_KTz3GiURCXxbpNo-jo1%40thread.tacv2/conversations?groupId=c9e907e8-5fdf-4165-adba-d3b2a7a466ff&tenantId=143540d4-4fbc-4005-882a-29656cd01a36' }),
});
export const WORKSPACE_GROUP_IDS = Object.freeze(Object.keys(WORKSPACE_GROUPS));

const allowedQuery = new Set(['rd', 'tenant', 'ticket', 'user', 'ver']);
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const UNSAFE = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/u;
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function approvedWorkspaceGroups(participant) {
  if (!participant || !Array.isArray(participant.approvedDomains) || !participant.domainApprovals) return [];
  return WORKSPACE_GROUP_IDS.filter(id => participant.approvedDomains.includes(id)
    && participant.domainApprovals[id]?.status === 'approved');
}

export function validateGroupId(value) {
  if (typeof value !== 'string' || !Object.hasOwn(WORKSPACE_GROUPS, value)) throw new TypeError('Invalid workspace group');
  return value;
}

export function validateWorkspaceLocation(status, location, groupId) {
  validateGroupId(groupId);
  if (status === 'ready') {
    if (typeof location !== 'string' || location.length > 8192 || /[\s\\<>"{}]/u.test(location)) throw new TypeError('Invalid workspace target');
    let url;
    try { url = new URL(location); } catch { throw new TypeError('Invalid workspace target'); }
    if (url.protocol !== 'https:' || !['teams.microsoft.com', 'teams.cloud.microsoft'].includes(url.hostname) || !/^\/l\/(?:team|channel)\/[^/]+\/[^/]+\/?$/u.test(url.pathname)
      || url.username || url.password || url.port || url.hash || url.searchParams.get('groupId')?.toLowerCase() !== WORKSPACE_GROUPS[groupId].teamId
      || url.searchParams.get('tenantId')?.toLowerCase() !== OPDA_TENANT_ID
      || new Set(url.searchParams.keys()).size !== [...url.searchParams.keys()].length
      || [...url.searchParams.keys()].some(key => !['groupId', 'tenantId', 'allowXTenantAccess'].includes(key))
      || url.searchParams.get('allowXTenantAccess') !== null && url.searchParams.get('allowXTenantAccess') !== 'False') throw new TypeError('Invalid workspace target');
    return location;
  }
  if (status === 'redeem') return validateMicrosoftRedeem(location);
  if (location !== undefined) throw new TypeError('Unexpected workspace result target');
  return undefined;
}

function validateMicrosoftRedeem(value) {
  if (typeof value !== 'string' || value.length > 8192 || /[\s\\<>"{}]/u.test(value)) throw new TypeError('Invalid redemption target');
  let url;
  try { url = new URL(value); } catch { throw new TypeError('Invalid redemption target'); }
  if (url.protocol !== 'https:' || url.hostname !== 'login.microsoftonline.com' || !['/redeem', '/redeem/'].includes(url.pathname)
    || url.username || url.password || url.port || url.hash || [...url.searchParams.keys()].some(key => !allowedQuery.has(key))) {
    throw new TypeError('Invalid redemption target');
  }
  if (new Set(url.searchParams.keys()).size !== [...url.searchParams.keys()].length
    || [...url.searchParams].some(([key, item]) => UNSAFE.test(key + item))) throw new TypeError('Invalid redemption target');
  if (url.searchParams.has('rd')) {
    if (url.searchParams.has('tenant') || url.searchParams.has('ticket') || url.searchParams.has('user')) throw new TypeError('Invalid redemption target');
    let nested;
    try { nested = new URL(url.searchParams.get('rd')); } catch { throw new TypeError('Invalid redemption target'); }
    if (nested.protocol !== 'https:' || nested.hostname !== 'invitations.microsoft.com' || !['/redeem', '/redeem/'].includes(nested.pathname)
      || nested.username || nested.password || nested.port || nested.hash
      || new Set(nested.searchParams.keys()).size !== [...nested.searchParams.keys()].length
      || [...nested.searchParams.keys()].some(key => !new Set(['tenant', 'ticket', 'user', 'ver']).has(key))
      || [...nested.searchParams].some(([key, item]) => UNSAFE.test(key + item))
      || nested.searchParams.get('tenant')?.toLowerCase() !== OPDA_TENANT_ID || !nested.searchParams.get('ticket')
      || nested.searchParams.has('user') && !GUID.test(nested.searchParams.get('user'))) {
      throw new TypeError('Invalid redemption target');
    }
  }
  if (!url.searchParams.has('rd') && (url.searchParams.get('tenant')?.toLowerCase() !== OPDA_TENANT_ID || !url.searchParams.get('ticket')
    || url.searchParams.has('user') && !GUID.test(url.searchParams.get('user')))) {
    throw new TypeError('Invalid redemption target');
  }
  return value;
}

export function validateAccessResult(value, groupId) {
  validateGroupId(groupId);
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || !['ready', 'redeem', 'denied', 'pending', 'review', 'unavailable'].includes(value.status)) {
    throw new TypeError('Invalid workspace runtime result');
  }
  validateWorkspaceLocation(value.status, value.location, groupId);
  return { status: value.status, ...(value.location ? { location: value.location } : {}) };
}

export function createWorkspaceRuntime({ invoke = defaultInvoke } = {}) {
  return async ({ sessionToken, groupId, phase }) => {
    if (typeof sessionToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/u.test(sessionToken)) throw new TypeError('Invalid workspace session');
    validateGroupId(groupId);
    if (!['open', 'return'].includes(phase)) throw new TypeError('Invalid workspace phase');
    const result = await invoke({ schemaVersion: 1, sessionToken, groupId, phase });
    return validateAccessResult(result, groupId);
  };
}

async function defaultInvoke(payload) {
  const { LambdaClient, InvokeCommand } = await import('@aws-sdk/client-lambda');
  const client = new LambdaClient({ region: 'eu-west-2', maxAttempts: 1 });
  const result = await client.send(new InvokeCommand({ FunctionName: WORKSPACE_RUNTIME_ARN,
    InvocationType: 'RequestResponse', Payload: Buffer.from(JSON.stringify(payload)) }), { abortSignal: AbortSignal.timeout(11000) });
  if (result.FunctionError || !result.Payload) throw new Error('Workspace runtime unavailable');
  let value;
  try { value = JSON.parse(Buffer.from(result.Payload).toString('utf8')); } catch { throw new Error('Workspace runtime unavailable'); }
  return value;
}

export function renderWorkspacePage({ groups, mode = 'initial', phase, selectedGroup, message = '', nonce = randomBytes(16).toString('base64url') }) {
  const ids = groups.map(validateGroupId);
  const list = ids.map(id => `<li><a data-group="${id}" href="/_auth/workspace?group=${encodeURIComponent(id)}">${escapeHtml(WORKSPACE_GROUPS[id].name)}</a></li>`).join('');
  const title = mode === 'return' ? 'Continue to your OPDA working group' : 'Open your OPDA working group';
  const formPhase = phase ?? (mode === 'return' ? 'return' : 'open');
  const safeSelected = selectedGroup && ids.includes(selectedGroup) ? selectedGroup : '';
  const auto = mode === 'initial' && Boolean(safeSelected);
  const script = `(()=>{let submitted=false;const allowed=${JSON.stringify(ids)};const form=document.querySelector('form');const valid=item=>item&&allowed.includes(item.groupId)&&Number.isSafeInteger(item.expiresAt)&&item.expiresAt>Date.now();const submit=group=>{if(submitted||!form||!allowed.includes(group))return;submitted=true;form.group.value=group;form.requestSubmit()};if(${JSON.stringify(auto)}){const group=${JSON.stringify(safeSelected)};let stored=false;try{sessionStorage.setItem('opda_workspace',JSON.stringify({groupId:group,expiresAt:Date.now()+1800000}));stored=true}catch{}if(stored)submit(group)}else if(${JSON.stringify(mode==='return')}){try{const item=JSON.parse(sessionStorage.getItem('opda_workspace')||'null');if(valid(item))submit(item.groupId)}catch{}}})();`;
  const form = safeSelected
    ? `<form method="post" action="/_auth/workspace"><input type="hidden" name="phase" value="${formPhase}"><input type="hidden" name="group" value="${safeSelected}"><button type="submit">${mode === 'retry' ? 'Try again' : mode === 'return' ? 'Continue' : 'Open selected working group'}</button></form>`
    : mode === 'return' ? '<form hidden method="post" action="/_auth/workspace"><input type="hidden" name="phase" value="return"><input type="hidden" name="group" value=""></form>' : '';
  const notice = message ? `<p role="status">${escapeHtml(message)}</p>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escapeHtml(title)}</title><style>:root{color-scheme:light dark;--bg:#fff;--fg:#141413;--muted:#555;--link:#a9583e}*{box-sizing:border-box}body{margin:0;padding:clamp(24px,6vw,72px);background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,sans-serif}main{max-width:680px;margin:auto}a,button{font:inherit}a{color:var(--link)}button{padding:.65rem 1rem;cursor:pointer}li{margin:.8rem 0}@media(prefers-color-scheme:dark){:root{--bg:#141413;--fg:#f5f1e8;--muted:#c9c1b4;--link:#e5b632}}</style></head><body><main><h1>${escapeHtml(title)}</h1>${notice}<p>Choose an approved working group. OPDA checks current access before opening Teams.</p><ul>${list}</ul>${form}</main><script nonce="${escapeHtml(nonce)}">${script}</script></body></html>`;
}

// Chromium also checks form redirects: permit only our server-vetted hand-off origins.
export const workspaceCsp = nonce => `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'self' https://login.microsoftonline.com https://teams.microsoft.com https://teams.cloud.microsoft; frame-ancestors 'none'`;
