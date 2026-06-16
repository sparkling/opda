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
 *   opts      : { isDark, showSkos, facets, colors, theme, onSelect(nodeData|null), onStatus(msg) }
 *               facets = Set of visible opda:ufoCategory values (null = show all).
 *   handle    : { setTheme(isDark)?, setSkos(show)?, setFacets(facetSet|null)?, reset()?, destroy()? }
 *
 * Node fill encodes the node TYPE (class/scheme/concept/external) — NOT the UFO
 * facet, which is a filter (opts.facets / handle.setFacets). Adapters NEVER
 * hardcode the palette — colours come from opts.colors / opts.theme so dark-mode
 * re-theming stays in one place.
 */
(function () {
  'use strict';
  if (window.OPDAGraph) return; // idempotent across data-astro-rerun

  var registry = (window.opdaGraphEngines = window.opdaGraphEngines || {});

  // Node fill encodes the structural node TYPE/layer, not the UFO facet. The
  // facet (opda:ufoCategory) is a FILTER dimension instead — it was too noisy as
  // a 9-hue fill, and painting gUFO categories onto domain nodes conflated the
  // layers. One calm colour per type keeps the OWL / SKOS / external layers legible.
  var COLORS = {
    class:    '#0072B2',      // owl:Class (uniform — filter by facet, not colour)
    scheme:   '#6E56CF',      // skos:ConceptScheme
    concept:  '#9E8CFC',      // skos:Concept
    external: '#9E9E9E',      // non-opda object-property target
    derived:  '#009E73',      // derived "constrained-by" bridge — dashed, never an asserted edge
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
    if (d.type === 'scheme') return COLORS.scheme;
    if (d.type === 'concept') return COLORS.concept;
    if (d.type === 'external') return COLORS.external;
    return COLORS.class; // class (and any unknown) → the primary entity colour
  }

  // True for nodes/edges that belong to the SKOS layer (hidden unless toggled on).
  function isSkosNode(d) { return d.type === 'scheme' || d.type === 'concept'; }
  function isSkosEdge(d) { return d.kind === 'inScheme' || d.kind === 'broader'; }

  // A shallow filtered view of data honouring the SKOS toggle AND the facet
  // filter. The second arg is either a boolean (legacy: showSkos) or an options
  // object { showSkos, facets } where `facets` is a Set of visible ufoCategory
  // values (null/absent = no facet filter). Only class nodes carry a facet, so
  // the facet filter acts on the class layer; scheme/concept/external pass through.
  // Returns plain arrays of node/edge `data` objects (most engines want those).
  function viewData(data, filter) {
    if (typeof filter === 'boolean') filter = { showSkos: filter };
    filter = filter || {};
    var showSkos = !!filter.showSkos;
    var facets = filter.facets || null;
    var nodes = data.nodes.map(function (n) { return n.data; });
    var edges = data.edges.map(function (e) { return e.data; });
    if (!showSkos) {
      // OWL T-Box default + the derived scheme bridges (council 045 Q1/Q3): keep
      // classes/externals, objectProperty + constrainedByScheme edges, and the few
      // scheme nodes those bridges target — but not the rest of the SKOS layer.
      var bridgeTargets = {};
      edges.forEach(function (d) { if (d.kind === 'constrainedByScheme') bridgeTargets[d.target] = true; });
      nodes = nodes.filter(function (d) { return !isSkosNode(d) || bridgeTargets[d.id]; });
      edges = edges.filter(function (d) { return d.kind === 'objectProperty' || d.kind === 'constrainedByScheme'; });
    }
    if (facets) {
      nodes = nodes.filter(function (d) {
        return d.type !== 'class' || facets.has(d.ufoCategory || '');
      });
    }
    var ids = {};
    nodes.forEach(function (d) { ids[d.id] = true; });
    edges = edges.filter(function (d) { return ids[d.source] && ids[d.target]; });
    // Drop external/scheme targets left with no live edge (their connecting class
    // was facet-filtered out, or the bridge's class is hidden) — they'd otherwise
    // float context-free. A no-op in the unfiltered view; only bites under a filter.
    var deg = {};
    edges.forEach(function (d) { deg[d.source] = deg[d.target] = true; });
    nodes = nodes.filter(function (d) { return (d.type !== 'external' && d.type !== 'scheme') || deg[d.id]; });
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
