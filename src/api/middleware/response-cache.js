/** In-memory response cache — skips Fuseki round-trip for repeated GETs. */

const cache = new Map();
const SKIP_PATHS = new Set(['/health', '/sparql']);

function shouldSkip(req) {
  if (req.method !== 'GET') return true;
  if (SKIP_PATHS.has(req.path)) return true;
  if (req.path.startsWith('/sparql')) return true;
  return false;
}

export function responseCacheMiddleware(req, res, next) {
  if (shouldSkip(req)) return next();

  const key = req.originalUrl + '|' + (req.headers.accept || '*/*');
  const entry = cache.get(key);
  if (entry) {
    res.set('X-Cache', 'HIT').set('Content-Type', entry.contentType);
    return res.send(entry.body);
  }

  res.set('X-Cache', 'MISS');
  const originalSend = res.send.bind(res);
  res.send = function interceptedSend(body) {
    if (res.statusCode === 200) {
      cache.set(key, { body, contentType: res.get('Content-Type') || 'application/json' });
    }
    return originalSend(body);
  };
  next();
}

export function clearCache() {
  const count = cache.size;
  cache.clear();
  return count;
}

export function cacheSize() { return cache.size; }
