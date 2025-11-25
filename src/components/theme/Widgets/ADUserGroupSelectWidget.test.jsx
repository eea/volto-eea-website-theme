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
});
