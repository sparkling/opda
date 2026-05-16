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

  function gatherOverlayCounts(rows) {
    var counts = Object.create(null);
    rows.forEach(function (tr) {
      var raw = tr.getAttribute('data-overlays') || '';
      if (!raw) return;
      raw.split(',').forEach(function (k) {
        k = k.trim();
        if (k) counts[k] = (counts[k] || 0) + 1;
      });
    });
    return Object.keys(counts).sort().map(function (k) {
      return { key: k, count: counts[k] };
    });
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

  function positionPanel(btn, panel) {
    var rect = btn.getBoundingClientRect();
    panel.style.top  = (rect.bottom + 6) + 'px';
    panel.style.left = Math.max(8, rect.left) + 'px';
    // Constrain width when near the viewport's right edge.
    var maxRight = window.innerWidth - 16;
    var width = Math.min(panel.offsetWidth || 480, maxRight - rect.left);
    panel.style.width = width + 'px';
  }

  function buildPanel(overlays, btn, badge, onChange) {
    var panel = el('div', {
      'class':      'db-filter-panel',
      'id':         'filter-overlay-panel',
      'role':       'dialog',
      'aria-label': 'Filter by overlay',
    });

    var heading = el('div', { 'class': 'db-filter-section' });
    heading.appendChild(el('div', { 'class': 'db-filter-heading' }, 'Overlays referenced on this page'));

    var checkboxes = [];
    overlays.forEach(function (o) {
      var label = el('label', { 'class': 'db-filter-option' });
      var cb = el('input', { 'type': 'checkbox', 'value': o.key });
      cb.addEventListener('change', function () { onChange(cb); });
      label.appendChild(cb);
      var span = document.createElement('span');
      // Proper name first, then uppercase key in muted parens, then count.
      // The .db-filter-option-key class already applies muted color +
      // uppercase transform via design-system.css.
      span.innerHTML =
        ' ' + overlayLabel(o.key) +
        ' <span class="db-filter-option-key">(' + o.key + ')</span>' +
        ' <span class="db-filter-option-count">' + o.count + '</span>';
      label.appendChild(span);
      heading.appendChild(label);
      checkboxes.push(cb);
    });

    panel.appendChild(heading);
    panel.appendChild(el('div', { 'class': 'db-filter-sep' }));

    var reset = el('button', { 'class': 'db-reset', 'type': 'button' }, 'Clear');
    reset.addEventListener('click', function () {
      checkboxes.forEach(function (cb) { cb.checked = false; });
      onChange(null);
    });
    panel.appendChild(reset);

    document.body.appendChild(panel);
    return { panel: panel, checkboxes: checkboxes };
  }

  window.mountLeafTable = function (opts) {
    opts = opts || {};
    var btn   = document.getElementById(opts.filterButtonId);
    var badge = document.getElementById(opts.filterCountId);
    if (!btn) return;

    var rows = rowsWithOverlays();
    var overlays = gatherOverlayCounts(rows);
    if (!overlays.length) {
      btn.setAttribute('disabled', 'disabled');
      btn.title = 'No overlays referenced on this page';
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      return;
    }

    var active = new Set();

    function updateBadge() {
      if (active.size > 0) {
        badge.textContent = String(active.size);
        badge.hidden = false;
        btn.classList.add('is-active');
      } else {
        badge.hidden = true;
        btn.classList.remove('is-active');
      }
    }

    function onCheckboxChange(cb) {
      if (cb) {
        if (cb.checked) active.add(cb.value);
        else            active.delete(cb.value);
      } else {
        active.clear();
      }
      applyFilter(rows, active);
      updateBadge();
    }

    var built = buildPanel(overlays, btn, badge, onCheckboxChange);
    var panel = built.panel;

    function openPanel()  { positionPanel(btn, panel); panel.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    function closePanel() { panel.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('is-open')) closePanel();
      else openPanel();
    });

    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('is-open')) return;
      if (panel.contains(e.target)) return;
      if (btn.contains(e.target)) return;
      closePanel();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });

    window.addEventListener('resize', function () {
      if (panel.classList.contains('is-open')) positionPanel(btn, panel);
    });
    window.addEventListener('scroll', function () {
      if (panel.classList.contains('is-open')) positionPanel(btn, panel);
    }, { passive: true });
  };
})();
