import React from 'react';
import { render } from '@testing-library/react';
import ContextNavigationView from './ContextNavigationView';
import { Router } from 'react-router-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';

vi.mock('@plone/volto/components/theme/Navigation/ContextNavigation', () => {
  return {
    __esModule: true,
    default: ({ params }) => {
      return <div>ConnectedContextNavigation {params.root_path}</div>;
    },
  };
});

vi.mock('@plone/volto/helpers/Extensions', () => ({
  withBlockExtensions: vi.fn((Component) => Component),
}));

vi.mock('@plone/volto/helpers/Url/Url', () => ({
  __esModule: true,
  flattenToAppURL: () => '',
}));

const mockStore = configureStore();
const store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
  },
});

describe('ContextNavigationView', () => {
  let history;
  beforeEach(() => {
    history = createMemoryHistory();
  });

  it('renders corectly', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationView />
        </Router>
      </Provider>,
    );

    expect(container.firstChild).toHaveTextContent(
      'ConnectedContextNavigation',
    );
  });

  it('renders corectly', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ContextNavigationView
            data={{
              navProps: { root_path: 'https://localhost:3000/test' },
              root_node: [{ '@id': 'root_node' }],
            }}
          />
        </Router>
      </Provider>,
    );
    expect(container.firstChild).toHaveTextContent(
      'ConnectedContextNavigation',
    );
  });
});
