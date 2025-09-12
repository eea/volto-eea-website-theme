import { load } from 'redux-localstorage-simple';

/**
 * Custom save middleware that only writes to localStorage when:
 * 1. User is authenticated
 * 2. An authentication action is happening
 *
 * It does NOT create any localStorage keys at initialization,
 * only when actually saving data.
 */

const NAMESPACE = 'reduxState';
const DEBOUNCE_TIME = 500;

const isUserAuthenticated = (state) => {
  return !!(
    state?.userSession?.token ||
    state?.users?.user?.token ||
    state?.users?.user?.id ||
    state?.userSession?.user?.id
  );
};

/**
 * Helper to check if action is authentication-related
 */
const isAuthAction = (action) => {
  return (
    action.type &&
    (action.type.includes('LOGIN') ||
      action.type.includes('AUTHOMATIC') ||
      action.type.includes('OIDC'))
  );
};

/**
 * Get a subset of state based on the provided keys
 */
const getSubsetOfState = (state, paths) => {
  if (!paths || paths.length === 0) {
    return state;
  }

  const subset = {};
  paths.forEach((path) => {
    if (state[path] !== undefined) {
      subset[path] = state[path];
    }
  });
  return subset;
};

/**
 * Custom save implementation that replaces redux-localstorage-simple's save
 * Main difference: doesn't touch localStorage at all during initialization
 */
export const save = (options = {}) => {
  const {
    states = [],
    namespace = NAMESPACE,
    debounce = DEBOUNCE_TIME,
  } = options;

  let debounceTimer = null;

  return (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();
    const shouldSave = isUserAuthenticated(state) || isAuthAction(action);
    if (shouldSave) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        try {
          const subset = getSubsetOfState(state, states);
          const serialized = JSON.stringify(subset);
          localStorage.setItem(namespace, serialized);
        } catch (error) {
          console.error('Failed to save state to localStorage:', error);
        }
      }, debounce);
    }

    return result;
  };
};

export { load };
