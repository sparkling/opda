import { GENERIC_EMAIL_DOMAINS } from '../agents/working-group-inbox/domain.mjs';

const ORIGIN = 'https://openpropertydataassociation.sharepoint.com';
const ZERO = '00000000-0000-0000-0000-000000000000';
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const GROUPS = {
  'finance-and-banking': ['Finance and Banking', 'FinanceBankingSourceIntake'],
  conveyancing: ['Conveyancing', 'ConveyancingSourceIntake'],
  'estate-agency': ['Estate Agency', 'EstateAgencySourceIntake'],
  'surveying-and-valuation': ['Surveying and Valuation', 'SurveyingValuationSourceIntake'],
  'property-data-services': ['Property Data Services', 'PropertyDataServicesSourceIntake'],
  'property-technology': ['Property Technology', 'PropertyTechnologySourceIntake'],
};
const FULL = 1073741829, EDIT = 1073741830, LIMITED = 1073741825;
const ROLE_NAMES = ['Manage Organisation Area - No Sharing', 'Browse Organisation Folder Index'];
const ROLE_BITS = [{ High: '432', Low: '1011028719' }, { High: '48', Low: '134418465' }];
const EFFECT_KEY = /^(?:ensure-user|create-company-(?:group|folder)|break-folder-inheritance|folder-role-[1-9][0-9]*|(?:grant|remove)-(?:contributor|index))$/;
const ACL_QUERY = '?$select=Id,HasUniqueRoleAssignments,RoleAssignments/Member/Id,RoleAssignments/RoleDefinitionBindings/Id&$expand=RoleAssignments/Member,RoleAssignments/RoleDefinitionBindings';
const quote = value => `'${encodeURIComponent(value.replaceAll("'", "''"))}'`;
const positive = value => Number.isSafeInteger(value) && value > 0;
const clone = value => structuredClone(value);
const TRANSIENT = new Set(['read-failed', 'guard-rejected', 'receipt-save-failed', 'membership-unverified', 'operation-in-progress']);
const failure = code => Object.assign(new Error(`sharepoint-${code}`), {
  code: `sharepoint-${code}`, status: TRANSIENT.has(code) ? 'pending' : 'manual-review',
});
function requireValue(condition, code = 'invalid-input') { if (!condition) throw failure(code); }
function plain(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value))
    && Object.values(Object.getOwnPropertyDescriptors(value)).every(item => !item.get && !item.set);
}
function companyDomain(value) {
  if (value === null || value === undefined) return null;
  requireValue(typeof value === 'string' && value.length <= 253 && value === value.trim());
  const domain = value.toLowerCase();
  requireValue(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(domain)
    && domain.split('.').every(part => part.length <= 63) && !/^\d+(?:\.\d+){3}$/.test(domain));
  return GENERIC_EMAIL_DOMAINS.has(domain) ? null : domain;
}
function login(value) {
  requireValue(typeof value === 'string' && value.length <= 512 && /^i:0#\.f\|membership\|[^\s|/\\'<>]+@[^\s|/\\'<>]+$/i.test(value)
    && !/[\p{Cc}\p{Cf}]/u.test(value));
  return value.toLowerCase();
}
function configuredWorkspaces(source) {
  requireValue(Array.isArray(source) || plain(source));
  const entries = Array.isArray(source) ? source.map(row => { requireValue(plain(row)); return [row.id, row.workspace]; }) : Object.entries(source);
  const result = new Map();
  for (const [id, value] of entries) {
    if (!Object.hasOwn(GROUPS, id)) continue;
    requireValue(!result.has(id) && plain(value));
    const [label, path] = GROUPS[id], siteUrl = `${ORIGIN}/sites/${path}`;
    requireValue(value.siteUrl === siteUrl && value.contributorGroupPrefix === `${label} Contributors - `
      && value.indexGroup === `${label} Organisation Index Users`);
    result.set(id, { siteUrl, indexGroup: value.indexGroup, prefix: value.contributorGroupPrefix,
      adminGroup: `${label} Intake Administrators`, processorGroup: `${label} Intake Processors`,
      folderRoot: `/sites/${path}/Incoming Source Material/By Organisation` });
  }
  requireValue(result.size > 0);
  return result;
}

/** Request returns parsed nometadata JSON; rejected requests may expose status/statusCode.
 * The caller must verify the approved company/identity binding and provide durable CAS
 * persistence plus current-decision guards. Neither this module nor receipts grant policy authority.
 */
export function createSharePointAdapter({ request, workspaces } = {}) {
  requireValue(typeof request === 'function');
  const registry = configuredWorkspaces(workspaces), active = new Set();

  function context(input, mode) {
    requireValue(plain(input) && registry.has(input.groupId));
    requireValue(typeof input.guard === 'function' && typeof input.persistReceipt === 'function');
    const stored = input.receipt;
    if (stored !== undefined && stored !== null) requireValue(plain(stored), 'receipt-mismatch');
    const field = key => input[key] === undefined && mode === 'revoke' ? stored?.[key] : input[key];
    const workspace = registry.get(input.groupId), domain = companyDomain(field('domain'));
    const loginName = login(field('loginName')), entraUserId = field('entraUserId');
    requireValue(typeof entraUserId === 'string' && UUID.test(entraUserId) && entraUserId !== ZERO);
    const binding = { version: 1, groupId: input.groupId, siteUrl: workspace.siteUrl, domain,
      entraUserId: entraUserId.toLowerCase(), loginName };
    let receipt = { ...binding, effects: {}, memberships: {}, folder: null };
    if (stored !== undefined && stored !== null) {
      requireValue(Object.keys(binding).every(key => stored[key] === binding[key]), 'receipt-mismatch');
      requireValue(Object.keys(stored).every(key => [...Object.keys(binding), 'effects', 'memberships', 'folder'].includes(key))
        && plain(stored.effects) && plain(stored.memberships), 'receipt-mismatch');
      requireValue(Object.entries(stored.effects).every(([key, value]) => EFFECT_KEY.test(key)
        && ['pending', 'confirmed', 'cancelled', 'unknown'].includes(value)), 'receipt-mismatch');
      for (const [key, member] of Object.entries(stored.memberships)) {
        requireValue(['contributor', 'index'].includes(key) && plain(member)
          && Object.keys(member).every(k => ['groupId', 'userId', 'owned', 'status'].includes(k))
          && positive(member.groupId) && positive(member.userId), 'receipt-mismatch');
        const grant = stored.effects[`grant-${key}`], remove = stored.effects[`remove-${key}`];
        requireValue((member.owned === false && member.status === 'existing' && grant === undefined && remove === undefined)
          || (member.owned === null && ((member.status === 'pending' && ['pending', 'cancelled'].includes(grant))
            || (member.status === 'unknown' && grant === 'unknown')) && remove === undefined)
          || (member.owned === true && grant === 'confirmed' && ((member.status === 'granted' && [undefined, 'pending', 'cancelled'].includes(remove))
            || (member.status === 'removed' && [undefined, 'confirmed', 'cancelled'].includes(remove))
            || (member.status === 'unknown' && remove === 'unknown'))), 'receipt-mismatch');
      }
      for (const key of ['contributor', 'index']) requireValue(!stored.effects[`grant-${key}`]
        && !stored.effects[`remove-${key}`] || Object.hasOwn(stored.memberships, key), 'receipt-mismatch');
      if (stored.folder !== null) requireValue(plain(stored.folder)
        && Object.keys(stored.folder).every(key => ['path', 'itemId', 'uniqueId', 'created'].includes(key))
        && stored.folder.path === `${workspace.folderRoot}/${domain}` && UUID.test(stored.folder.uniqueId)
        && stored.folder.uniqueId !== ZERO && typeof stored.folder.created === 'boolean'
        && (positive(stored.folder.itemId) || (stored.folder.itemId === null && stored.folder.created))
        && (!stored.folder.created || stored.effects['create-company-folder'] === 'confirmed'), 'receipt-mismatch');
      receipt = clone(stored);
    } else requireValue(mode !== 'revoke', 'receipt-required');
    return { input, workspace, domain, loginName, receipt, mode, key: `${workspace.siteUrl}|${domain}` };
  }
  async function guard(ctx) {
    let allowed; try { allowed = await ctx.input.guard(); } catch { throw failure('guard-rejected'); }
    requireValue(allowed === true, 'guard-rejected');
  }
  async function save(ctx) {
    let saved; try { saved = await ctx.input.persistReceipt(clone(ctx.receipt)); } catch { throw failure('receipt-save-failed'); }
    requireValue(saved === true, 'receipt-save-failed');
  }
  async function read(ctx, route, missing = false) {
    try { return await request(ctx.workspace.siteUrl, route, { method: 'GET' }); }
    catch (error) {
      if (missing && [error?.status, error?.statusCode].includes(404)) return null;
      throw failure([error?.status, error?.statusCode].some(code => [401, 403].includes(code)) ? 'permission-denied' : 'read-failed');
    }
  }
  async function collection(ctx, route) {
    const values = [], visited = new Set(); let next = route;
    while (next) {
      requireValue(!visited.has(next) && visited.size < 20, 'invalid-response'); visited.add(next);
      const response = await read(ctx, next);
      requireValue(plain(response) && Array.isArray(response.value), 'invalid-response'); values.push(...response.value);
      requireValue(values.length <= 5000, 'invalid-response');
      next = response['odata.nextLink'] ?? response['@odata.nextLink'];
      if (next) {
        requireValue(typeof next === 'string' && !/[\\\s]|%2e|%2f|%5c/i.test(next) && !next.includes('..'), 'invalid-response');
        let url; try { url = new URL(next, ctx.workspace.siteUrl); } catch { throw failure('invalid-response'); }
        requireValue(url.origin === ORIGIN && url.pathname.startsWith(new URL(ctx.workspace.siteUrl).pathname + '/_api/')
          && !url.hash && !url.username && !url.password, 'invalid-response');
        next = url.pathname.slice(new URL(ctx.workspace.siteUrl).pathname.length) + url.search;
      }
    }
    return values;
  }
  async function mutate(ctx, key, route, body, acknowledge, uncertain) {
    requireValue(!['pending', 'unknown'].includes(ctx.receipt.effects[key]), 'effect-unknown');
    ctx.receipt.effects[key] = 'pending'; await save(ctx);
    try { await guard(ctx); } catch (error) { ctx.receipt.effects[key] = 'cancelled'; await save(ctx); throw error; }
    let response;
    try { response = await request(ctx.workspace.siteUrl, route, { method: 'POST', ...(body === undefined ? {} : { body }) }); }
    catch {
      try { await guard(ctx); } catch { /* Record uncertainty even when withdrawal won the race. */ }
      ctx.receipt.effects[key] = 'unknown'; uncertain?.(); await save(ctx); throw failure('effect-unknown');
    }
    let stale; try { await guard(ctx); } catch (error) { stale = error; }
    ctx.receipt.effects[key] = 'confirmed';
    // Acknowledged ownership/removal must survive a post-effect guard rejection.
    try { acknowledge?.(response); } catch {
      ctx.receipt.effects[key] = 'unknown'; uncertain?.(); await save(ctx); throw failure('invalid-response');
    }
    await save(ctx);
    if (stale) throw stale;
    return response;
  }
  async function group(ctx, title, missing = false) {
    const value = await read(ctx, `/_api/web/sitegroups/getbyname(${quote(title)})`, missing);
    if (!value) return null;
    requireValue(positive(value.Id) && value.Title === title && value.AllowMembersEditMembership === false
      && value.OnlyAllowMembersViewMembership === true && value.AllowRequestToJoinLeave === false
      && value.AutoAcceptRequestToJoinLeave === false, 'group-policy-drift');
    return value;
  }
  function acl(item, expected, admins, { missing = false, index = false, itemId } = {}) {
    requireValue(item?.HasUniqueRoleAssignments === true && Array.isArray(item.RoleAssignments)
      && (itemId === undefined || item.Id === itemId), 'unexpected-acl');
    const seen = new Set();
    for (const assignment of item.RoleAssignments) {
      const id = assignment?.Member?.Id, roles = assignment?.RoleDefinitionBindings;
      requireValue(positive(id) && !seen.has(id) && Array.isArray(roles) && roles.length > 0
        && roles.length <= (index ? 2 : 1) && roles.every(role => positive(role?.Id)), 'unexpected-acl');
      const roleIds = roles.map(role => role.Id);
      requireValue(new Set(roleIds).size === roleIds.length, 'unexpected-acl');
      seen.add(id);
      // Child grants add Limited Access to the parent, including its existing admins.
      // It is navigation plumbing, never a substitute for any required effective role.
      if (index && !expected.has(id) && roleIds.length === 1 && roleIds[0] === LIMITED) continue;
      const effectiveRoles = index ? roleIds.filter(role => role !== LIMITED) : roleIds;
      requireValue(effectiveRoles.length === 1
        && effectiveRoles[0] === (expected.get(id) ?? (admins.has(id) ? FULL : undefined)), 'unexpected-acl');
    }
    if (!missing) requireValue([...expected.keys()].every(id => seen.has(id)), 'unexpected-acl');
    return seen;
  }
  const folderRoute = path => `/_api/web/GetFolderByServerRelativePath(DecodedUrl=${quote(path)})`;
  const itemRoute = id => `/_api/web/lists/getbytitle('Incoming%20Source%20Material')/items(${id})`;

  async function baseline(ctx) {
    const site = await read(ctx, '/_api/site?$select=GroupId,ShareByEmailEnabled');
    const web = await read(ctx, '/_api/web?$select=MembersCanShare,RequestAccessEmail');
    requireValue(site?.GroupId === ZERO && site.ShareByEmailEnabled === false && web?.MembersCanShare === false
      && web.RequestAccessEmail === '', 'site-policy-drift');
    const roles = [];
    for (const [i, name] of ROLE_NAMES.entries()) {
      const role = await read(ctx, `/_api/web/roledefinitions/getbyname(${quote(name)})`);
      requireValue(role?.Name === name && positive(role.Id) && role.BasePermissions?.High === ROLE_BITS[i].High
        && role.BasePermissions?.Low === ROLE_BITS[i].Low, 'role-policy-drift'); roles.push(role.Id);
    }
    const index = await group(ctx, ctx.workspace.indexGroup), admin = await group(ctx, ctx.workspace.adminGroup);
    const processor = await group(ctx, ctx.workspace.processorGroup);
    const owner = await read(ctx, '/_api/web/AssociatedOwnerGroup?$select=Id');
    const adminUsers = await collection(ctx, '/_api/web/siteusers?$filter=IsSiteAdmin%20eq%20true&$select=Id');
    requireValue(positive(owner?.Id) && adminUsers.length > 0 && adminUsers.every(user => positive(user.Id)), 'invalid-response');
    const admins = new Set([owner.Id, ...adminUsers.map(user => user.Id)]);
    const indexItem = await read(ctx, folderRoute(ctx.workspace.folderRoot) + '/ListItemAllFields' + ACL_QUERY);
    acl(indexItem, new Map([[index.Id, roles[1]], [admin.Id, FULL], [processor.Id, EDIT]]), admins, { index: true });
    return { index, admin, processor, admins, contributorRole: roles[0] };
  }
  async function ensureStructure(ctx, base) {
    const title = ctx.workspace.prefix + ctx.domain, path = `${ctx.workspace.folderRoot}/${ctx.domain}`;
    let company = await group(ctx, title, true);
    if (!company) {
      await mutate(ctx, 'create-company-group', '/_api/web/sitegroups', { Title: title, Description: 'Private company source intake.',
        AllowMembersEditMembership: false, OnlyAllowMembersViewMembership: true, AllowRequestToJoinLeave: false,
        AutoAcceptRequestToJoinLeave: false, RequestToJoinLeaveEmailSetting: '' });
      company = await group(ctx, title);
    }
    let folder = await read(ctx, folderRoute(path), true);
    if (!folder) {
      requireValue(!ctx.receipt.folder, 'folder-identity-mismatch');
      await mutate(ctx, 'create-company-folder', `/_api/web/folders/addUsingPath(decodedUrl=${quote(path)},overwrite=false)`, undefined, value => {
        requireValue(value?.Exists === true && value.ServerRelativeUrl === path && UUID.test(value.UniqueId) && value.UniqueId !== ZERO, 'invalid-response');
        ctx.receipt.folder = { path, itemId: null, uniqueId: value.UniqueId.toLowerCase(), created: true };
      });
      folder = await read(ctx, folderRoute(path));
    }
    requireValue(folder?.Exists === true && folder.ServerRelativeUrl === path && UUID.test(folder.UniqueId)
      && folder.UniqueId !== ZERO, 'folder-identity-mismatch');
    let item = await read(ctx, folderRoute(path) + '/ListItemAllFields' + ACL_QUERY);
    requireValue(positive(item?.Id), 'invalid-response');
    const prior = ctx.receipt.folder;
    if (prior) requireValue(prior.path === path && (prior.itemId === null || prior.itemId === item.Id)
      && prior.uniqueId === folder.UniqueId.toLowerCase(), 'folder-identity-mismatch');
    const created = prior?.created === true;
    ctx.receipt.folder = { path, itemId: item.Id, uniqueId: folder.UniqueId.toLowerCase(), created }; await save(ctx);
    const expected = new Map([[base.admin.Id, FULL], [base.processor.Id, EDIT], [company.Id, base.contributorRole]]);
    if (!item.HasUniqueRoleAssignments) {
      requireValue(created, 'unexpected-acl');
      await mutate(ctx, 'break-folder-inheritance', itemRoute(item.Id) + '/breakroleinheritance(false)');
      item = await read(ctx, folderRoute(path) + '/ListItemAllFields' + ACL_QUERY);
    }
    const present = acl(item, expected, base.admins, { missing: created, itemId: ctx.receipt.folder.itemId });
    if (created) for (const [principalid, roledefid] of expected) if (!present.has(principalid)) {
      await mutate(ctx, `folder-role-${principalid}`, itemRoute(item.Id) + `/roleassignments/addroleassignment(principalid=${principalid},roledefid=${roledefid})`);
    }
    acl(await read(ctx, folderRoute(path) + '/ListItemAllFields' + ACL_QUERY), expected, base.admins, { itemId: ctx.receipt.folder.itemId });
    return { company, expected, path };
  }
  async function siteUser(ctx, create) {
    const route = `/_api/web/siteusers?$filter=${encodeURIComponent(`LoginName eq '${ctx.loginName.replaceAll("'", "''")}'`)}&$select=Id,LoginName,IsSiteAdmin`;
    let users = await collection(ctx, route);
    requireValue(users.length <= 1, 'identity-mismatch');
    if (!users.length && create) {
      await mutate(ctx, 'ensure-user', '/_api/web/ensureuser', { logonName: ctx.loginName }); users = await collection(ctx, route);
    }
    requireValue(users.length === 1 && positive(users[0]?.Id) && users[0].LoginName?.toLowerCase() === ctx.loginName
      && users[0].IsSiteAdmin === false, 'identity-mismatch');
    return users[0];
  }
  async function membership(ctx, groupId, userId) {
    const users = await collection(ctx, `/_api/web/sitegroups/getbyid(${groupId})/users?$filter=Id%20eq%20${userId}&$select=Id,LoginName`);
    requireValue(users.length <= 1 && users.every(user => user.Id === userId && user.LoginName?.toLowerCase() === ctx.loginName), 'identity-mismatch');
    return users.length === 1;
  }
  async function ensureMembership(ctx, key, groupId, userId) {
    const old = ctx.receipt.memberships[key];
    if (old) requireValue(old.groupId === groupId && old.userId === userId, 'receipt-mismatch');
    requireValue(!old || !['pending', 'unknown'].includes(old.status), 'effect-unknown');
    const present = await membership(ctx, groupId, userId);
    const renewed = old?.status === 'removed';
    if (renewed) {
      // Current approval may restart completed grants, never reclaim a manual re-add.
      await guard(ctx);
      delete ctx.receipt.effects[`grant-${key}`]; delete ctx.receipt.effects[`remove-${key}`];
    }
    if (old?.owned === true && !renewed) { requireValue(present, 'membership-unverified'); return; }
    if (present) { ctx.receipt.memberships[key] = { groupId, userId, owned: false, status: 'existing' }; await save(ctx); return; }
    const member = { groupId, userId, owned: null, status: 'pending' }; ctx.receipt.memberships[key] = member;
    await mutate(ctx, `grant-${key}`, `/_api/web/sitegroups/getbyid(${groupId})/users`, { LoginName: ctx.loginName },
      () => { member.owned = true; member.status = 'granted'; }, () => { member.owned = null; member.status = 'unknown'; });
    requireValue(await membership(ctx, groupId, userId), 'membership-unverified');
  }
  async function run(input, mode, operation) {
    const ctx = context(input, mode); requireValue(!active.has(ctx.key), 'operation-in-progress'); active.add(ctx.key);
    try { await guard(ctx); return await operation(ctx); } finally { active.delete(ctx.key); }
  }
  return {
    ensure(input) { return run(input, 'ensure', async ctx => {
      if (!ctx.domain) return { status: 'teams-only', permissionsVerified: false, receipt: null };
      requireValue(!Object.values(ctx.receipt.effects).some(status => ['pending', 'unknown'].includes(status)), 'effect-unknown');
      const base = await baseline(ctx);
      const structure = await ensureStructure(ctx, base), user = await siteUser(ctx, true);
      await ensureMembership(ctx, 'contributor', structure.company.Id, user.Id);
      await ensureMembership(ctx, 'index', base.index.Id, user.Id);
      acl(await read(ctx, folderRoute(structure.path) + '/ListItemAllFields' + ACL_QUERY), structure.expected, base.admins, { itemId: ctx.receipt.folder.itemId });
      requireValue(await membership(ctx, structure.company.Id, user.Id) && await membership(ctx, base.index.Id, user.Id), 'membership-unverified');
      await guard(ctx); await save(ctx);
      return { status: 'ready', permissionsVerified: true, folderUrl: ORIGIN + structure.path.split('/').map(encodeURIComponent).join('/'), receipt: clone(ctx.receipt) };
    }); },
    revoke(input) { return run(input, 'revoke', async ctx => {
      requireValue(ctx.domain !== null, 'receipt-mismatch');
      if (!Object.keys(ctx.receipt.memberships).length) {
        await guard(ctx); return { status: 'revoked', membershipsVerified: true, receipt: clone(ctx.receipt) };
      }
      const user = await siteUser(ctx, false); let retained = false;
      for (const key of ['contributor', 'index']) {
        const member = ctx.receipt.memberships[key]; if (!member) continue;
        const title = key === 'index' ? ctx.workspace.indexGroup : ctx.workspace.prefix + ctx.domain;
        const target = await group(ctx, title);
        requireValue(member.groupId === target.Id && member.userId === user.Id, 'receipt-mismatch');
        const present = await membership(ctx, target.Id, user.Id);
        if (['pending', 'unknown'].includes(member.status) || ['pending', 'unknown'].includes(ctx.receipt.effects[`remove-${key}`])) { retained = true; continue; }
        if (member.owned !== true) { retained ||= present; continue; }
        if (member.status === 'removed') { retained ||= present; continue; }
        if (present) await mutate(ctx, `remove-${key}`, `/_api/web/sitegroups/getbyid(${target.Id})/users/removebyid(${user.Id})`, undefined,
          () => { member.status = 'removed'; }, () => { member.status = 'unknown'; });
        requireValue(!(await membership(ctx, target.Id, user.Id)), 'membership-unverified'); member.status = 'removed'; await save(ctx);
      }
      await guard(ctx);
      return { status: retained ? 'manual-review' : 'revoked', membershipsVerified: !retained, receipt: clone(ctx.receipt) };
    }); },
  };
}
