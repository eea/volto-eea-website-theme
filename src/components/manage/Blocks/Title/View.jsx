/**
 * View title block.
 * @module components/manage/Blocks/Title/View
 */

import React from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';

import BannerView from '@eeacms/volto-eea-website-theme/components/theme/Banner/View';

function IsomorphicPortal({ children }) {
  const [isClient, setIsClient] = React.useState();
  React.useEffect(() => setIsClient(true), []);

  return isClient ? (
    <Portal node={document.getElementById('page-header')}>{children}</Portal>
  ) : (
    children
  );
}

/**
 * View title block class.
 * @class View
 * @extends Component
 */
const View = (props) => (
  <IsomorphicPortal>
    <BannerView {...props} />
  </IsomorphicPortal>
);

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default View;
