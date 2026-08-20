import iaPreservationManifest from '../data/ia-preservation-baseline.json' with { type: 'json' };

const RETAINED_FAMILIES = Object.freeze([
  { id: 'ontology-artefacts', prefix: 'artefacts/' },
  { id: 'ontology-tools', prefix: 'tools/' },
]);

/**
 * Validate the logical path used by an ontology page to refer to a published
 * asset. These are URL-style paths beneath the two retained ontology families,
 * never host filesystem paths.
 */
export function validateOntologyAssetPath(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim()
    || value.includes('\\') || value.includes('\0') || value.startsWith('/')
    || value.includes('//')) {
    throw new TypeError(`invalid logical ontology asset path: ${String(value)}`);
  }
  const segments = value.split('/');
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..')
    || (!value.startsWith('tools/') && !value.startsWith('artefacts/'))) {
    throw new TypeError(`invalid logical ontology asset path: ${value}`);
  }
  return value;
}

function familyFor(manifest: any, id: string): any {
  if (!manifest || manifest.schemaVersion !== 1 || !Array.isArray(manifest.families)) {
    throw new Error('IA preservation manifest has an invalid family contract');
  }
  const family = manifest.families.find((candidate: any) => candidate?.id === id);
  if (!family || family.policy !== 'byte-identical' || family.ciMode !== 'manifest-only-in-ci'
    || !Array.isArray(family.accepted?.records)) {
    throw new Error(`IA preservation manifest is missing retained family ${id}`);
  }
  return family;
}

/**
 * Derive the expected retained ontology asset paths from the committed IA
 * family inventories. This deliberately does not inspect public/ or dist/:
 * those generated objects may be retained by the deployment rather than
 * present in a clean checkout.
 */
export function deriveExpectedOntologyAssets(manifest: unknown): string[] {
  const paths = new Set<string>();
  for (const { id, prefix } of RETAINED_FAMILIES) {
    const family = familyFor(manifest, id);
    for (const record of family.accepted.records) {
      if (!record || typeof record.path !== 'string') {
        throw new Error(`IA preservation family ${id} has an invalid asset record`);
      }
      const logicalPath = validateOntologyAssetPath(`${prefix}${record.path}`);
      paths.add(logicalPath);
    }
  }
  return [...paths].sort((left, right) => left.localeCompare(right));
}

const EXPECTED_ONTOLOGY_ASSETS = new Set(
  deriveExpectedOntologyAssets(iaPreservationManifest),
);

export function expectedOntologyAssetPaths(): string[] {
  return [...EXPECTED_ONTOLOGY_ASSETS].sort((left, right) => left.localeCompare(right));
}

export function isExpectedOntologyAsset(value: unknown): boolean {
  return EXPECTED_ONTOLOGY_ASSETS.has(validateOntologyAssetPath(value));
}

/** Resolve a public URL pathname only when it names a retained manifest object. */
export function isExpectedOntologyAssetUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !value.startsWith('/ontology/')
    || value.includes('?') || value.includes('#') || value.includes('\\')) return false;
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return false; }
  const logicalPath = decoded.slice('/ontology/'.length);
  if (!logicalPath.startsWith('tools/') && !logicalPath.startsWith('artefacts/')) return false;
  try { return isExpectedOntologyAsset(logicalPath); } catch { return false; }
}
