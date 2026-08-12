const TOKEN_PATTERN = /^[a-f0-9]{64}\.[A-Za-z0-9_-]{43}$/u;

function initConfirmation(): void {
  const form = document.querySelector<HTMLFormElement>('#confirmation-form');
  if (!form || form.dataset.initialised === 'true') return;
  form.dataset.initialised = 'true';

  const ready = document.querySelector<HTMLElement>('#confirmation-ready');
  const success = document.querySelector<HTMLElement>('#confirmation-success');
  const invalid = document.querySelector<HTMLElement>('#confirmation-invalid');
  const status = document.querySelector<HTMLElement>('#confirmation-status');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const token = fragment.get('token') ?? '';
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);

  if (!TOKEN_PATTERN.test(token)) {
    if (ready) ready.hidden = true;
    if (invalid) {
      invalid.hidden = false;
      invalid.focus();
    }
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!button) return;
    button.disabled = true;
    if (status) status.textContent = 'Confirming your address…';

    try {
      const response = await fetch('/api/working-group-interest/confirm', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error(`Confirmation failed with status ${response.status}`);

      if (ready) ready.hidden = true;
      if (status) status.textContent = '';
      if (success) {
        success.hidden = false;
        success.focus();
      }
    } catch {
      if (ready) ready.hidden = true;
      if (status) status.textContent = '';
      if (invalid) {
        invalid.hidden = false;
        invalid.focus();
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConfirmation, { once: true });
} else {
  initConfirmation();
}
