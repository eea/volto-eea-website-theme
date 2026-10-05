import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import config from '@plone/volto/registry';
import Footer from './Footer';

const mockStore = configureStore();

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const footerActions = [
  { id: 'privacy', title: 'Privacy', url: 'http://localhost:3000/en/privacy' },
  { id: 'login', title: 'CMS Login', url: 'http://localhost:3000/login' },
];

const copyrightActions = [
  { id: 'sitemap', title: 'Sitemap', url: 'http://localhost:3000/en/sitemap' },
  { id: 'copyright', title: '© EEA', url: '/copyright' },
];

const renderFooter = (subsiteId) => {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
    actions: {
      actions: {
        footer_actions: footerActions,
        copyright_actions: copyrightActions,
      },
    },
    content: {
      data: {
        '@components': subsiteId
          ? {
              subsite: {
                '@type': 'Subsite',
                '@id': `http://localhost:3000${subsiteId}`,
                title: 'Subsite',
              },
            }
          : {},
      },
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </Provider>,
  );
};

describe('Footer', () => {
  beforeEach(() => {
    config.settings.eea = {
      ...config.settings.eea,
      footerOpts: {
        buttonName: 'Explore our environmental information systems',
        hrefButton: 'https://www.eea.europa.eu/en/information-systems#',
        header: 'EEA footer header',
      },
      subsiteHideFooterPaths: [/^\/[a-z]{2}\/epanet$/],
    };
  });

  it('renders the full EEA footer outside the hardcoded subsite', () => {
    const { getByText } = renderFooter('/en/other');

    expect(
      getByText('Explore our environmental information systems'),
    ).toBeInTheDocument();
    expect(getByText('Privacy').getAttribute('href')).toBe('/en/privacy');
    expect(getByText('Sitemap').getAttribute('href')).toBe('/en/sitemap');
  });

  it('only keeps the bottom links on /en/epanet', () => {
    const { getByText, queryByText } = renderFooter('/en/epanet');

    expect(
      queryByText('Explore our environmental information systems'),
    ).toBeNull();
    expect(queryByText('EEA footer header')).toBeNull();
    expect(getByText('Privacy').getAttribute('href')).toBe(
      '/en/epanet/privacy',
    );
    expect(queryByText('Sitemap')).toBeNull();
    expect(getByText('CMS Login')).toBeInTheDocument();
    expect(getByText('© EEA')).toBeInTheDocument();
  });
});
