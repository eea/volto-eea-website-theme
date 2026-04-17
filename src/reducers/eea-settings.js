import { GET_EEA_SETTINGS } from '../constants/ActionTypes';

const initialState = {
  error: null,
  loaded: false,
  loading: false,
  data: {},
};

export default function eeaSettings(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_EEA_SETTINGS}_PENDING`:
      return { ...state, error: null, loaded: false, loading: true };
    case `${GET_EEA_SETTINGS}_SUCCESS`:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        data: action.result || {},
      };
    case `${GET_EEA_SETTINGS}_FAIL`:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
        data: {},
      };
    default:
      return state;
  }
}
