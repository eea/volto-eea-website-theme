/**
 * Edit image block.
 * @module components/manage/Blocks/Image/Edit
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { Message } from 'semantic-ui-react';
import { isEqual } from 'lodash';

import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import { Icon } from 'semantic-ui-react';
import { LeadImageSidebar, SidebarPortal } from '@plone/volto/components';
import config from '@plone/volto/registry';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';

const messages = defineMessages({
  ImageBlockInputPlaceholder: {
    id: "Upload a lead image in the 'Lead Image' content field.",
    defaultMessage: "Upload a lead image in the 'Lead Image' content field.",
  },
});

/**
 * Edit image block class.
 * @class Edit
 * @extends Component
 */
class Edit extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    properties: PropTypes.objectOf(PropTypes.any).isRequired,
    selected: PropTypes.bool.isRequired,
    block: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    data: PropTypes.objectOf(PropTypes.any).isRequired,
    pathname: PropTypes.string.isRequired,
    onChangeBlock: PropTypes.func.isRequired,
    openObjectBrowser: PropTypes.func.isRequired,
  };

  /**
   * Align block handler
   * @method onAlignBlock
   * @param {string} align Alignment option
   * @returns {undefined}
   */
  onAlignBlock(align) {
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      align,
    });
  }

  /**
   * @param {*} nextProps
   * @returns {boolean}
   * @memberof Edit
   */
  shouldComponentUpdate(nextProps) {
    return (
      this.props.selected ||
      nextProps.selected ||
      !isEqual(this.props.data, nextProps.data)
    );
  }

  node = React.createRef();

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const Image = config.getComponent({ name: 'Image' }).component;
    const { data, properties } = this.props;
    const { copyright, copyrightIcon, copyrightPosition } = data;
    const placeholder =
      this.props.data.placeholder ||
      this.props.intl.formatMessage(messages.ImageBlockInputPlaceholder);

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
        <div
          className={cx(
            `image-block-container ${data?.align ? data?.align : ''}`,
          )}
        >
          {!hasImage && (
            <Message>
              <center>
                <img src={imageBlockSVG} alt="" />
                <div className="message-text">{placeholder}</div>
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
        <SidebarPortal selected={this.props.selected}>
          <LeadImageSidebar {...this.props} />
        </SidebarPortal>
      </div>
    );
  }
}

export default compose(injectIntl)(Edit);
