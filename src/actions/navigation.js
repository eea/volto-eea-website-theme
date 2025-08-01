import { GET_NAVIGATION_SETTINGS } from '../constants/ActionTypes';

export const getNavigationSettings = (url = '') => {
  let cleanedUrl = typeof url === 'string' ? url : '';

  if (
    cleanedUrl &&
    typeof cleanedUrl === 'string' &&
    cleanedUrl.endsWith('/edit')
  ) {
    cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
  }

  const apiPath = window.location.origin + '/++api++' + cleanedUrl;

  return {
    type: GET_NAVIGATION_SETTINGS,
    request: {
      op: 'get',
      path: `${apiPath}/@inherit?expand.inherit.behaviors=eea.enhanced_navigation`,
    },
  };
};
