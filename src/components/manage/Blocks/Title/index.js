import Edit from './Edit';
import View from './View';

const applyConfig = (config) => {
  config.blocks.blocksConfig.title = {
    ...config.blocks.blocksConfig.title,
    edit: Edit,
    view: View,
    copyrightPrefix: 'Image',
    sidebarTab: 1,
  };

  return config;
};

export default applyConfig;
