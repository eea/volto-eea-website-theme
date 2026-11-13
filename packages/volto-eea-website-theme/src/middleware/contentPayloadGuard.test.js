import { applyMiddleware, createStore } from 'redux';
import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';
import contentPayloadGuard from './contentPayloadGuard';

const GET_CONTENT_SUCCESS = `${GET_CONTENT}_SUCCESS`;
const GET_CONTENT_FAIL = `${GET_CONTENT}_FAIL`;

describe('contentPayloadGuard', () => {
  const contentReducer = (state = { data: null, error: null }, action) => {
    switch (action.type) {
      case `${GET_CONTENT_SUCCESS}`:
        return { data: action.result, error: null };
      case `${GET_CONTENT_FAIL}`:
        return { data: null, error: action.error };
      default:
        return state;
    }
  };

  const makeStore = () =>
    createStore(contentReducer, applyMiddleware(contentPayloadGuard));

  it('is a store middleware, not an instantiated one', () => {
    const store = makeStore();

    expect(() => store.dispatch({ type: 'ANY_ACTION' })).not.toThrow();
  });

  it('turns an empty object payload into a 404 failure', () => {
    const store = makeStore();

    store.dispatch({ type: GET_CONTENT_SUCCESS, result: {} });

    expect(store.getState().data).toBe(null);
    expect(store.getState().error).toEqual({ status: 404 });
  });

  it('turns a non-object payload into a 404 failure', () => {
    const store = makeStore();

    expect(() =>
      store.dispatch({
        type: GET_CONTENT_SUCCESS,
        result: '<!doctype html><html></html>',
      }),
    ).not.toThrow();

    expect(store.getState().data).toBe(null);
    expect(store.getState().error).toEqual({ status: 404 });
  });

  it('keeps the subrequest key of the failed action', () => {
    const store = makeStore();
    const seen = [];
    const spyReducer = (state = [], action) => {
      seen.push(action);
      return state;
    };
    const spyStore = createStore(
      spyReducer,
      applyMiddleware(contentPayloadGuard),
    );

    spyStore.dispatch({
      type: GET_CONTENT_SUCCESS,
      subrequest: 'navigation',
      result: '<?xml version="1.0"?>',
    });

    expect(seen[seen.length - 1].type).toBe(GET_CONTENT_FAIL);
    expect(seen[seen.length - 1].subrequest).toBe('navigation');
    expect(store.getState().data).toBe(null);
  });

  it('lets a proper content object through untouched', () => {
    const store = makeStore();
    const content = { '@id': '/en/about', '@components': { actions: {} } };

    store.dispatch({ type: GET_CONTENT_SUCCESS, result: content });

    expect(store.getState().data).toBe(content);
    expect(store.getState().error).toBe(null);
  });

  it('leaves other actions alone', () => {
    const store = makeStore();

    store.dispatch({ type: 'GET_NAVIGATION_SUCCESS', result: 'nope' });

    expect(store.getState()).toEqual({ data: null, error: null });
  });
});
