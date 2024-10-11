import React from 'react';
import { render } from '@testing-library/react';
import ContextNavigationView from './ContextNavigationView';
import { Router } from 'react-router-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/components/theme/Navigation/ContextNavigation', () => {
  return {
    __esModule: true,
    default: ({ params }) => {
      return <div>ConnectedContextNavigation {params.root_path}</div>;
    },
  };
});

jest.mock('@plone/volto/helpers', () => ({
  withBlockExtensions: jest.fn((Component) => Component),
  emptyBlocksForm: jest.fn(),
  getBlocksLayoutFieldname: () => 'blocks_layout',
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
