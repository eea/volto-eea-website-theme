import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PrintLoader from './PrintLoader';
import { IntlProvider } from 'react-intl';

jest.mock('@eeacms/volto-eea-website-theme/helpers/setupPrintView', () => ({
  setupPrintView: jest.fn(),
}));

jest.mock('@eeacms/volto-eea-website-theme/helpers/loadLazyImages', () => ({
  loadLazyImages: jest.fn(),
}));

const mockStore = configureStore();

describe('PrintLoader', () => {
  it('should render loader when showLoader is true', () => {
    const store = mockStore({
      print: { isPrintLoading: true },
    });

    const { getByText } = render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <PrintLoader />
        </IntlProvider>
      </Provider>,
    );

    expect(getByText('Preparing download')).toBeInTheDocument();
  });

  it('should not render anything when showLoader is false', () => {
    const store = mockStore({
      print: { isPrintLoading: false },
    });

    const { container } = render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <PrintLoader />
        </IntlProvider>
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should call setupPrintView when Ctrl+P is pressed', () => {
    const store = mockStore({
      print: { isPrintLoading: false },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <PrintLoader />
        </IntlProvider>
      </Provider>,
    );

    fireEvent.keyDown(window, { key: 'p', ctrlKey: true });
    expect(
      require('@eeacms/volto-eea-website-theme/helpers/setupPrintView')
        .setupPrintView,
    ).toHaveBeenCalled();
  });

  it('should call loadLazyImages before printing', () => {
    const store = mockStore({
      print: { isPrintLoading: false },
    });

    render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <PrintLoader />
        </IntlProvider>
      </Provider>,
    );

    window.dispatchEvent(new Event('beforeprint'));
    expect(
      require('@eeacms/volto-eea-website-theme/helpers/loadLazyImages')
        .loadLazyImages,
    ).toHaveBeenCalled();
  });
});
