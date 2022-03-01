/**
 * Footer component.
 * @module components/theme/Footer/Footer
 */

import React from 'react';
import EEAFooter from '@eeacms/volto-eea-design-system/ui/Footer/Footer';
import { Grid, Image } from 'semantic-ui-react';
import Logo1 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group.svg';
import Logo2 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-3.svg';
import Logo3 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-154.svg';
import Logo4 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-95.svg';
import Logo5 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-2.svg';
import Logo6 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-98.svg';
import Logo7 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-5.svg';
import Logo8 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-96.svg';
import Logo9 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-4.svg';
import Logo10 from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/Extras/Group-1.svg';
import EIONETLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/EIONETLogo.png';
import EEALogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Footer/EEA-Logo-white.svg';

const Footer = (props) => {
  const defaultProps = {
    actions: [
      {
        link: 'https://www.eea.europa.eu/login_form',
        title: 'CMS Login',
        copy: false,
      },
      {
        link: '/sitemap',
        title: 'Sitemap',
        copy: false,
      },
      {
        link: 'https://www.eea.europa.eu/legal/',
        title: 'Privacy',
        copy: false,
      },
      {
        link: 'https://www.eea.europa.eu/copyright',
        title: 'Copyright',
        copy: true,
      },
    ],
    sites: [
      {
        link: 'https://biodiversity.europa.eu/',
        src: Logo1,
        alt: 'Biodiversity',
      },
      {
        link: 'https://climate-energy.eea.europa.eu/',
        src: Logo2,
        alt: 'Climate and energy in the EU',
      },
      {
        link: 'https://insitu.copernicus.eu/',
        src: Logo3,
        alt: 'Copernicus in situ',
      },
      {
        link: 'https://ipchem.jrc.ec.europa.eu/RDSIdiscovery/ipchem/index.html',
        src: Logo4,
        alt: 'Information platform for chemical monitoring',
      },
      {
        link: 'https://water.europa.eu/freshwater',
        src: Logo5,
        alt: 'WISE freshwater',
      },
      {
        link: 'https://forest.eea.europa.eu/',
        src: Logo6,
        alt: 'Forest information system for europe',
      },
      {
        link: 'https://climate-adapt.eea.europa.eu/',
        src: Logo7,
        alt: 'Climate adapt',
      },
      {
        link: 'https://land.copernicus.eu/',
        src: Logo8,
        alt: 'Copernicus land monitoring service',
      },
      {
        link: 'https://industry.eea.europa.eu/',
        src: Logo9,
        alt: 'European industrial emissions portal',
      },
      {
        link: 'https://water.europa.eu/marine',
        src: Logo10,
        alt: 'WISE marine',
      },
    ],
    social: [
      {
        name: 'twitter',
        link: 'https://twitter.com/euenvironment',
      },
      {
        name: 'facebook',
        link: 'https://www.facebook.com/European.Environment.Agency',
      },
      {
        name: 'linkedin',
        link: 'https://www.linkedin.com/company/european-environment-agency',
      },
      {
        name: 'youtube',
        link: 'https://www.youtube.com/user/EEAvideos',
      },
      {
        name: 'rss',
        link: '/subscription/news-feeds',
      },
    ],
    contacts: {
      header: 'Contact Us',
      contacts: [
        {
          icon: 'comment outline',
          text: 'Ask your question',
          link: 'https://www.eea.europa.eu/contact-us',
        },
        {
          icon: 'envelope outline',
          text: 'Sign up to our newsletter',
          link: 'https://www.eea.europa.eu/subscription/targeted-subscription',
        },
      ],
      address: 'Kongens Nytorv 6 1050 Copenhagen K (+45) 33 36 71 00',
    },
    ...props,
  };
  return (
    <EEAFooter>
      <EEAFooter.Header>The EEA also contributes to</EEAFooter.Header>
      <EEAFooter.Sites sites={defaultProps.sites} />

      <EEAFooter.SubFooter>
        <div className="subfooter">
          <Grid>
            <Grid.Column mobile={6} tablet={7} computer={8}>
              <div className="item">
                <div className="site logo">
                  <a href="https://www.eea.europa.eu/">
                    <Image src={EEALogo} alt="EEA Logo"></Image>
                  </a>
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
                <EEAFooter.Contact contacts={defaultProps.contacts} />
                <EEAFooter.Social social={defaultProps.social} />
              </div>
            </Grid.Column>
          </Grid>
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <EEAFooter.Actions actions={defaultProps.actions} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </EEAFooter.SubFooter>
    </EEAFooter>
  );
};

export default Footer;
