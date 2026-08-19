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
   */
  // Keep an exact alias to the original package for the wrapper itself.
  // Resolve it from this add-on's dependencies so this also works with pnpm's
  // strict node_modules layout.
  alias['redux-localstorage-simple-original$'] = require.resolve(
    'redux-localstorage-simple',
  );

  // Alias exact imports of redux-localstorage-simple to conditional middleware.
  // The trailing `$` prevents this alias from also matching the original alias.
  const conditionalLocalStoragePath = path.resolve(
    __dirname,
    './src/middleware/conditionalLocalStorage',
  );
  alias['redux-localstorage-simple$'] = conditionalLocalStoragePath;

  return config;
};

module.exports = {
  plugins,
  modify,
};
