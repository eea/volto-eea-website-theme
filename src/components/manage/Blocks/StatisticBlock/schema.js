const statisticSchema = {
  title: 'Statistic item',
  fieldsets: [{ id: 'default', title: 'Default', fields: ['value', 'label'] }],
  properties: {
    value: {
      title: 'Value',
    },
    label: {
      title: 'Label',
    },
  },
  required: [],
};

export default {
  title: 'Statistic block',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['horizontal', 'inverted', 'size', 'widths', 'items'],
    },
  ],

  properties: {
    horizontal: {
      title: 'Horizontal',
      description: 'Can present its measurement horizontally',
      type: 'boolean',
    },
    inverted: {
      title: 'Inverted',
      description: 'Can be formatted to fit on a dark background.',
      type: 'boolean',
    },
    size: {
      title: 'Size',
      choices: [
        ['mini', 'Mini'],
        ['tiny', 'Tiny'],
        ['small', 'Small'],
        ['large', 'Large'],
        ['huge', 'Huge'],
      ],
    },
    widths: {
      title: 'Columns',
      choices: [
        ['one', 'One'],
        ['two', 'Two'],
        ['three', 'Three'],
        ['four', 'Four'],
      ],
    },
    items: {
      title: 'Statistic items',
      widget: 'object_list',
      schema: statisticSchema,
    },
  },

  required: [],
};
