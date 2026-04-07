import React from 'react';
import { BlocksForm } from '@plone/volto/components/manage/Form';
import cx from 'classnames';

import RenderBlocks from './RenderBlocks';
import './editor-flex.less';

const FlexGroup = (props) => {
  const {
    block,
    data,
    onChangeBlock,
    onChangeField,
    pathname,
    selected,
    selectedBlock,
    onSelectBlock,
    manage,
    childBlocksForm,
    formDescription,
    isEditMode,
  } = props;
  const metadata = props.metadata || props.properties;
  const blockState = {};
  const { no_of_columns = 1 } = data;
  const flexClassNames = `ui unstackable items row flex-items-wrapper items-${no_of_columns}-columns`;

  React.useEffect(() => {
    const dragDropList = document?.querySelector(
      `.flex-blocks-form[data-block="${block}"] [data-rbd-droppable-id]`,
    );
    if (dragDropList) dragDropList.setAttribute('class', flexClassNames);
  }, [flexClassNames, block, isEditMode]);

  // Get editing instructions from block settings or props
  let instructions = data?.instructions?.data || data?.instructions;
  if (!instructions || instructions === '<p><br/></p>') {
    instructions = formDescription;
  }

  return (
    <div
      className={cx('flex-blocks-form', {
        'disable-inner-buttons': data.disableInnerButtons,
      })}
      data-block={block}
    >
      {isEditMode ? (
        <BlocksForm
          metadata={metadata}
          properties={childBlocksForm}
          manage={manage}
          isMainForm={false}
          stopPropagation={selectedBlock}
          selectedBlock={selected ? selectedBlock : null}
          allowedBlocks={data.allowedBlocks}
          title={data.placeholder}
          description={instructions}
          onSelectBlock={(id, l, e) => {
            const isMultipleSelection = e
              ? e.shiftKey || e.ctrlKey || e.metaKey
              : false;
            onSelectBlock(id, isMultipleSelection, e, selectedBlock);
          }}
          onChangeFormData={(newFormData) => {
            onChangeBlock(block, {
              ...data,
              data: newFormData,
            });
          }}
          onChangeField={(id, value) => {
            if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
              blockState[id] = value;
              onChangeBlock(block, {
                ...data,
                data: {
                  ...data.data,
                  ...blockState,
                },
              });
            } else {
              onChangeField(id, value);
            }
          }}
          pathname={pathname}
        />
      ) : (
        <div className={flexClassNames}>
          <RenderBlocks metadata={metadata} content={data?.data || {}} />
        </div>
      )}
    </div>
  );
};

export default FlexGroup;
