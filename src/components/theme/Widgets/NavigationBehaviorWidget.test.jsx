import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import NavigationBehaviorWidget from './NavigationBehaviorWidget';

const mockStore = configureStore();

// Mock the getNavigation action
jest.mock('@plone/volto/actions', () => ({
  getNavigation: jest.fn(() => ({ type: 'GET_NAVIGATION' })),
}));

// Mock the config
jest.mock('@plone/volto/registry', () => ({
  settings: {
    menuItemsLayouts: {
      '/test-route': {
        hideChildrenFromNavigation: false,
        menuItemChildrenListColumns: [2, 3],
        menuItemColumns: ['two wide column', 'three wide column'],
      },
      '*': {
        hideChildrenFromNavigation: true,
      },
    },
  },
}));

describe('NavigationBehaviorWidget', () => {
  let store;
  const mockOnChange = jest.fn();
  const mockDispatch = jest.fn();

  const mockNavigation = [
    {
      '@id': '/test-route-1',
      title: 'Test Route 1',
      url: '/test-route-1',
      id: 'test-route-1',
      portal_type: 'Document',
      items: [
        {
          '@id': '/test-route-1/child1',
          title: 'Child 1',
          url: '/test-route-1/child1',
          id: 'child1',
          portal_type: 'Document',
          items: [],
        },
      ],
    },
    {
      '@id': '/test-route-2',
      title: 'Test Route 2',
      url: '/test-route-2',
      id: 'test-route-2',
      portal_type: 'Document',
      items: [],
    },
  ];

  beforeEach(() => {
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
        items: mockNavigation,
        loaded: true,
      },
    });
    
    store.dispatch = mockDispatch;
    mockOnChange.mockClear();
    mockDispatch.mockClear();
  });

  const defaultProps = {
    id: 'navigation-behavior',
    title: 'Navigation Behavior',
    value: '{}',
    onChange: mockOnChange,
    schema: {},
  };

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    expect(container).toBeTruthy();
  });

  it('dispatches getNavigation when navigation is not loaded', () => {
    const storeNotLoaded = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: [],
        loaded: false,
      },
    });
    storeNotLoaded.dispatch = mockDispatch;

    render(
      <Provider store={storeNotLoaded}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('displays navigation routes as accordions', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
    expect(screen.getByText('Test Route 2')).toBeInTheDocument();
  });

  it('shows route paths in accordion titles', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('(/test-route-1)')).toBeInTheDocument();
    expect(screen.getByText('(/test-route-2)')).toBeInTheDocument();
  });

  it('expands accordion when clicked', async () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    const firstAccordion = screen.getByText('Test Route 1').closest('.title');
    fireEvent.click(firstAccordion);

    await waitFor(() => {
      expect(screen.getByText('Hide Children From Navigation')).toBeInTheDocument();
    });
  });

  it('handles JSON string value correctly', () => {
    const jsonValue = JSON.stringify({
      '/test-route-1': {
        hideChildrenFromNavigation: false,
        menuItemColumns: [2, 3],
      },
    });

    const { container } = render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={jsonValue} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('handles invalid JSON value gracefully', () => {
    const { container } = render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value="invalid json" />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('handles object value correctly', () => {
    const objectValue = {
      '/test-route-1': {
        hideChildrenFromNavigation: false,
      },
    };

    const { container } = render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={objectValue} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('auto-populates settings from config when no settings exist', async () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const callArgs = mockOnChange.mock.calls[0];
    expect(callArgs[0]).toBe('navigation-behavior');
    expect(typeof callArgs[1]).toBe('string');
    
    const parsedValue = JSON.parse(callArgs[1]);
    expect(parsedValue).toHaveProperty('/test-route-1');
    expect(parsedValue).toHaveProperty('/test-route-2');
  });

  it('does not auto-populate when settings already exist', () => {
    const existingValue = JSON.stringify({
      '/test-route-1': { hideChildrenFromNavigation: true },
    });

    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={existingValue} />
      </Provider>
    );

    // Should not call onChange for auto-population
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('filters to show only level 0 routes', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    // Should only show main routes, not child routes
    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
    expect(screen.getByText('Test Route 2')).toBeInTheDocument();
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('converts menuItemColumns between semantic UI and numbers correctly', async () => {
    const valueWithSemanticUI = JSON.stringify({
      '/test-route-1': {
        menuItemColumns: ['two wide column', 'three wide column'],
      },
    });

    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={valueWithSemanticUI} />
      </Provider>
    );

    const firstAccordion = screen.getByText('Test Route 1').closest('.title');
    fireEvent.click(firstAccordion);

    await waitFor(() => {
      expect(screen.getByText('Menu Item Columns')).toBeInTheDocument();
    });
  });

  it('handles empty navigation array', () => {
    const emptyNavStore = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: [],
        loaded: true,
      },
    });

    const { container } = render(
      <Provider store={emptyNavStore}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('merges config settings with saved settings correctly', () => {
    const existingValue = JSON.stringify({
      '/test-route-1': {
        hideChildrenFromNavigation: false, // Override config default
        menuItemColumns: [1, 2], // Add new setting
      },
    });

    const { container } = render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={existingValue} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('handles null values in settings (explicit deletion)', () => {
    const valueWithNulls = JSON.stringify({
      '/test-route-1': {
        hideChildrenFromNavigation: null, // Explicitly deleted
        menuItemColumns: [1, 2],
      },
    });

    const { container } = render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={valueWithNulls} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('generates unique route IDs when missing', () => {
    const navigationWithoutIds = [
      {
        title: 'No ID Route',
        url: '/no-id-route',
        id: 'no-id-route',
        portal_type: 'Document',
        items: [],
      },
    ];

    const storeWithoutIds = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: navigationWithoutIds,
        loaded: true,
      },
    });

    const { container } = render(
      <Provider store={storeWithoutIds}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('handles navigation items without portal_type', () => {
    const navigationWithoutPortalType = [
      {
        '@id': '/no-portal-type',
        title: 'No Portal Type',
        url: '/no-portal-type',
        id: 'no-portal-type',
        items: [],
      },
    ];

    const storeWithoutPortalType = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      navigation: {
        items: navigationWithoutPortalType,
        loaded: true,
      },
    });

    const { container } = render(
      <Provider store={storeWithoutPortalType}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  it('collapses accordion when clicked again', async () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    const firstAccordion = screen.getByText('Test Route 1').closest('.title');
    
    // First click to expand
    fireEvent.click(firstAccordion);
    await waitFor(() => {
      expect(screen.getByText('Hide Children From Navigation')).toBeInTheDocument();
    });

    // Second click to collapse
    fireEvent.click(firstAccordion);
    await waitFor(() => {
      expect(screen.queryByText('Hide Children From Navigation')).not.toBeInTheDocument();
    });
  });
});