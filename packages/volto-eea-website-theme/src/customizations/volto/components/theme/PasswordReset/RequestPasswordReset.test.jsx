import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';

import RequestPasswordReset from './RequestPasswordReset';

const mockStore = configureStore();

describe('RequestPasswordReset', () => {
  const renderPage = () =>
    render(
      <Provider
        store={mockStore({
          intl: { locale: 'en', messages: {} },
        })}
      >
        <RequestPasswordReset />
      </Provider>,
    );

  it('links to the Eionet password reset page', () => {
    const { getByRole } = renderPage();
    const link = getByRole('link', {
      name: 'Reset Eionet account password page',
    });
    expect(link).toHaveAttribute(
      'href',
      'https://www.eionet.europa.eu/password-reset',
    );
    expect(Helmet.peek().title).toBe('Password reset');
  });

  it('renders valid markup without a reference to a form', () => {
    const { container } = renderPage();
    expect(
      container.querySelector('#page-password-reset #passwordreset h1'),
    ).toHaveTextContent('Lost Password');
    const description = container.querySelector('p.documentDescription');
    expect(description.querySelector('div')).toBeNull();
    expect(description).toHaveTextContent('Eionet');
    expect(container).not.toHaveTextContent(/form below/i);
    expect(container.querySelector('form')).toBeNull();
  });
});
