import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';

const GET_CONTENT_SUCCESS = `${GET_CONTENT}_SUCCESS`;
const GET_CONTENT_FAIL = `${GET_CONTENT}_FAIL`;

/**
 * Content payload guard redux middleware.
 *
 * Volto fetches the content behind any unmatched route. Plone answers some of
 * them with a 200 that is not JSON - a browserview (HTML) or a feed (XML) -
 * so `helpers/Api` resolves with the raw string and dispatches
 * `GET_CONTENT_SUCCESS` carrying it. Every content reducer then reads
 * `action.result['@components']` and throws: the page dies on the client and
 * SSR returns 500.
 *
 * On the server the payload is an *empty object*, not a string: superagent
 * resolves with `{}` for a `text/html` response and `helpers/Api` returns
 * `response.body || response.text`. So the check has to be "is this a content
 * object", which is what `@id` marks, and not "is this an object".
 *
 * A successful `GET_CONTENT` always yields a content object, so a payload that
 * is not one is turned into a `GET_CONTENT_FAIL` with status 404: `View`
 * renders the 404 error view and the response carries a 404 status.
 *
 * Must be mounted *after* the `api` middleware, so it sees the action `api`
 * emits and before the reducers run.
 *
 * @function contentPayloadGuard
 * @returns {Function} Redux middleware.
 */
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
