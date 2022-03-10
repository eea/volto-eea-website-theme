import * as eea from './config';
import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';

const applyConfig = (config) => {
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  // Apply accordion block customization
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.semanticIcon = 'dropdown';
  }
  // apply inPage navigation
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '/**',
      component: InpageNavigation,
    },
  ];
  return config;
};

export default applyConfig;
