import superagent from 'superagent';
import config from '@plone/volto/registry';
import { addHeadersFactory } from '@plone/volto/helpers/Proxy/Proxy';
import { isInternalURL } from '@plone/volto/helpers';


/**
 * Get a resource image/file with authenticated (if token exist) API headers
 * @function getBackendResourceWithAuth
 * @param {Object} req Request object
 * @return {string} The response with the image
 */
export const getBackendResourceWithAuth = (req) =>
  new Promise((resolve, reject) => {
    const { settings } = config;

    let apiPath = '';
    if (settings.internalApiPath && __SERVER__) {
      apiPath = settings.internalApiPath;
    } else if (__DEVELOPMENT__ && settings.devProxyToApiPath) {
      apiPath = settings.devProxyToApiPath;
    } else {
      apiPath = settings.apiPath;
    }
    const backendURL = `${apiPath}${req.path}`;
    const request = superagent
      .get(backendURL)
      .maxResponseSize(settings.maxResponseSize)
      .responseType('blob');
    const authToken = req.universalCookies.get('auth_token');
    if (authToken) {
      request.set('Authorization', `Bearer ${authToken}`);
    }
    request.use(addHeadersFactory(req));
    request.then(resolve).catch(reject);
  });

export const setImageSize = (image, scales, size) => {
  const imageScaled = isInternalURL(image)
    ? // Backwards compat in the case that the block is storing the full server URL
      (() => {
        if (scales) {
          if (size === 'h') return scales.huge;
          if (size === 'l') return scales.large;
          if (size === 'm') return scales.preview;
          if (size === 's') return scales.thumb;
          return scales.large;
        }
      })()
    : { download: image, width: '100%', height: '100%' };

  return imageScaled;
};
