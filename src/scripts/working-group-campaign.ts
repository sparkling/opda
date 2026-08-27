function initCampaignExperience(): void {
  const root = document.querySelector<HTMLElement>('.wg-page');
  if (!root || root.dataset.campaignInitialised === 'true') return;
  root.dataset.campaignInitialised = 'true';
  root.classList.add('has-campaign-js');

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
