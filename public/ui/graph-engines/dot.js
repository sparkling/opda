/*
 * Graph engine: Graphviz (DOT) — bake-off "diagram" tab.
 *
 * Static, deterministic DOT digraph rendered IN-BROWSER via Graphviz compiled
 * to WebAssembly (@hpcc-js/wasm-graphviz) — server-less, no Graphviz binary in
 * our build. Unlike Mermaid (which hairballs past ~40 nodes and so renders the
 * OWL backbone only), Graphviz lays out the FULL model, SKOS layer included —
 * the showSkos view just gets dense (it's a real 415-node digraph then).
 *
 * Source is generated per the diagramming skill's 19-DOT-GRAPHVIZ-GUIDE:
 *   digraph opda { rankdir=LR; bgcolor="transparent"; ... }
 * one filled node per OPDAGraph.viewData() node coloured by colorForNode(), one
 * "src" -> "tgt" [label=...] edge per edge. Edge/label colours come from
 * opts.theme so dark-mode re-theming stays uniform with the other engines. The
 * loaded wasm instance is cached on window.__graphvizWasm (the module + wasm are
 * fetched once across tab switches and theme/skos re-renders).
 *
 * Verified CDN (200-OK, ESM, "type":"module", exports { Graphviz }):
 *   https://cdn.jsdelivr.net/npm/@hpcc-js/wasm-graphviz@1/dist/index.js
 *   const { Graphviz } = await import(CDN);
 *   const gv = await Graphviz.load();          // static, returns Promise<Graphviz>
 *   const svg = gv.dot(dotSource, 'svg');      // === gv.layout(src, 'svg', 'dot')
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = 'https://cdn.jsdelivr.net/npm/@hpcc-js/wasm-graphviz@1/dist/index.js';

  // Load + cache the Graphviz wasm instance (module + wasm fetched once).
  async function ensureGraphviz() {
    if (window.__graphvizWasm) return window.__graphvizWasm;
    var mod = await import(CDN);
    var Graphviz = mod.Graphviz || (mod.default && mod.default.Graphviz);
    var gv = await Graphviz.load();
    return (window.__graphvizWasm = gv);
  }

  // DOT double-quoted string escaping: backslash + double-quote (and newlines).
  function q(s) {
    return '"' + String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n') + '"';
  }

  // Readable font colour over a filled node: pick black/white by fill luminance.
  // Accepts #rgb / #rrggbb hex (the palette is all hex); falls back to white.
  function contrast(hex) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return '#ffffff';
    var h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.slice(0, 2), 16),
        g = parseInt(h.slice(2, 4), 16),
        b = parseInt(h.slice(4, 6), 16);
    // Perceived luminance (ITU-R BT.601).
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#141413' : '#ffffff';
  }

  // node shape by model type (mirrors the other engines' visual vocabulary).
  function shapeFor(type) {
    if (type === 'class') return 'ellipse';
    if (type === 'scheme') return 'box';
    if (type === 'concept') return 'ellipse';
    if (type === 'external') return 'diamond';
    return 'ellipse';
  }

  // Build the DOT digraph from the SKOS-aware view. Returns { src, n, m }.
  function buildSource(data, showSkos, theme, facets) {
    var view = S.viewData(data, { showSkos: showSkos, facets: facets });
    var line = theme.line, text = theme.text, muted = theme.muted, brand = theme.brand;

    var lines = [
      'digraph opda {',
      '  rankdir=LR;',
      '  bgcolor="transparent";',
      '  splines=true;',
      '  overlap=false;',
      '  nodesep=0.35;',
      '  ranksep=0.7;',
      '  node [style=filled, fontname="Inter, Arial, sans-serif", fontsize=11, penwidth=1.5];',
      '  edge [fontname="Inter, Arial, sans-serif", fontsize=8, color=' + q(line) +
        ', fontcolor=' + q(muted) + ', arrowsize=0.7];',
    ];

    view.nodes.forEach(function (d) {
      var fill = S.colorForNode(d);
      // SHACL-shaped classes get the brand-coloured double border (cf. Cytoscape).
      var border = (d.type === 'class' && d.hasShape)
        ? ', color=' + q(brand) + ', penwidth=3'
        : ', color=' + q(theme.surface);
      lines.push('  ' + q(d.id) + ' [label=' + q(d.label || d.id) +
        ', shape=' + shapeFor(d.type) +
        ', fillcolor=' + q(fill) +
        ', fontcolor=' + q(contrast(fill)) + border + '];');
    });

    view.edges.forEach(function (e) {
      // inScheme/broader edges are SKOS structure → dashed + dimmer.
      var skos = (e.kind === 'inScheme' || e.kind === 'broader');
      var attrs = 'label=' + q(e.label || '');
      if (skos) attrs += ', style=dashed';
      // derived constrained-by bridge → dashed + distinct colour (never an asserted edge).
      if (e.kind === 'constrainedByScheme') attrs += ', style=dashed, color=' + q(S.COLORS.derived) + ', fontcolor=' + q(S.COLORS.derived);
      lines.push('  ' + q(e.source) + ' -> ' + q(e.target) + ' [' + attrs + '];');
    });

    lines.push('}');
    return { src: lines.join('\n'), n: view.nodes.length, m: view.edges.length };
  }

  window.opdaGraphEngines['dot'] = {
    id: 'dot',
    label: 'Graphviz (DOT)',
    kind: 'diagram',
    order: 80,
    note: 'Static deterministic DOT rendered in-browser via Graphviz wasm — full model incl. SKOS (dense in SKOS view).',

    async mount(container, data, opts) {
      container.classList.add('og-canvas--diagram');
      var showSkos = opts.showSkos;
      var facets = opts.facets || null;

      function fail(msg) {
        container.innerHTML = '<div style="padding:1rem;font:14px/1.5 var(--font-sans,sans-serif);' +
          'color:var(--color-text-muted,#6C6A64)">' + msg + '</div>';
        if (opts.onStatus) opts.onStatus('Graphviz render failed');
      }

      async function render() {
        var theme = S.themeColors();
        var built = buildSource(data, showSkos, theme, facets);
        try {
          var gv = await ensureGraphviz();
          var svg = gv.dot(built.src, 'svg');
          container.innerHTML = '<div class="og-dot-scroll" style="width:100%;height:100%;' +
            'overflow:auto;display:flex;align-items:center;justify-content:center">' + svg + '</div>';
          if (opts.onStatus) {
            opts.onStatus(built.n + ' nodes · ' + built.m + ' edges (Graphviz dot)');
          }
        } catch (e) {
          console.warn('[OPDA] graphviz (dot) render failed', e);
          fail('Graphviz could not render this graph (CDN blocked or wasm error). ' +
            'Try the Cytoscape or D3 tabs — the typed indexes under /ontology are the non-interactive equivalent.');
        }
      }

      await render();

      return {
        setTheme: function () { render(); },
        setSkos: function (show) { showSkos = show; render(); },
        setFacets: function (f) { facets = f; render(); },
        reset: function () { render(); },
        destroy: function () {
          try { container.innerHTML = ''; container.classList.remove('og-canvas--diagram'); } catch (e) {}
        },
      };
    },
  };
})();
