import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UniversalLink from './UniversalLink';
import config from '@plone/volto/registry';

const mockStore = configureStore();
const store = mockStore({
  userSession: {
    token: null,
  },
  intl: {
    locale: 'en',
    messages: {},
  },
});

global.console.error = jest.fn();

describe('UniversalLink', () => {
  beforeEach(() => {
    global.console.error.mockClear();
  });
  it('renders a UniversalLink component with internal link', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink href={'/en/welcome-to-volto'}>
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a UniversalLink component with external link', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink href="https://github.com/plone/volto">
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a UniversalLink component if no external(href) link passed', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink
            item={{
              '@id': 'http://localhost:3000/en/welcome-to-volto',
            }}
          >
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('checks that UniversalLink sets rel attribute for external links', () => {
    const { getByTitle } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink
            href="https://github.com/plone/volto"
            title="Volto GitHub repository"
          >
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );

    expect(getByTitle('Volto GitHub repository').getAttribute('rel')).toBe(
      'noopener',
    );
  });

  it('checks that UniversalLink sets target attribute for external links', () => {
    const { getByTitle } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink
            href="https://github.com/plone/volto"
            title="Volto GitHub repository"
          >
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );

    expect(getByTitle('Volto GitHub repository').getAttribute('target')).toBe(
      '_blank',
    );
  });

  it('check UniversalLink can unset target for ext links with prop', () => {
    const { getByTitle } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink
            href="https://github.com/plone/volto"
            title="Volto GitHub repository"
            openLinkInNewTab={false}
          >
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );

    expect(getByTitle('Volto GitHub repository').getAttribute('target')).toBe(
      null,
    );
  });

  it('checks that UniversalLink renders external link for blacklisted URLs', () => {
    config.settings.externalRoutes = [
      {
        match: {
          path: '/external-app',
          exact: true,
          strict: false,
        },
        url(payload) {
          return payload.location.pathname;
        },
      },
    ];

    const { getByTitle } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink
            href="http://localhost:3000/external-app"
            title="Blacklisted route"
          >
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );

    expect(getByTitle('Blacklisted route').getAttribute('target')).toBe(
      '_blank',
    );
  });

  it('UniversalLink renders external link where link is blacklisted', () => {
    const notInEN =
      /^(?!.*(#|\/en|\/static|\/controlpanel|\/cypress|\/login|\/logout|\/contact-form)).*$/;
    config.settings.externalRoutes = [
      {
        match: {
          path: notInEN,
          exact: false,
          strict: false,
        },
        url(payload) {
          return payload.location.pathname;
        },
      },
    ];

    const { getByTitle } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink
            href="http://localhost:3000/blacklisted-app"
            title="External blacklisted app"
          >
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );

    expect(getByTitle('External blacklisted app').getAttribute('target')).toBe(
      '_blank',
    );
    expect(getByTitle('External blacklisted app').getAttribute('rel')).toBe(
      'noopener',
    );
  });

  it('check UniversalLink does not break with error in item', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink
            item={{
              error: 'Error while fetching content',
              message: 'Something went wrong',
            }}
          >
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
    expect(global.console.error).toHaveBeenCalled();
  });

  it('renders a UniversalLink component when url ends with @@display-file', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink href="http://localhost:3000/en/welcome-to-volto/@@display-file">
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('returns null when href is an empty array', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink href={[]}>
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toBeNull();
    expect(global.console.error).toHaveBeenCalledWith(
      'Invalid href passed to UniversalLink, received an array as href instead of a string',
      [],
    );
  });

  it('returns null when href is a non-empty array', () => {
    const invalidHref = ['http://localhost:3000/en/page1', '/en/page2'];
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink href={invalidHref}>
            <h1>Title</h1>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toBeNull();
    expect(global.console.error).toHaveBeenCalledWith(
      'Invalid href passed to UniversalLink, received an array as href instead of a string',
      invalidHref,
    );
  });

  it('returns null when href is an array with children elements', () => {
    const invalidHref = ['/en/page'];
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UniversalLink href={invalidHref}>
            <h1>Title</h1>
            <p>Description</p>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    expect(container.firstChild).toBeNull();
    expect(global.console.error).toHaveBeenCalledWith(
      'Invalid href passed to UniversalLink, received an array as href instead of a string',
      invalidHref,
    );
  });
});
