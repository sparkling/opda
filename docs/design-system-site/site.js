const body = document.body;
const rail = document.querySelector('#section-rail');
const menuButton = document.querySelector('.menu-button');
const closeButton = document.querySelector('.rail-close');
const liveRegion = document.querySelector('.live-region');
const railLinks = [...rail.querySelectorAll('nav a')];
const mobileQuery = window.matchMedia('(max-width: 48rem)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let returnFocus = null;
let liveTimer;

const focusable = () => [...rail.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
const outsideRail = () => [...body.children].filter((element) => element !== rail);

function setOutsideInert(inert) {
  outsideRail().forEach((element) => { element.inert = inert; });
}

function openRail() {
  if (!mobileQuery.matches) return;
  returnFocus = document.activeElement;
  body.classList.add('rail-open');
  rail.inert = false;
  setOutsideInert(true);
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.textContent = 'Close';
  rail.setAttribute('role', 'dialog');
  rail.setAttribute('aria-modal', 'true');
  rail.setAttribute('aria-label', 'Design system sections');
  requestAnimationFrame(() => closeButton.focus());
}

function closeRail({ restore = true } = {}) {
  body.classList.remove('rail-open');
  setOutsideInert(false);
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Sections';
  rail.removeAttribute('role');
  rail.removeAttribute('aria-modal');
  rail.setAttribute('aria-label', 'Design system sections');
  rail.inert = mobileQuery.matches;
  if (restore && returnFocus instanceof HTMLElement) returnFocus.focus();
  returnFocus = null;
}

menuButton.addEventListener('click', () => {
  if (body.classList.contains('rail-open')) closeRail();
  else openRail();
});
closeButton.addEventListener('click', () => closeRail());

document.addEventListener('keydown', (event) => {
  if (!body.classList.contains('rail-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeRail();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusable();
  const first = items[0];
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

mobileQuery.addEventListener('change', ({ matches }) => {
  if (!matches) closeRail({ restore: false });
  else rail.inert = !body.classList.contains('rail-open');
});
rail.inert = mobileQuery.matches;

const sections = [...document.querySelectorAll('main > section[id]')];
const sectionById = new Map(sections.map((section) => [section.id, section]));

function setCurrent(id) {
  railLinks.forEach((link) => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setCurrent(visible.target.id);
  }, { rootMargin: '-15% 0px -65% 0px', threshold: [0, 0.1, 0.35] });
  sections.forEach((section) => observer.observe(section));
}

railLinks.forEach((link) => link.addEventListener('click', (event) => {
  const id = link.hash.slice(1);
  setCurrent(id);
  if (!mobileQuery.matches) return;
  event.preventDefault();
  const target = sectionById.get(id);
  closeRail({ restore: false });
  history.pushState(null, '', link.hash);
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}));

function announce(message) {
  clearTimeout(liveTimer);
  liveRegion.textContent = message;
  liveRegion.classList.add('is-visible');
  liveTimer = setTimeout(() => liveRegion.classList.remove('is-visible'), 1800);
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.querySelector(button.dataset.copy);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      announce('Code copied to clipboard');
    } catch {
      announce('Copy unavailable; select the code manually');
    }
  });
});

document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(next);
      tabs[next].focus();
    });
  });
  function selectTab(index) {
    tabs.forEach((tab, current) => {
      const selected = current === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = document.querySelector(`#${tab.getAttribute('aria-controls')}`);
      if (panel) panel.hidden = !selected;
    });
  }
});

document.querySelector('.motion-trigger')?.addEventListener('click', (event) => {
  const demo = event.currentTarget.closest('.motion-demo');
  const running = demo.classList.toggle('is-run');
  event.currentTarget.textContent = running ? 'Reset transition' : 'Run 160ms transition';
});
