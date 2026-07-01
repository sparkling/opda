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
 *
 * Mermaid rendering (lazy load, theme integration, pan/zoom/fullscreen,
 * diagram-links click-navigation, mis-render correction) was RETIRED from here
 * and now lives in the GraphDiagram island (src/scripts/graph-diagram*,
 * src/components/GraphDiagram.astro). The island adopts every bare `.mermaid`
 * div site-wide via src/layouts/Layout.astro (adoptBareMermaid).
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
      // Diagram re-render on theme change is handled by the GraphDiagram island
      // (data-theme MutationObserver) — client.js no longer renders mermaid.
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

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    bindThemeToggle();
    bindSidebar();
    renderToc();
    enhanceHeadings();
    // Mermaid diagrams are rendered by the GraphDiagram island (adopted from the
    // bare .mermaid divs in src/layouts/Layout.astro); client.js's mermaid path
    // is retired.
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
