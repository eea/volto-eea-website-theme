import { GET_NAVIGATION_SETTINGS } from '../../constants/ActionTypes';

const initialState = {
  error: null,
  items: {},
  loaded: false,
  loading: false,
};

export default function navigation(state = initialState, action = {}) {
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
        items: {
          ...state.items,
          [action.result['@id']]: {
            ...action.result,
            hideChildrenFromNavigation:
              action.result.hideChildrenFromNavigation === undefined
                ? true
                : action.result.hideChildrenFromNavigation,
          },
        },
        loaded: true,
        loading: false,
      };
    case `${GET_NAVIGATION_SETTINGS}_FAIL`:
      return {
        ...state,
        error: action.error,
        items: {},
        loaded: false,
        loading: false,
      };
    default:
      return state;
  }
}
