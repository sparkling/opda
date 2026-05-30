/* OPDA Knowledge Base — client.js
 *
 * Per-page interactivity. The page chrome (header, sidebar, breadcrumbs,
 * page-footer) is now rendered at build time by Astro components — this
 * file only wires up the bits that genuinely need DOM events.
 *
 * Replaces public/ui/site.js. The build-time-renderable functions
 * (renderHeader, renderSidebar, mountChrome, SECTIONS, REFERENCE_ITEMS)
 * moved to Astro components and src/lib/site.ts.
 *
 * What stays runtime-only:
 *   • Theme toggle button (reads/writes localStorage, applies data-theme)
 *   • Sidebar collapse toggle (localStorage persistence)
 *   • Tree folder expand/collapse (sidebar nested groups)
 *   • Mobile menu toggle
 *   • TOC rendering + IntersectionObserver active-section tracking
 *   • Heading-anchor injection
 *   • Mermaid lazy load + theme integration + ResizeObserver (re-render on resize)
 *   • Diagram lightbox (zoom / pan / fullscreen) — zoom-icon button top-right of every diagram
 *   • ER diagram entity click navigation — manifest-driven (diagram-links.json)
 *   • Flowchart / graph / class / state node click navigation via same manifest
 *   • Mis-render correction (re-render SVGs narrower than 60% of container)
 */

(function () {
  'use strict';

  // ── Theme toggle ─────────────────────────────────────────────────────────
  function bindThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('opda-theme', next); } catch (e) {}
      restartMermaid();
    });
  }

  // ── Sidebar interactions ─────────────────────────────────────────────────
  function bindSidebar() {
    const appBody = document.querySelector('.app-body');
    const aside = document.getElementById('app-sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarCollapse = document.getElementById('sidebar-collapse');

    // Restore persisted collapse states
    if (appBody) {
      try {
        if (localStorage.getItem('opda-sidebar-collapsed') === '1') {
          appBody.classList.add('sidebar-collapsed');
        }
        if (localStorage.getItem('opda-toc-collapsed') === '1') {
          appBody.classList.add('toc-collapsed');
        }
      } catch (e) {}
    }

    // Mobile menu toggle
    if (menuToggle && aside) {
      menuToggle.addEventListener('click', function () { aside.classList.toggle('open'); });
      aside.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { aside.classList.remove('open'); });
      });
    }

    // Desktop sidebar collapse
    if (sidebarCollapse && appBody) {
      sidebarCollapse.addEventListener('click', function () {
        const nowCollapsed = !appBody.classList.contains('sidebar-collapsed');
        appBody.classList.toggle('sidebar-collapsed', nowCollapsed);
        try { localStorage.setItem('opda-sidebar-collapsed', nowCollapsed ? '1' : '0'); } catch (e) {}
        sidebarCollapse.setAttribute('aria-label',
          nowCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
        sidebarCollapse.setAttribute('title',
          nowCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      });
    }

    // Tree folder expand/collapse
    if (aside) {
      aside.querySelectorAll('.tree-toggle').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const li = btn.closest('.tree-folder');
          if (!li) return;
          const opening = !li.classList.contains('is-open');
          li.classList.toggle('is-open', opening);
          btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
        });
      });
    }

    // Nav-group <details> persistence — remember per-section group open/closed state
    if (aside) {
      const nav = aside.querySelector('.sidebar-nav');
      const sectionKey = nav && nav.getAttribute('data-section');
      if (sectionKey) {
        aside.querySelectorAll('details.nav-group').forEach(function (det) {
          const groupName = det.getAttribute('data-group');
          if (!groupName) return;
          const storageKey = 'opda.sidebar.' + sectionKey + '.' + groupName;
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved === 'closed') det.open = false;
            else if (saved === 'open') det.open = true;
            // else: leave the SSR default (open) in place
          } catch (e) { /* localStorage may be blocked */ }
          det.addEventListener('toggle', function () {
            try { localStorage.setItem(storageKey, det.open ? 'open' : 'closed'); } catch (e) { /* ignore */ }
          });
        });
      }
    }
  }

  // ── Heading anchors ─────────────────────────────────────────────────────
  function enhanceHeadings() {
    document.querySelectorAll('.prose h2[id], .prose h3[id]').forEach(function (h) {
      if (h.querySelector('.heading-anchor')) return;
      const link = document.createElement('a');
      link.href = '#' + h.id;
      link.className = 'heading-anchor';
      link.setAttribute('aria-label', 'Permalink');
      link.textContent = '#';
      h.appendChild(link);
    });
  }

  // ── TOC widget ──────────────────────────────────────────────────────────
  function renderToc() {
    const article = document.querySelector('.prose');
    if (!article) return;
    const headings = article.querySelectorAll('h2[id], h3[id], h4[id]');

    const toc = document.createElement('aside');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'On this page');

    const tocToggle = document.createElement('button');
    tocToggle.type = 'button';
    tocToggle.className = 'rail-collapse-toggle';
    tocToggle.id = 'toc-collapse';
    tocToggle.setAttribute('aria-label', 'Collapse table of contents');
    tocToggle.title = 'Collapse table of contents';
    tocToggle.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="9 18 15 12 9 6"/>' +
      '</svg>';
    tocToggle.style.marginRight = 'auto';
    tocToggle.style.marginLeft = '0';
    toc.appendChild(tocToggle);

    const titleEl = document.createElement('div');
    titleEl.className = 'toc-title';
    titleEl.textContent = 'On this page';
    toc.appendChild(titleEl);

    const ul = document.createElement('ul');
    headings.forEach(function (h) {
      const li = document.createElement('li');
      li.className = 'toc-level-' + h.tagName.toLowerCase();
      const a = document.createElement('a');
      a.href = '#' + h.id;
      let label = '';
      for (let i = 0; i < h.childNodes.length; i++) {
        const n = h.childNodes[i];
        if (n.nodeType === 3) label += n.textContent;
        else if (n.nodeType === 1 && !n.classList.contains('heading-anchor')) {
          label += n.textContent;
        }
      }
      a.textContent = label.trim();
      a.setAttribute('data-toc-target', h.id);
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);

    const body = document.querySelector('.app-body');
    if (body) {
      body.appendChild(toc);
      body.classList.add('with-toc');
      try {
        if (localStorage.getItem('opda-toc-collapsed') === '1') {
          body.classList.add('toc-collapsed');
        }
      } catch (e) {}
    } else {
      article.insertBefore(toc, article.firstChild);
    }

    if (body) {
      tocToggle.addEventListener('click', function () {
        const nowCollapsed = !body.classList.contains('toc-collapsed');
        body.classList.toggle('toc-collapsed', nowCollapsed);
        try { localStorage.setItem('opda-toc-collapsed', nowCollapsed ? '1' : '0'); } catch (e) {}
        tocToggle.setAttribute('aria-label',
          nowCollapsed ? 'Expand table of contents' : 'Collapse table of contents');
        tocToggle.setAttribute('title',
          nowCollapsed ? 'Expand table of contents' : 'Collapse table of contents');
      });
    }

    if ('IntersectionObserver' in window) {
      const linkById = {};
      toc.querySelectorAll('a[data-toc-target]').forEach(function (a) {
        linkById[a.getAttribute('data-toc-target')] = a;
      });
      let lastActive = null;
      const observer = new IntersectionObserver(function (entries) {
        const visible = entries.filter(e => e.isIntersecting)
                               .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const top = visible[0].target.id;
        const link = linkById[top];
        if (!link || link === lastActive) return;
        if (lastActive) lastActive.classList.remove('active');
        link.classList.add('active');
        lastActive = link;
      }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  // ── Mermaid (lazy CDN load + theme integration) ─────────────────────────
  function ensureMermaid() {
    if (window.mermaid) return Promise.resolve();
    if (!document.querySelector('.mermaid')) return Promise.resolve();
    if (window.__mermaidLoading) return window.__mermaidLoading;
    window.__mermaidLoading = Promise.all([
      import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'),
      import('https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0/dist/mermaid-layout-elk.esm.min.mjs'),
    ]).then(function (mods) {
      var mermaid = mods[0].default;
      mermaid.registerLayoutLoaders(mods[1].default);
      window.mermaid = mermaid;
    }).catch(function (e) {
      throw new Error('Mermaid CDN failed to load: ' + e.message);
    });
    return window.__mermaidLoading;
  }

  function runMermaid() {
    return ensureMermaid().then(function () {
      if (!window.mermaid) return;
      return new Promise(function (resolve) {
        var done = false;
        function go() { if (done) return; done = true; _runMermaidInner(); resolve(); }
        requestAnimationFrame(function () { requestAnimationFrame(go); });
        setTimeout(go, 50);
      });
    }).catch(function (err) {
      console.warn('[OPDA] mermaid load failed:', err);
    });
  }

  function _runMermaidInner() {
    const themeAttr = document.documentElement.getAttribute('data-theme');
    const isDark = themeAttr === 'dark';
    const fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    const fontSize = '14px';
    const themeVars = isDark ? darkTheme() : lightTheme();
    themeVars.fontFamily = fontFamily;
    themeVars.fontSize = fontSize;
    injectInlineThemeDirective(themeVars, isDark);
    try {
      window.mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: themeVars, securityLevel: 'loose' });
      var runPromise = window.mermaid.run({ querySelector: '.mermaid' });
      if (runPromise && typeof runPromise.then === 'function') {
        runPromise.then(function () {
          fixErRowContrast(isDark);
          loadDiagramLinks().then(function () { scheduleEnhanceDiagrams(); });
          installMermaidResizeObserver();
        });
      } else {
        fixErRowContrast(isDark);
        loadDiagramLinks().then(function () { scheduleEnhanceDiagrams(); });
        installMermaidResizeObserver();
      }
    } catch (err) {
      console.warn('[OPDA] mermaid run failed:', err);
    }
  }

  // Mermaid 11's ER renderer paints alternating attribute-row backgrounds as
  // classless <path> fills and ignores attributeBackgroundColorOdd — so in dark
  // mode the "odd" rows stay light and the themed (light) HTML label text is
  // unreadable (white-on-white). No class or theme var can reach those paths, so
  // normalise each ER row background to the surface colour for the active theme
  // (by luminance) after render; the light label text then contrasts. Re-runs
  // with every render (initial + ResizeObserver) so it survives re-layout.
  function fixErRowContrast(isDark) {
    var rows = document.querySelectorAll('.mermaid g.node path');
    for (var i = 0; i < rows.length; i++) {
      var f = getComputedStyle(rows[i]).fill;
      var m = f && f.match(/\d+(?:\.\d+)?/g);
      if (!m || m.length < 3) continue;            // skip fill:none borders/edges
      var lum = 0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2];
      if (isDark && lum > 140) rows[i].style.setProperty('fill', '#2B2823', 'important');
      else if (!isDark && lum < 100) rows[i].style.setProperty('fill', '#FAF9F5', 'important');
    }
  }

  // ── Diagram click navigation (ADR-0022) ──────────────────────────────────

  /** Fetch the diagram-links manifest once; cache in window.__diagramLinks. */
  function loadDiagramLinks() {
    if (window.__diagramLinks) return Promise.resolve(window.__diagramLinks);
    return fetch('/data/diagram-links.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        window.__diagramLinks = (data && typeof data === 'object') ? data : {};
        return window.__diagramLinks;
      })
      .catch(function () { window.__diagramLinks = {}; return {}; });
  }

  // ── Diagram lightbox ─────────────────────────────────────────────────────
  // Fullscreen pan/zoom viewer. Opened by the per-diagram zoom-icon button.
  // Controls: wheel = zoom centred on cursor, drag = pan, dbl-click = fit/1:1,
  // Esc / × button / Close button = close, +/-/0/1 keys mirror the control bar.
  // Pinch + drag for touch.
  var openLightbox = null;

  function bindDiagramLightbox() {
    var overlay, canvas, label, content;
    var scale = 1, panX = 0, panY = 0;
    var isDragging = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;
    var natW = 0, natH = 0;
    var lastTouches = null;

    function build() {
      if (overlay) return;
      overlay = document.createElement('div');
      overlay.className = 'diagram-lightbox';
      overlay.innerHTML =
        '<button type="button" class="viewer-close" aria-label="Close (Esc)" title="Close (Esc)">&times;</button>' +
        '<div class="viewer-canvas"></div>' +
        '<div class="viewer-controls">' +
          '<button type="button" data-act="out" title="Zoom out (-)">&minus;</button>' +
          '<button type="button" data-act="fit" title="Fit to screen (0)">Fit</button>' +
          '<span class="viewer-zoom-label">100%</span>' +
          '<button type="button" data-act="in"  title="Zoom in (+)">+</button>' +
          '<button type="button" data-act="one" title="Actual size (1)">1:1</button>' +
        '</div>';
      document.body.appendChild(overlay);
      canvas = overlay.querySelector('.viewer-canvas');
      label  = overlay.querySelector('.viewer-zoom-label');
      overlay.querySelector('.viewer-close').addEventListener('click', close);
      overlay.querySelector('.viewer-controls').addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        var a = btn.getAttribute('data-act');
        if (a === 'out') zoom(-1);
        else if (a === 'in') zoom(1);
        else if (a === 'fit') reset();
        else if (a === 'one') setZoom(1);
      });
      canvas.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('dblclick', function () {
        if (Math.abs(scale - 1) < 0.01) reset(); else setZoom(1);
      });
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
      canvas.addEventListener('touchend',   onTouchEnd);
    }
    function update() {
      if (!content) return;
      content.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
      if (label) label.textContent = Math.round(scale * 100) + '%';
    }
    function open(svg) {
      build();
      canvas.querySelectorAll('.mermaid').forEach(function (m) { m.remove(); });
      var r = svg.getBoundingClientRect();
      natW = r.width  || 800;
      natH = r.height || 600;
      var wrap = document.createElement('div');
      wrap.className = 'mermaid';
      var clone = svg.cloneNode(true);
      clone.removeAttribute('width');
      clone.removeAttribute('height');
      clone.style.display = 'block';
      wrap.style.width  = natW + 'px';
      wrap.style.height = natH + 'px';
      wrap.appendChild(clone);
      canvas.appendChild(wrap);
      content = wrap;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(reset);
    }
    function close() {
      if (!overlay) return;
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if (canvas) canvas.querySelectorAll('.mermaid').forEach(function (m) { m.remove(); });
      content = null;
    }
    function reset() {
      if (!canvas || !content) return;
      var vw = canvas.clientWidth, vh = canvas.clientHeight;
      var fitScale = Math.min(vw / natW, vh / natH) * 0.95;
      scale = fitScale;
      panX  = (vw - natW * scale) / 2;
      panY  = (vh - natH * scale) / 2;
      update();
    }
    function zoom(dir) {
      var cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
      var factor = dir > 0 ? 1.25 : 0.8;
      var newScale = Math.min(Math.max(scale * factor, 0.05), 20);
      panX = cx - (cx - panX) * (newScale / scale);
      panY = cy - (cy - panY) * (newScale / scale);
      scale = newScale;
      update();
    }
    function setZoom(z) {
      var cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
      panX = cx - (cx - panX) * (z / scale);
      panY = cy - (cy - panY) * (z / scale);
      scale = z;
      update();
    }
    function onDown(e) {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      startPanX = panX; startPanY = panY;
      canvas.classList.add('dragging');
      e.preventDefault();
    }
    function onMove(e) {
      if (!isDragging) return;
      panX = startPanX + (e.clientX - startX);
      panY = startPanY + (e.clientY - startY);
      update();
    }
    function onUp() {
      isDragging = false;
      if (canvas) canvas.classList.remove('dragging');
    }
    function onWheel(e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      var factor = e.deltaY < 0 ? 1.15 : 0.87;
      var newScale = Math.min(Math.max(scale * factor, 0.05), 20);
      panX = mx - (mx - panX) * (newScale / scale);
      panY = my - (my - panY) * (newScale / scale);
      scale = newScale;
      update();
    }
    function onTouchStart(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        startPanX = panX; startPanY = panY;
      }
      lastTouches = Array.from(e.touches);
      e.preventDefault();
    }
    function onTouchMove(e) {
      if (e.touches.length === 1 && isDragging) {
        panX = startPanX + (e.touches[0].clientX - startX);
        panY = startPanY + (e.touches[0].clientY - startY);
        update();
      } else if (e.touches.length === 2 && lastTouches && lastTouches.length === 2) {
        var oldDist = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
        var newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        var factor = newDist / oldDist;
        var mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        var rect = canvas.getBoundingClientRect();
        mx -= rect.left; my -= rect.top;
        var newScale = Math.min(Math.max(scale * factor, 0.05), 20);
        panX = mx - (mx - panX) * (newScale / scale);
        panY = my - (my - panY) * (newScale / scale);
        scale = newScale;
        update();
        lastTouches = Array.from(e.touches);
      }
      e.preventDefault();
    }
    function onTouchEnd() { isDragging = false; lastTouches = null; }

    openLightbox = open;
    document.addEventListener('keydown', function (e) {
      if (!overlay || !overlay.classList.contains('open')) return;
      if (e.key === 'Escape')                         close();
      else if (e.key === '+' || e.key === '=')        zoom(1);
      else if (e.key === '-')                         zoom(-1);
      else if (e.key === '0')                         reset();
      else if (e.key === '1')                         setZoom(1);
    });
  }

  // ── Per-diagram enhancements ─────────────────────────────────────────────
  // Zoom-icon SVG (Lucide "expand"): outer corner brackets.
  var ZOOM_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="15 3 21 3 21 9"/>' +
    '<polyline points="9 21 3 21 3 15"/>' +
    '<line x1="21" y1="3" x2="14" y2="10"/>' +
    '<line x1="3" y1="21" x2="10" y2="14"/>' +
    '</svg>';

  // Return the diagram figure element for a given .mermaid element.
  // Walks up to the nearest .diagram ancestor; if none, uses the direct parent.
  // Sets position:relative on the parent so the absolute-positioned zoom button
  // lands correctly when there is no .diagram CSS wrapper.
  function diagramFigureFor(mermaidEl) {
    var fig = mermaidEl.closest('.diagram');
    if (fig) return fig;
    fig = mermaidEl.parentElement;
    if (fig) fig.style.position = 'relative';
    return fig;
  }

  // Attach the zoom-icon button (top-right corner) to a diagram figure.
  // The button opens the lightbox with a clone of the diagram's SVG.
  function attachZoomButton(figure) {
    if (!figure || figure.querySelector('.diagram-zoom-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'diagram-zoom-btn';
    btn.setAttribute('aria-label', 'Open fullscreen viewer');
    btn.title = 'Open fullscreen viewer';
    btn.innerHTML = ZOOM_ICON_SVG;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var svg = figure.querySelector('.mermaid svg');
      if (svg && typeof openLightbox === 'function') openLightbox(svg);
    });
    figure.appendChild(btn);
  }

  // Normalise an entity name or label to a manifest key.
  // PascalCase/camelCase → all-lowercase (no separator); underscores stripped.
  // E.g. "TransactionChain" → "transactionchain", "LegalEstate" → "legalestate".
  function normToManifestKey(raw) {
    return raw.replace(/[\s_]/g, '').toLowerCase();
  }

  // Extract entity name from a Mermaid 11 ER node id.
  // Both `mermaid-<digits>-entity-NAME-N` and `entity-NAME-N` forms accepted.
  function entityNameFromId(id) {
    var m = (id || '').match(/entity-([A-Za-z][A-Za-z_0-9]*)-\d+$/);
    return m ? m[1] : null;
  }

  // Extract the first line of visible text from an SVG node element.
  // Used for flowchart/class/state nodes where the id does not embed the label.
  function extractFirstLineText(el) {
    // For foreignObject-based labels (Mermaid 11 flowchart), text is in a <p>
    var fo = el.querySelector('foreignObject p, foreignObject span');
    if (fo && fo.textContent) return fo.textContent.trim();
    // For plain SVG text elements, take the first non-empty text node/element
    var texts = el.querySelectorAll('text, tspan, .label, .nodeLabel');
    for (var i = 0; i < texts.length; i++) {
      var t = texts[i].textContent.trim();
      if (t) return t;
    }
    return (el.textContent || '').split('\n')[0].trim();
  }

  // Wire click navigation on all nodes in a diagram figure.
  // For ER diagrams: reads entity name from the SVG node id (reliable, PascalCase).
  // For flowchart/class/state: reads first-line text from each node.
  // Manifest-gated: only wires nodes that resolve to a route.
  function attachNodeClicks(figure) {
    var links = window.__diagramLinks;
    if (!links) return;
    var svg = figure.querySelector('.mermaid svg');
    if (!svg) return;
    var svgClass = svg.getAttribute('class') || '';

    if (svgClass === 'erDiagram') {
      // ER: use id-based entity name extraction (reliable, avoids multi-line text)
      var nodes = svg.querySelectorAll('g.node[id*="entity-"], g[id^="entity-"]');
      nodes.forEach(function (g) {
        if (g.dataset.diagramNav) return;
        var rawName = entityNameFromId(g.id);
        if (!rawName) {
          // Fallback: read label text
          rawName = extractFirstLineText(g);
        }
        if (!rawName) return;
        var key = normToManifestKey(rawName);
        var route = links[key];
        if (!route) return;
        wireNodeNavigation(g, rawName, route);
        g.classList.add('er-clickable');
      });
    } else {
      // Flowchart / class / state: text-based lookup
      var flowNodes = svg.querySelectorAll('g.node, g.nodeLabel');
      var seen = new Set();
      flowNodes.forEach(function (g) {
        if (g.dataset.diagramNav) return;
        // Avoid double-wiring inner nodeLabel groups
        if (seen.has(g.id)) return;
        if (g.id) seen.add(g.id);
        var text = extractFirstLineText(g);
        if (!text) return;
        var key = normToManifestKey(text);
        var route = links[key];
        if (!route) return;
        wireNodeNavigation(g, text, route);
      });
    }
  }

  function wireNodeNavigation(el, label, route) {
    el.dataset.diagramNav = route;
    el.style.cursor = 'pointer';
    el.setAttribute('role', 'link');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', label + ' — navigate to ' + route);
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      location.assign(route);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        location.assign(route);
      }
    });
  }

  // Apply zoom button + node click navigation to every rendered diagram.
  // Handles both .diagram-wrapped (Diagram.astro) and bare .mermaid (markdown).
  function enhanceDiagrams() {
    // 1. .diagram-wrapped figures
    document.querySelectorAll('.diagram').forEach(function (figure) {
      if (!figure.querySelector('.mermaid svg')) return;
      attachZoomButton(figure);
      attachNodeClicks(figure);
    });
    // 2. bare .mermaid elements (markdown-rendered, no .diagram ancestor)
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (!el.querySelector('svg')) return;
      if (el.closest('.diagram')) return; // already handled above
      var figure = diagramFigureFor(el);
      if (!figure) return;
      attachZoomButton(figure);
      attachNodeClicks(figure);
    });
  }

  // Schedule enhanceDiagrams across short delays to handle ELK async SVG mount.
  // Stops when all figures have zoom buttons and ER nodes are wired, or after ~6s.
  var __misrenderRecheckOnce = false;
  function scheduleEnhanceDiagrams() {
    __misrenderRecheckOnce = false; // reset on each mermaid run
    var attempts = 0;
    var max = 30;
    function tick() {
      attempts += 1;
      enhanceDiagrams();
      var allMermaidEls = document.querySelectorAll('.mermaid');
      var anyMissing = false;
      allMermaidEls.forEach(function (el) {
        if (!el.querySelector('svg')) return;
        var fig = el.closest('.diagram') || el.parentElement;
        if (!fig) return;
        if (!fig.querySelector('.diagram-zoom-btn')) { anyMissing = true; return; }
        var svg = el.querySelector('svg');
        if (svg && svg.getAttribute('class') === 'erDiagram') {
          var nodes = svg.querySelectorAll('g.node[id*="entity-"], g[id^="entity-"]');
          for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].dataset.diagramNav) { anyMissing = true; break; }
          }
        }
      });
      if (anyMissing && attempts < max) {
        setTimeout(tick, 200);
      } else {
        setTimeout(correctMisrenderedDiagrams, 300);
      }
    }
    setTimeout(tick, 0);
  }

  // Re-render diagrams that are significantly narrower than their container
  // (Gantt + ER under ELK mis-measured at initial layout). One pass per page load.
  function correctMisrenderedDiagrams() {
    if (__misrenderRecheckOnce) return;
    __misrenderRecheckOnce = true;
    var toFix = [];
    document.querySelectorAll('.mermaid').forEach(function (el) {
      var svg = el.querySelector('svg');
      if (!svg || !el.dataset.mermaidSrc) return;
      var containerW = el.getBoundingClientRect().width;
      var svgW = svg.getBoundingClientRect().width;
      if (containerW >= 500 && svgW < containerW * 0.6 && svgW < 500) {
        toFix.push(el);
      }
    });
    if (!toFix.length) return;
    toFix.forEach(function (el) {
      el.textContent = el.dataset.mermaidSrc;
      el.removeAttribute('data-processed');
    });
    if (window.mermaid && window.mermaid.run) {
      window.mermaid.run({ querySelector: '.mermaid:not([data-processed])' })
        .then(function () {
          var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          try { injectInlineThemeDirective(isDark ? darkTheme() : lightTheme(), isDark); } catch (_) {}
          scheduleEnhanceDiagrams();
        })
        .catch(function () {});
    }
  }

  // Re-render Mermaid blocks whose container width changes meaningfully.
  function installMermaidResizeObserver() {
    if (window.__mermaidResizeObserved) return;
    window.__mermaidResizeObserved = true;
    if (typeof ResizeObserver === 'undefined') return;
    var lastWidth = new WeakMap();
    var debounce = null;
    function scheduleRerun() {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        document.querySelectorAll('.mermaid').forEach(function (el) {
          if (el.dataset.mermaidSrc) {
            el.textContent = el.dataset.mermaidSrc;
            el.removeAttribute('data-processed');
          }
        });
        _runMermaidInner();
      }, 200);
    }
    var ro = new ResizeObserver(function (entries) {
      var rerunNeeded = false;
      entries.forEach(function (e) {
        var w = Math.round(e.contentRect.width);
        var prev = lastWidth.get(e.target) || 0;
        if (Math.abs(w - prev) >= 30 || (prev < 200 && w >= 200)) rerunNeeded = true;
        lastWidth.set(e.target, w);
      });
      if (rerunNeeded) scheduleRerun();
    });
    document.querySelectorAll('.mermaid').forEach(function (el) {
      lastWidth.set(el, el.getBoundingClientRect().width);
      ro.observe(el);
    });
    if (document.readyState !== 'complete') {
      window.addEventListener('load', scheduleRerun, { once: true });
    }
  }

  // Cagle Color System (per diagramming skill /09-STYLING-GUIDE.md).
  // Light + dark variants, WCAG AA+ audited. Injected into every diagram so
  // pages can use semantic class names (:::infra, :::service, etc.) without
  // hardcoding hex; theme toggle re-runs this and swaps to dark variants.
  function cagleClassDefs(isDark) {
    var defs = isDark ? [
      'classDef infra fill:#0D2137,stroke:#42A5F5,stroke-width:2px,color:#90CAF9',
      'classDef service fill:#0D2818,stroke:#66BB6A,stroke-width:2px,color:#A5D6A7',
      'classDef data fill:#2E1500,stroke:#FFA726,stroke-width:2px,color:#FFCC80',
      'classDef user fill:#1A0A2E,stroke:#BA68C8,stroke-width:2px,color:#E1BEE7',
      'classDef process fill:#012830,stroke:#4DD0E1,stroke-width:2px,color:#B2EBF2',
      'classDef security fill:#002A22,stroke:#4DB6AC,stroke-width:2px,color:#B2DFDB',
      'classDef external fill:#211A17,stroke:#D7CCC8,stroke-width:2px,color:#EFEBE9',
      'classDef success fill:#0D2818,stroke:#66BB6A,stroke-width:2px,color:#A5D6A7',
      'classDef warning fill:#2E2400,stroke:#FFEE58,stroke-width:2px,color:#FFF59D',
      'classDef error fill:#2A0A0A,stroke:#EF5350,stroke-width:2px,color:#EF9A9A',
      'classDef info fill:#0D2137,stroke:#42A5F5,stroke-width:2px,color:#90CAF9',
      'classDef neutral fill:#1E1E1E,stroke:#9E9E9E,stroke-width:2px,color:#BDBDBD',
    ] : [
      'classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1',
      'classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20',
      'classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100',
      'classDef user fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C',
      'classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B',
      'classDef security fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:#004D40',
      'classDef external fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238',
      'classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20',
      'classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17',
      'classDef error fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C',
      'classDef info fill:#BBDEFB,stroke:#1565C0,stroke-width:2px,color:#0D47A1',
      'classDef neutral fill:#F5F5F5,stroke:#757575,stroke-width:2px,color:#424242',
    ];
    return defs.join('\n');
  }

  // Splice the Cagle classDef block in after the diagram-type declaration
  // so :::infra etc. resolve regardless of which diagram type the page uses.
  function spliceCageClassDefs(src, classDefBlock) {
    var lines = src.split('\n');
    var insertIdx = -1;
    // `classDef` is only valid in these diagram types. Injecting it into others
    // (sequenceDiagram, pie, gantt, journey, gitGraph, mindmap, timeline,
    // erDiagram, C4, …) is a syntax error that makes the diagram fail to render.
    var classDefTypeRe = /^\s*(flowchart|graph|classDiagram|stateDiagram(?:-v2)?)\b/i;
    for (var i = 0; i < lines.length; i++) {
      if (classDefTypeRe.test(lines[i])) { insertIdx = i + 1; break; }
    }
    if (insertIdx === -1) return src;
    var before = lines.slice(0, insertIdx);
    var after = lines.slice(insertIdx);
    return before.concat([classDefBlock]).concat(after).join('\n');
  }

  function injectInlineThemeDirective(themeVars, isDark) {
    if (!themeVars) return;
    var keys = Object.keys(themeVars);
    var pairs = [];
    for (var i = 0; i < keys.length; i++) {
      var v = themeVars[keys[i]];
      if (typeof v !== 'string') continue;
      pairs.push("'" + keys[i] + "':'" + v + "'");
    }
    var directive = "%%{init: { 'theme':'base', 'themeVariables': { " + pairs.join(', ') + " } }}%%\n";
    var classDefBlock = cagleClassDefs(!!isDark);
    document.querySelectorAll('.mermaid').forEach(function (el) {
      var src = (el.dataset.mermaidSrc || el.textContent || '').trim();
      src = src.replace(/%%\{init:[^}]*\}\}%%\s*\n?/g, '');
      src = src.replace(/^\s+/, '');
      if (!src) return;
      if (!el.dataset.mermaidSrc) el.dataset.mermaidSrc = src;
      var fm = src.match(/^---\s*\n[\s\S]*?\n---\s*\n/);
      var body = fm ? src.slice(fm[0].length) : src;
      body = spliceCageClassDefs(body, classDefBlock);
      var assembled = (fm ? fm[0] : '') + directive + body;
      el.textContent = assembled;
      el.removeAttribute('data-processed');
    });
  }

  function restartMermaid() {
    if (!window.mermaid) return;
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (el.dataset.mermaidSrc) {
        el.textContent = el.dataset.mermaidSrc;
        el.removeAttribute('data-processed');
      }
    });
    runMermaid();
  }

  function lightTheme() {
    return {
      primaryColor: '#EFE9DE', primaryBorderColor: '#CC785C', primaryTextColor: '#141413',
      secondaryColor: '#F5F0E8', tertiaryColor: '#E8E0D2',
      lineColor: '#6C6A64', arrowheadColor: '#6C6A64', edgeLabelBackground: '#FAF9F5',
      clusterBkg: '#FAF9F5', clusterBorder: '#E6DFD0',
      noteBkgColor: '#FBF3EE', noteBorderColor: '#CC785C', noteTextColor: '#141413',
      titleColor: '#141413', labelColor: '#3D3D3A', nodeTextColor: '#141413',
      actorBkg: '#EFE9DE', actorBorder: '#CC785C', actorTextColor: '#141413',
      actorLineColor: '#6C6A64', signalColor: '#3D3D3A', signalTextColor: '#141413',
      background: '#FAF9F5', mainBkg: '#EFE9DE',
      attributeBackgroundColorOdd: '#FAF9F5', attributeBackgroundColorEven: '#EFE9DE',
    };
  }

  function darkTheme() {
    return {
      primaryColor: '#2B2823', primaryBorderColor: '#CC785C', primaryTextColor: '#EFE9DE',
      secondaryColor: '#36322C', tertiaryColor: '#3D3935',
      lineColor: '#A8A39B', arrowheadColor: '#A8A39B', edgeLabelBackground: '#1F1D1A',
      clusterBkg: '#1F1D1A', clusterBorder: '#3D3935',
      noteBkgColor: '#3D2A22', noteBorderColor: '#CC785C', noteTextColor: '#EFE9DE',
      titleColor: '#EFE9DE', labelColor: '#C4BEB1', nodeTextColor: '#EFE9DE',
      actorBkg: '#2B2823', actorBorder: '#CC785C', actorTextColor: '#EFE9DE',
      actorLineColor: '#A8A39B', signalColor: '#C4BEB1', signalTextColor: '#EFE9DE',
      background: '#1F1D1A', mainBkg: '#2B2823',
      attributeBackgroundColorOdd: '#2B2823', attributeBackgroundColorEven: '#1F1D1A',
    };
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    bindThemeToggle();
    bindSidebar();
    renderToc();
    enhanceHeadings();
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (!el.dataset.mermaidSrc) el.dataset.mermaidSrc = el.textContent.trim();
    });
    bindDiagramLightbox();
    runMermaid();
  }

  // Guard against the first-load double-init: with <ClientRouter /> enabled,
  // astro:page-load fires on the initial load too, so an unguarded init() would
  // run once here and again on page-load — double-binding every toggle's click
  // listener so each click fires twice and cancels out. The flag makes init
  // run once per document; astro:after-swap clears it so the fresh DOM that a
  // view-transition navigation swaps in re-binds correctly.
  let initialised = false;
  function runInitOnce() {
    if (initialised) return;
    initialised = true;
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInitOnce);
  } else {
    runInitOnce();
  }

  document.addEventListener('astro:after-swap', function () { initialised = false; });
  document.addEventListener('astro:page-load', runInitOnce);

  window.OPDA = { init: init };
})();
