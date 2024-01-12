import RemoveSchema from '@eeacms/volto-eea-website-theme/components/theme/AppExtras/RemoveSchema';

import schema from './schema';

export default function applyConfig(config) {
  config.addonReducers.schema = schema;

  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '*',
      exceptions: [/.*diff(?:\?.*)?$/],
      component: RemoveSchema,
    },
  ];

  return config;
}
