import navigationSettings from './src/reducers/navigation/navigation';

export default function applyConfig(config) {
  config.addonReducers = {
    ...config.addonReducers,
    navigationSettings,
  };
  return config;
}