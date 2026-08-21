import okMiddleware from './ok';

let mockOkRoute = '/ok';

vi.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      get okRoute() {
        return mockOkRoute;
      },
    },
  },
}));

describe('okMiddleware', () => {
  let req, res, next, express, mockRouter;

  beforeEach(() => {
    req = {};
    res = {
      type: vi.fn(),
      set: vi.fn(),
      send: vi.fn(),
    };
    next = vi.fn();

    mockRouter = {
      all: vi.fn(),
      id: null,
    };

    express = {
      Router: vi.fn(() => mockRouter),
    };

    mockOkRoute = '/ok';
    vi.clearAllMocks();
  });

  describe('okMiddleware function', () => {
    it('should create a router with express.Router()', () => {
      okMiddleware(express);

      expect(express.Router).toHaveBeenCalled();
    });

    it('should register route with default /ok path', () => {
      const result = okMiddleware(express);

      expect(mockRouter.all).toHaveBeenCalledWith('/ok', expect.any(Function));
      expect(result.id).toBe('ok');
    });

    it('should register route with custom okRoute from config', async () => {
      mockOkRoute = '/custom-health-check';

      // Need to re-require to get updated config
      vi.resetModules();
      const freshOkMiddleware = (await import('./ok')).default;

      freshOkMiddleware(express);

      expect(mockRouter.all).toHaveBeenCalledWith(
        '/custom-health-check',
        expect.any(Function),
      );
    });

    it('should set middleware id to "ok"', () => {
      const result = okMiddleware(express);

      expect(result.id).toBe('ok');
    });

    it('should return the middleware router', () => {
      const result = okMiddleware(express);

      expect(result).toBe(mockRouter);
    });
  });

  describe('ok handler function', () => {
    let okHandler;

    beforeEach(() => {
      okMiddleware(express);
      okHandler = mockRouter.all.mock.calls[0][1];
    });

    it('should set response type to text/plain', () => {
      okHandler(req, res, next);

      expect(res.type).toHaveBeenCalledWith('text/plain');
    });

    it('should set Expires header to past date', () => {
      okHandler(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        'Expires',
        'Sat, 1 Jan 2000 00:00:00 GMT',
      );
    });

    it('should set Cache-Control header for no caching', () => {
      okHandler(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        'Cache-Control',
        'max-age=0, must-revalidate, private',
      );
    });

    it('should send "ok" response', () => {
      okHandler(req, res, next);

      expect(res.send).toHaveBeenCalledWith('ok');
    });

    it('should call methods in correct order', () => {
      const callOrder = [];
      res.type.mockImplementation(() => callOrder.push('type'));
      res.set.mockImplementation(() => callOrder.push('set'));
      res.send.mockImplementation(() => callOrder.push('send'));

      okHandler(req, res, next);

      expect(callOrder).toEqual(['type', 'set', 'set', 'send']);
    });

    it('should not call next', () => {
      okHandler(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined okRoute in config by using default', async () => {
      mockOkRoute = undefined;

      vi.resetModules();
      const freshOkMiddleware = (await import('./ok')).default;

      freshOkMiddleware(express);

      expect(mockRouter.all).toHaveBeenCalledWith('/ok', expect.any(Function));
    });

    it('should handle null okRoute in config by using default', async () => {
      mockOkRoute = null;

      vi.resetModules();
      const freshOkMiddleware = (await import('./ok')).default;

      freshOkMiddleware(express);

      expect(mockRouter.all).toHaveBeenCalledWith('/ok', expect.any(Function));
    });
  });
});
