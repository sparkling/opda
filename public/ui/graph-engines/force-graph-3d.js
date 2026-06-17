/*
 * Graph engine: 3D force-graph (Vasco Asturiano's 3d-force-graph) — bake-off tab.
 *
 * WebGL/three.js render via the 3d-force-graph Kapsule factory (ForceGraph3D()
 * (container)) — the 3D counterpart of the force-graph tab, after AtomGraph's
 * 3D-Linked-Data (3d-force-graph + three-spritetext + three.js). Same Kapsule
 * accessor surface as the 2D sibling, so this is a near drop-in; the deltas are
 * 3D-only: node labels are three-spritetext SpriteText objects (not canvas
 * draws), theming sets .backgroundColor (not a canvas repaint), and dashed links
 * aren't expressible — directional arrows carry edge direction instead. As with
 * the other engines, data key is `links` (not `edges`) and accessors read fields
 * off each node/link object, so we spread the OPDAGraph view objects onto fresh
 * copies. Colours/labels come from opts / OPDAGraph so re-theming stays uniform.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    forceGraph3d: 'https://cdn.jsdelivr.net/npm/3d-force-graph@1/+esm',
    spriteText: 'https://cdn.jsdelivr.net/npm/three-spritetext@1/+esm',
  };
  var lib = null;

  async function ensureLib() {
    if (lib) return lib;
    if (window.__forceGraph3dLib) return (lib = window.__forceGraph3dLib);
    var mods = await Promise.all([import(CDN.forceGraph3d), import(CDN.spriteText)]);
    var ForceGraph3D = mods[0].default || mods[0];
    var SpriteText = mods[1].default || mods[1];
    return (lib = window.__forceGraph3dLib = { ForceGraph3D: ForceGraph3D, SpriteText: SpriteText });
  }

  window.opdaGraphEngines['force-graph-3d'] = {
    id: 'force-graph-3d',
    label: '3D force-graph',
    kind: 'interactive',
    order: 45,
    note: '3d-force-graph + three-spritetext over WebGL/three.js — the 3D counterpart of the force-graph tab (after AtomGraph/3D-Linked-Data).',

    async mount(container, rawData, opts) {
      var L = await ensureLib();
      var ForceGraph3D = L.ForceGraph3D;
      var SpriteText = L.SpriteText;
      var showSkos = opts.showSkos;
      var facets = opts.facets || null;
      var th = S.themeColors();
      var highlightNodes = null;   // null = no focus; else a {id:true} set
      var highlightLinks = null;

      var fg = ForceGraph3D()(container)
        .width(container.clientWidth || 800)
        .height(container.clientHeight || 600)
        .backgroundColor(th.surface);

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
          .nodeThreeObject(function (n) {
            var s = new SpriteText(n.label);
            s.color = (highlightNodes && !highlightNodes[n.id]) ? 'rgba(127,127,127,0.12)' : th.text;
            s.textHeight = n.type === 'class' ? 6 : 4;
            return s;
          })
          .nodeThreeObjectExtend(true)
          .linkColor(function (l) {
            if (highlightLinks && !highlightLinks[l.__id]) return 'rgba(127,127,127,0.04)';
            return l.kind === 'constrainedByScheme' ? S.COLORS.derived : th.line;
          })
          .linkWidth(1)
          .linkDirectionalArrowLength(function (l) { return (l.kind === 'objectProperty' || l.kind === 'constrainedByScheme') ? 3 : 0; })
          .linkDirectionalArrowRelPos(1)
          .onNodeClick(function (n) { focus(n); opts.onSelect(n); })
          .onBackgroundClick(function () { unfocus(); opts.onSelect(null); });

        // Tag links with a stable id so the highlight set can reference them
        // (force-graph replaces source/target with node objects post-layout).
        fg.graphData().links.forEach(function (l, i) { l.__id = i; });

        opts.onStatus(gData.nodes.length + ' nodes · ' + gData.links.length + ' edges (3D / WebGL)');
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
        fg.nodeColor(fg.nodeColor()).nodeThreeObject(fg.nodeThreeObject()).linkColor(fg.linkColor());
      }
      function unfocus() {
        highlightNodes = null; highlightLinks = null;
        fg.nodeColor(fg.nodeColor()).nodeThreeObject(fg.nodeThreeObject()).linkColor(fg.linkColor());
      }

      build();

      return {
        setTheme: function () {
          th = S.themeColors();
          fg.backgroundColor(th.surface);                  // re-theme the WebGL scene
          fg.nodeColor(fg.nodeColor()).linkColor(fg.linkColor());
          fg.nodeThreeObject(fg.nodeThreeObject());         // rebuild sprites with new th.text
        },
        setSkos: function (show) { showSkos = show; build(); },
        setFacets: function (f) { facets = f; build(); },
        reset: function () { unfocus(); opts.onSelect(null); },
        destroy: function () {
          try {
            if (fg._destructor) fg._destructor();           // releases the WebGL renderer/context
            else fg.pauseAnimation();
          } catch (e) {}
        },
      };
    },
  };
})();
