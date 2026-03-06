/**
 * Tags component.
 * @module components/theme/Tags/Tags
 */

import React from 'react';
import PropTypes from 'prop-types';
import TagList from '@eeacms/volto-eea-design-system/ui/TagList/TagList';
import Tag from '@eeacms/volto-eea-design-system/ui/Tag/Tag';
import { Container } from 'semantic-ui-react';
import config from '@plone/registry';

/**
 * Tags component class.
 * @function Tags
 * @param {Object} props Component properties.
 * @param {Object} props.content Content object that may contain subjects.
 * @param {Array} [props.content.subjects] Optional array of tags (subjects).
 * @returns {string} Markup of the component.
 */
const Tags = ({ content }) => {
  const tags = content?.subjects || [];

  if (!config.settings.showTags || !tags.length) return null;

  return (
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
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
Tags.propTypes = {
  content: PropTypes.shape({
    subjects: PropTypes.arrayOf(PropTypes.string),
  }),
};

/**
 * Default properties.
 * @property {Object} defaultProps Default properties.
 * @static
 */
Tags.defaultProps = {
  content: {
    subjects: [],
  },
};

export default Tags;
