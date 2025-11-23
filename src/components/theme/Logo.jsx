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
 * Uses state.intl.locale to construct the logo link URL for multilingual sites.
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
  const lang = useSelector((state) => state.intl.locale);
  const intl = useIntl();
  const url = config.settings.isMultilingual
    ? `/${lang}`
    : config.settings.eea?.logoTargetUrl || '/';

  return (
    <Logo
      src={inverted && invertedSrc ? invertedSrc : src}
      invertedSrc={invertedSrc}
      url={url}
      title={title || intl.formatMessage(messages.site)}
      alt={alt || intl.formatMessage(messages.eeasite)}
      width={width}
      height={height}
      inverted={inverted}
    />
  );
};

export default EEALogo;
