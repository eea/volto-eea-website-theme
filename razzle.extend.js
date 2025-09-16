const path = require('path');
const plugins = (defaultPlugins) => {
  return defaultPlugins;
};
const modify = (config, { target, dev }, webpack) => {
  const themeConfigPath = `${__dirname}/theme/theme.config`;
  const { alias } = config.resolve;
  alias['../../theme.config$'] = themeConfigPath;
  alias['../../theme.config'] = themeConfigPath;

  const designSystem = '@eeacms/volto-eea-design-system';
  const designSystemPath =
    config.resolve.alias[designSystem] ||
    path.dirname(require.resolve(designSystem));

  const themeLessPath = path.resolve(`${designSystemPath}/../theme`);

  alias['eea-design-system-theme'] = `${themeLessPath}/themes/eea`;

  const semanticLessPath = path.dirname(
    require.resolve('semantic-ui-less/package.json'),
  );

  alias['eea-volto-theme-folder'] = alias['eea-volto-themes']
    ? themeLessPath
    : semanticLessPath;

  // Alias redux-localstorage-simple to conditional middleware
  const conditionalLocalStoragePath = path.resolve(
    __dirname,
    './src/middleware/conditionalLocalStorage',
  );
  alias['redux-localstorage-simple'] = conditionalLocalStoragePath;

  // Create an alias to access the original redux-localstorage-simple package
  const originalReduxLocalStoragePath = path.resolve(
    __dirname,
    '../../../node_modules/redux-localstorage-simple',
  );
  alias['redux-localstorage-simple-original'] = originalReduxLocalStoragePath;

  return config;
};

module.exports = {
  plugins,
  modify,
};
