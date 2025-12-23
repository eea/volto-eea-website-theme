// Mock the external module before any imports
jest.mock('redux-localstorage-simple-original', () => ({
  save: jest.fn(),
  load: jest.fn(),
}));

// eslint-disable-next-line import/first
import { save, load } from './conditionalLocalStorage';

describe('conditionalLocalStorage middleware', () => {
  let store;
  let next;
  let reduxLocalStorage;

  beforeEach(() => {
    reduxLocalStorage = require('redux-localstorage-simple-original');
    store = {
      getState: jest.fn(),
    };
    next = jest.fn((action) => action);

    // Reset mocks
    jest.clearAllMocks();

    // Setup mock middleware chain
    reduxLocalStorage.save.mockReturnValue(
      () => (nextFn) => (action) => nextFn(action),
    );
  });

  describe('save middleware', () => {
    describe('isUserAuthenticated', () => {
      it('should save when userSession.token exists', () => {
        store.getState.mockReturnValue({
          userSession: { token: 'test-token' },
        });

        const middleware = save({})(store)(next);
        const action = { type: 'SOME_ACTION' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });

      it('should save when users.user.token exists', () => {
        store.getState.mockReturnValue({
          users: { user: { token: 'test-token' } },
        });

        const middleware = save({})(store)(next);
        const action = { type: 'SOME_ACTION' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });

      it('should save when users.user.id exists', () => {
        store.getState.mockReturnValue({
          users: { user: { id: 'user-123' } },
        });

        const middleware = save({})(store)(next);
        const action = { type: 'SOME_ACTION' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });

      it('should save when userSession.user.id exists', () => {
        store.getState.mockReturnValue({
          userSession: { user: { id: 'user-456' } },
        });

        const middleware = save({})(store)(next);
        const action = { type: 'SOME_ACTION' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });
    });

    describe('isAuthAction', () => {
      it('should save when action type includes LOGIN', () => {
        store.getState.mockReturnValue({});

        const middleware = save({})(store)(next);
        const action = { type: 'LOGIN_SUCCESS' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });

      it('should save when action type is LOGIN', () => {
        store.getState.mockReturnValue({});

        const middleware = save({})(store)(next);
        const action = { type: 'LOGIN' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });

      it('should save when action type contains LOGIN anywhere', () => {
        store.getState.mockReturnValue({});

        const middleware = save({})(store)(next);
        const action = { type: 'RELOGIN_REQUEST' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });
    });

    describe('anonymous user - no auth action', () => {
      it('should call next directly without saving for anonymous user', () => {
        store.getState.mockReturnValue({
          userSession: {},
          users: {},
        });

        const middleware = save({})(store)(next);
        const action = { type: 'SOME_OTHER_ACTION' };
        const result = middleware(action);

        expect(next).toHaveBeenCalledWith(action);
        expect(result).toBe(action);
      });

      it('should call next directly with empty state', () => {
        store.getState.mockReturnValue({});

        const middleware = save({})(store)(next);
        const action = { type: 'FETCH_DATA' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });

      it('should handle null state values', () => {
        store.getState.mockReturnValue({
          userSession: null,
          users: null,
        });

        const middleware = save({})(store)(next);
        const action = { type: 'ANY_ACTION' };
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });

      it('should handle action without type', () => {
        store.getState.mockReturnValue({});

        const middleware = save({})(store)(next);
        const action = {};
        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
      });
    });

    describe('options passing', () => {
      it('should pass options to the underlying save middleware', () => {
        const options = { states: ['someState'], namespace: 'test' };

        save(options);

        expect(reduxLocalStorage.save).toHaveBeenCalledWith(options);
      });

      it('should work with default empty options', () => {
        save();

        expect(reduxLocalStorage.save).toHaveBeenCalledWith({});
      });
    });
  });

  describe('load export', () => {
    it('should re-export load from redux-localstorage-simple-original', () => {
      expect(load).toBe(reduxLocalStorage.load);
    });
  });
});
