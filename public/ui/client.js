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
 *   • Mermaid lazy load + theme integration + ResizeObserver
 *   • Diagram lightbox (zoom / pan / fullscreen)
 *   • ER diagram entity click navigation
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
        runPromise.then(function () { loadDiagramLinks().then(wireDiagramClicks); });
      } else {
        loadDiagramLinks().then(wireDiagramClicks);
      }
    } catch (err) {
      console.warn('[OPDA] mermaid run failed:', err);
    }
  }

  // ── Diagram click navigation (ADR-0022) ──────────────────────────────────

  /** Fetch the diagram-links manifest once; cache in window.__diagramLinks. */
  function loadDiagramLinks() {
    if (window.__diagramLinks) return Promise.resolve(window.__diagramLinks);
    return fetch('/data/diagram-links.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && typeof data === 'object') {
          window.__diagramLinks = data;
        } else {
          window.__diagramLinks = {};
        }
        return window.__diagramLinks;
      })
      .catch(function () { window.__diagramLinks = {}; return {}; });
  }

  /**
   * Walk every rendered mermaid SVG, match node labels to the manifest,
   * and attach click navigation. Manifest-gated: no dead links emitted.
   */
  function wireDiagramClicks() {
    var links = window.__diagramLinks;
    if (!links || !Object.keys(links).length) return;

    document.querySelectorAll('.mermaid svg').forEach(function (svg) {
      // Cover flowchart/graph nodes, class diagram nodes, state diagram nodes,
      // and ER diagram entity boxes.
      var nodeEls = svg.querySelectorAll(
        'g.node, g.nodeLabel, g.er.entityBox, g[class*="node"]'
      );
      nodeEls.forEach(function (el) {
        attachClickIfMatched(el, links);
      });
    });
  }

  /** Extract visible text from an element (recursively, skipping aria-hidden). */
  function extractNodeText(el) {
    var parts = [];
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) {
        parts.push(n.textContent);
      } else if (n.nodeType === 1) {
        var tag = n.tagName ? n.tagName.toLowerCase() : '';
        if (tag !== 'title' && n.getAttribute('aria-hidden') !== 'true') {
          parts.push(extractNodeText(n));
        }
      }
    });
    return parts.join('').trim();
  }

  /** Normalise a label for manifest lookup. */
  function normaliseLabel(text) {
    return text.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  /**
   * Given a node element and the manifest, look up its text and attach
   * navigation if a route is found.
   */
  function attachClickIfMatched(el, links) {
    if (el.dataset.diagramNav) return; // already wired
    var text = extractNodeText(el);
    if (!text) return;
    var route = links[normaliseLabel(text)];
    if (!route) return;
    el.dataset.diagramNav = route;
    el.style.cursor = 'pointer';
    el.setAttribute('role', 'link');
    el.setAttribute('aria-label', text + ' — navigate to ' + route);
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
    el.setAttribute('tabindex', '0');
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
