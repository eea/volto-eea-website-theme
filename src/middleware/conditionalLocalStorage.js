import { load } from 'redux-localstorage-simple';

/**
 * Custom save middleware that only writes to localStorage when:
 * 1. User is authenticated
 * 2. An authentication action is happening
 *
 * Crucially, it does NOT create any localStorage keys at initialization,
 * only when actually saving data.
 */

const NAMESPACE = 'reduxState';
const DEBOUNCE_TIME = 500;

/**
 * Helper to check if user is authenticated
 */
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
    // Execute the action first
    const result = next(action);

    // Get the current state after the action
    const state = store.getState();

    // Check if we should save
    const shouldSave = isUserAuthenticated(state) || isAuthAction(action);

    if (shouldSave) {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Debounce the save operation
      debounceTimer = setTimeout(() => {
        try {
          // Only NOW do we touch localStorage
          const subset = getSubsetOfState(state, states);
          const serialized = JSON.stringify(subset);

          // This is the ONLY place where we write to localStorage
          // and it only happens when authenticated
          localStorage.setItem(namespace, serialized);
        } catch (error) {
          console.error('Failed to save state to localStorage:', error);
        }
      }, debounce);
    }

    return result;
  };
};

// Re-export load from redux-localstorage-simple as-is
export { load };
