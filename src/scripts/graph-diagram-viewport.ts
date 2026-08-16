// @ts-nocheck

export interface DiagramFitBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramViewportOptions {
  wrapper: HTMLElement;
  viewport: HTMLElement;
  canvas: HTMLElement;
  fitBounds?: () => DiagramFitBounds | null;
  shouldStartDrag?: (target: Element) => boolean;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const BUTTON_ZOOM = 1.2;
const boundSvgs = new WeakSet<SVGSVGElement>();

export function createDiagramViewport(options: DiagramViewportOptions) {
  const { wrapper, viewport, canvas } = options;
  let baseScale = 1;
  let zoomLevel = 1;
  let panX = 0;
  let panY = 0;
  let dragging = false;
  let didDrag = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panStartX = 0;
  let panStartY = 0;
  let controlsReady = false;

  function currentScale() {
    return baseScale * zoomLevel;
  }

  function applyTransform() {
    canvas.style.transform = `translate(${panX}px,${panY}px) scale(${currentScale()})`;
    const label = wrapper.querySelector('.diagram-zoom-label');
    if (label) label.textContent = `${Math.round(zoomLevel * 100)}%`;
  }

  function contentSize() {
    const style = getComputedStyle(viewport);
    const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
    const verticalPadding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    return {
      width: Math.max(1, viewport.clientWidth - horizontalPadding),
      height: Math.max(1, viewport.clientHeight - verticalPadding),
    };
  }

  function resetView() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    baseScale = 1;
    const bounds = options.fitBounds?.();
    if (bounds?.width && bounds?.height) {
      const available = contentSize();
      baseScale = Math.min(1, available.width / bounds.width, available.height / bounds.height);
      panX = (available.width - bounds.width * baseScale) / 2 - bounds.x * baseScale;
      panY = (available.height - bounds.height * baseScale) / 2 - bounds.y * baseScale;
    }
    applyTransform();
  }

  function panBy(x: number, y: number) {
    panX += x;
    panY += y;
    applyTransform();
  }

  function zoom(factor: number, centreX?: number, centreY?: number) {
    const available = contentSize();
    const pointX = centreX ?? available.width / 2;
    const pointY = centreY ?? available.height / 2;
    const previousScale = currentScale();
    zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel * factor));
    const ratio = currentScale() / previousScale;
    panX = pointX - ratio * (pointX - panX);
    panY = pointY - ratio * (pointY - panY);
    applyTransform();
  }

  function handleSvgKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? 120 : 40;
    if (event.key === 'ArrowLeft') { event.preventDefault(); panBy(step, 0); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); panBy(-step, 0); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); panBy(0, step); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); panBy(0, -step); }
    else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(BUTTON_ZOOM); }
    else if (event.key === '-' || event.key === '_') { event.preventDefault(); zoom(1 / BUTTON_ZOOM); }
    else if (event.key === '0') { event.preventDefault(); resetView(); }
  }

  function bindKeyboard(svg: SVGSVGElement) {
    if (boundSvgs.has(svg)) return;
    boundSvgs.add(svg);
    svg.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown + - 0');
    svg.addEventListener('keydown', handleSvgKeydown);
  }

  function canStartDrag(target: EventTarget | null) {
    return target instanceof Element && (options.shouldStartDrag?.(target) ?? true);
  }

  function initControls() {
    if (controlsReady) return;
    controlsReady = true;
    wrapper.querySelectorAll('[data-diagram-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-diagram-action');
        if (action === 'zoom-in') zoom(BUTTON_ZOOM);
        else if (action === 'zoom-out') zoom(1 / BUTTON_ZOOM);
        else if (action === 'reset') resetView();
      });
    });

    const zoomLabel = wrapper.querySelector('.diagram-zoom-label');
    zoomLabel?.setAttribute('role', 'status');
    zoomLabel?.setAttribute('aria-live', 'polite');
    zoomLabel?.setAttribute('aria-label', 'Zoom level');

    const zoomControl = wrapper.querySelector<HTMLButtonElement>('.gd-ctrl');
    let zoomMode = false;
    let modifierZoom = false;
    function updateZoomState() {
      const zoomActive = zoomMode || modifierZoom;
      wrapper.classList.toggle('zoom-active', zoomActive);
      if (!zoomControl) return;
      zoomControl.removeAttribute('tabindex');
      zoomControl.setAttribute('aria-pressed', String(zoomMode));
      zoomControl.setAttribute('aria-label', zoomMode
        ? 'Zoom mode enabled. Activate to disable zoom mode.'
        : 'Zoom mode disabled. Activate to enable zoom mode.');
      zoomControl.title = zoomMode
        ? 'Zoom mode enabled — scroll over the diagram to zoom'
        : 'Enable zoom mode, or hold Ctrl (⌘) and scroll to zoom';
    }
    zoomControl?.addEventListener('click', () => { zoomMode = !zoomMode; updateZoomState(); });
    updateZoomState();

    let nudgeTimer: ReturnType<typeof setTimeout> | null = null;
    function nudge() {
      wrapper.classList.add('zoom-nudge');
      if (nudgeTimer) clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(() => wrapper.classList.remove('zoom-nudge'), 900);
    }
    viewport.addEventListener('wheel', (event) => {
      if (!(zoomMode || event.ctrlKey || event.metaKey)) { nudge(); return; }
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const factor = Math.min(1.18, Math.max(0.85, Math.exp(-event.deltaY * 0.0012)));
      zoom(factor, event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });

    viewport.addEventListener('mousedown', (event) => {
      if (event.button !== 0 || !canStartDrag(event.target)) return;
      dragging = true;
      didDrag = false;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      panStartX = panX;
      panStartY = panY;
      viewport.style.cursor = 'grabbing';
      event.preventDefault();
    });
    window.addEventListener('mousemove', (event) => {
      if (!dragging) return;
      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
      panX = panStartX + dx;
      panY = panStartY + dy;
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      viewport.style.cursor = 'grab';
    });

    let lastTouches: TouchList | null = null;
    viewport.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1 && canStartDrag(event.target)) {
        dragging = true;
        didDrag = false;
        dragStartX = event.touches[0].clientX;
        dragStartY = event.touches[0].clientY;
        panStartX = panX;
        panStartY = panY;
      }
      lastTouches = event.touches;
    }, { passive: true });
    viewport.addEventListener('touchmove', (event) => {
      if (event.touches.length === 1 && dragging) {
        const dx = event.touches[0].clientX - dragStartX;
        const dy = event.touches[0].clientY - dragStartY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
        panX = panStartX + dx;
        panY = panStartY + dy;
        applyTransform();
        event.preventDefault();
      } else if (event.touches.length === 2 && lastTouches?.length === 2) {
        const oldDistance = Math.hypot(
          lastTouches[0].clientX - lastTouches[1].clientX,
          lastTouches[0].clientY - lastTouches[1].clientY,
        );
        const newDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY,
        );
        const rect = viewport.getBoundingClientRect();
        const centreX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
        const centreY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;
        if (oldDistance > 0) zoom(newDistance / oldDistance, centreX, centreY);
        lastTouches = event.touches;
        event.preventDefault();
      }
    }, { passive: false });
    viewport.addEventListener('touchend', () => { dragging = false; lastTouches = null; });

    const setZoomModifier = (event: KeyboardEvent) => {
      modifierZoom = event.ctrlKey || event.metaKey;
      updateZoomState();
    };
    window.addEventListener('keydown', setZoomModifier);
    window.addEventListener('keyup', setZoomModifier);
    window.addEventListener('blur', () => { modifierZoom = false; updateZoomState(); });

    if (options.fitBounds) new ResizeObserver(resetView).observe(viewport);
    resetView();
  }

  return {
    initControls,
    bindKeyboard,
    resetView,
    consumeDidDrag() { const value = didDrag; didDrag = false; return value; },
    get dragging() { return dragging; },
  };
}
