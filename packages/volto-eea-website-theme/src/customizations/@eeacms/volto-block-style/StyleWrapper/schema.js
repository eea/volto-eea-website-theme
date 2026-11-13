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
    ],
    properties: {
      style_name: {
        title: 'Style',
        widget: 'style_select',
      },
    },
    required: [],
  };
};
