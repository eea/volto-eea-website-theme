import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider, useSelector } from 'react-redux';
import { createStore } from 'redux';
import config from '@plone/volto/registry';
import { asyncConnect, loadOnServer } from '@plone/volto/helpers/AsyncConnect';
import asyncReducer from '@plone/volto/reducers/asyncConnect/asyncConnect';
import { genAISettingsExtender } from './genAISettingsExtender';
import { isImageAIEnabled } from './genAISettings';

const flags = { enabled: true, features: { image: { enabled: true } } };

const Consumer = () => {
  const enabled = useSelector(isImageAIEnabled);
  return <span>{enabled ? 'Image AI enabled' : 'Image AI disabled'}</span>;
};

const originalServer = global.__SERVER__;
const originalExtenders = config.settings.asyncPropsExtenders;

afterEach(() => {
  global.__SERVER__ = originalServer;
  config.settings.asyncPropsExtenders = originalExtenders;
});

it('loads shared flags before SSR render and preserves them for client navigation', async () => {
  global.__SERVER__ = true;
  config.settings.asyncPropsExtenders = [genAISettingsExtender];
  const store = createStore((state = {}, action) => ({
    reduxAsyncConnect: asyncReducer(state.reduxAsyncConnect, action),
  }));
  const reduxDispatch = store.dispatch;
  const request = jest.fn(() => Promise.resolve(flags));
  store.dispatch = (action) =>
    action.request ? request(action.request) : reduxDispatch(action);
  const Connected = asyncConnect([])(Consumer);
  const options = {
    store,
    location: { pathname: '/en/page/edit' },
    routes: [{ path: '/', component: Connected }],
  };

  await loadOnServer(options);
  expect(request).toHaveBeenCalledWith({ op: 'get', path: '/@genai-settings' });
  expect(store.getState().reduxAsyncConnect.genAISettings).toEqual(flags);
  expect(
    renderToStaticMarkup(
      <Provider store={store}>
        <Consumer />
      </Provider>,
    ),
  ).toContain('Image AI enabled');

  global.__SERVER__ = false;
  await loadOnServer(options);
  expect(request).toHaveBeenCalledTimes(1);
  expect(store.getState().reduxAsyncConnect.genAISettings).toEqual(flags);
});

it('continues SSR with Image AI disabled if loading settings fails', async () => {
  global.__SERVER__ = true;
  config.settings.asyncPropsExtenders = [genAISettingsExtender];
  const store = createStore((state = {}, action) => ({
    reduxAsyncConnect: asyncReducer(state.reduxAsyncConnect, action),
  }));
  const reduxDispatch = store.dispatch;
  store.dispatch = (action) =>
    action.request
      ? Promise.reject(new Error('Unavailable'))
      : reduxDispatch(action);
  const Connected = asyncConnect([])(Consumer);
  await loadOnServer({
    store,
    location: { pathname: '/en/page/edit' },
    routes: [{ path: '/', component: Connected }],
  });
  expect(isImageAIEnabled(store.getState())).toBe(false);
  expect(
    renderToStaticMarkup(
      <Provider store={store}>
        <Consumer />
      </Provider>,
    ),
  ).toContain('Image AI disabled');
});

it('does not register duplicate keyed loads', () => {
  const actions = genAISettingsExtender.extend([]);
  expect(genAISettingsExtender.extend(actions)).toHaveLength(1);
});

it.each([
  {},
  { reduxAsyncConnect: { genAISettings: { ...flags, enabled: false } } },
  {
    reduxAsyncConnect: {
      genAISettings: { enabled: true, features: { image: { enabled: false } } },
    },
  },
  {
    reduxAsyncConnect: {
      genAISettings: flags,
      loadState: { genAISettings: { error: 'failed' } },
    },
  },
])(
  'defaults to disabled for missing, disabled, or failed settings',
  (state) => {
    expect(isImageAIEnabled(state)).toBe(false);
  },
);
