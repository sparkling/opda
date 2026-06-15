/**
 * ADR-0044 Phase 6 — the Turtle alternate of the dereferenceable IRI. A static
 * file endpoint: /pdtf/{id}.ttl returns the resource's CBD + one hop (operator
 * decision c), serialised from the committed model. Pure SSG — one file per
 * resource, written at build; no runtime server. The HTML page at /pdtf/{id}
 * carries <link rel="alternate" type="text/turtle" href="{id}.ttl">.
 */
import type { APIRoute } from 'astro';
import { allResources, resourceTurtle } from '@/lib/ontology-model';

export function getStaticPaths() {
  return allResources().map((r) => ({ params: { name: r.id } }));
}

export const GET: APIRoute = ({ params }) => {
  const ttl = resourceTurtle(params.name ?? '') ?? '';
  return new Response(ttl, {
    headers: { 'Content-Type': 'text/turtle; charset=utf-8' },
  });
};
