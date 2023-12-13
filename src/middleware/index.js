import apiEnhancer from './apiEnhancer';

export default function applyConfig(config) {
  config.settings.storeExtenders = [
    ...(config.settings.storeExtenders || []),
    apiEnhancer,
  ];

  return config;
}
