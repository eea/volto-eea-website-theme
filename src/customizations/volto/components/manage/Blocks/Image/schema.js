import { defineMessages } from 'react-intl';

const messages = defineMessages({
  Source: {
    id: 'Source',
    defaultMessage: 'Source',
  },
  Image: {
    id: 'Image',
    defaultMessage: 'Image',
  },
  AltText: {
    id: 'Alt text',
    defaultMessage: 'Alt text',
  },
  Align: {
    id: 'Alignment',
    defaultMessage: 'Alignment',
  },
  size: {
    id: 'Image size',
    defaultMessage: 'Image size',
  },
  LinkTo: {
    id: 'Link to',
    defaultMessage: 'Link to',
  },
  openLinkInNewTab: {
    id: 'Open in a new tab',
    defaultMessage: 'Open in a new tab',
  },
  AltTextHint: {
    id: 'Alt text hint',
    defaultMessage: 'Leave empty if the image is purely decorative.',
  },
  AltTextHintLinkText: {
    id: 'Alt text hint link text',
    defaultMessage: 'Describe the purpose of the image.',
  },
});

export function ImageSchema({ formData, intl }) {
  return {
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [...(formData.url ? ['url', 'alt', 'align', 'size'] : [])],
      },

      ...(!formData?.size || formData?.size === 'l'
        ? [
            {
              id: 'copyright',
              title: 'Copyright',
              fields: ['copyright', 'copyrightIcon', 'copyrightPosition'],
            },
          ]
        : []),
      ...(formData?.url
        ? [
            {
              id: 'link_settings',
              title: 'Link settings',
              fields: ['href', 'openLinkInNewTab'],
            },
          ]
        : []),
    ],
    properties: {
      url: {
        title: intl.formatMessage(messages.Source),
        widget: 'url',
      },
      alt: {
        title: intl.formatMessage(messages.AltText),
        description: (
          <>
            <a
              href="https://www.w3.org/WAI/tutorials/images/decision-tree/"
              title={intl.formatMessage(messages.openLinkInNewTab)}
              target="_blank"
              rel="noopener"
            >
              {intl.formatMessage(messages.AltTextHintLinkText)}
            </a>{' '}
            {intl.formatMessage(messages.AltTextHint)}
          </>
        ),
      },
      align: {
        title: intl.formatMessage(messages.Align),
        widget: 'align',
      },
      size: {
        title: intl.formatMessage(messages.size),
        widget: 'image_size',
      },
      href: {
        title: intl.formatMessage(messages.LinkTo),
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description', 'hasPreviewImage'],
        allowExternals: true,
      },
      openLinkInNewTab: {
        title: intl.formatMessage(messages.openLinkInNewTab),
        type: 'boolean',
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
              rel="noopener"
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
}
