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
          '<a href="' + hrefForSection('governance',     currentLoc) + '"' + cls('governance')     + '>Governance</a>' +
          '<a href="' + hrefForSection('modelling',      currentLoc) + '"' + cls('modelling')      + '>Modelling</a>' +
          '<a href="' + hrefForSection('engagement',     currentLoc) + '"' + cls('engagement')     + '>Engagement</a>' +
          '<a href="' + hrefForSection('adoption',       currentLoc) + '"' + cls('adoption')       + '>Adoption</a>' +
          '<a href="' + hrefForSection('implementation', currentLoc) + '"' + cls('implementation') + '>Implementation</a>' +
          '<a href="' + hrefForSection('strategy',       currentLoc) + '"' + cls('strategy')       + '>Strategy</a>' +
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
               '<div class="sidebar-section-title">' + escape(section.title) + '</div>' +
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

  function runMermaid() {
    if (!window.mermaid) return;
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
    const lightTheme = {
      primaryColor:       '#eef4f8',
      primaryBorderColor: '#1a4d80',
      primaryTextColor:   '#0b2545',
      lineColor:          '#475569',
      secondaryColor:     '#fef3c7',
      secondaryTextColor: '#7c2d12',
      tertiaryColor:      '#f7fafc',
      tertiaryTextColor:  '#0f172a',
      fontFamily, fontSize,
    };
    const darkTheme = {
      // Node fills, borders, text
      primaryColor:        '#1a4d80',
      primaryBorderColor:  '#7aaecf',
      primaryTextColor:    '#eef4f8',
      // Secondary cluster (used in subgraph classDefs / accent nodes)
      secondaryColor:      '#7c2d12',
      secondaryBorderColor:'#fcd34d',
      secondaryTextColor:  '#fde68a',
      tertiaryColor:       '#13315c',
      tertiaryTextColor:   '#e2e8f0',
      // Lines, labels, background
      lineColor:           '#94a3b8',
      textColor:           '#e2e8f0',
      mainBkg:             '#1a4d80',
      nodeBorder:          '#7aaecf',
      clusterBkg:          '#0f1729',
      clusterBorder:       '#334155',
      defaultLinkColor:    '#94a3b8',
      titleColor:          '#e2e8f0',
      edgeLabelBackground: '#0f1729',
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
        sequence:  { useMaxWidth: true },
        gantt:     { useMaxWidth: true },
      });
      window.mermaid.run({ querySelector: '.mermaid' }).catch(function (err) {
        console.warn('[OPDA] mermaid.run error:', err);
      });
    } catch (err) {
      console.warn('[OPDA] mermaid failed:', err);
    }
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
      } catch (err) {
        console.error('[OPDA] init failed:', err);
      }
    },
    // Exposed for index.html / landing pages to render content dynamically
    SECTIONS: SECTIONS,
    REFERENCE_ITEMS: REFERENCE_ITEMS,
  };
})();
