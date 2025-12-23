import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const mockStore = configureStore();

// Mock volto-subsites/utils
const mockIsSubsiteRoot = jest.fn();
jest.mock('volto-subsites/utils', () => ({
  isSubsiteRoot: (...args) => mockIsSubsiteRoot(...args),
}));

jest.mock('@plone/volto/helpers', () => ({
  BodyClass: ({ className }) => (
    <div data-testid="body-class" data-classname={className} />
  ),
}));

// eslint-disable-next-line import/first
import SubsiteClass from './SubsiteClass';

describe('SubsiteClass Component', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
    mockIsSubsiteRoot.mockReset();
    mockIsSubsiteRoot.mockReturnValue(false);
  });

  it('renders BodyClass with subsite class', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@components': {
            subsite: {},
          },
        },
      },
    });

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass).toBeTruthy();
    expect(bodyClass.getAttribute('data-classname')).toContain('subsite');
  });

  it('adds subsite-root class when on subsite root', () => {
    mockIsSubsiteRoot.mockReturnValue(true);

    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@components': {
            subsite: {
              '@id': '/my-subsite',
            },
          },
        },
      },
    });

    history.push('/my-subsite');

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass.getAttribute('data-classname')).toContain('subsite-root');
  });

  it('does not add subsite-root class when not on subsite root', () => {
    mockIsSubsiteRoot.mockReturnValue(false);

    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@components': {
            subsite: {
              '@id': '/my-subsite',
            },
          },
        },
      },
    });

    history.push('/my-subsite/page');

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass.getAttribute('data-classname')).not.toContain(
      'subsite-root',
    );
  });

  it('adds subsite CSS class when token is present', () => {
    mockIsSubsiteRoot.mockReturnValue(false);

    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@components': {
            subsite: {
              '@id': '/my-subsite',
              subsite_css_class: {
                token: 'blue-theme',
              },
            },
          },
        },
      },
    });

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass.getAttribute('data-classname')).toContain(
      'subsite-blue-theme',
    );
  });

  it('handles missing subsite component gracefully', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@components': {},
        },
      },
    });

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass).toBeTruthy();
    expect(bodyClass.getAttribute('data-classname')).toContain('subsite');
  });

  it('handles missing @components gracefully', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {},
      },
    });

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass).toBeTruthy();
  });

  it('handles null content data', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: null,
      },
    });

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass).toBeTruthy();
  });

  it('handles undefined subsite_css_class token', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@components': {
            subsite: {
              subsite_css_class: {},
            },
          },
        },
      },
    });

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass.getAttribute('data-classname')).not.toContain(
      'subsite-undefined',
    );
  });

  it('combines subsite-root and CSS class when both apply', () => {
    mockIsSubsiteRoot.mockReturnValue(true);

    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@components': {
            subsite: {
              '@id': '/themed-subsite',
              subsite_css_class: {
                token: 'green-theme',
              },
            },
          },
        },
      },
    });

    history.push('/themed-subsite');

    render(
      <Provider store={store}>
        <Router history={history}>
          <SubsiteClass />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    const className = bodyClass.getAttribute('data-classname');
    expect(className).toContain('subsite');
    expect(className).toContain('subsite-root');
    expect(className).toContain('subsite-green-theme');
  });
});
