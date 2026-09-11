import React from 'react';
import { EditSchema } from './schema';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import LayoutSettingsView from './LayoutSettingsView';

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
