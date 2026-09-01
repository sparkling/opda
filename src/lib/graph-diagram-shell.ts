/** Single source for GraphDiagram viewer chrome used by Astro and bare Mermaid. */
const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" /></svg>',
  navigate: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>',
  zoomIn: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>',
  zoomOut: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>',
  reset: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.99v4.99" /></svg>',
  fullscreen: '<svg class="gd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>',
};

export function graphDiagramShellHtml(sourceHtml = ''): string {
  return `
  <div class="gd-actionbar">
    <button type="button" class="gd-ctrl" aria-pressed="false" tabindex="-1" aria-label="Zoom — hold Ctrl (⌘) and scroll" title="Hold Ctrl (⌘) and scroll to zoom · drag to pan">${ICONS.search}Ctrl</button>
    <span class="gd-property-layers" role="group" aria-label="Property layers" hidden>
      <button type="button" class="gd-layer-btn" data-diagram-layer="datatype" aria-pressed="false">Datatype properties</button>
      <button type="button" class="gd-layer-btn" data-diagram-layer="object" aria-pressed="true">Object properties</button>
      <button type="button" class="gd-layer-btn" data-diagram-layer="inheritance" aria-pressed="true">Inheritance</button>
    </span>
    <span class="gd-actionbar-spacer"></span>
    <span class="diagram-toolbar" role="group" aria-label="Diagram controls">
      <button type="button" data-diagram-action="toggle-mode" title="Navigate: click opens the linked page. Explore: click locks the highlight." class="gd-seg-btn diagram-mode-toggle" aria-pressed="false" aria-label="Navigate mode. Activate to switch to explore mode.">${ICONS.navigate}<span class="diagram-mode-label">Navigate</span></button>
      <button type="button" data-diagram-action="zoom-in" title="Zoom in" class="gd-seg-btn" aria-label="Zoom in">${ICONS.zoomIn}</button>
      <button type="button" data-diagram-action="zoom-out" title="Zoom out" class="gd-seg-btn" aria-label="Zoom out">${ICONS.zoomOut}</button>
      <span class="gd-seg-btn gd-seg-label diagram-zoom-label" role="status" aria-live="polite" aria-label="Zoom level">100%</span>
      <button type="button" data-diagram-action="reset" title="Reset view (100%)" class="gd-seg-btn" aria-label="Reset view">${ICONS.reset}</button>
      <button type="button" data-diagram-action="fullscreen" title="Enter fullscreen" class="gd-seg-btn" aria-pressed="false" aria-label="Enter fullscreen diagram">${ICONS.fullscreen}</button>
    </span>
  </div>
  <div class="gd-box">
    <div class="gd-view-mermaid">
      <div class="diagram-viewport" style="cursor:grab">
        <div class="diagram-canvas">
          <p class="diagram-loading" role="status" aria-live="polite">Loading diagram…</p>
          <pre class="gd-mermaid" aria-hidden="true">${sourceHtml}</pre>
        </div>
      </div>
    </div>
  </div>`;
}
