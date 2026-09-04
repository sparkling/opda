import { sha256 } from './ia-preservation-primitives.mjs';
import {
  PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST, loadPdtfSchemaInputSourceRouteManifest,
} from './ia-prior-manifest-contract.mjs';
import {
  getPdtfSchemaInputLegacyCommentKey, getPdtfSchemaInputReplacementRoute,
} from '../../src/lib/pdtf1-routes.mjs';

export const PDTF_SCHEMA_INPUT_ROUTE_MIGRATION = Object.freeze({
  sourceRoot: '/pdtf-schema',
  targetRoot: '/development/inputs/pdtf-schema',
  stableIdentifierRoot: '/pdtf',
  redirects: false,
});

export const PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES = Object.freeze([
  {
    sourceRoute: '/pdtf-schema',
    targetRoute: '/development/inputs/pdtf-schema',
    sourceContentSha256: 'eb49a14ec12e42a27b693cccef821d9a6e96c34762a23651e3d419e06b3811df',
    sourceBlockInventorySha256: '56b98f0aabd040faa39768d3184e4f42189787d9922f64c9912591ba75c2a43a',
    targetContentSha256: '895ad02489c7d074f25a65300d53a2e3d042a32663f13e290a3ef253a45623f4',
    targetBlockInventorySha256: 'c0a5b654205b188ba1894706956cfc3863e14d2421d1d34638b427025109ccb1',
    replacements: [
      ['h2', 'Schema, supporting material and derived evidence',
        'h2', 'Third-party source material and derived evidence', 'authority-and-input-scope'],
      ['p', 'The PDTF schema is the existing Digital Property Pack JSON Schema package. Its data dictionary, business glossary, overlays and implementation material explain that schema-led exchange contract. A separate draft ontology was later derived from those sources and is retained as evidence for SPDTF.',
        'p', 'The PDTF schema is a third-party input to SPDTF: the existing Digital Property Pack JSON Schema package. Its data dictionary, business glossary, overlays and implementation material explain that schema-led exchange contract. A separate draft ontology was later derived from those sources and is retained as evidence for SPDTF.', 'authority-and-input-scope'],
      ['p', 'Reader documentation now follows the /pdtf-schema/** hierarchy. Earlier documentation routes are removed without redirects. The separate /pdtf/** RDF identifier namespace remains unchanged because those values identify resources in the schema-derived ontology rather than pages in the reader hierarchy.',
        'p', 'Reader documentation now follows the /development/inputs/pdtf-schema/** hierarchy. Earlier documentation routes are removed without redirects. The separate /pdtf/** RDF identifier namespace remains unchanged because those values identify resources in the schema-derived ontology rather than pages in the reader hierarchy.', 'route-path-reframe'],
    ],
  },
  {
    sourceRoute: '/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling/concept-taxonomy',
    targetRoute: '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling/concept-taxonomy',
    sourceContentSha256: '65105e9aba01d1db0fe0992063f297953a91d11d2e3a7783b1f8296354554d6f',
    sourceBlockInventorySha256: 'ffbeab27adb890c7bb2ac1eed7f95132eebca9a04511b9b7c1b86ae9e549ca10',
    targetContentSha256: '82fc38d847f11b7b3857e913aa91fd3e0eadf5543e6963170cd0484faff166dc',
    targetBlockInventorySha256: '9666e8ad90800a4d6c940025d7e6611d4698aa5d1bf08ed7392f31043a4bc90e',
    replacements: [[
      'li', 'Meaning genuinely differs → mint a context-specific concept and link it to the core concept with skos:closeMatch (or broader / narrower if the relationship is hierarchical).',
      'li', 'Meaning genuinely differs → this historical design proposed a context-specific concept and skos:closeMatch ; any current relationship must be reassessed under the Category 8 method.',
      'scope-and-maturity-clarification',
    ]],
    additions: [[
      'p', "This example records the schema-derived ontology's earlier approach. Current SPDTF work uses the Category 8 mapping method : context architecture is separate from term mappings, cross-scheme hierarchy uses skos:broadMatch / skos:narrowMatch , and every predicate requires affected-owner review. SSSOM remains deferred.",
      'scope-and-maturity-clarification',
    ]],
  },
  {
    sourceRoute: '/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling/jsonld-mappings',
    targetRoute: '/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling/jsonld-mappings',
    sourceContentSha256: 'b37b25caf0d57f853fd10d7cd4f1811841dab4e1a3d6dde17445b3bcdece1b37',
    sourceBlockInventorySha256: '1ae80b58169011fd5158f4d38110d5778f8728ba691bd957e4136d707cb416f1',
    targetContentSha256: '447e52d7dff238d606e82393d2f0eff50be5ce1d9d3308b3cd50d10d8c408c20',
    targetBlockInventorySha256: 'a58fbf6a609b520245ee7524b317fb1797d8a2f8514989013085c0e52d8cebed',
    replacements: [],
    additions: [[
      'p', "The steps below preserve the schema-derived ontology's planning record; they are not current SPDTF mapping policy. Use the Category 8 mapping method for human review, predicate selection and the current SSSOM non-claim.",
      'scope-and-maturity-clarification',
    ]],
  },
  {
    sourceRoute: '/pdtf-schema/schema-derived-ontology/use-and-tooling/bake-off',
    targetRoute: '/development/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/bake-off',
    sourceContentSha256: 'd0407e02d9e38d747aeee5e29e3218901760884a178c65e0486c6b879d02ca03',
    sourceBlockInventorySha256: '244f41c40a10c9327a7c0521f6a5a7c051cb3bb85dfe37717ac0a3b47a8f6466',
    targetContentSha256: '19ddc0711f3e7a44d6d1f808b06ef404c5e93d52045f5973abd5e1396e60e04e',
    targetBlockInventorySha256: 'e053577b546ffde03eb55721ab617fc8168932dd4b65dad21e8fe135aa134c71',
    replacements: [[
      'p', "Each embeddable tool's output is inlined below for side-by-side inspection (expand a panel to load its iframe). Panels resolve as the generation step populates public/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/ .",
      'p', "Each embeddable tool's output is inlined below for side-by-side inspection (expand a panel to load its iframe). Panels resolve as the generation step populates public/development/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/ .",
      'route-path-reframe',
    ]],
  },
].map((entry) => Object.freeze({
  ...entry,
  replacements: Object.freeze(entry.replacements.map((replacement) => Object.freeze({
    sourceTag: replacement[0], sourceText: replacement[1],
    targetTag: replacement[2], targetText: replacement[3], classification: replacement[4],
  }))),
  ...(entry.additions ? { additions: Object.freeze(entry.additions.map((addition) => Object.freeze({
    targetTag: addition[0], targetText: addition[1], classification: addition[2],
  }))) } : {}),
})));

const acceptedRecords = (manifest) => [
  ...(manifest?.routes ?? []), ...(manifest?.addedRoutes ?? []),
];
const routeWithin = (route, root) => route === root || route?.startsWith(`${root}/`);
const digest = (values) => sha256([...values].sort().join('\n'));
const isNavigationFragment = (fragment) => (
  fragment.startsWith('section-nav-group-pdtf-schema-')
    || fragment.startsWith('section-nav-pdtf-schema-')
);

function validFragments(record) {
  return Array.isArray(record?.acceptedFragments)
    && record.acceptedFragmentCount === record.acceptedFragments.length
    && new Set(record.acceptedFragments).size === record.acceptedFragments.length
    && sha256(record.acceptedFragments.join('\n')) === record.acceptedFragmentSha256;
}

function expectedTargetFile(sourceFile, migration) {
  const source = migration.sourceRoot.slice(1);
  const target = migration.targetRoot.slice(1);
  if (sourceFile === `${source}/index.html`) return `${target}/index.html`;
  return sourceFile.startsWith(`${source}/`)
    ? `${target}/${sourceFile.slice(source.length + 1)}` : null;
}

export function getPdtfSchemaInputReplacementFile(route, file) {
  return getPdtfSchemaInputReplacementRoute(route)
    ? expectedTargetFile(file, PDTF_SCHEMA_INPUT_ROUTE_MIGRATION) : file;
}

/**
 * Bind the schema-v8 reader cut to its new SPDTF-input routes. Historical
 * schema-to-scheme receipts remain frozen; this receipt proves only v8 -> v9.
 */
export function composePdtfSchemaInputMigrationReceipt({
  records,
  addedRecords,
  sourceManifest,
  sourceContract,
  migration = PDTF_SCHEMA_INPUT_ROUTE_MIGRATION,
  replacementRoute = getPdtfSchemaInputReplacementRoute,
  replacementFile = getPdtfSchemaInputReplacementFile,
  commentKey = getPdtfSchemaInputLegacyCommentKey,
  informationReframes = PDTF_SCHEMA_INPUT_INFORMATION_REFRAMES,
}) {
  const source = acceptedRecords(sourceManifest);
  const accepted = [...records, ...addedRecords];
  const acceptedByRoute = new Map(accepted.map((record) => [record.acceptedRoute, record]));
  const sourceRoutes = new Set(source.map((record) => record.acceptedRoute));
  const sourceFiles = new Set(source.map((record) => record.acceptedFile));
  const acceptedFiles = new Set(accepted.map((record) => record.acceptedFile));
  if (sourceManifest.schemaVersion !== sourceContract.schemaVersion
    || sourceManifest.baselineCommit !== sourceContract.baselineCommit
    || sourceManifest.acceptedCommit !== sourceContract.acceptedCommit
    || sourceManifest.routeCount !== sourceContract.routeCount
    || sourceManifest.addedRouteCount !== sourceContract.addedRouteCount
    || sourceManifest.retiredRouteCount !== sourceContract.retiredRouteCount
    || source.length !== sourceContract.acceptedRouteCount
    || sourceRoutes.size !== source.length || sourceFiles.size !== source.length
    || acceptedByRoute.size !== accepted.length || acceptedFiles.size !== accepted.length
    || migration.sourceRoot !== sourceContract.pdtfSchemaRoot
    || migration.redirects !== false) {
    throw new Error('PDTF schema input route inventories are incomplete or duplicated');
  }

  const accounted = new Set();
  const moved = [];
  const retained = [];
  const stableIdentifiers = [];
  const missingNavigationFragments = [];
  const retainedTargetFragments = [];
  const sourceRouteFragments = [];
  const commentPairs = [];
  const historicalCommentKeys = [];
  const informationReframesByRoute = new Map(informationReframes.map((entry) => [
    entry.sourceRoute, entry,
  ]));
  if (informationReframesByRoute.size !== informationReframes.length) {
    throw new Error('PDTF schema input information reframes are duplicated');
  }
  const usedInformationReframes = [];

  for (const before of source) {
    const sourceRoute = before.acceptedRoute;
    const isMoved = routeWithin(sourceRoute, migration.sourceRoot);
    const isStableIdentifier = routeWithin(sourceRoute, migration.stableIdentifierRoot);
    const declaredTarget = replacementRoute(sourceRoute);
    if (isStableIdentifier && declaredTarget) {
      throw new Error(`stable PDTF identifier route moved: ${sourceRoute}`);
    }
    if (isMoved !== Boolean(declaredTarget)) {
      throw new Error(`PDTF schema input route has an undeclared disposition: ${sourceRoute}`);
    }
    const targetRoute = declaredTarget ?? sourceRoute;
    const after = acceptedByRoute.get(targetRoute);
    if (!after || accounted.has(targetRoute) || (isMoved && acceptedByRoute.has(sourceRoute))) {
      throw new Error(`PDTF schema input route is missing, duplicated, or retained: ${sourceRoute}`);
    }
    const targetFile = isMoved ? replacementFile(sourceRoute, before.acceptedFile) : before.acceptedFile;
    const exactTargetFile = isMoved ? expectedTargetFile(before.acceptedFile, migration) : before.acceptedFile;
    if (!targetFile || targetFile !== exactTargetFile || after.acceptedFile !== exactTargetFile) {
      throw new Error(`PDTF schema input file projection changed: ${sourceRoute}`);
    }
    if (isMoved && !routeWithin(targetRoute, migration.targetRoot)) {
      throw new Error(`PDTF schema input route escaped its target hierarchy: ${sourceRoute}`);
    }
    accounted.add(targetRoute);
    (isMoved ? moved : retained).push({ before, after });
    if (isStableIdentifier) {
      if (before.acceptedGeneratedFamily !== 'pdtf' || after.acceptedGeneratedFamily !== 'pdtf'
        || before.acceptedContentSha256 !== after.acceptedContentSha256
        || before.acceptedBlockInventorySha256 !== after.acceptedBlockInventorySha256) {
        throw new Error(`stable PDTF identifier information changed: ${sourceRoute}`);
      }
      stableIdentifiers.push({ before, after });
    }

    if (isMoved) {
      const informationExact = before.acceptedContentSha256 === after.acceptedContentSha256
        && before.acceptedBlockInventorySha256 === after.acceptedBlockInventorySha256;
      const informationReframe = informationReframesByRoute.get(sourceRoute);
      if (informationExact && informationReframe) {
        throw new Error(`PDTF schema input information reframe is unnecessary: ${sourceRoute}`);
      }
      if (!informationExact) {
        const replacements = informationReframe?.replacements ?? [];
        const additions = informationReframe?.additions ?? [];
        const replacementHashes = new Set();
        const replacementsValid = replacements.every((replacement) => {
          const sourceHash = sha256(`${replacement.sourceTag}\0${replacement.sourceText}`);
          const targetHash = sha256(`${replacement.targetTag}\0${replacement.targetText}`);
          const key = `${sourceHash}\0${targetHash}`;
          if (replacementHashes.has(key)) return false;
          replacementHashes.add(key);
          return ['authority-and-input-scope', 'route-path-reframe',
            'scope-and-maturity-clarification'].includes(
            replacement.classification,
          );
        });
        const additionHashes = new Set();
        const additionsValid = additions.every((addition) => {
          const targetHash = sha256(`${addition.targetTag}\0${addition.targetText}`);
          if (additionHashes.has(targetHash)) return false;
          additionHashes.add(targetHash);
          return addition.classification === 'scope-and-maturity-clarification';
        });
        if (!informationReframe || informationReframe.targetRoute !== targetRoute
          || informationReframe.sourceContentSha256 !== before.acceptedContentSha256
          || informationReframe.sourceBlockInventorySha256
            !== before.acceptedBlockInventorySha256
          || informationReframe.targetContentSha256 !== after.acceptedContentSha256
          || informationReframe.targetBlockInventorySha256
            !== after.acceptedBlockInventorySha256
          || replacements.length + additions.length === 0
          || !replacementsValid || !additionsValid) {
          throw new Error(`PDTF schema input information changed without a staged receipt: ${sourceRoute}`);
        }
        usedInformationReframes.push(informationReframe);
      }
    }

    // The moved reader family and the stable RDF identifier family share the
    // same navigation shell. Classify only that shell's renamed fragments;
    // authored deep links remain mandatory in both families.
    if ((isMoved || isStableIdentifier) && (!validFragments(before) || !validFragments(after))) {
      throw new Error(`PDTF schema input fragment inventory is invalid: ${sourceRoute}`);
    }
    if (isMoved || isStableIdentifier) {
      const acceptedFragments = new Set(after.acceptedFragments);
      for (const fragment of before.acceptedFragments) {
        sourceRouteFragments.push(`${sourceRoute}\0${fragment}`);
        if (acceptedFragments.has(fragment)) {
          retainedTargetFragments.push(`${targetRoute}\0${fragment}`);
        } else if (isNavigationFragment(fragment)) {
          missingNavigationFragments.push(`${sourceRoute}\0${targetRoute}\0${fragment}`);
        } else {
          throw new Error(`PDTF schema input content fragment is absent: ${sourceRoute}#${fragment}`);
        }
      }
    }
    if (!isMoved) continue;
    const afterKey = commentKey(targetRoute);
    commentPairs.push(`${targetRoute}\0${afterKey}`);
    historicalCommentKeys.push(afterKey);
  }

  const movedBaseline = moved.filter(({ before }) => sourceManifest.routes.includes(before));
  const movedAdded = moved.filter(({ before }) => sourceManifest.addedRoutes.includes(before));
  const generatedTools = moved.filter(({ before, after }) => (
    before.acceptedGeneratedFamily === 'ontology/tools'
      && after.acceptedGeneratedFamily === 'ontology/tools'
  ));
  const movedReaderPages = moved.filter(({ before, after }) => (
    before.acceptedGeneratedFamily === 'pdtf-schema'
      && after.acceptedGeneratedFamily === 'spdtf'
  ));
  if (moved.length !== sourceContract.pdtfSchemaRouteCount
    || movedBaseline.length !== sourceContract.pdtfSchemaBaselineRouteCount
    || movedAdded.length !== sourceContract.pdtfSchemaAddedRouteCount
    || retained.length !== sourceContract.retainedRouteCount
    || stableIdentifiers.length !== sourceContract.pdtfIdentifierRouteCount
    || generatedTools.length !== sourceContract.generatedToolRouteCount
    || movedReaderPages.length + generatedTools.length !== moved.length
    || historicalCommentKeys.length !== sourceContract.commentKeyCount
    || new Set(historicalCommentKeys).size !== moved.length
    || digest(commentPairs) !== sourceContract.commentKeyPairsSha256
    || digest(historicalCommentKeys) !== sourceContract.historicalCommentKeysSha256
    || usedInformationReframes.length !== informationReframes.length) {
    throw new Error('PDTF schema input route-family counts differ from the frozen source cut');
  }

  const postSourceAdditions = accepted.filter(({ acceptedRoute }) => !accounted.has(acceptedRoute));
  if (postSourceAdditions.some(({ acceptedRoute, kind, introducedBy }) => (
    routeWithin(acceptedRoute, migration.sourceRoot)
      || routeWithin(acceptedRoute, migration.targetRoot)
      || routeWithin(acceptedRoute, migration.stableIdentifierRoot)
      || kind !== 'new-authority-route' || typeof introducedBy !== 'string' || !introducedBy
  ))) {
    throw new Error('PDTF schema input post-source additions are unclassified or unsafe');
  }

  return {
    policy: 'pdtf-schema-input-route-composition-v1',
    sourceCommit: sourceContract.commit,
    sourcePath: sourceContract.path,
    sourceBlob: sourceContract.blob,
    sourceSha256: sourceContract.sha256,
    sourceSchemaVersion: sourceContract.schemaVersion,
    sourceAcceptedCommit: sourceContract.acceptedCommit,
    sourceRoot: migration.sourceRoot,
    targetRoot: migration.targetRoot,
    sourceRouteCount: source.length,
    movedRouteCount: moved.length,
    movedBaselineRouteCount: movedBaseline.length,
    movedAddedRouteCount: movedAdded.length,
    retainedRouteCount: retained.length,
    pdtfIdentifierRouteCount: stableIdentifiers.length,
    generatedToolRouteCount: generatedTools.length,
    movedReaderRouteCount: movedReaderPages.length,
    informationReframeRouteCount: usedInformationReframes.length,
    informationReframeBlockCount: usedInformationReframes.reduce((sum, entry) => (
      sum + entry.replacements.length + (entry.additions?.length ?? 0)
    ), 0),
    informationReframeRoutesSha256: digest(usedInformationReframes.map((entry) => [
      entry.sourceRoute, entry.targetRoute, entry.sourceContentSha256, entry.targetContentSha256,
    ].join('\0'))),
    informationReframesSha256: sha256(JSON.stringify(usedInformationReframes)),
    postSourceAdditionRouteCount: postSourceAdditions.length,
    acceptedSiteRouteCount: accepted.length,
    sourceRoutesSha256: digest(moved.map(({ before }) => before.acceptedRoute)),
    targetRoutesSha256: digest(moved.map(({ after }) => after.acceptedRoute)),
    sourceFilesSha256: digest(moved.map(({ before }) => before.acceptedFile)),
    targetFilesSha256: digest(moved.map(({ after }) => after.acceptedFile)),
    movedRoutePairsSha256: digest(moved.map(({ before, after }) => (
      `${before.acceptedRoute}\0${after.acceptedRoute}\0${before.acceptedFile}\0${after.acceptedFile}`
    ))),
    retainedRoutePairsSha256: digest(retained.map(({ before, after }) => (
      `${before.acceptedRoute}\0${after.acceptedRoute}\0${before.acceptedFile}\0${after.acceptedFile}`
    ))),
    allRoutePairsSha256: digest(source.map((before) => {
      const afterRoute = replacementRoute(before.acceptedRoute) ?? before.acceptedRoute;
      const after = acceptedByRoute.get(afterRoute);
      return `${before.acceptedRoute}\0${afterRoute}\0${before.acceptedFile}\0${after.acceptedFile}`;
    })),
    stableIdentifierRoutesSha256: digest(stableIdentifiers.map(({ before }) => before.acceptedRoute)),
    stableIdentifierRouteFilesSha256: digest(stableIdentifiers.map(({ before }) => (
      `${before.acceptedRoute}\0${before.acceptedFile}`
    ))),
    stableIdentifierInformationSha256: digest(stableIdentifiers.map(({ before, after }) => (
      `${before.acceptedRoute}\0${before.acceptedContentSha256}\0${before.acceptedBlockInventorySha256}`
        + `\0${after.acceptedContentSha256}\0${after.acceptedBlockInventorySha256}`
    ))),
    sourceRouteFragmentsSha256: digest(sourceRouteFragments),
    retainedTargetFragmentsSha256: digest(retainedTargetFragments),
    missingNavigationFragmentCount: missingNavigationFragments.length,
    missingNavigationFragmentIds: new Set(missingNavigationFragments.map((entry) => (
      entry.slice(entry.lastIndexOf('\0') + 1)
    ))).size,
    missingNavigationFragmentsSha256: digest(missingNavigationFragments),
    commentKeyCount: historicalCommentKeys.length,
    distinctCommentKeyCount: new Set(historicalCommentKeys).size,
    commentKeyPairsSha256: digest(commentPairs),
    historicalCommentKeysSha256: digest(historicalCommentKeys),
    postSourceAdditionRoutesSha256: digest(postSourceAdditions.map(({ acceptedRoute }) => acceptedRoute)),
    redirects: false,
  };
}

export function validatePdtfSchemaInputMigrationReceipt(receipt, options) {
  const actual = composePdtfSchemaInputMigrationReceipt(options);
  if (JSON.stringify(actual) !== JSON.stringify(receipt)) {
    throw new Error('PDTF schema input migration receipt is inconsistent');
  }
}

/** Validate the staged v8 -> v9 cut without rewriting earlier receipts. */
export function validatePdtfSchemaInputManifest(root, manifest, records, addedRecords) {
  const { manifest: sourceManifest } = loadPdtfSchemaInputSourceRouteManifest(root);
  for (const field of [
    'retiredRoutes', 'propertyPackMigration', 'pdtf1Migration',
    'pdtfSchemaFragmentMigration', 'schemaToSchemeMigration',
  ]) {
    if (JSON.stringify(manifest[field]) !== JSON.stringify(sourceManifest[field])) {
      throw new Error(`schema-v8 ${field} receipt was rewritten by the input-hosting cut`);
    }
  }
  validatePdtfSchemaInputMigrationReceipt(manifest.pdtfSchemaInputMigration, {
    records, addedRecords, sourceManifest,
    sourceContract: PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST,
  });
}
