/**
 * ADR-0044 Phase 6 — a static Turtle alternate beside each HTML representation.
 * It returns the resource's CBD + one hop (operator decision c), serialised from
 * the committed model. Pure SSG — one file per resource, no runtime server.
 */
import type { APIRoute } from 'astro';
import { allResources, pdtfSlug, resourceTurtle } from '@/lib/ontology-model';

const RESOURCE_BY_ROUTE = new Map(allResources().map((resource) => [pdtfSlug(resource.id), resource.id]));

export function getStaticPaths() {
  return allResources().map((r) => ({ params: { name: pdtfSlug(r.id) } }));
}

export const GET: APIRoute = ({ params }) => {
  const ttl = resourceTurtle(RESOURCE_BY_ROUTE.get(params.name ?? '') ?? '') ?? '';
  return new Response(ttl, {
    headers: { 'Content-Type': 'text/turtle; charset=utf-8' },
  });
};
