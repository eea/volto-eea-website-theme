import { GET_GENAI_SETTINGS } from '@eeacms/volto-eea-website-theme/constants/ActionTypes';

export const getGenAISettings = () => ({
  type: GET_GENAI_SETTINGS,
  request: {
    op: 'get',
    path: '/@genai-settings',
  },
});
