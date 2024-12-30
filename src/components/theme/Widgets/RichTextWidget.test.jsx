import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { breakList } from '@eeacms/volto-eea-website-theme/helpers/slate-extensions';
import config from '@plone/volto/registry';
import { RichTextWidget } from './RichTextWidget';

const mockStore = configureStore();
beforeAll(() => {
  config.settings.slate.slateWidgetExtensions = [breakList];
});

const store = mockStore({
  intl: {
    locale: 'en-gb',
    messages: {},
  },
});

describe('RichTextWidget', () => {
  it('renders an empty rich text widget component', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RichTextWidget />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a rich text widget component', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RichTextWidget
          className="metadata"
          value={{ data: '<b>Foo bar</b>' }}
        />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a rich text view widget component with children', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RichTextWidget className="metadata" value={{ data: '<b>Foo bar</b>' }}>
          {(child) => <strong>{child}</strong>}
        </RichTextWidget>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
