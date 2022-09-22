import * as eea from './config';
import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';
import installCustomTitle from '@eeacms/volto-eea-website-theme/components/manage/Blocks/Title';
import CustomCSS from '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS';
import DraftBackground from '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground';
import { TokenWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget';
import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';
import { Icon } from '@plone/volto/components';
import paintSVG from '@plone/volto/icons/paint.svg';
import contentBoxSVG from './icons/content-box.svg';

const applyConfig = (config) => {
  // EEA specific settings
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  // Custom Homepage layouts
  config.views.layoutViews = {
    ...(config.views.layoutViews || {}),
    homepage_view: HomePageView,
    homepage_inverse_view: HomePageInverseView,
  };

  // Apply accordion block customization
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.semanticIcon = 'ri-arrow-down-s-line';
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
  ];

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
      {
        cssClass: 'bordered',
        label: 'Bordered',
        icon: () => <Icon name={paintSVG} size="18px" />,
      },
    ],
  };

  // Custom block styles
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

  // Custom blocks
  return [installCustomTitle].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
