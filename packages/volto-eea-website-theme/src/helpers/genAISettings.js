import Api from '@plone/volto/helpers/Api/Api';

export const LENGTH_FIELD_IDS = [
  'image_title_alt_max_length',
  'image_description_max_length',
];

export const FALLBACK_LENGTH_PROPERTIES = {
  image_title_alt_max_length: {
    id: 'image_title_alt_max_length',
    title: 'Maximum Image title/alt length',
    type: 'number',
    minimum: 1,
  },
  image_description_max_length: {
    id: 'image_description_max_length',
    title: 'Maximum Image description length',
    type: 'number',
    minimum: 1,
  },
};

// Missing or failed SSR settings never enable AI. Ordinary editing remains
// available; do not fetch configuration independently from individual widgets.
export const isImageAIEnabled = (state) => {
  const asyncState = state.reduxAsyncConnect;
  const settings = asyncState?.genAISettings;
  return Boolean(
    !asyncState?.loadState?.genAISettings?.error &&
      settings?.enabled === true &&
      settings?.features?.image?.enabled === true,
  );
};

// Content-type policy is separate from the global switch: callers must supply
// the target type, which is not necessarily the page containing an image block.
export const isImageAIAllowed = (state, contentType) => {
  if (
    !isImageAIEnabled(state) ||
    typeof contentType !== 'string' ||
    !contentType
  )
    return false;
  const allowed =
    state.reduxAsyncConnect.genAISettings.features.image.allowed_content_types;
  // Only an explicitly supplied empty list means unrestricted.
  return (
    Array.isArray(allowed) &&
    (allowed.length === 0 || allowed.includes(contentType))
  );
};

export const buildLengthSettingsSchema = (rawSchema = {}) => {
  const sourceProperties =
    rawSchema?.properties || rawSchema?.definitions || {};
  const properties = LENGTH_FIELD_IDS.reduce((acc, fieldId) => {
    acc[fieldId] = {
      ...FALLBACK_LENGTH_PROPERTIES[fieldId],
      ...(sourceProperties[fieldId] || {}),
    };
    return acc;
  }, {});
  const defaultFieldset = rawSchema?.fieldsets?.find(
    (fieldset) => fieldset.id === 'default',
  );
  const filteredFields = Array.isArray(defaultFieldset?.fields)
    ? defaultFieldset.fields.filter((fieldId) =>
        LENGTH_FIELD_IDS.includes(fieldId),
      )
    : [];
  const fields = filteredFields.length ? filteredFields : LENGTH_FIELD_IDS;
  const required = Array.isArray(rawSchema?.required)
    ? rawSchema.required.filter((fieldId) => LENGTH_FIELD_IDS.includes(fieldId))
    : [];
  return {
    ...rawSchema,
    fieldsets: [
      {
        id: 'default',
        title: defaultFieldset?.title || 'Default',
        fields,
      },
    ],
    properties,
    definitions: properties,
    required,
  };
};

export const parseValidLength = (rawValue, minimum = 1) => {
  if (rawValue === undefined || rawValue === null) return null;
  const text = String(rawValue).trim();
  if (!text) return null;
  const num = Number(text);
  if (!Number.isInteger(num) || num < minimum) return null;
  return num;
};

export const requestGenAIControlpanel = (api = undefined) => {
  const client = api === undefined ? new Api() : api;
  return client.get('@controlpanels/genai');
};

export const updateGenAILengthSettings = (data, api = undefined) => {
  const client = api === undefined ? new Api() : api;
  return client.patch('@controlpanels/genai', {
    data: {
      image_title_alt_max_length: data.image_title_alt_max_length,
      image_description_max_length: data.image_description_max_length,
    },
  });
};
