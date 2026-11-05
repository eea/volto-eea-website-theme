import React from 'react';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import config from '@plone/volto/registry';

import ContentMetadataTags from './ContentMetadataTags';

const mockStore = configureStore();

const renderTitle = (content, { navroot = 'Navroot', site = 'EEA' } = {}) => {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
    router: { location: { pathname: '/page' } },
    navroot: { data: { navroot: { title: navroot } } },
    site: { data: { 'plone.site_title': site } },
  });
  render(
    <Provider store={store}>
      <ContentMetadataTags
        content={{ '@id': 'http://localhost:8080/Plone/page', ...content }}
      />
    </Provider>,
  );
  return Helmet.peek().title;
};

describe('ContentMetadataTags', () => {
  let settings;

  beforeEach(() => {
    settings = config.settings;
    config.settings = {
      ...config.settings,
      siteTitleFormat: { includeSiteTitle: true },
      titleAndSiteTitleSeparator: '|',
    };
  });

  afterEach(() => {
    config.settings = settings;
  });

  it('builds the title from page, parent, navroot and site titles', () => {
    expect(renderTitle({ title: 'Page', parent: { title: 'Parent' } })).toBe(
      'Page | Parent | Navroot EEA',
    );
  });

  it('does not repeat the navroot when it is the parent', () => {
    expect(renderTitle({ title: 'Page', parent: { title: 'Navroot' } })).toBe(
      'Page | Navroot EEA',
    );
  });

  it('skips the parent on the navroot itself', () => {
    expect(renderTitle({ title: 'Navroot', parent: { title: 'EEA' } })).toBe(
      'Navroot EEA',
    );
  });

  it('does not repeat the site title when it is the navroot', () => {
    expect(
      renderTitle(
        { title: 'Page', parent: { title: 'Parent' } },
        { navroot: 'EEA' },
      ),
    ).toBe('Page | Parent | EEA');
  });

  it('uses the SEO title as the first part and strips soft hyphens', () => {
    expect(
      renderTitle({
        title: 'Page',
        seo_title: 'SEO­title',
        parent: { title: 'Parent' },
      }),
    ).toBe('SEOtitle | Parent | Navroot EEA');
  });

  it('returns the page title alone on the site root', () => {
    expect(renderTitle({ title: 'EEA' }, { navroot: 'EEA' })).toBe('EEA');
  });

  it('returns the page title alone when includeSiteTitle is off', () => {
    config.settings.siteTitleFormat = { includeSiteTitle: false };
    expect(renderTitle({ title: 'Page', parent: { title: 'Parent' } })).toBe(
      'Page',
    );
  });
});
