/*
 * Graph engine: Cytoscape.js (ADR-0043 primary pick; scorecard 91/100).
 *
 * The reference adapter. Cytoscape consumes our elements.json shape natively
 * ({ data: {...} } nodes/edges). Core + the fcose force layout lazy-load from
 * jsdelivr /+esm; the hierarchy layout uses the BUILT-IN breadthfirst
 * (cytoscape-dagre is avoided — dagre@0.8.5's /+esm build is broken). Styling
 * comes from opts.colors / opts.theme so re-theming lives in the orchestrator.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    cytoscape: 'https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/+esm',
    fcose: 'https://cdn.jsdelivr.net/npm/cytoscape-fcose@2.2.0/+esm',
  };
  var libs = null;

  async function ensureLibs() {
    if (libs) return libs;
    if (window.__cyLibs) return (libs = window.__cyLibs);
    var cyMod = await import(CDN.cytoscape);
    var cytoscape = cyMod.default || cyMod;
    var hasFcose = false;
    try {
      var fMod = await import(CDN.fcose);
      cytoscape.use(fMod.default || fMod);
      hasFcose = true;
    } catch (e) { console.warn('[OPDA] fcose unavailable; using built-in cose', e); }
    return (libs = window.__cyLibs = { cytoscape: cytoscape, hasFcose: hasFcose });
  }

  function styleSheet(opts) {
    var t = opts.theme, c = opts.colors;
    return [
      { selector: 'node', style: {
          'label': 'data(label)', 'font-size': 11, 'color': t.text,
          'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': 3,
          'text-wrap': 'wrap', 'text-max-width': 120, 'min-zoomed-font-size': 8,
          'width': 22, 'height': 22, 'border-width': 1.5, 'border-color': t.surface,
          'background-color': function (n) { return S.colorForNode(n.data()); },
      } },
      { selector: 'node[type="class"]', style: { 'width': 30, 'height': 30, 'font-weight': 'bold' } },
      { selector: 'node[type="class"][?hasShape]', style: {
          'border-width': 3, 'border-color': t.brand, 'border-style': 'double' } },
      { selector: 'node[type="scheme"]', style: { 'shape': 'round-rectangle', 'width': 26, 'height': 20 } },
      { selector: 'node[type="concept"]', style: { 'shape': 'ellipse', 'width': 14, 'height': 14, 'font-size': 9 } },
      { selector: 'node[type="external"]', style: { 'shape': 'diamond', 'width': 24, 'height': 24 } },
      { selector: 'edge', style: {
          'width': 1, 'line-color': t.line, 'target-arrow-color': t.line,
          'target-arrow-shape': 'triangle', 'arrow-scale': 0.8, 'curve-style': 'bezier', 'opacity': 0.55 } },
      { selector: 'edge[kind="objectProperty"]', style: {
          'label': 'data(label)', 'font-size': 8, 'color': t.muted, 'opacity': 0.8,
          'text-rotation': 'autorotate', 'text-background-color': t.surface,
          'text-background-opacity': 0.85, 'text-background-padding': 1 } },
      { selector: 'edge[kind="inScheme"]', style: { 'line-style': 'dashed', 'opacity': 0.3 } },
      { selector: '.faded', style: { 'opacity': 0.08, 'text-opacity': 0.08 } },
      { selector: '.highlight', style: { 'opacity': 1, 'text-opacity': 1, 'z-index': 99 } },
      { selector: 'node:selected', style: { 'border-width': 4, 'border-color': t.brand } },
    ];
  }

  var LAYOUTS = {
    fcose: { name: 'fcose', quality: 'default', animate: false, randomize: true,
             nodeSeparation: 90, idealEdgeLength: 90, nodeRepulsion: 9000, packComponents: true },
    cose: { name: 'cose', animate: false, nodeRepulsion: 9000, idealEdgeLength: 90 },
    breadthfirst: { name: 'breadthfirst', directed: true, animate: false, spacingFactor: 1.1, grid: true },
    concentric: { name: 'concentric', animate: false, minNodeSpacing: 24,
                  concentric: function (n) { return n.degree(); }, levelWidth: function () { return 2; } },
    circle: { name: 'circle', animate: false },
    grid: { name: 'grid', animate: false },
  };

  window.opdaGraphEngines['cytoscape'] = {
    id: 'cytoscape',
    label: 'Cytoscape.js',
    kind: 'interactive',
    order: 10,
    note: 'ADR-0043 pick · OWL+SKOS+SHACL through one themeable engine · fcose / breadthfirst / concentric layouts.',
    layouts: ['fcose', 'breadthfirst', 'concentric', 'circle', 'grid'],
    layoutLabels: { fcose: 'Force (whole graph)', breadthfirst: 'Hierarchy (tree)',
                    concentric: 'Concentric (by degree)', circle: 'Circle', grid: 'Grid' },

    async mount(container, data, opts) {
      var l = await ensureLibs();
      var cy = l.cytoscape({
        container: container,
        elements: { nodes: data.nodes, edges: data.edges },
        style: styleSheet(opts),
        wheelSensitivity: 0.2, minZoom: 0.05, maxZoom: 4,
        layout: { name: 'preset' },
      });
      var curLayout = 'fcose';
      var facets = opts.facets || null;

      function runLayout(name) {
        if (name === 'fcose' && !l.hasFcose) name = 'cose';
        curLayout = name;
        cy.layout(Object.assign({ fit: true, padding: 30 }, LAYOUTS[name] || LAYOUTS.cose)).run();
      }
      function applySkos(show) {
        var sk = cy.elements('node[type="scheme"], node[type="concept"], edge[kind="inScheme"], edge[kind="broader"]');
        sk.style('display', show ? 'element' : 'none');
      }
      // Facet filter — toggle class-node display by opda:ufoCategory. Cytoscape
      // auto-hides edges whose endpoint is display:none, so incident edges follow.
      function applyFacets(f) {
        var classes = cy.nodes('[type="class"]');
        if (!f) { classes.style('display', 'element'); return; }
        classes.forEach(function (n) {
          n.style('display', f.has(n.data('ufoCategory') || '') ? 'element' : 'none');
        });
      }
      function clearFocus() { cy.elements().removeClass('faded').removeClass('highlight'); }
      function focus(node) {
        cy.elements().removeClass('highlight').addClass('faded');
        node.closedNeighborhood().removeClass('faded').addClass('highlight');
      }

      applySkos(opts.showSkos);
      applyFacets(facets);
      cy.on('tap', 'node', function (evt) { focus(evt.target); opts.onSelect(evt.target.data()); });
      cy.on('tap', function (evt) { if (evt.target === cy) { clearFocus(); opts.onSelect(null); } });
      runLayout('fcose');
      opts.onStatus(data.nodes.length + ' nodes · ' + data.edges.length + ' edges');

      return {
        setTheme: function () { cy.style(styleSheet(Object.assign({}, opts, { theme: S.themeColors() }))); },
        setSkos: function (show) { applySkos(show); runLayout(curLayout); },
        setFacets: function (f) { facets = f; applyFacets(f); runLayout(curLayout); },
        setLayout: function (name) { runLayout(name); },
        reset: function () { clearFocus(); runLayout(curLayout); opts.onSelect(null); },
        destroy: function () { try { cy.destroy(); } catch (e) {} },
      };
    },
  };
})();
