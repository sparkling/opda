const deck = document.querySelector('[data-testid="presentation"]');

if (deck) {
  const slides = [...deck.querySelectorAll('[data-testid="slide"]')];
  const progress = deck.querySelector('[data-testid="presentation-progress"]');
  const counter = deck.querySelector('[data-testid="slide-counter"]');
  const announcer = deck.querySelector('[data-testid="slide-announcer"]');
  const previousButton = deck.querySelector('[data-testid="prev-slide"]');
  const nextButton = deck.querySelector('[data-testid="next-slide"]');
  const fullscreenButton = deck.querySelector('[data-testid="fullscreen-toggle"]');
  const overviewDialog = deck.querySelector('[data-testid="overview-dialog"]');
  const overviewGrid = overviewDialog.querySelector('.overview-grid');
  const overviewSearch = deck.querySelector('[data-testid="overview-search"]');
  const helpDialog = deck.querySelector('[data-testid="help-dialog"]');
  let current = 0;
  let touchStart = null;
  let lastFocused = null;

  const pad = (number) => String(number).padStart(2, '0');
  const isInteractive = (target) => Boolean(target.closest('input, select, button, a, [contenteditable="true"], dialog'));

  function indexFromHash() {
    if (!location.hash) return 0;
    const index = slides.findIndex((slide) => slide.id === decodeURIComponent(location.hash.slice(1)));
    return index < 0 ? 0 : index;
  }

  function updateOverview() {
    [...overviewGrid.children].forEach((item, index) => item.setAttribute('aria-current', index === current ? 'true' : 'false'));
  }

  function updateSlide(index, options = {}) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    const changed = next !== current;
    current = next;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.dataset.active = String(active);
      slide.classList.toggle('is-before', slideIndex < current);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });

    progress.value = current + 1;
    progress.textContent = `${current + 1} of ${slides.length}`;
    counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    previousButton.disabled = current === 0;
    nextButton.disabled = current === slides.length - 1;
    nextButton.innerHTML = current === slides.length - 1 ? 'End' : 'Next <span aria-hidden="true">→</span>';
    const title = slides[current].dataset.title;
    document.title = `${title} — OPDA`;
    announcer.textContent = `${current + 1} of ${slides.length}: ${title}`;
    updateOverview();

    // A deep link can make the browser scroll the clipped deck container to a
    // translated, previously hidden slide before our active state is applied.
    // Reset both scroll containers so every slide starts flush with the canvas.
    deck.scrollLeft = 0;
    deck.scrollTop = 0;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      deck.scrollLeft = 0;
      deck.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    if (changed || options.initial) {
      const hash = `#${slides[current].id}`;
      if (location.hash !== hash) history[options.replace ? 'replaceState' : 'pushState']({ slide: current }, '', hash);
      else if (options.initial && !history.state) history.replaceState({ slide: current }, '', hash);
    }
  }

  function goBy(delta) {
    updateSlide(current + delta);
  }

  function renderOverview() {
    const fragment = document.createDocumentFragment();
    slides.forEach((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.slideTarget = String(index);
      const number = document.createElement('b');
      const title = document.createElement('span');
      number.textContent = pad(index + 1);
      title.textContent = slide.dataset.title;
      button.append(number, title);
      fragment.append(button);
    });
    overviewGrid.replaceChildren(fragment);
    updateOverview();
  }

  function openOverview() {
    lastFocused = document.activeElement;
    overviewSearch.value = '';
    filterOverview('');
    if (!overviewDialog.open) overviewDialog.showModal();
    requestAnimationFrame(() => overviewSearch.focus());
  }

  function closeOverview() {
    if (overviewDialog.open) overviewDialog.close();
    lastFocused?.focus?.();
  }

  function filterOverview(query) {
    const normalised = query.trim().toLowerCase();
    [...overviewGrid.children].forEach((button) => { button.hidden = !button.textContent.toLowerCase().includes(normalised); });
  }

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled) {
      announcer.textContent = 'Fullscreen is not supported in this browser.';
      return;
    }
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      announcer.textContent = 'Fullscreen could not be opened.';
    }
  }

  function updateFullscreen() {
    const active = Boolean(document.fullscreenElement);
    fullscreenButton.setAttribute('aria-pressed', String(active));
    fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  }

  function selectDetail(container, button, output) {
    container.querySelectorAll('button[data-detail]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    output.textContent = button.dataset.detail;
  }

  function setupDetailInteraction(name) {
    const container = deck.querySelector(`[data-interaction="${name}"]`);
    const output = deck.querySelector(`[data-output="${name}"]`);
    if (!container || !output) return;
    container.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-detail]');
      if (button) selectDetail(container, button, output);
    });
  }

  function setSyncConcept(concept) {
    const interaction = deck.querySelector('[data-interaction="view-sync"]');
    const messages = {
      applicant: 'Applicant is a form section and JSON object, while the graph can connect that person to roles, evidence and decisions.',
      mortgage: 'Mortgage is nested in this message, while the graph connects it directly to applicant, property, product and lifecycle facts.',
      property: 'Property appears at one path in this JSON message, but the graph can connect it to valuation, title, survey and provenance contexts.',
      evidence: 'Evidence may be an attachment list in JSON, while the graph records what it supports, who supplied it and when it applied.',
    };
    interaction.querySelectorAll('button[data-concept]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.concept === concept)));
    deck.querySelectorAll('[data-sync-root] [data-concept]').forEach((item) => item.classList.toggle('is-active', item.dataset.concept === concept));
    deck.querySelector('[data-output="view-sync"]').textContent = messages[concept];
  }

  function setPropertyContext(context) {
    const messages = {
      finance: 'The asset offered as security for lending; valuation, tenure and risk matter.',
      conveyancing: 'The legal estate or registered title being transferred; rights, restrictions and ownership matter.',
      surveying: 'The physical asset inspected and valued; construction, condition and defects matter.',
      agency: 'The home or interest being marketed; description, material information and status matter.',
      services: 'The identified record assembled from authoritative sources; lineage, matching and currency matter.',
    };
    const interaction = deck.querySelector('[data-interaction="property-lenses"]');
    interaction.querySelectorAll('button[data-context]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.context === context)));
    deck.querySelector('[data-output="property-lenses"]').textContent = messages[context];
  }

  function setReviewView(view) {
    const views = {
      graph: ['Graph view', 'Explore concepts and labelled relationships.'],
      term: ['Term page', 'Review a definition, examples, source and owner.'],
      glossary: ['Business glossary', 'Browse agreed language without technical notation.'],
      dictionary: ['Data dictionary', 'Inspect fields, values, provenance and implementation notes.'],
      schema: ['Generated schema', 'See the tree-shaped exchange view derived through tested mappings.'],
      changes: ['Change history', 'Compare versions and see what feedback changed.'],
      discussion: ['Page discussion', 'Comment on a specific term or relationship in context.'],
    };
    const interaction = deck.querySelector('[data-interaction="review-surface"]');
    interaction.querySelectorAll('button[data-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    const output = deck.querySelector('[data-output="review-surface"]');
    const strong = document.createElement('strong');
    const small = document.createElement('small');
    [strong.textContent, small.textContent] = views[view];
    output.replaceChildren(strong, small);
  }

  function handleAction(action) {
    if (action === 'next') goBy(1);
    if (action === 'prev') goBy(-1);
    if (action === 'overview') openOverview();
    if (action === 'fullscreen') toggleFullscreen();
  }

  deck.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action) handleAction(action);

    const syncButton = event.target.closest('[data-interaction="view-sync"] button[data-concept]');
    if (syncButton) setSyncConcept(syncButton.dataset.concept);

    const contextButton = event.target.closest('[data-interaction="property-lenses"] button[data-context]');
    if (contextButton) setPropertyContext(contextButton.dataset.context);

    const reviewButton = event.target.closest('[data-interaction="review-surface"] button[data-view]');
    if (reviewButton) setReviewView(reviewButton.dataset.view);

    const target = event.target.closest('[data-slide-target]');
    if (target) {
      closeOverview();
      updateSlide(Number(target.dataset.slideTarget));
    }
  });

  document.addEventListener('keydown', (event) => {
    if (isInteractive(event.target)) return;
    const key = event.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(key) || (key === ' ' && !event.shiftKey)) {
      event.preventDefault();
      goBy(1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(key) || (key === ' ' && event.shiftKey)) {
      event.preventDefault();
      goBy(-1);
    } else if (key === 'Home') {
      event.preventDefault();
      updateSlide(0);
    } else if (key === 'End') {
      event.preventDefault();
      updateSlide(slides.length - 1);
    } else if (key.toLowerCase() === 'o' || key === '/' || ((event.metaKey || event.ctrlKey) && key.toLowerCase() === 'k')) {
      event.preventDefault();
      openOverview();
    } else if (key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFullscreen();
    } else if (key === '?') {
      event.preventDefault();
      lastFocused = document.activeElement;
      helpDialog.showModal();
    }
  });

  deck.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1 || isInteractive(event.target)) return;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });

  deck.addEventListener('touchend', (event) => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) goBy(dx < 0 ? 1 : -1);
  }, { passive: true });

  overviewSearch.addEventListener('input', () => filterOverview(overviewSearch.value));
  overviewDialog.addEventListener('close', () => lastFocused?.focus?.());
  helpDialog.addEventListener('close', () => lastFocused?.focus?.());
  document.addEventListener('fullscreenchange', updateFullscreen);
  window.addEventListener('popstate', () => updateSlide(indexFromHash(), { replace: true }));
  window.addEventListener('hashchange', () => updateSlide(indexFromHash(), { replace: true }));

  ['handoffs', 'group-scope', 'dimensions', 'intake-gate', 'iteration', 'channels'].forEach(setupDetailInteraction);
  renderOverview();
  updateSlide(indexFromHash(), { initial: true, replace: true });
}
