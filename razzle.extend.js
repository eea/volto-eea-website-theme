const path = require('path');
const webpack = require('webpack');

const plugins = (defaultPlugins) => {
  return defaultPlugins;
};
const modify = (config, { target, dev }) => {
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

  if (target === 'web') {
    config.plugins.unshift(
      new webpack.DefinePlugin({
        __webpack_nonce__: 'window.__webpack_nonce__',
      }),
    );
  }

  return config;
};

module.exports = {
  plugins,
  modify,
};
