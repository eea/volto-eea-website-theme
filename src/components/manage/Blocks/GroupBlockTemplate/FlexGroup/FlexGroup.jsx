import React from 'react';
import { Button } from 'semantic-ui-react';
import { Icon, BlocksForm } from '@plone/volto/components';
import EditBlockWrapper from '@plone/volto/components/manage/Blocks/Block/EditBlockWrapper';
import cx from 'classnames';

import helpSVG from '@plone/volto/icons/help.svg';
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
    setSelectedBlock,
    manage,
    childBlocksForm,
    formDescription,
    isEditMode,
  } = props;
  const metadata = props.metadata || props.properties;
  const blockState = {};
  const { no_of_columns = 2 } = data;
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
        >
          {({ draginfo }, editBlock, blockProps) => (
            <div className="flex-item">
              <div className="item-wrapper">
                <EditBlockWrapper draginfo={draginfo} blockProps={blockProps}>
                  {editBlock}
                </EditBlockWrapper>
                {instructions && blockProps.selected && (
                  <Button
                    type="button"
                    icon
                    basic
                    title="Section help"
                    className="section-help-button"
                    onClick={() => {
                      setSelectedBlock();
                      const tab = manage ? 0 : 1;
                      props.setSidebarTab(tab);
                    }}
                  >
                    <Icon name={helpSVG} className="" size="19px" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </BlocksForm>
      ) : (
        <div className={flexClassNames}>
          <RenderBlocks metadata={metadata} content={data?.data || {}} />
        </div>
      )}
    </div>
  );
};

export default FlexGroup;
