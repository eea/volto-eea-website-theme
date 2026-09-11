import { GET_HEADER_SETTINGS } from '../constants/ActionTypes';

export const getHeaderSettings = () => ({
  type: GET_HEADER_SETTINGS,
  request: {
    op: 'get',
    path: '/@header-settings',
  },
});
