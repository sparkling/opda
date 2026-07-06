/*
 * Graph engine: Cytoscape.js (ADR-0043 primary pick; scorecard 91/100).
 *
 * The reference adapter. Cytoscape consumes our elements.json shape natively
 * ({ data: {...} } nodes/edges). Core + the fcose force layout and cytoscape-elk
 * (a real layered/hierarchical layout — the same ELK engine used for the
 * Mermaid tabs' erDiagram config) lazy-load from jsdelivr /+esm.
 * cytoscape-dagre is avoided — its /+esm bundle still pulls the broken
 * dagre@0.8.5, unlike cytoscape-elk's actively-maintained elkjs@0.9.3
 * dependency. Styling comes from opts.colors / opts.theme so re-theming
 * lives in the orchestrator.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    cytoscape: 'https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/+esm',
    fcose: 'https://cdn.jsdelivr.net/npm/cytoscape-fcose@2.2.0/+esm',
    elk: 'https://cdn.jsdelivr.net/npm/cytoscape-elk@2/+esm',
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
    var hasElk = false;
    try {
      var eMod = await import(CDN.elk);
      cytoscape.use(eMod.default || eMod);
      hasElk = true;
    } catch (e) { console.warn('[OPDA] cytoscape-elk unavailable; using built-in breadthfirst', e); }
    return (libs = window.__cyLibs = { cytoscape: cytoscape, hasFcose: hasFcose, hasElk: hasElk });
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
      { selector: 'edge[kind="constrainedByScheme"]', style: {
          'line-style': 'dashed', 'line-color': c.derived, 'target-arrow-color': c.derived,
          'label': 'data(label)', 'font-size': 8, 'color': c.derived, 'opacity': 0.9,
          'text-rotation': 'autorotate', 'text-background-color': t.surface,
          'text-background-opacity': 0.85, 'text-background-padding': 1 } },
      { selector: '.faded', style: { 'opacity': 0.08, 'text-opacity': 0.08 } },
      { selector: '.highlight', style: { 'opacity': 1, 'text-opacity': 1, 'z-index': 99 } },
      { selector: 'node:selected', style: { 'border-width': 4, 'border-color': t.brand } },
    ];
  }

  var LAYOUTS = {
    // packComponents packs disconnected nodes/subgraphs (e.g. the ~20 isolated
    // classes with no object-property edges) into a separate grid via a
    // rectangle-packing step, bypassing the force layout's own node spacing —
    // its default componentSpacing (40) only accounts for node radius, not
    // label width, so long class-name labels overlapped badly. Raised well
    // past the longest labels' width to give each packed node real breathing
    // room.
    fcose: { name: 'fcose', quality: 'default', animate: false, randomize: true,
             nodeSeparation: 90, idealEdgeLength: 90, nodeRepulsion: 9000, packComponents: true },
    cose: { name: 'cose', animate: false, nodeRepulsion: 9000, idealEdgeLength: 90 },
    // Real layered/Sugiyama-style hierarchy (Eclipse Layout Kernel) — handles
    // this graph's cycles and multi-parent nodes properly, unlike the
    // built-in breadthfirst layout, which isn't a true tree algorithm and
    // produced a near-degenerate single-row layout on this graph (most
    // nodes landing at the same BFS depth).
    elk: { name: 'elk', animate: false, elk: { algorithm: 'layered', 'elk.direction': 'DOWN',
           'elk.spacing.nodeNode': 60, 'elk.layered.spacing.nodeNodeBetweenLayers': 90 } },
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
    note: 'ADR-0043 pick · OWL+SKOS+SHACL through one themeable engine · elk / fcose / breadthfirst / concentric layouts.',
    layouts: ['elk', 'breadthfirst', 'fcose', 'concentric', 'circle', 'grid'],
    layoutLabels: { elk: 'Hierarchy (layered)', fcose: 'Force (whole graph)', breadthfirst: 'Hierarchy (tree, basic)',
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
      // elk's layered hierarchy as the initial layout instead of fcose —
      // fcose's force simulation still visibly bunches parts of this graph
      // even after the isolated-node fix. Tried the built-in breadthfirst
      // first; it isn't a real hierarchical algorithm (no cycle/multi-parent
      // handling) and produced a near-degenerate single-row layout on this
      // graph. elk's layered algorithm (same ELK engine used for the Mermaid
      // tabs) handles that properly. fcose stays available in the dropdown.
      var curLayout = 'elk';
      var facets = opts.facets || null;

      // fcose (and cose) place zero-degree nodes (~13 classes with no
      // object-property edges) in a fallback packed grid sized only for the
      // node's own circle, not its label — long class-name labels overlap
      // badly (confirmed live: neither packComponents:false nor a larger
      // componentSpacing changed this, so it isn't the disconnected-
      // component packer at all — these are singleton orphans handled by a
      // separate fallback). Deterministically re-lay them out below the
      // connected graph with real label-width spacing instead.
      //
      // Originally only handled zero-degree singletons, but breadthfirst/
      // concentric/elk (unlike fcose, which has explicit packComponents
      // handling) can also fling a small MULTI-node disconnected component
      // (e.g. the 2-node DPVMappingRecord<->DPVMappingRefinement pair —
      // degree 1, so not a singleton) thousands of px from the main graph,
      // which blew the fit-target bounding box out to ~6000px wide and
      // zoomed the real graph down to a barely-visible speck. Generalized to
      // use cy's own connected-components split: the LARGEST component is
      // "the graph" for fitting purposes, every other component (whatever
      // its size) gets moved into the same reference grid below it.
      function spreadIsolatedNodes() {
        var visible = cy.nodes().filter(function (n) { return n.style('display') !== 'none'; });
        // .components() needs edges in the collection to determine
        // connectivity — passing a nodes-only collection made every node
        // its own size-1 "component" (a real bug this surfaced: fit()
        // picked one arbitrary node as "main", zoomed to its max cap on a
        // ~50px bbox, and threw all 44 other nodes into the "others" grid).
        var visibleEdges = cy.edges().filter(function (e) { return e.style('display') !== 'none'; });
        var components = visible.union(visibleEdges).components()
          .map(function (c) { return c.nodes(); })
          .sort(function (a, b) { return b.length - a.length; });
        var main = components.length ? components[0] : visible;
        var others = visible.not(main);
        if (others.length === 0) return main;
        var bb = main.length ? main.boundingBox() : { x1: 0, y1: 0, x2: 0, y2: 0 };
        var cell = 190; // wide enough for the longest class-name labels
        var cols = Math.max(1, Math.min(others.length, Math.round(Math.sqrt(others.length) * 1.6)));
        var startX = bb.x1;
        var startY = bb.y2 + 80;
        others.forEach(function (n, i) {
          var col = i % cols, row = Math.floor(i / cols);
          n.position({ x: startX + col * cell, y: startY + row * cell });
        });
        return main;
      }

      function runLayout(name) {
        if (name === 'fcose' && !l.hasFcose) name = 'cose';
        if (name === 'elk' && !l.hasElk) name = 'breadthfirst';
        curLayout = name;
        cy.one('layoutstop', function () {
          var main = spreadIsolatedNodes();
          cy.fit(main.length ? main : cy.elements(), 30);
        });
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
        if (!f) classes.style('display', 'element');
        else classes.forEach(function (n) {
          n.style('display', f.has(n.data('ufoCategory') || '') ? 'element' : 'none');
        });
        // Hide external targets whose neighbouring classes are all hidden now
        // (edgeless) so they don't float as context-free diamonds.
        cy.nodes('[type="external"]').forEach(function (ext) {
          var live = ext.neighborhood('node').filter(function (n) {
            return n.style('display') !== 'none';
          }).length > 0;
          ext.style('display', live ? 'element' : 'none');
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
      runLayout('elk');
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
