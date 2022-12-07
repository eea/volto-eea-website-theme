const path = require('path');
const plugins = (defaultPlugins) => {
  return defaultPlugins;
};
const modify = (config, { target, dev }, webpack) => {
  const themeConfigPath = `${__dirname}/theme/theme.config`;
  config.resolve.alias['../../theme.config$'] = themeConfigPath;
  config.resolve.alias['../../theme.config'] = themeConfigPath;

  const designSystem = '@eeacms/volto-eea-design-system';
  const designSystemPath =
    config.resolve.alias[designSystem] ||
    path.dirname(require.resolve(designSystem));

  const themeLessPath = path.resolve(`${designSystemPath}/../theme`);

  config.resolve.alias[
    'eea-design-system-theme'
  ] = `${themeLessPath}/themes/eea`;

  const semanticLessPath = path.dirname(
    require.resolve('semantic-ui-less/package.json'),
  );
  const hasDesignSystemInstalled = config.resolve.alias['eea-volto-themes'];
  config.resolve.alias['eea-volto-theme-folder'] = hasDesignSystemInstalled
    ? themeLessPath
    : semanticLessPath;

  console.log(config.resolve.alias);

  return config;
};

module.exports = {
  plugins,
  modify,
};
