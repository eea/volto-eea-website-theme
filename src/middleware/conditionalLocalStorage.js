// eslint-disable-next-line import/no-unresolved
import {
  save as reduxLocalStorageSave,
  load as reduxLocalStorageLoad,
} from 'redux-localstorage-simple-original';

/**
 * Wrapper for redux-localstorage-simple's save middleware
 * Only allows saving to localStorage when:
 * 1. User is authenticated
 * 2. An authentication action is happening
 */

const isUserAuthenticated = (state) => {
  return !!(
    state?.userSession?.token ||
    state?.users?.user?.token ||
    state?.users?.user?.id ||
    state?.userSession?.user?.id
  );
};

const isAuthAction = (action) => {
  return action.type && action.type.includes('LOGIN');
};

/**
 * Creates a conditional save middleware that wraps redux-localstorage-simple's save
 * Only persists state when user is authenticated or during authentication flows
 */
export const save = (options = {}) => {
  const saveMiddleware = reduxLocalStorageSave(options);

  return (store) => {
    const wrappedSaveMiddleware = saveMiddleware(store);

    return (next) => (action) => {
      const state = store.getState();
      const shouldSave = isUserAuthenticated(state) || isAuthAction(action);

      if (shouldSave) {
        return wrappedSaveMiddleware(next)(action);
      }

      return next(action);
    };
  };
};

export { reduxLocalStorageLoad as load };
