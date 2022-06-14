import * as eea from './config';
import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';
import installCustomTitle from '@eeacms/volto-eea-website-theme/components/manage/Blocks/Title';
import CustomCSS from '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS';
import DraftBackground from '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground';
import { TokenWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget';
import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';

const applyConfig = (config) => {
  // EEA specific settings
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  // Homepage
  config.views.layoutViews = {
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

  // apply inPage navigation
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '/**',
      component: InpageNavigation,
    },
  ];

  // Custom CSS voltoCustom.css and Draft Background
  const appExtras = config.settings.appExtras || [];
  config.settings.appExtras = [
    ...appExtras,
    {
      match: '',
      component: CustomCSS,
    },
    {
      match: '',
      component: DraftBackground,
    },
  ];

  // Custom block styles
  config.settings.pluggableStyles = [
    ...(config.settings.pluggableStyles || []),
    {
      id: 'content-box-gray',
      title: 'Content Box',
      viewComponent: (props) => {
        return (
          <div className="content-box">
            <div className="content-box-inner ui container">
              {props.children}
            </div>
          </div>
        );
      },
    },
    {
      id: 'content-box-primary',
      title: 'Content Box (primary)',
      viewComponent: (props) => {
        return (
          <div className="content-box primary">
            <div className="content-box-inner ui container">
              {props.children}
            </div>
          </div>
        );
      },
    },
    {
      id: 'content-box-secondary',
      title: 'Content Box (secondary)',
      viewComponent: (props) => {
        return (
          <div className="content-box secondary">
            <div className="content-box-inner ui container">
              {props.children}
            </div>
          </div>
        );
      },
    },
    {
      id: 'content-box-tertiary',
      title: 'Content Box (tertiary)',
      viewComponent: (props) => {
        return (
          <div className="content-box tertiary">
            <div className="content-box-inner ui container">
              {props.children}
            </div>
          </div>
        );
      },
    },
  ];

  // Custom blocks
  return [installCustomTitle].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
