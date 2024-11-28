import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ReportNavigation from './ReportNavigation';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();
const store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
  },
});

jest.mock(
  '@plone/volto/components/theme/Navigation/withContentNavigation',
  () => ({
    withContentNavigation: (Component) => (props) => (
      <Component {...props} navigation={mockNavigation} />
    ),
  }),
);

// Mock navigation data
const mockNavigation = {
  items: [
    {
      '@id': '/item1',
      title: 'Item 1',
      href: '/item1',
      type: 'document',
      description: 'Item 1 description',
      is_current: false,
      is_in_path: false,
      items: [
        {
          '@id': '/item1/subitem1',
          title: 'Subitem 1',
          href: '/item1/subitem1',
          type: 'document',
          is_current: false,
          is_in_path: false,
          items: [],
        },
      ],
    },
    {
      '@id': '/item2',
      title: 'Item 2',
      href: '/item2',
      type: 'document',
      description: 'Item 2 description',
      is_current: true,
      is_in_path: true,
      items: [],
    },
  ],
  has_custom_name: true,
  title: 'Custom Navigation',
  url: '/custom-navigation',
};

describe('ReportNavigation', () => {
  it('renders navigation items correctly', () => {
    const history = createMemoryHistory();
    const { getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ReportNavigation />
        </Router>
      </Provider>,
    );

    // Check if the navigation header is rendered
    expect(getByText('Custom Navigation')).toBeInTheDocument();

    // Check if the navigation items are rendered
    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
    expect(getByText('Subitem 1')).toBeInTheDocument();
  });

  it('toggles details on summary click', () => {
    const history = createMemoryHistory();
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ReportNavigation />
        </Router>
      </Provider>,
    );

    const detailsElement = container.querySelector('a[href="/item1"]');

    // Simulate click on summary
    fireEvent.click(detailsElement);
  });

  it('renders links with correct href attributes', () => {
    const history = createMemoryHistory();
    const { getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ReportNavigation />
        </Router>
      </Provider>,
    );

    expect(getByText('Item 1').closest('a')).toHaveAttribute('href', '/item1');
    expect(getByText('Subitem 1').closest('a')).toHaveAttribute(
      'href',
      '/item1/subitem1',
    );
  });

  it('applies active class to the current navigation item', () => {
    const history = createMemoryHistory();
    const { getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ReportNavigation />
        </Router>
      </Provider>,
    );

    const activeItem = getByText('Item 2');
    expect(activeItem).toHaveClass('in_path');
  });
});
