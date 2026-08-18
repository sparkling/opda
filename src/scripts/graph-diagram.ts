// @ts-nocheck
/**
 * GraphDiagram engine — the static-source subset of hm/semantic-app's
 * scripts/graph-diagram (ADR-0190). opda diagrams are authored statically (a
 * mermaid `source` embedded as JSON in `.gd-config`); the hm `subject` /
 * `concept-graph` modes (which build the source in-browser from an RDF store)
 * are out of scope, so they are omitted.
 *
 * Idempotent + re-run on `astro:page-load` so it survives the ClientRouter
 * view-transition SPA navigation (opda-view-transition-render-patterns).
 */
import { createMermaidView } from './graph-diagram-mermaid';

let graphDiagramFrameId = 0;

function ensureAccessibleFrame(wrapper: HTMLElement): string {
  let caption = wrapper.querySelector('.gd-caption') as HTMLElement | null;
  if (!caption) {
    caption = document.createElement('figcaption');
    caption.className = 'gd-caption';
    caption.textContent = 'Interactive diagram.';
    wrapper.appendChild(caption);
  }
  if (!caption.id) caption.id = `gd-caption-${++graphDiagramFrameId}`;

  if (!caption.querySelector('.gd-figure-number') && !/^\s*Figure\s+\d+\b/iu.test(caption.textContent || '')) {
    const wrappers = [...document.querySelectorAll('.graph-diagram-wrapper')];
    const number = Math.max(1, wrappers.indexOf(wrapper) + 1);
    const prefix = document.createElement('span');
    prefix.className = 'gd-figure-number';
    prefix.textContent = `Figure ${number}. `;
    caption.prepend(prefix);
  }

  if (!caption.querySelector('.gd-keyboard-hint')) {
    const hint = document.createElement('span');
    hint.className = 'gd-keyboard-hint';
    hint.textContent = ' Keyboard: focus the diagram, use arrow keys to pan, + or − to zoom, and 0 to reset.';
    caption.appendChild(hint);
  }

  wrapper.setAttribute('role', 'figure');
  wrapper.setAttribute('aria-labelledby', caption.id);
  return caption.id;
}

export function mountGraphDiagrams() {
  document.querySelectorAll('.graph-diagram-wrapper').forEach((w) => {
    if ((w as any)._gdMounted) return;
    (w as any)._gdMounted = true;
    setupWrapper(w as HTMLElement);
  });
}

// Reconstruct the mermaid source from inline (slot) content, preserving <br/>.
// Astro parses a `<br/>` in slot HTML into a <br> DOM element, which
// `pre.textContent` would silently drop — joining the two label lines. Walk the
// child nodes and re-emit each <br> as a literal `<br/>` so htmlLabels wrap.
function readPreSource(pre: HTMLElement): string {
  let out = '';
  pre.childNodes.forEach((n) => {
    if (n.nodeName === 'BR') out += '<br/>';
    else out += (n as any).textContent || '';
  });
  return out.trim();
}

// ── Global adoption of bare `.mermaid` divs ──────────────────────────────────
// Every diagram the remark plugin, <Diagram>, or an inline page emits is a bare
// `<div class="mermaid">SOURCE</div>`. Wrap each in the island shell so the whole
// site's diagrams get pan/zoom/fullscreen + Navigate + click-nav, retiring
// client.js's CDN renderer. The shell markup mirrors GraphDiagram.astro.
const GD_ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" /></svg>',
  navigate: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>',
  zoomIn: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>',
  zoomOut: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>',
  reset: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.99v4.99" /></svg>',
  fullscreen: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>',
};
const GD_SHELL_HTML = `
  <div class="gd-actionbar">
    <button type="button" class="gd-ctrl" aria-pressed="false" tabindex="-1" aria-label="Zoom — hold Ctrl (⌘) and scroll" title="Hold Ctrl (⌘) and scroll to zoom · drag to pan">${GD_ICON.search}Ctrl</button>
    <span class="gd-actionbar-spacer"></span>
    <span class="diagram-toolbar" role="group" aria-label="Diagram controls">
      <button type="button" data-diagram-action="toggle-mode" title="Navigate: click opens the linked page. Explore: click locks the highlight." class="gd-seg-btn diagram-mode-toggle" aria-pressed="false" aria-label="Navigate mode. Activate to switch to explore mode.">${GD_ICON.navigate}<span class="diagram-mode-label">Navigate</span></button>
      <button type="button" data-diagram-action="zoom-in" title="Zoom in" class="gd-seg-btn" aria-label="Zoom in">${GD_ICON.zoomIn}</button>
      <button type="button" data-diagram-action="zoom-out" title="Zoom out" class="gd-seg-btn" aria-label="Zoom out">${GD_ICON.zoomOut}</button>
      <span class="gd-seg-btn gd-seg-label diagram-zoom-label" role="status" aria-live="polite" aria-label="Zoom level">100%</span>
      <button type="button" data-diagram-action="reset" title="Reset view (100%)" class="gd-seg-btn" aria-label="Reset view">${GD_ICON.reset}</button>
      <button type="button" data-diagram-action="fullscreen" title="Enter fullscreen" class="gd-seg-btn" aria-pressed="false" aria-label="Enter fullscreen diagram">${GD_ICON.fullscreen}</button>
    </span>
  </div>
  <div class="gd-box">
    <div class="gd-view-mermaid">
      <div class="diagram-viewport" style="cursor:grab;min-height:340px">
        <div class="diagram-canvas">
          <p class="diagram-loading" role="status" aria-live="polite">Loading diagram…</p>
          <pre class="gd-mermaid" aria-hidden="true"></pre>
        </div>
      </div>
    </div>
  </div>`;

// Reconstruct a bare `.mermaid` div's source, preserving <br/> (same rule as the
// slot path — Astro parses `<br/>` into a <br> element textContent would drop).
function readMermaidDiv(el: Element): string {
  let out = '';
  el.childNodes.forEach((n) => { out += n.nodeName === 'BR' ? '<br/>' : ((n as any).textContent || ''); });
  return out.trim();
}

export function adoptBareMermaid() {
  document.querySelectorAll('.mermaid').forEach((el) => {
    if (el.classList.contains('gd-mermaid')) return;         // the island's own <pre>
    if (el.closest('.graph-diagram-wrapper')) return;        // already adopted
    if ((el as any)._gdAdopted || el.querySelector('svg')) return;
    (el as any)._gdAdopted = true;
    const source = readMermaidDiv(el);
    if (!source) return;
    const shell = document.createElement('figure');
    shell.className = 'graph-diagram-wrapper';
    shell.innerHTML = GD_SHELL_HTML;
    (shell.querySelector('.gd-mermaid') as HTMLElement).textContent = source;
    // Preserve a caption sibling if the diagram sits in a <figure>.
    const figure = el.closest('figure');
    const cap = figure?.querySelector('figcaption');
    if (cap) { const nextCaption = document.createElement('figcaption'); nextCaption.className = 'gd-caption'; nextCaption.innerHTML = cap.innerHTML; shell.appendChild(nextCaption); }
    (figure || el).replaceWith(shell);
  });
  mountGraphDiagrams();
}

function setupWrapper(wrapper: HTMLElement) {
  let config: any = {};
  try { config = JSON.parse(wrapper.querySelector('.gd-config')?.textContent || '{}'); } catch { /* ignore */ }

  const viewport = wrapper.querySelector('.diagram-viewport') as HTMLElement | null;
  const canvas = wrapper.querySelector('.diagram-canvas') as HTMLElement | null;
  const pre = wrapper.querySelector('.gd-mermaid') as HTMLElement | null;
  if (!viewport || !canvas || !pre) return;
  const captionId = ensureAccessibleFrame(wrapper);
  wrapper.setAttribute('aria-busy', 'true');

  // Source: the `source` prop (config.source), else the inline slot the
  // component rendered into the <pre> (reconstructed preserving <br/>).
  const lightSource: string = (config.source && String(config.source).trim()) || readPreSource(pre);
  let mermaidView: any = null;
  let fullscreenReturnFocus: HTMLElement | null = null;
  let previousBodyOverflow = '';

  const fullscreenButtons = () => [...wrapper.querySelectorAll<HTMLButtonElement>('[data-diagram-action="fullscreen"]')];
  const focusableInFullscreen = () => [...wrapper.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hasAttribute('hidden'));

  function setFullscreenControlState(fullscreen: boolean) {
    fullscreenButtons().forEach((button) => {
      button.setAttribute('aria-pressed', String(fullscreen));
      button.setAttribute('aria-label', fullscreen ? 'Exit fullscreen diagram' : 'Enter fullscreen diagram');
      button.title = fullscreen ? 'Exit fullscreen (Escape)' : 'Enter fullscreen';
    });
  }

  function toggleFullscreen() {
    const full = !wrapper.classList.contains('diagram-fullscreen');
    if (full) {
      fullscreenReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      previousBodyOverflow = document.body.style.overflow;
      wrapper.classList.add('diagram-fullscreen');
      wrapper.setAttribute('role', 'dialog');
      wrapper.setAttribute('aria-modal', 'true');
      wrapper.setAttribute('aria-labelledby', captionId);
      document.body.style.overflow = 'hidden';
      setFullscreenControlState(true);
      requestAnimationFrame(() => fullscreenButtons()[0]?.focus());
      return;
    }

    wrapper.classList.remove('diagram-fullscreen');
    wrapper.setAttribute('role', 'figure');
    wrapper.removeAttribute('aria-modal');
    document.body.style.overflow = previousBodyOverflow;
    setFullscreenControlState(false);
    const returnFocus = fullscreenReturnFocus;
    fullscreenReturnFocus = null;
    requestAnimationFrame(() => returnFocus?.isConnected && returnFocus.focus());
  }

  function handleFullscreenKeydown(event: KeyboardEvent) {
    if (!wrapper.classList.contains('diagram-fullscreen')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      toggleFullscreen();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = focusableInFullscreen();
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function boot() {
    mermaidView = createMermaidView({ wrapper, viewport, canvas, pre, captionId, getLightSource: () => lightSource });
    wrapper.querySelectorAll('[data-diagram-action="fullscreen"]').forEach((b) => b.addEventListener('click', toggleFullscreen));
    setFullscreenControlState(false);
    document.addEventListener('keydown', handleFullscreenKeydown);
    mermaidView.initControls();
    // Mermaid measures label geometry while it builds the SVG. Rendering before
    // the self-hosted fonts settle produces a fallback-font graph whose height
    // can change between otherwise identical loads. Wait on FontFaceSet so the
    // diagram and the surrounding page have one deterministic layout.
    if (lightSource) {
      const render = () => mermaidView.render();
      const fontsReady = document.fonts?.ready;
      if (fontsReady) fontsReady.then(render, render);
      else render();
    }
    else {
      wrapper.querySelector('.diagram-loading')?.remove();
      pre.innerHTML = '<span class="gd-empty">No diagram source.</span>';
      pre.classList.add('gd-rendered');
      pre.removeAttribute('aria-hidden');
      wrapper.setAttribute('aria-busy', 'false');
      wrapper.dataset.diagramState = 'empty';
    }
  }

  // Lazy boot when scrolled near; immediate check + scroll/resize fallback so it
  // still boots when already on screen.
  let booted = false;
  const inView = () => { const r = wrapper.getBoundingClientRect(); return r.top < window.innerHeight + 300 && r.bottom > -300 && r.width > 0; };
  function tryBoot() {
    if (booted || !inView()) return;
    booted = true;
    io.disconnect();
    window.removeEventListener('scroll', tryBoot);
    window.removeEventListener('resize', tryBoot);
    try { boot(); } catch (err) { console.error('[graph-diagram] boot failed', err); }
  }
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) tryBoot(); }, { rootMargin: '300px' });
  io.observe(wrapper);
  window.addEventListener('scroll', tryBoot, { passive: true });
  window.addEventListener('resize', tryBoot, { passive: true });
  tryBoot();
}
