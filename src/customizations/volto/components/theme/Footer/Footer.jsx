/**
 * Footer component.
 * @module components/theme/Footer/Footer
 */

import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import EEAFooter from '@eeacms/volto-eea-design-system/ui/Footer/Footer';
import config from '@plone/volto/registry';
import isArray from 'lodash/isArray';
import {
  getSubsitePath,
  shouldHideSubsiteFooter,
} from '@eeacms/volto-eea-website-theme/helpers/subsiteOverrides';

// Footer actions that point to the subsite's own page with that name.
const SUBSITE_PAGES = [
  { id: 'privacy', page: 'privacy' },
  { id: 'accessibility', page: 'accessibility' },
  { id: 'legal', page: 'legal-notice' },
];

const getSubsitePage = (action) =>
  SUBSITE_PAGES.find(
    ({ id, page }) =>
      action.id === id || new RegExp(`/${page}/?$`).test(action.url || ''),
  )?.page;

const isSitemapAction = (action) =>
  action.id === 'sitemap' || /\/sitemap\/?$/.test(action.url || '');

const Footer = () => {
  const { eea } = config.settings;
  const {
    footerActions,
    copyrightActions,
    socialActions,
    contactActions,
    contactExtraActions,
    subsite,
  } = useSelector(
    (state) => ({
      footerActions: state.actions?.actions?.footer_actions,
      copyrightActions: state.actions?.actions?.copyright_actions,
      socialActions: state.actions?.actions?.social_actions,
      contactActions: state.actions?.actions?.contact_actions,
      contactExtraActions: state.actions?.actions?.contact_extra_actions,
      subsite: state.content?.data?.['@components']?.subsite,
    }),
    shallowEqual,
  );
  // ZMI > portal_actions > footer_actions
  const actions = isArray(footerActions)
    ? footerActions.map((action) => ({
        id: action.id,
        title: action.title,
        url: flattenToAppURL(action.url),
      }))
    : eea.footerOpts.actions;

  // ZMI > portal_actions > copyright_actions
  const copyright = isArray(copyrightActions)
    ? copyrightActions.map((action) => ({
        id: action.id,
        title: action.title,
        site: action.title,
        url: flattenToAppURL(action.url),
      }))
    : eea.footerOpts.copyright;

  // Hardcoded exception (config.settings.eea.subsiteHideFooterPaths): only
  // the bottom links are shown, Privacy, Accessibility and Legal notice point
  // to the subsite's own pages and the EEA Sitemap is hidden.
  if (shouldHideSubsiteFooter(subsite)) {
    const subsitePath = getSubsitePath(subsite);
    const subsiteActions = actions
      .filter((action) => !isSitemapAction(action))
      .map((action) => {
        const page = getSubsitePage(action);
        return page ? { ...action, url: `${subsitePath}/${page}` } : action;
      });
    const subsiteCopyright = copyright.filter(
      (action) => !isSitemapAction(action),
    );

    return (
      <EEAFooter>
        <EEAFooter.Actions
          actions={subsiteActions}
          copyright={subsiteCopyright}
        />
      </EEAFooter>
    );
  }

  // ZMI > portal_actions > social_actions
  const social = isArray(socialActions)
    ? socialActions.map((action) => ({
        name: action.id,
        icon: action.icon,
        url: action.url,
      }))
    : eea.footerOpts.social;

  // ZMI > portal_actions > contact_actions
  const contacts = isArray(contactActions)
    ? contactActions.map((action, idx) => ({
        text: action.title,
        icon: action.icon,
        url: flattenToAppURL(action.url),
        children:
          idx === 0
            ? (contactExtraActions || []).map((child) => ({
                text: child.title,
                icon: child.icon,
                url: flattenToAppURL(child.url),
              }))
            : [],
      }))
    : eea.footerOpts.contacts;

  // Update options with actions from backend
  const options = {
    ...eea.footerOpts,
    social,
    contacts,
  };

  return (
    <EEAFooter>
      <EEAFooter.Header>{eea.footerOpts.logosHeader}</EEAFooter.Header>
      <EEAFooter.SubFooter {...options} />
      <EEAFooter.Header>{eea.footerOpts.header}</EEAFooter.Header>
      <EEAFooter.SitesButton
        buttonName={eea.footerOpts.buttonName}
        hrefButton={eea.footerOpts.hrefButton}
      />
      <EEAFooter.Social {...options} />
      <EEAFooter.Actions actions={actions} copyright={copyright} />
    </EEAFooter>
  );
};

export default Footer;
