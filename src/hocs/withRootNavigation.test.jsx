import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk'; // ✅ Add redux-thunk middleware
import { render, screen } from '@testing-library/react';
import withRootNavigation from './withRootNavigation';
import { getNavigation } from '@plone/volto/actions';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

// Mock dependencies
jest.mock('@plone/volto/actions', () => ({
  getNavigation: jest.fn(() => ({ type: 'GET_NAVIGATION' })), // ✅ Ensure it returns a plain object
}));
jest.mock('@plone/volto/helpers', () => ({
  getBaseUrl: jest.fn(() => '/en'),
  hasApiExpander: jest.fn(() => false),
}));
jest.mock('@plone/volto/registry', () => ({
  settings: { navDepth: 2 },
}));

// ✅ Use redux-thunk middleware
const mockStore = configureStore([thunk]); // Add thunk to support async actions

const initialState = {
  navigation: { items: [{ title: 'Home', url: '/' }] },
  intl: { locale: 'en' },
};

const store = mockStore(initialState);

// Mock Wrapped Component
const MockComponent = (props) => {
  return (
    <div data-testid="wrapped-component">{JSON.stringify(props.items)}</div>
  );
};

const WrappedComponent = withRootNavigation(MockComponent);

describe('withRootNavigation HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls getNavigation when API expander is not set', () => {
    render(
      <Provider store={store}>
        <WrappedComponent />
      </Provider>,
    );

    expect(getBaseUrl).toHaveBeenCalledWith('/en'); // Check base URL calculation
    expect(hasApiExpander).toHaveBeenCalledWith('navigation', '/en'); // Ensure API expander is checked
    expect(getNavigation).toHaveBeenCalledWith('/en', config.settings.navDepth); // Ensure getNavigation is dispatched
  });

  test('does not call getNavigation if API expander is already set', () => {
    hasApiExpander.mockReturnValue(true); // Simulate that API expander is already set

    render(
      <Provider store={store}>
        <WrappedComponent />
      </Provider>,
    );

    expect(getNavigation).not.toHaveBeenCalled(); // Ensure getNavigation is NOT called
  });
});
