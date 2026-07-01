// @ts-nocheck
/**
 * GraphDiagram core renderer — ported from hm/semantic-app (ADR-0190), adapted
 * for opda: the Cagle palette + Claude theme are INJECTED (client.js's
 * spliceCageClassDefs convention) rather than embedded-and-swapped, navigation
 * uses `click NODE "url"` directives the page emits, and re-render on theme
 * toggle is driven by a MutationObserver on `data-theme` (opda has no
 * `hm:theme-change` event).
 *
 * mermaid + @mermaid-js/layout-elk are dynamic-import()ed (Astro island); they
 * are pre-bundled via vite.optimizeDeps (astro.config.mjs) so Astro 7 / Vite 8
 * never races the on-demand re-optimisation.
 */
import {
  CLASSDEFS_LIGHT, CLASSDEFS_DARK, THEMEVARS_LIGHT, THEMEVARS_DARK,
} from '../lib/diagram-palette';

export interface MermaidViewOpts {
  wrapper: HTMLElement;
  viewport: HTMLElement;
  canvas: HTMLElement;
  pre: HTMLElement;
  getLightSource: () => string;
}
export interface MermaidView {
  render: () => void;
  initControls: () => void;
  readonly rendered: boolean;
}

let mermaidMod: any = null;
function loadMermaid() {
  if (mermaidMod) return Promise.resolve(mermaidMod);
  return Promise.all([import('mermaid'), import('@mermaid-js/layout-elk')]).then((mods) => {
    mermaidMod = mods[0].default;
    mermaidMod.registerLayoutLoaders(mods[1].default);
    return mermaidMod;
  });
}

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

// ── diagram-links click-navigation (ported from public/ui/client.js) ─────────
// A build-time manifest (ADR-0022) maps node/entity names → routes. Nodes carry
// no `click` directive; navigation is resolved from this manifest by entity-id
// (ER diagrams) or first-line label text (flowchart/class/state).
let diagramLinks: Record<string, string> | null = null;
function loadDiagramLinks(): Promise<Record<string, string>> {
  if (diagramLinks) return Promise.resolve(diagramLinks);
  const cached = (window as any).__diagramLinks;
  if (cached) { diagramLinks = cached; return Promise.resolve(cached); }
  return fetch('/data/diagram-links.json')
    .then((r) => (r.ok ? r.json() : {}))
    .then((data) => { diagramLinks = (data && typeof data === 'object') ? data : {}; (window as any).__diagramLinks = diagramLinks; return diagramLinks!; })
    .catch(() => { diagramLinks = {}; return diagramLinks!; });
}
// PascalCase/camelCase/underscored → all-lowercase, separators stripped.
const normToManifestKey = (raw: string) => raw.replace(/[\s_]/g, '').toLowerCase();
// Entity name from a Mermaid 11 ER node id (`…entity-NAME-N`).
function entityNameFromId(id: string): string | null {
  const m = (id || '').match(/entity-([A-Za-z][A-Za-z_0-9]*)-\d+$/);
  return m ? m[1] : null;
}
// First visible line of text from an SVG node (flowchart/class/state labels).
function extractFirstLineText(el: Element): string {
  const fo = el.querySelector('foreignObject p, foreignObject span');
  if (fo && fo.textContent) return fo.textContent.trim();
  const texts = el.querySelectorAll('text, tspan, .label, .nodeLabel');
  for (let i = 0; i < texts.length; i++) { const t = texts[i].textContent?.trim(); if (t) return t; }
  return (el.textContent || '').split('\n')[0].trim();
}

// Inject the Cagle classDef block after the diagram-type line, so a page can
// author bare `:::user` (client.js's spliceCageClassDefs, ported).
const CLASSDEF_TYPE_RE = /^\s*(flowchart|graph|classDiagram|stateDiagram(?:-v2)?)\b/i;
function injectClassDefs(src: string, dark: boolean): string {
  const block = (dark ? CLASSDEFS_DARK : CLASSDEFS_LIGHT).join('\n');
  const lines = src.split('\n');
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) { if (CLASSDEF_TYPE_RE.test(lines[i])) { insertIdx = i + 1; break; } }
  if (insertIdx === -1) return src;
  return lines.slice(0, insertIdx).concat([block]).concat(lines.slice(insertIdx)).join('\n');
}

export function createMermaidView(opts: MermaidViewOpts): MermaidView {
  const { wrapper, viewport, canvas, pre } = opts;

  let scale = 1, panX = 0, panY = 0;
  const MIN = 0.1, MAX = 5, ZOOM_BTN = 1.2;
  let dragging = false, didDrag = false, dsx = 0, dsy = 0, psx = 0, psy = 0;
  let mode: 'navigate' | 'explore' = 'navigate';
  let lockedNode: string | null = null;
  let didRender = false;

  function applyTransform() {
    canvas.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`;
    const label = wrapper.querySelector('.diagram-zoom-label');
    if (label) label.textContent = Math.round(scale * 100) + '%';
  }
  function resetView() { scale = 1; panX = 0; panY = 0; applyTransform(); }
  function zoom(factor: number, cx?: number, cy?: number) {
    const rect = viewport.getBoundingClientRect();
    const px = cx ?? rect.width / 2;
    const py = cy ?? rect.height / 2;
    const old = scale;
    scale = Math.min(MAX, Math.max(MIN, scale * factor));
    const ratio = scale / old;
    panX = px - ratio * (px - panX);
    panY = py - ratio * (py - panY);
    applyTransform();
  }

  function render() {
    const lightSource = opts.getLightSource();
    if (!lightSource) return;
    loadDiagramLinks();  // manifest for click-navigation (cached; ready by click time)
    loadMermaid().then((mermaid) => {
      const dark = isDark();
      const src = injectClassDefs(lightSource, dark);
      pre.removeAttribute('data-processed');
      pre.textContent = src;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',   // htmlLabels — the "(Section)" <br/> sublabels
        theme: 'base',
        themeVariables: dark ? THEMEVARS_DARK : THEMEVARS_LIGHT,
        flowchart: { htmlLabels: true },
      });
      mermaid
        .run({ nodes: [pre] })
        .then(() => { wrapper.querySelector('.diagram-loading')?.remove(); didRender = true; initHoverHighlight(); })
        .catch((e: any) => console.error('[graph-diagram] mermaid render', e));
    });
  }

  function initHoverHighlight() {
    const svg = pre.querySelector('svg');
    if (!svg) return;
    const lightSource = opts.getLightSource();

    const edgeList: { source: string; target: string }[] = [];
    const re = /^\s*(\w+)\s+[-.=]+[-.=>o|x]*>?\|?[^|]*\|?\s*(\w+)/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(lightSource)) !== null) edgeList.push({ source: m[1], target: m[2] });

    const nodeEdges: Record<string, number[]> = {};
    edgeList.forEach((e, i) => { (nodeEdges[e.source] ||= []).push(i); (nodeEdges[e.target] ||= []).push(i); });

    let edgePaths = svg.querySelectorAll('.edgePaths > path.flowchart-link');
    if (edgePaths.length === 0) edgePaths = svg.querySelectorAll('.edgePaths path.flowchart-link');
    const edgeLabels = svg.querySelectorAll('.edgeLabels > .edgeLabel');
    const nodes = svg.querySelectorAll('.node');
    const hi = isDark() ? '#FFA726' : '#CC785C';
    const DIM = '0.1';

    const nameOf = (el: Element) => { const mx = (el.id || '').match(/flowchart-(.+?)-\d+$/); return mx ? mx[1] : el.id || ''; };
    function applyHighlight(name: string) {
      const idx = nodeEdges[name] || [];
      const connected: Record<string, boolean> = { [name]: true };
      idx.forEach((i) => { connected[edgeList[i].source] = true; connected[edgeList[i].target] = true; });
      nodes.forEach((n) => { (n as HTMLElement).style.opacity = connected[nameOf(n)] ? '1' : DIM; });
      edgePaths.forEach((p, i) => {
        const el = p as HTMLElement;
        if (idx.indexOf(i) !== -1) { el.style.opacity = '1'; el.style.stroke = hi; el.style.strokeWidth = '3px'; el.style.filter = `drop-shadow(0 0 3px ${hi})`; }
        else el.style.opacity = DIM;
      });
      edgeLabels.forEach((el, i) => { (el as HTMLElement).style.opacity = idx.indexOf(i) !== -1 ? '1' : DIM; });
    }
    function clearHighlight() {
      nodes.forEach((n) => { (n as HTMLElement).style.opacity = ''; });
      edgePaths.forEach((p) => { const el = p as HTMLElement; el.style.opacity = ''; el.style.stroke = ''; el.style.strokeWidth = ''; el.style.filter = ''; });
      edgeLabels.forEach((el) => { (el as HTMLElement).style.opacity = ''; });
    }

    // Navigation targets: `click NODE "url"` directives (ontology diagrams
    // emit these) OR the diagram-links manifest (schema/manual diagrams resolve
    // by ER entity-id or flowchart label text — client.js's attachNodeClicks).
    const urls: Record<string, string> = {};
    const cre = /^\s*click\s+(\w+)\s+"([^"]+)"/gm;
    let cm: RegExpExecArray | null;
    while ((cm = cre.exec(lightSource)) !== null) urls[cm[1]] = cm[2];
    const isER = (svg.getAttribute('class') || '') === 'erDiagram';
    function navTarget(nodeEl: Element): string | null {
      const direct = urls[nameOf(nodeEl)];
      if (direct) return direct;
      const manifest = (window as any).__diagramLinks as Record<string, string> | undefined;
      if (!manifest) return null;
      const raw = isER ? entityNameFromId((nodeEl as HTMLElement).id) : extractFirstLineText(nodeEl);
      if (!raw) return null;
      return manifest[normToManifestKey(raw)] || null;
    }

    svg.addEventListener('click', (evt) => {
      if (didDrag) { didDrag = false; return; }
      const nodeEl = (evt.target as Element).closest('.node, g[id*="entity-"]');
      if (mode === 'navigate') {
        if (nodeEl) { const url = navTarget(nodeEl); if (url) { evt.preventDefault(); evt.stopPropagation(); window.location.href = url; } }
        return;
      }
      if (nodeEl) {
        evt.preventDefault(); evt.stopPropagation();
        const n = nameOf(nodeEl);
        if (lockedNode === n) { lockedNode = null; clearHighlight(); } else { lockedNode = n; applyHighlight(n); }
      } else if (lockedNode) { lockedNode = null; clearHighlight(); }
    }, true);

    nodes.forEach((node) => {
      const n = nameOf(node);
      (node as HTMLElement).style.cursor = (mode === 'navigate' && navTarget(node)) || mode === 'explore' ? 'pointer' : 'default';
      if (isER) return; // hover-highlight is edge-based (flowchart); skip for ER
      node.addEventListener('mouseenter', () => { if (dragging || lockedNode) return; applyHighlight(n); });
      node.addEventListener('mouseleave', () => { if (lockedNode) return; clearHighlight(); });
    });
  }

  function initControls() {
    wrapper.querySelectorAll('[data-diagram-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const a = btn.getAttribute('data-diagram-action');
        if (a === 'zoom-in') zoom(ZOOM_BTN);
        else if (a === 'zoom-out') zoom(1 / ZOOM_BTN);
        else if (a === 'reset') resetView();
        else if (a === 'toggle-mode') toggleMode();
      });
    });

    function toggleMode() {
      const label = wrapper.querySelector('.diagram-mode-label');
      const toggle = wrapper.querySelector('.diagram-mode-toggle');
      if (mode === 'navigate') {
        mode = 'explore';
        if (label) label.textContent = 'Explore';
        toggle?.classList.add('gd-mode-on');
      } else {
        mode = 'navigate'; lockedNode = null;
        if (label) label.textContent = 'Navigate';
        toggle?.classList.remove('gd-mode-on');
        clearAllHighlight();
      }
      const svg = pre.querySelector('svg');
      svg?.querySelectorAll('.node').forEach((n) => { (n as HTMLElement).style.cursor = 'pointer'; });
    }
    function clearAllHighlight() {
      const svg = pre.querySelector('svg'); if (!svg) return;
      svg.querySelectorAll('.node').forEach((n) => { (n as HTMLElement).style.opacity = ''; });
      svg.querySelectorAll('path.flowchart-link').forEach((p) => { const el = p as HTMLElement; el.style.opacity = ''; el.style.stroke = ''; el.style.strokeWidth = ''; el.style.filter = ''; });
      svg.querySelectorAll('.edgeLabel').forEach((el) => { (el as HTMLElement).style.opacity = ''; });
    }

    let nudgeTimer: any = null;
    function nudge() { wrapper.classList.add('zoom-nudge'); if (nudgeTimer) clearTimeout(nudgeTimer); nudgeTimer = setTimeout(() => wrapper.classList.remove('zoom-nudge'), 900); }
    viewport.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) { nudge(); return; }
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const factor = Math.min(1.18, Math.max(0.85, Math.exp(-e.deltaY * 0.0012)));
      zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });

    viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if ((e.target as Element).closest('.node') && mode === 'navigate') return;
      dragging = true; didDrag = false; dsx = e.clientX; dsy = e.clientY; psx = panX; psy = panY;
      viewport.style.cursor = 'grabbing'; e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - dsx, dy = e.clientY - dsy;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
      panX = psx + dx; panY = psy + dy; applyTransform();
    });
    window.addEventListener('mouseup', () => { if (dragging) { dragging = false; viewport.style.cursor = 'grab'; } });

    let lastTouches: TouchList | null = null;
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) { dragging = true; dsx = e.touches[0].clientX; dsy = e.touches[0].clientY; psx = panX; psy = panY; }
      lastTouches = e.touches;
    }, { passive: true });
    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && dragging) {
        panX = psx + (e.touches[0].clientX - dsx); panY = psy + (e.touches[0].clientY - dsy); applyTransform(); e.preventDefault();
      } else if (e.touches.length === 2 && lastTouches && lastTouches.length === 2) {
        const od = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
        const nd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const rect = viewport.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        if (od > 0) zoom(nd / od, cx, cy); lastTouches = e.touches; e.preventDefault();
      }
    }, { passive: false });
    viewport.addEventListener('touchend', () => { dragging = false; lastTouches = null; });

    const armZoom = (on: boolean) => {
      wrapper.classList.toggle('zoom-active', on);
      wrapper.querySelector('.gd-ctrl')?.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    const setZoomArmed = (e: KeyboardEvent) => armZoom(e.ctrlKey || e.metaKey);
    window.addEventListener('keydown', setZoomArmed);
    window.addEventListener('keyup', setZoomArmed);
    window.addEventListener('blur', () => armZoom(false));

    // Re-render on theme toggle (opda flips <html data-theme>; no custom event).
    let lastTheme = document.documentElement.getAttribute('data-theme');
    new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme');
      if (t !== lastTheme) { lastTheme = t; if (didRender) render(); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  return { render, initControls, get rendered() { return didRender; } };
}
