import { setIsPrint, setPrintLoading } from './print';
import {
  SET_ISPRINT,
  SET_PRINT_LOADING,
} from '@eeacms/volto-eea-website-theme/constants/ActionTypes';

describe('print actions', () => {
  describe('setIsPrint', () => {
    it('should create an action to set isPrint to true', () => {
      const expectedAction = {
        type: SET_ISPRINT,
        payload: true,
      };

      expect(setIsPrint(true)).toEqual(expectedAction);
    });

    it('should create an action to set isPrint to false', () => {
      const expectedAction = {
        type: SET_ISPRINT,
        payload: false,
      };

      expect(setIsPrint(false)).toEqual(expectedAction);
    });

    it('should handle undefined payload', () => {
      const expectedAction = {
        type: SET_ISPRINT,
        payload: undefined,
      };

      expect(setIsPrint(undefined)).toEqual(expectedAction);
    });

    it('should handle null payload', () => {
      const expectedAction = {
        type: SET_ISPRINT,
        payload: null,
      };

      expect(setIsPrint(null)).toEqual(expectedAction);
    });
  });

  describe('setPrintLoading', () => {
    it('should create an action to set printLoading to true', () => {
      const expectedAction = {
        type: SET_PRINT_LOADING,
        payload: true,
      };

      expect(setPrintLoading(true)).toEqual(expectedAction);
    });

    it('should create an action to set printLoading to false', () => {
      const expectedAction = {
        type: SET_PRINT_LOADING,
        payload: false,
      };

      expect(setPrintLoading(false)).toEqual(expectedAction);
    });

    it('should handle undefined payload', () => {
      const expectedAction = {
        type: SET_PRINT_LOADING,
        payload: undefined,
      };

      expect(setPrintLoading(undefined)).toEqual(expectedAction);
    });
  });
});
