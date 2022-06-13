/**
 * Document view component.
 * @module components/theme/View/HomePageInverseView
 */

import React from 'react';
import PropTypes from 'prop-types';

import { DefaultView } from '@plone/volto/components/';

import { BodyClass } from '@plone/volto/helpers';

import { hasBlocksData } from '@plone/volto/helpers';

/**
 * Component to display the default view.
 * @function HomePageInverseView
 * @param {Object} content Content object.
 * @returns {string} Markup of the component.
 */
const HomePageInverseView = ({ content }) => {
  return hasBlocksData(content) ? (
    <>
      <BodyClass className="homepage homepage-inverse" />
      <DefaultView content={content} />
    </>
  ) : null;
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
HomePageInverseView.propTypes = {
  /**
   * Content of the object
   */
  content: PropTypes.shape({
    /**
     * Title of the object
     */
    title: PropTypes.string,
    /**
     * Description of the object
     */
    description: PropTypes.string,
    /**
     * Text of the object
     */
    text: PropTypes.shape({
      /**
       * Data of the text of the object
       */
      data: PropTypes.string,
    }),
  }).isRequired,
};

export default HomePageInverseView;
