import actions from './actions';
import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';

vi.mock('@plone/volto/helpers/Utils/Utils', () => ({
  hasApiExpander: () => true,
}));

vi.mock('@plone/volto/helpers/Url/Url', () => ({
  flattenToAppURL: (url) => url,
  getBaseUrl: (url) => url,
}));

describe('Actions reducer customization', () => {
  it('keeps the state for GET_CONTENT_SUCCESS without @components', () => {
    // e.g. GET_CONTENT for `/@@search` or `/@@`-views
    const state = { error: null, actions: { object: [] }, loaded: false };

    expect(
      actions(state, {
        type: `${GET_CONTENT}_SUCCESS`,
        result: { '@id': 'http://localhost:3000/@@search' },
      }),
    ).toBe(state);
  });

  it('stores the actions when @components is present', () => {
    const result = {
      '@id': 'http://localhost:3000/en/news',
      '@components': { actions: { object: [{ id: 'view' }] } },
    };

    expect(
      actions(undefined, { type: `${GET_CONTENT}_SUCCESS`, result }),
    ).toEqual({
      error: null,
      actions: { object: [{ id: 'view' }] },
      loaded: true,
      loading: false,
    });
  });
});
