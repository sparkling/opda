/*
 * Interactive ontology graph (ADR-0043) — Cytoscape.js island.
 *
 * Renders the whole OPDA ontology as a node-link graph from the committed,
 * deterministic /data/ontology-graph-elements.json (derived from the SPARQL
 * model by scripts/ontology-graph.mjs). Server-less: Cytoscape + the fcose /
 * dagre layout extensions are lazy-loaded from the jsdelivr CDN at runtime
 * (the same pattern client.js uses for Mermaid), so nothing is needed at the
 * edge but a static file.
 *
 * Theming reuses the site's CSS dark-mode tokens (resolved at runtime via a
 * probe element so var() chains collapse to rgb()), and re-applies on the
 * data-theme toggle — no second palette to maintain for the chrome. UFO
 * meta-category is the one semantic colour encoding, via the CVD-safe
 * Okabe–Ito categorical palette (works on both the cream and dark canvases);
 * the readable label is theme-coloured text below each node, not inside it.
 *
 * Exposes window.OPDA_GRAPH.mount(); the page's inline bootstrap drives it from
 * astro:page-load (with previous-listener cleanup) so it survives view-transition
 * SPA navigation and never double-mounts.
 */
(function () {
  'use strict';

  var cy = null;
  var libs = null;
  var DATA_URL = '/data/ontology-graph-elements.json';

  // Cytoscape core + the fcose force-layout extension, ESM via jsdelivr's /+esm
  // (fcose bundles its cose-base/layout-base deps). The hierarchy layout uses
  // Cytoscape's BUILT-IN breadthfirst — cytoscape-dagre is deliberately avoided
  // because dagre@0.8.5's /+esm conversion is broken (graphlib Graph undefined).
  var CDN = {
    cytoscape: 'https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/+esm',
    fcose: 'https://cdn.jsdelivr.net/npm/cytoscape-fcose@2.2.0/+esm',
  };

  // Okabe–Ito colour-blind-safe categorical palette → UFO meta-category.
  var UFO_COLORS = {
    'Substance Kind':     '#0072B2',
    'Relator':            '#D55E00',
    'Role':               '#009E73',
    'RoleMixin':          '#56B4E9',
    'Event':              '#CC79A7',
    'Information Object':  '#E69F00',
    'Quality':            '#B22222',
    'Quality Value':      '#8C5E2A',
    'Collective':         '#7F7F7F',
  };
  var SCHEME_COLOR = '#6E56CF';   // SKOS concept scheme
  var CONCEPT_COLOR = '#9E8CFC';  // SKOS concept
  var EXTERNAL_COLOR = '#9E9E9E'; // non-opda target
  var DEFAULT_CLASS_COLOR = '#7F7F7F';

  // Resolve a CSS custom-property colour to a concrete rgb() string (a probe
  // element collapses nested var() chains the way getPropertyValue may not).
  function resolveColor(varName, fallback) {
    var probe = document.createElement('span');
    probe.style.cssText = 'display:none;color:var(' + varName + ',' + fallback + ')';
    document.body.appendChild(probe);
    var c = getComputedStyle(probe).color || fallback;
    probe.remove();
    return c;
  }

  function theme() {
    return {
      text: resolveColor('--color-text-strong', '#141413'),
      muted: resolveColor('--color-text-muted', '#6C6A64'),
      line: resolveColor('--color-border-strong', '#6C6A64'),
      surface: resolveColor('--color-surface', '#FAF9F5'),
      brand: resolveColor('--color-brand-500', '#CC785C'),
    };
  }

  function styleSheet() {
    var t = theme();
    return [
      { selector: 'node', style: {
          'label': 'data(label)', 'font-size': 11, 'color': t.text,
          'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': 3,
          'text-wrap': 'wrap', 'text-max-width': 120, 'min-zoomed-font-size': 8,
          'width': 22, 'height': 22, 'border-width': 1.5, 'border-color': t.surface,
      } },
      { selector: 'node[type="class"]', style: {
          'background-color': function (n) { return UFO_COLORS[n.data('ufoCategory')] || DEFAULT_CLASS_COLOR; },
          'width': 30, 'height': 30, 'font-weight': 'bold',
      } },
      { selector: 'node[type="class"][?hasShape]', style: {
          'border-width': 3, 'border-color': t.brand, 'border-style': 'double',
      } },
      { selector: 'node[type="scheme"]', style: {
          'background-color': SCHEME_COLOR, 'shape': 'round-rectangle', 'width': 26, 'height': 20,
      } },
      { selector: 'node[type="concept"]', style: {
          'background-color': CONCEPT_COLOR, 'shape': 'ellipse', 'width': 14, 'height': 14, 'font-size': 9,
      } },
      { selector: 'node[type="external"]', style: {
          'background-color': EXTERNAL_COLOR, 'shape': 'diamond', 'width': 24, 'height': 24,
      } },
      { selector: 'edge', style: {
          'width': 1, 'line-color': t.line, 'target-arrow-color': t.line,
          'target-arrow-shape': 'triangle', 'arrow-scale': 0.8, 'curve-style': 'bezier',
          'opacity': 0.55,
      } },
      { selector: 'edge[kind="objectProperty"]', style: {
          'label': 'data(label)', 'font-size': 8, 'color': t.muted, 'opacity': 0.8,
          'text-rotation': 'autorotate', 'text-background-color': t.surface,
          'text-background-opacity': 0.85, 'text-background-padding': 1,
      } },
      { selector: 'edge[kind="inScheme"]', style: { 'line-style': 'dashed', 'opacity': 0.3 } },
      { selector: '.faded', style: { 'opacity': 0.08, 'text-opacity': 0.08 } },
      { selector: '.highlight', style: { 'opacity': 1, 'text-opacity': 1, 'z-index': 99 } },
      { selector: 'node:selected', style: { 'border-width': 4, 'border-color': t.brand } },
    ];
  }

  var LAYOUTS = {
    fcose: { name: 'fcose', quality: 'default', animate: false, randomize: true,
             nodeSeparation: 90, idealEdgeLength: 90, nodeRepulsion: 9000, packComponents: true },
    cose: { name: 'cose', animate: false, nodeRepulsion: 9000, idealEdgeLength: 90 }, // built-in fcose fallback
    breadthfirst: { name: 'breadthfirst', directed: true, animate: false, spacingFactor: 1.1, grid: true },
    concentric: { name: 'concentric', animate: false, minNodeSpacing: 24,
                  concentric: function (n) { return n.degree(); }, levelWidth: function () { return 2; } },
    circle: { name: 'circle', animate: false },
    grid: { name: 'grid', animate: false },
  };

  function runLayout(name) {
    if (!cy) return;
    // Fall back to the built-in cose force layout if the fcose extension's CDN
    // module failed to load — the graph still lays out, just less tidily.
    if (name === 'fcose' && !(libs && libs.hasFcose)) name = 'cose';
    var def = LAYOUTS[name] || LAYOUTS.cose;
    cy.layout(Object.assign({ fit: true, padding: 30 }, def)).run();
  }

  async function ensureLibs() {
    if (libs) return libs;
    if (window.__cyLibs) { libs = window.__cyLibs; return libs; }
    // Cytoscape core is the one hard dependency; the fcose extension is loaded
    // best-effort so a CDN hiccup degrades to the built-in cose layout rather
    // than failing the whole graph.
    var cyMod = await import(CDN.cytoscape);
    var cytoscape = cyMod.default || cyMod;
    var hasFcose = false;
    try {
      var fMod = await import(CDN.fcose);
      cytoscape.use(fMod.default || fMod);
      hasFcose = true;
    } catch (e) { console.warn('[OPDA] fcose layout unavailable; using built-in cose', e); }
    libs = window.__cyLibs = { cytoscape: cytoscape, hasFcose: hasFcose };
    return libs;
  }

  function setStatus(el, msg) {
    var s = el.querySelector('#og-status');
    if (s) s.textContent = msg;
  }

  // Show/hide the SKOS layer (schemes + concepts + their edges).
  function applySkos(show) {
    if (!cy) return;
    var skos = cy.elements('node[type="scheme"], node[type="concept"], edge[kind="inScheme"], edge[kind="broader"]');
    if (show) skos.style('display', 'element'); else skos.style('display', 'none');
  }

  // Dim everything except a node and its directly-connected neighbourhood.
  function focusNeighbourhood(node) {
    cy.elements().removeClass('highlight').addClass('faded');
    var hood = node.closedNeighborhood();
    hood.removeClass('faded').addClass('highlight');
  }
  function clearFocus() {
    if (!cy) return;
    cy.elements().removeClass('faded').removeClass('highlight');
  }

  function renderInfo(el, node) {
    var box = el.querySelector('#og-info');
    if (!box) return;
    if (!node) { box.innerHTML = '<p class="og-hint">Click a node to focus its neighbourhood and see its details.</p>'; return; }
    var d = node.data();
    var typeLabel = { class: 'owl:Class', scheme: 'skos:ConceptScheme', concept: 'skos:Concept', external: 'external' }[d.type] || d.type;
    var deref = (d.type === 'class' || d.type === 'scheme' || d.type === 'concept');
    var bits = ['<h3>opda:' + d.label + '</h3>',
      '<p class="og-meta"><span class="og-pill">' + typeLabel + '</span>'];
    if (d.ufoCategory) bits.push('<span class="og-pill">' + d.ufoCategory + '</span>');
    if (d.module) bits.push('<span class="og-pill">' + d.module + '</span>');
    if (d.hasShape) bits.push('<span class="og-pill">SHACL shape</span>');
    bits.push('</p>');
    bits.push('<p class="og-meta">' + node.degree() + ' connections</p>');
    if (deref) bits.push('<p><a href="/pdtf/' + encodeURIComponent(d.ref) + '">Open /pdtf/' + d.ref + ' →</a></p>');
    box.innerHTML = bits.join('');
  }

  function wireControls(el) {
    var layoutSel = el.querySelector('#og-layout');
    var skosToggle = el.querySelector('#og-skos');
    var moduleSel = el.querySelector('#og-module');
    var search = el.querySelector('#og-search');
    var reset = el.querySelector('#og-reset');

    if (layoutSel) layoutSel.addEventListener('change', function () { runLayout(layoutSel.value); });
    if (skosToggle) skosToggle.addEventListener('change', function () {
      applySkos(skosToggle.checked);
      runLayout(layoutSel ? layoutSel.value : 'fcose');
    });
    if (moduleSel) moduleSel.addEventListener('change', function () {
      var m = moduleSel.value;
      cy.nodes().removeClass('faded');
      if (m) {
        cy.nodes().addClass('faded');
        cy.nodes('[module="' + m + '"]').removeClass('faded').closedNeighborhood().removeClass('faded');
      }
    });
    if (search) search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      if (!q) { clearFocus(); renderInfo(el, null); return; }
      var hit = cy.nodes().filter(function (n) { return n.data('label').toLowerCase().indexOf(q) === 0; })[0]
             || cy.nodes().filter(function (n) { return n.data('label').toLowerCase().indexOf(q) >= 0; })[0];
      if (hit) { focusNeighbourhood(hit); renderInfo(el, hit); cy.animate({ center: { eles: hit }, zoom: 1.4 }, { duration: 250 }); }
    });
    if (reset) reset.addEventListener('click', function () {
      clearFocus();
      if (moduleSel) moduleSel.value = '';
      if (search) search.value = '';
      cy.nodes().removeClass('faded');
      runLayout(layoutSel ? layoutSel.value : 'fcose');
      renderInfo(el, null);
    });
  }

  function populateModuleFilter(el, modules) {
    var sel = el.querySelector('#og-module');
    if (!sel || sel.dataset.filled) return;
    modules.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m; o.textContent = m;
      sel.appendChild(o);
    });
    sel.dataset.filled = '1';
  }

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  var lastTheme = null;
  function applyTheme() {
    if (!cy) return;
    var d = isDark();
    if (d === lastTheme) return;
    lastTheme = d;
    cy.style(styleSheet());
  }

  async function mount() {
    var el = document.getElementById('og-root');
    if (!el) return;
    var container = el.querySelector('#ontology-graph');
    if (!container) return;
    if (cy) { try { cy.destroy(); } catch (e) {} cy = null; }

    setStatus(el, 'Loading graph engine…');
    try {
      var l = await ensureLibs();
      var data = await fetch(DATA_URL).then(function (r) { return r.json(); });
      lastTheme = isDark();
      cy = l.cytoscape({
        container: container,
        elements: { nodes: data.nodes, edges: data.edges },
        style: styleSheet(),
        wheelSensitivity: 0.2,
        minZoom: 0.05, maxZoom: 4,
        layout: { name: 'preset' }, // we run a real layout after the SKOS default is applied
      });

      // Default view = the OWL backbone (classes + object properties); the SKOS
      // layer (49 schemes + 323 concepts) is heavy, so it starts hidden behind
      // the toggle — the ADR's "concepts not invisible, but not a default hairball".
      var skosToggle = el.querySelector('#og-skos');
      applySkos(skosToggle ? skosToggle.checked : false);
      populateModuleFilter(el, data.modules || []);
      wireControls(el);
      renderInfo(el, null);

      cy.on('tap', 'node', function (evt) { focusNeighbourhood(evt.target); renderInfo(el, evt.target); });
      cy.on('tap', function (evt) { if (evt.target === cy) { clearFocus(); renderInfo(el, null); } });

      var layoutSel = el.querySelector('#og-layout');
      runLayout(layoutSel ? layoutSel.value : 'fcose');
      setStatus(el, data.nodes.length + ' nodes · ' + data.edges.length + ' edges');
    } catch (err) {
      console.warn('[OPDA] ontology graph failed:', err);
      setStatus(el, 'Could not load the graph engine (CDN blocked?). The typed indexes under /ontology remain available.');
    }
  }

  // Re-theme on the site theme toggle (client.js flips data-theme on click).
  try {
    new MutationObserver(applyTheme).observe(document.documentElement,
      { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) { /* no MutationObserver — theme stays at mount-time */ }

  window.OPDA_GRAPH = { mount: mount };
})();
