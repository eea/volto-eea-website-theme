import registervoltoCustomMiddleware from './voltoCustom';
import { getBackendResourceWithAuth } from '@eeacms/volto-eea-website-theme/helpers';

jest.mock('@eeacms/volto-eea-website-theme/helpers', () => ({
  getBackendResourceWithAuth: jest.fn(),
}));

describe('voltoCustomMiddleware', () => {
  let req, res, next, express, middleware;

  beforeEach(() => {
    req = {
      url: '/voltoCustom.css',
      headers: {},
    };
    res = {
      set: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    
    express = {
      Router: jest.fn(() => ({
        all: jest.fn(),
        id: null,
      })),
    };

    jest.clearAllMocks();
  });

  describe('registervoltoCustomMiddleware', () => {
    it('should register middleware with correct route pattern', () => {
      const mockRouter = {
        all: jest.fn(),
        id: null,
      };
      express.Router.mockReturnValue(mockRouter);

      const result = registervoltoCustomMiddleware(express);

      expect(express.Router).toHaveBeenCalled();
      expect(mockRouter.all).toHaveBeenCalledWith(['**/voltoCustom.css$'], expect.any(Function));
      expect(result.id).toBe('voltoCustom.css');
    });
  });

  describe('voltoCustomMiddleware function', () => {
    let middlewareFunction;

    beforeEach(() => {
      const mockRouter = {
        all: jest.fn((route, fn) => {
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
          get: jest.fn((header) => {
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
        expect(res.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/css');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('.custom-css { color: red; }');
      });

      it('should only forward headers that exist in the resource', async () => {
        const mockResource = {
          get: jest.fn((header) => {
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
          get: jest.fn(() => null),
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
          get: jest.fn((header) => {
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
        expect(res.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
        expect(res.set).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="custom.css"');
        expect(res.set).toHaveBeenCalledWith('Content-Range', 'bytes 0-1023/2048');
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/css; charset=utf-8');
        expect(res.status).toHaveBeenCalledWith(206);
        expect(res.send).toHaveBeenCalledWith('.partial-css { display: block; }');
      });
    });

    describe('error handling and fallback', () => {
      it('should return default CSS when getBackendResourceWithAuth fails', (done) => {
        getBackendResourceWithAuth.mockRejectedValue(new Error('Backend error'));

        middlewareFunction(req, res, next);

        // Use setTimeout to wait for the promise to resolve and catch block to execute
        setTimeout(() => {
          expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/css; charset=utf-8');
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(
            '/* Override this by adding a File called voltoCustom.css to backend at portal_skins/custom/manage_main */'
          );
          done();
        }, 0);
      });

      it('should handle network timeout errors', (done) => {
        getBackendResourceWithAuth.mockRejectedValue(new Error('ETIMEDOUT'));

        middlewareFunction(req, res, next);

        setTimeout(() => {
          expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/css; charset=utf-8');
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(
            '/* Override this by adding a File called voltoCustom.css to backend at portal_skins/custom/manage_main */'
          );
          done();
        }, 0);
      });

      it('should handle authentication errors', (done) => {
        getBackendResourceWithAuth.mockRejectedValue(new Error('Unauthorized'));

        middlewareFunction(req, res, next);

        setTimeout(() => {
          expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/css; charset=utf-8');
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(
            '/* Override this by adding a File called voltoCustom.css to backend at portal_skins/custom/manage_main */'
          );
          done();
        }, 0);
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
          get: jest.fn(() => null),
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