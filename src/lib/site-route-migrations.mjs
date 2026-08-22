import {
  getPropertyPackLegacyCommentKey,
  getPropertyPackReplacementRoute,
} from './property-pack-routes.mjs';
import {
  getPdtf1LegacyCommentKey,
  getPdtf1ReplacementFile,
  getPdtf1ReplacementRoute,
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
  return getPropertyPackReplacementRoute(route)
    ?? getSpdtfReplacementRoute(route)
    ?? getPdtf1ReplacementRoute(route)
    ?? route;
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
  return getPdtf1ReplacementFile(file) ?? `${accepted.slice(1)}/index.html`;
}

/** Compose retained Artalk identities across every canonical route cut. */
export function getLegacyCommentKey(route) {
  const path = normalizePath(route);
  const propertyPackKey = getPropertyPackLegacyCommentKey(path);
  if (propertyPackKey !== path) return propertyPackKey;
  const pdtfKey = getPdtf1LegacyCommentKey(path);
  if (pdtfKey !== path) return pdtfKey;
  if (path === '/spdtf') return '/spdtf-2';
  if (path.startsWith('/spdtf/')) return `/spdtf-2${path.slice('/spdtf'.length)}`;
  return path;
}
