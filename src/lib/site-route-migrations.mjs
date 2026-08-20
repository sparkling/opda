import { acceptedLeaseTermRoute } from './ontology-case-collision.mjs';
import { getPropertyPackReplacementRoute } from './property-pack-routes.mjs';

/** Resolve every explicitly authorised site-route move through one registry. */
export function getAcceptedRoute(route) {
  return getPropertyPackReplacementRoute(route) ?? acceptedLeaseTermRoute(route);
}

/** Return null for retained routes so undeclared moves remain fail-closed. */
export function getDeclaredRouteReplacement(route) {
  const accepted = getAcceptedRoute(route);
  return accepted === route ? null : accepted;
}
