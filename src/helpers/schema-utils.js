import { cloneDeep } from 'lodash';
import imageNarrowSVG from '@eeacms/volto-eea-website-theme/icons/image-narrow.svg';
import imageFitSVG from '@plone/volto/icons/image-fit.svg';
import imageWideSVG from '@plone/volto/icons/image-wide.svg';
import imageFullSVG from '@plone/volto/icons/image-full.svg';
import alignTopSVG from '@plone/volto/icons/move-up.svg';
import alignCenterSVG from '@plone/volto/icons/row.svg';
import alignBottomSVG from '@plone/volto/icons/move-down.svg';

export const ALIGN_INFO_MAP = {
  narrow_width: [imageNarrowSVG, 'Narrow width'],
  container_width: [imageFitSVG, 'Container width'],
  wide_width: [imageWideSVG, 'Wide width'],
  full: [imageFullSVG, 'Full width'],
};
const ALIGN_INFO_MAP_IMAGE_POSITION = {
  'has--bg--top': [alignTopSVG, 'Top'],
  'has--bg--center': [alignCenterSVG, 'Center'],
  'has--bg--bottom': [alignBottomSVG, 'Bottom'],
};

export const addStylingFieldsetSchemaEnhancer = ({ schema }) => {
  const applied = schema?.properties?.styles;

  if (!applied) {
    const resSchema = cloneDeep(schema);

    resSchema.fieldsets.push({
      id: 'styling',
      fields: ['styles'],
      title: 'Styling',
    });
    resSchema.properties.styles = {
      widget: 'object',
      title: 'Styling',
      schema: {
        fieldsets: [
          {
            id: 'default',
            title: 'Default',
            fields: ['size'],
          },
        ],
        properties: {
          size: {
            widget: 'style_align',
            title: 'Section size',
            actions: Object.keys(ALIGN_INFO_MAP),
            actionsInfoMap: ALIGN_INFO_MAP,
          },
        },
        required: [],
      },
    };
    return resSchema;
  }

  return schema;
};

export const addStylingFieldsetSchemaEnhancerImagePosition = ({ schema }) => {
  const applied = schema?.properties?.styles;
  console.log({ schema });
  if (!applied) {
    const resSchema = cloneDeep(schema);

    resSchema.fieldsets.push({
      id: 'styling',
      fields: ['styles'],
      title: 'Styling',
    });
    resSchema.properties.styles = {
      widget: 'object',
      title: 'Styling',
      schema: {
        fieldsets: [
          {
            id: 'default',
            title: 'Default',
            fields: ['bg'],
          },
        ],
        properties: {
          bg: {
            title: 'Background image position',
            widget: 'align',
            actions: Object.keys(ALIGN_INFO_MAP_IMAGE_POSITION),
            actionsInfoMap: ALIGN_INFO_MAP_IMAGE_POSITION,
            defaultValue: 'has--bg--center',
          },
        },
        required: [],
      },
    };
    return resSchema;
  }

  return schema;
};

export const getVoltoStyles = (props) => {
  // return an object with same key and value for cx class setting
  const styles = props ? props : {};
  const output = {};
  for (const [key, value] of Object.entries(styles)) {
    if (key === '@type') {
      continue;
    }
    if (styles[key] === true) {
      output[key] = key;
    } else {
      output[value] = value;
    }
  }
  return output;
};
