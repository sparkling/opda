/** Shared, presentation-only helpers for Property Pack Mermaid projections. */
export function escapeDiagramHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function wrapDiagramLabel(value, width = 26) {
  const words = String(value).trim().split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.map(escapeDiagramHtml).join('<br/>');
}

export function diagramPreamble(title, description, direction = 'LR') {
  return [
    '---', 'config:', '  layout: elk', '---', `flowchart ${direction}`,
    `  accTitle: ${title}`, `  accDescr: ${description}`, '',
  ];
}

export function diagramNodeId(index) {
  return `term_${index}`;
}
