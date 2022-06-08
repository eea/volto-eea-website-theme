import * as eea from './config';
import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';
import installCustomTitle from '@eeacms/volto-eea-website-theme/components/manage/Blocks/Title';
import CustomCSS from '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS';
import DraftBackground from '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground';
import { TokenWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget';

const applyConfig = (config) => {
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  // Apply accordion block customization
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.semanticIcon = 'ri-arrow-down-s-line';
  }

  // Apply tabs block customization
  if (config.blocks.blocksConfig.tabs_block) {
    config.blocks.blocksConfig.tabs_block.templates.accordion.semanticIcon = {
      opened: 'ri-arrow-up-s-line',
      closed: 'ri-arrow-down-s-line',
    };
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

  return [installCustomTitle].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
