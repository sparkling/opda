/*
 * Ontology graph engines — shared registry + helpers (ADR-0043 / ADR-0047).
 *
 * The /ontology/graph page is a multi-engine "bake-off": every scored graph
 * library renders the SAME committed model (/data/ontology-graph-elements.json)
 * in its own tab, so the ADR-0043 Cytoscape pick can be judged in situ against
 * the alternatives. Each engine is an independent module under
 * public/ui/graph-engines/ that self-registers here; the orchestrator
 * (ontology-graph.js) builds the tab bar from the registry and drives the
 * active engine. Server-less: every engine lazy-loads from the jsdelivr CDN.
 *
 * ── Engine contract ───────────────────────────────────────────────────────
 * window.opdaGraphEngines['<id>'] = {
 *   id:    '<id>',
 *   label: '<Display name>',
 *   kind:  'interactive' | 'diagram' | 'embed',
 *   order: <number>,                       // tab order (lower = earlier)
 *   note?: '<one-line caveat shown under the tab>',
 *   async mount(container, data, opts) -> handle
 * }
 *   container : the (sized, visible) DOM element to render into.
 *   data      : { nodes, edges, modules, ufoCategories } already fetched & deep-cloned.
 *               node = { data: { id, ref, label, type, ufoCategory, module, hasShape } }
 *               edge = { data: { id, source, target, label, kind } }
 *               type ∈ class|scheme|concept|external · kind ∈ objectProperty|inScheme|broader
 *   opts      : { isDark, showSkos, colors, theme, onSelect(nodeData|null), onStatus(msg) }
 *   handle    : { setTheme(isDark)?, setSkos(show)?, reset()?, destroy()? }  (all optional)
 *
 * Adapters NEVER hardcode the palette — they take colours from opts.colors /
 * opts.theme so dark-mode re-theming stays in one place.
 */
(function () {
  'use strict';
  if (window.OPDAGraph) return; // idempotent across data-astro-rerun

  var registry = (window.opdaGraphEngines = window.opdaGraphEngines || {});

  // Okabe–Ito colour-blind-safe categorical palette → UFO meta-category.
  var UFO_COLORS = {
    'Substance Kind':    '#0072B2',
    'Relator':           '#D55E00',
    'Role':              '#009E73',
    'RoleMixin':         '#56B4E9',
    'Event':             '#CC79A7',
    'Information Object': '#E69F00',
    'Quality':           '#B22222',
    'Quality Value':     '#8C5E2A',
    'Collective':        '#7F7F7F',
  };
  var COLORS = {
    ufo: UFO_COLORS,
    scheme: '#6E56CF',        // SKOS concept scheme
    concept: '#9E8CFC',       // SKOS concept
    external: '#9E9E9E',      // non-opda target
    defaultClass: '#7F7F7F',
  };

  // Resolve a CSS custom property to a concrete rgb() string — a hidden probe
  // collapses nested var() chains that getPropertyValue may leave unresolved.
  function resolveColor(varName, fallback) {
    var probe = document.createElement('span');
    probe.style.cssText = 'display:none;color:var(' + varName + ',' + fallback + ')';
    document.body.appendChild(probe);
    var c = getComputedStyle(probe).color || fallback;
    probe.remove();
    return c;
  }

  function themeColors() {
    return {
      text:    resolveColor('--color-text-strong', '#141413'),
      muted:   resolveColor('--color-text-muted', '#6C6A64'),
      line:    resolveColor('--color-border-strong', '#6C6A64'),
      surface: resolveColor('--color-surface', '#FAF9F5'),
      brand:   resolveColor('--color-brand-500', '#CC785C'),
    };
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function colorForNode(d) {
    if (d.type === 'class') return UFO_COLORS[d.ufoCategory] || COLORS.defaultClass;
    if (d.type === 'scheme') return COLORS.scheme;
    if (d.type === 'concept') return COLORS.concept;
    if (d.type === 'external') return COLORS.external;
    return COLORS.defaultClass;
  }

  // True for nodes/edges that belong to the SKOS layer (hidden unless toggled on).
  function isSkosNode(d) { return d.type === 'scheme' || d.type === 'concept'; }
  function isSkosEdge(d) { return d.kind === 'inScheme' || d.kind === 'broader'; }

  // A shallow filtered view of data honouring the SKOS toggle. Returns plain
  // arrays of node/edge `data` objects (most non-Cytoscape engines want those).
  function viewData(data, showSkos) {
    var nodes = data.nodes.map(function (n) { return n.data; });
    var edges = data.edges.map(function (e) { return e.data; });
    if (!showSkos) {
      nodes = nodes.filter(function (d) { return !isSkosNode(d); });
      edges = edges.filter(function (d) { return d.kind === 'objectProperty'; });
    }
    var ids = {};
    nodes.forEach(function (d) { ids[d.id] = true; });
    edges = edges.filter(function (d) { return ids[d.source] && ids[d.target]; });
    return { nodes: nodes, edges: edges };
  }

  window.OPDAGraph = {
    registry: registry,
    COLORS: COLORS,
    resolveColor: resolveColor,
    themeColors: themeColors,
    isDark: isDark,
    colorForNode: colorForNode,
    isSkosNode: isSkosNode,
    isSkosEdge: isSkosEdge,
    viewData: viewData,
  };
})();
