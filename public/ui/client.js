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

  function bindHeaderPreviewSelector(config) {
    const selectors = Array.from(document.querySelectorAll(config.selector));
    if (selectors.length === 0) return;
    const allInputs = Array.from(document.querySelectorAll(config.inputSelector));
    if (allInputs.length === 0) return;
    const defaultValue = allInputs.find(function (input) { return input.defaultChecked; })?.value
      || allInputs[0].value;
    const optionNames = Object.fromEntries(allInputs.map(function (input) {
      return [input.value, input.dataset[config.nameDataKey]];
    }));
    const optionLabels = Object.fromEntries(allInputs.map(function (input) {
      return [input.value, input.dataset[config.labelDataKey || config.nameDataKey]];
    }));

    function closeSelectorChain(selector) {
      const chain = [selector];
      let ancestor = selector.parentElement?.closest('.header-preview-selector');
      while (ancestor) {
        chain.push(ancestor);
        ancestor = ancestor.parentElement?.closest('.header-preview-selector');
      }
      const focusTarget = chain[chain.length - 1].querySelector(':scope > summary');
      chain.forEach(function (details) { details.open = false; });
      focusTarget?.focus();
    }

    function applyValue(value, persist) {
      const selectedValue = Object.prototype.hasOwnProperty.call(optionNames, value)
        ? value
        : defaultValue;
      document.documentElement.setAttribute(config.documentAttribute, selectedValue);
      document.querySelectorAll(config.currentLabel).forEach(function (label) {
        label.textContent = optionLabels[selectedValue];
      });
      allInputs.forEach(function (input) { input.checked = input.value === selectedValue; });
      if (persist) config.persist(selectedValue);
    }

    applyValue(document.documentElement.getAttribute(config.documentAttribute), false);
    selectors.forEach(function (selector) {
      if (selector.dataset.bound === 'true') return;
      selector.dataset.bound = 'true';
      const summary = selector.querySelector('summary');
      const control = selector.closest('.header-preview-control');
      const previousButton = control?.querySelector(config.previousButton);
      const nextButton = control?.querySelector(config.nextButton);
      const inputs = Array.from(selector.querySelectorAll(config.inputSelector));

      function stepValue(direction) {
        const current = document.documentElement.getAttribute(config.documentAttribute);
        const currentIndex = inputs.findIndex(function (input) { return input.value === current; });
        const nextIndex = (Math.max(currentIndex, 0) + direction + inputs.length) % inputs.length;
        applyValue(inputs[nextIndex].value, true);
        selector.open = false;
      }

      previousButton?.addEventListener('click', function () { stepValue(-1); });
      nextButton?.addEventListener('click', function () { stepValue(1); });
      selector.addEventListener('change', function (event) {
        const input = event.target;
        if (!(input instanceof HTMLInputElement) || !input.matches(config.inputSelector)) return;
        applyValue(input.value, true);
        if (config.closeOnSelect !== false) closeSelectorChain(selector);
      });
      selector.addEventListener('click', function (event) {
        if (config.closeOnSelect === false) return;
        const target = event.target;
        if (!(target instanceof Element) || !target.closest(config.optionSelector)) return;
        requestAnimationFrame(function () { closeSelectorChain(selector); });
      });
      selector.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' || !selector.open) return;
        event.preventDefault();
        selector.open = false;
        summary?.focus();
      });
      selector.addEventListener('focusout', function (event) {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && !selector.contains(nextTarget)) selector.open = false;
      });
      document.addEventListener('pointerdown', function (event) {
        const target = event.target;
        if (selector.open && target instanceof Node && !selector.contains(target)) selector.open = false;
      });
      selector.addEventListener('toggle', function () {
        if (!selector.open) return;
        document.querySelectorAll('.header-preview-selector[open]').forEach(function (other) {
          if (other !== selector && !other.contains(selector)) other.open = false;
        });
      });
    });
  }

  function bindHeaderPaletteSelector() {
    bindHeaderPreviewSelector({
      selector: '[data-header-palette-selector]',
      currentLabel: '[data-header-palette-current]',
      previousButton: '[data-header-palette-previous]',
      nextButton: '[data-header-palette-next]',
      inputSelector: '[data-header-palette-input]',
      optionSelector: '[data-header-palette-option]',
      nameDataKey: 'paletteName',
      documentAttribute: 'data-header-palette',
      closeOnSelect: true,
      persist: function (palette) {
        try { localStorage.setItem('opda-header-palette', palette); } catch (e) {}
      }
    });
  }

  function bindHeaderPalettePagination() {
    document.querySelectorAll('[data-header-palette-selector]').forEach(function (selector) {
      if (selector.dataset.paginationBound === 'true') return;
      const options = Array.from(selector.querySelectorAll('[data-header-palette-page]'));
      const pagination = selector.querySelector('[data-header-palette-pagination]');
      const pageSize = Number(selector.dataset.headerPalettePageSize || 10);
      const pageCount = Math.max(1, Math.ceil(options.length / pageSize));
      const previous = pagination?.querySelector('[data-header-palette-page-previous]');
      const next = pagination?.querySelector('[data-header-palette-page-next]');
      const current = pagination?.querySelector('[data-header-palette-page-current]');
      if (!pagination || !previous || !next || !current) return;
      selector.dataset.paginationBound = 'true';
      let page = 1;

      function showPage(requestedPage) {
        page = ((requestedPage - 1 + pageCount) % pageCount) + 1;
        options.forEach(function (option) {
          option.hidden = Number(option.dataset.headerPalettePage) !== page;
        });
        current.textContent = String(page);
        previous.disabled = pageCount <= 1;
        next.disabled = pageCount <= 1;
      }

      previous.addEventListener('click', function () { showPage(page - 1); });
      next.addEventListener('click', function () { showPage(page + 1); });
      selector.addEventListener('toggle', function () {
        if (!selector.open) return;
        const selectedIndex = options.findIndex(function (option) {
          return option.querySelector('[data-header-palette-input]')?.checked;
        });
        showPage(selectedIndex < 0 ? 1 : Math.floor(selectedIndex / pageSize) + 1);
      });
      showPage(1);
    });
  }

  function bindHeaderIconSelector() {
    bindHeaderPreviewSelector({
      selector: '[data-header-icon-selector]',
      currentLabel: '[data-header-icon-current]',
      previousButton: '[data-header-icon-previous]',
      nextButton: '[data-header-icon-next]',
      inputSelector: '[data-header-icon-input]',
      optionSelector: '[data-header-icon-option]',
      nameDataKey: 'iconName',
      labelDataKey: 'iconNumber',
      documentAttribute: 'data-header-icon',
      closeOnSelect: false,
      persist: function (icon) {
        try { localStorage.setItem('opda-header-icon', icon); } catch (e) {}
      }
    });
  }

  function syncHeaderConfigurationMode() {
    const currentUrl = new URL(window.location.href);
    const configurationEnabled = currentUrl.searchParams.has('config');
    document.querySelectorAll('[data-header-preview-controls]').forEach(function (controls) {
      controls.hidden = !configurationEnabled;
    });
    if (!configurationEnabled) return;

    const configurationValue = currentUrl.searchParams.get('config') ?? '';
    document.querySelectorAll('a[href]').forEach(function (link) {
      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#')) return;
      let destination;
      try {
        destination = new URL(rawHref, currentUrl);
      } catch (error) {
        return;
      }
      if (destination.origin !== currentUrl.origin) return;
      destination.searchParams.set('config', configurationValue);
      link.href = destination.href;
    });
  }

  function bindHeaderPreviewControls() {
    const controls = document.querySelector('[data-header-preview-controls]');
    const toggle = controls?.querySelector('[data-header-preview-toggle]');
    const drawer = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
    if (!controls || !drawer || !toggle || toggle.dataset.bound === 'true') return;
    toggle.dataset.bound = 'true';

    function setExpanded(expanded) {
      controls.classList.toggle('is-collapsed', !expanded);
      drawer.inert = !expanded;
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', expanded ? 'Hide design selectors' : 'Show design selectors');
      toggle.setAttribute('title', expanded ? 'Hide design selectors' : 'Show design selectors');
      if (!expanded) drawer.querySelectorAll('details[open]').forEach(function (details) {
        details.open = false;
      });
    }

    setExpanded(true);
    toggle.addEventListener('click', function () {
      setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  function bindIdentityHeadingControls() {
    const applicationHeader = document.getElementById('app-header-identity');
    const applicationShell = applicationHeader?.parentElement;

    function syncRenderedHeaderHeight() {
      if (!applicationHeader || !applicationShell) return;
      applicationShell.style.setProperty('--header-height', Math.ceil(applicationHeader.getBoundingClientRect().height) + 'px');
    }

    if (applicationHeader && applicationHeader.dataset.heightBound !== 'true') {
      applicationHeader.dataset.heightBound = 'true';
      syncRenderedHeaderHeight();
      if ('ResizeObserver' in window) {
        const headerObserver = new ResizeObserver(syncRenderedHeaderHeight);
        headerObserver.observe(applicationHeader);
      }
    }

    const rangeInputs = Array.from(document.querySelectorAll('[data-header-preview-range]'));
    rangeInputs.forEach(function (input) {
      if (input.dataset.bound === 'true') return;
      const identity = document.getElementById(input.getAttribute('aria-controls'));
      const property = input.dataset.cssProperty;
      const factor = Number(input.dataset.valueFactor || 1);
      const cssUnit = input.dataset.cssUnit || '';
      const ariaUnit = input.dataset.ariaUnit || '';
      if (!identity || !property || !Number.isFinite(factor)) return;
      input.dataset.bound = 'true';
      function applyValue() {
        const peers = rangeInputs.filter(function (candidate) {
          return candidate.getAttribute('aria-controls') === identity.id
            && candidate.dataset.cssProperty === property;
        });
        peers.forEach(function (peer) {
          peer.value = input.value;
          peer.setAttribute('aria-valuetext', input.value + ' ' + ariaUnit);
          const output = peer.closest('label')?.querySelector('output');
          if (output) output.textContent = input.value;
          peer.closest('[data-header-preview-controls]')?.style.setProperty(
            property,
            String(Number(input.value) * factor) + cssUnit
          );
        });
        identity.style.setProperty(property, String(Number(input.value) * factor) + cssUnit);
        syncRenderedHeaderHeight();
      }
      applyValue();
      input.addEventListener('input', applyValue);
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
    const mobileQuery = window.matchMedia('(max-width: 96rem)');

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
    const sectionNavigation = document.getElementById('section-navigation');
    const sidebarRailQuery = window.matchMedia('(min-width: 961px)');

    function syncSidebarNavigationState() {
      if (!sectionNavigation || !appBody) return;
      sectionNavigation.inert = sidebarRailQuery.matches &&
        appBody.classList.contains('sidebar-collapsed');
    }

    // Restore persisted collapse states
    if (appBody) {
      try {
        if (localStorage.getItem('opda-sidebar-collapsed') === '1') {
          appBody.classList.add('sidebar-collapsed');
          sidebarCollapse?.setAttribute('aria-expanded', 'false');
        }
        if (localStorage.getItem('opda-toc-collapsed') === '1') {
          appBody.classList.add('toc-collapsed');
        }
      } catch (e) {}
    }
    syncSidebarNavigationState();
    sidebarRailQuery.addEventListener('change', syncSidebarNavigationState);

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
            sidebarCollapse.setAttribute('aria-expanded', 'true');
            sidebarCollapse.setAttribute('aria-label', 'In this section — close navigation');
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
            sidebarCollapse.setAttribute('aria-expanded', String(!isCollapsed));
            sidebarCollapse.removeAttribute('aria-label');
            sidebarCollapse.removeAttribute('title');
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
        sidebarCollapse.setAttribute('aria-expanded', String(!nowCollapsed));
        syncSidebarNavigationState();
      });
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
    if (!article || article.dataset.disableToc === 'true') return;
    const headings = Array.from(article.querySelectorAll('h2[id], h3[id], h4[id]'));
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
      '<span class="rail-collapse-toggle__label toc-toggle__label">On this page</span>' +
      '<svg class="rail-collapse-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<g class="rail-glyph rail-glyph--toward-start">' +
          '<polyline points="13 6 7 12 13 18"/>' +
          '<polyline points="19 6 13 12 19 18"/>' +
        '</g>' +
        '<g class="rail-glyph rail-glyph--toward-end">' +
          '<polyline points="5 6 11 12 5 18"/>' +
          '<polyline points="11 6 17 12 11 18"/>' +
        '</g>' +
        '<polyline class="rail-glyph rail-glyph--inline-closed" points="9 6 15 12 9 18"/>' +
        '<polyline class="rail-glyph rail-glyph--inline-open" points="6 9 12 15 18 9"/>' +
      '</svg>';
    toc.appendChild(tocToggle);

    const ul = document.createElement('ul');
    ul.id = 'toc-links';
    const hierarchy = [{ level: 1, list: ul, item: null }];
    headings.forEach(function (h) {
      const level = Number(h.tagName.slice(1));
      while (hierarchy[hierarchy.length - 1].level >= level) hierarchy.pop();
      const parent = hierarchy[hierarchy.length - 1];
      let targetList = parent.list;
      if (parent.item) {
        targetList = parent.item.querySelector(':scope > ul');
        if (!targetList) {
          targetList = document.createElement('ul');
          targetList.className = 'toc-children';
          parent.item.appendChild(targetList);
        }
      }
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
      targetList.appendChild(li);
      hierarchy.push({ level: level, list: targetList, item: li });
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
      ul.inert = railMode && collapsed;
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
    syncHeaderConfigurationMode();
    bindHeaderPaletteSelector();
    bindHeaderPalettePagination();
    bindHeaderIconSelector();
    bindHeaderPreviewControls();
    bindIdentityHeadingControls();
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
  document.addEventListener('astro:before-swap', function (event) {
    ['data-theme', 'data-header-palette', 'data-header-icon'].forEach(function (attribute) {
      const value = document.documentElement.getAttribute(attribute);
      if (value) event.newDocument.documentElement.setAttribute(attribute, value);
    });
  });
  document.addEventListener('astro:page-load', runInitOnce);

  window.OPDA = { init: init };
})();
