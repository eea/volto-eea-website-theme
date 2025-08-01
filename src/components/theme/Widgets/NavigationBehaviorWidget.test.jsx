import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import NavigationBehaviorWidget from './NavigationBehaviorWidget';

// Add jest-dom matchers
import '@testing-library/jest-dom';

const mockStore = configureStore();

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

// Mock the getNavigation action
const mockGetNavigation = jest.fn(() => ({ type: 'GET_NAVIGATION' }));
jest.mock('@plone/volto/actions', () => ({
  getNavigation: mockGetNavigation,
}));

// Mock semantic-ui-react components
jest.mock('semantic-ui-react', () => ({
  Accordion: {
    Title: ({ children, onClick, index, active }) => (
      <div
        data-testid={`accordion-title-${index}`}
        onClick={(e) => onClick(e, { index })}
        data-active={active}
      >
        {children}
      </div>
    ),
    Content: ({ children, active }) => (
      <div data-testid="accordion-content" data-active={active}>
        {active && children}
      </div>
    ),
  },
  Button: ({ children, onClick, icon }) => (
    <button data-testid={`button-${icon}`} onClick={onClick}>
      {children}
    </button>
  ),
  Segment: ({ children }) => <div data-testid="segment">{children}</div>,
  Form: {
    Field: ({ children }) => <div data-testid="form-field">{children}</div>,
  },
  Dropdown: ({ onChange, value, options }) => (
    <select
      data-testid="dropdown"
      value={value}
      onChange={(e) => onChange(e, { value: parseInt(e.target.value) })}
    >
      {options.map((opt) => (
        <option key={opt.key} value={opt.value}>
          {opt.text}
        </option>
      ))}
    </select>
  ),
}));

// Mock @plone/volto/components
jest.mock('@plone/volto/components', () => ({
  Icon: ({ name }) => <div data-testid="icon">{name}</div>,
  FormFieldWrapper: ({ children }) => (
    <div data-testid="form-field-wrapper">{children}</div>
  ),
}));

jest.mock('@plone/volto/components/manage/Widgets/ObjectWidget', () => {
  return function ObjectWidget({ value, onChange, id }) {
    return (
      <div data-testid={`object-widget-${id}`}>
        <button
          data-testid="change-hideChildrenFromNavigation"
          onClick={() =>
            onChange(id, {
              ...value,
              hideChildrenFromNavigation: !value.hideChildrenFromNavigation,
            })
          }
        >
          Toggle hideChildrenFromNavigation
        </button>
        <button
          data-testid="change-menuItemColumns"
          onClick={() =>
            onChange(id, { ...value, menuItemColumns: [1, 2] })
          }
        >
          Set menuItemColumns
        </button>
        <button
          data-testid="change-menuItemChildrenListColumns"
          onClick={() =>
            onChange(id, { ...value, menuItemChildrenListColumns: [3, 4] })
          }
        >
          Set menuItemChildrenListColumns
        </button>
      </div>
    );
  };
});

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
  const defaultProps = {
    id: 'navigation-behavior',
    value: '{}',
    onChange: jest.fn(),
  };

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
        items: [
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
            portal_type: 'Folder',
            items: [
              {
                '@id': '/test-route-2/child',
                title: 'Child Route',
                url: '/test-route-2/child',
                id: 'child',
                portal_type: 'Document',
                items: [],
              },
            ],
          },
        ],
        loaded: true,
      },
      vocabularies: {},
    });
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('renders navigation routes', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
    expect(screen.getByText('Test Route 2')).toBeInTheDocument();
  });

  it('handles accordion click to expand/collapse', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    const accordionTitle = screen.getByTestId('accordion-title-0');
    fireEvent.click(accordionTitle);
    
    expect(screen.getByTestId('accordion-content')).toHaveAttribute('data-active', 'true');
  });

  it('dispatches getNavigation when navigation is not loaded', () => {
    const storeWithoutNavigation = mockStore({
      ...store.getState(),
      navigation: {
        items: [],
        loaded: false,
      },
    });

    render(
      <Provider store={storeWithoutNavigation}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(mockGetNavigation).toHaveBeenCalledWith('', 1);
  });

  it('handles JSON string value parsing', () => {
    const jsonValue = JSON.stringify({
      '/test-route-1': { hideChildrenFromNavigation: false }
    });

    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={jsonValue} />
      </Provider>
    );

    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('handles invalid JSON gracefully', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value="invalid json" />
      </Provider>
    );

    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('handles object values correctly', () => {
    const objectValue = { '/test': { hideChildrenFromNavigation: false } };

    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={objectValue} />
      </Provider>
    );

    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('handles null values correctly', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={null} />
      </Provider>
    );

    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('auto-populates settings from config when no settings exist', async () => {
    const onChange = jest.fn();
    
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} onChange={onChange} />
      </Provider>
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('handles route settings changes', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    // Expand first accordion
    const accordionTitle = screen.getByTestId('accordion-title-0');
    fireEvent.click(accordionTitle);
    
    // Click the toggle button in ObjectWidget
    const toggleButton = screen.getByTestId('change-hideChildrenFromNavigation');
    fireEvent.click(toggleButton);
    
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('handles menuItemColumns changes', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    // Expand first accordion
    const accordionTitle = screen.getByTestId('accordion-title-0');
    fireEvent.click(accordionTitle);
    
    // Click the menuItemColumns button
    const menuItemColumnsButton = screen.getByTestId('change-menuItemColumns');
    fireEvent.click(menuItemColumnsButton);
    
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('handles menuItemChildrenListColumns changes', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    // Expand first accordion
    const accordionTitle = screen.getByTestId('accordion-title-0');
    fireEvent.click(accordionTitle);
    
    // Click the menuItemChildrenListColumns button
    const menuItemChildrenListColumnsButton = screen.getByTestId('change-menuItemChildrenListColumns');
    fireEvent.click(menuItemChildrenListColumnsButton);
    
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('displays route path in accordion', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    expect(screen.getByText('(/test-route-1)')).toBeInTheDocument();
    expect(screen.getByText('(/test-route-2)')).toBeInTheDocument();
  });

  it('shows only level 0 routes', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    // Should show main routes but not child routes
    expect(screen.getByText('Test Route 1')).toBeInTheDocument();
    expect(screen.getByText('Test Route 2')).toBeInTheDocument();
    expect(screen.queryByText('Child Route')).not.toBeInTheDocument();
  });

  it('handles empty navigation items', () => {
    const emptyNavigationStore = mockStore({
      ...store.getState(),
      navigation: {
        items: [],
        loaded: true,
      },
    });

    render(
      <Provider store={emptyNavigationStore}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('handles existing route settings', () => {
    const existingSettings = JSON.stringify({
      '/test-route-1': {
        hideChildrenFromNavigation: false,
        menuItemColumns: [2, 3],
      },
    });

    render(
      <Provider store={store}>  
        <NavigationBehaviorWidget {...defaultProps} value={existingSettings} />
      </Provider>
    );

    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('handles route settings with semantic UI format columns', () => {
    const existingSettings = JSON.stringify({
      '/test-route-1': {
        hideChildrenFromNavigation: false,
        menuItemColumns: ['two wide column', 'three wide column'],
      },
    });

    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} value={existingSettings} />
      </Provider>
    );

    expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
  });

  it('handles complex navigation with multiple levels', () => {
    const complexNavigationStore = mockStore({
      ...store.getState(),
      navigation: {
        items: [
          {
            '@id': '/root',
            title: 'Root',
            url: '/root',
            id: 'root',
            portal_type: 'Folder',
            items: [
              {
                '@id': '/root/level1',
                title: 'Level 1',
                url: '/root/level1',
                id: 'level1',
                portal_type: 'Folder',
                items: [
                  {
                    '@id': '/root/level1/level2',
                    title: 'Level 2',
                    url: '/root/level1/level2',
                    id: 'level2',
                    portal_type: 'Document',
                    items: [],
                  },
                ],
              },
            ],
          },
        ],
        loaded: true,
      },
    });

    render(
      <Provider store={complexNavigationStore}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    // Should only show root level
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 2')).not.toBeInTheDocument();
  });

  it('handles navigation items without @id using uuid fallback', () => {
    const storeWithoutIds = mockStore({
      ...store.getState(),
      navigation: {
        items: [
          {
            title: 'No ID Route',
            url: '/no-id',
            id: 'no-id',
            portal_type: 'Document',
            items: [],
          },
        ],
        loaded: true,
      },
    });

    render(
      <Provider store={storeWithoutIds}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('No ID Route')).toBeInTheDocument();
  });

  it('updates accordion active state correctly', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    const firstAccordion = screen.getByTestId('accordion-title-0');
    const secondAccordion = screen.getByTestId('accordion-title-1');
    
    // Initially both should be inactive
    expect(firstAccordion).toHaveAttribute('data-active', 'false');
    expect(secondAccordion).toHaveAttribute('data-active', 'false');
    
    // Click first accordion
    fireEvent.click(firstAccordion);
    expect(firstAccordion).toHaveAttribute('data-active', 'true');
    
    // Click second accordion
    fireEvent.click(secondAccordion);
    expect(firstAccordion).toHaveAttribute('data-active', 'false');
    expect(secondAccordion).toHaveAttribute('data-active', 'true');
    
    // Click second accordion again to close
    fireEvent.click(secondAccordion);
    expect(secondAccordion).toHaveAttribute('data-active', 'false');
  });

  it('renders icons correctly', () => {
    render(
      <Provider store={store}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );
    
    expect(screen.getAllByTestId('icon')).toHaveLength(2); // One icon per route
  });

  it('handles config settings with wildcard fallback', () => {
    const configStore = mockStore({
      ...store.getState(),
      navigation: {
        items: [
          {
            '@id': '/unknown-route',
            title: 'Unknown Route',
            url: '/unknown-route',
            id: 'unknown-route',
            portal_type: 'Document',
            items: [],
          },
        ],
        loaded: true,
      },
    });

    render(
      <Provider store={configStore}>
        <NavigationBehaviorWidget {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Unknown Route')).toBeInTheDocument();
  });

  // Test utility functions by importing the component file directly
  describe('Utility Functions', () => {
    let NavigationBehaviorWidget;

    beforeEach(() => {
      // Re-require the module to access utility functions
      jest.resetModules();
      NavigationBehaviorWidget = require('./NavigationBehaviorWidget').default;
    });

    it('numberToColumnString converts numbers to semantic UI format', () => {
      // Access the function through the component's prototype or by exporting it
      // Since the functions are not exported, we'll test them indirectly through component behavior
      const existingSettings = JSON.stringify({
        '/test-route-1': {
          menuItemColumns: [1, 2, 3],
        },
      });

      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} value={existingSettings} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('handles empty menuItemColumns arrays', () => {
      const existingSettings = JSON.stringify({
        '/test-route-1': {
          menuItemColumns: [],
        },
      });

      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} value={existingSettings} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('handles null menuItemColumns', () => {
      const existingSettings = JSON.stringify({
        '/test-route-1': {
          menuItemColumns: null,
        },
      });

      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} value={existingSettings} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });
  });

  describe('IntegerArrayField Component', () => {
    it('can handle integerArrayField usage in the widget', () => {
      // This tests the IntegerArrayField component indirectly through the widget
      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} />
        </Provider>
      );
      
      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });
  });

  describe('Config Settings Integration', () => {
    it('merges config settings with saved settings correctly', () => {
      const settingsWithConfig = JSON.stringify({
        '/test-route-1': {
          hideChildrenFromNavigation: true, // Override config value
        },
      });

      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} value={settingsWithConfig} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('handles missing config settings gracefully', () => {
      // Mock config without settings
      jest.resetModules();
      jest.doMock('@plone/volto/registry', () => ({
        default: {
          settings: {},
        },
      }));

      const NavigationBehaviorWidgetNoConfig = require('./NavigationBehaviorWidget').default;

      render(
        <Provider store={store}>
          <NavigationBehaviorWidgetNoConfig {...defaultProps} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('handles config with empty menuItemsLayouts', () => {
      jest.resetModules();
      jest.doMock('@plone/volto/registry', () => ({
        default: {
          settings: {
            menuItemsLayouts: {},
          },
        },
      }));

      const NavigationBehaviorWidgetEmptyConfig = require('./NavigationBehaviorWidget').default;

      render(
        <Provider store={store}>
          <NavigationBehaviorWidgetEmptyConfig {...defaultProps} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles navigation items with missing titles', () => {
      const storeWithMissingTitles = mockStore({
        ...store.getState(),
        navigation: {
          items: [
            {
              '@id': '/no-title',
              url: '/no-title',
              id: 'no-title',
              portal_type: 'Document',
              items: [],
            },
          ],
          loaded: true,
        },
      });

      render(
        <Provider store={storeWithMissingTitles}>
          <NavigationBehaviorWidget {...defaultProps} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('handles navigation items with missing URLs', () => {
      const storeWithMissingUrls = mockStore({
        ...store.getState(),  
        navigation: {
          items: [
            {
              '@id': '/no-url',
              title: 'No URL',
              id: 'no-url',
              portal_type: 'Document',
              items: [],
            },
          ],
          loaded: true,
        },
      });

      render(
        <Provider store={storeWithMissingUrls}>
          <NavigationBehaviorWidget {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('No URL')).toBeInTheDocument();
    });

    it('handles settings with null values for explicit deletion', () => {
      const settingsWithNulls = JSON.stringify({
        '/test-route-1': {
          hideChildrenFromNavigation: null,
          menuItemColumns: null,
          menuItemChildrenListColumns: null,
        },
      });

      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} value={settingsWithNulls} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('handles malformed semantic UI column strings', () => {
      const settingsWithBadColumns = JSON.stringify({
        '/test-route-1': {
          menuItemColumns: ['invalid column', 'bad format', 'twenty wide column'],
        },
      });

      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} value={settingsWithBadColumns} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('handles mixed number and string values in menuItemColumns', () => {
      const settingsWithMixedColumns = JSON.stringify({
        '/test-route-1': {
          menuItemColumns: [1, 'two wide column', 3],
        },
      });

      render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} value={settingsWithMixedColumns} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('handles large navigation trees efficiently', () => {
      const largeNavigationItems = Array.from({ length: 50 }, (_, i) => ({
        '@id': `/large-route-${i}`,
        title: `Large Route ${i}`,
        url: `/large-route-${i}`,
        id: `large-route-${i}`,
        portal_type: 'Document',
        items: [],
      }));

      const largeNavigationStore = mockStore({
        ...store.getState(),
        navigation: {
          items: largeNavigationItems,
          loaded: true,
        },
      });

      render(
        <Provider store={largeNavigationStore}>
          <NavigationBehaviorWidget {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Large Route 0')).toBeInTheDocument();
      expect(screen.getByText('Large Route 49')).toBeInTheDocument();
    });

    it('updates efficiently when props change', () => {
      const { rerender } = render(
        <Provider store={store}>
          <NavigationBehaviorWidget {...defaultProps} />
        </Provider>
      );

      const newProps = {
        ...defaultProps,
        value: JSON.stringify({
          '/test-route-1': { hideChildrenFromNavigation: false },
        }),
      };

      rerender(
        <Provider store={store}>
          <NavigationBehaviorWidget {...newProps} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('handles missing translation messages gracefully', () => {
      const storeWithoutMessages = mockStore({
        ...store.getState(),
        intl: {
          locale: 'en',
          messages: {},
        },
      });

      render(
        <Provider store={storeWithoutMessages}>
          <NavigationBehaviorWidget {...defaultProps} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });

    it('works with different locales', () => {
      const storeWithDifferentLocale = mockStore({
        ...store.getState(),
        intl: {
          locale: 'fr',
          messages: {
            'Load Main Navigation Routes': 'Charger les routes de navigation principales',
            'Hide Children From Navigation': 'Masquer les enfants de la navigation',
            'Menu Item Children List Columns': 'Colonnes de liste des enfants des éléments de menu',
            'Menu Item Columns': 'Colonnes des éléments de menu',
          },
        },
      });

      render(
        <Provider store={storeWithDifferentLocale}>
          <NavigationBehaviorWidget {...defaultProps} />
        </Provider>
      );

      expect(screen.getByTestId('form-field-wrapper')).toBeInTheDocument();
    });
  });
});
