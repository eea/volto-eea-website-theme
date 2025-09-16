/* eslint-disable import/no-unresolved */

/**
 * TODO: Remove this workaround after https://github.com/plone/volto/issues/6997 is resolved
 *
 * This file provides a conditional wrapper for redux-localstorage-simple to prevent
 * localStorage pollution for anonymous users. The import uses 'redux-localstorage-simple-original'
 * as an alias to the actual package to avoid circular dependencies.
 *
 * Once the issue is fixed in Volto core:
 * 1. Remove this conditionalLocalStorage.js file
 * 2. Remove the webpack alias configuration for 'redux-localstorage-simple-original'
 */
import {
  save as reduxLocalStorageSave,
  load as reduxLocalStorageLoad,
} from 'redux-localstorage-simple-original';

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
 * Wrapper for redux-localstorage-simple's save middleware
 * Only allows saving to localStorage when user is authenticated or an authentication action is happening
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
