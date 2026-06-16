/*
 * Graph engine: vis-network — bake-off tab.
 *
 * Canvas render via vis-network's reactive DataSets: nodes/edges live in
 * DataSet instances and the Network repaints on .update(). Both lazy-load from
 * jsdelivr /+esm — Network from vis-network, DataSet from vis-data (the
 * vis-network /+esm bundle does NOT re-export DataSet).
 * Colours/labels come from opts so re-theming stays uniform with the other
 * engines — setTheme re-resolves via OPDAGraph.themeColors() and pushes a
 * nodes.update() (DataSet reactivity repaints the canvas, no full re-render).
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    vis: 'https://cdn.jsdelivr.net/npm/vis-network@10.1.0/+esm',
    // DataSet is NOT re-exported by vis-network/+esm — it lives in vis-data.
    visData: 'https://cdn.jsdelivr.net/npm/vis-data@8.0.4/+esm',
  };
  var SIZE = { class: 16, scheme: 12, external: 13, concept: 8 };
  var libs = null;

  async function ensureLibs() {
    if (libs) return libs;
    if (window.__visLibs) return (libs = window.__visLibs);
    var mods = await Promise.all([import(CDN.vis), import(CDN.visData)]);
    return (libs = window.__visLibs = { Network: mods[0].Network, DataSet: mods[1].DataSet });
  }

  window.opdaGraphEngines['vis-network'] = {
    id: 'vis-network',
    label: 'vis-network',
    kind: 'interactive',
    order: 30,
    note: 'Canvas via reactive DataSets · barnesHut physics · re-themes through nodes.update() rather than a full re-render.',

    async mount(container, rawData, opts) {
      var l = await ensureLibs();
      var showSkos = opts.showSkos;
      var facets = opts.facets || null;
      var byId = {};      // id -> node data (for onSelect)
      var network = null, nodesDS = null, edgesDS = null;
      var allNodeIds = [];

      function visNode(d) {
        var th = S.themeColors();
        return {
          id: d.id,
          label: d.label,
          color: { background: S.colorForNode(d), border: S.isDark() ? '#222' : '#fff' },
          size: SIZE[d.type] || 12,
          font: { color: th.text, size: d.type === 'concept' ? 9 : 11 },
          shape: 'dot',
        };
      }
      function visEdge(d) {
        var e = { id: d.id, from: d.source, to: d.target, arrows: 'to' };
        // Derived constrained-by bridge: dashed + distinct colour, never identical
        // to an asserted object property (council guardrail).
        if (d.kind === 'constrainedByScheme') { e.dashes = true; e.color = { color: S.COLORS.derived }; }
        return e;
      }

      function build() {
        var view = S.viewData(rawData, { showSkos: showSkos, facets: facets });
        byId = {};
        view.nodes.forEach(function (d) { byId[d.id] = d; });
        allNodeIds = view.nodes.map(function (d) { return d.id; });

        nodesDS = new l.DataSet(view.nodes.map(visNode));
        edgesDS = new l.DataSet(view.edges.map(visEdge));

        if (network) { try { network.destroy(); } catch (e) {} }
        network = new l.Network(container, { nodes: nodesDS, edges: edgesDS }, {
          interaction: { hover: true },
          physics: {
            stabilization: true,
            barnesHut: { springLength: 90 },
          },
          edges: { color: { color: S.themeColors().line, opacity: 0.55 }, width: 1 },
        });

        network.on('click', function (params) {
          if (params.nodes.length) { focus(params.nodes[0]); opts.onSelect(byId[params.nodes[0]] || null); }
          else { unfocus(); opts.onSelect(null); }
        });

        opts.onStatus(view.nodes.length + ' nodes · ' + view.edges.length + ' edges');
      }

      // Greys non-neighbour nodes via nodes.update(); resets via reColour().
      function focus(id) {
        var keep = {};
        keep[id] = true;
        network.getConnectedNodes(id).forEach(function (n) { keep[n] = true; });
        nodesDS.update(allNodeIds.map(function (nid) {
          var d = byId[nid], th = S.themeColors();
          var on = keep[nid];
          return {
            id: nid,
            color: { background: on ? S.colorForNode(d) : (S.isDark() ? '#333' : '#e0e0e0'),
                     border: S.isDark() ? '#222' : '#fff' },
            font: { color: on ? th.text : th.muted, size: d.type === 'concept' ? 9 : 11 },
          };
        }));
      }
      function unfocus() {
        if (!nodesDS) return;
        nodesDS.update(allNodeIds.map(function (nid) { return visNode(byId[nid]); }));
      }
      function reColour() {
        if (!nodesDS) return;
        nodesDS.update(allNodeIds.map(function (nid) { return visNode(byId[nid]); }));
        if (network) network.setOptions({ edges: { color: { color: S.themeColors().line, opacity: 0.55 } } });
      }

      build();

      return {
        setTheme: function () { reColour(); },
        setSkos: function (show) { showSkos = show; build(); },
        setFacets: function (f) { facets = f; build(); },
        reset: function () { unfocus(); if (network) network.fit(); opts.onSelect(null); },
        destroy: function () { try { if (network) network.destroy(); } catch (e) {} },
      };
    },
  };
})();
