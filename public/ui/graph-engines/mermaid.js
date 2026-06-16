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
 * (`flowchart LR` + ELK, Subject -->|predicate| Object), coloured by UFO
 * meta-category via one classDef per category built from OPDAGraph.COLORS.ufo.
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

  // classDef name per UFO meta-category. Prefixed with "ufo_" + alnum-only so it
  // can NEVER collide with a Mermaid reserved word (class/graph/end/default/style).
  function classDefName(category) {
    return 'ufo_' + String(category || 'default').replace(/[^A-Za-z0-9]/g, '_');
  }

  // Escape a label for use inside a Mermaid "double-quoted" string.
  function q(label) {
    return '"' + String(label == null ? '' : label).replace(/"/g, '&quot;') + '"';
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

  // Build the Mermaid `flowchart LR` source from the OWL backbone view.
  // Returns { src, nClasses, nEdges }.
  function buildSource(data) {
    var view = S.viewData(data, false); // OWL backbone: classes + objectProperty edges
    var seen = {};            // safeId -> modelId (collision guard)
    var idMap = {};           // modelId -> safeId
    var usedCats = {};        // category -> true (only emit classDefs we use)

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

    // classDef per UFO category actually present, coloured from COLORS.ufo.
    var nodeLines = [];
    view.nodes.forEach(function (d) {
      var sid = safeId(d.id, seen);
      idMap[d.id] = sid;
      var cat = (d.ufoCategory && S.COLORS.ufo[d.ufoCategory]) ? d.ufoCategory : null;
      var cd = classDefName(cat || 'default');
      usedCats[cd] = cat; // value: category name or null (default)
      nodeLines.push('    ' + sid + '[' + q(d.label || d.id) + ']:::' + cd);
    });

    var classDefLines = Object.keys(usedCats).map(function (cd) {
      var cat = usedCats[cd];
      var fill = cat ? S.COLORS.ufo[cat] : S.COLORS.defaultClass;
      // white-ish stroke + readable text; fill is the category hue.
      return '    classDef ' + cd + ' fill:' + fill + ',stroke:' + fill + ',stroke-width:1.5px,color:#ffffff';
    });

    var edgeLines = view.edges.map(function (e) {
      var s = idMap[e.source], t = idMap[e.target];
      if (!s || !t) return null; // both endpoints must be in-view (defensive)
      return '    ' + s + ' -->|' + q(e.label || '') + '| ' + t;
    }).filter(Boolean);

    var src = lines
      .concat(classDefLines)
      .concat(nodeLines)
      .concat(edgeLines)
      .join('\n');

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

      function fail(msg) {
        container.innerHTML = '<div style="padding:1rem;font:14px/1.5 var(--font-sans,sans-serif);' +
          'color:var(--color-text-muted,#6C6A64)">' + msg + '</div>';
      }

      async function render() {
        var built = buildSource(data);
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
        reset: function () { render(); },
        destroy: function () {
          try { container.innerHTML = ''; container.classList.remove('og-canvas--diagram'); } catch (e) {}
        },
      };
    },
  };
})();
