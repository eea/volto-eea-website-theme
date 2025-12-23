import { getNavigationSettings } from './navigation';
import { GET_NAVIGATION_SETTINGS } from '../constants/ActionTypes';

jest.mock('@plone/volto/helpers', () => ({
  flattenToAppURL: jest.fn((url) => {
    // Simulate flattenToAppURL behavior - strip domain if present
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }
    return url;
  }),
}));

describe('navigation actions', () => {
  describe('getNavigationSettings', () => {
    it('should create an action with correct type and request', () => {
      const result = getNavigationSettings('/test-path');

      expect(result.type).toBe(GET_NAVIGATION_SETTINGS);
      expect(result.request.op).toBe('get');
      expect(result.request.path).toBe(
        '/test-path/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle empty url', () => {
      const result = getNavigationSettings('');

      expect(result.type).toBe(GET_NAVIGATION_SETTINGS);
      expect(result.request.path).toBe(
        '/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle undefined url with default empty string', () => {
      const result = getNavigationSettings();

      expect(result.type).toBe(GET_NAVIGATION_SETTINGS);
      expect(result.request.path).toBe(
        '/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should strip /edit suffix from url', () => {
      const result = getNavigationSettings('/test-page/edit');

      expect(result.request.path).toBe(
        '/test-page/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle nested paths with /edit suffix', () => {
      const result = getNavigationSettings('/folder/subfolder/page/edit');

      expect(result.request.path).toBe(
        '/folder/subfolder/page/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should not modify paths that contain "edit" but do not end with /edit', () => {
      const result = getNavigationSettings('/editor-page');

      expect(result.request.path).toBe(
        '/editor-page/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle non-string url values by using empty string', () => {
      const result = getNavigationSettings(null);

      expect(result.type).toBe(GET_NAVIGATION_SETTINGS);
      expect(result.request.path).toBe(
        '/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle number url values by using empty string', () => {
      const result = getNavigationSettings(123);

      expect(result.type).toBe(GET_NAVIGATION_SETTINGS);
      expect(result.request.path).toBe(
        '/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle object url values by using empty string', () => {
      const result = getNavigationSettings({ path: '/test' });

      expect(result.type).toBe(GET_NAVIGATION_SETTINGS);
      expect(result.request.path).toBe(
        '/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle full URL paths', () => {
      const result = getNavigationSettings('http://localhost:3000/test-page');

      expect(result.type).toBe(GET_NAVIGATION_SETTINGS);
      expect(result.request.path).toBe(
        '/test-page/@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });

    it('should handle root path', () => {
      const result = getNavigationSettings('/');

      expect(result.request.path).toBe(
        '//@inherit?expand.inherit.behaviors=eea.enhanced_navigation',
      );
    });
  });
});
