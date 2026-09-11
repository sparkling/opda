import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export const CACHE_MANIFEST = 'cache-manifest.json';
export const CACHE_BOOTSTRAP_BASELINE = 'cache-bootstrap-baseline.json';
export const IMMUTABLE_PREFIXES = ['_astro/', '_images/', '_ui/'];
export const IMMUTABLE_CACHE_CONTROL = 'public,max-age=31536000,immutable';
// Browsers revalidate; the CDN stays warm between targeted release purges.
export const HTML_CACHE_CONTROL = 'public,max-age=0,s-maxage=86400,must-revalidate';
export const MUTABLE_CACHE_CONTROL = 'public,max-age=0,s-maxage=86400,must-revalidate';
const VENDOR_ROOT = 'development/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/';
const EXCLUDED_PREFIXES = ['artefacts/', 'tools/ontospy/', 'tools/pylode/', 'tools/shaclplay/', 'tools/widoco/'].map(value => VENDOR_ROOT + value);

export function validateObjectKey(key) {
  if (typeof key !== 'string' || !key || key.startsWith('/') || /[\\*?\u0000-\u001f\u007f]/u.test(key) || key.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`Unsafe site object key: ${JSON.stringify(key)}`);
  }
  return key;
}

export function isImmutable(key) { return IMMUTABLE_PREFIXES.some(prefix => key.startsWith(prefix)); }
export function isManagedMutable(key) {
  return key !== CACHE_MANIFEST && key !== CACHE_BOOTSTRAP_BASELINE && !isImmutable(key) && !EXCLUDED_PREFIXES.some(prefix => key.startsWith(prefix));
}
export function cachePolicyFor(key) {
  if (isImmutable(key)) return IMMUTABLE_CACHE_CONTROL;
  return key.endsWith('.html') ? HTML_CACHE_CONTROL : MUTABLE_CACHE_CONTROL;
}

export async function createCacheManifest(directory) {
  const root = path.resolve(directory);
  const files = {};
  async function visit(folder) {
    const entries = await readdir(folder, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const filename = path.join(folder, entry.name);
      const key = path.relative(root, filename).split(path.sep).join('/');
      if (entry.isSymbolicLink()) throw new Error(`Site artifacts cannot contain symlinks: ${key}`);
      if (entry.isDirectory()) {
        if (!isImmutable(`${key}/`) && !EXCLUDED_PREFIXES.some(prefix => `${key}/`.startsWith(prefix))) await visit(filename);
      } else if (entry.isFile() && isManagedMutable(key)) {
        validateObjectKey(key);
        files[key] = { sha256: createHash('sha256').update(await readFile(filename)).digest('hex'), cacheControl: cachePolicyFor(key) };
      }
    }
  }
  await visit(root);
  return { schemaVersion: 1, files: Object.fromEntries(Object.entries(files).sort()) };
}

function validateManifest(manifest) {
  if (manifest?.schemaVersion !== 1 || !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files)) throw new Error('Invalid cache manifest');
  for (const [key, file] of Object.entries(manifest.files)) {
    validateObjectKey(key);
    if (!isManagedMutable(key) || !/^[a-f0-9]{64}$/u.test(file?.sha256 ?? '')) throw new Error(`Invalid mutable cache entry: ${key}`);
  }
}

/** Inventory constrains safe invalidations; it does not establish ownership. */
export function createBootstrapBaseline(keys) {
  if (!Array.isArray(keys)) throw new Error('Invalid bootstrap baseline keys');
  return { schemaVersion: 1, keys: [...new Set(keys.map(validateObjectKey))].sort() };
}

function validateBootstrapBaseline(baseline) {
  if (baseline?.schemaVersion !== 1 || !Array.isArray(baseline.keys)) throw new Error('Invalid bootstrap baseline');
  for (const key of baseline.keys) validateObjectKey(key);
}

function encodedPath(key) { return `/${key.split('/').map(encodeURIComponent).join('/')}`; }

/** Viewer-request rewrites can be cached by either submitted or rewritten URI. */
export function invalidationAliases(key) {
  validateObjectKey(key);
  if (key === 'index.html') return ['/', '/index.html'];
  const uri = encodedPath(key);
  if (key.endsWith('/index.html')) {
    const route = uri.slice(0, -'/index.html'.length);
    return [route, `${route}/`, uri];
  }
  return [uri];
}

function compactInvalidations(affected, knownKeys, ownedKeys) {
  const affectedSet = new Set(affected);
  const ownedSet = new Set(ownedKeys);
  const paths = new Set(affected.flatMap(invalidationAliases));
  const prefixes = new Set();
  for (const key of affected) {
    const segments = key.split('/');
    for (let index = 1; index < segments.length; index++) prefixes.add(`${segments.slice(0, index).join('/')}/`);
  }
  for (const prefix of [...prefixes].sort((a, b) => a.length - b.length || a.localeCompare(b, 'en'))) {
    // Do not flush a subtree containing any unchanged published mutable object.
    // Root and immutable prefixes are never candidates, even on first adoption.
    if (isImmutable(prefix) || knownKeys.some(key => key.startsWith(prefix)
      && !affectedSet.has(key)
      && (key.endsWith('.html') || !ownedSet.has(key)))) continue;
    const uri = encodedPath(prefix.slice(0, -1)) + '/';
    const descendants = [...paths].filter(value => value.startsWith(uri));
    if (descendants.length < 2) continue;
    for (const value of descendants) paths.delete(value);
    paths.add(`${uri}*`);
  }
  return [...paths].sort();
}

/** Hash comparison, never timestamps, determines upload/deletion/invalidation. */
export function planCacheRelease(previous, next, publishedKeys = [], bootstrapBaseline = null) {
  validateManifest(next);
  if (previous) validateManifest(previous);
  else validateBootstrapBaseline(bootstrapBaseline);
  if (!Array.isArray(publishedKeys)) throw new Error('Invalid published object inventory');
  for (const key of publishedKeys) validateObjectKey(key);
  // Only a successful deployment manifest proves ownership. On first adoption
  // upload the complete next release, but preserve untracked existing objects.
  const old = previous?.files ?? {};
  const changed = Object.keys(next.files).filter(key => next.files[key].sha256 !== old[key]?.sha256 || next.files[key].cacheControl !== old[key]?.cacheControl).sort();
  const deleted = Object.keys(old).filter(key => !Object.hasOwn(next.files, key)).sort();
  // Excluded archived/vendor keys are not ours to remove, but still prevent a
  // wildcard from flushing a subtree containing their unchanged CDN objects.
  const known = [...new Set([...Object.keys(old), ...Object.keys(next.files), ...publishedKeys, ...(previous ? [] : bootstrapBaseline.keys)])];
  return { changed, deleted, invalidations: compactInvalidations([...changed, ...deleted], known, [...Object.keys(old), ...Object.keys(next.files)]) };
}
