const ONTOLOGY = [
  /^source\/(?:03-standards\/ontology(?:-candidates)?|_content|_examples)\//u,
  /^source\/00-deliverables\/semantic-models\/(?:provenance-map|theme-map)\.yaml$/u,
  /^tools\/opda-gen\//u,
  /^config\/(?:fuseki-config\.ttl|property-pack-candidate\/)/u,
  /^scripts\/(?:build-with-data|fuseki-load|ontology-model|ontology-graph|property_pack|check-schema-reproducibility)\b/u,
  /^tests\/(?:baspi5_round_trip\/|property-pack-(?:catalogue|candidate)|test_schema_reproducibility\.py)/u,
];

const INFRASTRUCTURE = [
  /^config\/aws\//u,
  /^\.github\/workflows\/infra\.yml$/u,
];

const TOOLING = [
  /^scripts\/(?:site-cache-release|classify-ci-changes)\.mjs$/u,
  /^scripts\/lib\/(?:site-cache-manifest|ci-change-classifier)\.mjs$/u,
  /^tests\/(?:site-cache-release|ci-pipeline)\.test\.mjs$/u,
  /^\.github\/workflows\/(?:deploy-aws|site-release|site-assurance)\.yml$/u,
];

const APPLICATION = [
  /^src\/(?:components|layouts|scripts|api)\//u,
  /^public\/ui\/.*\.js$/u,
  /^tests\//u,
  /^scripts\//u,
  /^(?:astro|playwright)\.config\.mjs$/u,
  /^(?:package\.json|pnpm-lock\.yaml|tsconfig\.json|Makefile)$/u,
];

const EDITORIAL = [
  /^src\/pages\//u,
  /^src\/(?:content|data)\//u,
  /^src\/styles\//u,
  /^public\/(?!ui\/.*\.js$)/u,
  /^docs\/(?:manual|ontology\/odr|adr)\//u,
  /^DESIGN\.md$/u,
];

const matches = (path, patterns) => patterns.some((pattern) => pattern.test(path));

export function classifyPaths(inputPaths) {
  const paths = [...new Set(inputPaths.map((path) => path.trim()).filter(Boolean))];
  const result = {
    editorial: false,
    application: false,
    ontology: false,
    infrastructure: false,
    tooling: false,
  };
  let unknown = paths.length === 0;

  for (const path of paths) {
    let known = false;
    if (matches(path, ONTOLOGY)) result.ontology = known = true;
    if (matches(path, INFRASTRUCTURE)) result.infrastructure = known = true;
    if (matches(path, TOOLING)) result.tooling = known = true;
    else if (matches(path, APPLICATION)) result.application = known = true;
    if (matches(path, EDITORIAL)) result.editorial = known = true;
    if (!known) unknown = true;
  }
  if (unknown) result.application = true;

  const site = result.editorial || result.application || result.ontology;
  const primary = result.infrastructure ? 'infrastructure'
    : result.ontology ? 'ontology'
      : result.application ? 'application'
        : result.editorial ? 'editorial'
          : 'tooling';
  return { ...result, site, primary };
}
