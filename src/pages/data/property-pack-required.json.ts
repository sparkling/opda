import records from '@/data/property-pack/required-properties.json';

export const prerender = true;

export function GET() {
  return new Response(`${JSON.stringify(records, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'inline; filename="property-pack-required.json"',
    },
  });
}
