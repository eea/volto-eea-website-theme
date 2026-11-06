import imageNarrowSVG from '@eeacms/volto-eea-website-theme/icons/image-narrow.svg';
import imageFitSVG from '@plone/volto/icons/image-fit.svg';
import imageWideSVG from '@plone/volto/icons/image-wide.svg';

export const ALIGN_INFO_MAP = {
  narrow_view: [imageNarrowSVG, 'Narrow width'],
  container_view: [imageFitSVG, 'Container width'],
  wide_view: [imageWideSVG, 'Wide width'],
};

export const EditSchema = () => {
  return {
    title: 'Page layout settings',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['layout_size', 'body_class'],
      },
    ],
    required: [],
    properties: {
      layout_size: {
        widget: 'style_align',
        title: 'Layout size',
        actions: Object.keys(ALIGN_INFO_MAP),
        actionsInfoMap: ALIGN_INFO_MAP,
      },
      body_class: {
        title: 'Body class',
        choices: [
          ['homepage', 'Homepage'],
          ['homepage-inverse', 'Homepage inverse'],
        ],
        widget: 'creatable_select',
      },
    },
  };
};
