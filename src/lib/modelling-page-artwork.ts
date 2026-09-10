interface ImageAsset {
  file: string;
  width: number;
  height: number;
}

export interface PageArtwork {
  route: string;
  alt: string;
  light: ImageAsset;
  dark: ImageAsset;
}

// Build-time only: the head preload and visible illustration use one manifest
// record. No image collection or lookup code is shipped to the browser.
const collections = import.meta.glob<{ pages: PageArtwork[] }>(
  '/public/images/modelling/page-headers/*/manifest.json',
  { eager: true, import: 'default' },
);
const pages = Object.values(collections).flatMap(({ pages }) => pages);

export function getModellingPageArtwork(pathname: string): PageArtwork {
  const route = pathname.replace(/\/+$/u, '');
  const artwork = pages.find((page) => page.route === route);
  if (!artwork?.alt.trim()) throw new Error(`Missing modelling page illustration: ${route}`);
  return artwork;
}
