const ACCENTS: Record<string, string> = {
  terracotta: 'var(--terracotta-500)',
  plum: 'var(--plum-500)',
  amber: 'var(--amber-500)',
  teal: 'var(--teal-500)',
  info: 'var(--color-info-500)',
};

function initCampaignExperience(): void {
  const root = document.querySelector<HTMLElement>('.wg-page');
  if (!root || root.dataset.campaignInitialised === 'true') return;
  root.dataset.campaignInitialised = 'true';
  root.classList.add('has-campaign-js');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 49rem)');
  const parallaxLayers = [...document.querySelectorAll<HTMLElement>('[data-parallax-layer]')];
  let frame = 0;

  function updateParallax(): void {
    frame = 0;
    if (reducedMotion.matches || !desktop.matches) {
      parallaxLayers.forEach((layer) => { layer.style.removeProperty('transform'); });
      return;
    }

    const viewportMidpoint = window.innerHeight / 2;
    parallaxLayers.forEach((layer) => {
      const scene = layer.closest<HTMLElement>('[data-campaign-scene]');
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const speed = Number(layer.dataset.speed ?? 0);
      const distance = rect.top + rect.height / 2 - viewportMidpoint;
      const offset = Math.max(-52, Math.min(52, distance * speed));
      layer.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
  }

  function requestParallaxUpdate(): void {
    if (!frame) frame = window.requestAnimationFrame(updateParallax);
  }

  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestParallaxUpdate, { passive: true });
  reducedMotion.addEventListener('change', requestParallaxUpdate);
  desktop.addEventListener('change', requestParallaxUpdate);
  requestParallaxUpdate();

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

  const handoffStage = document.querySelector<HTMLElement>('[data-handoff-stage]');
  const handoffTerm = handoffStage?.querySelector<HTMLElement>('[data-handoff-term]');
  const handoffDefinition = handoffStage?.querySelector<HTMLElement>('[data-handoff-definition]');
  const storyIndex = handoffStage?.querySelector<HTMLElement>('[data-story-index]');
  const storySteps = [...document.querySelectorAll<HTMLElement>('[data-story-step]')];

  function activateStoryStep(step: HTMLElement, index: number): void {
    storySteps.forEach((item) => item.classList.toggle('is-active', item === step));
    if (handoffTerm) handoffTerm.textContent = step.dataset.term ?? '';
    if (handoffDefinition) handoffDefinition.textContent = step.dataset.definition ?? '';
    if (storyIndex) storyIndex.textContent = String(index + 1).padStart(2, '0');
    if (handoffStage) {
      handoffStage.style.setProperty('--story-accent', ACCENTS[step.dataset.accent ?? 'terracotta']);
      const card = handoffStage.querySelector<HTMLElement>('.wg-handoff-stage__property');
      if (card && typeof card.animate === 'function') card.animate(
        [
          { opacity: 0.7, transform: 'translateY(0.65rem) scale(0.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: reducedMotion.matches ? 0 : 360, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
    }
  }

  if (storySteps.length) {
    activateStoryStep(storySteps[0], 0);
    if ('IntersectionObserver' in window && desktop.matches) {
      const storyObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (!visible) return;
        const step = visible.target as HTMLElement;
        activateStoryStep(step, storySteps.indexOf(step));
      }, { rootMargin: '-30% 0px -30% 0px', threshold: [0.15, 0.35, 0.6] });
      storySteps.forEach((step) => storyObserver.observe(step));
    } else {
      storySteps.forEach((step) => step.classList.add('is-active'));
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCampaignExperience, { once: true });
} else {
  initCampaignExperience();
}
