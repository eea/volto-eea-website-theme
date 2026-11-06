import React from 'react';
import config from '@plone/volto/registry';
import { loadables } from '@plone/volto/config/Loadables';
import { nonContentRoutes } from '@plone/volto/config/NonContentRoutes';
import { nonContentRoutesPublic } from '@plone/volto/config/NonContentRoutesPublic';

global.mockReact = React;

Object.assign(config.settings, {
  publicURL: 'http://localhost:3000',
  apiPath: 'http://localhost:8080/Plone',
  internalApiPath: 'http://localhost:8080/Plone',
  nonContentRoutes,
  nonContentRoutesPublic,
  apiExpanders: [{ match: '', GET_CONTENT: ['breadcrumbs'] }],
  downloadableObjects: ['File'],
  viewableInBrowserObjects: [],
  loadables,
});
