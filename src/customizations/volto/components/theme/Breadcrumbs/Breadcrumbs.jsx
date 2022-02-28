/**
 * Breadcrumbs components.
 * @module components/theme/Breadcrumbs/Breadcrumbs
 */

//import React from 'react';
import { connect } from 'react-redux';
//import EEABreadcrumbs from '@eeacms/volto-eea-design-system/ui/Breadcrumbs/Breadcrumbs.jsx';

const BreadcrumbsComponent = ({ pathname }) => {
  return null;
};

export default connect((state) => ({
  pathname: state.router?.location?.pathname,
}))(BreadcrumbsComponent);
