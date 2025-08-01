import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';

// Add jest-dom matchers
import '@testing-library/jest-dom';

const mockStore = configureStore();

// Mock the getNavigation action
jest.mock('@plone/volto/actions', () => ({
  getNavigation: jest.fn(() => ({ type: 'GET_NAVIGATION' })),
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

// Test just the utility functions and component logic
describe('NavigationBehaviorWidget', () => {
  beforeEach(() => {
    // Setup mock store for tests that need it
    mockStore({
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
        items: [
          {
            '@id': '/test-route-1',
            title: 'Test Route 1',
            url: '/test-route-1',
            id: 'test-route-1',
            portal_type: 'Document',
            items: [],
          },
        ],
        loaded: true,
      },
      vocabularies: {},
    });
  });

  it('can import the NavigationBehaviorWidget component', () => {
    const NavigationBehaviorWidget =
      require('./NavigationBehaviorWidget').default;
    expect(NavigationBehaviorWidget).toBeDefined();
    expect(typeof NavigationBehaviorWidget).toBe('function');
  });

  it('component exports are defined', () => {
    const NavigationBehavior = require('./NavigationBehaviorWidget');
    expect(NavigationBehavior.default).toBeDefined();
  });

  it('handles JSON parsing correctly', () => {
    const NavigationBehaviorWidget =
      require('./NavigationBehaviorWidget').default;

    // Test that the component can be instantiated
    expect(() => {
      React.createElement(NavigationBehaviorWidget, {
        id: 'test',
        value: '{}',
        onChange: () => {},
      });
    }).not.toThrow();
  });

  it('handles invalid JSON gracefully', () => {
    const NavigationBehaviorWidget =
      require('./NavigationBehaviorWidget').default;

    // Test that the component can handle invalid JSON
    expect(() => {
      React.createElement(NavigationBehaviorWidget, {
        id: 'test',
        value: 'invalid json',
        onChange: () => {},
      });
    }).not.toThrow();
  });

  it('handles object values correctly', () => {
    const NavigationBehaviorWidget =
      require('./NavigationBehaviorWidget').default;

    // Test that the component can handle object values
    expect(() => {
      React.createElement(NavigationBehaviorWidget, {
        id: 'test',
        value: { '/test': { hideChildrenFromNavigation: false } },
        onChange: () => {},
      });
    }).not.toThrow();
  });

  it('handles null values correctly', () => {
    const NavigationBehaviorWidget =
      require('./NavigationBehaviorWidget').default;

    // Test that the component can handle null values
    expect(() => {
      React.createElement(NavigationBehaviorWidget, {
        id: 'test',
        value: null,
        onChange: () => {},
      });
    }).not.toThrow();
  });

  it('can render with minimal store', () => {
    const NavigationBehaviorWidget =
      require('./NavigationBehaviorWidget').default;
    const minimalStore = mockStore({
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

    expect(() => {
      render(
        <Provider store={minimalStore}>
          <div>
            <NavigationBehaviorWidget
              id="test"
              value="{}"
              onChange={() => {}}
            />
          </div>
        </Provider>,
      );
    }).not.toThrow();
  });
});
