export const StyleSchema = () => {
  return {
    title: 'Styles',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [],
      },
      {
        id: 'presets',
        title: 'Preset styles',
        fields: ['style_name'],
      },
      {
        id: 'text',
        title: 'Text',
        fields: ['textAlign', 'fontWeight'],
      },
    ],
    properties: {
      style_name: {
        title: 'Style',
        widget: 'style_select',
      },
      textAlign: {
        title: 'Text align',
        widget: 'style_text_align',
      },
      fontWeight: {
        title: 'Font weight',
        description: 'The weight (or boldness) of the font',
        choices: [
          ['300', 'Light'],
          ['400', 'Regular'],
          ['500', 'Medium'],
          ['600', 'SemiBold'],
          ['700', 'Bold'],
        ],
      },
    },
    required: [],
  };
};
