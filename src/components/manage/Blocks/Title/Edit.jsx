/**
 * Edit title block.
 * @module volto-slate/blocks/Title/TitleBlockEdit
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Editor, createEditor, Transforms, Node, Range } from 'slate';
import { ReactEditor, Editable, Slate, withReact } from 'slate-react';
import config from '@plone/volto/registry';
import { SidebarPortal } from '@plone/volto/components';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import BannerView from '@eeacms/volto-eea-website-theme/components/theme/Banner/View';
import schema from './schema';

const messages = defineMessages({
  title: {
    id: 'Type the title…',
    defaultMessage: 'Type the title…',
  },
});

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

const Title = React.forwardRef(({ children, ...rest }, ref) => (
  <h1 {...rest} ref={ref}>
    {children}
  </h1>
));

/**
 * Edit title block component.
 * @class TitleBlockEdit
 * @extends Component
 */
export const TitleBlockEdit = (props) => {
  const {
    selected,
    index,
    onChangeField,
    onSelectBlock,
    onAddBlock,
    onFocusPreviousBlock,
    onFocusNextBlock,
    block,
    blockNode,
    data,
    detached,
    editable,
  } = props;
  const metadata = props.metadata || props.properties;

  const editor = useMemo(() => withReact(createEditor()), []);
  const intl = useIntl();

  const disableNewBlocks = data.disableNewBlocks || detached;

  const text = metadata?.['title'] || '';

  const handleChange = useCallback(
    (value) => {
      const newText = Node.string(editor);
      if (newText !== text) {
        onChangeField('title', newText);
      }
    },
    [editor, onChangeField, text],
  );

  const prevSelected = usePrevious(selected);

  useEffect(() => {
    if (!prevSelected && selected) {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        // keep selection
        setTimeout(() => {
          try {
            ReactEditor.focus(editor);
          } catch {}
        });
      } else {
        // nothing is selected, move focus to end
        // with this setTimeout uncommented, the focusing of other Volto-Slate
        // blocks breaks, not sure what was its initial role, but maybe we can
        // delete it one day
        setTimeout(() => {
          ReactEditor.focus(editor);
          Transforms.select(editor, Editor.end(editor, []));
        });
      }
    }
  }, [prevSelected, selected, editor]);

  const handleKeyDown = useCallback(
    (ev) => {
      if (ev.key === 'Return' || ev.key === 'Enter') {
        ev.preventDefault();
        if (!disableNewBlocks) {
          onSelectBlock(
            onAddBlock(config.settings.defaultBlockType, index + 1),
          );
        }
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        onFocusPreviousBlock(block, blockNode.current);
      } else if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        onFocusNextBlock(block, blockNode.current);
      }
    },
    [
      index,
      blockNode,
      disableNewBlocks,
      onSelectBlock,
      onAddBlock,
      onFocusPreviousBlock,
      onFocusNextBlock,
      block,
    ],
  );

  const val = useMemo(() => {
    return [
      {
        type: 'p',
        children: [{ text }],
      },
    ];
  }, [text]);

  const handleFocus = useCallback(() => {
    onSelectBlock(block);
  }, [block, onSelectBlock]);

  const renderElement = useCallback(
    ({ attributes, children, element }) => {
      return (
        <Title {...attributes} className="documentFirstHeading">
          {children}
        </Title>
      );
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  editor.children = val;

  if (typeof window.__SERVER__ !== 'undefined' || __SERVER__) {
    return <div />;
  }

  const placeholder = data.placeholder || intl.formatMessage(messages['title']);

  return (
    <React.Fragment>
      <BannerView
        {...props}
        banner={{
          title: {
            view: (
              <Slate editor={editor} onChange={handleChange} value={val}>
                <Editable
                  readOnly={!editable}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  renderElement={renderElement}
                  onFocus={handleFocus}
                ></Editable>
              </Slate>
            ),
          },
        }}
        fluid
      />
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

TitleBlockEdit.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
  selected: PropTypes.bool.isRequired,
  block: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  onSelectBlock: PropTypes.func.isRequired,
  onDeleteBlock: PropTypes.func.isRequired,
  onAddBlock: PropTypes.func.isRequired,
  onFocusPreviousBlock: PropTypes.func.isRequired,
  onFocusNextBlock: PropTypes.func.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  editable: PropTypes.bool,
  detached: PropTypes.bool,
  blockNode: PropTypes.any,
  className: PropTypes.string,
  formFieldName: PropTypes.string,
};

TitleBlockEdit.defaultProps = {
  detached: false,
  editable: true,
};

export default TitleBlockEdit;
