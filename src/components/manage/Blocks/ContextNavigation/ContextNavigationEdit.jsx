import React from 'react';
import { EditSchema } from './schema';
import { SidebarPortal } from '@plone/volto/components';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';

import ContextNavigationView from './ContextNavigationView';

const ContextNavigationFillEdit = (props) => {
  const contentTypes = props.properties?.['@components']?.types;
  const availableTypes = React.useMemo(
    () => contentTypes?.map((type) => [type.id, type.title || type.name]),
    [contentTypes],
  );

  const schema = React.useMemo(
    () => EditSchema({ availableTypes }),
    [availableTypes],
  );

  return (
    <>
      <h3>Context navigation</h3>
      <ContextNavigationView {...props} mode="edit" />{' '}
      <SidebarPortal selected={props.selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            props.onChangeBlock(props.block, {
              ...props.data,
              [id]: value,
            });
          }}
          onChangeBlock={props.onChangeBlock}
          formData={props.data}
          block={props.block}
          navRoot={props.navRoot}
          contentType={props.contentType}
        />
      </SidebarPortal>
    </>
  );
};

export default ContextNavigationFillEdit;
