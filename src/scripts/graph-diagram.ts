// @ts-nocheck
/**
 * GraphDiagram engine — the static-source subset of hm/semantic-app's
 * scripts/graph-diagram (upstream hm/semantic-app ADR-0190). OPDA diagrams are authored statically (a
 * mermaid `source` embedded as JSON in `.gd-config`); the hm `subject` /
 * `concept-graph` modes (which build the source in-browser from an RDF store)
 * are out of scope, so they are omitted.
 *
 * Idempotent + re-run on `astro:page-load` so it survives the ClientRouter
 * view-transition SPA navigation (opda-view-transition-render-patterns).
 */
import { createMermaidView } from './graph-diagram-mermaid';
import { graphDiagramShellHtml } from '../lib/graph-diagram-shell';
import {
  DEFAULT_MERMAID_PROPERTY_LAYERS,
  filterMermaidPropertyLayers,
  mermaidPropertyLayerCapabilities,
} from '../lib/mermaid-property-layers.mjs';

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
function readMermaidSource(element: Element): string {
  let out = '';
  element.childNodes.forEach((n) => {
    if (n.nodeName === 'BR') out += '<br/>';
    else out += (n as any).textContent || '';
  });
  return out.trim();
}

// ── Global adoption of bare `.mermaid` divs ──────────────────────────────────
// Every diagram the remark plugin, <Diagram>, or an inline page emits is a bare
// `<div class="mermaid">SOURCE</div>`. Wrap each in the island shell so the whole
// site's diagrams get pan/zoom/fullscreen. Bare diagrams are static teaching
// images; only explicit GraphDiagram components opt into node navigation.
export function adoptBareMermaid() {
  document.querySelectorAll('.mermaid').forEach((el) => {
    if (el.classList.contains('gd-mermaid')) return;         // the island's own <pre>
    if (el.closest('.graph-diagram-wrapper')) return;        // already adopted
    if ((el as any)._gdAdopted || el.querySelector('svg')) return;
    (el as any)._gdAdopted = true;
    const source = readMermaidSource(el);
    if (!source) return;
    const shell = document.createElement('figure');
    shell.className = 'graph-diagram-wrapper';
    shell.dataset.nodeInteraction = /(?:^|\n)\s*erDiagram\b/iu.test(source)
      ? 'interactive'
      : (el.getAttribute('data-node-interaction') || 'static');
    const figure = el.closest('figure');
    if (figure?.classList.contains('diagram')) shell.classList.add(...figure.classList);
    shell.innerHTML = graphDiagramShellHtml();
    (shell.querySelector('.gd-mermaid') as HTMLElement).textContent = source;
    // Preserve a caption sibling if the diagram sits in a <figure>.
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
  const interactiveNodes = wrapper.dataset.nodeInteraction === 'interactive';
  wrapper.setAttribute('aria-busy', 'true');

  // Source: the `source` prop (config.source), else the inline slot the
  // component rendered into the <pre> (reconstructed preserving <br/>).
  const lightSource: string = (config.source && String(config.source).trim()) || readMermaidSource(pre);
  const layerCapabilities = mermaidPropertyLayerCapabilities(lightSource);
  const layerState = { ...DEFAULT_MERMAID_PROPERTY_LAYERS };
  let mermaidView: any = null;
  let fullscreenReturnFocus: HTMLElement | null = null;
  let previousBodyOverflow = '';

  const layerGroup = wrapper.querySelector<HTMLElement>('.gd-property-layers');
  if (layerGroup && layerCapabilities.enabled) {
    layerGroup.hidden = false;
    layerGroup.querySelectorAll<HTMLButtonElement>('[data-diagram-layer]').forEach((button) => {
      const layer = button.dataset.diagramLayer as 'datatype' | 'object' | 'inheritance';
      const available = Boolean(layerCapabilities[layer]);
      button.disabled = !available;
      button.setAttribute('aria-pressed', String(available && layerState[layer]));
      button.setAttribute('aria-label', available
        ? `${button.textContent?.trim()}. Activate to ${layerState[layer] ? 'hide' : 'show'} this layer.`
        : `${button.textContent?.trim()} layer is not present in this diagram.`);
      button.addEventListener('click', () => {
        if (!available) return;
        layerState[layer] = !layerState[layer];
        button.setAttribute('aria-pressed', String(layerState[layer]));
        button.setAttribute('aria-label', `${button.textContent?.trim()}. Activate to ${layerState[layer] ? 'hide' : 'show'} this layer.`);
        wrapper.setAttribute('aria-busy', 'true');
        mermaidView?.render();
      });
    });
  }

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
    mermaidView = createMermaidView({
      wrapper, viewport, canvas, pre, captionId, interactiveNodes,
      getLightSource: () => filterMermaidPropertyLayers(lightSource, layerState),
    });
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
