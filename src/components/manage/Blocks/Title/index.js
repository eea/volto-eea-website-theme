import Edit from './Edit';
import View from './View';
import { addStylingFieldsetSchemaEnhancerImagePosition } from 'addons/volto-eea-website-theme/src/helpers/schema-utils';

export default (config) => {
  config.blocks.blocksConfig.title = {
    ...config.blocks.blocksConfig.title,
    edit: Edit,
    view: View,
    copyrightPrefix: 'Image',
    sidebarTab: 1,
  };

  return config;
};
