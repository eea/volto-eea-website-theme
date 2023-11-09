import React from 'react';
import withRootNavigation from './withRootNavigation';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-intl-redux';
import { render } from '@testing-library/react';

const mockStore = configureStore();
let history = createMemoryHistory();

describe('withRootNavigation', () => {
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
    navigation: {
      items: ['en'],
    },
  });
  const Block = (props) => {
    return (
      <>
        <div>My Block</div>
      </>
    );
  };
  it('injects navigation items into wrapped component', () => {
    const ExtendedComponent = withRootNavigation(Block);
    const items = [
      { title: 'page1', url: '/page1' },
      { title: 'page2', url: '/page2' },
    ];
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ExtendedComponent items={items} />
        </Router>
      </Provider>,
    );
    expect(container).toMatchSnapshot();
  });
});
