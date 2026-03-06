/**
 * Edit image block.
 * @module components/manage/Blocks/Image/Edit
 */

import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import { Message } from 'semantic-ui-react';

import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import { Icon } from 'semantic-ui-react';
import LeadImageSidebar from '@plone/volto/components/manage/Blocks/LeadImage/LeadImageSidebar';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import config from '@plone/volto/registry';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';

const messages = defineMessages({
  ImageBlockInputPlaceholder: {
    id: "Upload a lead image in the 'Lead Image' content field.",
    defaultMessage: "Upload a lead image in the 'Lead Image' content field.",
  },
});

const Edit = (props) => {
  const intl = useIntl();
  const { data, properties, selected } = props;
  const { copyright, copyrightIcon, copyrightPosition } = data;

  const placeholder = () =>
    data.placeholder || intl.formatMessage(messages.ImageBlockInputPlaceholder);

  const Image = config.getComponent({ name: 'Image' }).component;
  const hasImage = !!properties.image;
  const hasImageData = hasImage && !!properties.image.data;
  const className = cx('responsive', { 'full-image': data.align === 'full' });
  const altText = data.image_caption || properties.image_caption || '';

  return (
    <div
      className={cx(
        'block image align',
        {
          center: !Boolean(data.align),
        },
        data.align,
      )}
    >
      {/* CUSTOMIZATION: image-block-container wrapper */}
      <div
        className={cx(
          `image-block-container ${data?.align ? data?.align : ''}`,
        )}
      >
        {!hasImage && (
          <Message>
            <center>
              <img src={imageBlockSVG} alt="" />
              <div className="message-text">{placeholder()}</div>
            </center>
          </Message>
        )}
        {hasImage && hasImageData && (
          <div className="image-block">
            <img
              className={(className, data?.styles?.objectPosition)}
              src={`data:${properties.image['content-type']};base64,${properties.image.data}`}
              width={properties.image.width}
              height={properties.image.height}
              alt={altText}
              style={{
                aspectRatio: `${properties.image.width}/${properties.image.height}`,
              }}
            />
            {/* CUSTOMIZATION: copyright overlay */}
            <div className="copyright-wrapper">
              {copyright ? (
                <Copyright copyrightPosition={copyrightPosition}>
                  <Copyright.Icon>
                    <Icon className={copyrightIcon} />
                  </Copyright.Icon>
                  <Copyright.Text>{copyright}</Copyright.Text>
                </Copyright>
              ) : (
                ''
              )}
            </div>
          </div>
        )}
        {hasImage && !hasImageData && (
          <Image
            className={className}
            item={properties}
            imageField="image"
            sizes={(() => {
              if (data.align === 'full' || data.align === 'center')
                return '100vw';
              if (data.align === 'left' || data.align === 'right')
                return '50vw';
              return undefined;
            })()}
            alt={altText}
          />
        )}
      </div>
      <SidebarPortal selected={selected}>
        <LeadImageSidebar {...props} />
      </SidebarPortal>
    </div>
  );
};

export default Edit;
Edit.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
  selected: PropTypes.bool.isRequired,
  block: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  pathname: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  openObjectBrowser: PropTypes.func.isRequired,
};
