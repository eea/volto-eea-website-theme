import { save, load } from 'redux-localstorage-simple';

/**
 * Creates a conditional localStorage middleware that only persists state
 * when the user is authenticated or during authentication flows
 */
export const createConditionalSaveMiddleware = (config) => {
  const saveMiddleware = save({
    states: config.settings.persistentReducers,
    debounce: 500,
  });

  return (store) => {
    const wrappedSaveMiddleware = saveMiddleware(store);

    return (next) => (action) => {
      const state = store.getState();

      // Check if user is authenticated or in authentication process
      const isAuthenticated = !!(
        state?.userSession?.token ||
        state?.users?.user?.token ||
        state?.users?.user?.id ||
        state?.userSession?.user?.id
      );

      // Check if this is an authentication-related action
      const isAuthAction = action.type && action.type.includes('LOGIN');

      // Allow persistence if authenticated or during auth flow
      if (isAuthenticated || isAuthAction) {
        return wrappedSaveMiddleware(next)(action);
      }

      // For anonymous users, skip the save middleware
      return next(action);
    };
  };
};

// Re-export load as-is since reading from localStorage is always allowed
export { load };
