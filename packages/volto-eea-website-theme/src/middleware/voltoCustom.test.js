import registervoltoCustomMiddleware from './voltoCustom';
import { getBackendResourceWithAuth } from '@eeacms/volto-eea-website-theme/helpers';

vi.mock('@eeacms/volto-eea-website-theme/helpers', () => ({
  getBackendResourceWithAuth: vi.fn(),
}));

describe('voltoCustomMiddleware', () => {
  let req, res, next, express;

  beforeEach(() => {
    req = {
      url: '/voltoCustom.css',
      headers: {},
    };
    res = {
      set: vi.fn(),
      status: vi.fn(),
      send: vi.fn(),
    };
    next = vi.fn();

    express = {
      Router: vi.fn(() => ({
        all: vi.fn(),
        id: null,
      })),
    };

    vi.clearAllMocks();
  });

  describe('registervoltoCustomMiddleware', () => {
    it('should register middleware with correct route pattern', () => {
      const mockRouter = {
        all: vi.fn(),
        id: null,
      };
      express.Router.mockReturnValue(mockRouter);

      const result = registervoltoCustomMiddleware(express);

      expect(express.Router).toHaveBeenCalled();
      expect(mockRouter.all).toHaveBeenCalledWith(
        ['**/voltoCustom.css$'],
        expect.any(Function),
      );
      expect(result.id).toBe('voltoCustom.css');
    });
  });

  describe('voltoCustomMiddleware function', () => {
    let middlewareFunction;

    beforeEach(() => {
      const mockRouter = {
        all: vi.fn((route, fn) => {
          middlewareFunction = fn;
        }),
        id: null,
      };
      express.Router.mockReturnValue(mockRouter);
      registervoltoCustomMiddleware(express);
    });

    describe('successful resource fetching', () => {
      it('should forward specified headers and send resource body', async () => {
        const mockResource = {
          get: vi.fn((header) => {
            const headers = {
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=3600',
              'Content-Type': 'text/css',
            };
            return headers[header];
          }),
          statusCode: 200,
          body: '.custom-css { color: red; }',
        };

        getBackendResourceWithAuth.mockResolvedValue(mockResource);

        await middlewareFunction(req, res, next);

        expect(getBackendResourceWithAuth).toHaveBeenCalledWith(req);
        expect(res.set).toHaveBeenCalledWith('Accept-Ranges', 'bytes');
        expect(res.set).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=3600',
        );
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/css');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('.custom-css { color: red; }');
      });

      it('should only forward headers that exist in the resource', async () => {
        const mockResource = {
          get: vi.fn((header) => {
            return header === 'Content-Type' ? 'text/css' : null;
          }),
          statusCode: 200,
          body: '.custom-css { color: blue; }',
        };

        getBackendResourceWithAuth.mockResolvedValue(mockResource);

        await middlewareFunction(req, res, next);

        expect(res.set).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/css');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('.custom-css { color: blue; }');
      });

      it('should handle different status codes', async () => {
        const mockResource = {
          get: vi.fn(() => null),
          statusCode: 404,
          body: 'Not Found',
        };

        getBackendResourceWithAuth.mockResolvedValue(mockResource);

        await middlewareFunction(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not Found');
      });

      it('should handle all specified headers', async () => {
        const mockResource = {
          get: vi.fn((header) => {
            const headers = {
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=3600',
              'Content-Disposition': 'attachment; filename="custom.css"',
              'Content-Range': 'bytes 0-1023/2048',
              'Content-Type': 'text/css; charset=utf-8',
            };
            return headers[header];
          }),
          statusCode: 206,
          body: '.partial-css { display: block; }',
        };

        getBackendResourceWithAuth.mockResolvedValue(mockResource);

        await middlewareFunction(req, res, next);

        expect(res.set).toHaveBeenCalledWith('Accept-Ranges', 'bytes');
        expect(res.set).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=3600',
        );
        expect(res.set).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="custom.css"',
        );
        expect(res.set).toHaveBeenCalledWith(
          'Content-Range',
          'bytes 0-1023/2048',
        );
        expect(res.set).toHaveBeenCalledWith(
          'Content-Type',
          'text/css; charset=utf-8',
        );
        expect(res.status).toHaveBeenCalledWith(206);
        expect(res.send).toHaveBeenCalledWith(
          '.partial-css { display: block; }',
        );
      });
    });

    describe('error handling and fallback', () => {
      it('should return default CSS when getBackendResourceWithAuth fails', async () => {
        getBackendResourceWithAuth.mockRejectedValue(
          new Error('Backend error'),
        );

        middlewareFunction(req, res, next);

        await vi.waitFor(() => {
          expect(res.set).toHaveBeenCalledWith(
            'Content-Type',
            'text/css; charset=utf-8',
          );
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(
            '/* Override this by adding a File called voltoCustom.css to backend at portal_skins/custom/manage_main */',
          );
        });
      });

      it('should handle network timeout errors', async () => {
        getBackendResourceWithAuth.mockRejectedValue(new Error('ETIMEDOUT'));

        middlewareFunction(req, res, next);

        await vi.waitFor(() => {
          expect(res.set).toHaveBeenCalledWith(
            'Content-Type',
            'text/css; charset=utf-8',
          );
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(
            '/* Override this by adding a File called voltoCustom.css to backend at portal_skins/custom/manage_main */',
          );
        });
      });

      it('should handle authentication errors', async () => {
        getBackendResourceWithAuth.mockRejectedValue(new Error('Unauthorized'));

        middlewareFunction(req, res, next);

        await vi.waitFor(() => {
          expect(res.set).toHaveBeenCalledWith(
            'Content-Type',
            'text/css; charset=utf-8',
          );
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(
            '/* Override this by adding a File called voltoCustom.css to backend at portal_skins/custom/manage_main */',
          );
        });
      });
    });

    describe('edge cases', () => {
      it('should handle resource with undefined get method', async () => {
        const mockResource = {
          get: undefined,
          statusCode: 200,
          body: '.css-content { }',
        };

        getBackendResourceWithAuth.mockResolvedValue(mockResource);

        await middlewareFunction(req, res, next);

        expect(res.set).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('.css-content { }');
      });

      it('should handle resource with null get method', async () => {
        const mockResource = {
          get: null,
          statusCode: 200,
          body: '.css-content { }',
        };

        getBackendResourceWithAuth.mockResolvedValue(mockResource);

        await middlewareFunction(req, res, next);

        expect(res.set).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('.css-content { }');
      });

      it('should handle empty response body', async () => {
        const mockResource = {
          get: vi.fn(() => null),
          statusCode: 200,
          body: '',
        };

        getBackendResourceWithAuth.mockResolvedValue(mockResource);

        await middlewareFunction(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('');
      });
    });
  });
});
