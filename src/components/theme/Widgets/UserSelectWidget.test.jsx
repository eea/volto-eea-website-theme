import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { waitFor, render, screen } from '@testing-library/react';

import UserSelectWidget, { normalizeChoices } from './UserSelectWidget';

const mockStore = configureStore();

jest.mock('@plone/volto/helpers/Loadable/Loadable');
beforeAll(
  async () =>
    await require('@plone/volto/helpers/Loadable/Loadable').__setLoadables(),
);

test('renders a select widget component', async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
    vocabularies: {
      'plone.app.vocabularies.Keywords': {
        items: [
          { email: 'myemail@provider.com', title: 'My item', value: 'myitem' },
        ],
        itemsTotal: 1,
      },
    },
  });

  const props = {
    getVocabulary: () => {
      return Promise.resolve({
        items: [
          { email: 'foo@provider.com', token: 'foo', title: 'Foo' },
          { email: 'bar@provider.com', token: 'bar', title: 'Bar' },
          { email: 'foobar@provider.com', token: 'fooBar', title: 'FooBar' },
        ],
      });
    },
    widgetOptions: {
      vocabulary: { '@id': 'plone.app.vocabularies.Keywords' },
    },
  };

  const { container } = render(
    <Provider store={store}>
      <UserSelectWidget
        {...props}
        id="my-field"
        title="My field"
        fieldSet="default"
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('My field'));
  expect(container).toMatchSnapshot();
});

// Test normalization of choices
test('normalizes vocabulary API response correctly', () => {
  const mockData = [
    { email: 'charlie@example.com', token: 'charlie', title: 'Charlie' },
    { email: 'dana@example.com', token: 'dana', title: 'Dana' },
  ];

  const result = normalizeChoices(mockData, {
    formatMessage: (msg) => msg.defaultMessage,
  });

  expect(result).toEqual([
    { value: 'charlie', label: 'Charlie', email: 'charlie@example.com' },
    { value: 'dana', label: 'Dana', email: 'dana@example.com' },
  ]);
});

// Test missing email default handling
test('defaults missing email to "No email available"', () => {
  const mockData = [{ token: 'no-email', title: 'No Email User' }];

  const result = normalizeChoices(mockData, {
    formatMessage: (msg) => msg.defaultMessage,
  });

  expect(result).toEqual([
    { value: 'no-email', label: 'No Email User', email: 'No email available' },
  ]);
});
