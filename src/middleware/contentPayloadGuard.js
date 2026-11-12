import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';

const GET_CONTENT_SUCCESS = `${GET_CONTENT}_SUCCESS`;
const GET_CONTENT_FAIL = `${GET_CONTENT}_FAIL`;

const isContentPayload = (result) =>
  typeof result === 'object' && result !== null && '@id' in result;

const contentPayloadGuard = () => (next) => (action) => {
  if (action.type !== GET_CONTENT_SUCCESS || isContentPayload(action.result)) {
    return next(action);
  }

  return next({
    ...action,
    type: GET_CONTENT_FAIL,
    error: { status: 404 },
  });
};

export default contentPayloadGuard;
