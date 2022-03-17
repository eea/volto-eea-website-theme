/**
 * Edit title block.
 * @module components/manage/Blocks/Title/Edit
 */

import React from 'react';
import PropTypes from 'prop-types';

import BannerEdit from '@eeacms/volto-eea-website-theme/components/theme/Banner/Edit';

/**
 * Edit title block class.
 * @class Edit
 * @extends Component
 */
const Edit = (props) => {
  return <BannerEdit {...props} />;
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
Edit.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Edit;
