import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { waitFor, render, screen } from '@testing-library/react';

import UserSelectWidget, {
  normalizeChoices,
  normalizeSingleSelectOption,
} from './UserSelectWidget';

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

// Test search logic (filters results based on query)
test('filters choices based on search query', () => {
  const mockData = [
    { email: 'george@example.com', token: 'george', title: 'George' },
    { email: 'hannah@example.com', token: 'hannah', title: 'Hannah' },
  ];

  const result = normalizeChoices(mockData, {
    formatMessage: (msg) => msg.defaultMessage,
  });

  const filteredResults = result.filter((item) =>
    item.label.toLowerCase().includes('geo'),
  );

  expect(filteredResults).toEqual([
    { value: 'george', label: 'George', email: 'george@example.com' },
  ]);
});

test('normalizes a valid object with email', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user1', title: 'User One', email: 'user1@example.com' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user1',
    label: 'User One',
    email: 'user1@example.com',
  });
});

test('normalizes an object with missing email', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user2', title: 'User Two' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user2',
    label: 'User Two',
    email: 'No email available',
  });
});

test('normalizes an array [token, title]', () => {
  const result = normalizeSingleSelectOption(['user3', 'User Three'], {
    formatMessage: (msg) => msg.defaultMessage,
  });

  expect(result).toEqual({
    value: 'user3',
    label: 'User Three',
    email: '',
  });
});

test('throws an error for unexpected array format', () => {
  expect(() => {
    normalizeSingleSelectOption(['wrongFormat'], {
      formatMessage: (msg) => msg.defaultMessage,
    });
  }).toThrow('Unknown value type of select widget: wrongFormat');
});

test('normalizes an object with only token', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user4' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user4',
    label: 'user4',
    email: 'No email available',
  });
});

test('returns input when value is null or undefined', () => {
  expect(normalizeSingleSelectOption(null, {})).toBe(null);
  expect(normalizeSingleSelectOption(undefined, {})).toBe(undefined);
});

// Test normalizeSingleSelectOption with an object missing title
test('normalizes an object with missing title', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user5', email: 'user5@example.com' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user5',
    label: 'user5',
    email: 'user5@example.com',
  });
});

// Test normalizeChoices with an empty array
test('handles empty array correctly in normalizeChoices', () => {
  const result = normalizeChoices([], {
    formatMessage: (msg) => msg.defaultMessage,
  });

  expect(result).toEqual([]);
});

// Test normalizeSingleSelectOption when title is "None"
test('defaults label to token when title is "None"', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user6', title: 'None', email: 'user6@example.com' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user6',
    label: 'user6',
    email: 'user6@example.com',
  });
});

// Test normalizeSingleSelectOption with both token and value fields
test('handles object with both token and value', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user7', value: 'actualValue', title: 'User Seven' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user7',
    label: 'User Seven',
    email: 'No email available',
  });
});

// Test normalizeChoices with nested objects (should gracefully ignore extra data)
test('ignores extra nested data in normalizeChoices', () => {
  const mockData = [
    {
      email: 'nested@example.com',
      token: 'nestedUser',
      title: 'Nested User',
      extraField: { something: 'should be ignored' },
    },
  ];

  const result = normalizeChoices(mockData, {
    formatMessage: (msg) => msg.defaultMessage,
  });

  expect(result).toEqual([
    {
      value: 'nestedUser',
      label: 'Nested User',
      email: 'nested@example.com',
    },
  ]);
});
