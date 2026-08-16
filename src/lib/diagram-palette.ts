/**
 * Shared OPDA Mermaid palette and theme variables for GraphDiagram.
 *
 * Pages author semantic classes such as `:::user` or `:::success`; the
 * renderer injects this single source of colour and type. Architecture classes
 * follow the ordered categorical palette in DESIGN.md. Status classes use the
 * exact semantic foreground/surface pairs. Dark-mode strokes are lifted only
 * where the source categorical value would fall below the 3:1 UI threshold.
 */

export const CLASSDEFS_LIGHT: string[] = [
  'classDef infra fill:#E9F0FA,stroke:#4E6E93,stroke-width:2px,color:#231F2F',
  'classDef service fill:#EDF3E2,stroke:#58810B,stroke-width:2px,color:#231F2F',
  'classDef data fill:#FBF1DA,stroke:#C77F00,stroke-width:2px,color:#231F2F',
  'classDef user fill:#F5E8F1,stroke:#A5317F,stroke-width:2px,color:#231F2F',
  'classDef process fill:#EEEBFA,stroke:#6C5BD4,stroke-width:2px,color:#231F2F',
  'classDef security fill:#E4F3F0,stroke:#0E8478,stroke-width:2px,color:#231F2F',
  'classDef external fill:#F0EEF2,stroke:#6E6580,stroke-width:2px,color:#231F2F',
  'classDef xsection fill:#F8EBE5,stroke:#C24E1A,stroke-width:1.5px,color:#231F2F,stroke-dasharray:6 3',
  'classDef upper fill:#F1F0F4,stroke:#817C90,stroke-width:1px,color:#4A4558,stroke-dasharray:2 2',
  'classDef success fill:#E7F4ED,stroke:#1E7B4D,stroke-width:2px,color:#1E7B4D',
  'classDef warning fill:#FBF1DA,stroke:#8A5A00,stroke-width:2px,color:#8A5A00',
  'classDef error fill:#FBEAE8,stroke:#B42318,stroke-width:2px,color:#B42318',
  'classDef info fill:#E9F0FA,stroke:#2E5FA3,stroke-width:2px,color:#2E5FA3',
  'classDef neutral fill:#F1F0F4,stroke:#625D72,stroke-width:2px,color:#4A4558',
];

export const CLASSDEFS_DARK: string[] = [
  'classDef infra fill:#231F2F,stroke:#7F9DBD,stroke-width:2px,color:#F9F9F9',
  'classDef service fill:#231F2F,stroke:#8CAD4D,stroke-width:2px,color:#F9F9F9',
  'classDef data fill:#231F2F,stroke:#DCA23A,stroke-width:2px,color:#F9F9F9',
  'classDef user fill:#231F2F,stroke:#D77ABB,stroke-width:2px,color:#F9F9F9',
  'classDef process fill:#231F2F,stroke:#9A8FE8,stroke-width:2px,color:#F9F9F9',
  'classDef security fill:#231F2F,stroke:#55B7AE,stroke-width:2px,color:#F9F9F9',
  'classDef external fill:#231F2F,stroke:#9C93AA,stroke-width:2px,color:#F9F9F9',
  'classDef xsection fill:#231F2F,stroke:#E28159,stroke-width:1.5px,color:#F9F9F9,stroke-dasharray:6 3',
  'classDef upper fill:#231F2F,stroke:#817C90,stroke-width:1px,color:#A5A1B2,stroke-dasharray:2 2',
  'classDef success fill:#231F2F,stroke:#66C28F,stroke-width:2px,color:#66C28F',
  'classDef warning fill:#231F2F,stroke:#FFB84D,stroke-width:2px,color:#FFB84D',
  'classDef error fill:#231F2F,stroke:#FF958A,stroke-width:2px,color:#FF958A',
  'classDef info fill:#231F2F,stroke:#7FB5FF,stroke-width:2px,color:#7FB5FF',
  'classDef neutral fill:#231F2F,stroke:#A5A1B2,stroke-width:2px,color:#F9F9F9',
];

const FONT = { fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '14px' };

export const THEMEVARS_LIGHT: Record<string, string> = {
  primaryColor: '#F1F0F4', primaryBorderColor: '#6C5BD4', primaryTextColor: '#231F2F',
  secondaryColor: '#F9F9F9', tertiaryColor: '#E3E1E9',
  lineColor: '#625D72', arrowheadColor: '#625D72', edgeLabelBackground: '#FFFFFF',
  clusterBkg: '#F9F9F9', clusterBorder: '#CBC8D5',
  noteBkgColor: '#FBF1DA', noteBorderColor: '#8A5A00', noteTextColor: '#231F2F',
  titleColor: '#131224', labelColor: '#231F2F', nodeTextColor: '#231F2F',
  background: '#FFFFFF', mainBkg: '#F1F0F4', ...FONT,
};

export const THEMEVARS_DARK: Record<string, string> = {
  primaryColor: '#231F2F', primaryBorderColor: '#9A8FE8', primaryTextColor: '#F9F9F9',
  secondaryColor: '#2C273B', tertiaryColor: '#3A3550',
  lineColor: '#A5A1B2', arrowheadColor: '#A5A1B2', edgeLabelBackground: '#131224',
  clusterBkg: '#131224', clusterBorder: '#3A3550',
  noteBkgColor: '#231F2F', noteBorderColor: '#FFB84D', noteTextColor: '#F9F9F9',
  titleColor: '#F9F9F9', labelColor: '#A5A1B2', nodeTextColor: '#F9F9F9',
  background: '#131224', mainBkg: '#231F2F', ...FONT,
};
