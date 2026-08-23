import {
  getPropertyPackLegacyCommentKey,
  getPropertyPackReplacementRoute,
} from './property-pack-routes.mjs';
import {
  getPdtf1IntermediateReplacementFile,
  getPdtf1IntermediateReplacementRoute,
  getPdtf1LegacyCommentKey,
  getPdtfSchemaInputLegacyCommentKey,
  getPdtfSchemaInputReplacementRoute,
} from './pdtf1-routes.mjs';

function normalizePath(value) {
  const pathname = String(value || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

/** Migrate the withdrawn development-generation route without touching API versions. */
export function getSpdtfReplacementRoute(value) {
  const path = normalizePath(value);
  if (path === '/spdtf-2') return '/spdtf';
  return path.startsWith('/spdtf-2/') ? `/spdtf${path.slice('/spdtf-2'.length)}` : null;
}

/** Resolve every explicitly authorised site-route move through one registry. */
export function getAcceptedRoute(route) {
  const propertyPack = getPropertyPackReplacementRoute(route);
  if (propertyPack) return propertyPack;
  const spdtf = getSpdtfReplacementRoute(route);
  if (spdtf) return spdtf;
  const pdtfIntermediate = getPdtf1IntermediateReplacementRoute(route);
  return pdtfIntermediate ? getPdtfSchemaInputReplacementRoute(pdtfIntermediate) ?? pdtfIntermediate : route;
}

/** Return null for retained routes so undeclared moves remain fail-closed. */
export function getDeclaredRouteReplacement(route) {
  const accepted = getAcceptedRoute(route);
  return accepted === route ? null : accepted;
}

/** Resolve a moved HTML record without flattening static `*.html` files. */
export function getAcceptedRouteFile(route, file) {
  const accepted = getAcceptedRoute(route);
  if (accepted === route) return file;
  const pdtfIntermediate = getPdtf1IntermediateReplacementFile(file);
  if (pdtfIntermediate) {
    const pdtfFile = getPdtfSchemaInputReplacementRoute(`/${pdtfIntermediate}`);
    return pdtfFile?.slice(1) ?? pdtfIntermediate;
  }
  return `${accepted.slice(1)}/index.html`;
}

/** Compose retained Artalk identities across every canonical route cut. */
export function getLegacyCommentKey(route) {
  const path = normalizePath(route);
  const propertyPackKey = getPropertyPackLegacyCommentKey(path);
  if (propertyPackKey !== path) return propertyPackKey;
  const pdtfInputKey = getPdtfSchemaInputLegacyCommentKey(path);
  if (pdtfInputKey !== path) return pdtfInputKey;
  const pdtfKey = getPdtf1LegacyCommentKey(path);
  if (pdtfKey !== path) return pdtfKey;
  if (path === '/spdtf') return '/spdtf-2';
  if (path.startsWith('/spdtf/')) return `/spdtf-2${path.slice('/spdtf'.length)}`;
  return path;
}
