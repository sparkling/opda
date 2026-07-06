/*
 * Graph engine: G6 (AntV) — bake-off tab.
 *
 * G6 v5 (flat data + function style mappers; the v4 API is unrelated, so the
 * CDN import is pinned to @antv/g6@5.x). The heaviest bundle in the bake-off,
 * so it lazy-loads from jsdelivr /+esm on first mount and caches on window.__.
 * Colours/labels come from opts so re-theming stays uniform with the others.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = { g6: 'https://cdn.jsdelivr.net/npm/@antv/g6@5.1.1/+esm' };
  var lib = null;

  async function ensureLib() {
    if (lib) return lib;
    if (window.__g6Lib) return (lib = window.__g6Lib);
    var mod = await import(CDN.g6);
    return (lib = window.__g6Lib = { Graph: mod.Graph || (mod.default && mod.default.Graph) });
  }

  // Flatten our { nodes, edges } view into G6 v5's { nodes:[{id,data}], edges:[{source,target,data}] }.
  function toG6Data(rawData, showSkos, facets) {
    var view = S.viewData(rawData, { showSkos: showSkos, facets: facets });
    return {
      nodes: view.nodes.map(function (d) { return { id: d.id, data: d }; }),
      // Explicit unique edge id — multiple object properties can share a
      // source→target pair (e.g. LegalEstate→MonetaryAmount); without `id` G6
      // derives `source-target` and throws "Edge already exists" on the dup.
      edges: view.edges.map(function (d) { return { id: d.id, source: d.source, target: d.target, data: d }; }),
    };
  }

  function nodeStyle(theme) {
    return {
      fill: function (d) { return S.colorForNode(d.data); },
      stroke: function (d) { return d.data.hasShape ? theme.brand : theme.surface; },
      lineWidth: function (d) { return d.data.hasShape ? 3 : 1.5; },
      size: function (d) { return d.data.type === 'class' ? 28 : (d.data.type === 'concept' ? 10 : 18); },
      labelText: function (d) { return d.data.label; },
      labelFill: theme.text,
      labelPlacement: 'bottom',
      labelFontSize: function (d) { return d.data.type === 'concept' ? 9 : 11; },
    };
  }

  function edgeStyle(theme) {
    var isCbs = function (d) { return d && d.data && d.data.kind === 'constrainedByScheme'; };
    return {
      stroke: function (d) { return isCbs(d) ? S.COLORS.derived : theme.line; },
      lineDash: function (d) { return isCbs(d) ? [4, 2] : false; },
      lineWidth: 1,
      strokeOpacity: 0.55,
      endArrow: true,
      endArrowSize: 6,
    };
  }

  window.opdaGraphEngines['g6'] = {
    id: 'g6',
    label: 'G6 (AntV)',
    kind: 'interactive',
    order: 50,
    note: 'AntV G6 v5 · Canvas/WebGL force layout with built-in drag/zoom behaviours · the heaviest bundle in the bake-off.',

    async mount(container, rawData, opts) {
      var l = await ensureLib();
      var theme = opts.theme;
      var showSkos = opts.showSkos;
      var facets = opts.facets || null;

      var graph = new l.Graph({
        container: container,
        data: toG6Data(rawData, showSkos, facets),
        theme: S.isDark() ? 'dark' : 'light',
        node: { style: nodeStyle(theme) },
        edge: { style: edgeStyle(theme) },
        // 'd3-force' (the original choice) crashes G6 v5.1.1 on this graph —
        // confirmed via console: a TypeError deep in g-lite's shape renderer
        // (drawKeyShape -> upsert), reproducible regardless of node style
        // config, that disappears entirely with any other layout type. G6's
        // own native 'force' layout gives the same force-directed spread
        // without the crash.
        layout: { type: 'force', linkDistance: 70, preventOverlap: true, nodeSize: 30 },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
      });

      // Focus: fade everything, then keep the clicked node + its neighbours opaque.
      function focus(id) {
        var nodes = graph.getNodeData();
        var edges = graph.getEdgeData();
        var keep = {}; keep[id] = true;
        edges.forEach(function (e) {
          if (e.source === id) keep[e.target] = true;
          if (e.target === id) keep[e.source] = true;
        });
        var states = {};
        nodes.forEach(function (n) { states[n.id] = keep[n.id] ? [] : ['inactive']; });
        edges.forEach(function (e) {
          var on = e.source === id || e.target === id;
          states[e.id != null ? e.id : (e.source + '-' + e.target)] = on ? [] : ['inactive'];
        });
        try { graph.setElementState(states); } catch (e) { /* older builds: best-effort */ }
      }
      function clearFocus() {
        var states = {};
        graph.getNodeData().forEach(function (n) { states[n.id] = []; });
        graph.getEdgeData().forEach(function (e) {
          states[e.id != null ? e.id : (e.source + '-' + e.target)] = [];
        });
        try { graph.setElementState(states); } catch (e) {}
      }

      graph.on('node:click', function (evt) {
        var id = evt.target && evt.target.id;
        if (id == null) return;
        var nd = graph.getNodeData(id);
        focus(id);
        opts.onSelect(nd && nd.data ? nd.data : null);
      });
      graph.on('canvas:click', function () { clearFocus(); opts.onSelect(null); });

      // Do NOT await render(): in G6 v5 the render() promise can stay pending
      // with the d3-force layout, which would block mount() from ever returning
      // the handle (killing the theme/SKOS/reset controls) even though the graph
      // draws fine. Fire it, report status from the source counts, return now.
      var counts = toG6Data(rawData, showSkos, facets);
      graph.render();
      opts.onStatus(counts.nodes.length + ' nodes · ' + counts.edges.length + ' edges');

      // Re-derive + repaint from the current showSkos/facets filter state.
      function rebuild() {
        clearFocus();
        graph.setData(toG6Data(rawData, showSkos, facets));
        graph.render().then(function () {
          var d = graph.getData();
          opts.onStatus(d.nodes.length + ' nodes · ' + d.edges.length + ' edges');
        });
      }

      return {
        setTheme: function () {
          var th = S.themeColors();
          try { graph.setTheme(S.isDark() ? 'dark' : 'light'); } catch (e) {}
          graph.setNode({ style: nodeStyle(th) });
          graph.setEdge({ style: edgeStyle(th) });
          try { graph.draw(); } catch (e) {}
        },
        setSkos: function (show) { showSkos = show; rebuild(); },
        setFacets: function (f) { facets = f; rebuild(); },
        reset: function () {
          clearFocus();
          try { graph.fitView(); } catch (e) {}
          opts.onSelect(null);
        },
        destroy: function () { try { graph.destroy(); } catch (e) {} },
      };
    },
  };
})();
