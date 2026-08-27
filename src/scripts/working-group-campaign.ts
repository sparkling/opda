function initCampaignExperience(): void {
  const root = document.querySelector<HTMLElement>('.wg-page');
  if (!root || root.dataset.campaignInitialised === 'true') return;
  root.dataset.campaignInitialised = 'true';

  root.querySelectorAll<HTMLAnchorElement>('[data-context-register]').forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.dataset.contextRegister;
      if (!value) return;
      const checkbox = root.querySelector<HTMLInputElement>(`input[name="workingGroups"][value="${value}"]`);
      if (!checkbox) return;
      checkbox.checked = true;
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
