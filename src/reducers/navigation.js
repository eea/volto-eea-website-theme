/**
 * Navigation reducer.
 * @module reducers/navigation
 */

import { GET_NAVIGATION_SETTINGS } from '../constants/ActionTypes';

const initialState = {
  error: null,
  loaded: false,
  loading: false,
  settings: {},
};

/**
 * Navigation reducer.
 * @function navigation
 * @param {Object} state Current state.
 * @param {Object} action Action to be performed.
 * @returns {Object} New state.
 */
export default function navigationSettings(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_NAVIGATION_SETTINGS}_PENDING`:
      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
      };
    case `${GET_NAVIGATION_SETTINGS}_SUCCESS`:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        settings: action.result?.['eea.enhanced_navigation']?.data
          ?.navigation_settings
          ? JSON.parse(
              action.result['eea.enhanced_navigation'].data.navigation_settings,
            )
          : {},
      };
    case `${GET_NAVIGATION_SETTINGS}_FAIL`:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
        settings: {},
      };
    default:
      return state;
  }
}
