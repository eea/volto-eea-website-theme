import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';

import CreatableSelectWidget from './CreatableSelectWidget';

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
        items: [{ title: 'My item', value: 'myitem' }],
        itemsTotal: 1,
      },
    },
  });

  const { container } = render(
    <Provider store={store}>
      <CreatableSelectWidget
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
  expect(container).toBeTruthy();
});

test("No 'No value' option when default value is 0", async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  const choices = [
    ['0', 'None'],
    ['1', 'One'],
  ];

  const value = {
    value: '0',
    label: 'None',
  };

  const _default = 0;

  const { container } = render(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        choices={choices}
        default={_default}
        value={value}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('None'));
  fireEvent.mouseDown(
    container.querySelector('.react-select__dropdown-indicator'),
    { button: 0 },
  );
  expect(container).toBeTruthy();
});

test('calls getVocabulary on mount when vocabBaseUrl is provided and no choices', async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
    vocabularies: {},
  });

  render(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        items={{ vocabulary: { '@id': 'https://example.com/api/vocabulary' } }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('My field'));

  const actions = store.getActions();
  expect(actions.length).toBeGreaterThan(0);
  expect(actions[0].type).toBe('GET_VOCABULARY');
  expect(actions[0].request.path).toContain('vocabulary');
});

test('does not call getVocabulary on mount when choices are provided', async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  const choices = [
    ['1', 'Option 1'],
    ['2', 'Option 2'],
  ];

  render(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        choices={choices}
        items={{ vocabulary: { '@id': 'https://example.com/api/vocabulary' } }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('My field'));

  const actions = store.getActions();
  const vocabularyActions = actions.filter((a) => a.type === 'GET_VOCABULARY');
  expect(vocabularyActions.length).toBe(0);
});

test('does not call getVocabulary on mount when no vocabBaseUrl', async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  render(
    <Provider store={store}>
      <CreatableSelectWidget
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

  const actions = store.getActions();
  const vocabularyActions = actions.filter((a) => a.type === 'GET_VOCABULARY');
  expect(vocabularyActions.length).toBe(0);
});

test('calls getVocabulary on update when vocabBaseUrl changes', async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
    vocabularies: {},
  });

  const { rerender } = render(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        items={{
          vocabulary: { '@id': 'https://example.com/api/vocabulary1' },
        }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('My field'));

  const actionsBeforeUpdate = store.getActions().length;

  // Update with a different vocabBaseUrl
  rerender(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        items={{
          vocabulary: { '@id': 'https://example.com/api/vocabulary2' },
        }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => {
    const actions = store.getActions();
    expect(actions.length).toBeGreaterThan(actionsBeforeUpdate);
  });

  const actions = store.getActions();
  const vocabularyActions = actions.filter((a) => a.type === 'GET_VOCABULARY');
  expect(vocabularyActions.length).toBeGreaterThan(0);
});

test('does not call getVocabulary on update when vocabBaseUrl stays the same', async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
    vocabularies: {},
  });

  const { rerender } = render(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        items={{
          vocabulary: { '@id': 'https://example.com/api/vocabulary' },
        }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('My field'));

  const actionsAfterMount = store.getActions().length;

  // Update with the same vocabBaseUrl
  rerender(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        items={{
          vocabulary: { '@id': 'https://example.com/api/vocabulary' },
        }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  // Wait a bit to ensure no new call is made
  await new Promise((resolve) => setTimeout(resolve, 100));

  const actionsAfterUpdate = store.getActions().length;
  expect(actionsAfterUpdate).toBe(actionsAfterMount);
});

test('does not call getVocabulary on update when choices are provided', async () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  const choices = [
    ['1', 'Option 1'],
    ['2', 'Option 2'],
  ];

  const { rerender } = render(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        choices={choices}
        items={{
          vocabulary: { '@id': 'https://example.com/api/vocabulary1' },
        }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await waitFor(() => screen.getByText('My field'));

  const actionsAfterMount = store.getActions().length;

  // Update with a different vocabBaseUrl but still with choices
  rerender(
    <Provider store={store}>
      <CreatableSelectWidget
        id="my-field"
        title="My field"
        fieldSet="default"
        choices={choices}
        items={{
          vocabulary: { '@id': 'https://example.com/api/vocabulary2' },
        }}
        onChange={() => {}}
        onBlur={() => {}}
        onClick={() => {}}
      />
    </Provider>,
  );

  await new Promise((resolve) => setTimeout(resolve, 100));

  const actionsAfterUpdate = store.getActions().length;
  const vocabularyActions = store
    .getActions()
    .filter((a) => a.type === 'GET_VOCABULARY');
  expect(vocabularyActions.length).toBe(0);
  expect(actionsAfterUpdate).toBe(actionsAfterMount);
});
