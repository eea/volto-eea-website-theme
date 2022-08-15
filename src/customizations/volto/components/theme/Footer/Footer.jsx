/**
 * Footer component.
 * @module components/theme/Footer/Footer
 */

import React from 'react';
import EEAFooter from '@eeacms/volto-eea-design-system/ui/Footer/Footer';
import config from '@plone/volto/registry';

const Footer = (props) => {
  const { eea } = config.settings;
  return (
    <EEAFooter>
      <EEAFooter.SubFooter {...eea.footerOpts} />
      <EEAFooter.Header>{eea.footerOpts.header}</EEAFooter.Header>
      <EEAFooter.Sites sites={eea.footerOpts.sites} />
      <EEAFooter.Actions
        actions={eea.footerOpts.actions}
        copyright={eea.footerOpts.copyright}
      />
    </EEAFooter>
  );
};

export default Footer;
