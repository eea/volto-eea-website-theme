import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import LayoutSettingsView from './LayoutSettingsView';

const mockStore = configureStore();
let history = createMemoryHistory();

describe('LayoutSettingsView Component', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });

    const data = {
      '@layout': 'e28ec238-4cd7-4b72-8025-66da44a6062f',
      '@type': 'layoutSettings',
      block: '87911ec6-4242-4bae-b6a5-9b28151169fa',
      body_class: 'body-class-1',
      layout_size: 'container_view',
    };

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <LayoutSettingsView data={data} />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });
});

describe('LayoutSettingsView Component', () => {
  it('renders without crashing with multiple classes', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });

    const data = {
      '@layout': 'e28ec238-4cd7-4b72-8025-66da44a6062f',
      '@type': 'layoutSettings',
      block: '87911ec6-4242-4bae-b6a5-9b28151169fa',
      body_class: ['body-class-1', 'body-class-2'],
      layout_size: 'container_view',
    };

    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <LayoutSettingsView data={data} />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });
});
