/* OPDA Knowledge Base — data-browser.js
 *
 * Reusable vanilla-JS table component with:
 *   • full-text search (debounced) across configured fields
 *   • multi-facet dropdown filters
 *   • click-header sorting (asc/desc/off)
 *   • client-side pagination
 *
 * Usage:
 *   OPDA.DataBrowser.mount({
 *     mount: '#browser',                  // selector or element
 *     data: window.OPDA_PROPERTIES,       // array of plain objects
 *     columns: [
 *       { key:'path',   label:'Path',   sortable:true, render:(v)=>`<code>${v}</code>` },
 *       { key:'name',   label:'Name',   sortable:true },
 *       …
 *     ],
 *     searchKeys: ['path','name','title'],
 *     facets: [
 *       { key:'context', label:'Bounded context' },
 *       { key:'source',  label:'Source schema'  },
 *       { key:'type',    label:'JSON type'      },
 *     ],
 *     defaultSort: { key:'path', dir:'asc' },
 *     pageSize: 50,
 *   });
 */

(function () {
  'use strict';
  if (!window.OPDA) window.OPDA = {};

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  }
  function debounce(fn, ms) {
    let t = null;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  }
  function uniqueValues(rows, key) {
    const set = new Set();
    rows.forEach(r => {
      const v = r[key];
      if (v == null || v === '') return;
      if (Array.isArray(v)) v.forEach(x => set.add(x));
      else set.add(v);
    });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }

  function mount(opts) {
    const root = typeof opts.mount === 'string' ? $(opts.mount) : opts.mount;
    if (!root) { console.error('[DataBrowser] mount target not found:', opts.mount); return; }

    const data        = Array.isArray(opts.data) ? opts.data : [];
    const columns     = opts.columns || [];
    const searchKeys  = opts.searchKeys || columns.map(c => c.key);
    const facets      = opts.facets || [];
    const pageSize    = opts.pageSize || 50;
    const empty       = opts.emptyMessage || 'No matching rows.';

    const state = {
      search: '',
      filters: {},      // facet key → selected value ('' means All)
      sort: opts.defaultSort ? { ...opts.defaultSort } : null,
      page: 1,
    };

    // Initialise empty facet filters
    facets.forEach(f => { state.filters[f.key] = ''; });

    // Build DOM skeleton
    root.classList.add('data-browser');
    root.innerHTML = '';

    // Toolbar
    const toolbar = el('div', { class: 'db-toolbar' });
    // Search
    const searchField = el('div', { class: 'db-field db-field--grow' });
    searchField.appendChild(el('label', { for: 'db-search-' + uid() }, 'Search'));
    const searchInput = el('input', {
      type: 'search',
      class: 'db-input',
      placeholder: opts.searchPlaceholder || 'Type to filter…',
      'aria-label': 'Search',
    });
    searchField.appendChild(searchInput);
    toolbar.appendChild(searchField);

    // Facets
    const facetSelects = {};
    facets.forEach(f => {
      const field = el('div', { class: 'db-field' });
      field.appendChild(el('label', null, escapeHtml(f.label)));
      const sel = el('select', { class: 'db-select', 'aria-label': f.label });
      const values = uniqueValues(data, f.key);
      sel.appendChild(el('option', { value: '' }, 'All' + (values.length ? ' (' + values.length + ')' : '')));
      values.forEach(v => sel.appendChild(el('option', { value: v }, escapeHtml(v))));
      sel.addEventListener('change', () => {
        state.filters[f.key] = sel.value;
        state.page = 1;
        rerender();
      });
      field.appendChild(sel);
      facetSelects[f.key] = sel;
      toolbar.appendChild(field);
    });

    // Reset
    const resetBtn = el('button', { class: 'db-reset', type: 'button' }, 'Reset');
    resetBtn.addEventListener('click', () => {
      state.search = '';
      searchInput.value = '';
      facets.forEach(f => { state.filters[f.key] = ''; facetSelects[f.key].value = ''; });
      state.sort = opts.defaultSort ? { ...opts.defaultSort } : null;
      state.page = 1;
      rerender();
    });
    toolbar.appendChild(resetBtn);
    root.appendChild(toolbar);

    // Summary
    const summary = el('div', { class: 'db-summary' });
    root.appendChild(summary);

    // Table
    const tableWrap = el('div', { class: 'db-table-wrap' });
    const anyWidth = columns.some(c => c.width);
    const table = el('table', { class: 'db-table' + (anyWidth ? ' db-table--fixed' : '') });

    // <colgroup> with widths drives the column layout when fixed-layout is on.
    if (anyWidth) {
      const colgroup = el('colgroup');
      columns.forEach(col => {
        const c = el('col');
        if (col.width) c.style.width = col.width;
        colgroup.appendChild(c);
      });
      table.appendChild(colgroup);
    }

    const thead = el('thead');
    const headerRow = el('tr');
    columns.forEach(col => {
      const th = el('th', {
        scope: 'col',
        class: (col.sortable ? 'sortable' : '') +
               (col.align ? ' align-' + col.align : '') +
               (col.cellClass ? ' ' + col.cellClass + '-head' : ''),
        'data-key': col.key,
      });
      th.innerHTML = escapeHtml(col.label) +
        (col.sortable ? ' <span class="sort-indicator">↕</span>' : '');
      if (col.sortable) {
        th.addEventListener('click', () => {
          if (!state.sort || state.sort.key !== col.key)      state.sort = { key: col.key, dir: 'asc' };
          else if (state.sort.dir === 'asc')                  state.sort = { key: col.key, dir: 'desc' };
          else                                                state.sort = null;
          state.page = 1;
          rerender();
        });
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = el('tbody');
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    root.appendChild(tableWrap);

    // Pagination
    const pagination = el('div', { class: 'db-pagination' });
    root.appendChild(pagination);

    // Search input handler (debounced)
    searchInput.addEventListener('input', debounce(e => {
      state.search = (e.target.value || '').trim().toLowerCase();
      state.page = 1;
      rerender();
    }, 150));

    // ── Compute pipeline ────────────────────────────────────────
    function applyFilters() {
      const q = state.search;
      const filters = state.filters;
      const filterKeys = Object.keys(filters).filter(k => filters[k] !== '');

      return data.filter(row => {
        // Facet filters
        for (const k of filterKeys) {
          const want = filters[k];
          const have = row[k];
          if (Array.isArray(have)) { if (!have.includes(want)) return false; }
          else if (have !== want)  { return false; }
        }
        // Search
        if (q) {
          let hit = false;
          for (const k of searchKeys) {
            const v = row[k];
            if (v == null) continue;
            if (Array.isArray(v)) {
              if (v.some(x => String(x).toLowerCase().includes(q))) { hit = true; break; }
            } else if (String(v).toLowerCase().includes(q)) {
              hit = true; break;
            }
          }
          if (!hit) return false;
        }
        return true;
      });
    }
    function applySort(rows) {
      if (!state.sort) return rows;
      const { key, dir } = state.sort;
      const mul = dir === 'desc' ? -1 : 1;
      return rows.slice().sort((a, b) => {
        const av = a[key], bv = b[key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mul;
        return String(av).localeCompare(String(bv), 'en', { sensitivity:'base' }) * mul;
      });
    }

    function renderHeaderSortIndicators() {
      headerRow.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        const ind = th.querySelector('.sort-indicator');
        if (!th.classList.contains('sortable')) return;
        if (!state.sort || state.sort.key !== th.getAttribute('data-key')) {
          if (ind) ind.textContent = '↕';
          return;
        }
        if (state.sort.dir === 'asc')  { th.classList.add('sort-asc');  if (ind) ind.textContent = '▲'; }
        if (state.sort.dir === 'desc') { th.classList.add('sort-desc'); if (ind) ind.textContent = '▼'; }
      });
    }

    function renderBody(rows) {
      tbody.innerHTML = '';
      if (!rows.length) {
        const tr = el('tr');
        const td = el('td', { colspan: columns.length, class: 'db-empty' }, escapeHtml(empty));
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      const frag = document.createDocumentFragment();
      rows.forEach(row => {
        const tr = el('tr');
        columns.forEach(col => {
          const cls = (col.cellClass ? col.cellClass : '') +
                      (col.align ? ' align-' + col.align : '') +
                      (col.truncate ? ' db-cell--truncate' : '');
          const td = el('td', cls ? { class: cls.trim() } : null);
          const v = row[col.key];
          if (typeof col.render === 'function') {
            td.innerHTML = col.render(v, row);
          } else if (v == null || v === '') {
            td.innerHTML = '<span class="muted tiny">—</span>';
          } else if (Array.isArray(v)) {
            td.innerHTML = v.map(x => '<span class="enum-pill">' + escapeHtml(x) + '</span>').join('');
          } else {
            td.textContent = String(v);
          }
          if (col.truncate && !td.getAttribute('title')) {
            // Best-effort hover title for truncated content
            const txt = (td.textContent || '').trim();
            if (txt && txt !== '—') td.setAttribute('title', txt);
          }
          tr.appendChild(td);
        });
        frag.appendChild(tr);
      });
      tbody.appendChild(frag);
    }

    function renderPagination(total) {
      const pages = Math.max(1, Math.ceil(total / pageSize));
      if (state.page > pages) state.page = pages;
      const start = total === 0 ? 0 : (state.page - 1) * pageSize + 1;
      const end   = Math.min(total, state.page * pageSize);

      pagination.innerHTML = '';
      const info = el('div', { class: 'db-page-info' });
      info.innerHTML = total === 0
        ? '<strong>0</strong> rows'
        : 'Showing <strong>' + start.toLocaleString() + '</strong>–<strong>' +
          end.toLocaleString() + '</strong> of <strong>' + total.toLocaleString() + '</strong>';
      pagination.appendChild(info);

      const controls = el('div', { class: 'db-page-controls' });
      function pgBtn(label, page, opts2) {
        const o = opts2 || {};
        const b = el('button', { type: 'button' }, label);
        if (o.current) b.classList.add('current');
        if (o.disabled) b.disabled = true;
        b.addEventListener('click', () => { state.page = page; rerender(); });
        return b;
      }
      controls.appendChild(pgBtn('«', 1,            { disabled: state.page <= 1 }));
      controls.appendChild(pgBtn('‹', state.page-1, { disabled: state.page <= 1 }));

      // Page-number window
      const win = 2;
      const startP = Math.max(1, state.page - win);
      const endP   = Math.min(pages, state.page + win);
      if (startP > 1) {
        controls.appendChild(pgBtn('1', 1));
        if (startP > 2) controls.appendChild(el('span', { class: 'muted tiny' }, '…'));
      }
      for (let p = startP; p <= endP; p++) {
        controls.appendChild(pgBtn(String(p), p, { current: p === state.page }));
      }
      if (endP < pages) {
        if (endP < pages - 1) controls.appendChild(el('span', { class: 'muted tiny' }, '…'));
        controls.appendChild(pgBtn(String(pages), pages));
      }
      controls.appendChild(pgBtn('›', state.page+1, { disabled: state.page >= pages }));
      controls.appendChild(pgBtn('»', pages,        { disabled: state.page >= pages }));
      pagination.appendChild(controls);
    }

    function renderSummary(filteredCount) {
      const activeFilters = facets
        .filter(f => state.filters[f.key])
        .map(f => '<strong>' + escapeHtml(f.label) + '</strong>: ' + escapeHtml(state.filters[f.key]));
      const bits = [];
      bits.push('<strong>' + filteredCount.toLocaleString() + '</strong> of <strong>' +
                data.length.toLocaleString() + '</strong> ' + (opts.itemLabel || 'rows'));
      if (state.search) bits.push('search: <code>' + escapeHtml(state.search) + '</code>');
      if (activeFilters.length) bits.push(activeFilters.join(' · '));
      summary.innerHTML = bits.join(' &nbsp;·&nbsp; ');
    }

    function rerender() {
      const filtered = applyFilters();
      const sorted   = applySort(filtered);
      const start = (state.page - 1) * pageSize;
      const pageRows = sorted.slice(start, start + pageSize);
      renderHeaderSortIndicators();
      renderBody(pageRows);
      renderPagination(sorted.length);
      renderSummary(filtered.length);
    }

    rerender();
    return { rerender, state };
  }

  let _uid = 0;
  function uid() { return ++_uid; }

  window.OPDA.DataBrowser = { mount };
})();
