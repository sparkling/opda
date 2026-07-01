/**
 * Shared Mermaid palette + theme variables for the GraphDiagram island
 * (src/scripts/graph-diagram*). Mirrors the Cagle classDefs + Claude theme
 * `public/ui/client.js` uses for the legacy `.mermaid` renderer, so the
 * ontology diagrams look identical whichever engine renders them. Pages author
 * bare `:::user` / `:::xsection` / `:::upper` etc.; the renderer injects the
 * matching classDef block (light or dark) after the diagram-type line, exactly
 * as client.js's `spliceCageClassDefs` does.
 *
 * ODR diagram convention: NEVER hardcode `%%{init}%%` / classDef in a page —
 * this module is the single palette source for the island engine.
 */

/** Cagle palette classDefs — light mode. Injected after the flowchart/graph line. */
export const CLASSDEFS_LIGHT: string[] = [
  'classDef infra fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1',
  'classDef service fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20',
  'classDef data fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100',
  'classDef user fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C',
  'classDef process fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B',
  'classDef security fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:#004D40',
  'classDef external fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238',
  'classDef xsection fill:#E3EEF3,stroke:#4F7A8C,stroke-width:1.5px,color:#2C4A57,stroke-dasharray:6 3',
  'classDef upper fill:#EEEEEE,stroke:#9E9E9E,stroke-width:1px,color:#5F5F5F,stroke-dasharray:2 2',
  'classDef success fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20',
  'classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17',
  'classDef error fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C',
  'classDef info fill:#BBDEFB,stroke:#1565C0,stroke-width:2px,color:#0D47A1',
  'classDef neutral fill:#F5F5F5,stroke:#757575,stroke-width:2px,color:#424242',
];

/** Cagle palette classDefs — dark mode. */
export const CLASSDEFS_DARK: string[] = [
  'classDef infra fill:#0D2137,stroke:#42A5F5,stroke-width:2px,color:#90CAF9',
  'classDef service fill:#0D2818,stroke:#66BB6A,stroke-width:2px,color:#A5D6A7',
  'classDef data fill:#2E1500,stroke:#FFA726,stroke-width:2px,color:#FFCC80',
  'classDef user fill:#1A0A2E,stroke:#BA68C8,stroke-width:2px,color:#E1BEE7',
  'classDef process fill:#012830,stroke:#4DD0E1,stroke-width:2px,color:#B2EBF2',
  'classDef security fill:#002A22,stroke:#4DB6AC,stroke-width:2px,color:#B2DFDB',
  'classDef external fill:#211A17,stroke:#D7CCC8,stroke-width:2px,color:#EFEBE9',
  'classDef xsection fill:#0E2030,stroke:#7FA8BD,stroke-width:1.5px,color:#AECBD6,stroke-dasharray:6 3',
  'classDef upper fill:#161616,stroke:#5E5E5E,stroke-width:1px,color:#9E9E9E,stroke-dasharray:2 2',
  'classDef success fill:#0D2818,stroke:#66BB6A,stroke-width:2px,color:#A5D6A7',
  'classDef warning fill:#2E2400,stroke:#FFEE58,stroke-width:2px,color:#FFF59D',
  'classDef error fill:#2A0A0A,stroke:#EF5350,stroke-width:2px,color:#EF9A9A',
  'classDef info fill:#0D2137,stroke:#42A5F5,stroke-width:2px,color:#90CAF9',
  'classDef neutral fill:#1E1E1E,stroke:#9E9E9E,stroke-width:2px,color:#BDBDBD',
];

const FONT = { fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontSize: '14px' };

/** Mermaid `themeVariables` — light (the Claude cream/terracotta theme). */
export const THEMEVARS_LIGHT: Record<string, string> = {
  primaryColor: '#EFE9DE', primaryBorderColor: '#CC785C', primaryTextColor: '#141413',
  secondaryColor: '#F5F0E8', tertiaryColor: '#E8E0D2',
  lineColor: '#6C6A64', arrowheadColor: '#6C6A64', edgeLabelBackground: '#FAF9F5',
  clusterBkg: '#FAF9F5', clusterBorder: '#E6DFD0',
  noteBkgColor: '#FBF3EE', noteBorderColor: '#CC785C', noteTextColor: '#141413',
  titleColor: '#141413', labelColor: '#3D3D3A', nodeTextColor: '#141413',
  background: '#FAF9F5', mainBkg: '#EFE9DE', ...FONT,
};

/** Mermaid `themeVariables` — dark. */
export const THEMEVARS_DARK: Record<string, string> = {
  primaryColor: '#2B2823', primaryBorderColor: '#CC785C', primaryTextColor: '#EFE9DE',
  secondaryColor: '#36322C', tertiaryColor: '#3D3935',
  lineColor: '#A8A39B', arrowheadColor: '#A8A39B', edgeLabelBackground: '#1F1D1A',
  clusterBkg: '#1F1D1A', clusterBorder: '#3D3935',
  noteBkgColor: '#3D2A22', noteBorderColor: '#CC785C', noteTextColor: '#EFE9DE',
  titleColor: '#EFE9DE', labelColor: '#C4BEB1', nodeTextColor: '#EFE9DE',
  background: '#1F1D1A', mainBkg: '#2B2823', ...FONT,
};
