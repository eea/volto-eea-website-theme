import config from '@plone/volto/registry';
import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';
import { buildLegacyRedirect, getLegacyRedirect } from './legacyRoutes';

/**
 * Legacy Plone routes redux middleware.
 *
 * Client-side counterpart of the express middleware: SPA navigations never
 * reach express, so the redirect happens here instead. `GET_CONTENT` for a
 * legacy Plone route is dropped before it reaches the API middleware, as the
 * API answers with HTML and the reducers would crash on it.
 *
 * @function legacyRoutesClient
 * @returns {Function} Redux middleware.
 */
const legacyRoutesClient = () => (next) => (action) => {
  const options = config.settings.eea?.legacyRoutes;

  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      const { pathname, search } = action.payload?.location || {};
      const target = buildLegacyRedirect(
        pathname,
        search?.replace(/^\?/, ''),
        options,
      );

      if (target && typeof window !== 'undefined') {
        window.location.replace(target);
        return;
      }

      return next(action);
    }

    case GET_CONTENT: {
      const path = action.request?.path;
      if (path && getLegacyRedirect(path, options)) {
        return;
      }

      return next(action);
    }

    default:
      return next(action);
  }
};

export default legacyRoutesClient;
