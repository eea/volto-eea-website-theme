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
      description: (
        <>
          Ex. ri-copyright-line. See{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://eea.github.io/volto-eea-design-system/docs/webdev/Guidelines/iconography/#icon-set"
          >
            Remix Icon set
          </a>
        </>
      ),
      default: 'ri-copyright-line',
    },
    copyrightPosition: {
      title: 'Align',
      widget: 'align',
      actions: ['left', 'right'],
      defaultValue: 'left',
    },
  },
  required: [],
};
