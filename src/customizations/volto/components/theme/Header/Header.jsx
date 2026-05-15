/**
 * Header component.
 * @module components/theme/Header/Header
 */

import loadable from '@loadable/component';
import cx from 'classnames';
import { useEffect, useMemo, useRef } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { Dropdown, Image } from 'semantic-ui-react';

import { getNavigation } from '@plone/volto/actions/navigation/navigation';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { hasApiExpander } from '@plone/volto/helpers/Utils/Utils';
import config from '@plone/volto/registry';

import eeaFlag from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/eea.png';
import Header from '@eeacms/volto-eea-design-system/ui/Header/Header';
import { getNavigationSettings } from '@eeacms/volto-eea-website-theme/actions';
import EEALogo from '@eeacms/volto-eea-website-theme/components/theme/Logo';

const LazyLanguageSwitcher = loadable(() => import('./LanguageSwitcher'));
const EMPTY_NAVIGATION_SETTINGS = {};

function removeTrailingSlash(path) {
  return path.replace(/\/+$/, '');
}

/**
 * Merge backend navigation settings into the config-level menu layouts.
 */
function buildEnhancedLayouts(items, navigationSettings) {
  const configLayouts = config.settings?.menuItemsLayouts || {};
  const enhancedLayouts = { ...configLayouts };

  if (!items) return enhancedLayouts;

  items.forEach(() => {
    Object.keys(navigationSettings).forEach((routeId) => {
      const route = navigationSettings[routeId];
      const backendSettings = {};

      if (route.hideChildrenFromNavigation !== undefined) {
        backendSettings.hideChildrenFromNavigation =
          route.hideChildrenFromNavigation;
      }

      if (route.menuItemChildrenListColumns !== undefined) {
        backendSettings.menuItemChildrenListColumns = Array.isArray(
          route.menuItemChildrenListColumns,
        )
          ? route.menuItemChildrenListColumns
              .map((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
              .filter((val) => !isNaN(val))
          : route.menuItemChildrenListColumns;
      }

      if (route.menuItemColumns !== undefined) {
        backendSettings.menuItemColumns = route.menuItemColumns;
      }

      if (Object.keys(backendSettings).length > 0) {
        enhancedLayouts[routeId] = {
          ...enhancedLayouts[routeId],
          ...backendSettings,
        };
      }
    });
  });

  return enhancedLayouts;
}

/**
 * EEA Specific Header component.
 */
const EEAHeader = ({ pathname, token, items, history, navroot, subsite }) => {
  // Config / static derived values
  const { eea } = config.settings;
  const headerOpts = eea.headerOpts || {};
  const { logo, logoWhite } = headerOpts;

  const isSubsite = subsite?.['@type'] === 'Subsite';

  // Redux state
  const dispatch = useDispatch();
  const width = useSelector((state) => state.screen?.width);

  const router_pathname = useSelector(
    (state) => removeTrailingSlash(state.router?.location?.pathname) || '',
  );

  const headerSettings = useSelector(
    (state) => state.reduxAsyncConnect?.headerSettings,
  );

  const navigationSettings =
    useSelector((state) => state.navigationSettings?.settings) ||
    EMPTY_NAVIGATION_SETTINGS;

  const updateRequest = useSelector((state) => state.content.update);

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

  const prevTokenRef = useRef(token);

  // Derived / memoized values
  const headerSearchBox =
    headerSettings?.searchBox || eea.headerSearchBox || [];

  const enhancedLayouts = buildEnhancedLayouts(items, navigationSettings);

  // Prefer navroot.language; fall back to extracting language from pathname
  // (validated against supportedLanguages) when navroot is not yet loaded.
  const navrootLang = useMemo(() => {
    const { supportedLanguages } = config.settings;
    if (navroot?.language?.token) return navroot.language.token;
    const supported = supportedLanguages || [];
    const first = pathname.split('/').filter(Boolean)[0];
    return first && supported.includes(first) ? first : null;
  }, [navroot, pathname]);

  // Normalize pathname for menu active-item matching when using
  // navigationLanguage. Menu items come from the configured language; rewrite
  // the current language prefix to match. E.g. navLang='en' on /fr/topics ->
  // /en/topics. Uses navroot.language as source of truth instead of parsing
  // the first path segment.
  const normalizedPathname = useMemo(() => {
    const navLang = config.settings.navigationLanguage;
    if (!navLang || !navrootLang || navrootLang === navLang) return pathname;

    const prefix = `/${navrootLang}`;
    if (pathname === prefix) return `/${navLang}`;
    if (pathname.startsWith(`${prefix}/`)) {
      return `/${navLang}${pathname.slice(prefix.length)}`;
    }
    return pathname;
  }, [pathname, navrootLang]);

  const baseUrl = useMemo(() => {
    const { settings } = config;
    let url = getBaseUrl(pathname);

    // When the current navroot's language differs from the configured
    // navigationLanguage, override the base url so navigation is fetched from
    // the configured language root instead of the current navroot.
    if (
      settings.navigationLanguage &&
      navrootLang &&
      navrootLang !== settings.navigationLanguage
    ) {
      url = `/${settings.navigationLanguage}`;
    }
    return url;
  }, [pathname, navrootLang]);

  // Fetch navigation settings on pathname change.
  useEffect(() => {
    dispatch(getNavigationSettings(pathname));
  }, [dispatch, pathname]);

  // Re-fetch navigation settings after a content update for the current page.
  useEffect(() => {
    if (
      updateRequest?.loaded &&
      removeTrailingSlash(updateRequest?.content?.['@id'] || '') ===
        removeTrailingSlash(pathname)
    ) {
      dispatch(getNavigationSettings(pathname));
    }
  }, [updateRequest, dispatch, pathname]);

  // Fetch the main navigation tree.
  // Cases that force a fetch:
  //   1. Language mismatch — the current navroot's language differs from the
  //      configured navigationLanguage, so the API expander's navigation (if
  //      any) is in the wrong language and must be replaced.
  //   2. Token change — auth state affects which nav items are visible, so
  //      expander data loaded under the previous token may be stale.
  //   3. No expander available — backend did not pre-supply navigation for
  //      this base url, so we fetch it explicitly.
  // Otherwise the expander already supplied correct navigation; no fetch.
  useEffect(() => {
    const { settings } = config;
    const langMismatch =
      settings.navigationLanguage &&
      navrootLang &&
      navrootLang !== settings.navigationLanguage;
    const tokenChanged = prevTokenRef.current !== token;

    if (
      settings.navigationLanguage ||
      langMismatch ||
      tokenChanged ||
      !hasApiExpander('navigation', baseUrl)
    ) {
      dispatch(getNavigation(baseUrl, settings.navDepth));
    }
  }, [dispatch, pathname, baseUrl, navrootLang, token]);

  // Track the previous token value. Runs after the fetch effect so the
  // comparison above sees the value from the prior render.
  useEffect(() => {
    prevTokenRef.current = token;
  }, [token]);

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
        pathname={normalizedPathname}
        isMultilingual={config.settings.isMultilingual}
        headerSearchBox={headerSearchBox}
        inverted={isHomePageInverse ? true : false}
        transparency={isHomePageInverse ? true : false}
        logo={
          <div {...(isSubsite ? { className: 'logo-wrapper' } : {})}>
            <EEALogo
              src={logo}
              invertedSrc={logoWhite}
              inverted={isHomePageInverse}
              title={eea.websiteTitle}
              alt={eea.organisationName}
              height={headerOpts.logoHeight}
              width={headerOpts.logoWidth}
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
      navroot: state.content.data?.['@components']?.navroot?.navroot,
      subsite: state.content.data?.['@components']?.subsite,
    }),
    { getNavigation },
  ),
)(EEAHeader);
