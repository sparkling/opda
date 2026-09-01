/*
 * Mermaid adapter for the ontology graph comparison.
 *
 * This adapter only authors Mermaid source. It deliberately delegates loading,
 * theming, rendering, navigation, pan/zoom and fullscreen to the site-wide
 * GraphDiagram viewer exposed by Layout.astro as OPDA.adoptBareMermaid.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;

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

  function buildSource(data, facets) {
    var raw = S.viewData(data, { showSkos: false, facets: facets });
    var view = {
      nodes: raw.nodes.filter(function (node) { return node.type !== 'scheme'; }),
      edges: raw.edges.filter(function (edge) { return edge.kind !== 'constrainedByScheme'; }),
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

    var nodeLines = view.nodes.map(function (node) {
      var id = safeId(node.id, seen);
      idMap[node.id] = id;
      return '  ' + id + '[' + q(node.label || node.id) + ']:::' + (node.hasShape ? 'info' : 'process');
    });
    var edgeLines = view.edges.map(function (edge) {
      var source = idMap[edge.source], target = idMap[edge.target];
      if (!source || !target) return null;
      return '  ' + source + ' -->|' + q(edge.label || '') + '| ' + target;
    }).filter(Boolean);

    return {
      source: lines.concat(nodeLines).concat(edgeLines).join('\n'),
      classCount: view.nodes.length,
      edgeCount: edgeLines.length,
    };
  }

  window.opdaGraphEngines.mermaid = {
    id: 'mermaid',
    label: 'Mermaid',
    kind: 'diagram',
    order: 70,
    note: 'OWL class backbone only. Mermaid omits the 415-node SKOS layer and uses the site-wide diagram viewer.',
    skosUnsupported: true,

    async mount(container, data, opts) {
      container.classList.add('og-canvas--diagram');
      var facets = opts.facets || null;

      function render() {
        var built = buildSource(data, facets);
        container.innerHTML = '';
        var source = document.createElement('div');
        source.className = 'mermaid';
        source.textContent = built.source;
        container.appendChild(source);
        if (window.OPDA && window.OPDA.adoptBareMermaid) {
          window.OPDA.adoptBareMermaid();
        } else {
          console.warn('[OPDA] site-wide Mermaid viewer is unavailable');
        }
        if (opts.onStatus) {
          opts.onStatus(built.classCount + ' classes · ' + built.edgeCount
            + ' object properties (OWL backbone · SKOS omitted)');
        }
      }

      render();
      return {
        setTheme: render,
        setSkos: function () {
          if (opts.onStatus) opts.onStatus('SKOS layer omitted for Mermaid (OWL backbone only)');
        },
        setFacets: function (nextFacets) { facets = nextFacets; render(); },
        reset: render,
        destroy: function () {
          try {
            container.innerHTML = '';
            container.classList.remove('og-canvas--diagram');
          } catch (error) {
            console.warn('[OPDA] Mermaid cleanup failed', error);
          }
        },
      };
    },
  };
})();
