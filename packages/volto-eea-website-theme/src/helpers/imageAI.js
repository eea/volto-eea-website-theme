import Api from '@plone/volto/helpers/Api/Api';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

export const IMAGE_AI_ERROR_CODES = [
  'invalid_request',
  'unsupported_media_type',
  'image_too_large',
  'invalid_image',
  'image_not_addable',
  'image_ai_not_allowed',
  'image_not_editable',
  'metadata_changed',
  'generation_failed',
];

const SUPPORTED_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
]);

export function createImageAIState() {
  return {
    status: 'idle',
    pendingFile: null,
    requestId: null,
    metadata: null,
    errorCode: null,
  };
}

export function imageAIReducer(state, event) {
  switch (event.type) {
    case 'select':
      return {
        status: 'choice',
        pendingFile: event.file,
        requestId: null,
        metadata: null,
        errorCode: null,
      };
    case 'generate':
      return {
        ...state,
        status: 'analyzing',
        requestId: event.requestId,
        errorCode: null,
      };
    case 'analysisSucceeded':
      if (state.requestId !== event.requestId) return state;
      return {
        ...state,
        status: 'ready',
        metadata: event.metadata,
        errorCode: null,
      };
    case 'analysisFailed':
      if (state.requestId !== event.requestId) return state;
      return {
        ...state,
        status: 'failed',
        metadata: null,
        errorCode: event.errorCode || 'generation_failed',
      };
    case 'creating':
      return { ...state, status: 'creating', errorCode: null };
    case 'creationFailed':
      return {
        ...state,
        status: 'creationFailed',
        errorCode: event.errorCode || 'generation_failed',
      };
    case 'cancel':
    case 'reset':
      return createImageAIState();
    default:
      return state;
  }
}

export function isImageUpload(image) {
  return image?.encoding === 'base64' && typeof image.data === 'string';
}

export function isSupportedImage(image) {
  return SUPPORTED_MEDIA_TYPES.has(image?.['content-type']);
}

export function buildImageMetadataPayload(
  image,
  language,
  portalType = 'Image',
) {
  return { image, language: language || 'en', portal_type: portalType };
}

export function readImageAIErrorCode(error) {
  const code =
    error?.response?.body?.error?.code ||
    error?.response?.body?.code ||
    error?.body?.error?.code;
  if (IMAGE_AI_ERROR_CODES.includes(code)) {
    return code;
  }
  const status = error?.status ?? error?.response?.status;
  const errorType =
    error?.response?.body?.error?.type ||
    error?.response?.body?.type ||
    error?.body?.error?.type ||
    error?.body?.type;
  if (status === 401 || status === 403 || errorType === 'Unauthorized') {
    return 'image_not_editable';
  }
  return 'generation_failed';
}

export function requestImageMetadata(
  containerUrl,
  image,
  language,
  portalType = 'Image',
  api = new Api(),
) {
  return api.post(`${containerUrl.replace(/\/$/, '')}/@image-metadata`, {
    data: buildImageMetadataPayload(image, language, portalType),
  });
}

export function requestImageMetadataRegeneration(
  contentUrl,
  field,
  language,
  image,
  api = new Api(),
) {
  return api.post(
    `${contentUrl.replace(/\/$/, '')}/@image-metadata-regenerate`,
    {
      data: {
        field,
        language: language || 'en',
        ...(isImageUpload(image) ? { image } : {}),
      },
    },
  );
}

export function abortImageAIRequest(request) {
  request?.request?.abort?.();
}

export function isInternalImageURL(url) {
  const path = typeof url === 'string' ? flattenToAppURL(url) : '';
  return path.startsWith('/') && !path.startsWith('//');
}

export function requestImageAlt(imageUrl, language, api = undefined) {
  try {
    const client = api === undefined ? new Api() : api;
    if (!isInternalImageURL(imageUrl)) {
      throw new Error('Image is not an internal content item');
    }
    const path = flattenToAppURL(imageUrl);
    return client.post(`${path.replace(/\/$/, '')}/@image-alt`, {
      data: { language: language || 'en' },
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export function normalizeAltText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function altMatchesImageTitle(alt, title) {
  const normalizedAlt = normalizeAltText(alt);
  const normalizedTitle = normalizeAltText(title);
  return Boolean(
    normalizedAlt && normalizedTitle && normalizedAlt === normalizedTitle,
  );
}

export function composeImageMetadata(title, description) {
  const t = typeof title === 'string' ? title.trim() : '';
  const d = typeof description === 'string' ? description.trim() : '';
  if (t && d) return `${t}: ${d}`;
  return t || d || '';
}

export function getImageMetadata(data = {}) {
  return (
    data.image_metadata ||
    composeImageMetadata(data.image_title, data.image_description)
  );
}

export function effectiveImageAlt(data = {}) {
  if (data.decorative) return '';
  const customAlt =
    typeof data.alt === 'string' && data.alt.trim() ? data.alt : '';
  if (data.alt_source === 'custom' && customAlt) return customAlt;
  const metadata = getImageMetadata(data);
  if (data.alt_source === 'image-metadata' || data.alt_source === 'custom') {
    return metadata;
  }
  return customAlt || metadata;
}

export function deriveAltDisplayState({ blockData = {}, value } = {}) {
  const blockUrl = blockData.url;
  const imageMetadata = getImageMetadata(blockData);
  const normalizedValue = typeof value === 'string' ? value : '';
  const hasCustomText = normalizedValue.trim() !== '';
  const altSource =
    blockData.alt_source || (hasCustomText ? 'custom' : 'image-metadata');
  const target = isInternalImageURL(blockUrl)
    ? flattenToAppURL(blockUrl)
    : null;
  const customHasValue = altSource === 'custom' && hasCustomText;
  const effectiveSource =
    altSource === 'custom' && !customHasValue && imageMetadata
      ? 'image-metadata'
      : altSource;
  const displayedValue =
    effectiveSource === 'image-metadata' ? imageMetadata : normalizedValue;
  const showUseMetadata = Boolean(
    target && imageMetadata && effectiveSource === 'custom',
  );
  const showExternalWarning = Boolean(blockUrl && !target && !hasCustomText);

  return {
    blockUrl,
    target,
    imageMetadata,
    normalizedValue,
    altSource,
    customHasValue,
    effectiveSource,
    displayedValue,
    showUseMetadata,
    showExternalWarning,
  };
}

export function applyAltChange({ id, nextAlt, imageMetadata, onChange }) {
  if (!nextAlt || nextAlt.trim() === '') {
    onChange(id, '');
    onChange('alt_source', imageMetadata ? 'image-metadata' : 'custom');
    return;
  }
  if (imageMetadata && altMatchesImageTitle(nextAlt, imageMetadata)) {
    onChange(id, '');
    onChange('alt_source', 'image-metadata');
    return;
  }
  onChange(id, nextAlt);
  onChange('alt_source', 'custom');
}

export function sameImageReference(left, right) {
  if (!left || !right) return false;
  return flattenToAppURL(left) === flattenToAppURL(right);
}
