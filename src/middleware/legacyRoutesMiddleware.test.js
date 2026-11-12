import config from '@plone/volto/registry';
import legacyRoutesMiddleware from './legacyRoutesMiddleware';

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: { settings: {} },
}));

describe('legacyRoutesMiddleware', () => {
  let req;
  let res;
  let next;
  let express;
  let router;

  const run = () => router.all.mock.calls[0][1](req, res, next);

  beforeEach(() => {
    req = { path: '/', url: '/' };
    res = {
      set: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(() => res),
      type: jest.fn(() => res),
      send: jest.fn(),
    };
    next = jest.fn();
    router = {
      all: jest.fn(),
      id: null,
    };
    express = { Router: jest.fn(() => router) };
    config.settings = {};
  });

  it('registers a single catch-all route', () => {
    const middleware = legacyRoutesMiddleware(express);
    expect(middleware).toBe(router);
    expect(middleware.id).toBe('legacy-routes');
    expect(router.all).toHaveBeenCalledWith('*', expect.any(Function));
  });

  it('does nothing when the site did not opt in', () => {
    legacyRoutesMiddleware(express);
    req.path = '/en/@@search';
    req.url = '/en/@@search';

    run();

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('redirects legacy search routes to the site search page', () => {
    config.settings = {
      eea: { legacyRoutes: { views: true, search: '/en/advanced-search' } },
    };
    legacyRoutesMiddleware(express);
    req.path = '/en/@@search';
    req.url = '/en/@@search?SearchableText=pfas';

    run();

    expect(res.redirect).toHaveBeenCalledWith(
      301,
      '/en/advanced-search?q=pfas',
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects view routes to the parent object', () => {
    config.settings = {
      eea: { legacyRoutes: { views: true, search: '/en/advanced-search' } },
    };
    legacyRoutesMiddleware(express);
    req.path = '/en/about/view';
    req.url = '/en/about/view';

    run();

    expect(res.redirect).toHaveBeenCalledWith(301, '/en/about');
    expect(next).not.toHaveBeenCalled();
  });

  it('answers 410 for the dead Plone paths listed in gone', () => {
    config.settings = {
      eea: {
        legacyRoutes: {
          views: true,
          search: '/en/advanced-search',
          gone: ['/RSS', '/atom.xml', '/mail_password_form'],
        },
      },
    };
    legacyRoutesMiddleware(express);
    req.path = '/RSS';
    req.url = '/RSS';

    run();

    expect(res.status).toHaveBeenCalledWith(410);
    expect(res.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60');
    expect(res.send).toHaveBeenCalledWith('Gone');
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('lets content routes through', () => {
    config.settings = {
      eea: { legacyRoutes: { views: true, search: '/en/advanced-search' } },
    };
    legacyRoutesMiddleware(express);
    req.path = '/en/about';
    req.url = '/en/about';

    run();

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
