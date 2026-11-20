import { getHeaderSettings } from '@eeacms/volto-eea-website-theme/actions';

// asyncPropsExtenders entry. Loads header settings during SSR so they're
// available to the Header component on the first render. Result lands in
// state.reduxAsyncConnect.headerSettings.
export const headerSettingsExtender = {
  path: '/',
  extend: (dispatchActions) => {
    if (
      dispatchActions.filter((a) => a.key === 'headerSettings').length === 0
    ) {
      dispatchActions.push({
        key: 'headerSettings',
        promise: ({ store: { dispatch } }) =>
          __SERVER__ && dispatch(getHeaderSettings()),
      });
    }
    return dispatchActions;
  },
};
