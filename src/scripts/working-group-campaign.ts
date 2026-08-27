function initCampaignExperience(): void {
  const root = document.querySelector<HTMLElement>('.wg-page');
  if (!root || root.dataset.campaignInitialised === 'true') return;
  root.dataset.campaignInitialised = 'true';
  root.classList.add('has-campaign-js');

  const constellation = root.querySelector<HTMLElement>('[data-context-constellation]');
  if (constellation) {
    constellation.classList.add('has-constellation-js');
    const triggers = Array.from(constellation.querySelectorAll<HTMLButtonElement>('[data-context-trigger]'));
    const panels = Array.from(constellation.querySelectorAll<HTMLElement>('[data-context-panel]'));
    const status = constellation.querySelector<HTMLElement>('[data-context-status]');

    const selectContext = (value: string, announce = true): void => {
      triggers.forEach((trigger) => {
        trigger.setAttribute('aria-pressed', String(trigger.dataset.contextTrigger === value));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.contextPanel !== value;
      });
      if (announce && status) {
        const selected = triggers.find((trigger) => trigger.dataset.contextTrigger === value);
        status.textContent = selected ? `${selected.textContent?.trim()} perspective selected.` : '';
      }
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => selectContext(trigger.dataset.contextTrigger ?? ''));
    });

    constellation.querySelectorAll<HTMLAnchorElement>('[data-context-register]').forEach((link) => {
      link.addEventListener('click', () => {
        const value = link.dataset.contextRegister;
        if (!value) return;
        const checkbox = root.querySelector<HTMLInputElement>(`input[name="workingGroups"][value="${value}"]`);
        const notSure = root.querySelector<HTMLInputElement>('input[name="workingGroups"][data-exclusive]');
        if (!checkbox) return;
        checkbox.checked = true;
        if (notSure) notSure.checked = false;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        if (status) status.textContent = `${link.textContent?.replace(/^Add\s+|\s+to my registration$/gu, '').trim()} added to your registration. You can change it in the form.`;
      });
    });

    selectContext(triggers[0]?.dataset.contextTrigger ?? '', false);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    : null;

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((item) => {
    if (reducedMotion.matches || !revealObserver) item.classList.add('is-revealed');
    else revealObserver.observe(item);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCampaignExperience, { once: true });
} else {
  initCampaignExperience();
}
document.addEventListener('astro:page-load', initCampaignExperience);
