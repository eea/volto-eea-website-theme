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
    {
      id: 'copyright',
      title: 'Copyright',
      fields: ['copyright', 'copyrightIcon', 'copyrightPosition'],
    },
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
    copyright: {
      title: 'Text',
    },
    copyrightIcon: {
      title: 'Icon',
      default: 'ri-copyright-line',
    },
    copyrightPosition: {
      title: 'Align',
      widget: 'align',
    },
  },
  required: [],
};
