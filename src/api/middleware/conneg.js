/**
 * Content negotiation for detail endpoints.
 * opda API returns JSON only (no Turtle conneg needed at build-time).
 */

export function connegMiddleware(_req, _res, next) {
  // Build-time API: JSON only. Conneg hook kept for future live-endpoint parity.
  next();
}
