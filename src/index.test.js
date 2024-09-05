import applyConfig from './index';
import * as eea from './config';
import BaseTag from './components/theme/BaseTag';

jest.mock(
  '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation',
  () => 'MockedInpageNavigation',
);
jest.mock('@eeacms/volto-eea-website-theme/helpers/schema-utils', () => ({
  addStylingFieldsetSchemaEnhancer: jest.fn(),
}));
jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS',
  () => 'MockedCustomCSS',
);
jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/NotFound/NotFound',
  () => 'MockedNotFound',
);
jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground',
  () => 'MockedDraftBackground',
);
jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget',
  () => ({
    TokenWidget: 'MockedTokenWidget',
  }),
);
jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/Widgets/TopicsWidget',
  () => ({
    TopicsWidget: 'MockedThemesWidget',
  }),
);
jest.mock('./components/theme/SubsiteClass', () => 'MockedSubsiteClass');
jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView',
  () => 'MockedHomePageView',
);
jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView',
  () => 'MockedHomePageInverseView',
);
jest.mock('@plone/volto/components', () => ({
  Icon: 'MockedIcon',
}));

global.__SERVER__ = true;

describe('applyConfig', () => {
  it('should update the config settings with EEA specific settings', () => {
    const originalConfig = {
      addonReducers: {},
      blocks: {
        blocksConfig: {
          title: {
            restricted: undefined,
          },
          description: {
            restricted: undefined,
          },
          image: {},
          video: {},
          teaser: {
            restricted: undefined,
          },
          nextCloudVideo: {
            subtitlesLanguages: [],
          },
          accordion: undefined,
          tabs_block: undefined,
          columnsBlock: undefined,
          hero: undefined,
          group: undefined,
          listing: undefined,
          dividerBlock: undefined,
          callToActionBlock: undefined,
        },
      },
      views: {
        layoutViews: undefined,
        errorViews: {},
      },
      widgets: {
        views: {
          id: {
            taxonomy_themes: undefined,
          },
          widget: {
            tags: undefined,
          },
        },
        widget: {},
        id: {},
        vocabulary: {},
      },
      settings: {
        eea: {
          languages: [{ code: 'en', name: 'English' }],
        },
        contactForm: '',
        serverConfig: undefined,
        showTags: true,
        dateLocale: '',
        available_colors: [],
        expressMiddleware: [],
        appExtras: undefined,

        pluggableStyles: undefined,
        apiExpanders: [],
        hasLanguageDropdown: true,
        themeColors: [],
        previewText: '',
        requiredBlocks: [],
      },
    };
    const config = applyConfig(originalConfig);

    expect(config.settings.contactForm).toBe('/contact');
    expect(config.settings.showTags).toBe(false);
    expect(config.blocks.blocksConfig['teaser'].restricted).toBe(true);
    expect(config.blocks.blocksConfig['title'].restricted).toBe(false);
    expect(config.blocks.blocksConfig['description'].restricted).toBe(false);
    expect(config.settings.dateLocale).toBe('en-gb');
    expect(config.views.layoutViews['homepage_view']).toBe(
      'MockedHomePageView',
    );
    expect(config.views.layoutViews['homepage_inverse_view']).toBe(
      'MockedHomePageInverseView',
    );
    expect(config.views.errorViews['404']).toBe('MockedNotFound');

    expect(config.blocks.blocksConfig['description'].className).toBe(
      'documentDescription eea callout',
    );

    expect(config.widgets.views.id.subjects).toBe('MockedTokenWidget');
    expect(config.settings.expressMiddleware.length).toEqual(2);
    expect(config.settings.appExtras).toEqual([
      { match: '/**', component: 'MockedInpageNavigation' },
      { match: '', component: 'MockedCustomCSS' },
      { match: '', component: 'MockedDraftBackground' },
      { match: '', component: 'MockedSubsiteClass' },
      { match: '', component: BaseTag },
    ]);
    expect(config.settings.available_colors).toEqual(eea.colors);
    expect(config.settings.hasLanguageDropdown).toBe(false);
    expect(config.settings.themeColors).toEqual([
      { value: undefined, title: 'No theme' },
      { value: 'primary', title: 'Primary' },
      { value: 'secondary', title: 'Secondary' },
      { value: 'tertiary', title: 'Tertiary' },
    ]);
    expect(config.settings.pluggableStyles).toEqual([
      {
        id: 'content-box-gray',
        title: 'Default',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
      {
        id: 'content-box-primary',
        title: 'Primary',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
      {
        id: 'content-box-secondary',
        title: 'Secondary',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
      {
        id: 'content-box-tertiary',
        title: 'Tertiary',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
    ]);
    expect(config.blocks.blocksConfig.image.mostUsed).toBe(false);
    expect(config.blocks.blocksConfig.video.mostUsed).toBe(false);
    expect(config.settings.apiExpanders).toEqual([
      { match: '', GET_CONTENT: ['breadcrumbs'] },
    ]);
  });

  it('should update the config settings with EEA specific settings', () => {
    const originalConfig = {
      addonReducers: {},
      blocks: {
        blocksConfig: {
          title: {
            restricted: undefined,
          },
          description: {
            restricted: undefined,
          },
          image: {},
          video: {},
          teaser: {
            restricted: undefined,
          },
          nextCloudVideo: {
            subtitlesLanguages: undefined,
          },
          accordion: {
            defaults: {},
          },
          tabs_block: {
            templates: {
              accordion: {},
            },
            variations: [
              { id: 'default', title: 'Default', isDefault: true },
              {
                id: 'horizontal-responsive',
                title: 'Horizontal',
                isDefault: false,
              },
              {
                id: 'accordion',
                title: 'Accordion responsive',
                isDefault: false,
              },
            ],
          },
          columnsBlock: {},
          hero: {},
          group: {},
          listing: {},
          dividerBlock: {},
          callToActionBlock: {},
        },
      },
      views: {
        layoutViews: {},
        errorViews: {},
      },
      widgets: {
        views: {
          id: {
            taxonomy_themes: undefined,
          },
          widget: {
            tags: undefined,
          },
        },
        widget: {},
        id: {},
        vocabulary: {},
      },
      settings: {
        eea: {},
        contactForm: '',
        serverConfig: {
          extractScripts: {},
        },
        showTags: true,
        dateLocale: '',
        available_colors: [],
        expressMiddleware: [],
        appExtras: [],

        pluggableStyles: [],
        apiExpanders: [],
        hasLanguageDropdown: true,
        themeColors: [],
        previewText: '',
        requiredBlocks: [],
      },
    };
    const config = applyConfig(originalConfig);

    expect(config.settings.eea).toEqual(eea);
    expect(config.settings.contactForm).toBe('/contact');
    expect(config.settings.serverConfig.extractScripts.errorPages).toBe(true);
    expect(config.settings.showTags).toBe(false);
    expect(config.blocks.blocksConfig['teaser'].restricted).toBe(true);
    expect(config.blocks.blocksConfig['title'].restricted).toBe(false);
    expect(config.blocks.blocksConfig['description'].restricted).toBe(false);
    expect(config.settings.dateLocale).toBe('en-gb');
    expect(config.views.layoutViews['homepage_view']).toBe(
      'MockedHomePageView',
    );
    expect(config.views.layoutViews['homepage_inverse_view']).toBe(
      'MockedHomePageInverseView',
    );
    expect(config.views.errorViews['404']).toBe('MockedNotFound');

    expect(config.blocks.blocksConfig['accordion'].options).toEqual({});
    expect(config.blocks.blocksConfig['accordion'].defaults.theme).toBe(
      'secondary',
    );

    expect(config.blocks.blocksConfig['columnsBlock'].available_colors).toEqual(
      eea.colors,
    );
    expect(config.blocks.blocksConfig['description'].className).toBe(
      'documentDescription eea callout',
    );
    expect(config.blocks.blocksConfig['hero'].copyrightPrefix).toBe('Image');

    expect(config.widgets.views.id.subjects).toBe('MockedTokenWidget');
    expect(config.settings.expressMiddleware.length).toEqual(2);
    expect(config.settings.appExtras).toEqual([
      { match: '/**', component: 'MockedInpageNavigation' },
      { match: '', component: 'MockedCustomCSS' },
      { match: '', component: 'MockedDraftBackground' },
      { match: '', component: 'MockedSubsiteClass' },
      { match: '', component: BaseTag },
    ]);
    expect(config.settings.available_colors).toEqual(eea.colors);
    expect(config.settings.hasLanguageDropdown).toBe(false);
    expect(config.settings.themeColors).toEqual([
      { value: undefined, title: 'No theme' },
      { value: 'primary', title: 'Primary' },
      { value: 'secondary', title: 'Secondary' },
      { value: 'tertiary', title: 'Tertiary' },
    ]);
    expect(config.settings.pluggableStyles).toEqual([
      {
        id: 'content-box-gray',
        title: 'Default',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
      {
        id: 'content-box-primary',
        title: 'Primary',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
      {
        id: 'content-box-secondary',
        title: 'Secondary',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
      {
        id: 'content-box-tertiary',
        title: 'Tertiary',
        previewComponent: expect.any(Function),
        viewComponent: expect.any(Function),
      },
    ]);
    expect(config.blocks.blocksConfig.image.mostUsed).toBe(false);
    expect(config.blocks.blocksConfig.video.mostUsed).toBe(false);
    expect(config.blocks.blocksConfig.dividerBlock.mostUsed).toBe(true);
    expect(config.blocks.blocksConfig.callToActionBlock.mostUsed).toBe(true);
    expect(config.blocks.blocksConfig.accordion.mostUsed).toBe(true);
    expect(config.settings.apiExpanders).toEqual([
      { match: '', GET_CONTENT: ['breadcrumbs'] },
    ]);
  });
});
