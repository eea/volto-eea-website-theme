const metadataSchema = {
  title: 'Metadata',
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
        'metadata',
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
    metadata: {
      title: 'Extra metadata',
      widget: 'object_list',
      schema: metadataSchema,
    },
    // contentType: {
    //   title: 'Type',
    //   description: "Custom content-type's name",
    // },
  },
  required: [],
};
