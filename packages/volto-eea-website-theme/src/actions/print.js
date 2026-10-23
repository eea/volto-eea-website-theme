/**
 * Print action.
 * @module actions/print
 */

import {
  SET_ISPRINT,
  SET_PRINT_LOADING,
} from '@eeacms/volto-eea-website-theme/constants/ActionTypes';

export const setIsPrint = (data) => {
  return {
    type: SET_ISPRINT,
    payload: data,
  };
};

export const setPrintLoading = (isLoading) => ({
  type: SET_PRINT_LOADING,
  payload: isLoading,
});
