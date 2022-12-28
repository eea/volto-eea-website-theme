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

const EEALogo = () => {
  const lang = useSelector((state) => state.intl.locale);
  const intl = useIntl();
  const url = config.settings.isMultilingual ? `/${lang}` : '/';

  return (
    <Logo
      src={LogoImage}
      url={url}
      title={intl.formatMessage(messages.site)}
      alt={intl.formatMessage(messages.eeasite)}
    />
  );
};

export default EEALogo;
