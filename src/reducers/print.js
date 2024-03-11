/**
 * Print reducer.
 * @module reducers/print
 */

import { SET_ISPRINT } from '@eeacms/volto-eea-website-theme/constants/ActionTypes';

const initialState = {
  isPrint: false,
};

export default function print(state = initialState, action) {
  if (action.type === SET_ISPRINT) {
    return {
      ...state,
      isPrint: action.payload,
    };
  } else {
    return state;
  }
}
