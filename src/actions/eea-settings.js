import { GET_EEA_SETTINGS } from '../constants/ActionTypes';

export const getEEASettings = () => ({
  type: GET_EEA_SETTINGS,
  request: {
    op: 'get',
    path: '/@eea.settings',
  },
});
