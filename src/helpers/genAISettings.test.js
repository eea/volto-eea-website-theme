import {
  buildLengthSettingsSchema,
  isImageAIAllowed,
  isImageAIEnabled,
  parseValidLength,
  requestGenAIControlpanel,
  updateGenAILengthSettings,
} from './genAISettings';

const makeState = (allowedContentTypes = ['Image']) => ({
  reduxAsyncConnect: {
    genAISettings: {
      enabled: true,
      features: {
        image: { enabled: true, allowed_content_types: allowedContentTypes },
      },
    },
  },
});

describe('isImageAIAllowed', () => {
  it('uses exact portal type IDs rather than display names or container types', () => {
    const state = makeState(['Image', 'Document']);
    expect(isImageAIAllowed(state, 'Image')).toBe(true);
    expect(isImageAIAllowed(state, 'Document')).toBe(true);
    expect(isImageAIAllowed(state, 'Page')).toBe(false);
    expect(isImageAIAllowed(state, 'Chart')).toBe(false);
    expect(isImageAIEnabled(state)).toBe(true);
  });

  it('treats an explicitly empty list as unrestricted for a known target type', () => {
    expect(isImageAIAllowed(makeState([]), 'Chart')).toBe(true);
    expect(isImageAIAllowed(makeState([]), 'Document')).toBe(true);
  });

  it.each([undefined, null, '', 42])(
    'rejects an unknown target type: %s',
    (type) => {
      expect(isImageAIAllowed(makeState([]), type)).toBe(false);
    },
  );

  it.each([undefined, null, 'Image', {}])(
    'does not interpret missing or malformed policy as unrestricted: %s',
    (allowed) => {
      const state = makeState();
      state.reduxAsyncConnect.genAISettings.features.image.allowed_content_types =
        allowed;
      expect(isImageAIAllowed(state, 'Image')).toBe(false);
    },
  );

  it.each(['master', 'image', 'failed', 'missing'])(
    'fails closed when settings are %s',
    (condition) => {
      const state = makeState([]);
      if (condition === 'master') {
        state.reduxAsyncConnect.genAISettings.enabled = false;
      } else if (condition === 'image') {
        state.reduxAsyncConnect.genAISettings.features.image.enabled = false;
      } else if (condition === 'failed') {
        state.reduxAsyncConnect.loadState = {
          genAISettings: { error: 'Unavailable' },
        };
      } else {
        delete state.reduxAsyncConnect.genAISettings;
      }
      expect(isImageAIAllowed(state, 'Image')).toBe(false);
    },
  );
});

describe('GenAI length settings helpers', () => {
  it('trims a controlpanel schema down to the two image length fields', () => {
    const schema = buildLengthSettingsSchema({
      fieldsets: [
        {
          id: 'default',
          title: 'General',
          fields: [
            'enabled',
            'image_title_alt_max_length',
            'summary_enabled',
            'image_description_max_length',
          ],
        },
      ],
      properties: {
        enabled: { type: 'boolean' },
        image_title_alt_max_length: {
          title: 'Title/alt max',
          type: 'integer',
          minimum: 5,
        },
        image_description_max_length: {
          title: 'Description max',
          type: 'integer',
          minimum: 10,
        },
      },
      required: ['enabled', 'image_title_alt_max_length'],
    });

    expect(schema.fieldsets).toEqual([
      {
        id: 'default',
        title: 'General',
        fields: ['image_title_alt_max_length', 'image_description_max_length'],
      },
    ]);
    expect(Object.keys(schema.properties)).toEqual([
      'image_title_alt_max_length',
      'image_description_max_length',
    ]);
    expect(schema.required).toEqual(['image_title_alt_max_length']);
  });

  it('validates positive integer lengths against minimum', () => {
    expect(parseValidLength('40', 1)).toBe(40);
    expect(parseValidLength(64, 1)).toBe(64);
    expect(parseValidLength('0', 1)).toBeNull();
    expect(parseValidLength('-5', 1)).toBeNull();
    expect(parseValidLength('12.5', 1)).toBeNull();
    expect(parseValidLength('', 1)).toBeNull();
    expect(parseValidLength(null, 1)).toBeNull();
  });

  it('requests and patches @controlpanels/genai with the expected payload shape', () => {
    const api = {
      get: jest.fn().mockResolvedValue({ data: {} }),
      patch: jest.fn().mockResolvedValue(undefined),
    };

    requestGenAIControlpanel(api);
    expect(api.get).toHaveBeenCalledWith('@controlpanels/genai');

    updateGenAILengthSettings(
      {
        image_title_alt_max_length: 40,
        image_description_max_length: 500,
        ignored_extra: true,
      },
      api,
    );
    expect(api.patch).toHaveBeenCalledWith('@controlpanels/genai', {
      data: {
        image_title_alt_max_length: 40,
        image_description_max_length: 500,
      },
    });
  });
});
