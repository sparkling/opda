/* ==========================================================================
   OPDA Knowledge Base — mermaid-theme.js
   Drop-in Mermaid 11 theme configuration matching the warm-canvas system.
   
   Wire it into docs/ui/site.js where Mermaid is bootstrapped, like so:
   
     import { OPDA_MERMAID_THEME, applyMermaidTheme } from './mermaid-theme.js';
     applyMermaidTheme(window.mermaid);
   
   …or, if site.js is vanilla, include this file with a <script> tag BEFORE
   the call to mermaid.initialize(...) and use OPDA_MERMAID_THEME as the
   themeVariables block:
   
     mermaid.initialize({
       startOnLoad: true,
       theme: 'base',
       themeVariables: OPDA_MERMAID_THEME.light,
       // …rest of upstream config
     });
   
   The dark variant kicks in when data-theme="dark" is set on <html>.
   Re-render on theme-toggle by calling applyMermaidTheme() again and
   re-running mermaid.run() over the .mermaid blocks.
   ========================================================================== */

(function (root) {
  'use strict';

  /* Light — cream surface, terracotta border, ink text. */
  var LIGHT = {
    /* Core fills */
    primaryColor:        '#EFE9DE',  /* surface-card */
    primaryBorderColor:  '#CC785C',  /* terracotta-500 */
    primaryTextColor:    '#141413',  /* ink */
    secondaryColor:      '#F5F0E8',  /* surface-soft (cream-200-ish) */
    tertiaryColor:       '#E8E0D2',  /* cream-strong */

    /* Edges + decorations */
    lineColor:           '#6C6A64',  /* stone-700 */
    arrowheadColor:      '#6C6A64',
    edgeLabelBackground: '#FAF9F5',  /* canvas — same colour as page bg */

    /* Cluster (subgraph) */
    clusterBkg:          '#FAF9F5',
    clusterBorder:       '#E6DFD0',

    /* Notes */
    noteBkgColor:        '#FBF3EE',  /* terracotta-50 */
    noteBorderColor:     '#CC785C',
    noteTextColor:       '#141413',

    /* Typography */
    fontFamily:          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize:            '14px',
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
    attributeBackgroundColorEven: '#F4F1E8'
  };

  /* Dark — espresso surface, on-dark text, accent-teal as the secondary
     hue so diagrams don't read as monochrome terracotta on dark. */
  var DARK = {
    primaryColor:        '#211F1C',  /* surface-dark-alt */
    primaryBorderColor:  '#CC785C',  /* terracotta-500 stays as accent */
    primaryTextColor:    '#F7F3E9',  /* on-dark */
    secondaryColor:      '#2B2925',  /* surface-dark-tint */
    tertiaryColor:       '#34302B',  /* one step lighter */

    lineColor:           '#A8A097',  /* on-dark muted */
    arrowheadColor:      '#A8A097',
    edgeLabelBackground: '#181715',  /* surface-dark — match canvas */

    clusterBkg:          '#181715',
    clusterBorder:       '#34302B',

    noteBkgColor:        '#3A261D',  /* terracotta-100 (dark-flipped) */
    noteBorderColor:     '#CC785C',
    noteTextColor:       '#F7F3E9',

    fontFamily:          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize:            '14px',
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
    attributeBackgroundColorEven: '#181715'
  };

  function currentMode() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return 'dark';
    if (t === 'light') return 'light';
    return window.matchMedia &&
           window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  /* Initialise (or re-initialise) Mermaid against the current theme.
     Call once on page load; call again from the theme-toggle handler. */
  function applyMermaidTheme(mermaid) {
    if (!mermaid || typeof mermaid.initialize !== 'function') return;
    var mode = currentMode();
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: mode === 'dark' ? DARK : LIGHT,
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
      sequence:  { useMaxWidth: true, mirrorActors: false },
      er:        { useMaxWidth: true }
    });
  }

  root.OPDA_MERMAID_THEME = { light: LIGHT, dark: DARK };
  root.applyMermaidTheme = applyMermaidTheme;
})(typeof window !== 'undefined' ? window : this);
