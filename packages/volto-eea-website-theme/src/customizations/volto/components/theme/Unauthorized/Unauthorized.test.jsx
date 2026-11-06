import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Unauthorized from './Unauthorized';

const mockStore = configureStore();

const renderUnauthorized = (token) => {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
    userSession: { token },
    apierror: { message: 'Insufficient privileges' },
  });
  const history = createMemoryHistory({ initialEntries: ['/en/private'] });
  render(
    <Provider store={store}>
      <Router history={history}>
        <Unauthorized />
      </Router>
    </Provider>,
  );
  return history;
};

describe('Unauthorized', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects anonymous users to the login form', () => {
    const history = renderUnauthorized(null);

    expect(screen.getByText('5')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(history.location.pathname).toBe('/en/private/login');
    expect(history.location.search).toBe('?return_url=%2Fen%2Fprivate');
  });

  it('keeps authenticated users on the error page', () => {
    const history = renderUnauthorized('token');

    expect(screen.getByText('Insufficient privileges')).toBeInTheDocument();
    expect(screen.queryByText('Log in')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(history.location.pathname).toBe('/en/private');
  });
});
