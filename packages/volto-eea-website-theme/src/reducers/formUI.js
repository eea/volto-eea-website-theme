/**
 * Volto 17 compatibility reducer for form UI state.
 *
 * Volto 18 introduced `setUIState` (Redux action `SET_UI_STATE`) and stores
 * the form UI state in `state.form.ui`.  Volto 17 has no such action or
 * reducer.  This module provides a fallback so that the Form.jsx and
 * Edit.jsx customizations — which are based on the Volto 18 API — work
 * in both versions.
 *
 * In Volto 18 the native `form` reducer already handles `SET_UI_STATE`,
 * so this reducer is redundant but harmless.
 *
 * In Volto 17 this reducer is the sole handler and stores the state at
 * `state.formUI`.  The connect() calls in the customizations fall back
 * to `state.formUI` when `state.form.ui` is undefined.
 */

const initialState = {
  selected: null,
  multiSelected: [],
  hovered: null,
};

export default function formUI(state = initialState, action = {}) {
  if (action.type === 'SET_UI_STATE') {
    return { ...state, ...action.ui };
  }
  return state;
}
