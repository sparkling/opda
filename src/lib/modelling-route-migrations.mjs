/** A subsequent information reframe, not a rewrite of any frozen route receipt. */
export const MODELLING_REDESIGN = Object.freeze({
  date: '2026-09-05',
  baselineRevision: 'e1e22dc8',
  scope: '/semantic-modelling',
  kind: 'information-reframe',
});

/** Canonical paths only. Fragment continuity is handled by the destination pages. */
export const MODELLING_REDESIGN_REPLACEMENTS = Object.freeze({
  '/semantic-modelling/why-ontologies': '/semantic-modelling/understand/shared-meaning',
  '/semantic-modelling/benefits': '/semantic-modelling/understand/shared-meaning',
  '/semantic-modelling/taking-part': '/semantic-modelling/contribute',
  '/semantic-modelling/reading-the-model': '/semantic-modelling/understand/a-property-story',
  '/semantic-modelling/questions': '/semantic-modelling/understand',
  '/semantic-modelling/modelling-method': '/semantic-modelling/method',
  '/semantic-modelling/principles': '/semantic-modelling/method',
  '/semantic-modelling/coverage': '/semantic-modelling/method/scope-and-package',
  '/semantic-modelling/bounded-contexts': '/semantic-modelling/explore/contexts-and-connections',
  '/semantic-modelling/context-maps': '/semantic-modelling/method/context-map-records',
  '/semantic-modelling/identity-roles-and-phases': '/semantic-modelling/method/roles-and-phases',
  '/semantic-modelling/modelling-patterns': '/semantic-modelling/method/classes-and-relationships',
  '/semantic-modelling/modelling-rules': '/semantic-modelling/method/classes-and-relationships',
  '/semantic-modelling/linked-data-languages': '/semantic-modelling/method/languages-and-profiles',
  '/semantic-modelling/semantic-package': '/semantic-modelling/method/scope-and-package',
  '/semantic-modelling/evidence-and-mappings': '/semantic-modelling/method/mapping-records',
  '/semantic-modelling/validation': '/semantic-modelling/method/meaning-checks-and-delivery',
  '/semantic-modelling/standards': '/semantic-modelling/method/languages-and-profiles',
  '/semantic-modelling/decision-basis': '/semantic-modelling/method/standards-and-decisions',
});

function normalizePath(value) {
  const pathname = String(value || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

/** Fail closed: a similar-looking path is not an authorised route move. */
export function getModellingRedesignReplacementRoute(value) {
  const path = normalizePath(value);
  return Object.hasOwn(MODELLING_REDESIGN_REPLACEMENTS, path)
    ? MODELLING_REDESIGN_REPLACEMENTS[path] : null;
}

/**
 * Keep the original root/flat discussion identities for historical validation.
 * New chapters own their canonical identity, even when several old pages merge.
 * Selecting a predecessor's thread would falsely claim discussion continuity.
 */
export function getModellingCommentKey(value) {
  const path = normalizePath(value);
  if (path === '/semantic-modelling') return '/spdtf-2/ontologies';
  if (Object.hasOwn(MODELLING_REDESIGN_REPLACEMENTS, path)) {
    return `/spdtf-2/ontologies${path.slice('/semantic-modelling'.length)}`;
  }
  return path;
}
