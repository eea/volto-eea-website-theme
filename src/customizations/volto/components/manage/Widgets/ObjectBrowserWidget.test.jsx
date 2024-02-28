import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ObjectBrowserWidgetComponent from './ObjectBrowserWidget';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();
let store;
let history;

describe('ObjectBrowserWidgetComponent', () => {
  beforeEach(() => {
    store = mockStore({
      search: {
        subrequests: {
          'testBlock-multiple': {},
          'testBlock-link': {},
        },
      },
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    history = createMemoryHistory();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ObjectBrowserWidgetComponent
            id="my-widget"
            title="My widget"
            onChange={() => {}}
            openObjectBrowser={() => {}}
          />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });

  it('renders without crashing with values, mode different than multiple, and description', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ObjectBrowserWidgetComponent
            id="my-widget"
            title="My widget"
            value={[{ '@id': 'http://locahost:3000/test' }, { title: 'test2' }]}
            mode="custom"
            description="My description"
            onChange={() => {}}
            openObjectBrowser={() => {}}
          />
        </Router>
      </Provider>,
    );

    expect(container).toBeTruthy();
  });

  it('renders without crashing with values, mode different than multiple and triggers the cancel function', () => {
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ObjectBrowserWidgetComponent
            id="my-widget"
            title="My widget"
            mode="custom"
            description="My description"
            onChange={() => {}}
            openObjectBrowser={() => {}}
            allowExternals={true}
            placeholder="My placeholder"
          />
        </Router>
      </Provider>,
    );

    fireEvent.change(getByPlaceholderText('My placeholder'), {
      target: { value: 'http://localhost:8080/Plone/test' },
    });

    expect(container.querySelector('button.cancel')).toBeInTheDocument();
    fireEvent.click(container.querySelector('button.cancel'));

    expect(container.querySelector('button.action')).toBeInTheDocument();
    fireEvent.click(container.querySelector('button.action'));
  });

  it('renders without crashing with values, mode different than multiple with placeholder and triggers the cancel function', () => {
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ObjectBrowserWidgetComponent
            id="my-widget"
            title="My widget"
            mode="custom"
            description="My description"
            onChange={() => {}}
            openObjectBrowser={() => {}}
            allowExternals={true}
          />
        </Router>
      </Provider>,
    );

    expect(getByPlaceholderText('No items selected')).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText('No items selected'), {
      target: { value: 'test' },
    });

    expect(container.querySelector('button.cancel')).toBeInTheDocument();
    fireEvent.click(container.querySelector('button.cancel'));

    expect(container.querySelector('button.action')).toBeInTheDocument();

    expect(container).toBeTruthy();
  });

  it('renders without crashing with values, mode different than multiple and triggers for keydown, change and submit', () => {
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <Router history={history}>
          <ObjectBrowserWidgetComponent
            id="my-widget"
            title="My widget"
            mode="custom"
            description="My description"
            onChange={() => {}}
            openObjectBrowser={() => {}}
            allowExternals={true}
          />
        </Router>
      </Provider>,
    );

    expect(getByPlaceholderText('No items selected')).toBeInTheDocument();
    fireEvent.keyDown(getByPlaceholderText('No items selected'), {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    });
    fireEvent.keyDown(getByPlaceholderText('No items selected'), {
      key: 'Escape',
      code: 'Escape',
      charCode: 27,
    });
    fireEvent.keyDown(getByPlaceholderText('No items selected'), {
      key: 'A',
      code: 'KeyA',
    });

    fireEvent.change(getByPlaceholderText('No items selected'), {
      target: { value: 'http://localhost:3000/Plone/test' },
    });
    expect(container.querySelector('button.primary')).toBeInTheDocument();

    fireEvent.click(container.querySelector('button.cancel'));

    expect(container).toBeTruthy();
  });

  it('renders without crashing with values, mode different than multiple and triggers for click on the Popup', () => {
    const { container } = render(
      <Provider store={store}>
        <Router history={history}>
          <ObjectBrowserWidgetComponent
            id="my-widget"
            title="My widget"
            value={[{ '@id': 'http://locahost:3000/test', title: 'Title 1' }]}
            description="My description"
            onChange={() => {}}
            openObjectBrowser={() => {}}
          />
        </Router>
      </Provider>,
    );

    expect(container.querySelector('.icon.right')).toBeInTheDocument();
    fireEvent.click(container.querySelector('.icon.right'));
    expect(container).toBeTruthy();
  });
});
