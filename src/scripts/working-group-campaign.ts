function initCampaignExperience(): void {
  const root = document.querySelector<HTMLElement>('.wg-page');
  if (!root || root.dataset.campaignInitialised === 'true') return;
  root.dataset.campaignInitialised = 'true';

  root.querySelectorAll<HTMLAnchorElement>('[data-context-register]').forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.dataset.contextRegister;
      if (!value) return;
      const checkbox = root.querySelector<HTMLInputElement>(`input[name="workingGroups"][value="${value}"]`);
      const notSure = root.querySelector<HTMLInputElement>('input[name="workingGroups"][data-exclusive]');
      if (!checkbox) return;
      checkbox.checked = true;
      if (notSure) notSure.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCampaignExperience, { once: true });
} else {
  initCampaignExperience();
}
document.addEventListener('astro:page-load', initCampaignExperience);
