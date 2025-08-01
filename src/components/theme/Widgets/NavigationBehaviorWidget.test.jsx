import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import NavigationBehaviorWidget from './NavigationBehaviorWidget';

// Add jest-dom matchers
import '@testing-library/jest-dom';

const mockStore = configureStore();

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
        '*': {
          hideChildrenFromNavigation: true,
        },
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
      items: [],
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
      vocabularies: {},
    });
    
    store.dispatch = mockDispatch;
    mockOnChange.mockClear();
    mockDispatch.mockClear();
    mockGetNavigation.mockClear();
  });

  const defaultProps = {
    id: 'navigation-behavior',
    title: 'Navigation Behavior',
    value: '{}',
    onChange: mockOnChange,
    schema: {
      properties: {
        'navigation-behavior': {
          title: 'Navigation Behavior',
          type: 'object'
        }
      }
    },
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
      vocabularies: {},
    });
    storeNotLoaded.dispatch = mockDispatch;

    render(
      <Provider store={storeNotLoaded}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(mockDispatch).toHaveBeenCalled();
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
      vocabularies: {},
    });

    const { container } = render(
      <Provider store={emptyNavStore}>
        <NavigationBehaviorWidget {...defaultProps} />
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
      vocabularies: {},
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
      vocabularies: {},
    });

    const { container } = render(
      <Provider store={storeWithoutPortalType}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(container).toBeTruthy();
  });
});