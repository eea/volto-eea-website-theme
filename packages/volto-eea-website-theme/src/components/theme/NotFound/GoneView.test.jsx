import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import thunk from 'redux-thunk';
import GoneView from './GoneView';

const mockStore = configureStore([thunk]);

vi.mock('@eeacms/volto-eea-website-theme/hocs', () => ({
  withRootNavigation: (Component) => Component,
}));

vi.mock('@plone/volto/helpers/Utils/Utils', () => ({
  toBackendLang: vi.fn((lang) => lang),
  withServerErrorCode: () => (Component) => Component,
}));

vi.mock('@plone/volto/helpers/BodyClass/BodyClass', () => ({
  __esModule: true,
  default: ({ className, children }) => (
    <div data-testid="body-class" data-classname={className}>
      {children}
    </div>
  ),
}));

vi.mock('@plone/volto/actions/navigation/navigation', () => ({
  getNavigation: vi.fn(() => ({ type: 'GET_NAVIGATION' })),
}));

vi.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      isMultilingual: false,
      navDepth: 3,
    },
  },
}));

describe('GoneView Component', () => {
  let history;
  let store;

  const renderGoneView = () =>
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

  beforeEach(() => {
    history = createMemoryHistory();
    store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: [],
      },
      content: {
        data: {},
      },
    });

    // Mock window.location
    delete window.location;
    window.location = {
      href: 'http://localhost:3000/test-page',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });

  it('renders the main heading', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    expect(screen.getByText('This page has been retired')).toBeTruthy();
  });

  it('renders the description paragraph', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    expect(
      screen.getByText(/This content was part of our previous website/),
    ).toBeTruthy();
  });

  it('renders "What you can do?" section', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    expect(screen.getByText('What you can do?')).toBeTruthy();
  });

  it('renders the accordion sections', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    expect(screen.getByText('View archived version')).toBeTruthy();
    expect(screen.getByText('Looking for something specific?')).toBeTruthy();
  });

  it('opens first accordion when clicked', () => {
    renderGoneView();

    const firstAccordion = screen.getByText('View archived version');
    fireEvent.click(firstAccordion);

    expect(screen.getByText('Wayback Machine')).toBeTruthy();
  });

  it('opens second accordion when clicked', () => {
    renderGoneView();

    const secondAccordion = screen.getByText('Looking for something specific?');
    fireEvent.click(secondAccordion);

    expect(screen.getByText('search')).toBeTruthy();
    expect(screen.getByText('homepage')).toBeTruthy();
  });

  it('renders with BodyClass for page-not-found', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    const bodyClass = screen.getByTestId('body-class');
    expect(bodyClass.getAttribute('data-classname')).toBe('page-not-found');
  });

  it('generates correct Wayback Machine URL', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    const firstAccordion = screen.getByText('View archived version');
    fireEvent.click(firstAccordion);

    const waybackLink = screen.getByText('Wayback Machine').closest('a');
    expect(waybackLink.getAttribute('href')).toBe(
      'https://web.archive.org/*/http://localhost:3000/test-page',
    );
  });

  it('has correct links for search and homepage', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <GoneView />
        </Router>
      </Provider>,
    );

    const secondAccordion = screen.getByText('Looking for something specific?');
    fireEvent.click(secondAccordion);

    const searchLink = screen.getByText('search').closest('a');
    const homepageLink = screen.getByText('homepage').closest('a');

    expect(searchLink.getAttribute('href')).toBe('/en/advanced-search');
    expect(homepageLink.getAttribute('href')).toBe('/en');
  });

  it('updates aria-expanded when the accordion titles are clicked', () => {
    renderGoneView();

    const archiveTitle = screen.getByRole('button', {
      name: 'View archived version',
    });
    const searchTitle = screen.getByRole('button', {
      name: 'Looking for something specific?',
    });

    expect(archiveTitle.getAttribute('aria-expanded')).toBe('false');
    expect(searchTitle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(archiveTitle);

    expect(archiveTitle.getAttribute('aria-expanded')).toBe('true');
    expect(searchTitle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(searchTitle);

    expect(archiveTitle.getAttribute('aria-expanded')).toBe('false');
    expect(searchTitle.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles accordion titles with Enter and Space', () => {
    renderGoneView();

    const archiveTitle = screen.getByRole('button', {
      name: 'View archived version',
    });
    const searchTitle = screen.getByRole('button', {
      name: 'Looking for something specific?',
    });

    fireEvent.keyDown(archiveTitle, { keyCode: 13 });

    expect(archiveTitle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Wayback Machine')).toBeTruthy();

    fireEvent.keyDown(archiveTitle, { keyCode: 32 });

    expect(archiveTitle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.keyDown(searchTitle, { keyCode: 32 });

    expect(searchTitle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('search')).toBeTruthy();
  });
});
