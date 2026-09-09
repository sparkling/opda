import assert from 'node:assert/strict';
import test from 'node:test';
import { createSharePointAdapter } from '../src/approval-onboarding/sharepoint.mjs';

const siteUrl = 'https://openpropertydataassociation.sharepoint.com/sites/FinanceBankingSourceIntake';
const root = '/sites/FinanceBankingSourceIntake/Incoming Source Material/By Organisation';
const domain = 'example.co.uk';
const loginName = 'i:0#.f|membership|person_example.co.uk#ext#@opda.onmicrosoft.com';
const entraUserId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const folderId = '11111111-2222-3333-4444-555555555555';
const full = 1073741829;
const edit = 1073741830;
const contributor = 'Manage Organisation Area - No Sharing';
const browse = 'Browse Organisation Folder Index';
const names = {
  index: 'Finance and Banking Organisation Index Users',
  admin: 'Finance and Banking Intake Administrators',
  processor: 'Finance and Banking Intake Processors',
  company: `Finance and Banking Contributors - ${domain}`,
};
const workspace = { siteUrl, contributorGroupPrefix: 'Finance and Banking Contributors - ', indexGroup: names.index };
const grant = (id, role) => ({ Member: { Id: id }, RoleDefinitionBindings: [{ Id: role }] });
const notFound = () => Object.assign(new Error('private provider detail'), { status: 404 });

function fixture(options = {}) {
  const groups = new Map(Object.entries(names).filter(([key]) => key !== 'company').map(([key, Title], i) => [Title, {
    Id: i + 10, Title, AllowMembersEditMembership: false, OnlyAllowMembersViewMembership: true,
    AllowRequestToJoinLeave: false, AutoAcceptRequestToJoinLeave: false,
  }]));
  if (options.companyGroup) groups.set(names.company, { ...groups.get(names.index), Id: 20, Title: names.company });
  const roles = new Map([
    [contributor, { Id: 40, Name: contributor, BasePermissions: { High: '432', Low: '1011028719' } }],
    [browse, { Id: 41, Name: browse, BasePermissions: { High: '48', Low: '134418465' } }],
  ]);
  const state = {
    groups, roles, userExists: false, site: { GroupId: '00000000-0000-0000-0000-000000000000', ShareByEmailEnabled: false },
    web: { MembersCanShare: false, RequestAccessEmail: '' },
    index: { Id: 100, HasUniqueRoleAssignments: true, RoleAssignments: [grant(1, full), grant(10, 41), grant(11, full), grant(12, edit)] },
    folder: options.folder ? { Id: 101, UniqueId: folderId, HasUniqueRoleAssignments: true, RoleAssignments: [grant(1, full), grant(11, full), grant(12, edit), grant(20, 40)] } : null,
    members: new Map([[10, new Set(options.existingIndex ? [55] : [])], [20, new Set(options.existingCompany ? [55] : [])]]),
  };
  const calls = [], saved = [], sequence = [];
  let receipt;
  const user = () => ({ Id: 55, LoginName: loginName, IsSiteAdmin: false });
  const request = async (url, route, { method = 'GET', body } = {}) => {
    assert.equal(url, siteUrl);
    const parsed = new URL(url + route), path = decodeURIComponent(parsed.pathname).slice('/sites/FinanceBankingSourceIntake'.length);
    const call = { route, path, method, body };
    calls.push(call);
    sequence.push(`${method}:${path}`);
    const override = options.intercept?.(call, state, saved);
    if (override !== undefined) return await override;
    if (path === '/_api/site') return structuredClone(state.site);
    if (path === '/_api/web') return structuredClone(state.web);
    if (path === '/_api/web/AssociatedOwnerGroup') return { Id: 3 };
    if (path === '/_api/web/siteusers') {
      return { value: parsed.searchParams.get('$filter')?.includes('IsSiteAdmin') ? [{ Id: 1 }, { Id: 2 }] : state.userExists ? [user()] : [] };
    }
    if (path === '/_api/web/ensureuser') { state.userExists = true; return user(); }
    let match = path.match(/^\/_api\/web\/roledefinitions\/getbyname\('(.+)'\)$/i);
    if (match) return structuredClone(roles.get(match[1]));
    match = path.match(/^\/_api\/web\/sitegroups\/getbyname\('(.+)'\)$/i);
    if (match) { if (!groups.has(match[1])) throw notFound(); return structuredClone(groups.get(match[1])); }
    if (path === '/_api/web/sitegroups' && method === 'POST') {
      const value = { Id: 20, ...body }; groups.set(body.Title, value); return structuredClone(value);
    }
    match = path.match(/^\/_api\/web\/sitegroups\/getbyid\((\d+)\)\/users(?:\/removebyid\((\d+)\))?$/i);
    if (match) {
      const id = Number(match[1]), members = state.members.get(id) ?? new Set(); state.members.set(id, members);
      if (method === 'GET') return { value: members.has(55) ? [user()] : [] };
      if (match[2]) { members.delete(Number(match[2])); return null; }
      members.add(55); return user();
    }
    if (path.startsWith('/_api/web/folders/addUsingPath(')) {
      assert.ok(path.endsWith(',overwrite=false)'));
      state.folder = { Id: 101, UniqueId: folderId, HasUniqueRoleAssignments: false, RoleAssignments: structuredClone(state.index.RoleAssignments) };
      return { Exists: true, UniqueId: folderId, ServerRelativeUrl: `${root}/${domain}` };
    }
    if (path.startsWith('/_api/web/GetFolderByServerRelativePath(')) {
      const isCompany = path.includes(`${root}/${domain}'`), item = isCompany ? state.folder : state.index;
      if (!item) throw notFound();
      if (path.endsWith('/ListItemAllFields')) return structuredClone(item);
      return { Exists: true, UniqueId: item.UniqueId, ServerRelativeUrl: isCompany ? `${root}/${domain}` : root };
    }
    if (path.endsWith('/breakroleinheritance(false)')) {
      state.folder.HasUniqueRoleAssignments = true; state.folder.RoleAssignments = [grant(1, full)]; return null;
    }
    match = path.match(/\/roleassignments\/addroleassignment\(principalid=(\d+),roledefid=(\d+)\)$/);
    if (match) { state.folder.RoleAssignments.push(grant(Number(match[1]), Number(match[2]))); return null; }
    throw new Error(`Unmocked route ${method} ${path}`);
  };
  const adapter = createSharePointAdapter({ request, workspaces: { 'finance-and-banking': workspace } });
  const input = {
    groupId: 'finance-and-banking', domain, loginName, entraUserId,
    guard: async () => { sequence.push('guard'); return options.guard ? options.guard(state, calls) : true; },
    persistReceipt: async (value) => { if (options.persist) await options.persist(value); receipt = structuredClone(value); saved.push(receipt); sequence.push('persist'); return true; },
  };
  return { adapter, input, state, calls, saved, sequence, get receipt() { return receipt; } };
}

test('new company area is isolated before participant grants and verified ready', async () => {
  const f = fixture();
  const result = await f.adapter.ensure(f.input);
  assert.equal(result.status, 'ready');
  assert.equal(result.permissionsVerified, true);
  assert.equal(decodeURIComponent(new URL(result.folderUrl).pathname), `${root}/${domain}`);
  assert.equal(f.state.folder.HasUniqueRoleAssignments, true);
  assert.deepEqual(f.state.folder.RoleAssignments, [grant(1, full), grant(11, full), grant(12, edit), grant(20, 40)]);
  assert.deepEqual([...f.state.members.get(10)], [55]);
  assert.deepEqual([...f.state.members.get(20)], [55]);
  assert.ok(Object.values(result.receipt.memberships).every((x) => x.owned && x.status === 'granted'));
  const membership = f.calls.findIndex((x) => x.method === 'POST' && x.path.endsWith('/users'));
  assert.ok(f.calls.slice(0, membership).some((x) => x.path.endsWith('/ListItemAllFields') && x.path.includes(domain)));
  assert.ok(f.saved.some((x) => Object.values(x.memberships).some((m) => m.status === 'pending')));
  for (let i = 0; i < f.sequence.length; i++) if (f.sequence[i].startsWith('POST:')) {
    assert.equal(f.sequence[i - 1], 'guard');
    assert.equal(f.sequence[i + 1], 'guard');
  }
});

test('verified existing structures are reused and existing membership is not owned', async () => {
  const f = fixture({ companyGroup: true, folder: true, existingIndex: true, existingCompany: true });
  const result = await f.adapter.ensure(f.input);
  assert.equal(result.status, 'ready');
  assert.ok(Object.values(result.receipt.memberships).every((x) => x.owned === false));
  assert.equal(f.calls.some((x) => /breakroleinheritance|addUsingPath|addroleassignment/.test(x.path)), false);
  const before = f.calls.length;
  const revoked = await f.adapter.revoke({ ...f.input, receipt: result.receipt });
  assert.equal(revoked.status, 'manual-review');
  assert.equal(f.calls.slice(before).some((x) => x.method === 'POST'), false);
  assert.equal(f.state.members.get(20).has(55), true);
});

test('successful receipt resumes without duplicate membership writes', async () => {
  const f = fixture(); const first = await f.adapter.ensure(f.input);
  // SharePoint adds navigation plumbing to the parent when child grants appear.
  for (const id of [11, 12]) f.state.index.RoleAssignments.find(a => a.Member.Id === id)
    .RoleDefinitionBindings.push({ Id: 1073741825 });
  f.state.index.RoleAssignments.push(grant(20, 1073741825));
  const writes = f.calls.filter((x) => x.method === 'POST').length;
  const second = await f.adapter.ensure({ ...f.input, receipt: first.receipt });
  assert.equal(second.status, 'ready');
  assert.equal(f.calls.filter((x) => x.method === 'POST').length, writes);
});

test('withdrawal removes only owned references, keeps material, and verifies absence', async () => {
  const f = fixture(); const first = await f.adapter.ensure(f.input);
  const result = await f.adapter.revoke({ ...f.input, receipt: first.receipt });
  assert.equal(result.status, 'revoked');
  assert.equal(f.state.members.get(10).has(55), false);
  assert.equal(f.state.members.get(20).has(55), false);
  assert.ok(f.state.folder && f.state.groups.has(names.company));
  assert.ok(f.calls.filter((x) => x.path.includes('removebyid')).every((x) => x.method === 'POST'));
  assert.equal(f.calls.some((x) => x.method === 'DELETE'), false);
  const writes = f.calls.filter((x) => x.method === 'POST').length;
  assert.equal((await f.adapter.revoke({ ...f.input, receipt: result.receipt })).status, 'revoked');
  assert.equal(f.calls.filter((x) => x.method === 'POST').length, writes);
});

test('generic and absent domains are Teams-only with no SharePoint requests', async () => {
  for (const value of ['gmail.com', 'hotmail.co.uk', null, undefined]) {
    const f = fixture(); const result = await f.adapter.ensure({ ...f.input, domain: value });
    assert.equal(result.status, 'teams-only'); assert.equal(f.calls.length, 0);
  }
});

test('unknown groups, path injection, hostile identities and foreign receipts fail before I/O', async () => {
  for (const value of [{ groupId: 'technology' }, { groupId: 'not-configured' }, { domain: '../evil' }, { domain: 'x%2f..%2fy.com' }, { domain: 'example.com/..' }, { loginName: 'c:0t.c|tenant|everyone' }, { entraUserId: 'not-a-uuid' }]) {
    const f = fixture(); await assert.rejects(f.adapter.ensure({ ...f.input, ...value })); assert.equal(f.calls.length, 0);
  }
  for (const url of [siteUrl + '/../TechnologySourceIntake', siteUrl + '?x=1', 'http://openpropertydataassociation.sharepoint.com/sites/FinanceBankingSourceIntake', siteUrl.replace('openpropertydataassociation', 'evil')]) {
    assert.throws(() => createSharePointAdapter({ request() {}, workspaces: { 'finance-and-banking': { ...workspace, siteUrl: url } } }));
  }
  const f = fixture(); const first = await f.adapter.ensure(f.input); const before = f.calls.length;
  for (const patch of [{ domain: 'foreign.example' }, { siteUrl: siteUrl.replace('FinanceBanking', 'Technology') }, { entraUserId: '00000000-0000-0000-0000-000000000000' }]) {
    await assert.rejects(f.adapter.revoke({ ...f.input, receipt: { ...first.receipt, ...patch } }));
  }
  assert.equal(f.calls.length, before);
});

test('missing, false, throwing or object guards cannot grant', async () => {
  for (const guard of [undefined, async () => false, async () => ({}), async () => { throw new Error('private identity'); }]) {
    const f = fixture(); await assert.rejects(f.adapter.ensure({ ...f.input, guard }), /sharepoint-/);
    assert.equal(f.calls.some((x) => x.method === 'POST'), false);
  }
});

test('missing or failed receipt persistence blocks all mutations', async () => {
  for (const persistReceipt of [undefined, async () => false, async () => undefined, async () => { throw new Error('private storage details'); }]) {
    const f = fixture(); await assert.rejects(f.adapter.ensure({ ...f.input, persistReceipt }), /sharepoint-/);
    assert.equal(f.calls.some((x) => x.method === 'POST'), false);
  }
});

test('site sharing drift and custom role escalation block before mutation', async () => {
  for (const corrupt of [s => { s.site.GroupId = entraUserId; }, s => { s.site.ShareByEmailEnabled = true; }, s => { s.web.MembersCanShare = true; }, s => { s.roles.get(contributor).BasePermissions.Low = '4294967295'; }, s => { s.index.RoleAssignments.push(grant(999, full)); }]) {
    const f = fixture(); corrupt(f.state); await assert.rejects(f.adapter.ensure(f.input), /sharepoint-/);
    assert.equal(f.calls.some((x) => x.method === 'POST'), false);
  }
});

test('pre-existing foreign or inherited company ACLs are never cleared or repaired', async () => {
  for (const corrupt of [s => { s.folder.RoleAssignments.push(grant(999, 40)); }, s => { s.folder.HasUniqueRoleAssignments = false; }, s => { s.groups.get(names.company).AllowMembersEditMembership = true; }]) {
    const f = fixture({ companyGroup: true, folder: true }); corrupt(f.state);
    await assert.rejects(f.adapter.ensure(f.input), /sharepoint-/);
    assert.equal(f.calls.some((x) => x.method === 'POST'), false);
  }
});

test('ambiguous grant preserves unknown ownership and cannot blind retry or revoke it', async () => {
  const f = fixture({ intercept(call, state) {
    if (call.method === 'POST' && call.path === '/_api/web/sitegroups/getbyid(20)/users') {
      state.members.get(20).add(55); return Promise.reject(new Error('private remote timeout'));
    }
  } });
  await assert.rejects(f.adapter.ensure(f.input), error => error.code === 'sharepoint-effect-unknown' && error.status === 'manual-review');
  assert.equal(f.receipt.memberships.contributor.status, 'unknown');
  assert.equal(f.receipt.memberships.contributor.owned, null);
  const count = f.calls.filter((x) => x.method === 'POST').length;
  await assert.rejects(f.adapter.ensure({ ...f.input, receipt: f.receipt }), /sharepoint-effect-unknown/);
  const revoked = await f.adapter.revoke({ ...f.input, receipt: f.receipt });
  assert.equal(revoked.status, 'manual-review'); assert.equal(f.state.members.get(20).has(55), true);
  assert.equal(f.calls.filter((x) => x.method === 'POST').length, count);
});

test('guard rejection after a confirmed grant retains a revocable ownership receipt', async () => {
  const f = fixture({ guard: state => !state.members.get(20).has(55) });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-guard-rejected/);
  assert.equal(f.receipt.memberships.contributor.owned, true);
  assert.equal(f.state.members.get(10).has(55), false);
  const result = await f.adapter.revoke({ ...f.input, receipt: f.receipt, guard: async () => true });
  assert.equal(result.status, 'revoked'); assert.equal(f.state.members.get(20).has(55), false);
});

test('post-grant readback failure cannot report verified readiness', async () => {
  let granted = false;
  const f = fixture({ intercept(call) {
    if (call.method === 'POST' && call.path.endsWith('/users')) granted = true;
    if (granted && call.method === 'GET' && call.path.endsWith('/users')) return { value: [] };
  } });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-membership-unverified/);
  assert.equal(f.receipt.memberships.contributor.owned, true);
});

test('malformed collections and unsafe pagination fail closed without provider detail leakage', async () => {
  for (const response of [{ value: null }, { value: [], 'odata.nextLink': 'https://evil.invalid/steal' }]) {
    const f = fixture({ intercept: call => call.path === '/_api/web/siteusers' ? response : undefined });
    await assert.rejects(f.adapter.ensure(f.input), error => /^sharepoint-/.test(error.message) && !/evil|steal|private/.test(error.message));
    assert.equal(f.calls.some((x) => x.method === 'POST'), false);
  }
});

test('acknowledged folder creation can recover after its first readback fails', async () => {
  let failed = false;
  const f = fixture({ intercept(call, state) {
    if (!failed && state.folder && call.method === 'GET' && call.path.includes(domain) && !call.path.endsWith('/ListItemAllFields')) {
      failed = true; return Promise.reject(new Error('transient private response'));
    }
  } });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-read-failed/);
  assert.equal(f.receipt.effects['create-company-folder'], 'confirmed');
  const result = await f.adapter.ensure({ ...f.input, receipt: f.receipt });
  assert.equal(result.status, 'ready');
  assert.equal(f.calls.filter(x => x.path.startsWith('/_api/web/folders/addUsingPath(')).length, 1);
});

test('withdrawal with no membership effects needs no site user and no request', async () => {
  const f = fixture({ guard: state => !state.folder });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-guard-rejected/);
  assert.deepEqual(f.receipt.memberships, {});
  const before = f.calls.length;
  const result = await f.adapter.revoke({ ...f.input, receipt: f.receipt, guard: async () => true });
  assert.equal(result.status, 'revoked'); assert.equal(f.calls.length, before);
});

test('withdrawal accepts its bound receipt without repeating identity input', async () => {
  const f = fixture(); const first = await f.adapter.ensure(f.input);
  const result = await f.adapter.revoke({ groupId: f.input.groupId, receipt: first.receipt, guard: f.input.guard, persistReceipt: f.input.persistReceipt });
  assert.equal(result.status, 'revoked');
});

test('unknown removal remains attention even if a subsequent read sees absence', async () => {
  let removing = false;
  const f = fixture({ intercept(call, state) {
    if (removing && call.path === '/_api/web/sitegroups/getbyid(20)/users/removebyid(55)') {
      state.members.get(20).delete(55); return Promise.reject(new Error('ambiguous removal'));
    }
  } });
  const first = await f.adapter.ensure(f.input); removing = true;
  await assert.rejects(f.adapter.revoke({ ...f.input, receipt: first.receipt }), /sharepoint-effect-unknown/);
  assert.equal(f.receipt.memberships.contributor.status, 'unknown');
  const result = await f.adapter.revoke({ ...f.input, receipt: f.receipt });
  assert.equal(result.status, 'manual-review');
});

test('post-removal guard rejection still preserves the acknowledged removal', async () => {
  const f = fixture(); const first = await f.adapter.ensure(f.input);
  await assert.rejects(f.adapter.revoke({ ...f.input, receipt: first.receipt,
    guard: async () => f.state.members.get(20).has(55) }), /sharepoint-guard-rejected/);
  assert.equal(f.receipt.memberships.contributor.status, 'removed');
  assert.equal(f.receipt.effects['remove-contributor'], 'confirmed');
  assert.equal((await f.adapter.revoke({ ...f.input, receipt: f.receipt })).status, 'revoked');
});

test('final member readback catches a contributor grant disappearing during index grant', async () => {
  const f = fixture({ intercept(call, state) {
    if (call.method === 'POST' && call.path === '/_api/web/sitegroups/getbyid(10)/users') state.members.get(20).delete(55);
  } });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-membership-unverified/);
});

test('receipt contradictions and unsupported fields cannot authorize withdrawal', async () => {
  const f = fixture(); const first = await f.adapter.ensure(f.input), before = f.calls.length;
  for (const mutate of [
    r => { r.memberships.contributor.status = 'existing'; },
    r => { delete r.effects['grant-contributor']; },
    r => { r.memberships.contributor.role = 'administrator'; },
    r => { r.effects['grant-contributor'] = 'invented-success'; },
    r => { r.effects['remove-contributor'] = 'confirmed'; },
  ]) {
    const receipt = structuredClone(first.receipt); mutate(receipt);
    await assert.rejects(f.adapter.revoke({ ...f.input, receipt }), /sharepoint-receipt-mismatch/);
  }
  assert.equal(f.calls.length, before);
});

test('limited-access propagation at the shared index is accepted, not copied to a company', async () => {
  const f = fixture(); f.state.index.RoleAssignments.push(grant(999, 1073741825));
  assert.equal((await f.adapter.ensure(f.input)).status, 'ready');
  assert.equal(f.state.folder.RoleAssignments.some(a => a.Member.Id === 999), false);
});

test('a manually re-added membership after confirmed withdrawal is never removed again', async () => {
  const f = fixture(); const first = await f.adapter.ensure(f.input);
  const removed = await f.adapter.revoke({ ...f.input, receipt: first.receipt });
  f.state.members.get(20).add(55);
  const writes = f.calls.filter(x => x.method === 'POST').length;
  assert.equal((await f.adapter.revoke({ ...f.input, receipt: removed.receipt })).status, 'manual-review');
  assert.equal(f.calls.filter(x => x.method === 'POST').length, writes);
});

test('a replaced folder cannot reuse creation acknowledgement to reset its ACL', async () => {
  const f = fixture({ guard: state => !state.folder });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-guard-rejected/);
  const receipt = f.receipt, writes = f.calls.filter(x => x.method === 'POST').length;
  assert.equal(receipt.folder.uniqueId, folderId);
  f.state.folder.UniqueId = '99999999-2222-3333-4444-555555555555';
  await assert.rejects(f.adapter.ensure({ ...f.input, receipt, guard: async () => true }), /sharepoint-folder-identity-mismatch/);
  assert.equal(f.calls.filter(x => x.method === 'POST').length, writes);
});

test('a persisted removal intent with no acknowledgement stays attention even when absent', async () => {
  const f = fixture(); const first = await f.adapter.ensure(f.input);
  first.receipt.effects['remove-contributor'] = 'pending';
  f.state.members.get(20).delete(55);
  const result = await f.adapter.revoke({ ...f.input, receipt: first.receipt });
  assert.equal(result.status, 'manual-review');
  assert.equal(result.receipt.effects['remove-contributor'], 'pending');
  assert.equal(result.receipt.memberships.contributor.status, 'granted');
});

test('limited access cannot substitute for a required index permission', async () => {
  const f = fixture(); f.state.index.RoleAssignments.find(a => a.Member.Id === 10).RoleDefinitionBindings[0].Id = 1073741825;
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-unexpected-acl/);
  assert.equal(f.calls.some(x => x.method === 'POST'), false);
});

test('limited access cannot mask extra, duplicate or foreign effective permissions', async () => {
  for (const [principal, roles] of [[11, [full, edit]], [11, [full, full]],
    [11, [full, 1073741825, 1073741825]], [999, [edit, 1073741825]]]) {
    const f = fixture();
    f.state.index.RoleAssignments = f.state.index.RoleAssignments.filter(a => a.Member.Id !== principal);
    f.state.index.RoleAssignments.push({ Member: { Id: principal }, RoleDefinitionBindings: roles.map(Id => ({ Id })) });
    await assert.rejects(f.adapter.ensure(f.input), /sharepoint-unexpected-acl/);
    assert.equal(f.calls.some(x => x.method === 'POST'), false);
  }
  const f = fixture({ companyGroup: true, folder: true });
  f.state.folder.RoleAssignments.find(a => a.Member.Id === 20).RoleDefinitionBindings.push({ Id: 1073741825 });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-unexpected-acl/);
  assert.equal(f.calls.some(x => x.method === 'POST'), false);
});

test('failed acknowledgement persistence leaves an uncertain durable intent, never a blind retry', async () => {
  let refuse = true;
  const f = fixture({ persist: receipt => { if (refuse && receipt.memberships.contributor?.owned) throw new Error('private CAS failure'); } });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-receipt-save-failed/);
  assert.equal(f.receipt.memberships.contributor.owned, null);
  assert.equal(f.receipt.effects['grant-contributor'], 'pending');
  assert.equal(f.state.members.get(20).has(55), true); assert.equal(f.state.members.get(10).has(55), false);
  refuse = false;
  assert.equal((await f.adapter.revoke({ ...f.input, receipt: f.receipt })).status, 'manual-review');
  assert.equal(f.state.members.get(20).has(55), true);
});

test('same-domain operations cannot overlap within an adapter instance', async () => {
  let release;
  const f = fixture(), held = new Promise(resolve => { release = resolve; });
  const first = f.adapter.ensure({ ...f.input, guard: async () => { await held; return true; } });
  await assert.rejects(f.adapter.ensure(f.input), /sharepoint-operation-in-progress/);
  release(); assert.equal((await first).status, 'ready');
});

test('static error status distinguishes retryable reads and guards from policy and permission failures', async () => {
  for (const [httpStatus, code, status] of [[503, 'read-failed', 'pending'], [429, 'read-failed', 'pending'], [401, 'permission-denied', 'manual-review'], [403, 'permission-denied', 'manual-review']]) {
    const f = fixture({ intercept: () => Promise.reject(Object.assign(new Error('private identity or provider details'), { status: httpStatus })) });
    await assert.rejects(f.adapter.ensure(f.input), error => error.code === `sharepoint-${code}` && error.status === status && error.message === error.code);
  }
  const f = fixture();
  await assert.rejects(f.adapter.ensure({ ...f.input, guard: async () => false }), error => error.code === 'sharepoint-guard-rejected' && error.status === 'pending');
  f.state.web.MembersCanShare = true;
  await assert.rejects(f.adapter.ensure(f.input), error => error.code === 'sharepoint-site-policy-drift' && error.status === 'manual-review');
});

test('current reapproval restores absent confirmed removals as fresh owned grants', async () => {
  const f = fixture(), first = await f.adapter.ensure(f.input);
  const removed = await f.adapter.revoke({ ...f.input, receipt: first.receipt }), before = f.calls.length;
  const renewed = await f.adapter.ensure({ ...f.input, receipt: removed.receipt });
  assert.equal(renewed.status, 'ready');
  for (const key of ['contributor', 'index']) {
    assert.deepEqual(renewed.receipt.memberships[key], { ...removed.receipt.memberships[key], status: 'granted' });
    assert.equal(renewed.receipt.effects[`grant-${key}`], 'confirmed');
    assert.equal(renewed.receipt.effects[`remove-${key}`], undefined);
  }
  assert.deepEqual(f.calls.slice(before).filter(x => x.method === 'POST').map(x => x.path), [
    '/_api/web/sitegroups/getbyid(20)/users', '/_api/web/sitegroups/getbyid(10)/users',
  ]);
  assert.equal((await f.adapter.ensure({ ...f.input, receipt: renewed.receipt })).status, 'ready');
  assert.equal((await f.adapter.revoke({ ...f.input, receipt: renewed.receipt })).status, 'revoked');
});

test('reapproval preserves independently re-added membership as manual, including mixed ownership', async () => {
  for (const manualIds of [[20, 10], [20]]) {
    const f = fixture(), first = await f.adapter.ensure(f.input);
    const removed = await f.adapter.revoke({ ...f.input, receipt: first.receipt });
    for (const id of manualIds) f.state.members.get(id).add(55);
    const before = f.calls.length, renewed = await f.adapter.ensure({ ...f.input, receipt: removed.receipt });
    assert.equal(renewed.status, 'ready');
    for (const [key, member] of Object.entries(renewed.receipt.memberships)) if (manualIds.includes(member.groupId)) {
      assert.equal(member.owned, false); assert.equal(member.status, 'existing');
      assert.equal(renewed.receipt.effects[`grant-${key}`], undefined); assert.equal(renewed.receipt.effects[`remove-${key}`], undefined);
    }
    const withdrawn = await f.adapter.revoke({ ...f.input, receipt: renewed.receipt });
    assert.equal(withdrawn.status, 'manual-review');
    for (const id of manualIds) assert.equal(f.state.members.get(id).has(55), true);
    assert.equal(f.calls.slice(before).some(x => x.method === 'POST' && x.path.includes('getbyid(20)')), false);
    assert.equal(f.state.members.get(10).has(55), manualIds.includes(10));
  }
});

test('stale reapproval guards cannot restart grants and acknowledged new grants remain revocable', async () => {
  for (const phase of ['initial', 'after-read', 'after-grant']) {
    let reapproving = false, allowed = true;
    const f = fixture({ intercept(call) {
      if (reapproving && call.path === '/_api/web/sitegroups/getbyid(20)/users'
        && ((phase === 'after-read' && call.method === 'GET') || (phase === 'after-grant' && call.method === 'POST'))) allowed = false;
    } });
    const first = await f.adapter.ensure(f.input), removed = await f.adapter.revoke({ ...f.input, receipt: first.receipt });
    reapproving = true; allowed = phase !== 'initial'; const before = f.calls.length;
    await assert.rejects(f.adapter.ensure({ ...f.input, receipt: removed.receipt, guard: async () => allowed }), /sharepoint-guard-rejected/);
    const writes = f.calls.slice(before).filter(x => x.method === 'POST');
    assert.equal(writes.length, phase === 'after-grant' ? 1 : 0);
    if (phase === 'after-grant') {
      assert.equal(f.receipt.memberships.contributor.status, 'granted');
      assert.equal(f.receipt.effects['remove-contributor'], undefined);
      reapproving = false;
      assert.equal((await f.adapter.revoke({ ...f.input, receipt: f.receipt })).status, 'revoked');
    } else assert.deepEqual(f.receipt.memberships, removed.receipt.memberships);
  }
});

test('reapproval cannot clear pending or unknown removal intents', async () => {
  for (const status of ['pending', 'unknown']) {
    const f = fixture(), first = await f.adapter.ensure(f.input), before = f.calls.length;
    first.receipt.effects['remove-contributor'] = status;
    if (status === 'unknown') first.receipt.memberships.contributor.status = 'unknown';
    f.state.members.get(20).delete(55);
    await assert.rejects(f.adapter.ensure({ ...f.input, receipt: first.receipt }), error => error.code === 'sharepoint-effect-unknown' && error.status === 'manual-review');
    assert.equal(f.calls.length, before);
  }
});
