import * as eea from './config';
import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';
import installCustomTitle from '@eeacms/volto-eea-website-theme/components/manage/Blocks/Title';
import CustomCSS from '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS';
import DraftBackground from '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground';
import { TokenWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget';
import SubsiteClass from './components/theme/SubsiteClass';
import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';
import { Icon } from '@plone/volto/components';
import { MarkElementButton, BlockButton } from '@plone/volto-slate/editor/ui';
import installCallout from '@plone/volto-slate/editor/plugins/Callout';
import paintSVG from '@plone/volto/icons/paint.svg';
import alignLeftIcon from '@plone/volto/icons/align-left.svg';
import alignRightIcon from '@plone/volto/icons/align-right.svg';
import alignCenterIcon from '@plone/volto/icons/align-center.svg';
import alignJustifyIcon from '@plone/volto/icons/align-justify.svg';
import contentBoxSVG from './icons/content-box.svg';
import lightIcon from './icons/light.svg';
import smallIcon from './icons/small.svg';
import voltoCustomMiddleware from './middleware/voltoCustom';
import { List } from 'semantic-ui-react';

const applyConfig = (config) => {
  // EEA specific settings
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  // Insert scripts on Error pages
  if (config.settings?.serverConfig?.extractScripts) {
    config.settings.serverConfig.extractScripts.errorPages = true;
  }

  // Disable tags on View
  config.settings.showTags = false;

  // Enable Title block
  config.blocks.blocksConfig.title.restricted = false;

  // Enable description block (also for cypress)
  config.blocks.blocksConfig.description.restricted = false;
  config.blocks.requiredBlocks = [];

  // Date format for EU
  config.settings.dateLocale = 'en-gb';

  // Custom Homepage layouts
  config.views.layoutViews = {
    ...(config.views.layoutViews || {}),
    homepage_view: HomePageView,
    homepage_inverse_view: HomePageInverseView,
  };
  config.views.layoutViewsNamesMapping = {
    ...(config.views.layoutViewsNamesMapping || {}),
    homepage_view: 'Homepage view',
    homepage_inverse_view: 'Homepage white view',
  };

  // Apply accordion block customization
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.semanticIcon = 'ri-arrow-down-s-line';
    config.blocks.blocksConfig.accordion.options = {};
    config.blocks.blocksConfig.accordion.defaults.theme = 'secondary';
  }

  // Apply tabs block customization
  if (config.blocks.blocksConfig.tabs_block) {
    if (config.blocks.blocksConfig.tabs_block.templates.accordion) {
      config.blocks.blocksConfig.tabs_block.templates.accordion.semanticIcon = {
        opened: 'ri-arrow-up-s-line',
        closed: 'ri-arrow-down-s-line',
      };
    }
  }

  // Description block custom CSS
  config.blocks.blocksConfig.description.className =
    'documentDescription eea callout';

  // Custom TokenWidget
  if (config.widgets.views) {
    config.widgets.views.id.subjects = TokenWidget;
    config.widgets.views.widget.tags = TokenWidget;
  }

  // voltoCustom.css express-middleware
  if (__SERVER__) {
    const express = require('express');
    config.settings.expressMiddleware = [
      ...(config.settings.expressMiddleware || []),
      voltoCustomMiddleware(express),
    ];
  }

  // InPage navigation, Custom CSS voltoCustom.css and Draft Background
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '/**',
      component: InpageNavigation,
    },
    {
      match: '',
      component: CustomCSS,
    },
    {
      match: '',
      component: DraftBackground,
    },
    {
      match: '',
      component: SubsiteClass,
    },
  ];

  if (config.settings.slate) {
    // Callout slate button
    config = installCallout(config);

    // Remove blockquote, italic, strikethrough slate button from toolbarButtons
    config.settings.slate.toolbarButtons = config.settings.slate.toolbarButtons.filter(
      (item) => !['blockquote', 'italic', 'strikethrough'].includes(item),
    );

    // Remove blockquote, italic, strikethrough slate button from expandedToolbarButtons
    config.settings.slate.expandedToolbarButtons = config.settings.slate.expandedToolbarButtons.filter(
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
    if (!config.settings.slate.toolbarButtons.includes('alignLeft')) {
      config.settings.slate.elements.alignLeft = ({ attributes, children }) => (
        <p {...attributes} className="text-left">
          {children}
        </p>
      );

      config.settings.slate.buttons.alignLeft = (props) => (
        <BlockButton
          format="alignLeft"
          icon={alignLeftIcon}
          title="Align left"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'separator',
        'alignLeft',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'separator',
        'alignLeft',
      ];
    }

    // Align center
    if (!config.settings.slate.toolbarButtons.includes('alignCenter')) {
      config.settings.slate.elements.alignCenter = ({
        attributes,
        children,
      }) => (
        <p {...attributes} className="text-center">
          {children}
        </p>
      );

      config.settings.slate.buttons.alignCenter = (props) => (
        <BlockButton
          format="alignCenter"
          icon={alignCenterIcon}
          title="Align center"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'alignCenter',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'alignCenter',
      ];
    }

    // Align right
    if (!config.settings.slate.toolbarButtons.includes('alignRight')) {
      config.settings.slate.elements.alignRight = ({
        attributes,
        children,
      }) => (
        <p {...attributes} className="text-right">
          {children}
        </p>
      );

      config.settings.slate.buttons.alignRight = (props) => (
        <BlockButton
          format="alignRight"
          icon={alignRightIcon}
          title="Align right"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'alignRight',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'alignRight',
      ];
    }

    // Align justify
    if (!config.settings.slate.toolbarButtons.includes('alignJustify')) {
      config.settings.slate.elements.alignJustify = ({
        attributes,
        children,
      }) => (
        <p {...attributes} className="text-justify">
          {children}
        </p>
      );

      config.settings.slate.buttons.alignJustify = (props) => (
        <BlockButton
          format="alignJustify"
          icon={alignJustifyIcon}
          title="Align justify"
          {...props}
        />
      );

      config.settings.slate.toolbarButtons = [
        ...config.settings.slate.toolbarButtons,
        'alignJustify',
        'separator',
      ];

      config.settings.slate.expandedToolbarButtons = [
        ...config.settings.slate.expandedToolbarButtons,
        'alignJustify',
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

  // Custom block-style colors
  config.settings.available_colors = eea.colors;

  // Site theme colors
  config.settings.themeColors = [
    { value: undefined, title: 'No theme' },
    { value: 'primary', title: 'Primary' },
    { value: 'secondary', title: 'Secondary' },
    { value: 'tertiary', title: 'Tertiary' },
  ];

  // Custom preset styles - content-box
  config.settings.previewText = '';
  config.settings.pluggableStyles = [
    ...(config.settings.pluggableStyles || []),
    {
      id: 'content-box-gray',
      title: 'Default',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="default" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: 'content-box-primary',
      title: 'Primary',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="primary" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box primary">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: 'content-box-secondary',
      title: 'Secondary',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="secondary" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box secondary">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: 'content-box-tertiary',
      title: 'Tertiary',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="tertiary" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box tertiary">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
  ];

  // Custom blocks: Title
  return [installCustomTitle].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
