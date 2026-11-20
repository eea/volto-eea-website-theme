import config from '@plone/volto/registry';

// Volto 19 removed the `isMultilingual` and `defaultLanguage` settings and
// reads both from the backend `@site` endpoint. Fall back to the settings
// until Volto 18 is no longer supported.
export const getIsMultilingual = (state) =>
  state.site?.data?.features?.multilingual ?? config.settings.isMultilingual;

export const getDefaultLanguage = (state) =>
  state.site?.data?.['plone.default_language'] ??
  config.settings.defaultLanguage ??
  'en';
