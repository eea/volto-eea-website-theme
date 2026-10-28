import config from '@plone/volto/registry';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';

// Volto 19 provides this helper directly. Keep the implementation local until
// Volto 18 is no longer supported, so the same add-on build works on both.
export const addSubpathPrefix = (src) => {
  const { subpathPrefix } = config.settings;

  if (isInternalURL(src) && subpathPrefix && !src.startsWith(subpathPrefix)) {
    return `${subpathPrefix}${src}`;
  }

  return src;
};
