import type { HeaderIconId } from '@/lib/header-icons';
import type { HeaderPaletteId } from '@/lib/header-palettes';

export interface CampaignHeaderConfiguration {
  icon: HeaderIconId;
  palette: HeaderPaletteId;
  scale: number;
  opdaScale: number;
  spaceAbove: number;
  lineGap: number;
  spaceBelow: number;
  panelPositionX: number;
  panelPositionY: number;
  panelWidth: number;
  panelItemSpacing: number;
  themeTogglePositionY: number;
}

export const CAMPAIGN_HEADER_DEFAULTS: CampaignHeaderConfiguration = {
  icon: 'twin-frames',
  palette: 'petrol',
  scale: 26,
  opdaScale: 106,
  spaceAbove: 9,
  lineGap: 0,
  spaceBelow: 18,
  panelPositionX: -67,
  panelPositionY: 50,
  panelWidth: 96,
  panelItemSpacing: 16,
  themeTogglePositionY: 25,
};

export const JOIN_CAMPAIGN_HEADER_DEFAULTS: CampaignHeaderConfiguration = {
  ...CAMPAIGN_HEADER_DEFAULTS,
  scale: 32,
  opdaScale: 87,
  panelPositionX: -17,
  panelPositionY: -23,
  panelWidth: 93,
  themeTogglePositionY: 10,
};

export function getCampaignIdentityStyle(configuration: CampaignHeaderConfiguration) {
  return [
    `--identity-heading-size:${configuration.scale}px`,
    `--identity-opda-scale:${configuration.opdaScale / 100}`,
    `--identity-space-before:${configuration.spaceAbove}px`,
    `--identity-line-gap:${configuration.lineGap}px`,
    `--identity-space-after:${configuration.spaceBelow}px`,
  ].join(';');
}

export function getCampaignPanelStyle(configuration: CampaignHeaderConfiguration) {
  return [
    `--domains-position-x:${configuration.panelPositionX}px`,
    `--domains-position-y:${configuration.panelPositionY}px`,
    `--domains-width:${configuration.panelWidth}%`,
    `--domains-item-spacing:${configuration.panelItemSpacing}px`,
  ].join(';');
}

export function getCampaignThemeToggleStyle(configuration: CampaignHeaderConfiguration) {
  return `--theme-toggle-position-y:${configuration.themeTogglePositionY}px`;
}

export const campaignPanelStyle = getCampaignPanelStyle(CAMPAIGN_HEADER_DEFAULTS);
