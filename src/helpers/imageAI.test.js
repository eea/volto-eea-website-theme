import {
  altMatchesImageTitle,
  buildImageMetadataPayload,
  createImageAIState,
  imageAIReducer,
  readImageAIErrorCode,
  sameImageReference,
} from './imageAI';

describe('buildImageMetadataPayload', () => {
  it('sends the unpersisted image and page language without extra context', () => {
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
    });
  });
});

describe('readImageAIErrorCode', () => {
  it.each([
    'invalid_request',
    'unsupported_media_type',
    'image_too_large',
    'invalid_image',
    'image_not_addable',
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
