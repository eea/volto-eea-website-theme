import Api from '@plone/volto/helpers/Api/Api';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { toApiPath } from './toApiPath';

export const IMAGE_AI_ERROR_CODES = [
  'invalid_request',
  'unsupported_media_type',
  'image_too_large',
  'invalid_image',
  'image_not_addable',
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

export function isSupportedImage(image) {
  return SUPPORTED_MEDIA_TYPES.has(image?.['content-type']);
}

export function buildImageMetadataPayload(image, language) {
  return { image, language: language || 'en' };
}

export function readImageAIErrorCode(error) {
  const code =
    error?.response?.body?.error?.code ||
    error?.response?.body?.code ||
    error?.body?.error?.code;
  return IMAGE_AI_ERROR_CODES.includes(code) ? code : 'generation_failed';
}

export function requestImageMetadata(
  containerUrl,
  image,
  language,
  api = new Api(),
) {
  const path = toApiPath(containerUrl) || flattenToAppURL(containerUrl);
  return api.post(`${path.replace(/\/$/, '')}/@image-metadata`, {
    data: buildImageMetadataPayload(image, language),
  });
}

export function abortImageAIRequest(request) {
  request?.request?.abort?.();
}

export async function requestImageAlt(imageUrl, language, api = new Api()) {
  const path = toApiPath(imageUrl);
  if (!path) throw new Error('Image is not an internal content item');
  return api.post(`${path.replace(/\/$/, '')}/@image-alt`, {
    data: { language: language || 'en' },
  });
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

export function effectiveImageAlt(data = {}) {
  if (data.decorative) return '';
  const customAlt =
    typeof data.alt === 'string' && data.alt.trim() ? data.alt : '';
  if (data.alt_source === 'custom' && customAlt) return customAlt;
  if (data.alt_source === 'image-title' || data.alt_source === 'custom') {
    return data.image_title || '';
  }
  return customAlt || data.image_title || '';
}

export function sameImageReference(left, right) {
  if (!left || !right) return false;
  return flattenToAppURL(left) === flattenToAppURL(right);
}
