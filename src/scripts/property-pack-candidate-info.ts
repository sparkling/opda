const rootSelector = '[data-candidate-info]';
const triggerSelector = '[data-candidate-info-trigger]';
const panelSelector = '[data-candidate-info-panel]';
const closeSelector = '[data-candidate-info-close]';

let activeRoot: HTMLElement | null = null;

function elements(root: HTMLElement) {
  return {
    trigger: root.querySelector<HTMLButtonElement>(triggerSelector),
    panel: root.querySelector<HTMLElement>(panelSelector),
  };
}

function close(root: HTMLElement, restoreFocus: boolean) {
  const { trigger, panel } = elements(root);
  if (!trigger || !panel) return;
  panel.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  if (activeRoot === root) activeRoot = null;
  if (restoreFocus) trigger.focus();
}

function open(root: HTMLElement) {
  const { trigger, panel } = elements(root);
  if (!trigger || !panel) return;
  if (activeRoot && activeRoot !== root) close(activeRoot, false);
  panel.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  activeRoot = root;
}

function reset() {
  document.querySelectorAll<HTMLElement>(rootSelector).forEach((root) => close(root, false));
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const trigger = event.target.closest<HTMLButtonElement>(triggerSelector);
  if (trigger) {
    const root = trigger.closest<HTMLElement>(rootSelector);
    if (!root) return;
    if (trigger.getAttribute('aria-expanded') === 'true') close(root, false);
    else open(root);
    return;
  }

  const closeButton = event.target.closest<HTMLButtonElement>(closeSelector);
  if (closeButton) {
    const root = closeButton.closest<HTMLElement>(rootSelector);
    if (root) close(root, true);
    return;
  }

  if (activeRoot && !activeRoot.contains(event.target)) close(activeRoot, false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !activeRoot) return;
  event.preventDefault();
  close(activeRoot, true);
});

document.addEventListener('astro:before-swap', () => {
  if (activeRoot) close(activeRoot, false);
});

document.addEventListener('astro:page-load', reset);
reset();
