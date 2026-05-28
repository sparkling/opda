import { createHash } from 'node:crypto';

const ONTOLOGY_VERSION = process.env.ONTOLOGY_VERSION || '0.1.0';
const RELEASE_DATE = process.env.ONTOLOGY_RELEASE_DATE || new Date().toUTCString();

function getCacheMaxAge(path) {
  if (path === '/namespaces' || path.startsWith('/contexts')) return 604800;
  const segments = path.split('/').filter(Boolean);
  if (segments.length >= 4) return 86400; // detail: /api/entities/{tier}/{module}/{name}
  return 3600;
}

function computeETag(url) {
  const hash = createHash('md5').update(`${ONTOLOGY_VERSION}:${url}`).digest('hex').slice(0, 16);
  return `"${ONTOLOGY_VERSION}-${hash}"`;
}

export function cachingMiddleware(req, res, next) {
  const etag = computeETag(req.originalUrl);
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch && ifNoneMatch === etag) { res.status(304).end(); return; }

  const maxAge = getCacheMaxAge(req.path);
  res.set('X-Ontology-Version', ONTOLOGY_VERSION);
  res.set('ETag', etag);
  res.set('Last-Modified', RELEASE_DATE);
  res.set('Cache-Control', `public, max-age=${maxAge}`);
  next();
}
