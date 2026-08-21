import { acceptedLeaseTermRoute } from './ontology-case-collision.mjs';
import {
  getPropertyPackLegacyCommentKey,
  getPropertyPackReplacementRoute,
} from './property-pack-routes.mjs';
import {
  getPdtf1LegacyCommentKey,
  getPdtf1ReplacementFile,
  getPdtf1ReplacementRoute,
} from './pdtf1-routes.mjs';

/** Resolve every explicitly authorised site-route move through one registry. */
export function getAcceptedRoute(route) {
  return getPropertyPackReplacementRoute(route)
    ?? getPdtf1ReplacementRoute(route)
    ?? acceptedLeaseTermRoute(route);
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
  return getPdtf1LegacyCommentKey(getPropertyPackLegacyCommentKey(route));
}
