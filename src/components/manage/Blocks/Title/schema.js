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
        'hidePublishingDate',
        'hideModificationDate',
        'hideReadingTime',
        'metadata',
      ],
    },
    {
      id: 'actions',
      title: 'Actions',
      fields: ['hideShareButton', 'hideDownloadButton'],
    },
    {
      id: 'advanced',
      title: 'Advanced options',
      fields: ['dateFormat', 'contentType'],
    },
  ],
  properties: {
    hideContentType: {
      title: 'Hide content type',
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
    hideReadingTime: {
      title: 'Hide reading time',
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
    dateFormat: {
      title: 'Date format',
      default: 'DD MMM YYYY',
      description: (
        <p>
          This uses{' '}
          <a
            href="https://momentjs.com/docs/#/displaying/format/"
            target="_blank"
            rel="noreferrer"
          >
            moment.js
          </a>{' '}
          to format the dates.
        </p>
      ),
    },
    contentType: {
      title: 'Content type',
      description:
        "Set this only if you don't want to use the type of the page",
    },
  },
  required: [],
};
