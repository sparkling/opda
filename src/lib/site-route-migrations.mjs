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
import { getPdtfResourceReplacementRoute } from './pdtf-resource-routes.mjs';

function normalizePath(value) {
  const pathname = String(value || '/').split(/[?#]/u, 1)[0] || '/';
  return pathname === '/' ? pathname : pathname.replace(/\/+$/u, '');
}

/** Project the withdrawn generation label into the unnumbered SPDTF hierarchy. */
export function getSpdtfSchemeReplacementRoute(value) {
  const path = normalizePath(value);
  if (path === '/spdtf-2') return '/development';
  return path.startsWith('/spdtf-2/') ? `/development${path.slice('/spdtf-2'.length)}` : null;
}

/** Compose the later semantic-modelling move over the unnumbered SPDTF cut. */
export function getSpdtfReplacementRoute(value) {
  const path = normalizePath(value);
  if (path === '/spdtf-2/ontologies') return '/semantic-modelling';
  if (path.startsWith('/spdtf-2/ontologies/')) {
    return `/semantic-modelling${path.slice('/spdtf-2/ontologies'.length)}`;
  }
  return getSpdtfSchemeReplacementRoute(path);
}

/** Preserve exact suffixes when authenticating the historical SPDTF stage. */
export function getSpdtfSchemeReplacementFile(route, file) {
  const accepted = getPropertyPackReplacementRoute(route)
    ?? getSpdtfSchemeReplacementRoute(route);
  return accepted ? `${accepted.slice(1)}/index.html` : file;
}

/** Move semantic-modelling guidance to its top-level canonical route family. */
export function getSemanticModellingReplacementRoute(value) {
  const path = normalizePath(value);
  if (path === '/spdtf/ontologies') return '/semantic-modelling';
  return path.startsWith('/spdtf/ontologies/')
    ? `/semantic-modelling${path.slice('/spdtf/ontologies'.length)}`
    : null;
}

/** Resolve every explicitly authorised site-route move through one registry. */
export function getAcceptedRoute(route) {
  const pdtfResource = getPdtfResourceReplacementRoute(route);
  if (pdtfResource) return pdtfResource;
  const propertyPack = getPropertyPackReplacementRoute(route);
  if (propertyPack) return propertyPack;
  const spdtf = getSpdtfReplacementRoute(route);
  if (spdtf) return spdtf;
  const semanticModelling = getSemanticModellingReplacementRoute(route);
  if (semanticModelling) return semanticModelling;
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
  if (getPdtfResourceReplacementRoute(route)) {
    return accepted.endsWith('.ttl') ? accepted.slice(1) : `${accepted.slice(1)}/index.html`;
  }
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
  if (path === '/semantic-modelling') return '/spdtf-2/ontologies';
  if (path.startsWith('/semantic-modelling/')) {
    return `/spdtf-2/ontologies${path.slice('/semantic-modelling'.length)}`;
  }
  if (path === '/development') return '/spdtf-2';
  if (path.startsWith('/development/')) return `/spdtf-2${path.slice('/development'.length)}`;
  return path;
}
