import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { render } from '@testing-library/react';
import AlignChooser from './AlignChooser';

const mockStore = configureStore();

describe('AlignChooser', () => {
  const props = {
    align: 'left',
    onChangeBlock: jest.fn(),
    data: { copyrightPosition: 'left' },
    block: '123',
    actions: ['left', 'right', 'center', 'full'],
  };
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  it('renders the align buttons', () => {
    const { container } = render(
      <Provider store={store}>
        <AlignChooser {...props} />
      </Provider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('calls onChangeBlock when an align button is clicked', () => {
    const { container } = render(
      <Provider store={store}>
        <AlignChooser {...props} />
      </Provider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('marks the active align button as active', () => {
    const { container } = render(
      <Provider store={store}>
        <AlignChooser {...props} />
      </Provider>,
    );
    expect(container).toMatchSnapshot();
  });
});
