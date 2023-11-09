import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-intl-redux';

import Logo from './Logo';

const mockStore = configureStore();
let history = createMemoryHistory();

describe('Logo', () => {
  it('renders a Logo component', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      router: {
        location: {
          pathname: '/',
        },
      },
    });

    const component = renderer.create(
      <Provider store={store}>
        <Router history={history}>
          <Logo />
        </Router>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
