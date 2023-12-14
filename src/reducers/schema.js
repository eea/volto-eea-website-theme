import voltoSchema from '@plone/volto/reducers/schema/schema';

const initialState = {
  contentUrl: null,
  contentType: null,
  error: null,
  loaded: false,
  loading: false,
  schema: null,
  post: {
    loaded: false,
    loading: false,
    error: null,
  },
  update: {
    loaded: false,
    loading: false,
    error: null,
  },
  put: {
    loaded: false,
    loading: false,
    error: null,
  },
};

export default function schema(state = initialState, action = {}) {
  if (action.type === 'REMOVE_SCHEMA') {
    return {
      ...state,
      error: null,
      loading: false,
      loaded: false,
      schema: null,
    };
  }

  if (action.type === 'GET_SCHEMA_SUCCESS') {
    const [contentUrl, contentType] = action._request.path.split('/@types/');
    return {
      ...voltoSchema(state, action),
      contentUrl,
      contentType,
    };
  }

  return voltoSchema(state, action);
}
