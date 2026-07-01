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

function setupWrapper(wrapper: HTMLElement) {
  let config: any = {};
  try { config = JSON.parse(wrapper.querySelector('.gd-config')?.textContent || '{}'); } catch { /* ignore */ }

  const viewport = wrapper.querySelector('.diagram-viewport') as HTMLElement | null;
  const canvas = wrapper.querySelector('.diagram-canvas') as HTMLElement | null;
  const pre = wrapper.querySelector('.gd-mermaid') as HTMLElement | null;
  if (!viewport || !canvas || !pre) return;

  // Source: the `source` prop (config.source), else the inline slot the
  // component rendered into the <pre> (reconstructed preserving <br/>).
  const lightSource: string = (config.source && String(config.source).trim()) || readPreSource(pre);
  let mermaidView: any = null;

  function toggleFullscreen() {
    const full = wrapper.classList.toggle('diagram-fullscreen');
    document.body.style.overflow = full ? 'hidden' : '';
  }

  function boot() {
    mermaidView = createMermaidView({ wrapper, viewport, canvas, pre, getLightSource: () => lightSource });
    wrapper.querySelectorAll('[data-diagram-action="fullscreen"]').forEach((b) => b.addEventListener('click', toggleFullscreen));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && wrapper.classList.contains('diagram-fullscreen')) toggleFullscreen(); });
    mermaidView.initControls();
    if (lightSource) mermaidView.render();
    else { wrapper.querySelector('.diagram-loading')?.remove(); pre.innerHTML = '<span class="gd-empty">No diagram source.</span>'; }
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
