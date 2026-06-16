/*
 * Graph engine: force-graph (Vasco Asturiano's force-graph) — bake-off tab.
 *
 * Canvas render via the force-graph Kapsule factory (a factory-of-factories:
 * ForceGraph()(container)). Fine at ~415 nodes; it pulls d3-force-3d / d3-zoom
 * / kapsule cleanly as ESM from jsdelivr /+esm. NOTE force-graph's data key is
 * `links` (not `edges`), and accessors read fields off each node/link object, so
 * we spread the OPDAGraph view objects onto fresh copies. Colours/labels come
 * from opts / OPDAGraph so re-theming stays uniform with the other engines.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    forceGraph: 'https://cdn.jsdelivr.net/npm/force-graph@1.51.4/+esm',
  };
  var lib = null;

  async function ensureLib() {
    if (lib) return lib;
    if (window.__forceGraphLib) return (lib = window.__forceGraphLib);
    var mod = await import(CDN.forceGraph);
    var ForceGraph = mod.default || mod;
    return (lib = window.__forceGraphLib = ForceGraph);
  }

  window.opdaGraphEngines['force-graph'] = {
    id: 'force-graph',
    label: 'force-graph',
    kind: 'interactive',
    order: 40,
    note: 'force-graph over Canvas · Kapsule factory + d3-force-3d · the Canvas end of the force-layout bake-off.',

    async mount(container, rawData, opts) {
      var ForceGraph = await ensureLib();
      var showSkos = opts.showSkos;
      var facets = opts.facets || null;
      var th = S.themeColors();
      var highlightNodes = null;   // null = no focus; else a {id:true} set
      var highlightLinks = null;

      var fg = ForceGraph()(container)
        .width(container.clientWidth || 800)
        .height(container.clientHeight || 600);

      function build() {
        var view = S.viewData(rawData, { showSkos: showSkos, facets: facets });
        var gData = {
          nodes: view.nodes.map(function (d) { return Object.assign({}, d); }),
          links: view.edges.map(function (d) { return Object.assign({}, d); }),
        };
        th = S.themeColors();
        highlightNodes = null; highlightLinks = null;

        fg.graphData(gData)
          .nodeId('id')
          .nodeRelSize(4)
          .nodeVal(function (n) { return n.type === 'class' ? 6 : 1; })
          .nodeLabel(function (n) { return n.label; })
          .nodeColor(function (n) {
            var c = S.colorForNode(n);
            if (highlightNodes && !highlightNodes[n.id]) return 'rgba(127,127,127,0.12)';
            return c;
          })
          .nodeCanvasObjectMode(function () { return 'after'; })
          .nodeCanvasObject(function (n, ctx, scale) {
            if (highlightNodes && !highlightNodes[n.id]) return;
            var r = n.type === 'class' ? 6 : (n.type === 'concept' ? 3 : 4);
            ctx.fillStyle = th.text;
            ctx.font = (n.type === 'concept' ? 9 : 10) / scale + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(n.label, n.x, n.y + r + 2);
          })
          .linkColor(function (l) {
            if (highlightLinks && !highlightLinks[l.__id]) return 'rgba(127,127,127,0.04)';
            return l.kind === 'constrainedByScheme' ? S.COLORS.derived : th.line;
          })
          .linkWidth(1)
          .linkLineDash(function (l) { return l.kind === 'constrainedByScheme' ? [4, 2] : null; })
          .linkDirectionalArrowLength(function (l) { return (l.kind === 'objectProperty' || l.kind === 'constrainedByScheme') ? 3 : 0; })
          .linkDirectionalArrowRelPos(1)
          .onNodeClick(function (n) { focus(n); opts.onSelect(n); })
          .onBackgroundClick(function () { unfocus(); opts.onSelect(null); });

        // Tag links with a stable id so the highlight set can reference them
        // (force-graph replaces source/target with node objects post-layout).
        fg.graphData().links.forEach(function (l, i) { l.__id = i; });

        opts.onStatus(gData.nodes.length + ' nodes · ' + gData.links.length + ' edges');
      }

      function focus(n) {
        highlightNodes = {}; highlightLinks = {};
        highlightNodes[n.id] = true;
        fg.graphData().links.forEach(function (l) {
          var s = typeof l.source === 'object' ? l.source.id : l.source;
          var t = typeof l.target === 'object' ? l.target.id : l.target;
          if (s === n.id || t === n.id) {
            highlightLinks[l.__id] = true;
            highlightNodes[s] = true; highlightNodes[t] = true;
          }
        });
        fg.nodeColor(fg.nodeColor()).linkColor(fg.linkColor());
      }
      function unfocus() {
        highlightNodes = null; highlightLinks = null;
        fg.nodeColor(fg.nodeColor()).linkColor(fg.linkColor());
      }

      build();

      return {
        setTheme: function () {
          th = S.themeColors();
          fg.linkColor(fg.linkColor()); // re-eval link colour accessor
          fg.refresh();                 // repaint canvas labels with new th.text
        },
        setSkos: function (show) { showSkos = show; build(); },
        setFacets: function (f) { facets = f; build(); },
        reset: function () { unfocus(); opts.onSelect(null); },
        destroy: function () {
          try {
            if (fg._destructor) fg._destructor();
            else fg.pauseAnimation();
          } catch (e) {}
        },
      };
    },
  };
})();
