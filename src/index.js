import * as eea from './config';
import { Blockquote } from './components';
import installBlocks from './components/manage/Blocks';

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

  return [installBlocks].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
