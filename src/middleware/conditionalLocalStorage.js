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

const isAuthAction = (action) => {
  console.log('Checking if action is auth-related:', action);
  return (
    (action.type && action.type.includes('AUTHOMATIC_REDIRECT')) ||
    (action.type && action.type.includes('OIDC_REDIRECT')) ||
    (action.type && action.type.includes('LOGIN'))
  );
};

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

/**
 * Custom load implementation that checks for authentication context
 * before loading from localStorage
 */
export const load = (options = {}) => {
  const { states = [], namespace = NAMESPACE } = options;

  const isAuthenticationAttempt = () => {
    if (typeof window === 'undefined') return false;

    const url = window.location.href;
    const hasAuthParams =
      url.includes('state=') ||
      url.includes('code=') ||
      url.includes('oauth') ||
      url.includes('oidc') ||
      url.includes('login') ||
      url.includes('authomatic') ||
      url.includes('callback');

    const hasAuthCookie =
      document.cookie.includes('auth_token') ||
      document.cookie.includes('__ac') ||
      document.cookie.includes('csrf');

    return hasAuthParams || hasAuthCookie;
  };

  if (!isAuthenticationAttempt()) {
    return {};
  }

  try {
    const serializedState = localStorage.getItem(namespace);
    if (!serializedState) {
      return {};
    }

    const fullState = JSON.parse(serializedState);

    if (!states || states.length === 0) {
      return fullState;
    }

    const subset = {};
    states.forEach((key) => {
      if (fullState[key] !== undefined) {
        subset[key] = fullState[key];
      }
    });

    return subset;
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
    return {};
  }
};
