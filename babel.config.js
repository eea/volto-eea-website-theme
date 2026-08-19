const voltoBabel = require('@plone/volto/babel');
const razzlePreset = require.resolve('@plone/babel-preset-razzle');

module.exports = (api) => {
  const config = voltoBabel(api);

  // Volto's shared Babel config still references the internal
  // `@plone/razzle/babel` entry point. Use the published Volto 19 preset so
  // Babel and ESLint can resolve it with pnpm's strict dependency layout.
  config.presets[0][0] = razzlePreset;

  if (process.env.NODE_ENV === 'test') {
    config.presets[0][1]['@babel/preset-react'] = {
      runtime: 'classic',
      pragma: 'mockReact.createElement',
      pragmaFrag: 'mockReact.Fragment',
    };
  }

  return config;
};
