/**
 * View title block.
 * @module components/manage/Blocks/Title/View
 */

import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import BannerView from '@eeacms/volto-eea-website-theme/components/theme/Banner/View';

function IsomorphicPortal({ children }) {
  const [isClient, setIsClient] = React.useState();
  React.useEffect(() => setIsClient(true), []);

  return isClient
    ? createPortal(children, document.getElementById('page-header'))
    : children;
}

const DefaultTemplate = (props) =>
  props.isEditMode ? (
    <BannerView {...props} />
  ) : (
    <React.Fragment>
      <IsomorphicPortal>
        <BannerView {...props} />
      </IsomorphicPortal>
    </React.Fragment>
  );

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
DefaultTemplate.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default DefaultTemplate;
