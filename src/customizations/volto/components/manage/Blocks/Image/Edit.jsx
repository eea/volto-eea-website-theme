/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Edit image block.
 * @module components/manage/Blocks/Image/Edit
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { readAsDataURL } from 'promise-file-reader';
import { Button, Dimmer, Input, Loader, Message } from 'semantic-ui-react';
import { defineMessages, injectIntl } from 'react-intl';
import loadable from '@loadable/component';
import cx from 'classnames';
import { isEqual } from 'lodash';

import { Icon, ImageSidebar, SidebarPortal } from '@plone/volto/components';
import { Icon as IconSemantic } from 'semantic-ui-react';
import { withBlockExtensions } from '@plone/volto/helpers';
import { createContent, getContent } from '@plone/volto/actions';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';

import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import navTreeSVG from '@plone/volto/icons/nav.svg';
import aheadSVG from '@plone/volto/icons/ahead.svg';
import uploadSVG from '@plone/volto/icons/upload.svg';
import './style.less';
import { setImageSize } from '@eeacms/volto-eea-website-theme/helpers';

const Dropzone = loadable(() => import('react-dropzone'));

const messages = defineMessages({
  ImageBlockInputPlaceholder: {
    id: 'Browse the site, drop an image, or type an URL',
    defaultMessage: 'Browse the site, drop an image, or type an URL',
  },
});

const Edit = (props) => {
  const [uploading, setUploading] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [dragging, setDragging] = React.useState(false);
  const [scaledImage, setScaledImage] = React.useState('');
  const [viewLoaded, setViewLoaded] = React.useState(false);

  React.useEffect(() => {
    if (props.request.loading && props.request.loaded && uploading) {
      setUploading(false);
      props.onChangeBlock(props.block, {
        ...props.data,
        url: props.content['@id'],
        alt: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.request.loading, props.request.loaded, uploading]);

  React.useEffect(() => {
    if (props.data.url) {
      props.getContent(flattenToAppURL(props.data.url), null, props.block);
    }
  }, [props.data.url, props.block]);

  React.useEffect(() => {
    if (props.scales) {
      const scaledImage = data?.url
        ? setImageSize(data?.url, scales, align === 'full' ? 'h' : size)
        : '';

      setScaledImage(scaledImage);
    }
  }, [props.scales, props.data.url]);

  React.useEffect(() => {
    // using this method because the image is not loaded
    // correctly on a fresh render of the page
    // volto loses the parent container of
    // the image and the image is thrown randomly in the page
    // not happening if navigating to the page from routes (not fresh render)
    setViewLoaded(true);
  }, []);

  const onUploadImage = (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    // setState({
    //   uploading: true,
    // });
    setUploading(true);

    readAsDataURL(file).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      props.createContent(
        getBaseUrl(props.pathname),
        {
          '@type': 'Image',
          title: file.name,
          image: {
            data: fields[3],
            encoding: fields[2],
            'content-type': fields[1],
            filename: file.name,
          },
        },
        props.block,
      );
    });
  };

  const onChangeUrl = ({ target }) => {
    setUrl(target.value);
  };

  const onSubmitUrl = () => {
    props.onChangeBlock(props.block, {
      ...props.data,
      url: flattenToAppURL(url),
    });
  };

  const onDrop = (file) => {
    setUploading(true);

    readAsDataURL(file[0]).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      props.createContent(
        getBaseUrl(props.pathname),
        {
          '@type': 'Image',
          title: file[0].name,
          image: {
            data: fields[3],
            encoding: fields[2],
            'content-type': fields[1],
            filename: file[0].name,
          },
        },
        props.block,
      );
    });
  };

  // /**
  //  * Keydown handler on Variant Menu Form
  //  * This is required since the ENTER key is already mapped to a onKeyDown
  //  * event and needs to be overriden with a child onKeyDown.
  //  * @method onKeyDownVariantMenuForm
  //  * @param {Object} e Event object
  //  * @returns {undefined}
  //  */
  const onKeyDownVariantMenuForm = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onSubmitUrl();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      //   TODO: Do something on ESC key
    }
  };
  const onDragEnter = () => {
    setDragging(true);
  };
  const onDragLeave = () => {
    setDragging(false);
  };

  const { data = {}, scales = {} } = props;

  const {
    size = 'l',
    align = 'center',
    copyright,
    copyrightIcon,
    copyrightPosition,
    alt,
  } = data;

  const placeholder =
    props.data.placeholder ||
    props.intl.formatMessage(messages.ImageBlockInputPlaceholder);

  return (
    <>
      {viewLoaded && (
        <div
          className={cx(
            'block image align',
            {
              center: !Boolean(align),
            },
            align,
          )}
        >
          {scaledImage ? (
            <div className="image-block">
              <img
                style={{
                  height: 'auto',
                  width: align === 'center' ? '100%' : scaledImage?.width,
                }}
                className={cx({
                  'full-width': align === 'full',
                  large: size === 'l',
                  medium: size === 'm',
                  small: size === 's',
                })}
                src={scaledImage?.download}
                alt={alt || ''}
                loading="lazy"
              />
              <div className="copyright-image">
                {copyright ? (
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
            </div>
          ) : (
            <div>
              {props.editable && (
                <Dropzone
                  noClick
                  onDrop={onDrop}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  className="dropzone"
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                      <Message>
                        {dragging && <Dimmer active></Dimmer>}
                        {uploading && (
                          <Dimmer active>
                            <Loader indeterminate>Uploading image</Loader>
                          </Dimmer>
                        )}
                        <div className="no-image-wrapper">
                          <img src={imageBlockSVG} alt="" />
                          <div className="toolbar-inner">
                            <Button.Group>
                              <Button
                                basic
                                icon
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  props.openObjectBrowser();
                                }}
                              >
                                <Icon name={navTreeSVG} size="24px" />
                              </Button>
                            </Button.Group>
                            <Button.Group>
                              <label className="ui button basic icon">
                                <Icon name={uploadSVG} size="24px" />
                                <input
                                  {...getInputProps({
                                    type: 'file',
                                    onChange: onUploadImage,
                                    style: { display: 'none' },
                                  })}
                                />
                              </label>
                            </Button.Group>
                            <Input
                              onKeyDown={onKeyDownVariantMenuForm}
                              onChange={onChangeUrl}
                              placeholder={placeholder}
                              value={url}
                              onClick={(e) => {
                                e.target.focus();
                              }}
                              onFocus={(e) => {
                                props.onSelectBlock(props.id);
                              }}
                            />
                            {url && (
                              <Button.Group>
                                <Button
                                  basic
                                  className="cancel"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUrl('');
                                  }}
                                >
                                  <Icon name={clearSVG} size="30px" />
                                </Button>
                              </Button.Group>
                            )}
                            <Button.Group>
                              <Button
                                basic
                                primary
                                disabled={!url}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSubmitUrl();
                                }}
                              >
                                <Icon name={aheadSVG} size="30px" />
                              </Button>
                            </Button.Group>
                          </div>
                        </div>
                      </Message>
                    </div>
                  )}
                </Dropzone>
              )}
            </div>
          )}
          <SidebarPortal selected={props.selected}>
            <ImageSidebar {...props} />
          </SidebarPortal>
        </div>
      )}
    </>
  );
};

export default compose(
  injectIntl,
  withBlockExtensions,
  connect(
    (state, ownProps) => ({
      request: state.content.subrequests[ownProps.block] || {},
      scales: state.content.subrequests[ownProps.block]?.data?.image?.scales,
    }),
    { createContent, getContent },
  ),
)(Edit);
