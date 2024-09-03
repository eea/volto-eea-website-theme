/**
 * View title block.
 * @module components/manage/Blocks/Title/View
 */

import React from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';
import { BodyClass } from '@plone/volto/helpers';

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

const HeroBackground = (props) => (
  <React.Fragment>
    <BodyClass className="with-title-block" />
    <IsomorphicPortal>
      {/* Implement own BannerView component */}
      <BannerView {...props} />
    </IsomorphicPortal>
  </React.Fragment>
);

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
HeroBackground.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default HeroBackground;