/**
 * View title block.
 * @module components/manage/Blocks/Title/View
 */

import React from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';

import BannerView from '@eeacms/volto-eea-website-theme/components/theme/Banner/View';

/**
 * View title block class.
 * @class View
 * @extends Component
 */
const View = (props) => {
  if (__SERVER__) return <BannerView {...props} />;
  return (
    <Portal node={document.getElementById('page-header')}>
      <BannerView {...props} />
    </Portal>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default View;
