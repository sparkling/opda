import source0 from '../../../../docs/working/modelling-learning/representations.html?raw';
import source1 from '../../../../docs/working/modelling-learning/sentence.html?raw';
import source2 from '../../../../docs/working/modelling-learning/identity.html?raw';
import source3 from '../../../../docs/working/modelling-learning/property-story.html?raw';
import source4 from '../../../../docs/working/modelling-learning/method.html?raw';
import source5 from '../../../../docs/working/modelling-learning/qualified-relationship.html?raw';
import source6 from '../../../../docs/working/modelling-learning/roles.html?raw';
import source7 from '../../../../docs/working/modelling-learning/measurement.html?raw';
import source8 from '../../../../docs/working/modelling-learning/clocks.html?raw';
import source9 from '../../../../docs/working/modelling-learning/evidence.html?raw';
import source10 from '../../../../docs/working/modelling-learning/vocabulary.html?raw';
import source11 from '../../../../docs/working/modelling-learning/boundaries.html?raw';
import source12 from '../../../../docs/working/modelling-learning/mapping.html?raw';
import source13 from '../../../../docs/working/modelling-learning/rule.html?raw';
import source14 from '../../../../docs/working/modelling-learning/permissions.html?raw';
import source15 from '../../../../docs/working/modelling-learning/candidate.html?raw';

// Compile-time repository-owned masters only. No arbitrary path, remote markup
// or user-supplied expression enters set:html.
const sources = {
  'representations': source0,
  'sentence': source1,
  'identity': source2,
  'property-story': source3,
  'method': source4,
  'qualified-relationship': source5,
  'roles': source6,
  'measurement': source7,
  'clocks': source8,
  'evidence': source9,
  'vocabulary': source10,
  'boundaries': source11,
  'mapping': source12,
  'rule': source13,
  'permissions': source14,
  'candidate': source15,
  change: source0,
} as const;
export type LearningDiagramKind = keyof typeof sources;

const required = (source: string, expression: RegExp, label: string) => {
  const value = source.match(expression)?.[1];
  if (!value) throw new Error('Learning diagram missing ' + label);
  return value;
};
const decode = (text: string) => text.replace(/&(amp|lt|gt|quot|apos);/g,
  (_, entity: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity] ?? entity));

export function learningDiagramSource(kind: LearningDiagramKind, instance: string) {
  if (!Object.hasOwn(sources, kind)) throw new Error('Unknown learning diagram');
  if (!/^learning-[a-z0-9-]+$/.test(instance)) throw new Error('Invalid learning-diagram ID');
  const source = sources[kind];
  const raw = required(source, /(<svg\b[\s\S]*?<\/svg>)/, 'SVG');
  const prefix = required(raw, /id="([^"]+-light)"/, 'source prefix');
  const title = decode(required(raw, /<title[^>]*>([^<]+)<\/title>/, 'title'));
  const description = decode(required(raw, /<desc[^>]*>([^<]+)<\/desc>/, 'description'));
  const equivalent = required(source, /(<ol class="learning-equivalent">[\s\S]*?<\/ol>)/, 'text equivalent');
  return { title, description, equivalent, svg: raw.replaceAll(prefix, instance) };
}
