import { defineMessages } from 'react-intl';

const messages = defineMessages({
  Image: {
    id: 'Image',
    defaultMessage: 'Image',
  },
  Origin: {
    id: 'Origin',
    defaultMessage: 'Origin',
  },
  AltText: {
    id: 'Alt text',
    defaultMessage: 'Alt text',
  },
  Copyright: {
    id: 'Text',
    defaultMessage: 'Text',
  },
  CopyrightIcon: {
    id: 'Icon',
    defaultMessage: 'Icon',
  },
  Align: {
    id: 'Alignment',
    defaultMessage: 'Alignment',
  },
  LinkTo: {
    id: 'Link to',
    defaultMessage: 'Link to',
  },
  openLinkInNewTab: {
    id: 'Open in a new tab',
    defaultMessage: 'Open in a new tab',
  },
  NoImageSelected: {
    id: 'No image set in image content field',
    defaultMessage: 'No image set in image content field',
  },
  externalURL: {
    id: 'External URL',
    defaultMessage: 'External URL',
  },
});

export function LeadImageSchema({ formData, intl }) {
  return {
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [...(formData.image ? ['alt', 'align'] : [])],
      },

      ...(formData.image
        ? [
            {
              id: 'link_settings',
              title: 'Link settings',
              fields: ['href', 'openLinkInNewTab'],
            },
          ]
        : []),
      {
        id: 'copyright',
        title: 'Copyright',
        fields: ['copyright', 'copyrightIcon', 'copyrightPosition'],
      },
    ],
    properties: {
      alt: {
        title: intl.formatMessage(messages.AltText),
      },
      align: {
        title: intl.formatMessage(messages.Align),
        widget: 'align',
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
}
