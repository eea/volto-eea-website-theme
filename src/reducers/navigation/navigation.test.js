import navigationReducer from './navigation';
import { GET_NAVIGATION_SETTINGS } from '../../constants/ActionTypes';

describe('navigation reducer', () => {
  const initialState = {
    error: null,
    items: {},
    loaded: false,
    loading: false,
  };

  it('should return the initial state', () => {
    expect(navigationReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_PENDING', () => {
    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_PENDING`,
    };

    const expectedState = {
      ...initialState,
      error: null,
      loaded: false,
      loading: true,
    };

    expect(navigationReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_PENDING when state has existing data', () => {
    const existingState = {
      error: 'Some error',
      items: { '/existing': { title: 'Existing' } },
      loaded: true,
      loading: false,
    };

    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_PENDING`,
    };

    const expectedState = {
      ...existingState,
      error: null,
      loaded: false,
      loading: true,
    };

    expect(navigationReducer(existingState, action)).toEqual(expectedState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_SUCCESS', () => {
    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_SUCCESS`,
      result: {
        '@id': '/test-page',
        title: 'Test Page',
        hideChildrenFromNavigation: false,
        menuItemColumns: [1, 2],
      },
    };

    const expectedState = {
      ...initialState,
      error: null,
      items: {
        '/test-page': {
          '@id': '/test-page',
          title: 'Test Page',
          hideChildrenFromNavigation: false,
          menuItemColumns: [1, 2],
        },
      },
      loaded: true,
      loading: false,
    };

    expect(navigationReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_SUCCESS with undefined hideChildrenFromNavigation', () => {
    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_SUCCESS`,
      result: {
        '@id': '/test-page',
        title: 'Test Page',
        // hideChildrenFromNavigation is undefined
        menuItemColumns: [1, 2],
      },
    };

    const expectedState = {
      ...initialState,
      error: null,
      items: {
        '/test-page': {
          '@id': '/test-page',
          title: 'Test Page',
          hideChildrenFromNavigation: true, // Should default to true
          menuItemColumns: [1, 2],
        },
      },
      loaded: true,
      loading: false,
    };

    expect(navigationReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_SUCCESS and merge with existing items', () => {
    const existingState = {
      error: null,
      items: {
        '/existing-page': {
          '@id': '/existing-page',
          title: 'Existing Page',
          hideChildrenFromNavigation: true,
        },
      },
      loaded: true,
      loading: false,
    };

    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_SUCCESS`,
      result: {
        '@id': '/new-page',
        title: 'New Page',
        hideChildrenFromNavigation: false,
      },
    };

    const expectedState = {
      ...existingState,
      error: null,
      items: {
        '/existing-page': {
          '@id': '/existing-page',
          title: 'Existing Page',
          hideChildrenFromNavigation: true,
        },
        '/new-page': {
          '@id': '/new-page',
          title: 'New Page',
          hideChildrenFromNavigation: false,
        },
      },
      loaded: true,
      loading: false,
    };

    expect(navigationReducer(existingState, action)).toEqual(expectedState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_SUCCESS and update existing item', () => {
    const existingState = {
      error: null,
      items: {
        '/test-page': {
          '@id': '/test-page',
          title: 'Old Title',
          hideChildrenFromNavigation: true,
        },
      },
      loaded: true,
      loading: false,
    };

    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_SUCCESS`,
      result: {
        '@id': '/test-page',
        title: 'Updated Title',
        hideChildrenFromNavigation: false,
        menuItemColumns: [1, 2, 3],
      },
    };

    const expectedState = {
      ...existingState,
      error: null,
      items: {
        '/test-page': {
          '@id': '/test-page',
          title: 'Updated Title',
          hideChildrenFromNavigation: false,
          menuItemColumns: [1, 2, 3],
        },
      },
      loaded: true,
      loading: false,
    };

    expect(navigationReducer(existingState, action)).toEqual(expectedState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_FAIL', () => {
    const existingState = {
      error: null,
      items: { '/existing': { title: 'Existing' } },
      loaded: true,
      loading: true,
    };

    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_FAIL`,
      error: 'Network error',
    };

    const expectedState = {
      ...existingState,
      error: 'Network error',
      items: {},
      loaded: false,
      loading: false,
    };

    expect(navigationReducer(existingState, action)).toEqual(expectedState);
  });

  it('should handle GET_NAVIGATION_SETTINGS_FAIL from initial state', () => {
    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_FAIL`,
      error: 'API error',
    };

    const expectedState = {
      ...initialState,
      error: 'API error',
      items: {},
      loaded: false,
      loading: false,
    };

    expect(navigationReducer(initialState, action)).toEqual(expectedState);
  });

  it('should return current state for unknown action types', () => {
    const currentState = {
      error: null,
      items: { '/test': { title: 'Test' } },
      loaded: true,
      loading: false,
    };

    const action = {
      type: 'UNKNOWN_ACTION',
      payload: 'some data',
    };

    expect(navigationReducer(currentState, action)).toBe(currentState);
  });

  it('should handle action without type property', () => {
    const currentState = {
      error: null,
      items: { '/test': { title: 'Test' } },
      loaded: true,
      loading: false,
    };

    const action = {
      payload: 'some data',
    };

    expect(navigationReducer(currentState, action)).toBe(currentState);
  });

  it('should handle empty action object', () => {
    const currentState = {
      error: null,
      items: { '/test': { title: 'Test' } },
      loaded: true,
      loading: false,
    };

    expect(navigationReducer(currentState, {})).toBe(currentState);
  });

  it('should handle success action with complex result object', () => {
    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_SUCCESS`,
      result: {
        '@id': '/complex-page',
        title: 'Complex Page',
        description: 'A complex navigation item',
        hideChildrenFromNavigation: false,
        menuItemColumns: [1, 2, 3],
        menuItemChildrenListColumns: [2, 4],
        customProperty: 'custom value',
        nestedObject: {
          nested: 'value',
        },
      },
    };

    const expectedState = {
      ...initialState,
      error: null,
      items: {
        '/complex-page': {
          '@id': '/complex-page',
          title: 'Complex Page',
          description: 'A complex navigation item',
          hideChildrenFromNavigation: false,
          menuItemColumns: [1, 2, 3],
          menuItemChildrenListColumns: [2, 4],
          customProperty: 'custom value',
          nestedObject: {
            nested: 'value',
          },
        },
      },
      loaded: true,
      loading: false,
    };

    expect(navigationReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle success action with null hideChildrenFromNavigation', () => {
    const action = {
      type: `${GET_NAVIGATION_SETTINGS}_SUCCESS`,
      result: {
        '@id': '/test-page',
        title: 'Test Page',
        hideChildrenFromNavigation: null,
      },
    };

    const expectedState = {
      ...initialState,
      error: null,
      items: {
        '/test-page': {
          '@id': '/test-page',
          title: 'Test Page',
          hideChildrenFromNavigation: true, // Should default to true when null
        },
      },
      loaded: true,
      loading: false,
    };

    expect(navigationReducer(initialState, action)).toEqual(expectedState);
  });
});