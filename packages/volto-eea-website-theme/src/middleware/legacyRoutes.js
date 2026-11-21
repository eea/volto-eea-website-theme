/**
 * Legacy Plone routes.
 *
 * Plone answers `@@`-views and file views (`/view`, `/folder_listing`,
 * `/at_download/...`) with an HTML page, which Volto's `GET_CONTENT` cannot
 * digest: the reducers crash on the client and SSR returns 500. These paths
 * are never content objects, so they are redirected to the parent object.
 *
 * Legacy Plone search URLs (`@@search`, `/search`) are redirected to the
 * site's own search page, which is site specific: `/en/advanced-search` on
 * www.eea.europa.eu, something else (or nothing) on other EEA frontends.
 *
 * Paths listed in `gone` are dead Plone endpoints that Volto cannot render at
 * all (`/RSS`, `/atom.xml`, `/mail_password_form`): they are answered with 410.
 *
 * All behaviours are disabled by default and enabled per site through
 * `config.settings.eea.legacyRoutes`.
 */

// `/view`, `/@@view`, `/folder_listing`, `/folder_contents`, `/at_download/<file>`
const VIEW_SUFFIX =
  /\/(?:@@)?view\/?$|\/folder_listing\/?$|\/folder_contents\/?$|\/at_download(?:\/.*)?$/;

// `/en` -> `/` language prefix, used to recognise per language copies of a gone path
const LANGUAGE_PREFIX = /^\/[a-z]{2}(?=\/)/;

// `/search`, `/<lang>/search` (Plone's classic search entry points)
const SEARCH_PATH = /^\/(?:[a-z]{2}\/)?search\/?$/;

// `/@@search`, `/<lang>/@@search`, `/<section>/@@search` (Plone's search view)
const SEARCH_VIEW = /(?:^|\/)@@search\/?$/;

/**
 * Whether a path is a dead Plone endpoint that must not be rendered at all.
 * Entries are absolute paths (`/RSS`); the language prefixed form
 * (`/en/RSS`) matches as well.
 * @function isLegacyGone
 * @param {string} pathname Request path.
 * @param {Object} options `config.settings.eea.legacyRoutes`.
 * @returns {boolean} True when the path should be answered with 410.
 */
export const isLegacyGone = (pathname, options) => {
  const { gone = [] } = options || {};

  if (typeof pathname !== 'string' || !pathname.startsWith('/')) {
    return false;
  }

  // Never touch the internal API
  if (pathname.startsWith('/++')) {
    return false;
  }

  const normalized = pathname.replace(/\/+$/, '') || '/';
  const withoutLanguage = normalized.replace(LANGUAGE_PREFIX, '');

  return gone.includes(normalized) || gone.includes(withoutLanguage);
};

/**
 * Target path for a legacy Plone route.
 * @function getLegacyRedirect
 * @param {string} pathname Request path.
 * @param {Object} options `config.settings.eea.legacyRoutes`.
 * @returns {string|null} Target path or null when the route is not legacy.
 */
export const getLegacyRedirect = (pathname, options) => {
  const { search = null, views = false } = options || {};

  if (typeof pathname !== 'string' || !pathname.startsWith('/')) {
    return null;
  }

  // Never touch the internal API
  if (pathname.startsWith('/++')) {
    return null;
  }

  if (search && (SEARCH_PATH.test(pathname) || SEARCH_VIEW.test(pathname))) {
    return search;
  }

  if (views && VIEW_SUFFIX.test(pathname)) {
    return pathname.replace(VIEW_SUFFIX, '') || '/';
  }

  return null;
};

/**
 * Redirect target for a legacy Plone route, query string included.
 * Plone's `SearchableText` is mapped to the `q` parameter used by searchlib.
 * @function buildLegacyRedirect
 * @param {string} pathname Request path.
 * @param {string} searchString Request query string, without the leading `?`.
 * @param {Object} options `config.settings.eea.legacyRoutes`.
 * @returns {string|null} Target path with query string, or null when not legacy.
 */
export const buildLegacyRedirect = (pathname, searchString, options) => {
  const target = getLegacyRedirect(pathname, options);
  if (!target) {
    return null;
  }

  const params = new URLSearchParams(searchString || '');
  const query = params.get('q') || params.get('SearchableText');
  params.delete('SearchableText');
  if (query) {
    params.set('q', query);
  }

  const qs = params.toString();
  return qs ? `${target}?${qs}` : target;
};

export default getLegacyRedirect;
