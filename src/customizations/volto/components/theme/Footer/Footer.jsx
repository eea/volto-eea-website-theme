/**
 * Footer component.
 * @module components/theme/Footer/Footer
 */

import React from 'react';
import EEAFooter from '@eeacms/volto-eea-design-system/ui/Footer/Footer';
import { Grid, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import EIONETLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/EIONETLogo.png';
import EEALogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/EEA-Logo-white.svg';

import config from '@plone/volto/registry';

const Footer = (props) => {
  const { eea } = config.settings;

  return (
    <EEAFooter>
      <EEAFooter.Header>The EEA also contributes to</EEAFooter.Header>
      <EEAFooter.Sites sites={config.settings.eea.partnerWebsites} />

      <EEAFooter.SubFooter>
        <div className="subfooter">
          <Grid>
            <Grid.Column mobile={6} tablet={7} computer={8}>
              <div className="item">
                <div className="site logo">
                  <Link to="/">
                    <Image src={EEALogo} alt="EEA Logo"></Image>
                  </Link>
                  <p className="description">An agency of the European Union</p>
                </div>

                <div className="eionet logo">
                  <a href="https://www.eionet.europa.eu/">
                    <Image src={EIONETLogo} alt="EIONET Logo"></Image>
                  </a>
                  <p className="description">
                    European Environment
                    <br />
                    Information and
                    <br />
                    Observation Network
                  </p>
                </div>
              </div>
            </Grid.Column>
            <Grid.Column mobile={6} tablet={5} computer={4}>
              <div className="item">
                <EEAFooter.Contact contacts={eea.footerActions} />
                <EEAFooter.Social social={eea.socialActions} />
              </div>
            </Grid.Column>
          </Grid>
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <EEAFooter.Actions actions={eea.globalActions} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </EEAFooter.SubFooter>
    </EEAFooter>
  );
};

export default Footer;
