// Mock for redux-localstorage-simple-original
export const save = jest.fn(() => () => (next) => (action) => next(action));
export const load = jest.fn(() => ({}));
