import React from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import config from '@plone/volto/registry';

import { Logo } from '@eeacms/volto-eea-design-system/ui';
import LogoImage from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/eea-logo.svg';

const messages = defineMessages({
  site: {
    id: 'Site',
    defaultMessage: 'Site',
  },
  eeasite: {
    id: 'European Environment Agency',
    defaultMessage: 'European Environment Agency',
  },
});

/**
 * EEALogo component.
 * Wraps the Logo component from volto-eea-design-system with language-aware URL.
 * Constructs the logo link URL for multilingual sites by extracting the language code from the router pathname; falls back to the default language from config if not present.
 *
 * @param {Object} props - The component props.
 * @param {string} props.src - The logo image source.
 * @param {string} props.invertedSrc - The inverted logo image source (for dark backgrounds).
 * @param {boolean} props.inverted - Whether to use the inverted logo.
 * @param {string} props.title - The logo title attribute.
 * @param {string} props.alt - The logo alt text.
 * @param {number} props.width - The logo width.
 * @param {number} props.height - The logo height.
 */
const EEALogo = ({
  src = LogoImage,
  invertedSrc,
  inverted = false,
  title,
  alt,
  width,
  height,
}) => {
  const intl = useIntl();
  const pathname =
    useSelector((state) => state.router?.location?.pathname) || '/';
  const lang = React.useMemo(() => {
    const pathParts = pathname.split('/').filter(Boolean);
    // First segment is language code in multilingual sites
    if (pathParts.length > 0 && pathParts[0].length === 2) {
      return pathParts[0];
    }
    return config.settings.defaultLanguage || 'en';
  }, [pathname]);

  const url = config.settings.isMultilingual
    ? `/${lang}`
    : config.settings.eea?.logoTargetUrl || '/';

  // Only pass inverted=true if we have an invertedSrc, otherwise the design system
  // Logo will try to use undefined invertedSrc instead of falling back to src
  const shouldInvert = inverted && invertedSrc;

  return (
    <Logo
      src={src}
      invertedSrc={invertedSrc}
      inverted={shouldInvert}
      url={url}
      title={title || intl.formatMessage(messages.site)}
      alt={alt || intl.formatMessage(messages.eeasite)}
      width={width}
      height={height}
    />
  );
};

export default EEALogo;
