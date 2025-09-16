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

  /**
   * TODO: Remove these aliases after https://github.com/plone/volto/issues/6997 is resolved
   *
   * This workaround prevents localStorage pollution for anonymous users by intercepting
   * redux-localstorage-simple with our conditional middleware wrapper.
   *
   * Once the issue is fixed in Volto core:
   * 1. Remove the alias configurations below
   * 2. Remove the conditionalLocalStorage.js middleware file
   * 3. The standard redux-localstorage-simple from Volto will work correctly
   */
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
