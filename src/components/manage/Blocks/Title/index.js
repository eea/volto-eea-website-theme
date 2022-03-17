import Edit from './Edit';
import View from './View';

export default (config) => {
  config.blocks.blocksConfig.title = {
    ...config.blocks.blocksConfig.title,
    edit: Edit,
    view: View,
  };

  return config;
};
