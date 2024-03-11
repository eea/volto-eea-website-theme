import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { TopicsWidget } from './TopicsWidget';

const mockStore = configureStore();
let history = createMemoryHistory();

describe('TopicsWidget Component', () => {
  it('renders without crashing, with value', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <TopicsWidget
            value={['Value1', 'Value2']}
            children={''}
            className={'test'}
          />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });

  it('renders without crashing, without value', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <TopicsWidget value={null} children={''} className={'test'} />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });
});
