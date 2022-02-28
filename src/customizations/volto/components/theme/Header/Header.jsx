/**
 * Header component.
 * @module components/theme/Header/Header
 */

import React, { Component } from 'react';

import EEAHeader from '@eeacms/volto-eea-design-system/ui/Header/Header';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import config from '@plone/volto/registry';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';

const linksDropdown = {
  title: 'Environmental information systems',
  links: [
    { title: 'Biodiversity Information System for Europe', href: '/#' },
    { title: 'Climate Adaptation Platform', href: '/#' },
    { title: 'Copernicus in situ component', href: '/#' },
    { title: 'European Industrial Emissions Portal', href: '/#' },
    { title: 'Forest Information System for Europe', href: '/#' },
    { title: 'Information Platform for Chemical Monitoring', href: '/#' },
    { title: 'Marine Water Information System for Europe', href: '/#' },
    { title: 'Fresh Water Information System for Europe', href: '/#' },
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
