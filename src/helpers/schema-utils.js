import imageNarrowSVG from '@eeacms/volto-eea-website-theme/icons/image-narrow.svg';
import imageFitSVG from '@plone/volto/icons/image-fit.svg';
import imageWideSVG from '@plone/volto/icons/image-wide.svg';
import imageFullSVG from '@plone/volto/icons/image-full.svg';
import alignTopSVG from '@plone/volto/icons/move-up.svg';
import alignCenterSVG from '@plone/volto/icons/row.svg';
import alignBottomSVG from '@plone/volto/icons/move-down.svg';
import { addStyling } from '@plone/volto/helpers';

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

export const addStylingFieldsetSchemaEnhancer = (props) => {
  const schema = addStyling(props);
  schema.properties.styles.schema.properties.size = {
    widget: 'style_align',
    title: 'Section size',
    actions: Object.keys(ALIGN_INFO_MAP),
    actionsInfoMap: ALIGN_INFO_MAP,
  };

  schema.properties.styles.schema.fieldsets[0].fields = [
    ...schema.properties.styles.schema.fieldsets[0].fields,
    'size',
  ];

  return schema;
};

export const addStylingFieldsetSchemaEnhancerImagePosition = (props) => {
  const schema = addStyling(props);

  schema.properties.styles.schema.properties.bg = {
    title: 'Image position',
    widget: 'align',
    actions: Object.keys(ALIGN_INFO_MAP_IMAGE_POSITION),
    actionsInfoMap: ALIGN_INFO_MAP_IMAGE_POSITION,
    defaultValue: 'has--bg--center',
  };

  schema.properties.styles.schema.fieldsets[0].fields = [
    ...schema.properties.styles.schema.fieldsets[0].fields,
    'bg',
  ];

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
