import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';
import CustomCSS from '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS';
import DraftBackground from '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground';
import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';
import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
import NotFound from '@eeacms/volto-eea-website-theme/components/theme/NotFound/NotFound';
import { TokenWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget';
import { TopicsWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TopicsWidget';
import { Icon } from '@plone/volto/components';
import { getBlocks } from '@plone/volto/helpers';
import { serializeNodesToText } from '@plone/volto-slate/editor/render';
import Tag from '@eeacms/volto-eea-design-system/ui/Tag/Tag';

import {
  addStylingFieldsetSchemaEnhancer,
  addStylingFieldsetSchemaEnhancerImagePosition,
} from '@eeacms/volto-eea-website-theme/helpers/schema-utils';

import installLayoutSettingsBlock from '@eeacms/volto-eea-website-theme/components/manage/Blocks/LayoutSettings';
import installCustomTitle from '@eeacms/volto-eea-website-theme/components/manage/Blocks/Title';

import FlexGroup from '@eeacms/volto-eea-website-theme/components/manage/Blocks/GroupBlockTemplate/FlexGroup/FlexGroup';
import BaseTag from './components/theme/BaseTag';
import SubsiteClass from './components/theme/SubsiteClass';
import contentBoxSVG from './icons/content-box.svg';

import okMiddleware from './middleware/ok';
import voltoCustomMiddleware from './middleware/voltoCustom';
import installSlate from './slate';
import { print } from './reducers';
import { nanoid } from '@plone/volto-slate/utils';
import { v4 as uuid } from 'uuid';

import * as eea from './config';
import React from 'react';

const restrictedBlocks = ['imagesGrid', 'teaser'];

/**
 * Customizes the variations of a tabs block by modifying their schema and semantic icons.
 *
 * @param {Array} tabs_block_variations - An array of variations for the tabs block.
 * @param {Object} config - The Volto configuration object.
 */
function tabVariationCustomization(tabs_block_variations, config) {
  if (!tabs_block_variations) return;
  const defaultVariation = tabs_block_variations.find(
    ({ id }) => id === 'default',
  );
  const accordionVariation = tabs_block_variations.find(
    ({ id }) => id === 'accordion',
  );
  const horizontalVariation = tabs_block_variations.find(
    ({ id }) => id === 'horizontal-responsive',
  );

  if (accordionVariation) {
    accordionVariation.semanticIcon = {
      opened: 'ri-arrow-up-s-line',
      closed: 'ri-arrow-down-s-line',
    };
  }

  const oldSchemaEnhancer =
    config.blocks.blocksConfig.tabs_block.schemaEnhancer;
  config.blocks.blocksConfig.tabs_block.schemaEnhancer = (props) => {
    const schema = (oldSchemaEnhancer ? oldSchemaEnhancer(props) : props)
      .schema;
    const oldSchemaExtender = schema.properties?.data?.schemaExtender;

    //check before if schema.properties.data exists
    if (!schema?.properties?.data) {
      schema.properties = {
        ...schema.properties,
        data: {},
      };
    }

    schema.properties.data.schemaExtender = (schema, child) => {
      const innerSchema = oldSchemaExtender
        ? oldSchemaExtender(schema, child)
        : schema;
      innerSchema.properties.icon.description = (
        <>
          Ex. ri-home-line. See{' '}
          <a target="_blank" rel="noopener" href="https://remixicon.com/">
            Remix Icon set
          </a>
        </>
      );
      return innerSchema;
    };
    return schema;
  };

  const oldDefaultSchemaEnhancer = defaultVariation.schemaEnhancer;
  defaultVariation.schemaEnhancer = (props) => {
    const newSchema = oldDefaultSchemaEnhancer(props);
    const menuFieldset = newSchema.fieldsets.find(({ id }) => id === 'menu');
    menuFieldset.fields = [
      'menuAlign',
      'menuPosition',
      'menuColor',
      'menuInverted',
    ];
    return newSchema;
  };
  const oldHorizontalSchemaEnhancer = horizontalVariation.schemaEnhancer;
  horizontalVariation.schemaEnhancer = (props) => {
    const newSchema = oldHorizontalSchemaEnhancer(props);
    const menuFieldset = newSchema.fieldsets.find(({ id }) => id === 'menu');
    menuFieldset.fields = [
      'menuAlign',
      'menuPosition',
      'menuColor',
      'menuInverted',
    ];
    return newSchema;
  };
}

const applyConfig = (config) => {
  // EEA specific settings
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  //include site title in <title>
  if (!config.settings.siteTitleFormat) {
    config.settings.siteTitleFormat = { includeSiteTitle: true };
  } else config.settings.siteTitleFormat.includeSiteTitle = true;
  config.settings.titleAndSiteTitleSeparator = '|';

  // #160689 Redirect contact-form to contact-us
  config.settings.contactForm = '/contact';

  // Insert scripts on Error pages
  if (config.settings?.serverConfig?.extractScripts) {
    config.settings.serverConfig.extractScripts.errorPages = true;
  }
  // Set cloneData function for slate block, in order to change the uuids of fragments in the copy process
  if (config.blocks?.blocksConfig?.slate) {
    config.blocks.blocksConfig.slate.cloneData = (data) => {
      const replaceAllUidsWithNewOnes = (value) => {
        if (value?.children?.length > 0) {
          const newChildren = value.children.map((childrenData) => {
            if (childrenData?.data?.uid) {
              return {
                ...childrenData,
                data: { ...childrenData.data, uid: nanoid(5) },
              };
            }
            return childrenData;
          });
          return {
            ...value,
            children: newChildren,
          };
        }
        return value;
      };
      return [
        uuid(),
        {
          ...data,
          value: [
            ...(data?.value || []).map((value) =>
              replaceAllUidsWithNewOnes(value),
            ),
          ],
        },
      ];
    };
  }

  // Disable tags on View
  config.settings.showTags = false;

  // Disable some blocks
  restrictedBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].restricted = true;
    }
  });

  //Apply the image position style for image and leadimage blocks
  if (config.blocks.blocksConfig.leadimage) {
    config.blocks.blocksConfig.leadimage.schemaEnhancer =
      addStylingFieldsetSchemaEnhancerImagePosition;
  }

  if (config.blocks.blocksConfig.image) {
    config.blocks.blocksConfig.image.schemaEnhancer =
      addStylingFieldsetSchemaEnhancerImagePosition;
  }

  // Set Languages in nextcloud-video-block
  if (
    config?.blocks?.blocksConfig?.nextCloudVideo?.subtitlesLanguages &&
    config?.settings?.eea?.languages?.length > 0
  )
    config.blocks.blocksConfig.nextCloudVideo.subtitlesLanguages =
      config.settings.eea.languages.map((el) => [el.code, el.name]);

  // Enable Title block
  config.blocks.blocksConfig.title.restricted = false;

  // Enable description block (also for cypress)
  config.blocks.blocksConfig.description.restricted = false;
  config.blocks.requiredBlocks = [];

  // Date format for EU
  config.settings.dateLocale = 'en-gb';

  // Custom Homepage layouts
  config.views.layoutViews = {
    ...(config.views.layoutViews || {}),
    homepage_view: HomePageView,
    homepage_inverse_view: HomePageInverseView,
  };
  config.views.layoutViewsNamesMapping = {
    ...(config.views.layoutViewsNamesMapping || {}),
    homepage_view: 'Homepage view',
    homepage_inverse_view: 'Homepage white view',
  };
  config.views.errorViews = {
    ...config.views.errorViews,
    404: NotFound,
  };
  // Apply slate text block customization
  if (config.blocks.blocksConfig.slate) {
    config.blocks.blocksConfig.slate.tocEntry = (block = {}) => {
      const { value, override_toc, entry_text, level } = block;
      const plaintext =
        serializeNodesToText(block.value || []) || block.plaintext;
      const type = value?.[0]?.type;
      return override_toc && level
        ? [parseInt(level.slice(1)), entry_text]
        : config.settings.slate.topLevelTargetElements.includes(type)
        ? [parseInt(type.slice(1)), plaintext]
        : null;
    };
  }
  // Apply accordion block customization
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.titleIcons = {
      closed: {
        leftPosition: 'ri-arrow-down-s-line',
        rightPosition: 'ri-arrow-down-s-line',
      },
      opened: {
        leftPosition: 'ri-arrow-up-s-line',
        rightPosition: 'ri-arrow-up-s-line',
      },
      unfiltered: {
        leftPosition: 'ri-filter-3-line',
        rightPosition: 'ri-filter-3-line',
      },
      filtered: {
        leftPosition: 'ri-close-line',
        rightPosition: 'ri-close-line',
      },
      iconComponent: 'SemanticIcon',
    };

    config.blocks.blocksConfig.accordion.options = {};
    config.blocks.blocksConfig.accordion.defaults.theme = 'secondary';
  }

  // Apply tabs block customization
  if (config.blocks.blocksConfig.tabs_block) {
    const tabs_block_variations =
      config.blocks.blocksConfig.tabs_block.variations;
    tabVariationCustomization(tabs_block_variations, config);
  }
  //Group block flex variation
  if (config.blocks.blocksConfig.group) {
    config.blocks.blocksConfig.group.variations = [
      ...(config.blocks.blocksConfig.group.variations || []),
      {
        id: 'flex group',
        isDefault: false,
        title: 'Flex Group',
        template: FlexGroup,
        schemaEnhancer: ({ schema, formData, intl }) => {
          schema.fieldsets[0].fields.push('no_of_columns');
          schema.properties.no_of_columns = {
            title: 'No. of columns',
            description: 'Choose the number of flex columns',
            choices: [
              [2, 2],
              [3, 3],
              [4, 4],
              [5, 5],
            ],
          };
          return schema;
        },
      },
    ];
  }

  // Apply columns block customization
  if (config.blocks.blocksConfig.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.available_colors = eea.colors;
    config.blocks.blocksConfig.columnsBlock.tocEntries = (
      tocData,
      block = {},
    ) => {
      // integration with volto-block-toc
      const headlines = tocData.levels || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      let entries = [];
      const sorted_column_blocks = getBlocks(block?.data || {});
      sorted_column_blocks.forEach((column_block) => {
        const sorted_blocks = getBlocks(column_block[1]);
        sorted_blocks.forEach((block) => {
          const { value, plaintext } = block[1];
          const type = value?.[0]?.type;
          if (headlines.includes(type)) {
            entries.push([parseInt(type.slice(1)), plaintext, block[0]]);
          }
        });
      });
      return entries;
    };
  }

  // Description block custom CSS
  config.blocks.blocksConfig.description.className =
    'documentDescription eea callout';

  // Hero block copyright prefix
  if (config.blocks.blocksConfig.hero) {
    config.blocks.blocksConfig.hero.copyrightPrefix = 'Image';
  }

  // Custom Widgets
  config.widgets.views.id.topics = TopicsWidget;
  config.widgets.views.id.subjects = TokenWidget;
  config.widgets.views.widget.tags = TokenWidget;

  // /voltoCustom.css express-middleware
  // /ok express-middleware - see also: https://github.com/plone/volto/pull/4432
  if (__SERVER__) {
    const express = require('express');
    config.settings.expressMiddleware = [
      ...(config.settings.expressMiddleware || []),
      voltoCustomMiddleware(express),
      okMiddleware(express),
    ];
  }

  // InPage navigation, Custom CSS voltoCustom.css and Draft Background
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '/**',
      component: InpageNavigation,
    },
    {
      match: '',
      component: CustomCSS,
    },
    {
      match: '',
      component: DraftBackground,
    },
    {
      match: '',
      component: SubsiteClass,
    },
    {
      match: '',
      component: BaseTag,
    },
  ];

  // Install slate
  config = installSlate(config);

  // Custom block-style colors
  config.settings.available_colors = eea.colors;

  // hide language dropdown by default
  config.settings.hasLanguageDropdown = false;

  // Site theme colors
  config.settings.themeColors = [
    { value: undefined, title: 'No theme' },
    { value: 'primary', title: 'Primary' },
    { value: 'secondary', title: 'Secondary' },
    { value: 'tertiary', title: 'Tertiary' },
  ];

  // Custom preset styles - content-box
  config.settings.previewText = '';
  config.settings.pluggableStyles = [
    ...(config.settings.pluggableStyles || []),
    {
      id: 'content-box-gray',
      title: 'Default',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="default" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: 'content-box-primary',
      title: 'Primary',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="primary" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box primary">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: 'content-box-secondary',
      title: 'Secondary',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="secondary" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box secondary">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: 'content-box-tertiary',
      title: 'Tertiary',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="tertiary" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box tertiary">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
  ];

  // mega menu layout settings
  config.settings.menuItemsLayouts = {
    '/en/topics': {
      menuItemChildrenListColumns: [1, 4],
      menuItemColumns: [
        'at-a-glance three wide column',
        'topics-right-column nine wide column',
      ],
      hideChildrenFromNavigation: false,
    },
    '/en/countries': {
      menuItemColumns: ['eight wide column', 'four wide column'],
      menuItemChildrenListColumns: [5, 2],
      appendExtraMenuItemsToLastColumn: true,
      hideChildrenFromNavigation: false,
    },
    '/en/about': {
      hideChildrenFromNavigation: false,
    },
    // if you want to set default settings for all menu items that don't have a specific path
    // '*': {
    //   hideChildrenFromNavigation: false,
    // },
  };

  // layout settings
  config = [installLayoutSettingsBlock].reduce(
    (acc, apply) => apply(acc),
    config,
  );

  // Group
  if (config.blocks.blocksConfig.group) {
    config.blocks.blocksConfig.group.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
  }

  // Columns
  if (config.blocks.blocksConfig.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.mostUsed = true;
    config.blocks.blocksConfig.columnsBlock.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
  }

  // Listing
  if (config.blocks.blocksConfig.listing) {
    config.blocks.blocksConfig.listing.title = 'Listing (Content)';
    config.blocks.blocksConfig.listing.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
  }

  // Block chooser
  config.blocks.blocksConfig.image.mostUsed = false;
  config.blocks.blocksConfig.video.mostUsed = false;

  // Divider
  if (config.blocks.blocksConfig.dividerBlock) {
    config.blocks.blocksConfig.dividerBlock.mostUsed = true;
  }

  // Call to Action
  if (config.blocks.blocksConfig.callToActionBlock) {
    config.blocks.blocksConfig.callToActionBlock.mostUsed = true;
  }

  // Accordion
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.mostUsed = true;
  }

  // Teaser block changes
  if (config.blocks.blocksConfig.teaser) {
    // Use volto-eea-design-system Tag component for rendering teaser tags
    config.blocks.blocksConfig.teaser.renderTag = (tag, index) => {
      return (
        <Tag
          href={`https://www.eea.europa.eu/en/advanced-search?filters[0][field]=topic&filters[0][values][0]=${tag}&filters[0][type]=any&filters[1][field]=language&filters[1][type]=any&filters[1][values][0]=en&filters[2][field]=issued.date&filters[2][values][0]=Last 5 years&filters[2][type]=any&sort-field=issued.date&sort-direction=desc`}
          key={index}
          aria-label={`Search for content tagged with ${tag}`}
        >
          {tag}
        </Tag>
      );
    };
  }

  // addonReducers
  config.addonReducers = {
    ...(config.addonReducers || {}),
    print,
  };

  // Breadcrumbs
  config.settings.apiExpanders.push({
    match: '',
    GET_CONTENT: ['breadcrumbs'], // 'navigation', 'actions', 'types'],
  });

  // Custom blocks: Title
  return [installCustomTitle].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
