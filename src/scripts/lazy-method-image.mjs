const instances = new WeakMap();

/** Keep the actual theme URL lazy, not just the initially empty image element. */
export function initialiseLazyMethodImage(wrapper, environment = window) {
  const image = wrapper?.querySelector('[data-method-theme-image]');
  if (!image) return () => {};
  if (instances.has(wrapper)) return instances.get(wrapper);

  const document = environment.document;
  const wide = environment.matchMedia('(min-width: 64.01rem)');
  const forcedColours = environment.matchMedia('(forced-colors: active)');
  let disposed = false;
  let nearby = !environment.IntersectionObserver;

  const selectAsset = () => {
    if (disposed || !nearby || !wide.matches || forcedColours.matches) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    const source = dark ? image.dataset.darkSrc : image.dataset.lightSrc;
    // Assign the displayed lazy image directly. An off-DOM Image() bypasses the
    // element's loading policy and fetches a distant illustration at page load.
    if (source && image.getAttribute('src') !== source) image.src = source;
  };

  const visibility = environment.IntersectionObserver
    ? new environment.IntersectionObserver((entries) => {
      nearby = entries.some((entry) => entry.isIntersecting);
      selectAsset();
    }, { rootMargin: '300px 0px' })
    : null;
  visibility?.observe(wrapper);

  const theme = new environment.MutationObserver(selectAsset);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  wide.addEventListener('change', selectAsset);
  forcedColours.addEventListener('change', selectAsset);

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    visibility?.disconnect();
    theme.disconnect();
    wide.removeEventListener('change', selectAsset);
    forcedColours.removeEventListener('change', selectAsset);
    document.removeEventListener('astro:before-swap', cleanup);
    instances.delete(wrapper);
  };
  instances.set(wrapper, cleanup);
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  selectAsset();
  return cleanup;
}
