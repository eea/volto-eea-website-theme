import Api from '@plone/volto/helpers/Api/Api';
import {
  abortImageAIRequest,
  altMatchesImageTitle,
  applyAltChange,
  buildImageMetadataPayload,
  composeImageMetadata,
  createImageAIState,
  deriveAltDisplayState,
  effectiveImageAlt,
  getImageMetadata,
  imageAIReducer,
  readImageAIErrorCode,
  sameImageReference,
  requestImageMetadataRegeneration,
  requestImageMetadata,
  requestImageAlt,
  isInternalImageURL,
} from './imageAI';

jest.mock('@plone/volto/helpers/Api/Api', () => jest.fn());

const testRegistrySettings = {
  apiPath: 'https://api.example.com/Plone',
  internalApiPath: 'http://backend:8080/Plone',
  publicURL: 'https://www.example.com',
};

let actualRegistry;
try {
  actualRegistry = jest.requireActual('@plone/volto/registry');
} catch (e) {
  actualRegistry = null;
}
const realConfig = actualRegistry?.default || actualRegistry;
if (realConfig?.settings) {
  Object.assign(realConfig.settings, testRegistrySettings);
}

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      apiPath: 'https://api.example.com/Plone',
      internalApiPath: 'http://backend:8080/Plone',
      publicURL: 'https://www.example.com',
    },
  },
}));

describe('buildImageMetadataPayload', () => {
  it('sends the unpersisted image, language and default target type', () => {
    expect(
      buildImageMetadataPayload(
        {
          data: 'aW1hZ2UtYnl0ZXM=',
          encoding: 'base64',
          'content-type': 'image/png',
          filename: 'wetland.png',
        },
        'fr',
      ),
    ).toEqual({
      image: {
        data: 'aW1hZ2UtYnl0ZXM=',
        encoding: 'base64',
        'content-type': 'image/png',
        filename: 'wetland.png',
      },
      language: 'fr',
      portal_type: 'Image',
    });
  });
});

describe('target metadata payload', () => {
  it('uses the requested portal type instead of assuming Image', () => {
    expect(
      buildImageMetadataPayload({ filename: 'chart.png' }, 'fr', 'Chart'),
    ).toEqual({
      image: { filename: 'chart.png' },
      language: 'fr',
      portal_type: 'Chart',
    });
  });
});

describe('metadata request paths', () => {
  it.each(['', '/', '/en/folder', '/en/folder/'])(
    'passes the application path %s to Api without adding an API prefix',
    (path) => {
      const api = { post: jest.fn() };
      const image = { data: 'cG5n', encoding: 'base64' };
      requestImageMetadata(path, image, 'fr', 'Chart', api);
      expect(api.post).toHaveBeenCalledWith(
        `${path.replace(/\/$/, '')}/@image-metadata`,
        { data: { image, language: 'fr', portal_type: 'Chart' } },
      );
    },
  );
});

describe.each([
  [
    'requestImageMetadata',
    (api) => requestImageMetadata('/folder', {}, 'fr', 'Image', api),
  ],
  [
    'requestImageMetadataRegeneration',
    (api) =>
      requestImageMetadataRegeneration(
        '/folder/photo',
        'image',
        'fr',
        null,
        api,
      ),
  ],
  ['requestImageAlt', (api) => requestImageAlt('/folder/photo', 'fr', api)],
])('%s request contract', (name, makeRequest) => {
  it('returns the original Api Promise and delegates abort to its request', async () => {
    const response = { title: 'A bird', alt: 'A bird among reeds.' };
    const request = Promise.resolve(response);
    request.request = { abort: jest.fn() };
    const api = { post: jest.fn().mockReturnValue(request) };

    const result = makeRequest(api);

    expect(result).toBe(request);
    abortImageAIRequest(result);
    expect(request.request.abort).toHaveBeenCalledTimes(1);
    expect(request.request.abort.mock.instances[0]).toBe(request.request);
    await expect(result).resolves.toBe(response);
  });

  it('preserves the original transport rejection', async () => {
    const error = new Error('Transport failed');
    const request = Promise.reject(error);
    const api = { post: jest.fn().mockReturnValue(request) };

    await expect(makeRequest(api)).rejects.toBe(error);
  });
});

describe('requestImageAlt setup', () => {
  afterEach(() => Api.mockReset());

  it('constructs the default client without wrapping its Promise', async () => {
    const response = { alt: 'A bird among reeds.' };
    const request = Promise.resolve(response);
    const post = jest.fn().mockReturnValue(request);
    Api.mockImplementationOnce(() => ({ post }));

    const result = requestImageAlt('/folder/photo');

    expect(result).toBe(request);
    expect(Api).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/folder/photo/@image-alt', {
      data: { language: 'en' },
    });
    await expect(result).resolves.toBe(response);
  });

  it('rejects asynchronously with the original client constructor error', async () => {
    const error = new Error('Client construction failed');
    Api.mockImplementationOnce(() => {
      throw error;
    });

    await expect(requestImageAlt('/folder/photo', 'en')).rejects.toBe(error);
  });

  it('rejects asynchronously with the original synchronous post error', async () => {
    const error = new Error('Request setup failed');
    const api = {
      post: jest.fn(() => {
        throw error;
      }),
    };

    await expect(requestImageAlt('/folder/photo', 'en', api)).rejects.toBe(
      error,
    );
  });
});

describe('internal image URLs', () => {
  beforeEach(() => {
    if (realConfig?.settings) {
      Object.assign(realConfig.settings, testRegistrySettings);
    }
  });

  it.each([
    '/en/photo',
    'https://api.example.com/Plone/en/photo',
    'http://backend:8080/Plone/en/photo',
    'https://www.example.com/en/photo',
  ])('accepts %s', (url) => {
    expect(isInternalImageURL(url)).toBe(true);
  });

  it.each([
    'https://cdn.example.com/photo.jpg',
    '//cdn.example.com/photo.jpg',
    'https://www.example.com.evil.test/photo.jpg',
    'data:image/png;base64,cG5n',
    'not a URL',
    '',
    null,
    undefined,
  ])('rejects %s without making a request', async (url) => {
    const api = { post: jest.fn() };
    expect(isInternalImageURL(url)).toBe(false);
    await expect(requestImageAlt(url, 'en', api)).rejects.toThrow(
      'Image is not an internal content item',
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it.each([
    '/en/photo/',
    'https://api.example.com/Plone/en/photo',
    'http://backend:8080/Plone/en/photo',
    'https://www.example.com/en/photo',
  ])('normalises %s with Volto before requesting alt text', async (url) => {
    const api = { post: jest.fn().mockResolvedValue({ alt: 'An image.' }) };
    await requestImageAlt(url, 'fr', api);
    expect(api.post).toHaveBeenCalledWith('/en/photo/@image-alt', {
      data: { language: 'fr' },
    });
  });
});

describe('requestImageMetadataRegeneration', () => {
  it('sends only the field identity for stored images, never a download URL', () => {
    const api = { post: jest.fn() };
    requestImageMetadataRegeneration(
      '/folder/photo',
      'preview_image',
      null,
      {
        download: 'https://example.com/never-fetch-this.png',
      },
      api,
    );
    expect(api.post).toHaveBeenCalledWith(
      '/folder/photo/@image-metadata-regenerate',
      {
        data: { field: 'preview_image', language: 'en' },
      },
    );
  });

  it('sends replacement bytes and preserves the abortable request', () => {
    const image = {
      data: 'cG5n',
      encoding: 'base64',
      'content-type': 'image/png',
    };
    const request = { request: { abort: jest.fn() } };
    const api = { post: jest.fn().mockReturnValue(request) };
    expect(
      requestImageMetadataRegeneration(
        '/folder/photo/',
        'image',
        'fr',
        image,
        api,
      ),
    ).toBe(request);
    expect(api.post).toHaveBeenCalledWith(
      '/folder/photo/@image-metadata-regenerate',
      {
        data: { field: 'image', language: 'fr', image },
      },
    );
  });
});

describe('readImageAIErrorCode', () => {
  it.each([
    'invalid_request',
    'unsupported_media_type',
    'image_too_large',
    'invalid_image',
    'image_not_addable',
    'image_ai_not_allowed',
    'image_not_editable',
    'metadata_changed',
    'generation_failed',
  ])('preserves the machine-readable %s code', (code) => {
    expect(
      readImageAIErrorCode({
        response: {
          body: {
            error: {
              code,
              message: 'This wording may be translated',
            },
          },
        },
      }),
    ).toBe(code);
  });

  it('falls back to generation_failed without parsing message text', () => {
    expect(readImageAIErrorCode(new Error('unsupported image words'))).toBe(
      'generation_failed',
    );
  });

  it('maps HTTP 401 and 403 status codes without custom code to image_not_editable', () => {
    expect(readImageAIErrorCode({ status: 401 })).toBe('image_not_editable');
    expect(readImageAIErrorCode({ status: 403 })).toBe('image_not_editable');
    expect(readImageAIErrorCode({ response: { status: 401 } })).toBe(
      'image_not_editable',
    );
    expect(readImageAIErrorCode({ response: { status: 403 } })).toBe(
      'image_not_editable',
    );
  });

  it('maps Zope Unauthorized error payloads without custom code to image_not_editable', () => {
    expect(
      readImageAIErrorCode({
        response: {
          status: 401,
          body: {
            type: 'Unauthorized',
            message: 'You are not authorized to access this resource.',
          },
        },
      }),
    ).toBe('image_not_editable');
    expect(
      readImageAIErrorCode({
        body: {
          error: {
            type: 'Unauthorized',
          },
        },
      }),
    ).toBe('image_not_editable');
  });

  it('prefers specific machine-readable codes over generic 401/403 status', () => {
    expect(
      readImageAIErrorCode({
        status: 403,
        response: {
          status: 403,
          body: {
            error: {
              code: 'image_not_addable',
            },
          },
        },
      }),
    ).toBe('image_not_addable');
    expect(
      readImageAIErrorCode({
        status: 403,
        response: {
          status: 403,
          body: {
            error: {
              code: 'image_ai_not_allowed',
            },
          },
        },
      }),
    ).toBe('image_ai_not_allowed');
  });
});

describe('alt provenance helpers', () => {
  it('normalizes only whitespace when comparing alt with title', () => {
    expect(altMatchesImageTitle('  Wetland   bird ', 'Wetland bird')).toBe(
      true,
    );
    expect(altMatchesImageTitle('wetland bird', 'Wetland bird')).toBe(false);
    expect(altMatchesImageTitle('Wetland bird.', 'Wetland bird')).toBe(false);
  });

  it('recognizes equivalent internal references for same-Image preservation', () => {
    expect(sameImageReference('/eea/en/image', '/eea/en/image')).toBe(true);
    expect(sameImageReference('/eea/en/one', '/eea/en/two')).toBe(false);
  });

  it('composes metadata from title and description', () => {
    expect(
      composeImageMetadata('Figure 2', 'A map of Europe old-age ratios.'),
    ).toBe('Figure 2: A map of Europe old-age ratios.');
    expect(composeImageMetadata('Figure 2', '')).toBe('Figure 2');
    expect(composeImageMetadata('', 'A map of Europe old-age ratios.')).toBe(
      'A map of Europe old-age ratios.',
    );
    expect(composeImageMetadata('', '')).toBe('');
  });

  it('reads effective image metadata from direct or composed fields', () => {
    expect(
      getImageMetadata({
        image_metadata: 'Pre-composed metadata',
        image_title: 'Title',
      }),
    ).toBe('Pre-composed metadata');
    expect(
      getImageMetadata({
        image_title: 'Figure 2',
        image_description: 'A description',
      }),
    ).toBe('Figure 2: A description');
  });

  it('derives effective image alt with decorative and custom priority', () => {
    expect(
      effectiveImageAlt({
        decorative: true,
        image_metadata: 'Figure 2: Description',
      }),
    ).toBe('');
    expect(
      effectiveImageAlt({
        alt: 'Custom alt text',
        alt_source: 'custom',
        image_metadata: 'Figure 2: Description',
      }),
    ).toBe('Custom alt text');
    expect(
      effectiveImageAlt({
        alt_source: 'image-metadata',
        image_metadata: 'Figure 2: Description',
      }),
    ).toBe('Figure 2: Description');
  });

  it('derives display state and provenance flags for internal and external images', () => {
    expect(
      deriveAltDisplayState({
        blockData: {
          url: '/eea/en/two.jpeg',
          image_metadata: 'Cat on a sofa: A sleeping cat.',
          alt_source: 'image-metadata',
        },
        value: '',
      }),
    ).toMatchObject({
      target: '/eea/en/two.jpeg',
      effectiveSource: 'image-metadata',
      displayedValue: 'Cat on a sofa: A sleeping cat.',
      customHasValue: false,
      showUseMetadata: false,
      showExternalWarning: false,
    });

    expect(
      deriveAltDisplayState({
        blockData: {
          url: '/eea/en/two.jpeg',
          image_metadata: 'Cat on a sofa: A sleeping cat.',
          alt: 'Cat on a sofa: A sleeping cat.',
          alt_source: 'custom',
        },
        value: 'Cat on a sofa: A sleeping cat.',
      }),
    ).toMatchObject({
      target: '/eea/en/two.jpeg',
      effectiveSource: 'custom',
      displayedValue: 'Cat on a sofa: A sleeping cat.',
      customHasValue: true,
      showUseMetadata: true,
      showExternalWarning: false,
    });

    expect(
      deriveAltDisplayState({
        blockData: {
          url: 'https://cdn.example.com/photo.jpg',
          alt_source: 'custom',
        },
        value: '',
      }),
    ).toMatchObject({
      target: null,
      showExternalWarning: true,
    });
  });

  it('normalizes alt changes back to image-metadata when empty or matching the metadata', () => {
    const onChange = jest.fn();

    applyAltChange({
      id: 'alt',
      nextAlt: '  Wetland bird: A bird. ',
      imageMetadata: 'Wetland bird: A bird.',
      onChange,
    });
    expect(onChange).toHaveBeenNthCalledWith(1, 'alt', '');
    expect(onChange).toHaveBeenNthCalledWith(2, 'alt_source', 'image-metadata');

    onChange.mockClear();
    applyAltChange({
      id: 'alt',
      nextAlt: 'Custom description',
      imageMetadata: 'Wetland bird: A bird.',
      onChange,
    });
    expect(onChange).toHaveBeenNthCalledWith(1, 'alt', 'Custom description');
    expect(onChange).toHaveBeenNthCalledWith(2, 'alt_source', 'custom');
  });
});

describe('imageAIReducer', () => {
  const file = {
    data: 'aW1hZ2U=',
    encoding: 'base64',
    'content-type': 'image/jpeg',
    filename: 'bird.jpg',
  };

  it('opens a fresh consent choice for every selected image', () => {
    const state = imageAIReducer(createImageAIState(), {
      type: 'select',
      file,
    });

    expect(state).toEqual({
      status: 'choice',
      pendingFile: file,
      requestId: null,
      metadata: null,
      errorCode: null,
    });
  });

  it('keeps the pending file while analysis is running', () => {
    const selected = imageAIReducer(createImageAIState(), {
      type: 'select',
      file,
    });
    const state = imageAIReducer(selected, {
      type: 'generate',
      requestId: 'request-1',
    });

    expect(state.status).toBe('analyzing');
    expect(state.pendingFile).toBe(file);
    expect(state.requestId).toBe('request-1');
  });

  it('caches valid metadata for the ordinary creation request', () => {
    const analyzing = {
      status: 'analyzing',
      pendingFile: file,
      requestId: 'request-1',
      metadata: null,
      errorCode: null,
    };
    const metadata = {
      title: 'Grey heron among reeds',
      description: 'A grey heron stands among wetland reeds.',
    };

    const state = imageAIReducer(analyzing, {
      type: 'analysisSucceeded',
      requestId: 'request-1',
      metadata,
    });

    expect(state.status).toBe('ready');
    expect(state.pendingFile).toBe(file);
    expect(state.metadata).toEqual(metadata);
  });

  it('ignores a stale analysis response after the selection changes', () => {
    const current = {
      status: 'analyzing',
      pendingFile: { ...file, filename: 'new.jpg' },
      requestId: 'request-2',
      metadata: null,
      errorCode: null,
    };

    expect(
      imageAIReducer(current, {
        type: 'analysisSucceeded',
        requestId: 'request-1',
        metadata: { title: 'Stale', description: 'Stale response.' },
      }),
    ).toBe(current);
  });

  it('preserves the pending file on failure so Retry or non-AI use is possible', () => {
    const analyzing = {
      status: 'analyzing',
      pendingFile: file,
      requestId: 'request-1',
      metadata: null,
      errorCode: null,
    };

    const state = imageAIReducer(analyzing, {
      type: 'analysisFailed',
      requestId: 'request-1',
      errorCode: 'generation_failed',
    });

    expect(state.status).toBe('failed');
    expect(state.pendingFile).toBe(file);
    expect(state.metadata).toBeNull();
    expect(state.errorCode).toBe('generation_failed');
  });

  it('returns to idle on cancel without remembering consent', () => {
    const state = imageAIReducer(
      {
        status: 'choice',
        pendingFile: file,
        requestId: null,
        metadata: null,
        errorCode: null,
      },
      { type: 'cancel' },
    );

    expect(state).toEqual(createImageAIState());
  });
});
