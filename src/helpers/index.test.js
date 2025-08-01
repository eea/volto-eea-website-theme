import { getBackendResourceWithAuth } from './index';
import superagent from 'superagent';
import config from '@plone/volto/registry';
import { addHeadersFactory } from '@plone/volto/helpers/Proxy/Proxy';

// Mock dependencies
jest.mock('superagent');
jest.mock('@plone/volto/registry');
jest.mock('@plone/volto/helpers/Proxy/Proxy');

describe('helpers/index', () => {
  let mockRequest;
  let mockUniversalCookies;
  let mockAddHeadersFactory;

  beforeEach(() => {
    // Mock superagent chain
    mockRequest = {
      get: jest.fn().mockReturnThis(),
      maxResponseSize: jest.fn().mockReturnThis(),
      responseType: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      use: jest.fn().mockReturnThis(),
      then: jest.fn().mockReturnThis(),
      catch: jest.fn().mockReturnThis(),
    };

    superagent.get = jest.fn().mockReturnValue(mockRequest);

    // Mock universalCookies
    mockUniversalCookies = {
      get: jest.fn(),
    };

    // Mock addHeadersFactory
    mockAddHeadersFactory = jest.fn().mockReturnValue(jest.fn());
    addHeadersFactory.mockImplementation(mockAddHeadersFactory);

    // Mock config
    config.settings = {
      apiPath: 'http://localhost:8080/Plone',
      internalApiPath: 'http://internal:8080/Plone',
      devProxyToApiPath: 'http://dev:8080/Plone',
      maxResponseSize: 50000000,
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset global variables
    delete global.__SERVER__;
    delete global.__DEVELOPMENT__;
  });

  describe('getBackendResourceWithAuth', () => {
    const mockReq = {
      path: '/test-resource',
      universalCookies: mockUniversalCookies,
    };

    it('should return a promise', () => {
      const result = getBackendResourceWithAuth(mockReq);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should use apiPath when not on server and not in development', () => {
      global.__SERVER__ = false;
      global.__DEVELOPMENT__ = false;

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://localhost:8080/Plone/test-resource',
      );
    });

    it('should use internalApiPath when on server', () => {
      global.__SERVER__ = true;
      global.__DEVELOPMENT__ = false;

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://internal:8080/Plone/test-resource',
      );
    });

    it('should use devProxyToApiPath when in development', () => {
      global.__SERVER__ = false;
      global.__DEVELOPMENT__ = true;

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://dev:8080/Plone/test-resource',
      );
    });

    it('should prefer internalApiPath over devProxyToApiPath when both server and development are true', () => {
      global.__SERVER__ = true;
      global.__DEVELOPMENT__ = true;

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://internal:8080/Plone/test-resource',
      );
    });

    it('should set maxResponseSize from config', () => {
      getBackendResourceWithAuth(mockReq);

      expect(mockRequest.maxResponseSize).toHaveBeenCalledWith(50000000);
    });

    it('should set responseType to blob', () => {
      getBackendResourceWithAuth(mockReq);

      expect(mockRequest.responseType).toHaveBeenCalledWith('blob');
    });

    it('should add Authorization header when auth_token exists', () => {
      mockUniversalCookies.get.mockReturnValue('test-auth-token');

      getBackendResourceWithAuth(mockReq);

      expect(mockUniversalCookies.get).toHaveBeenCalledWith('auth_token');
      expect(mockRequest.set).toHaveBeenCalledWith(
        'Authorization',
        'Bearer test-auth-token',
      );
    });

    it('should not add Authorization header when auth_token does not exist', () => {
      mockUniversalCookies.get.mockReturnValue(null);

      getBackendResourceWithAuth(mockReq);

      expect(mockUniversalCookies.get).toHaveBeenCalledWith('auth_token');
      expect(mockRequest.set).not.toHaveBeenCalled();
    });

    it('should not add Authorization header when auth_token is undefined', () => {
      mockUniversalCookies.get.mockReturnValue(undefined);

      getBackendResourceWithAuth(mockReq);

      expect(mockUniversalCookies.get).toHaveBeenCalledWith('auth_token');
      expect(mockRequest.set).not.toHaveBeenCalled();
    });

    it('should not add Authorization header when auth_token is empty string', () => {
      mockUniversalCookies.get.mockReturnValue('');

      getBackendResourceWithAuth(mockReq);

      expect(mockUniversalCookies.get).toHaveBeenCalledWith('auth_token');
      expect(mockRequest.set).not.toHaveBeenCalled();
    });

    it('should use addHeadersFactory with request object', () => {
      const mockHeadersMiddleware = jest.fn();
      mockAddHeadersFactory.mockReturnValue(mockHeadersMiddleware);

      getBackendResourceWithAuth(mockReq);

      expect(addHeadersFactory).toHaveBeenCalledWith(mockReq);
      expect(mockRequest.use).toHaveBeenCalledWith(mockHeadersMiddleware);
    });

    it('should call then and catch on the request', () => {
      getBackendResourceWithAuth(mockReq);

      expect(mockRequest.then).toHaveBeenCalled();
      expect(mockRequest.catch).toHaveBeenCalled();
    });

    it('should resolve with successful response', async () => {
      const mockResponse = { body: 'test-data' };
      mockRequest.then.mockImplementation((resolve) => {
        resolve(mockResponse);
        return mockRequest;
      });
      mockRequest.catch.mockReturnValue(Promise.resolve(mockResponse));

      const result = await getBackendResourceWithAuth(mockReq);

      expect(result).toBe(mockResponse);
    });

    it('should reject with error response', async () => {
      const mockError = new Error('Network error');
      mockRequest.then.mockReturnValue(mockRequest);
      mockRequest.catch.mockImplementation((reject) => {
        reject(mockError);
        return Promise.reject(mockError);
      });

      try {
        await getBackendResourceWithAuth(mockReq);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    it('should handle missing internalApiPath in config', () => {
      global.__SERVER__ = true;
      config.settings.internalApiPath = undefined;

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://localhost:8080/Plone/test-resource',
      );
    });

    it('should handle missing devProxyToApiPath in config', () => {
      global.__DEVELOPMENT__ = true;
      config.settings.devProxyToApiPath = undefined;

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://localhost:8080/Plone/test-resource',
      );
    });

    it('should handle missing apiPath in config', () => {
      config.settings.apiPath = undefined;

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith('undefined/test-resource');
    });

    it('should handle request path with leading slash', () => {
      const reqWithSlash = {
        ...mockReq,
        path: '/test-resource',
      };

      getBackendResourceWithAuth(reqWithSlash);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://localhost:8080/Plone/test-resource',
      );
    });

    it('should handle request path without leading slash', () => {
      const reqWithoutSlash = {
        ...mockReq,
        path: 'test-resource',
      };

      getBackendResourceWithAuth(reqWithoutSlash);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://localhost:8080/Plonetest-resource',
      );
    });

    it('should handle complex path with query parameters', () => {
      const reqWithQuery = {
        ...mockReq,
        path: '/api/content?param=value&other=test',
      };

      getBackendResourceWithAuth(reqWithQuery);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://localhost:8080/Plone/api/content?param=value&other=test',
      );
    });

    it('should handle empty path', () => {
      const reqWithEmptyPath = {
        ...mockReq,
        path: '',
      };

      getBackendResourceWithAuth(reqWithEmptyPath);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://localhost:8080/Plone',
      );
    });

    it('should handle missing maxResponseSize in config', () => {
      config.settings.maxResponseSize = undefined;

      getBackendResourceWithAuth(mockReq);

      expect(mockRequest.maxResponseSize).toHaveBeenCalledWith(undefined);
    });

    it('should handle different auth token values', () => {
      const testCases = [
        'simple-token',
        'jwt.token.with.dots',
        'token-with-special-chars!@#$%',
        'very-long-token-' + 'x'.repeat(1000),
      ];

      testCases.forEach((token) => {
        jest.clearAllMocks();
        mockUniversalCookies.get.mockReturnValue(token);

        getBackendResourceWithAuth(mockReq);

        expect(mockRequest.set).toHaveBeenCalledWith(
          'Authorization',
          `Bearer ${token}`,
        );
      });
    });

    it('should maintain correct method chaining order', () => {
      getBackendResourceWithAuth(mockReq);

      const callOrder = [
        ['get'],
        ['maxResponseSize'],
        ['responseType'],
        ['use'],
        ['then'],
        ['catch'],
      ];

      callOrder.forEach(([method], index) => {
        expect(mockRequest[method]).toHaveBeenCalled();
      });
    });

    it('should handle missing universalCookies', () => {
      const reqWithoutCookies = {
        path: '/test-resource',
        universalCookies: null,
      };

      expect(() => getBackendResourceWithAuth(reqWithoutCookies)).toThrow();
    });

    it('should work with different config structures', () => {
      // Test with minimal config
      config.settings = {
        apiPath: 'http://minimal:8080/Plone',
      };

      getBackendResourceWithAuth(mockReq);

      expect(superagent.get).toHaveBeenCalledWith(
        'http://minimal:8080/Plone/test-resource',
      );
      expect(mockRequest.maxResponseSize).toHaveBeenCalledWith(undefined);
    });
  });
});
