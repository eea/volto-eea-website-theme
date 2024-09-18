/**
 * View title block.
 * @module components/manage/Blocks/Title/View
 */

import React from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';

import BannerView from './Banner';
import './styles.less';

function IsomorphicPortal({ children }) {
  const [isClient, setIsClient] = React.useState();
  React.useEffect(() => setIsClient(true), []);

  return isClient ? (
    <Portal node={document.querySelector('.eea.header')}>{children}</Portal>
  ) : (
    children
  );
}

const HeroBackground = (props) => {
  return props.isEditMode ? (
    <BannerView {...props} />
  ) : (
    <React.Fragment>
      <IsomorphicPortal>
        {/* Implement own BannerView component */}
        <div role="banner" className="web_report">
          <BannerView {...props} />
        </div>
      </IsomorphicPortal>
    </React.Fragment>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
HeroBackground.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default HeroBackground;
