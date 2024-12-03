import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import NumberWidget from './NumberWidget';

const mockStore = configureStore();

const store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
  },
});

describe('NumberWidget', () => {
  it('renders a number widget component', () => {
    const onChange = jest.fn();
    render(
      <Provider store={store}>
        <NumberWidget
          id="my-field"
          title="My field"
          fieldSet="default"
          onChange={onChange}
        />
      </Provider>,
    );

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  describe('onChange behavior', () => {
    it('converts string value to number on change', () => {
      const onChange = jest.fn();
      render(
        <Provider store={store}>
          <NumberWidget id="my-field" title="My field" onChange={onChange} />
        </Provider>,
      );

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '42' } });

      expect(onChange).toHaveBeenCalledWith('my-field', 42);
    });

    it('handles empty value correctly', () => {
      const onChange = jest.fn();
      render(
        <Provider store={store}>
          <NumberWidget
            id="my-field"
            value="1"
            title="My field"
            onChange={onChange}
          />
        </Provider>,
      );

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith('my-field', undefined);
    });
  });

  describe('onBlur behavior', () => {
    it('calls onBlur with the current value', () => {
      const onBlur = jest.fn();
      render(
        <Provider store={store}>
          <NumberWidget
            id="my-field"
            title="My field"
            onBlur={onBlur}
            value="123"
          />
        </Provider>,
      );

      const input = screen.getByRole('spinbutton');
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('validation constraints', () => {
    it('respects minimum and maximum values', () => {
      render(
        <Provider store={store}>
          <NumberWidget
            id="my-field"
            title="My field"
            minimum={1}
            maximum={100}
          />
        </Provider>,
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '100');
    });

    it('handles step attribute', () => {
      render(
        <Provider store={store}>
          <NumberWidget id="my-field" title="My field" step={0.5} />
        </Provider>,
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.5');
    });
  });
});
