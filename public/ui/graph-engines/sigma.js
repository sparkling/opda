/*
 * Graph engine: Sigma.js + Graphology — bake-off tab.
 *
 * WebGL render (Sigma) over a Graphology model. Sigma ships NO layout, so node
 * coordinates come from graphology-layout-forceatlas2 (run once at mount). The
 * model/labels/colours come from opts (S.viewData / S.colorForNode / opts.theme)
 * so re-theming stays uniform with the other engines. Lazy-loaded from jsdelivr.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    graphology: 'https://cdn.jsdelivr.net/npm/graphology@0.26.0/+esm',
    sigma: 'https://cdn.jsdelivr.net/npm/sigma@3.0.3/+esm',
    fa2: 'https://cdn.jsdelivr.net/npm/graphology-layout-forceatlas2@0.10.1/+esm',
  };
  var libs = null;

  async function ensureLibs() {
    if (libs) return libs;
    if (window.__sigmaLibs) return (libs = window.__sigmaLibs);
    var mods = await Promise.all([import(CDN.graphology), import(CDN.sigma), import(CDN.fa2)]);
    var Graph = mods[0].default || mods[0];
    var Sigma = mods[1].Sigma || mods[1].default;
    var fa2 = mods[2].default || mods[2];
    return (libs = window.__sigmaLibs = { Graph: Graph, Sigma: Sigma, fa2: fa2 });
  }

  function sizeFor(d) {
    if (d.type === 'class') return 10;
    if (d.type === 'concept') return 3;
    return 6;
  }

  window.opdaGraphEngines['sigma'] = {
    id: 'sigma',
    label: 'Sigma + Graphology',
    kind: 'interactive',
    order: 60,
    note: 'WebGL render (Sigma) over a Graphology model · ForceAtlas2 layout · scales to large graphs.',

    async mount(container, rawData, opts) {
      var l = await ensureLibs();
      var showSkos = opts.showSkos;
      var facets = opts.facets || null;
      var focusId = null;
      var g = null, renderer = null;

      function buildGraph() {
        var view = S.viewData(rawData, { showSkos: showSkos, facets: facets });
        // multigraph: several object properties can link the same class pair
        // (e.g. LegalEstate→MonetaryAmount); a simple Graph throws on the dup.
        var graph = new l.Graph({ multi: true });
        view.nodes.forEach(function (d) {
          graph.addNode(d.id, {
            label: d.label,
            x: Math.random(), y: Math.random(),
            size: sizeFor(d),
            color: S.colorForNode(d),
            _d: d,
          });
        });
        view.edges.forEach(function (e) {
          if (graph.hasNode(e.source) && graph.hasNode(e.target) && !graph.hasEdge(e.id)) {
            graph.addEdgeWithKey(e.id, e.source, e.target, { type: 'arrow' });
          }
        });
        try {
          l.fa2.assign(graph, { iterations: 200, settings: l.fa2.inferSettings(graph) });
        } catch (err) {
          console.warn('[OPDA] forceAtlas2 layout failed; using random seed', err);
        }
        return graph;
      }

      function neighbours(id) {
        var keep = {};
        keep[id] = true;
        g.forEachNeighbor(id, function (n) { keep[n] = true; });
        return keep;
      }

      function nodeReducer(id, attrs) {
        var t = opts.theme;
        if (focusId) {
          var keep = neighbours(focusId);
          if (!keep[id]) return Object.assign({}, attrs, { color: t.muted, label: '' });
        }
        return attrs;
      }
      function edgeReducer(edge, attrs) {
        var t = opts.theme;
        if (focusId) {
          var ext = g.extremities(edge);
          if (ext[0] !== focusId && ext[1] !== focusId) {
            return Object.assign({}, attrs, { hidden: true });
          }
        }
        return Object.assign({}, attrs, { color: t.line });
      }

      function render() {
        if (renderer) { try { renderer.kill(); } catch (e) {} renderer = null; }
        g = buildGraph();
        var t = opts.theme;
        renderer = new l.Sigma(g, container, {
          labelColor: { color: t.text },
          defaultEdgeColor: t.line,
          renderEdgeLabels: false,
          nodeReducer: nodeReducer,
          edgeReducer: edgeReducer,
        });
        renderer.on('clickNode', function (e) {
          focusId = e.node;
          renderer.refresh();
          opts.onSelect(g.getNodeAttribute(e.node, '_d'));
        });
        renderer.on('clickStage', function () {
          focusId = null;
          renderer.refresh();
          opts.onSelect(null);
        });
        opts.onStatus(g.order + ' nodes · ' + g.size + ' edges');
      }

      render();

      return {
        setTheme: function () {
          var t = S.themeColors();
          opts.theme = t;
          renderer.setSetting('labelColor', { color: t.text });
          renderer.setSetting('defaultEdgeColor', t.line);
          g.forEachNode(function (id, attrs) {
            g.setNodeAttribute(id, 'color', S.colorForNode(attrs._d));
          });
          renderer.refresh();
        },
        setSkos: function (show) { showSkos = show; focusId = null; render(); },
        setFacets: function (f) { facets = f; focusId = null; render(); },
        reset: function () { focusId = null; renderer.refresh(); opts.onSelect(null); },
        destroy: function () { try { if (renderer) renderer.kill(); } catch (e) {} },
      };
    },
  };
})();
