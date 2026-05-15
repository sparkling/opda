/* OPDA Knowledge Base — data-browser.js
 *
 * Reusable vanilla-JS table component with:
 *   • full-text search (debounced) across configured fields
 *   • multi-facet checkbox filters
 *   • column visibility toggle
 *   • click-header sorting (asc/desc/off)
 *   • client-side pagination
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

  // Shared panel open/close helpers
  function openPanel(btn, panel, positionFn) {
    positionFn();
    panel.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function closePanel(btn, panel) {
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  function mount(opts) {
    const root = typeof opts.mount === 'string' ? $(opts.mount) : opts.mount;
    if (!root) { console.error('[DataBrowser] mount target not found:', opts.mount); return; }

    const data        = Array.isArray(opts.data) ? opts.data : [];
    const columns     = opts.columns || [];
    const searchKeys  = opts.searchKeys || columns.map(c => c.key);
    const facets      = opts.facets || [];
    const pageSizeOptions = opts.pageSizeOptions || [25, 50, 100, 200, 500];
    let pageSize      = opts.pageSize || 50;
    const empty       = opts.emptyMessage || 'No matching rows.';

    const state = {
      search: '',
      filters: {},          // facet key → Set of selected values (empty Set = all)
      sort: opts.defaultSort ? { ...opts.defaultSort } : null,
      page: 1,
      hiddenColumns: new Set(),
    };

    facets.forEach(f => { state.filters[f.key] = new Set(); });

    function visibleCols() {
      return columns.filter(c => !state.hiddenColumns.has(c.key));
    }

    // ── Build DOM skeleton ───────────────────────────────────────
    root.classList.add('data-browser');
    root.innerHTML = '';

    // Toolbar
    const toolbar = el('div', { class: 'db-toolbar' });

    // Search field
    const searchField = el('div', { class: 'db-field db-field--grow' });
    const searchLabelId = 'db-search-' + uid();
    const searchInput = el('input', { id: searchLabelId,
      type: 'search',
      class: 'db-input',
      placeholder: opts.searchPlaceholder || 'Type to filter…',
      'aria-label': 'Search',
    });
    searchField.appendChild(searchInput);

    const searchGroup = el('div', { class: 'db-search-group' });
    searchGroup.appendChild(searchField);
    toolbar.appendChild(searchGroup);

    // ── Filter button ────────────────────────────────────────────
    const filterWrap = el('div', { class: 'db-filter-wrap' });
    const filterIcon = '<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>';
    const filterBtn = el('button', { type: 'button', class: 'db-filter-btn', 'aria-expanded': 'false', title: 'Filter' });
    filterBtn.innerHTML = filterIcon + '<span class="db-filter-badge" hidden>0</span>';
    const filterPanel = el('div', { class: 'db-filter-panel', role: 'dialog', 'aria-label': 'Filter options' });

    const facetCheckboxes = {};

    function updateFilterBadge() {
      const count = facets.filter(f => state.filters[f.key].size > 0).length;
      const badge = filterBtn.querySelector('.db-filter-badge');
      if (!badge) return;
      badge.textContent = count;
      badge.hidden = count === 0;
      filterBtn.classList.toggle('is-active', count > 0);
    }

    const filterCols = el('div', { class: 'db-filter-cols' });
    const filterColLeft  = el('div', { class: 'db-filter-col' });
    const filterColRight = el('div', { class: 'db-filter-col' });
    filterCols.appendChild(filterColLeft);
    filterCols.appendChild(filterColRight);
    filterPanel.appendChild(filterCols);

    facets.forEach((f, i) => {
      const section = el('div', { class: 'db-filter-section' });
      section.appendChild(el('div', { class: 'db-filter-heading' }, escapeHtml(f.label)));
      const values = uniqueValues(data, f.key);
      const checks = [];
      values.forEach(v => {
        const optLabel = el('label', { class: 'db-filter-option' });
        const cb = el('input', { type: 'checkbox', value: v });
        cb.addEventListener('change', () => {
          if (cb.checked) state.filters[f.key].add(v);
          else state.filters[f.key].delete(v);
          state.page = 1;
          rerender();
          updateFilterBadge();
        });
        optLabel.appendChild(cb);
        const displayName = f.valueLabels && f.valueLabels[v];
        const labelSpan = el('span');
        if (displayName) {
          labelSpan.innerHTML = ' ' + escapeHtml(displayName) +
            ' <span class="db-filter-option-key">[' + escapeHtml(v) + ']</span>';
        } else {
          labelSpan.textContent = ' ' + v.charAt(0).toUpperCase() + v.slice(1);
        }
        optLabel.appendChild(labelSpan);
        checks.push(cb);
        section.appendChild(optLabel);
      });
      facetCheckboxes[f.key] = checks;
      (i === 0 ? filterColLeft : filterColRight).appendChild(section);
    });

    const resetBtn = el('button', { class: 'db-reset', type: 'button' }, 'Reset filters');
    resetBtn.addEventListener('click', () => {
      state.search = '';
      searchInput.value = '';
      facets.forEach(f => {
        state.filters[f.key] = new Set();
        (facetCheckboxes[f.key] || []).forEach(cb => { cb.checked = false; });
      });
      state.sort = opts.defaultSort ? { ...opts.defaultSort } : null;
      state.page = 1;
      rerender();
      updateFilterBadge();
    });
    filterPanel.appendChild(el('div', { class: 'db-filter-sep' }));
    filterPanel.appendChild(resetBtn);

    filterWrap.appendChild(filterBtn);
    filterWrap.appendChild(filterPanel);
    searchGroup.appendChild(filterWrap);

    // ── Config button ────────────────────────────────────────────
    const configWrap = el('div', { class: 'db-filter-wrap' });
    const cogIcon = '<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.892 3.433-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.892-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.465l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg>';
    const configBtn = el('button', { type: 'button', class: 'db-filter-btn', 'aria-expanded': 'false', title: 'Columns' });
    configBtn.innerHTML = cogIcon;
    const configPanel = el('div', { class: 'db-filter-panel', role: 'dialog', 'aria-label': 'Column options' });
    configPanel.style.minWidth = '14rem';

    const configSection = el('div', { class: 'db-filter-section' });
    configSection.appendChild(el('div', { class: 'db-filter-heading' }, 'Visible columns'));
    columns.forEach(col => {
      const optLabel = el('label', { class: 'db-filter-option' });
      const cb = el('input', { type: 'checkbox' });
      cb.checked = true;
      cb.addEventListener('change', () => {
        if (cb.checked) state.hiddenColumns.delete(col.key);
        else state.hiddenColumns.add(col.key);
        rerender();
      });
      optLabel.appendChild(cb);
      optLabel.appendChild(document.createTextNode(' ' + col.label));
      configSection.appendChild(optLabel);
    });
    configPanel.appendChild(configSection);

    configWrap.appendChild(configBtn);
    configWrap.appendChild(configPanel);
    searchGroup.appendChild(configWrap);

    // Count
    const countEl = el('span', { class: 'db-inline-count' });
    toolbar.appendChild(countEl);
    root.appendChild(toolbar);

    // ── Panel positioning & interaction ──────────────────────────
    function positionAt(btn, panel) {
      const rect = btn.getBoundingClientRect();
      panel.style.top = (rect.bottom + 6) + 'px';
      panel.style.left = rect.left + 'px';
    }

    filterBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (filterPanel.classList.contains('is-open')) {
        closePanel(filterBtn, filterPanel);
      } else {
        closePanel(configBtn, configPanel);
        openPanel(filterBtn, filterPanel, () => positionAt(filterBtn, filterPanel));
      }
    });

    configBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (configPanel.classList.contains('is-open')) {
        closePanel(configBtn, configPanel);
      } else {
        closePanel(filterBtn, filterPanel);
        openPanel(configBtn, configPanel, () => positionAt(configBtn, configPanel));
      }
    });

    document.addEventListener('click', function (e) {
      if (!filterWrap.contains(e.target)) closePanel(filterBtn, filterPanel);
      if (!configWrap.contains(e.target))  closePanel(configBtn, configPanel);
    });

    window.addEventListener('scroll', function () {
      if (filterPanel.classList.contains('is-open')) positionAt(filterBtn, filterPanel);
      if (configPanel.classList.contains('is-open'))  positionAt(configBtn, configPanel);
    }, { passive: true, capture: true });

    window.addEventListener('resize', function () {
      closePanel(filterBtn, filterPanel);
      closePanel(configBtn, configPanel);
    });

    // ── Summary ──────────────────────────────────────────────────
    const summary = el('div', { class: 'db-summary' });
    root.appendChild(summary);

    // ── Table ────────────────────────────────────────────────────
    const tableWrap = el('div', { class: 'db-table-wrap' });
    const anyWidth = columns.some(c => c.width);
    const table = el('table', { class: 'db-table' + (anyWidth ? ' db-table--fixed' : '') });
    const colgroup = el('colgroup');
    table.appendChild(colgroup);
    const thead = el('thead');
    const headerRow = el('tr');
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = el('tbody');
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    root.appendChild(tableWrap);

    const pagination = el('div', { class: 'db-pagination' });
    root.appendChild(pagination);

    // ── Search handler ───────────────────────────────────────────
    searchInput.addEventListener('input', debounce(e => {
      state.search = (e.target.value || '').trim().toLowerCase();
      state.page = 1;
      rerender();
    }, 150));

    // ── Compute pipeline ─────────────────────────────────────────
    function applyFilters() {
      const q = state.search;
      const filters = state.filters;
      const filterKeys = Object.keys(filters).filter(k => filters[k].size > 0);
      return data.filter(row => {
        for (const k of filterKeys) {
          const want = filters[k];
          const have = row[k];
          if (Array.isArray(have)) { if (!have.some(x => want.has(x))) return false; }
          else if (!want.has(have)) { return false; }
        }
        if (q) {
          let hit = false;
          for (const k of searchKeys) {
            const v = row[k];
            if (v == null) continue;
            if (Array.isArray(v)) {
              if (v.some(x => String(x).toLowerCase().includes(q))) { hit = true; break; }
            } else if (String(v).toLowerCase().includes(q)) { hit = true; break; }
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

    // ── Render ───────────────────────────────────────────────────
    function renderHeader() {
      const cols = visibleCols();
      colgroup.innerHTML = '';
      if (anyWidth) {
        cols.forEach(col => {
          const c = el('col');
          if (col.width) c.style.width = col.width;
          colgroup.appendChild(c);
        });
      }
      headerRow.innerHTML = '';
      cols.forEach(col => {
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
            if (!state.sort || state.sort.key !== col.key)  state.sort = { key: col.key, dir: 'asc' };
            else if (state.sort.dir === 'asc')              state.sort = { key: col.key, dir: 'desc' };
            else                                            state.sort = null;
            state.page = 1;
            rerender();
          });
        }
        headerRow.appendChild(th);
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
      const cols = visibleCols();
      tbody.innerHTML = '';
      if (!rows.length) {
        const tr = el('tr');
        tr.appendChild(el('td', { colspan: cols.length, class: 'db-empty' }, escapeHtml(empty)));
        tbody.appendChild(tr);
        return;
      }
      const frag = document.createDocumentFragment();
      rows.forEach(row => {
        const tr = el('tr');
        cols.forEach(col => {
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
      const effectivePageSize = pageSize === Infinity ? Math.max(total, 1) : pageSize;
      const pages = Math.max(1, Math.ceil(total / effectivePageSize));
      if (state.page > pages) state.page = pages;
      const start = total === 0 ? 0 : (state.page - 1) * effectivePageSize + 1;
      const end   = Math.min(total, state.page * effectivePageSize);
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

      // Page-size selector
      const sizeWrap = el('div', { class: 'db-page-size' });
      sizeWrap.appendChild(el('label', { for: 'db-page-size-select' }, 'Rows per page:'));
      const select = el('select', { id: 'db-page-size-select' });
      pageSizeOptions.forEach(n => {
        const opt = el('option', { value: String(n) }, String(n));
        if (n === pageSize) opt.selected = true;
        select.appendChild(opt);
      });
      const allOpt = el('option', { value: 'all' }, 'All');
      if (pageSize === Infinity) allOpt.selected = true;
      select.appendChild(allOpt);
      select.addEventListener('change', () => {
        pageSize = select.value === 'all' ? Infinity : parseInt(select.value, 10);
        state.page = 1;
        rerender();
      });
      sizeWrap.appendChild(select);
      pagination.appendChild(sizeWrap);
    }

    function renderSummary(filteredCount) {
      countEl.textContent = filteredCount.toLocaleString() + ' / ' + data.length.toLocaleString();
      const activeFilters = facets
        .filter(f => state.filters[f.key].size > 0)
        .map(f => '<strong>' + escapeHtml(f.label) + '</strong>: ' +
          Array.from(state.filters[f.key]).map(escapeHtml).join(', '));
      const bits = [];
      if (state.search) bits.push('search: <code>' + escapeHtml(state.search) + '</code>');
      if (activeFilters.length) bits.push(activeFilters.join(' · '));
      summary.innerHTML = bits.join(' &nbsp;·&nbsp; ');
      summary.style.display = bits.length ? '' : 'none';
    }

    function rerender() {
      const filtered = applyFilters();
      const sorted   = applySort(filtered);
      const pageRows = pageSize === Infinity
        ? sorted
        : sorted.slice((state.page - 1) * pageSize, state.page * pageSize);
      renderHeader();
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
