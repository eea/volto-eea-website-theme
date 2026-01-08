import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import EEALogo from './Logo';

// Create a mutable mock config object
let mockConfig = {
  settings: {
    isMultilingual: false,
    defaultLanguage: 'en',
    eea: {},
  },
};

// Mock the config with a getter so it always returns the current mockConfig
jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  get default() {
    return mockConfig;
  },
}));

const mockStore = configureStore();
let history = createMemoryHistory();

describe('EEALogo Component', () => {
  beforeEach(() => {
    // Reset config to defaults before each test
    mockConfig.settings = {
      isMultilingual: false,
      defaultLanguage: 'en',
      eea: {},
    };
  });

  it('renders without crashing', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      router: {
        location: {
          pathname: '/en/about',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });

  it('uses logoTargetUrl when explicitly set in multilingual site', () => {
    mockConfig.settings.isMultilingual = true;
    mockConfig.settings.eea = {
      logoTargetUrl: '/en',
    };

    const store = mockStore({
      intl: {
        locale: 'fr',
        messages: {},
      },
      router: {
        location: {
          pathname: '/fr/about',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/en');
  });

  it('uses current language when logoTargetUrl not set in multilingual site', () => {
    mockConfig.settings.isMultilingual = true;
    mockConfig.settings.eea = {};

    const store = mockStore({
      intl: {
        locale: 'fr',
        messages: {},
      },
      router: {
        location: {
          pathname: '/fr/about',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/fr');
  });

  it('uses logoTargetUrl in non-multilingual site', () => {
    mockConfig.settings.isMultilingual = false;
    mockConfig.settings.eea = {
      logoTargetUrl: '/custom',
    };

    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      router: {
        location: {
          pathname: '/about',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/custom');
  });

  it('uses root path as fallback in non-multilingual site without logoTargetUrl', () => {
    mockConfig.settings.isMultilingual = false;
    mockConfig.settings.eea = {};

    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      router: {
        location: {
          pathname: '/about',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/');
  });

  it('extracts language from pathname correctly', () => {
    mockConfig.settings.isMultilingual = true;
    mockConfig.settings.eea = {};

    const store = mockStore({
      intl: {
        locale: 'de',
        messages: {},
      },
      router: {
        location: {
          pathname: '/de/topics/air/intro',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/de');
  });

  it('falls back to default language when pathname has no language code', () => {
    mockConfig.settings.isMultilingual = true;
    mockConfig.settings.defaultLanguage = 'en';
    mockConfig.settings.eea = {};

    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      router: {
        location: {
          pathname: '/about',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/en');
  });

  it('prioritizes logoTargetUrl over current language in multilingual site', () => {
    mockConfig.settings.isMultilingual = true;
    mockConfig.settings.eea = {
      logoTargetUrl: '/en',
    };

    const store = mockStore({
      intl: {
        locale: 'de',
        messages: {},
      },
      router: {
        location: {
          pathname: '/de/environment/topics',
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <EEALogo />
        </Router>
      </Provider>,
    );

    const link = container.querySelector('a');
    // Should link to /en, not /de
    expect(link.getAttribute('href')).toBe('/en');
  });
});
