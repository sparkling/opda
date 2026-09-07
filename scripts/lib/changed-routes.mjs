const CRITICAL_ROUTES = [
  '/',
  '/join',
  '/search',
  '/programme',
  '/semantic-modelling/method/languages-and-profiles',
];

function pageRoute(path) {
  if (!path.startsWith('src/pages/') || !path.endsWith('.astro')) return null;
  const relative = path.slice('src/pages/'.length, -'.astro'.length);
  if (relative.startsWith('ui/') || relative.includes('[')) return null;
  const route = relative === 'index' ? '' : relative.replace(/\/index$/u, '');
  return route ? `/${route}` : '/';
}

function decisionRoute(path, family) {
  const match = path.match(new RegExp(`^docs/${family.source}/(?:[^/]+/)?${family.prefix}-(\\d{4})-`, 'iu'));
  return match ? `${family.route}/${family.prefix.toLowerCase()}-${match[1]}` : null;
}

export function routesForPaths(inputPaths) {
  const routes = new Set();
  let needsFallback = false;
  for (const path of inputPaths.map((value) => value.trim()).filter(Boolean)) {
    const route = pageRoute(path)
      ?? decisionRoute(path, { source: 'adr', prefix: 'ADR', route: '/modelling/adr' })
      ?? decisionRoute(path, { source: 'ontology/odr', prefix: 'ODR', route: '/modelling/odr' });
    if (route) routes.add(route);
    else needsFallback = true;
  }
  if (needsFallback || routes.size === 0) CRITICAL_ROUTES.forEach((route) => routes.add(route));
  return [...routes].slice(0, 100);
}
