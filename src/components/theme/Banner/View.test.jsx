import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import thunk from 'redux-thunk';
import View from './View';

const mockStore = configureStore([thunk]);

jest.mock('@plone/volto/helpers', () => ({
  Helmet: ({ children, link }) => (
    <div data-testid="helmet" data-link={JSON.stringify(link)}>
      {children}
    </div>
  ),
}));

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    blocks: {
      blocksConfig: {
        title: {
          copyrightPrefix: '©',
        },
      },
    },
    settings: {
      eea: {
        contentTypesWithoutHeaderImage: ['Folder'],
      },
    },
  },
}));

jest.mock('@eeacms/volto-eea-design-system/ui/Popup/Popup', () => {
  return function MockPopup({ trigger, content }) {
    return (
      <div data-testid="popup">
        <div data-testid="popup-trigger">{trigger}</div>
        <div data-testid="popup-content">{content}</div>
      </div>
    );
  };
});

jest.mock('@eeacms/volto-eea-design-system/ui/Banner/Banner', () => {
  const Banner = ({ children, image, styles }) => (
    <div
      data-testid="banner"
      data-image={image || ''}
      data-styles={JSON.stringify(styles)}
    >
      {children}
    </div>
  );
  Banner.Content = ({ children, actions }) => (
    <div data-testid="banner-content">
      <div data-testid="banner-actions">{actions}</div>
      {children}
    </div>
  );
  Banner.Title = ({ children }) => (
    <h1 data-testid="banner-title">{children}</h1>
  );
  Banner.Subtitle = ({ children }) => (
    <div data-testid="banner-subtitle">{children}</div>
  );
  Banner.Metadata = ({ children }) => (
    <div data-testid="banner-metadata">{children}</div>
  );
  Banner.MetadataField = ({ type, label, value, hidden }) =>
    hidden ? null : (
      <span data-testid={`metadata-${type}`} data-label={label}>
        {value}
      </span>
    );
  Banner.Action = ({ icon, title, onClick, className, href, target }) => (
    <button
      data-testid={`banner-action-${className || icon}`}
      onClick={onClick}
      data-href={href}
      data-target={target}
    >
      {title}
    </button>
  );
  return {
    __esModule: true,
    default: Banner,
    getImageSource: jest.fn((image) => (image ? '/path/to/image.jpg' : null)),
    sharePage: jest.fn(),
  };
});

jest.mock('@eeacms/volto-eea-design-system/ui/Copyright/Copyright', () => {
  const Copyright = ({ children, copyrightPosition }) => (
    <div data-testid="copyright" data-position={copyrightPosition}>
      {children}
    </div>
  );
  Copyright.Prefix = ({ children }) => (
    <span data-testid="copyright-prefix">{children}</span>
  );
  Copyright.Icon = ({ children }) => (
    <span data-testid="copyright-icon">{children}</span>
  );
  Copyright.Text = ({ children }) => (
    <span data-testid="copyright-text">{children}</span>
  );
  return {
    __esModule: true,
    default: Copyright,
  };
});

jest.mock('@eeacms/volto-eea-website-theme/helpers/setupPrintView', () => ({
  setupPrintView: jest.fn(),
}));

describe('Banner View Component', () => {
  let history;
  let store;

  const defaultProps = {
    data: {},
    properties: {
      '@id': '/test-page',
      '@type': 'Document',
      title: 'Test Page Title',
      created: '2023-01-01T00:00:00Z',
      effective: '2023-01-15T00:00:00Z',
      modified: '2023-06-01T00:00:00Z',
    },
    banner: {},
    variation: { id: 'default' },
  };

  beforeEach(() => {
    history = createMemoryHistory();
    store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      types: {
        types: [],
      },
      isPrint: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });

  it('renders the banner title', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    const title = screen.getByTestId('banner-title');
    expect(title.textContent).toBe('Test Page Title');
  });

  it('renders share button by default', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    expect(screen.getByTestId('banner-action-share')).toBeTruthy();
  });

  it('hides share button when hideShareButton is true', () => {
    const props = {
      ...defaultProps,
      data: { hideShareButton: true },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.queryByTestId('banner-action-share')).toBeNull();
  });

  it('renders download button by default', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    expect(screen.getByTestId('banner-action-download')).toBeTruthy();
  });

  it('hides download button when hideDownloadButton is true', () => {
    const props = {
      ...defaultProps,
      data: { hideDownloadButton: true },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.queryByTestId('banner-action-download')).toBeNull();
  });

  it('renders subtitle when provided', () => {
    const props = {
      ...defaultProps,
      data: { subtitle: 'Test Subtitle' },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    const subtitle = screen.getByTestId('banner-subtitle');
    expect(subtitle.textContent).toBe('Test Subtitle');
  });

  it('renders copyright when provided', () => {
    const props = {
      ...defaultProps,
      data: {
        copyright: 'Test Copyright',
        copyrightIcon: 'ri-copyright-line',
        copyrightPosition: 'bottom',
      },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.getByTestId('copyright')).toBeTruthy();
    expect(screen.getByTestId('copyright-text').textContent).toBe(
      'Test Copyright',
    );
  });

  it('does not render copyright when not provided', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    expect(screen.queryByTestId('copyright')).toBeNull();
  });

  it('renders RSS links when provided', () => {
    const props = {
      ...defaultProps,
      data: {
        rssLinks: [{ title: 'RSS Feed', href: '/rss.xml', feedType: 'rss' }],
      },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.getByTestId('banner-action-rssfeed')).toBeTruthy();
  });

  it('calls setupPrintView when download button is clicked', () => {
    const {
      setupPrintView,
    } = require('@eeacms/volto-eea-website-theme/helpers/setupPrintView');

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    const downloadButton = screen.getByTestId('banner-action-download');
    fireEvent.click(downloadButton);

    expect(setupPrintView).toHaveBeenCalled();
  });

  it('renders content type metadata by default', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    expect(screen.getByTestId('metadata-type')).toBeTruthy();
  });

  it('hides content type when hideContentType is true', () => {
    const props = {
      ...defaultProps,
      data: { hideContentType: true },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.queryByTestId('metadata-type')).toBeNull();
  });

  it('renders dates when not hidden', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...defaultProps} />
        </Router>
      </Provider>,
    );

    const dateFields = screen.getAllByTestId('metadata-date');
    expect(dateFields.length).toBeGreaterThan(0);
  });

  it('renders additional info fields', () => {
    const props = {
      ...defaultProps,
      data: {
        info: [{ description: 'Info 1' }, { description: 'Info 2' }],
      },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.getByText('Info 1')).toBeTruthy();
    expect(screen.getByText('Info 2')).toBeTruthy();
  });

  it('uses metadata prop when provided instead of properties', () => {
    const props = {
      ...defaultProps,
      metadata: {
        '@id': '/custom-page',
        '@type': 'News Item',
        title: 'Custom Title',
      },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.getByTestId('banner-title').textContent).toBe('Custom Title');
  });

  it('does not show image for content types in contentTypesWithoutHeaderImage', () => {
    const props = {
      ...defaultProps,
      properties: {
        ...defaultProps.properties,
        '@type': 'Folder',
        image: { url: '/image.jpg' },
      },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    const banner = screen.getByTestId('banner');
    expect(banner.getAttribute('data-image')).toBe('');
  });

  it('renders custom banner title view when provided', () => {
    const CustomTitleView = () => (
      <div data-testid="custom-title">Custom Title View</div>
    );
    const props = {
      ...defaultProps,
      banner: {
        title: {
          view: <CustomTitleView />,
        },
      },
    };

    render(
      <Provider store={store}>
        <Router history={history}>
          <View {...props} />
        </Router>
      </Provider>,
    );

    expect(screen.getByTestId('custom-title')).toBeTruthy();
  });
});
