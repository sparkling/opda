/*
 * schema-leaf-table.js — wires up the "Filter by overlay" toolbar on
 * schema aggregate pages (35–48). Called by the inline init script in
 * aggregate-page.html.j2 as:
 *
 *   mountLeafTable({
 *     page:           '35',
 *     showEnvelopes:  false,
 *     filterButtonId: 'filter-overlay-btn',
 *     filterCountId:  'filter-overlay-count'
 *   });
 *
 * The leaf tables themselves are server-rendered; this script only adds
 * interactivity. Rows carry `data-overlays="key1,key2,..."` (set by the
 * leaf-table macro). When the user picks one or more overlay keys, rows
 * whose data-overlays don't intersect the selection are hidden. Empty
 * sub-tables show a "no rows in this overlay" placeholder so the page
 * structure stays legible.
 *
 * Uses the same .db-filter-panel CSS classes as the data-dictionary
 * browser for visual consistency (positioning is fixed + getBoundingClientRect).
 */
(function () {
  'use strict';

  // Friendly names for the overlay keys. Source: page 49's overlay
  // catalogue + page 16's owner/use column. Keep this in sync with
  // those tables when overlays change.
  var OVERLAY_NAMES = {
    baspi5:   'Buyers & Sellers Property Information v5',
    ta6:      'Law Society Property Information Form',
    ta7:      'Law Society Leasehold Information Form',
    ta10:     'Law Society Fittings & Contents Form',
    nts2:     'National Trading Standards Material Information (sales)',
    ntsl2:    'NTS Material Information (lettings)',
    piq:      'Property Information Questionnaire',
    lpe1:     'Leasehold Property Enquiries Form',
    fme1:     'Freehold Management Enquiries',
    con29R:   'Local Authority CON29R search return',
    con29DW:  'Drainage & water search return',
    oc1:      'HMLR Official Copy data',
    llc1:     'Local Land Charges search',
    rds:      'Residential Disclosure Standard',
    sr24:     'Sustainability Report 2024',
  };

  function overlayLabel(key) {
    return OVERLAY_NAMES[key] || key;
  }

  function el(tag, attrs, content) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'class') e.className = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
    }
    if (content != null) e.textContent = content;
    return e;
  }

  function rowsWithOverlays() {
    return Array.prototype.slice.call(document.querySelectorAll('tr[data-overlays]'));
  }

  // Column index in the rendered object-table macro
  //   0 Title · 1 Description · 2 Type · 3 Kind · 4 Field · 5 Required · 6 Overlays · 7 Affordance
  var COL = { type: 2, kind: 3, required: 5, affordance: 7 };

  function cellText(tr, idx) {
    var cells = tr.cells || tr.querySelectorAll('td');
    var c = cells[idx];
    return c ? (c.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function normaliseRequired(s) { return /^yes$/i.test(s) ? 'yes' : 'no'; }
  function normaliseAffordance(s) { return /example/i.test(s) ? 'example' : 'none'; }
  function normaliseKind(s) { return s && s !== '—' ? s : 'Unspecified'; }

  function rowFacetValues(tr) {
    return {
      overlay: ((tr.getAttribute('data-overlays') || '').split(',')
        .map(function (s) { return s.trim(); })
        .filter(Boolean)),
      type: [cellText(tr, COL.type)],
      kind: [normaliseKind(cellText(tr, COL.kind))],
      required: [normaliseRequired(cellText(tr, COL.required))],
      affordance: [normaliseAffordance(cellText(tr, COL.affordance))],
    };
  }

  // Collect distinct values for every facet across the visible rows.
  function gatherFacets(rows) {
    var facetKeys = ['overlay', 'type', 'kind', 'required', 'affordance'];
    var counts = {};
    facetKeys.forEach(function (k) { counts[k] = Object.create(null); });
    rows.forEach(function (tr) {
      var v = rowFacetValues(tr);
      facetKeys.forEach(function (k) {
        v[k].forEach(function (val) {
          if (!val) return;
          counts[k][val] = (counts[k][val] || 0) + 1;
        });
      });
    });
    var result = {};
    facetKeys.forEach(function (k) {
      result[k] = Object.keys(counts[k]).sort().map(function (v) {
        return { key: v, count: counts[k][v] };
      });
    });
    return result;
  }

  function applyFilter(rows, active) {
    var hasActive = active.size > 0;
    rows.forEach(function (tr) {
      if (!hasActive) { tr.style.display = ''; return; }
      var overs = (tr.getAttribute('data-overlays') || '').split(',')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
      var hit = overs.some(function (k) { return active.has(k); });
      tr.style.display = hit ? '' : 'none';
    });
    // For each table, update or remove a "no rows" placeholder.
    document.querySelectorAll('table.db-table').forEach(function (tbl) {
      var tbody = tbl.tBodies[0];
      if (!tbody) return;
      var visible = tbl.querySelectorAll('tbody tr[data-leaf-path]:not([style*="display: none"])').length;
      var ph = tbody.querySelector('tr[data-filter-placeholder]');
      if (hasActive && visible === 0) {
        if (!ph) {
          var cols = tbl.tHead ? tbl.tHead.rows[0].cells.length : 7;
          ph = document.createElement('tr');
          ph.setAttribute('data-filter-placeholder', '1');
          var td = document.createElement('td');
          td.colSpan = cols;
          td.className = 'muted tiny';
          td.style.textAlign = 'center';
          td.style.padding = 'var(--space-3)';
          td.textContent = 'No rows in this overlay selection.';
          ph.appendChild(td);
          tbody.appendChild(ph);
        }
      } else if (ph) {
        ph.remove();
      }
    });
  }

  // Open/close/positioning is handled by <el-popover> + the native
  // HTML Popover API. We only POPULATE the existing <el-popover> element
  // emitted by aggregate-page.html.j2.

  // One section per facet. `facets` is { facetKey: [{key, count}, ...] }
  // and `onChange(facetKey, value, checked)` is called for each tick;
  // passing facetKey=null clears everything.
  var FACET_LABELS = {
    overlay:    'Overlays',
    type:       'Type',
    kind:       'Kind',
    required:   'Required',
    affordance: 'Affordance',
  };
  var FACET_ORDER = ['type', 'kind', 'required', 'affordance', 'overlay'];

  function buildPanel(facets, onChange) {
    var panel = document.getElementById('filter-overlay-panel');
    if (!panel) return { panel: null, checkboxes: [] };
    panel.innerHTML = '';

    // Two explicit columns: short facets (Type/Kind/Required/Affordance)
    // stacked in column 1, Overlays alone in column 2 because its labels
    // are long and need room.
    var cols = el('div', { 'class': 'db-filter-cols' });
    var colShort = el('div', { 'class': 'db-filter-col' });
    var colWide  = el('div', { 'class': 'db-filter-col' });
    cols.appendChild(colShort);
    cols.appendChild(colWide);
    panel.appendChild(cols);

    var allCheckboxes = [];

    FACET_ORDER.forEach(function (facetKey) {
      var values = facets[facetKey] || [];
      if (!values.length) return;
      var section = el('div', { 'class': 'db-filter-section' });
      section.appendChild(el('div', { 'class': 'db-filter-heading' }, FACET_LABELS[facetKey]));

      values.forEach(function (v) {
        var label = el('label', { 'class': 'db-filter-option' });
        var cb = el('input', { 'type': 'checkbox', 'value': v.key });
        cb.dataset.facet = facetKey;
        cb.addEventListener('change', function () { onChange(facetKey, v.key, cb.checked); });
        label.appendChild(cb);
        var span = document.createElement('span');
        if (facetKey === 'overlay') {
          span.innerHTML =
            ' ' + overlayLabel(v.key) +
            ' <span class="db-filter-option-key">(' + v.key + ')</span>';
        } else {
          var display = v.key.charAt(0).toUpperCase() + v.key.slice(1);
          span.textContent = ' ' + display;
        }
        label.appendChild(span);
        section.appendChild(label);
        allCheckboxes.push(cb);
      });

      (facetKey === 'overlay' ? colWide : colShort).appendChild(section);
    });

    panel.appendChild(el('div', { 'class': 'db-filter-sep' }));
    var reset = el('button', { 'class': 'db-reset', 'type': 'button' }, 'Clear all');
    reset.addEventListener('click', function () {
      allCheckboxes.forEach(function (cb) { cb.checked = false; });
      onChange(null);
    });
    panel.appendChild(reset);

    return { panel: panel, checkboxes: allCheckboxes };
  }

  // Recompute visibility of rows + per-block placeholders + per-block
  // "everything hidden" container collapse. Combines per-facet filters +
  // free-text search; all run in the same pass to avoid race conditions
  // when the user types while a filter is active.
  //
  // `activeFilters` is { facetKey: Set<value> }. A row passes a facet
  // when ANY of its values for that facet is in the active set, OR when
  // the active set is empty.
  function applyAllFilters(rows, activeFilters, searchText) {
    var q = (searchText || '').trim().toLowerCase();
    var hasQuery = q.length > 0;
    activeFilters = activeFilters || {};
    var activeKeys = Object.keys(activeFilters).filter(function (k) {
      return activeFilters[k] && activeFilters[k].size > 0;
    });
    var hasFilter = activeKeys.length > 0;

    rows.forEach(function (tr) {
      var visible = true;
      if (hasFilter) {
        var facets = rowFacetValues(tr);
        visible = activeKeys.every(function (k) {
          var active = activeFilters[k];
          return (facets[k] || []).some(function (v) { return active.has(v); });
        });
      }
      if (visible && hasQuery) {
        visible = (tr.textContent || '').toLowerCase().indexOf(q) !== -1;
      }
      tr.style.display = visible ? '' : 'none';
    });

    // Per-table: placeholder when zero rows visible OR hide the whole
    // object-block when no rows match (keeps the page short during search).
    document.querySelectorAll('.object-block').forEach(function (block) {
      var tbl = block.querySelector('table.db-table');
      if (!tbl) {
        // Pure container — show always; nothing to filter.
        block.style.display = '';
        return;
      }
      var tbody = tbl.tBodies[0];
      var visible = tbl.querySelectorAll('tbody tr[data-leaf-path]:not([style*="display: none"])').length;
      var ph = tbody && tbody.querySelector('tr[data-filter-placeholder]');
      var noMatch = (hasFilter || hasQuery) && visible === 0;
      // When searching, fully hide non-matching tables.
      block.style.display = (hasQuery && noMatch) ? 'none' : '';
      // Otherwise (overlay-only filter), keep the table but show placeholder.
      if (noMatch && !hasQuery && tbody && !ph) {
        var cols = tbl.tHead ? tbl.tHead.rows[0].cells.length : 7;
        ph = document.createElement('tr');
        ph.setAttribute('data-filter-placeholder', '1');
        var td = document.createElement('td');
        td.colSpan = cols;
        td.className = 'muted tiny';
        td.style.textAlign = 'center';
        td.style.padding = 'var(--space-3)';
        td.textContent = 'No rows match this filter.';
        ph.appendChild(td);
        tbody.appendChild(ph);
      } else if (ph && (!noMatch || hasQuery)) {
        ph.remove();
      }
    });
  }

  function wireSearch(rows, getActive) {
    var input = document.getElementById('objects-search');
    if (!input) return function () {};
    var current = '';
    input.addEventListener('input', function () {
      current = input.value;
      applyAllFilters(rows, getActive(), current);
    });
    return function () { return current; };
  }

  function wireConfig() {
    var panel = document.getElementById('objects-config-panel');
    if (!panel) return;
    // Build the list of toggleable columns from the first table's thead.
    var firstThead = document.querySelector('.object-block table.db-table thead tr');
    if (!firstThead) return;
    // Title (col 0) and Description (col 1) are always visible — they're
    // the primary content. The config panel only toggles the metadata
    // columns: Type, Kind, Field, Required, Overlays, Affordance.
    var ALWAYS_VISIBLE = new Set([0, 1]);
    var cols = Array.prototype.slice.call(firstThead.cells)
      .map(function (th, i) {
        return { index: i, label: (th.textContent || '').trim() || ('Column ' + (i + 1)) };
      })
      .filter(function (c) { return !ALWAYS_VISIBLE.has(c.index); });
    var hidden = new Set();

    panel.innerHTML = '';
    var section = el('div', { 'class': 'db-filter-section' });
    section.appendChild(el('div', { 'class': 'db-filter-heading' }, 'Visible columns'));
    cols.forEach(function (col) {
      var label = el('label', { 'class': 'db-filter-option' });
      var cb = el('input', { 'type': 'checkbox' });
      cb.checked = true;
      cb.addEventListener('change', function () {
        if (cb.checked) hidden.delete(col.index);
        else            hidden.add(col.index);
        applyColumnVisibility(hidden);
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' ' + col.label));
      section.appendChild(label);
    });
    panel.appendChild(section);
  }

  function applyColumnVisibility(hiddenIdxs) {
    document.querySelectorAll('.object-block table.db-table').forEach(function (tbl) {
      var heads = tbl.querySelectorAll('thead th');
      heads.forEach(function (th, i) {
        th.style.display = hiddenIdxs.has(i) ? 'none' : '';
      });
      var bodyRows = tbl.querySelectorAll('tbody tr');
      bodyRows.forEach(function (tr) {
        Array.prototype.slice.call(tr.cells).forEach(function (td, i) {
          td.style.display = hiddenIdxs.has(i) ? 'none' : '';
        });
      });
    });
  }

  window.mountLeafTable = function (opts) {
    opts = opts || {};
    var btn   = document.getElementById(opts.filterButtonId);
    var badge = document.getElementById(opts.filterCountId);

    // Search runs on EVERY row, including ones with no overlay metadata.
    var allRows = Array.prototype.slice.call(document.querySelectorAll('table.db-table tbody tr[data-leaf-path]'));
    var facets  = gatherFacets(allRows);

    // Per-facet active set.
    var active = {
      overlay:    new Set(),
      type:       new Set(),
      kind:       new Set(),
      required:   new Set(),
      affordance: new Set(),
    };

    var getSearchText = wireSearch(allRows, function () { return active; });
    wireConfig();

    if (!btn) return;

    function totalActive() {
      return Object.keys(active).reduce(function (n, k) { return n + active[k].size; }, 0);
    }
    function updateBadge() {
      if (!badge) return;
      var n = totalActive();
      if (n > 0) {
        badge.textContent = String(n);
        badge.hidden = false;
        btn.classList.add('is-active');
      } else {
        badge.hidden = true;
        btn.classList.remove('is-active');
      }
    }

    function onCheckboxChange(facetKey, value, checked) {
      if (facetKey === null) {
        Object.keys(active).forEach(function (k) { active[k].clear(); });
      } else if (checked) {
        active[facetKey].add(value);
      } else {
        active[facetKey].delete(value);
      }
      applyAllFilters(allRows, active, getSearchText());
      updateBadge();
    }

    buildPanel(facets, onCheckboxChange);
    // Open / close / positioning / outside-click / ESC / focus are all
    // handled by <el-popover> + the native popovertarget attribute.
  };
})();
