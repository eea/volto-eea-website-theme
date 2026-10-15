import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

/**
 * Check if the subsite path matches one of the patterns hardcoded in
 * config.settings.eea[settingName]. These are code-only governance
 * exceptions and can not be changed from the CMS.
 */
const matchesSubsitePaths = (subsite, settingName) => {
  if (subsite?.['@type'] !== 'Subsite' || !subsite['@id']) return false;
  const patterns = config.settings.eea[settingName] || [];
  const path = flattenToAppURL(subsite['@id']).replace(/\/+$/, '');
  return patterns.some((pattern) => pattern.test(path));
};

/**
 * The uploaded subsite logo replaces the EEA logo in the header.
 */
export const shouldUseSubsiteMainLogo = (subsite) =>
  !!subsite?.subsite_logo?.scales &&
  matchesSubsitePaths(subsite, 'subsiteMainLogoPaths');

/**
 * Hide the header top bar (EU notice, information systems, languages).
 */
export const shouldHideSubsiteTopHeader = (subsite) =>
  matchesSubsitePaths(subsite, 'subsiteHideTopHeaderPaths');

/**
 * Hide the EEA branding from the footer (EEA and Eionet logos, information
 * systems button). These come from the theme config, not from Plone.
 */
export const shouldHideSubsiteFooterBranding = (subsite) =>
  matchesSubsitePaths(subsite, 'subsiteHideFooterBrandingPaths');
