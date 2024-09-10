import Edit from './Edit';
import View from './View';
import DefaultTemplate from './variations/Default';
import HeroBackground from './variations/HeroBackground';

const applyConfig = (config) => {
  config.blocks.blocksConfig.title = {
    ...config.blocks.blocksConfig.title,
    edit: Edit,
    view: View,
    variations: [
      {
        id: 'default',
        title: 'Default',
        view: DefaultTemplate,
        isDefault: true,
      },
      {
        id: 'web_report',
        title: 'Web Report',
        view: HeroBackground,
        schemaEnhancer: ({ schema }) => {
          const fields = schema.fieldsets[0].fields;
          schema.fieldsets[0].fields = [
            ...fields,
            'content_type',
            'hero_background',
            'height',
          ];

          schema.properties.content_type = {
            title: 'Content type name',
            description:
              'Add a custom content-type name, leave empty for default',
          };
          schema.properties.hero_background = {
            title: 'Hero Background Image',
            type: 'boolean',
          };
          schema.properties.height = {
            title: 'Height',
            description: 'Height of the banner',
          };
          return schema;
        },
      },
    ],
    copyrightPrefix: 'Image',
    sidebarTab: 1,
  };

  return config;
};

export default applyConfig;
