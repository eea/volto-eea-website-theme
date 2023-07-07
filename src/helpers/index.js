import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';

import superagent from 'superagent';
import config from '@plone/volto/registry';
import { addHeadersFactory } from '@plone/volto/helpers/Proxy/Proxy';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers';

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

export const getFieldURL = (data) => {
  let url = data;
  const _isObject = data && isObject(data) && !isArray(data);
  if (_isObject && data['@type'] === 'URL') {
    url = data['value'] ?? data['url'] ?? data['href'] ?? data;
  } else if (_isObject) {
    url = data['@id'] ?? data['url'] ?? data['href'] ?? data;
  }
  if (isArray(data)) {
    url = data.map((item) => getFieldURL(item));
  }
  if (isString(url) && isInternalURL(url)) return flattenToAppURL(url);
  return url;
};

export function getImageScaleParams(image, size) {
  const imageScale = size || 'preview'; //listings use preview scale

  if (isString(image))
    return isInternalURL(image)
      ? flattenToAppURL(`${image}/@@images/image/mini`)
      : image;
  if (image) {
    if (isInternalURL(getFieldURL(image))) {
      if (image?.image_scales?.[image?.image_field]) {
        const scale =
          image.image_scales[image.image_field]?.[0].scales?.[imageScale] ||
          image.image_scales[image.image_field]?.[0];

        const download = flattenToAppURL(
          `${getFieldURL(image)}/${scale?.download}`,
        );
        const width = scale?.width;
        const height = scale?.height;

        return {
          download,
          width,
          height,
        };
      } else if (image?.image?.scales) {
        const scale = image.image?.scales?.[imageScale] || image.image;
        const download = flattenToAppURL(scale?.download);
        const width = scale?.width;
        const height = scale?.height;

        return {
          download,
          width,
          height,
        };
      } //fallback if we do not have scales
      else {
        return {
          download: flattenToAppURL(
            `${getFieldURL(image)}/@@images/${
              image.image_field || 'image'
            }/${imageScale}`,
          ),
        };
      }
    } else {
      return { download: getFieldURL(image) };
    }
  }
}
