import Edit from './Edit';
import View from './View';

export default (config) => {
  config.blocks.blocksConfig.title = {
    ...config.blocks.blocksConfig.title,
    edit: Edit,
    view: View,
    sidebarTab: 1,
  };

  return config;
};
