import React from 'react';
import cx from 'classnames';
import { List } from 'semantic-ui-react';
import {
  MarkElementButton,
  ToolbarButton,
  BlockButton,
} from '@plone/volto-slate/editor/ui';
import installCallout from '@plone/volto-slate/editor/plugins/Callout';
import { Icon } from '@plone/volto/components';
import { Editor, Transforms, Text } from 'slate';
import { useSlate } from 'slate-react';

import paintSVG from '@plone/volto/icons/paint.svg';
import alignLeftIcon from '@plone/volto/icons/align-left.svg';
import alignRightIcon from '@plone/volto/icons/align-right.svg';
import alignCenterIcon from '@plone/volto/icons/align-center.svg';
import alignJustifyIcon from '@plone/volto/icons/align-justify.svg';
import subTextIcon from '@plone/volto/icons/subtext.svg';
import lightIcon from './icons/light.svg';
import smallIcon from './icons/small.svg';
import clearIcon from './icons/eraser.svg';

const installSlateToolbarButton = ({
  config,
  key,
  before,
  button,
  element,
}) => {
  const toolbarButtons = config.settings.slate.toolbarButtons;
  const index = toolbarButtons.indexOf(key);
  const beforeIndex = toolbarButtons.indexOf(before);
  if (index === -1) {
    if (beforeIndex > -1) {
      toolbarButtons.splice(beforeIndex + 1, 0, key);
    } else {
      toolbarButtons.push(key);
    }
  } else if (index > -1 && beforeIndex > -1 && index > beforeIndex + 1) {
    toolbarButtons.splice(index, 1);
    toolbarButtons.splice(beforeIndex + 1, 0, key);
  } else if (index > -1 && index < beforeIndex) {
    toolbarButtons.splice(index, 1);
    toolbarButtons.splice(beforeIndex, 0, key);
  }
  if (button) {
    config.settings.slate.buttons[key] = button;
  }
  if (element) {
    config.settings.slate.elements[key] = element;
  }
  return config;
};

const toggleBlockClassFormat = (editor, format) => {
  const levels = Array.from(Editor.levels(editor, editor.selection));
  // TODO: someone fix this
  if (levels.length < 2) return false;
  const [, [, path]] = levels;
  Transforms.setNodes(
    editor,
    { styleName: format },
    {
      at: path,
    },
  );
  return;
};

const isBlockClassActive = (editor, format) => {
  if (!editor.selection) return false;
  // TODO: someone fix this
  const levels = Array.from(Editor.levels(editor, editor.selection));
  if (levels.length < 2) return false;
  const [, [node]] = levels;
  return node.styleName === format;
};

function BlockClassButton({ format, icon, ...props }) {
  const editor = useSlate();

  const isActive = isBlockClassActive(editor, format);

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();
      toggleBlockClassFormat(editor, format);
    },
    [editor, format], // , isActive
  );

  return (
    <ToolbarButton
      {...props}
      active={isActive}
      onMouseDown={handleMouseDown}
      icon={icon}
    />
  );
}

const clearFormatting = (editor) => {
  const sn = Array.from(
    Editor.nodes(editor, {
      mode: 'lowest',
      match: (n, p) => {
        // console.log('node', n, p);
        return Text.isText(n);
      },
      //at: [0], // uncomment if you want everything to be cleared
    }),
  );

  // console.log('sn', sn);

  sn.forEach(([n, at]) => {
    const toRemove = Object.keys(n).filter((k) => k.startsWith('style-'));
    if (toRemove.length) {
      Transforms.unsetNodes(editor, toRemove, { at });
      // console.log('unset', n, at, toRemove);
    }
  });

  Transforms.setNodes(editor, {
    type: 'p',
    styleName: null,
  });
  Transforms.unwrapNodes(editor, {
    match: (n) => n.type && n.type !== 'p',
    mode: 'all',
    split: false,
  });
};

const ClearFormattingButton = ({ icon, ...props }) => {
  const editor = useSlate();

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();
      clearFormatting(editor);
    },
    [editor],
  );

  return <ToolbarButton {...props} onMouseDown={handleMouseDown} icon={icon} />;
};

export default function installSlate(config) {
  if (config.settings.slate) {
    let renderLinkElement;
    // Callout slate button
    config = installCallout(config);

    try {
      renderLinkElement =
        require('@plone/volto-slate/editor/render').renderLinkElement ||
        require('@eeacms/volto-anchors/helpers').renderLinkElement;
    } catch {}

    installSlateToolbarButton({
      config,
      key: 'h3-light',
      before: 'heading-three',
      button: (props) => (
        <BlockButton
          title="Heading 3 light"
          format="h3-light"
          allowedChildren={config.settings.slate.allowedHeadlineElements}
          icon={subTextIcon}
          {...props}
        />
      ),
      element: renderLinkElement
        ? (opts) => {
            return renderLinkElement('h3')({
              ...opts,
              className: 'subtitle-light',
            });
          }
        : ({ attributes, children }) => (
            <h3
              {...attributes}
              className={cx(attributes.className, 'subtitle-light')}
            >
              {children}
            </h3>
          ),
    });
    config.settings.slate.topLevelTargetElements.push('h3-light');

    config.settings.slate.buttons.clearformatting = (props) => (
      <ClearFormattingButton title="Clear formatting" icon={clearIcon} />
    );

    // Remove blockquote, italic, strikethrough slate button from toolbarButtons
    config.settings.slate.toolbarButtons =
      config.settings.slate.toolbarButtons.filter(
        (item) => !['blockquote', 'italic', 'strikethrough'].includes(item),
      );

    // Remove blockquote, italic, strikethrough slate button from expandedToolbarButtons
    config.settings.slate.expandedToolbarButtons =
      config.settings.slate.expandedToolbarButtons.filter(
        (item) => !['blockquote', 'italic', 'strikethrough'].includes(item),
      );

    // Remove 'underline' and 'italic' hotkeys
    config.settings.slate.hotkeys = Object.keys(config.settings.slate.hotkeys)
      .filter((item) => !['mod+u', 'mod+i'].includes(item))
      .reduce((out, key) => {
        out[key] = config.settings.slate.hotkeys[key];
        return out;
      }, {});

    // Small button
    if (!config.settings.slate.toolbarButtons.includes('small')) {
      config.settings.slate.elements.small = ({ children }) => (
        <small>{children}</small>
      );

      config.settings.slate.buttons.small = (props) => (
        <MarkElementButton
          title="Small"
          format="small"
          icon={smallIcon}
          {...props}
        />
      );

      config.settings.slate.inlineElements = [
        ...config.settings.slate.inlineElements,
        'small',
      ];

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons.slice(0, 1),
        'small',
        ...config.settings.slate.toolbarButtons.slice(1),
      ];

      config.settings.slate.hotkeys['mod+s'] = {
        format: 'small',
        type: 'inline',
      };
    }

    // Light button
    if (!config.settings.slate.toolbarButtons.includes('light')) {
      config.settings.slate.elements.light = ({ children }) => (
        <span className="fw-light">{children}</span>
      );

      config.settings.slate.buttons.light = (props) => (
        <MarkElementButton
          title="Light"
          format="light"
          icon={lightIcon}
          {...props}
        />
      );

      config.settings.slate.inlineElements = [
        ...config.settings.slate.inlineElements,
        'light',
      ];

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons.slice(0, 1),
        'light',
        ...config.settings.slate.toolbarButtons.slice(1),
      ];

      config.settings.slate.hotkeys['mod+l'] = {
        format: 'light',
        type: 'inline',
      };
    }

    // Align Slate Lists to EEA Design System
    config.settings.slate.elements.ul = ({ attributes, children }) => (
      <List bulleted as="ul" {...attributes}>
        {children}
      </List>
    );

    config.settings.slate.elements.ol = ({ attributes, children }) => (
      <List ordered as="ol" {...attributes}>
        {children}
      </List>
    );

    config.settings.slate.elements.li = ({ attributes, children }) => (
      <List.Item as="li" {...attributes}>
        {children}
      </List.Item>
    );

    config.settings.slate.allowedHeadlineElements.push('zotero');

    // Slate StyleMenu configuration
    config.settings.slate.styleMenu = {
      ...(config.settings.slate.styleMenu || {}),
      blockStyles: [
        {
          cssClass: 'primary',
          label: 'Primary',
          icon: () => <Icon name={paintSVG} size="18px" />,
        },
        {
          cssClass: 'secondary',
          label: 'Secondary',
          icon: () => <Icon name={paintSVG} size="18px" />,
        },
        {
          cssClass: 'tertiary',
          label: 'Tertiary',
          icon: () => <Icon name={paintSVG} size="18px" />,
        },
      ],
    };

    // Text Align buttons

    // Align left
    if (!config.settings.slate.toolbarButtons.includes('text-left')) {
      config.settings.slate.buttons['text-left'] = (props) => (
        <BlockClassButton
          format="text-left"
          icon={alignLeftIcon}
          title="Align left"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'separator',
        'text-left',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'separator',
        'text-left',
      ];
    }

    // Align center
    if (!config.settings.slate.toolbarButtons.includes('text-center')) {
      config.settings.slate.buttons['text-center'] = (props) => (
        <BlockClassButton
          format="text-center"
          icon={alignCenterIcon}
          title="Align center"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'text-center',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'text-center',
      ];
    }

    // Align right
    if (!config.settings.slate.toolbarButtons.includes('text-right')) {
      config.settings.slate.buttons['text-right'] = (props) => (
        <BlockClassButton
          format="text-right"
          icon={alignRightIcon}
          title="Align right"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'text-right',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'text-right',
      ];
    }

    // Align justify
    if (!config.settings.slate.toolbarButtons.includes('text-justify')) {
      config.settings.slate.buttons['text-justify'] = (props) => (
        <BlockClassButton
          format="text-justify"
          icon={alignJustifyIcon}
          title="Align justify"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'text-justify',
        'separator',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'text-justify',
        'separator',
      ];
    }

    // Clear formatting
    if (!config.settings.slate.toolbarButtons.includes('clearformatting')) {
      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'clearformatting',
      ];
    }
  }

  return config;
}
