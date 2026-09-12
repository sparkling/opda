// Public account identifiers only. Activation also requires provider-side setup:
// GA4: enable Google signals; disable enhanced history page views and form capture.
// HubSpot: disable non-HubSpot form capture, chat and other optional embed features.
// LinkedIn: disable automatic Website Actions; use page views for audience reports.
export const audienceTracking = Object.freeze({
  google: '',
  linkedin: '',
  hubspot: '144765514',
  providerSettingsVerified: false,
});

export const CONSENT_KEY = 'opda-audience-consent-v1';
export const CONSENT_AGE = 180 * 24 * 60 * 60 * 1000;
export const PROVIDERS = ['google', 'linkedin', 'hubspot'];
export const denied = () => ({ google: false, linkedin: false, hubspot: false });

export function validAccounts(config) {
  return /^G-[A-Z0-9]{6,20}$/.test(config.google ?? '')
    && /^[1-9][0-9]{1,15}$/.test(config.linkedin ?? '')
    && /^[1-9][0-9]{1,15}$/.test(config.hubspot ?? '');
}

export function readConsent(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (value.version !== 1 || !Number.isFinite(value.savedAt)
      || value.savedAt > now || now - value.savedAt >= CONSENT_AGE
      || PROVIDERS.some(key => typeof value[key] !== 'boolean')) return null;
    return Object.fromEntries(PROVIDERS.map(key => [key, value[key]]));
  } catch { return null; }
}

export function trackingAllowed(href) {
  try {
    const url = new URL(href);
    // Do not install vendor code on account, form, resource or token-bearing pages.
    // Only short campaign labels may enter third-party URLs; never form fields.
    const campaignKeys = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);
    const safeQuery = [...url.searchParams].every(([key, value]) => campaignKeys.has(key)
      && /^[a-zA-Z0-9 _.-]{1,100}$/.test(value));
    return url.protocol === 'https:' && ['opda.org.uk', 'www.opda.org.uk'].includes(url.hostname)
      && safeQuery && (!url.hash || /^#[a-z][a-z0-9-]{0,100}$/i.test(url.hash))
      && !/^\/(?:auth|account|api|join|subscribe|resource|approval|workspace)(?:\/|$)/.test(url.pathname);
  } catch { return false; }
}

/** A finite, cancellable loading schedule; no polling or rendering loop. */
export function createTrackingScheduler({ schedule, cancel, load, allowed }) {
  const installed = new Set();
  const pending = new Map();
  let consent = denied();
  function pause() {
    for (const token of pending.values()) cancel(token);
    pending.clear();
  }
  function update(next) {
    pause();
    consent = { ...next };
    if (!allowed()) return;
    PROVIDERS.filter(key => consent[key] && !installed.has(key)).forEach((key, index) => {
      pending.set(key, schedule(() => {
        pending.delete(key);
        if (!consent[key] || !allowed() || installed.has(key)) return;
        // Mark before invoking vendor code; failures never trigger automatic retries.
        installed.add(key);
        load(key);
      }, index * 750));
    });
  }
  return { update, pause, installed, pending };
}
