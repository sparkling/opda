import source0 from '../../../../docs/working/modelling-judgement/four-axes.html?raw';
import source1 from '../../../../docs/working/modelling-judgement/identity-change.html?raw';
import source2 from '../../../../docs/working/modelling-judgement/classes-roles-phases.html?raw';
import source3 from '../../../../docs/working/modelling-judgement/relationships.html?raw';
import source4 from '../../../../docs/working/modelling-judgement/mapping-boundaries.html?raw';
import source5 from '../../../../docs/working/modelling-judgement/evidence-time.html?raw';
import source6 from '../../../../docs/working/modelling-judgement/meaning-applicability-constraints.html?raw';
import source7 from '../../../../docs/working/modelling-judgement/source-evidence.html?raw';

/* Only compile-time, repository-owned authoring sources enter the renderer.
   No fetched markup, arbitrary path, SVG upload, or runtime expression is accepted. */
const sources = {
  'four-axes': source0,
  'identity-change': source1,
  'classes-roles-phases': source2,
  'relationships': source3,
  'mapping-boundaries': source4,
  'evidence-time': source5,
  'meaning-applicability-constraints': source6,
  'source-evidence': source7,
} as const;
export type JudgementDiagramKind = keyof typeof sources;

function requiredMatch(source: string, pattern: RegExp, label: string): string {
  const result = source.match(pattern)?.[1];
  if (!result) throw new Error(`Judgement source has no ${label}`);
  return result;
}

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const textFromXml = (value: string) => value.replace(/&(amp|lt|gt|quot|apos);/g, (_, entity) => entities[entity]);
const xmlCharacters: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const textToXml = (value: string) => value.replace(/[&<>"']/g, (character) => xmlCharacters[character]);

export function judgementSource(kind: JudgementDiagramKind, instance: string, caption?: string) {
  if (!Object.hasOwn(sources, kind)) throw new Error('Unknown judgement-diagram kind');
  if (!/^judgement-[a-z0-9-]+$/.test(instance)) throw new Error('Invalid judgement-diagram ID');
  const source = sources[kind];
  const svg = requiredMatch(source, /(<svg\b[\s\S]*?<\/svg>)/, 'accessible SVG');
  const title = textFromXml(requiredMatch(svg, /<title\b[^>]*>([^<]+)<\/title>/, 'title'));
  const description = caption ?? textFromXml(requiredMatch(svg, /<desc\b[^>]*>([^<]+)<\/desc>/, 'description'));
  const equivalent = requiredMatch(source, /(<ol class="judgement-equivalent">[\s\S]*?<\/ol>)/, 'text equivalent');
  const accessibleSvg = svg.replace(/(<desc\b[^>]*>)[\s\S]*?(<\/desc>)/,
    (_, open, close) => `${open}${textToXml(description)}${close}`);
  return { title, description, equivalent, svg: accessibleSvg.replaceAll(`${kind}-light`, instance) };
}
