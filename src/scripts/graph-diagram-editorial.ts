// @ts-nocheck
import { createDiagramViewport } from './graph-diagram-viewport';

export interface EditorialViewOptions {
  wrapper: HTMLElement;
  viewport: HTMLElement;
  canvas: HTMLElement;
  root: HTMLElement;
  captionId?: string;
}

export function createEditorialView(options: EditorialViewOptions) {
  const { wrapper, viewport, canvas, root, captionId } = options;
  let didRender = false;
  let svg: SVGSVGElement | null = null;
  const viewportController = createDiagramViewport({
    wrapper,
    viewport,
    canvas,
    fitBounds: () => {
      const box = svg?.viewBox.baseVal;
      return box?.width && box?.height
        ? { x: box.x, y: box.y, width: box.width, height: box.height }
        : null;
    },
    shouldStartDrag: (target) => !target.closest('a[href]'),
  });

  function render() {
    svg = root.querySelector('svg');
    if (!(svg instanceof SVGSVGElement)) {
      throw new Error('[graph-diagram] editorial renderer requires one inline SVG');
    }
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('focusable', 'true');
    if (captionId) svg.setAttribute('aria-describedby', captionId);
    viewportController.bindKeyboard(svg);
    viewportController.resetView();
    didRender = true;
    wrapper.setAttribute('data-diagram-ready', 'true');
  }

  return {
    render,
    initControls: viewportController.initControls,
    get rendered() { return didRender; },
  };
}
