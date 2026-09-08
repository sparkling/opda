const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const PARTICIPANT_ID = /^[A-Za-z0-9_-]{1,128}$/;
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const identityFailure = () => { throw new Error('Cognito identity ownership mismatch'); };

function validateAccount(account, subjectRequired = false) {
  if (!object(account) || typeof account.participantId !== 'string' || !PARTICIPANT_ID.test(account.participantId)
    || typeof account.email !== 'string' || account.email.length > 254 || !EMAIL.test(account.email)
    || (subjectRequired && (typeof account.cognitoSub !== 'string' || !UUID.test(account.cognitoSub)))) {
    throw new TypeError('Invalid approval identity binding');
  }
}

function verifyIdentity(user, account, allowDisabled = false) {
  if (!object(user) || (!allowDisabled && user.Enabled === false)) identityFailure();
  const list = user.Attributes ?? user.UserAttributes;
  if (!Array.isArray(list)) identityFailure();
  const attributes = new Map();
  for (const entry of list) {
    if (!object(entry) || typeof entry.Name !== 'string' || typeof entry.Value !== 'string'
      || attributes.has(entry.Name)) identityFailure();
    attributes.set(entry.Name, entry.Value);
  }
  const sub = attributes.get('sub');
  if (attributes.get('email') !== account.email || attributes.get('custom:participant_id') !== account.participantId
    || typeof sub !== 'string' || !UUID.test(sub) || (account.cognitoSub !== undefined && account.cognitoSub !== sub)) {
    identityFailure();
  }
  return sub;
}

/** Native Cognito only; no passwords, email verification, alias transfer or groups. */
export function createIdentity({ poolId, send: injectedSend } = {}) {
  if (typeof poolId !== 'string' || !/^[a-z0-9-]{3,32}_[A-Za-z0-9]{1,128}$/.test(poolId)
    || (injectedSend !== undefined && typeof injectedSend !== 'function')) {
    throw new TypeError('Invalid approval identity configuration');
  }
  let services;
  async function send(commandName, input) {
    try {
      if (injectedSend) return await injectedSend(commandName, input);
      services ??= import('@aws-sdk/client-cognito-identity-provider').then(aws => ({
        aws, client: new aws.CognitoIdentityProviderClient({ maxAttempts: 2 }),
      }));
      const { aws, client } = await services;
      return await client.send(new aws[commandName](input));
    } catch (error) {
      const sanitized = new Error('Cognito approval request failed');
      // Only this known operational code is needed to reconcile create retries.
      if (error?.name === 'UsernameExistsException') sanitized.name = 'UsernameExistsException';
      throw sanitized;
    }
  }

  return {
    async ensure(applicant) {
      validateAccount(applicant);
      if (typeof applicant.name !== 'string' || !applicant.name.trim() || applicant.name.length > 256
        || /[\u0000-\u001f\u007f<>]/u.test(applicant.name)) throw new TypeError('Invalid approval identity name');
      let user;
      try {
        user = (await send('AdminCreateUserCommand', {
          UserPoolId: poolId, Username: applicant.email, MessageAction: 'SUPPRESS', ForceAliasCreation: false,
          UserAttributes: [{ Name: 'email', Value: applicant.email }, { Name: 'name', Value: applicant.name },
            { Name: 'custom:participant_id', Value: applicant.participantId }],
        }))?.User;
      } catch (error) {
        if (error.name !== 'UsernameExistsException') throw error;
        user = await send('AdminGetUserCommand', { UserPoolId: poolId, Username: applicant.email });
      }
      return verifyIdentity(user, applicant);
    },

    async setAccess(account, enabled) {
      validateAccount(account, true);
      if (typeof enabled !== 'boolean') throw new TypeError('Invalid approval access decision');
      // Resolve the immutable subject, not a mutable external CRM identifier.
      const input = { UserPoolId: poolId, Username: account.cognitoSub };
      const user = await send('AdminGetUserCommand', input);
      verifyIdentity(user, account, true);
      await send(enabled ? 'AdminEnableUserCommand' : 'AdminDisableUserCommand', input);
      if (!enabled) await send('AdminUserGlobalSignOutCommand', input);
    },
  };
}
