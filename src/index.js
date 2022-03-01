import * as eea from './config';

const applyConfig = (config) => {
  config.settings.eea = {
    ...eea,
  };

  return config;
};

export default applyConfig;
