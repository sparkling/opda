/** Load optional engines only on documents which actually contain their UI. */
const ELEMENTS_SELECTOR = [
  'el-autocomplete', 'el-command-group', 'el-command-list', 'el-command-palette',
  'el-command-preview', 'el-copyable', 'el-defaults', 'el-dialog',
  'el-dialog-backdrop', 'el-dialog-panel', 'el-disclosure', 'el-dropdown',
  'el-menu', 'el-no-results', 'el-option', 'el-options', 'el-popover',
  'el-popover-group', 'el-select', 'el-selectedcontent', 'el-tab-group',
  'el-tab-list', 'el-tab-panels', '[popover]', '[popovertarget]', '[commandfor]',
].join(', ');
const DIAGRAM_SELECTOR = '.mermaid, .graph-diagram-wrapper';

export function createPageFeatureController({
  pageDocument = document,
  pageWindow = window,
  loadElements = () => import('@tailwindplus/elements'),
  loadDiagrams = () => import('./graph-diagram.ts'),
  onError = (error) => console.warn('[OPDA] optional page enhancement unavailable', error),
} = {}) {
  const controller = new AbortController();
  const { signal } = controller;
  let elementsPromise;
  let diagramsPromise;
  let diagramModule;
  let pageGeneration = 0;

  function elements() {
    if (signal.aborted || pageDocument.documentElement.dataset.pageElements === 'disabled'
      || !pageDocument.querySelector(ELEMENTS_SELECTOR)) return Promise.resolve();
    elementsPromise ??= Promise.resolve().then(loadElements).catch((error) => {
      elementsPromise = undefined;
      if (!signal.aborted) onError(error);
    });
    return elementsPromise;
  }

  function adoptDiagrams() {
    if (signal.aborted || !pageDocument.querySelector(DIAGRAM_SELECTOR)) return Promise.resolve();
    // Once loaded, preserve the bridge's synchronous DOM enhancement for graph
    // adapters which replace their content and immediately call it again.
    if (diagramModule) {
      diagramModule.adoptBareMermaid();
      return Promise.resolve();
    }
    const generation = pageGeneration;
    diagramsPromise ??= Promise.resolve().then(loadDiagrams).catch((error) => {
      diagramsPromise = undefined;
      if (!signal.aborted) onError(error);
      return undefined;
    });
    return diagramsPromise.then((module) => {
      if (!module || signal.aborted) return;
      diagramModule = module;
      // Do not enhance the outgoing DOM if navigation won the import race.
      if (generation === pageGeneration && pageDocument.querySelector(DIAGRAM_SELECTOR)) {
        module.adoptBareMermaid();
      }
    });
  }

  function mount() {
    if (signal.aborted) return Promise.resolve();
    return Promise.all([elements(), adoptDiagrams()]);
  }

  // Dynamic graph adapters use this existing explicit hook; there is no
  // whole-document mutation observer or background polling to find additions.
  const shared = pageWindow.OPDA ??= {};
  const previousAdopt = shared.adoptBareMermaid;
  shared.adoptBareMermaid = adoptDiagrams;
  pageDocument.addEventListener('astro:page-load', mount, { signal });
  pageDocument.addEventListener('astro:before-swap', () => { pageGeneration++; }, { signal });

  return {
    mount,
    destroy() {
      controller.abort();
      if (shared.adoptBareMermaid === adoptDiagrams) {
        if (previousAdopt) shared.adoptBareMermaid = previousAdopt;
        else delete shared.adoptBareMermaid;
      }
    },
  };
}

let activeController;

export function initialisePageFeatures() {
  activeController?.destroy();
  activeController = createPageFeatureController();
  void activeController.mount();
}
