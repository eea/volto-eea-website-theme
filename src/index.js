import * as eea from './config';
import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';
import installCustomTitle from '@eeacms/volto-eea-website-theme/components/manage/Blocks/Title';
import installLayoutSettingsBlock from '@eeacms/volto-eea-website-theme/components/manage/Blocks/LayoutSettings';
import { addStylingFieldsetSchemaEnhancer } from '@eeacms/volto-eea-website-theme/helpers/schema-utils';
import CustomCSS from '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS';
import NotFound from '@eeacms/volto-eea-website-theme/components/theme/NotFound/NotFound';
import DraftBackground from '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground';
import { TokenWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget';
import { ThemesWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/ThemesWidget';
import SubsiteClass from './components/theme/SubsiteClass';
import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';
import { Icon } from '@plone/volto/components';
import contentBoxSVG from './icons/content-box.svg';
import voltoCustomMiddleware from './middleware/voltoCustom';
import okMiddleware from './middleware/ok';
import installSlate from './slate';

const restrictedBlocks = [
  '__grid', // Grid/Teaser block (kitconcept)
  'imagesGrid',
  'teaser',
];

const applyConfig = (config) => {
  // EEA specific settings
  config.settings.eea = {
    ...eea,
    ...(config.settings.eea || {}),
  };

  // #160689 Redirect contact-form to contact-us
  config.settings.contactForm = '/contact';

  // Insert scripts on Error pages
  if (config.settings?.serverConfig?.extractScripts) {
    config.settings.serverConfig.extractScripts.errorPages = true;
  }

  // Disable tags on View
  config.settings.showTags = false;

  // Disable some blocks
  restrictedBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].restricted = true;
    }
  });
  // Set Languages in nextcloud-video-block
  if (
    config?.blocks?.blocksConfig?.nextCloudVideo?.subtitlesLanguages &&
    config?.settings?.eea?.languages?.length > 0
  )
    config.blocks.blocksConfig.nextCloudVideo.subtitlesLanguages = config.settings.eea.languages.map(
      (el) => [el.code, el.name],
    );

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
    '404': NotFound,
  };
  // Apply accordion block customization
  if (config.blocks.blocksConfig.accordion) {
    config.blocks.blocksConfig.accordion.semanticIcon = 'ri-arrow-down-s-line';
    config.blocks.blocksConfig.accordion.options = {};
    config.blocks.blocksConfig.accordion.defaults.theme = 'secondary';
  }

  // Apply tabs block customization
  if (config.blocks.blocksConfig.tabs_block) {
    if (config.blocks.blocksConfig.tabs_block.templates.accordion) {
      config.blocks.blocksConfig.tabs_block.templates.accordion.semanticIcon = {
        opened: 'ri-arrow-up-s-line',
        closed: 'ri-arrow-down-s-line',
      };
    }
  }

  // Apply columns block customization
  if (config.blocks.blocksConfig.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.available_colors = eea.colors;
  }

  // Description block custom CSS
  config.blocks.blocksConfig.description.className =
    'documentDescription eea callout';

  // Hero block copyright prefix
  if (config.blocks.blocksConfig.hero) {
    config.blocks.blocksConfig.hero.copyrightPrefix = 'Image';
  }

  // Custom Widgets
  config.widgets.views.id.taxonomy_themes = ThemesWidget;
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
  ];

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
  config.settings.megaMenuLayouts = {
    '/en/topics': {
      childrenColumns: [1, 4],
      columnsWidth: ['at-a-glance three wide', 'topics-right-column nine wide'],
      hideChildrenFromNavigation: false,
      itemsEquallySpread: true,
    },
    '/en/countries': {
      childrenColumns: [5, 2],
      columnsWidth: ['eight wide', 'four wide'],
      hideChildrenFromNavigation: false,
      itemsEquallySpread: false,
    },
    '/en/about': {
      equallySpreadColumns: ['four column'],
      hideChildrenFromNavigation: false,
    },
  };

  // layout settings
  config = [installLayoutSettingsBlock].reduce(
    (acc, apply) => apply(acc),
    config,
  );

  // Group
  if (config.blocks.blocksConfig.group) {
    config.blocks.blocksConfig.group.schemaEnhancer = addStylingFieldsetSchemaEnhancer;
  }

  // Columns
  if (config.blocks.blocksConfig.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.mostUsed = true;
    config.blocks.blocksConfig.columnsBlock.schemaEnhancer = addStylingFieldsetSchemaEnhancer;
  }

  // Listing
  if (config.blocks.blocksConfig.listing) {
    config.blocks.blocksConfig.listing.title = 'Listing (Content)';
    config.blocks.blocksConfig.listing.schemaEnhancer = addStylingFieldsetSchemaEnhancer;
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

  // Breadcrumbs
  config.settings.apiExpanders.push({
    match: '',
    GET_CONTENT: ['breadcrumbs'], // 'navigation', 'actions', 'types'],
  });

  // Custom blocks: Title
  return [installCustomTitle].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
