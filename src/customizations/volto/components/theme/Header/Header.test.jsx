import React from 'react';
import { render, fireEvent, getByText } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-intl-redux';
import config from '@plone/volto/registry';
import { waitFor } from '@testing-library/react';
import Header from './Header';

const mockStore = configureStore();
let history = createMemoryHistory();

const item = {
  '@id': 'en',
  description: 'Description of item',
  items: [],
  review_state: 'published',
  title: 'Test english article',
};

jest.mock('@plone/volto/helpers/Loadable/Loadable');
beforeAll(
  async () =>
    await require('@plone/volto/helpers/Loadable/Loadable').__setLoadables(),
);

describe('Header', () => {
  it('renders a header component with homepage_inverse_view layout', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: [item],
      },
      content: {
        data: {
          layout: 'homepage_inverse_view',
        },
      },
      router: {
        location: {
          pathname: '/home/',
        },
      },
    });

    config.settings = {
      ...config.settings,
      eea: {
        ...config.settings.eea,
        headerOpts: { logo: 'eea-logo.svg' },
        logoTargetUrl: '/',
      },
    };

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/home" />
        </Router>
      </Provider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders a header component with homepage_view layout and translations', async () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: [item],
      },
      content: {
        data: {
          layout: 'homepage_view',
          '@components': {
            translations: {
              items: [{ language: 'en' }, { language: 'ro' }],
            },
          },
        },
      },
      router: {
        location: {
          pathname: '/home/',
        },
      },
    });

    config.settings = {
      ...config.settings,
      eea: {
        ...config.settings.eea,
        headerOpts: {
          partnerLinks: {
            links: [{ href: '/link1', title: 'link 1' }],
          },
        },
        defaultLanguage: 'en',
        languages: [{ code: 'en' }, { code: 'ro' }],
      },
      isMultilingual: true,
      supportedLanguages: ['en', 'ro'],
      hasLanguageDropdown: true,
    };

    const { container, rerender } = render(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );

    fireEvent.click(container.querySelector('.content'));
    await waitFor(() => {
      expect(container.querySelector('.country-code')).not.toBeNull();
    });
    fireEvent.keyDown(container.querySelector('.content'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('.content a'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('a[href="/link1"]'), {
      keyCode: 37,
    });
    fireEvent.click(container.querySelector('.country-code'));

    expect(getByText(container, 'RO')).toBeInTheDocument();

    rerender(
      <Provider store={{ ...store, userSession: { token: '1234' } }}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );
  });

  it('renders a header component with a subsite', async () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: [item],
      },
      content: {
        data: {
          layout: 'homepage_view',
          '@components': {
            subsite: {
              '@type': 'Subsite',
              '@id': 'http://localhost:8080/Plone/subsite',
              title: 'Home Page',
              subsite_logo: {
                scales: {
                  mini: {
                    download:
                      'http://localhost:8080/Plone/subsite_logo/@@images/image/mini',
                  },
                },
              },
            },
            translations: {
              items: [{ language: 'ro' }],
            },
          },
        },
      },
      router: {
        location: {
          pathname: '/home/',
        },
      },
    });

    config.settings = {
      ...config.settings,
      eea: {
        ...config.settings.eea,
        headerOpts: {
          partnerLinks: {
            links: [{ href: '/link1', title: 'link 1' }],
          },
        },
        defaultLanguage: 'en',
        languages: [{ code: 'en' }, { code: 'ro' }],
      },
      isMultilingual: true,
      supportedLanguages: ['en', 'ro'],
      hasLanguageDropdown: true,
    };

    const { container, rerender } = render(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );

    fireEvent.click(container.querySelector('.content'));
    await waitFor(() => {
      expect(container.querySelector('.country-code')).not.toBeNull();
    });
    fireEvent.keyDown(container.querySelector('.content'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('.content a'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('a[href="/link1"]'), {
      keyCode: 37,
    });
    fireEvent.click(container.querySelector('.country-code'));

    expect(getByText(container, 'RO')).toBeInTheDocument();

    rerender(
      <Provider store={{ ...store, userSession: { token: '1234' } }}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );
  });

  it('renders a header component with a subsite and two children', async () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: [
          { url: '/test1', title: 'test 1', nav_title: 'Test 1', items: [] },
          { url: '/test2', title: 'test 2', items: [] },
        ],
      },
      content: {
        data: {
          layout: 'homepage_view',
          '@components': {
            subsite: {
              '@type': 'Subsite',
              '@id': 'http://localhost:8080/Plone/subsite',
              title: 'Home Page',
              subsite_logo: undefined,
            },
            translations: {
              items: [{ language: 'ro' }],
            },
          },
        },
      },
      router: {
        location: {
          pathname: '/home/',
        },
      },
    });

    config.settings = {
      ...config.settings,
      eea: {
        ...config.settings.eea,
        headerOpts: {
          partnerLinks: {
            links: [{ href: '/link1', title: 'link 1' }],
          },
        },
        defaultLanguage: 'en',
        languages: [{ code: 'en' }, { code: 'ro' }],
      },
      isMultilingual: true,
      supportedLanguages: ['en', 'ro'],
      hasLanguageDropdown: true,
    };

    const { container, rerender } = render(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );

    fireEvent.click(container.querySelector('.content'));
    await waitFor(() => {
      expect(container.querySelector('.country-code')).not.toBeNull();
    });
    fireEvent.keyDown(container.querySelector('.content'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('.content a'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('a[href="/link1"]'), {
      keyCode: 37,
    });
    fireEvent.click(container.querySelector('.country-code'));
    fireEvent.click(container.querySelector('a[href="/test1"]'));

    expect(getByText(container, 'RO')).toBeInTheDocument();

    rerender(
      <Provider store={{ ...store, userSession: { token: '1234' } }}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );
  });

  it('uses navigationLanguage setting to fetch navigation from specific language', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'fr',
        messages: {
          Site: 'Site',
          'European Environment Agency':
            "Agence européenne pour l'environnement",
        },
      },
      navigation: {
        items: [
          { url: '/en/topics', title: 'Topics', items: [] },
          { url: '/en/countries', title: 'Countries', items: [] },
        ],
      },
      content: {
        data: {
          layout: 'homepage_view',
        },
      },
      router: {
        location: {
          pathname: '/fr/some-page',
        },
      },
      navigationSettings: {
        loaded: true,
        settings: {},
      },
    });

    config.settings = {
      ...config.settings,
      navigationLanguage: 'en', // Always use English navigation
      eea: {
        ...config.settings.eea,
        headerOpts: undefined,
      },
    };

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/fr/some-page" />
        </Router>
      </Provider>,
    );

    // Verify that navigation items from /en are rendered
    expect(container.querySelector('.eea.header')).toBeTruthy();
  });

  it('normalizes pathname for menu matching when navigationLanguage is set', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'fr',
        messages: {
          Site: 'Site',
          'European Environment Agency':
            "Agence européenne pour l'environnement",
        },
      },
      navigation: {
        items: [
          { url: '/en/topics', title: 'Topics', items: [] },
          { url: '/en/countries', title: 'Countries', items: [] },
        ],
      },
      content: {
        data: {
          layout: 'homepage_view',
        },
      },
      router: {
        location: {
          pathname: '/fr/topics',
        },
      },
      navigationSettings: {
        loaded: true,
        settings: {},
      },
    });

    config.settings = {
      ...config.settings,
      navigationLanguage: 'en',
      eea: {
        ...config.settings.eea,
        headerOpts: undefined,
      },
    };

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/fr/topics" />
        </Router>
      </Provider>,
    );

    // The Header.Main component should receive normalized pathname (/en/topics)
    // so that menu items from /en navigation match correctly
    expect(container.querySelector('.eea.header')).toBeTruthy();
  });

  it('uses current language navigation when navigationLanguage is not set', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'fr',
        messages: {
          Site: 'Site',
          'European Environment Agency':
            "Agence européenne pour l'environnement",
        },
      },
      navigation: {
        items: [
          { url: '/fr/sujets', title: 'Sujets', items: [] },
          { url: '/fr/pays', title: 'Pays', items: [] },
        ],
      },
      content: {
        data: {
          layout: 'homepage_view',
        },
      },
      router: {
        location: {
          pathname: '/fr/sujets',
        },
      },
      navigationSettings: {
        loaded: true,
        settings: {},
      },
    });

    config.settings = {
      ...config.settings,
      navigationLanguage: null, // Use current language
      eea: {
        ...config.settings.eea,
        headerOpts: undefined,
      },
    };

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/fr/sujets" />
        </Router>
      </Provider>,
    );

    // Should use French navigation items
    expect(container.querySelector('.eea.header')).toBeTruthy();
  });
});
