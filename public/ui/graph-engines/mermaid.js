/*
 * Graph engine: Mermaid (bake-off "diagram" tab).
 *
 * Mermaid is a DIAGRAM tool, not a graph layout engine — it hairballs badly
 * past ~40 nodes, and it cannot lay out the full 415-node OWL+SKOS model. So
 * this adapter renders the OWL CLASS BACKBONE ONLY: the ~40 owl:Class nodes
 * plus the object-property edges between them (OPDAGraph.viewData(data, false)).
 * The SKOS layer is deliberately omitted (showSkos is ignored) — see `note`.
 *
 * Source is generated per the diagramming skill's 17-LINKED-DATA-GUIDE
 * (`flowchart LR` + ELK, Subject -->|predicate| Object). Nodes share ONE uniform
 * class fill (the UFO facet is a FILTER, not a colour); SHACL-shaped classes get
 * a brand-coloured stroke. The facet filter (opts.facets) drops class nodes.
 * Theme follows client.js: base theme + themeVariables resolved from opts.theme
 * (re-resolved from OPDAGraph.themeColors() on a theme flip). Mermaid + the ELK
 * layout loader lazy-load from the SAME jsdelivr modules client.js uses, cached
 * on window.__mermaidEngine so the engine is self-contained.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var CDN = {
    mermaid: 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs',
    elk: 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0/dist/mermaid-layout-elk.esm.min.mjs',
  };

  async function ensureMermaid() {
    if (window.__mermaidEngine) return window.__mermaidEngine;
    var mods = await Promise.all([import(CDN.mermaid), import(CDN.elk)]);
    var mermaid = mods[0].default;
    mermaid.registerLayoutLoaders(mods[1].default);
    return (window.__mermaidEngine = mermaid);
  }

  // Mermaid node ids can't contain ':' or other special chars — sanitise the
  // model id (e.g. "class:Address") to a safe token ("n_class_Address"), and
  // keep a model-id → safeId map so edges reference the same tokens.
  function safeId(modelId, seen) {
    var base = 'n_' + String(modelId).replace(/[^A-Za-z0-9]/g, '_');
    var id = base, i = 2;
    while (seen[id] && seen[id] !== modelId) { id = base + '_' + i++; }
    seen[id] = modelId;
    return id;
  }

  // Escape a label for use inside a Mermaid "double-quoted" string.
  function q(label) {
    return '"' + String(label == null ? '' : label).replace(/"/g, '&quot;') + '"';
  }

  // Mermaid classDef colours must be hex/named — it CANNOT parse rgb(...) (the
  // parens break the flowchart parser). themeColors() resolves to rgb(), so
  // convert; pass hex/named values through untouched.
  function toHex(c) {
    var m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(String(c || ''));
    if (!m) return c;
    function h(n) { return ('0' + parseInt(n, 10).toString(16)).slice(-2); }
    return '#' + h(m[1]) + h(m[2]) + h(m[3]);
  }

  // themeVariables matching client.js's base-theme integration, driven by opts.theme.
  function themeVars(theme) {
    return {
      primaryColor: theme.surface,
      primaryTextColor: theme.text,
      primaryBorderColor: theme.line,
      lineColor: theme.line,
      textColor: theme.text,
      background: theme.surface,
      mainBkg: theme.surface,
      edgeLabelBackground: theme.surface,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: '14px',
    };
  }

  // Build the Mermaid `flowchart LR` source from the OWL backbone view, honouring
  // the facet filter. Returns { src, nClasses, nEdges }.
  function buildSource(data, facets) {
    var view = S.viewData(data, { showSkos: false, facets: facets }); // OWL backbone
    var seen = {};            // safeId -> modelId (collision guard)
    var idMap = {};           // modelId -> safeId

    var lines = [
      '---',
      'config:',
      '  layout: elk',
      '  elk:',
      '    mergeEdges: false',
      '    nodePlacementStrategy: BRANDES_KOEPF',
      '---',
      'flowchart LR',
    ];

    // Uniform class styling — the UFO facet is a FILTER, not a colour. Shaped
    // classes get the brand stroke to mark a SHACL node-shape (cf. the legend).
    // Colours must be hex for the Mermaid classDef parser (no rgb()).
    var classColor = toHex(S.COLORS.class);
    var brand = toHex(S.themeColors().brand);
    lines.push('    classDef og_class fill:' + classColor + ',stroke:' + classColor + ',stroke-width:1.5px,color:#ffffff');
    lines.push('    classDef og_shape fill:' + classColor + ',stroke:' + brand + ',stroke-width:3px,color:#ffffff');

    var nodeLines = view.nodes.map(function (d) {
      var sid = safeId(d.id, seen);
      idMap[d.id] = sid;
      return '    ' + sid + '[' + q(d.label || d.id) + ']:::' + (d.hasShape ? 'og_shape' : 'og_class');
    });

    var edgeLines = view.edges.map(function (e) {
      var s = idMap[e.source], t = idMap[e.target];
      if (!s || !t) return null; // both endpoints must be in-view (defensive)
      return '    ' + s + ' -->|' + q(e.label || '') + '| ' + t;
    }).filter(Boolean);

    var src = lines.concat(nodeLines).concat(edgeLines).join('\n');
    return { src: src, nClasses: view.nodes.length, nEdges: edgeLines.length };
  }

  window.opdaGraphEngines['mermaid'] = {
    id: 'mermaid',
    label: 'Mermaid',
    kind: 'diagram',
    order: 70,
    note: 'OWL class backbone only — Mermaid hairballs past ~40 nodes, so the 415-node SKOS layer is omitted.',

    async mount(container, data, opts) {
      container.classList.add('og-canvas--diagram');
      var facets = opts.facets || null;

      function fail(msg) {
        container.innerHTML = '<div style="padding:1rem;font:14px/1.5 var(--font-sans,sans-serif);' +
          'color:var(--color-text-muted,#6C6A64)">' + msg + '</div>';
      }

      async function render() {
        var built = buildSource(data, facets);
        var theme = S.themeColors();
        try {
          var mermaid = await ensureMermaid();
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: themeVars(theme),
            securityLevel: 'loose',
          });
          // Unique render id per call so re-renders never collide.
          var renderId = 'og-mermaid-svg-' + Date.now();
          var out = await mermaid.render(renderId, built.src);
          container.innerHTML = '<div class="og-mermaid-scroll" style="width:100%;height:100%;overflow:auto">' +
            out.svg + '</div>';
          if (opts.onStatus) {
            opts.onStatus(built.nClasses + ' classes · ' + built.nEdges +
              ' object properties (OWL backbone · SKOS omitted for Mermaid)');
          }
        } catch (e) {
          console.warn('[OPDA] mermaid render failed', e);
          fail('Mermaid could not render this graph (CDN or layout error). ' +
            'Try the Cytoscape or D3 tabs.');
          if (opts.onStatus) opts.onStatus('Mermaid render failed');
        }
      }

      await render();

      return {
        setTheme: function () { render(); },
        // SKOS is not part of the Mermaid backbone view — toggling is a no-op.
        setSkos: function () {
          if (opts.onStatus) opts.onStatus('SKOS layer omitted for Mermaid (OWL backbone only)');
        },
        setFacets: function (f) { facets = f; render(); },
        reset: function () { render(); },
        destroy: function () {
          try { container.innerHTML = ''; container.classList.remove('og-canvas--diagram'); } catch (e) {}
        },
      };
    },
  };
})();
