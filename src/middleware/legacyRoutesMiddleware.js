import config from '@plone/volto/registry';
import { buildLegacyRedirect } from './legacyRoutes';

/**
 * Legacy Plone routes express middleware.
 *
 * Handles the request before SSR renders it, so non-content Plone paths
 * (`@@search`, `/search`, `/view`, `/@@view`, `/folder_listing`,
 * `/at_download/...`) get a plain redirect instead of a 500 page.
 *
 * Settings are read at request time, so a site policy add-on can enable the
 * redirects regardless of the add-on loading order.
 *
 * @function legacyRoutesMiddleware
 * @param {Object} express Express module.
 * @returns {Object} Express router.
 */
const legacyRoutesMiddleware = function (express) {
  const middleware = express.Router();

  middleware.all('*', (req, res, next) => {
    const options = config.settings.eea?.legacyRoutes;
    const target = buildLegacyRedirect(
      req.path,
      req.url.split('?')[1],
      options,
    );

    if (!target) {
      return next();
    }

    res.set('Cache-Control', 'public, max-age=60');
    return res.redirect(301, target);
  });

  middleware.id = 'legacy-routes';
  return middleware;
};

export default legacyRoutesMiddleware;
