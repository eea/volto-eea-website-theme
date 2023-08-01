import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-intl-redux';
import config from '@plone/volto/registry';

import Header from './Header';

const mockStore = configureStore();
let history = createMemoryHistory();

describe('Header', () => {
  it('renders a header component', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: ['en'],
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
        headerOpts: undefined,
      },
    };

    const component = renderer.create(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/home" />
        </Router>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a header component', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: ['en'],
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
        headerOpts: {},
      },
    };

    const component = renderer.create(
      <Provider store={store}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a header component', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: undefined,
        messages: {},
      },
      navigation: {
        items: ['en'],
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
    fireEvent.keyDown(container.querySelector('.content'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('.content a'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('a[href="/link1"]'), {
      keyCode: 37,
    });
    fireEvent.click(container.querySelector('.country-code'));

    // expect(getByText('da')).toBeInTheDocument();

    rerender(
      <Provider store={{ ...store, userSession: { token: '1234' } }}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );
  });

  it('renders a header component', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: undefined,
        messages: {},
      },
      navigation: {
        items: ['en'],
      },
      content: {
        data: {
          layout: 'homepage_view',
          '@components': {
            subsite: {
              '@type': 'Subsite',
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
    fireEvent.keyDown(container.querySelector('.content'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('.content a'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('a[href="/link1"]'), {
      keyCode: 37,
    });
    fireEvent.click(container.querySelector('.country-code'));

    // expect(getByText('da')).toBeInTheDocument();

    rerender(
      <Provider store={{ ...store, userSession: { token: '1234' } }}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );
  });

  it('renders a header component', () => {
    const store = mockStore({
      userSession: { token: null },
      intl: {
        locale: undefined,
        messages: {},
      },
      navigation: {
        items: [
          { url: '/test1', title: 'test 1', nav_title: 'Test 1', items: [] },
          { url: undefined, title: 'test 2', items: [] },
        ],
      },
      content: {
        data: {
          layout: 'homepage_view',
          '@components': {
            subsite: {
              '@type': 'Subsite',
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
    fireEvent.keyDown(container.querySelector('.content'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('.content a'), { keyCode: 37 });
    fireEvent.keyDown(container.querySelector('a[href="/link1"]'), {
      keyCode: 37,
    });
    fireEvent.click(container.querySelector('.country-code'));
    fireEvent.click(container.querySelector('a[href="/test1"]'));

    // expect(getByText('da')).toBeInTheDocument();

    rerender(
      <Provider store={{ ...store, userSession: { token: '1234' } }}>
        <Router history={history}>
          <Header pathname="/blog" />
        </Router>
      </Provider>,
    );
  });
});
