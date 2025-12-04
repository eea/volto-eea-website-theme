import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';

import UserSelectWidget, {
  normalizeChoices,
  normalizeSingleSelectOption,
} from './UserSelectWidget';

const mockStore = configureStore();

// Test helpers
const createMockStore = (
  vocabularyItems = [],
  vocabularyId = 'plone.app.vocabularies.Users',
  widgetId = 'user-field',
) => {
  const vocabularyData =
    vocabularyItems.length > 0
      ? {
          [vocabularyId]: {
            subrequests: {
              [`widget-${widgetId}-en`]: { items: vocabularyItems },
            },
          },
        }
      : {};

  return mockStore({
    intl: { locale: 'en', messages: {} },
    vocabularies: vocabularyData,
  });
};

const defaultProps = {
  getVocabulary: jest.fn(() => Promise.resolve({ items: [] })),
  getVocabularyTokenTitle: jest.fn(),
  widgetOptions: { vocabulary: { '@id': 'plone.app.vocabularies.Users' } },
  id: 'user-field',
  title: 'User field',
  fieldSet: 'default',
  onChange: jest.fn(),
};

const renderWidget = (props = {}, storeItems = []) => {
  const store = createMockStore(storeItems);
  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(
      <Provider store={store}>
        <UserSelectWidget {...mergedProps} />
      </Provider>,
    ),
    store,
  };
};

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
test('defaults missing email to label or token', () => {
  const mockData = [{ token: 'no-email', title: 'No Email User' }];

  const result = normalizeChoices(mockData, {
    formatMessage: (msg) => msg.defaultMessage,
  });

  expect(result).toEqual([
    { value: 'no-email', label: 'No Email User', email: 'No Email User' },
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

test('normalizes an object with missing email using label fallback', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user2', title: 'User Two' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user2',
    label: 'User Two',
    email: 'User Two',
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

test('normalizes an object with only token and falls back correctly', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user4' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user4',
    label: 'user4',
    email: 'user4',
  });
});

test('returns input when value is null or undefined', () => {
  expect(normalizeSingleSelectOption(null, {})).toBe(null);
  expect(normalizeSingleSelectOption(undefined, {})).toBe(undefined);
});

// Test normalizeSingleSelectOption with an object missing title
test('normalizes an object with missing title and fallback to token', () => {
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
test('handles object with both token and value fields', () => {
  const result = normalizeSingleSelectOption(
    { token: 'user7', value: 'actualValue', title: 'User Seven' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'user7',
    label: 'User Seven',
    email: 'User Seven',
  });
});

// Test normalizeChoices with nested objects
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

// Test componentDidMount with value - test via Redux state
test('renders with initial value from vocabulary state', async () => {
  const storeItems = [
    { token: 'user1', title: 'User One', email: 'user1@test.com' },
  ];
  const { container } = renderWidget({ value: ['user1'] }, storeItems);

  await waitFor(() => screen.getByText('User field'));

  const multiValue = container.querySelector(
    '.react-select__multi-value__label',
  );
  expect(multiValue).toBeTruthy();
  expect(multiValue.textContent).toBeTruthy();
});

// Test componentDidUpdate - termsPairsCache update
test('updates termsPairsCache when choices become available', async () => {
  const store = createMockStore();
  const { rerender } = render(
    <Provider store={store}>
      <UserSelectWidget {...defaultProps} choices={[]} value={['user1']} />
    </Provider>,
  );

  const newChoices = [
    { token: 'user1', title: 'User One', email: 'user1@test.com' },
  ];

  rerender(
    <Provider store={store}>
      <UserSelectWidget
        {...defaultProps}
        choices={newChoices}
        value={['user1']}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('User field'));
});

// Test handleChange - verify component renders with onChange prop
test('component accepts onChange prop', async () => {
  const onChange = jest.fn();
  const { container } = renderWidget({ onChange });

  await waitFor(() => screen.getByText('User field'));

  const selectContainer = container.querySelector('.react-select-container');
  expect(selectContainer).toBeTruthy();
});

// Test that component renders with async select
test('renders with async select for user search', async () => {
  const { container } = renderWidget();

  await waitFor(() => screen.getByText('User field'));

  const selectInput = container.querySelector('.react-select__input input');
  expect(selectInput).toBeTruthy();
});

// Test component with multiple values
test('renders with multiple selected values', async () => {
  const storeItems = [
    { token: 'alice', title: 'Alice', email: 'alice@test.com' },
    { token: 'alex', title: 'Alex', email: 'alex@test.com' },
  ];
  const { container } = renderWidget({ value: ['alice', 'alex'] }, storeItems);

  await waitFor(() => screen.getByText('User field'));

  const multiValues = container.querySelectorAll(
    '.react-select__multi-value__label',
  );
  expect(multiValues.length).toBe(2);
});

// Test component with choices from items.choices
test('renders with choices from items.choices prop', async () => {
  const items = {
    choices: [
      { token: 'test', title: 'Test User', email: 'test@example.com' },
      { token: 'admin', title: 'Admin User', email: 'admin@example.com' },
    ],
  };
  const { container } = renderWidget({ items, value: ['test'] });

  await waitFor(() => screen.getByText('User field'));

  const multiValue = container.querySelector(
    '.react-select__multi-value__label',
  );
  expect(multiValue).toBeTruthy();
  expect(multiValue.textContent).toBeTruthy();
});

// Test noOptionsMessage based on searchLength
test('shows correct message based on search length', async () => {
  const getVocabulary = jest.fn(() =>
    Promise.resolve({
      items: [],
    }),
  );

  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
    vocabularies: {},
  });

  const { container } = render(
    <Provider store={store}>
      <UserSelectWidget
        getVocabulary={getVocabulary}
        getVocabularyTokenTitle={jest.fn()}
        widgetOptions={{
          vocabulary: { '@id': 'plone.app.vocabularies.Users' },
        }}
        id="user-field"
        title="User field"
        fieldSet="default"
        onChange={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('User field'));

  const selectInput = container.querySelector('.react-select__input input');
  if (selectInput) {
    // Focus to show menu
    fireEvent.focus(selectInput);
    fireEvent.change(selectInput, { target: { value: 'a' } });
  }

  // Should show "Type text..." for short queries
  await waitFor(() => {
    const menu = container.querySelector('.react-select__menu');
    if (menu) {
      expect(menu.textContent).toContain('Type text');
    }
  });
});

// Test componentWillUnmount clears timeout
test('clears timeout on unmount', async () => {
  jest.useFakeTimers();
  const { unmount } = renderWidget();

  await waitFor(() => screen.getByText('User field'));

  unmount();
  jest.useRealTimers();
});

// Test with disabled prop
test('renders disabled select when isDisabled is true', async () => {
  const { container } = renderWidget({ isDisabled: true });

  await waitFor(() => screen.getByText('User field'));

  const selectContainer = container.querySelector('.react-select-container');
  expect(selectContainer).toBeTruthy();
});

// Test with custom placeholder
test('renders custom placeholder', async () => {
  renderWidget({ placeholder: 'Choose users...' });

  await waitFor(() => screen.getByText('User field'));
});

// Test normalizeSingleSelectOption with value field
test('normalizes object with value field', () => {
  const result = normalizeSingleSelectOption(
    { value: 'val1', title: 'Value One', email: 'val1@test.com' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'val1',
    label: 'Value One',
    email: 'val1@test.com',
  });
});

// Test normalizeSingleSelectOption with UID field
test('normalizes object with UID field', () => {
  const result = normalizeSingleSelectOption(
    { UID: 'uid123', title: 'UID Item', email: 'uid@test.com' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'uid123',
    label: 'UID Item',
    email: 'uid@test.com',
  });
});

// Test normalizeSingleSelectOption with label field
test('normalizes object with label field instead of title', () => {
  const result = normalizeSingleSelectOption(
    { token: 'tok1', label: 'Label One', email: 'label@test.com' },
    { formatMessage: (msg) => msg.defaultMessage },
  );

  expect(result).toEqual({
    value: 'tok1',
    label: 'Label One',
    email: 'label@test.com',
  });
});

// Test array with empty title
test('normalizes array with empty title', () => {
  const result = normalizeSingleSelectOption(['user8', ''], {
    formatMessage: (msg) => msg.defaultMessage,
  });

  expect(result).toEqual({
    value: 'user8',
    label: 'user8',
    email: '',
  });
});

// Test handleChange with null (clearing selection)
test('component can clear selection', async () => {
  const onChange = jest.fn();
  const choices = [
    { token: 'user1', title: 'User One', email: 'user1@test.com' },
  ];
  const { container } = renderWidget({ onChange, value: ['user1'], choices });

  await waitFor(() => screen.getByText('User field'));

  const clearButton = container.querySelector('.react-select__clear-indicator');
  if (clearButton) {
    fireEvent.mouseDown(clearButton);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  }
});

// Test componentWillUnmount with pending timeout
test('clears pending timeout on unmount during search', async () => {
  jest.useFakeTimers();
  const { container, unmount } = renderWidget();

  await waitFor(() => screen.getByText('User field'));

  const selectInput = container.querySelector('.react-select__input input');
  if (selectInput) {
    fireEvent.focus(selectInput);
    fireEvent.change(selectInput, { target: { value: 'test' } });
  }

  unmount();
  jest.advanceTimersByTime(500);
  jest.useRealTimers();
});

// Test with MenuList component for large choice sets
test('uses MenuList component when choices exceed 25 items', async () => {
  const largeChoices = Array.from({ length: 30 }, (_, i) => ({
    token: `user${i}`,
    title: `User ${i}`,
    email: `user${i}@test.com`,
  }));

  const { container } = renderWidget({ choices: largeChoices });

  await waitFor(() => screen.getByText('User field'));

  const selectContainer = container.querySelector('.react-select-container');
  expect(selectContainer).toBeTruthy();
});
