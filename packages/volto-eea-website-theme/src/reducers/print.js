/**
 * Print reducer.
 * @module reducers/print
 */

import {
  SET_ISPRINT,
  SET_PRINT_LOADING,
} from '@eeacms/volto-eea-website-theme/constants/ActionTypes';

const initialState = {
  isPrint: false,
  isPrintLoading: false,
};

export default function print(state = initialState, action) {
  switch (action.type) {
    case SET_ISPRINT:
      return {
        ...state,
        isPrint: action.payload,
      };
    case SET_PRINT_LOADING:
      return {
        ...state,
        isPrintLoading: action.payload,
      };
    default:
      return state;
  }
}
