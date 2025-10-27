import { flattenToAppURL } from '@plone/volto/helpers';
import { GET_NAVIGATION_SETTINGS } from '../constants/ActionTypes';

// TODO: Trigger this on navigation change
// It can be done by adding it to the save flow, after save is done, getNavigationSettings
// It can be done by looking for changes in the View, if data mismatch, getNavigationSettings
export const getNavigationSettings = (url = '') => {
  console.log('GET NAVIGATION SETTINGS');
  let cleanedUrl = typeof url === 'string' ? url : '';

  if (
    cleanedUrl &&
    typeof cleanedUrl === 'string' &&
    cleanedUrl.endsWith('/edit')
  ) {
    cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
  }

  const apiPath = flattenToAppURL(cleanedUrl);

  return {
    type: GET_NAVIGATION_SETTINGS,
    request: {
      op: 'get',
      path: `${apiPath}/@inherit?expand.inherit.behaviors=eea.enhanced_navigation`,
    },
  };
};
