// @ts-nocheck
// Shared Mermaid/ELK renderer with OPDA palette, navigation and theme support.
import {
  CLASSDEFS_LIGHT, CLASSDEFS_DARK, THEMEVARS_LIGHT, THEMEVARS_DARK,
} from '../lib/diagram-palette';
import { createDiagramViewport } from './graph-diagram-viewport';

export interface MermaidViewOpts {
  wrapper: HTMLElement;
  viewport: HTMLElement;
  canvas: HTMLElement;
  pre: HTMLElement;
  captionId?: string;
  links?: Record<string, string>;
  getLightSource: () => string;
}
export interface MermaidView {
  render: () => void;
  initControls: () => void;
  readonly rendered: boolean;
}

let mermaidMod: any = null;
let mermaidRenderId = 0;   // globally-unique id per mermaid.render() call
let svgA11yId = 0;
function loadMermaid() {
  if (mermaidMod) return Promise.resolve(mermaidMod);
  return Promise.all([import('mermaid'), import('@mermaid-js/layout-elk')]).then((mods) => {
    mermaidMod = mods[0].default;
    mermaidMod.registerLayoutLoaders(mods[1].default);
    return mermaidMod;
  });
}

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

// erDiagram row-contrast (ported from client.js's fixErRowContrast). Mermaid 11's
// ER renderer hardcodes light attribute-row fills (rgb(233,231,228)) and ignores
// the theme's attributeBackground vars, so in dark mode those rows sit under the
// theme's light text → white-on-white. Recolour light fills → dark surface in
// dark mode (and any stray dark fill → light in light mode), keyed by luminance.
// Gated to erDiagram + the island's own <pre>; re-runs on every (re-)render.
function fixErRowContrast(pre: HTMLElement, dark: boolean) {
  const svg = pre.querySelector('svg');
  if (!svg || (svg.getAttribute('class') || '') !== 'erDiagram') return;
  svg.querySelectorAll('g.node path').forEach((p) => {
    const f = getComputedStyle(p as Element).fill;
    const m = f && f.match(/\d+(?:\.\d+)?/g);
    if (!m || m.length < 3) return;                 // skip fill:none borders/edges
    const lum = 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2];
    if (dark && lum > 140) (p as HTMLElement).style.setProperty('fill', '#231F2F', 'important');
    else if (!dark && lum < 100) (p as HTMLElement).style.setProperty('fill', '#F1F0F4', 'important');
  });
}

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

function safeRootRelativeRoute(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\/(?!\/)[^\\\u0000-\u001f]*$/u.test(value)) return null;
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? value : null;
  } catch {
    return null;
  }
}

function validateConfiguredLinks(input: unknown): Record<string, string> {
  if (input == null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('[graph-diagram] configured links must be an object');
  }
  const configuredLinks: Record<string, string> = {};
  for (const [nodeId, value] of Object.entries(input as Record<string, unknown>)) {
    const route = safeRootRelativeRoute(value);
    if (!/^\w+$/u.test(nodeId) || !route) {
      throw new Error(`[graph-diagram] invalid configured link ${nodeId}`);
    }
    configuredLinks[nodeId] = route;
  }
  return configuredLinks;
}

// Inject the OPDA classDef block after the diagram-type line, so a page can
// author bare semantic classes such as `:::user`.
const CLASSDEF_TYPE_RE = /^\s*(flowchart|graph|classDiagram|stateDiagram(?:-v2)?)\b/i;
function injectClassDefs(src: string, dark: boolean): string {
  const block = (dark ? CLASSDEFS_DARK : CLASSDEFS_LIGHT).join('\n');
  const lines = src.split('\n');
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) { if (CLASSDEF_TYPE_RE.test(lines[i])) { insertIdx = i + 1; break; } }
  if (insertIdx === -1) return src;
  return lines.slice(0, insertIdx).concat([block]).concat(lines.slice(insertIdx)).join('\n');
}

const GEOMETRY_ATTRS = [
  'viewBox', 'width', 'height', 'transform', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'cx', 'cy', 'r', 'rx', 'ry', 'points', 'd', 'refX', 'refY', 'markerWidth',
  'markerHeight', 'marker-start', 'marker-end',
];
function geometryProjection(svg: Element): string {
  return JSON.stringify([svg, ...svg.querySelectorAll('*')].map((element) => [
    element.tagName, element.id, ...GEOMETRY_ATTRS.map((name) => element.getAttribute(name)),
  ]));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Mermaid serialises classDef paint as inline !important declarations. An
// OPDA profile stylesheet cannot reliably override those declarations, so the
// preservation adapter repaints the completed SVG after ELK has laid it out.
// Only CSS paint/type properties are changed; geometry attributes and the SVG
// structure remain byte-for-byte as emitted by Mermaid.
async function applyOpdaDiagramProfile(wrapper: HTMLElement, pre: HTMLElement) {
  if (wrapper.dataset.diagramProfile !== 'opda-diagram-design') return;
  const svg = pre.querySelector('svg');
  if (!svg) throw new Error('[graph-diagram] OPDA profile requires a rendered Mermaid SVG');
  const geometryBefore = geometryProjection(svg);
  const tokens = getComputedStyle(document.documentElement);
  const token = (name: string) => tokens.getPropertyValue(name).trim();
  const palette = {
    paper: token('--color-surface-alt'),
    paper2: token('--color-surface-card'),
    ink: token('--color-text-strong'),
    muted: token('--color-text-muted'),
    rule: token('--color-border'),
    ruleStrong: token('--color-border-strong'),
    accent: token(isDark() ? '--color-data-1-dark' : '--color-data-1'),
    accentTint: token(isDark() ? '--color-surface-tint' : '--color-data-1-surface'),
    focus: token('--color-focus'),
  };
  const set = (element: Element, property: string, value: string) => {
    if (value) (element as HTMLElement).style.setProperty(property, value, 'important');
  };
  const directShapes = (node: Element) => [...node.querySelectorAll(':scope > rect, :scope > polygon, :scope > path')];

  function paintNode(node: Element) {
    let fill = palette.paper2;
    let stroke = node.classList.contains('process') ? palette.muted : palette.ruleStrong;
    let dash = 'none';
    if (node.classList.contains('xsection')) {
      fill = palette.paper;
      stroke = palette.ruleStrong;
      dash = '4 3';
    } else if (node.classList.contains('external')) {
      fill = palette.paper;
      stroke = palette.rule;
    }
    if (/-term_3-\d+$/u.test(node.id)) {
      fill = palette.accentTint;
      stroke = palette.accent;
    }
    directShapes(node).forEach((shape) => {
      set(shape, 'fill', fill);
      set(shape, 'stroke', stroke);
      set(shape, 'stroke-width', /-term_3-\d+$/u.test(node.id) ? '2px' : '1px');
      set(shape, 'stroke-dasharray', dash);
    });
    node.querySelectorAll('.nodeLabel, .nodeLabel p, .nodeLabel span').forEach((label) => {
      set(label, 'color', palette.ink);
    });
    node.querySelectorAll('.nodeLabel small').forEach((label) => set(label, 'color', palette.muted));
  }

  svg.querySelectorAll('.node').forEach((node) => {
    paintNode(node);
    node.addEventListener('focus', () => directShapes(node).forEach((shape) => {
      set(shape, 'stroke', palette.focus);
      set(shape, 'stroke-width', '3px');
      set(shape, 'filter', 'none');
    }));
    node.addEventListener('blur', () => paintNode(node));
  });
  svg.querySelectorAll('.cluster > rect').forEach((frame) => {
    set(frame, 'fill', palette.paper);
    set(frame, 'stroke', palette.ruleStrong);
    set(frame, 'stroke-width', '1px');
  });
  svg.querySelectorAll('.cluster-label, .cluster-label span').forEach((label) => {
    set(label, 'color', palette.muted);
    set(label, 'fill', palette.muted);
  });
  svg.querySelectorAll('.edgePaths path.flowchart-link').forEach((edge) => {
    set(edge, 'stroke', palette.muted);
    set(edge, 'stroke-width', '1px');
    set(edge, 'filter', 'none');
  });
  svg.querySelectorAll('marker path').forEach((marker) => {
    set(marker, 'fill', palette.muted);
    set(marker, 'stroke', palette.muted);
  });
  svg.querySelectorAll('.edgeLabel, .edgeLabel p, .edgeLabel span').forEach((label) => {
    set(label, 'color', palette.muted);
    set(label, 'background', palette.paper);
  });
  const geometryAfter = geometryProjection(svg);
  const [beforeSha256, afterSha256] = await Promise.all([
    sha256(geometryBefore), sha256(geometryAfter),
  ]);
  const geometryUnchanged = geometryAfter === geometryBefore && afterSha256 === beforeSha256;
  wrapper.dataset.profileGeometryBeforeSha256 = beforeSha256;
  wrapper.dataset.profileGeometryAfterSha256 = afterSha256;
  wrapper.dataset.profileGeometryInvariant = String(geometryUnchanged);
  if (!geometryUnchanged) throw new Error('[graph-diagram] OPDA profile changed Mermaid geometry');
}

export function createMermaidView(opts: MermaidViewOpts): MermaidView {
  const { wrapper, viewport, canvas, pre, captionId } = opts;
  const configuredLinks = validateConfiguredLinks(opts.links);

  let mode: 'navigate' | 'explore' = 'navigate';
  let lockedNode: string | null = null;
  let didRender = false;
  let renderSeq = 0;   // latest-wins guard: a newer render() supersedes older ones
  const viewportController = createDiagramViewport({
    wrapper,
    viewport,
    canvas,
    shouldStartDrag: (target) => !(
      mode === 'navigate' && target.closest('.node, g[id*="entity-"]')
    ),
  });

  function makeSvgFocusable(svg: SVGSVGElement) {
    const id = `gd-svg-title-${++svgA11yId}`;
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.id = id;
    title.textContent = 'Interactive diagram';
    svg.prepend(title);
    svg.setAttribute('role', 'group');
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('focusable', 'true');
    svg.setAttribute('aria-labelledby', id);
    if (captionId) svg.setAttribute('aria-describedby', captionId);
    viewportController.bindKeyboard(svg);
  }

  function render() {
    const lightSource = opts.getLightSource();
    if (!lightSource) return;
    wrapper.setAttribute('data-diagram-ready', 'false');
    const seq = ++renderSeq;   // this render's ticket; a later render() bumps it
    loadDiagramLinks();  // manifest for click-navigation (cached; ready by click time)
    loadMermaid().then((mermaid) => {
      if (seq !== renderSeq) return;                 // superseded before we started
      const dark = isDark();
      const src = injectClassDefs(lightSource, dark);
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',   // htmlLabels — the "(Section)" <br/> sublabels
        theme: 'base',
        themeVariables: dark ? THEMEVARS_DARK : THEMEVARS_LIGHT,
        flowchart: { htmlLabels: true },
      });
      // Use the string-render API (NOT mermaid.run on the <pre>) with a fresh
      // unique id each time. Re-running the same node on theme toggle left stale
      // processed-state/ids and raced concurrent toggles → a stale dark render
      // could land last (dark diagram in light mode) or the diagram went blank on
      // the 2nd light→dark→light cycle. render() + seq guard makes the LATEST
      // theme win and never overlaps.
      return mermaid.render('gd-render-' + (++mermaidRenderId), src).then(async ({ svg }: { svg: string }) => {
        if (seq !== renderSeq) return;               // superseded mid-render — drop this SVG
        pre.innerHTML = svg;
        fixErRowContrast(pre, dark);
        await applyOpdaDiagramProfile(wrapper, pre);
        if (seq !== renderSeq) return;
        const renderedSvg = pre.querySelector('svg');
        if (renderedSvg instanceof SVGSVGElement) makeSvgFocusable(renderedSvg);
        initHoverHighlight();
        wrapper.querySelector('.diagram-loading')?.remove();
        didRender = true;
        wrapper.setAttribute('data-diagram-ready', 'true');
      });
    }).catch((error: any) => {
      if (seq !== renderSeq) return;
      didRender = false;
      wrapper.setAttribute('data-diagram-ready', 'false');
      wrapper.querySelector('.diagram-loading')?.remove();
      const empty = document.createElement('span');
      empty.className = 'gd-empty';
      empty.setAttribute('role', 'status');
      empty.textContent = 'Diagram unavailable.';
      pre.replaceChildren(empty);
      console.error('[graph-diagram] mermaid render', error);
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
    const hi = isDark() ? '#FEC92B' : '#6C5BD4';
    const DIM = '0.1';

    const nameOf = (el: Element) => { const mx = (el.id || '').match(/flowchart-(.+?)-\d+$/); return mx ? mx[1] : el.id || ''; };
    function applyHighlight(name: string) {
      const idx = nodeEdges[name] || [];
      const connected: Record<string, boolean> = { [name]: true };
      idx.forEach((i) => { connected[edgeList[i].source] = true; connected[edgeList[i].target] = true; });
      nodes.forEach((n) => { (n as HTMLElement).style.opacity = connected[nameOf(n)] ? '1' : DIM; });
      edgePaths.forEach((p, i) => {
        const el = p as HTMLElement;
        if (idx.indexOf(i) !== -1) {
          el.style.opacity = '1';
          el.style.stroke = hi;
          el.style.strokeWidth = '3px';
          el.style.filter = wrapper.dataset.diagramProfile === 'opda-diagram-design'
            ? 'none' : `drop-shadow(0 0 3px ${hi})`;
        }
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
    while ((cm = cre.exec(lightSource)) !== null) {
      const route = safeRootRelativeRoute(cm[2]);
      if (route) urls[cm[1]] = route;
    }
    const isER = (svg.getAttribute('class') || '') === 'erDiagram';
    function navTarget(nodeEl: Element): string | null {
      const direct = configuredLinks[nameOf(nodeEl)] ?? urls[nameOf(nodeEl)];
      if (direct) return direct;
      const manifest = (window as any).__diagramLinks as Record<string, string> | undefined;
      if (!manifest) return null;
      const raw = isER ? entityNameFromId((nodeEl as HTMLElement).id) : extractFirstLineText(nodeEl);
      if (!raw) return null;
      return manifest[normToManifestKey(raw)] || null;
    }

    function toggleExploreNode(nodeEl: Element) {
      const name = nameOf(nodeEl);
      if (lockedNode === name) { lockedNode = null; clearHighlight(); }
      else { lockedNode = name; applyHighlight(name); }
    }

    function activateNode(nodeEl: Element) {
      if (mode === 'navigate') {
        const url = navTarget(nodeEl);
        if (url) window.location.href = url;
        return;
      }
      toggleExploreNode(nodeEl);
    }

    function updateNodeAccessibility() {
      nodes.forEach((node) => {
        const target = navTarget(node);
        const label = extractFirstLineText(node) || 'diagram item';
        const interactive = mode === 'explore' || Boolean(target);
        (node as HTMLElement).style.cursor = interactive ? 'pointer' : 'default';
        if (!interactive) {
          node.removeAttribute('tabindex');
          node.removeAttribute('focusable');
          node.removeAttribute('role');
          node.removeAttribute('aria-label');
          return;
        }
        node.setAttribute('tabindex', '0');
        node.setAttribute('focusable', 'true');
        node.setAttribute('role', mode === 'navigate' ? 'link' : 'button');
        node.setAttribute('aria-label', mode === 'navigate' ? `Open ${label}` : `Explore ${label}`);
      });
    }

    svg.addEventListener('click', (evt) => {
      if (viewportController.consumeDidDrag()) return;
      const nodeEl = (evt.target as Element).closest('.node, g[id*="entity-"]');
      if (mode === 'navigate') {
        if (nodeEl && navTarget(nodeEl)) {
          evt.preventDefault();
          evt.stopPropagation();
          activateNode(nodeEl);
        }
        return;
      }
      if (nodeEl) {
        evt.preventDefault();
        evt.stopPropagation();
        activateNode(nodeEl);
      } else if (lockedNode) { lockedNode = null; clearHighlight(); }
    }, true);

    nodes.forEach((node) => {
      const n = nameOf(node);
      node.addEventListener('keydown', (event) => {
        const key = (event as KeyboardEvent).key;
        if (key !== 'Enter' && key !== ' ') return;
        if (mode === 'navigate' && !navTarget(node)) return;
        event.preventDefault();
        event.stopPropagation();
        activateNode(node);
      });
      if (isER) return; // hover-highlight is edge-based (flowchart); skip for ER
      node.addEventListener('mouseenter', () => { if (viewportController.dragging || lockedNode) return; applyHighlight(n); });
      node.addEventListener('mouseleave', () => { if (lockedNode) return; clearHighlight(); });
    });
    updateNodeAccessibility();
    (wrapper as any)._gdUpdateNodeAccessibility = updateNodeAccessibility;
  }

  function initControls() {
    viewportController.initControls();

    function toggleMode() {
      const label = wrapper.querySelector('.diagram-mode-label');
      const toggle = wrapper.querySelector<HTMLButtonElement>('.diagram-mode-toggle');
      if (mode === 'navigate') {
        mode = 'explore';
        if (label) label.textContent = 'Explore';
        toggle?.classList.add('gd-mode-on');
        toggle?.setAttribute('aria-pressed', 'true');
        toggle?.setAttribute('aria-label', 'Explore mode. Activate to switch to navigate mode.');
      } else {
        mode = 'navigate'; lockedNode = null;
        if (label) label.textContent = 'Navigate';
        toggle?.classList.remove('gd-mode-on');
        toggle?.setAttribute('aria-pressed', 'false');
        toggle?.setAttribute('aria-label', 'Navigate mode. Activate to switch to explore mode.');
        clearAllHighlight();
      }
      (wrapper as any)._gdUpdateNodeAccessibility?.();
    }
    function clearAllHighlight() {
      const svg = pre.querySelector('svg'); if (!svg) return;
      svg.querySelectorAll('.node').forEach((n) => { (n as HTMLElement).style.opacity = ''; });
      svg.querySelectorAll('path.flowchart-link').forEach((p) => { const el = p as HTMLElement; el.style.opacity = ''; el.style.stroke = ''; el.style.strokeWidth = ''; el.style.filter = ''; });
      svg.querySelectorAll('.edgeLabel').forEach((el) => { (el as HTMLElement).style.opacity = ''; });
    }

    const modeToggle = wrapper.querySelector<HTMLButtonElement>('.diagram-mode-toggle');
    modeToggle?.addEventListener('click', toggleMode);
    modeToggle?.setAttribute('aria-pressed', 'false');
    modeToggle?.setAttribute('aria-label', 'Navigate mode. Activate to switch to explore mode.');

    // Re-render on theme toggle (opda flips <html data-theme>; no custom event).
    let lastTheme = document.documentElement.getAttribute('data-theme');
    new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme');
      if (t !== lastTheme) { lastTheme = t; if (didRender) render(); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  return { render, initControls, get rendered() { return didRender; } };
}
