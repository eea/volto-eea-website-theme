/**
 * Edit image block.
 * @module components/manage/Blocks/Image/Edit
 */

import React from 'react';
import cx from 'classnames';
import ImageSidebar from '@plone/volto/components/manage/Blocks/Image/ImageSidebar';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import { Icon as IconSemantic } from 'semantic-ui-react';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';

import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';
import { withBlockExtensions } from '@plone/volto/helpers/Extensions';
import config from '@plone/volto/registry';

import { ImageInput } from '@plone/volto/components/manage/Widgets/ImageWidget';

// EEA customization
export const getImageBlockSizes = function (data) {
  if (data.align === 'full') return '100vw';
  if (data.align === 'center') {
    if (data.size === 'l') return '100vw';
    if (data.size === 'm') return '50vw';
    if (data.size === 's') return '25vw';
  }
  if (data.align === 'left' || data.align === 'right') {
    if (data.size === 'l') return '50vw';
    if (data.size === 'm') return '25vw';
    if (data.size === 's') return '15vw';
  }
  return undefined;
};

function Edit(props) {
  const { data } = props;
  const Image = config.getComponent({ name: 'Image' }).component;
  const { copyright, copyrightIcon, copyrightPosition } = data;
  const showCopyright = data?.size === 'l' || !data.size;

  const handleChange = React.useCallback(
    async (id, image, { title, image_field, image_scales } = {}) => {
      const url = Array.isArray(image)
        ? image?.[0]?.['@id']
        : image
        ? image['@id'] || image
        : '';

      props.onChangeBlock(props.block, {
        ...props.data,
        url: flattenToAppURL(url),
        image_field,
        image_scales,
        alt: props.data.alt || title || '',
      });
    },
    [props],
  );

  return (
    <>
      <div
        className={cx(
          'block image align',
          {
            center: !Boolean(data.align),
          },
          data.align,
        )}
      >
        {/* EEA customization: image-block-container wrapper with size classes */}
        <div
          className={cx(
            'image-block-container',
            {
              large: data.size === 'l',
              medium: data.size === 'm',
              small: data.size === 's',
            },
            data?.align ? data?.align : '',
          )}
        >
          {data.url ? (
            <>
              <Image
                className={cx(
                  {
                    'full-width': data.align === 'full',
                    large: data.size === 'l',
                    medium: data.size === 'm',
                    small: data.size === 's',
                  },
                  data?.styles?.objectPosition,
                )}
                item={
                  data.image_scales
                    ? {
                        '@id': data.url,
                        image_field: data.image_field,
                        image_scales: data.image_scales,
                        data: data,
                      }
                    : undefined
                }
                src={
                  data.image_scales
                    ? undefined
                    : isInternalURL(data.url)
                    ? // Backwards compat in the case that the block is storing the full server URL
                      (() => {
                        if (data.size === 'l')
                          return `${flattenToAppURL(
                            data.url,
                          )}/@@images/image/large`;
                        if (data.size === 'm')
                          return `${flattenToAppURL(
                            data.url,
                          )}/@@images/image/preview`;
                        if (data.size === 's')
                          return `${flattenToAppURL(
                            data.url,
                          )}/@@images/image/mini`;
                        return `${flattenToAppURL(
                          data.url,
                        )}/@@images/image/large`;
                      })()
                    : data.url
                }
                sizes={config.blocks.blocksConfig.image.getSizes(data)}
                alt={data.alt || ''}
                loading="lazy"
                responsive={true}
              />
              {/* EEA customization: copyright overlay */}
              <div className={`copyright-wrapper ${copyrightPosition}`}>
                {copyright && showCopyright ? (
                  <Copyright copyrightPosition={copyrightPosition}>
                    <Copyright.Icon>
                      <IconSemantic name={copyrightIcon} />
                    </Copyright.Icon>
                    <Copyright.Text>{copyright}</Copyright.Text>
                  </Copyright>
                ) : (
                  ''
                )}
              </div>
            </>
          ) : (
            <ImageInput
              onChange={handleChange}
              placeholderLinkInput={data.placeholder}
              block={props.block}
              id={props.block}
              objectBrowserPickerType={'image'}
            />
          )}
        </div>
        <SidebarPortal selected={props.selected}>
          <ImageSidebar {...props} />
        </SidebarPortal>
      </div>
    </>
  );
}

export default withBlockExtensions(Edit);
