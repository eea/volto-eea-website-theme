import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import BaseTag from './BaseTag';

const mockStore = configureStore();

jest.mock('@plone/volto/helpers', () => ({
  flattenToAppURL: jest.fn((url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }
    return url;
  }),
  Helmet: ({ base }) => (
    <div
      data-testid="helmet-base"
      data-target={base?.target}
      data-href={base?.href}
    />
  ),
}));

describe('BaseTag Component', () => {
  it('renders Helmet with base tag when content ID exists', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@id': 'http://localhost:3000/my-page',
        },
      },
    });

    render(
      <Provider store={store}>
        <BaseTag />
      </Provider>,
    );

    const helmetBase = screen.getByTestId('helmet-base');
    expect(helmetBase).toBeTruthy();
    expect(helmetBase.getAttribute('data-target')).toBe('_self');
    expect(helmetBase.getAttribute('data-href')).toBe('/my-page/');
  });

  it('returns null when content ID does not exist', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {},
      },
    });

    const { container } = render(
      <Provider store={store}>
        <BaseTag />
      </Provider>,
    );

    expect(screen.queryByTestId('helmet-base')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('returns null when content data is null', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <BaseTag />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when content is undefined', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: undefined,
    });

    const { container } = render(
      <Provider store={store}>
        <BaseTag />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles root path content ID', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@id': 'http://localhost:3000/',
        },
      },
    });

    render(
      <Provider store={store}>
        <BaseTag />
      </Provider>,
    );

    const helmetBase = screen.getByTestId('helmet-base');
    expect(helmetBase.getAttribute('data-href')).toBe('//');
  });

  it('handles nested path content ID', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@id': 'http://localhost:3000/folder/subfolder/page',
        },
      },
    });

    render(
      <Provider store={store}>
        <BaseTag />
      </Provider>,
    );

    const helmetBase = screen.getByTestId('helmet-base');
    expect(helmetBase.getAttribute('data-href')).toBe(
      '/folder/subfolder/page/',
    );
  });

  it('handles content ID without protocol', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        data: {
          '@id': '/simple-path',
        },
      },
    });

    render(
      <Provider store={store}>
        <BaseTag />
      </Provider>,
    );

    const helmetBase = screen.getByTestId('helmet-base');
    expect(helmetBase.getAttribute('data-href')).toBe('/simple-path/');
  });
});
