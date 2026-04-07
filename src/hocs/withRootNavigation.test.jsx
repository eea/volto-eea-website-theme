import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk'; // ✅ Add redux-thunk middleware
import { render } from '@testing-library/react';
import withRootNavigation from './withRootNavigation';
import { getNavigation } from '@plone/volto/actions/navigation/navigation';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { hasApiExpander } from '@plone/volto/helpers/Utils/Utils';
import config from '@plone/volto/registry';

jest.mock('@plone/volto/actions/navigation/navigation', () => ({
  getNavigation: jest.fn(() => ({ type: 'GET_NAVIGATION' })),
}));
jest.mock('@plone/volto/helpers/Url/Url', () => ({
  getBaseUrl: jest.fn(() => '/en'),
}));
jest.mock('@plone/volto/helpers/Utils/Utils', () => ({
  hasApiExpander: jest.fn(() => false),
}));
jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: { navDepth: 2 },
  },
}));

const mockStore = configureStore([thunk]);

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

    expect(getBaseUrl).toHaveBeenCalledWith('/en');
    expect(hasApiExpander).toHaveBeenCalledWith('navigation', '/en');
    expect(getNavigation).toHaveBeenCalledWith('/en', config.settings.navDepth);
  });

  test('does not call getNavigation if API expander is already set', () => {
    hasApiExpander.mockReturnValue(true);

    render(
      <Provider store={store}>
        <WrappedComponent />
      </Provider>,
    );

    expect(getNavigation).not.toHaveBeenCalled();
  });
});
