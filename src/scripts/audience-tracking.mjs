import { audienceTracking as config, PROVIDERS, CONSENT_KEY,
  denied, readConsent, trackingAllowed, validAccounts, createTrackingScheduler } from '../lib/audience-tracking.mjs';

export function initialiseAudienceTracking() {
  if (window.__opdaAudience || !config.providerSettingsVerified || !validAccounts(config)) return;
  window.__opdaAudience = true;
  const lifetime = new AbortController();
  const options = { signal: lifetime.signal };
  const lastPage = new Map();
  let consent;
  try { consent = readConsent(localStorage.getItem(CONSENT_KEY)); } catch { consent = null; }
  let loaded = document.readyState === 'complete';
  const allowed = () => loaded && !document.hidden && trackingAllowed(location.href);
  const gtag = (...args) => {
    window.dataLayer ??= [];
    // Google's queue requires Arguments objects, not flattened argument arrays.
    window.gtag ??= function () { window.dataLayer.push(arguments); };
    window.gtag(...args);
  };
  const schedule = (callback, delay) => {
    const token = {};
    token.timer = setTimeout(() => {
      token.timer = null;
      if (window.requestIdleCallback) token.idle = requestIdleCallback(callback, { timeout: 2000 });
      else token.timer = setTimeout(callback, 50);
    }, delay);
    return token;
  };
  const cancel = token => {
    clearTimeout(token.timer);
    if (token.idle !== undefined) cancelIdleCallback(token.idle);
  };
  function appendScript(key, src) {
    if (document.getElementById(`opda-tracking-${key}`)) return;
    const script = document.createElement('script');
    script.id = `opda-tracking-${key}`;
    script.src = src; script.async = true; script.fetchPriority = 'low';
    // Preserve the single installation across Astro document swaps.
    script.setAttribute('data-astro-transition-persist', `opda-tracking-${key}`);
    document.head.append(script);
  }
  function pageView(key, initial = false) {
    if (!allowed() || !consent?.[key]) return;
    const path = location.pathname + (location.search ?? '');
    if (lastPage.get(key) === path) return;
    lastPage.set(key, path);
    if (key === 'google') gtag('event', 'page_view', {
      send_to: config.google, page_location: location.origin + path,
      page_title: document.title, page_referrer: safeReferrer(),
    });
    if (key === 'hubspot') {
      window._hsq.push(['setPath', path]);
      // HubSpot sends its own first view when its nested analytics script loads.
      if (!initial && !Array.isArray(window._hsq)) window._hsq.push(['trackPageView']);
    }
    if (key === 'linkedin' && !initial) window.lintrk?.();
  }
  function safeReferrer() {
    try { const url = new URL(document.referrer); return url.origin + url.pathname; } catch { return ''; }
  }
  function install(key) {
    if (key === 'google') {
      gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied' });
      gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted',
        ad_user_data: 'granted', ad_personalization: 'granted' });
      gtag('js', new Date());
      gtag('config', config.google, { send_page_view: false, allow_google_signals: true,
        page_location: location.origin + location.pathname + (location.search ?? ''), page_referrer: safeReferrer() });
      pageView(key, true);
      appendScript(key, `https://www.googletagmanager.com/gtag/js?id=${config.google}`);
    }
    if (key === 'hubspot') {
      window.disableHubSpotCookieBanner = true;
      window._hsp ??= []; window._hsq ??= [];
      window._hsp.push(['setHubSpotConsent', { analytics: true, advertisement: false, functionality: false }]);
      window._hsq.push(['doNotTrack', { track: true }]);
      pageView(key, true);
      appendScript(key, `https://js.hs-scripts.com/${config.hubspot}.js`);
    }
    if (key === 'linkedin') {
      window._linkedin_partner_id = config.linkedin;
      window._linkedin_data_partner_ids = [config.linkedin];
      window.lintrk ??= function (a, b) { (window.lintrk.q ??= []).push([a, b]); };
      pageView(key, true);
      appendScript(key, 'https://snap.licdn.com/li.lms-analytics/insight.min.js');
    }
  }
  const scheduler = createTrackingScheduler({ schedule, cancel, load: install, allowed });
  function mount() {
    const root = document.querySelector('[data-audience-consent]');
    if (root) {
      root.hidden = !trackingAllowed(location.href);
      const panel = root.querySelector('[data-consent-panel]');
      panel.hidden = consent !== null;
      for (const key of PROVIDERS) root.querySelector(`[name="${key}"]`).checked = consent?.[key] === true;
    }
    for (const key of scheduler.installed) pageView(key);
    scheduler.update(consent ?? denied());
  }
  function clearTrackingCookies() {
    const names = document.cookie.split(';').map(item => item.trim().split('=')[0])
      .filter(name => /^(?:_ga(?:_|$)|_gid$|_gat|_gcl_|hubspotutk$|__hstc$|__hssc$|__hssrc$|li_fat_id$)/.test(name));
    for (const name of names) for (const domain of ['', location.hostname, '.opda.org.uk']) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Secure; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
    }
  }
  function save(next) {
    consent = next;
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), ...next })); }
    catch { /* Choice still applies for this document. */ }
    if (scheduler.installed.size) {
      revokeAndReload();
      return;
    }
    mount();
  }
  function revokeAndReload() {
      scheduler.pause();
      window[`ga-disable-${config.google}`] = true;
      window._hsq?.push(['doNotTrack']);
      window._hsp?.push(['revokeCookieConsent']);
      clearTrackingCookies();
      // SDKs cannot reliably be unloaded. A fresh document enforces withdrawals.
      location.reload();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-consent-action]');
    if (!button) return;
    const action = button.dataset.consentAction;
    const root = document.querySelector('[data-audience-consent]');
    if (action === 'open') {
      const panel = root.querySelector('[data-consent-panel]'); panel.hidden = false;
      panel.querySelector('button')?.focus();
    } else if (action === 'reject') save(denied());
    else if (action === 'all') save(Object.fromEntries(PROVIDERS.map(key => [key, true])));
    else if (action === 'save') save(Object.fromEntries(PROVIDERS.map(key => [key, root.querySelector(`[name="${key}"]`).checked])));
  }, options);
  document.addEventListener('astro:page-load', mount, options);
  document.addEventListener('astro:before-preparation', event => {
    scheduler.pause();
    if (scheduler.installed.size && !trackingAllowed(event.to.href)) {
      event.preventDefault(); location.assign(event.to.href);
    }
  }, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) scheduler.pause(); else mount();
  }, options);
  window.addEventListener('load', () => { loaded = true; mount(); }, options);
  window.addEventListener('storage', event => {
    if (event.key === CONSENT_KEY) {
      let next = null;
      try { next = readConsent(localStorage.getItem(CONSENT_KEY)); } catch { /* deny */ }
      // Do not write storage here: that would make open tabs notify each other forever.
      if (scheduler.installed.size) revokeAndReload();
      else { consent = next; mount(); }
    }
  }, options);
  window.addEventListener('pagehide', () => scheduler.pause(), options);
  window.addEventListener('pageshow', event => {
    if (event.persisted) location.reload(); // Recheck consent before a frozen vendor resumes.
  }, options);
  mount();
}
