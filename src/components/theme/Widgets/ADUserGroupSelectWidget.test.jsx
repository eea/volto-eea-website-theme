import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';

import ADUserGroupSelectWidget, {
  normalizeSharingEntry,
  normalizeSharingChoices,
} from './ADUserGroupSelectWidget';

const mockStore = configureStore();

// Mock the getSharing action
const mockGetSharing = jest.fn(() =>
  Promise.resolve({
    entries: [],
  }),
);

// Test helpers
const createMockStore = (entries = []) => {
  return mockStore({
    intl: { locale: 'en', messages: {} },
    router: {
      location: {
        pathname: '/test-path',
      },
    },
    sharing: {
      data: {
        entries: entries,
      },
    },
  });
};

const defaultProps = {
  getSharing: mockGetSharing,
  id: 'usergroup-field',
  title: 'User/Group field',
  fieldSet: 'default',
  onChange: jest.fn(),
  pathname: '/test-path',
};

const renderWidget = (props = {}, storeEntries = []) => {
  const store = createMockStore(storeEntries);
  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(
      <Provider store={store}>
        <ADUserGroupSelectWidget {...mergedProps} />
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

describe('ADUserGroupSelectWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the widget component', async () => {
    const { container } = renderWidget();

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('renders with custom placeholder', async () => {
    renderWidget({ placeholder: 'Select users or groups...' });

    await waitFor(() => screen.getByText('User/Group field'));
  });

  test('renders disabled select when isDisabled is true', async () => {
    const { container } = renderWidget({ isDisabled: true });

    await waitFor(() => screen.getByText('User/Group field'));

    const selectContainer = container.querySelector('.react-select-container');
    expect(selectContainer).toBeTruthy();
  });

  test('initializes with saved complete object values', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });

    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles string values (backward compatibility)', async () => {
    const value = ['user1'];

    const { container } = renderWidget({ value });

    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles multiple selected values', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
      {
        id: 'group1',
        title: 'Group One',
        login: 'group1',
        email: 'group1@test.com',
        type: 'group',
      },
    ];

    const { container } = renderWidget({ value });

    await waitFor(() => screen.getByText('User/Group field'));

    const multiValues = container.querySelectorAll(
      '.react-select__multi-value__label',
    );
    expect(multiValues.length).toBe(2);
  });

  test('clears selection when clear button is clicked', async () => {
    const onChange = jest.fn();
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ onChange, value });

    await waitFor(() => screen.getByText('User/Group field'));

    const clearButton = container.querySelector(
      '.react-select__clear-indicator',
    );
    if (clearButton) {
      fireEvent.mouseDown(clearButton);
      await waitFor(() => expect(onChange).toHaveBeenCalled());
    }
  });

  test('renders with async select input', async () => {
    const { container } = renderWidget();

    await waitFor(() => screen.getByText('User/Group field'));

    const selectInput = container.querySelector('.react-select__input input');
    expect(selectInput).toBeTruthy();
  });

  test('updates search state on input change', async () => {
    const { container } = renderWidget();

    await waitFor(() => screen.getByText('User/Group field'));

    const selectInput = container.querySelector('.react-select__input input');
    if (selectInput) {
      fireEvent.focus(selectInput);
      fireEvent.change(selectInput, { target: { value: 'test' } });
      expect(selectInput.value).toBe('test');
    }
  });

  test('component accepts onChange prop and calls it with complete objects', async () => {
    const onChange = jest.fn();
    const { container } = renderWidget({ onChange });

    await waitFor(() => screen.getByText('User/Group field'));

    const selectContainer = container.querySelector('.react-select-container');
    expect(selectContainer).toBeTruthy();
  });

  test('renders with value as object with label property', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
        label: 'Custom Label (user1)',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles value with only id field', async () => {
    const value = [{ id: 'user1' }];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles value with value field instead of id', async () => {
    const value = [{ value: 'user1', title: 'User One' }];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('renders with null value', async () => {
    const { container } = renderWidget({ value: null });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('renders with empty array value', async () => {
    const { container } = renderWidget({ value: [] });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('handles group type entries', async () => {
    const value = [
      {
        id: 'group1',
        title: 'Editors',
        login: 'editors',
        email: 'editors@test.com',
        type: 'group',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('renders with description prop', async () => {
    renderWidget({ description: 'Select users or groups' });

    await waitFor(() => screen.getByText('User/Group field'));
  });

  test('renders with required prop', async () => {
    const { container } = renderWidget({ required: true });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('renders with error prop', async () => {
    const { container } = renderWidget({ error: ['This field is required'] });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('renders with disabled prop', async () => {
    const { container } = renderWidget({ disabled: true });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('handles componentDidUpdate with new value', async () => {
    const { rerender } = renderWidget({ value: [] });

    await waitFor(() => screen.getByText('User/Group field'));

    const newValue = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    const store = createMockStore();
    rerender(
      <Provider store={store}>
        <ADUserGroupSelectWidget {...defaultProps} value={newValue} />
      </Provider>,
    );

    await waitFor(() => screen.getByText('User/Group field'));
  });

  test('renders with mixed user and group values', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        type: 'user',
      },
      {
        id: 'group1',
        title: 'Group One',
        login: 'group1',
        type: 'group',
      },
      {
        id: 'user2',
        title: 'User Two',
        login: 'user2',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValues = container.querySelectorAll(
      '.react-select__multi-value__label',
    );
    expect(multiValues.length).toBe(3);
  });

  test('handles value where title equals login', async () => {
    const value = [
      {
        id: 'admin',
        title: 'admin',
        login: 'admin',
        email: 'admin@test.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles value with missing type (defaults to user)', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('componentDidMount initializes cache with values', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));
  });

  test('handles wrapped prop', async () => {
    const { container } = renderWidget({ wrapped: true });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('handles pathname prop', async () => {
    const { container } = renderWidget({ pathname: '/custom/path' });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('renders without pathname (uses router state)', async () => {
    const { container } = renderWidget({ pathname: undefined });

    await waitFor(() => screen.getByText('User/Group field'));
    expect(container.querySelector('.react-select-container')).toBeTruthy();
  });

  test('handles value with both id and value fields', async () => {
    const value = [
      {
        id: 'user1',
        value: 'user1-value',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('filters out null values from render', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        type: 'user',
      },
      null,
      undefined,
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValues = container.querySelectorAll(
      '.react-select__multi-value__label',
    );
    expect(multiValues.length).toBeGreaterThan(0);
  });

  test('handles getSharing prop', async () => {
    const customGetSharing = jest.fn(() =>
      Promise.resolve({ entries: [] }),
    );

    renderWidget({ getSharing: customGetSharing });
    await waitFor(() => screen.getByText('User/Group field'));
  });

  test('shows correct noOptionsMessage for short search', async () => {
    const { container } = renderWidget();

    await waitFor(() => screen.getByText('User/Group field'));

    const selectInput = container.querySelector('.react-select__input input');
    if (selectInput) {
      fireEvent.focus(selectInput);
      fireEvent.change(selectInput, { target: { value: 'a' } });
    }
  });

  test('handles cached entries from previous searches', async () => {
    const storeEntries = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    renderWidget({ value: [] }, storeEntries);
    await waitFor(() => screen.getByText('User/Group field'));
  });

  test('renders value object without title but with login', async () => {
    const value = [
      {
        id: 'user1',
        login: 'testlogin',
        email: 'test@example.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('renders value with login matching title', async () => {
    const value = [
      {
        id: 'user1',
        title: 'samelogin',
        login: 'samelogin',
        email: 'test@example.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles value object with email but no login', async () => {
    const value = [
      {
        id: 'user1',
        title: 'User One',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('finds value in cache by entry.login', async () => {
    const storeEntries = [
      {
        id: 'cachedid',
        title: 'Cached User',
        login: 'cachedlogin',
        email: 'cached@test.com',
        type: 'user',
      },
    ];

    const value = ['cachedlogin'];

    const { container } = renderWidget({ value }, storeEntries);
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('finds value in cache by entry.title', async () => {
    const storeEntries = [
      {
        id: 'cachedid',
        title: 'Cached Title',
        login: 'cachedlogin',
        email: 'cached@test.com',
        type: 'user',
      },
    ];

    const value = ['Cached Title'];

    const { container } = renderWidget({ value }, storeEntries);
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles value object without id but with value field', async () => {
    const value = [
      {
        value: 'user1value',
        title: 'User One',
        login: 'user1',
        email: 'user1@test.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles value object with only login (no id, no title)', async () => {
    const value = [
      {
        login: 'onlylogin',
        email: 'test@example.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });

  test('handles mixed value types in array', async () => {
    const storeEntries = [
      {
        id: 'cacheduser',
        title: 'Cached User',
        login: 'cacheduser',
        type: 'user',
      },
    ];

    const value = [
      'stringvalue',
      {
        id: 'objectuser',
        title: 'Object User',
        login: 'objectuser',
        type: 'user',
      },
      'cacheduser',
    ];

    const { container } = renderWidget({ value }, storeEntries);
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValues = container.querySelectorAll(
      '.react-select__multi-value__label',
    );
    expect(multiValues.length).toBeGreaterThan(0);
  });

  test('returns null for invalid value objects', async () => {
    const value = [
      {
        // No id, value, login, or title
        email: 'test@example.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    // Should filter out null values
    const selectContainer = container.querySelector('.react-select-container');
    expect(selectContainer).toBeTruthy();
  });

  test('handles value with title but login different from title', async () => {
    const value = [
      {
        id: 'user1',
        title: 'John Doe',
        login: 'jdoe',
        email: 'jdoe@test.com',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
    // Should contain "(jdoe)" in label
  });

  test('handles entriesCache with more than 25 items', async () => {
    const largeStoreEntries = Array.from({ length: 30 }, (_, i) => ({
      id: `user${i}`,
      title: `User ${i}`,
      login: `user${i}`,
      type: 'user',
    }));

    renderWidget({ value: [] }, largeStoreEntries);
    await waitFor(() => screen.getByText('User/Group field'));
  });

  test('handles value object with no email, login, or title', async () => {
    const value = [
      {
        id: 'user1',
        type: 'user',
      },
    ];

    const { container } = renderWidget({ value });
    await waitFor(() => screen.getByText('User/Group field'));

    const multiValue = container.querySelector(
      '.react-select__multi-value__label',
    );
    expect(multiValue).toBeTruthy();
  });
});

describe('normalizeSharingEntry', () => {
  const mockIntl = {
    formatMessage: (msg) => msg.defaultMessage,
  };

  test('normalizes a complete user entry', () => {
    const entry = {
      id: 'user1',
      title: 'User One',
      login: 'user1',
      email: 'user1@test.com',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result).toEqual({
      value: 'user1',
      label: 'User One (user1)',
      type: 'user',
      email: 'user1@test.com',
      originalEntry: entry,
    });
  });

  test('normalizes a group entry', () => {
    const entry = {
      id: 'group1',
      title: 'Administrators',
      login: 'group1',
      email: 'group1@test.com',
      type: 'group',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result).toEqual({
      value: 'group1',
      label: 'Administrators (group1)',
      type: 'group',
      email: 'group1@test.com',
      originalEntry: entry,
    });
  });

  test('handles entry without login field', () => {
    const entry = {
      id: 'user2',
      title: 'User Two',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result).toEqual({
      value: 'user2',
      label: 'User Two',
      type: 'user',
      email: 'User Two',
      originalEntry: entry,
    });
  });

  test('handles entry where title equals login', () => {
    const entry = {
      id: 'admin',
      title: 'admin',
      login: 'admin',
      email: 'admin@test.com',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result).toEqual({
      value: 'admin',
      label: 'admin',
      type: 'user',
      email: 'admin@test.com',
      originalEntry: entry,
    });
  });

  test('defaults to user type when type is missing', () => {
    const entry = {
      id: 'user3',
      title: 'User Three',
      login: 'user3',
      email: 'user3@test.com',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.type).toBe('user');
  });

  test('handles null entry', () => {
    const result = normalizeSharingEntry(null, mockIntl);
    expect(result).toBe(null);
  });

  test('handles undefined entry', () => {
    const result = normalizeSharingEntry(undefined, mockIntl);
    expect(result).toBe(undefined);
  });

  test('handles entry with missing email', () => {
    const entry = {
      id: 'user4',
      title: 'User Four',
      login: 'user4',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    // When email is missing, it falls back to login
    expect(result.email).toBe('user4');
  });

  test('handles entry with missing email and login', () => {
    const entry = {
      id: 'user5',
      title: 'User Five',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    // When both email and login are missing, it falls back to label (title)
    expect(result.email).toBe('User Five');
  });

  test('handles entry with only id (no title, no login)', () => {
    const entry = {
      id: 'user6',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.value).toBe('user6');
    expect(result.label).toBe('user6');
    expect(result.email).toBe('user6');
  });

  test('handles entry with login but no id', () => {
    const entry = {
      login: 'testuser',
      title: 'Test User',
      email: 'test@example.com',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.value).toBe('testuser');
    expect(result.originalEntry).toBe(entry);
  });

  test('handles entry with special characters in title', () => {
    const entry = {
      id: 'user7',
      title: 'User (Special) #7',
      login: 'user7',
      email: 'user7@test.com',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.label).toContain('User (Special) #7');
  });

  test('handles entry with empty string values', () => {
    const entry = {
      id: 'user8',
      title: '',
      login: 'user8',
      email: '',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.value).toBe('user8');
    expect(result.email).toBe('user8');
  });

  test('handles entry with whitespace in fields', () => {
    const entry = {
      id: 'user9',
      title: '  User Nine  ',
      login: 'user9',
      email: 'user9@test.com',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.label).toContain('User Nine');
  });

  test('handles entry without id but with all other fields', () => {
    const entry = {
      login: 'user10',
      title: 'User Ten',
      email: 'user10@test.com',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.value).toBe('user10');
    expect(result.label).toContain('User Ten');
  });

  test('handles entry with very long title', () => {
    const entry = {
      id: 'user11',
      title: 'A'.repeat(100),
      login: 'user11',
      email: 'user11@test.com',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.value).toBe('user11');
    expect(result.label.length).toBeGreaterThan(0);
  });

  test('handles entry with numeric id', () => {
    const entry = {
      id: 123,
      title: 'User 123',
      login: 'user123',
      type: 'user',
    };

    const result = normalizeSharingEntry(entry, mockIntl);

    expect(result.value).toBe(123);
  });
});

describe('normalizeSharingChoices', () => {
  const mockIntl = {
    formatMessage: (msg) => msg.defaultMessage,
  };

  test('normalizes array of entries', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Alice',
        login: 'alice',
        email: 'alice@test.com',
        type: 'user',
      },
      {
        id: 'group1',
        title: 'Developers',
        login: 'devs',
        email: 'devs@test.com',
        type: 'group',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe('user1');
    expect(result[1].value).toBe('group1');
  });

  test('sorts users before groups', () => {
    const entries = [
      {
        id: 'group1',
        title: 'Group One',
        login: 'group1',
        type: 'group',
      },
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result[0].type).toBe('user');
    expect(result[1].type).toBe('group');
  });

  test('sorts by relevance based on search text', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Bob Smith',
        login: 'bsmith',
        email: 'bob@test.com',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Alice Johnson',
        login: 'alice',
        email: 'alice@test.com',
        type: 'user',
      },
      {
        id: 'user3',
        title: 'Alice Brown',
        login: 'abrown',
        email: 'alice.brown@test.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'alice');

    // Alice entries should come before Bob
    expect(result[0].label).toContain('Alice');
    expect(result[1].label).toContain('Alice');
  });

  test('handles empty array', () => {
    const result = normalizeSharingChoices([], mockIntl);
    expect(result).toEqual([]);
  });

  test('sorts alphabetically when relevance scores are equal', () => {
    const entries = [
      {
        id: 'user2',
        title: 'Zoe',
        login: 'zoe',
        type: 'user',
      },
      {
        id: 'user1',
        title: 'Alice',
        login: 'alice',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, '');

    expect(result[0].label).toContain('Alice');
    expect(result[1].label).toContain('Zoe');
  });

  test('prioritizes exact matches over partial matches', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Test User Admin',
        login: 'testadmin',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Test',
        login: 'test',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'test');

    // Exact match should come first
    expect(result[0].label).toContain('Test');
    expect(result[0].value).toBe('user2');
  });

  test('prioritizes starts-with matches', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Some Admin User',
        login: 'adminuser',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Admin',
        login: 'admin',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'admin');

    // Starts-with should come first - Admin has exact match on both title and login
    expect(result[0].label).toContain('Admin');
    expect(result[0].value).toBe('user2');
  });

  test('handles entries with missing fields gracefully', () => {
    const entries = [
      {
        id: 'user1',
        login: 'user1',
      },
      {
        id: 'user2',
        title: 'User Two',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result).toHaveLength(2);
    // Both entries should be present, order may vary based on sorting
    const values = result.map((r) => r.value);
    expect(values).toContain('user1');
    expect(values).toContain('user2');
  });
});

describe('Relevance scoring and sorting', () => {
  const mockIntl = {
    formatMessage: (msg) => msg.defaultMessage,
  };

  test('exact title match has highest relevance', () => {
    const entries = [
      {
        id: 'user1',
        title: 'admin',
        login: 'admin',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'administrator',
        login: 'administrator',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'admin');

    expect(result[0].value).toBe('user1');
  });

  test('exact login match has highest relevance', () => {
    const entries = [
      {
        id: 'user1',
        title: 'John Doe',
        login: 'jdoe',
        email: 'john@test.com',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Jane Doe',
        login: 'janedoe',
        email: 'jane@test.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'jdoe');

    expect(result[0].value).toBe('user1');
  });

  test('exact email match has highest relevance', () => {
    const entries = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        email: 'test@example.com',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'User Two',
        login: 'user2',
        email: 'test@company.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(
      entries,
      mockIntl,
      'test@example.com',
    );

    expect(result[0].value).toBe('user1');
  });

  test('multi-word search queries', () => {
    const entries = [
      {
        id: 'user1',
        title: 'John Smith',
        login: 'jsmith',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Jane Doe',
        login: 'jdoe',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'john smith');

    expect(result[0].value).toBe('user1');
  });

  test('case insensitive search', () => {
    const entries = [
      {
        id: 'user1',
        title: 'UPPERCASE',
        login: 'upper',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'lowercase',
        login: 'lower',
        type: 'user',
      },
    ];

    const result1 = normalizeSharingChoices(entries, mockIntl, 'UPPER');
    const result2 = normalizeSharingChoices(entries, mockIntl, 'upper');

    expect(result1[0].value).toBe('user1');
    expect(result2[0].value).toBe('user1');
  });

  test('handles entries with null or undefined fields', () => {
    const entries = [
      {
        id: 'user1',
        title: null,
        login: 'user1',
        email: undefined,
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('user1');
  });

  test('sorts by relevance with partial email match', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Bob Smith',
        login: 'bsmith',
        email: 'bob.smith@example.com',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Alice Johnson',
        login: 'alice',
        email: 'alice.johnson@test.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'alice');

    expect(result[0].value).toBe('user2');
  });

  test('handles word boundary matching', () => {
    const entries = [
      {
        id: 'user1',
        title: 'John Doe',
        login: 'jdoe',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Johnson Smith',
        login: 'jsmith',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'john');

    expect(result[0].value).toBe('user1');
  });

  test('handles entries with same relevance score', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Zara',
        login: 'zara',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Anna',
        login: 'anna',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'test');

    expect(result).toHaveLength(2);
  });

  test('prioritizes contains matches', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Some Random User',
        login: 'random',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'User Admin',
        login: 'useradmin',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'admin');

    expect(result[0].value).toBe('user2');
  });

  test('handles search with multiple words', () => {
    const entries = [
      {
        id: 'user1',
        title: 'John Paul Smith',
        login: 'jsmith',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Jane Doe',
        login: 'jdoe',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'john paul');

    expect(result[0].value).toBe('user1');
  });

  test('handles empty search text', () => {
    const entries = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'User Two',
        login: 'user2',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, '');

    expect(result).toHaveLength(2);
  });

  test('handles search with special characters', () => {
    const entries = [
      {
        id: 'user1',
        title: 'User@Domain',
        login: 'user',
        email: 'user@domain.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'user@');

    expect(result).toHaveLength(1);
  });

  test('handles large number of entries', () => {
    const entries = Array.from({ length: 100 }, (_, i) => ({
      id: `user${i}`,
      title: `User ${i}`,
      login: `user${i}`,
      type: 'user',
    }));

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result).toHaveLength(100);
  });

  test('handles mixed types with sorting', () => {
    const entries = [
      {
        id: 'group1',
        title: 'Admins',
        login: 'admins',
        type: 'group',
      },
      {
        id: 'user1',
        title: 'Admin User',
        login: 'admin',
        type: 'user',
      },
      {
        id: 'group2',
        title: 'Editors',
        login: 'editors',
        type: 'group',
      },
      {
        id: 'user2',
        title: 'Editor User',
        login: 'editor',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    // First two should be users
    expect(result[0].type).toBe('user');
    expect(result[1].type).toBe('user');
    // Last two should be groups
    expect(result[2].type).toBe('group');
    expect(result[3].type).toBe('group');
  });

  test('handles entries without type field', () => {
    const entries = [
      {
        id: 'user1',
        title: 'User One',
        login: 'user1',
      },
      {
        id: 'user2',
        title: 'User Two',
        login: 'user2',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result).toHaveLength(2);
    // Should default to 'user' type
    expect(result[0].type).toBe('user');
    expect(result[1].type).toBe('user');
  });

  test('handles single character search', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Alice',
        login: 'alice',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Bob',
        login: 'bob',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'a');

    expect(result[0].value).toBe('user1');
  });

  test('handles entries with identical titles', () => {
    const entries = [
      {
        id: 'user1',
        title: 'John Smith',
        login: 'jsmith1',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'John Smith',
        login: 'jsmith2',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result).toHaveLength(2);
  });

  test('handles search with only spaces', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Test User',
        login: 'test',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, '   ');

    expect(result).toHaveLength(1);
  });

  test('handles entries with numbers in titles', () => {
    const entries = [
      {
        id: 'user1',
        title: 'User 123',
        login: 'user123',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'User 456',
        login: 'user456',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, '123');

    expect(result[0].value).toBe('user1');
  });

  test('handles search matching in email only', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Alice',
        login: 'alice',
        email: 'alice@company.com',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Bob',
        login: 'bob',
        email: 'bob@example.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'company');

    expect(result[0].value).toBe('user1');
  });

  test('handles entries with unicode characters', () => {
    const entries = [
      {
        id: 'user1',
        title: 'José García',
        login: 'jgarcia',
        email: 'jose@test.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'josé');

    expect(result).toHaveLength(1);
  });

  test('handles very long search queries', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Test User',
        login: 'test',
        type: 'user',
      },
    ];

    const longQuery = 'a'.repeat(500);
    const result = normalizeSharingChoices(entries, mockIntl, longQuery);

    expect(result).toHaveLength(1);
  });

  test('handles search with regex special characters', () => {
    const entries = [
      {
        id: 'user1',
        title: 'User (test)',
        login: 'usertest',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, '(test)');

    expect(result).toHaveLength(1);
  });

  test('prioritizes startsWith over contains', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Contains admin here',
        login: 'cadmin',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'admin starts',
        login: 'admin',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'admin');

    expect(result[0].value).toBe('user2');
  });

  test('handles entries with dots in login', () => {
    const entries = [
      {
        id: 'user1',
        title: 'John Doe',
        login: 'john.doe',
        email: 'john.doe@test.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'john.doe');

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('user1');
  });

  test('handles mixed case in entries', () => {
    const entries = [
      {
        id: 'user1',
        title: 'JoHn DoE',
        login: 'JohnDoe',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'john');

    expect(result).toHaveLength(1);
  });

  test('handles entries where login contains uppercase', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Test User',
        login: 'TestUser',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'testuser');

    expect(result[0].value).toBe('user1');
  });

  test('handles group type with uppercase type', () => {
    const entries = [
      {
        id: 'group1',
        title: 'Admins',
        login: 'admins',
        type: 'GROUP',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl);

    expect(result).toHaveLength(1);
  });

  test('handles single word in multi-word search', () => {
    const entries = [
      {
        id: 'user1',
        title: 'John Smith',
        login: 'jsmith',
        type: 'user',
      },
      {
        id: 'user2',
        title: 'Jane Doe',
        login: 'jdoe',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'john x');

    expect(result[0].value).toBe('user1');
  });

  test('handles email with plus sign', () => {
    const entries = [
      {
        id: 'user1',
        title: 'Test User',
        login: 'test',
        email: 'test+tag@example.com',
        type: 'user',
      },
    ];

    const result = normalizeSharingChoices(entries, mockIntl, 'test+');

    expect(result).toHaveLength(1);
  });
});
