export const socialProviders = Object.freeze([
  Object.freeze({ key: 'google', connection: 'google-oauth2', label: 'Google' }),
  Object.freeze({ key: 'github', connection: 'github', label: 'GitHub', connectionScope: 'user:email' }),
  Object.freeze({ key: 'apple', connection: 'apple', label: 'Apple' }),
  Object.freeze({ key: 'facebook', connection: 'facebook', label: 'Facebook' }),
  Object.freeze({ key: 'linkedin', connection: 'linkedin', label: 'LinkedIn' }),
  Object.freeze({ key: 'microsoft', connection: 'windowslive', label: 'Microsoft' }),
]);

const providerByKey = new Map(socialProviders.map(provider => [provider.key, provider]));

export function socialProvider(key) {
  return typeof key === 'string' ? providerByKey.get(key) : undefined;
}

export function providerLoginHref(key, returnPath = '/') {
  if (!socialProvider(key)) throw new TypeError('Unknown social provider.');
  const safeReturn = typeof returnPath === 'string' && returnPath.startsWith('/') && !returnPath.startsWith('//')
    ? returnPath : '/';
  return `/_auth/login?${new URLSearchParams({ return: safeReturn, provider: key })}`;
}
