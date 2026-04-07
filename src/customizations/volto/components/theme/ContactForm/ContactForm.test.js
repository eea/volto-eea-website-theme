import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import ContactForm from './ContactForm';

jest.mock('react-portal', () => ({
  Portal: jest.fn(() => <div id="Portal" />),
}));

jest.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

const mockStore = configureStore();

describe('Contact form', () => {
  it('renders a contact form', () => {
    const store = mockStore({
      emailNotification: {
        error: {},
        loaded: false,
        loading: false,
      },
      intl: {
        locale: 'en',
        messages: {},
      },
      userSession: {},
      content: {},
    });
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <ContactForm location={{ pathname: '/blog' }} />
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a contact form with error message', () => {
    const store = mockStore({
      emailNotification: {
        error: {
          message: 'Error foo',
        },
        loaded: false,
        loading: false,
      },
      intl: {
        locale: 'en',
        messages: {},
      },
      userSession: {},
      content: {},
    });
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <ContactForm location={{ pathname: '/' }} />
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
