/** Build-generated CSS is shared by campaign templates, never copied by hand. */
export async function campaignDesignSystemCss() {
  if (typeof __OPDA_CAMPAIGN_DESIGN_SYSTEM_CSS__ === 'string') {
    return __OPDA_CAMPAIGN_DESIGN_SYSTEM_CSS__;
  }
  const { renderCampaignDesignSystem } = await import('../integrations/bundle-design-system.mjs');
  const { output } = await renderCampaignDesignSystem({ publicDir: new URL('../../public/', import.meta.url) });
  return output;
}
