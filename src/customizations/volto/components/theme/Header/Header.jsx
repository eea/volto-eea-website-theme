/**
 * Header component.
 * @module components/theme/Header/Header
 */

import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import EEAHeader from '@eeacms/volto-eea-design-system/ui/Header/Header';

import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';

import config from '@plone/volto/registry';

const linksDropdown = {
  title: 'Environmental information systems',
  links: [
    {
      title: 'Biodiversity Information System for Europe',
      href: 'https://biodiversity.europa.eu/',
    },
    {
      title: 'Climate Adaptation Platform',
      href: 'https://climate-adapt.eea.europa.eu/',
    },
    {
      title: 'Copernicus in situ component',
      href: 'https://insitu.copernicus.eu/',
    },
    {
      title: 'European Industrial Emissions Portal',
      href: 'https://industry.eea.europa.eu/',
    },
    {
      title: 'Forest Information System for Europe',
      href: 'https://forest.eea.europa.eu/',
    },
    {
      title: 'Information Platform for Chemical Monitoring',
      href: 'https://ipchem.jrc.ec.europa.eu/RDSIdiscovery/ipchem/index.html',
    },
    {
      title: 'Marine Water Information System for Europe',
      href: 'https://water.europa.eu/marine',
    },
    {
      title: 'Fresh Water Information System for Europe',
      href: 'https://water.europa.eu/freshwater',
    },
  ],
};

/**
 * Header component class.
 * @class Header
 * @extends Component
 */
class Header extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    token: PropTypes.string,
    pathname: PropTypes.string.isRequired,
  };

  /**
   * Default properties.
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    token: null,
  };

  componentDidMount() {
    const { settings } = config;
    if (!hasApiExpander('navigation', getBaseUrl(this.props.pathname))) {
      this.props.getNavigation(
        getBaseUrl(this.props.pathname),
        settings.navDepth,
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { settings } = config;
    if (
      prevProps.pathname !== this.props.pathname ||
      prevProps.token !== this.props.token
    ) {
      if (!hasApiExpander('navigation', getBaseUrl(this.props.pathname))) {
        this.props.getNavigation(
          getBaseUrl(prevProps.pathname),
          settings.navDepth,
        );
      }
    }
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const menuItems = this.props.items;
    return (
      <EEAHeader
        token={this.props.token}
        pathname={this.props.pathname}
        menuItems={menuItems}
        linksDropdown={linksDropdown}
      />
    );
  }
}

export default connect(
  (state) => ({
    token: state.userSession.token,
    items: state.navigation.items,
  }),
  { getNavigation },
)(Header);
