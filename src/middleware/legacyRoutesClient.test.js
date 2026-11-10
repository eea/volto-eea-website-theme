import config from '@plone/volto/registry';
import legacyRoutesClient from './legacyRoutesClient';

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: { settings: {} },
}));

describe('legacyRoutesClient', () => {
  let next;
  let middleware;
  let replace;
  let locationDescriptor;

  const run = (action) => middleware(action);

  beforeEach(() => {
    next = jest.fn((action) => action);
    middleware = legacyRoutesClient()(next);
    replace = jest.fn();
    locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { pathname: '/', search: '', replace },
    });
    config.settings = {};
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', locationDescriptor);
  });

  it('does nothing when the site did not opt in', () => {
    run({
      type: '@@router/LOCATION_CHANGE',
      payload: { location: { pathname: '/en/@@search', search: '' } },
    });

    expect(replace).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('redirects legacy search routes during SPA navigation', () => {
    config.settings = {
      eea: { legacyRoutes: { views: true, search: '/en/advanced-search' } },
    };

    run({
      type: '@@router/LOCATION_CHANGE',
      payload: { location: { pathname: '/en/search', search: '?q=pfas' } },
    });

    expect(replace).toHaveBeenCalledWith('/en/advanced-search?q=pfas');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects view routes to the parent during SPA navigation', () => {
    config.settings = {
      eea: { legacyRoutes: { views: true, search: '/en/advanced-search' } },
    };

    run({
      type: '@@router/LOCATION_CHANGE',
      payload: { location: { pathname: '/en/about/view', search: '' } },
    });

    expect(replace).toHaveBeenCalledWith('/en/about');
    expect(next).not.toHaveBeenCalled();
  });

  it('drops GET_CONTENT for legacy routes so reducers never see HTML', () => {
    config.settings = {
      eea: { legacyRoutes: { views: true, search: '/en/advanced-search' } },
    };

    run({
      type: 'GET_CONTENT',
      request: { op: 'get', path: '/en/about/view' },
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('lets regular content requests through', () => {
    config.settings = {
      eea: { legacyRoutes: { views: true, search: '/en/advanced-search' } },
    };

    const action = {
      type: 'GET_CONTENT',
      request: { op: 'get', path: '/en/about' },
    };
    run(action);

    expect(next).toHaveBeenCalledWith(action);
  });
});
