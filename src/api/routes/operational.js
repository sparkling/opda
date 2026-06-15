import { Router } from 'express';
import { executeSelect, executeSparqlDirect } from '../lib/sparql-client.js';
import { clearCache, cacheSize } from '../middleware/response-cache.js';
import { getNamespaces } from '../lib/namespace-map.js';

const router = Router();
const FORBIDDEN_PATTERN = /\b(INSERT|DELETE|LOAD|CLEAR|DROP|CREATE|COPY|MOVE|ADD|SERVICE)\b/i;

// GET / — entry point
router.get('/', (_req, res) => {
  res.json({
    '@type': 'EntryPoint',
    name: 'OPDA Ontology SPARQL API',
    version: process.env.ONTOLOGY_VERSION || '0.1.0',
    description: 'Build-time GRLC SPARQL→REST API for the OPDA ontology (ADR-0021)',
    _links: {
      self: { href: '/' }, health: { href: '/health' },
      entities: { href: '/api/entities' },
      sparql: { href: '/sparql{?query}', templated: true },
      namespaces: { href: '/namespaces' },
    },
  });
});

// GET /health
router.get('/health', async (_req, res) => {
  try {
    await executeSelect('SELECT 1 WHERE { BIND(1 AS ?x) }');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', detail: 'Triplestore unreachable' });
  }
});

// DELETE /cache — flush + diagnostic
router.delete('/cache', (_req, res) => {
  const entries = clearCache();
  res.json({ cleared: true, entries });
});

router.get('/cache', (_req, res) => {
  res.json({ entries: cacheSize() });
});

// GET /namespaces
router.get('/namespaces', (_req, res) => {
  const namespaces = getNamespaces();
  const OPDA_ROOT = 'https://opda.org.uk/pdtf/';
  const items = Object.entries(namespaces).map(([prefix, iri]) => ({
    prefix, iri,
    source: iri.startsWith(OPDA_ROOT) ? 'internal' : 'external',
  })).sort((a, b) => {
    if (a.source !== b.source) return a.source === 'internal' ? -1 : 1;
    return a.prefix.localeCompare(b.prefix);
  });
  res.json({ '@type': 'NamespaceList', namespaces, items, _links: { self: { href: '/namespaces' } } });
});

// SPARQL pass-through (read-only)
router.get('/sparql', async (req, res, next) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ type: 'https://opda.org.uk/pdtf/problems/bad-request', title: 'Bad Request', status: 400, detail: 'Missing query parameter', instance: '/sparql' });
  if (FORBIDDEN_PATTERN.test(query)) return res.status(403).json({ type: 'https://opda.org.uk/pdtf/problems/forbidden', title: 'Forbidden', status: 403, detail: 'Only SELECT/CONSTRUCT allowed', instance: '/sparql' });
  try {
    const accept = req.get('Accept') || 'application/sparql-results+json';
    const { body, contentType } = await executeSparqlDirect(query, accept);
    res.set('Content-Type', contentType).send(body);
  } catch (err) { next(err); }
});

export default router;
