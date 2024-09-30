import React from 'react';
import renderer from 'react-test-renderer';
import { DatetimeWidget } from './DatetimeWidget';
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

describe('DatetimeWidget', () => {
  it('renders an empty datetime view widget component', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DatetimeWidget />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a datetime view widget component with a date and time', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DatetimeWidget className="metadata" value="2024-09-05T15:34:00" />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a datetime view widget component with children formatting', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DatetimeWidget className="metadata" value="2024-09-05T15:34:00">
          {(formattedDate) => <strong>{formattedDate}</strong>}
        </DatetimeWidget>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('removes the comma in the formatted date and shows correct time', () => {
    const component = renderer.create(
      <Provider store={store}>
        <DatetimeWidget className="metadata" value="2024-09-05T15:34:00" />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();

    const instance = component.root;
    const span = instance.findByType('span');
    expect(span.props.children).toContain('05 Sept 2024 15:34');
  });
});
