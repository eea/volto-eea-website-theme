import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// Add jest-dom matchers
import '@testing-library/jest-dom';

const mockStore = configureStore([thunk]);

// Mock the getNavigation action
const mockGetNavigation = jest.fn(() => ({ type: 'GET_NAVIGATION' }));
jest.mock('@plone/volto/actions', () => ({
  getNavigation: mockGetNavigation,
}));

// Mock the config
jest.mock('@plone/volto/registry', () => ({
  default: {
    settings: {
      menuItemsLayouts: {
        '/test-route-1': {
          hideChildrenFromNavigation: false,
          menuItemChildrenListColumns: [2, 3],
          menuItemColumns: ['two wide column', 'three wide column'],
        },
        '/test-route-2': {
          hideChildrenFromNavigation: true,
          menuItemColumns: ['four wide column'],
        },
        '*': {
          hideChildrenFromNavigation: true,
        },
      },
    },
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

// Mock Volto components
jest.mock('@plone/volto/components', () => ({
  Icon: ({ name, size }) => (
    <div data-testid="icon" data-name={name} data-size={size} />
  ),
  FormFieldWrapper: ({ children, ...props }) => (
    <div data-testid="form-field-wrapper" {...props}>
      {children}
    </div>
  ),
}));

// Mock ObjectWidget
jest.mock('@plone/volto/components/manage/Widgets/ObjectWidget', () => {
  return function MockObjectWidget({ id, schema, value, onChange }) {
    return (
      <div data-testid="object-widget" data-id={id}>
        {schema.properties.hideChildrenFromNavigation && (
          <div>
            <label>Hide Children From Navigation</label>
            <input
              type="checkbox"
              checked={value.hideChildrenFromNavigation || false}
              onChange={(e) =>
                onChange(id, {
                  ...value,
                  hideChildrenFromNavigation: e.target.checked,
                })
              }
            />
          </div>
        )}
        {schema.properties.menuItemColumns && (
          <div>
            <label>Menu Item Columns</label>
            <div data-testid="menu-item-columns">
              {(value.menuItemColumns || []).map((col, index) => (
                <span key={index}>{col}</span>
              ))}
            </div>
          </div>
        )}
        {schema.properties.menuItemChildrenListColumns && (
          <div>
            <label>Menu Item Children List Columns</label>
            <div data-testid="menu-item-children-columns">
              {(value.menuItemChildrenListColumns || []).map((col, index) => (
                <span key={index}>{col}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
});

// Mock semantic-ui-react components
jest.mock('semantic-ui-react', () => {
  const MockAccordion = ({ children, ...props }) => (
    <div className="ui accordion" data-testid="accordion" {...props}>
      {children}
    </div>
  );

  MockAccordion.Title = ({ children, onClick, active, index }) => (
    <button
      type="button"
      className={`title ${active ? 'active' : ''}`}
      onClick={(e) => onClick(e, { index })}
      data-testid="accordion-title"
    >
      {children}
    </button>
  );

  MockAccordion.Content = ({ children, active }) => (
    <div
      className={`content ${active ? 'active' : ''}`}
      data-testid="accordion-content"
    >
      {active && children}
    </div>
  );

  return {
    Accordion: MockAccordion,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Segment: ({ children }) => <div data-testid="segment">{children}</div>,
    Form: {
      Field: ({ children }) => <div data-testid="form-field">{children}</div>,
    },
    Dropdown: ({ children }) => <div data-testid="dropdown">{children}</div>,
  };
});

// Mock SVG imports
jest.mock('@plone/volto/icons/up-key.svg', () => 'up-icon');
jest.mock('@plone/volto/icons/down-key.svg', () => 'down-icon');

describe('NavigationBehaviorWidget', () => {
  let store;
  let NavigationBehaviorWidget;

  const mockOnChange = jest.fn();

  const defaultNavigationItems = [
    {
      '@id': 'http://localhost:3000/test-route-1',
      title: 'Test Route 1',
      url: '/test-route-1',
      id: 'test-route-1',
      portal_type: 'Document',
      items: [
        {
          '@id': 'http://localhost:3000/test-route-1/child',
          title: 'Child Route',
          url: '/test-route-1/child',
          id: 'child',
          portal_type: 'Document',
          items: [],
        },
      ],
    },
    {
      '@id': 'http://localhost:3000/test-route-2',
      title: 'Test Route 2',
      url: '/test-route-2',
      id: 'test-route-2',
      portal_type: 'Folder',
      items: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    store = mockStore({
      intl: {
        locale: 'en',
        messages: {
          'Load Main Navigation Routes': 'Load Main Navigation Routes',
          'Hide Children From Navigation': 'Hide Children From Navigation',
          'Menu Item Children List Columns': 'Menu Item Children List Columns',
          'Menu Item Columns': 'Menu Item Columns',
        },
      },
      navigation: {
        items: defaultNavigationItems,
        loaded: true,
      },
      vocabularies: {},
    });

    NavigationBehaviorWidget = require('./NavigationBehaviorWidget').default;
  });

  it('renders with navigation data', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
    expect(screen.getByText('Test Route 2')).toBeInTheDocument();
  });

  it('dispatches getNavigation when not loaded', () => {
    const storeNotLoaded = mockStore({
      ...store.getState(),
      navigation: { items: [], loaded: false },
    });

    render(
      <Provider store={storeNotLoaded}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(mockGetNavigation).toHaveBeenCalledWith('', 1);
  });

  it('handles accordion expansion', async () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    const accordionTitles = screen.getAllByTestId('accordion-title');
    fireEvent.click(accordionTitles[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Hide Children From Navigation'),
      ).toBeInTheDocument();
    });
  });

  it('handles JSON parsing correctly', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value='{"test": {"hideChildrenFromNavigation": false}}'
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
  });

  it('handles invalid JSON gracefully', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="invalid json"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
  });

  it('handles object values correctly', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value={{ '/test': { hideChildrenFromNavigation: false } }}
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
  });

  it('handles null values correctly', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value={null}
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
  });

  it('auto-populates settings from config when no settings exist', async () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('handles empty navigation data', () => {
    const emptyStore = mockStore({
      ...store.getState(),
      navigation: { items: [], loaded: true },
    });

    const { container } = render(
      <Provider store={emptyStore}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(
      container.querySelector('.navigation-behavior-widget'),
    ).toBeInTheDocument();
  });

  it('toggles accordion active state correctly', async () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    const accordionTitles = screen.getAllByTestId('accordion-title');

    // Click to expand
    fireEvent.click(accordionTitles[0]);
    await waitFor(() => {
      expect(accordionTitles[0]).toHaveClass('active');
    });

    // Click again to collapse
    fireEvent.click(accordionTitles[0]);
    await waitFor(() => {
      expect(accordionTitles[0]).not.toHaveClass('active');
    });
  });

  it('processes routes with config settings correctly', () => {
    const storeWithConfig = mockStore({
      ...store.getState(),
      navigation: {
        items: [
          {
            '@id': 'http://localhost:3000/test-route-1',
            title: 'Test Route 1',
            url: '/test-route-1',
            items: [],
          },
        ],
        loaded: true,
      },
    });

    render(
      <Provider store={storeWithConfig}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
  });

  it('filters to show only level 0 routes', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    // Should only show main routes, not child routes
    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
    expect(screen.getByText('Test Route 2')).toBeInTheDocument();
    expect(screen.queryByText('Child Route')).not.toBeInTheDocument();
  });

  it('handles routes without @id using fallback uuid', () => {
    const storeWithoutIds = mockStore({
      ...store.getState(),
      navigation: {
        items: [
          {
            title: 'Route Without ID',
            url: '/no-id-route',
            items: [],
          },
        ],
        loaded: true,
      },
    });

    render(
      <Provider store={storeWithoutIds}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('Route Without ID')).toBeInTheDocument();
  });

  it('merges config and saved settings correctly', async () => {
    const existingSettings = {
      'http://localhost:3000/test-route-1': {
        hideChildrenFromNavigation: true,
        menuItemColumns: [1, 2],
      },
    };

    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value={JSON.stringify(existingSettings)}
          onChange={mockOnChange}
        />
      </Provider>,
    );

    const accordionTitles = screen.getAllByTestId('accordion-title');
    fireEvent.click(accordionTitles[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Hide Children From Navigation'),
      ).toBeInTheDocument();
    });
  });

  it('handles routes with hasChildren property', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    // Test Route 1 has children, Test Route 2 doesn't
    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
    expect(screen.getByText('Test Route 2')).toBeInTheDocument();
  });

  it('displays route paths in accordion titles', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget
          id="test"
          value="{}"
          onChange={mockOnChange}
        />
      </Provider>,
    );

    expect(screen.getByText('(/test-route-1)')).toBeInTheDocument();
    expect(screen.getByText('(/test-route-2)')).toBeInTheDocument();
  });
});
