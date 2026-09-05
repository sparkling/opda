import type { HeaderIconId } from '@/lib/header-icons';
import type { HeaderPaletteId } from '@/lib/header-palettes';

export const CAMPAIGN_HEADER_DEFAULTS = {
  icon: 'twin-frames' as HeaderIconId,
  palette: 'petrol' as HeaderPaletteId,
  scale: 26,
  opdaScale: 106,
  spaceAbove: 9,
  lineGap: 0,
  spaceBelow: 18,
  panelPositionX: -67,
  panelPositionY: -8,
  themeTogglePositionY: 25,
} as const;

export const campaignIdentityStyle = [
  `--identity-heading-size:${CAMPAIGN_HEADER_DEFAULTS.scale}px`,
  `--identity-opda-scale:${CAMPAIGN_HEADER_DEFAULTS.opdaScale / 100}`,
  `--identity-space-before:${CAMPAIGN_HEADER_DEFAULTS.spaceAbove}px`,
  `--identity-line-gap:${CAMPAIGN_HEADER_DEFAULTS.lineGap}px`,
  `--identity-space-after:${CAMPAIGN_HEADER_DEFAULTS.spaceBelow}px`,
].join(';');

export const campaignPanelStyle = [
  `--domains-position-x:${CAMPAIGN_HEADER_DEFAULTS.panelPositionX}px`,
  `--domains-position-y:${CAMPAIGN_HEADER_DEFAULTS.panelPositionY}px`,
].join(';');

export const campaignThemeToggleStyle =
  `--theme-toggle-position-y:${CAMPAIGN_HEADER_DEFAULTS.themeTogglePositionY}px`;
