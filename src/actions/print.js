/**
 * Print action.
 * @module actions/print
 */

import { SET_ISPRINT } from '@eeacms/volto-eea-website-theme/constants/ActionTypes';

export const setIsPrint = (data) => {
  return {
    type: SET_ISPRINT,
    payload: data,
  };
};
