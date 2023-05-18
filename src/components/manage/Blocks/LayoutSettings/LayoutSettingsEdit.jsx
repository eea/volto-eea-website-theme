import React from 'react';
import { EditSchema } from './schema';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import LayoutSettingsView from './LayoutSettingsView';
import './edit.less';

const LayoutSettingsEdit = (props) => {
  const schema = EditSchema();
  return (
    <>
      <h3>Page layout settings</h3>
      <LayoutSettingsView {...props} />
      <SidebarPortal selected={props.selected}>
        {props.selected && (
          <BlockDataForm
            title={schema.title}
            schema={schema}
            formData={props.data}
            onChangeField={(id, value) => {
              props.onChangeBlock(props.block, {
                ...props.data,
                [id]: value,
              });
            }}
          />
        )}
      </SidebarPortal>
    </>
  );
};

export default LayoutSettingsEdit;
