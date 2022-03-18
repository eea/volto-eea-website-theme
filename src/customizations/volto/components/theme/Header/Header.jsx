/**
 * Header component.
 * @module components/theme/Header/Header
 */

import React from 'react';
import { Dropdown, Image } from 'semantic-ui-react';
import { connect, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { UniversalLink } from '@plone/volto/components';
import {
  getBaseUrl,
  hasApiExpander,
  flattenToAppURL,
} from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';
import { Header, Logo } from '@eeacms/volto-eea-design-system/ui';
import { usePrevious } from '@eeacms/volto-eea-design-system/helpers';
import { useSelector } from 'react-redux';
import { find } from 'lodash';
import LogoImage from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/eea-logo.svg';
import globeIcon from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/global-line.svg';
import eeaFlag from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/eea.png';

import config from '@plone/volto/registry';
import { compose } from 'recompose';

/**
 * EEA Specific Header component.
 */
const EEAHeader = ({ pathname, token, items, history }) => {
  const currentLang = useSelector((state) => state.intl.locale);
  const translations = useSelector(
    (state) => state.content.data?.['@components']?.translations?.items,
  );

  const { eea } = config.settings;
  const dispatch = useDispatch();
  const previousToken = usePrevious(token);
  const [language, setLanguage] = React.useState(
    currentLang || eea.defaultLanguage,
  );

  React.useEffect(() => {
    const { settings } = config;
    const base = getBaseUrl(pathname);
    if (!hasApiExpander('navigation', base)) {
      dispatch(getNavigation(base, settings.navDepth));
    }
  }, [pathname, dispatch]);

  React.useEffect(() => {
    if (token !== previousToken) {
      const { settings } = config;
      const base = getBaseUrl(pathname);
      if (!hasApiExpander('navigation', base)) {
        dispatch(getNavigation(base, settings.navDepth));
      }
    }
  }, [token, dispatch, pathname, previousToken]);

  return (
    <Header menuItems={items}>
      <Header.TopHeader>
        <Header.TopItem className="official-union">
          <Image src={eeaFlag} alt="eea flag"></Image>
          <Header.TopDropdownMenu
            text="An official website of the European Union | How do you Know?"
            mobileText="An official EU website"
            icon="chevron down"
            aria-label="dropdown"
            className=""
          >
            <div className="content">
              <p>
                All official European Union website addresses are in the{' '}
                <b>europa.eu</b> domain.
              </p>
              <a
                href="https://europa.eu/european-union/contact/institutions-bodies_en"
                target="_blank"
                rel="noreferrer"
                role="option"
                aria-selected="false"
              >
                See all EU institutions and bodies
              </a>
            </div>
          </Header.TopDropdownMenu>
        </Header.TopItem>

        <Header.TopItem>
          <Header.TopDropdownMenu
            id="theme-sites"
            className="tablet or lower hidden"
            text={eea.globalHeaderPartnerLinks.title}
          >
            <div className="wrapper">
              {eea.globalHeaderPartnerLinks.links.map((item, index) => (
                <Dropdown.Item key={index}>
                  <a
                    href={item.href}
                    className="site"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.title}
                  </a>
                </Dropdown.Item>
              ))}
            </div>
          </Header.TopDropdownMenu>
        </Header.TopItem>

        <Header.TopDropdownMenu
          id="language-switcher"
          className="item"
          text={`${language.toUpperCase()}`}
          icon={
            <Image src={globeIcon} alt="language dropdown globe icon"></Image>
          }
        >
          {eea.languages.map((item, index) => (
            <Dropdown.Item
              key={index}
              text={
                <span>
                  {item.name}{' '}
                  <span className="country-code">
                    {item.code.toUpperCase()}
                  </span>
                </span>
              }
              onClick={() => {
                const translation = find(translations, { language: item.code });
                const to = translation
                  ? flattenToAppURL(translation['@id'])
                  : `/${item.code}`;
                setLanguage(item.code);
                history.push(to);
              }}
            ></Dropdown.Item>
          ))}
        </Header.TopDropdownMenu>
      </Header.TopHeader>
      <Header.Main
        pathname={pathname}
        logo={
          <Logo
            src={LogoImage}
            title={eea.websiteTitle}
            alt={eea.organisationName}
            url={eea.logoTargetUrl}
          />
        }
        menuItems={items}
        renderGlobalMenuItem={(item, { onClick }) => (
          <a
            href={item.url || '/'}
            title={item.title}
            onClick={(e) => {
              e.preventDefault();
              onClick(e, item);
            }}
          >
            {item.title}
          </a>
        )}
        renderMenuItem={(item) => (
          <UniversalLink href={item.url || '/'} title={item.title}>
            {item.title}
          </UniversalLink>
        )}
      ></Header.Main>
    </Header>
  );
};

export default compose(
  withRouter,
  connect(
    (state) => ({
      token: state.userSession.token,
      items: state.navigation.items,
    }),
    { getNavigation },
  ),
)(EEAHeader);
