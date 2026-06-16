/*
 * Graph engine: D3.js (d3-force) — bake-off tab (scorecard 76/100).
 *
 * SVG render (right call at ~415 nodes — native hit-testing, marker arrowheads,
 * attribute theming; Canvas only earns its keep past a few thousand nodes).
 * Cherry-picked d3 submodules lazy-load from jsdelivr /+esm (every d3 module
 * bundles cleanly — none of the dagre/graphlib breakage). Colours/labels come
 * from opts so re-theming stays uniform with the other engines.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    force: 'https://cdn.jsdelivr.net/npm/d3-force@3.0.0/+esm',
    selection: 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm',
    zoom: 'https://cdn.jsdelivr.net/npm/d3-zoom@3.0.0/+esm',
    drag: 'https://cdn.jsdelivr.net/npm/d3-drag@3.0.0/+esm',
  };
  var RADIUS = { class: 15, scheme: 11, external: 12, concept: 7 };
  var d3 = null;

  async function libs() {
    if (d3) return d3;
    if (window.__d3Libs) return (d3 = window.__d3Libs);
    var mods = await Promise.all([CDN.force, CDN.selection, CDN.zoom, CDN.drag].map(function (u) { return import(u); }));
    d3 = window.__d3Libs = Object.assign({}, mods[0], mods[1], mods[2], mods[3]); // flat namespace
    return d3;
  }

  window.opdaGraphEngines['d3'] = {
    id: 'd3',
    label: 'D3 (d3-force)',
    kind: 'interactive',
    order: 20,
    note: 'd3-force over SVG · total visual control, hand-rolled render · the DIY end of the bake-off.',

    async mount(container, rawData, opts) {
      await libs();
      var W = container.clientWidth || 800, H = container.clientHeight || 600;
      var t = opts.theme;
      var showSkos = opts.showSkos;

      var svg = d3.select(container).append('svg')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', [0, 0, W, H]).style('display', 'block');
      svg.append('defs').append('marker')
        .attr('id', 'd3-arrow').attr('viewBox', '0 -5 10 10').attr('refX', 16)
        .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5').attr('class', 'd3-arrow-fill').attr('fill', t.line);
      var g = svg.append('g');
      svg.call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', function (e) { g.attr('transform', e.transform); }));

      var sim = null, node = null, link = null, label = null;

      function build() {
        var view = S.viewData(rawData, showSkos);
        var nodes = view.nodes.map(function (d) { return Object.assign({}, d); }); // fresh objects d3 mutates
        var ids = {}; nodes.forEach(function (n) { ids[n.id] = true; });
        var links = view.edges.map(function (d) { return Object.assign({}, d); })
          .filter(function (e) { return ids[e.source] && ids[e.target]; });
        var th = S.themeColors();

        g.selectAll('*').remove();
        if (sim) sim.stop();
        sim = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(links).id(function (d) { return d.id; }).distance(70).strength(0.4))
          .force('charge', d3.forceManyBody().strength(-260).distanceMax(420))
          .force('center', d3.forceCenter(W / 2, H / 2))
          .force('collide', d3.forceCollide(function (d) { return RADIUS[d.type] + 6; }).iterations(2))
          .force('x', d3.forceX(W / 2).strength(0.04)).force('y', d3.forceY(H / 2).strength(0.04))
          .alphaDecay(0.045).velocityDecay(0.4);

        link = g.append('g').attr('stroke-opacity', 0.5).selectAll('line').data(links).join('line')
          .attr('stroke', th.line).attr('stroke-width', 1)
          .attr('stroke-dasharray', function (d) { return d.kind === 'inScheme' ? '3,3' : null; })
          .attr('marker-end', function (d) { return d.kind === 'objectProperty' ? 'url(#d3-arrow)' : null; });

        node = g.append('g').selectAll('circle').data(nodes).join('circle')
          .attr('r', function (d) { return RADIUS[d.type]; })
          .attr('fill', function (d) { return S.colorForNode(d); })
          .attr('stroke', function (d) { return d.hasShape ? th.brand : th.surface; })
          .attr('stroke-width', function (d) { return d.hasShape ? 3 : 1.5; })
          .style('cursor', 'pointer').call(dragBehavior());

        label = g.append('g').selectAll('text').data(nodes).join('text')
          .text(function (d) { return d.label; }).attr('fill', th.text)
          .attr('font-size', function (d) { return d.type === 'concept' ? 9 : 11; })
          .attr('text-anchor', 'middle').attr('dy', function (d) { return RADIUS[d.type] + 11; })
          .style('pointer-events', 'none').style('font-family', 'var(--font-sans, sans-serif)');

        node.on('click', function (e, d) { e.stopPropagation(); focus(d, links); opts.onSelect(d); });
        svg.on('click', function () { unfocus(); opts.onSelect(null); });

        sim.on('tick', function () {
          link.attr('x1', function (d) { return d.source.x; }).attr('y1', function (d) { return d.source.y; })
              .attr('x2', function (d) { return d.target.x; }).attr('y2', function (d) { return d.target.y; });
          node.attr('cx', function (d) { return d.x; }).attr('cy', function (d) { return d.y; });
          label.attr('x', function (d) { return d.x; }).attr('y', function (d) { return d.y; });
        });
        opts.onStatus(nodes.length + ' nodes · ' + links.length + ' edges');
      }

      function dragBehavior() {
        return d3.drag()
          .on('start', function (e, d) { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag', function (e, d) { d.fx = e.x; d.fy = e.y; })
          .on('end', function (e, d) { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
      }
      function focus(d, links) {
        var keep = {}; keep[d.id] = true;
        links.forEach(function (l) {
          if (l.source.id === d.id) keep[l.target.id] = true;
          if (l.target.id === d.id) keep[l.source.id] = true;
        });
        node.style('opacity', function (n) { return keep[n.id] ? 1 : 0.12; });
        label.style('opacity', function (n) { return keep[n.id] ? 1 : 0.12; });
        link.style('opacity', function (l) { return (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.05; });
      }
      function unfocus() {
        if (!node) return;
        node.style('opacity', 1); label.style('opacity', 1); link.style('opacity', null);
      }

      build();

      return {
        setTheme: function () {
          var th = S.themeColors();
          if (link) link.attr('stroke', th.line);
          if (node) node.attr('stroke', function (d) { return d.hasShape ? th.brand : th.surface; });
          if (label) label.attr('fill', th.text);
          svg.select('.d3-arrow-fill').attr('fill', th.line);
        },
        setSkos: function (show) { showSkos = show; unfocus(); build(); },
        reset: function () { unfocus(); build(); opts.onSelect(null); },
        destroy: function () { try { if (sim) sim.stop(); svg.remove(); } catch (e) {} },
      };
    },
  };
})();
