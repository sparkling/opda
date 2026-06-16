/*
 * Ontology graph — multi-engine bake-off orchestrator (ADR-0043 / ADR-0047).
 *
 * Every scored graph engine (Cytoscape, D3, vis-network, force-graph, G6,
 * Sigma) plus the diagram paths (Mermaid, Graphviz/DOT) renders the SAME
 * committed model in its own tab, so the ADR-0043 Cytoscape pick can be judged
 * in situ. This file owns the page chrome — tab bar, shared controls (SKOS
 * toggle, layout select, reset), info panel, legend, status, theme observer —
 * and delegates rendering to the active engine via the contract in _shared.js.
 *
 * Engines self-register on window.opdaGraphEngines (loaded by their own
 * <script> tags before this one). Exposes window.OPDA_GRAPH.mount(); the page's
 * inline bootstrap drives it from astro:page-load (with listener cleanup) so it
 * survives view-transition SPA navigation and never double-mounts.
 */
(function () {
  'use strict';
  var S = window.OPDAGraph;
  var DATA_URL = '/data/ontology-graph-elements.json';

  var data = null;        // fetched once, cached on window
  var active = null;      // { id, handle }
  var elRoot = null;

  function el(id) { return elRoot.querySelector('#' + id); }
  function status(msg) { var s = el('og-status'); if (s) s.textContent = msg; }

  function renderInfo(nodeData) {
    var box = el('og-info');
    if (!box) return;
    if (!nodeData) { box.innerHTML = '<p class="og-hint">Click a node to focus its neighbourhood and see its details.</p>'; return; }
    var d = nodeData;
    var typeLabel = { class: 'owl:Class', scheme: 'skos:ConceptScheme', concept: 'skos:Concept', external: 'external' }[d.type] || d.type;
    var deref = (d.type === 'class' || d.type === 'scheme' || d.type === 'concept');
    var bits = ['<h3>opda:' + d.label + '</h3>', '<p class="og-meta"><span class="og-pill">' + typeLabel + '</span>'];
    if (d.ufoCategory) bits.push('<span class="og-pill">' + d.ufoCategory + '</span>');
    if (d.module) bits.push('<span class="og-pill">' + d.module + '</span>');
    if (d.hasShape) bits.push('<span class="og-pill">SHACL shape</span>');
    bits.push('</p>');
    if (deref) bits.push('<p><a href="/pdtf/' + encodeURIComponent(d.ref) + '">Open /pdtf/' + d.ref + ' →</a></p>');
    box.innerHTML = bits.join('');
  }

  function engineOpts() {
    return {
      isDark: S.isDark(),
      showSkos: !!(el('og-skos') && el('og-skos').checked),
      facets: facetFilter(),
      colors: S.COLORS,
      theme: S.themeColors(),
      onSelect: renderInfo,
      onStatus: status,
    };
  }

  // ── Facet filter ──────────────────────────────────────────────────────────
  // The opda:ufoCategory facet is a FILTER (not a colour). One checkbox per
  // category present in the data, plus an "Uncategorised" box if any class
  // lacks a facet. All-checked → returns null (no filter); a subset → a Set of
  // visible values (uncategorised = '').
  function buildFacets() {
    var wrap = el('og-facets');
    if (!wrap || !data) return;
    wrap.innerHTML = '';
    var cats = (data.ufoCategories || []).slice();
    var items = cats.map(function (c) { return { value: c, label: c }; });
    var hasUncat = (data.nodes || []).some(function (n) {
      return n.data.type === 'class' && !n.data.ufoCategory;
    });
    if (hasUncat) items.push({ value: '', label: 'Uncategorised' });
    items.forEach(function (it) {
      var lab = document.createElement('label');
      lab.className = 'og-facet';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.dataset.facet = it.value;
      cb.addEventListener('change', applyFacets);
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(it.label));
      wrap.appendChild(lab);
    });
  }

  function facetFilter() {
    var wrap = el('og-facets');
    if (!wrap) return null;
    var boxes = wrap.querySelectorAll('input[type="checkbox"]');
    if (!boxes.length) return null;
    var visible = new Set();
    var all = true;
    boxes.forEach(function (b) {
      if (b.checked) visible.add(b.dataset.facet); else all = false;
    });
    return all ? null : visible; // all-checked = no filter
  }

  function applyFacets() {
    if (active && active.handle && active.handle.setFacets) active.handle.setFacets(facetFilter());
  }

  function syncLayoutControl(engine) {
    var wrap = el('og-layout-wrap');
    var sel = el('og-layout');
    if (!wrap || !sel) return;
    if (engine && engine.layouts && engine.layouts.length) {
      sel.innerHTML = '';
      engine.layouts.forEach(function (name) {
        var o = document.createElement('option');
        o.value = name;
        o.textContent = (engine.layoutLabels && engine.layoutLabels[name]) || name;
        sel.appendChild(o);
      });
      wrap.hidden = false;
    } else {
      wrap.hidden = true;
    }
  }

  function setNote(engine) {
    var n = el('og-note');
    if (n) n.textContent = engine && engine.note ? engine.note : '';
  }

  async function activate(id) {
    var engine = S.registry[id];
    if (!engine) return;
    // tear down previous
    if (active && active.handle && active.handle.destroy) { try { active.handle.destroy(); } catch (e) {} }
    active = null;
    var container = el('ontology-graph');
    container.innerHTML = '';
    container.className = 'og-canvas og-canvas--' + engine.kind;

    // tab button active state
    elRoot.querySelectorAll('.og-tab').forEach(function (b) {
      var on = b.dataset.engine === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    syncLayoutControl(engine);
    setNote(engine);
    renderInfo(null);
    status('Loading ' + engine.label + '…');

    try {
      var handle = await engine.mount(container, data, engineOpts());
      active = { id: id, handle: handle || {} };
    } catch (err) {
      console.warn('[OPDA] engine ' + id + ' failed:', err);
      status('Could not load ' + engine.label + ' (CDN blocked?). Try another tab — the typed indexes under /ontology are the non-interactive equivalent.');
    }
  }

  function buildTabs() {
    var bar = el('og-tabs');
    if (!bar) return;
    bar.innerHTML = '';
    var engines = Object.keys(S.registry).map(function (k) { return S.registry[k]; })
      .sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
    engines.forEach(function (eng) {
      var b = document.createElement('button');
      b.type = 'button';
      // Tailwind tab — active state via the aria-selected: variant (activate()
      // toggles aria-selected). global.css @source scans this file so the
      // utilities below are emitted. `og-tab` is a no-CSS JS-selection hook.
      b.className = 'og-tab cursor-pointer whitespace-nowrap rounded-t-md border border-b-0 ' +
        'border-[var(--color-border-strong)] -mb-px px-3 py-2 text-sm font-semibold ' +
        'text-[var(--color-text-muted)] bg-[var(--button-bg)] transition-colors ' +
        'hover:text-[var(--color-brand-600)] hover:bg-[var(--button-bg-hover)] ' +
        'focus:z-10 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--focus-ring)] ' +
        'aria-selected:bg-[var(--color-brand-500)] aria-selected:text-white aria-selected:border-[var(--color-brand-500)]';
      b.dataset.engine = eng.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', 'false');
      b.textContent = eng.label;
      b.addEventListener('click', function () { activate(eng.id); });
      bar.appendChild(b);
    });
    return engines;
  }

  function wireControls() {
    var skos = el('og-skos');
    if (skos) skos.addEventListener('change', function () {
      if (active && active.handle && active.handle.setSkos) active.handle.setSkos(skos.checked);
    });
    var layout = el('og-layout');
    if (layout) layout.addEventListener('change', function () {
      if (active && active.handle && active.handle.setLayout) active.handle.setLayout(layout.value);
    });
    var reset = el('og-reset');
    if (reset) reset.addEventListener('click', function () {
      if (active && active.handle && active.handle.reset) active.handle.reset();
    });
  }

  // Re-theme the active engine when the site theme toggles.
  try {
    new MutationObserver(function () {
      if (active && active.handle && active.handle.setTheme) active.handle.setTheme(S.isDark());
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) { /* no MutationObserver */ }

  async function mount() {
    elRoot = document.getElementById('og-root');
    if (!elRoot || !el('ontology-graph')) return;
    if (active && active.handle && active.handle.destroy) { try { active.handle.destroy(); } catch (e) {} }
    active = null;
    wireControls();
    var engines = buildTabs();
    if (!engines || !engines.length) { status('No graph engines registered.'); return; }
    try {
      if (!data) data = window.__ontologyGraphData || (window.__ontologyGraphData = await fetch(DATA_URL).then(function (r) { return r.json(); }));
    } catch (e) {
      status('Could not load the graph data.'); return;
    }
    buildFacets();             // facet checkboxes depend on the loaded data
    activate(engines[0].id);   // first tab (Cytoscape, the ADR-0043 pick)
  }

  window.OPDA_GRAPH = { mount: mount };
})();
