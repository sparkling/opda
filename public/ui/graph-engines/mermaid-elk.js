/*
 * Graph engine: Mermaid (ELK, site viewer) — bake-off tab.
 *
 * Same OWL-class-backbone source as the existing "Mermaid" tab (ELK layout,
 * flowchart LR — Mermaid hairballs past ~40 nodes so the 415-node SKOS layer
 * is omitted here too), but mounted through the SAME pan/zoom/fullscreen/
 * Navigate viewer every other diagram on the site uses (GraphDiagram /
 * src/scripts/graph-diagram.ts), instead of a bespoke mermaid.render() call.
 *
 * How the reuse works: this file is a plain, non-bundled script (loaded via
 * <script src>, can't use Vite imports), so it can't call adoptBareMermaid()
 * directly. Layout.astro exposes it as window.OPDA.adoptBareMermaid — this
 * engine creates a bare `<div class="mermaid">SOURCE</div>` (the site-wide
 * convention every other diagram authors) and calls that, which wraps it in
 * the real GraphDiagram shell and wires up the same pan/zoom/fullscreen.
 *
 * Colour: the site viewer resolves palette/theme itself (Cagle classDefs +
 * Claude theme, src/lib/diagram-palette) via bare `:::name` class shorthand —
 * NEVER hardcode classDef/%%{init}%% here (opda-diagram-theming-convention).
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;

  // Mermaid node ids can't contain ':' or other special chars — sanitise the
  // model id (e.g. "class:Address") to a safe token, keeping a collision map
  // so edges reference the same tokens (same approach as the other Mermaid tab).
  function safeId(modelId, seen) {
    var base = 'n_' + String(modelId).replace(/[^A-Za-z0-9]/g, '_');
    var id = base, i = 2;
    while (seen[id] && seen[id] !== modelId) { id = base + '_' + i++; }
    seen[id] = modelId;
    return id;
  }

  function q(label) {
    return '"' + String(label == null ? '' : label).replace(/"/g, '&quot;') + '"';
  }

  // Build the Mermaid `flowchart LR` source from the OWL backbone view. Uses
  // the site's own Cagle palette classes (:::process / :::info) instead of
  // hardcoded classDef colours — the GraphDiagram viewer injects the real
  // classDef block itself, light or dark, per diagram-palette.ts.
  function buildSource(data, facets) {
    var raw = S.viewData(data, { showSkos: false, facets: facets }); // OWL backbone
    var view = {
      nodes: raw.nodes.filter(function (d) { return d.type !== 'scheme'; }),
      edges: raw.edges.filter(function (e) { return e.kind !== 'constrainedByScheme'; }),
    };
    var seen = {};
    var idMap = {};

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

    var nodeLines = view.nodes.map(function (d) {
      var sid = safeId(d.id, seen);
      idMap[d.id] = sid;
      // :::info marks a SHACL-shaped class (matches the brand-stroke accent
      // the other engines give shaped nodes); :::process is the plain class.
      return '  ' + sid + '[' + q(d.label || d.id) + ']:::' + (d.hasShape ? 'info' : 'process');
    });

    var edgeLines = view.edges.map(function (e) {
      var s = idMap[e.source], t = idMap[e.target];
      if (!s || !t) return null;
      return '  ' + s + ' -->|' + q(e.label || '') + '| ' + t;
    }).filter(Boolean);

    var src = lines.concat(nodeLines).concat(edgeLines).join('\n');
    return { src: src, nClasses: view.nodes.length, nEdges: edgeLines.length };
  }

  window.opdaGraphEngines['mermaid-elk'] = {
    id: 'mermaid-elk',
    label: 'Mermaid (ELK)',
    kind: 'diagram',
    order: 71,
    note: 'Same OWL class backbone as the Mermaid tab, ELK-laid-out, rendered through the site-wide diagram viewer (pan/zoom/fullscreen) instead of a bespoke renderer.',
    skosUnsupported: true,

    async mount(container, data, opts) {
      container.classList.add('og-canvas--diagram');
      var facets = opts.facets || null;

      function render() {
        var built = buildSource(data, facets);
        container.innerHTML = '';
        var div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = built.src;
        container.appendChild(div);
        if (window.OPDA && window.OPDA.adoptBareMermaid) {
          window.OPDA.adoptBareMermaid();
        } else {
          console.warn('[OPDA] window.OPDA.adoptBareMermaid unavailable — site diagram viewer not mounted');
        }
        if (opts.onStatus) {
          opts.onStatus(built.nClasses + ' classes · ' + built.nEdges +
            ' object properties (OWL backbone · SKOS omitted · site-wide diagram viewer)');
        }
      }

      render();

      return {
        setTheme: function () { render(); },
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
