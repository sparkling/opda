/**
 * Explicit conditional-source protocol for ontology relationship diagrams.
 * Ordinary Mermaid is left untouched; only sources carrying the header opt in.
 */
export const MERMAID_PROPERTY_LAYER_HEADER = '%% opda:property-layers';

export const DEFAULT_MERMAID_PROPERTY_LAYERS = Object.freeze({
  datatype: false,
  object: true,
  inheritance: true,
});

const LAYERS = Object.freeze(['datatype', 'object', 'inheritance']);
const HEADER_RE = /^\s*%%\s*opda:property-layers\s*$/u;
const CONDITION_RE = /^\s*%%\s*opda:(when|unless)\s+(datatype|object|inheritance)\s*$/u;

export function mermaidPropertyLayerCondition(layer, line, condition = 'when') {
  if (!LAYERS.includes(layer)) throw new TypeError(`Unknown Mermaid property layer: ${layer}`);
  if (condition !== 'when' && condition !== 'unless') {
    throw new TypeError(`Unknown Mermaid property-layer condition: ${condition}`);
  }
  return [`%% opda:${condition} ${layer}`, line];
}

export function mermaidPropertyLayerCapabilities(source) {
  const lines = String(source).split('\n');
  if (!lines.some((line) => HEADER_RE.test(line))) {
    return { enabled: false, datatype: false, object: false, inheritance: false };
  }
  const capabilities = { enabled: true, datatype: false, object: false, inheritance: false };
  for (const line of lines) {
    const match = line.match(CONDITION_RE);
    if (match) capabilities[match[2]] = true;
  }
  return capabilities;
}

export function filterMermaidPropertyLayers(source, visibility = DEFAULT_MERMAID_PROPERTY_LAYERS) {
  const original = String(source);
  if (!original.split('\n').some((line) => HEADER_RE.test(line))) return original;

  const state = { ...DEFAULT_MERMAID_PROPERTY_LAYERS, ...visibility };
  const output = [];
  let includeNext = null;

  for (const line of original.split('\n')) {
    if (HEADER_RE.test(line)) continue;
    const condition = line.match(CONDITION_RE);
    if (condition) {
      const visible = Boolean(state[condition[2]]);
      includeNext = condition[1] === 'when' ? visible : !visible;
      continue;
    }
    if (includeNext !== null) {
      if (includeNext) output.push(line);
      includeNext = null;
      continue;
    }
    output.push(line);
  }

  return output.join('\n');
}
