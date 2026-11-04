import { getGenAISettings } from '@eeacms/volto-eea-website-theme/actions/genai-settings';

// Match the header settings lifecycle: fetch during SSR and hydrate one shared
// reduxAsyncConnect value. Controlpanel changes require a full page load.
export const genAISettingsExtender = {
  path: '/',
  extend: (dispatchActions) => {
    if (!dispatchActions.some((action) => action.key === 'genAISettings')) {
      dispatchActions.push({
        key: 'genAISettings',
        promise: ({ store: { dispatch } }) =>
          __SERVER__ && dispatch(getGenAISettings()),
      });
    }
    return dispatchActions;
  },
};
