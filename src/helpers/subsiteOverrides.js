import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

/**
 * Get the app path of a subsite, without trailing slash (e.g. /en/epanet).
 * @param {Object} subsite The @components.subsite expansion data
 * @returns {string}
 */
export const getSubsitePath = (subsite) =>
  flattenToAppURL(subsite['@id']).replace(/\/+$/, '');

/**
 * Check if the subsite path matches one of the patterns hardcoded in
 * config.settings.eea[settingName]. These are code-only governance
 * exceptions and can not be changed from the CMS.
 */
const matchesSubsitePaths = (subsite, settingName) => {
  if (subsite?.['@type'] !== 'Subsite' || !subsite['@id']) return false;
  const patterns = config.settings.eea?.[settingName] || [];
  const path = getSubsitePath(subsite);
  return patterns.some((pattern) => pattern.test(path));
};

/**
 * The uploaded subsite logo replaces the EEA logo in the header.
 */
export const shouldUseSubsiteMainLogo = (subsite) =>
  !!subsite?.subsite_logo?.scales &&
  matchesSubsitePaths(subsite, 'subsiteMainLogoPaths');

/**
 * Hide all footer content except the bottom links (privacy, legal, etc.).
 */
export const shouldHideSubsiteFooter = (subsite) =>
  matchesSubsitePaths(subsite, 'subsiteHideFooterPaths');
