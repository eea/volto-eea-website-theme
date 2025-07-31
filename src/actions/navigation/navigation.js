
import { GET_NAVIGATION_SETTINGS } from '../../constants/ActionTypes';
import config from '@plone/registry';

const isUrlExcluded = (url) => {
  const { nonContentRoutes = [], addonRoutes = [] } = config.settings;
  const matchesNonContent = nonContentRoutes.some((route) =>
    route instanceof RegExp ? route.test(url) : false,
  );
  const matchesAddon = addonRoutes.some((route) =>
    typeof route.path === 'string' ? url.startsWith(route.path) : false,
  );

  return matchesNonContent || matchesAddon;
};

export const getNavigationSettings = (url) => {
  let cleanedUrl = url;
  if (isUrlExcluded(url) || url.includes('/controlpanel'))
    cleanedUrl = window.location.origin + '/++api++';
  if (url.endsWith('/edit')) {
    cleanedUrl = url.slice(0, -'/edit'.length);
  }
  return {
    type: GET_NAVIGATION_SETTINGS,
    request: {
      op: 'get',
      path: `${cleanedUrl}/@inherit?expand.inherit.behaviors=eea.volto.policy.navigation_settings`,
    },
  };
};
