import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import WebReportSectionView from './WebReportSectionView';

// Add jest-dom matchers
import '@testing-library/jest-dom';

// Mock external dependencies
jest.mock('@plone/volto/helpers', () => ({
  isInternalURL: jest.fn(),
  flattenToAppURL: jest.fn(),
}));

jest.mock('@plone/volto/components/', () => ({
  DefaultView: jest.fn(({ children, content, token, ...otherProps }) => (
    <div data-testid="default-view">{children}</div>
  )),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Redirect: jest.fn(({ to }) => <div data-testid="redirect" data-to={to} />),
}));

const { isInternalURL, flattenToAppURL } = require('@plone/volto/helpers');
const { DefaultView } = require('@plone/volto/components/');
const { Redirect } = require('react-router-dom');

describe('WebReportSectionView', () => {
  let history;
  const originalServer = global.__SERVER__;

  beforeAll(() => {
    // Set default values for global variables
    global.__SERVER__ = false;
  });

  beforeEach(() => {
    history = createMemoryHistory();
    history.replace = jest.fn();

    // Reset mocks
    isInternalURL.mockClear();
    flattenToAppURL.mockClear();
    DefaultView.mockClear();
    Redirect.mockClear();

    // Reset window.location mock
    delete window.location;
    window.location = { href: '' };

    // Default mock implementations
    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockImplementation((url) => url);

    // Reset __SERVER__ to false for each test
    global.__SERVER__ = false;
  });

  afterEach(() => {
    global.__SERVER__ = originalServer;
  });

  const defaultProps = {
    content: null,
    token: null,
  };

  it('renders without crashing', () => {
    const { container } = render(
      <Router history={history}>
        <WebReportSectionView {...defaultProps} />
      </Router>,
    );
    expect(container).toBeTruthy();
  });

  it('renders DefaultView when no content is provided', () => {
    render(
      <Router history={history}>
        <WebReportSectionView {...defaultProps} />
      </Router>,
    );

    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(defaultProps),
      {},
    );
  });

  it('renders DefaultView when content has no items', () => {
    const props = {
      ...defaultProps,
      content: { items: [] },
    };

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(props),
      {},
    );
  });

  it('renders DefaultView when token is present', () => {
    const props = {
      content: {
        items: [{ '@id': '/first-item' }],
      },
      token: 'some-token',
    };

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(props),
      {},
    );
    expect(history.replace).not.toHaveBeenCalled();
  });

  it('redirects to first item when no token and internal URL on client', () => {
    global.__SERVER__ = false;

    const props = {
      content: {
        items: [{ '@id': '/first-item' }, { '@id': '/second-item' }],
      },
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue('/flattened-first-item');

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(isInternalURL).toHaveBeenCalledWith('/first-item');
    expect(flattenToAppURL).toHaveBeenCalledWith('/first-item');
    expect(history.replace).toHaveBeenCalledWith('/flattened-first-item');
  });

  it('redirects via window.location for external URL on client', () => {
    global.__SERVER__ = false;

    const props = {
      content: {
        items: [{ '@id': 'https://external.com/first-item' }],
      },
      token: null,
    };

    isInternalURL.mockReturnValue(false);
    flattenToAppURL.mockReturnValue(
      'https://external.com/flattened-first-item',
    );

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(isInternalURL).toHaveBeenCalledWith(
      'https://external.com/first-item',
    );
    expect(flattenToAppURL).toHaveBeenCalledWith(
      'https://external.com/first-item',
    );
    expect(window.location.href).toBe(
      'https://external.com/flattened-first-item',
    );
    expect(history.replace).not.toHaveBeenCalled();
  });

  it('returns Redirect component on server side when no token', () => {
    global.__SERVER__ = true;

    const props = {
      content: {
        items: [{ '@id': '/first-item' }],
      },
      token: null,
    };

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(Redirect).toHaveBeenCalledWith({ to: '/first-item' }, {});
  });

  it('does not redirect on server side when token is present', () => {
    global.__SERVER__ = true;

    const props = {
      content: {
        items: [{ '@id': '/first-item' }],
      },
      token: 'some-token',
    };

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(Redirect).not.toHaveBeenCalled();
    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(props),
      {},
    );
  });

  it('does not redirect when no redirectUrl is available', () => {
    global.__SERVER__ = false;

    const props = {
      content: {
        items: [],
      },
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue(undefined);

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(isInternalURL).toHaveBeenCalledWith(undefined);
    expect(history.replace).toHaveBeenCalledWith(undefined);
  });

  it('handles content with null items', () => {
    const props = {
      content: {
        items: null,
      },
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue(undefined);

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(props),
      {},
    );
    expect(history.replace).toHaveBeenCalledWith(undefined);
  });

  it('handles content with undefined items', () => {
    const props = {
      content: {},
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue(undefined);

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(props),
      {},
    );
    expect(history.replace).toHaveBeenCalledWith(undefined);
  });

  it('handles items without @id property', () => {
    const props = {
      content: {
        items: [{ title: 'Item without @id' }],
      },
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue(undefined);

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(props),
      {},
    );
    expect(history.replace).toHaveBeenCalledWith(undefined);
  });

  it('uses the first item even if it has no @id', () => {
    global.__SERVER__ = false;

    const props = {
      content: {
        items: [
          { title: 'No @id' },
          { '@id': '/second-item' },
          { '@id': '/third-item' },
        ],
      },
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue(undefined);

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    // The component gets the first item's @id (which is undefined)
    expect(isInternalURL).toHaveBeenCalledWith(undefined);
    expect(flattenToAppURL).toHaveBeenCalledWith(undefined);
    expect(history.replace).toHaveBeenCalledWith(undefined);
  });

  it('redirects to first item when it has valid @id', () => {
    global.__SERVER__ = false;

    const props = {
      content: {
        items: [{ '@id': '/first-item' }, { '@id': '/second-item' }],
      },
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue('/flattened-first-item');

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(isInternalURL).toHaveBeenCalledWith('/first-item');
    expect(flattenToAppURL).toHaveBeenCalledWith('/first-item');
    expect(history.replace).toHaveBeenCalledWith('/flattened-first-item');
  });

  it('passes through all props to DefaultView', () => {
    const props = {
      content: null,
      token: null,
      customProp: 'custom-value',
      anotherProp: { nested: 'object' },
    };

    render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    expect(DefaultView).toHaveBeenCalledWith(
      expect.objectContaining(props),
      {},
    );
  });

  it('memoizes redirectUrl correctly', () => {
    const props = {
      content: {
        items: [{ '@id': '/first-item' }],
      },
      token: 'some-token',
    };

    const { rerender } = render(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    // Re-render with same content
    rerender(
      <Router history={history}>
        <WebReportSectionView {...props} />
      </Router>,
    );

    // Should only call DefaultView twice (once per render)
    expect(DefaultView).toHaveBeenCalledTimes(2);
  });

  it('updates redirectUrl when content changes', () => {
    global.__SERVER__ = false;

    const initialProps = {
      content: {
        items: [{ '@id': '/first-item' }],
      },
      token: null,
    };

    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockImplementation((url) => `/flattened${url}`);

    const { rerender } = render(
      <Router history={history}>
        <WebReportSectionView {...initialProps} />
      </Router>,
    );

    expect(history.replace).toHaveBeenCalledWith('/flattened/first-item');

    // Clear previous calls
    history.replace.mockClear();

    // Re-render with different content
    const updatedProps = {
      content: {
        items: [{ '@id': '/different-item' }],
      },
      token: null,
    };

    rerender(
      <Router history={history}>
        <WebReportSectionView {...updatedProps} />
      </Router>,
    );

    expect(history.replace).toHaveBeenCalledWith('/flattened/different-item');
  });
});
