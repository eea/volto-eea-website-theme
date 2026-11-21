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
import { shouldHideSubsiteFooterBranding } from '@eeacms/volto-eea-website-theme/helpers/subsiteOverrides';

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
        title: action.title,
        url: flattenToAppURL(action.url),
      }))
    : eea.footerOpts.actions;

  // ZMI > portal_actions > copyright_actions
  const copyright = isArray(copyrightActions)
    ? copyrightActions.map((action) => ({
        title: action.title,
        site: action.title,
        url: flattenToAppURL(action.url),
      }))
    : eea.footerOpts.copyright;

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

  // Hardcoded exception (config.settings.eea.subsiteHideFooterBrandingPaths):
  // the EPANET subsite does not show the EEA and Eionet logos and the
  // information systems button.
  const hideBranding = shouldHideSubsiteFooterBranding(subsite);

  // Update options with actions from backend
  const options = {
    ...eea.footerOpts,
    ...(hideBranding && { managedBy: [] }),
    social,
    contacts,
  };

  return (
    <EEAFooter>
      <EEAFooter.Header>{eea.footerOpts.logosHeader}</EEAFooter.Header>
      <EEAFooter.SubFooter {...options} />
      <EEAFooter.Header>{eea.footerOpts.header}</EEAFooter.Header>
      {!hideBranding && (
        <EEAFooter.SitesButton
          buttonName={eea.footerOpts.buttonName}
          hrefButton={eea.footerOpts.hrefButton}
        />
      )}
      <EEAFooter.Social {...options} />
      <EEAFooter.Actions actions={actions} copyright={copyright} />
    </EEAFooter>
  );
};

export default Footer;
