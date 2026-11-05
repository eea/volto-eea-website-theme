import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import config from '@plone/volto/registry';
import { GET_USER, GET_SCHEMA } from '@plone/volto/constants/ActionTypes';

import { FormFieldWrapper } from '@plone/volto/components/manage/Widgets';

import Display from './Display';

const mockStore = configureStore();

vi.mock('@plone/volto/components/manage/Widgets');
vi.mock('@plone/volto/helpers/Loadable/Loadable');
beforeAll(async () => {
  const { __setLoadables } = await import(
    '@plone/volto/helpers/Loadable/Loadable'
  );
  await __setLoadables();
});

// jwt-decode only reads the (base64 encoded) payload of the token.
const makeToken = (payload) => `header.${btoa(JSON.stringify(payload))}.sig`;

let originalEeaSettings;

beforeEach(() => {
  config.views.layoutViewsNamesMapping = {
    summary_view: 'Summary view',
    listing_view: 'Listing view',
  };
  config.views.layoutViews = {
    summary_view: () => <div>Summary View</div>,
    listing_view: () => <div>Listing View</div>,
  };
  originalEeaSettings = config.settings.eea;
  config.settings.eea = {
    ...(config.settings.eea || {}),
    rolesWhoCanChangeLayout: ['Manager', 'Site Administrator'],
  };
});

afterEach(() => {
  config.settings.eea = originalEeaSettings;
});

const makeStore = ({
  layouts = ['summary_view', 'listing_view'],
  user = { id: 'admin', roles: ['Manager', 'Authenticated'] },
  token = makeToken({ sub: 'admin' }),
  type = 'Folder',
} = {}) =>
  mockStore({
    content: {
      update: { loaded: true },
      data: { layout: 'summary_view', '@type': type },
    },
    schema: {
      schema: {
        layouts,
      },
    },
    users: { user },
    userSession: { token },
    intl: {
      locale: 'en',
      messages: {},
    },
  });

const renderDisplay = (store) =>
  render(
    <Provider store={store}>
      <Display pathname="/test" />
    </Provider>,
  );

describe('Display', () => {
  it('renders a Display component with more than one option', async () => {
    const { container } = renderDisplay(makeStore());

    await waitFor(() => {});
    expect(container.querySelector('#FormFieldWrapper')).toBeInTheDocument();
  });

  it('renders a Display component empty in case that there is only one option', async () => {
    const { container } = renderDisplay(
      makeStore({ layouts: ['summary_view'] }),
    );

    await waitFor(() => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('requests the schema of the content type', async () => {
    const store = makeStore();
    renderDisplay(store);

    await waitFor(() => {});
    expect(
      store.getActions().filter((action) => action.type === GET_SCHEMA),
    ).not.toHaveLength(0);
  });
});

describe('Display — EEA: rolesWhoCanChangeLayout', () => {
  it('renders the layout selector for a user with an allowed role', async () => {
    const { container } = renderDisplay(
      makeStore({ user: { id: 'admin', roles: ['Site Administrator'] } }),
    );

    await waitFor(() => {});
    expect(container.querySelector('#FormFieldWrapper')).toBeInTheDocument();
  });

  it('renders nothing for a user without an allowed role', async () => {
    const { container } = renderDisplay(
      makeStore({ user: { id: 'editor', roles: ['Editor', 'Authenticated'] } }),
    );

    await waitFor(() => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when no role is configured', async () => {
    config.settings.eea = { ...config.settings.eea };
    delete config.settings.eea.rolesWhoCanChangeLayout;
    const { container } = renderDisplay(makeStore());

    await waitFor(() => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the user has no roles', async () => {
    const { container } = renderDisplay(makeStore({ user: { id: 'admin' } }));

    await waitFor(() => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches the current user, from the token, when it is not loaded', async () => {
    const store = makeStore({
      user: {},
      token: makeToken({ sub: 'jane' }),
    });
    const { container } = renderDisplay(store);

    await waitFor(() => {});
    expect(container).toBeEmptyDOMElement();
    const getUserActions = store
      .getActions()
      .filter((action) => action.type === GET_USER);
    expect(getUserActions).toHaveLength(1);
    expect(getUserActions[0].request.path).toBe('/@users/jane');
  });

  it('does not fetch the user when it is already loaded', async () => {
    const store = makeStore();
    renderDisplay(store);

    await waitFor(() => {});
    expect(
      store.getActions().filter((action) => action.type === GET_USER),
    ).toHaveLength(0);
  });

  it.each([
    ['missing', null],
    ['empty', ''],
    ['invalid', 'not-a-jwt'],
  ])(
    'renders nothing and does not fetch a user with a %s token',
    async (_, token) => {
      const store = makeStore({ user: {}, token });
      const { container } = renderDisplay(store);

      await waitFor(() => {});
      expect(container).toBeEmptyDOMElement();
      expect(
        store.getActions().filter((action) => action.type === GET_USER),
      ).toHaveLength(0);
    },
  );

  it('does not pass the user data to the field wrapper', async () => {
    FormFieldWrapper.mockClear();
    renderDisplay(makeStore());

    await waitFor(() => {});
    expect(FormFieldWrapper).toHaveBeenCalled();
    const wrapperProps = FormFieldWrapper.mock.calls.at(-1)[0];
    expect(wrapperProps.id).toBe('display-select');
    expect(wrapperProps.pathname).toBe('/test');
    expect(wrapperProps).not.toHaveProperty('user');
    expect(wrapperProps).not.toHaveProperty('userId');
    expect(wrapperProps).not.toHaveProperty('getUser');
  });
});
