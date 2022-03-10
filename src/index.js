import * as eea from './config';
import { Blockquote } from './components';
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
  // Apply blockquote slate customization
  if (config.settings.slate) {
    config.settings.slate.elements['blockquote'] = Blockquote;
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
