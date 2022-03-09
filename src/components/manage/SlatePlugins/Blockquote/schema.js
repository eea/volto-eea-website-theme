export default (data) => {
  return {
    title: 'Blockquote',
    fieldsets: [
      {
        id: 'default',
        title: 'Properties',
        fields: ['type'],
      },
      ...(data.type === 'pullquote'
        ? [
            {
              id: 'pullquote',
              title: 'Pullquote properties',
              fields: ['position'],
            },
          ]
        : []),
    ],
    properties: {
      type: {
        title: 'Type',
        choices: [
          ['blockquote', 'Blockquote'],
          ['pullquote', 'Pullquote'],
        ],
      },
      position: {
        title: 'Position',
        choices: [
          ['left', 'Left'],
          ['right', 'Right'],
          ['none', 'None'],
        ],
      },
    },
    required: [],
  };
};
