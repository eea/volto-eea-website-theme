/**
 * View title block.
 * @module components/manage/Blocks/Title/View
 */

import React from 'react';

import PropTypes from 'prop-types';
import { withBlockExtensions, BodyClass } from '@plone/volto/helpers';
import DefaultTemplate from './variations/Default';

/**
 * View title block class.
 * @class View
 * @extends Component
 */
const View = (props = {}) => {
  const { variation, data = {} } = props;
  const Renderer = variation?.view ?? DefaultTemplate;
  return (
    <>
      <BodyClass className="with-title-block" />
      <Renderer {...props} />
    </>
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

export default withBlockExtensions(View);
