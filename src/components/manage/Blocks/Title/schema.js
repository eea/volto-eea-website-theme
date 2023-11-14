import alignTopSVG from '@plone/volto/icons/move-up.svg';
import alignCenterSVG from '@plone/volto/icons/row.svg';
import alignBottomSVG from '@plone/volto/icons/move-down.svg';

const ALIGN_INFO_MAP_IMAGE_POSITION = {
  'has--bg--top': [alignTopSVG, 'Top'],
  'has--bg--center': [alignCenterSVG, 'Center'],
  'has--bg--bottom': [alignBottomSVG, 'Bottom'],
};

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

const RSSLink = {
  title: 'RSS Link',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'feedType', 'href'],
    },
  ],
  properties: {
    title: {
      title: 'Title',
    },
    feedType: {
      title: 'Feed Type',
      choices: [
        ['rss2', 'RSS2'],
        ['atom', 'ATOM'],
      ],
      default: 'rss2',
    },
    href: {
      title: 'URL Path',
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
        'subtitle',
        'info',
      ],
    },
    {
      id: 'actions',
      title: 'Actions',
      fields: ['hideShareButton', 'hideDownloadButton', 'rssLinks'],
    },
    {
      id: 'copyright',
      title: 'Copyright',
      fields: ['copyright', 'copyrightIcon', 'copyrightPosition'],
    },
    {
      id: 'styling',
      title: 'Styles',
      fields: ['styles'],
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
    subtitle: {
      title: 'Subtitle',
    },
    rssLinks: {
      title: 'RSS Links',
      widget: 'object_list',
      schema: RSSLink,
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
    styles: {
      widget: 'object',
      title: 'Styling',
      schema: {
        fieldsets: [
          {
            id: 'default',
            title: 'Default',
            fields: ['bg'],
          },
        ],
        properties: {
          bg: {
            title: 'Image position',
            widget: 'align',
            actions: Object.keys(ALIGN_INFO_MAP_IMAGE_POSITION),
            actionsInfoMap: ALIGN_INFO_MAP_IMAGE_POSITION,
            defaultValue: 'has--bg--center',
          },
        },
        required: [],
      },
    },
  },

  required: [],
};
