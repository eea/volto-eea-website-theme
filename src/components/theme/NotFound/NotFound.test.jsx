import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import NotFound from './NotFound';

const mockStore = configureStore();

jest.mock('@plone/volto/components', () => ({
  NotFound: () => <div data-testid="volto-notfound">Not Found Page</div>,
}));

jest.mock('@eeacms/volto-eea-website-theme/hocs', () => ({
  withRootNavigation: (Component) => Component,
}));

describe('NotFound Component', () => {
  let history;
  let store;

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
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <NotFound />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });

  it('renders the Volto NotFound component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Router history={history}>
          <NotFound />
        </Router>
      </Provider>,
    );

    expect(getByTestId('volto-notfound')).toBeTruthy();
  });
});
