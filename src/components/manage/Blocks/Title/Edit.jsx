/**
 * Edit title block.
 * @module components/manage/Blocks/Title/Edit
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { isUndefined } from 'lodash';
import { SidebarPortal } from '@plone/volto/components';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';

import BannerEdit from '@eeacms/volto-eea-website-theme/components/theme/Banner/Edit';
import schema from './schema';

/**
 * Edit title block class.
 * @class Edit
 * @extends Component
 */
const Edit = (props) => {
  useEffect(() => {
    Object.entries(schema.properties).forEach(([key, options]) => {
      if (!isUndefined(options.default) && isUndefined(props.data[key])) {
        props.onChangeBlock(props.block, {
          ...props.data,
          [key]: options.default,
        });
      }
    });
    /* eslint-disable-next-line */
  }, []);

  return (
    <React.Fragment>
      <BannerEdit {...props} />
      <SidebarPortal selected={props.selected}>
        <InlineForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            props.onChangeBlock(props.block, {
              ...props.data,
              [id]: value,
            });
          }}
          formData={props.data}
        />
      </SidebarPortal>
    </React.Fragment>
  );
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
