import config from '@plone/volto/registry';

const originOf = (value) => {
  if (typeof value !== 'string' || !value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      return new URL(value).origin;
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Convert an image block url into a path the Volto Api client can request
 * (e.g. `/eea/en/amenda.jpeg`).
 *
 * Returns the url unchanged when it is already in path form, the pathname
 * when it is a full URL served by this application (same-origin, or one of
 * the configured apiPath / internalApiPath / publicURL origins), and null
 * for anything else (external images have no Image object to summarize).
 *
 * SSR-safe: never requires `window`.
 */
export const toApiPath = (url) => {
  if (typeof url !== 'string' || !url) return null;
  // Protocol-relative urls are rejected on purpose.
  if (url.startsWith('//')) return null;
  if (url.startsWith('/')) return url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return null;

  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return null;
  }

  const { settings } = config;
  const knownOrigins = [
    originOf(settings.apiPath),
    originOf(settings.internalApiPath),
    originOf(settings.publicURL),
  ];
  if (typeof window !== 'undefined') {
    knownOrigins.push(window.location.origin);
  }
  if (!knownOrigins.includes(parsed.origin)) return null;

  return parsed.pathname;
};
