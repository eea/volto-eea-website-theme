/**
 * Header component.
 * @module components/theme/Header/Header
 */

import React from 'react';
import { Dropdown, Image } from 'semantic-ui-react';
import { connect, useDispatch, useSelector } from 'react-redux';

import { withRouter } from 'react-router-dom';
import { UniversalLink } from '@plone/volto/components';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';
import { getNavigationSettings } from '@eeacms/volto-eea-website-theme/actions';
import { Header, Logo } from '@eeacms/volto-eea-design-system/ui';
import { usePrevious } from '@eeacms/volto-eea-design-system/helpers';
import eeaFlag from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/eea.png';

import config from '@plone/volto/registry';
import { compose } from 'recompose';

import cx from 'classnames';
import loadable from '@loadable/component';

const LazyLanguageSwitcher = loadable(() => import('./LanguageSwitcher'));

function removeTrailingSlash(path) {
  return path.replace(/\/+$/, '');
}

/**
 * EEA Specific Header component.
 */
const EEAHeader = ({ pathname, token, items, history, subsite }) => {
  const router_pathname = useSelector((state) => {
    return removeTrailingSlash(state.router?.location?.pathname) || '';
  });

  const isSubsite = subsite?.['@type'] === 'Subsite';

  const isHomePageInverse = useSelector((state) => {
    const layout = state.content?.data?.layout;
    const has_home_layout =
      layout === 'homepage_inverse_view' ||
      (__CLIENT__ && document.body.classList.contains('homepage-inverse'));

    return (
      has_home_layout &&
      (removeTrailingSlash(pathname) === router_pathname ||
        router_pathname.endsWith('/edit') ||
        router_pathname.endsWith('/add'))
    );
  });

  const { eea } = config.settings;
  const headerOpts = eea.headerOpts || {};
  const headerSearchBox = eea.headerSearchBox || [];
  const { logo, logoWhite } = headerOpts;
  const width = useSelector((state) => state.screen?.width);
  const dispatch = useDispatch();
  const previousToken = usePrevious(token);
  const navigationSettings = useSelector(
    (state) => state.navigationSettings?.settings || {},
  );
  const navigationLoaded = useSelector(
    (state) => state.navigationSettings?.loaded,
  );
  const updateRequest = useSelector((state) => state.content.update);

  // Combine navigation settings from backend with config fallback
  const configLayouts = config.settings?.menuItemsLayouts || {};
  const enhancedLayouts = { ...configLayouts };

  // Map navigation settings to menu item URLs
  if (items) {
    items.forEach((menuItem) => {
      // Check if we have navigation settings for any route that might match this menu item
      Object.keys(navigationSettings).forEach((routeId) => {
        const route = navigationSettings[routeId];
        const backendSettings = {};

        if (route.hideChildrenFromNavigation !== undefined) {
          backendSettings.hideChildrenFromNavigation =
            route.hideChildrenFromNavigation;
        }

        if (route.menuItemChildrenListColumns !== undefined) {
          // Convert strings back to integers for header usage
          backendSettings.menuItemChildrenListColumns = Array.isArray(
            route.menuItemChildrenListColumns,
          )
            ? route.menuItemChildrenListColumns
                .map((val) =>
                  typeof val === 'string' ? parseInt(val, 10) : val,
                )
                .filter((val) => !isNaN(val))
            : route.menuItemChildrenListColumns;
        }

        if (route.menuItemColumns !== undefined) {
          // Use menuItemColumns directly as they're already in semantic UI format
          backendSettings.menuItemColumns = route.menuItemColumns;
        }

        if (Object.keys(backendSettings).length > 0) {
          // Override the config setting with backend data
          enhancedLayouts[routeId] = {
            ...enhancedLayouts[routeId],
            ...backendSettings,
          };
        }
      });
    });
  }

  React.useEffect(() => {
    console.log('TRIGGER PAGE LOAD ', updateRequest);
    dispatch(getNavigationSettings(pathname));
  }, [updateRequest]);

  React.useEffect(() => {
    const base_url = getBaseUrl(pathname);
    const { settings } = config;

    // Check if navigation data needs to be fetched based on the API expander availability
    if (!hasApiExpander('navigation', base_url)) {
      dispatch(getNavigation(base_url, settings.navDepth));
    }

    // Additional check for token changes
    if (token !== previousToken) {
      dispatch(getNavigation(base_url, settings.navDepth));
    }

    // Fetch navigation settings
    // if (!navigationLoaded) {
    //   dispatch(getNavigationSettings(pathname));
    // }
  }, [pathname, token, dispatch, previousToken, navigationLoaded]);

  return (
    <Header menuItems={items}>
      <Header.TopHeader>
        <Header.TopItem className="official-union">
          <Image src={eeaFlag} alt="European Union flag"></Image>
          <Header.TopDropdownMenu
            text="An official website of the European Union | How do you know?"
            tabletText="EEA information systems"
            mobileText="EEA information systems"
            icon="chevron down"
            aria-label="dropdown"
            classNameHeader="mobile-sr-only"
            viewportWidth={width}
          >
            <div
              className="content"
              onClick={(evt) => evt.stopPropagation()}
              onKeyDown={(evt) => evt.stopPropagation()}
              tabIndex={0}
              role={'presentation'}
            >
              <p>
                All official European Union website addresses are in the{' '}
                <b>europa.eu</b> domain.
              </p>
              <a
                href="https://europa.eu/european-union/contact/institutions-bodies_en"
                target="_blank"
                rel="noopener"
                onKeyDown={(evt) => evt.stopPropagation()}
              >
                See all EU institutions and bodies
              </a>
            </div>
          </Header.TopDropdownMenu>
        </Header.TopItem>

        {!!headerOpts.partnerLinks && (
          <Header.TopItem>
            <Header.TopDropdownMenu
              id="theme-sites"
              text={headerOpts.partnerLinks.title}
              aria-label={headerOpts.partnerLinks.title}
              viewportWidth={width}
            >
              <div className="wrapper" tabIndex={0} role={'presentation'}>
                {headerOpts.partnerLinks.links.map((item, index) => (
                  <Dropdown.Item key={index}>
                    <a
                      href={item.href}
                      className="site"
                      target="_blank"
                      rel="noopener"
                      onKeyDown={(evt) => evt.stopPropagation()}
                    >
                      {item.title}
                    </a>
                  </Dropdown.Item>
                ))}
              </div>
            </Header.TopDropdownMenu>
          </Header.TopItem>
        )}

        {config.settings.isMultilingual &&
          config.settings.supportedLanguages.length > 1 &&
          config.settings.hasLanguageDropdown && (
            <LazyLanguageSwitcher width={width} history={history} />
          )}
      </Header.TopHeader>
      <Header.Main
        pathname={pathname}
        isMultilingual={config.settings.isMultilingual}
        headerSearchBox={headerSearchBox}
        inverted={isHomePageInverse ? true : false}
        transparency={isHomePageInverse ? true : false}
        logo={
          <div {...(isSubsite ? { className: 'logo-wrapper' } : {})}>
            <Logo
              src={isHomePageInverse ? logoWhite : logo}
              title={eea.websiteTitle}
              alt={eea.organisationName}
              url={eea.logoTargetUrl}
            />

            {!!subsite && subsite.title && (
              <UniversalLink item={subsite} className="subsite-logo">
                {subsite.subsite_logo ? (
                  <Image
                    src={subsite.subsite_logo.scales.mini.download}
                    alt={subsite.title}
                  />
                ) : (
                  subsite.title
                )}
              </UniversalLink>
            )}
          </div>
        }
        menuItems={items}
        menuItemsLayouts={enhancedLayouts}
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
        renderMenuItem={(item, options, props) => (
          <UniversalLink
            href={item.url || '/'}
            title={item.nav_title || item.title}
            {...(options || {})}
            className={cx(options?.className, {
              active: item.url === router_pathname,
            })}
          >
            {props?.iconPosition !== 'right' && props?.children}
            <span>{item.nav_title || item.title}</span>
            {props?.iconPosition === 'right' && props?.children}
          </UniversalLink>
        )}
      ></Header.Main>
      {/* Stable portal host for EEA side menu on mobile/tablet */}
      <div id="eea-side-menu-host" className="eea-side-menu-host" />
    </Header>
  );
};

export default compose(
  withRouter,
  connect(
    (state) => ({
      token: state.userSession.token,
      items: state.navigation.items,
      subsite: state.content.data?.['@components']?.subsite,
    }),
    { getNavigation },
  ),
)(EEAHeader);
