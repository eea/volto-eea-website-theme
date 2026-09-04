/**
 * Tags component.
 * @module components/theme/Tags/Tags
 */

import React from 'react';
import PropTypes from 'prop-types';
import TagList from '@eeacms/volto-eea-design-system/ui/TagList/TagList';
import Tag from '@eeacms/volto-eea-design-system/ui/Tag/Tag';
import { Container } from 'semantic-ui-react';

/**
 * Tags component class.
 * @function Tags
 * @param {array} tags Array of tags.
 * @returns {string} Markup of the component.
 */
const Tags = ({ tags }) =>
  tags && tags.length > 0 ? (
    <Container className="eea">
      <TagList className="right">
        <TagList.Content>
          {tags.map((tag) => (
            <Tag href={`http://search.apps.eea.europa.eu/?q=${tag}`} key={tag}>
              {tag}
            </Tag>
          ))}
        </TagList.Content>
      </TagList>
    </Container>
  ) : (
    ''
  );

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
};

/**
 * Default properties.
 * @property {Object} defaultProps Default properties.
 * @static
 */
Tags.defaultProps = {
  tags: null,
};

export default Tags;
