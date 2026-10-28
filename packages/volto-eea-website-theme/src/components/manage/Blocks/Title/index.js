import Edit from './Edit';
import View from './View';
import DefaultTemplate from './variations/Default';
import WebReport from './variations/WebReport';
import WebReportPage from './variations/WebReportPage';

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
        view: WebReport,
        schemaEnhancer: ({ schema }) => {
          const fields = schema.fieldsets[0].fields;
          schema.fieldsets[0].fields = [
            ...fields,
            'content_type',
            'hero_header',
          ];

          schema.properties.content_type = {
            title: 'Content type name',
            description:
              'Add a custom content-type name, leave empty for default',
          };
          schema.properties.hero_header = {
            title: 'Hero header size',
            type: 'boolean',
          };
          return schema;
        },
      },
      {
        id: 'web_report_page',
        title: 'Web Report Page',
        view: WebReportPage,
        schemaEnhancer: ({ schema }) => {
          const fields = schema.fieldsets[0].fields;
          schema.fieldsets[0].fields = [...fields, 'content_type'];

          schema.properties.content_type = {
            title: 'Content type name',
            description:
              'Add a custom content-type name, leave empty for default',
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
