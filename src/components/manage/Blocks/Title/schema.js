const infoSchema = {
  title: 'Info',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['description'],
    },
  ],
  properties: {
    description: {
      title: 'Description',
      widget: 'textarea',
    },
  },
  required: [],
};

export default {
  title: 'Page header',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'hideContentType',
        'hideCreationDate',
        'hidePublishingDate',
        'hideModificationDate',
        'info',
      ],
    },
    {
      id: 'actions',
      title: 'Actions',
      fields: ['hideShareButton', 'hideDownloadButton'],
    },
    // {
    //   id: 'advanced',
    //   title: 'Advanced options',
    //   fields: ['contentType'],
    // },
  ],
  properties: {
    hideContentType: {
      title: 'Hide content type',
      type: 'boolean',
    },
    hideCreationDate: {
      title: 'Hide creation date',
      type: 'boolean',
    },
    hidePublishingDate: {
      title: 'Hide publishing date',
      type: 'boolean',
    },
    hideModificationDate: {
      title: 'Hide modification date',
      type: 'boolean',
    },
    hideShareButton: {
      title: 'Hide share button',
      type: 'boolean',
    },
    hideDownloadButton: {
      title: 'Hide download button',
      type: 'boolean',
    },
    info: {
      title: 'Extra info',
      widget: 'object_list',
      schema: infoSchema,
    },
    // contentType: {
    //   title: 'Type',
    //   description: "Custom content-type's name",
    // },
  },
  required: [],
};
