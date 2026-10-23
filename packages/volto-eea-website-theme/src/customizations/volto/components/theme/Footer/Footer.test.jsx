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

const renderFooter = (subsitePath) => {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
    actions: {
      actions: {
        footer_actions: [
          { id: 'privacy', title: 'Privacy', url: '/en/privacy' },
        ],
      },
    },
    content: {
      data: {
        '@components': {
          subsite: {
            '@type': 'Subsite',
            '@id': `http://localhost:3000${subsitePath}`,
          },
        },
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
        managedBy: [
          {
            url: 'https://www.eea.europa.eu/',
            src: 'eea.svg',
            alt: 'EEA Logo',
            columnSize: { mobile: 6, tablet: 12, computer: 4 },
          },
        ],
      },
      subsiteHideFooterBrandingPaths: [/^\/[a-z]{2}\/epanet$/],
    };
  });

  it('shows the EEA branding outside the hardcoded subsite', () => {
    const { getByAltText, getByText } = renderFooter('/en/other');

    expect(getByAltText('EEA Logo')).toBeInTheDocument();
    expect(
      getByText('Explore our environmental information systems'),
    ).toBeInTheDocument();
    expect(getByText('Privacy')).toBeInTheDocument();
  });

  it('hides the EEA branding on /en/epanet', () => {
    const { queryByAltText, queryByText, getByText } =
      renderFooter('/en/epanet');

    expect(queryByAltText('EEA Logo')).toBeNull();
    expect(
      queryByText('Explore our environmental information systems'),
    ).toBeNull();
    expect(getByText('Privacy')).toBeInTheDocument();
  });
});
