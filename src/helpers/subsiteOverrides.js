import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

/**
 * Check if the current subsite path matches one of the hardcoded patterns
 * from config.settings.eea[settingName]. These are code-only governance
 * exceptions and can not be changed from the CMS.
 * @param {Object} subsite The @components.subsite expansion data
 * @param {string} settingName Name of the setting in config.settings.eea
 * @returns {boolean}
 */
export const matchesSubsitePaths = (subsite, settingName) => {
  if (subsite?.['@type'] !== 'Subsite' || !subsite['@id']) return false;
  const patterns = config.settings.eea?.[settingName] || [];
  const path = flattenToAppURL(subsite['@id']).replace(/\/+$/, '');
  return patterns.some((pattern) => pattern.test(path));
};

/**
 * The uploaded subsite logo replaces the EEA logo in the header.
 */
export const isSubsiteLogoMain = (subsite) =>
  !!subsite?.subsite_logo?.scales &&
  matchesSubsitePaths(subsite, 'subsiteMainLogoPaths');

/**
 * Hide all footer content except the bottom links (privacy, login, etc.).
 */
export const isSubsiteFooterHidden = (subsite) =>
  matchesSubsitePaths(subsite, 'subsiteHideFooterPaths');
