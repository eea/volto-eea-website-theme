global.__CLIENT__ = true;
global.__DEVELOPMENT__ = false;
global.__SERVER__ = false;

global.vi = jest;
global.mockReact = require('react');
global.vi.importActual = async (moduleName) => jest.requireActual(moduleName);
global.vi.stubGlobal = (name, value) => {
  global[name] = value;
};
global.vi.unstubAllGlobals = () => {};

const config = require('@plone/volto/registry').default;
const { loadables } = require('@plone/volto/config/Loadables');
const {
  nonContentRoutes,
} = require('@plone/volto/config/NonContentRoutes');
const {
  nonContentRoutesPublic,
} = require('@plone/volto/config/NonContentRoutesPublic');

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
