/**
 * OPDA Ontology API Server — ADR-0021 GRLC-based build-time implementation.
 *
 * Endpoints are declared in src/api/queries/*.rq with GRLC #+ decorator comments.
 * The GRLC engine reads these files; the handler factory creates Express route handlers.
 *
 * Build-time only: Fuseki is ephemeral; this server serves Astro's getStaticPaths
 * at build time then tears down. Production ships only dist/.
 */
import express from 'express';
import { resolve } from 'node:path';

import { cachingMiddleware } from './middleware/caching.js';
import { responseCacheMiddleware } from './middleware/response-cache.js';
import { connegMiddleware } from './middleware/conneg.js';
import operational from './routes/operational.js';
import { buildRouteConfigs } from './lib/grlc-engine.js';
import { createHandler } from './lib/grlc-handler.js';
import { initNamespaceMap } from './lib/namespace-map.js';

const PORT = process.env.PORT || 3000;
const QUERIES_DIR = resolve(import.meta.dirname, 'queries');

const app = express();
app.set('json spaces', 2);
app.use(express.json());

app.use(cachingMiddleware);
app.use(responseCacheMiddleware);
app.use(connegMiddleware);

// ---------------------------------------------------------------------------
// Operational routes (health, namespaces, sparql pass-through)
// ---------------------------------------------------------------------------
app.use('/', operational);

// ---------------------------------------------------------------------------
// Namespace map (static for opda — no SPARQL query needed)
// ---------------------------------------------------------------------------
try {
  await initNamespaceMap();
} catch (err) {
  console.warn('[opda-api] Namespace map init warning:', err.message);
}

// ---------------------------------------------------------------------------
// GRLC-driven API routes
// ---------------------------------------------------------------------------

const LIST_TYPE_MAP = {
  '/api/entities': 'EntityList',
};

const RESOURCE_LABELS = {
  '/api/entities': 'Entity',
};

try {
  const configs = await buildRouteConfigs(QUERIES_DIR);

  for (const config of configs) {
    const expressPath = config.endpoint.replace(/\{(\w+)\}/g, ':$1');
    const basePath = config.endpoint.split('{')[0].replace(/\/$/, '') || '/';
    const listType = LIST_TYPE_MAP[basePath] || 'Collection';

    let handlerConfig;

    if (config.type === 'listing') {
      handlerConfig = {
        type: 'listing',
        listQueryText: config.queryText,
        countQueryText: config.countQueryText,
        basePath,
        listType,
        filterParams: config.queryParams,
      };
    } else if (config.type === 'detail') {
      handlerConfig = {
        type: 'detail',
        queryText: config.queryText,
        basePath,
        paramNames: config.pathParams,
        resourceLabel: RESOURCE_LABELS[basePath] || 'Resource',
      };
    } else {
      handlerConfig = {
        type: 'aggregate',
        queryText: config.queryText,
        basePath: config.endpoint,
        listType,
        filterParams: config.queryParams,
      };
    }

    const handler = createHandler(handlerConfig);
    const method = config.method.toLowerCase();
    app[method](expressPath, handler);
    console.log(`[grlc] ${config.method} ${expressPath} → ${config.name} (${config.type})`);
  }
} catch (err) {
  console.error('[grlc] Failed to load query configs:', err.message, err.stack);
}

// ---------------------------------------------------------------------------
// Catch-all 404 (RFC 7807)
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).set('Content-Type', 'application/problem+json').json({
    type: 'https://w3id.org/opda/problems/not-found',
    title: 'Resource Not Found', status: 404,
    detail: `No route matches ${req.method} ${req.path}`,
    instance: req.path,
  });
});

// RFC 7807 error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    type: `https://w3id.org/opda/problems/${err.code || 'internal-error'}`,
    title: 'Internal Server Error', status,
    detail: err.message, instance: _req.path,
  });
});

app.listen(PORT, () => {
  console.log(`[opda-api] Listening on port ${PORT}`);
  console.log(`[opda-api] SPARQL endpoint: ${process.env.FUSEKI_ENDPOINT || 'http://localhost:3030/opda/sparql'}`);
  console.log(`[opda-api] Ontology version: ${process.env.ONTOLOGY_VERSION || '0.1.0'}`);
});

export default app;
