let teardown: (() => void) | undefined;

export function initMarketing() {
  teardown?.();
  const root = document.querySelector<HTMLElement>('[data-marketing-page]');
  if (!root) return;
  const controller = new AbortController();
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const signal = controller.signal;

  root.addEventListener('click', async (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest<HTMLButtonElement>('button[data-copy]');
    if (!button) return;
    const field = document.getElementById(button.dataset.copy ?? '');
    if (!(field instanceof HTMLTextAreaElement) || !root.contains(field)) return;
    const status = button.closest('.marketing-copy')?.querySelector<HTMLElement>('[data-copy-status]');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(field.value);
      if (!signal.aborted && status) status.textContent = 'Copied. Ready to paste into your own message.';
    } catch {
      if (signal.aborted) return;
      field.focus();
      field.select();
      if (status) status.textContent = 'Text selected. Use your usual copy shortcut to copy it.';
    }
  }, { signal });

  const frames = [...root.querySelectorAll<HTMLIFrameElement>('iframe[data-email-preview]')];
  const sizeFrame = (frame: HTMLIFrameElement) => {
    try {
      const document = frame.contentDocument;
      if (!document?.body) return;
      // Reset the viewport before measuring so repeated resizes cannot ratchet
      // an already-expanded frame taller. No polling or animation loop.
      frame.style.height = '1px';
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      if (height > 0) frame.style.height = `${Math.min(4000, height + 8)}px`;
    } catch { /* The open-preview link remains available if the frame is inaccessible. */ }
  };
  for (const frame of frames) {
    frame.addEventListener('load', () => sizeFrame(frame), { signal });
    sizeFrame(frame);
  }
  if (frames.length) window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => frames.forEach(sizeFrame), 150);
  }, { signal });

  teardown = () => { controller.abort(); clearTimeout(resizeTimer); teardown = undefined; };
  document.addEventListener('astro:before-swap', () => teardown?.(), { once: true, signal });
}

document.addEventListener('astro:page-load', initMarketing);
