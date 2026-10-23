import print from './print';
import {
  SET_ISPRINT,
  SET_PRINT_LOADING,
} from '@eeacms/volto-eea-website-theme/constants/ActionTypes';

describe('print reducer', () => {
  const initialState = {
    isPrint: false,
    isPrintLoading: false,
  };

  it('should return the initial state', () => {
    expect(print(undefined, {})).toEqual(initialState);
  });

  it('should handle SET_ISPRINT action', () => {
    const action = {
      type: SET_ISPRINT,
      payload: true,
    };

    const expectedState = {
      isPrint: true,
      isPrintLoading: false,
    };

    expect(print(initialState, action)).toEqual(expectedState);
  });

  it('should handle SET_ISPRINT action with false payload', () => {
    const currentState = {
      isPrint: true,
      isPrintLoading: true,
    };

    const action = {
      type: SET_ISPRINT,
      payload: false,
    };

    const expectedState = {
      isPrint: false,
      isPrintLoading: true,
    };

    expect(print(currentState, action)).toEqual(expectedState);
  });

  it('should handle SET_PRINT_LOADING action', () => {
    const action = {
      type: SET_PRINT_LOADING,
      payload: true,
    };

    const expectedState = {
      isPrint: false,
      isPrintLoading: true,
    };

    expect(print(initialState, action)).toEqual(expectedState);
  });

  it('should handle SET_PRINT_LOADING action with false payload', () => {
    const currentState = {
      isPrint: true,
      isPrintLoading: true,
    };

    const action = {
      type: SET_PRINT_LOADING,
      payload: false,
    };

    const expectedState = {
      isPrint: true,
      isPrintLoading: false,
    };

    expect(print(currentState, action)).toEqual(expectedState);
  });

  it('should return current state for unknown action types', () => {
    const currentState = {
      isPrint: true,
      isPrintLoading: true,
    };

    const action = {
      type: 'UNKNOWN_ACTION',
      payload: 'some value',
    };

    expect(print(currentState, action)).toEqual(currentState);
  });

  it('should preserve other state properties when handling actions', () => {
    const currentState = {
      isPrint: false,
      isPrintLoading: false,
      someOtherProperty: 'preserved',
    };

    const action = {
      type: SET_ISPRINT,
      payload: true,
    };

    const expectedState = {
      isPrint: true,
      isPrintLoading: false,
      someOtherProperty: 'preserved',
    };

    expect(print(currentState, action)).toEqual(expectedState);
  });
});
