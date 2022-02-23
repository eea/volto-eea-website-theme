const path = require('path');
const plugins = (defaultPlugins) => {
  return defaultPlugins;
};
const modify = (config, { target, dev }, webpack) => {
  const themeConfigPath = `${__dirname}/theme/theme.config`;
  config.resolve.alias['../../theme.config$'] = themeConfigPath;
  config.resolve.alias['../../theme.config'] = themeConfigPath;
  const projectRootPath = path.resolve('.');
  const themeLessPath = `${projectRootPath}/node_modules/@eeacms/volto-eea-design-system/theme`;
  const semanticLessPath = `${projectRootPath}/node_modules/semantic-ui-less`;
  const hasDesignSystemInstalled = config.resolve.alias['eea-volto-themes'];
  config.resolve.alias['eea-volto-theme-folder'] = hasDesignSystemInstalled
    ? themeLessPath
    : semanticLessPath;

  return config;
};

module.exports = {
  plugins,
  modify,
};
