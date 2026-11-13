import config from '@plone/volto/registry';
import { buildLegacyRedirect, isLegacyGone } from './legacyRoutes';

/**
 * Legacy Plone routes express middleware.
 *
 * Handles the request before SSR renders it, so non-content Plone paths
 * (`@@search`, `/search`, `/view`, `/@@view`, `/folder_listing`,
 * `/folder_contents`, `/at_download/...`) get a plain redirect instead of a
 * 500 page, while the dead ones listed in `gone` get a 410.
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

    if (isLegacyGone(req.path, options)) {
      res.set('Cache-Control', 'public, max-age=60');
      return res.status(410).type('text/plain').send('Gone');
    }

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
