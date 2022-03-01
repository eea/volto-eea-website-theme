import * as eea from './config';

const applyConfig = (config) => {
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  return config;
};

export default applyConfig;
