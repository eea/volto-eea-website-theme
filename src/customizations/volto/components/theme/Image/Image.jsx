import PropTypes from 'prop-types';
import cx from 'classnames';
import { flattenToAppURL, flattenScales } from '@plone/volto/helpers';

/**
 * Determines the image scale name based on the provided data.
 *
 * @param {object} data - The data object containing the image size information.
 * @param {string} [data.size] - The size of the image, can be 'l', 'm', or 's'.
 * @returns {string} The name of the image scale, either 'large', 'preview', or 'mini'.
 */
const imageScaleName = (data) => {
  if (!data) return 'large';
  if (data.align === 'full') return 'huge';
  if (data.size === 'l') return 'large';
  if (data.size === 'm') return 'preview';
  if (data.size === 's') return 'mini';
  return 'large';
};

const getImageBlockSizes = (data) => {
  if (data.align === 'full')
    return [
      ['preview', '(max-width: 599px)'],
      ['teaser', '(min-width: 600px) and (max-width: 799px)'],
      ['large', '(min-width: 800px) and (max-width: 999px)'],
      ['larger', '(min-width: 1000px) and (max-width: 1199px)'],
      ['great', '(min-width: 1200px) and (max-width: 1599px)'],
      ['huge', '(min-width: 1600px)'],
    ];
  if (data.align === 'center') {
    if (data.size === 'l')
      return [
        ['preview', '(max-width: 599px)'],
        ['large', '(min-width: 600px)'],
      ];
    if (data.size === 'm') return ['preview', '(min-width: 320px)'];
    if (data.size === 's') return ['mini', '(min-width: 320px)'];
  }
  if (data.align === 'left' || data.align === 'right') {
    if (data.size === 'l') return ['preview', '(min-width: 320px)'];
    if (data.size === 'm') return ['mini', '(min-width: 320px)'];
    if (data.size === 's') return ['mini', '(min-width: 320px)'];
  }
  return [];
};

/**
 * Image component
 * @param {object} item - Context item that has the image field (can also be a catalog brain or summary)
 * @param {string} imageField - Key of the image field inside the item, or inside the image_scales object of the item if it is a catalog brain or summary
 * @param {string} src - URL of the image to be used if the item field is not available
 * @param {string} alt - Alternative text for the image
 * @param {boolean} loading - (default: eager) set to `lazy` to lazy load the image
 * @param {boolean} responsive - (default: false) set to `true` to add the `responsive` class to the image
 * @param {string} className - Additional classes to add to the image
 */
export default function Image({
  item,
  imageField,
  src,
  alt = '',
  loading = 'eager',
  responsive = false,
  className = '',
  ...imageProps
}) {
  if (!item && !src) return null;

  //  TypeScript hints for editor autocomplete :)
  /** @type {React.ImgHTMLAttributes<HTMLImageElement>} */
  const attrs = {};

  if (!item && src) {
    attrs.src = src;
    attrs.className = cx(className, { responsive });
  } else {
    const isFromRealObject = !item.image_scales;
    const imageFieldWithDefault = imageField || item.image_field || 'image';

    const image = isFromRealObject
      ? flattenScales(item['@id'], item[imageFieldWithDefault])
      : flattenScales(
          item['@id'],
          item.image_scales[imageFieldWithDefault]?.[0],
        );

    if (!image) return null;

    const isSvg = image['content-type'] === 'image/svg+xml';
    // In case `base_path` is present (`preview_image_link`) use it as base path
    const basePath = image.base_path || item['@id'];
    const relativeBasePath = flattenToAppURL(basePath);

    attrs.src = `${relativeBasePath}/${image.download}`;
    attrs.width = image.width;
    attrs.height = image.height;
    attrs.className = cx(className, { responsive });

    if (!isSvg && image.scales && Object.keys(image.scales).length > 0) {
      return PictureImage(item, image, attrs, relativeBasePath, alt);
    }
  }

  if (loading === 'lazy') {
    attrs.loading = 'lazy';
    attrs.decoding = 'async';
  } else {
    attrs.fetchpriority = 'high';
  }

  return <img {...attrs} alt={alt} {...imageProps} />;
}

Image.propTypes = {
  item: PropTypes.shape({
    '@id': PropTypes.string,
    image_field: PropTypes.string,
    image_scales: PropTypes.object,
    image: PropTypes.object,
  }),
  imageField: PropTypes.string,
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  loading: PropTypes.string,
  responsive: PropTypes.bool,
  className: PropTypes.string,
};
function PictureImage(item, image, attrs, relativeBasePath, alt) {
  const filteredScales = getImageBlockSizes(item.data);

  const selectedScale = imageScaleName(item.data);
  const imageScale = image.scales[selectedScale];
  if (imageScale) {
    // set default image size, width and height to the selected scale
    attrs.width = imageScale.width;
    attrs.height = imageScale.height;
    attrs.src = `${relativeBasePath}/${imageScale.download}`;
  }

  return (
    <picture>
      {filteredScales.map((scaleArray, index) => {
        const scale = image.scales[scaleArray[0]];
        const mediaQuery = scaleArray[1];

        return (
          <source
            key={index}
            media={mediaQuery}
            srcSet={`${relativeBasePath}/${scale.download}`}
          />
        );
      })}
      <img {...attrs} alt={alt} />
    </picture>
  );
}
