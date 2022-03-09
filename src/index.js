import * as eea from './config';
import installBlockquote from './components/manage/SlatePlugins/Blockquote';

const applyConfig = (config) => {
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  // Apply accordion block customization
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.semanticIcon = 'dropdown';
  }

  return [installBlockquote].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
