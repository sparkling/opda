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

  function bindThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    function syncThemeState() {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
    syncThemeState();
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('opda-theme', next); } catch (e) {}
      syncThemeState();
      // Diagram re-render on theme change is handled by the GraphDiagram island
      // (data-theme MutationObserver) — client.js no longer renders mermaid.
    });
  }

  function bindPrimaryNavigation() {
    const header = document.querySelector('.app-header');
    const panel = document.getElementById('global-nav-panel');
    const toggle = document.getElementById('global-nav-toggle');
    if (!header || !panel || !toggle) return;
    // Match the CSS compact-header boundary. The six global destinations must
    // remain fully discoverable on intermediate desktop/tablet widths; a
    // clipped horizontal row is not an acceptable navigation state.
    const mobileQuery = window.matchMedia('(max-width: 92rem)');

    function setOpen(open, restoreFocus) {
      const shouldOpen = mobileQuery.matches && open;
      header.classList.toggle('primary-nav-open', shouldOpen);
      panel.hidden = mobileQuery.matches && !shouldOpen;
      panel.inert = mobileQuery.matches && !shouldOpen;
      toggle.setAttribute('aria-expanded', String(shouldOpen));
      toggle.setAttribute('aria-label', shouldOpen ? 'Close site navigation' : 'Open site navigation');
      if (!shouldOpen && restoreFocus) toggle.focus();
    }

    setOpen(false, false);
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('primary-nav-open'), false);
    });
    panel.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !header.classList.contains('primary-nav-open')) return;
      event.preventDefault();
      setOpen(false, true);
    });
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false, false); });
    });
    document.getElementById('menu-toggle')?.addEventListener('click', function () {
      setOpen(false, false);
    });
    mobileQuery.addEventListener('change', function () { setOpen(false, false); });
  }

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
          sidebarCollapse?.setAttribute('aria-expanded', 'false');
          sidebarCollapse?.setAttribute('aria-label', 'Expand sidebar');
          sidebarCollapse?.setAttribute('title', 'Expand sidebar');
        }
        if (localStorage.getItem('opda-toc-collapsed') === '1') {
          appBody.classList.add('toc-collapsed');
        }
      } catch (e) {}
    }

    // Mobile navigation drawer: labelled state, Escape, focus containment and
    // focus return. The semantic role applies only while the drawer is open.
    if (menuToggle && aside) {
      let returnFocus = null;
      const mobileQuery = window.matchMedia('(max-width: 960px)');
      const focusableSelector =
        'a[href], button:not([disabled]), summary, input:not([disabled]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

      function setPageBehindDrawerInert(inert) {
        const header = document.querySelector('.app-header');
        const skip = document.querySelector('.skip-link');
        if (header) header.inert = inert;
        if (skip) skip.inert = inert;
        if (appBody) {
          Array.from(appBody.children).forEach(function (element) {
            if (element !== aside) element.inert = inert;
          });
        }
      }

      function setDrawer(open, restoreFocus) {
        const shouldOpen = mobileQuery.matches && open;
        aside.classList.toggle('open', shouldOpen);
        aside.inert = mobileQuery.matches && !shouldOpen;
        setPageBehindDrawerInert(shouldOpen);
        if (mobileQuery.matches && !shouldOpen) aside.setAttribute('aria-hidden', 'true');
        else aside.removeAttribute('aria-hidden');
        menuToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', shouldOpen
          ? 'Close section navigation'
          : 'Open section navigation');
        if (shouldOpen) {
          returnFocus = document.activeElement;
          aside.setAttribute('role', 'dialog');
          aside.setAttribute('aria-modal', 'true');
          aside.setAttribute('aria-label', 'Section navigation');
          document.documentElement.classList.add('nav-open');
          if (sidebarCollapse) {
            sidebarCollapse.setAttribute('aria-label', 'Close section navigation');
            sidebarCollapse.setAttribute('title', 'Close section navigation');
          }
          const first = aside.querySelector(focusableSelector);
          if (first) first.focus();
        } else {
          aside.removeAttribute('role');
          aside.removeAttribute('aria-modal');
          aside.removeAttribute('aria-label');
          document.documentElement.classList.remove('nav-open');
          if (sidebarCollapse) {
            const isCollapsed = appBody?.classList.contains('sidebar-collapsed') === true;
            const collapseLabel = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
            sidebarCollapse.setAttribute('aria-expanded', String(!isCollapsed));
            sidebarCollapse.setAttribute('aria-label', collapseLabel);
            sidebarCollapse.setAttribute('title', collapseLabel);
          }
          if (restoreFocus !== false && returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
          returnFocus = null;
        }
      }

      setDrawer(false, false);
      if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function (event) {
          if (!mobileQuery.matches || !aside.classList.contains('open')) return;
          event.stopImmediatePropagation();
          setDrawer(false);
        }, { capture: true });
      }

      menuToggle.addEventListener('click', function () {
        setDrawer(!aside.classList.contains('open'));
      });
      aside.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setDrawer(false); });
      });
      aside.addEventListener('keydown', function (event) {
        if (!aside.classList.contains('open')) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          setDrawer(false);
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(aside.querySelectorAll(focusableSelector))
          .filter(function (element) {
            const closed = element.closest('details:not([open])');
            return element.getClientRects().length > 0 &&
              (!closed || closed.querySelector(':scope > summary')?.contains(element));
          });
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      mobileQuery.addEventListener('change', function () { setDrawer(false, false); });
    }

    if (sidebarCollapse && appBody) {
      sidebarCollapse.addEventListener('click', function () {
        const nowCollapsed = !appBody.classList.contains('sidebar-collapsed');
        appBody.classList.toggle('sidebar-collapsed', nowCollapsed);
        try { localStorage.setItem('opda-sidebar-collapsed', nowCollapsed ? '1' : '0'); } catch (e) {}
        sidebarCollapse.setAttribute('aria-label',
          nowCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
        sidebarCollapse.setAttribute('title',
          nowCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
        sidebarCollapse.setAttribute('aria-expanded', String(!nowCollapsed));
      });
    }

    if (aside) {
      aside.querySelectorAll('.tree-toggle').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const li = btn.closest('.tree-folder');
          if (!li) return;
          const opening = !li.classList.contains('is-open');
          li.classList.toggle('is-open', opening);
          btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
          btn.setAttribute('aria-label', (opening ? 'Collapse ' : 'Expand ') + btn.dataset.label);
        });
      });
    }

    if (aside) {
      const sectionKey = aside.querySelector('.sidebar-nav')?.getAttribute('data-section');
      if (sectionKey) {
        const groups = Array.from(aside.querySelectorAll('.nav-group'));
        const activeGroup = groups.find(function (group) { return group.dataset.active === 'true'; });
        let restoredGroup = false;
        groups.forEach(function (group) {
          const groupName = group.getAttribute('data-group');
          const button = group.querySelector(':scope > .nav-group-row > .nav-group-toggle');
          if (!groupName || !button) return;
          const storageKey = 'opda.sidebar.' + sectionKey + '.' + groupName;
          const setGroup = function (open) {
            group.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', String(open));
            button.setAttribute('aria-label', (open ? 'Collapse ' : 'Expand ') + button.dataset.label);
          };
          try {
            const saved = localStorage.getItem(storageKey);
            if (group.dataset.active === 'true') setGroup(true);
            else if (saved === 'closed') setGroup(false);
            else if (!activeGroup && !restoredGroup && saved === 'open') {
              setGroup(true);
              restoredGroup = true;
            } else setGroup(false);
          } catch (e) {}
          button.addEventListener('click', function () {
            const open = !group.classList.contains('is-open');
            if (open) {
              groups.forEach(function (other) {
                if (other === group) return;
                const otherButton = other.querySelector(':scope > .nav-group-row > .nav-group-toggle');
                if (!otherButton) return;
                other.classList.remove('is-open');
                otherButton.setAttribute('aria-expanded', 'false');
                otherButton.setAttribute('aria-label', 'Expand ' + otherButton.dataset.label);
                try { localStorage.setItem('opda.sidebar.' + sectionKey + '.' + other.dataset.group, 'closed'); } catch (e) {}
              });
            }
            setGroup(open);
            try { localStorage.setItem(storageKey, open ? 'open' : 'closed'); } catch (e) {}
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
      link.setAttribute('aria-label', 'Permalink to ' + h.textContent.trim());
      link.textContent = '#';
      h.appendChild(link);
    });
  }

  // ── TOC widget ──────────────────────────────────────────────────────────
  function renderToc() {
    const article = document.querySelector('.prose');
    if (!article) return;
    const headings = article.querySelectorAll('h2[id], h3[id], h4[id]');
    if (!headings.length) return;

    const toc = document.createElement('aside');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'On this page');

    const tocToggle = document.createElement('button');
    tocToggle.type = 'button';
    tocToggle.className = 'rail-collapse-toggle toc-toggle';
    tocToggle.id = 'toc-collapse';
    tocToggle.setAttribute('aria-controls', 'toc-links');
    tocToggle.innerHTML =
      '<span class="toc-toggle__label">On this page</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="9 18 15 12 9 6"/>' +
      '</svg>';
    toc.appendChild(tocToggle);

    const ul = document.createElement('ul');
    ul.id = 'toc-links';
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
    const railQuery = window.matchMedia('(min-width: 1281px)');
    let collapsed = false;
    try {
      const stored = localStorage.getItem('opda-toc-collapsed');
      if (railQuery.matches && (stored === '1' || stored === '0')) collapsed = stored === '1';
    } catch (e) {}

    function syncTocState(persist) {
      const railMode = Boolean(body && railQuery.matches);
      toc.classList.toggle('is-collapsed', collapsed);
      if (body) body.classList.toggle('toc-collapsed', railMode && collapsed);
      tocToggle.setAttribute('aria-expanded', String(!collapsed));
      tocToggle.setAttribute('aria-label', collapsed ? 'Expand table of contents' : 'Collapse table of contents');
      tocToggle.title = collapsed ? 'Expand table of contents' : 'Collapse table of contents';
      if (persist) {
        try { localStorage.setItem('opda-toc-collapsed', collapsed ? '1' : '0'); } catch (e) {}
      }
    }

    function placeToc() {
      if (body && railQuery.matches) {
        body.appendChild(toc);
        body.classList.add('with-toc');
      } else {
        collapsed = false;
        article.insertBefore(toc, article.firstChild);
        body?.classList.remove('with-toc', 'toc-collapsed');
      }
      syncTocState(false);
    }
    placeToc();
    tocToggle.addEventListener('click', function () { collapsed = !collapsed; syncTocState(true); });
    railQuery.addEventListener('change', placeToc);

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
        if (lastActive) {
          lastActive.classList.remove('active');
          lastActive.removeAttribute('aria-current');
        }
        link.classList.add('active');
        link.setAttribute('aria-current', 'location');
        lastActive = link;
      }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    bindThemeToggle();
    bindPrimaryNavigation();
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
