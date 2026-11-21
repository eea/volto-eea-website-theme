import { vi } from 'vitest';
// Mock for redux-localstorage-simple-original
export const save = vi.fn(() => () => (next) => (action) => next(action));
export const load = vi.fn(() => ({}));
