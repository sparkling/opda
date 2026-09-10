import { readApprovedSession } from '../../config/aws/auth-session/session.mjs';
import { createStore as createSessionStore } from '../../config/aws/auth-session/store.mjs';
import { createSecrets } from './index.mjs';
import { createMicrosoftClient } from './microsoft-auth.mjs';
import { createReceiptProtection } from './receipt-protection.mjs';
import { createGraphAdapter } from './graph.mjs';
import { WORKSPACES } from './settings.mjs';
import { createWorkspaceStore } from './workspace-store.mjs';
import { createWorkspaceFlow } from './workspace-flow.mjs';

function configuration(env) {
  const config = { region: 'eu-west-2', participantsTableName: env.PARTICIPANTS_TABLE_NAME,
    sessionsTableName: env.SESSIONS_TABLE_NAME, microsoftSecretArn: env.MICROSOFT_SECRET_ARN };
  if (config.participantsTableName !== 'opda-participants' || config.sessionsTableName !== 'opda-participant-sessions'
    || env.AWS_REGION && env.AWS_REGION !== config.region
    || !/^arn:aws:secretsmanager:eu-west-2:355653384628:secret:opda\/microsoft\/participation-onboarding-[A-Za-z0-9]{6}$/.test(config.microsoftSecretArn ?? '')) {
    throw new Error('Workspace service configuration unavailable');
  }
  return config;
}

export function createWorkspaceEntry({ env = process.env, now = Date.now, factories = {}, getSecretValue } = {}) {
  let runtime;
  function initialise() {
    const config = configuration(env);
    const secrets = createSecrets(config, { now, getSecretValue });
    const sessionStore = (factories.sessionStore ?? createSessionStore)(config);
    const microsoft = (factories.microsoft ?? createMicrosoftClient)({ getSecret: secrets.microsoft,
      // A measured silent invitation refresh takes about three seconds. Keep
      // per-request headroom within the separate ten-second Lambda boundary.
      siteUrls: Object.values(WORKSPACES).map(w => w.siteUrl), now, timeoutMs: 4000 });
    const receiptHooks = Object.fromEntries(['protectReceipts', 'unprotectReceipts'].map(method => [method, async (value, participantId) => {
      const secret = await secrets.microsoft();
      return createReceiptProtection(secret.receiptEncryptionKey)[method](value, participantId);
    }]));
    const store = (factories.store ?? createWorkspaceStore)({ tableName: config.participantsTableName, now, ...receiptHooks });
    // Reuse the audited Graph client, but this service cannot write memberships,
    // accounts, Teams, SharePoint or mail even if a later adapter accidentally asks.
    const graph = (factories.graph ?? createGraphAdapter)({ workspaces: WORKSPACES, request: (route, options = {}) => {
      const method = options.method ?? 'GET';
      if (method !== 'GET' && !(method === 'POST' && route === '/invitations'
        && options.body?.sendInvitationMessage === false && options.body?.resetRedemption === false)) {
        throw new Error('Workspace operation is not permitted');
      }
      return microsoft.graph(route, options);
    } });
    return { sessionStore, store, graph };
  }
  return async function workspaceEntryHandler(input) {
    try {
      runtime ??= initialise();
      const started = now();
      const flow = createWorkspaceFlow({ ...runtime, workspaces: WORKSPACES,
        authorize: token => {
          if (now() - started >= 8500) throw new Error('Workspace request timed out');
          return readApprovedSession(token, runtime.sessionStore, now);
        } });
      return await flow(input);
    } catch { return { status: 'unavailable' }; }
  };
}

// Private InvokeFunction only. Never log events, sessions, addresses or provider URLs.
export const handler = createWorkspaceEntry();
