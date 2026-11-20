import React from 'react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UniversalLink, { __test, getUrl } from './UniversalLink';
import config from '@plone/volto/registry';
import '@testing-library/jest-dom';

const mockStore = configureStore();
const anonymousStore = mockStore({
  userSession: { token: null },
  intl: { locale: 'en', messages: {} },
});
const authenticatedStore = mockStore({
  userSession: { token: 'token' },
  intl: { locale: 'en', messages: {} },
});

const renderLink = (props, store = anonymousStore) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UniversalLink title="link" {...props}>
          <span>Title</span>
        </UniversalLink>
      </MemoryRouter>
    </Provider>,
  );

describe('UniversalLink', () => {
  let originalExternalRoutes;
  let originalViewableInBrowserObjects;
  let consoleError;

  beforeEach(() => {
    originalExternalRoutes = config.settings.externalRoutes;
    originalViewableInBrowserObjects = config.settings.viewableInBrowserObjects;
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    config.settings.externalRoutes = originalExternalRoutes;
    config.settings.viewableInBrowserObjects = originalViewableInBrowserObjects;
    consoleError.mockRestore();
    __test.renderCounter = () => {};
  });

  it('renders an internal link', () => {
    const { getByTitle } = renderLink({ href: '/en/welcome-to-volto' });
    const link = getByTitle('link');
    expect(link.getAttribute('href')).toBe('/en/welcome-to-volto');
    expect(link.getAttribute('target')).toBe(null);
    expect(link.getAttribute('rel')).toBe(null);
  });

  it('renders an internal link from an item', () => {
    const { getByTitle } = renderLink({
      item: { '@id': 'http://localhost:3000/en/welcome-to-volto' },
    });
    expect(getByTitle('link').getAttribute('href')).toBe(
      '/en/welcome-to-volto',
    );
  });

  it('EEA: uses rel="noopener" without noreferrer on external links', () => {
    const { getByTitle } = renderLink({
      href: 'https://github.com/plone/volto',
      className: 'custom-link',
    });
    const link = getByTitle('link');
    expect(link.getAttribute('rel')).toBe('noopener');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link).toHaveClass('external');
    expect(link).toHaveClass('custom-link');
  });

  it('does not add the external class on mailto links', () => {
    const { getByTitle } = renderLink({ href: 'mailto:info@eea.europa.eu' });
    const link = getByTitle('link');
    expect(link).not.toHaveClass('external');
    expect(link.getAttribute('target')).toBe(null);
  });

  it('appends http when the protocol is missing', () => {
    const { getByTitle } = renderLink({ href: 'www.github.com' });
    expect(getByTitle('link').getAttribute('href')).toBe(
      'http://www.github.com',
    );
  });

  it('can unset target for external links', () => {
    const { getByTitle } = renderLink({
      href: 'https://github.com/plone/volto',
      openLinkInNewTab: false,
    });
    expect(getByTitle('link').getAttribute('target')).toBe(null);
  });

  it('EEA: renders blacklisted routes as external links with rel="noopener"', () => {
    config.settings.externalRoutes = [
      {
        match: { path: '/external-app', exact: true, strict: false },
        url(payload) {
          return payload.location.pathname;
        },
      },
    ];
    const { getByTitle } = renderLink({
      href: 'http://localhost:3000/external-app',
    });
    const link = getByTitle('link');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('EEA: uses rel="noopener" without noreferrer on display-file links', () => {
    const { getByTitle } = renderLink({
      href: 'http://localhost:3000/en/file/@@display-file/file',
    });
    const link = getByTitle('link');
    expect(link.getAttribute('href')).toBe('/en/file/@@display-file/file');
    expect(link.getAttribute('rel')).toBe('noopener');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('EEA: display-file links honor openLinkInNewTab={false}', () => {
    const { getByTitle } = renderLink({
      href: '/en/file/@@display-file/file',
      openLinkInNewTab: false,
    });
    expect(getByTitle('link').getAttribute('target')).toBe(null);
  });

  it('adds @@display-file/file for viewable items for anonymous users', () => {
    config.settings.viewableInBrowserObjects = ['File'];
    const { getByTitle } = renderLink({
      item: { '@id': '/en/file', '@type': 'File' },
    });
    expect(getByTitle('link').getAttribute('href')).toBe(
      '/en/file/@@display-file/file',
    );
  });

  it('EEA: does not link File items to @@download/file without the download prop', () => {
    const { getByTitle } = renderLink({
      item: { '@id': '/en/file', '@type': 'File' },
    });
    const link = getByTitle('link');
    expect(link.getAttribute('href')).toBe('/en/file');
    expect(link.hasAttribute('download')).toBe(false);
  });

  it('EEA: links File items to @@download/file with the download prop', () => {
    const { getByTitle } = renderLink(
      { item: { '@id': '/en/file', '@type': 'File' }, download: true },
      authenticatedStore,
    );
    const link = getByTitle('link');
    expect(link.getAttribute('href')).toBe('/en/file/@@download/file');
    expect(link.hasAttribute('download')).toBe(true);
  });

  it('EEA: download prop adds @@download/file to internal hrefs once', () => {
    const { getByTitle, rerender } = renderLink({
      href: '/en/report',
      download: true,
    });
    expect(getByTitle('link').getAttribute('href')).toBe(
      '/en/report/@@download/file',
    );
    rerender(
      <Provider store={anonymousStore}>
        <MemoryRouter>
          <UniversalLink
            title="link"
            href="/en/report/@@download/file"
            download
          >
            <span>Title</span>
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    expect(getByTitle('link').getAttribute('href')).toBe(
      '/en/report/@@download/file',
    );
  });

  it('EEA: download prop does not change external hrefs', () => {
    const { getByTitle } = renderLink({
      href: 'https://example.com/report.pdf',
      download: true,
    });
    expect(getByTitle('link').getAttribute('href')).toBe(
      'https://example.com/report.pdf',
    );
  });

  it('EEA: uses item.linkWithHash to keep the anchor', () => {
    const { getByTitle } = renderLink({
      item: {
        '@id': 'http://localhost:3000/en/page',
        linkWithHash: '/en/page#section',
      },
    });
    expect(getByTitle('link').getAttribute('href')).toBe('/en/page#section');
  });

  it('does not break with an error in item', () => {
    const { getByTitle } = renderLink({
      item: {
        error: 'Error while fetching content',
        message: 'Something went wrong',
      },
    });
    expect(getByTitle('link')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });

  it('forwards the ref to the anchor', () => {
    const ref = React.createRef();
    render(
      <Provider store={anonymousStore}>
        <MemoryRouter>
          <UniversalLink href="https://github.com/plone/volto" ref={ref}>
            Title
          </UniversalLink>
        </MemoryRouter>
      </Provider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('is memoized: only the changed link re-renders', () => {
    const renderCounter = vi.fn();
    __test.renderCounter = renderCounter;
    const itemA = { '@id': '/en/a' };
    const itemB = { '@id': '/en/b' };
    const Wrapper = ({ children }) => (
      <Provider store={anonymousStore}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
    const { rerender } = render(
      <>
        <UniversalLink item={itemA} />
        <UniversalLink item={itemB} />
      </>,
      { wrapper: Wrapper },
    );
    expect(renderCounter).toHaveBeenCalledTimes(2);
    rerender(
      <>
        <UniversalLink item={itemA} />
        <UniversalLink item={{ '@id': '/en/b-updated' }} />
      </>,
    );
    expect(renderCounter).toHaveBeenCalledTimes(3);
  });

  describe('getUrl', () => {
    it('returns the href', () => {
      expect(getUrl({ href: '/en/a' }, null, undefined, null)).toBe('/en/a');
    });

    it('returns the publicURL without href and item', () => {
      expect(getUrl({}, null, undefined, null)).toBe(config.settings.publicURL);
    });

    it('EEA: appends @@download/file only with the download prop', () => {
      const item = { '@id': '/en/file', '@type': 'File' };
      expect(getUrl({ item }, null, item, null)).toBe('/en/file');
      expect(getUrl({ item, download: true }, null, item, null)).toBe(
        '/en/file/@@download/file',
      );
    });
  });
});
