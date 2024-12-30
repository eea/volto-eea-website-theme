import React from 'react';
import renderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import config from '@plone/volto/registry';
import { RichTextWidget } from './RichTextWidget';

jest.mock('@plone/volto-slate/editor/SlateEditor', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, selected = false }) => (
      <div data-testid="slate-editor">
        <span>Mocked Slate Editor</span>
        <span>Selected: {selected.toString()}</span>
        <span>Value: {JSON.stringify(value)}</span>
      </div>
    ),
  };
});

const mockStore = configureStore();
beforeAll(() => {
  config.settings = {
    slate: {
      slateWidgetExtensions: [],
    },
  };
});

const store = mockStore({
  intl: {
    locale: 'en-gb',
    messages: {},
  },
});

describe('RichTextWidget', () => {
  const defaultProps = {
    id: 'test-rich-text',
    name: 'test-rich-text',
    value: '',
    onChange: jest.fn(),
    selected: false,
  };
  it('renders an empty rich text widget component', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RichTextWidget {...defaultProps} />
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
  it('renders with mocked SlateEditor', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RichTextWidget {...defaultProps} />
      </Provider>,
    );

    const componentInstance = component.root;
    const element = componentInstance.find(
      (node) => node.props['data-testid'] === 'slate-editor',
    );

    expect(element).toBeDefined();
    expect(element.props['data-testid']).toBe('slate-editor');
  });
});
