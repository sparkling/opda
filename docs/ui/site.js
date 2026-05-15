/* OPDA Knowledge Base — site.js
 * Two top-level sections: Governance and Modelling.
 * Each page declares its section via OPDA.init({ page, section }).
 * Header renders a horizontal global menu with the two sections.
 * Sidebar renders only the items in the current section (contextual).
 */

(function () {
  'use strict';

  // Seven top-level sections + a small Reference group surfaced in the footer area.
  // Each item's `loc` is 'root' (docs/) or 'pages' (docs/pages/).
  const SECTIONS = {
    governance: {
      title: 'Governance',
      summary: 'How OPDA is governed, who governs it, the UK government initiative it sits inside, and the published rules that make the standard authoritative.',
      groups: [
        { heading: 'UK initiative context', items: [
          { id: 'uk-initiative',        file: '01-uk-initiative.html',        title: 'UK initiative — overview' },
          { id: 'legislation',          file: '02-legislation.html',          title: 'Legislation & policy' },
          { id: 'departments',          file: '03-departments.html',          title: 'Departments & bodies' },
          { id: 'steering-forums',      file: '04-steering-forums.html',      title: 'Steering & coordination' },
          { id: 'opda-members',         file: '11-opda-members.html',         title: 'OPDA member firms' },
          { id: 'sandbox',              file: '05-sandbox.html',              title: 'Trust Framework Sandbox' },
        ]},
        { heading: 'Governance framework', items: [
          { id: 'toip-governance',      file: '07-toip-governance.html',      title: 'ToIP governance model' },
          { id: 'strategic-alignment',  file: '08-strategic-alignment.html',  title: 'Strategic alignment' },
          { id: 'conformance-scheme',   file: '20-conformance-scheme.html',   title: 'Conformance & certification' },
          { id: 'change-management',    file: '21-change-management.html',    title: 'Change management' },
          { id: 'lifecycle-versioning', file: '22-lifecycle-versioning.html', title: 'Lifecycle & versioning' },
          { id: 'risk-liability',       file: '23-risk-liability.html',       title: 'Risk & liability' },
        ]},
      ],
    },
    modelling: {
      title: 'Modelling',
      summary: 'The technical semantic modelling work: standards stack, bounded contexts, data dictionary, business glossary, ontology, SHACL shapes, and the JSON-LD mappings that link them.',
      groups: [
        { heading: 'Foundations', items: [
          { id: 'standards-stack',      file: '06-standards-stack.html',      title: 'Standards stack' },
          { id: 'bounded-contexts',     file: '12-bounded-contexts.html',     title: 'Bounded contexts (DDD)' },
          { id: 'overlays',             file: '16-overlays.html',             title: 'PDTF overlays' },
        ]},
        { heading: 'Vocabulary & dictionary', items: [
          { id: 'data-dictionary',      file: '13-data-dictionary.html',      title: 'Data dictionary' },
          { id: 'business-glossary',    file: '14-business-glossary.html',    title: 'Business glossary' },
          { id: 'concept-taxonomy',     file: '30-concept-taxonomy.html',     title: 'Concept taxonomy (SKOS)' },
        ]},
        { heading: 'Formal semantic layer', items: [
          { id: 'ontology',             file: '31-ontology.html',             title: 'Ontology (OWL)' },
          { id: 'shacl-shapes',         file: '32-shacl-shapes.html',         title: 'SHACL shapes' },
          { id: 'jsonld-mappings',      file: '33-jsonld-mappings.html',      title: 'JSON-LD mappings' },
        ]},
      ],
    },
    schema: {
      title: 'Schema',
      summary: 'The physical architecture of the PDTF schema codebase — the three repositories, the base transaction schema, the overlay and extension files, the merge and validation engine, the exchange API, and the verifiable-credential trust layer.',
      groups: [
        { heading: 'Architecture', items: [
          { id: 'physical-architecture', file: '34-physical-architecture.html', title: 'Physical architecture' },
        ]},
      ],
    },
    engagement: {
      title: 'Engagement',
      summary: 'Where the work happens: working groups, steering group meetings, member updates, video content, and the activity log of the programme.',
      groups: [
        { heading: 'Activity', items: [
          { id: 'engagement-overview',  file: '40-engagement-overview.html',  title: 'Overview' },
          { id: 'meetings-decisions',   file: '41-meetings-decisions.html',   title: 'Meetings & decisions' },
          { id: 'working-groups',       file: '42-working-groups.html',       title: 'DPMSG working groups' },
        ]},
        { heading: 'Content', items: [
          { id: 'video-library',        file: '43-video-library.html',        title: 'Video library' },
          { id: 'transcripts',          file: '44-transcripts.html',          title: 'Transcripts index' },
        ]},
      ],
    },
    adoption: {
      title: 'Adoption',
      summary: 'Who is implementing PDTF, what they have built, lessons learned, and the public evidence that the framework works in practice.',
      groups: [
        { heading: 'Pilots & implementations', items: [
          { id: 'adoption-overview',    file: '50-adoption-overview.html',    title: 'Overview' },
          { id: 'member-implementations', file: '51-member-implementations.html', title: 'Member implementations' },
          { id: 'sandbox-pilots',       file: '54-sandbox-pilots.html',       title: 'Sandbox pilots' },
        ]},
        { heading: 'Programmes', items: [
          { id: 'smart-data-challenge', file: '52-smart-data-challenge.html', title: 'Smart Data Challenge' },
          { id: 'hmlr-llc',             file: '53-hmlr-llc.html',             title: 'HMLR LLC programme' },
        ]},
      ],
    },
    implementation: {
      title: 'Implementation',
      summary: 'How to build with PDTF: install the schemas package, compose overlays, validate transactions, work with verified claims and JSON-LD.',
      groups: [
        { heading: 'Getting started', items: [
          { id: 'impl-overview',        file: '60-implementation-overview.html', title: 'Overview' },
          { id: 'quickstart',           file: '61-quickstart.html',           title: 'Quickstart' },
        ]},
        { heading: 'Working with schemas', items: [
          { id: 'schema-composition',   file: '62-schema-composition.html',   title: 'Schema composition' },
          { id: 'validation',           file: '63-validation.html',           title: 'Validation' },
          { id: 'verified-claims',      file: '64-verified-claims.html',      title: 'Verified claims' },
        ]},
      ],
    },
    strategy: {
      title: 'Strategy',
      summary: 'The strategic context — UK Industrial Strategy, Smart Data Scheme sequencing, OPDA programme phases, and the project roadmap.',
      groups: [
        { heading: 'Plans', items: [
          { id: 'strategy-overview',    file: '70-strategy-overview.html',    title: 'Overview' },
          { id: 'project-roadmap',      file: '09-project-roadmap.html',      title: 'Project roadmap' },
          { id: 'programme-phases',     file: '71-programme-phases.html',     title: 'Programme phases' },
        ]},
        { heading: 'Wider context', items: [
          { id: 'industrial-strategy',  file: '72-industrial-strategy.html',  title: 'UK Industrial Strategy' },
        ]},
      ],
    },
    library: {
      title: 'Library',
      summary: 'A curated index of every document, transcript, recording, and external reference held in the project archive.',
      groups: [
        { heading: 'Holdings', items: [
          { id: 'library-overview',     file: '80-library-overview.html',     title: 'Overview' },
          { id: 'documents',            file: '81-document-archive.html',     title: 'Document archive' },
          { id: 'transcripts-archive',  file: '82-transcript-archive.html',   title: 'Transcript archive' },
        ]},
        { heading: 'External', items: [
          { id: 'external-references',  file: '83-external-references.html',  title: 'External references' },
        ]},
      ],
    },
  };

  // Items not in either section — accessible from the footer area on the home page.
  const REFERENCE_ITEMS = [
    { id: 'project-roadmap', file: '09-project-roadmap.html', title: 'Project roadmap',  loc: 'pages' },
    { id: 'glossary',        file: '10-glossary.html',        title: 'Glossary (acronyms)', loc: 'pages' },
    { id: 'design-system',   file: 'design-system.html',      title: 'Design system',    loc: 'root'  },
  ];

  // ── Path utilities ────────────────────────────────────────────────────────
  function detectLocation() {
    return window.location.pathname.includes('/pages/') ? 'pages' : 'root';
  }

  // Resolve href from current location to target item.
  // Section items live under pages/; landing pages (governance.html, modelling.html)
  // and index.html live at root.
  function hrefForPage(file, currentLoc) {
    return currentLoc === 'pages' ? file : 'pages/' + file;
  }
  function hrefForRoot(file, currentLoc) {
    return currentLoc === 'root' ? file : '../' + file;
  }
  function hrefForSection(sectionKey, currentLoc) {
    // Section landing pages live at root: governance.html, modelling.html
    return hrefForRoot(sectionKey + '.html', currentLoc);
  }

  function escape(s) {
    return String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  }

  // ── Header (with horizontal global menu) ──────────────────────────────────
  function renderHeader(activeSection, currentLoc) {
    const homeHref = hrefForRoot('index.html', currentLoc);
    const cls = (s) => activeSection === s ? ' class="active" aria-current="page"' : '';
    return (
      '<header class="app-header">' +
        '<a href="' + homeHref + '" class="brand-link">' +
          '<span class="brand-mark">OPDA</span>' +
          '<span class="brand-sub">Knowledge base</span>' +
        '</a>' +
        '<nav class="global-nav">' +
          // Logical flow: Why → Authority → Activity → What → How → Evidence → Archive
          '<a href="' + hrefForSection('strategy',       currentLoc) + '"' + cls('strategy')       + '>Strategy</a>' +
          '<a href="' + hrefForSection('governance',     currentLoc) + '"' + cls('governance')     + '>Governance</a>' +
          '<a href="' + hrefForSection('engagement',     currentLoc) + '"' + cls('engagement')     + '>Engagement</a>' +
          '<a href="' + hrefForSection('modelling',      currentLoc) + '"' + cls('modelling')      + '>Modelling</a>' +
          '<a href="' + hrefForSection('schema',         currentLoc) + '"' + cls('schema')         + '>Schema</a>' +
          '<a href="' + hrefForSection('implementation', currentLoc) + '"' + cls('implementation') + '>Implementation</a>' +
          '<a href="' + hrefForSection('adoption',       currentLoc) + '"' + cls('adoption')       + '>Adoption</a>' +
          '<a href="' + hrefForSection('library',        currentLoc) + '"' + cls('library')        + '>Library</a>' +
        '</nav>' +
        '<button class="menu-toggle" aria-label="Toggle sidebar" id="menu-toggle">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>' +
        '</button>' +
        '<nav class="header-nav">' +
          '<a href="https://openpropdata.org.uk" target="_blank" rel="noopener">openpropdata.org.uk</a>' +
          '<a href="https://propdata.org.uk" target="_blank" rel="noopener">propdata.org.uk</a>' +
          '<a href="https://github.com/Property-Data-Trust-Framework" target="_blank" rel="noopener">GitHub</a>' +
        '</nav>' +
        '<button class="theme-toggle" id="theme-toggle" aria-label="Toggle light/dark mode" title="Toggle light/dark mode">' +
          '<svg class="theme-icon theme-icon--sun"  viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66l1.42-1.42M4.92 19.08l1.42-1.42m11.32 0l1.42 1.42M4.92 4.92l1.42 1.42M12 7a5 5 0 100 10 5 5 0 000-10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '<svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>' +
        '</button>' +
      '</header>'
    );
  }

  // ── Theme toggle ──────────────────────────────────────────────────────────
  // Resolves the active theme from localStorage (if user toggled) or the
  // system preference (otherwise). Sets data-theme on <html> so CSS variables
  // remap. Mermaid is re-rendered after a switch.
  function resolveTheme() {
    var stored = null;
    try { stored = localStorage.getItem('opda-theme'); } catch (e) {}
    if (stored === 'light' || stored === 'dark') return stored;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
  function persistTheme(theme) {
    try { localStorage.setItem('opda-theme', theme); } catch (e) {}
  }
  function bindThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || resolveTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      persistTheme(next);
      // Mermaid renders the diagrams once at init; reset and re-run with new theme vars.
      restartMermaid();
    });
  }
  // Re-render Mermaid diagrams with current theme. Uses cached source text
  // so we can wipe the already-rendered SVG and ask mermaid to re-run.
  function restartMermaid() {
    if (!window.mermaid) return;
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (!el.dataset.mermaidSrc && !el.dataset.processed) {
        el.dataset.mermaidSrc = el.textContent.trim();
      }
      if (el.dataset.mermaidSrc) {
        el.textContent = el.dataset.mermaidSrc;
        el.removeAttribute('data-processed');
      }
    });
    runMermaid();
  }

  // ── Sidebar (contextual: only the current section's groups) ───────────────
  function renderSidebar(activeId, activeSection, currentLoc) {
    if (!activeSection || !SECTIONS[activeSection]) return ''; // No sidebar on home

    const section = SECTIONS[activeSection];
    const groupsHtml = section.groups.map(function (group) {
      const itemsHtml = group.items.map(function (it) {
        const cls = it.id === activeId ? ' class="active" aria-current="page"' : '';
        return '<li><a href="' + hrefForPage(it.file, currentLoc) + '"' + cls + '>' + escape(it.title) + '</a></li>';
      }).join('');
      return '<div class="nav-group"><h3>' + escape(group.heading) + '</h3><ul>' + itemsHtml + '</ul></div>';
    }).join('');

    return '<aside class="app-sidebar" id="app-sidebar">' +
             '<nav class="sidebar-nav">' +
               groupsHtml +
             '</nav>' +
           '</aside>';
  }

  function mountChrome(activeId, activeSection) {
    const root = document.getElementById('app');
    if (!root) { console.error('[OPDA] #app element not found'); return; }
    const currentLoc = detectLocation();
    const mainContent = root.innerHTML;

    try {
      const sidebar = renderSidebar(activeId, activeSection, currentLoc);
      root.innerHTML =
        renderHeader(activeSection, currentLoc) +
        '<div class="app-body' + (sidebar ? '' : ' no-sidebar') + '">' +
          sidebar +
          '<main class="app-main">' + mainContent + '</main>' +
        '</div>';
    } catch (err) {
      console.error('[OPDA] mountChrome failed; restoring original content', err);
      root.innerHTML = mainContent;
      return;
    }

    // Mobile sidebar toggle
    const toggle = document.getElementById('menu-toggle');
    const aside = document.getElementById('app-sidebar');
    if (toggle && aside) {
      toggle.addEventListener('click', function () { aside.classList.toggle('open'); });
      aside.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { aside.classList.remove('open'); });
      });
    }
  }

  function enhanceHeadings() {
    document.querySelectorAll('.prose h2[id], .prose h3[id]').forEach(function (h) {
      const link = document.createElement('a');
      link.href = '#' + h.id;
      link.className = 'heading-anchor';
      link.setAttribute('aria-label', 'Permalink');
      link.textContent = '#';
      h.appendChild(link);
    });
  }

  // Right-rail TOC — auto-built from h2/h3/h4 headings with ids.
  // Sticky on wide screens; hidden under 1280px (handled by CSS).
  function renderToc() {
    const article = document.querySelector('.prose');
    if (!article) return;
    const headings = article.querySelectorAll('h2[id], h3[id], h4[id]');
    if (headings.length < 3) return; // skip short pages

    const toc = document.createElement('aside');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'On this page');

    const titleEl = document.createElement('div');
    titleEl.className = 'toc-title';
    titleEl.textContent = 'On this page';
    toc.appendChild(titleEl);

    const ul = document.createElement('ul');
    headings.forEach(function (h) {
      const li = document.createElement('li');
      li.className = 'toc-level-' + h.tagName.toLowerCase(); // toc-level-h2 etc.
      const a  = document.createElement('a');
      a.href = '#' + h.id;
      // Use first text node only, so the appended "#" anchor (if any) is excluded.
      let label = '';
      for (let i = 0; i < h.childNodes.length; i++) {
        const n = h.childNodes[i];
        if (n.nodeType === 3) label += n.textContent;            // text
        else if (n.nodeType === 1 && !n.classList.contains('heading-anchor')) {
          label += n.textContent;                                // element (but not the # anchor)
        }
      }
      a.textContent = label.trim();
      a.setAttribute('data-toc-target', h.id);
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);

    // Mount as a sibling of .app-main inside .app-body — third grid column.
    const body = document.querySelector('.app-body');
    if (body) {
      body.appendChild(toc);
      body.classList.add('with-toc');
    } else {
      // Fallback: float right inside .prose (legacy positioning)
      article.insertBefore(toc, article.firstChild);
    }

    // Active-section highlight via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const linkById = {};
      toc.querySelectorAll('a[data-toc-target]').forEach(function (a) {
        linkById[a.getAttribute('data-toc-target')] = a;
      });
      let lastActive = null;
      const observer = new IntersectionObserver(function (entries) {
        // Pick the first heading currently in the upper portion of the viewport
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

  // Lazy-load Mermaid 11 + the ELK layout engine from CDN, once per page.
  // Mermaid 11 ships as an ESM module, so it's imported on demand rather than
  // via a <script> tag. registerLayoutLoaders wires in ELK, letting any diagram
  // opt into the ELK layout engine with `config: { layout: elk }` frontmatter.
  // Returns a Promise that resolves once window.mermaid is usable.
  function ensureMermaid() {
    if (window.mermaid) return Promise.resolve();
    if (!document.querySelector('.mermaid')) return Promise.resolve();   // page has no diagrams
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
      // Wait one paint frame so the surrounding grid (sidebar / TOC / main)
      // has finished its first layout pass — otherwise Mermaid measures a
      // zero/tiny container and pins the SVG max-width to that value.
      return new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            _runMermaidInner();
            installMermaidResizeObserver();
            resolve();
          });
        });
      });
    }).catch(function (err) {
      console.warn('[OPDA] mermaid load failed:', err);
    });
  }

  // Re-render Mermaid blocks whose container width changes meaningfully.
  // Guards against Gantt + large flowcharts that get squashed when measured
  // during page load — a later resize fixes them automatically.
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
        // Re-render on any meaningful change OR when starting from a tiny value
        if (Math.abs(w - prev) >= 30 || (prev < 200 && w >= 200)) rerunNeeded = true;
        lastWidth.set(e.target, w);
      });
      if (rerunNeeded) scheduleRerun();
    });

    document.querySelectorAll('.mermaid').forEach(function (el) {
      lastWidth.set(el, el.getBoundingClientRect().width);
      ro.observe(el);
    });

    // Also re-run on window load (full resource load) — guards against initial
    // mermaid render happening while images/fonts/grid are still settling.
    if (document.readyState !== 'complete') {
      window.addEventListener('load', scheduleRerun, { once: true });
    }
  }

  function _runMermaidInner() {
    // Theme: explicit data-theme attribute wins; fall back to system preference.
    const themeAttr = document.documentElement.getAttribute('data-theme');
    const isDark = themeAttr
      ? themeAttr === 'dark'
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Pin Mermaid font-size to a fixed px (not relative to the 109% root) so
    // node box measurements don't drift and clip the labels.
    const fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    const fontSize   = '14px';

    // Theme variables for light + dark — Mermaid uses the same key names.
    // Warm-canvas palette aligned with docs/ui/design-tokens.css.
    // Cream surface + terracotta borders + ink text (light); espresso surface
    // + cream-on-dark text + terracotta accent (dark).
    const lightTheme = {
      /* Core fills */
      primaryColor:        '#EFE9DE',  /* surface-card */
      primaryBorderColor:  '#CC785C',  /* terracotta-500 */
      primaryTextColor:    '#141413',  /* ink */
      secondaryColor:      '#F5F0E8',  /* surface-soft */
      tertiaryColor:       '#E8E0D2',  /* cream-strong */
      /* Edges + decorations */
      lineColor:           '#6C6A64',  /* stone-700 */
      arrowheadColor:      '#6C6A64',
      edgeLabelBackground: '#FAF9F5',  /* canvas — match page bg */
      /* Cluster (subgraph) */
      clusterBkg:          '#FAF9F5',
      clusterBorder:       '#E6DFD0',
      /* Notes */
      noteBkgColor:        '#FBF3EE',  /* terracotta-50 */
      noteBorderColor:     '#CC785C',
      noteTextColor:       '#141413',
      /* Typography */
      titleColor:          '#141413',
      labelColor:          '#3D3D3A',
      nodeTextColor:       '#141413',
      /* Sequence / flow specifics */
      actorBkg:            '#EFE9DE',
      actorBorder:         '#CC785C',
      actorTextColor:      '#141413',
      actorLineColor:      '#6C6A64',
      signalColor:         '#3D3D3A',
      signalTextColor:     '#141413',
      sectionBkgColor:     '#F5F0E8',
      sectionBkgColor2:    '#E8E0D2',
      /* ER */
      attributeBackgroundColorOdd:  '#FAF9F5',
      attributeBackgroundColorEven: '#F4F1E8',
      fontFamily, fontSize,
    };
    const darkTheme = {
      /* Espresso surface, on-dark text, terracotta accent stays warm. */
      primaryColor:        '#211F1C',  /* surface-dark-alt */
      primaryBorderColor:  '#CC785C',  /* terracotta-500 (accent in dark too) */
      primaryTextColor:    '#F7F3E9',  /* on-dark */
      secondaryColor:      '#2B2925',  /* surface-dark-tint */
      tertiaryColor:       '#34302B',
      lineColor:           '#A8A097',  /* on-dark muted */
      arrowheadColor:      '#A8A097',
      edgeLabelBackground: '#181715',  /* surface-dark — match canvas */
      clusterBkg:          '#181715',
      clusterBorder:       '#34302B',
      noteBkgColor:        '#3A261D',  /* terracotta-100 (dark-flipped) */
      noteBorderColor:     '#CC785C',
      noteTextColor:       '#F7F3E9',
      titleColor:          '#F7F3E9',
      labelColor:          '#E8E2D4',
      nodeTextColor:       '#F7F3E9',
      actorBkg:            '#211F1C',
      actorBorder:         '#CC785C',
      actorTextColor:      '#F7F3E9',
      actorLineColor:      '#A8A097',
      signalColor:         '#E8E2D4',
      signalTextColor:     '#F7F3E9',
      sectionBkgColor:     '#211F1C',
      sectionBkgColor2:    '#2B2925',
      attributeBackgroundColorOdd:  '#211F1C',
      attributeBackgroundColorEven: '#181715',
      fontFamily, fontSize,
    };

    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: isDark ? darkTheme : lightTheme,
        flowchart: {
          curve: 'basis',
          useMaxWidth: true,
          htmlLabels: true,
          padding: 18,        // breathing room inside each node box
          nodeSpacing: 36,
          rankSpacing: 50,
        },
        sequence:  { useMaxWidth: true, mirrorActors: false },
        gantt:     { useMaxWidth: true },
        er:        { useMaxWidth: true },
      });
      window.mermaid.run({ querySelector: '.mermaid' })
        .then(function () { applyMermaidClassDefOverrides(isDark); })
        .catch(function (err) { console.warn('[OPDA] mermaid.run error:', err); });
    } catch (err) {
      console.warn('[OPDA] mermaid failed:', err);
    }
  }

  // Mermaid renders per-classDef styles inside each SVG with a selector like
  //   #mermaid-{id} .primary > * { fill:#eef4f8 !important; }
  // The #id raises specificity above anything we can write in our external CSS
  // file, so the only reliable override is inline style — which is what this
  // walker does. Runs once after each mermaid.run() completes.
  function applyMermaidClassDefOverrides(isDark) {
    if (!isDark) {
      // Light mode: strip any inline fills + text colours we set in a previous dark render
      document.querySelectorAll('.mermaid svg .node, .mermaid svg .cluster').forEach(function (n) {
        n.querySelectorAll('rect, polygon, circle, ellipse, path').forEach(function (s) {
          s.style.removeProperty('fill');
          s.style.removeProperty('stroke');
        });
        n.querySelectorAll('foreignObject *, .nodeLabel, .cluster-label, .cluster-label *, text, tspan').forEach(function (t) {
          t.style.removeProperty('color');
          t.style.removeProperty('fill');
        });
      });
      return;
    }
    // Mapping of classDef name → dark-mode fill (and optional stroke).
    var DARK_FILL = {
      // government / policy / forum
      gov: '#172554', act: '#172554', policy: '#172554', forum: '#172554',
      body: '#172554', regulator: '#172554',
      // outputs / delivery
      out: '#052e16', del: '#052e16', ops: '#052e16', tech: '#052e16',
      // forms / process — deep amber
      form: '#431407', proc: '#431407', step: '#431407',
      // phase clusters (project roadmap subgraphs) + their task children
      phase: '#13315c', task: '#0b1220', milestone: '#431407',
      // primary / source / std / etc.
      src: '#0b2545', std: '#0b2545', ext: '#0b2545', primary: '#0b2545',
      proptech: '#0b2545', conv: '#0b2545', portal: '#0b2545', search: '#0b2545',
      root: '#0b2545', strat: '#0b2545', tier: '#0b2545', sg: '#0b2545',
      wg: '#0b2545', lender: '#0b2545',
      // accents
      opda: '#13315c', pl: '#13315c', l4: '#13315c',
      l1: '#0b2545', l2: '#13315c', l3: '#1a4d80',
      // schema physical-architecture page
      base: '#0b2545', overlay: '#431407', engine: '#134e4a',
      api: '#1e1b4b', trust: '#3b0764',
      // overlays page: bounded context, main overlay, extension overlay, done
      ctx: '#13315c', ovl: '#2b2925', extn: '#5f342a', done: '#052e16',
    };
    var DARK_STROKE = {
      opda: '#7aaecf', pl: '#7aaecf', l4: '#7aaecf',
      phase: '#4a90c2', task: '#475569',
      ctx: '#7aaecf', ovl: '#a8a39a', extn: '#d4877a', done: '#7aaecf',
    };

    // Walk both nodes AND clusters (subgraphs render as .cluster, not .node).
    document.querySelectorAll('.mermaid svg .node, .mermaid svg .cluster').forEach(function (node) {
      var classes = (node.getAttribute('class') || '').split(/\s+/);
      var fill = null, stroke = null;
      for (var i = 0; i < classes.length; i++) {
        if (DARK_FILL[classes[i]])   { fill   = DARK_FILL[classes[i]]; }
        if (DARK_STROKE[classes[i]]) { stroke = DARK_STROKE[classes[i]]; }
        if (fill) break;
      }
      if (!fill) return;
      node.querySelectorAll('rect, polygon, circle, ellipse, path').forEach(function (shape) {
        // Must use setProperty(name, value, 'important') — Mermaid's internal
        // .className > * { fill: X !important; } rule beats inline styles
        // unless our inline style also carries !important.
        shape.style.setProperty('fill', fill, 'important');
        if (stroke) shape.style.setProperty('stroke', stroke, 'important');
      });
      // Also force a readable label colour. The classDef's `color:` is set on
      // the parent .label element via Mermaid's internal !important CSS, so we
      // need !important inline on every text-bearing descendant.
      var TEXT = '#eef4f8';
      node.querySelectorAll('foreignObject *, .nodeLabel, .cluster-label, .cluster-label *').forEach(function (t) {
        t.style.setProperty('color', TEXT, 'important');
      });
      node.querySelectorAll('text, tspan').forEach(function (t) {
        t.style.setProperty('fill', TEXT, 'important');
      });
    });
  }

  // Click any rendered diagram to open a fullscreen pan/zoom viewer.
  // Ported from the diagramming-skill markdown-export HTML viewer, adapted for
  // inline SVG (so the .mermaid-scoped dark-mode CSS still applies to the clone).
  // Controls: wheel = zoom centred on cursor, drag = pan, dbl-click = fit/1:1,
  //           Esc / × button / Close button = close, +/-/0/1 keys mirror the
  //           control bar. Pinch + drag for touch.
  function bindDiagramLightbox() {
    let overlay, canvas, label, content;
    let scale = 1, panX = 0, panY = 0;
    let isDragging = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;
    let natW = 0, natH = 0;
    let lastTouches = null;

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
        const btn = e.target.closest('button');
        if (!btn) return;
        const a = btn.getAttribute('data-act');
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
      // Read the rendered size BEFORE cloning so pan/zoom has a stable base.
      const r = svg.getBoundingClientRect();
      natW = r.width  || 800;
      natH = r.height || 600;
      // Wrap in .mermaid so the dark-mode CSS rules (row-rect overrides etc.)
      // still match inside the lightbox.
      const wrap = document.createElement('div');
      wrap.className = 'mermaid';
      const clone = svg.cloneNode(true);
      clone.removeAttribute('width');
      clone.removeAttribute('height');
      clone.style.display = 'block';
      // Pin the clone to the natural rendered size so transform: scale() is
      // multiplicative on a known base.
      wrap.style.width  = natW + 'px';
      wrap.style.height = natH + 'px';
      wrap.appendChild(clone);
      canvas.appendChild(wrap);
      content = wrap;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Defer fit until after layout so canvas.clientWidth/Height are populated.
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
      const vw = canvas.clientWidth, vh = canvas.clientHeight;
      // SVGs are vector — allow scaling above 1.0 to fill the viewport.
      const fitScale = Math.min(vw / natW, vh / natH) * 0.95;
      scale = fitScale;
      panX  = (vw - natW * scale) / 2;
      panY  = (vh - natH * scale) / 2;
      update();
    }
    function zoom(dir) {
      const cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
      const factor = dir > 0 ? 1.25 : 0.8;
      const newScale = Math.min(Math.max(scale * factor, 0.05), 20);
      panX = cx - (cx - panX) * (newScale / scale);
      panY = cy - (cy - panY) * (newScale / scale);
      scale = newScale;
      update();
    }
    function setZoom(z) {
      const cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
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
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newScale = Math.min(Math.max(scale * factor, 0.05), 20);
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
        const oldDist = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
        const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const factor = newDist / oldDist;
        let mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = canvas.getBoundingClientRect();
        mx -= rect.left; my -= rect.top;
        const newScale = Math.min(Math.max(scale * factor, 0.05), 20);
        panX = mx - (mx - panX) * (newScale / scale);
        panY = my - (my - panY) * (newScale / scale);
        scale = newScale;
        update();
        lastTouches = Array.from(e.touches);
      }
      e.preventDefault();
    }
    function onTouchEnd() {
      isDragging = false;
      lastTouches = null;
    }
    // Delegated click on diagram SVGs
    document.body.addEventListener('click', function (e) {
      const svg = e.target.closest && e.target.closest('.diagram .mermaid svg');
      if (!svg) return;
      if (overlay && overlay.classList.contains('open')) return;
      e.preventDefault();
      open(svg);
    });
    document.addEventListener('keydown', function (e) {
      if (!overlay || !overlay.classList.contains('open')) return;
      if (e.key === 'Escape')                         close();
      else if (e.key === '+' || e.key === '=')        zoom(1);
      else if (e.key === '-')                         zoom(-1);
      else if (e.key === '0')                         reset();
      else if (e.key === '1')                         setZoom(1);
    });
  }

  // Helper: auto-detect section from active page id
  function sectionForPage(pageId) {
    for (const key in SECTIONS) {
      for (const group of SECTIONS[key].groups) {
        for (const item of group.items) {
          if (item.id === pageId) return key;
        }
      }
    }
    return null;
  }

  window.OPDA = {
    init: function (opts) {
      const page = (opts && opts.page) || '';
      const section = (opts && opts.section) || sectionForPage(page);
      try {
        // Apply theme BEFORE mountChrome so any data-theme-aware CSS catches up
        applyTheme(resolveTheme());
        mountChrome(page, section);
        bindThemeToggle();
        renderToc();       // before enhanceHeadings so heading text is clean
        enhanceHeadings();
        // Cache original Mermaid source BEFORE rendering so theme toggle can re-run
        document.querySelectorAll('.mermaid').forEach(function (el) {
          if (!el.dataset.mermaidSrc) el.dataset.mermaidSrc = el.textContent.trim();
        });
        runMermaid();
        bindDiagramLightbox();
      } catch (err) {
        console.error('[OPDA] init failed:', err);
      }
    },
    // Exposed for index.html / landing pages to render content dynamically
    SECTIONS: SECTIONS,
    REFERENCE_ITEMS: REFERENCE_ITEMS,
  };
})();
