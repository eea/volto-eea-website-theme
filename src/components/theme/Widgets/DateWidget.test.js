import React from 'react';
import renderer from 'react-test-renderer';
import { DateWidget } from './DateWidget';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

const store = mockStore({
  intl: {
    locale: 'en-gb',
    messages: {},
  },
});

describe('DateWidget', () => {
  it('renders an empty date view widget component', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DateWidget />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a date view widget component', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DateWidget className="metadata" value="2020-08-04T09:00:00" />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a date view widget component with custom format', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DateWidget
          className="metadata"
          value="2020-08-04T09:00:00"
          format={{
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          }}
        />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a date view widget component with children', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DateWidget className="metadata" value="2020-08-04T09:00:00">
          {(child) => <strong>{child}</strong>}
        </DateWidget>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
